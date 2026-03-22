'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null)
  const veilRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const pillarsRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLQuoteElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [mounted, setMounted] = useState(false)

  // Only mount the video after hydration — prevents the browser from
  // creating a compositing layer during SSR that shows white edge artifacts
  useEffect(() => { setMounted(true) }, [])

  // Mark video ready — handles both fresh load and cached (already-loaded) video
  const markVideoReady = useCallback((el: HTMLVideoElement) => {
    el.classList.add('is-ready')
  }, [])

  useEffect(() => {
    // If video loaded from cache before React hydrated, the event already fired
    if (videoRef.current && videoRef.current.readyState >= 2) {
      markVideoReady(videoRef.current)
    }
  }, [mounted, markVideoReady])

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const section = sectionRef.current
    const veil = veilRef.current
    const left = leftRef.current
    const right = rightRef.current
    if (!section || !veil || !left || !right) return

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

    // Left column pops up — fires only when section is deeply in view
    const t1 = gsap.from(left, {
      y: 100,
      opacity: 0,
      duration: 1.5,
      ease: 'back.out(1.7)',
      clearProps: 'all',
      scrollTrigger: {
        trigger: section,
        start: 'top 28%',
        once: true,
      },
    })

    // Right video panel slides in slightly after left — no overshoot to avoid bottom edge flash
    const t2 = gsap.from(right, {
      y: 100,
      opacity: 0,
      duration: 1.5,
      delay: 0.22,
      ease: 'power4.out',
      clearProps: 'all',
      scrollTrigger: {
        trigger: section,
        start: 'top 28%',
        once: true,
      },
    })

    // Inner text blocks stagger in
    const textEls = [topRef.current, pillarsRef.current, quoteRef.current].filter(Boolean)
    const t3 = gsap.from(textEls, {
      y: 40,
      opacity: 0,
      stagger: 0.16,
      duration: 1.1,
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: left,
        start: 'top 22%',
        once: true,
      },
    })

    return () => {
      t0.kill()
      t1.kill()
      t2.kill()
      t3.kill()
    }
  }, [])

  return (
    <section className="story" id="story" ref={sectionRef}>
      <div className="section-veil" ref={veilRef} />
      <div className="story-inner">
        <div className="story-left" ref={leftRef}>
          <div className="story-top js-reveal" ref={topRef}>
            <p className="story-label">Est. 2009</p>
            <h2 className="story-heading">
              Fifteen years of<br /><em>getting it right.</em>
            </h2>
            <p className="story-body">
              Moon Coffee opened in 2009 with one purpose — to serve exceptional coffee
              in a space where people could slow down. We source directly from small farms
              in Ethiopia, Colombia, and Sumatra. Roasted in small batches, weekly.
              Nothing stale. Nothing rushed. Just great coffee, made with care.
            </p>
          </div>

          <div className="story-pillars js-reveal" ref={pillarsRef}>
            <div className="story-pillar">
              <span className="sp-num">2009</span>
              <span className="sp-label">Founded</span>
            </div>
            <div className="story-pillar">
              <span className="sp-num">15+</span>
              <span className="sp-label">Years of craft</span>
            </div>
            <div className="story-pillar">
              <span className="sp-num">47</span>
              <span className="sp-label">Origins</span>
            </div>
            <div className="story-pillar">
              <span className="sp-num">4.9</span>
              <span className="sp-label">Guest rating</span>
            </div>
          </div>

          <blockquote className="story-quote js-reveal" ref={quoteRef}>
            &ldquo;The best cortado in Chicago — every single time.
            That consistency is rare, and it&apos;s why I keep coming back.&rdquo;
            <cite>— Rafaela Moura, food writer</cite>
          </blockquote>
        </div>

        <div className="story-right js-reveal" ref={rightRef}>
          {mounted && (
            <video
              ref={videoRef}
              className="story-video"
              autoPlay muted loop playsInline
              onLoadedData={e => markVideoReady(e.currentTarget as HTMLVideoElement)}
            >
              <source src="/videos/coffee-mix.mp4" type="video/mp4" />
            </video>
          )}
        </div>
      </div>
    </section>
  )
}
