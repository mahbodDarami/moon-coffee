'use client'

import { useState, useEffect } from 'react'

export default function LoadingScreen() {
  const [out, setOut] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const dismiss = () => {
      setOut(true)
      setTimeout(() => setGone(true), 900)
    }

    const video = document.querySelector<HTMLVideoElement>('.hero video')
    if (video) {
      if (video.readyState >= 3) { dismiss(); return }
      video.addEventListener('canplay', dismiss, { once: true })
    }

    const fallback = setTimeout(dismiss, 4000)
    return () => {
      clearTimeout(fallback)
      video?.removeEventListener('canplay', dismiss)
    }
  }, [])

  if (gone) return null

  return (
    <div className={`loading-screen${out ? ' loading-screen--out' : ''}`}>
      <span className="loading-logo">Moon Coffee</span>
      <div className="loading-dots">
        <span /><span /><span />
      </div>
    </div>
  )
}
