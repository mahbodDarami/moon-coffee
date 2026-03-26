'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import TextGenerateEffect from './ui/TextGenerateEffect'

export default function Story() {
  const sectionRef  = useRef<HTMLElement>(null)
  const veilRef     = useRef<HTMLDivElement>(null)
  const leftRef     = useRef<HTMLDivElement>(null)
  const rightRef    = useRef<HTMLDivElement>(null)
  const topRef      = useRef<HTMLDivElement>(null)
  const pillarsRef  = useRef<HTMLDivElement>(null)
  const quoteRef    = useRef<HTMLQuoteElement>(null)
  const videoRef    = useRef<HTMLVideoElement>(null)
  const [videoSrc, setVideoSrc] = useState('')

  // Lazy-load the coffee-mix video only when section is near the viewport
  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVideoSrc('/videos/coffee-mix.mp4')
          observer.disconnect()
        }
      },
      { rootMargin: '300px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const markVideoReady = useCallback((el: HTMLVideoElement) => {
    el.classList.add('is-ready')
  }, [])

  useEffect(() => {
    if (videoRef.current && videoRef.current.readyState >= 2) {
      markVideoReady(videoRef.current)
    }
  }, [videoSrc, markVideoReady])

  useEffect(() => {

    const section = sectionRef.current
    const veil    = veilRef.current
    const left    = leftRef.current
    const right   = rightRef.current
    if (!section || !veil || !left || !right) return

    const ctx = gsap.context(() => {
      gsap.fromTo(veil,
        { opacity: 1 },
        {
          opacity: 0,
          ease: 'none',
          scrollTrigger: { trigger: section, start: 'top 55%', end: 'top -5%', scrub: 1.2 },
        }
      )

      gsap.from(left, {
        y: 100, opacity: 0, duration: 1.5, ease: 'back.out(1.7)', clearProps: 'all',
        scrollTrigger: { trigger: section, start: 'top 28%', once: true },
      })

      gsap.from(right, {
        y: 100, opacity: 0, duration: 1.5, delay: 0.22, ease: 'power4.out', clearProps: 'all',
        scrollTrigger: { trigger: section, start: 'top 28%', once: true },
      })

      gsap.from(
        [pillarsRef.current, quoteRef.current].filter(Boolean),
        {
          y: 40, opacity: 0, stagger: 0.16, duration: 1.1, ease: 'back.out(1.5)',
          scrollTrigger: { trigger: left, start: 'top 22%', once: true },
        }
      )
    }, sectionRef)

    ScrollTrigger.refresh()

    return () => ctx.revert()
  }, [])

  return (
    <section className="story" id="story" ref={sectionRef}>
      <div className="section-veil" ref={veilRef} />
      <div className="story-inner">

        {/* ── Left: background image + text ─────────────── */}
        <div className="story-left" ref={leftRef}>
          {/* Content sits directly on the background — no wrapper card */}
          <div className="story-top" ref={topRef}>
            <p className="story-label">Est. 1998</p>

            <h2 className="story-heading">
              <TextGenerateEffect
                words="Twenty-six years of getting it right."
                duration={0.6}
                delay={0.1}
                blur={10}
              />
            </h2>

            <div className="story-body">
              <TextGenerateEffect
                words="Moon Coffee opened in 1998 with one purpose — to serve exceptional coffee in a space where people could slow down. We source directly from small farms in Ethiopia, Colombia, and Sumatra. Roasted in small batches, weekly. Nothing stale. Nothing rushed. Just great coffee, made with care."
                duration={0.45}
                delay={0.03}
                blur={6}
              />
            </div>
          </div>

          {/* Glass stat pills — only element keeping a border */}
          <div className="story-pillars js-reveal" ref={pillarsRef}>
            <div className="story-pillar">
              <span className="sp-num">1998</span>
              <span className="sp-label">Founded</span>
            </div>
            <div className="story-pillar">
              <span className="sp-num">26+</span>
              <span className="sp-label">Years of craft</span>
            </div>
            <div className="story-pillar">
              <span className="sp-num">47</span>
              <span className="sp-label">Origins</span>
            </div>
            <div className="story-pillar">
              <span className="sp-num">4.6</span>
              <span className="sp-label">Guest rating</span>
            </div>
          </div>

          <blockquote className="story-quote js-reveal" ref={quoteRef}>
            &ldquo;The best cortado in Toronto — every single time.
            That consistency is rare, and it&apos;s why I keep coming back.&rdquo;
            <cite>— Rafaela Moura, food writer</cite>
          </blockquote>
        </div>

        {/* ── Right: video (unchanged) ─────────────────── */}
        <div className="story-right js-reveal" ref={rightRef}>
          <video
            ref={videoRef}
            className="story-video"
            autoPlay muted loop playsInline preload="none"
            onLoadedData={e => markVideoReady(e.currentTarget as HTMLVideoElement)}
          >
            {videoSrc && <source src={videoSrc} type="video/mp4" />}
          </video>
        </div>

      </div>
    </section>
  )
}
