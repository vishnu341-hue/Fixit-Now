import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://elaoxqthugajbpkoxxim.supabase.co'
const supabaseKey = 'sb_publishable_VzfMeg3nptME54VB7XFUBw_Jb699nEd'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('--- Checking Supabase Database ---')
  
  // Check profiles table
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1)

  if (error) {
    console.error('PROFILES_CHECK_ERROR:', error.code, error.message)
    if (error.code === '42P01') {
      console.log('RESULT: TABLE_MISSING')
    }
  } else {
    console.log('RESULT: TABLE_EXISTS')
    console.log('COLUMNS:', data.length > 0 ? Object.keys(data[0]) : 'UNKNOWN (empty table)')
  }
}

checkDatabase()
