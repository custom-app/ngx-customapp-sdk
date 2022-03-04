export function softCall<ArgsType extends any[], ReturnType>(
  func?: (...args: ArgsType) => ReturnType,
  ...args: ArgsType
): ReturnType | undefined {
  if (func) {
    return func(...args)
  }
  return undefined
}
