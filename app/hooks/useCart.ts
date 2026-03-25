'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/app/components/auth/AuthProvider'
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart, syncGuestCart } from '@/app/actions/cart'
import type { CartItemWithMenu, GuestCartItem } from '@/types'

const GUEST_CART_KEY = 'moon-coffee-guest-cart'

function getGuestCartItems(): GuestCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]')
  } catch {
    return []
  }
}

function setGuestCartItems(items: GuestCartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

function clearGuestCartItems() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(GUEST_CART_KEY)
}

export function useCart() {
  const { user, isLoading: authLoading } = useAuth()
  const [items, setItems] = useState<CartItemWithMenu[]>([])
  const [loading, setLoading] = useState(true)
  const [synced, setSynced] = useState(false)

  // Sync guest cart to DB on login
  useEffect(() => {
    if (authLoading || synced) return
    if (!user) {
      setSynced(true)
      setLoading(false)
      return
    }

    async function syncAndLoad() {
      // If user just logged in and has guest cart items, sync them
      const guestItems = getGuestCartItems()
      if (guestItems.length > 0) {
        await syncGuestCart(guestItems)
        clearGuestCartItems()
      }

      // Load server cart
      const result = await getCart()
      if (result.success) setItems(result.data)
      setSynced(true)
      setLoading(false)
    }

    syncAndLoad()
  }, [user, authLoading, synced])

  const refresh = useCallback(async () => {
    if (!user) return
    const result = await getCart()
    if (result.success) setItems(result.data)
  }, [user])

  const add = useCallback(async (itemId: string, quantity: number) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    const result = await addToCart(itemId, quantity)
    if (result.success) await refresh()
    return result
  }, [user, refresh])

  const updateQty = useCallback(async (itemId: string, quantity: number) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    const result = await updateCartItem(itemId, quantity)
    if (result.success) await refresh()
    return result
  }, [user, refresh])

  const remove = useCallback(async (itemId: string) => {
    if (!user) return { success: false, error: 'Not authenticated' }
    const result = await removeFromCart(itemId)
    if (result.success) await refresh()
    return result
  }, [user, refresh])

  const clear = useCallback(async () => {
    if (!user) return { success: false, error: 'Not authenticated' }
    const result = await clearCart()
    if (result.success) setItems([])
    return result
  }, [user])

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.menu_items.price * item.quantity, 0),
    [items]
  )

  return {
    items,
    loading,
    itemCount,
    subtotal,
    refresh,
    add,
    updateQty,
    remove,
    clear,
  }
}
