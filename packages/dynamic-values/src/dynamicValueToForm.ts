import { DynamicValue } from "./DynamicValue"
import { FormValue } from "./FormValue"

export default function dynamicValueToForm<T>(
  propertyName: "checked" | "value" | "selected" | "fileName",
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
