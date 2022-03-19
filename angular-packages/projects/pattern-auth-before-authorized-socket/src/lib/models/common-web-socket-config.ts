import {WebSocketControllerConfig} from 'customapp-rxjs-websocket';

export type CommonWebSocketConfig<RequestType, ResponseType, UnderlyingDataType extends string | ArrayBufferLike | Blob | ArrayBufferView> =
  Pick<WebSocketControllerConfig<RequestType, ResponseType, UnderlyingDataType>,
    'serializer' |
    'deserializer' |
    'setRequestId' |
    'getResponseId' |
    'requestTimeout' |
    'WebSocketCtor' |
    'binaryType' |
    'buffer'>
