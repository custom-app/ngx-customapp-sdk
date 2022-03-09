export function condCall<ArgsType extends any[], ReturnType>(
  defaultValue: ReturnType, // the value to return, if no function is provided
  func?: (...args: ArgsType) => ReturnType,
  ...args: ArgsType
): ReturnType {
  if (func) {
    return func(...args)
  }
  return defaultValue
}
