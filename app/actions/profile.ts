'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ActionResult, Profile } from '@/types'

const profileSchema = z.object({
  fullName: z.string().min(1, 'Name is required').max(100),
  phone: z.string().max(20).optional(),
})

export async function getProfile(): Promise<ActionResult<Profile>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const parsed = profileSchema.safeParse({
    fullName: formData.get('fullName'),
    phone: formData.get('phone') || undefined,
  })

  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: parsed.data.fullName,
      phone: parsed.data.phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}
