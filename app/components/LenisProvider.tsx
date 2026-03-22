'use client'

import { useEffect, type ReactNode } from 'react'
import Lenis from 'lenis'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const lenis = new Lenis({
      lerp: 0.1,
      smoothWheel: true,
      syncTouch: false,
    })

    const tickerFn = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tickerFn)
    gsap.ticker.lagSmoothing(0)

    lenis.on('scroll', ScrollTrigger.update)

    // Smooth anchor links — offset by nav height
    const anchors = Array.from(
      document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]')
    )
    const handlers: ((e: MouseEvent) => void)[] = anchors.map((a) => {
      const handler = (e: MouseEvent) => {
        const href = a.getAttribute('href')
        if (!href) return
        const target = document.querySelector(href)
        if (!target) return
        e.preventDefault()
        lenis.scrollTo(target as HTMLElement, {
          offset: -68,
          duration: 1.6,
          easing: (t: number) => 1 - Math.pow(1 - t, 4),
        })
      }
      a.addEventListener('click', handler)
      return handler
    })

    return () => {
      anchors.forEach((a, i) => a.removeEventListener('click', handlers[i]))
      gsap.ticker.remove(tickerFn)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}
