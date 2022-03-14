import {JwtInfo} from './models/jwt-info';
import {JwtGroup} from './models/jwt-group';
import {JwtConfig} from './models/jwt-config';
import {ModuleWithProviders, Provider} from '@angular/core';
import {JwtModule} from './jwt.module';
import {JwtApi} from './models/jwt-api';
import {NoFreshJwtListener} from './models/no-fresh-jwt-listener';
import {JwtService} from './services/jwt.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {JwtInterceptor} from './http-interceptor/jwt.interceptor';
import {ActionReducerMap, createReducer, on, Store} from '@ngrx/store'
import {AppRootStateBase, JwtRootState} from './store/reducers';
import {jwtActions, JwtActions} from './store/jwt.actions';
import {jwtSelectors, JwtSelectors} from './store/jwt.selectors';
import {JwtEffects} from './store/jwt.effects';
import {Actions} from '@ngrx/effects'
import * as fromUser from './store/reducers/user.reducer'
import * as fromLoginInProcess from './store/reducers/login-in-process.reducer'
import * as fromLogoutInProcess from './store/reducers/logout-in-process.reducer'
import * as fromLoginAsInProcess from './store/reducers/login-as-in-process.reducer'
import * as fromUserStash from './store/reducers/user-stash.reducer'
import {JWT_CONFIG} from './constants/di-token';


export class JwtAdapter<JwtInfoType extends JwtInfo,
  JwtGroupType extends JwtGroup<JwtInfoType>,
  Credentials,
  UserId,
  AuthResponse,
  UserInfo> {
  private readonly _actions: JwtActions<Credentials, UserId, AuthResponse, UserInfo>
  private readonly _selectors: JwtSelectors<UserInfo>

  constructor(
    private config: JwtConfig<Credentials, UserId, AuthResponse, UserInfo>
  ) {
    this._actions = jwtActions<Credentials, UserId, AuthResponse, UserInfo>()
    this._selectors = jwtSelectors<UserInfo>()
  }

  forRoot(): ModuleWithProviders<JwtModule> {
    return {
      ngModule: JwtModule,
      providers: [
        {
          provide: JWT_CONFIG,
          useValue: this.config,
        },
        {
          provide: JwtApi,
          useExisting: this.config.jwtApi,
        },
        {
          provide: NoFreshJwtListener,
          useExisting: this.config.noFreshJwt,
        },
        JwtService,
      ]
    }
  }

  interceptorProvider(): Provider {
    return {
      provide: HTTP_INTERCEPTORS,
      useClass: JwtInterceptor,
      multi: true,
    }
  }

  effectsProvider(): Provider {
    return {
      provide: JwtEffects,
      useFactory: (
        actions$: Actions,
        jwtService: JwtService<Credentials, UserId, AuthResponse, UserInfo>,
        config: JwtConfig<Credentials, UserId, AuthResponse, UserInfo>,
        store: Store<AppRootStateBase<UserInfo>>
      ) =>
        new JwtEffects(actions$, jwtService, config, store, this.actions(), this.selectors()),
      deps: [Actions, JwtService, JWT_CONFIG, Store],
    }
  }

  actions(): JwtActions<Credentials, UserId, AuthResponse, UserInfo> {
    return this._actions
  }

  selectors(): JwtSelectors<UserInfo> {
    return this._selectors
  }

  // Reducers rely on actions, that are created inside the adapter,
  // so it's better to create them here
  private _userReducer() {
    type State = fromUser.State<UserInfo>
    const initialState: State = undefined
    const {setUser} = this.actions()
    return createReducer<State>(
      initialState as State,
      // on() function typings break when working with generic types, so I'm using ts-ignore and
      // explicitly declare argument and return types of the reducer function
      // @ts-ignore
      on(setUser, (state: State, {user}): State => {
        return user
      })
    );
  }

  private _loginInProcessReducer() {
    type State = fromLoginInProcess.State
    const initialState: State = false
    const {login, loginSucceed, loginErrored} = this.actions()
    return createReducer<State>(
      initialState,
      on(login, () => true),
      on(loginSucceed, loginErrored, () => false)
    );
  }

  private _loginAsInProcessReducer() {
    type State = fromLoginAsInProcess.State
    const initialState: State = false
    const {loginAs, loginAsSucceed, loginAsErrored} = this.actions()
    return createReducer<State>(
      initialState,
      on(loginAs, () => true),
      on(loginAsSucceed, loginAsErrored, () => false)
    );
  }

  private _logoutInProcessReducer() {
    type State = fromLogoutInProcess.State
    const initialState: State = false
    const {logout, logoutSucceed, logoutErrored} = this.actions()
    return createReducer<State>(
      initialState,
      on(logout, () => true),
      on(logoutSucceed, logoutErrored, () => false)
    );
  }

  private _userStashReducer() {
    type State = fromUserStash.State<UserInfo>
    const initialState: State = []
    const {stashUser, unstashUser} = this.actions()
    return createReducer<State>(
      initialState,
      // @ts-ignore
      on(stashUser, (state: State, {user}: UserInfo): State => {
        return [...state, user]
      }),
      // @ts-ignore
      on(unstashUser, (state: State): State => {
        // works normal on zero-length arrays
        return state.slice(0, state.length - 1)
      })
    );
  }

  reducers(): ActionReducerMap<JwtRootState<UserInfo>> {
    return {
      [fromUser.userFeatureKey]: this._userReducer(),
      [fromLoginInProcess.loginInProcessFeatureKey]: this._loginInProcessReducer(),
      [fromLoginAsInProcess.loginAsInProcessFeatureKey]: this._loginAsInProcessReducer(),
      [fromLogoutInProcess.logoutInProcessFeatureKey]: this._logoutInProcessReducer(),
      [fromUserStash.userStashFeatureKey]: this._userStashReducer(),
    }
  }

}
