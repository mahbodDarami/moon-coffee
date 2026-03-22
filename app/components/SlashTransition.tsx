'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function SlashTransition() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!ref.current) return

    const tween = gsap.from(ref.current, {
      scaleX: 0,
      duration: 1.3,
      ease: 'expo.out',
      transformOrigin: 'left center',
      scrollTrigger: {
        trigger: ref.current,
        start: 'top 90%',
        once: true,
      },
    })

    return () => {
      tween.kill()
    }
  }, [])

  return <div className="section-transition st-slash" aria-hidden="true" ref={ref} />
}
