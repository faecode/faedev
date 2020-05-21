import { useState } from "react"

import { DynamicValue } from "./DynamicValue"
import { createDynamicValue } from "./createDynamicValue"

export function useComponentState<T>(initial: T): DynamicValue<T> {
  const [value, change] = useState<T>(initial)
  return createDynamicValue(value, (meta, newValue) => change(newValue))
}
