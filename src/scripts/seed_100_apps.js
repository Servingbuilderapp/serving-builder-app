const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SECRET_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SECRET_KEY no encontrados.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const apps = [
  // REDES SOCIALES (25)
  { slug: 'ig-captions', icon: 'Instagram', name_es: 'Social: Captions Instagram', name_en: 'Social: Instagram Captions', description_es: 'Descripciones virales.', description_en: 'Viral descriptions.' },
  { slug: 'reels-scripts', icon: 'Video', name_es: 'Social: Guiones Reels', name_en: 'Social: Reels Scripts', description_es: 'Videos cortos virales.', description_en: 'Viral short videos.' },
  { slug: 'viral-ideas', icon: 'Sparkles', name_es: 'Social: Ideas Virales', name_en: 'Social: Viral Ideas', description_es: 'Contenido que se comparte.', description_en: 'Shareable content.' },
  { slug: 'ig-bio', icon: 'User', name_es: 'Social: Bio Instagram', name_en: 'Social: Instagram Bio', description_es: 'Bio profesional.', description_en: 'Professional bio.' },
  { slug: 'tweet-gen', icon: 'Twitter', name_es: 'Social: Posts (X)', name_en: 'Social: Posts (X)', description_es: 'Posts cortos.', description_en: 'Short posts.' },
  { slug: 'linkedin-strat', icon: 'Briefcase', name_es: 'Social: Estrategia LinkedIn', name_en: 'Social: LinkedIn Strategy', description_es: 'Red profesional.', description_en: 'Professional network.' },
  { slug: 'comment-reply', icon: 'MessageSquare', name_es: 'Social: Respuesta Comentarios', name_en: 'Social: Comment Reply', description_es: 'Interacción social.', description_en: 'Social interaction.' },
  { slug: 'content-calendar', icon: 'Calendar', name_es: 'Social: Calendario Editorial', name_en: 'Social: Editorial Calendar', description_es: 'Organiza tus posts.', description_en: 'Organize your posts.' },
  { slug: 'tiktok-scripts', icon: 'Video', name_es: 'Social: Guiones TikTok', name_en: 'Social: TikTok Scripts', description_es: 'Videos virales.', description_en: 'Viral videos.' },
  { slug: 'yt-titles', icon: 'Youtube', name_es: 'Social: Títulos YouTube', name_en: 'Social: YouTube Titles', description_es: 'Optimiza tus videos.', description_en: 'Optimize your videos.' },
  { slug: 'yt-desc', icon: 'FileText', name_es: 'Social: Descripción YouTube', name_en: 'Social: YouTube Description', description_es: 'SEO para video.', description_en: 'SEO for video.' },
  { slug: 'hashtag-gen', icon: 'Hash', name_es: 'Social: Hashtags', name_en: 'Social: Hashtags', description_es: 'Etiquetas virales.', description_en: 'Viral tags.' },
  { slug: 'podcast-script', icon: 'Mic', name_es: 'Social: Guion Podcast', name_en: 'Social: Podcast Script', description_es: 'Audio social.', description_en: 'Social audio.' },
  { slug: 'fb-ads', icon: 'Zap', name_es: 'Social: Anuncios Facebook', name_en: 'Social: Facebook Ads', description_es: 'Ads efectivos.', description_en: 'Effective ads.' },
  { slug: 'google-ads', icon: 'Search', name_es: 'Social: Anuncios Google', name_en: 'Social: Google Ads', description_es: 'Ads en buscadores.', description_en: 'Search ads.' },
  { slug: 'email-marketing', icon: 'Mail', name_es: 'Social: Email Marketing', name_en: 'Social: Email Marketing', description_es: 'Newsletters.', description_en: 'Newsletters.' },
  { slug: 'twitter-threads', icon: 'Layout', name_es: 'Social: Hilos X', name_en: 'Social: X Threads', description_es: 'Historias sociales.', description_en: 'Social stories.' },
  { slug: 'pinterest-gen', icon: 'Image', name_es: 'Social: Contenido Pinterest', name_en: 'Social: Pinterest Content', description_es: 'Visual social.', description_en: 'Social visual.' },
  { slug: 'google-reviews', icon: 'Star', name_es: 'Social: Respuesta Reseñas', name_en: 'Social: Review Response', description_es: 'Reputación social.', description_en: 'Social reputation.' },
  { slug: 'storytelling', icon: 'Book', name_es: 'Social: Storytelling Pro', name_en: 'Social: Storytelling Pro', description_es: 'Historias virales.', description_en: 'Viral stories.' },
  { slug: 'yt-shorts', icon: 'Zap', name_es: 'Social: YouTube Shorts', name_en: 'Social: YouTube Shorts', description_es: 'Videos cortos.', description_en: 'Short videos.' },
  { slug: 'linkedin-profile', icon: 'UserCheck', name_es: 'Social: Perfil LinkedIn', name_en: 'Social: LinkedIn Profile', description_es: 'Marca personal.', description_en: 'Personal brand.' },
  { slug: 'meme-text', icon: 'Smile', name_es: 'Social: Texto Memes', name_en: 'Social: Meme Text', description_es: 'Humor viral.', description_en: 'Viral humor.' },
  { slug: 'influencer-collab', icon: 'Users', name_es: 'Social: Colab Influencer', name_en: 'Social: Influencer Collab', description_es: 'Alianzas sociales.', description_en: 'Social alliances.' },
  { slug: 'landing-copy', icon: 'Layout', name_es: 'Social: Copy Landing', name_en: 'Social: Landing Copy', description_es: 'Conversión social.', description_en: 'Social conversion.' },

  // PRODUCTIVIDAD (25)
  { slug: 'text-summarizer', icon: 'FileText', name_es: 'Productividad: Resumen Texto', name_en: 'Productivity: Summarizer', description_es: 'Optimiza lectura.', description_en: 'Optimize reading.' },
  { slug: 'style-corrector', icon: 'PenTool', name_es: 'Productividad: Corrector Estilo', name_en: 'Productivity: Style Corrector', description_es: 'Escritura pro.', description_en: 'Pro writing.' },
  { slug: 'pro-translator', icon: 'Globe', name_es: 'Productividad: Traductor', name_en: 'Productivity: Translator', description_es: 'Traducción pro.', description_en: 'Pro translation.' },
  { slug: 'meeting-minutes', icon: 'Clipboard', name_es: 'Productividad: Actas', name_en: 'Productivity: Minutes', description_es: 'Resumen juntas.', description_en: 'Meeting summary.' },
  { slug: 'daily-tasks', icon: 'List', name_es: 'Productividad: Tareas', name_en: 'Productivity: Tasks', description_es: 'Organiza tu día.', description_en: 'Organize your day.' },
  { slug: 'formal-emails', icon: 'Mail', name_es: 'Productividad: Emails', name_en: 'Productivity: Emails', description_es: 'Redacción pro.', description_en: 'Pro writing.' },
  { slug: 'concept-simplifier', icon: 'Zap', name_es: 'Productividad: Simplificador', name_en: 'Productivity: Simplifier', description_es: 'Explicación pro.', description_en: 'Pro explanation.' },
  { slug: 'interview-questions', icon: 'HelpCircle', name_es: 'Productividad: Entrevistas', name_en: 'Productivity: Interviews', description_es: 'Contratación pro.', description_en: 'Pro hiring.' },
  { slug: 'short-stories', icon: 'BookOpen', name_es: 'Productividad: Cuentos', name_en: 'Productivity: Stories', description_es: 'Ficción pro.', description_en: 'Pro fiction.' },
  { slug: 'sentiment-analysis', icon: 'BarChart', name_es: 'Productividad: Sentimiento', name_en: 'Productivity: Sentiment', description_es: 'Análisis pro.', description_en: 'Pro analysis.' },
  { slug: 'okr-gen', icon: 'Target', name_es: 'Productividad: OKR', name_en: 'Productivity: OKR', description_es: 'Metas pro.', description_en: 'Pro goals.' },
  { slug: 'study-planner', icon: 'Book', name_es: 'Productividad: Estudio', name_en: 'Productivity: Study', description_es: 'Aprendizaje pro.', description_en: 'Pro learning.' },
  { slug: 'code-tutor', icon: 'Code', name_es: 'Productividad: Tutor Código', name_en: 'Productivity: Code Tutor', description_es: 'Programación pro.', description_en: 'Pro coding.' },
  { slug: 'code-explainer', icon: 'Cpu', name_es: 'Productividad: Explicador', name_en: 'Productivity: Explainer', description_es: 'Lógica pro.', description_en: 'Pro logic.' },
  { slug: 'doc-gen', icon: 'File', name_es: 'Productividad: Manuales', name_en: 'Productivity: Manuals', description_es: 'Docs pro.', description_en: 'Pro docs.' },
  { slug: 'essay-writer', icon: 'Edit', name_es: 'Productividad: Ensayos', name_en: 'Productivity: Essays', description_es: 'Escritor pro.', description_en: 'Pro writer.' },
  { slug: 'gift-ideas', icon: 'Gift', name_es: 'Productividad: Regalos', name_en: 'Productivity: Gifts', description_es: 'Ideas pro.', description_en: 'Pro ideas.' },
  { slug: 'travel-planner', icon: 'Map', name_es: 'Productividad: Viajes', name_en: 'Productivity: Travel', description_es: 'Ruta pro.', description_en: 'Pro route.' },
  { slug: 'recipe-gen', icon: 'Coffee', name_es: 'Productividad: Recetas', name_en: 'Productivity: Recipes', description_es: 'Cocina pro.', description_en: 'Pro cooking.' },
  { slug: 'brand-name', icon: 'Type', name_es: 'Productividad: Naming', name_en: 'Productivity: Naming', description_es: 'Marcas pro.', description_en: 'Pro brands.' },
  { slug: 'slogan-gen', icon: 'Zap', name_es: 'Productividad: Slogans', name_en: 'Productivity: Slogans', description_es: 'Lemas pro.', description_en: 'Pro slogans.' },
  { slug: 'love-letters', icon: 'Heart', name_es: 'Productividad: Amor', name_en: 'Productivity: Love', description_es: 'Cartas pro.', description_en: 'Pro letters.' },
  { slug: 'event-speech', icon: 'Mic', name_es: 'Productividad: Discursos', name_en: 'Productivity: Speeches', description_es: 'Habla pro.', description_en: 'Pro speech.' },
  { slug: 'smart-goals', icon: 'CheckCircle', name_es: 'Productividad: SMART', name_en: 'Productivity: SMART', description_es: 'Metas pro.', description_en: 'Pro goals.' },
  { slug: 'note-organizer', icon: 'FileText', name_es: 'Productividad: Notas', name_en: 'Productivity: Notes', description_es: 'Orden pro.', description_en: 'Pro order.' },

  // PROYECTOS (25)
  { slug: 'business-plan', icon: 'PieChart', name_es: 'Proyecto: Negocio', name_en: 'Project: Business', description_es: 'Plan pro.', description_en: 'Pro plan.' },
  { slug: 'competitor-analysis', icon: 'Search', name_es: 'Proyecto: Mercado', name_en: 'Project: Market', description_es: 'Análisis pro.', description_en: 'Pro analysis.' },
  { slug: 'investor-proposal', icon: 'DollarSign', name_es: 'Proyecto: Inversión', name_en: 'Project: Investment', description_es: 'Pitch pro.', description_en: 'Pro pitch.' },
  { slug: 'idea-validator', icon: 'Check', name_es: 'Proyecto: Validador', name_en: 'Project: Validator', description_es: 'Prueba pro.', description_en: 'Pro proof.' },
  { slug: 'monetization-strat', icon: 'Zap', name_es: 'Proyecto: Dinero', name_en: 'Project: Money', description_es: 'Ingresos pro.', description_en: 'Pro income.' },
  { slug: 'canvas-builder', icon: 'Layout', name_es: 'Proyecto: Canvas', name_en: 'Project: Canvas', description_es: 'Lienzo pro.', description_en: 'Pro canvas.' },
  { slug: 'roadmap-gen', icon: 'TrendingUp', name_es: 'Proyecto: Hoja Ruta', name_en: 'Project: Roadmap', description_es: 'Pasos pro.', description_en: 'Pro steps.' },
  { slug: 'pitch-deck-helper', icon: 'Presentation', name_es: 'Proyecto: Pitch', name_en: 'Project: Pitch', description_es: 'Diapositivas pro.', description_en: 'Pro slides.' },
  { slug: 'user-persona', icon: 'Users', name_es: 'Proyecto: Persona', name_en: 'Project: Persona', description_es: 'Cliente pro.', description_en: 'Pro customer.' },
  { slug: 'swot-analysis', icon: 'Grid', name_es: 'Proyecto: DAFO', name_en: 'Project: SWOT', description_es: 'Matriz pro.', description_en: 'Pro matrix.' },
  { slug: 'gtm-strategy', icon: 'Rocket', name_es: 'Proyecto: GTM', name_en: 'Project: GTM', description_es: 'Mercado pro.', description_en: 'Pro market.' },
  { slug: 'cost-analysis', icon: 'Calculator', name_es: 'Proyecto: Finanzas', name_en: 'Project: Finances', description_es: 'Costos pro.', description_en: 'Pro costs.' },
  { slug: 'contingency-plan', icon: 'Shield', name_es: 'Proyecto: Plan B', name_en: 'Project: Plan B', description_es: 'Backup pro.', description_en: 'Pro backup.' },
  { slug: 'sales-script', icon: 'Phone', name_es: 'Proyecto: Ventas', name_en: 'Project: Sales', description_es: 'Guion pro.', description_en: 'Pro script.' },
  { slug: 'retention-strat', icon: 'RefreshCw', name_es: 'Proyecto: Churn', name_en: 'Project: Churn', description_es: 'Retención pro.', description_en: 'Pro retention.' },
  { slug: 'referral-plan', icon: 'Share', name_es: 'Proyecto: Referido', name_en: 'Project: Referral', description_es: 'Boca a boca pro.', description_en: 'Pro word of mouth.' },
  { slug: 'brand-audit', icon: 'Search', name_es: 'Proyecto: Marca', name_en: 'Project: Brand', description_es: 'Imagen pro.', description_en: 'Pro image.' },
  { slug: 'pricing-strat', icon: 'Tag', name_es: 'Proyecto: Precios', name_en: 'Project: Pricing', description_es: 'Estrategia pro.', description_en: 'Pro strategy.' },
  { slug: 'expansion-plan', icon: 'Maximize', name_es: 'Proyecto: Crecer', name_en: 'Project: Expand', description_es: 'Escala pro.', description_en: 'Pro scale.' },
  { slug: 'stakeholder-mgmt', icon: 'Users', name_es: 'Proyecto: Aliados', name_en: 'Project: Partners', description_es: 'Relación pro.', description_en: 'Pro relation.' },
  { slug: 'risk-analysis', icon: 'AlertTriangle', name_es: 'Proyecto: Riesgo', name_en: 'Project: Risk', description_es: 'Amenaza pro.', description_en: 'Pro threat.' },
  { slug: 'marketing-plan', icon: 'Target', name_es: 'Proyecto: Marketing', name_en: 'Project: Marketing', description_es: 'Plan pro.', description_en: 'Pro plan.' },
  { slug: 'partners-strat', icon: 'Handshake', name_es: 'Proyecto: Uniones', name_en: 'Project: Unions', description_es: 'Unión pro.', description_en: 'Pro union.' },
  { slug: 'ops-manual', icon: 'Settings', name_es: 'Proyecto: Manual', name_en: 'Project: Manual', description_es: 'Procesos pro.', description_en: 'Pro processes.' },
  { slug: 'vision-mission', icon: 'Eye', name_es: 'Proyecto: Alma', name_en: 'Project: Soul', description_es: 'Visión pro.', description_en: 'Pro vision.' },

  // HERRAMIENTAS (25)
  { slug: 'roi-calc', icon: 'Calculator', name_es: 'Herramienta: ROI', name_en: 'Tool: ROI', description_es: 'Retorno pro.', description_en: 'Pro return.' },
  { slug: 'unit-converter', icon: 'Repeat', name_es: 'Herramienta: IA Conv', name_en: 'Tool: AI Conv', description_es: 'Unidad pro.', description_en: 'Pro unit.' },
  { slug: 'sql-gen', icon: 'Database', name_es: 'Herramienta: SQL', name_en: 'Tool: SQL', description_es: 'DB pro.', description_en: 'Pro DB.' },
  { slug: 'regex-gen', icon: 'Code', name_es: 'Herramienta: Regex', name_en: 'Tool: Regex', description_es: 'Pattern pro.', description_en: 'Pro pattern.' },
  { slug: 'data-cleaner', icon: 'Filter', name_es: 'Herramienta: Limpiar', name_en: 'Tool: Clean', description_es: 'Data pro.', description_en: 'Pro data.' },
  { slug: 'json-gen', icon: 'FileJson', name_es: 'Herramienta: JSON', name_en: 'Tool: JSON', description_es: 'Dato pro.', description_en: 'Pro data.' },
  { slug: 'email-validator', icon: 'Mail', name_es: 'Herramienta: Email Val', name_en: 'Tool: Email Val', description_es: 'Mail pro.', description_en: 'Pro mail.' },
  { slug: 'password-gen', icon: 'Lock', name_es: 'Herramienta: Pass', name_en: 'Tool: Pass', description_es: 'Seguro pro.', description_en: 'Pro secure.' },
  { slug: 'readability-ana', icon: 'Eye', name_es: 'Herramienta: Lectura', name_en: 'Tool: Read', description_es: 'Claro pro.', description_en: 'Pro clear.' },
  { slug: 'keyword-ext', icon: 'Search', name_es: 'Herramienta: Keywords', name_en: 'Tool: Keywords', description_es: 'SEO pro.', description_en: 'Pro SEO.' },
  { slug: 'metatags-seo', icon: 'Globe', name_es: 'Herramienta: SEO Meta', name_en: 'Tool: SEO Meta', description_es: 'Web pro.', description_en: 'Pro web.' },
  { slug: 'header-ana', icon: 'Type', name_es: 'Herramienta: H1-H6', name_en: 'Tool: H1-H6', description_es: 'Tags pro.', description_en: 'Pro tags.' },
  { slug: 'sitemap-gen', icon: 'Map', name_es: 'Herramienta: Sitemap', name_en: 'Tool: Sitemap', description_es: 'Index pro.', description_en: 'Pro index.' },
  { slug: 'robots-txt', icon: 'FileCode', name_es: 'Herramienta: Robots', name_en: 'Tool: Robots', description_es: 'Bot pro.', description_en: 'Pro bot.' },
  { slug: 'schema-gen', icon: 'Code', name_es: 'Herramienta: Schema', name_en: 'Tool: Schema', description_es: 'Snippet pro.', description_en: 'Pro snippet.' },
  { slug: 'speed-tips', icon: 'Zap', name_es: 'Herramienta: Speed', name_en: 'Tool: Speed', description_es: 'Fast pro.', description_en: 'Pro fast.' },
  { slug: 'utm-gen', icon: 'Link', name_es: 'Herramienta: UTM', name_en: 'Tool: UTM', description_es: 'Link pro.', description_en: 'Pro link.' },
  { slug: 'perf-ana', icon: 'Activity', name_es: 'Herramienta: Perf', name_en: 'Tool: Perf', description_es: 'Web pro.', description_en: 'Pro web.' },
  { slug: 'midjourney-prompt', icon: 'Image', name_es: 'Herramienta: Midjourney', name_en: 'Tool: Midjourney', description_es: 'Art pro.', description_en: 'Pro art.' },
  { slug: 'dalle-prompt', icon: 'Sparkles', name_es: 'Herramienta: DALL-E', name_en: 'Tool: DALL-E', description_es: 'Img pro.', description_en: 'Pro img.' },
  { slug: 'code-formatter', icon: 'Layout', name_es: 'Herramienta: Format', name_en: 'Tool: Format', description_es: 'Code pro.', description_en: 'Pro code.' },
  { slug: 'readme-gen', icon: 'FileText', name_es: 'Herramienta: Readme', name_en: 'Tool: Readme', description_es: 'Repo pro.', description_en: 'Pro repo.' },
  { slug: 'markdown-html', icon: 'Code', name_es: 'Herramienta: MD2HTML', name_en: 'Tool: MD2HTML', description_es: 'Conv pro.', description_en: 'Pro conv.' },
  { slug: 'license-gen', icon: 'Shield', name_es: 'Herramienta: License', name_en: 'Tool: License', description_es: 'Mit pro.', description_en: 'Pro mit.' },
  { slug: 'a11y-validator', icon: 'Accessibility', name_es: 'Herramienta: A11y', name_en: 'Tool: A11y', description_es: 'All pro.', description_en: 'Pro all.' },
];

async function run() {
  console.log(`Poblando base de datos con ${apps.length} aplicaciones (MÍNIMO)...`);
  
  for (const app of apps) {
    const fullApp = {
      ...app,
      form_schema: [{ name: "input", type: "textarea", label_es: "Entrada", label_en: "Input", required: true }],
      autofill_presets: [],
      prompt_template: "GENERAL INSTRUCTIONS: Respond in {{responseLanguage}}. Task: Process {{input}} for " + app.name_en
    };

    const { error } = await supabase
      .from('micro_apps')
      .upsert(fullApp, { onConflict: 'slug' });

    if (error) {
      console.error(`Error insertando ${app.slug}:`, error.message);
    } else {
      console.log(`✅ ${app.slug} insertada/actualizada.`);
    }
  }

  // Vincular al plan Profesional
  console.log('Vinculando apps al plan Profesional...');
  const { data: plan } = await supabase.from('plans').select('id').eq('slug', 'professional').single();
  
  if (plan) {
    const { data: dbApps } = await supabase.from('micro_apps').select('id');
    const links = dbApps.map(a => ({ plan_id: plan.id, app_id: a.id }));
    
    const { error: linkError } = await supabase.from('plan_apps').upsert(links, { onConflict: 'plan_id,app_id' });
    if (linkError) console.error('Error vinculando apps:', linkError.message);
    else console.log('✅ Todas las apps vinculadas al plan Profesional.');
  }

  console.log('Proceso completado.');
}

run();
