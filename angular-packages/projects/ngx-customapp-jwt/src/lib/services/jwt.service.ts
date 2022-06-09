import {Inject, Injectable} from '@angular/core';
import {JwtApi} from '../models/jwt-api';
import {bindCallback, catchError, EMPTY, mergeMap, Observable, of, Subscription, tap} from 'rxjs';
import {JwtConfig} from '../models/jwt-config';
import {isJwtExpired, jwtNotNull} from '../utils';
import {NoFreshJwtListener} from '../models/no-fresh-jwt-listener';
import {defaultJwtStorageKey} from '../constants/jwt-storage-key';
import {JwtGroup} from '../models/jwt-group';
import {JwtInfo} from '../models/jwt-info';
import {
  LoginAsApiMethodDoesNotHaveJwtInAuthResponse,
  LoginAsCalledWhenUnauthorized,
  LoginAsMethodUnimplemented
} from '../errors';
import {JWT_CONFIG} from '../constants/di-token';

@Injectable({
  providedIn: 'root'
})
export class JwtService<Credentials,
  AuthResponse,
  UserInfo,
  UserId = number> {

  private _jwt?: JwtGroup<JwtInfo>
  // the stack to store master JWT when using loginAs
  private _jwtStash: JwtGroup<JwtInfo>[] = []
  private _refresh?: Subscription
  private _waitingForRefresh: ((jwt: JwtGroup<JwtInfo>) => void)[] = []

  constructor(
    private jwtApi: JwtApi<Credentials, AuthResponse, UserId>,
    @Inject(JWT_CONFIG) private config: JwtConfig<Credentials, AuthResponse, UserInfo, UserId>,
    private noFreshJwtListener: NoFreshJwtListener,
  ) {
    this._loadJwt()
  }

  private get _storageKey(): string {
    return this.config.jwtStorageKey || defaultJwtStorageKey
  }

  private _setJwt(jwt: JwtGroup<JwtInfo>): void {
    console.log('set jwt', jwt)
    this._jwt = jwt
    localStorage.setItem(this._storageKey, JSON.stringify(jwt))
  }

  private _deleteJwt(): void {
    this._jwt = undefined
    localStorage.removeItem(this._storageKey)
  }

  private _checkJwt(): boolean {
    return Boolean(this._jwt?.accessToken?.token && this._jwt.refreshToken?.token)
  }

  private _loadJwt(): void {
    const jwtString = localStorage.getItem(this._storageKey)
    if (jwtString) {
      try {
        this._jwt = JSON.parse(jwtString)
        if (!this._checkJwt()) {
          this._jwt = undefined
          localStorage.removeItem(this._storageKey)
        }
      } catch (e) {
        this._jwt = undefined
        localStorage.removeItem(this._storageKey)
      }
    } else {
      this._jwt = undefined
    }
  }

  // stash functions are not setting jwt into the local storage, so there are
  // JWTs of the first user after the page is reloaded.
  private _stashJwt(jwt: JwtGroup<JwtInfo>): void {
    if (this._jwt) {
      this._jwtStash.push(this._jwt)
    }
    this._jwt = jwt
  }

  private _unstashJwt(): void {
    this._jwt = this._jwtStash.pop()
  }

  /**
   * Readonly access to the JWT. Probably you should use {@link withFreshJwt}.
   */
  get jwt(): JwtGroup<JwtInfo> | undefined {
    return this._jwt
  }

  /**
   * Makes a call to the {@link JwtApi.login}, but handles the jwt in response.
   */
  login(credentials: Credentials): Observable<AuthResponse> {
    return this.jwtApi.login(credentials)
      .pipe(
        tap(authResponse => {
          const jwt = this.config.authResponseToJwt(authResponse)
          // authorization by token may not return fresh tokens
          if (jwt && jwtNotNull(jwt)) {
            this._setJwt(jwt)
          }
        }),
        catchError(error => {
          this._deleteJwt();
          throw error;
        })
      )
  }

  /**
   * Makes a call to the {@link JwtApi.loginAs}, but handles the jwt in response.
   * loginAs endpoint MUST have fresh JWT in auth response.
   */
  loginAs(userId: UserId): Observable<AuthResponse> {
    return this
      .freshJwt()
      .pipe(
        mergeMap(jwt => {
          if (!jwt?.accessToken) {
            throw new LoginAsCalledWhenUnauthorized()
          }
          if (!this.jwtApi.loginAs) {
            throw new LoginAsMethodUnimplemented()
          }
          return this
            .jwtApi
            .loginAs(jwt.accessToken, userId)
            .pipe(
              mergeMap(authResponse => {
                const jwt = this.config.authResponseToJwt(authResponse)
                if (jwt && jwtNotNull(jwt)) {
                  this._stashJwt(jwt)
                  return of(authResponse)
                } else {
                  throw new LoginAsApiMethodDoesNotHaveJwtInAuthResponse()
                }
              })
            )
        })
      )
  }

  /**
   * Refreshes the tokens if needed and calls the callback, when the tokens refreshed successfully.
   * If the tokens are not refreshable, the callback is called without any arguments and
   * the {@link JwtConfig.noFreshJwt} is also called
   *
   * If you want the callback to be called only with fresh tokens, pass `true` as the second parameter.
   *
   * @param callback The function to be called after JWT were refreshed.
   * @param callWithFreshOnly If true, the callback will not be called when JWT are not refreshable.
   */
  withFreshJwt(callback: (jwt?: JwtGroup<JwtInfo>) => void, callWithFreshOnly?: boolean): void {
    const jwt = this._jwt
    console.log('withFreshJwt', 'current jwt', jwt)
    if (!jwt?.refreshToken || isJwtExpired(jwt.refreshToken)) {
      console.log('withFreshJwt', 'refresh expired', jwt)
      this.noFreshJwtListener.noFreshJwt()
      if (!callWithFreshOnly) {
        callback()
      }
      return
    }
    if (!jwt.accessToken || isJwtExpired(jwt.accessToken)) {
      console.log('withFreshJwt', 'access expired', jwt)
      this._waitingForRefresh.push(callback)
      if (!this._refresh) {
        this._refresh = this
          .jwtApi
          .refresh(jwt.refreshToken)
          .subscribe({
            next: freshJwt => {
              this._setJwt(freshJwt)
              this
                ._waitingForRefresh
                .forEach(fn => fn(freshJwt))
              this._waitingForRefresh = []
              this._refresh = undefined
            },
            error: () => {
              this.noFreshJwtListener.noFreshJwt()
              if (!callWithFreshOnly) {
                callback()
              }
            }
          })
      }
    } else {
      callback(jwt)
    }
  }

  /**
   * Refreshes the tokens if needed and emits them as a value. If no fresh tokens available, will emit `undefined`.
   */
  freshJwt: () => Observable<JwtGroup<JwtInfo> | undefined> =
    bindCallback((callback: (jwt: JwtGroup<JwtInfo> | undefined) => void) => this.withFreshJwt(callback))

  /**
   * Logs out the current user. If there was loginAs call previously (perhaps multiple calls),
   * will restore the JWT of the user, that called loginAs.
   * Makes a call to the {@link JwtApi.logout}, but handles the jwt in response.
   * If the refresh token is expired or there is no tokens, will return immediately.
   */
  logout(fromAllDevices?: boolean): Observable<void> {
    return this
      // will refresh expired access token, cos logout need to invalidate refresh token too.
      .freshJwt()
      .pipe(
        mergeMap(jwt => {
          if (jwt?.accessToken) {
            return this
              .jwtApi
              .logout(jwt.accessToken, fromAllDevices)
              .pipe(
                tap(() => {
                  this._deleteJwt()
                  // will set the JWT of the previous user (if there have been) into this.jwt
                  this._unstashJwt()
                })
              )
          } else {
            return EMPTY
          }
        })
      )
  }

}
