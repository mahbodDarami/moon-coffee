'use client'

import { useEffect, useState } from 'react'
import { getAddresses, addAddress } from '@/app/actions/address'
import AddressForm, { type AddressFormValues } from './AddressForm'
import type { Address } from '@/types'

interface Props {
  value: string | null            // selected address id
  onChange: (id: string | null) => void
}

export default function AddressSelector({ value, onChange }: Props) {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  async function reload() {
    const result = await getAddresses()
    if (result.success) {
      setAddresses(result.data)
      // Auto-select default if nothing selected yet
      if (!value) {
        const def = result.data.find((a) => a.is_default) ?? result.data[0]
        if (def) onChange(def.id)
      }
    }
    setLoading(false)
  }

  useEffect(() => { reload() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleAdd(values: AddressFormValues) {
    const result = await addAddress(values)
    if (!result.success) throw new Error(result.error)
    await reload()
    onChange(result.data.id)
    setShowForm(false)
  }

  if (loading) return (
    <div style={{ display: 'flex', padding: '0.75rem 0' }}>
      <div className="addr-spinner" />
    </div>
  )

  return (
    <div className="addr-selector">
      {addresses.map((addr) => (
        <label key={addr.id} className={`addr-sel-option${value === addr.id ? ' addr-sel-option--active' : ''}`}>
          <input
            type="radio"
            name="delivery_address"
            value={addr.id}
            checked={value === addr.id}
            onChange={() => onChange(addr.id)}
            className="addr-sel-radio"
          />
          <div className="addr-sel-body">
            <span className="addr-sel-label">{addr.label}</span>
            {addr.is_default && <span className="addr-default-badge">Default</span>}
            <div className="addr-sel-line">{addr.street_address}{addr.apartment ? `, ${addr.apartment}` : ''}</div>
            <div className="addr-sel-line">{addr.city}, {addr.state} {addr.postal_code}</div>
          </div>
        </label>
      ))}

      {!showForm && (
        <button type="button" className="addr-add-btn" onClick={() => setShowForm(true)}>
          + Add New Address
        </button>
      )}

      {showForm && (
        <div className="addr-form-wrap">
          <AddressForm
            onSubmit={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {addresses.length === 0 && !showForm && (
        <p className="addr-empty">Add a delivery address to continue.</p>
      )}
    </div>
  )
}
