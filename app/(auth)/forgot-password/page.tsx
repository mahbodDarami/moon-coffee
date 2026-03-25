'use client'

import { useState } from 'react'
import { forgotPassword } from '@/app/actions/auth'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    setSuccess('')
    const result = await forgotPassword(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
    }
    setLoading(false)
  }

  return (
    <>
      <h1 className="auth-title">Reset Password</h1>
      <p className="auth-subtitle">We&apos;ll send you a reset link</p>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <form action={handleSubmit} className="auth-form">
        <label className="auth-label">
          Email
          <input type="email" name="email" required className="auth-input" placeholder="you@example.com" />
        </label>

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>

      <div className="auth-links">
        <Link href="/login">Back to sign in</Link>
      </div>
    </>
  )
}
