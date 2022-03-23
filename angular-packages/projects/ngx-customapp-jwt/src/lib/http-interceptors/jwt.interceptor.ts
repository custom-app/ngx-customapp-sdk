import {HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Inject, Injectable} from '@angular/core';
import {JwtConfig} from '../models/jwt-config';
import {JwtInfo} from '../models/jwt-info';
import {mergeMap, Observable} from 'rxjs';
import {disableJwtInterception} from '../constants/disable-jwt-interception';
import {JwtInterceptorDropsReportProgress} from '../errors';
import {JwtService} from '../services/jwt.service';
import {JWT_CONFIG} from '../constants/di-token';

/**
 * An HttpInterceptor, that adds a header containing fresh JWT access token to every http request.
 * The header is configured by the {@link JwtConfig.authHeader}.
 * If no fresh JWT is available (refresh token expired), will make the request with expired JWT.
 */

@Injectable()
export class JwtInterceptor<Credentials, AuthResponse, UserInfo, UserId = number> implements HttpInterceptor {
  constructor(
    @Inject(JWT_CONFIG) private config: JwtConfig<Credentials, AuthResponse, UserInfo, UserId>,
    private jwtService: JwtService<Credentials, AuthResponse, UserInfo, UserId>
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (req.context.get(disableJwtInterception)) {
      return next.handle(req);
    }
    // do not override existing header
    if (req.headers.has(this.config.authHeader.name)) {
      return next.handle(req);
    }
    if (req.reportProgress) {
      throw new JwtInterceptorDropsReportProgress()
    }
    return this.jwtService
      .freshJwt()
      .pipe(
        mergeMap(jwt => {
          if (jwt?.accessToken) {
            return next.handle(
              this.addAccessToken(req, jwt.accessToken)
            )
          } else {
            return next.handle(req)
          }
        })
      )
  }

  addAccessToken(req: HttpRequest<any>, accessJwt: JwtInfo): HttpRequest<any> {
    let headers: HttpHeaders = req.headers;
    headers = headers.set(
      this.config.authHeader.name,
      this.config.authHeader.createValue(accessJwt)
    );
    return req.clone({
      headers
    });
  }

}
