'use client'

import { useState } from 'react'
import AddressAutocomplete from './AddressAutocomplete'
import type { ParsedAddress } from '@/lib/google-places'

export interface AddressFormValues {
  label: string
  street_address: string
  apartment: string
  city: string
  state: string
  postal_code: string
  country: string
  lat: number | null
  lng: number | null
  place_id: string | null
}

interface Props {
  initial?: Partial<AddressFormValues>
  onSubmit: (values: AddressFormValues) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

const empty: AddressFormValues = {
  label: 'Home',
  street_address: '',
  apartment: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'US',
  lat: null,
  lng: null,
  place_id: null,
}

export default function AddressForm({ initial, onSubmit, onCancel, submitLabel = 'Save Address' }: Props) {
  const [values, setValues] = useState<AddressFormValues>({ ...empty, ...initial })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function set(field: keyof AddressFormValues, value: string | number | null) {
    setValues((v) => ({ ...v, [field]: value }))
  }

  function handleAutocomplete(parsed: ParsedAddress) {
    setValues((v) => ({
      ...v,
      street_address: parsed.street_address,
      city: parsed.city,
      state: parsed.state,
      postal_code: parsed.postal_code,
      country: parsed.country || 'US',
      lat: parsed.lat,
      lng: parsed.lng,
      place_id: parsed.place_id,
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!values.street_address || !values.city || !values.state || !values.postal_code) {
      setError('Please fill in all required fields.')
      return
    }
    setSaving(true)
    setError('')
    try {
      await onSubmit(values)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    }
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit} className="addr-form">
      {error && <div className="auth-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}

      <label className="addr-label">
        Label
        <input
          type="text"
          className="addr-input"
          value={values.label}
          onChange={(e) => set('label', e.target.value)}
          placeholder="Home, Work, etc."
          maxLength={50}
        />
      </label>

      <label className="addr-label">
        Address <span className="addr-required">*</span>
        <AddressAutocomplete
          className="addr-input addr-autocomplete-input"
          onSelect={handleAutocomplete}
          placeholder="Start typing your address…"
        />
      </label>

      <label className="addr-label">
        Street Address <span className="addr-required">*</span>
        <input
          type="text"
          className="addr-input"
          value={values.street_address}
          onChange={(e) => set('street_address', e.target.value)}
          placeholder="123 Main St"
          required
        />
      </label>

      <label className="addr-label">
        Apartment / Suite
        <input
          type="text"
          className="addr-input"
          value={values.apartment}
          onChange={(e) => set('apartment', e.target.value)}
          placeholder="Apt, Suite, Unit (optional)"
          maxLength={50}
        />
      </label>

      <div className="addr-row">
        <label className="addr-label" style={{ flex: 2 }}>
          City <span className="addr-required">*</span>
          <input
            type="text"
            className="addr-input"
            value={values.city}
            onChange={(e) => set('city', e.target.value)}
            required
          />
        </label>
        <label className="addr-label" style={{ flex: 1 }}>
          State <span className="addr-required">*</span>
          <input
            type="text"
            className="addr-input"
            value={values.state}
            onChange={(e) => set('state', e.target.value)}
            maxLength={100}
            required
          />
        </label>
        <label className="addr-label" style={{ flex: 1 }}>
          Postal Code <span className="addr-required">*</span>
          <input
            type="text"
            className="addr-input"
            value={values.postal_code}
            onChange={(e) => set('postal_code', e.target.value)}
            maxLength={20}
            required
          />
        </label>
      </div>

      <div className="addr-actions">
        <button type="button" className="addr-btn-cancel" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="addr-btn-save" disabled={saving}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}
