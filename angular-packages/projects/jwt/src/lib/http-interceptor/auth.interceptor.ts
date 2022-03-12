import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AuthConfig} from '../models/auth-config';
import {JwtInfo} from '../models/jwt-info';
import {JwtGroup} from '../models/jwt-group';
import {mergeMap, Observable} from 'rxjs';
import {disableAuthInterception} from '../constants/disable-auth-interception';
import {AuthInterceptorDropsReportProgress} from '../errors';
import {JwtService} from '../services/jwt.service';

/**
 * An HttpInterceptor, that adds a header containing fresh JWT access token to every http request.
 * The header is configured by the {@link AuthConfig.authHeader}.
 * If no fresh JWT is available (refresh token expired), will make the request with expired JWT.
 */

@Injectable()
export class AuthInterceptor<JwtInfoType extends JwtInfo,
  JwtGroupType extends JwtGroup<JwtInfoType>,
  Credentials,
  UserId,
  AuthResponse> implements HttpInterceptor {
  constructor(
    private config: AuthConfig<JwtInfoType, JwtGroupType, Credentials, UserId, AuthResponse>,
    private jwtService: JwtService<JwtInfoType, JwtGroupType, Credentials, UserId, AuthResponse>
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.context.get(disableAuthInterception)) {
      return next.handle(req);
    }
    // do not override existing header
    if (req.headers.has(this.config.authHeader.name)) {
      return next.handle(req);
    }
    if (req.reportProgress) {
      throw new AuthInterceptorDropsReportProgress()
    }
    return this.jwtService
      .freshJwt()
      .pipe(
        mergeMap(jwt => {
          if (jwt) {
            return next.handle(
              this.addAccessToken(req, jwt)
            )
          } else {
            return next.handle(req)
          }
        })
      )
  }

  addAccessToken(req: HttpRequest<any>, jwt: JwtGroupType): HttpRequest<any> {
    let headers: HttpHeaders = req.headers;
    headers = headers.set(
      this.config.authHeader.name,
      this.config.authHeader.createValue(jwt.accessToken)
    );
    return req.clone({
      headers
    });
  }

}
