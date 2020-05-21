export class DynamicValue<T> {
  value: T
  change: (meta: unknown, value: T) => void
  constructor(value: T, change: (meta: unknown, value: T) => void) {
    this.value = value
    this.change = change
  }
}
