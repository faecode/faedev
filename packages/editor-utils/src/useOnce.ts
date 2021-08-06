import { useEffect } from "react"

export function useOnce(callback: () => void | (() => void)) {
  useEffect(callback, [])
}
