import {Inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {mergeMap, Observable, of, take} from 'rxjs';
import {JWT_ACTIONS, JWT_CONFIG} from '../constants/di-token';
import {JwtConfig} from '../models/jwt-config';
import {JwtService} from '../services/jwt.service';
import {Actions, ofType} from '@ngrx/effects';
import {JwtActions} from '../store/jwt.actions';
import {Action, ActionCreator, Store} from '@ngrx/store';
import {JwtAppRootStateBase} from '../store/reducers';


@Injectable({
  providedIn: 'root'
})
export class JwtGuard<Credentials,
  AuthResponse,
  UserInfo> implements CanActivate {
  private readonly actionAppReady: ActionCreator<any>
  private readonly actionAppNotReady: ActionCreator<any>

  constructor(
    @Inject(JWT_CONFIG) private config: JwtConfig<Credentials, AuthResponse, UserInfo>,
    @Inject(JWT_ACTIONS) private a: JwtActions<Credentials, AuthResponse, UserInfo>,
    private jwtService: JwtService<Credentials, AuthResponse, UserInfo>,
    private actions$: Actions,
    private store: Store<JwtAppRootStateBase<UserInfo>>,
  ) {
    this.actionAppReady = this.config.jwtGuard?.actionAppReady || this.a.loginSucceed
    this.actionAppNotReady = this.config.jwtGuard?.actionAppNotReady || this.a.loginErrored
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.config.jwtGuard) {
      return this.jwtService
        .freshJwt()
        .pipe(
          mergeMap(jwt => {
            const accessJwt = jwt?.accessToken
            const jwtToCredentials = this.config.jwtGuard?.jwtToCredentials
            if (accessJwt && jwtToCredentials) {
              const credentials = jwtToCredentials(accessJwt)
              this.store.dispatch(this.a.login({credentials}))
              return this.actions$
                .pipe(
                  ofType(this.actionAppReady, this.actionAppNotReady),
                  take(1),
                  mergeMap(action => of(
                    (action as Action).type === this.actionAppReady.type
                  ))
                )
            } else {
              return of(false)
            }
          })
        )
    } else {
      return true
    }
  }

}
