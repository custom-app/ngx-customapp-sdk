import {JwtInfo} from './models/jwt-info';
import {jwtExpirationGapMs} from './constants/jwt-expiration';
import {JwtGroup} from './models/jwt-group';

export function isJwtExpired(jwt: JwtInfo, gap: number = jwtExpirationGapMs) {
  return jwt.expiresAt <= Date.now() + gap;
}

export function jwtNotNull(jwt?: JwtGroup<JwtInfo>): boolean {
  return Boolean(jwt?.accessToken?.token && jwt?.refreshToken?.token)
}
