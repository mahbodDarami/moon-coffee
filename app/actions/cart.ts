'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ActionResult, CartItemWithMenuAndOptions, GuestCartItem } from '@/types'

const cartItemSchema = z.object({
  itemId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
})

const selectedOptionSchema = z.object({
  optionId: z.string().uuid(),
  value: z.string().optional(),
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

export async function getCart(): Promise<ActionResult<CartItemWithMenuAndOptions[]>> {
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
    .select('*, menu_items(*), cart_item_options(*, product_options(*, product_option_groups(*)))')
    .eq('cart_id', cart.id)
    .order('created_at')

  if (error) return { success: false, error: error.message }
  return { success: true, data: (items || []) as CartItemWithMenuAndOptions[] }
}

export async function addToCart(
  itemId: string,
  quantity: number,
  selectedOptions?: { optionId: string; value?: string }[]
): Promise<ActionResult> {
  const parsed = cartItemSchema.safeParse({ itemId, quantity })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  if (selectedOptions) {
    for (const opt of selectedOptions) {
      const optParsed = selectedOptionSchema.safeParse(opt)
      if (!optParsed.success) return { success: false, error: 'Invalid option selection' }
    }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const cartId = await getOrCreateCart(supabase, user.id)

  // Always create a new cart item (different options = different line item)
  const { data: newItem, error: insertError } = await supabase
    .from('cart_items')
    .insert({
      cart_id: cartId,
      item_id: parsed.data.itemId,
      quantity: parsed.data.quantity,
    })
    .select('id')
    .single()

  if (insertError) return { success: false, error: insertError.message }

  // Insert selected options
  if (selectedOptions && selectedOptions.length > 0) {
    const optionRows = selectedOptions.map((opt) => ({
      cart_item_id: newItem.id,
      option_id: opt.optionId,
      value: opt.value || null,
    }))

    const { error: optError } = await supabase
      .from('cart_item_options')
      .insert(optionRows)

    if (optError) return { success: false, error: optError.message }
  }

  return { success: true, data: undefined }
}

export async function updateCartItem(cartItemId: string, quantity: number): Promise<ActionResult> {
  if (quantity < 1 || quantity > 99) return { success: false, error: 'Invalid quantity' }

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
    .update({ quantity, updated_at: new Date().toISOString() })
    .eq('id', cartItemId)
    .eq('cart_id', cart.id)

  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}

export async function removeFromCart(cartItemId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cart) return { success: false, error: 'Cart not found' }

  // cart_item_options are deleted automatically via ON DELETE CASCADE
  const { error } = await supabase
    .from('cart_items')
    .delete()
    .eq('id', cartItemId)
    .eq('cart_id', cart.id)

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

  // cart_item_options are deleted automatically via ON DELETE CASCADE
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

    // Always create new cart items when syncing guest cart (options make each line unique)
    const { data: newItem } = await supabase
      .from('cart_items')
      .insert({
        cart_id: cartId,
        item_id: parsed.data.itemId,
        quantity: parsed.data.quantity,
      })
      .select('id')
      .single()

    // Sync selected options if present
    if (newItem && item.selectedOptions && item.selectedOptions.length > 0) {
      const optionRows = item.selectedOptions
        .filter((opt) => opt.optionId)
        .map((opt) => ({
          cart_item_id: newItem.id,
          option_id: opt.optionId,
          value: opt.value || null,
        }))

      if (optionRows.length > 0) {
        await supabase.from('cart_item_options').insert(optionRows)
      }
    }
  }

  return { success: true, data: undefined }
}
