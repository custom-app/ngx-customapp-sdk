/**
 * @internal
 * Socket with state, that must live with socket.
 */
export class WrappedSocket {
  public closedManually?: boolean
  constructor(
    public ws: WebSocket
  ) {
  }
}
