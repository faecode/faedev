export function ifDefined<T>(
  value: unknown | null | undefined,
  thenFn: (variantValue: any) => T,
  elseFn: () => T,
): T {
  if (value === null || value === undefined) {
    return elseFn()
  } else {
    return thenFn(value)
  }
}
