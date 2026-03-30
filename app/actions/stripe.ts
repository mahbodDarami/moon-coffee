'use server'

import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-03-25.dahlia',
})

export async function createCheckoutSession(
  orderId: string
): Promise<ActionResult<string>> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return { success: false, error: 'Not authenticated' }

    // Load order with items and options
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select('*, order_items(*, order_item_options(*))')
      .eq('id', orderId)
      .eq('user_id', user.id)
      .single()

    if (orderError || !order) return { success: false, error: `Order not found: ${orderError?.message ?? 'unknown'}` }
    if (order.payment_status === 'paid') return { success: false, error: 'Order already paid' }

    // Build Stripe line items from order items
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = (order.order_items ?? []).map(
      (item: { item_name: string; item_price: number; quantity: number; order_item_options: { option_value: string; price_modifier: number }[] }) => {
        const optionLabels = (item.order_item_options ?? [])
          .filter((o) => o.price_modifier !== 0 || o.option_value)
          .map((o) => o.option_value)
          .join(', ')

        return {
          price_data: {
            currency: 'cad',
            unit_amount: item.item_price,
            product_data: {
              name: item.item_name,
              ...(optionLabels ? { description: optionLabels } : {}),
            },
          },
          quantity: item.quantity,
        }
      }
    )

    // Add tax as a separate line item to match our stored total
    if (order.tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'cad',
          unit_amount: order.tax,
          product_data: { name: 'Tax (9%)' },
        },
        quantity: 1,
      })
    }

    // Build a valid absolute base URL for Stripe's success/cancel redirects.
    // VERCEL_URL is always set automatically by Vercel (no https:// prefix).
    // NEXT_PUBLIC_SITE_URL is the user-supplied override (must include https://).
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
      || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

    let session: Stripe.Checkout.Session
    try {
      session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        metadata: { orderId },
        customer_email: user.email,
        success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${baseUrl}/checkout/cancel?orderId=${orderId}`,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Stripe session creation failed'
      return { success: false, error: `Stripe error: ${message}` }
    }

    if (!session.url) return { success: false, error: 'Failed to create Stripe session (no URL returned)' }

    // Store stripe_session_id on the order for webhook lookup
    await supabase
      .from('orders')
      .update({ stripe_session_id: session.id })
      .eq('id', orderId)

    return { success: true, data: session.url }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return { success: false, error: `Checkout error: ${message}` }
  }
}

// Called from the success page — verifies payment with Stripe directly
// and updates the order using the authenticated user's session (no service role key needed)
export async function confirmOrderFromSession(
  sessionId: string
): Promise<ActionResult<string>> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify the session with Stripe
  let session: Stripe.Checkout.Session
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId)
  } catch {
    return { success: false, error: 'Invalid session' }
  }

  if (session.payment_status !== 'paid') {
    return { success: false, error: 'Payment not completed' }
  }

  const orderId = session.metadata?.orderId
  if (!orderId) return { success: false, error: 'No order linked to this session' }

  // Update the order — RLS ensures only the owner can update their own order
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      payment_method: 'stripe',
      status: 'confirmed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true, data: orderId }
}
