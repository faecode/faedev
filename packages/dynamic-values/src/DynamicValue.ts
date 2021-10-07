/* eslint-disable @typescript-eslint/ban-ts-ignore */
/* eslint-disable @typescript-eslint/no-this-alias */
/* eslint-disable @typescript-eslint/no-use-before-define */
// type Meta = {
//   local:
//   global: { [key: string]: any }
//   private: { [key: string]: any }
// }
type MetaValues = { [key: string]: unknown }
type MetaValuesAny = { [key: string]: any }

type NestedLocalMeta<Local extends MetaValues = MetaValuesAny> = {
  [key: string | number]: { nested: NestedLocalMeta<Local>; local: Local }
}

export class Meta<
  Local extends MetaValues = MetaValuesAny,
  Global extends MetaValues = MetaValuesAny
> {
  constructor({
    local,
    nested,
    global,
  }: {
    local: Local
    nested?: NestedLocalMeta<Local>
    global: Global
  }) {
    this.local = local
    this.nested = nested
    this.global = global
    this.forEachLocal = (callback: (local: Local) => void) => {
      // FIXME implement traversing over this and all nested, passing local in callback
      callback(this.local)
      function walkNested(nestedMap: NestedLocalMeta<Local>) {
        for (const [key, nestedRecord] of Object.entries(nestedMap)) {
          callback(nestedRecord.local)
          walkNested(nestedRecord.nested)
        }
      }
      if (this.nested) {
        walkNested(this.nested)
      }
    }
  }

  nested?: NestedLocalMeta<Local>
  local: Local
  global: Global
  forEachLocal: (callback: (local: Local) => void) => void
}

export class DynamicValue<T> {
  value: T
  meta: Meta
  change: (value: T, meta: Meta) => void
  map: <Z>(mappingFn: (d: T) => Z) => Z[]
  constructor(value: T, meta: Meta, change: (value: T, meta: Meta) => void) {
    this.value = value
    this.meta = meta
    this.change = (newValue: T, newMeta: Meta) => {
      // TODO consider moving it to "bind", this should mostly solve problem of compatibility with form elements returning different type than passed
      if (typeof value === "number") {
        // @ts-ignore
        change(Number(newValue))
      } else if (typeof value === "boolean") {
        // @ts-ignore
        change(Boolean(newValue))
      } else {
        change(newValue, newMeta)
      }
    }
    const that = this
    if (typeof value === "object") {
      const customProps: {
        [key: string]: { get: () => any }
      } = Object.fromEntries(
        Object.keys(value).map((key) => {
          return [
            key,
            {
              get: () => {
                return chainDynamicValue(that as DynamicValue<any>, key)
              },
            },
          ]
        }),
      )

      Object.defineProperties(this, customProps)
    }
    this.map = (mappingFn) =>
      universalEach(that as DynamicValue<any>, mappingFn)
  }
}

export type FormListErrors = { all?: string[]; each?: FormErrors[] }

export type FormErrors =
  | string[]
  | { [name: string]: FormErrors }
  | FormListErrors

export type FormTouched =
  | null
  | boolean
  | { [name: string]: FormTouched }
  | { any?: boolean; all?: boolean; each?: FormTouched[] }

function chainDynamicValue<V>(
  value: DynamicValue<SimpleIterable<V>>,
  key: string | number,
) {
  if (!(value instanceof DynamicValue)) {
    throw new Error(
      "chainDynamicValue doesn't accept other values than DynamicValue",
    )
  }
  const nestedMeta = value.meta.nested
  const meta = new Meta({
    local: nestedMeta[key] ? nestedMeta[key].local : {},
    nested: nestedMeta[key] ? nestedMeta[key].nested : {},
    global: value.meta.global,
  })
  return new DynamicValue(value.value[key], meta, function change(
    newInner: V,
    newMeta: Meta,
  ) {
    const newKeyNested = {
      local: newMeta.local,
      nested: newMeta.nested,
    }
    const newParentMeta = new Meta({
      local: value.meta.local,
      global: newMeta.global,
      nested: {
        ...value.meta.nested,
        [key]: newKeyNested,
      },
    })
    value.change({ ...value.value, [key]: newInner }, newParentMeta)
  })
}

type SimpleIterable<V> = V[] | { [key: string]: V }

export default function universalEach<V>(
  target: DynamicValue<SimpleIterable<V>>,
  callback: (item: any, key: any) => any,
) {
  if (target instanceof DynamicValue) {
    const pureValue = target.value

    if (Array.isArray(pureValue)) {
      return pureValue.map((valueItem, key) => {
        const item = chainDynamicValue(target, key)

        return callback(item, key)
      })
    } else if (typeof target === "object") {
      return Object.entries(target.value).map(([key, valueItem]) => {
        const item = chainDynamicValue(target, key)

        return callback(item, key)
      })
    }
  } else {
    throw new Error("Can't iterate")
  }
}
