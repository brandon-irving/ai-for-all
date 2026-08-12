import React, { useEffect, useRef, useState } from 'react'

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * Animates between numeric values on change.
 *
 * Driven by rAF rather than a CSS transition because we're tweening the
 * *text content*, not a style. `font-variant-numeric: tabular-nums` (from the
 * .num class) is what stops the layout jittering as digits change width.
 */
export function Counter({
  value,
  decimals = 0,
  duration = 1200,
  prefix = '',
  suffix = '',
  className = '',
  /** Start from 0 on first paint instead of holding the initial value. */
  fromZero = false,
}: {
  value: number
  decimals?: number
  duration?: number
  prefix?: string
  suffix?: string
  className?: string
  fromZero?: boolean
}) {
  const [display, setDisplay] = useState(fromZero ? 0 : value)
  const from = useRef(fromZero ? 0 : value)
  const raf = useRef(0)

  useEffect(() => {
    const start = performance.now()
    const a = from.current
    const b = value
    if (a === b) return

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setDisplay(a + (b - a) * easeOut(t))
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else from.current = b
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, duration])

  const text =
    decimals > 0
      ? display.toFixed(decimals)
      : Math.round(display).toLocaleString('en-US')

  return <span className={`num ${className}`}>{prefix}{text}{suffix}</span>
}
