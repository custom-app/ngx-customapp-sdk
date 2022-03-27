import {CommonWebSocketConfig} from './common-web-socket-config';
import {WebSocketChainLink} from './web-socket-chain-link';
import {WebSocketOpenOptions} from 'customapp-rxjs-websocket';

/**
 * Sockets configured as a chain, where each chain link represents group of sockets to be initialized
 * and opened concurrently, but chain links are initialized in sequence. New chain link is obtained
 * through the call of the {@link WebSocketChainLink.socketsReady} function. The sockets from the first
 * chain link are initialized immediately (but not opened) and available in {@link WebSocketsOwnerService}
 * from the beginning.
 *
 * ### Usage
 *
 * Install
 *
 * ```sh
 * yarn add ngx-customapp-pattern-auth-before-socket
 * ```
 *
 * Install the customapp-rxjs-websocket package (it is a peer dependency).
 *
 * ```sh
 * yarn add customapp-rxjs-websocket
 * ```
 *
 * Install and configure
 * [ngx-customapp-errors](https://custom-app.github.io/ngx-customapp-sdk/interfaces/angular_packages_projects_ngx_customapp_errors_src_public_api.ErrorsConfig.html) and
 * [ngx-customapp-jwt](https://custom-app.github.io/ngx-customapp-sdk/interfaces/angular_packages_projects_ngx_customapp_jwt_src_public_api.JwtConfig.html)
 * packages. You may want to use [ngx-customapp-proto-http](https://custom-app.github.io/ngx-customapp-sdk/interfaces/angular_packages_projects_ngx_customapp_proto_http_src_public_api.ProtoHttpConfig.html) during the configuration.
 *
 * Import PatternAuthBeforeSocketModule.forRoot(config).
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
 * The sockets will open after ngx-customapp-jwt loginSucceed or loginAsSucceed actions and closed after logoutSucceed action.
 *
 * You can wait for sockets to be open by listening for `initSocketsSucceed` or `initSocketsErrored` actions.
 * You can check, if the sockets are opening or closing by using `selectSocketsInitInProcess` or
 * `selectCloseInProcess` selectors.
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
 */
export interface WebSocketChain<RequestType, ResponseType, UnderlyingDataType extends string | ArrayBufferLike | Blob | ArrayBufferView, UserInfo> {
  /**
   * Fields of the `WebSocketControllerConfig` common for all sockets.
   */
  commonConfig: CommonWebSocketConfig<RequestType, ResponseType, UnderlyingDataType>,
  /**
   * Will be passed as argument to every `WebSocketController.open` method.
   *
   * Usually you want to enable reconnect.
   * ```typescript
   * commonOpenOptions: {
   *   autoReconnect: {
   *     interval: () => Math.floor(reopenDelayMin + Math.random() * reopenDelaySpan),
   *   }
   * },
   * ```
   */
  commonOpenOptions: WebSocketOpenOptions,
  /**
   * Sockets to be opened, when {@link WebSocketsOwnerService.init} is called.
   * Sockets from the first chain link are initialized (but not opened) in {@link WebSocketChainLink} constructor, so
   * they are available immediately. The sockets from consequent chain links are available after the observable,
   * returned by {@link WebSocketsOwnerService.init} have completed.
   */
  chain: WebSocketChainLink<RequestType, ResponseType, UserInfo>
}
