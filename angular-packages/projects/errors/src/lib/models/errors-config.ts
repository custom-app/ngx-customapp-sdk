import {ErrorsText} from './errors-text';

export interface ErrorsConfig<Locales extends keyof any> {
  /**
   * A map from normalized (lowercase, ASCII letters) error strings (for example 'not found') into human-readable messages,
   * grouped by locale. The Locales type depends on you, but we recommend to use something like ISO639-2.
   */
  errorsText: ErrorsText<Locales>,
  /**
   * To detect, if the error is a response from the backend. The type of the error response
   * depends on the backend.
   * @param error The error to be tested.
   */
  isErrorResponse: (error: any) => void,

}
