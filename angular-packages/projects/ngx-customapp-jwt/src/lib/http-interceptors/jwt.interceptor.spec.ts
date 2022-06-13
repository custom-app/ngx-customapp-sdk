import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {JwtConfig} from '../models/jwt-config';
import {JwtServiceSpy, TestAuthResponse, TestCredentials, TestUserInfo} from '../tests/models.spec';
import {
  testAuthHeader,
  testAuthResponseToJwt,
  testAuthResponseToUserInfo,
  testCreateJwtGroup
} from '../tests/helpers.spec';
import createSpyObj = jasmine.createSpyObj;
import {HTTP_INTERCEPTORS, HttpClient, HttpContext, HttpHeaders} from '@angular/common/http';
import {JwtInterceptor} from './jwt.interceptor';
import {JwtService} from '../services/jwt.service';
import {JWT_CONFIG} from '../constants/di-token';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {JwtGroup} from '../models/jwt-group';
import {JwtInfo} from '../models/jwt-info';
import {of, zip} from 'rxjs';
import {disableJwtInterception} from '../constants/disable-jwt-interception';
import {JwtInterceptorDropsReportProgress} from '../errors';

const testUrl = '/test'
const testBody = {
  body: '1337',
}

describe('JwtInterceptor', () => {
  let jwtService: JwtServiceSpy
  let http: HttpClient
  let controller: HttpTestingController
  let jwt: JwtGroup<JwtInfo>
  beforeEach(() => {
    const jwtServiceSpy = createSpyObj(
      'JwtService',
      [
        'freshJwt'
      ]
    )
    const jwtConfig: Omit<JwtConfig<TestCredentials, TestAuthResponse, TestUserInfo>, 'jwtApi' | 'noFreshJwt'> = {
      authResponseToJwt: testAuthResponseToJwt,
      authResponseToUserInfo: testAuthResponseToUserInfo,
      authHeader: testAuthHeader,
    }
    TestBed.configureTestingModule({
      providers: [
        {
          provide: HTTP_INTERCEPTORS,
          multi: true,
          useClass: JwtInterceptor,
        },
        {
          provide: JwtService,
          useValue: jwtServiceSpy
        },
        {
          provide: JWT_CONFIG,
          useValue: jwtConfig,
        },
      ],
      imports: [
        HttpClientTestingModule,
      ]
    })
    http = TestBed.inject(HttpClient)
    controller = TestBed.inject(HttpTestingController)
    jwtService = TestBed.inject(JwtService) as JwtServiceSpy
    jwt = testCreateJwtGroup()
  })

  afterEach(() => {
    controller.verify()
  })

  it('should be created', () => {
    const interceptors = TestBed.inject(HTTP_INTERCEPTORS)
    expect(interceptors[1]).toBeInstanceOf(JwtInterceptor)
  })

  it('should add header and send the request', fakeAsync(() => {
    jwtService.freshJwt.and.returnValue(of(jwt))
    http.post(
      testUrl,
      testBody,
    ).subscribe()
    tick()
    const req = controller.expectOne(testUrl)
    expect(req.request.body).toEqual(testBody)
    expect(req.request.headers.get(testAuthHeader.name))
      .toEqual(testAuthHeader.createValue(jwt.accessToken!))
  }))
  it('should be disabled', fakeAsync(() => {
    jwtService.freshJwt.and.returnValue(of(jwt))
    http.post(
      testUrl,
      testBody,
      {
        context: new HttpContext().set(disableJwtInterception, true)
      }
    ).subscribe()
    tick()
    const req = controller.expectOne(testUrl)
    expect(req.request.body).toEqual(testBody)
    expect(req.request.headers.has(testAuthHeader.name)).toBeFalsy()
    expect(jwtService.freshJwt).not.toHaveBeenCalled()
  }))
  it('should not override existing auth header', fakeAsync(() => {
    jwtService.freshJwt.and.returnValue(of(jwt))
    const myJwt = testCreateJwtGroup()
    const myHeader = testAuthHeader.createValue(myJwt.accessToken!)
    http.post(
      testUrl,
      testBody,
      {
        headers: new HttpHeaders().set(testAuthHeader.name, myHeader)
      }
    ).subscribe()
    tick()
    const req = controller.expectOne(testUrl)
    expect(req.request.headers.get(testAuthHeader.name)).toEqual(myHeader)
    expect(jwtService.freshJwt).not.toHaveBeenCalled()
  }))
  it('should handle concurrent requests', fakeAsync(() => {
    jwtService.freshJwt.and.returnValue(of(jwt))
    const request = http.post(
      testUrl,
      testBody,
    )
    zip(
      request,
      request
    ).subscribe()
    tick()
    const reqs = controller.match(testUrl)
    reqs.forEach(req => {
      expect(req.request.body).toEqual(testBody)
    })
    expect(jwtService.freshJwt).toHaveBeenCalledTimes(2)
  }))
  it('should throw on report progress', (done) => {
    http.post(
      testUrl,
      testBody,
      {
        reportProgress: true
      }
    ).subscribe({
      next: () => done.fail('request expected to error'),
      error: e => {
        expect(e).toBeInstanceOf(JwtInterceptorDropsReportProgress)
        done()
      }
    })
  })
})
