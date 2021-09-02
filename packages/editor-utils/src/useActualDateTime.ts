import { V } from "@faedev/variant"
import { useState } from "react"
import { useOnce } from "./useOnce"

export function useActualDateTime(
  refresh:
    | ["onLoad"]
    | [
        "periodic",
        { value: number; unit: ["seconds"] | ["minutes"] | ["hours"] },
      ],
) {
  const [date, setDate] = useState(new Date())
  useOnce(() => {
    V.branch(refresh, {
      onLoad: () => undefined,
      periodic: (periodic) => {
        const multiplier = V.branch(periodic.unit, {
          seconds: () => 1000,
          minutes: () => 60 * 1000,
          hours: () => 60 * 60 * 1000,
        })
        setInterval(() => {
          setDate(new Date())
        }, periodic.value * multiplier)
      },
    })
  })
  return date
}
