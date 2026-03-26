'use client'

import Nav from './Nav'
import Footer from './Footer'

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Nav />
      {children}
      <Footer />
    </>
  )
}
