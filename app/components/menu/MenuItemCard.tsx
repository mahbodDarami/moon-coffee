'use client'

import { useState } from 'react'
import type { MenuItem } from '@/types'
import QuantitySelector from './QuantitySelector'

interface MenuItemCardProps {
  item: MenuItem
  onAddToCart: (itemId: string, quantity: number) => void
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)

  async function handleAdd() {
    setAdding(true)
    await onAddToCart(item.id, quantity)
    setQuantity(1)
    setAdding(false)
  }

  return (
    <div className="menu-card">
      {item.image_url && (
        <div className="menu-card-img">
          <img src={item.image_url} alt={item.name} />
        </div>
      )}
      <div className="menu-card-body">
        <h3 className="menu-card-name">{item.name}</h3>
        {item.description && <p className="menu-card-desc">{item.description}</p>}
        <div className="menu-card-tags">
          {item.tags?.map((tag) => (
            <span key={tag} className="menu-card-tag">{tag}</span>
          ))}
        </div>
        <div className="menu-card-footer">
          <span className="menu-card-price">${(item.price / 100).toFixed(2)}</span>
          <div className="menu-card-actions">
            <QuantitySelector quantity={quantity} onChange={setQuantity} />
            <button className="menu-card-add" onClick={handleAdd} disabled={adding}>
              {adding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
