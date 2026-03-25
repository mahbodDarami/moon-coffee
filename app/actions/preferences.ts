'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ActionResult, UserPreferences } from '@/types'

export async function getPreferences(): Promise<ActionResult<UserPreferences>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data }
}

export async function toggleFavoriteItem(itemId: string): Promise<ActionResult<boolean>> {
  const parsed = z.string().uuid().safeParse(itemId)
  if (!parsed.success) return { success: false, error: 'Invalid item ID' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('favorite_items')
    .eq('user_id', user.id)
    .single()

  const current = prefs?.favorite_items || []
  const isFavorite = current.includes(itemId)
  const updated = isFavorite
    ? current.filter((id: string) => id !== itemId)
    : [...current, itemId]

  const { error } = await supabase
    .from('user_preferences')
    .update({ favorite_items: updated, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  // Returns true if item is NOW a favorite (was added), false if removed
  return { success: true, data: !isFavorite }
}

export async function updateFlavorPreferences(flavors: string[]): Promise<ActionResult> {
  const parsed = z.array(z.string().max(50)).max(20).safeParse(flavors)
  if (!parsed.success) return { success: false, error: 'Invalid flavors' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_preferences')
    .update({
      flavor_preferences: parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}

export async function updateCaffeinePreference(preference: string): Promise<ActionResult> {
  const parsed = z.enum(['low', 'medium', 'high', 'decaf', 'any']).safeParse(preference)
  if (!parsed.success) return { success: false, error: 'Invalid caffeine preference' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { error } = await supabase
    .from('user_preferences')
    .update({
      caffeine_preference: parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}
