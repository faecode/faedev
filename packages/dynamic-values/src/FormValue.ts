import { DynamicValue } from "./DynamicValue"

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
    change: (meta: unknown, value: T) => void,
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
