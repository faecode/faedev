import { useState } from "react"
import { useComponentState } from "../dist"

import { DynamicValue } from "./DynamicValue"

export default function nonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined
}

const meta = {}

type FormValidators =
  | {
      all?: ((value: unknown) => string)[]
      each?: FormValidators
    }
  | { [name: string]: FormValidators }
  | ((value: unknown) => string)[]
  | null

function validate<Value>(value: Value, validators: FormValidators): FormErrors {
  if (!validators) {
    return []
  }
  if (Array.isArray(validators)) {
    return validators
      .map((validator) => {
        if (typeof validator === "function") {
          const res = validator(value)

          return res
        }
      })
      .filter(nonNullable)
  }

  if (Array.isArray(value)) {
    const each = validators.each
    const formListErrors: FormListErrors = {
      all: Array.isArray(validators.all)
        ? validators.all.map((validator) => validator(value))
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
  initial: T,
  validator: FormValidators = null,
): DynamicValue<T> {
  const value = useComponentState(initial, {
    onInit,
    onChange: (value, meta) => {
      // FIXME if anything inside is touched, set private prop someTouched to true
      
    },
  })

  return [value, formControls: {
    showAllErrors: () => {
      // FIXME mark global.showAllErrors = true
    }
  }]
}
