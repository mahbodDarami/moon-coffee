'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextGenerateEffect from './ui/TextGenerateEffect'

export default function Quality() {
  const sectionRef = useRef<HTMLElement>(null)
  const veilRef    = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const labelRef   = useRef<HTMLParagraphElement>(null)
  const marksRef   = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const section = sectionRef.current
    const veil    = veilRef.current
    const content = contentRef.current
    if (!section || !veil || !content) return

    // Veil scrubs away as section enters view
    const t0 = gsap.fromTo(veil,
      { opacity: 1 },
      {
        opacity: 0,
        ease: 'none',
        scrollTrigger: { trigger: section, start: 'top 55%', end: 'top -5%', scrub: 1.2 },
      }
    )

    // Whole content block pops up
    const t1 = gsap.from(content, {
      y: 120, opacity: 0, scale: 0.92,
      duration: 1.6, ease: 'back.out(1.8)',
      scrollTrigger: { trigger: section, start: 'top 28%', once: true },
    })

    // Label + marks stagger (heading/body handled by TextGenerateEffect)
    const t2 = gsap.from(
      [labelRef.current, marksRef.current].filter(Boolean),
      {
        y: 40, opacity: 0, stagger: 0.14,
        duration: 1.1, ease: 'back.out(1.6)',
        scrollTrigger: { trigger: content, start: 'top 22%', once: true },
      }
    )

    return () => { t0.kill(); t1.kill(); t2.kill() }
  }, [])

  return (
    <section className="quality" id="quality" ref={sectionRef}>
      <div className="section-veil" ref={veilRef} />
      <div className="quality-bg">
        <video autoPlay muted loop playsInline>
          <source src="/videos/portafilter.mp4" type="video/mp4" />
        </video>
        <div className="quality-overlay" />
      </div>

      <div className="quality-content" ref={contentRef}>
        <p className="quality-label" ref={labelRef}>
          The Art of Espresso
        </p>

        {/* Heading — word-by-word generate effect */}
        <h2 className="quality-heading">
          <TextGenerateEffect
            words="Precision in every pour."
            duration={0.6}
            delay={0.09}
            blur={10}
          />
        </h2>

        {/* Body — word-by-word generate effect */}
        <div className="quality-body">
          <TextGenerateEffect
            words="We obsess over every variable — water temperature, grind size, extraction time. Because exceptional coffee doesn't happen by accident."
            duration={0.5}
            delay={0.04}
            blur={7}
          />
        </div>

        <div className="quality-marks" ref={marksRef}>
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
