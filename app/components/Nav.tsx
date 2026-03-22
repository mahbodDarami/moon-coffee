'use client'

import { useEffect, useState } from 'react'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > window.innerHeight * 0.85)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav className={`nav ${scrolled ? 'scrolled' : 'on-hero'}`} id="nav">
      <a href="#" className="nav-logo">Moon Coffee</a>
      <a href="#quality" className="nav-link">Our Craft</a>
      <a href="#story" className="nav-link">Our Story</a>
    </nav>
  )
}
