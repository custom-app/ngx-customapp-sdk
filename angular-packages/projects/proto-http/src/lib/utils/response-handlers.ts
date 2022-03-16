import {catchError, map, switchMap} from 'rxjs/operators';
import {HttpErrorResponse, HttpHeaders, HttpProgressEvent, HttpResponse} from '@angular/common/http';
import {from, mergeMap, Observable, of, pipe, throwError} from 'rxjs';
import {protobufHeader} from '../constants/proto-header';

export function handleBlobBody<ResponseType, ErrorResponseType>(
  body: Blob,
  deserializer: (response: ArrayBuffer) => ResponseType,
  getErrorFromResponse: (response: ResponseType) => ErrorResponseType | undefined,
): Observable<ResponseType> {
  return from(body.arrayBuffer())
    .pipe(
      map(deserializer),
      switchMap(response => {
        const err = getErrorFromResponse(response)
        if (err) {
          return throwError(err);
        } else {
          return of(response);
        }
      }),
    );
}

export function handleArrayBufferBody<ResponseType, ErrorResponseType>(
  body: ArrayBuffer,
  deserializer: (response: ArrayBuffer) => ResponseType,
  getErrorFromResponse: (response: ResponseType) => ErrorResponseType | undefined,
): Observable<ResponseType> {
  const response = deserializer(body);
  const err = getErrorFromResponse(response)
  if (err) {
    return throwError(err);
  } else {
    return of(response);
  }
}

function responseHandler<T, ResponseType, ErrorResponseType>(
  bodyHandler: (
    body: T,
    deserializer: (response: ArrayBuffer) => ResponseType,
    getErrorFromResponse: (response: ResponseType) => ErrorResponseType | undefined,
  ) => Observable<ResponseType>,
  headers: HttpHeaders,
  body: T | null,
  deserializer: (response: ArrayBuffer) => ResponseType,
  getErrorFromResponse: (response: ResponseType) => ErrorResponseType | undefined,
): Observable<ResponseType> {
  const type = headers.get(protobufHeader.name);
  if (type === protobufHeader.value) {
    if (body) {
      return bodyHandler(body, deserializer, getErrorFromResponse);
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
      Error(
        `expected to receiver ${protobufHeader.value} but got ${type}`
      )
    );
  }
}

export function createResponseHandlerPipe<T, ResponseType, ErrorResponseType>(
  bodyHandler: (
    body: T,
    deserializer: (response: ArrayBuffer) => ResponseType,
    getErrorFromResponse: (response: ResponseType) => ErrorResponseType | undefined,
  ) => Observable<ResponseType>,
  deserializer: (response: ArrayBuffer) => ResponseType,
  getErrorFromResponse: (response: ResponseType) => ErrorResponseType | undefined,
) {
  return pipe(
    mergeMap((response: HttpResponse<T> | HttpProgressEvent): Observable<ResponseType | HttpProgressEvent> => {
      if (response instanceof HttpResponse) {
        return responseHandler(bodyHandler, response.headers, response.body, deserializer, getErrorFromResponse);
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
        return responseHandler(bodyHandler, err.headers, err.error, deserializer, getErrorFromResponse);
      }
      // no handling for app level or network level errors
      return throwError(err);
    }),
  );
}

