'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

export default function Story() {
  const sectionRef = useRef<HTMLElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const topRef = useRef<HTMLDivElement>(null)
  const pillarsRef = useRef<HTMLDivElement>(null)
  const quoteRef = useRef<HTMLQuoteElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const section = sectionRef.current
    const left = leftRef.current
    const right = rightRef.current
    if (!section || !left || !right) return

    // Left column slides & pops
    const t1 = gsap.from(left, {
      y: 80,
      opacity: 0,
      scale: 0.95,
      duration: 1.4,
      ease: 'back.out(1.5)',
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        once: true,
      },
    })

    // Right video panel pops, slightly delayed
    const t2 = gsap.from(right, {
      y: 80,
      opacity: 0,
      scale: 0.95,
      duration: 1.4,
      delay: 0.18,
      ease: 'back.out(1.4)',
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        once: true,
      },
    })

    // Inner text blocks stagger in
    const textEls = [topRef.current, pillarsRef.current, quoteRef.current].filter(Boolean)
    const t3 = gsap.from(textEls, {
      y: 40,
      opacity: 0,
      stagger: 0.14,
      duration: 1.0,
      ease: 'back.out(1.4)',
      scrollTrigger: {
        trigger: left,
        start: 'top 70%',
        once: true,
      },
    })

    return () => {
      t1.kill()
      t2.kill()
      t3.kill()
    }
  }, [])

  return (
    <section className="story" id="story" ref={sectionRef}>
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
          <video className="story-video" autoPlay muted loop playsInline>
            <source src="/videos/coffee-mix.mp4" type="video/mp4" />
          </video>
        </div>
      </div>
    </section>
  )
}
