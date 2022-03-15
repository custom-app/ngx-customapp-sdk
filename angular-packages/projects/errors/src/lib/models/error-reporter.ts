import {Observable} from 'rxjs';
import {ContextError} from './context-error';

/**
 * Should send the report to backend. Must not require authorization. Be aware to disable
 * auth interceptor, if you are using JwtInterceptor, provided by the ngx-customapp-jwt package
 */
export abstract class ErrorReporter {
  abstract report(error: ContextError): Observable<void>
}
