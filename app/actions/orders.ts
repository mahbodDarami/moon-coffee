'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ActionResult, OrderWithItems } from '@/types'

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

  // Get cart with items
  const { data: cart } = await supabase
    .from('carts')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!cart) return { success: false, error: 'Cart is empty' }

  const { data: cartItems } = await supabase
    .from('cart_items')
    .select('*, menu_items(id, name, price)')
    .eq('cart_id', cart.id)

  if (!cartItems || cartItems.length === 0) {
    return { success: false, error: 'Cart is empty' }
  }

  // Calculate totals
  const subtotal = cartItems.reduce((sum, item) => {
    const menuItem = item.menu_items as unknown as { id: string; name: string; price: number }
    return sum + menuItem.price * item.quantity
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

  // Create order items (snapshot prices)
  const orderItems = cartItems.map((item) => {
    const menuItem = item.menu_items as unknown as { id: string; name: string; price: number }
    return {
      order_id: order.id,
      item_id: menuItem.id,
      item_name: menuItem.name,
      item_price: menuItem.price,
      quantity: item.quantity,
      subtotal: menuItem.price * item.quantity,
    }
  })

  const { error: itemsError } = await supabase
    .from('order_items')
    .insert(orderItems)

  if (itemsError) return { success: false, error: itemsError.message }

  // Clear cart
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

export async function getOrder(orderId: string): Promise<ActionResult<OrderWithItems>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (error) return { success: false, error: 'Order not found' }
  return { success: true, data: data as OrderWithItems }
}
