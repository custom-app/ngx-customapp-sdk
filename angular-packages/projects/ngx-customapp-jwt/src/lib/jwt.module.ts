import {ModuleWithProviders, NgModule} from '@angular/core';
import {JWT_ACTIONS, JWT_CONFIG, JWT_SELECTORS} from './constants/di-token';
import {JwtApi} from './models/jwt-api';
import {NoFreshJwtListener} from './models/no-fresh-jwt-listener';
import {jwtActions} from './store/jwt.actions';
import {jwtSelectors} from './store/jwt.selectors';
import {JwtConfig} from './models/jwt-config';
import {StoreModule} from '@ngrx/store';
import * as fromJwtStore from './store/reducers';
import {EffectsModule} from '@ngrx/effects';
import {JwtEffects} from './store/jwt.effects';


@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature(fromJwtStore.jwtFeatureKey, fromJwtStore.reducers, {metaReducers: fromJwtStore.metaReducers}),
    EffectsModule.forFeature([
      JwtEffects
    ])
  ],
  exports: []
})
export class JwtModule {
  static forRoot<Credentials,
    AuthResponse,
    UserInfo,
    UserId = number>(config: JwtConfig<Credentials, AuthResponse, UserInfo, UserId>): ModuleWithProviders<JwtModule> {
    return {
      ngModule: JwtModule,
      providers: [
        {
          provide: JWT_CONFIG,
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
        {
          provide: JWT_ACTIONS,
          useValue: jwtActions<Credentials, AuthResponse, UserInfo, UserId>(),
        },
        {
          provide: JWT_SELECTORS,
          useValue: jwtSelectors<UserInfo>()
        },
        // JwtService, JwtGuard are providedIn:'root'
      ]
    }
  }
}
