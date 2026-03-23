'use client'

import { useEffect, useState } from 'react'

export default function Nav() {
  const [scrolled, setScrolled]   = useState(false)
  const [menuOpen, setMenuOpen]   = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.85)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const close = () => setMenuOpen(false)

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : 'on-hero'}`} id="nav">

        {/* Left — logo + wordmark */}
        <a href="#" className="nav-logo" onClick={close}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/logo.png" alt="Moon Coffee" className="nav-logo-img" />
          <span className="nav-wordmark">
            <span className="nav-wordmark-moon">Moon</span>
            <span className="nav-wordmark-coffee">Coffee</span>
          </span>
        </a>

        {/* Center — links (desktop) */}
        <div className="nav-links-group">
          <a href="#quality" className="nav-link">Our Craft</a>
          <a href="#story"   className="nav-link">Our Story</a>
          <a href="#menu"    className="nav-link">Menu</a>
        </div>

        {/* Right — actions (desktop) */}
        <div className="nav-actions">
          <a href="#signin" className="nav-signin">Sign In</a>
          <a href="#order"  className="nav-btn-order">Order Now</a>
        </div>

        {/* Hamburger (mobile only) */}
        <button
          className={`nav-hamburger${menuOpen ? ' is-open' : ''}`}
          onClick={() => setMenuOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span /><span /><span />
        </button>

      </nav>

      {/* Mobile menu overlay */}
      <div className={`nav-mobile-menu${menuOpen ? ' is-open' : ''}`} aria-hidden={!menuOpen}>
        <a href="#quality" className="nm-link" onClick={close}>Our Craft</a>
        <a href="#story"   className="nm-link" onClick={close}>Our Story</a>
        <a href="#menu"    className="nm-link" onClick={close}>Menu</a>
        <div className="nm-divider" />
        <a href="#signin"  className="nm-signin" onClick={close}>Sign In</a>
        <a href="#order"   className="nm-btn-order" onClick={close}>Order Now</a>
      </div>
    </>
  )
}
