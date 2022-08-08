import {HttpContextToken} from '@angular/common/http';

/**
 * Used to disable setting version header.
 */
export const disableVersionInterception = new HttpContextToken<boolean>(() => false);
