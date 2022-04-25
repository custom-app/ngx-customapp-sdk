import {
  AsyncSubject,
  BehaviorSubject,
  filter,
  first,
  forkJoin,
  mergeMap,
  Observable,
  of,
  Subject,
  throwError,
  timeout
} from 'rxjs';
import {WebSocketIsAlreadyOpened} from './errors';
import {MessageRequirements, WebSocketMessageBuffer} from './web-socket-message-buffer';
import {WrappedSocket} from './wrapped-socket';
import {WebSocketControllerConfig} from './models/websocket-controller-config';
import {ReconnectState} from './models/reconnect-state';
import {WebSocketControllerState} from './models/websocket-controller-state';
import {WebSocketOpenOptions} from './models/websocket-open-options';
import {WebSocketSendOptions} from './models/websocket-send-options';

/**
 * Need this to prevent an overload.
 * The time between socket happening to be closed and the next try to open.
 */
export const defaultReconnectInterval = 10000; // 10 seconds
export const defaultRequestTimeout = 2 * 60 * 1000; // 2 minutes

/**
 * Class, that wraps the socket and takes control over authorization, subscription and reconnection.
 */
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
    subscribedCounter: 0,
    erroredCounter: 0,
    wasPrevOpenSuccessful: false,
  }
  // used for setting request id
  private _reqCounter = 1
  private _socket?: WrappedSocket;
  // For all messages, received from the server
  private _messages$ = new Subject<ResponseType>()

  private _state: WebSocketControllerState = WebSocketControllerState.closed
  private _state$ = new BehaviorSubject<WebSocketControllerState>(this._state)

  // To notify about every state
  private _pending$ = new Subject<void>()
  private _opened$ = new Subject<Event>()
  // Emits an auth response, when config.authorize.isResponseSuccessful is set, undefined otherwise
  private _authorized$ = new Subject<ResponseType | undefined>()
  // Emits an auth subscribe responses, when config.subscribe.isResponseSuccessful is set, undefined otherwise
  private _subscribed$ = new Subject<ResponseType[] | undefined>()
  private _closing$ = new Subject<void>()
  private _closed$ = new Subject<CloseEvent>()
  private _closedManually$: Subject<void>[] = []
  // to notify about errors
  private _error$ = new Subject<any>()
  // to notify, that authorization, subscription or something else gone wrong
  private _closedForever$ = new Subject<void>()
  private _buffer: WebSocketMessageBuffer<RequestType, ResponseType>

  /**
   * Used to call functions, usually provided by the user, that can throw errors.
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
   * Notifies about state transitions
   * {@link WebSocketControllerState}
   */
  get state$(): Observable<WebSocketControllerState> {
    return this._state$
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
   * Emits an auth response, when the `isResponseSuccessful` field in {@link WebSocketControllerConfig.authorize}
   * is set, undefined otherwise.
   *
   * Errors when either authorization response was not successful
   * (determined by the field `isResponseSuccessful` of the {@link WebSocketControllerConfig.authorize})
   * or authorization request
   * timed out (if so, will error with RxJs `TimeoutError`).
   */
  get authorized$(): Observable<ResponseType | undefined> {
    return this._authorized$
  }

  /**
   * Fires whenever the transition authorized->subscribed happens.
   *
   * Emits an auth subscribe responses, when the `isResponseSuccessful` field in {@link WebSocketControllerConfig.subscribe}
   * is set, undefined otherwise.
   *
   * Fires when one of the subscription responses was not successful
   * (determined by the field `isResponseSuccessful` of the {@link WebSocketControllerConfig.subscribe})
   * or when one of the requests timed out (if so, will error with RxJs `TimeoutError`).
   */
  get subscribed$(): Observable<ResponseType[] | undefined> {
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
   * Fires when the authorization, subscription or something else gone wrong. Does not
   * replace notAuthorized$, notSubscribed$, error$ observables, they will emit anyway.
   *
   * You can use it to navigate user back to login page.
   */
  get closedForever$(): Observable<void> {
    return this._closedForever$
  }

  private _setState(state: WebSocketControllerState): void {
    this._state = state
    this._state$.next(state)
  }

  // function for handling side effects of the state transition
  private _pending(): void {
    this._setState(WebSocketControllerState.pending)
    this._pending$.next()
  }

  private _opened(e: Event): void {
    console.log('opened', e)
    this._setState(WebSocketControllerState.opened)
    this._opened$.next(e)
    this._sendBuffered(MessageRequirements.any)
    this._authorize()
  }

  private _authorized(authResponse?: ResponseType): void {
    this._setState(WebSocketControllerState.authorized)
    this._authorized$.next(authResponse)
    this._sendBuffered(MessageRequirements.auth)
    this._subscribe()
  }

  // not related to the RxJs. Subscribe means to send the subscription request and wait for a response
  private _subscribed(subscribeResponses?: ResponseType[]): void {
    this._setState(WebSocketControllerState.subscribed)
    this._subscribed$.next(subscribeResponses)
    this._reconnectState.subscribedCounter++
    this._reconnectState.wasPrevOpenSuccessful = true
    this._sendBuffered(MessageRequirements.sub)
  }

  private _closing(): void {
    this._setState(WebSocketControllerState.closing)
    this._closing$.next()
  }

  private _closed(e: CloseEvent): void {
    this._setState(WebSocketControllerState.closed)
    this._closed$.next(e)
    // subjects are added here when close() called.
    this._closedManually$.forEach(closed$ => {
      closed$.next()
      closed$.complete()
    })
    this._closedManually$ = []
  }

  /**
   * Opens websocket and sets up reconnect according to the options.
   * @param options {@link WebSocketOpenOptions}
   * @throws WebSocketIsAlreadyOpened
   */
  open(
    options: WebSocketOpenOptions
  ): void {
    console.log('open, socket state', this.state)
    if (this.state !== WebSocketControllerState.closed) {
      if (!options.doNotThrowWhenOpened) {
        throw new WebSocketIsAlreadyOpened()
      }
      return
    }
    this._pending()
    let {WebSocketCtor, protocol, url, binaryType} = this._config
    if (!WebSocketCtor) {
      WebSocketCtor = WebSocket
    }
    let socket: WrappedSocket
    try {
      const ws = protocol
        ? new WebSocketCtor(url, protocol)
        : new WebSocketCtor(url)
      if (binaryType) {
        console.log('binary type', binaryType)
        ws.binaryType = binaryType
      }
      socket = new WrappedSocket(ws)
      this._socket = socket
    } catch (e) {
      this._error$.next(e)
      return;
    }
    console.log('socket created')
    // working with socket var, instead of this._socket,
    // to prevent occasional duplicates (when the socket in this._socket is different from socket we are working with)
    socket.ws.onopen = (e: Event) => {
      console.log('socket onopen', e)
      if (!this._socket) {
        socket.ws.close();
        return
      }
      this._opened(e)
    }
    socket.ws.onerror = (error) => {
      console.log('socket onerror', error)
      this._error$.next(error)
      if (!socket.closedManually) {
        this._reopen(options)
      }
      this._reconnectState.erroredCounter++
    }
    socket.ws.onclose = (e: CloseEvent) => {
      console.log('socket onclose', e, 'closedManually', socket.closedManually, 'state', this.state)
      if (!socket.closedManually && this.state === WebSocketControllerState.subscribed) {
        // reopen only when socket is not closed manually and at least one authorization and subscription succeed.
        this._closed(e)
        this._reopen(options)
      } else {
        this._closed(e)
        this._closedForever$.next()
      }
    }
    socket.ws.onmessage = (e: MessageEvent<UnderlyingDataType>) => {
      let {deserializer} = this._config
      if (!deserializer) {
        deserializer = (v: MessageEvent<UnderlyingDataType>) => v as unknown as ResponseType
      }
      try {
        const msg = deserializer(e)
        console.log('socket onmessage1', msg)
        this._messages$.next(msg)
      } catch (e) {
        this._error$.next(e)
      }
    }
  }

  private _sendBuffered(requirement: MessageRequirements): void {
    const messages = this._buffer.remove(requirement)
    messages.forEach(msg => this._sendDirect(msg))
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

  private _authorize(): void {
    console.log('authorize1')
    const {authorize} = this._config
    if (authorize) {
      const {createRequest, isResponseSuccessful} = authorize
      createRequest().pipe(
        first()
      ).subscribe(msg => {
        console.log('auth message created', msg)
        if (msg) {
          if (isResponseSuccessful) {
            const response$ = this._requestDirect(msg)
            response$.pipe(
              mergeMap(response => {
                if (isResponseSuccessful(response)) {
                  return of(response)
                } else {
                  return throwError(() => response)
                }
              }),
            ).subscribe({
              next: response => {
                console.log('authorized response successful', response)
                this._authorized(response)
              }, error: err => {
                console.log('authorized response error', err)
                this._authorized$.error(err)
                this.close()
              }
            })
          } else {
            this._sendDirect(msg)
            this._authorized()
          }
        } else {
          this.close()
        }
      })
    } else {
      // if no auth required, the socket is considered authorized immediately
      this._authorized()
    }
  }

  // not related to the RxJs. Subscribe means to send the subscription request and wait for a response
  private _subscribe(): void {
    console.log('subscirbe')
    const {subscribe} = this._config
    if (subscribe) {
      const {createRequests, isResponseSuccessful} = subscribe
      createRequests().pipe(
        first()
      ).subscribe(msgList => {
        if (msgList) {
          if (isResponseSuccessful) {
            const responses$ = forkJoin(
              msgList.map(msg => this._requestDirect(msg))
            )
            responses$.pipe(
              filter(responses => responses.every(isResponseSuccessful)),
              mergeMap(responses => {
                const unsuccessful = responses.find(resp => !isResponseSuccessful(resp))
                if (unsuccessful) {
                  return throwError(unsuccessful)
                }
                return of(responses)
              }),
            ).subscribe({
              next: responses => {
                console.log('subscribe responses success', responses)
                this._subscribed(responses)
              }, error: err => {
                console.log('subscribe responses error', err)
                this._subscribed$.error(err)
                this.close()
              }
            })
          } else {
            this._subscribed()
          }
        } else {
          this.close()
        }
      })
    } else {
      // if no subscription is required, the socket is considered subscribed immediately
      this._subscribed()
    }
  }

  /**
   * Closes the socket, cancels the reconnection.
   */
  close(): Observable<void> {
    console.log('manual close, state', this.state)
    if (this._socket) {
      // to prevent occasional reopening
      this._socket.closedManually = true
      if (
        this._socket.ws.readyState === WebSocket.OPEN ||
        this._socket.ws.readyState === WebSocket.CONNECTING
      ) {
        this._closing()
        this._socket?.ws.close()
        const closed$ = new AsyncSubject<void>()
        this._closedManually$.push(closed$)
        return closed$
      }
    }
    this._socket = undefined;
    return of(void 0);
    // Even if readyState is CLOSING, it will be closed anyway, so we can remove underlying socket from state
  }

  /**
   * Sends the message into the underlying socket.
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
    if (
      this._state === WebSocketControllerState.subscribed ||
      (options?.withoutSubscription && this._state === WebSocketControllerState.authorized) ||
      (options?.withoutAuth && this._state === WebSocketControllerState.opened)
    ) {
      this._sendDirect(msg)
    } else {
      if (!options?.noBuffer) {
        if (options?.withoutAuth) {
          this._buffer.addAny(msg)
          return
        }
        if (options?.withoutSubscription) {
          this._buffer.addAuth(msg)
          return;
        }
        this._buffer.addSub(msg)
      }
      return;
    }
  }

  private _sendDirect(msg: RequestType): void {
    console.log('socket send direct msg', msg)
    let {serializer} = this._config
    if (!serializer) {
      serializer = (v: RequestType) => v as unknown as UnderlyingDataType
    }
    try {
      this._socket?.ws.send(serializer(msg))
    } catch (e) {
      this._error$.next(e)
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
   * Unlike Angular HttpClient, the request is being sent immediately after the function was called,
   * not after subscription to the inner observable.
   *
   * @param msg The data to be serialized and sent.
   * @param options Controls the authorization, usage of buffer, etc. {@link WebSocketSendOptions}
   */
  request(
    msg: RequestType,
    options?: WebSocketSendOptions
  ): Observable<ResponseType> {
    const {request, requestId} = this._addRequestId(msg)
    this.send(request, options)
    return this._pipeForResponse(requestId)
  }

  private _addRequestId(msg: RequestType): { request: RequestType, requestId: number } {
    const {setRequestId} = this._config
    const requestId = this._reqCounter++
    const request = setRequestId(msg, requestId)
    return {
      request,
      requestId
    }
  }

  // makes a request without any buffer and any checks
  private _requestDirect(msg: RequestType): Observable<ResponseType> {
    const {request, requestId} = this._addRequestId(msg)
    this._sendDirect(request)
    return this._pipeForResponse(requestId)
  }

  private _pipeForResponse(requestId: number): Observable<ResponseType> {
    let {getResponseId, requestTimeout} = this._config
    requestTimeout = requestTimeout === undefined ? defaultRequestTimeout : requestTimeout;
    return this.messages$.pipe(
      filter(response => getResponseId(response) === requestId),
      first(),
      timeout({first: requestTimeout}),
      mergeMap((response) => {
        if (this._safeCall(false, this._config.isErrorResponse, response)) {
          return throwError(response)
        } else {
          return of(response)
        }
      }),
    )
  }
}
