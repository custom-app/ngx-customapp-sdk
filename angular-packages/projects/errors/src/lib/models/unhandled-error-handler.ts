/**
 * The name speaks for itself.
 */
export abstract class UnhandledErrorHandler {

  /**
   * Method is called, when an error is thrown anywhere in an Angular app, and
   * not caught by the app. You may want to use it to show an error overlay,
   * asking user to reload the page. Useful when building a finance application,
   * where errors cannot be tolerated.
   * @param error raw error.
   */
  abstract unhandledError(error: any): void
}
