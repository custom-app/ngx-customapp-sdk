import {Observable} from 'rxjs';
import {JwtInfo} from './jwt-info';
import {JwtGroup} from './jwt-group';

/**
 * Provides methods to interact with backend
 */
export abstract class JwtApi<Credentials,
  UserId,
  AuthResponse> {
  /**
   * Should make an auth request to the server.
   * @param credentials Login and password or something else, depending on the target application
   * @returns Usually returns information about the user and JWT tokens.
   * JWT is retrieved from auth response with {@link AuthConfig.authResponseToJwt}.
   */
  abstract login: (credentials: Credentials) => Observable<AuthResponse>
  /**
   * Used to implement feature, which allows logging in as another user. For example, director role may want
   * to log in as manager role.
   * @param userId the parameter used to build the request. Might be complex and include user role, location, etc.
   * @param accessToken the access token of the current user (not target).
   * @returns The `AuthResponse` as if the target user logged in using his credentials.
   */
  abstract loginAs: (userId: UserId, accessToken: JwtInfo) => Observable<AuthResponse>
  /**
   * Uses valid long-living refresh token to get new access and refresh tokens from backend.
   */
  abstract refresh: (refreshToken: JwtInfo) => Observable<JwtGroup<JwtInfo>>
  /**
   * Invalidates tokens.
   * @param fromAllDevices Optional functionality
   */
  abstract logout: (fromAllDevices?: boolean) => Observable<void>
}
