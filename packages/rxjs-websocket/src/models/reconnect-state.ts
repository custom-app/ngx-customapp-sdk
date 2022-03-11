/**
 * Describes how much there were successful and unsuccessful open tries. This data used
 * by configured functions to determine if the socket should reconnect and reconnect params.
 */
export interface ReconnectState {
  wasPrevOpenSuccessful: boolean,
  /** number of times socket was in state "subscribed" */
  subscribedCounter: number,
  /** number of times socket.onerror callback fired */
  erroredCounter: number
}
