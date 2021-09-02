export function withDefault<T>(
  maybeValue: T | null | undefined,
  defaultValue: T,
): T {
  return maybeValue === null || maybeValue === undefined
    ? defaultValue
    : maybeValue
}
