import {JwtGroup} from './jwt-group';
import {JwtInfo} from './jwt-info';

export interface JwtRefreshCall {
  callback: (jwt?: JwtGroup<JwtInfo>) => void
  callWithFreshOnly?: boolean
  doNotCallNoFreshJwt?: boolean
}
