import {Inject, Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree} from '@angular/router';
import {catchError, map, mergeMap, Observable, of} from 'rxjs';
import {JWT_ACTIONS, JWT_CONFIG, JWT_SELECTORS} from '../constants/di-token';
import {JwtConfig} from '../models/jwt-config';
import {JwtService} from '../services/jwt.service';
import {Actions} from '@ngrx/effects';
import {JwtActions} from '../store/jwt.actions';
import {Store} from '@ngrx/store';
import {JwtAppRootStateBase} from '../models/jwt-root-state-base';
import {JwtSelectors} from '../store/jwt.selectors';


@Injectable({
  providedIn: 'root'
})
export class JwtGuard<Credentials,
  AuthResponse,
  UserInfo> implements CanActivate {

  constructor(
    @Inject(JWT_CONFIG) private config: JwtConfig<Credentials, AuthResponse, UserInfo>,
    @Inject(JWT_ACTIONS) private a: JwtActions<Credentials, AuthResponse, UserInfo>,
    @Inject(JWT_SELECTORS) private s: JwtSelectors<UserInfo>,
    private jwtService: JwtService<Credentials, AuthResponse, UserInfo>,
    private actions$: Actions,
    private store: Store<JwtAppRootStateBase<UserInfo>>,
  ) {
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
                .freshJwt()
                .pipe(
                  mergeMap(jwt => {
                    const accessJwt = jwt?.accessToken
                    const jwtToCredentials = this.config.jwtGuard?.jwtToCredentials
                    if (accessJwt && jwtToCredentials) {
                      const credentials = jwtToCredentials(accessJwt)
                      return this.jwtService
                        .login(credentials)
                        .pipe(
                          map(() => true),
                          catchError(() => of(false))
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
