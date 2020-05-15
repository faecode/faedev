import { useState, useEffect } from "react"

import DynamicValue from "./DynamicValue"

export default function useDebouncedValue<T>(dynamicValue: DynamicValue<T>): T {
  const [state, onChange] = useState(dynamicValue.value)

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      onChange(dynamicValue.value)
    })
    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [dynamicValue.value])

  return state
}
