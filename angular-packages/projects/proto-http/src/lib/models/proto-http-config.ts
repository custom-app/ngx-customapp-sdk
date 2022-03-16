/**
 * RequestType is supposed to be YourProtoRequestMessage.AsObject.
 * ResponseType is supposed to be YourProtoResponseMessage.AsObject.
 */
export interface ProtoHttpConfig<RequestType, ResponseType, ErrorResponseType> {
  /**
   * Function to be called on every request.
   * @param request A message to be serialized into UnderlyingDataType
   */
  serializer: (request: RequestType) => ArrayBuffer,

  /**
   * Function to be called on every response.
   * @param responseEvent The whole event, in case you need not only data.
   */
  deserializer: (responseEvent: ArrayBuffer) => ResponseType,
  getErrorFromResponse: (response: ResponseType) => ErrorResponseType | undefined
}
