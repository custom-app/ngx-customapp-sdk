/**
 * Describes the reconnection behaviour.
 */
import {ReconnectState} from './reconnect-state';

export interface WebSocketOpenOptions {
  /**
   * If set, the socket will try to reconnect after being closed
   * In general, you want to set this, cos it is the main feature of the package.
   */
  autoReconnect?: {
    /**
     * To calculate amount of milliseconds between socket being closed and next try to open.
     * You may want to return a random delay every time, to prevent overloading
     * server after the one restarts.
     * If the function errors, the default is {@link defaultReconnectInterval}
     * @param reconnectState {@link ReconnectState}
     */
    interval: (reconnectState: ReconnectState) => number,
    /**
     * To determine if socket have to try to reconnect. If returns false,
     * socket is closed, until `open()` is called again.
     * If not passed, always tries to reconnect (same as if `() => true` is passed)
     * @param reconnectState {@link ReconnectState}
     */
    shouldReconnect?: (reconnectState: ReconnectState) => boolean,
  },
  /**
   * If you try to open an already opened socket, the error will be thrown by default.
   * This is cos it usually means, that there is some error in the code, that uses the WebSocketController.
   * WebSocketController itself is designed to handle reconnects, authorization and subscriptions.
   */
  doNotThrowWhenOpened?: boolean,
}
