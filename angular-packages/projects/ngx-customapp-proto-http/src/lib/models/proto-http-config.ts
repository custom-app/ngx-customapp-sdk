/**
 * Main configuration object. Describes serialization, deserialization
 *
 * RequestType is supposed to be YourProtoRequestMessage.AsObject.
 * ResponseType is supposed to be YourProtoResponseMessage.AsObject.
 */
export interface ProtoHttpConfig<RequestType, ResponseType> {
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
   * It's expected, that error might be sent as a regular response, so you could this function to detect.
   * If a regular response is determined as an error, {@link RequestService.request} will error with that response.
   * @param response deserialized proto message.
   */
  isErrorResponse?: (response: ResponseType) => boolean,
  /**
   * If provided, will be used by {@link VersionInterceptor}
   */
  versionHeader?: {
    name: string,
    value: string,
  }
}
