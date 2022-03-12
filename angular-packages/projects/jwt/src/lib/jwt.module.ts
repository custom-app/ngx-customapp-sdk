import {ModuleWithProviders, NgModule} from '@angular/core';
import {JwtService} from './services/jwt.service';
import {JwtInfo} from './models/jwt-info';
import {JwtGroup} from './models/jwt-group';
import {AUTH_CONFIG} from './constants/di-token';
import {AuthConfig} from './models/auth-config';
import {JwtApi} from './models/jwt-api';
import {NoFreshJwtListener} from './models/no-fresh-jwt-listener';


@NgModule({
  declarations: [],
  imports: [],
  exports: []
})
export class JwtModule {
  static forRoot<JwtInfoType extends JwtInfo,
    JwtGroupType extends JwtGroup<JwtInfoType>,
    Credentials,
    UserId,
    AuthResponse>(
    config: AuthConfig<JwtInfoType, JwtGroupType, Credentials, UserId, AuthResponse>
  ): ModuleWithProviders<JwtModule> {
    return {
      ngModule: JwtModule,
      providers: [
        {
          provide: AUTH_CONFIG,
          useValue: config,
        },
        {
          provide: JwtApi,
          useExisting: config.jwtApi,
        },
        {
          provide: NoFreshJwtListener,
          useExisting: config.noFreshJwt,
        },
        JwtService,
      ]
    }
  }
}
