'use client'

import { useEffect, useRef } from 'react'
import { motion, stagger, useAnimate, useInView } from 'framer-motion'

interface Props {
  words: string
  className?: string
  /** seconds per word fade-in */
  duration?: number
  /** stagger delay between words */
  delay?: number
  /** blur amount on start */
  blur?: number
}

export default function TextGenerateEffect({
  words,
  className = '',
  duration = 0.55,
  delay = 0.07,
  blur = 8,
}: Props) {
  const [scope, animate] = useAnimate()
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-15% 0px' })

  useEffect(() => {
    if (!isInView) return
    animate(
      'span.word',
      { opacity: 1, filter: 'blur(0px)' },
      { duration, delay: stagger(delay) }
    )
  }, [isInView, animate, duration, delay])

  return (
    <div ref={ref}>
      <motion.div ref={scope} className={className}>
        {words.split(' ').map((word, i) => (
          <motion.span
            key={i}
            className="word"
            style={{
              opacity: 0,
              filter: `blur(${blur}px)`,
              display: 'inline',
            }}
          >
            {word}{' '}
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}
