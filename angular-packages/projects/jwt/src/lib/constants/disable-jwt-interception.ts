/**
 * The HttpContext token to disable the {@link JwtInterceptor}
 *
 * Example usage:
 *
 * ```typescript
 * this.http.post(
 *  tokenRefreshEndpoint,
 *  null,
 *  {
 *    context: new HttpContext().set(disableJwtInterception, true)
 *  }
 * )
 * ```
 */
import {HttpContextToken} from '@angular/common/http';

export const disableJwtInterception = new HttpContextToken<boolean>(() => false);
