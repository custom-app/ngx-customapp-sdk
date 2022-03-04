import {ReconnectState, WebSocketControllerConfig, WebSocketControllerState} from './types';
import {Observable, Subject} from 'rxjs';


// TODO describe how to use and examples
export class WebSocketController<RequestType, ResponseType, UnderlyingDataType = string> {
  // passed as arg to functions in options.autoReconnect of the open() method
  private _reconnectState: ReconnectState = {
    openedCounter: 0,
    erroredCounter: 0,
    wasPrevOpenSuccessful: false,
  }
  private _socket?: WebSocket;
  // For all messages, received from the server
  private _messages$ = new Subject<ResponseType>()

  private _state: WebSocketControllerState = WebSocketControllerState.closed

  // To notify about every state
  private _pending$ = new Subject<void>()
  private _opened$ = new Subject<void>()
  // Emits an auth response, when config.authorize.isResponseSuccessful is set, void otherwise
  private _authorized$ = new Subject<ResponseType | void>()
  // Emits an auth subscribe responses, when config.subscribe.isResponseSuccessful is set, void otherwise
  private _subscribed$ = new Subject<ResponseType[] | void>()
  private _closing$ = new Subject<void>()
  private _closed$ = new Subject<void>()

  /**
   *  Observable with all messages, received by the socket. Subscription does not affect opening and closing socket.
   */
  get messages$(): Observable<ResponseType> {
    return this._messages$
  }

  /**
   * Reflects the state in the WebSocketController life cycle.
   * Default transitions are: closed -> pending -> opened -> authorized -> subscribed -> closing -> closed.
   */
  get state(): WebSocketControllerState {
    return this._state
  }

  /**
   * Fires whenever the transition closed->pending happens.
   */
  get pending$(): Observable<void> {
    return this._pending$
  }

  /**
   * Fires whenever the transition pending->opened happens.
   */
  get opened$(): Observable<void> {
    return this._opened$
  }

  /**
   * Fires whenever the transition opened->authorized happens.
   *
   * Emits an auth response, when config.authorize.isResponseSuccessful is set, void otherwise.
   */
  get authorized$(): Observable<ResponseType | void> {
    return this._authorized$
  }

  /**
   * Fires whenever the transition authorized->subscribed happens.
   *
   * Emits an auth subscribe responses, when config.subscribe.isResponseSuccessful is set, void otherwise.
   */
  get subscribed$(): Observable<ResponseType[] | void> {
    return this._subscribed$
  }

  /**
   * Fires whenever the transition subscribed->closing happens.
   */
  get closing$(): Observable<void> {
    return this._closing$
  }

  /**
   * Fires whenever the transition closing->closed happens.
   */
  get closed$(): Observable<void> {
    return this._closed$
  }

  constructor(
    private readonly config: WebSocketControllerConfig<RequestType, ResponseType, UnderlyingDataType>
  ) {
  }

  open(
    options: {
      /**
       * If set, the socket will try to reconnect after being closed
       * In general, you want to set this, cos it is the main feature of the package.
       */
      autoReconnect?: {
        /**
         * To calculate amount of milliseconds between socket being closed and next try to open.
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
        /**
         * To determine, if auth message have to be sent.
         * If not passed, auth message is always sent (same as if `() => true` is passed).
         * @param reconnectState {@link ReconnectState}
         */
        authorize?: (reconnectState: ReconnectState) => boolean,
        /**
         * To determine, if subscribe requests have to be sent.
         * If not passed, always tries to subscribe (same as if `() => true` is passed)
         * @param reconnectState {@link ReconnectState}
         */
        subscribe?: (reconnectState: ReconnectState) => boolean,
      }
    }
  ): void {
    // TODO: implement
  }

  close(): void {
    // TODO: implement
  }
}
