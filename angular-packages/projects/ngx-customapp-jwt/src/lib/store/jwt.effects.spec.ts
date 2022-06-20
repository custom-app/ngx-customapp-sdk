import {fakeAsync, TestBed, tick} from '@angular/core/testing';
import {JwtServiceSpy, NoFreshJwtSpy, TestAuthResponse, TestCredentials, TestUserInfo} from '../tests/models.spec';
import createSpyObj = jasmine.createSpyObj;
import {Selector, Store, StoreModule} from '@ngrx/store';
import {
  asyncData,
  spyForAction,
  testAuthHeader,
  testAuthResponseToJwt,
  testAuthResponseToUserInfo, testCreateAuthResponse,
  testCreateCredentials, tickObservable
} from '../tests/helpers.spec';
import {JwtConfig} from '../models/jwt-config';
import {JWT_ACTIONS, JWT_CONFIG, JWT_SELECTORS} from '../constants/di-token';
import {JwtApi} from '../models/jwt-api';
import {NoFreshJwtListener} from '../models/no-fresh-jwt-listener';
import {JwtActions, jwtActions} from './jwt.actions';
import {JwtSelectors, jwtSelectors} from './jwt.selectors';
import {JwtService} from '../services/jwt.service';
import {JwtEffects} from './jwt.effects';
import * as fromJwtStore from './reducers';
import {Actions, EffectsModule} from '@ngrx/effects';
import {JwtAppRootStateBase} from '../models/jwt-root-state-base';
import {of, throwError} from 'rxjs';

// These are both unit-test and integrity tests
describe('JwtEffects', () => {
  let jwtService: JwtServiceSpy
  let noFreshJwt: NoFreshJwtSpy
  let jwtEffects: JwtEffects<TestCredentials, TestAuthResponse, TestUserInfo>
  let a: JwtActions<TestCredentials, TestAuthResponse, TestUserInfo>
  let s: JwtSelectors<TestUserInfo>
  // using store to dispatch actions and also check reducers.
  let store: Store<JwtAppRootStateBase<TestUserInfo>>
  let actions$: Actions // provided by the store
  function selectOnce<T>(selector: Selector<JwtAppRootStateBase<TestUserInfo>, T>): T {
    return tickObservable(store.select(selector))
  }

  let credentials: TestCredentials;
  let authResp: TestAuthResponse;

  const login = () => {
    jwtService.login.and.returnValue(of(authResp))
    store.dispatch(a.login({credentials}))
    tick()
  }

  const loginAgain = () => {
    jwtService.login.and.returnValue(of(authResp))
    store.dispatch(a.loginAgain({credentials}))
    tick()
  }

  const logout = () => {
    jwtService.logout.and.returnValue(of(void 0))
    store.dispatch(a.logout({fromAllDevices: true}))
    tick()
  }

  beforeEach(() => {
    credentials = testCreateCredentials()
    authResp = testCreateAuthResponse(true)
    initJwtModule()
  })

  const initJwtModule = () => {
    const jwtServiceSpy = createSpyObj(
      'JwtService',
      [
        'login',
        'loginAs',
        'freshJwt',
        'logout',
      ]
    )
    const noFreshJwtSpy = createSpyObj(
      'NoFreshJwtListener',
      [
        'noFreshJwt'
      ]
    )
    // is not used, just required by the
    const jwtApiSpy = createSpyObj(
      'JwtApi',
      [
        'login'
      ]
    )
    const jwtConfig: JwtConfig<TestCredentials, TestAuthResponse, TestUserInfo> = {
      authResponseToJwt: testAuthResponseToJwt,
      authResponseToUserInfo: testAuthResponseToUserInfo,
      authHeader: testAuthHeader,
      jwtApi: jwtApiSpy,
      noFreshJwt: noFreshJwtSpy,
    }
    TestBed.configureTestingModule({
      imports: [
        // root configuration is needed, but doesn't matter
        StoreModule.forRoot({}),
        EffectsModule.forRoot(),
        // same config as in jwt.module
        StoreModule.forFeature(fromJwtStore.jwtFeatureKey, fromJwtStore.reducers, {metaReducers: fromJwtStore.metaReducers}),
        EffectsModule.forFeature([
          JwtEffects
        ])
      ],
      providers: [
        {
          provide: JWT_CONFIG,
          useValue: jwtConfig,
        },
        {
          provide: NoFreshJwtListener,
          useValue: noFreshJwtSpy,
        },
        {
          provide: JWT_ACTIONS,
          useValue: jwtActions<TestCredentials, TestAuthResponse, TestUserInfo>(),
        },
        {
          provide: JWT_SELECTORS,
          useValue: jwtSelectors<TestUserInfo>()
        },
        {
          provide: JwtService,
          useValue: jwtServiceSpy,
        },
      ]
    })
    jwtService = TestBed.inject(JwtService) as JwtServiceSpy
    noFreshJwt = TestBed.inject(NoFreshJwtListener) as NoFreshJwtSpy
    jwtEffects = TestBed.inject(JwtEffects)
    store = TestBed.inject(Store)
    actions$ = TestBed.inject(Actions)

    a = TestBed.inject(JWT_ACTIONS)
    s = TestBed.inject(JWT_SELECTORS)
  }
  it('should be created', () => {
    expect(jwtEffects).toBeTruthy()
    expect(store).toBeTruthy()
    expect(actions$).toBeTruthy()
    expect(a).toBeTruthy()
    expect(s).toBeTruthy()
  })
  it('should login and logout', fakeAsync(() => {
    const spyLoginSucceed = spyForAction(a.loginSucceed, actions$)
    login()
    expect(spyLoginSucceed).toHaveBeenCalledOnceWith(a.loginSucceed({response: authResp}))
    const user = selectOnce(s.selectJwtUser)
    const loginInProcess = selectOnce(s.selectJwtLoginInProcess)
    expect(user).toEqual(testAuthResponseToUserInfo(authResp))
    expect(jwtService.login).toHaveBeenCalledOnceWith(credentials)
    expect(loginInProcess).toEqual(false)


    const spyLogoutSucceed = spyForAction(a.logoutSucceed, actions$)
    logout()
    expect(spyLogoutSucceed).toHaveBeenCalledOnceWith(a.logoutSucceed())
    expect(jwtService.logout).toHaveBeenCalledOnceWith(true)
    const user2 = selectOnce(s.selectJwtUser)
    expect(user2).toBeFalsy()
  }))
  it('should error login', fakeAsync(() => {
    const error = 'example unknown error'
    jwtService.login.and.returnValue(throwError(() => error))
    const spyLoginErrored = spyForAction(a.loginErrored, actions$)
    store.dispatch(a.login({credentials}))
    tick()
    expect(spyLoginErrored).toHaveBeenCalledOnceWith(a.loginErrored({error}))
    const user = selectOnce(s.selectJwtUser)
    expect(user).toBeFalsy()
    const loginInProcess = selectOnce(s.selectJwtLoginInProcess)
    expect(loginInProcess).toBeFalse()
  }))
  it('should error logout', fakeAsync(() => {
    login()

    const spyForLogoutErrored = spyForAction(a.logoutErrored, actions$)
    const error = 'example unknown error'
    jwtService.logout.and.returnValue(throwError(() => error))
    store.dispatch(a.logout({fromAllDevices: true}))
    tick()
    expect(spyForLogoutErrored).toHaveBeenCalledOnceWith(a.logoutErrored({error}))
    const user = selectOnce(s.selectJwtUser)
    expect(user).toEqual(testAuthResponseToUserInfo(authResp))
    const logoutInProcess = selectOnce(s.selectJwtLogoutInProcess)
    expect(logoutInProcess).toBeFalse()
  }))
  it('should handle concurrent logins', fakeAsync(() => {
    const spyForLoginSucceed = spyForAction(a.loginSucceed, actions$)
    jwtService.login.and.returnValue(asyncData(authResp))
    store.dispatch(a.login({credentials}))
    store.dispatch(a.login({credentials}))
    tick()

    expect(jwtService.login).toHaveBeenCalledTimes(1)
    expect(spyForLoginSucceed).toHaveBeenCalledOnceWith(a.loginSucceed({response: authResp}))
  }))
  it('should handle concurrent logouts', fakeAsync(() => {
    const spyForLogoutSucceed = spyForAction(a.logoutSucceed, actions$)
    jwtService.logout.and.returnValue(asyncData(void 0))
    store.dispatch(a.logout({}))
    store.dispatch(a.logout({}))
    tick()

    expect(jwtService.logout).toHaveBeenCalledTimes(1)
    expect(spyForLogoutSucceed).toHaveBeenCalledOnceWith(a.logoutSucceed())
  }))
  it('should login again and logout', fakeAsync(() => {
    loginAgain()
    expect(jwtService.login).toHaveBeenCalledWith(credentials)
    const user = selectOnce(s.selectJwtUser)
    expect(user).toEqual(testAuthResponseToUserInfo(authResp))
    const loginInProcess = selectOnce(s.selectJwtLoginAgainInProcess)
    expect(loginInProcess).toBeFalse()
    const loginAgainInProcess = selectOnce(s.selectJwtLoginAgainInProcess)
    expect(loginAgainInProcess).toBeFalse()

    logout()
    expect(jwtService.logout).toHaveBeenCalledTimes(1)
    const user2 = selectOnce(s.selectJwtUser)
    expect(user2).toBeFalsy()
    const logoutInProcess = selectOnce(s.selectJwtLogoutInProcess)
    expect(logoutInProcess).toBeFalse()
  }))
  it('should error login again', fakeAsync(() => {
    const error = 'unknown error'
    const spyForLoginAgainErrored = spyForAction(a.loginAgainErrored, actions$)
    const spyForLoginErrored = spyForAction(a.loginErrored, actions$)
    jwtService.login.and.returnValue(throwError(() => error))
    store.dispatch(a.loginAgain({credentials}))
    tick()

    expect(jwtService.login).toHaveBeenCalledOnceWith(credentials)
    expect(spyForLoginErrored).not.toHaveBeenCalled()
    expect(spyForLoginAgainErrored).toHaveBeenCalledOnceWith(a.loginAgainErrored({error}))
    const loginAgainInProcess = selectOnce(s.selectJwtLoginAgainInProcess)
    expect(loginAgainInProcess).toBeFalse()
  }))
  it('should handle concurrent login again', fakeAsync(() => {
    const spyForLoginAgainSucceed = spyForAction(a.loginAgainSucceed, actions$)
    jwtService.login.and.returnValue(asyncData(authResp))
    store.dispatch(a.loginAgain({credentials}))
    store.dispatch(a.loginAgain({credentials}))
    tick()

    expect(jwtService.login).toHaveBeenCalledOnceWith(credentials)
    expect(spyForLoginAgainSucceed).toHaveBeenCalledOnceWith(a.loginAgainSucceed({response: authResp}))
  }))
  xit('should loginAs multiple times and logout back to user', fakeAsync(() => {
    login()

    const user = selectOnce(s.selectJwtUser)
    expect(user).toEqual(testAuthResponseToUserInfo(authResp))

    let loginAsCount = 1;
    const checkLoginAs = (userPrev: TestUserInfo | undefined): TestUserInfo | undefined => {
      const authRespAs = testCreateAuthResponse(true)
      const userIdAs = 10 + loginAsCount++;
      jwtService.loginAs.and.returnValue(of(authRespAs))
      store.dispatch(a.loginAs({userId: userIdAs}))
      tick()
      expect(jwtService.loginAs).toHaveBeenCalledOnceWith(userIdAs)
      expect(spyForLoginAsSucceed).toHaveBeenCalledOnceWith(a.loginAsSucceed({response: authRespAs}))
      const userAs = selectOnce(s.selectJwtUser)
      expect(userAs).toEqual(testAuthResponseToUserInfo(authRespAs))
      expect(userAs).not.toEqual(userPrev)
      const loginAsInProcess = selectOnce(s.selectJwtLoginAsInProcess)
      expect(loginAsInProcess).toBeFalse()
      return userAs
    }

    // first loginAs
    const spyForLoginAsSucceed = spyForAction(a.loginAsSucceed, actions$)
    const user1 = checkLoginAs(user)

    // loginAs after loginAs

    spyForLoginAsSucceed.calls.reset()
    jwtService.loginAs.calls.reset()

    const checkLogout = (equalUser: TestUserInfo | undefined) => {
      store.dispatch(a.logout({}))
      tick()

      expect(jwtService.logout).toHaveBeenCalledTimes(1)
      const user3 = selectOnce(s.selectJwtUser)
      expect(user3).toEqual(equalUser) // user should be retrieved from the stash
      const logoutInProcess = selectOnce(s.selectJwtLogoutInProcess)
      expect(logoutInProcess).toBeFalse()
      expect(spyForLogoutSucceed).toHaveBeenCalledOnceWith(a.logoutSucceed())
    }

    // logout from the deepest user

    const spyForLogoutSucceed = spyForAction(a.logoutSucceed, actions$)
    jwtService.logout.and.returnValue(of(void 0))
    checkLogout(user1)

    // logout back to master user

    spyForLogoutSucceed.calls.reset()
    jwtService.logout.calls.reset()
    checkLogout(user)

    // logout from master user
    spyForLogoutSucceed.calls.reset()
    jwtService.logout.calls.reset()
    store.dispatch(a.logout({}))
    tick()
    expect(jwtService.logout).toHaveBeenCalledTimes(1)
    const user4 = selectOnce(s.selectJwtUser)
    expect(user4).toBeFalsy()
    const logoutInProcess = selectOnce(s.selectJwtLogoutInProcess)
    expect(logoutInProcess).toBeFalse()
    expect(spyForLogoutSucceed).toHaveBeenCalledOnceWith(a.logoutSucceed())

  }))
  it('should error loginAs when logging in from master user', fakeAsync(() => {
    login()

    const error = 'unknown error'
    const userId = 10
    const spyForLoginAsErrored = spyForAction(a.loginAsErrored, actions$)
    jwtService.loginAs.and.returnValue(throwError(() => error))
    store.dispatch(a.loginAs({userId}))
    tick()

    expect(spyForLoginAsErrored).toHaveBeenCalledOnceWith(a.loginAsErrored({error}))
    const user = selectOnce(s.selectJwtUser)
    expect(user).toEqual(testAuthResponseToUserInfo(authResp))
    const loginAsInProcess = selectOnce(s.selectJwtLoginAsInProcess)
    expect(loginAsInProcess).toBeFalse()
  }))
  xit('should error loginAs when logging in from slave user')
  xit('should error logout after loginAs')
})
