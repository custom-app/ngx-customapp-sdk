import {HttpHeaders} from '@angular/common/http';

/**
 * Request options
 */
export interface RequestOptions {
  /**
   * The headers to be added to the request.
   */
  headers?: HttpHeaders,
  /**
   * Disable AuthInterceptor from ngx-customapp-jwt
   */
  disableAuth?: boolean,
  /**
   * Disable VersionInterceptor, provided by this package.
   */
  disableVersion?: boolean,
}
