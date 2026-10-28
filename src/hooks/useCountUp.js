import { useState, useEffect } from 'react'

export function useCountUp(targetValue, duration = 1200, isFloat = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const end = parseFloat(targetValue) || 0
    if (end === 0) {
      setCount(0)
      return
    }

    let startTimestamp = null
    const startValue = 0

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp
      const progress = Math.min((timestamp - startTimestamp) / duration, 1)
      // Ease out quad formula
      const easeOutProgress = 1 - (1 - progress) * (1 - progress)
      
      const currentVal = easeOutProgress * (end - startValue) + startValue
      setCount(isFloat ? currentVal : Math.floor(currentVal))

      if (progress < 1) {
        window.requestAnimationFrame(step)
      } else {
        setCount(end)
      }
    }

    const animationFrame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(animationFrame)
  }, [targetValue, duration, isFloat])

  return count
}

