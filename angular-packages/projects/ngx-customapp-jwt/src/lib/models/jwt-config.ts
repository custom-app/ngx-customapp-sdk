import {JwtGroup} from './jwt-group';
import {JwtInfo} from './jwt-info';
import {JwtApi, JwtApiConstructor} from './jwt-api';
import {NoFreshJwtListenerConstructor} from './no-fresh-jwt-listener';
import {ActionCreator} from '@ngrx/store'

/**
 * Main configuration object. Describes, how to retrieve JWT, UserInfo,
 * what to do when JWTs are invalid, how JwtGuard will handle routes.
 */
export interface JwtConfig<Credentials,
  AuthResponse,
  UserInfo,
  UserId = number> {
  /**
   * Function to retrieve the jwt from auth response. There might be no fresh
   * JWT, when authorizing by token, so the function can return undefined.
   * @param authResponse
   */
  authResponseToJwt: (authResponse: AuthResponse) => JwtGroup<JwtInfo> | undefined,
  authResponseToUserInfo: (authResponse: AuthResponse) => UserInfo,
  /**
   * Used by the JwtInterceptor http interceptor to set the auth header with jwt pinned for every request.
   */
  authHeader: {
    name: string,
    createValue: (jwt: JwtInfo) => string,
  },
  /**
   * Urls, which will not be intercepted.
   * If string, the url should start with that string to be excluded.
   * If RegExp, the url will be tested with .match and excluded if matches.
   */
  excludeUrls?: (string | RegExp)[]
  /**
   * Provides methods to interact with backend. Must implement {@link JwtApi}.
   */
  jwtApi: JwtApiConstructor<Credentials, AuthResponse, UserId>,
  /**
   * Used to start actions, when refresh jwt failed. Usually you want to
   * redirect user to the login page.
   */
  noFreshJwt: {
    service: NoFreshJwtListenerConstructor,
    /**
     * If all fields are false, NoFreshJwtListener is never called.
     * If you want to navigate to the auth page every time a JWT needed, but there was none,
     * set all fields to true.
     */
    callWhen: {
      interceptorNotFoundJwt: boolean,
      guardNotFoundJwt: boolean,
      loginAsJwtNotFound: boolean,
    }
  }
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
  actionToWaitUntilAuth?: ActionCreator;
  /**
   * if set, the {@link JwtGuard}, used to restrict access for unauthorized users,
   * will be provided and available to be used in the routing.
   * To implement redirection, when no JWT available, use noFreshJwt field of this config.
   */
  jwtGuard?: {
    /**
     * Used to call {@link JwtApi.login}, if there are valid JWT.
     * @param jwt fresh JWT.
     */
    jwtToCredentials: (jwt: JwtInfo) => Credentials,
    /**
     * The action on which navigation will be continued. The default is `loginAgainSucceed`.
     */
    actionAppReady?: ActionCreator,
    /**
     * The action on which navigation will be cancelled. The default is `loginAgainErrored`.
     */
    actionAppNotReady?: ActionCreator,
  }
}
