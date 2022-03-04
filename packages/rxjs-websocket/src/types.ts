/**
 * Describes websocket behaviour, serialization, deserialization, authorization, subscriptions etc.
 *
 * @typeParam RequestType The type of messages, that will be consumed by the `send()` method.
 * @typeParam ResponseType The type, of messages, that will be produced by messages$ observable.
 * @typeParam UnderlyingDataType RequestType will be serialized into this type and sent directly into underlying WebSocket.
 * */
export interface WebSocketControllerConfig<RequestType, ResponseType, UnderlyingDataType = "string"> {

}
