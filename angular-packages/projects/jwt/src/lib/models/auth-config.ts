import {JwtGroup} from './jwt-group';
import {JwtInfo} from './jwt-info';
import {JwtApi} from './jwt-api';
import {NoFreshJwtListener} from './no-fresh-jwt-listener';
import {ActionCreator} from '@ngrx/store'

export interface AuthConfig<Credentials,
  UserId,
  AuthResponse> {
  /**
   * Function to retrieve the jwt from auth response.
   * @param authResponse
   */
  authResponseToJwt: (authResponse: AuthResponse) => JwtGroup<JwtInfo>,
  /**
   * Used by the AuthInterceptor http interceptor to set the auth header with jwt pinned for every request.
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
  actionToWaitUntilAuth: ActionCreator<any>;
}
