import {BufferOverflowStrategy, WebSocketControllerConfig} from './types';


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
  private _buffers: Record<MessageRequirements, RequestType[]> = {
    [MessageRequirements.any]: [],
    [MessageRequirements.auth]: [],
    [MessageRequirements.sub]: [],
  }

  add(msg: RequestType, requirement: MessageRequirements): void {
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

  addAny(msg: RequestType): void {
    this.add(msg, MessageRequirements.any)
  }

  addAuth(msg: RequestType): void {
    this.add(msg, MessageRequirements.auth)
  }

  addSub(msg: RequestType): void {
    this.add(msg, MessageRequirements.sub)
  }

  remove(requirement: MessageRequirements): RequestType[] {
    const allMessages = this._buffers[requirement]
    this._buffers[requirement] = []
    return allMessages
  }

  removeAny(): RequestType[] {
    return this.remove(MessageRequirements.any)
  }

  removeAuth(): RequestType[] {
    return this.remove(MessageRequirements.auth)
  }

  removeSub(): RequestType[] {
    return this.remove(MessageRequirements.sub)
  }
}
