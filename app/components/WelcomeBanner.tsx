'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { X } from 'lucide-react'

export function WelcomeBanner() {
  const { user, isLoading } = useAuth()
  const searchParams = useSearchParams()
  const [visible, setVisible] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (isLoading || !user) return

    // Determine if this is a fresh login/signup this session
    const alreadyWelcomed = sessionStorage.getItem('moon_welcomed')
    if (alreadyWelcomed) return

    // Determine message
    const isNewUser = searchParams.get('welcome') === 'new'
    const name =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split('@')[0] ||
      'there'

    setMessage(
      isNewUser
        ? `Welcome to Moon Coffee, ${name}! ☕`
        : `Welcome back, ${name}! ☕`
    )
    setVisible(true)
    sessionStorage.setItem('moon_welcomed', '1')

    // Auto-dismiss after 4.5s
    const timer = setTimeout(() => setVisible(false), 4500)
    return () => clearTimeout(timer)
  }, [user, isLoading, searchParams])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: -64 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -64 }}
          transition={{ type: 'spring', stiffness: 280, damping: 28 }}
          style={{
            position: 'fixed',
            top: 'calc(var(--nav, 64px) + 0.75rem)',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.6rem 1rem 0.6rem 1.1rem',
            background: 'rgba(15, 12, 9, 0.88)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '99px',
            backdropFilter: 'blur(16px)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.04)',
            whiteSpace: 'nowrap',
          }}
        >
          <span style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500, letterSpacing: '0.01em' }}>
            {message}
          </span>
          <button
            onClick={() => setVisible(false)}
            style={{
              background: 'none',
              border: 'none',
              padding: '2px',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.4)',
              display: 'flex',
              alignItems: 'center',
              transition: 'color 0.2s',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            aria-label="Dismiss"
          >
            <X style={{ width: '0.75rem', height: '0.75rem' }} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
