export function urlExcluded(url: string, excludedUrls?: (string | RegExp)[]): boolean {
  const found = excludedUrls?.find(stringOrRegexp => {
    if (stringOrRegexp instanceof RegExp) {
      return url.match(stringOrRegexp)
    } else {
      return url.startsWith(stringOrRegexp)
    }
  })
  return !!found
}
