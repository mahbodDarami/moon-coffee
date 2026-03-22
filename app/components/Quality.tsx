'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Quality() {
  const sectionRef = useRef<HTMLElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const marksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const section = sectionRef.current
    const content = contentRef.current
    if (!section || !content) return

    // Whole content block pops up
    const t1 = gsap.from(content, {
      y: 100,
      opacity: 0,
      scale: 0.93,
      duration: 1.5,
      ease: 'back.out(1.6)',
      scrollTrigger: {
        trigger: section,
        start: 'top 80%',
        once: true,
      },
    })

    // Staggered text elements pop after block
    const textEls = [labelRef.current, headingRef.current, bodyRef.current, marksRef.current].filter(Boolean)
    const t2 = gsap.from(textEls, {
      y: 50,
      opacity: 0,
      stagger: 0.1,
      duration: 1.1,
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: content,
        start: 'top 72%',
        once: true,
      },
    })

    return () => {
      t1.kill()
      t2.kill()
    }
  }, [])

  return (
    <section className="quality" id="quality" ref={sectionRef}>
      <div className="quality-bg">
        <video autoPlay muted loop playsInline>
          <source src="/videos/portafilter.mp4" type="video/mp4" />
        </video>
        <div className="quality-overlay" />
      </div>

      <div className="quality-content" ref={contentRef}>
        <p className="quality-label js-reveal" ref={labelRef}>
          The Art of Espresso
        </p>
        <h2 className="quality-heading js-reveal" ref={headingRef}>
          Precision in<br />every <em>pour.</em>
        </h2>
        <p className="quality-body js-reveal" ref={bodyRef}>
          We obsess over every variable — water temperature,
          grind size, extraction time. Because exceptional
          coffee doesn&apos;t happen by accident.
        </p>
        <div className="quality-marks js-reveal" ref={marksRef}>
          <div className="quality-mark">
            <span className="qm-dash" />
            <span>Uncompromising quality</span>
          </div>
          <div className="quality-mark">
            <span className="qm-dash" />
            <span>Every. Single. Cup.</span>
          </div>
        </div>
      </div>
    </section>
  )
}
