import {Inject, Injectable} from '@angular/core';
import {Actions, createEffect, ofType} from '@ngrx/effects';
import {JWT_ACTIONS, JwtActions} from 'ngx-customapp-jwt';
import {ErrorsService} from 'ngx-customapp-errors'
import {catchError, map, mergeMap, of, tap} from 'rxjs';
import {WebSocketsOwnerService} from '../services/web-sockets-owner.service';
import {
  closeSockets,
  closeSocketsFinished,
  initSockets,
  initSocketsErrored,
  initSocketsSucceed, loginAgainAndInitSocketsErrored,
  loginAgainAndInitSocketsSucceed,
  loginAndInitSocketsErrored,
  loginAndInitSocketsSucceed, loginAsAndInitSocketsErrored,
  loginAsAndInitSocketsSucceed
} from './sockets.actions';


@Injectable()
export class SocketsEffects {


  constructor(
    private actions$: Actions,
    @Inject(JWT_ACTIONS) private a: JwtActions<any, any, any>,
    private sockets: WebSocketsOwnerService<any, any, any, any, any, any, any>,
    private errorsService: ErrorsService
  ) {
  }

  openOnLogin$ = createEffect(() => this.actions$.pipe(
    ofType(this.a.loginSucceed, this.a.loginAgainSucceed),
    mergeMap(() => of(initSockets()))
  ))

  initSockets$ = createEffect(() => this.actions$.pipe(
    ofType(initSockets),
    tap((action) => console.log('init sockets effect', action)),
    mergeMap(() => this.sockets
      .init()
      .pipe(
        map(() => initSocketsSucceed()),
        catchError(this.errorsService.reportError),
        catchError(this.errorsService.toUserError),
        catchError(error => of(initSocketsErrored({error})))
      )),
  ))

  // make initSockets and login atomic
  resultLoginAndInitSockets$ = createEffect(() => this.actions$.pipe(
    ofType(this.a.login, this.a.loginAgain, this.a.loginAs),
    mergeMap((loginAction) => this.actions$.pipe(
      ofType(initSocketsSucceed, initSocketsErrored, this.a.loginErrored, this.a.loginAgainErrored, this.a.loginAsErrored),
      mergeMap(action => {
        if (action.type === initSocketsSucceed.type) {
          if (loginAction.type === this.a.login.type) {
            return of(
              loginAndInitSocketsSucceed()
            )
          } else if (loginAction.type === this.a.loginAgainSucceed.type) {
            return of(
              loginAgainAndInitSocketsSucceed()
            )
          } else {
            // loginAction.type === this.loginAsSucceed.type
            return of(
              loginAsAndInitSocketsSucceed()
            )
          }
        } else {
          // action is one of the
          // initSocketsErrored, this.a.loginErrored, this.a.loginAgainErrored, this.a.loginAsErrored,
          // but typescript does not understand it
          const error = (action as any).error
          if (loginAction.type === this.a.login.type) {
            return of(
              loginAndInitSocketsErrored({error})
            )
          } else if (loginAction.type === this.a.loginAgainSucceed.type) {
            return of(
              loginAgainAndInitSocketsErrored({error})
            )
          } else {
            // loginAction.type === this.loginAsSucceed.type
            return of(
              loginAsAndInitSocketsErrored({error})
            )
          }
        }
      })
    ))
  ))

  closeSockets$ = createEffect(() => this.actions$.pipe(
    ofType(closeSockets),
    mergeMap(() =>
      this.sockets
        .closeAll()
        .pipe(
          map(() => closeSocketsFinished()),
          catchError(() => of(closeSocketsFinished()))
        )
    ),
  ))

  closeOnLogout$ = createEffect(() => this.actions$.pipe(
    ofType(this.a.logoutSucceed),
    mergeMap(() => of(closeSockets()))
  ))

  closeOnLoginAs$ = createEffect(() => this.actions$.pipe(
    ofType(this.a.loginAsSucceed),
    mergeMap(() => of(closeSockets()))
  ))

  reOpenOnLoginAs$ = createEffect(() => this.actions$.pipe(
    ofType(this.a.loginAsSucceed),
    mergeMap(() => this.actions$.pipe(
      ofType(closeSocketsFinished),
      mergeMap(() => of(initSockets()))
    )),
  ))

}
