import {JwtInfo} from './models/jwt-info';
import {JwtGroup} from './models/jwt-group';
import {AuthConfig} from './models/auth-config';
import {InjectionToken, ModuleWithProviders, Provider} from '@angular/core';
import {JwtModule} from './jwt.module';
import {JwtApi} from './models/jwt-api';
import {NoFreshJwtListener} from './models/no-fresh-jwt-listener';
import {JwtService} from './services/jwt.service';
import {HTTP_INTERCEPTORS} from '@angular/common/http';
import {AuthInterceptor} from './http-interceptor/auth.interceptor';

export class JwtAdapter<JwtInfoType extends JwtInfo,
  JwtGroupType extends JwtGroup<JwtInfoType>,
  Credentials,
  UserId,
  AuthResponse> {
  private _configDiToken = new InjectionToken<AuthConfig<Credentials, UserId, AuthResponse>>('authConfig')

  constructor(
    private config: AuthConfig<Credentials, UserId, AuthResponse>
  ) {
  }

  get configDiToken() {
    return this._configDiToken
  }

  module(): ModuleWithProviders<JwtModule> {
    return {
      ngModule: JwtModule,
      providers: [
        {
          provide: this.configDiToken,
          useValue: this.config,
        },
        {
          provide: JwtApi,
          useExisting: this.config.jwtApi,
        },
        {
          provide: NoFreshJwtListener,
          useExisting: this.config.noFreshJwt,
        },
        JwtService,
      ]
    }
  }

  interceptorProvider(): Provider {
    return {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }
  }

  actions() {

  }

  selectors() {

  }

}
