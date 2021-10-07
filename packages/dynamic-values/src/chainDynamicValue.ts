import { DynamicValue } from "./DynamicValue"
import { FormValue, FormTouched } from "./FormValue"

export function chainDynamicValue(
  $value:
    | DynamicValue<{ [key: string]: any }>
    | FormValue<{ [key: string]: any }>,
  key: string,
): DynamicValue<any> {
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
