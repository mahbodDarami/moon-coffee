'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { getOrder } from '@/app/actions/orders'
import type { OrderWithItems } from '@/types'
import Link from 'next/link'

export default function OrderDetailPage() {
  const params = useParams()
  const [order, setOrder] = useState<OrderWithItems | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getOrder(params.id as string)
      if (result.success) setOrder(result.data)
      setLoading(false)
    }
    load()
  }, [params.id])

  if (loading) return <div className="shop-page"><p className="shop-loading">Loading order...</p></div>
  if (!order) return <div className="shop-page"><p className="cart-empty-page">Order not found.</p></div>

  return (
    <div className="shop-page">
      <Link href="/orders" className="shop-back">&larr; Back to orders</Link>
      <h1 className="shop-title">Order #{order.id.slice(0, 8)}</h1>

      <div className="order-detail-status">
        <span className={`order-card-status status-${order.status}`}>{order.status}</span>
        <span className="order-detail-date">
          {new Date(order.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
          })}
        </span>
      </div>

      <div className="order-detail-items">
        {order.order_items.map((oi) => (
          <div key={oi.id} className="cart-row">
            <div className="cart-row-info">
              <span className="cart-row-name">{oi.item_name}</span>
              <span className="cart-row-price">${(oi.item_price / 100).toFixed(2)} x {oi.quantity}</span>
            </div>
            <span className="cart-row-subtotal">${(oi.subtotal / 100).toFixed(2)}</span>
          </div>
        ))}
      </div>

      <div className="cart-totals">
        <div className="cart-total-row"><span>Subtotal</span><span>${(order.subtotal / 100).toFixed(2)}</span></div>
        <div className="cart-total-row"><span>Tax</span><span>${(order.tax / 100).toFixed(2)}</span></div>
        <div className="cart-total-row cart-total-final"><span>Total</span><span>${(order.total / 100).toFixed(2)}</span></div>
      </div>

      {order.notes && (
        <div className="order-detail-notes">
          <h3>Notes</h3>
          <p>{order.notes}</p>
        </div>
      )}
    </div>
  )
}
