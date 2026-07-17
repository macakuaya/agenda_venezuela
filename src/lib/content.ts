import {
  COMMUNITY_INVITE_LINK_LABEL,
  COMMUNITY_INVITE_TEXT,
  COMMUNITY_WHATSAPP_URL,
} from '../config'
import { isSupabaseConfigured, supabase } from './supabase'
import { adminRequest } from './admin'

export interface CommunityContent {
  text: string
  linkLabel: string
  whatsappUrl: string
}

export const DEFAULT_COMMUNITY_CONTENT: CommunityContent = {
  text: COMMUNITY_INVITE_TEXT,
  linkLabel: COMMUNITY_INVITE_LINK_LABEL,
  whatsappUrl: COMMUNITY_WHATSAPP_URL,
}

interface SiteContentRow {
  community_text: string
  community_link_label: string
  community_whatsapp_url: string
}

export async function fetchCommunityContent(): Promise<CommunityContent | null> {
  if (!isSupabaseConfigured || !supabase) return null

  const { data, error } = await supabase
    .from('site_content')
    .select('community_text, community_link_label, community_whatsapp_url')
    .eq('id', 'community')
    .maybeSingle()

  if (error || !data) return null

  const row = data as SiteContentRow
  return {
    text: row.community_text,
    linkLabel: row.community_link_label,
    whatsappUrl: row.community_whatsapp_url,
  }
}

export async function saveCommunityContent(content: CommunityContent): Promise<void> {
  await adminRequest('saveCommunity', { content })
}
