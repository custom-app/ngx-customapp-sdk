/**
 * RequestType is supposed to be YourProtoRequestMessage.AsObject.
 * ResponseType is supposed to be YourProtoResponseMessage.AsObject.
 *
 * ### Usage
 *
 * Install
 *
 * ```sh
 * yarn add ngx-customapp-proto-http
 * ```
 *
 * Install and configure the [ngx-customapp-errors](https://custom-app.github.io/ngx-customapp-sdk/interfaces/angular_packages_projects_ngx_customapp_errors_src_public_api.ErrorsConfig.html)
 * package, cos it will be used by this package.
 *
 * Write the config.
 *
 *
 * Import ProtoHttpModule.forRoot(config) in your app.module.
 *
 * Use RequestService to make requests.
 *
 * ```typescript
 * @Injectable()
 * export class MenuService {
 *
 *   constructor(
 *     private request: RequestService<Request.AsObject, Response.AsObject>,
 *   ) {}
 *
 *   getCategoryList(): Observable<CategoryListResponse.AsObject> {
 *     return this.request.request(
 *     baseUrl + '/category/list',
 *     {categories: {}} // instance of the Request.AsObject
 *     ).pipe(map(resp => resp.categories!))
 *   }
 * }
 * ```
 *
 * Add {@link VersionInterceptor} to the app.module providers, if you wish.
 *
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
   * If provided, will be used by {@link VersionInterceptor}
   */
  versionHeader?: {
    name: string,
    value: string,
  }
}
