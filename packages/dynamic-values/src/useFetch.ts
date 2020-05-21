import { useState, useEffect } from "react"

export type APIResult<T> = ["loading"] | ["error", string] | ["success", T]

export default function useFetch(
  url: string,
  requestOptions?: RequestInit,
): APIResult<unknown> {
  const [value, onChange] = useState<APIResult<unknown>>(["loading"])

  useEffect(() => {
    onChange(["loading"])
    fetch(url, requestOptions)
      .then((res) => res.json())
      .then((data) => {
        onChange(["success", data])
      })
      .catch((err) => {
        onChange(["error", String(err)])
      })
  }, [url, requestOptions])

  return value
}
