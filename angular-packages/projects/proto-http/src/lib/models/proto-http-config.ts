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
   * @param response serialized protobuf response.
   */
  deserializer: (response: ArrayBuffer) => ResponseType,
  /**
   * It's expected, that error is a field of a general response, so this function gets it.
   * @param response deserialized proto message.
   */
  getErrorFromResponse: (response: ResponseType) => ErrorResponseType | undefined,
  /**
   * If provided, will be used by
   */
  versionHeader?: {
    name: string,
    value: string,
  }
}
