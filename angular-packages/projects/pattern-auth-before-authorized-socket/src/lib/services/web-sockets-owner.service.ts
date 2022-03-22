import {Inject, Injectable} from '@angular/core';
import {WebSocketChain} from '../models/web-socket-chain';
import {WEB_SOCKET_CHAIN} from '../constants/di-token';
import {SocketId} from '../models/individual-web-socket-config';
import {WebSocketController} from 'customapp-rxjs-websocket';
import {
  catchError,
  EMPTY,
  forkJoin,
  map,
  mergeMap,
  Observable,
  Subject,
  take,
  timeout,
  withLatestFrom,
  zip
} from 'rxjs';
import {createSocket, SocketResponses} from '../utils/socket';
import {Store} from '@ngrx/store';
import {JWT_SELECTORS, JwtAppRootStateBase, JwtSelectors, JwtService} from 'jwt';
import {WebSocketChainLink} from '../models/web-socket-chain-link';

export const closeTimeout = 10 * 1000;

@Injectable({
  providedIn: 'root'
})
export class WebSocketsOwnerService<RequestType,
  ResponseType,
  UnderlyingDataType extends string | ArrayBufferLike | Blob | ArrayBufferView,
  UserInfo,
  Credentials,
  UserId,
  AuthResponse,
  > {

  constructor(
    @Inject(WEB_SOCKET_CHAIN) private chain: WebSocketChain<RequestType, ResponseType, UnderlyingDataType, UserInfo>,
    private store: Store<JwtAppRootStateBase<UserInfo>>,
    private jwtService: JwtService<Credentials, AuthResponse, UserInfo>,
    @Inject(JWT_SELECTORS) private s: JwtSelectors<UserInfo>
  ) {
  }

  private _sockets: Record<SocketId, WebSocketController<RequestType, ResponseType, UnderlyingDataType>> = {}

  get sockets() {
    return this._sockets
  }

  socketsArray(): WebSocketController<RequestType, ResponseType, UnderlyingDataType>[] {
    const arr = []
    const dict = this.sockets
    for (const socketId in dict) {
      arr.push(dict[socketId])
    }
    return arr
  }

  /**
   * Init all the sockets according to config. Shuld be called only once per login.
   */
  init(): Observable<void> {
    const initialized$ = new Subject<void>()
    const commonConfig = this.chain.commonConfig
    const commonOpenOptions = this.chain.commonOpenOptions
    let currentChainLink: WebSocketChainLink<RequestType, ResponseType, UserInfo> = this.chain.chain
    const jwtAndUserInfo$ = this
      .jwtService
      .freshJwt()
      .pipe(
        withLatestFrom(this.store.select(this.s.selectJwtUser))
      )
    const launch = () => {
      forkJoin(
        currentChainLink
          .sockets
          .map(individualConfig => {
            const {socket, responses$} = createSocket(commonConfig, individualConfig, jwtAndUserInfo$)
            this.sockets[individualConfig.socketId] = socket
            socket.open(commonOpenOptions)
            return responses$
          })
      ).pipe(
        mergeMap(responses =>
          jwtAndUserInfo$
            .pipe(
              take(1),
              mergeMap(([jwt, userInfo]) => {
                  if (currentChainLink.socketsReady) {
                    return currentChainLink.socketsReady(
                      userInfo,
                      jwt,
                      responses
                        .reduce((acc, response, index) => {
                          const individualConfig = currentChainLink.sockets[index]
                          acc[individualConfig.socketId] = response
                          return acc
                        }, {} as Record<SocketId, SocketResponses<ResponseType>>)
                    )
                  } else {
                    initialized$.next()
                    initialized$.complete()
                    return EMPTY
                  }
                }
              )
            )
        ),
        catchError(err => {
          initialized$.error(err)
          return EMPTY
        }),
      ).subscribe(
        nextChainLink => {
          currentChainLink = nextChainLink
          launch()
        }
      )
    }
    launch()
    return initialized$
  }

  closeAll(): Observable<void> {
    return zip(
      this.socketsArray()
        .map(socket => socket.close())
    ).pipe(
      map(() => void 0),
      timeout(closeTimeout)
    )
  }
}
