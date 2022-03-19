import {CommonWebSocketConfig} from './common-web-socket-config';
import {WebSocketChainLink} from './web-socket-chain-link';

export interface WebSocketChain<RequestType, ResponseType, UnderlyingDataType extends string | ArrayBufferLike | Blob | ArrayBufferView, UserInfo> {
  commonConfig: CommonWebSocketConfig<RequestType, ResponseType, UnderlyingDataType>,
  chain: WebSocketChainLink<RequestType, ResponseType, UserInfo>
}
