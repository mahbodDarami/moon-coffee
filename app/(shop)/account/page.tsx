'use client'

import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '@/app/actions/profile'
import { useAuth } from '@/app/components/auth/AuthProvider'
import type { Profile } from '@/types'

export default function AccountPage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      const result = await getProfile()
      if (result.success) setProfile(result.data)
      setLoading(false)
    }
    load()
  }, [])

  async function handleSubmit(formData: FormData) {
    setSaving(true)
    setMessage('')
    setError('')
    const result = await updateProfile(formData)
    if (result.success) {
      setMessage('Profile updated.')
      const refreshed = await getProfile()
      if (refreshed.success) setProfile(refreshed.data)
    } else {
      setError(result.error)
    }
    setSaving(false)
  }

  if (loading) return <div className="shop-page"><p className="shop-loading">Loading...</p></div>

  return (
    <div className="shop-page">
      <h1 className="shop-title">Account Settings</h1>

      <div className="account-info">
        <p className="account-email">{user?.email}</p>
      </div>

      {message && <div className="auth-success">{message}</div>}
      {error && <div className="auth-error">{error}</div>}

      <form action={handleSubmit} className="auth-form">
        <label className="auth-label">
          Full Name
          <input
            type="text"
            name="fullName"
            required
            className="auth-input"
            defaultValue={profile?.full_name || ''}
          />
        </label>

        <label className="auth-label">
          Phone
          <input
            type="tel"
            name="phone"
            className="auth-input"
            defaultValue={profile?.phone || ''}
            placeholder="Optional"
          />
        </label>

        <button type="submit" disabled={saving} className="auth-btn">
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>

      <div className="account-actions">
        <form action="/api/auth/signout" method="POST">
          <button type="submit" className="account-signout">Sign Out</button>
        </form>
      </div>
    </div>
  )
}
