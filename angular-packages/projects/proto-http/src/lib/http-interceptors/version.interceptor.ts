import {Inject, Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {disableVersionInterception} from '../constants/disable-version-interception';
import {PROTO_HTTP_CONFIG} from '../constants/di-token';
import {ProtoHttpConfig} from '../models/proto-http-config';

@Injectable()
export class VersionInterceptor implements HttpInterceptor {

  constructor(
    @Inject(PROTO_HTTP_CONFIG) private config: ProtoHttpConfig<any, any>
  ) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.context.get(disableVersionInterception)) {
      return next.handle(request);
    }
    const versionHeader = this.config.versionHeader
    // version header not configured
    if (!versionHeader) {
      return next.handle(request)
    }
    // do not override existing version header
    if (request.headers.get(versionHeader.name)) {
      return next.handle(request)
    }
    let headers = request.headers;
    headers = headers.set(versionHeader.name, versionHeader.value);
    return next.handle(
      request.clone({
        headers
      })
    );
  }
}
