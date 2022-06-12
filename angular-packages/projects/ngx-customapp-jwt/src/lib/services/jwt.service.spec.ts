import SpyObj = jasmine.SpyObj;
import {JwtApi} from '../models/jwt-api';
import {TestAuthResponse, TestCredentials, TestUserInfo} from '../tests/models.spec';
import {NoFreshJwtListener} from '../models/no-fresh-jwt-listener';
import createSpyObj = jasmine.createSpyObj;
import {
  testAuthHeader,
  testAuthResponseToJwt,
  testAuthResponseToUserInfo, testCreateAuthResponse, testCreateCredentials,
  testCreateJwtGroup, testJwtToCredentials
} from '../tests/helpers.spec';
import {TestBed} from '@angular/core/testing';
import {JwtService} from './jwt.service';
import {JWT_CONFIG} from '../constants/di-token';
import Spy = jasmine.Spy;
import {JwtInfo} from '../models/jwt-info';
import {JwtGroup} from '../models/jwt-group';
import {defaultJwtStorageKey} from '../constants/jwt-storage-key';
import {of, throwError} from 'rxjs';
import {LoginAsApiMethodDoesNotHaveJwtInAuthResponse, LoginAsCalledWhenUnauthorized} from '../errors';
import {JwtConfig} from '../models/jwt-config';

// Required<> needed fot jasmine.Spy types inference to work on optional methods
type JwtApiSpy = SpyObj<Required<JwtApi<TestCredentials, TestAuthResponse>>>
type NoFreshJwtSpy = SpyObj<NoFreshJwtListener>

describe('JwtService', () => {
  let jwtService: JwtService<TestCredentials, TestAuthResponse, TestUserInfo>
  let jwtApi: JwtApiSpy;
  let noFreshJwt: NoFreshJwtSpy;
  let getItemSpy: Spy;

  const initJwtService = (initialJwt?: string, jwtStorageKey?: string) => {
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
    const jwtConfig: JwtConfig<TestCredentials, TestAuthResponse, TestUserInfo> = {
      authResponseToJwt: testAuthResponseToJwt,
      authResponseToUserInfo: testAuthResponseToUserInfo,
      authHeader: testAuthHeader,
      jwtApi: jwtApiSpy,
      noFreshJwt: noFreshJwtSpy,
      jwtStorageKey
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
  it('should remove jwt when login errored', (done) => {
    const initialJwt = testCreateJwtGroup()
    initJwtService(JSON.stringify(initialJwt))
    expect(jwtService.jwt).toBeTruthy()
    const credentials = testJwtToCredentials(initialJwt.accessToken!)
    jwtApi.login.and.returnValue(throwError(() => 'invalid tokens'))
    // login using jwt from memory. In that case, error means jwt are invalid
    jwtService.login(credentials).subscribe({
      next: () => done.fail('login expected to fail'),
      error: () => {
        expect(localStorage.removeItem).toHaveBeenCalled()
        expect(jwtService.jwt).toBeFalsy()
        done()
      }
    })
  })
  it('should logout and delete jwt', (done) => {
    const jwt = testCreateJwtGroup()
    initJwtService(JSON.stringify(jwt))
    const fromAllDevices = true;
    jwtApi.logout.and.returnValue(of(void 0))
    jwtService.logout(fromAllDevices).subscribe({
      next: (v) => {
        expect(v).toEqual(undefined)
        expect(jwtApi.logout).toHaveBeenCalledWith(jwt.accessToken!, fromAllDevices)
        expect(jwtService.jwt).toBeFalsy()
        expect(localStorage.removeItem).toHaveBeenCalledWith(defaultJwtStorageKey)
        done()
      },
      error: done.fail
    })
  })
  it('should refresh jwt when calling logout', (done) => {
    const jwt = testCreateJwtGroup(-10000)
    const freshJwt = testCreateJwtGroup()
    initJwtService(JSON.stringify(jwt))
    jwtApi.refresh.and.returnValue(of(freshJwt))
    jwtApi.logout.and.returnValue(of(void 0))

    jwtService.logout(true).subscribe({
      next: () => {
        expect(jwtApi.refresh).toHaveBeenCalledWith(jwt.refreshToken!)
        expect(jwtApi.logout).toHaveBeenCalledWith(freshJwt.accessToken!, true)
        expect(jwtService.jwt).toBeFalsy()
        expect(localStorage.setItem).toHaveBeenCalledBefore(localStorage.removeItem) // should save refreshed tokens
        expect(localStorage.removeItem).toHaveBeenCalled() // and then delete them
        done()
      },
      error: done.fail
    })
  })
  it('should succeed not calling logout when there is no fresh access token', (done) => {
    const jwt = testCreateJwtGroup(-10000)
    initJwtService(JSON.stringify(jwt))
    jwtApi.refresh.and.returnValue(throwError(() => 'cannot refresh'))

    jwtService.logout().subscribe({
      next: () => {
        expect(jwtApi.refresh).toHaveBeenCalledWith(jwt.refreshToken!)
        expect(jwtApi.logout).not.toHaveBeenCalled()
        expect(jwtService.jwt).toBeFalsy()
        expect(localStorage.removeItem).toHaveBeenCalled()
        done()
      },
      error: done.fail
    })
  })
  it('should not call logout and not refresh when there is no fresh refresh token', (done) => {
    const jwt = testCreateJwtGroup(-10000, -2000)
    initJwtService(JSON.stringify(jwt))

    expect(jwtService.jwt).toBeTruthy()
    jwtService.logout().subscribe({
      next: () => {
        expect(jwtApi.logout).not.toHaveBeenCalled()
        expect(jwtApi.refresh).not.toHaveBeenCalled()
        expect(localStorage.removeItem).toHaveBeenCalled()
        // it is expected that there are not fresh jwt after logout,
        // so side effects should not be produced
        expect(noFreshJwt.noFreshJwt).not.toHaveBeenCalled()
        expect(jwtService.jwt).toBeFalsy()
        done()
      },
      error: done.fail
    })
  })
  it('should not call logout if there are no jwt', (done) => {
    initJwtService()
    expect(jwtService.jwt).toBeFalsy()
    jwtService.logout().subscribe({
      next: () => {
        expect(jwtApi.logout).not.toHaveBeenCalled()
        expect(jwtApi.refresh).not.toHaveBeenCalled()
        expect(noFreshJwt.noFreshJwt).not.toHaveBeenCalled()
        done()
      },
      error: done.fail
    })
  })
  it('should use custom jwt storage key', (done) => {
    const key = 'customJwtStorageKey'
    initJwtService(undefined, key)
    expect(jwtService.jwt).toBeFalsy()
    const authResp = testCreateAuthResponse(true)
    const jwt = testAuthResponseToJwt(authResp)
    const credentials = testCreateCredentials()
    jwtApi.login.and.returnValue(of(authResp))
    jwtService.login(credentials).subscribe({
      next: () => {
        expect(jwtService.jwt).toBeTruthy()
        expect(localStorage.setItem).toHaveBeenCalledWith(key, JSON.stringify(jwt))
        done()
      },
      error: done.fail
    })
  })
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
  it('should not remove jwt if loginAs errored', (done) => {
    const initialJwt = testCreateJwtGroup()
    initJwtService(JSON.stringify(initialJwt))
    jwtApi.loginAs.and.returnValue(throwError(() => 'some unexpected error'))

    jwtService.loginAs(10).subscribe({
      next: () => done.fail('method expected to fail'),
      error: () => {
        expect(jwtService.jwt).toEqual(initialJwt)
        jwtApi.logout.and.returnValue(of(void 0))
        jwtService.logout().subscribe({
          next: () => {
            expect(jwtService.jwt).toBeFalsy()
            done()
          },
          error: done.fail
        })
      }
    })
  })
  it('should login as and logout back to the master user', (done) => {
    const initialJwt = testCreateJwtGroup()
    initJwtService(JSON.stringify(initialJwt))
    const authResp = testCreateAuthResponse(true)
    const jwt = testAuthResponseToJwt(authResp)
    const authResp2 = testCreateAuthResponse(true)
    const jwt2 = testAuthResponseToJwt(authResp2)

    const checkLogoutAfterLoginAs = () => {
      expect(jwtApi.login).not.toHaveBeenCalled()
      expect(jwtApi.loginAs).not.toHaveBeenCalled()
      expect(localStorage.removeItem).not.toHaveBeenCalled()
      expect(localStorage.setItem).not.toHaveBeenCalled()
      jwtApi.logout.calls.reset()
    }

    jwtApi.loginAs.and.returnValue(of(authResp))
    jwtService.loginAs(10).subscribe({
      next: resp => {
        expect(resp).toEqual(authResp)
        expect(jwtService.jwt).toEqual(jwt)
        expect(localStorage.setItem).not.toHaveBeenCalled()
        expect(jwtApi.loginAs).toHaveBeenCalledWith(initialJwt.accessToken!, 10)
        jwtApi.loginAs.calls.reset()

        jwtApi.loginAs.and.returnValue(of(authResp2))
        jwtService.loginAs(20).subscribe({
          next: resp2 => {
            expect(resp2).toEqual(authResp2)
            expect(jwtService.jwt).toEqual(jwt2)
            expect(localStorage.setItem).not.toHaveBeenCalled()
            expect(jwtApi.loginAs).toHaveBeenCalledWith(jwt?.accessToken!, 20)
            expect(jwtService.loginAsDepth).toEqual(2)
            jwtApi.loginAs.calls.reset()

            jwtApi.logout.and.returnValue(of(void 0))
            jwtService.logout(true).subscribe({
              next: () => {
                expect(jwtApi.logout).toHaveBeenCalledWith(jwt2?.accessToken!, true)
                expect(jwtService.jwt).toEqual(jwt)
                checkLogoutAfterLoginAs()

                jwtApi.logout.and.returnValue(of(void 0))
                jwtService.logout(true).subscribe({
                  next: () => {
                    expect(jwtApi.logout).toHaveBeenCalledWith(jwt?.accessToken!, true)
                    expect(jwtService.jwt).toEqual(initialJwt)
                    checkLogoutAfterLoginAs()

                    jwtApi.logout.and.returnValue(of(void 0))
                    jwtService.logout(true).subscribe({
                      next: () => {
                        expect(jwtApi.logout).toHaveBeenCalledWith(initialJwt.accessToken!, true)
                        expect(jwtService.jwt).toBeFalsy()
                        expect(localStorage.removeItem).toHaveBeenCalled()
                        done()
                      },
                      error: done.fail,
                    })
                  },
                  error: done.fail,
                })
              },
              error: done.fail,
            })
          },
          error: done.fail
        })
      },
      error: done.fail
    })
  })
  it('should refresh tokens when trying to loginAs', (done) => {
    const initialJwt = testCreateJwtGroup(-10000)
    initJwtService(JSON.stringify(initialJwt))
    const jwt = testCreateJwtGroup()
    const authResp = testCreateAuthResponse(true)

    jwtApi.refresh.and.returnValue(of(jwt))
    jwtApi.loginAs.and.returnValue(of(authResp))
    jwtService.loginAs(10).subscribe({
      next: () => {
        expect(jwtApi.refresh).toHaveBeenCalledWith(initialJwt.refreshToken!)
        expect(localStorage.setItem).toHaveBeenCalledWith(defaultJwtStorageKey, JSON.stringify(jwt))
        expect(jwtApi.loginAs).toHaveBeenCalledWith(jwt.accessToken!, 10)
        expect(jwtService.jwt).toEqual(testAuthResponseToJwt(authResp))
        done()
      },
      error: done.fail,
    })
  })
  it('should not save refreshed tokens to the localStorage after loginAs', (done) => {
    const initialJwt = testCreateJwtGroup()
    initJwtService(JSON.stringify(initialJwt))

    const authResp = testCreateAuthResponse(true, -10000)
    const jwt = testAuthResponseToJwt(authResp)
    const freshJwt = testCreateJwtGroup()

    jwtApi.loginAs.and.returnValue(of(authResp))
    jwtService.loginAs(10).subscribe({
      next: resp => {
        expect(resp).toEqual(authResp)
        expect(jwtService.jwt).toEqual(jwt)

        jwtApi.refresh.and.returnValue(of(freshJwt))
        jwtService.withFreshJwt(refreshedJwt => {
          expect(refreshedJwt).toEqual(freshJwt)
          expect(jwtApi.refresh).toHaveBeenCalledWith(jwt?.refreshToken!)
          expect(localStorage.setItem).not.toHaveBeenCalled()
          expect(localStorage.removeItem).not.toHaveBeenCalled()
          done()
        })
      },
      error: done.fail,
    })
  })
  xit('should call withFreshJwt every time subscription to fresh jwt is made')
  xit('withFreshJwt should refresh tokens and save them')
  xit('should call no fresh jwt listener when there was no jwt')
  xit('should call no fresh jwt listener when jwt were not refreshed and should delete tokens')
  xit('should not delete tokens if cannot refresh them after loginAs')
  xit('should handle concurrent calls to withFreshJwt')
  xit('should properly call or not call callbacks when withFreshJwt is used concurrently')
})
