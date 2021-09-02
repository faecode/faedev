// this is meant to be very bundle lightweight version of deep equal. I think we should later add equivalence operators based on actual static type of inputs.
export function deepEqual(a: unknown, b: unknown): boolean {
  if (a === b) {
    return true
  } else {
    try {
      return JSON.stringify(a) === JSON.stringify(b)
    } catch (e) {
      return false
    }
  }
}
