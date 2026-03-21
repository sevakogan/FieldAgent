'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { getCompanyId, getOwnerId } from '@/lib/actions/bootstrap'
import type { ActionResult } from '@/lib/actions/jobs'

export type ConversationRow = {
  client_id: string
  client_name: string
  last_message: string
  last_message_at: string
  unread_count: number
}

export type MessageRow = {
  id: string
  sender_id: string
  sender_name: string
  sender_role: string
  content: string
  channel: string
  read_at: string | null
  created_at: string
}

export async function getConversations(): Promise<ActionResult<ConversationRow[]>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, client_id, sender_id, sender_role, content, read_at, created_at')
      .eq('company_id', companyId)
      .order('created_at', { ascending: false })

    if (error) throw error
    if (!messages || messages.length === 0) return { success: true, data: [] }

    // Get unique client IDs
    const clientIds = [...new Set(messages.map(m => m.client_id))]

    // Fetch client user info
    const { data: clients } = await supabase
      .from('clients')
      .select('id, user_id')
      .in('id', clientIds)

    const userIds = clients?.map(c => c.user_id) ?? []
    const { data: users } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', userIds)

    const userMap = new Map(users?.map(u => [u.id, u.full_name]) ?? [])
    const clientUserMap = new Map(clients?.map(c => [c.id, c.user_id]) ?? [])

    // Group by client
    const grouped = new Map<string, typeof messages>()
    for (const msg of messages) {
      const existing = grouped.get(msg.client_id) ?? []
      existing.push(msg)
      grouped.set(msg.client_id, existing)
    }

    const conversations: ConversationRow[] = []
    for (const [clientId, msgs] of grouped) {
      const userId = clientUserMap.get(clientId) ?? ''
      const clientName = userMap.get(userId) ?? 'Unknown Client'
      const latest = msgs[0]
      const unreadCount = msgs.filter(m => !m.read_at && m.sender_role === 'client').length

      conversations.push({
        client_id: clientId,
        client_name: clientName,
        last_message: latest.content,
        last_message_at: latest.created_at,
        unread_count: unreadCount,
      })
    }

    // Sort by most recent message
    conversations.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime())

    return { success: true, data: conversations }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load conversations' }
  }
}

export async function getThreadMessages(clientId: string): Promise<ActionResult<{ messages: MessageRow[]; clientName: string }>> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { data: messages, error } = await supabase
      .from('messages')
      .select('id, sender_id, sender_role, content, channel, read_at, created_at')
      .eq('company_id', companyId)
      .eq('client_id', clientId)
      .order('created_at', { ascending: true })

    if (error) throw error

    // Get client name
    const { data: client } = await supabase
      .from('clients')
      .select('user_id')
      .eq('id', clientId)
      .single()

    let clientName = 'Unknown Client'
    if (client) {
      const { data: user } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', client.user_id)
        .single()
      if (user) clientName = user.full_name
    }

    // Get sender names
    const senderIds = [...new Set(messages?.map(m => m.sender_id) ?? [])]
    const { data: senders } = await supabase
      .from('users')
      .select('id, full_name')
      .in('id', senderIds)

    const senderMap = new Map(senders?.map(u => [u.id, u.full_name]) ?? [])

    const rows: MessageRow[] = (messages ?? []).map(m => ({
      id: m.id,
      sender_id: m.sender_id,
      sender_name: senderMap.get(m.sender_id) ?? 'Unknown',
      sender_role: m.sender_role,
      content: m.content,
      channel: m.channel,
      read_at: m.read_at,
      created_at: m.created_at,
    }))

    return { success: true, data: { messages: rows, clientName } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to load messages' }
  }
}

export async function sendMessage(clientId: string, content: string): Promise<ActionResult<{ id: string }>> {
  try {
    const companyId = await getCompanyId()
    const ownerId = await getOwnerId()
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('messages')
      .insert({
        company_id: companyId,
        client_id: clientId,
        sender_id: ownerId,
        sender_role: 'owner',
        content,
        channel: 'in_app',
      })
      .select('id')
      .single()

    if (error) throw error
    return { success: true, data: { id: data.id } }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to send message' }
  }
}

export async function markMessagesRead(clientId: string): Promise<ActionResult> {
  try {
    const companyId = await getCompanyId()
    const supabase = createAdminClient()

    const { error } = await supabase
      .from('messages')
      .update({ read_at: new Date().toISOString() })
      .eq('company_id', companyId)
      .eq('client_id', clientId)
      .is('read_at', null)
      .eq('sender_role', 'client')

    if (error) throw error
    return { success: true }
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Failed to mark messages as read' }
  }
}
