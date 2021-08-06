import { useEffect, useState } from "react"

export type UseAsyncDataResult<T> = {
  result: null | T
  loading: boolean
  error: null | string
}

export function useAsyncData<T>(
  dataFunction: () => Promise<T>,
  refreshOn: unknown[],
): UseAsyncDataResult<T> {
  const [result, setResult] = useState<null | T>(null)
  // this loading indicates also reloading while result is still loaded
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<null | string>(null)

  useEffect(() => {
    function run() {
      setLoading(true)
      setError(null)

      dataFunction()
        .then((value: T) => {
          setLoading(false)
          setResult(value)
          setError(null)
        })
        .catch((err) => {
          setLoading(false)
          setResult(null)
          setError(String(err))
        })
    }

    run()
  }, refreshOn || [])

  return {
    result,
    loading,
    error,
  }
}
