import {ModuleWithProviders, NgModule} from '@angular/core';
import {PROTO_HTTP_CONFIG} from './constants/di-token';
import {ProtoHttpConfig} from './models/proto-http-config';


@NgModule({
  declarations: [],
  imports: [],
  exports: []
})
export class ProtoHttpModule {
  static forRoot<RequestType, ResponseType, ErrorResponseType>(
    config: ProtoHttpConfig<RequestType, ResponseType, ErrorResponseType>
  ): ModuleWithProviders<ProtoHttpModule> {
    return {
      ngModule: ProtoHttpModule,
      providers: [
        {
          provide: PROTO_HTTP_CONFIG,
          useValue: config,
        }
      ]
    }
  }
}
