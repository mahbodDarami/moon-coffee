'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ActionResult, OrderWithItems, OrderWithItemsAndOptions } from '@/types'

const TAX_RATE = 0.09 // 9% tax

const createOrderSchema = z.object({
  notes: z.string().max(500).optional(),
})

export async function createOrder(notes?: string): Promise<ActionResult<string>> {
  const parsed = createOrderSchema.safeParse({ notes })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Get cart with items and their selected options
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cart) return { success: false, error: 'Cart is empty' }

  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*, menu_items(id, name, price), cart_item_options(*, product_options(name, price_modifier, product_option_groups(name)))')
    .eq('cart_id', cart.id)

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: 'Cart is empty' }
  }

  // Calculate totals including option price modifiers
  const subtotal = cartItems.reduce((sum, item) => {
    const menuItem = item.menu_items as unknown as { id: string; name: string; price: number }
    const optionModifiers = (item.cart_item_options || []).reduce((optSum: number, opt: { product_options: { price_modifier: number } }) => {
      return optSum + (opt.product_options?.price_modifier || 0)
    }, 0)
    return sum + (menuItem.price + optionModifiers) * item.quantity
  }, 0)
  const tax = Math.round(subtotal * TAX_RATE)
  const total = subtotal + tax

  // Create order
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      user_id: user.id,
      subtotal,
      tax,
      total,
      notes: parsed.data.notes || null,
      status: 'pending',
      payment_status: 'pending',
    })
    .select('id')
    .single()

  if (orderError) return { success: false, error: orderError.message }

  // Create order items (snapshot prices including option modifiers)
  for (const item of cartItems) {
    const menuItem = item.menu_items as unknown as { id: string; name: string; price: number }
    const optionModifiers = (item.cart_item_options || []).reduce((optSum: number, opt: { product_options: { price_modifier: number } }) => {
      return optSum + (opt.product_options?.price_modifier || 0)
    }, 0)
    const itemPrice = menuItem.price + optionModifiers

    const { data: orderItem, error: itemError } = await supabase
      .from('order_items')
      .insert({
        order_id: order.id,
        item_id: menuItem.id,
        item_name: menuItem.name,
        item_price: itemPrice,
        quantity: item.quantity,
        subtotal: itemPrice * item.quantity,
      })
      .select('id')
      .single()

    if (itemError) return { success: false, error: itemError.message }

    // Snapshot options into order_item_options
    const cartOptions = item.cart_item_options as unknown as Array<{
      value: string | null
      product_options: {
        name: string
        price_modifier: number
        product_option_groups: { name: string }
      }
    }>

    if (cartOptions && cartOptions.length > 0) {
      const orderItemOptions = cartOptions.map((opt) => ({
        order_item_id: orderItem.id,
        option_name: opt.product_options.product_option_groups.name,
        option_value: opt.value || opt.product_options.name,
        price_modifier: opt.product_options.price_modifier,
      }))

      const { error: optError } = await supabase
        .from('order_item_options')
        .insert(orderItemOptions)

      if (optError) return { success: false, error: optError.message }
    }
  }

  // Clear cart (cart_item_options deleted via CASCADE)
  await supabase.from('cart_items').delete().eq('cart_id', cart.id)

  return { success: true, data: order.id }
}

export async function getOrders(): Promise<ActionResult<OrderWithItems[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data: (data || []) as OrderWithItems[] }
}

export async function getOrder(orderId: string): Promise<ActionResult<OrderWithItemsAndOptions>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*, order_item_options(*))')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (error) return { success: false, error: 'Order not found' }
  return { success: true, data: data as OrderWithItemsAndOptions }
}
