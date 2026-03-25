'use client'

import { useState } from 'react'
import { updatePassword } from '@/app/actions/auth'

export default function ResetPasswordPage() {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError('')
    const result = await updatePassword(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <>
      <h1 className="auth-title">New Password</h1>
      <p className="auth-subtitle">Enter your new password</p>

      {error && <div className="auth-error">{error}</div>}

      <form action={handleSubmit} className="auth-form">
        <label className="auth-label">
          New Password
          <input type="password" name="password" required minLength={8} className="auth-input" placeholder="At least 8 characters" />
        </label>

        <button type="submit" disabled={loading} className="auth-btn">
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </>
  )
}
