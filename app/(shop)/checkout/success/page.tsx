'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { confirmOrderFromSession } from '@/app/actions/stripe'

function SuccessContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const sessionId = searchParams.get('session_id')
  const [orderId, setOrderId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!sessionId) { setLoading(false); return }

    confirmOrderFromSession(sessionId).then((result) => {
      if (result.success) {
        setOrderId(result.data)
      } else {
        setError(result.error)
      }
      setLoading(false)
    })
  }, [sessionId])

  if (loading) return <p className="shop-loading">Confirming your order...</p>

  if (error) return (
    <div className="checkout-cancel">
      <div className="checkout-cancel-icon">!</div>
      <h1 className="shop-title">Something went wrong</h1>
      <p className="checkout-msg">{error}</p>
      <div className="checkout-actions">
        <button className="cart-clear-btn" onClick={() => router.push('/orders')}>View Orders</button>
      </div>
    </div>
  )

  return (
    <div className="checkout-success">
      <div className="checkout-success-icon">✓</div>
      <h1 className="shop-title">Payment Successful!</h1>
      <p className="checkout-msg">
        Thank you for your order. Your coffee is being prepared.
      </p>
      {orderId && (
        <div className="checkout-order-id">Order #{orderId.slice(0, 8)}</div>
      )}
      <div className="checkout-actions">
        <button className="cart-checkout-btn" onClick={() => router.push('/orders')}>
          View Orders
        </button>
        <button className="cart-clear-btn" onClick={() => router.push('/')}>
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default function CheckoutSuccessPage() {
  return (
    <div className="shop-page">
      <Suspense fallback={<p className="shop-loading">Confirming your order...</p>}>
        <SuccessContent />
      </Suspense>
    </div>
  )
}
