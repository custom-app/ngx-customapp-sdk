import {TestAuthResponse, TestCredentials, TestUserInfo} from './models.spec';
import {JwtGroup} from '../models/jwt-group';
import {JwtInfo} from '../models/jwt-info';
import {jwtExpirationGapMs} from '../constants/jwt-expiration';

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

let testJwtCounter = 1;

export function testCreateJwt(delta = jwtExpirationGapMs * 2): JwtInfo {
  return {
    token: `example token number ${testJwtCounter++}`,
    expiresAt: Date.now() + delta
  }
}

export function testCreateJwtGroup(
  accessDelta = jwtExpirationGapMs * 2,
  refreshDelta = jwtExpirationGapMs * 10
): JwtGroup<JwtInfo> {
  return {
    accessToken: testCreateJwt(accessDelta),
    refreshToken: testCreateJwt(refreshDelta)
  }
}

let testUserCounter = 1

export function testCreateUser(): TestUserInfo {
  return {
    userId: testUserCounter++
  }
}

export function testCreateAuthResponse(includeJwt: boolean): TestAuthResponse {
  const res: TestAuthResponse = {
    user: testCreateUser(),
  }
  if (includeJwt) {
    res.jwt = testCreateJwtGroup()
  }
  return res
}

let testCredentialsCounter = 1;

export function testCreateCredentials(): TestCredentials {
  return {
    token: `example credentials ${testCredentialsCounter++}`
  }
}
