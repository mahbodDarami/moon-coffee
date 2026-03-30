'use client'

import { useEffect, useState } from 'react'
import { getAddresses, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '@/app/actions/address'
import AddressForm, { type AddressFormValues } from './AddressForm'
import type { Address } from '@/types'

export default function AddressList() {
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Address | null>(null)
  const [error, setError] = useState('')

  async function reload() {
    const result = await getAddresses()
    if (result.success) setAddresses(result.data)
    setLoading(false)
  }

  useEffect(() => { reload() }, [])

  async function handleAdd(values: AddressFormValues) {
    const result = await addAddress(values)
    if (!result.success) throw new Error(result.error)
    await reload()
    setShowForm(false)
  }

  async function handleUpdate(values: AddressFormValues) {
    if (!editing) return
    const result = await updateAddress(editing.id, values)
    if (!result.success) throw new Error(result.error)
    await reload()
    setEditing(null)
  }

  async function handleDelete(id: string) {
    setError('')
    const result = await deleteAddress(id)
    if (!result.success) { setError(result.error); return }
    setAddresses((prev) => prev.filter((a) => a.id !== id))
  }

  async function handleSetDefault(id: string) {
    setError('')
    const result = await setDefaultAddress(id)
    if (!result.success) { setError(result.error); return }
    await reload()
  }

  if (loading) return (
    <div style={{ display: 'flex', justifyContent: 'center', padding: '1rem' }}>
      <div className="addr-spinner" />
    </div>
  )

  return (
    <div className="addr-list-wrap">
      {error && <div className="auth-error" style={{ marginBottom: '0.75rem' }}>{error}</div>}

      {addresses.length === 0 && !showForm && (
        <p className="addr-empty">No saved addresses yet.</p>
      )}

      {addresses.map((addr) => (
        <div key={addr.id} className={`addr-card${addr.is_default ? ' addr-card--default' : ''}`}>
          {addr.is_default && <span className="addr-default-badge">Default</span>}
          <div className="addr-card-label">{addr.label}</div>
          <div className="addr-card-line">{addr.street_address}{addr.apartment ? `, ${addr.apartment}` : ''}</div>
          <div className="addr-card-line">{addr.city}, {addr.state} {addr.postal_code}</div>

          {editing?.id === addr.id ? (
            <AddressForm
              initial={{
                label: addr.label,
                street_address: addr.street_address,
                apartment: addr.apartment ?? '',
                city: addr.city,
                state: addr.state,
                postal_code: addr.postal_code,
                country: addr.country,
                lat: addr.lat,
                lng: addr.lng,
                place_id: addr.place_id,
              }}
              onSubmit={handleUpdate}
              onCancel={() => setEditing(null)}
              submitLabel="Update Address"
            />
          ) : (
            <div className="addr-card-actions">
              <button className="addr-action-btn" onClick={() => setEditing(addr)}>Edit</button>
              {!addr.is_default && (
                <button className="addr-action-btn" onClick={() => handleSetDefault(addr.id)}>Set Default</button>
              )}
              <button className="addr-action-btn addr-action-btn--delete" onClick={() => handleDelete(addr.id)}>Remove</button>
            </div>
          )}
        </div>
      ))}

      {showForm && !editing && (
        <div className="addr-form-wrap">
          <AddressForm
            onSubmit={handleAdd}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {!showForm && !editing && (
        <button className="addr-add-btn" onClick={() => setShowForm(true)}>
          + Add New Address
        </button>
      )}
    </div>
  )
}
