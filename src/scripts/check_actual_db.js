const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://smajgxlkzgsxicfhcreo.supabase.co'
const supabaseKey = 'sb_publishable_ewgED-BTksjQiZpOIT_2eA_t6UEHCaP'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase.from('plans').select('*').eq('is_active', true)
  if (error) {
    console.error('❌ Error:', error)
  } else {
    console.log('✅ Success! Full Plans:', data)
  }
}

test()
