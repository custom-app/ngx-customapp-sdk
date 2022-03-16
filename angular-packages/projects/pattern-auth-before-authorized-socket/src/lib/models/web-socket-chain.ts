import {CommonWebSocketConfig} from './common-web-socket-config';
import {WebSocketChainLink} from './web-socket-chain-link';

export interface WebSocketChain<RequestType, ResponseType, UnderlyingDataType> {
  commonConfig: CommonWebSocketConfig<RequestType, ResponseType, UnderlyingDataType>,
  chain: WebSocketChainLink<RequestType, ResponseType>[]
}
