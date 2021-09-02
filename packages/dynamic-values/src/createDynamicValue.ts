import { DynamicValue } from "./DynamicValue"

export function createDynamicValue(input: any, change: (value: any) => void) {
  if (input && input.isDynamic) {
    throw new Error("Can't create dynamic value from dynamic value!")
  }

  return new DynamicValue(input, change)
}
