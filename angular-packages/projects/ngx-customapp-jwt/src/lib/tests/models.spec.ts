import {JwtGroup} from '../models/jwt-group';
import {JwtInfo} from '../models/jwt-info';
import {JwtApi} from '../models/jwt-api';
import {NoFreshJwtListener} from '../models/no-fresh-jwt-listener';
import SpyObj = jasmine.SpyObj;
import {JwtService} from '../services/jwt.service';

// all types prefixed with 'Test'

export interface TestUserInfo {
  userId: number
}

export interface TestCredentials {
  token: string,
}

export interface TestAuthResponse {
  user: TestUserInfo,
  jwt?: JwtGroup<JwtInfo>,
}

// Required<> needed fot jasmine.Spy types inference to work on optional methods
export type JwtApiSpy = SpyObj<Required<JwtApi<TestCredentials, TestAuthResponse>>>
export type NoFreshJwtSpy = SpyObj<NoFreshJwtListener>
export type JwtServiceSpy = SpyObj<JwtService<TestCredentials, TestAuthResponse, TestUserInfo>>
