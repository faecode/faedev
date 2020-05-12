type Variant = [any, any] | [any]

const checkVariantDefined = (variant: any) => {
  if (variant === null || variant === undefined) {
    throw new Error("Variant is not defined")
  }
}

const V = {
  type: function <T extends Variant>(variant: T): T[0] {
    checkVariantDefined(variant)
    return variant[0]
  },

  /**
   * @deprecated
   */
  value: function <T extends Variant>(variant: T): any {
    // TODO replace return with T[1] and fix type errors
    checkVariantDefined(variant)
    return variant[1]
  },

  valueIf: function <
    T extends [K | string, any] | [K | string],
    K extends string
  >(variant: T, variantType: K): Extract<T, [K, any]>[1] {
    if (V.type(variant) === variantType) {
      return V.value(variant)
    } else {
      throw new Error(
        `Unexpected access to '${V.type(
          variant,
        )}' of variant, it should be '${variantType}'`,
      )
    }
  },

  // TODO use something like this: get<K: $Keys<Person>>(person: Person, field: K): $ElementType<Person, K>;
  if: <T extends [K | string, any] | [K | string], K extends string>(
    variant: T,
    variantType: K,
  ): Extract<T, [K, any]>[1] | null => {
    if (V.type(variant) === variantType) {
      return V.value(variant)
    } else {
      return null
    }
  },

  branch: function <
    T extends [string, any] | [string],
    Return extends ReturnType<Extract<Obj[keyof Obj], Function>>,
    Obj extends {
      [K in T[0]]?: (value: Extract<T, [K, any] | [K]>[1], type: K) => any
    }
  >(variant: T, switchObject: Obj): Return {
    checkVariantDefined(variant)
    const fn = switchObject[V.type(variant)]
    if (!fn) {
      const availableKeys = Object.keys(switchObject)

      throw new Error(
        `type "${V.type(
          variant,
        )}" is not in provided switchObject. Included types: ${availableKeys.join(
          ", ",
        )}`,
      )
    }
    return fn(V.value(variant), V.type(variant))
  },

  map: (variant: Variant, switchObject: { [key: string]: Function }): any => {
    checkVariantDefined(variant)
    if (!switchObject[V.type(variant)]) {
      const availableKeys = Object.keys(switchObject)
      throw new Error(
        `type "${V.type(
          variant,
        )}" is not in provided switchObject. Included types: ${availableKeys.join(
          ", ",
        )}`,
      )
    }
    return [
      V.type(variant),
      switchObject[V.type(variant)](V.value(variant), V.type(variant)),
    ]
  },

  extract: (collection: Array<Variant> | Record<string, any>): any => {
    if (Array.isArray(collection)) {
      const res = {}
      collection.forEach((variant) => {
        const type = V.type(variant)
        if (!res[type]) {
          res[type] = []
        }
        res[type].push(V.value(variant))
      })
      return res
    } else if (typeof collection === "object") {
      const res = {}
      Object.keys(collection).forEach((key) => {
        const variant = collection[key]
        const type = V.type(variant)
        if (!res[type]) {
          res[type] = {}
        }
        res[type][key] = V.value(variant)
      })
      return res
    } else {
      throw new Error("type is not supported")
    }
  },
}

export default V
