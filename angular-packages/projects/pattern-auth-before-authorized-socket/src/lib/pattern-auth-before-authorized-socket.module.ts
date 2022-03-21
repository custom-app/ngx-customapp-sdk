import {ModuleWithProviders, NgModule} from '@angular/core';
import {WebSocketChain} from './models/web-socket-chain';
import {WEB_SOCKET_CHAIN} from './constants/di-token';


@NgModule({
  declarations: [],
  imports: [],
  exports: []
})
export class PatternAuthBeforeAuthorizedSocketModule {
  static forRoot<RequestType, ResponseType, UnderlyingDataType extends string | ArrayBufferLike | Blob | ArrayBufferView, UserInfo>(
    chain: WebSocketChain<RequestType, ResponseType, UnderlyingDataType, UserInfo>
  ): ModuleWithProviders<PatternAuthBeforeAuthorizedSocketModule> {
    return {
      ngModule: PatternAuthBeforeAuthorizedSocketModule,
      providers: [
        {
          provide: WEB_SOCKET_CHAIN,
          useValue: chain,
        }
      ]
    }
  }
}
