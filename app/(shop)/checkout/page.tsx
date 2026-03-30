'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { getOrder, updateOrderAddress } from '@/app/actions/orders'
import { createCheckoutSession } from '@/app/actions/stripe'
import AddressSelector from '@/app/components/address/AddressSelector'
import type { OrderWithItemsAndOptions } from '@/types'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<OrderWithItemsAndOptions | null>(null)
  const [loading, setLoading] = useState(true)
  const [redirecting, setRedirecting] = useState(false)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!orderId) { setLoading(false); return }
      const result = await getOrder(orderId)
      if (result.success) setOrder(result.data)
      setLoading(false)
    }
    load()
  }, [orderId])

  async function handleStripeCheckout() {
    if (!orderId) return
    setRedirecting(true)
    setError('')
    try {
      // Attach selected address to the order
      if (selectedAddressId) {
        await updateOrderAddress(orderId, selectedAddressId)
      }
      const result = await createCheckoutSession(orderId)
      if (result.success) {
        window.location.href = result.data
      } else {
        setError(result.error)
        setRedirecting(false)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setRedirecting(false)
    }
  }

  if (loading) return <p className="shop-loading">Loading...</p>
  if (!orderId || !order) return <p className="cart-empty-page">No order found.</p>

  return (
    <>
      <h1 className="shop-title">Order Review</h1>
      {error && <div className="auth-error">{error}</div>}

      <div className="checkout-summary">
        <h2 className="checkout-section-heading">Items</h2>
        {order.order_items.map((oi) => (
          <div key={oi.id} className="cart-row">
            <div className="cart-row-info">
              <span className="cart-row-name">{oi.item_name} ×{oi.quantity}</span>
              {oi.order_item_options?.length > 0 && (
                <span className="cart-row-options">
                  {oi.order_item_options.map((o) => o.option_value).join(', ')}
                </span>
              )}
            </div>
            <span className="cart-row-subtotal">${(oi.subtotal / 100).toFixed(2)}</span>
          </div>
        ))}
        <div className="cart-totals">
          <div className="cart-total-row"><span>Subtotal</span><span>${(order.subtotal / 100).toFixed(2)}</span></div>
          <div className="cart-total-row"><span>Tax (9%)</span><span>${(order.tax / 100).toFixed(2)}</span></div>
          <div className="cart-total-row cart-total-final"><span>Total</span><span>${(order.total / 100).toFixed(2)}</span></div>
        </div>
      </div>

      <div className="checkout-payment">
        <h2 className="checkout-section-heading">Delivery Address</h2>
        <AddressSelector value={selectedAddressId} onChange={setSelectedAddressId} />
      </div>

      <div className="checkout-payment">
        <h2 className="checkout-section-heading">Payment</h2>
        <p className="checkout-msg">You'll be redirected to Stripe's secure checkout page.</p>
        <button
          className="cart-checkout-btn checkout-stripe-btn"
          onClick={handleStripeCheckout}
          disabled={redirecting}
        >
          {redirecting ? 'Redirecting to Stripe...' : `Pay $${(order.total / 100).toFixed(2)} with Stripe`}
        </button>
      </div>
    </>
  )
}

export default function CheckoutPage() {
  return (
    <div className="shop-page">
      <Suspense fallback={<p className="shop-loading">Loading...</p>}>
        <CheckoutContent />
      </Suspense>
    </div>
  )
}
