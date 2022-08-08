/**
 * ### Usage
 *
 * Install
 *
 * ```sh
 * yarn add ngx-customapp-pattern-auth-before-socket
 * ```
 *
 * Install the {@link customapp-rxjs-websocket} package (it is a peer dependency).
 *
 * ```sh
 * yarn add customapp-rxjs-websocket
 * ```
 *
 * Install and configure
 * {@link ngx-customapp-errors} and {@link ngx-customapp-jwt} packages.
 * You may want to use {@link ngx-customapp-proto-http} during the configuration.
 *
 * This package plugs to the application NgRx store as a separate substore.
 * Import `PatternAuthBeforeSocketModule.forRoot(config)` in your app. This will enable package's store and provide
 * services.
 *
 * Add types to the NgRx AppState.
 * ```typescript
 * import {socketsFeatureKey, SocketsRootState} from 'ngx-customapp-pattern-auth-before-socket';
 *
 * export interface AppState {
 *    // ... other fields of the state
 *   [socketsFeatureKey]: SocketsRootState,
 * }
 * ```
 *
 * The sockets will open after {@link ngx-customapp-jwt} loginSucceed or loginAsSucceed actions and closed after logoutSucceed action.
 *
 * If you want to listen for sockets being initialized before navigating into the app, you shouldn't.
 * If the app written properly, sockets will be successfully initialized after successful `login`, `loginAs` or `loginAgain`,
 * cos you are supposed to use the same credentials. If you still want to handle such errors
 * (when the user is logged in but socket is not available), react to the `initSocketsErrored`
 * action by suggesting the user to log in again.
 *
 * If you still want to react to the sockets being successfully/unsuccessfully initialized,
 * you should listen for `loginAndInitSocketsSucceed`, `loginAndInitSocketsErrored`,
 * `loginAsAndInitSocketsSucceed`, `loginAsAndInitSocketsErrored`, `loginAgainAndInitSocketsSucceed`,
 * `loginAgainAndInitSocketsErrored`. But use them carefully, cos all actions in general need
 * different handler.
 *
 * To send the request into the socket and handle subscriptions, make a service.
 * ```typescript
 * @Injectable({
 *   providedIn: 'root'
 * })
 * export class BaseSocketService {
 *   constructor(
 *     // Injecting a service with initialized sockets
 *     private sockets: WebSocketsOwnerService<api.Request.AsObject, api.Response.AsObject, ArrayBuffer, UserInfo, UserCredentials, AuthResponse.AsObject>,
 *     private errorsService: ErrorsService,
 *   ) {
 *     console.log('sockets', this.sockets.sockets)
 *   }
 *
 *   // For now, we assume, that there is only one socket.
 *   get socket() {
 *     return this.sockets.sockets[socketId]
 *   }
 *
 *   // The id is set by the setRequestId function from {@link WebSocketChain.commonConfig},
 *   // so it is omitted from the argument of the function below.
 *   private request(req: Omit<api.Request.AsObject, 'id'>): Observable<api.Response.AsObject> {
 *     return this.socket
 *       .request({id: 0, ...req})
 *       .pipe(
 *         // Handling errors, according to conventions from ngx-customapp-errors
 *         catchError(this.errorsService.reportError),
 *         catchError(this.errorsService.toUserError),
 *       )
 *   }
 *
 *   // Helper method for handling subscription notifications.
 *   get sub$(): Observable<SubData.AsObject> {
 *     return this.socket.messages$.pipe(
 *       map(message => message.sub),
 *       filter(Boolean),
 *     )
 *   }
 *
 *   // Helper function, to listen for errors. Generally, there is no way to handle this errors,
 *   // other than just report them and reopen the socket (which is made internally).
 *   get error$(): Observable<any> {
 *     return this.socket.error$;
 *   }
 *
 *   // helper functions for making subscriptions
 *   subscribe(kind: SubKindMap[keyof SubKindMap]): Observable<void> {
 *     return this.request({sub: {kind}}).pipe(
 *       map(() => void 0)
 *     )
 *   }
 *
 *   unsubscribe(kind: SubKindMap[keyof SubKindMap]): Observable<void> {
 *     return this.request({unsub: {kind}}).pipe(
 *       map(() => void 0)
 *     )
 *   }
 *
 *   // example of a request function
 *   addMenuItem(menuAdd: MenuAddRequest.AsObject): Observable<MenuAddResponse.AsObject> {
 *     return this.request({menuAdd}).pipe(
 *       map(response => response.menuAdd!)
 *     )
 *   }
 * }
 * ```
 *
 * To handle the subscription, map subscription messages into actions according to your app logic.
 * ```
 * // an effect to work with entity, called Category
 * @Injectable()
 * export class CategoriesEffects {
 *   handleSub$ = createEffect(() => this.baseSocketService.sub$.pipe(
 *     mergeMap((sub) => {
 *       if (sub.categories) {
 *         return of(
 *           // an action, indicating that some entities must be added or replaced
 *           menuCategoriesUpdated({
 *             updateType: UpdateType.list,
 *             data: sub.categories,
 *           })
 *         )
 *       } else if (sub.categoryUpdate) {
 *         // an action, indicating that one entity must be updated
 *         return of(
 *           menuCategoriesUpdated({
 *             updateType: UpdateType.entity,
 *             data: sub.categoryUpdate,
 *           })
 *         )
 *       } else if (sub.categoryDelete) {
 *         // an action, indicating that one entity must be deleted
 *         return of(
 *           menuCategoriesUpdated({
 *             updateType: UpdateType.delete,
 *             data: sub.categoryDelete
 *           })
 *         )
 *       } else {
 *         return EMPTY
 *       }
 *     })
 *   ))
 * }
 * ```
 * @module ngx-customapp-pattern-auth-before-socket
 */

export * from './lib/pattern-auth-before-socket.module';

export * from './lib/models/common-web-socket-config'
export * from './lib/models/individual-web-socket-config'
export * from './lib/models/web-socket-chain'
export * from './lib/models/web-socket-chain-link'

export * from './lib/services/web-sockets-owner.service'

export * from './lib/store/sockets.effects'
export * from './lib/store/sockets.actions'
export * from './lib/store/sockets.selectors'
export * from './lib/store/reducers'

