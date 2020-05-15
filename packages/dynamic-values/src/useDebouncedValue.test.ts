import createDynamicValue from "./createDynamicValue"
import { renderHook, act } from "@testing-library/react-hooks"
import useComponentState from "./useComponentState"
import useDebouncedValue from "./useDebouncedValue"

describe("useDebouncedValue hook", () => {
  it("sets initial value", () => {
    const { result } = renderHook(() =>
      useDebouncedValue(useComponentState(10)),
    )
    expect(result.current).toBe(10)
  })
})
