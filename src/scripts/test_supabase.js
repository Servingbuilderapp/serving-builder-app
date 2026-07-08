const { createClient } = require('@supabase/supabase-js')

console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('KEY Length:', process.env.SUPABASE_SECRET_KEY ? process.env.SUPABASE_SECRET_KEY.length : 0)
console.log('KEY Start:', process.env.SUPABASE_SECRET_KEY ? process.env.SUPABASE_SECRET_KEY.substring(0, 10) : 'none')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('plans').select('id').limit(1)
  if (error) console.error('Error:', error)
  else console.log('Success:', data)
}

test()
