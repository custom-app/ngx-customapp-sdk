/**
 * Install
 * ```sh
 * yarn add customapp-rxjs-websocket
 * ```
 *
 * The documentation is not complete, but main points are stated here {@link WebSocketControllerConfig}
 * @module customapp-rxjs-websocket
 */


export {
  WebSocketController,
  defaultRequestTimeout,
  defaultReconnectInterval
} from './web-socket-controller'

export {
  defaultWebSocketBufferOverflow,
  defaultWebSocketMessageBufferSize
} from './web-socket-message-buffer'

export {makeWsUrl} from './utils/url'

export {BufferOverflowStrategy} from './models/buffer-overflow-strategy'
export {ReconnectState} from './models/reconnect-state'
export {WebSocketControllerConfig} from './models/websocket-controller-config'
export {WebSocketControllerState} from './models/websocket-controller-state'
export {WebSocketOpenOptions} from './models/websocket-open-options'
export {WebSocketSendOptions} from './models/websocket-send-options'
