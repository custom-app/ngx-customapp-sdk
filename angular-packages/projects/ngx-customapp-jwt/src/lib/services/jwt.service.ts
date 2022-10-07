import {Inject, Injectable} from '@angular/core';
import {JwtApi} from '../models/jwt-api';
import {bindCallback, catchError, mergeMap, Observable, of, Subscription, tap} from 'rxjs';
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
import {JwtRefreshCall} from '../models/jwt-refresh-call';

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
  private _waitingForRefresh: JwtRefreshCall[] = []

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
    this._jwt = jwt
    if (this.isMasterUser) {
      // JWT is saved only for master user, cos otherwise we need to preserve UserInfo stash,
      // which might be not serializable
      localStorage.setItem(this._storageKey, JSON.stringify(jwt))
    }
  }

  private _deleteJwt(): void {
    this._jwt = undefined
    if (this.isMasterUser) {
      localStorage.removeItem(this._storageKey)
    }
  }

  private _loadJwt(): void {
    const jwtString = localStorage.getItem(this._storageKey)
    if (jwtString) {
      try {
        this._jwt = JSON.parse(jwtString)
        if (!jwtNotNull(this._jwt)) {
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

  private _logoutSucceed(): void {
    this._deleteJwt()
    // will set the JWT of the previous user (if there have been) into this.jwt
    this._unstashJwt()
  }

  /**
   * Readonly access to the JWT. Probably you should use {@link withFreshJwt}.
   */
  get jwt(): JwtGroup<JwtInfo> | undefined {
    return this._jwt
  }

  /**
   * Whether current JWT was obtained through loginAs function.
   */
  get isMasterUser(): boolean {
    return this._jwtStash.length === 0
  }

  /**
   * Returns the difference between the number of successful loginAs calls and logout calls.
   */
  get loginAsDepth(): number {
    return this._jwtStash.length;
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
          // if login errored, that means either there were no jwt at the moment, the login called,
          // or the jwt were invalid all the time
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
      .freshJwt(false)
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
   * @param doNotCallNoFreshJwt If true, NoFreshJwtListener will not be notified about the JWT absence.
   */
  withFreshJwt(callback: (jwt?: JwtGroup<JwtInfo>) => void, callWithFreshOnly?: boolean, doNotCallNoFreshJwt?: boolean): void {
    const jwt = this._jwt
    this._waitingForRefresh.push({
      callback,
      callWithFreshOnly,
      doNotCallNoFreshJwt
    })
    const noFreshJwt = (reason: string) => {
      this._deleteJwt()
      this._waitingForRefresh
        .forEach(({callback, callWithFreshOnly, doNotCallNoFreshJwt}) => {
          if (!doNotCallNoFreshJwt) {
            this.noFreshJwtListener.noFreshJwt(`JwtService: tried to refresh tokens, but ${reason}`)
          }
          if (!callWithFreshOnly) {
            callback()
          }
        })
      this._waitingForRefresh = []
    }
    const freshJwt = (jwt: JwtGroup<JwtInfo>) => {
      this
        ._waitingForRefresh
        .forEach(({callback}) => {
          callback(jwt)
        })
      this._waitingForRefresh = []
    }
    if (!jwt?.refreshToken || isJwtExpired(jwt.refreshToken)) {
      noFreshJwt('no refresh token or refresh token expired')
      return
    }
    if (!jwt.accessToken || isJwtExpired(jwt.accessToken)) {
      if (!this._refresh) {
        this._refresh = this
          .jwtApi
          .refresh(jwt.refreshToken)
          .subscribe({
            next: refreshed => {
              this._refresh = undefined
              this._setJwt(refreshed)
              freshJwt(refreshed)
            },
            error: () => {
              this._refresh = undefined
              noFreshJwt('refresh token request errored')
            }
          })
      }
    } else {
      freshJwt(jwt)
    }
  }

  /**
   * Refreshes the tokens if needed and emits them as a value. If no fresh tokens available, will emit `undefined`.
   * The first subscription will call {@link withFreshJwt}, but later subscribers will receive the same value.
   * @param doNotCallNoFreshJwt In most cases is false. If true, NoFreshJwtListener will not be notified about the JWT absence.
   */
  freshJwt: (doNotCallNoFreshJwt: boolean) => Observable<JwtGroup<JwtInfo> | undefined> =
    bindCallback((doNotCallNoFreshJwt: boolean, callback: (jwt: JwtGroup<JwtInfo> | undefined) => void) => this.withFreshJwt(callback, false, doNotCallNoFreshJwt))

  /**
   * Logs out the current user. If there was loginAs call previously (perhaps multiple calls),
   * will restore the JWT of the user, that called loginAs.
   * Makes a call to the {@link JwtApi.logout}, but handles the jwt in response.
   * If the refresh token is expired or there is no tokens, will return immediately.
   */
  logout(fromAllDevices?: boolean): Observable<void> {
    return this
      // Will refresh expired access token, cos logout need to invalidate refresh token too.
      // It is expected that there are not fresh jwt after logout,
      // so side effects should not be produced
      .freshJwt(true)
      .pipe(
        mergeMap(jwt => {
          if (jwt?.accessToken) {
            return this
              .jwtApi
              .logout(jwt.accessToken, fromAllDevices)
              .pipe(
                tap(() => {
                  this._logoutSucceed()
                })
              )
          } else {
            this._logoutSucceed()
            return of(void 0)
          }
        })
      )
  }

}
