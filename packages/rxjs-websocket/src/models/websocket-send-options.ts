/**
 * Describes how the {@link WebSocketController} should handle the message being sent.
 */
export interface WebSocketSendOptions {
  /** If true, the message will be sent even if the socket is not authorized and not subscribed */
  withoutAuth?: boolean,
  /** If true, the message will be sent even if the socket is not subscribed. */
  withoutSubscription?: boolean,
  /**
   * If true, the message will be omitted when the socket is not in an appropriate state to send messages,
   * e.g. not authorized
   */
  noBuffer?: boolean,
}
