import {Inject, Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store'
import {JwtActions} from './jwt.actions';
import {catchError, map, mergeMap, of, throwError} from 'rxjs';
import {JwtService} from '../services/jwt.service'
import {JwtConfig} from '../models/jwt-config';
import {JwtSelectors} from './jwt.selectors';
import {JwtAppRootStateBase} from './reducers';
import {LoginAsMethodUnimplemented} from '../errors';
import {JWT_ACTIONS, JWT_CONFIG, JWT_SELECTORS} from '../constants/di-token';


@Injectable()
export class JwtEffects<Credentials, AuthResponse, UserInfo, UserId = number> {

  constructor(
    private actions$: Actions,
    private jwtService: JwtService<Credentials, AuthResponse, UserInfo, UserId>,
    @Inject(JWT_CONFIG) private config: JwtConfig<Credentials, AuthResponse, UserInfo, UserId>,
    private store: Store<JwtAppRootStateBase<UserInfo>>,
    @Inject(JWT_ACTIONS) private a: JwtActions<Credentials, AuthResponse, UserInfo, UserId>,
    @Inject(JWT_SELECTORS) private s: JwtSelectors<UserInfo>,
  ) {
  }

  login$ = createEffect(() => this.actions$.pipe(
    ofType(this.a.login),
    mergeMap(({credentials}) =>
      this.jwtService
        .login(credentials)
        .pipe(
          map(response => this.a.loginSucceed({response})),
          catchError(error => of(this.a.loginErrored({error})))
        )
    )
  ))

  loginAs$ = createEffect(() => this.actions$.pipe(
    ofType(this.a.loginAs),
    mergeMap(({userId}) =>
      this.jwtService
        .loginAs(userId)
        .pipe(
          map(response => this.a.loginAsSucceed({response})),
          catchError(error => of(this.a.loginAsErrored({error})))
        )
    )
  ))

  logout$ = createEffect(() => this.actions$.pipe(
    ofType(this.a.logout),
    mergeMap(({fromAllDevices}) =>
      this.jwtService
        .logout(fromAllDevices)
        .pipe(
          map(() => this.a.logoutSucceed()),
          catchError(error => of(this.a.logoutErrored({error})))
        )
    )
  ))

  stashUser$ = createEffect(() => this.actions$.pipe(
    ofType(this.a.loginAsSucceed),
    concatLatestFrom(() => this.store.select(this.s.selectJwtUser)),
    mergeMap(([{response}, currentUser]) => {
      const newUser = this.config.authResponseToUserInfo(response)
      if (!currentUser) {
        return throwError(() => new LoginAsMethodUnimplemented())
      }
      return of(
        this.a.stashUser({user: currentUser}),
        this.a.setUser({user: newUser})
      )
    })
  ))

  loginSetUser$ = createEffect(() => this.actions$.pipe(
    ofType(this.a.loginSucceed),
    mergeMap(({response}) => of(
      this.a.setUser({
        user: this.config.authResponseToUserInfo(response)
      })
    ))
  ))

  unstashUser$ = createEffect(() => this.actions$.pipe(
    ofType(this.a.logoutSucceed),
    concatLatestFrom(() => this.store.select(this.s.selectUserStash)),
    mergeMap(([, stash]) => {
      const user = stash[stash.length - 1]
      return of(
        this.a.setUser({user}),
        this.a.unstashUser()
      )
    })
  ))

}
