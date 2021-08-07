export class DynamicValue<T> {
  value: T
  change: (value: T) => void
  constructor(value: T, change: (value: T) => void) {
    this.value = value
    this.change = change
  }
}
