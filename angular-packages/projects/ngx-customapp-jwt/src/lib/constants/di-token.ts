import {InjectionToken} from '@angular/core';
import {JwtConfig} from '../models/jwt-config';
import {JwtActions} from '../store/jwt.actions';
import {JwtSelectors} from '../store/jwt.selectors';

export const JWT_CONFIG = new InjectionToken<JwtConfig<any, any, any, any>>('jwtConfig')

export const JWT_ACTIONS = new InjectionToken<JwtActions<any, any, any, any>>('jwtActions')

export const JWT_SELECTORS = new InjectionToken<JwtSelectors<any>>('jwtSelectors')
