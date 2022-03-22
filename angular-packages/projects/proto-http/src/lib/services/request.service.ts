import {Inject, Injectable} from '@angular/core';
import {HttpClient, HttpContext, HttpHeaders, HttpResponse} from '@angular/common/http';
import {catchError, from, Observable, of, OperatorFunction, throwError} from 'rxjs';
import {ErrorsService} from 'ngx-customapp-errors';
import {ProtoHttpConfig} from '../models/proto-http-config';
import {PROTO_HTTP_CONFIG} from '../constants/di-token';
import {disableJwtInterception} from 'ngx-customapp-jwt';
import {protobufHeader} from '../constants/proto-header';
import {createResponseHandlerPipe, handleArrayBufferBody, handleBlobBody} from '../utils/response-handlers';
import {switchMap} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class RequestService<RequestType, ResponseType> {

  private readonly handleProtoBlobResponse: OperatorFunction<HttpResponse<Blob>, ResponseType>
  private readonly handleProtoArrayBufferResponse: OperatorFunction<HttpResponse<ArrayBuffer>, ResponseType>

  constructor(
    @Inject(PROTO_HTTP_CONFIG) private config: ProtoHttpConfig<RequestType, ResponseType>,
    private http: HttpClient,
    private errorsService: ErrorsService,
  ) {
    this.handleProtoBlobResponse = createResponseHandlerPipe(handleBlobBody, config.deserializer, config.isErrorResponse);
    this.handleProtoArrayBufferResponse = createResponseHandlerPipe(handleArrayBufferBody, config.deserializer, config.isErrorResponse)
  }

  private _requestBlob(endpoint: string, req?: RequestType, headers?: HttpHeaders, disableAuth?: boolean): Observable<HttpResponse<Blob>> {
    return this.http.post(
      endpoint,
      req ? this.config.serializer(req) : null,
      {
        headers: (headers || new HttpHeaders()).set(protobufHeader.name, protobufHeader.value),
        observe: 'response',
        responseType: 'blob',
        context: new HttpContext().set(disableJwtInterception, !!disableAuth)
      }
    )
  }

  private _requestArrayBuffer(endpoint: string, req?: RequestType, headers?: HttpHeaders, disableAuth?: boolean): Observable<HttpResponse<ArrayBuffer>> {
    return this.http.post(
      endpoint,
      req ? this.config.serializer(req) : null,
      {
        headers: (headers || new HttpHeaders()).set(protobufHeader.name, protobufHeader.value),
        observe: 'response',
        responseType: 'arraybuffer',
        context: new HttpContext().set(disableJwtInterception, !!disableAuth)
      }
    )
  }

  request(endpoint: string, req?: RequestType, headers?: HttpHeaders, disableAuth?: boolean): Observable<ResponseType> {
    return this._requestArrayBuffer(endpoint, req, headers, disableAuth)
      .pipe(
        this.handleProtoArrayBufferResponse,
        catchError(this.errorsService.reportError),
        catchError(this.errorsService.toUserError),
      )
  }

  requestFile(endpoint: string, headers?: HttpHeaders, req?: RequestType): Observable<File> {
    return this._requestBlob(endpoint, req).pipe(
      switchMap(response => {
        const disposition = response.headers.get('Content-Disposition')
        const type = response.headers.get('Content-Type')
        if (!response.body) {
          return throwError(() => 'null body response, expected file')
        }
        if (!type) {
          return throwError(() => 'null Content-Type header, expected file type')
        }
        if (type === 'application/x-protobuf') {
          // this means, that backend has returned an error, not a file.
          // transform blob into ResponseType and retrieve error from here.
          return from(response.body.arrayBuffer()).pipe(
            switchMap(buffer => throwError(() =>
                this.config.deserializer(buffer)
              )
            )
          )
        } else {
          const filename = disposition
            ? decodeURIComponent(escape(disposition.substring(disposition.lastIndexOf('filename=') + 9)))
            : 'file'
          return of(
            new File([response.body], filename, {type})
          )
        }
      }),
      catchError(this.errorsService.reportError),
      catchError(this.errorsService.toUserError),
    );
  }
}
