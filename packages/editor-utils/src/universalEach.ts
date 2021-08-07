/* eslint-disable @typescript-eslint/ban-ts-ignore */
import { DynamicValue, FormTouched, FormValue } from "@faedev/dynamic-values"

type SimpleIterable<V> = V[] | { [key: string]: V }
export function universalEach<V>(
  target:
    | DynamicValue<SimpleIterable<V>>
    | FormValue<SimpleIterable<V>>
    | SimpleIterable<V>,
  callback: (item: any, key: any) => any,
) {
  if (target instanceof DynamicValue) {
    const pureValue = target.value

    if (Array.isArray(pureValue)) {
      return pureValue.map((valueItem, key) => {
        const change = (newValue: V) => {
          const newTarget = [...pureValue]
          newTarget[key] = newValue
          target.change(newTarget)
        }

        let item: DynamicValue<V> | FormValue<V>
        if (target instanceof FormValue) {
          const pureTouched = target.touched
          const { touch, touched } = Array.isArray(pureTouched)
            ? {
                touched: pureTouched[key],
                touch: (newValue: FormTouched) => {
                  const newTouched = [...pureTouched]
                  newTouched[key] = newValue
                  target.touch(newTouched)
                },
              }
            : {
                touched: false,
                touch: (newValue: FormTouched) => {
                  const newTouched: FormTouched[] = []
                  newTouched[key] = newValue
                  target.touch(newTouched)
                },
              }

          // @ts-ignore
          const eachError = target.error ? target.error.each : null
          item = new FormValue(
            valueItem,
            change,
            touched,
            touch,
            Array.isArray(eachError) ? eachError[key] : null,
            target.showErrors,
            target.setShowErrors,
          )
        } else {
          item = new DynamicValue(valueItem, change)
        }

        return callback(item, key)
      })
    } else if (typeof target === "object") {
      return Object.entries(target.value).map(([key, valueItem]) => {
        const change = (newValue: V) => {
          if (typeof key === "string") {
            const newTarget = { ...target.value }
            newTarget[key] = newValue
            target.change(newTarget)
          }
        }

        const item =
          target instanceof FormValue
            ? new FormValue(
                valueItem,
                change,
                false,
                () => {
                  throw new Error(
                    "iteration touch on map is not implemented yet",
                  )
                },
                // @ts-ignore
                target.error.each[key],
                target.showErrors,
                target.setShowErrors,
              )
            : new DynamicValue(valueItem, change)

        return callback(item, key)
      })
    }
  } else {
    if (Array.isArray(target)) {
      return target.map(callback)
    } else if (typeof target === "object" && target) {
      return Object.entries(target).map(([key, item]) => callback(item, key))
    }

    return null
  }
}
