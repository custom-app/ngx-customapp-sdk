import {JwtGroup} from './jwt-group';
import {JwtInfo} from './jwt-info';
import {JwtApi, JwtApiConstructor} from './jwt-api';
import {NoFreshJwtListenerConstructor} from './no-fresh-jwt-listener';
import {ActionCreator} from '@ngrx/store'

/**
 * ### Usage
 *
 * Create the config.
 *
 * Import JwtModule.forRoot(jwtConfig).
 *
 * Add types to the NgRx AppState.
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
 * Use jwtActions() function to create actions.
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
 * Use jwtSelectors() function to create selectors.
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
 * If you have configured jwtGuard, add JwtGuard to the routing, to handle paths, that require the user to be authorized.
 *
 * ```
 * {
 *   path: 'main',
 *   component: UiShellComponent,
 *   canActivate: [AuthGuard],
 *   children: [
 *     // ... child paths
 *   ]
 * },
 * ```
 */
export interface JwtConfig<Credentials,
  AuthResponse,
  UserInfo,
  UserId = number> {
  /**
   * Function to retrieve the jwt from auth response.
   * @param authResponse
   */
  authResponseToJwt: (authResponse: AuthResponse) => JwtGroup<JwtInfo>,
  authResponseToUserInfo: (authResponse: AuthResponse) => UserInfo,
  /**
   * Used by the JwtInterceptor http interceptor to set the auth header with jwt pinned for every request.
   */
  authHeader: {
    name: string,
    createValue: (jwt: JwtInfo) => string,
  },
  /**
   * Provides methods to interact with backend. Must implement {@link JwtApi}.
   */
  jwtApi: JwtApiConstructor<Credentials, AuthResponse, UserId>,
  /**
   * Used to start actions, when refresh jwt failed. Usually you want to
   * redirect user to the login page.
   */
  noFreshJwt: NoFreshJwtListenerConstructor
  /**
   * the key to be used in the localStorage.
   *
   * Default is {@link defaultJwtStorageKey}
   */
  jwtStorageKey?: string,
  /**
   * If provided, no calls to the {@link JwtApi.login} will be made, until the action is dispatched.
   * The action is expected to come after dispatching login action of this package.
   * Used to wait until, for example, the socket is open, if the auth request is supposed to be sent through the socket.
   */
  actionToWaitUntilAuth?: ActionCreator;
  /**
   * if set, the {@link JwtGuard}, used to restrict access for unauthorized users,
   * will be provided and available to be used in the routing.
   * To implement redirection, when no JWT available, use noFreshJwt field of this config.
   */
  jwtGuard?: {
    /**
     * Used to call {@link JwtApi.login}, if there are valid JWT.
     * @param jwt fresh JWT.
     */
    jwtToCredentials: (jwt: JwtInfo) => Credentials,
    /**
     * The action on which navigation will be continued. The default is `loginSucceed`.
     */
    actionAppReady?: ActionCreator,
    /**
     * The action on which navigation will be cancelled.
     */
    actionAppNotReady?: ActionCreator,
  }
}
