import {IndividualWebSocketConfig, SocketId} from './individual-web-socket-config';
import {Observable} from 'rxjs';
import {JwtGroup, JwtInfo} from 'ngx-customapp-jwt';
import {SocketResponses} from '../utils/socket';

export interface WebSocketChainLink<RequestType, ResponseType, UserInfo> {
  sockets: IndividualWebSocketConfig<RequestType, ResponseType, UserInfo>[],
  /**
   * A function to be called when all sockets come to the `subscribed` state. The returned observable is
   * subscribed and expected to emit a new WebSocketChainLink object, that will be used
   * to create new sockets.
   * @param userInfo User info, saved after latest login or loginAs.
   * @param jwt Refreshed JWT of this user.
   * @param socketAuthResponses Authorization responses from the sockets of this WebSocketChainLink. Will be null,
   * if no isResponseSuccessful provided.
   * @param socketSubResponses Subscription responses from the sockets of this WebSocketChainLink. Will be null,
   * if no isResponseSuccessful provided.
   */
  socketsReady?: (
    userInfo: UserInfo | undefined,
    jwt: JwtGroup<JwtInfo> | undefined,
    responses: Record<SocketId, SocketResponses<ResponseType>>,
  ) => Observable<WebSocketChainLink<RequestType, ResponseType, UserInfo>>,
}
