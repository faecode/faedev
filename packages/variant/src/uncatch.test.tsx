import { catchIt, throwMsg, throwIt } from "./uncatch"

it("catchIt", () => {
  const z = catchIt((x: number) => {
    if (x === 1) {
      throw "err" // eslint-disable-line no-throw-literal
    }
    return "x"
  })

  expect(z(1)).toEqual(["error", "err"])
  expect(z(2)).toEqual(["ok", "x"])
})

it("throwIt", () => {
  const y = throwIt((x: number) => {
    if (x === 1) {
      return ["error", "nono"]
    }
    return ["ok", "yay"]
  })

  expect(() => {
    y(1)
  }).toThrow()

  expect(y(0)).toEqual("yay")
})

it("throwMsg", () => {
  expect(() => {
    throwMsg("msg")
  }).toThrow()
})
