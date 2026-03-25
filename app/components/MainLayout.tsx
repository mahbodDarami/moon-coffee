'use client'

import Nav from './Nav'
import Footer from './Footer'

// Nav and Footer are shown on every page including auth pages.
export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  )
}
