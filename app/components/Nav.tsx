'use client'

import { useEffect, useState, useCallback } from 'react'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/app/components/auth/AuthProvider'
import MenuOverlay from '@/app/components/menu/MenuOverlay'
import CartDrawer from '@/app/components/cart/CartDrawer'
import Link from 'next/link'
import Image from 'next/image'

export default function Nav() {
  const pathname = usePathname()
  const isHome = pathname === '/'
  const { user, isLoading } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)
  const [cartRefresh, setCartRefresh] = useState(0)

  useEffect(() => {
    let rafId = 0
    const onScroll = () => {
      cancelAnimationFrame(rafId)
      rafId = requestAnimationFrame(() => {
        setScrolled(window.scrollY > window.innerHeight * 0.85)
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const closeMobile = () => setMobileOpen(false)
  const openMenu = useCallback(() => { closeMobile(); setMenuOpen(true) }, [])
  const openCart = useCallback(() => { closeMobile(); setCartOpen(true) }, [])
  const handleCartUpdate = useCallback(() => setCartRefresh((n) => n + 1), [])

  return (
    <>
      <nav className={`nav ${scrolled ? 'scrolled' : 'on-hero'}`} id="nav">

        {/* Left — logo + wordmark */}
        <Link href="/" className="nav-logo" onClick={(e) => { closeMobile(); if (isHome) { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) } }}>
          <Image
            src="/images/logo.png"
            alt="Moon Coffee"
            width={600}
            height={492}
            className="nav-logo-img"
            priority
          />
          <span className="nav-wordmark">
            <span className="nav-wordmark-moon">Moon</span>
            <span className="nav-wordmark-coffee">Coffee</span>
          </span>
        </Link>

        {/* Center — links */}
        <div className="nav-links-group">
          <a href="/#quality" className="nav-link">Our Craft</a>
          <a href="/#story" className="nav-link">Our Story</a>
          <Link href="/menu" className="nav-link-menu">Menu</Link>
        </div>

        {/* Right — actions */}
        <div className="nav-actions">
          {!isLoading && (
            user ? (
              <>
                <button className="nav-cart-btn" onClick={openCart} aria-label="Open cart">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
                  </svg>
                </button>
                <Link href="/account" className="nav-signin" aria-label="User account">
                  <span className="nav-signin-inner">
                    <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                      <g><path d="m15.626 11.769a6 6 0 1 0-7.252 0 9.008 9.008 0 0 0-5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0-5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1-4-4zm10 14h-12a1 1 0 0 1-1-1 7 7 0 0 1 14 0 1 1 0 0 1-1 1z"/></g>
                    </svg>
                    <p>{user.user_metadata?.full_name?.split(' ')[0] ||
                       user.user_metadata?.name?.split(' ')[0] ||
                       'Account'}</p>
                  </span>
                </Link>
              </>
            ) : (
              <Link href="/login" className="nav-signin" aria-label="Sign in">
                <span className="nav-signin-inner">
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g><path d="m15.626 11.769a6 6 0 1 0-7.252 0 9.008 9.008 0 0 0-5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0-5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1-4-4zm10 14h-12a1 1 0 0 1-1-1 7 7 0 0 1 14 0 1 1 0 0 1-1 1z"/></g>
                  </svg>
                  <p>Log In</p>
                </span>
              </Link>
            )
          )}
          <button className="nav-btn-order" onClick={openMenu}>Order Now</button>
        </div>

        {/* Mobile-only menu button — home page only, sits between logo & hamburger */}
        {isHome && (
          <Link href="/menu" className="nav-mobile-menu-btn">
            Menu
          </Link>
        )}

        {/* Hamburger */}
        <button
          className={`nav-hamburger${mobileOpen ? ' is-open' : ''}`}
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          <span /><span /><span />
        </button>

      </nav>

      {/* Mobile menu overlay */}
      <div className={`nav-mobile-menu${mobileOpen ? ' is-open' : ''}`} aria-hidden={!mobileOpen}>
        <a href="/#quality" className="nm-link" onClick={closeMobile}>Our Craft</a>
        <a href="/#story" className="nm-link" onClick={closeMobile}>Our Story</a>
        <Link href="/menu" className="nm-link" onClick={closeMobile}>Menu</Link>
        <div className="nm-divider" />
        {!isLoading && (
          user ? (
            <>
              <button className="nm-link" onClick={openCart}>Cart</button>
              <Link href="/account" className="nm-signin" onClick={closeMobile} aria-label="User account">
                <span className="nm-signin-inner">
                  <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                    <g><path d="m15.626 11.769a6 6 0 1 0-7.252 0 9.008 9.008 0 0 0-5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0-5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1-4-4zm10 14h-12a1 1 0 0 1-1-1 7 7 0 0 1 14 0 1 1 0 0 1-1 1z"/></g>
                  </svg>
                  <p>{user.user_metadata?.full_name?.split(' ')[0] ||
                     user.user_metadata?.name?.split(' ')[0] ||
                     'Account'}</p>
                </span>
              </Link>
              <Link href="/orders" className="nm-link" onClick={closeMobile}>Orders</Link>
            </>
          ) : (
            <Link href="/login" className="nm-signin" onClick={closeMobile} aria-label="Sign in">
              <span className="nm-signin-inner">
                <svg aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g><path d="m15.626 11.769a6 6 0 1 0-7.252 0 9.008 9.008 0 0 0-5.374 8.231 3 3 0 0 0 3 3h12a3 3 0 0 0 3-3 9.008 9.008 0 0 0-5.374-8.231zm-7.626-4.769a4 4 0 1 1 4 4 4 4 0 0 1-4-4zm10 14h-12a1 1 0 0 1-1-1 7 7 0 0 1 14 0 1 1 0 0 1-1 1z"/></g>
                </svg>
                <p>Log In</p>
              </span>
            </Link>
          )
        )}
        <button className="nm-btn-order" onClick={openMenu}>Order Now</button>
      </div>

      {/* Menu Overlay */}
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} onCartUpdate={handleCartUpdate} />

      {/* Cart Drawer */}
      <CartDrawer isOpen={cartOpen} onClose={() => setCartOpen(false)} refreshKey={cartRefresh} />
    </>
  )
}
