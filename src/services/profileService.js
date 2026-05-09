import { supabase } from '../lib/supabaseClient'

export const ensureUserProfile = async (user) => {
  if (!user?.id) return null

  const payload = {
    id: user.id,
    email: user.email ?? null,
    full_name:
      user.user_metadata?.full_name ??
      user.user_metadata?.name ??
      user.email?.split('@')?.[0] ??
      'User',
    avatar_url: user.user_metadata?.avatar_url ?? null,
  }

  console.log('[profileService] ensureUserProfile payload:', payload)
  const { data, error } = await supabase
    .from('profiles')
    .upsert(payload, { onConflict: 'id' })
    .select()
    .maybeSingle()

  if (error) {
    console.error('[profileService] ensureUserProfile error:', error)
    throw error
  }
  return data
}

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export const updateUserProfile = async (userId, updates) => {
  console.log('[profileService] updateUserProfile update:', updates, 'for userId:', userId)
  
  // Use upsert to handle both update and initial insert if profile doesn't exist
  const { data, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...updates }, { onConflict: 'id' })
    .select()
    .single()

  console.log("SAVE RESULT:", data)
  console.log("SAVE ERROR:", error)

  if (error) {
    console.error('[profileService] updateUserProfile error:', error)
    throw error
  }
  
  if (!data) {
    throw new Error('No data returned from profile update')
  }

  return data
}
