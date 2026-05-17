import { supabase } from '../lib/supabaseClient'

const getAuthRedirectTo = () => {
  const origin = window.location.origin
  // Use the current origin instead of hardcoding localhost:5173
  // This ensures it works regardless of the port Vite picks
  const url = `${origin}/auth/callback`
  console.log('[AuthService] Redirect URL generated:', url);
  return url
}

export const signUpWithEmail = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signInWithEmail = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw error
  return data
}

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: getAuthRedirectTo(),
    },
  })

  console.log(data)
  console.log(error)

  if (error) throw error
  return data
}

export const signOutUser = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export const requestPasswordReset = async (email) => {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: getAuthRedirectTo(),
  })

  if (error) throw error
  return data
}

export const updateUserEmail = async (newEmail) => {
  const { data, error } = await supabase.auth.updateUser({
    email: newEmail,
  })
  if (error) throw error
  return data
}

export const signInWithPhone = async (phone) => {
  console.log('[AuthService] Attempting signInWithOtp for phone:', phone)
  const { data, error } = await supabase.auth.signInWithOtp({
    phone: phone,
  })
  
  if (error) {
    console.error('[AuthService] Phone OTP request failed detailed logs:', {
      message: error.message,
      status: error.status,
      code: error.code,
      raw: error
    })
    throw error
  }
  return data
}

export const verifyPhoneOtp = async ({ phone, token }) => {
  console.log('[AuthService] Attempting verifyOtp for phone:', phone)
  const { data, error } = await supabase.auth.verifyOtp({
    phone: phone,
    token: token,
    type: 'sms',
  })
  
  if (error) {
    console.error('[AuthService] Phone OTP verification failed detailed logs:', {
      message: error.message,
      status: error.status,
      code: error.code,
      raw: error
    })
    throw error
  }
  return data
}

