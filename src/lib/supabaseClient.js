import { createClient } from '@supabase/supabase-js'

const resolvedSupabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim()
const resolvedSupabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim()

if (!resolvedSupabaseUrl || !resolvedSupabaseAnonKey) {
  throw new Error(
    'Supabase configuration is missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your environment.',
  )
}

export const supabase = createClient(resolvedSupabaseUrl, resolvedSupabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
})
