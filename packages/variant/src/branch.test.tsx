import V from "./index"

it("branch", () => {
  const res = V.branch(["ok", 10], {
    ok: (x: number) => x + 32,
    error: (e: any) => e,
  })
  expect(res).toBe(42)
})

it("more branch", () => {
  type Res = ["ok", number] | ["error", string]

  const switchObject = {
    ok: (x: number) => x + 2,
    error: (e: any) => `error: ${e}`,
  }

  expect(V.branch(["error", "something wrong"] as Res, switchObject)).toBe("error: something wrong")
  expect(V.branch(["ok", 40], switchObject)).toBe(42)
})

it("branch with types", () => {
  const switchObject = {
    ok: (x: any, type: any) => `${type} ${x}`,
    error: (e: any) => `error: ${e}`,
  }

  expect(V.branch(["error", "something wrong"], switchObject)).toBe("error: something wrong")
  expect(V.branch(["ok", "yo"], switchObject)).toBe("ok yo")
})

it("extract from array", () => {
  const arr = [
    ["ok", 2],
    ["ok", 3],
    ["error", "something broken"],
  ]
  expect(V.extract(arr)).toEqual({ ok: [2, 3], error: ["something broken"] })

  const arr2 = [
    ["yo", "ghurt"],
    ["area", 51],
    ["bam", "bino"],
  ]
  expect(V.extract(arr2)).toEqual({ yo: ["ghurt"], area: [51], bam: ["bino"] })
})

it("extract from map", () => {
  const arr = { a: ["ok", 2], b: ["ok", 3], c: ["error", "something broken"] }
  expect(V.extract(arr)).toEqual({ ok: { a: 2, b: 3 }, error: { c: "something broken" } })

  // const arr2 = [["yo", "ghurt"],["area", 51],["bam", "bino"]]
  // expect(V.extract(arr2)).toEqual({yo: ["ghurt"], area: [51], bam: ["bino"]})
})

it("just experiments with traverse", () => {
  // const fn = (x) => {
  //   return x[0] === "error" ? [] : x[1]
  // }
  // const res = R.traverse((x) => x, fn, [["error", "something wrong"], ["ok", 1], ["error", 3]])
})
