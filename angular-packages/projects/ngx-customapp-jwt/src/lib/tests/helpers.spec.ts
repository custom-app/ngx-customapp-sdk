import {TestAuthResponse, TestCredentials, TestUserInfo} from './models.spec';
import {JwtGroup} from '../models/jwt-group';
import {JwtInfo} from '../models/jwt-info';

// all functions and constants prefixed with 'test'

export function testAuthResponseToJwt(authResponse: TestAuthResponse): JwtGroup<JwtInfo> | undefined {
  return authResponse.jwt
}

export function testAuthResponseToUserInfo(authResponse: TestAuthResponse): TestUserInfo {
  return authResponse.user
}

export const testAuthHeader = {
  name: 'Authorization',
  createValue: (jwt: JwtInfo) => `Bearer ${jwt.token},`
};

export function testJwtToCredentials(jwt: JwtInfo): TestCredentials {
  return {
    token: jwt.token
  }
}

let testJwtCounter = 0;

export function testCreateJwt(delta = 100): JwtInfo {
  return {
    token: `example token number ${testJwtCounter++}`,
    expiresAt: Date.now() + delta
  }
}

export function testCreateJwtGroup(accessDelta = 100, refreshDelta = 500): JwtGroup<JwtInfo> {
  return {
    accessToken: testCreateJwt(accessDelta),
    refreshToken: testCreateJwt(refreshDelta)
  }
}
