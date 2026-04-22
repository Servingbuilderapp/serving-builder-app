const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://nlbdvmialbgyrxzzpbrw.supabase.co'
const supabaseKey = 'sb_publishable_UXASKgvA9aMlP8VfkAWFMw_4fWL9kXO'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('plans').select('*')
  if (error) {
    console.error('❌ Error:', error)
  } else {
    console.log('✅ Success! Plans:', data)
  }
}

test()
