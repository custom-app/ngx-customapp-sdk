import {JwtInfo} from './models/jwt-info';
import {jwtExpirationGapMs} from './constants/jwt-expiration';

export function isJwtExpired(jwt: JwtInfo, gap: number = jwtExpirationGapMs) {
  return jwt.expiresAt <= Date.now() + gap;
}
