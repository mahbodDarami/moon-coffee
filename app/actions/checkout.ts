'use server'

import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function processPayment(orderId: string): Promise<ActionResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify order belongs to user and is pending
  const { data: order, error: fetchError } = await supabase
    .from('orders')
    .select('id, status, payment_status')
    .eq('id', orderId)
    .eq('user_id', user.id)
    .single()

  if (fetchError || !order) return { success: false, error: 'Order not found' }
  if (order.payment_status === 'paid') return { success: false, error: 'Order already paid' }

  // Simulate payment — always succeeds
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      payment_status: 'paid',
      payment_method: 'simulated',
      status: 'confirmed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)

  if (updateError) return { success: false, error: updateError.message }
  return { success: true, data: undefined }
}
