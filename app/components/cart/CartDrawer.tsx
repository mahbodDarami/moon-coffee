'use client'

import { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { getCart, updateCartItem, removeFromCart } from '@/app/actions/cart'
import { getGuestCart, setGuestCart, GUEST_CART_KEY } from '@/app/components/menu/MenuOverlay'
import { getMenuItems } from '@/app/actions/menu'
import QuantitySelector from '@/app/components/menu/QuantitySelector'
import type { CartItemWithMenuAndOptions, MenuItem } from '@/types'
import Link from 'next/link'

interface CartDrawerProps {
  isOpen: boolean
  onClose: () => void
  refreshKey?: number
}

type DisplayCartItem = {
  id: string
  itemId: string
  name: string
  price: number
  quantity: number
  image_url?: string | null
  optionSummary?: string
}

export default function CartDrawer({ isOpen, onClose, refreshKey }: CartDrawerProps) {
  const { user } = useAuth()
  const [items, setItems] = useState<DisplayCartItem[]>([])
  const [loading, setLoading] = useState(true)

  const loadCart = useCallback(async () => {
    setLoading(true)
    if (user) {
      const result = await getCart()
      if (result.success) {
        setItems(
          result.data.map((ci: CartItemWithMenuAndOptions) => {
            const optMods = (ci.cart_item_options || []).reduce(
              (sum, opt) => sum + (opt.product_options?.price_modifier || 0), 0
            )
            const optNames = (ci.cart_item_options || [])
              .filter((opt) => opt.product_options?.product_option_groups?.type !== 'text')
              .map((opt) => opt.product_options?.name)
              .filter(Boolean)
            return {
              id: ci.id,
              itemId: ci.item_id,
              name: ci.menu_items.name,
              price: ci.menu_items.price + optMods,
              quantity: ci.quantity,
              image_url: ci.menu_items.image_url,
              optionSummary: optNames.length > 0 ? optNames.join(', ') : undefined,
            }
          })
        )
      }
    } else {
      const guestItems = getGuestCart()
      if (guestItems.length > 0) {
        const allItems = await getMenuItems()
        const mapped: DisplayCartItem[] = guestItems
          .map((gi, index) => {
            const menuItem = allItems.find((m: MenuItem) => m.id === gi.itemId)
            if (!menuItem) return null
            const optMods = (gi.selectedOptions || []).reduce(
              (sum, opt) => sum + (opt.priceModifier || 0), 0
            )
            const optNames = (gi.selectedOptions || [])
              .filter((opt) => !opt.value)
              .map((opt) => opt.optionName)
              .filter(Boolean)
            return {
              id: `guest-${index}`,
              itemId: gi.itemId,
              name: menuItem.name,
              price: menuItem.price + optMods,
              quantity: gi.quantity,
              image_url: menuItem.image_url,
              optionSummary: optNames.length > 0 ? optNames.join(', ') : undefined,
            }
          })
          .filter(Boolean) as DisplayCartItem[]
        setItems(mapped)
      } else {
        setItems([])
      }
    }
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (isOpen) {
      loadCart()
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [isOpen, loadCart, refreshKey])

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  async function handleUpdateQty(id: string, newQty: number) {
    if (user) {
      await updateCartItem(id, newQty)
    } else {
      const cart = getGuestCart()
      const index = parseInt(id.replace('guest-', ''), 10)
      if (!isNaN(index) && cart[index]) cart[index].quantity = newQty
      setGuestCart(cart)
    }
    await loadCart()
  }

  async function handleRemove(id: string) {
    if (user) {
      await removeFromCart(id)
    } else {
      const cart = getGuestCart()
      const index = parseInt(id.replace('guest-', ''), 10)
      if (!isNaN(index)) cart.splice(index, 1)
      setGuestCart(cart)
    }
    await loadCart()
  }

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0)
  const itemCount = items.reduce((s, i) => s + i.quantity, 0)

  if (!isOpen) return null

  return (
    <div className="cart-drawer-backdrop" onClick={onClose}>
      <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
        <div className="cart-drawer-header">
          <h2>Your Cart ({itemCount})</h2>
          <button className="cart-drawer-close" onClick={onClose} aria-label="Close cart">&times;</button>
        </div>

        <div className="cart-drawer-body">
          {loading ? (
            <p className="cart-empty">Loading...</p>
          ) : items.length === 0 ? (
            <p className="cart-empty">Your cart is empty</p>
          ) : (
            <>
              {items.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    {item.optionSummary && (
                      <span className="cart-item-options">{item.optionSummary}</span>
                    )}
                    <span className="cart-item-price">${(item.price / 100).toFixed(2)}</span>
                  </div>
                  <div className="cart-item-actions">
                    <QuantitySelector
                      quantity={item.quantity}
                      onChange={(qty) => handleUpdateQty(item.id, qty)}
                    />
                    <button className="cart-item-remove" onClick={() => handleRemove(item.id)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {items.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-subtotal">
              <span>Subtotal</span>
              <span>${(subtotal / 100).toFixed(2)}</span>
            </div>
            {user ? (
              <Link href="/cart" className="cart-checkout-btn" onClick={onClose}>
                View Cart & Checkout
              </Link>
            ) : (
              <Link href="/login?redirectTo=/cart" className="cart-checkout-btn" onClick={onClose}>
                Sign in to Checkout
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
