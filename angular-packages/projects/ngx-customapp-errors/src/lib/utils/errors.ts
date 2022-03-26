import {ContextError} from '../models/context-error';
import {ErrorsText, LocaleId} from '../models/errors-text';
import {ErrorsConfig} from '../models/errors-config';

/**
 * @internal
 * Normalizes any error, except error response from backend,
 * which is handled by {@link ErrorsConfig.errorResponseToNormalizedError}
 */
export function normalizeError(error: any): string {
  return (error + '').toLocaleLowerCase()
}

/**
 * @internal
 * Safely transforms any error into the text. Prepares message to be the field of the JSON message.
 */
export function stringifyError(error: any): string {
  let str;
  try {
    str = JSON.stringify(error).replace(/"/g, '\'');
    if (str === '{}') {
      str = error + '';
    }
  } catch (e) {
    str = (error + '').replace(/"/g, '\'');
  }
  return str;
}

/**
 * @internal
 * Prepares the error to be reported
 */
export function addErrorContext(error: any): ContextError {
  return {
    url: window.location.href,
    time: Date.now(),
    error: stringifyError(error),
  };
}

/**
 * @internal
 * Gets human-readable error
 */
export function getErrorText(
  error: string,
  locale: LocaleId,
  errorsText: ErrorsText,
  errorResponseToAppendix?: (error: any) => string | undefined
): string {
  if (error) {
    const errText = errorsText[locale][error.trim().toLowerCase()];
    if (errText) {
      if (errorResponseToAppendix) {
        try {
          const appendix = errorResponseToAppendix(error)
          return errText + (appendix && appendix !== 'undefined' ? appendix : '')
        } catch (e) {
          return errText
        }
      } else {
        return errText
      }
    } else {
      // if there is no human-readable error text
      return error + '';
    }
  } else {
    return errorsText[locale]['no connection'];
  }
}

/**
 * @internal
 * Tries to transform any error into the human-readable error.
 */
export function errorToUserText(
  error: any,
  config: ErrorsConfig,
  locale: LocaleId,
): string {
  if (config.isErrorResponse(error)) {
    return getErrorText(config.errorResponseToNormalizedError(error), locale, config.errorsText, config.errorResponseToAppendix);
  } else if (error.message === 'Timeout has occurred') {
    // timeout of the observable (usually the request into socket)
    return getErrorText(error.message, locale, config.errorsText);
  } else if (error.message) {
    return getErrorText(error.message, locale, config.errorsText);
  } else if (typeof error === 'string') {
    return getErrorText(error, locale, config.errorsText);
  } else {
    return getErrorText(stringifyError(error), locale, config.errorsText);
  }
}
