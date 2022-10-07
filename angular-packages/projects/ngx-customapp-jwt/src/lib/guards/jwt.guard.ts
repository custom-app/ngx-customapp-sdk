import {Inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {mergeMap, Observable, of, take, tap} from 'rxjs';
import {JWT_ACTIONS, JWT_CONFIG, JWT_SELECTORS} from '../constants/di-token';
import {JwtConfig} from '../models/jwt-config';
import {JwtService} from '../services/jwt.service';
import {Actions, ofType} from '@ngrx/effects';
import {JwtActions} from '../store/jwt.actions';
import {Action, ActionCreator, Store} from '@ngrx/store';
import {JwtAppRootStateBase} from '../models/jwt-root-state-base';
import {JwtSelectors} from '../store/jwt.selectors';
import {NoFreshJwtListener} from '../models/no-fresh-jwt-listener';


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
    @Inject(JWT_SELECTORS) private s: JwtSelectors<UserInfo>,
    private jwtService: JwtService<Credentials, AuthResponse, UserInfo>,
    private actions$: Actions,
    private store: Store<JwtAppRootStateBase<UserInfo>>,
    private noFreshJwtListener: NoFreshJwtListener,
  ) {
    this.actionAppReady = this.config.jwtGuard?.actionAppReady || this.a.loginAgainSucceed
    this.actionAppNotReady = this.config.jwtGuard?.actionAppNotReady || this.a.loginAgainErrored
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.config.jwtGuard) {
      return this.store
        .select(this.s.selectJwtUser)
        .pipe(
          mergeMap(userInfo => {
            if (userInfo) {
              // the user is logged in
              return of(true)
            } else {
              return this.jwtService
                .freshJwt(false)
                .pipe(
                  mergeMap(jwt => {
                    const accessJwt = jwt?.accessToken
                    const jwtToCredentials = this.config.jwtGuard?.jwtToCredentials
                    if (accessJwt && jwtToCredentials) {
                      const credentials = jwtToCredentials(accessJwt)
                      this.store.dispatch(this.a.loginAgain({credentials}))
                      return this.actions$
                        .pipe(
                          ofType(this.actionAppReady, this.actionAppNotReady),
                          take(1),
                          mergeMap(action => of(
                            (action as Action).type === this.actionAppReady.type
                          )),
                          tap(accessGranted => {
                            if (!accessGranted) {
                              this.noFreshJwtListener.noFreshJwt(
                                `JwtGuard: tried to loginAgain, but ended unsuccessful with action: ${this.actionAppReady.type}`
                              );
                            }
                          })
                        )
                    } else {
                      return of(false)
                    }
                  })
                )
            }
          })
        )
    } else {
      return true
    }
  }

}
