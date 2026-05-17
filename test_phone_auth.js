import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://elaoxqthugajbpkoxxim.supabase.co'
const supabaseKey = 'sb_publishable_VzfMeg3nptME54VB7XFUBw_Jb699nEd'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testPhoneAuth() {
  console.log('--- Testing Supabase Phone Auth ---')
  console.log('Using phone number: +919876543210')
  try {
    const { data, error } = await supabase.auth.signInWithOtp({
      phone: '+919876543210'
    })
    
    if (error) {
      console.error('Phone Auth Error Object:', JSON.stringify(error, null, 2))
      console.error('Error Code:', error.code)
      console.error('Error Status:', error.status)
      console.error('Error Message:', error.message)
    } else {
      console.log('Phone Auth Success:', JSON.stringify(data, null, 2))
    }
  } catch (err) {
    console.error('Caught Exception:', err)
  }
}

testPhoneAuth()
