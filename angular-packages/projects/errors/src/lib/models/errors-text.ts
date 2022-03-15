/**
 * The locale id, provided by [LOCALE_ID](https://angular.io/api/core/LOCALE_ID) injection token,
 * according to the [angular i18n](https://angular.io/guide/i18n-common-locale-id)
 */
export type LocaleId = string
/**
 * Lowercase ASCII error message, identifying the error. For example 'not found',
 * 'service unavailable', etc.
 */
export type NormalizedError = string
/**
 * Translated human-readable error with hints to the user.
 */
export type HumanReadableError = string
/**
 * A dictionary of human-readable errors, grouped locales.
 */
export type ErrorsText = Record<LocaleId, Record<NormalizedError, HumanReadableError>>
