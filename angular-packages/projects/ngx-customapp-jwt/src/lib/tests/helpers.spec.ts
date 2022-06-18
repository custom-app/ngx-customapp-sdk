import {TestAuthResponse, TestCredentials, TestUserInfo} from './models.spec';
import {JwtGroup} from '../models/jwt-group';
import {JwtInfo} from '../models/jwt-info';
import {jwtExpirationGapMs} from '../constants/jwt-expiration';
import {defer, Observable} from 'rxjs';
import {ActionCreator} from '@ngrx/store';
import {Actions, ofType} from '@ngrx/effects';
import Spy = jasmine.Spy;
import createSpy = jasmine.createSpy;
import {tick} from '@angular/core/testing';

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

export function testCreateAuthResponse(includeJwt: boolean, accessDelta?: number, refreshDelta?: number): TestAuthResponse {
  const res: TestAuthResponse = {
    user: testCreateUser(),
  }
  if (includeJwt) {
    res.jwt = testCreateJwtGroup(accessDelta, refreshDelta)
  }
  return res
}

let testCredentialsCounter = 1;

export function testCreateCredentials(): TestCredentials {
  return {
    token: `example credentials ${testCredentialsCounter++}`
  }
}

export function asyncData<T>(data: T) {
  return defer(() => Promise.resolve(data))
}

export function asyncError<T>(error: T) {
  return defer(() => Promise.reject(error))
}

export function spyForAction(action: ActionCreator, actions$: Actions): Spy {
  const spy = createSpy(action.type)
  actions$.pipe(
    ofType(action)
  ).subscribe(instance => {
    spy(instance)
  })
  return spy
}

export function tickObservable<T>(observable: Observable<T>, tickMs?: number): T {
  let value: T;
  let callCount = 0
  observable.subscribe({
    next: v => {
      value = v;
      callCount++;
    }
  })
  tick(tickMs)
  expect(callCount).toEqual(1)
  // @ts-ignore
  return value
}
