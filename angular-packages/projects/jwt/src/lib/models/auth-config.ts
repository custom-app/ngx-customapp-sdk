import {JwtGroup} from './jwt-group';
import {JwtInfo} from './jwt-info';
import {JwtApi} from './jwt-api';
import {NoFreshJwtListener} from './no-fresh-jwt-listener';

export interface AuthConfig<JwtInfoType extends JwtInfo,
  JwtGroupType extends JwtGroup<JwtInfoType>,
  Credentials,
  UserId,
  AuthResponse> {
  /**
   * Function to retrieve the jwt from auth response.
   * @param authResponse
   */
  authResponseToJwt: (authResponse: AuthResponse) => JwtGroupType,
  /**
   * Used by the AuthInterceptor http interceptor to set the auth header with jwt pinned for every request.
   */
  authHeader: {
    name: string,
    createValue: (jwt: JwtInfoType) => string,
  },
  /**
   * Provides methods to interact with backend
   */
  jwtApi: JwtApi<JwtInfoType, JwtGroupType, Credentials, UserId, AuthResponse>,
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
}
