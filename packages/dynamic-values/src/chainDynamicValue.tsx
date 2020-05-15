import DynamicValue from "./DynamicValue"
import FormValue, { FormTouched } from "./FormValue"

export default function chainDynamicValue(
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
      function (meta: unknown, newInner: unknown) {
        $value.change(meta, { ...$value.value, [key]: newInner })
      },
      touched,
      touch,
      $value.error && $value.error[key],
      $value.showErrors,
      $value.setShowErrors,
    )
  }
  if ($value instanceof DynamicValue) {
    return new DynamicValue($value.value[key], function (
      meta: unknown,
      newInner: unknown,
    ) {
      $value.change(meta, { ...$value.value, [key]: newInner })
    })
  }
}
