import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://elaoxqthugajbpkoxxim.supabase.co'
const supabaseKey = 'sb_publishable_VzfMeg3nptME54VB7XFUBw_Jb699nEd'

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('--- Checking Services Table ---')
  const { error } = await supabase.from('services').select('*').limit(1)
  if (error) {
    console.error('SERVICES_CHECK_ERROR:', error.code, error.message)
  } else {
    console.log('RESULT: SERVICES_TABLE_EXISTS')
  }
}

checkDatabase()
