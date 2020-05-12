import V from "."

function match<
  T extends [string, any] | [string],
  Obj extends Handler extends null | undefined
    ? { [K in T[0]]: (value: Extract<T, [K, any] | [K]>[1], type: K) => any }
    : { [K in T[0]]?: (value: Extract<T, [K, any] | [K]>[1], type: K) => any },
  Handler extends ((type: T[0]) => any) | null | undefined
>(
  variant: T,
  switchObject: Obj,
  defaultHandler: Handler,
): ReturnType<Extract<Obj[keyof Obj] | Handler, Function>> {
  if (variant === null || variant === undefined) {
    throw new Error("Variant is not defined")
  }
  if (!Array.isArray(variant)) {
    console.error(`Can't match non-tuple:`, variant)

    throw new Error(`Can't match non-tuple: ${String(variant)}`)
  }

  const fn = switchObject[V.type(variant)]
  if (!fn) {
    if (typeof defaultHandler === "function") {
      return defaultHandler(V.type(variant))
    } else {
      const availableKeys = Object.keys(switchObject)
      throw new Error(
        `type "${V.type(
          variant,
        )}" is not in provided switchObject. Included types: ${availableKeys.join(", ")}`,
      )
    }
  }
  return fn(V.value(variant), V.type(variant))
}

export default match
