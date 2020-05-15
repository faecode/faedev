import createDynamicValue from "./createDynamicValue"

describe("createDynamicValue", () => {
  it("creates a simple value", () => {
    const val = createDynamicValue(10, () => {
      return
    })
    expect(val.value).toBe(10)
  })

  it("creates an object value", () => {
    const val = createDynamicValue({ prop: 20 }, () => {
      return
    })
    expect(val.value.prop).toBe(20)
  })

  it("can't create dynamic value from dynamic value", () => {
    const val = () => {
      createDynamicValue({ prop: 20, isDynamic: true }, () => {
        return
      })
    }
    expect(val).toThrow()
  })
})
