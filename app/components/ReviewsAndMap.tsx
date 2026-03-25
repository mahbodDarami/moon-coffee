'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

const REVIEWS = [
  {
    text: "We had two excellent flat whites at Moonbean this morning — it's always an anxious wait to see what you get (normally far too much milk!) but these were perfect. The food looks delicious although we resisted and may come back tomorrow.",
    name: "Hannah Joyce",
    role: "Google review",
    photo: "https://lh3.googleusercontent.com/a-/ALV-UjXUcShNY_c8FPRBvxOgGjRCIvB2k-SuXBLsWLcN-aDSKL15TLhe5A=s128-c0x00000000-cc-rp-mo",
    rating: "5.0",
  },
  {
    text: "This cozy coffee shop provided a unique and delightful experience. They brew coffee using distinctive methods from various countries, making each cup special. We tried a dish that resembled a bagel but was filled with cheese and spinach — it was absolutely delicious.",
    name: "Reza Rad",
    role: "Google review",
    photo: "https://lh3.googleusercontent.com/a-/ALV-UjUujHcEP7GKBCNfbZU8ljompV8Eygpx8PgPhommI7YnSxzB7gigYw=s128-c0x00000000-cc-rp-mo-ba5",
    rating: "5.0",
  },
  {
    text: "Very fairly priced and delicious drinks. Plenty of seating and cozy ambiance. Tried the latte and matcha latte — both were great, especially given the price point, roughly $1 less than similar chains with the same quality.",
    name: "Cindy Hum",
    role: "Google review",
    photo: "https://lh3.googleusercontent.com/a-/ALV-UjWjH4N1rUDuOjyITDJwDvm4_wy9Fp9A0z3RcKXLo05agI102hxxCA=s128-c0x00000000-cc-rp-mo-ba6",
    rating: "5.0",
  },
]

function QuoteIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16" height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M16 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
      <path d="M5 3a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2 1 1 0 0 1 1 1v1a2 2 0 0 1-2 2 1 1 0 0 0-1 1v2a1 1 0 0 0 1 1 6 6 0 0 0 6-6V5a2 2 0 0 0-2-2z" />
    </svg>
  )
}

function StarIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="13" height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="11" height="11"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export default function ReviewsAndMap() {
  const sectionRef = useRef<HTMLElement>(null)
  const headerRef  = useRef<HTMLDivElement>(null)
  const cardsRef   = useRef<HTMLDivElement>(null)
  const infoRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger)

    const section = sectionRef.current
    const header  = headerRef.current
    const cards   = cardsRef.current
    const info    = infoRef.current
    if (!section || !header || !cards || !info) return

    const ctx = gsap.context(() => {
      const cardEls = cards.querySelectorAll<HTMLElement>('.reviews-card-wrap')

      gsap.from(header, {
        y: 40, opacity: 0, duration: 1.1, ease: 'power3.out',
        scrollTrigger: { trigger: section, start: 'top 72%', once: true },
      })

      gsap.from(cardEls, {
        y: 50, opacity: 0, duration: 0.9, ease: 'power3.out',
        stagger: 0.13,
        scrollTrigger: { trigger: cards, start: 'top 80%', once: true },
      })

      gsap.from(info, {
        x: 40, opacity: 0, duration: 1.0, ease: 'power2.out',
        scrollTrigger: { trigger: info, start: 'top 82%', once: true },
      })
    }, sectionRef)

    ScrollTrigger.refresh()

    return () => ctx.revert()
  }, [])

  return (
    <section className="reviews" id="reviews" ref={sectionRef}>
      <div className="reviews-inner">

        {/* Left — header + cards */}
        <div className="reviews-left">
          <div className="reviews-header" ref={headerRef}>
            <p className="reviews-label">Guest Voices</p>
            <h2 className="reviews-heading">
              Words from our <em>regulars</em>
            </h2>
          </div>

          <div className="reviews-cards" ref={cardsRef}>
            {REVIEWS.map((review, i) => (
              <div key={i} className="reviews-card-wrap">
                <div className="reviews-card">
                  <div className="reviews-card-icon">
                    <QuoteIcon />
                  </div>
                  <p className="reviews-card-text">{review.text}</p>
                  <div className="reviews-card-footer">
                    <div className="reviews-card-author">
                      <div className="reviews-card-avatar">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={review.photo}
                          alt={review.name}
                          onError={(e) => {
                            const t = e.currentTarget
                            t.onerror = null
                            t.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(review.name)}&background=e8d5b8&color=6b3a10&size=96&bold=true&font-size=0.42`
                          }}
                        />
                      </div>
                      <div>
                        <div className="reviews-card-name">{review.name}</div>
                        <div className="reviews-card-role">{review.role}</div>
                      </div>
                    </div>
                    <div className="reviews-card-stars">
                      <StarIcon />
                      <span className="reviews-card-rating">{review.rating}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — info panel */}
        <div className="reviews-right" ref={infoRef}>
          <div className="reviews-info">

            {/* Eyebrow */}
            <p className="reviews-info-eyebrow">
              <PinIcon />
              Kensington Market, Toronto
            </p>

            {/* Heading */}
            <h3 className="reviews-info-heading">Find us</h3>

            {/* Address */}
            <address className="reviews-info-address">
              <span>30 St. Andrew Street</span>
              <span>Kensington Market</span>
              <span>Toronto, ON · M5T 1K6</span>
            </address>

            <div className="reviews-info-divider" />

            {/* Hours */}
            <p className="reviews-info-hours-label">Hours</p>
            <div>
              <div className="reviews-info-hours-row">
                <span className="reviews-info-hours-day">Monday – Friday</span>
                <span className="reviews-info-hours-time">7:30 am – 7:00 pm</span>
              </div>
              <div className="reviews-info-hours-row">
                <span className="reviews-info-hours-day">Saturday</span>
                <span className="reviews-info-hours-time">8:00 am – 7:00 pm</span>
              </div>
              <div className="reviews-info-hours-row">
                <span className="reviews-info-hours-day">Sunday</span>
                <span className="reviews-info-hours-time">8:00 am – 6:00 pm</span>
              </div>
            </div>

            <div className="reviews-info-divider" />

            {/* Google rating */}
            <div className="reviews-info-rating">
              <StarIcon />
              <span className="reviews-info-rating-num">4.6</span>
              <span className="reviews-info-rating-count">· 1,200+ Google reviews</span>
            </div>

            {/* CTA */}
            <a
              href="https://maps.google.com/?q=Moonbean+Coffee+Company,+30+St+Andrew+St,+Toronto,+ON"
              target="_blank"
              rel="noopener noreferrer"
              className="reviews-info-cta"
            >
              Get Directions
              <span className="reviews-info-cta-icon" aria-hidden="true">↗</span>
            </a>

          </div>
        </div>

      </div>
    </section>
  )
}
