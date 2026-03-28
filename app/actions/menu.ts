'use server'

import { createClient } from '@/lib/supabase/server'
import type {
  MenuCategory,
  MenuItem,
  MenuItemWithOptions,
  ProductOptionGroupWithOptions,
} from '@/types'

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

export async function getMenuItemWithOptions(slug: string): Promise<MenuItemWithOptions | null> {
  const supabase = await createClient()

  // Get the menu item with its category
  const { data: item, error: itemError } = await supabase
    .from('menu_items')
    .select('*, menu_categories(*)')
    .eq('slug', slug)
    .single()

  if (itemError || !item) return null

  // Get option groups: item-specific + global (menu_item_id IS NULL)
  const { data: groups, error: groupsError } = await supabase
    .from('product_option_groups')
    .select('*, product_options(*)')
    .or(`menu_item_id.eq.${item.id},menu_item_id.is.null`)
    .order('display_order')

  if (groupsError) return null

  // Sort options within each group by display_order
  const sortedGroups = (groups || []).map((group) => ({
    ...group,
    product_options: (group.product_options || []).sort(
      (a: { display_order: number }, b: { display_order: number }) =>
        a.display_order - b.display_order
    ),
  })) as ProductOptionGroupWithOptions[]

  return {
    ...item,
    option_groups: sortedGroups,
  } as MenuItemWithOptions
}

export async function getOptionGroupsForItem(
  itemId: string
): Promise<ProductOptionGroupWithOptions[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('product_option_groups')
    .select('*, product_options(*)')
    .or(`menu_item_id.eq.${itemId},menu_item_id.is.null`)
    .order('display_order')

  if (error) return []

  return (data || []).map((group) => ({
    ...group,
    product_options: (group.product_options || []).sort(
      (a: { display_order: number }, b: { display_order: number }) =>
        a.display_order - b.display_order
    ),
  })) as ProductOptionGroupWithOptions[]
}
