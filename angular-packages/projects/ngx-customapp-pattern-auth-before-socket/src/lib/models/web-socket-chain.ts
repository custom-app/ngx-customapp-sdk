import {CommonWebSocketConfig} from './common-web-socket-config';
import {WebSocketChainLink} from './web-socket-chain-link';
import {WebSocketOpenOptions} from 'customapp-rxjs-websocket';

export interface WebSocketChain<RequestType, ResponseType, UnderlyingDataType extends string | ArrayBufferLike | Blob | ArrayBufferView, UserInfo> {
  /**
   * Fields of the `WebSocketControllerConfig` common for all sockets.
   */
  commonConfig: CommonWebSocketConfig<RequestType, ResponseType, UnderlyingDataType>,
  /**
   * Will be passed as argument to every `WebSocketController.open` method.
   *
   * Usually you want to enable reconnect.
   * ```typescript
   * commonOpenOptions: {
   *   autoReconnect: {
   *     interval: () => Math.floor(reopenDelayMin + Math.random() * reopenDelaySpan),
   *   }
   * },
   * ```
   */
  commonOpenOptions: WebSocketOpenOptions,
  /**
   * Sockets to be opened, when {@link WebSocketsOwnerService.init} is called.
   * Sockets from the first chain link are initialized (but not opened) in {@link WebSocketChainLink} constructor, so
   * they are available immediately. The sockets from consequent chain links are available after the observable,
   * returned by {@link WebSocketsOwnerService.init} have completed.
   */
  chain: WebSocketChainLink<RequestType, ResponseType, UserInfo>
}
