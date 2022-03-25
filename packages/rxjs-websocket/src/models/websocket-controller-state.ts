/**
 * Reflects the state in the WebSocketController life cycle.
 * Default transitions are: closed -> pending -> opened -> authorized -> subscribed -> closing -> closed.
 */
export enum WebSocketControllerState {
  pending = 'pending',
  opened = 'opened',
  authorized = 'authorized',
  subscribed = 'subscribed',
  closing = 'closing',
  closed = 'closed',
}
