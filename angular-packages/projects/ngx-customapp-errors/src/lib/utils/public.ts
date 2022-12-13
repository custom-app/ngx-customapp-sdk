/**
 * Used to mark unreachable code statements. For example:
 * ```typescript
 * function boatCapacity(type: 'long' | 'short'): number {
 *   if (type === 'long') {
 *     return 16
 *   } else if (type === 'short') {
 *     return 4
 *   } else {
 *     return unreachable('unknown boat type')
 *   }
 * }
 * ```
 * @param msg a error message to be thrown
 */
export const unreachable = <T>(msg: string): T => {
  throw new Error(`Unreachable statement: ${msg}`)
}

/**
 * Just a simple assert, cos there is none in the browser standard lib
 * @param v value to be asserted
 * @param msg assertion message
 */
export function assert(v: any, msg: string): asserts v {
  if (!v) {
    throw new Error(`Assertion failed ${msg}`)
  }
}

/**
 * Safely transforms any error into the text. Prepares message to be the field of the JSON message.
 */
export function stringifyError(error: any): string {
  if (typeof error === 'string') {
    return error
  }
  if (error instanceof Error) {
    if (error.stack) {
      return error.stack
    } else {
      return `${error.name}: ${error.message}`
    }
  }
  let str
  try {
    str = JSON.stringify(error)
    if (str === '{}') {
      str = error + ''
    }
  } catch (e) {
    str = (error + '')
  }
  return str
}
