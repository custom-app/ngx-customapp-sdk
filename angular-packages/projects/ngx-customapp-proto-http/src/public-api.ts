/**
 * ### Usage
 *
 * Install
 *
 * ```sh
 * yarn add ngx-customapp-proto-http
 * ```
 *
 * Install and configure {@link ngx-customapp-errors} and {@link ngx-customapp-jwt}
 * packages, cos them are used by this package.
 *
 * Create the config {@link ProtoHttpConfig}.
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
 * @module ngx-customapp-proto-http
 */

export * from './lib/proto-http.module';
export * from './lib/services/request.service'
export * from './lib/http-interceptors/version.interceptor'
export * from './lib/constants/di-token'
export * from './lib/constants/disable-version-interception'
export * from './lib/constants/proto-header'
export * from './lib/models/proto-http-config'
