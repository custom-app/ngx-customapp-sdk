import {InjectionToken} from '@angular/core';
import {AuthConfig} from '../models/auth-config';

// token to inject auth config
export const AUTH_CONFIG = new InjectionToken<AuthConfig<any, any, any, any, any>>('authConfig')
