'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)
    if (!footerRef.current || !innerRef.current) return

    const tween = gsap.from(innerRef.current, {
      y: 30,
      opacity: 0,
      duration: 1.0,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: footerRef.current,
        start: 'top 90%',
        once: true,
      },
    })

    return () => {
      tween.kill()
    }
  }, [])

  return (
    <footer className="footer" ref={footerRef}>
      <div className="footer-inner" ref={innerRef}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/logo.png" alt="Moon Coffee" className="footer-logo-img" />
        <span className="footer-addr">
          1847 N. Damen Ave, Chicago &nbsp;&middot;&nbsp; Mon–Fri 6am–7pm &nbsp;&middot;&nbsp; Sat–Sun 7am–8pm
        </span>
        <span className="footer-copy">&copy; 2026</span>
      </div>
    </footer>
  )
}
