import SpyObj = jasmine.SpyObj;
import {JwtApi} from '../models/jwt-api';
import {TestAuthResponse, TestCredentials, TestUserInfo} from '../tests/models.spec';
import {NoFreshJwtListener} from '../models/no-fresh-jwt-listener';
import createSpyObj = jasmine.createSpyObj;
import {
  testAuthHeader,
  testAuthResponseToJwt,
  testAuthResponseToUserInfo,
  testCreateJwtGroup
} from '../tests/helpers.spec';
import {TestBed} from '@angular/core/testing';
import {JwtService} from './jwt.service';
import {JWT_CONFIG} from '../constants/di-token';
import Spy = jasmine.Spy;
import {JwtInfo} from '../models/jwt-info';
import {JwtGroup} from '../models/jwt-group';
import {defaultJwtStorageKey} from '../constants/jwt-storage-key';

type JwtApiSpy = SpyObj<JwtApi<TestCredentials, TestAuthResponse>>
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
})
