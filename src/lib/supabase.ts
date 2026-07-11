import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config'

// True only when both values look like real Supabase credentials.
export const isSupabaseConfigured =
  /^https:\/\/.+\.supabase\.co\/?$/.test(SUPABASE_URL) &&
  SUPABASE_ANON_KEY.length > 20

// The client is null until Supabase is configured, so the app can still run
// (and fall back to the bundled events.json) without credentials.
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null
