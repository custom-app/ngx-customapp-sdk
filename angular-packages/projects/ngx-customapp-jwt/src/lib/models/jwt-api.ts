import {Observable} from 'rxjs';
import {JwtInfo} from './jwt-info';
import {JwtGroup} from './jwt-group';

/**
 * Provides methods to interact with backend.
 * Errors, thrown by the methods, MUST be human-readable strings. You can implement
 * this using ngx-custmapp-errors package (if you want, also use ngx-customapp-proto-http).
 * You could also learn more about error handling convention
 * by reading the ngx-customapp-errors docs.
 */
export abstract class JwtApi<Credentials,
  AuthResponse,
  UserId = number> {
  /**
   * Should make an auth request to the server. Usually supports logging in by a password or by a JWT.
   * @param credentials Login and password or something else, depending on the target application
   * @returns Usually returns information about the user and JWT tokens.
   * JWT is retrieved from auth response with {@link JwtConfig.authResponseToJwt}.
   */
  abstract login: (credentials: Credentials) => Observable<AuthResponse>
  /**
   * Used to implement feature, which allows logging in as another user. For example, director role may want
   * to log in as manager role. This feature is optional.
   * @param userId the parameter used to build the request. Might be complex and include user role, location, etc.
   * @param masterAccessToken the access token of the current user (not target).
   * @returns The `AuthResponse` as if the target user logged in using his credentials.
   */
  abstract loginAs?: (masterAccessToken: JwtInfo, userId: UserId) => Observable<AuthResponse>
  /**
   * Uses valid long-living refresh token to get new access and refresh tokens from backend.
   */
  abstract refresh: (refreshToken: JwtInfo) => Observable<JwtGroup<JwtInfo>>
  /**
   * Invalidates tokens.
   * @param accessToken the access token of the user being logged out. Might be the token, returned by loginAs function.
   * @param fromAllDevices Optional functionality
   */
  abstract logout: (accessToken: JwtInfo, fromAllDevices?: boolean) => Observable<void>
}

export interface JwtApiConstructor<Credentials,
  AuthResponse,
  UserId = number> {
  new(...args: any[]): JwtApi<Credentials, AuthResponse, UserId>
}
