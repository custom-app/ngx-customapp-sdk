import {CommonWebSocketConfig} from './common-web-socket-config';
import {WebSocketChainLink} from './web-socket-chain-link';
import {WebSocketOpenOptions} from 'customapp-rxjs-websocket';

export interface WebSocketChain<RequestType, ResponseType, UnderlyingDataType extends string | ArrayBufferLike | Blob | ArrayBufferView, UserInfo> {
  commonConfig: CommonWebSocketConfig<RequestType, ResponseType, UnderlyingDataType>,
  commonOpenOptions: WebSocketOpenOptions,
  chain: WebSocketChainLink<RequestType, ResponseType, UserInfo>
}
