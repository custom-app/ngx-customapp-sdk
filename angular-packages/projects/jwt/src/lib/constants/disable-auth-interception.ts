/**
 * The HttpContext token to disable the {@link AuthInterceptor}
 *
 * Example usage:
 *
 * ```typescript
 * this.http.post(
 *  tokenRefreshEndpoint,
 *  null,
 *  {
 *    context: new HttpContext().set(disableAuthInterception, true)
 *  }
 * )
 * ```
 */
import {HttpContextToken} from '@angular/common/http';

export const disableAuthInterception = new HttpContextToken<boolean>(() => false);
