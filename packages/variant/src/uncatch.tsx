import V from "./index"

export const catchIt = (fn: Function) => {
  return (...args: any) => {
    try {
      return ["ok", fn(...args)]
    } catch (e) {
      return ["error", e]
    }
  }
}

export const throwIt = (fn: Function) => {
  return (...args: any) => {
    const res = fn(...args)
    if (V.type(res) === "error") {
      throw V.value(res)
    } else {
      return V.value(res)
    }
  }
}

export const throwMsg = (msg: string): never => {
  throw new Error(msg)
}
