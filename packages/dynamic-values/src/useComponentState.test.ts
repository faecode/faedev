import { renderHook, act } from "@testing-library/react-hooks"
import { useComponentState } from "./useComponentState"

describe("useDynamicValue hook", () => {
  it("should ", () => {
    const { result } = renderHook(() => useComponentState(10))
    expect(result.current.value).toBe(10)
    act(() => {
      result.current.change(20)
    })
    expect(result.current.value).toBe(20)
  })
})
