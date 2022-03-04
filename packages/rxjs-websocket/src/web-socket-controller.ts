import {WebSocketControllerConfig} from './types';

export class WebSocketController<RequestType, ResponseType, UnderlyingDataType = string> {
  constructor(
    private readonly config: WebSocketControllerConfig<RequestType, ResponseType, UnderlyingDataType>
  ) {
  }
}
