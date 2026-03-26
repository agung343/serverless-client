import { useRef, useCallback } from "react";

export function useDebounceCallback<T extends (...args: any[]) => void>(
  callback: T,
  delay: number = 500
) {
    const time = useRef<ReturnType<typeof setTimeout> | null>(null)

    return useCallback((...args: Parameters<T>) => {
        if (time.current) {
            clearTimeout(time.current)
        }

        time.current = setTimeout(() => {
            callback(...args)
        }, delay)
    }, [callback, delay])
}
