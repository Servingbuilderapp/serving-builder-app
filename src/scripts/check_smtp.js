require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

async function checkSmtp() {
  const { data, error } = await supabase.from('smtp_settings').select('*')
  if (error) {
    console.error('Error:', error.message)
    
    if (error.message.includes('relation "public.smtp_settings" does not exist')) {
      console.log('Table does not exist. We should create it.')
    }
  } else {
    console.log('Table exists. Data:', data)
  }
}

checkSmtp()
