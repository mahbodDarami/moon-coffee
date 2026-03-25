'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ActionResult, CartItemWithMenu, GuestCartItem } from '@/types'

const cartItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
})

async function getOrCreateCart(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data: existingCart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', userId)
    .single()

  if (existingCart) return existingCart.id

  const { data: newCart, error } = await supabase
    .from('carts')
    .insert({ user_id: userId })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  return newCart.id
}

export async function getCart(): Promise<ActionResult<CartItemWithMenu[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cart) return { success: true, data: [] }

  const { data: items, error } = await supabase
    .from('cart_items')
    .select('*, menu_items(*)')
    .eq('cart_id', cart.id)
    .order('created_at')

  if (error) return { success: false, error: error.message }
  return { success: true, data: (items || []) as CartItemWithMenu[] }
}

export async function addToCart(itemId: string, quantity: number): Promise<ActionResult> {
  const parsed = cartItemSchema.safeParse({ itemId, quantity })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const cartId = await getOrCreateCart(supabase, user.id)

  // Upsert: if item exists, add to quantity
  const { data: existing } = await supabase
    .from('cart_items')
    .select('id, quantity')
    .eq('cart_id', cartId)
    .eq('item_id', parsed.data.itemId)
    .single()

  if (existing) {
    const newQty = Math.min(existing.quantity + parsed.data.quantity, 99)
    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQty, updated_at: new Date().toISOString() })
      .eq('id', existing.id)

    if (error) return { success: false, error: error.message }
  } else {
    const { error } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        item_id: parsed.data.itemId,
        quantity: parsed.data.quantity,
      })

    if (error) return { success: false, error: error.message }
  }

  return { success: true, data: undefined }
}

export async function updateCartItem(itemId: string, quantity: number): Promise<ActionResult> {
  const parsed = cartItemSchema.safeParse({ itemId, quantity })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cart) return { success: false, error: 'Cart not found' }

  const { error } = await supabase
    .from('cart_items')
    .update({ quantity: parsed.data.quantity, updated_at: new Date().toISOString() })
    .eq('cart_id', cart.id)
    .eq('item_id', parsed.data.itemId)

  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}

export async function removeFromCart(itemId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cart) return { success: false, error: 'Cart not found' }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id)
    .eq('item_id', itemId)

  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}

export async function clearCart(): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cart) return { success: true, data: undefined }

  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('cart_id', cart.id)

  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}

export async function syncGuestCart(items: GuestCartItem[]): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const cartId = await getOrCreateCart(supabase, user.id)

  for (const item of items) {
    const parsed = cartItemSchema.safeParse({ itemId: item.itemId, quantity: item.quantity })
    if (!parsed.success) continue

    const { data: existing } = await supabase
      .from('cart_items')
      .select('id, quantity')
      .eq('cart_id', cartId)
      .eq('item_id', parsed.data.itemId)
      .single()

    if (existing) {
      const newQty = Math.min(existing.quantity + parsed.data.quantity, 99)
      await supabase
        .from('cart_items')
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
    } else {
      await supabase
        .from('cart_items')
        .insert({
          cart_id: cartId,
          item_id: parsed.data.itemId,
          quantity: parsed.data.quantity,
        })
    }
  }

  return { success: true, data: undefined }
}
