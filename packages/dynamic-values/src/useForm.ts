import { useState } from "react"

import { FormValue, FormErrors, FormListErrors, FormTouched } from "./FormValue"
import { DynamicValue } from "./DynamicValue"

export default function nonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

const meta = {}

type FormValidators =
  | {
      all?: ((meta: any, value: unknown) => string)[]
      each?: FormValidators
    }
  | { [name: string]: FormValidators }
  | ((meta: any, value: unknown) => string)[]
  | null

function validate<Value>(value: Value, validators: FormValidators): FormErrors {
  if (!validators) {
    return []
  }
  if (Array.isArray(validators)) {
    return validators
      .map((validator) => {
        if (typeof validator === "function") {
          const res = validator(meta, value)

          return res
        }
      })
      .filter(nonNullable)
  }

  if (Array.isArray(value)) {
    const each = validators.each
    const formListErrors: FormListErrors = {
      all: Array.isArray(validators.all)
        ? validators.all.map((validator) => validator(meta, value))
        : undefined,
      each: each
        ? value.map((item): FormErrors => validate(item, each))
        : undefined,
    }

    return formListErrors
  }

  if (typeof value === "object" && typeof validators === "object") {
    const result = {}
    Object.keys(validators).forEach((key) => {
      const subValidators = validators[key]
      result[key] = validate(value[key], subValidators)
    })

    return result
  }

  return []
}

export function useForm<T>(
  _,
  initial: T,
  validator: FormValidators = null,
): FormValue<T> | DynamicValue<T> {
  const [value, change] = useState<T>(initial)
  const [touched, setTouched] = useState<FormTouched>(null)
  // TODO need
  const [showErrors, setShowErrors] = useState<boolean>(false)

  return new FormValue(
    value,
    (newValue) => change(newValue),
    touched,
    setTouched,
    validate(value, validator),
    showErrors,
    setShowErrors,
  )
}
