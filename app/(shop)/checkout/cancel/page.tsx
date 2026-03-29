'use client'

import { Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

function CancelContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('orderId')

  return (
    <div className="checkout-cancel">
      <div className="checkout-cancel-icon">✕</div>
      <h1 className="shop-title">Payment Cancelled</h1>
      <p className="checkout-msg">
        No worries — your order is saved. You can try again whenever you're ready.
      </p>
      <div className="checkout-actions">
        {orderId && (
          <button
            className="cart-checkout-btn"
            onClick={() => router.push(`/checkout?orderId=${orderId}`)}
          >
            Try Again
          </button>
        )}
        <button className="cart-clear-btn" onClick={() => router.push('/')}>
          Back to Home
        </button>
      </div>
    </div>
  )
}

export default function CheckoutCancelPage() {
  return (
    <div className="shop-page">
      <Suspense fallback={<p className="shop-loading">Loading...</p>}>
        <CancelContent />
      </Suspense>
    </div>
  )
}
