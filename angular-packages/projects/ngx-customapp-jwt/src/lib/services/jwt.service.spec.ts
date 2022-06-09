import SpyObj = jasmine.SpyObj;
import {JwtApi} from '../models/jwt-api';
import {TestAuthResponse, TestCredentials, TestUserInfo} from '../tests/models.spec';
import {NoFreshJwtListener} from '../models/no-fresh-jwt-listener';
import createSpyObj = jasmine.createSpyObj;
import {
  testAuthHeader,
  testAuthResponseToJwt,
  testAuthResponseToUserInfo, testCreateAuthResponse, testCreateCredentials,
  testCreateJwtGroup
} from '../tests/helpers.spec';
import {TestBed} from '@angular/core/testing';
import {JwtService} from './jwt.service';
import {JWT_CONFIG} from '../constants/di-token';
import Spy = jasmine.Spy;
import {JwtInfo} from '../models/jwt-info';
import {JwtGroup} from '../models/jwt-group';
import {defaultJwtStorageKey} from '../constants/jwt-storage-key';
import {of} from 'rxjs';
import {LoginAsApiMethodDoesNotHaveJwtInAuthResponse, LoginAsCalledWhenUnauthorized} from '../errors';

// Required<> needed fot jasmine.Spy types inference to work on optional methods
type JwtApiSpy = SpyObj<Required<JwtApi<TestCredentials, TestAuthResponse>>>
type NoFreshJwtSpy = SpyObj<NoFreshJwtListener>

describe('JwtService', () => {
  let jwtService: JwtService<TestCredentials, TestAuthResponse, TestUserInfo>
  let jwtApi: JwtApiSpy;
  let noFreshJwt: NoFreshJwtSpy;
  let getItemSpy: Spy;

  const initJwtService = (initialJwt?: string) => {
    spyOn(localStorage, 'setItem')
    spyOn(localStorage, 'removeItem')
    getItemSpy = spyOn(localStorage, 'getItem')
    getItemSpy.and.returnValue(initialJwt)
    const jwtApiSpy = createSpyObj(
      'JwtApi',
      [
        'login',
        'loginAs',
        'refresh',
        'logout',
      ]
    )
    const noFreshJwtSpy = createSpyObj(
      'NoFreshJwtListener',
      [
        'noFreshJwt'
      ]
    )
    let jwtConfig = {
      authResponseToJwt: testAuthResponseToJwt,
      authResponseToUserInfo: testAuthResponseToUserInfo,
      authHeader: testAuthHeader,
      jwtApi: jwtApiSpy,
      noFreshJwt: noFreshJwtSpy,
    }
    TestBed.configureTestingModule({
      providers: [
        JwtService,
        {
          provide: JWT_CONFIG,
          useValue: jwtConfig,
        },
        {
          provide: JwtApi,
          useValue: jwtApiSpy,
        },
        {
          provide: NoFreshJwtListener,
          useValue: noFreshJwtSpy,
        }
      ]
    })
    jwtService = TestBed.inject(JwtService);
    jwtApi = TestBed.inject(JwtApi) as JwtApiSpy;
    noFreshJwt = TestBed.inject(NoFreshJwtListener) as NoFreshJwtSpy
  }
  it('should load jwt on creation', () => {
    const initialJwt: JwtGroup<JwtInfo> = testCreateJwtGroup()
    initJwtService(JSON.stringify(initialJwt))
    expect(jwtService.jwt).toEqual(initialJwt)
    expect(localStorage.getItem).toHaveBeenCalled()
    expect(localStorage.setItem).not.toHaveBeenCalled()
    expect(localStorage.removeItem).not.toHaveBeenCalled()
  })
  it('should not error on creation with no jwt in local storage', () => {
    initJwtService()
    expect(localStorage.getItem).toHaveBeenCalled()
    expect(jwtService.jwt).toBeFalsy()
  })
  it('should not error on creation with invalid json in local storage', () => {
    initJwtService('asdlfjasdf')
    expect(localStorage.getItem).toHaveBeenCalled()
    expect(jwtService.jwt).toBeFalsy()
  })
  it('should not error on creation with invalid jwt in local storage', () => {
    initJwtService('{kek:"lol"}')
    expect(localStorage.getItem).toHaveBeenCalled()
    expect(jwtService.jwt).toBeFalsy()
    expect(localStorage.removeItem).toHaveBeenCalledWith(defaultJwtStorageKey)
  })
  it('should login and save jwt', (done) => {
    initJwtService('')
    const authResp = testCreateAuthResponse(true)
    const credentials = testCreateCredentials()
    jwtApi.login.and.returnValue(of(authResp))

    jwtService.login(credentials).subscribe({
      next: authResp => {
        expect(jwtApi.login).toHaveBeenCalledWith(credentials)
        expect(authResp).toEqual(authResp)
        expect(jwtService.jwt).toEqual(testAuthResponseToJwt(authResp))
        done()
      },
      error: done.fail
    })
  })
  it('should login and not save jwt', (done) => {
    const initialJwt = testCreateJwtGroup()
    initJwtService(JSON.stringify(initialJwt))
    const authResp = testCreateAuthResponse(false) // auth response will have no jwt
    const credentials = testCreateCredentials()
    jwtApi.login.and.returnValue(of(authResp))

    jwtService.login(credentials).subscribe({
      next: () => {
        expect(jwtService.jwt).toEqual(initialJwt)
        done()
      },
      error: done.fail
    })
  })
  xit('should logout and delete jwt')
  xit('should not call logout when there is no fresh access token')
  xit('should not call logout when there are no jwt')
  it('should login as and save jwt', (done) => {
    const initialJwt = testCreateJwtGroup()
    initJwtService(JSON.stringify(initialJwt))
    const authResp = testCreateAuthResponse(true)
    jwtApi.loginAs.and.returnValue(of(authResp))

    const userId = 10
    jwtService.loginAs(userId).subscribe({
      next: () => {
        expect(jwtApi.loginAs).toHaveBeenCalledWith(initialJwt.accessToken!, userId)
        expect(jwtService.jwt).toEqual(testAuthResponseToJwt(authResp))
        done()
      },
      error: done.fail
    })
  })
  it('should fail when there is unauthorized call to loginAs', (done) => {
    initJwtService()
    jwtService.loginAs(10).subscribe({
      next: () => done.fail('method expected to fail'),
      error: e => {
        expect(jwtApi.loginAs).not.toHaveBeenCalled()
        expect(e).toBeInstanceOf(LoginAsCalledWhenUnauthorized)
        done()
      }
    })
  })
  it('should fail when auth response does not have jwt', (done) => {
    const initialJwt = testCreateJwtGroup()
    initJwtService(JSON.stringify(initialJwt))
    const authResp = testCreateAuthResponse(false)
    jwtApi.loginAs.and.returnValue(of(authResp))

    jwtService.loginAs(10).subscribe({
      next: () => done.fail('method expected to fail'),
      error: e => {
        expect(jwtApi.loginAs).toHaveBeenCalled()
        expect(e).toBeInstanceOf(LoginAsApiMethodDoesNotHaveJwtInAuthResponse)
        expect(jwtService.jwt).toEqual(initialJwt)
        done()
      }
    })
  })
  xit('should login as and logout back to the master user')
  xit('should call withFresh jwt when subscribing to fresh jwt')
  xit('should call withFreshJwt when trying to loginAs')
  xit('fresh jwt should refresh tokens')
  xit('should call no fresh jwt listener when there was no jwt')
  xit('should call no fresh jwt listener when jwt were not refreshed')

})
