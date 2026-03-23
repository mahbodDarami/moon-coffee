'use client'

import { useState, useEffect } from 'react'

export default function LoadingScreen() {
  const [out, setOut] = useState(false)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    // Return visits: skip loader entirely
    if (sessionStorage.getItem('mc-loaded')) {
      setGone(true)
      return
    }

    const dismiss = () => {
      sessionStorage.setItem('mc-loaded', '1')
      setOut(true)
      setTimeout(() => setGone(true), 900)
    }

    const minDelay = new Promise<void>(res => setTimeout(res, 2500))

    const videoReady = new Promise<void>(res => {
      const video = document.querySelector<HTMLVideoElement>('.hero video')
      if (!video) { res(); return }
      if (video.readyState >= 3) { res(); return }
      video.addEventListener('canplay', () => res(), { once: true })
      setTimeout(res, 4000)
    })

    Promise.all([minDelay, videoReady]).then(dismiss)
  }, [])

  if (gone) return null

  return (
    <div className={`loading-screen${out ? ' loading-screen--out' : ''}`}>
      <span className="loading-logo">Moon Coffee</span>
      <div className="loading-loader">
        <div className="loading-cube" />
        <div className="loading-cube" />
        <div className="loading-cube" />
        <div className="loading-cube" />
      </div>
    </div>
  )
}
