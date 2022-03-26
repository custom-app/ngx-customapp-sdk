/**
 * RequestType is supposed to be YourProtoRequestMessage.AsObject.
 * ResponseType is supposed to be YourProtoResponseMessage.AsObject.
 *
 * ### Usage
 *
 * - Configure the ngx-customapp-errors package, cos it will be used by this package.
 * - Configure this package.
 * - Import ProtoHttpModule.forRoot(config) in your app.module
 * - Use RequestService to make requests
 * - Add VersionInterceptor to the app.module providers, if you wish.
 * ```typescript
 * @NgModule({
 *   // ... imports, declarations, bootstrap
 *   providers: [
 *     {
 *       provide: HTTP_INTERCEPTORS,
 *       useClass: VersionInterceptor,
 *       multi: true,
 *     }
 *   ]
 * })
 * export class AppModule {
 * }
 * ```
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
   * If provided, will be used by
   */
  versionHeader?: {
    name: string,
    value: string,
  }
}
