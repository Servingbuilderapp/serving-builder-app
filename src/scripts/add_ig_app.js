const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY not found in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const appData = {
  slug: 'ig-caption-gen',
  icon: 'Instagram',
  name_es: 'Captions para Instagram',
  name_en: 'Instagram Captions',
  description_es: 'Genera descripciones hipnóticas y hashtags optimizados para tus posts.',
  description_en: 'Generate hypnotic captions and optimized hashtags for your posts.',
  form_schema: [
    {
      name: "description",
      label_es: "Descripción de la foto/producto",
      label_en: "Photo/Product description",
      type: "textarea",
      required: true,
      placeholder_es: "Ej: Un café artesanal en una mañana soleada",
      placeholder_en: "Ex: An artisanal coffee on a sunny morning"
    },
    {
      name: "tone",
      label_es: "Tono",
      label_en: "Tone",
      type: "select",
      options_es: ["Divertido", "Inspiracional", "Profesional", "Minimalista"],
      options_en: ["Fun", "Inspirational", "Professional", "Minimalist"],
      required: true
    },
    {
      name: "audience",
      label_es: "Público objetivo",
      label_en: "Target Audience",
      type: "text",
      required: false,
      placeholder_es: "Ej: Jóvenes emprendedores",
      placeholder_en: "Ex: Young entrepreneurs"
    }
  ],
  autofill_presets: [
    {
      label_es: "Café de Mañana",
      label_en: "Morning Coffee",
      values: {
        description: "Latte art en taza de cerámica azul",
        tone: "Inspiracional",
        audience: "Amantes del café"
      }
    },
    {
      label_es: "Nuevo Producto Tech",
      label_en: "New Tech Product",
      values: {
        description: "Auriculares con cancelación de ruido",
        tone: "Profesional",
        audience: "Nómadas digitales"
      }
    }
  ],
  prompt_template: `GENERAL INSTRUCTIONS:
- You are a social media expert specialized in Instagram.
- Your response must be EXCLUSIVELY in valid and clean Markdown format.
- Respond EXCLUSIVELY in the language: **{{responseLanguage}}**.

SPECIFIC TASK: Generate 3 variations of Instagram captions for the following:
- Description: {{description}}
- Tone: {{tone}}
- Audience: {{audience}}

REQUIREMENTS:
1. Provide 3 distinct options (Option 1, Option 2, Option 3).
2. Each option must include:
   - A catchy first line.
   - The body text according to the tone.
   - A call to action (CTA).
   - A group of 5-10 relevant hashtags.
3. Keep the text engaging and optimized for the Instagram algorithm.`
};

async function run() {
  console.log('Inserting/Updating app in micro_apps...');
  const { data: app, error: appError } = await supabase
    .from('micro_apps')
    .upsert(appData, { onConflict: 'slug' })
    .select()
    .single();

  if (appError) {
    console.error('Error inserting app:', appError);
    return;
  }

  console.log('App inserted successfully:', app.slug);

  console.log('Linking app to professional plan...');
  const { data: plan, error: planError } = await supabase
    .from('plans')
    .select('id')
    .eq('slug', 'professional')
    .single();

  if (planError) {
    console.error('Error finding professional plan:', planError);
    return;
  }

  const { error: linkError } = await supabase
    .from('plan_apps')
    .upsert({
      plan_id: plan.id,
      app_id: app.id
    }, { onConflict: 'plan_id,app_id' });

  if (linkError) {
    console.error('Error linking app to plan:', linkError);
    return;
  }

  console.log('App linked to professional plan successfully!');
}

run();
