'use client'

import { useEffect, useState } from 'react'
import { getOrders } from '@/app/actions/orders'
import type { OrderWithItems } from '@/types'
import Link from 'next/link'

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderWithItems[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const result = await getOrders()
      if (result.success) setOrders(result.data)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <div className="shop-page"><p className="shop-loading">Loading orders...</p></div>

  return (
    <div className="shop-page">
      <h1 className="shop-title">Order History</h1>

      {orders.length === 0 ? (
        <p className="cart-empty-page">No orders yet. Start by adding items from the menu.</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link key={order.id} href={`/orders/${order.id}`} className="order-card">
              <div className="order-card-header">
                <span className="order-card-id">#{order.id.slice(0, 8)}</span>
                <span className={`order-card-status status-${order.status}`}>{order.status}</span>
              </div>
              <div className="order-card-body">
                <span>{order.order_items.length} item{order.order_items.length !== 1 ? 's' : ''}</span>
                <span className="order-card-total">${(order.total / 100).toFixed(2)}</span>
              </div>
              <div className="order-card-date">
                {new Date(order.created_at).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
                })}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
