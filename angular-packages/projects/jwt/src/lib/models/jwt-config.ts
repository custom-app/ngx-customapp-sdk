import {JwtGroup} from './jwt-group';
import {JwtInfo} from './jwt-info';
import {JwtApi} from './jwt-api';
import {NoFreshJwtListener} from './no-fresh-jwt-listener';
import {ActionCreator} from '@ngrx/store'

export interface JwtConfig<Credentials,
  AuthResponse,
  UserInfo,
  UserId = number> {
  /**
   * Function to retrieve the jwt from auth response.
   * @param authResponse
   */
  authResponseToJwt: (authResponse: AuthResponse) => JwtGroup<JwtInfo>,
  authResponseToUserInfo: (authResponse: AuthResponse) => UserInfo,
  /**
   * Used by the JwtInterceptor http interceptor to set the auth header with jwt pinned for every request.
   */
  authHeader: {
    name: string,
    createValue: (jwt: JwtInfo) => string,
  },
  /**
   * Provides methods to interact with backend
   */
  jwtApi: JwtApi<Credentials, UserId, AuthResponse>,
  /**
   * Used to start actions, when refresh jwt failed. Usually you want to
   * redirect user to the login page.
   */
  noFreshJwt: NoFreshJwtListener
  /**
   * the key to be used in the localStorage.
   *
   * Default is {@link defaultJwtStorageKey}
   */
  jwtStorageKey?: string,
  /**
   * If provided, no calls to the {@link JwtApi.login} will be made, until the action is dispatched.
   * The action is expected to come after dispatching login action of this package.
   * Used to wait until, for example, the socket is open, if the auth request is supposed to be sent through the socket.
   */
  actionToWaitUntilAuth?: ActionCreator<any>;
}
