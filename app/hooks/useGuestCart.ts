'use client'

import { useState, useCallback } from 'react'
import type { GuestCartItem } from '@/types'

const GUEST_CART_KEY = 'moon-coffee-guest-cart'

function readGuestCart(): GuestCartItem[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(GUEST_CART_KEY) || '[]')
  } catch {
    return []
  }
}

function writeGuestCart(items: GuestCartItem[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(GUEST_CART_KEY, JSON.stringify(items))
}

/**
 * Hook for managing the guest (unauthenticated) cart via localStorage.
 * Used before user signs in. On sign-in, these items get synced to the DB.
 */
export function useGuestCart() {
  const [items, setItems] = useState<GuestCartItem[]>(readGuestCart)

  const add = useCallback((itemId: string, quantity: number) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.itemId === itemId)
      let updated: GuestCartItem[]
      if (existing) {
        updated = prev.map((i) =>
          i.itemId === itemId
            ? { ...i, quantity: Math.min(i.quantity + quantity, 99) }
            : i
        )
      } else {
        updated = [...prev, { itemId, quantity }]
      }
      writeGuestCart(updated)
      return updated
    })
  }, [])

  const updateQty = useCallback((itemId: string, quantity: number) => {
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.itemId === itemId ? { ...i, quantity } : i
      )
      writeGuestCart(updated)
      return updated
    })
  }, [])

  const remove = useCallback((itemId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.itemId !== itemId)
      writeGuestCart(updated)
      return updated
    })
  }, [])

  const clear = useCallback(() => {
    writeGuestCart([])
    setItems([])
  }, [])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)

  return { items, itemCount, add, updateQty, remove, clear }
}
