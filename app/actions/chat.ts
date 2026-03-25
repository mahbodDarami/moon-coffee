'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import type { ActionResult } from '@/types'

// Types for chat (not in main types since chatbot is future phase)
export type ChatConversation = {
  id: string
  user_id: string
  title: string | null
  model: string | null
  created_at: string
  updated_at: string
}

export type ChatMessage = {
  id: string
  conversation_id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata: Record<string, unknown> | null
  token_count: number | null
  created_at: string
}

export type ConversationWithMessages = ChatConversation & {
  chat_messages: ChatMessage[]
}

// ---------- Conversations ----------

export async function createConversation(title?: string): Promise<ActionResult<string>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      user_id: user.id,
      title: title || null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }
  return { success: true, data: data.id }
}

export async function getConversations(): Promise<ActionResult<ChatConversation[]>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return { success: false, error: error.message }
  return { success: true, data: (data || []) as ChatConversation[] }
}

export async function getConversation(conversationId: string): Promise<ActionResult<ConversationWithMessages>> {
  const parsed = z.string().uuid().safeParse(conversationId)
  if (!parsed.success) return { success: false, error: 'Invalid conversation ID' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*, chat_messages(*)')
    .eq('id', parsed.data)
    .eq('user_id', user.id)
    .single()

  if (error) return { success: false, error: 'Conversation not found' }

  // Sort messages by created_at
  const conversation = data as ConversationWithMessages
  conversation.chat_messages.sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  return { success: true, data: conversation }
}

export async function deleteConversation(conversationId: string): Promise<ActionResult> {
  const parsed = z.string().uuid().safeParse(conversationId)
  if (!parsed.success) return { success: false, error: 'Invalid conversation ID' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Messages cascade-delete with conversation
  const { error } = await supabase
    .from('chat_conversations')
    .delete()
    .eq('id', parsed.data)
    .eq('user_id', user.id)

  if (error) return { success: false, error: error.message }
  return { success: true, data: undefined }
}

// ---------- Messages ----------

const messageSchema = z.object({
  conversationId: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().min(1).max(10000),
  metadata: z.record(z.string(), z.unknown()).optional(),
  tokenCount: z.number().int().min(0).optional(),
})

export async function addMessage(
  conversationId: string,
  role: 'user' | 'assistant' | 'system',
  content: string,
  metadata?: Record<string, unknown>,
  tokenCount?: number
): Promise<ActionResult<string>> {
  const parsed = messageSchema.safeParse({ conversationId, role, content, metadata, tokenCount })
  if (!parsed.success) return { success: false, error: parsed.error.issues[0].message }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Verify conversation belongs to user
  const { data: conv } = await supabase
    .from('chat_conversations')
    .select('id')
    .eq('id', parsed.data.conversationId)
    .eq('user_id', user.id)
    .single()

  if (!conv) return { success: false, error: 'Conversation not found' }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: parsed.data.conversationId,
      role: parsed.data.role,
      content: parsed.data.content,
      metadata: parsed.data.metadata || null,
      token_count: parsed.data.tokenCount || null,
    })
    .select('id')
    .single()

  if (error) return { success: false, error: error.message }

  // Update conversation's updated_at
  await supabase
    .from('chat_conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', parsed.data.conversationId)

  return { success: true, data: data.id }
}

// ---------- Context Builders (for future chatbot) ----------

/**
 * Builds a system context string for the AI chatbot with user data,
 * preferences, and purchase history. Call this when starting a conversation.
 */
export async function buildChatContext(): Promise<ActionResult<string>> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Not authenticated' }

  // Fetch user profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  // Fetch user preferences
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', user.id)
    .single()

  // Fetch recent orders (last 10)
  const { data: recentOrders } = await supabase
    .from('orders')
    .select('id, total, status, created_at, order_items(item_name, quantity)')
    .eq('user_id', user.id)
    .eq('payment_status', 'paid')
    .order('created_at', { ascending: false })
    .limit(10)

  // Fetch full menu for reference
  const { data: menuItems } = await supabase
    .from('menu_items')
    .select('name, price, description, flavor_profile, caffeine_level, category_id, tags')
    .eq('is_available', true)
    .order('display_order')

  const { data: categories } = await supabase
    .from('menu_categories')
    .select('id, name, description')
    .eq('is_active', true)

  // Build context string
  const categoryMap = new Map(categories?.map((c) => [c.id, c.name]) || [])

  const context = [
    `## Customer Profile`,
    `Name: ${profile?.full_name || 'Unknown'}`,
    `Email: ${user.email}`,
    '',
    `## Preferences`,
    `Total orders: ${prefs?.total_orders || 0}`,
    `Average order value: $${((prefs?.avg_order_value || 0) / 100).toFixed(2)}`,
    `Favorite flavors: ${prefs?.flavor_preferences?.join(', ') || 'Not set'}`,
    `Caffeine preference: ${prefs?.caffeine_preference || 'Not set'}`,
    '',
    `## Recent Orders`,
    ...(recentOrders || []).map((o) => {
      const items = (o.order_items as Array<{ item_name: string; quantity: number }>)
        .map((i) => `${i.item_name} x${i.quantity}`)
        .join(', ')
      return `- ${new Date(o.created_at).toLocaleDateString()}: ${items} ($${(o.total / 100).toFixed(2)})`
    }),
    '',
    `## Menu`,
    ...(menuItems || []).map((item) => {
      const cat = categoryMap.get(item.category_id) || 'Unknown'
      return `- ${item.name} (${cat}) — $${(item.price / 100).toFixed(2)} | ${item.description || ''} | Flavors: ${item.flavor_profile?.join(', ') || 'N/A'} | Caffeine: ${item.caffeine_level || 'N/A'} | Tags: ${item.tags?.join(', ') || 'N/A'}`
    }),
    '',
    `## Items Never Ordered`,
    ...(menuItems || [])
      .filter((item) => {
        const orderedNames = (recentOrders || []).flatMap(
          (o) => (o.order_items as Array<{ item_name: string }>).map((i) => i.item_name)
        )
        return !orderedNames.includes(item.name)
      })
      .map((item) => `- ${item.name} (${categoryMap.get(item.category_id) || 'Unknown'}) — ${item.description || ''}`),
  ].join('\n')

  return { success: true, data: context }
}
