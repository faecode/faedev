import { DynamicValue } from "./DynamicValue"

export type PropertyName = "checked" | "value" | "selected" | "fileName"

export default function bindHtml<T>(
  propertyName: PropertyName,
  dynamicValue: DynamicValue<T> | T,
  onChange?: (value: T | Event) => void,
) {
  const getValue = (eventOrValue: T | Event): T => {
    if (eventOrValue instanceof Event) {
      return eventOrValue.target[propertyName]
    }
    return eventOrValue
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

    return {
      ...additionalProps,
      [propertyName]: dynamicValue.value,
      onChange: (param: any): void => {
        if (onChange) {
          // On change always keeps original event or value
          onChange(param)
        }

        return dynamicValue.change(getValue(param), {
          ...dynamicValue.meta,
          local: { ...dynamicValue.meta.local, changed: true },
        })
      },
      onBlur: (): void => {
        return dynamicValue.change(dynamicValue.value, {
          ...dynamicValue.meta,
          local: { ...dynamicValue.meta.local, touched: true },
        })
      },
    }
  }

  return {
    [propertyName]: dynamicValue,
    onChange: (param: Event | T): void => {
      if (onChange) {
        onChange(param)
      }
    },
  }
}
