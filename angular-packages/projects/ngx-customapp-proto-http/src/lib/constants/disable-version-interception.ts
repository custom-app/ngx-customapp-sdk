import {HttpContextToken} from '@angular/common/http';

export const disableVersionInterception = new HttpContextToken<boolean>(() => false);
