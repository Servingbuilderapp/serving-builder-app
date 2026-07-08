const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function run() {
  const { data, error } = await supabase
    .from('micro_apps')
    .select('slug, name_es')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
  } else {
    console.log(`Total apps found: ${data.length}`);
    console.log("Primeras 20 apps:");
    data.slice(0, 20).forEach(app => console.log(`- ${app.slug}: ${app.name_es}`));
    console.log("...\nÚltimas 20 apps:");
    data.slice(-20).forEach(app => console.log(`- ${app.slug}: ${app.name_es}`));
  }
}

run();
