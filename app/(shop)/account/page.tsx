'use client'

import { useEffect, useState } from 'react'
import { getProfile, updateProfile } from '@/app/actions/profile'
import { useAuth } from '@/app/components/auth/AuthProvider'
import AddressList from '@/app/components/address/AddressList'
import type { Profile } from '@/types'
import Link from 'next/link'
import Image from 'next/image'

// ─── Initials avatar fallback ─────────────────────────────────────────────────
function getInitials(name?: string | null, email?: string | null) {
  if (name) {
    const parts = name.trim().split(/\s+/)
    return parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : parts[0].slice(0, 2).toUpperCase()
  }
  return email ? email[0].toUpperCase() : '?'
}

// ─── Section card ─────────────────────────────────────────────────────────────
function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '1rem',
      padding: 'clamp(1.2rem, 3vw, 1.75rem)',
    }}>
      <h2 style={{
        fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)',
        fontWeight: 600,
        color: 'rgba(255,255,255,0.85)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        marginBottom: '1.2rem',
      }}>
        {title}
      </h2>
      {children}
    </div>
  )
}

// ─── Coming-soon placeholder ──────────────────────────────────────────────────
function ComingSoon({ label }: { label: string }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.6rem',
      padding: '0.75rem 1rem',
      background: 'rgba(255,255,255,0.02)',
      border: '1px dashed rgba(255,255,255,0.08)',
      borderRadius: '0.6rem',
    }}>
      <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.25)', fontStyle: 'italic' }}>
        {label} — coming soon
      </span>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function AccountPage() {
  const { user } = useAuth()
  const [profile, setProfile]   = useState<Profile | null>(null)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [message, setMessage]   = useState('')
  const [error, setError]       = useState('')

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

  if (loading) return (
    <div className="shop-page" style={{ display: 'flex', justifyContent: 'center', paddingTop: '6rem' }}>
      <div style={{ width: '1.5rem', height: '1.5rem', border: '2px solid rgba(255,255,255,0.15)', borderTopColor: 'rgba(255,255,255,0.7)', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.user_metadata?.name || null
  const avatarUrl   = profile?.avatar_url || user?.user_metadata?.avatar_url || null
  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null

  return (
    <div className="shop-page" style={{ maxWidth: '680px', margin: '0 auto' }}>

      {/* ── Profile header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 'clamp(1rem, 3vw, 1.75rem)',
        marginBottom: '2.5rem',
        padding: 'clamp(1.25rem, 3vw, 2rem)',
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '1rem',
      }}>
        {/* Avatar */}
        <div style={{
          flexShrink: 0,
          width: 'clamp(64px, 10vw, 80px)',
          height: 'clamp(64px, 10vw, 80px)',
          borderRadius: '50%',
          overflow: 'hidden',
          border: '2px solid rgba(255,255,255,0.10)',
          background: 'rgba(255,255,255,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          {avatarUrl ? (
            <Image
              src={avatarUrl}
              alt={displayName || 'Avatar'}
              fill
              sizes="80px"
              className="object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <span style={{ fontSize: 'clamp(1.25rem, 3vw, 1.6rem)', fontWeight: 600, color: 'rgba(255,255,255,0.7)' }}>
              {getInitials(displayName, user?.email)}
            </span>
          )}
        </div>

        {/* Info */}
        <div style={{ minWidth: 0 }}>
          <h1 style={{
            fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)',
            fontWeight: 600,
            color: 'white',
            margin: 0,
            lineHeight: 1.2,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>
            {displayName || 'Moon Coffee Member'}
          </h1>
          <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.45)', margin: '0.25rem 0 0 0' }}>
            {user?.email}
          </p>
          {memberSince && (
            <p style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)', margin: '0.2rem 0 0 0' }}>
              Member since {memberSince}
            </p>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {/* ── Personal Info ── */}
        <SectionCard title="Personal Info">
          {message && (
            <div className="auth-success" style={{ marginBottom: '1rem' }}>{message}</div>
          )}
          {error && (
            <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>
          )}
          <form action={handleSubmit} className="auth-form">
            <label className="auth-label">
              Full Name
              <input
                type="text"
                name="fullName"
                required
                className="auth-input"
                defaultValue={profile?.full_name || ''}
                placeholder="Your name"
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
            <button type="submit" disabled={saving} className="auth-btn" style={{ alignSelf: 'flex-start' }}>
              {saving ? 'Saving…' : 'Save Changes'}
            </button>
          </form>
        </SectionCard>

        {/* ── Address Book ── */}
        <SectionCard title="Address Book">
          <AddressList />
        </SectionCard>

        {/* ── Billing ── */}
        <SectionCard title="Billing">
          <ComingSoon label="Saved payment methods" />
        </SectionCard>

        {/* ── Purchase History ── */}
        <SectionCard title="Purchase History">
          <Link
            href="/orders"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.82rem',
              color: 'rgba(255,255,255,0.7)',
              textDecoration: 'none',
              padding: '0.6rem 1rem',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.5rem',
              transition: 'background 0.2s, color 0.2s',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.09)'; (e.currentTarget as HTMLElement).style.color = 'white' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.05)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.7)' }}
          >
            View your orders →
          </Link>
        </SectionCard>

        {/* ── Sign Out ── */}
        <div style={{ paddingTop: '0.5rem' }}>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              style={{
                fontSize: '0.78rem',
                color: 'rgba(239,68,68,0.7)',
                background: 'none',
                border: '1px solid rgba(239,68,68,0.2)',
                borderRadius: '0.5rem',
                padding: '0.5rem 1rem',
                cursor: 'pointer',
                transition: 'color 0.2s, border-color 0.2s',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgb(239,68,68)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.5)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.7)'; (e.currentTarget as HTMLElement).style.borderColor = 'rgba(239,68,68,0.2)' }}
            >
              Sign Out
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}
