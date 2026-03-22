'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Quality() {
  const sectionRef = useRef<HTMLElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const labelRef = useRef<HTMLParagraphElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const bodyRef = useRef<HTMLParagraphElement>(null)
  const marksRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const section = sectionRef.current
    const veil = veilRef.current
    const content = contentRef.current
    if (!section || !veil || !content) return

    // Veil stays fully opaque while section is below fold,
    // then scrubs away only once section is well into view
    const t0 = gsap.fromTo(veil,
      { opacity: 1 },
      {
        opacity: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top 55%',
          end: 'top -5%',
          scrub: 1.2,
        },
      }
    )

    // Whole content block pops up — fires only when section is deeply in view
    const t1 = gsap.from(content, {
      y: 120,
      opacity: 0,
      scale: 0.92,
      duration: 1.6,
      ease: 'back.out(1.8)',
      scrollTrigger: {
        trigger: section,
        start: 'top 28%',
        once: true,
      },
    })

    // Staggered text elements pop after block
    const textEls = [labelRef.current, headingRef.current, bodyRef.current, marksRef.current].filter(Boolean)
    const t2 = gsap.from(textEls, {
      y: 50,
      opacity: 0,
      stagger: 0.12,
      duration: 1.2,
      ease: 'back.out(1.6)',
      scrollTrigger: {
        trigger: content,
        start: 'top 22%',
        once: true,
      },
    })

    return () => {
      t0.kill()
      t1.kill()
      t2.kill()
    }
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
