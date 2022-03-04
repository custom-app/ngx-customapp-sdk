/**
 * Describes websocket behaviour, serialization, deserialization, authorization, subscriptions etc.
 * The auto reconnect settings are passed to the `WebSocketController.open()` method.
 *
 * It is supposed that you usually communicate with a server using request-response pattern.
 * So every message being sent have an id and corresponding response have the exact same id.
 * To delegate the control over id's, you pass `setRequestId` function, which transforms your
 * message, so it has the id set, and you pass `getResponseId` function, which works as it is called.
 * If you do not want to set id on a request message, you can use parameters of the `WebSocketController.send()` method.
 *
 * The id must be number. If you need to use a string or something else, transform this number
 * to the string in the set function, and back to the number in the get function.
 *
 * @typeParam RequestType The type of messages, that will be consumed by the `WebSocketController.send()` method.
 * @typeParam ResponseType The type, of messages, that will be produced by `messages$` observable.
 * @typeParam UnderlyingDataType Must be `ArrayBuffer`, `Blob` or `string`.
 * The result of the serializer function and a parameter of the deserializer.
 * It is supposed that you send only messages of this type through the underlying WebSocket.
 * DO NOT COMBINE "string", "arraybuffer" and "blob": it is not supported.
 * (even that original WebSocket [supports](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/binaryType)).
 * If you send binary data, send ONLY binary data. If you send text frames, send ONLY text frames.
 * */
export interface WebSocketControllerConfig<RequestType, ResponseType, UnderlyingDataType = string> {
  /**
   * The url of the socket server to connect to,
   * passed directly to a [WebSocket constructor](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket)
   */
  url?: string

  /**
   * The protocol to use to connect,
   * passed directly to a [WebSocket constructor](https://developer.mozilla.org/en-US/docs/Web/API/WebSocket/WebSocket)
   */
  protocol?: string | string[],

  /**
   * Function to be called on every message, passed to the `WebSocketController.send()` method.
   * If not stated, RequestType must be equal to the UnderlyingDataType.
   * If you want to communicate through JSON, pass JSON.stringify method here.
   * @param request A message to be serialized into UnderlyingDataType
   */
  serializer?: (request: RequestType) => UnderlyingDataType,

  /**
   * Function to be called on every message, received by "onmessage" handler of underlying socket.
   * If not stated, ResponseType must be equal to the UnderlyingDataType.
   * If you want to communicate through JSON, pass JSON.parse method here.
   * @param response
   */
  deserializer?: (response: ResponseType) => UnderlyingDataType,

  /**
   * Sets an id which helps find a corresponding response message.
   * @param request A message to set the id to.
   * @param id The number to be set. if getResponseId(message) === id, the message is considered response
   */
  setRequestId: (request: RequestType, id: number) => RequestType,

  /**
   * Gets an id which helps find a corresponding request message.
   * @param response A message to get id from.
   */
  getResponseId: (response: ResponseType) => number,

  /**
   * If passed, an authorization message will be sent whenever the socket opens.
   * When not passed, socket state transition opened->authorized still happens, but instant.
   */
  authorize?: {
    /**
     * Creates a request, after which the socket will be authorized.
     * Response to this request is emitted into `WebSocketController.authorized$`
     * and `WebSocketController.messages$` observables.
     */
    createRequest: () => RequestType,
    /**
     * Helps to determine if the authorization completed successfully. If not passed,
     * socket will become authorized immediately after sending auth request. If any response must be considered
     * successful, pass `() => true`.
     * @param response param for the auth response.
     */
    isResponseSuccessful?: (response: ResponseType) => boolean
  }

  /**
   * This param is used when your socket starts sending updates of some data only after you ask it for.
   * To tell server, that you need regular updates, you send a subscribe request.
   * To tell that you don't, you send unsubscribe request.
   * Updates will be handled as ordinary messages - passed to the `WebSocketController.messages$` observable.
   *
   * When not passed, socket state transition authorized->subscribed still happens, but instant.
   */
  subscribe?: {
    /**
     * Creates a request array, after sending every request of which the socket will be subscribed.
     * Array of responses to these requests is emitted into `WebSocketController.subscribed$` observable
     * and every response from array is emitted into `WebSocketController.messages$` observables one by one.
     * @param authResponse A response on the message, created by the `authorize.createRequest`.
     * If no `authorizeIsResponseSuccessful` was provided, authResponse will be null.
     */
    createRequests: (authResponse?: ResponseType) => RequestType[],
    /**
     * Helps to determine if the subscription completed successfully. If not passed,
     * socket will become authorized immediately after sending auth request. If any response must be considered
     * successful, pass `() => true`.
     * Will be called for every subscribe response.
     * @param response param for the auth response.
     */
    isResponseSuccessful?: (response: ResponseType) => boolean
  }

  /**
   * Sets the `binaryType` property of the underlying WebSocket.
   * if UnderlyingDataType type param is set to be `string`, and you communicate with server through text frames,
   * this parameter does not matter.
   * If UnderlyingDataType type param is set to be `ArrayBuffer` , binaryType must be `'blob'`.
   * If set to be `ArrayBuffer`, binaryType must be `'arraybuffer'`
   */
  binaryType?: 'blob' | 'arraybuffer';

  /**
   * A WebSocket constructor to use.
   */
  WebSocketCtor?: { new(url: string, protocols?: string | string[]): WebSocket };
}

/**
 * Describes how much there were successful and unsuccessful open tries. This data used
 * by configured functions to determine if the socket should reconnect and reconnect params.
 */
export interface ReconnectState {
  wasPrevOpenSuccessful: boolean,
  openedCounter: number,
  erroredCounter: number
}

export enum WebSocketControllerState {
  pending,
  opened,
  authorized,
  subscribed,
  closing,
  closed,
}
