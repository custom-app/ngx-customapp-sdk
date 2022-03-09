import {
  ReconnectState,
  WebSocketControllerConfig,
  WebSocketControllerState,
  WebSocketOpenOptions,
  WebSocketRequestOptions,
  WebSocketSendOptions
} from './types';
import {Observable, Subject} from 'rxjs';
import {WebSocketIsAlreadyOpened} from './errors';
import {WebSocketMessageBuffer} from './web-socket-message-buffer';

/**
 * Need this to prevent an overload.
 * The time between socket happening to be closed and the next try to open.
 */
export const defaultReconnectInterval = 10000;

// TODO describe how to use and examples
export class WebSocketController<RequestType,
  ResponseType,
  UnderlyingDataType extends string | ArrayBufferLike | Blob | ArrayBufferView> {

  constructor(
    private readonly _config: WebSocketControllerConfig<RequestType, ResponseType, UnderlyingDataType>
  ) {
    this._buffer = new WebSocketMessageBuffer<RequestType, ResponseType>(this._config.buffer)
  }

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
  private _opened$ = new Subject<Event>()
  // Emits an auth response, when config.authorize.isResponseSuccessful is set, void otherwise
  private _authorized$ = new Subject<ResponseType | void>()
  // Emits an auth subscribe responses, when config.subscribe.isResponseSuccessful is set, void otherwise
  private _subscribed$ = new Subject<ResponseType[] | void>()
  private _closing$ = new Subject<void>()
  private _closed$ = new Subject<CloseEvent>()
  // to notify about errors
  private _error$ = new Subject<any>()
  // store messages, if the socket is not ready to consume them
  private _buffer: WebSocketMessageBuffer<RequestType, ResponseType>

  /**
   * @internal
   * Used to call functions, usually provided by the user, that can throw errors.
   * @param defaultValue
   * @param func
   * @param args
   * @private
   */
  private _safeCall<ArgsType extends any[], ReturnType>(
    defaultValue: ReturnType,
    func?: (...args: ArgsType) => ReturnType,
    ...args: ArgsType
  ): ReturnType {
    if (func) {
      try {
        return func(...args)
      } catch (error) {
        this._error$.next(error)
      }
    }
    return defaultValue
  }

  /**
   *  Observable with all messages, received by the socket. Subscription does not affect opening and closing socket.
   */
  get messages$(): Observable<ResponseType> {
    return this._messages$
  }

  /**
   * The WebSocketController is designed the way you do not need this field, but if you need, you could use it.
   * {@link WebSocketControllerState}
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
  get opened$(): Observable<Event> {
    return this._opened$
  }

  /**
   * Fires whenever the transition opened->authorized happens.
   *
   * Emits an auth response, when {@link WebSocketControllerConfig.authorize.isResponseSuccessful} is set, void otherwise.
   */
  get authorized$(): Observable<ResponseType | void> {
    return this._authorized$
  }

  /**
   * Fires whenever the transition authorized->subscribed happens.
   *
   * Emits an auth subscribe responses, when {@link WebSocketControllerConfig.subscribe.isResponseSuccessful} is set, void otherwise.
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
  get closed$(): Observable<CloseEvent> {
    return this._closed$
  }

  /**
   * Fires with socket, serialization and any other errors.
   *
   * Generally there is no way to handle the errors, other than reopen socket,
   * which is made internally. If you wish, you can log these errors or report
   * them to the server via http.
   */
  get error$(): Observable<any> {
    return this._error$
  }

  /**
   * Opens websocket and sets up reconnect according to options.
   * @param options {@link WebSocketOpenOptions}
   * @throws WebSocketIsAlreadyOpened
   */
  open(
    options: WebSocketOpenOptions
  ): void {
    if (this.state !== WebSocketControllerState.closed) {
      if (!options.doNotThrowWhenOpened) {
        throw new WebSocketIsAlreadyOpened()
      }
      return
    }
    let {WebSocketCtor, protocol, url, binaryType} = this._config
    if (!WebSocketCtor) {
      WebSocketCtor = WebSocket
    }
    let socket: WebSocket
    try {
      socket = protocol
        ? new WebSocketCtor(url, protocol)
        : new WebSocketCtor(url)
      if (binaryType) {
        socket.binaryType = binaryType
      }
      this._socket = socket
    } catch (e) {
      this._error$.next(e)
      return;
    }
    // working with socket var, instead of this._socket,
    // to prevent occasional duplicates (when the socket in this._socket is different from socket we are working with)
    socket.onerror = (error) => {
      this._error$.next(error)
      this._reopen(options)
    }
    socket.onopen = (event) => {
      if (!this._socket) {
        socket.close();
        return
      }

    }
  }

  private _reopen(options: WebSocketOpenOptions) {
    this.close()
    if (options.autoReconnect) {
      const {shouldReconnect, interval} = options.autoReconnect
      setTimeout(() => {
        if (this._safeCall(true, shouldReconnect, this._reconnectState)) {
          this.open(options)
        }
      }, this._safeCall(defaultReconnectInterval, interval, this._reconnectState))
    }
  }

  close(): void {
    if (
      this._socket && (
        this._socket.readyState === WebSocket.OPEN ||
        this._socket.readyState === WebSocket.CONNECTING
      )
    ) {
      this._socket?.close()
    }
    // Even if readyState is CLOSING, it will be closed anyway, so we can remove underlying socket from state
    this._socket = undefined;
    this._state = WebSocketControllerState.closed
  }

  /**
   * Sends the message into underlying socket.
   *
   * By default, if the socket is not opened or authorized,
   * the message is saved to the buffer, and being sent later, when the socket comes to an appropriate state.
   * You also can control parameters of the buffer through {@link WebSocketControllerConfig.buffer}
   * Note, that there are different buffers for messages, that require the socket to be authorized, or to be subscribed,
   * and for those, that do not.
   *
   * @param msg The data to be serialized and sent.
   * @param options Controls the authorization, usage of buffer, etc. {@link WebSocketSendOptions}.
   */
  send(
    msg: RequestType,
    options?: WebSocketSendOptions,
  ): void {
    // TODO: implement
  }

  private _sendDirect(msg: RequestType): void {
    let {serializer} = this._config
    if (!serializer) {
      serializer = (v: RequestType) => v as unknown as UnderlyingDataType
    }
    const data = this._safeCall(null, serializer, msg)
    if (data) {
      this._socket?.send(data)
    }
  }

  /**
   * Sends the message and waits for the corresponding response message. The response is found
   * by id, so setRequestId(msg) === getResponseId(response). Those functions are configured
   * in {@link WebSocketControllerConfig}.
   *
   * By default, if the socket is not opened or authorized,
   * the message is saved to the buffer, and being sent later, when the socket comes to an appropriate state.
   * You also can control parameters of the buffer through {@link WebSocketControllerConfig.buffer}
   * Note, that there are different buffers for messages, that require the socket to be authorized,
   * and for those, that do not.
   *
   * @param msg The data to be serialized and sent.
   * @param options Controls the authorization, usage of buffer, etc. {@link WebSocketRequestOptions}
   */
  request(
    msg: RequestType,
    options?: WebSocketRequestOptions
  ): Observable<ResponseType> {
    // TODO: implement
  }
}
