import { useEffect, useState } from "react"

export type APIResult<T> = ["loading"] | ["error", string] | ["success", T]

export function useDebouncedParams<T>(value: T, delay: number | null = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    if (typeof delay === "number") {
      const handler = setTimeout(() => {
        setDebouncedValue(value)
      }, delay)

      return () => {
        clearTimeout(handler)
      }
    }
  }, [JSON.stringify(value)])

  return typeof delay === "number" ? debouncedValue : value
}

type IntervalInSeconds = number

type Options<T> = {
  repeatOnError?: (
    error: string,
    repeatCount: number,
  ) => IntervalInSeconds | null
  repeatOnSucess?: (value: T, repeatCount: number) => IntervalInSeconds | null
  debounce?: number
  // onSuccess?: (res: T) => void
  keepResultUntilLoaded?: {
    onRepeatOnError?: boolean
    onRepeatOnSuccess?: boolean
    onReload?: boolean // reload means paramsChange or manual reload
  }
  // advanced?: {
  //   maxRepeatCount: number
  //   minRepeatInterval: number
  // }
}

export type UseDataResult<T> = {
  data: APIResult<T>
  intermediateLoading: boolean
  reload: (options: { keepOriginalResultUntilReloaded: boolean }) => void
}

// use always the same constant to keep the reference same
const loadingResult: APIResult<any> = ["loading"]

export function useData<T, X>(
  dataFunction: (params: X) => Promise<T>,
  params: X,
  options: Options<T> = {},
): UseDataResult<T> {
  const [result, setResult] = useState<APIResult<T>>(loadingResult)
  // this loading indicates also reloading while result is still loaded
  const [loading, setLoading] = useState<boolean>(true)
  const [reloadCounter, setReloadCounter] = useState<number>(0)

  const keepResultUntilLoaded = {
    // onParamsChange: false,
    onReload: false,
    onRepeatOnError: true,
    onRepeatOnSuccess: true,
    ...(options.keepResultUntilLoaded || {}),
  }

  const debouncedParams = useDebouncedParams(params, options.debounce || null)
  useEffect(() => {
    let errorRepeatCount = 0
    let successRepeatCount = 0
    const timers: any[] = []

    function run() {
      setLoading(true)

      dataFunction(debouncedParams)
        .then((value: T) => {
          setLoading(false)
          setResult(["success", value])
          if (options.repeatOnSucess) {
            const timeToRepeat = options.repeatOnSucess(
              value,
              successRepeatCount,
            )
            if (timeToRepeat) {
              timers.push(
                window.setTimeout(() => {
                  successRepeatCount += 1
                  if (!keepResultUntilLoaded.onRepeatOnSuccess) {
                    setResult(loadingResult)
                  }
                  run()
                }, Math.max(timeToRepeat * 1000, 100)),
              )
            }
          }
        })
        .catch((err) => {
          setLoading(false)
          setResult(["error", String(err)])
          if (options.repeatOnError) {
            const timeToRepeat = options.repeatOnError(
              String(err),
              errorRepeatCount,
            )
            if (timeToRepeat) {
              timers.push(
                window.setTimeout(() => {
                  errorRepeatCount += 1
                  if (!keepResultUntilLoaded.onRepeatOnError) {
                    setResult(loadingResult)
                  }
                  run()
                }, Math.max(timeToRepeat * 1000, 100)),
              )
            }
          }
        })
    }
    if (!keepResultUntilLoaded.onReload) {
      setResult(loadingResult)
    }
    run()
    return function cleanup() {
      timers.forEach((handle) => {
        window.clearTimeout(handle)
      })
    }
  }, [JSON.stringify(debouncedParams), reloadCounter])

  return {
    data: result,
    intermediateLoading: loading,
    reload: () => {
      setReloadCounter(reloadCounter + 1)
    },
  }
}
