'use client'

import { Suspense, useState } from 'react'
import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function LoginForm() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || ''
  const urlError = searchParams.get('error') || ''

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    if (redirectTo) formData.set('redirectTo', redirectTo)
    const result = await login(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="auth-title">Sign In</h1>
      <p className="auth-subtitle">Welcome back to Moon Coffee</p>

      {(error || urlError) && (
        <div className="auth-error">{error || urlError}</div>
      )}

      <form action={handleSubmit} className="auth-form">
        <label className="auth-label">
          Email
          <input type="email" name="email" required className="auth-input" placeholder="you@example.com" />
        </label>

        <label className="auth-label">
          Password
          <input type="password" name="password" required className="auth-input" placeholder="••••••••" />
        </label>

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      <div className="auth-links">
        <Link href="/forgot-password">Forgot password?</Link>
        <Link href="/register">Create an account</Link>
      </div>
    </>
  )
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  )
}
