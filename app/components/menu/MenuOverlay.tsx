'use client'

import { useEffect, useState, useCallback } from 'react'
import type { MenuCategory, MenuItem } from '@/types'
import { getCategories, getMenuItems } from '@/app/actions/menu'
import { addToCart } from '@/app/actions/cart'
import { useAuth } from '@/app/components/auth/AuthProvider'
import MenuItemCard from './MenuItemCard'
import type { GuestCartItem } from '@/types'

interface MenuOverlayProps {
  isOpen: boolean
  onClose: () => void
  onCartUpdate?: () => void
}

const GUEST_CART_KEY = 'moon-coffee-guest-cart'

function getGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]')
  } catch {
    return []
  }
}

function setGuestCart(items: GuestCartItem[]) {
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

export default function MenuOverlay({ isOpen, onClose, onCartUpdate }: MenuOverlayProps) {
  const { user } = useAuth()
  const [categories, setCategories] = useState<MenuCategory[]>([])
  const [items, setItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const loadMenu = useCallback(async () => {
    setLoading(true)
    const cats = await getCategories()
    setCategories(cats)
    const menuItems = await getMenuItems()
    setItems(menuItems)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (isOpen) {
      loadMenu()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen, loadMenu])

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  async function handleAddToCart(itemId: string, quantity: number) {
    if (user) {
      await addToCart(itemId, quantity)
    } else {
      // Guest cart in localStorage
      const cart = getGuestCart()
      const existing = cart.find((i) => i.itemId === itemId)
      if (existing) {
        existing.quantity = Math.min(existing.quantity + quantity, 99)
      } else {
        cart.push({ itemId, quantity })
      }
      setGuestCart(cart)
    }
    onCartUpdate?.()
  }

  const filteredItems = activeCategory
    ? items.filter((item) => item.category_id === activeCategory)
    : items

  if (!isOpen) return null

  return (
    <div className="menu-overlay">
      <div className="menu-overlay-header">
        <h2 className="menu-overlay-title">Our Menu</h2>
        <button className="menu-overlay-close" onClick={onClose} aria-label="Close menu">
          &times;
        </button>
      </div>

      <div className="menu-category-tabs">
        <button
          className={`menu-category-tab ${!activeCategory ? 'active' : ''}`}
          onClick={() => setActiveCategory(null)}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`menu-category-tab ${activeCategory === cat.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="menu-overlay-body">
        {loading ? (
          <div className="menu-loading">Loading menu...</div>
        ) : (
          <div className="menu-grid">
            {filteredItems.map((item) => (
              <MenuItemCard key={item.id} item={item} onAddToCart={handleAddToCart} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export { getGuestCart, setGuestCart, GUEST_CART_KEY }
