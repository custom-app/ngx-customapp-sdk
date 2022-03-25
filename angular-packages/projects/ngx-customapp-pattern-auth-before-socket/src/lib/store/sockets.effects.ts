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
  initSocketsSucceed
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
    ofType(this.a.loginSucceed),
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
