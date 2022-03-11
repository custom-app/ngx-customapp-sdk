import {Observable} from 'rxjs';
import {JwtGroup} from './jwt-group';
import {JwtInfo} from './jwt-info';

/**
 * An interface, which is used to connect the library to
 */
export interface JwtApiServiceBase<JwtInfoType extends JwtInfo,
  JwtGroupType extends JwtGroup,
  Credentials,
  UserId,
  AuthResponse> {
  login: () => Observable<AuthResponse>,
  loginAs: (userId: UserId) => Observable<AuthResponse>,
  refresh: (refreshToken: JwtInfoType) => Observable<JwtGroupType>,
  logout: (fromAllDevices?: boolean) => Observable<void>,
}
