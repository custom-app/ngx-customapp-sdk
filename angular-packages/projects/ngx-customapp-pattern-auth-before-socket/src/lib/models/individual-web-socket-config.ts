import {WebSocketControllerConfig} from 'customapp-rxjs-websocket';
import {JwtGroup, JwtInfo} from 'ngx-customapp-jwt';
import {Observable} from 'rxjs';

/**
 * Unique name, used to reference an instance of the socket.
 */
export type SocketId = string;

export type IndividualWebSocketConfig<RequestType, ResponseType, UserInfo> =
  Pick<WebSocketControllerConfig<RequestType, ResponseType, any>,
    'url' | 'protocol'> & {
  /**
   * Unique name, used to reference an instance of the socket.
   */
  socketId: SocketId,
  /**
   * Same as {@link WebSocketControllerConfig.authorize}, but functions have additional parameters.
   */
  authorize?: {
    /**
     * Used in the same way, as `createRequest` in the {@link WebSocketControllerConfig.authorize},
     * but has additional parameters, provided by the ngx-customapp-jwt package
     * @param userInfo User info, saved after latest login or loginAs.
     * @param jwt Refreshed JWT of this user.
     */
    createRequest: (userInfo: UserInfo | undefined, jwt: JwtGroup<JwtInfo> | undefined) => Observable<RequestType | undefined>
    isResponseSuccessful?: (response: ResponseType) => boolean
  }
  /**
   * Same as {@link WebSocketControllerConfig.authorize}, but functions have additional parameters.
   */
  subscribe?: {
    /**
     * Used in the same way, as `createRequests` in the {@link WebSocketControllerConfig.subscribe},
     * but has additional parameters, provided by the ngx-customapp-jwt package
     * @param userInfo User info, saved after latest login or loginAs.
     * @param jwt Refreshed JWT of this user.
     * @param socketAuthResponse A response on the message, created by the `authorize.createRequest`.
     * If no `authorizeIsResponseSuccessful` was provided,  will be null.
     */
    createRequests: (userInfo: UserInfo | undefined, jwt: JwtGroup<JwtInfo> | undefined, socketAuthResponse?: ResponseType) => Observable<RequestType[] | undefined>
    isResponseSuccessful?: (response: ResponseType) => boolean
  }
}
