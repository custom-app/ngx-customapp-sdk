import {ModuleWithProviders, NgModule} from '@angular/core';
import {WebSocketChain} from './models/web-socket-chain';
import {WEB_SOCKET_CHAIN} from './constants/di-token';
import {StoreModule} from '@ngrx/store';
import * as fromSockets from './store/reducers'
import {EffectsModule} from '@ngrx/effects';
import {SocketsEffects} from './store/sockets.effects';


@NgModule({
  declarations: [],
  imports: [
    StoreModule.forFeature(fromSockets.socketsFeatureKey, fromSockets.reducers, {metaReducers: fromSockets.metaReducers}),
    EffectsModule.forFeature([SocketsEffects])
  ],
  exports: []
})
export class PatternAuthBeforeSocketModule {
  static forRoot<RequestType, ResponseType, UnderlyingDataType extends string | ArrayBufferLike | Blob | ArrayBufferView, UserInfo>(
    chain: WebSocketChain<RequestType, ResponseType, UnderlyingDataType, UserInfo>
  ): ModuleWithProviders<PatternAuthBeforeSocketModule> {
    return {
      ngModule: PatternAuthBeforeSocketModule,
      providers: [
        {
          provide: WEB_SOCKET_CHAIN,
          useValue: chain,
        }
      ]
    }
  }
}
