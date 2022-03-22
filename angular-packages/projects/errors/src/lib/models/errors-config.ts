import {ErrorsText, NormalizedError} from './errors-text';
import {UnhandledErrorHandlerConstructor} from './unhandled-error-handler';
import {ErrorsReporterConstructor} from './errors-reporter';

/**
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
 *       this.errorsService.displayError(error);
 *     })
 *   ), {dispatch: false})
 * ```
 *
 * For errors, that were not handled inside the observable, custom error handler {@link ErrorsHandler} is written.
 * It catches Every error in the app and send the report.
 */
export interface ErrorsConfig {
  /**
   * A dictionary of human-readable errors, grouped locales.
   * Locales are referred using the locale id, provided by [LOCALE_ID](https://angular.io/api/core/LOCALE_ID)
   * injection token, according to the [angular i18n](https://angular.io/guide/i18n-common-locale-id)
   * If there is no human-readable error, error.toString() will be shown.
   */
  errorsText: ErrorsText,
  /**
   * Errors are reported only in the production
   */
  production: boolean,
  /**
   * The errors to be explicitly ignored and not reported.
   */
  doNotSend?: NormalizedError[]
  /**
   * To detect, if the error is a response from the backend or a network or app error. The type of the error response
   * depends on the backend.
   * @param error The error to be tested.
   */
  isErrorResponse: (error: any) => boolean,
  /**
   * Converts the error response from the backend into normalized error text, used as a key
   * to get human-readable error from {@link ErrorsConfig.errorsText}.
   * @param errorResponse the error response from the backend, detected by isErrorResponse function.
   */
  errorResponseToNormalizedError: (errorResponse: any) => NormalizedError
  /**
   * Can be used to extract non-translated information about error.
   * @param errorResponse the error response from the backend, detected by isErrorResponse function.
   */
  errorResponseToAppendix?: (errorResponse: any) => string
  /**
   * Provides a function to send the error report to the backend. Must implement ErrorsReporter abstract class
   */
  reporter: ErrorsReporterConstructor,
  /**
   * The only method of this service is called, when an error is thrown
   * anywhere in an Angular app, and not caught by the app.
   * You may want to use it to show an error overlay,
   * asking user to reload the page. Useful when building a finance application,
   * where errors cannot be tolerated.
   */
  unhandled?: UnhandledErrorHandlerConstructor,
}
