import {WebSocketControllerConfig} from 'customapp-rxjs-websocket';

export type CommonWebSocketConfig<RequestType, ResponseType, UnderlyingDataType> =
  Pick<WebSocketControllerConfig<RequestType, ResponseType, UnderlyingDataType>,
    'serializer' |
    'deserializer' |
    'setRequestId' |
    'getResponseId' |
    'requestTimeout' |
    'WebSocketCtor' |
    'binaryType' |
    'buffer'>
