import match from "./match"

type Res = ["ok", number] | ["error", string] | ["loading"]

describe("match", () => {
  test("basic", () => {
    const res: Res = ["ok", 4]
    const x: string = match(
      res as Res,
      {
        ok: (value) => `woo: ${value}`,
        error: (e) => e,
        loading: () => "",
      },
      null,
    )
    expect(x).toEqual("woo: 4")
  })

  test("with default", () => {
    const res: Res = ["error", "s"]
    const x: string | null = match(
      res as Res,
      {
        ok: () => "woo",
        loading: () => null,
      },
      () => "boo",
    )
    expect(x).toEqual("boo")
  })
})
