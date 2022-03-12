import {HttpInterceptor} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {AuthConfig} from '../models/auth-config';
import {JwtInfo} from '../models/jwt-info';
import {JwtGroup} from '../models/jwt-group';

@Injectable()
export class AuthInterceptor<JwtInfoType extends JwtInfo,
  JwtGroupType extends JwtGroup<JwtInfoType>,
  Credentials,
  UserId,
  AuthResponse> implements HttpInterceptor {
  constructor(
    private config: AuthConfig<JwtInfoType, JwtGroupType, Credentials, UserId, AuthResponse>
  ) {
    super(props);
  }

}
