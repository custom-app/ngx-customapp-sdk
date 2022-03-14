import {InjectionToken} from '@angular/core';
import {JwtConfig} from '../models/jwt-config';

export const JWT_CONFIG = new InjectionToken<JwtConfig<any, any, any, any>>('jwtConfig')
