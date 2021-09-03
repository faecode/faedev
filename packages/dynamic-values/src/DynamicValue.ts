export type PropertyName = "checked" | "value" | "selected" | "fileName"
export class DynamicValue<T> {
  value: T
  change: (value: T) => void
  bind: (prop: PropertyName) => any
  map: <Z>(mappingFn: (d: T) => Z) => Z[]
  constructor(value: T, change: (value: T) => void) {
    this.value = value
    this.change = (newValue: T) => {
      // TODO consider moving it to "bind", this should mostly solve problem of compatibility with form elements returning different type than passed
      if (typeof value === "number") {
        // @ts-ignore
        change(Number(newValue))
      } else if (typeof value === "boolean") {
        // @ts-ignore
        change(Boolean(newValue))
      } else {
        change(newValue)
      } 
    }
    const that = this
    this.bind = (prop = "value") => {
      return dynamicValueToForm(prop, that)
    }
    if (typeof value === "object") {
      const customProps: {[key: string]: {get: () => any}} = Object.fromEntries(Object.keys(value).map((key) => {
        return [key, ({get: () => {
          return chainDynamicValue(that as DynamicValue<any>, key)
        }})]
      }))
      
      Object.defineProperties(this, customProps)
    }
    this.map = (mappingFn) => universalEach(that as DynamicValue<any>, mappingFn)
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

export class FormValue<T> extends DynamicValue<T> {
  touched: FormTouched
  touch: any
  error: FormErrors
  showErrors: boolean
  setShowErrors: (show: boolean) => void
  constructor(
    value: T,
    change: (value: T) => void,
    touched: FormTouched,
    touch: (touched: FormTouched) => void,
    error: FormErrors,
    showErrors: boolean,
    setShowErrors: (show: boolean) => void,
  ) {
    super(value, change)
    this.showErrors = showErrors
    this.touched = touched
    this.touch = touch
    this.error = error
    this.setShowErrors = setShowErrors
  }
}

function dynamicValueToForm<T>(
  propertyName: PropertyName,
  dynamicValue: FormValue<T> | DynamicValue<T> | T,
  onChange?: (value: T) => void,
  eventParameter = true,
) {
  const getValue = (param) => {
    if (eventParameter) {
      return param.target[propertyName]
    }
    return param
  }

  if (typeof dynamicValue === undefined || dynamicValue === null) {
    return {
      [propertyName]: propertyName === "checked" ? true : "value",
      onChange: (param) => {
        if (onChange) {
          onChange(param)
        }
        alert(
          `Attempted to change dynamic value, new value: '${String(
            getValue(param),
          )}'`,
        )
      },
    }
  }

  if (dynamicValue && dynamicValue instanceof DynamicValue) {
    const additionalProps = {}
    if (dynamicValue instanceof FormValue) {
      if (dynamicValue.touched === true || dynamicValue.showErrors) {
        if (typeof dynamicValue.error === "string") {
          additionalProps["error"] = dynamicValue.error
        }
        if (Array.isArray(dynamicValue.error)) {
          additionalProps["error"] = dynamicValue.error[0]
        }
      }
      additionalProps["onBlur"] = function () {
        dynamicValue.touch(true)
        // TODO pass to original event
      }
    }

    return {
      ...additionalProps,
      [propertyName]: dynamicValue.value,
      onChange: (param: any): void => {
        if (onChange) {
          // On change always keeps original event or value
          onChange(param)
        }

        return dynamicValue.change(getValue(param))
      },
    }
  }

  return {
    [propertyName]: dynamicValue,
    onChange: (param: any): void => {
      if (onChange) {
        onChange(param)
      }
    },
  }
}

function chainDynamicValue(
  $value:
    | DynamicValue<{ [key: string]: unknown }>
    | FormValue<{ [key: string]: unknown }>,
  key: string,
) {
  if ($value instanceof FormValue) {
    const pureTouched = $value.touched
    const { touch, touched } =
      pureTouched && typeof pureTouched === "object"
        ? {
            touched: pureTouched[key],
            touch: (newValue: FormTouched) => {
              const newTouched = { ...pureTouched }
              newTouched[key] = newValue
              $value.touch(newTouched)
            },
          }
        : {
            touched: false,
            touch: (newValue: FormTouched) => {
              const newTouched: { [name: string]: FormTouched } = {}
              newTouched[key] = newValue
              $value.touch(newTouched)
            },
          }

    return new FormValue(
      $value.value[key],
      function (newInner: unknown) {
        $value.change({ ...$value.value, [key]: newInner })
      },
      touched,
      touch,
      $value.error && $value.error[key],
      $value.showErrors,
      $value.setShowErrors,
    )
  }
  if ($value instanceof DynamicValue) {
    return new DynamicValue($value.value[key], function (newInner: unknown) {
      $value.change({ ...$value.value, [key]: newInner })
    })
  }
}

type SimpleIterable<V> = V[] | { [key: string]: V }

export default function universalEach<V>(
  target: DynamicValue<SimpleIterable<V>> | FormValue<SimpleIterable<V>>,
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
                  throw new Error("iteration touch on map is not implemented yet")
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
    throw new Error("Can't iterate")
  }
}
