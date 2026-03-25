'use server'

import { createClient } from '@/lib/supabase/server'
import type { MenuItem } from '@/types'

/**
 * Full-text search across menu items using PostgreSQL tsvector.
 * Searches name and description fields.
 */
export async function searchMenuItems(query: string): Promise<MenuItem[]> {
  if (!query || query.trim().length < 2) return []

  const supabase = await createClient()

  // Convert user query to tsquery format (split words, join with &)
  const tsQuery = query
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0)
    .map((w) => `${w}:*`) // prefix matching
    .join(' & ')

  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('is_available', true)
    .textSearch('name', tsQuery, { type: 'websearch', config: 'english' })
    .limit(20)

  // If tsvector search returns nothing, fallback to ILIKE
  if (error || !data || data.length === 0) {
    const { data: fallbackData } = await supabase
      .from('menu_items')
      .select('*')
      .eq('is_available', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query.toLowerCase()}}`)
      .order('display_order')
      .limit(20)

    return (fallbackData || []) as MenuItem[]
  }

  return data as MenuItem[]
}

/**
 * Get menu items filtered by multiple criteria.
 * Useful for the chatbot to recommend items.
 */
export async function getFilteredMenuItems(filters: {
  categorySlug?: string
  caffeineLevel?: string
  maxPrice?: number
  tags?: string[]
  excludeItemIds?: string[]
}): Promise<MenuItem[]> {
  const supabase = await createClient()

  let query = supabase
    .from('menu_items')
    .select('*, menu_categories!inner(slug)')
    .eq('is_available', true)
    .order('display_order')

  if (filters.categorySlug) {
    query = query.eq('menu_categories.slug', filters.categorySlug)
  }

  if (filters.caffeineLevel) {
    query = query.eq('caffeine_level', filters.caffeineLevel)
  }

  if (filters.maxPrice) {
    query = query.lte('price', filters.maxPrice)
  }

  if (filters.tags && filters.tags.length > 0) {
    query = query.overlaps('tags', filters.tags)
  }

  if (filters.excludeItemIds && filters.excludeItemIds.length > 0) {
    query = query.not('id', 'in', `(${filters.excludeItemIds.join(',')})`)
  }

  const { data, error } = await query

  if (error) return []
  return (data || []) as MenuItem[]
}
