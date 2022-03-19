import {InjectionToken} from '@angular/core';
import {WebSocketChain} from '../models/web-socket-chain';

export const WEB_SOCKET_CHAIN = new InjectionToken<WebSocketChain<any, any, any, any>>('webSocketChain')
