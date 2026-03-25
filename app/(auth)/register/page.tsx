'use client'

import { useState } from 'react'
import { signup } from '@/app/actions/auth'
import Link from 'next/link'

export default function RegisterPage() {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    setSuccess('')
    const result = await signup(formData)
    if (result?.error) {
      setError(result.error)
    } else if (result?.success) {
      setSuccess(result.success)
    }
    setLoading(false)
  }

  return (
    <>
      <h1 className="auth-title">Create Account</h1>
      <p className="auth-subtitle">Join Moon Coffee</p>

      {error && <div className="auth-error">{error}</div>}
      {success && <div className="auth-success">{success}</div>}

      <form action={handleSubmit} className="auth-form">
        <label className="auth-label">
          Full Name
          <input type="text" name="fullName" required className="auth-input" placeholder="Your name" />
        </label>

        <label className="auth-label">
          Email
          <input type="email" name="email" required className="auth-input" placeholder="you@example.com" />
        </label>

        <label className="auth-label">
          Password
          <input type="password" name="password" required minLength={8} className="auth-input" placeholder="At least 8 characters" />
        </label>

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div className="auth-links">
        <Link href="/login">Already have an account? Sign in</Link>
      </div>
    </>
  )
}
