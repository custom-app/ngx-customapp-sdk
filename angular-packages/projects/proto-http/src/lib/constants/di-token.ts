import {InjectionToken} from '@angular/core';
import {ProtoHttpConfig} from '../models/proto-http-config';

export const PROTO_HTTP_CONFIG = new InjectionToken<ProtoHttpConfig<any, any, any>>('protoHttpConfig')
