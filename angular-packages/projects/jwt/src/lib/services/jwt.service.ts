import {Injectable} from '@angular/core';
import {JwtApi} from '../models/jwt-api';
import {JwtInfo} from '../models/jwt-info';
import {JwtGroup} from '../models/jwt-group';
import {Observable, Subject, Subscription, tap} from 'rxjs';
import {AuthConfig} from '../models/auth-config';
import {isJwtExpired} from '../utils';
import {NoFreshJwtListener} from '../models/no-fresh-jwt-listener';
import {defaultJwtStorageKey} from '../constants/jwt-storage-key';

@Injectable()
export class JwtService<JwtInfoType extends JwtInfo,
  JwtGroupType extends JwtGroup<JwtInfoType>,
  Credentials,
  UserId,
  AuthResponse> {

  private _jwt?: JwtGroupType
  private _refresh?: Subscription
  private _waitingForRefresh: ((jwt: JwtGroupType) => void)[] = []

  constructor(
    private jwtApi: JwtApi<JwtInfoType, JwtGroupType, Credentials, UserId, AuthResponse>,
    private config: AuthConfig<JwtInfoType, JwtGroupType, Credentials, UserId, AuthResponse>,
    private noFreshJwtListener: NoFreshJwtListener,
  ) {
    this._loadJwt()
  }

  private get _storageKey(): string {
    return this.config.jwtStorageKey || defaultJwtStorageKey
  }

  private _setJwt(jwt: JwtGroupType): void {
    this._jwt = jwt
    localStorage.setItem(this._storageKey, JSON.stringify(jwt))
  }

  private _deleteJwt(): void {
    this._jwt = undefined
    localStorage.removeItem(this._storageKey)
  }

  private _loadJwt(): void {
    const jwtString = localStorage.getItem(this._storageKey)
    if (jwtString) {
      try {
        this._jwt = JSON.parse(jwtString)
      } catch (e) {
        this._jwt = undefined
      }
    } else {
      this._jwt = undefined
    }
  }

  private _pipeAuthResponse(request: Observable<AuthResponse>): Observable<AuthResponse> {
    return request
      .pipe(
        tap(authResponse => {
          const jwt = this.config.authResponseToJwt(authResponse)
          this._setJwt(jwt)
        })
      )
  }

  /**
   * Readonly access to the JWT. Probably you should use {@link withFreshJwt}.
   */
  get jwt(): JwtGroupType | undefined {
    return this._jwt
  }

  /**
   * Makes a call to the {@link JwtApi.login}, but handles the jwt in response.
   */
  login(credentials: Credentials): Observable<AuthResponse> {
    return this._pipeAuthResponse(
      this.jwtApi.login(credentials)
    )

  }

  /**
   * Makes a call to the {@link JwtApi.loginAs}, but handles the jwt in response.
   */
  loginAs(userId: UserId, accessToken: JwtInfoType): Observable<AuthResponse> {
    return this._pipeAuthResponse(
      this.jwtApi.loginAs(userId, accessToken)
    )
  }

  /**
   * Refreshes the tokens if needed and calls the callback, when the tokens refreshed successfully.
   * If the tokens are not refreshable, the callback is called with expired JWT and
   * the {@link AuthConfig.noFreshJwt} is also called
   *
   * If you want the callback to be called only with fresh tokens, pass `true` as the second parameter.
   *
   * @param callback The function to be called after JWT were refreshed.
   * @param callWithFreshOnly If true, the callback will not be called when JWT are not refreshable.
   */
  withFreshJwt(callback: (jwt?: JwtGroupType) => void, callWithFreshOnly?: boolean): void {
    const jwt = this._jwt
    if (!jwt || isJwtExpired(jwt.refreshToken)) {
      this.noFreshJwtListener.noFreshJwt()
      if (!callWithFreshOnly) {
        callback(jwt)
      }
      return
    }
    if (isJwtExpired(jwt.accessToken)) {
      this._waitingForRefresh.push(callback)
      if (!this._refresh) {
        this._refresh = this
          .jwtApi
          .refresh(jwt.refreshToken)
          .subscribe(freshJwt => {
            this._setJwt(freshJwt)
            this
              ._waitingForRefresh
              .forEach(fn => fn(freshJwt))
            this._waitingForRefresh = []
            this._refresh = undefined
          })
      }
    } else {
      callback(jwt)
    }
  }

  freshJwt(): Observable<JwtGroupType | undefined> {
    const subject = new Subject<JwtGroupType | undefined>()
    this.withFreshJwt(jwt => {
      subject.next(jwt)
    })
    return subject
  }

  /**
   * Makes a call to the {@link JwtApi.logout}, but handles the jwt in response.
   */
  logout(fromAllDevices?: boolean): Observable<void> {
    return this
      .jwtApi
      .logout(fromAllDevices)
      .pipe(
        tap(() => {
          this._deleteJwt()
        })
      )
  }

}
