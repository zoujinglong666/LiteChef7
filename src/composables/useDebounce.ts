/**
 * 防抖 composable
 */

export function useDebounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null

  return function (...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn(...args)
    }, delay)
  }
}

/**
 * 节流 composable
 */
export function useThrottle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  limit = 300
): (...args: Parameters<T>) => void {
  let inThrottle = false

  return function (...args: Parameters<T>) {
    if (!inThrottle) {
      fn(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * 防抖 ref
 */
export function useDebouncedRef<T>(value: T, delay = 300) {
  let timer: ReturnType<typeof setTimeout> | null = null
  const innerValue = ref<T>(value)
  const debouncedValue = ref<T>(value)

  watch(innerValue, (newVal) => {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      debouncedValue.value = newVal
    }, delay)
  })

  return {
    value: innerValue,
    debouncedValue: readonly(debouncedValue) as Readonly<globalThis.Ref<T>>
  }
}
