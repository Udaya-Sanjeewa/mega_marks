'use client'

import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'

interface CountUpAnimationProps {
  end: number
  duration?: number
  suffix?: string
  prefix?: string
}

export default function CountUpAnimation({
  end,
  duration = 2,
  suffix = '',
  prefix = ''
}: CountUpAnimationProps) {
  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          setIsVisible(true)
        }
      },
      { threshold: 0.1 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => {
      if (ref.current) {
        observer.unobserve(ref.current)
      }
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    let startTime: number | null = null
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / (duration * 1000), 1)
      setCount(Math.floor(progress * end))

      if (progress < 1) {
        requestAnimationFrame(step)
      }
    }

    requestAnimationFrame(step)
  }, [isVisible, end, duration])

  return (
    <div ref={ref}>
      <motion.span
        initial={{ scale: 0.5, opacity: 0 }}
        animate={isVisible ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.5 }}
      >
        {prefix}{count.toLocaleString()}{suffix}
      </motion.span>
    </div>
  )
}
