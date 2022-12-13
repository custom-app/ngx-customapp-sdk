import {ErrorsText, NormalizedError} from './errors-text';
import {UnhandledErrorHandlerConstructor} from './unhandled-error-handler';
import {ErrorsReporterConstructor} from './errors-reporter';

/**
 * Main configuration object. Describes how to detect, translate and report errors.
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
   * To detect, if a caught error is a response from the backend or a network or app error. The type of the error response
   * depends on the backend.
   * NOT used to detect, if a response is an error. Only applied to errors.
   * @param error The error to be tested.
   */
  isErrorResponse: (error: any) => boolean,
  /**
   * Converts the error response from the backend into normalized error text, used as a key
   * to get human-readable error from {@link ErrorsConfig.errorsText}.
   * Should handle null arguments, cos nothing is guaranteed. If null argument is passed,
   * you could just return 'undefined' string and add it to {@link ErrorsConfig.errorsText}.
   * @param errorResponse the error response from the backend, detected by isErrorResponse function.
   */
  errorResponseToNormalizedError: (errorResponse: any) => NormalizedError
  /**
   * Can be used to extract non-translated information about error.
   * Should handle null arguments, cos nothing is guaranteed.
   * @param errorResponse the error response from the backend, detected by {@link ErrorsConfig.isErrorResponse} function.
   */
  errorResponseToAppendix?: (errorResponse: any) => string | undefined
  /**
   * A service which provides a function to send the error report to the backend.
   * Must implement {@link ErrorsReporter} abstract class
   */
  reporter: ErrorsReporterConstructor,
  /**
   * A service used to handle unhandled errors.
   * The only method of this service is called, when an error is thrown
   * anywhere in an Angular app, and not caught by the app.
   * You may want to use it to show an error overlay,
   * asking user to reload the page. Useful when building a finance application,
   * where errors cannot be tolerated.
   */
  unhandled?: UnhandledErrorHandlerConstructor,
}
