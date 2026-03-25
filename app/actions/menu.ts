'use server'

import { createClient } from '@/lib/supabase/server'
import type { MenuCategory, MenuItem } from '@/types'

export async function getCategories(): Promise<MenuCategory[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menu_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order')

  if (error) throw new Error(error.message)
  return data
}

export async function getMenuItems(categorySlug?: string): Promise<MenuItem[]> {
  const supabase = await createClient()
  let query = supabase
    .from('menu_items')
    .select('*, menu_categories!inner(slug)')
    .eq('is_available', true)
    .order('display_order')

  if (categorySlug) {
    query = query.eq('menu_categories.slug', categorySlug)
  }

  const { data, error } = await query

  if (error) throw new Error(error.message)
  return data as MenuItem[]
}

export async function getMenuItem(slug: string): Promise<MenuItem | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('menu_items')
    .select('*, menu_categories(*)')
    .eq('slug', slug)
    .single()

  if (error) return null
  return data as MenuItem
}
