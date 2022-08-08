/**
 * ### Usage
 *
 * Install.
 *
 * ```sh
 * yarn add ngx-customapp-jwt
 * ```
 *
 * Create the config {@link JwtConfig}. You can read recommendations in the description of each field.
 *
 * Here is an example of the `JwtApi` implementation.
 *
 * ```typescript
 * @Injectable({
 *   providedIn: 'root'
 * })
 * export class JwtApiService implements JwtApi<UserCredentials, AuthResponse.AsObject> {
 *
 *   constructor(
 *     // provided by ngx-customapp-proto-http package. Handles serialization, deserialization and errors.
 *     private request: RequestService<api.Request.AsObject, api.Response.AsObject>
 *   ) {
 *   }
 *
 *   login(credentials: UserCredentials): Observable<AuthResponse.AsObject> {
 *     const req = {
 *       id: 0,
 *       auth: userCredentialsToAuthRequest(credentials),
 *     }
 *     console.log('request', req)
 *     return this.request.request(
 *       authEndpoint,
 *       req,
 *       undefined, // no headers
 *       true // disable jwt interceptor
 *     ).pipe(
 *       map(response => response.auth!)
 *     )
 *   }
 *
 *   logout(accessToken: TokenInfo.AsObject, fromAllDevices: boolean | undefined): Observable<void> {
 *     return this.request.request(
 *       fromAllDevices ? fullLogoutEndpoint : logoutEndpoint,
 *       undefined, // no request body
 *       new HttpHeaders().set(authHeader.name, authHeader.createValue(accessToken)), // add access token to the header
 *       true // disable jwt interceptor
 *     ).pipe(
 *       map(() => void 0)
 *     )
 *   }
 *
 *   refresh(refreshToken: TokenInfo.AsObject): Observable<TokenResponse.AsObject> {
 *     return this.request.request(
 *       tokenRefreshEndpoint,
 *       undefined, // no request body
 *       new HttpHeaders().set(authHeader.name, authHeader.createValue(refreshToken)), // add refresh token to the header
 *       true, // disable jwt interceptor
 *     ).pipe(
 *       map(response => response.tokens!)
 *     )
 *   }
 * }
 * ```
 * This package plugs to the application NgRx store as a separate substore.
 *
 * Import `JwtModule.forRoot(jwtConfig)` in your app. This will enable ngx-customapp-jwt store and provide services.
 *
 * Add types to the NgRx AppState.
 *
 * ```typescript
 * import {jwtFeatureKey, JwtRootState} from 'ngx-customapp-jwt';
 * import {UserInfo} from './user-info';
 *
 * export interface AppState {
 *    // ... other fields of your state
 *   [jwtFeatureKey]: JwtRootState<UserInfo>
 * }
 * ```
 *
 * Use jwtActions() function to create actions. Use created actions in your app.
 *
 * ```typescript
 * export const {
 *   login,
 *   loginSucceed,
 *   loginErrored,
 *
 *   logout,
 *   logoutSucceed,
 *   logoutErrored,
 * } = jwtActions<UserCredentials, AuthResponse.AsObject, UserInfo>()
 * ```
 *
 *
 * Use jwtSelectors() function to create selectors. Use created selectors in your app.
 *
 * ```typescript
 * export const {
 *   selectJwtUser,
 *   selectJwtLoginInProcess,
 *   selectJwtLogoutInProcess
 * } = jwtSelectors<UserInfo>()
 * ```
 *
 * Dispatch login({credentials}) to log in.
 *
 * ```typescript
 * this.store.dispatch(
 *   login({
 *     credentials: {
 *       authType: UserAuthType.logPass,
 *       login: userLogin,
 *       passHash
 *     }
 *   })
 * )
 * ```
 * Dispatch logout({fromAllDevices}) to log out.
 *
 * ```typescript
 * this.store.dispatch(
 *   logout({fromAllDevices: false})
 * );
 * ```
 *
 * Handle the navigation after logging in.
 *
 * ```typescript
 * @Injectable()
 * export class AuthEffects {
 *  navIntoApp$ = createEffect(() => this.actions$.pipe(
 *     ofType(loginSucceed),
 *     tap(() => {
 *       this.router.navigate([appMainPage]);
 *     })
 *   ), {dispatch: false})
 * }
 * ```
 *
 * Handle the navigation after logging out.
 *
 * ```typescript
 * @Injectable()
 * export class AuthEffects {
 *  navIntoApp$ = createEffect(() => this.actions$.pipe(
 *     ofType(logoutSucceed),
 *     tap(() => {
 *       this.router.navigate([appAuthPage]);
 *     })
 *   ), {dispatch: false})
 * }
 * ```
 *
 * Display errors.
 * ```typescript
 * @Injectable()
 * export class AuthEffects {
 *  showError$ = createEffect(() => this.actions$.pipe(
 *     ofType(loginErrored, logoutErrored),
 *     tap(({error}) => {
 *       // error returned by JwtApi.login or JwtApi.logout functions.
 *       this.notifyService.displayError(error);
 *     })
 *   ), {dispatch: false})
 * }
 * ```
 *
 * Add JwtInterceptor to the app.module providers, and every request will be sent with JWT in the header.
 *
 * ```typescript
 * import {JwtInterceptor} from 'ngx-customapp-jwt'
 *
 * @NgModule({
 *   // ... imports, declarations, bootstrap
 *   providers: [
 *     {
 *       provide: HTTP_INTERCEPTORS,
 *       useClass: JwtInterceptor,
 *       multi: true,
 *     }
 *   ]
 * })
 * export class AppModule {
 * }
 * ```
 *
 * If you have configured {@link JwtConfig.jwtGuard}, add the {@link JwtGuard} to the routing,
 * to handle paths, that require the user to be authorized.
 *
 * ```typescript
 * {
 *   path: 'main',
 *   component: UiShellComponent,
 *   canActivate: [JwtGuard],
 *   children: [
 *     // ... child paths
 *   ]
 * },
 * ```
 *
 * You can also listen for the result of the authorization, triggered by the {@link JwtGuard}.
 *
 * ```typescript
 * @Injectable()
 * export class AuthEffects {
 *  showError$ = createEffect(() => this.actions$.pipe(
 *     ofType(loginAgainSucceed, loginAgainErrored),
 *     tap(action => {
 *       // do something with the auth response or the error.
 *     })
 *   ), {dispatch: false})
 * }
 * ```
 *
 * @module ngx-customapp-jwt
 */

export * from './lib/jwt.module';
export * from './lib/http-interceptors/jwt.interceptor'
export * from './lib/errors'

export * from './lib/models/jwt-config'
export * from './lib/models/jwt-api'
export * from './lib/models/jwt-group'
export * from './lib/models/jwt-info'
export * from './lib/models/no-fresh-jwt-listener'

export * from './lib/constants/disable-jwt-interception'
export * from './lib/constants/jwt-storage-key'
export * from './lib/constants/di-token'

export * from './lib/store/reducers'
export * from './lib/store/jwt.actions'
export * from './lib/store/jwt.selectors'
export * from './lib/store/jwt.effects'
export * from './lib/services/jwt.service'

export * from './lib/guards/jwt.guard'
