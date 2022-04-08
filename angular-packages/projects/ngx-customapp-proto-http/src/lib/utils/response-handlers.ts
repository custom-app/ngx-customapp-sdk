import {catchError, map, switchMap} from 'rxjs/operators';
import {HttpErrorResponse, HttpHeaders, HttpResponse} from '@angular/common/http';
import {from, mergeMap, Observable, of, pipe, throwError} from 'rxjs';
import {protobufHeader} from '../constants/proto-header';

export function handleBlobBody<ResponseType, ErrorResponseType>(
  body: Blob,
  deserializer: (response: ArrayBuffer) => ResponseType,
  isErrorResponse?: (response: ResponseType) => boolean,
): Observable<ResponseType> {
  return from(body.arrayBuffer())
    .pipe(
      map(deserializer),
      switchMap(response => {
        const isError = isErrorResponse && isErrorResponse(response)
        if (isError) {
          return throwError(response);
        } else {
          return of(response);
        }
      }),
    );
}

export function handleArrayBufferBody<ResponseType, ErrorResponseType>(
  body: ArrayBuffer,
  deserializer: (response: ArrayBuffer) => ResponseType,
  isErrorResponse?: (response: ResponseType) => boolean,
): Observable<ResponseType> {
  const response = deserializer(body);
  const isError = isErrorResponse && isErrorResponse(response)
  if (isError) {
    return throwError(response);
  } else {
    return of(response);
  }
}

function responseHandler<T, ResponseType>(
  bodyHandler: (
    body: T,
    deserializer: (response: ArrayBuffer) => ResponseType,
    isErrorResponse?: (response: ResponseType) => boolean,
  ) => Observable<ResponseType>,
  headers: HttpHeaders,
  body: T | null,
  deserializer: (response: ArrayBuffer) => ResponseType,
  isErrorResponse?: (response: ResponseType) => boolean,
): Observable<ResponseType> {
  const type = headers.get(protobufHeader.name);
  if (type === protobufHeader.value) {
    if (body) {
      return bodyHandler(body, deserializer, isErrorResponse);
    } else {
      // we don't use null messages
      return throwError(() =>
        new Error(
          `null response body, expected array buffer`
        )
      );
    }
  } else {
    // successful response should always have protobuf header.
    return throwError(() =>
     new Error(
        `expected to receiver ${protobufHeader.value} but got ${type}`
      )
    );
  }
}

export function createResponseHandlerPipe<ResponseType, IsPipeEvents extends boolean>(
  bodyHandler: (
    body: any, // Blob or ArrayBuffer, but cannot handle this through typescript
    deserializer: (response: ArrayBuffer) => ResponseType,
    isErrorResponse?: (response: ResponseType) => boolean,
  ) => Observable<ResponseType>,
  deserializer: (response: ArrayBuffer) => ResponseType,
  isErrorResponse?: (response: ResponseType) => boolean,
) {
  return pipe(
    // main case is (response: HttpRequest<T>) => Observable<ResponseType>,
    // but there are possible situation, when argument might be wider. For example, when reporting request progress.
    mergeMap((response: any): Observable<any> => {
      if (response instanceof HttpResponse) {
        return responseHandler(bodyHandler, response.headers, response.body, deserializer, isErrorResponse);
      } else {
        return of(response);
      }
    }),
    catchError(err => {
      if (
        err instanceof HttpErrorResponse &&
        // http errors have no protobuf header, cos they are thrown by the network, not the backend.
        err.headers.get(protobufHeader.name) === protobufHeader.value
      ) {
        // handle error response from backend
        return responseHandler(bodyHandler, err.headers, err.error, deserializer, isErrorResponse);
      }
      // no handling for app level or network level errors
      return throwError(err);
    }),
  );
}

