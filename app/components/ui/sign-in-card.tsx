'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion'
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { login } from '@/app/actions/auth'

interface SignInCardProps {
  redirectTo?: string
}

export function SignInCard({ redirectTo }: SignInCardProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [focusedInput, setFocusedInput] = useState<string | null>(null)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState('')

  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-400, 400], [8, -8])
  const rotateY = useTransform(mouseX, [-400, 400], [-8, 8])

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }
  const handleMouseLeave = () => {
    mouseX.set(0)
    mouseY.set(0)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    const formData = new FormData(e.currentTarget)
    if (redirectTo) formData.set('redirectTo', redirectTo)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setIsLoading(false)
    }
  }

  return (
    /* ── Full-page container. Nav is fixed so we pad-top by --nav height ── */
    <div
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{
        minHeight: '100svh',
        paddingTop: 'calc(var(--nav) + 2rem)',
        paddingBottom: '4rem',
      }}
    >
      {/* Background photo */}
      <Image
        src="/images/signin-bg.jpg"
        alt="Moon Coffee interior"
        fill
        priority
        className="object-cover object-center"
        quality={95}
      />

      {/* Overlay — dark + slight blur */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[3px]" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
        }}
      />

      {/* Ambient glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] h-[55vh] rounded-b-[50%] bg-white/[0.04] blur-[80px] pointer-events-none" />
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[100vw] h-[60vh] rounded-t-full bg-white/[0.03] blur-[60px] pointer-events-none"
        animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: 'mirror', delay: 1 }}
      />

      {/* ── Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        /* Responsive width: grows from mobile to 2xl */
        className="w-full relative z-10 px-4 sm:px-6"
        style={{
          maxWidth: 'clamp(320px, 90vw, 560px)',
          perspective: 1500,
        }}
      >
        <motion.div
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative"
        >
          <div className="relative group">

            {/* Ambient card glow */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl"
              animate={{
                boxShadow: [
                  '0 0 10px 2px rgba(255,255,255,0.02)',
                  '0 0 20px 6px rgba(255,255,255,0.05)',
                  '0 0 10px 2px rgba(255,255,255,0.02)',
                ],
              }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', repeatType: 'mirror' }}
            />

            {/* ── Traveling border beams ── */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
              <motion.div
                className="absolute top-0 left-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ left: ['-50%', '100%'], opacity: [0.2, 0.65, 0.2] }}
                transition={{ left: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror' } }}
              />
              <motion.div
                className="absolute top-0 right-0 h-[50%] w-[2px] bg-gradient-to-b from-transparent via-white to-transparent"
                animate={{ top: ['-50%', '100%'], opacity: [0.2, 0.65, 0.2] }}
                transition={{ top: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 0.6 } }}
              />
              <motion.div
                className="absolute bottom-0 right-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent"
                animate={{ right: ['-50%', '100%'], opacity: [0.2, 0.65, 0.2] }}
                transition={{ right: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.2 } }}
              />
              <motion.div
                className="absolute bottom-0 left-0 h-[50%] w-[2px] bg-gradient-to-b from-transparent via-white to-transparent"
                animate={{ bottom: ['-50%', '100%'], opacity: [0.2, 0.65, 0.2] }}
                transition={{ bottom: { duration: 2.5, ease: 'easeInOut', repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: 'mirror', delay: 1.8 } }}
              />
              {/* Corner dots */}
              <motion.div className="absolute top-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]" animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 2, repeat: Infinity, repeatType: 'mirror' }} />
              <motion.div className="absolute top-0 right-0 h-[6px] w-[6px] rounded-full bg-white/50 blur-[1.5px]" animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 2.4, repeat: Infinity, repeatType: 'mirror', delay: 0.5 }} />
              <motion.div className="absolute bottom-0 right-0 h-[6px] w-[6px] rounded-full bg-white/50 blur-[1.5px]" animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 2.2, repeat: Infinity, repeatType: 'mirror', delay: 1 }} />
              <motion.div className="absolute bottom-0 left-0 h-[5px] w-[5px] rounded-full bg-white/40 blur-[1px]" animate={{ opacity: [0.15, 0.35, 0.15] }} transition={{ duration: 2.3, repeat: Infinity, repeatType: 'mirror', delay: 1.5 }} />
            </div>

            {/* Border shimmer on hover */}
            <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-br from-white/5 via-white/8 to-white/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            {/* ── Glass card body ── */}
            <div
              className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/[0.07] shadow-2xl overflow-hidden"
              style={{ padding: 'clamp(1.25rem, 4vw, 2.5rem)' }}
            >
              {/* Subtle inner grid */}
              <div
                className="absolute inset-0 opacity-[0.025] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                  backgroundSize: '30px 30px',
                }}
              />

              {/* ── Branding — top center ── */}
              <div className="flex flex-col items-center text-center gap-2 mb-6">
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', duration: 0.8 }}
                  className="rounded-full border border-white/10 relative overflow-hidden flex-shrink-0"
                  style={{ width: 'clamp(56px, 8vw, 80px)', height: 'clamp(56px, 8vw, 80px)' }}
                >
                  <Image
                    src="/images/logo.png"
                    alt="Moon Coffee"
                    fill
                    className="object-cover"
                    quality={100}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="font-bold text-transparent bg-clip-text bg-gradient-to-b from-white to-white/80 tracking-wide"
                  style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)' }}
                >
                  Moon Coffee
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-white/55"
                  style={{ fontSize: 'clamp(0.7rem, 1.5vw, 0.8rem)' }}
                >
                  Welcome back — sign in to your account
                </motion.p>
              </div>

              {/* ── Error banner ── */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="mb-4 px-3 py-2 rounded-lg border text-center"
                    style={{
                      background: 'rgba(239,68,68,0.12)',
                      borderColor: 'rgba(239,68,68,0.2)',
                      color: 'rgb(252,165,165)',
                      fontSize: '0.78rem',
                    }}
                  >
                    {error}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Form ── */}
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

                {/* Input group */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>

                  {/* Email */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{ position: 'relative' }}
                  >
                    <Mail
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '1rem',
                        height: '1rem',
                        pointerEvents: 'none',
                        transition: 'color 0.2s',
                        color: focusedInput === 'email' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                      }}
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onFocus={() => setFocusedInput('email')}
                      onBlur={() => setFocusedInput(null)}
                      required
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '2.75rem',
                        paddingLeft: '2.5rem',
                        paddingRight: '1rem',
                        borderRadius: '0.5rem',
                        background: focusedInput === 'email' ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${focusedInput === 'email' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.10)'}`,
                        color: 'white',
                        fontSize: 'clamp(0.78rem, 1.5vw, 0.875rem)',
                        outline: 'none',
                        transition: 'background 0.2s, border-color 0.2s',
                        boxSizing: 'border-box',
                      }}
                    />
                  </motion.div>

                  {/* Password */}
                  <motion.div
                    whileHover={{ scale: 1.01 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    style={{ position: 'relative' }}
                  >
                    <Lock
                      style={{
                        position: 'absolute',
                        left: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        width: '1rem',
                        height: '1rem',
                        pointerEvents: 'none',
                        transition: 'color 0.2s',
                        color: focusedInput === 'password' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                      }}
                    />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedInput('password')}
                      onBlur={() => setFocusedInput(null)}
                      required
                      style={{
                        display: 'block',
                        width: '100%',
                        height: '2.75rem',
                        paddingLeft: '2.5rem',
                        paddingRight: '2.75rem',
                        borderRadius: '0.5rem',
                        background: focusedInput === 'password' ? 'rgba(255,255,255,0.10)' : 'rgba(255,255,255,0.07)',
                        border: `1px solid ${focusedInput === 'password' ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.10)'}`,
                        color: 'white',
                        fontSize: 'clamp(0.78rem, 1.5vw, 0.875rem)',
                        outline: 'none',
                        transition: 'background 0.2s, border-color 0.2s',
                        boxSizing: 'border-box',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                        color: 'rgba(255,255,255,0.35)',
                        display: 'flex',
                        alignItems: 'center',
                        transition: 'color 0.2s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                      onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.35)')}
                    >
                      {showPassword ? <Eye style={{ width: '1rem', height: '1rem' }} /> : <EyeOff style={{ width: '1rem', height: '1rem' }} />}
                    </button>
                  </motion.div>
                </div>

                {/* Remember me + Forgot */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', userSelect: 'none' }}>
                    <div style={{ position: 'relative' }}>
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={() => setRememberMe(!rememberMe)}
                        style={{
                          appearance: 'none',
                          width: '1rem',
                          height: '1rem',
                          borderRadius: '0.25rem',
                          border: '1px solid rgba(255,255,255,0.2)',
                          background: rememberMe ? 'white' : 'rgba(255,255,255,0.05)',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                        }}
                      />
                      {rememberMe && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.5 }}
                          animate={{ opacity: 1, scale: 1 }}
                          style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'black',
                            pointerEvents: 'none',
                          }}
                        >
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        </motion.div>
                      )}
                    </div>
                    <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>Remember me</span>
                  </label>

                  <Link
                    href="/forgot-password"
                    style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)', textDecoration: 'none', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = 'white')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  >
                    Forgot password?
                  </Link>
                </div>

                {/* Sign In button — pure white */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isLoading}
                  className="group/btn"
                  style={{ position: 'relative', width: '100%' }}
                >
                  <div
                    className="absolute inset-0 rounded-lg opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"
                    style={{ background: 'rgba(255,255,255,0.12)', filter: 'blur(10px)', borderRadius: '0.5rem' }}
                  />
                  <div
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'white',
                      color: 'black',
                      fontWeight: 500,
                      height: '2.75rem',
                      borderRadius: '0.5rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 'clamp(0.8rem, 1.5vw, 0.875rem)',
                      transition: 'background 0.2s',
                      cursor: isLoading ? 'wait' : 'pointer',
                    }}
                  >
                    {/* Shimmer during loading */}
                    <motion.div
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
                        opacity: isLoading ? 1 : 0,
                        transition: 'opacity 0.3s',
                      }}
                      animate={{ x: isLoading ? ['-100%', '100%'] : '-100%' }}
                      transition={{ duration: 1.4, ease: 'easeInOut', repeat: isLoading ? Infinity : 0, repeatDelay: 0.5 }}
                    />
                    <AnimatePresence mode="wait">
                      {isLoading ? (
                        <motion.div key="spin" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                          <div style={{ width: '1rem', height: '1rem', border: '2px solid rgba(0,0,0,0.5)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
                        </motion.div>
                      ) : (
                        <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          Sign In
                          <ArrowRight className="group-hover/btn:translate-x-1 transition-transform duration-300" style={{ width: '0.85rem', height: '0.85rem' }} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.button>

                {/* Divider */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                  <motion.span
                    style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}
                    animate={{ opacity: [0.6, 0.85, 0.6] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    or
                  </motion.span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
                </div>

                {/* Google Sign In */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  className="group/google"
                  style={{ position: 'relative', width: '100%' }}
                >
                  <div
                    style={{
                      position: 'relative',
                      overflow: 'hidden',
                      background: 'rgba(255,255,255,0.05)',
                      height: '2.75rem',
                      borderRadius: '0.5rem',
                      border: '1px solid rgba(255,255,255,0.10)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      cursor: 'pointer',
                      transition: 'border-color 0.2s, background 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.2)'
                      ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)'
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.10)'
                      ;(e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'
                    }}
                  >
                    {/* Google G */}
                    <svg style={{ width: '1rem', height: '1rem', flexShrink: 0 }} viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span style={{ fontSize: 'clamp(0.75rem, 1.5vw, 0.8rem)', color: 'rgba(255,255,255,0.75)', fontWeight: 500 }}>
                      Sign in with Google
                    </span>
                  </div>
                </motion.button>

                {/* Sign up */}
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', marginTop: '0.25rem' }}
                >
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/register"
                    style={{ position: 'relative', display: 'inline-block', color: 'white', fontWeight: 500, textDecoration: 'none' }}
                    className="group/reg"
                  >
                    <span className="group-hover/reg:opacity-70 transition-opacity duration-200">Sign up</span>
                    <span
                      className="absolute bottom-0 left-0 w-0 group-hover/reg:w-full transition-all duration-300"
                      style={{ height: '1px', background: 'white' }}
                    />
                  </Link>
                </motion.p>

              </form>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}
