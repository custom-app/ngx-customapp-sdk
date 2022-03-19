import {WebSocketController} from 'customapp-rxjs-websocket';
import {CommonWebSocketConfig} from '../models/common-web-socket-config';
import {IndividualWebSocketConfig} from '../models/individual-web-socket-config';
import {map, mergeMap, Observable, take, takeUntil, zipWith} from 'rxjs';
import {JwtGroup, JwtInfo} from 'jwt';

export interface SocketResponses<ResponseType> {
  auth: ResponseType | undefined,
  sub: ResponseType[] | undefined
}

export function createSocket<RequestType,
  ResponseType,
  UnderlyingDataType extends string | ArrayBufferLike | Blob | ArrayBufferView,
  UserInfo>(
  commonConfig: CommonWebSocketConfig<RequestType, ResponseType, UnderlyingDataType>,
  individualConfig: IndividualWebSocketConfig<RequestType, ResponseType, UserInfo>,
  jwtAndUserInfo$: Observable<[JwtGroup<JwtInfo> | undefined, UserInfo | undefined]>
): {
  socket: WebSocketController<RequestType, ResponseType, UnderlyingDataType>,
  responses$: Observable<SocketResponses<ResponseType>>
} {
  const socket = new WebSocketController<RequestType, ResponseType, UnderlyingDataType>({
    ...commonConfig,
    url: individualConfig.url,
    protocol: individualConfig.protocol,
    authorize: individualConfig.authorize && ({
      createRequest: () => jwtAndUserInfo$
        .pipe(
          take(1),
          mergeMap(([jwt, userInfo]) =>
            individualConfig.authorize!.createRequest(userInfo, jwt)
          )
        ),
      isResponseSuccessful: individualConfig.authorize.isResponseSuccessful,
    }),
    subscribe: individualConfig.subscribe && ({
      createRequests: (socketAuthResponse) => jwtAndUserInfo$
        .pipe(
          take(1),
          mergeMap(([jwt, userInfo]) =>
            individualConfig.subscribe!.createRequests(userInfo, jwt, socketAuthResponse)
          )
        ),
      isResponseSuccessful: individualConfig.subscribe.isResponseSuccessful
    })
  })
  const responses$ = socket.subscribed$.pipe(
    zipWith(socket.authorized$),
    take(1),
    takeUntil(socket.closedForever$),
    map(([sub, auth]) => ({
      sub,
      auth
    }))
  )
  return {
    socket,
    responses$
  }
}
