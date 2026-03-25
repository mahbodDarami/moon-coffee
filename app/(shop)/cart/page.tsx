'use client'

import { useEffect, useState } from 'react'
import { getCart, updateCartItem, removeFromCart, clearCart } from '@/app/actions/cart'
import { createOrder } from '@/app/actions/orders'
import QuantitySelector from '@/app/components/menu/QuantitySelector'
import type { CartItemWithMenu } from '@/types'
import { useRouter } from 'next/navigation'

const TAX_RATE = 0.09

export default function CartPage() {
  const router = useRouter()
  const [items, setItems] = useState<CartItemWithMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  async function loadCart() {
    const result = await getCart()
    if (result.success) setItems(result.data)
    setLoading(false)
  }

  useEffect(() => { loadCart() }, [])

  async function handleUpdateQty(itemId: string, qty: number) {
    await updateCartItem(itemId, qty)
    await loadCart()
  }

  async function handleRemove(itemId: string) {
    await removeFromCart(itemId)
    await loadCart()
  }

  async function handleClear() {
    await clearCart()
    await loadCart()
  }

  async function handleCheckout() {
    setSubmitting(true)
    setError('')
    const result = await createOrder(notes || undefined)
    if (result.success) {
      router.push(`/checkout?orderId=${result.data}`)
    } else {
      setError(result.error)
      setSubmitting(false)
    }
  }

  const subtotal = items.reduce((s, i) => s + i.menu_items.price * i.quantity, 0)
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + tax

  if (loading) return <div className="shop-page"><p className="shop-loading">Loading cart...</p></div>

  return (
    <div className="shop-page">
      <h1 className="shop-title">Your Cart</h1>

      {error && <div className="auth-error">{error}</div>}

      {items.length === 0 ? (
        <p className="cart-empty-page">Your cart is empty. Open the menu to add items.</p>
      ) : (
        <>
          <div className="cart-list">
            {items.map((ci) => (
              <div key={ci.id} className="cart-row">
                <div className="cart-row-info">
                  <span className="cart-row-name">{ci.menu_items.name}</span>
                  <span className="cart-row-price">${(ci.menu_items.price / 100).toFixed(2)} each</span>
                </div>
                <div className="cart-row-actions">
                  <QuantitySelector quantity={ci.quantity} onChange={(qty) => handleUpdateQty(ci.item_id, qty)} />
                  <span className="cart-row-subtotal">${(ci.menu_items.price * ci.quantity / 100).toFixed(2)}</span>
                  <button className="cart-item-remove" onClick={() => handleRemove(ci.item_id)}>Remove</button>
                </div>
              </div>
            ))}
          </div>

          <div className="cart-summary">
            <textarea
              className="cart-notes"
              placeholder="Special instructions (optional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
            />
            <div className="cart-totals">
              <div className="cart-total-row"><span>Subtotal</span><span>${(subtotal / 100).toFixed(2)}</span></div>
              <div className="cart-total-row"><span>Tax (9%)</span><span>${(tax / 100).toFixed(2)}</span></div>
              <div className="cart-total-row cart-total-final"><span>Total</span><span>${(total / 100).toFixed(2)}</span></div>
            </div>
            <div className="cart-actions">
              <button className="cart-clear-btn" onClick={handleClear}>Clear Cart</button>
              <button className="cart-checkout-btn" onClick={handleCheckout} disabled={submitting}>
                {submitting ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
