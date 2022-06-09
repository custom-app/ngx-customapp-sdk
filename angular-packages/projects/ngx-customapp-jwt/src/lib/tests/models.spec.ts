import {JwtGroup} from '../models/jwt-group';
import {JwtInfo} from '../models/jwt-info';

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
