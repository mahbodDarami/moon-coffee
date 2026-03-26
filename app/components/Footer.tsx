'use client'

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Image from 'next/image'

const MARQUEE_TEXT =
  'SPECIALTY COFFEE · KENSINGTON MARKET · SINCE 1998 · TORONTO ON · MOONBEAN · '

const NAV_LINKS = [
  { label: 'Our Story',  href: '#story'   },
  { label: 'Menu',       href: '#menu'    },
  { label: 'Reviews',    href: '#reviews' },
  { label: 'Find Us',    href: '#reviews' },
]

const HOURS = [
  { day: 'Mon – Fri', time: '7:30 am – 7:00 pm' },
  { day: 'Saturday',  time: '8:00 am – 7:00 pm' },
  { day: 'Sunday',    time: '8:00 am – 6:00 pm' },
]

/* ── Social button icons ── */
function IgIcon() {
  return (
    <svg className="fsoc-icon" width="18" height="18" viewBox="0 0 448 512"
      aria-hidden="true" fill="white">
      <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/>
    </svg>
  )
}

function FbIcon() {
  return (
    <svg className="fsoc-icon" width="20" height="20" viewBox="0 0 24 24"
      fill="white" aria-hidden="true">
      <path d="M12 2.03998C6.5 2.03998 2 6.52998 2 12.06C2 17.06 5.66 21.21 10.44 21.96V14.96H7.9V12.06H10.44V9.84998C10.44 7.33998 11.93 5.95998 14.22 5.95998C15.31 5.95998 16.45 6.14998 16.45 6.14998V8.61998H15.19C13.95 8.61998 13.56 9.38998 13.56 10.18V12.06H16.34L15.89 14.96H13.56V21.96C15.9164 21.5878 18.0622 20.3855 19.6099 18.57C21.1576 16.7546 22.0054 14.4456 22 12.06C22 6.52998 17.5 2.03998 12 2.03998Z"/>
    </svg>
  )
}

function XIcon() {
  return (
    <svg className="fsoc-icon" width="16" height="16" viewBox="0 0 512 512"
      aria-hidden="true" fill="white">
      <path d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/>
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
  )
}

function ArrowUpIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true">
      <path d="M12 19V5M5 12l7-7 7 7"/>
    </svg>
  )
}

export default function Footer() {
  const footerRef  = useRef<HTMLElement>(null)
  const colsRef    = useRef<HTMLDivElement>(null)
  const bottomRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const footer = footerRef.current
    const cols   = colsRef.current
    const bottom = bottomRef.current
    if (!footer || !cols || !bottom) return

    const colEls = cols.querySelectorAll<HTMLElement>('.footer-col')

    const ctx = gsap.context(() => {
      gsap.from(colEls, {
        y: 36,
        opacity: 0,
        duration: 0.9,
        ease: 'power3.out',
        stagger: 0.1,
        scrollTrigger: {
          trigger: footer,
          start: 'top 88%',
          once: true,
        },
      })

      gsap.from(bottom, {
        y: 16,
        opacity: 0,
        duration: 0.7,
        ease: 'power2.out',
        delay: 0.42,
        scrollTrigger: {
          trigger: footer,
          start: 'top 88%',
          once: true,
        },
      })
    }, footerRef)

    ScrollTrigger.refresh()

    return () => ctx.revert()
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="footer" ref={footerRef}>

      {/* ── Marquee strip ─────────────────────── */}
      <div className="footer-marquee-wrap" aria-hidden="true">
        <div className="footer-marquee-track">
          <span className="footer-marquee-inner">{MARQUEE_TEXT.repeat(6)}</span>
          <span className="footer-marquee-inner" aria-hidden="true">{MARQUEE_TEXT.repeat(6)}</span>
        </div>
      </div>

      {/* ── Main 4-col grid ───────────────────── */}
      <div className="footer-main" ref={colsRef}>

        {/* Col 1 — Brand */}
        <div className="footer-col">
          <Image
            src="/images/logo.png"
            alt="Moon Coffee"
            width={600}
            height={492}
            className="footer-logo-img"
          />
          <p className="footer-tagline">
            Small-batch specialty coffee roasted with care in the heart of Kensington Market since 1998.
          </p>
          <div className="footer-socials">
            {/* Instagram — circle → pill */}
            <a
              href="https://www.instagram.com/moonbeancoffee/"
              target="_blank"
              rel="noopener noreferrer"
              className="fsoc-expand fsoc-instagram"
              aria-label="Instagram"
            >
              <IgIcon />
              <span className="fsoc-label">Instagram</span>
            </a>

            {/* X — circle → pill */}
            <a
              href="https://x.com/moonbeancoffee"
              target="_blank"
              rel="noopener noreferrer"
              className="fsoc-expand fsoc-x"
              aria-label="X (Twitter)"
            >
              <XIcon />
              <span className="fsoc-label">Twitter</span>
            </a>

            {/* Facebook — circle → pill */}
            <a
              href="https://www.facebook.com/moonbeancoffee/"
              target="_blank"
              rel="noopener noreferrer"
              className="fsoc-expand fsoc-facebook"
              aria-label="Facebook"
            >
              <FbIcon />
              <span className="fsoc-label">Facebook</span>
            </a>
          </div>
        </div>

        {/* Col 2 — Navigation */}
        <div className="footer-col">
          <p className="footer-col-label">Navigate</p>
          <nav>
            {NAV_LINKS.map((link) => (
              <a key={link.label} href={link.href} className="footer-nav-link">
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Col 3 — Hours */}
        <div className="footer-col">
          <p className="footer-col-label">Hours</p>
          {HOURS.map((row) => (
            <div key={row.day} className="footer-hours-row">
              <span className="footer-hours-day">{row.day}</span>
              <span className="footer-hours-time">{row.time}</span>
            </div>
          ))}
        </div>

        {/* Col 4 — Address */}
        <div className="footer-col">
          <p className="footer-col-label">Location</p>
          <address className="footer-address">
            <span className="footer-address-street">30 St. Andrew Street</span>
            <span className="footer-address-area">Kensington Market</span>
            <span className="footer-address-city">Toronto, ON · M5T 1K6</span>
          </address>
          <a
            href="https://maps.google.com/?q=Moonbean+Coffee+Company,+30+St+Andrew+St,+Toronto,+ON"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-directions"
          >
            Get Directions
            <span className="footer-directions-icon" aria-hidden="true">↗</span>
          </a>
        </div>

      </div>

      {/* ── Bottom bar ────────────────────────── */}
      <div className="footer-bottom" ref={bottomRef}>
        <div className="footer-bottom-left">
          <span className="footer-copy">
            © {new Date().getFullYear()} Moon Coffee · Moonbean Coffee Company · All rights reserved
          </span>
          <span className="footer-dev">
            Designed &amp; built by&nbsp;
            <a
              href="https://www.linkedin.com/in/mahbod-darami/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-dev-link"
            >
              <LinkedInIcon />
              Mahbod Darami
            </a>
          </span>
        </div>
        <button
          className="footer-top-btn"
          onClick={scrollToTop}
          aria-label="Back to top"
        >
          <ArrowUpIcon />
          &nbsp;Back to top
        </button>
      </div>

    </footer>
  )
}
