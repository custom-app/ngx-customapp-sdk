import {Injectable} from '@angular/core';
import {Actions, concatLatestFrom, createEffect, ofType} from '@ngrx/effects';
import {Store} from '@ngrx/store'
import {JwtActions} from './jwt.actions';
import {catchError, map, mergeMap, of, throwError} from 'rxjs';
import {JwtService} from '../services/jwt.service'
import {AuthConfig} from '../models/auth-config';
import {JwtSelectors} from './jwt.selectors';
import {AppRootStateBase} from './reducers';
import {LoginAsMethodUnimplemented} from '../errors';


@Injectable()
export class JwtEffects<Credentials, UserId, AuthResponse, UserInfo> {

  constructor(
    private actions$: Actions,
    private jwtService: JwtService<Credentials, UserId, AuthResponse, UserInfo>,
    private config: AuthConfig<Credentials, UserId, AuthResponse, UserInfo>,
    private store: Store<AppRootStateBase<UserInfo>>,
    private a: JwtActions<Credentials, UserId, AuthResponse, UserInfo>,
    private s: JwtSelectors<UserInfo>,
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
