/**
 * ### Usage:
 *
 * Install
 * ```sh
 * yarn add ngx-customapp-errors
 * ```
 *
 * Write the config {@link ErrorsConfig}.
 *
 * Import ErrorsModule.forRoot(config) once in your app.
 *
 * If you wish to report unhandled errors, add
 * ```typescript
 *   {provide: ErrorHandler, useClass: ErrorsHandler}
 * ```
 * to the app.module providers array.
 *
 * Use `ErrorsService`, available across the app, to report and transform errors.
 *
 * Stick to the conventions, described below.
 *
 * Convention: all errors, thrown by the request function (an http request or a socket request),
 * have a string type and are a human-readable messages, understandable by the user.
 * To do so, pipe request observable through {@link ErrorsService.toUserError}.
 * All errors should be reported to the server. Errors, thrown by the request function, are handled
 * using {@link ErrorsService.reportError}
 *
 * ```typescript
 *     return this.http.post(
 *       endpoint,
 *       request
 *     ).pipe(
 *       catchError(this.errorsService.reportError),
 *       catchError(this.errorsService.toUserError),
 *     )
 * ```
 *
 * Another convention is to handle errors, thrown by the request functions, inside effects, and map
 * them into NgRx actions. Example:
 *
 *
 * `OrdersEffects`
 * ```typescript
 *   getOrders$ = createEffect(() => this.actions$.pipe(
 *     ofType(getOrdersCurrent),
 *     mergeMap(() =>
 *       this.ordersService
 *         .getOrdersListProcessing()
 *         .pipe(
 *           map(ordersListResponse =>
 *             getOrdersCurrentSucceed({
 *               ordersListResponse
 *             })
 *           ),
 *           catchError(error => of(
 *             // error here is human-readable and can be displayed to the user
 *             getOrdersCurrentErrored({error})
 *           ))
 *         )
 *     )
 *   ))
 * ```
 *
 * And then display the error inside an effect or inside a component.
 *
 * ```typescript
 *   displayError$ = createEffect(() => this.actions$.pipe(
 *     ofType(getOrdersCurrentErrored),
 *     tap(({error}) => {
 *       this.notifyService.displayError(error);
 *     })
 *   ), {dispatch: false})
 * ```
 *
 * For errors, that were not handled inside the observable, custom error handler {@link ErrorsHandler} is written.
 * It catches Every error in the app and send the report.
 *
 * @module ngx-customapp-errors
 */

export * from './lib/errors.module';
export * from './lib/errors-handler'

export * from './lib/services/errors.service'

export * from './lib/models/context-error'
export * from './lib/models/errors-config'
export * from './lib/models/errors-reporter'
export * from './lib/models/errors-text'
export * from './lib/models/unhandled-error-handler'

export * from './lib/constants/di-token'
export * from './lib/constants/errors-text'
