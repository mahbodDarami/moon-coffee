'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { getOrder } from '@/app/actions/orders'
import { processPayment } from '@/app/actions/checkout'
import type { OrderWithItems } from '@/types'

function CheckoutContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)
  const [paying, setPaying] = useState(false)
  const [paid, setPaid] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      if (!orderId) { setLoading(false); return }
      const result = await getOrder(orderId)
      if (result.success) {
        setOrder(result.data)
        if (result.data.payment_status === 'paid') setPaid(true)
      }
      setLoading(false)
    }
    load()
  }, [orderId])

  async function handlePay() {
    if (!orderId) return
    setPaying(true)
    setError('')
    const result = await processPayment(orderId)
    if (result.success) {
      setPaid(true)
    } else {
      setError(result.error)
    }
    setPaying(false)
  }

  if (loading) return <p className="shop-loading">Loading...</p>
  if (!orderId || !order) return <p className="cart-empty-page">No order found.</p>

  return paid ? (
    <div className="checkout-success">
      <h1 className="shop-title">Order Confirmed!</h1>
      <p className="checkout-msg">Thank you for your order. Your coffee is being prepared.</p>
      <div className="checkout-order-id">Order #{order.id.slice(0, 8)}</div>
      <div className="checkout-actions">
        <button className="cart-checkout-btn" onClick={() => router.push('/orders')}>
          View Orders
        </button>
        <button className="cart-clear-btn" onClick={() => router.push('/')}>
          Back to Home
        </button>
      </div>
    </div>
  ) : (
    <>
      <h1 className="shop-title">Checkout</h1>
      {error && <div className="auth-error">{error}</div>}

      <div className="checkout-summary">
        <h2>Order Summary</h2>
        {order.order_items.map((oi) => (
          <div key={oi.id} className="cart-row">
            <span className="cart-row-name">{oi.item_name} x{oi.quantity}</span>
            <span className="cart-row-subtotal">${(oi.subtotal / 100).toFixed(2)}</span>
          </div>
        ))}
        <div className="cart-totals">
          <div className="cart-total-row"><span>Subtotal</span><span>${(order.subtotal / 100).toFixed(2)}</span></div>
          <div className="cart-total-row"><span>Tax</span><span>${(order.tax / 100).toFixed(2)}</span></div>
          <div className="cart-total-row cart-total-final"><span>Total</span><span>${(order.total / 100).toFixed(2)}</span></div>
        </div>
      </div>

      <div className="checkout-payment">
        <h2>Payment</h2>
        <p className="checkout-msg">This is a simulated payment. Click below to complete your order.</p>
        <button className="cart-checkout-btn" onClick={handlePay} disabled={paying}>
          {paying ? 'Processing Payment...' : `Pay $${(order.total / 100).toFixed(2)}`}
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
