import {BufferOverflowStrategy, WebSocketControllerConfig, WebSocketMessage} from './types';


/**
 * The default for {@link WebSocketControllerConfig.buffer.size}
 */
export const defaultWebSocketMessageBufferSize = 1;

/**
 * The default for {@link WebSocketControllerConfig.buffer.overflow}
 */
export const defaultWebSocketBufferOverflow: BufferOverflowStrategy = 'dropOld'

export enum MessageRequirements {
  any, // for messages that do not require auth or subscription
  auth, // the message requires socket to be authorized
  sub, // the message requires socket to be subscribed
}

export class WebSocketMessageBuffer<RequestType, ResponseType> {

  constructor(
    private readonly _config: WebSocketControllerConfig<RequestType, ResponseType>['buffer']
  ) {
  }

  // new messages are added through unshift, old removed through pop
  private _buffers: Record<MessageRequirements, WebSocketMessage<RequestType, ResponseType>[]> = {
    [MessageRequirements.any]: [],
    [MessageRequirements.auth]: [],
    [MessageRequirements.sub]: [],
  }

  add(msg: WebSocketMessage<RequestType, ResponseType>, requirement: MessageRequirements): void {
    const size = this._config?.size || defaultWebSocketMessageBufferSize
    const overflow = this._config?.overflow || defaultWebSocketBufferOverflow
    const buffer = this._buffers[requirement]
    if (buffer.length >= size) {
      if (overflow === 'dropNew') {
        buffer.shift()
      } else {
        buffer.pop()
      }
    }
    buffer.unshift(msg)
  }

  addAny(msg: WebSocketMessage<RequestType, ResponseType>): void {
    this.add(msg, MessageRequirements.any)
  }

  addAuth(msg: WebSocketMessage<RequestType, ResponseType>): void {
    this.add(msg, MessageRequirements.auth)
  }

  addSub(msg: WebSocketMessage<RequestType, ResponseType>): void {
    this.add(msg, MessageRequirements.sub)
  }

  remove(requirement: MessageRequirements): WebSocketMessage<RequestType, ResponseType>[] {
    const allMessages = this._buffers[requirement]
    this._buffers[requirement] = []
    return allMessages
  }

  removeAny(): WebSocketMessage<RequestType, ResponseType>[] {
    return this.remove(MessageRequirements.any)
  }

  removeAuth(): WebSocketMessage<RequestType, ResponseType>[] {
    return this.remove(MessageRequirements.auth)
  }

  removeSub(): WebSocketMessage<RequestType, ResponseType>[] {
    return this.remove(MessageRequirements.sub)
  }
}
