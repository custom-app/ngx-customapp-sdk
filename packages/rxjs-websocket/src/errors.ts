/**
 * Is thrown when {@link WebSocketController.open} is called on the already opened socket.
 */
export class WebSocketIsAlreadyOpened extends Error {
  constructor() {
    super('WebSocketController is already opened');
  }
}
