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
  // Módulo 3: Marketing Digital y SEO (15)
  { slug: 'meta-tags-gen', icon: 'Globe', name_es: 'Generador de Meta-Tags', name_en: 'Meta-Tags Generator', description_es: 'Optimiza cómo se ve tu web en Google y redes sociales.', description_en: 'Optimize how your website looks on Google and social media.' },
  { slug: 'keyword-extractor', icon: 'Key', name_es: 'Extractor de Palabras Clave', name_en: 'Keyword Extractor', description_es: 'Identifica términos de búsqueda para mejorar tu SEO.', description_en: 'Identify search terms to improve your SEO.' },
  { slug: 'ctr-title-analyzer', icon: 'Type', name_es: 'Analizador de Títulos (CTR)', name_en: 'Title Analyzer (CTR)', description_es: 'Puntúa qué tan llamativo es el título de tu blog o video.', description_en: 'Score how catchy the title of your blog or video is.' },
  { slug: 'utm-builder', icon: 'Link', name_es: 'Constructor de UTMs', name_en: 'UTM Builder', description_es: 'Etiqueta tus enlaces para saber de dónde vienen tus visitas.', description_en: 'Tag your links to know where your visitors come from.' },
  { slug: 'url-shortener', icon: 'Scissors', name_es: 'Acortador de Enlaces', name_en: 'URL Shortener', description_es: 'Transforma URLs largas en links cortos y profesionales.', description_en: 'Transform long URLs into short and professional links.' },
  { slug: 'robots-txt-gen', icon: 'FileText', name_es: 'Generador de Robots.txt', name_en: 'Robots.txt Generator', description_es: 'Archivo esencial para que Google indexe tu web correctamente.', description_en: 'Essential file for Google to index your website correctly.' },
  { slug: 'xml-sitemap-creator', icon: 'Map', name_es: 'Creador de Sitemap XML', name_en: 'XML Sitemap Creator', description_es: 'Lista de páginas de tu web para buscadores.', description_en: 'List of pages on your website for search engines.' },
  { slug: 'keyword-density-analyzer', icon: 'Activity', name_es: 'Analizador de Densidad de Palabras', name_en: 'Keyword Density Analyzer', description_es: 'Evita el spam de palabras clave en tus artículos.', description_en: 'Avoid keyword stuffing in your articles.' },
  { slug: 'alt-text-gen', icon: 'Image', name_es: 'Generador de Alt-Text', name_en: 'Alt-Text Generator', description_es: 'Crea descripciones para imágenes que mejoran el SEO.', description_en: 'Create descriptions for images that improve SEO.' },
  { slug: 'keyword-difficulty-calc', icon: 'Target', name_es: 'Calculadora de Keyword Difficulty', name_en: 'Keyword Difficulty Calc', description_es: 'Evalúa qué tan difícil es rankear una palabra.', description_en: 'Evaluate how difficult it is to rank for a word.' },
  { slug: 'broken-link-checker', icon: 'AlertCircle', name_es: 'Verificador de Enlaces Rotos', name_en: 'Broken Link Checker', description_es: 'Encuentra links que no funcionan en tu sitio.', description_en: 'Find links that do not work on your site.' },
  { slug: 'faq-schema-gen', icon: 'HelpCircle', name_es: 'Generador de FAQ Schema', name_en: 'FAQ Schema Generator', description_es: 'Código especial para que tus preguntas aparezcan en Google.', description_en: 'Special code so your questions appear on Google.' },
  { slug: 'backlink-analyzer', icon: 'Link2', name_es: 'Analizador de Backlinks', name_en: 'Backlink Analyzer', description_es: 'Registro manual de quién enlaza a tu página.', description_en: 'Manual record of who links to your page.' },
  { slug: 'speed-optimizer', icon: 'Zap', name_es: 'Optimizador de Velocidad', name_en: 'Speed Optimizer', description_es: 'Checklist de elementos que ralentizan tu web.', description_en: 'Checklist of elements that slow down your website.' },
  { slug: 'blog-structure-gen', icon: 'Layout', name_es: 'Generador de Estructura de Blog', name_en: 'Blog Structure Generator', description_es: 'Esqueleto lógico para artículos de alto impacto.', description_en: 'Logical skeleton for high-impact articles.' },

  // Módulo 4: Redes Sociales (15)
  { slug: 'hashtag-generator', icon: 'Hash', name_es: 'Generador de Hashtags', name_en: 'Hashtag Generator', description_es: 'Sugiere etiquetas relevantes para Instagram y TikTok.', description_en: 'Suggest relevant tags for Instagram and TikTok.' },
  { slug: 'whatsapp-link-creator', icon: 'MessageCircle', name_es: 'Creador de Enlaces de WhatsApp', name_en: 'WhatsApp Link Creator', description_es: 'Genera links con mensajes pre-escritos para clientes.', description_en: 'Generate links with pre-written messages for customers.' },
  { slug: 'posting-calendar', icon: 'Calendar', name_es: 'Calendario de Publicaciones', name_en: 'Posting Calendar', description_es: 'Organiza qué publicar cada día en cada red.', description_en: 'Organize what to post every day on each network.' },
  { slug: 'reels-script-gen', icon: 'Video', name_es: 'Generador de Scripts para Reels', name_en: 'Reels Script Generator', description_es: 'Estructura videos cortos con gancho, valor y cierre.', description_en: 'Structure short videos with hook, value, and closing.' },
  { slug: 'ig-bio-analyzer', icon: 'UserCheck', name_es: 'Analizador de Bio de Instagram', name_en: 'IG Bio Analyzer', description_es: 'Checklist para optimizar tu perfil y vender más.', description_en: 'Checklist to optimize your profile and sell more.' },
  { slug: 'bio-links-builder', icon: 'Link', name_es: 'Constructor de Bio-Links', name_en: 'Bio-Links Builder', description_es: 'Tu propio "Linktree" personalizable y ligero.', description_en: 'Your own customizable and lightweight "Linktree".' },
  { slug: 'engagement-rate-calc', icon: 'Heart', name_es: 'Calculadora de Engagement Rate', name_en: 'Engagement Rate Calc', description_es: 'Mide la interacción real de tus seguidores.', description_en: 'Measure the real interaction of your followers.' },
  { slug: 'image-prompt-gen', icon: 'Image', name_es: 'Generador de Prompts para Imágenes', name_en: 'Image Prompt Generator', description_es: 'Ideas para crear visuales con IA (Midjourney/DALL-E).', description_en: 'Ideas to create visuals with AI.' },
  { slug: 'twitter-thread-creator', icon: 'Twitter', name_es: 'Creador de Hilos de Twitter/X', name_en: 'Twitter Thread Creator', description_es: 'Divide textos largos en publicaciones encadenadas.', description_en: 'Divide long texts into chained posts.' },
  { slug: 'stories-planner', icon: 'Smartphone', name_es: 'Planificador de Stories', name_en: 'Stories Planner', description_es: 'Estructura de 5 pasos para contar historias que conviertan.', description_en: '5-step structure to tell stories that convert.' },
  { slug: 'comment-picker', icon: 'MessageSquare', name_es: 'Extractor de Comentarios', name_en: 'Comment Picker', description_es: 'Herramienta para elegir ganadores de concursos.', description_en: 'Tool to choose contest winners.' },
  { slug: 'caption-copy-gen', icon: 'Edit3', name_es: 'Generador de Captions (Copys)', name_en: 'Caption Generator', description_es: 'Textos creativos para acompañar tus fotos.', description_en: 'Creative texts to accompany your photos.' },
  { slug: 'feed-simulator', icon: 'Grid', name_es: 'Simulador de Feed', name_en: 'Feed Simulator', description_es: 'Visualiza cómo se verán tus próximas fotos en la cuadrícula.', description_en: 'Visualize how your next photos will look on the grid.' },
  { slug: 'best-time-analyzer', icon: 'Clock', name_es: 'Analizador de Mejores Horas', name_en: 'Best Time Analyzer', description_es: 'Identifica cuándo está más activa tu audiencia.', description_en: 'Identify when your audience is most active.' },
  { slug: 'video-to-gif', icon: 'Film', name_es: 'Conversor de Video a GIF', name_en: 'Video to GIF Converter', description_es: 'Crea clips cortos para reacciones o anuncios.', description_en: 'Create short clips for reactions or ads.' }
];

async function run() {
  console.log(`Poblando base de datos con ${apps.length} aplicaciones de Emprendimiento (Batch 2)...`);
  
  for (const app of apps) {
    const fullApp = {
      ...app,
      form_schema: [
        { name: "project_name", type: "input", label_es: "Nombre de tu Proyecto / Marca", label_en: "Project / Brand Name", required: true },
        { name: "details", type: "textarea", label_es: "Detalles adicionales (tema, keywords, público objetivo, o red social)", label_en: "Additional details (topic, keywords, target audience, etc.)", required: true }
      ],
      autofill_presets: [
        { id: 'example-1', name_es: 'Ejemplo: Agencia de Marketing', name_en: 'Example: Marketing Agency', values: { project_name: 'DigitalFlow', details: 'Agencia especializada en SEO y contenido para pequeñas empresas locales.' } }
      ],
      prompt_template: `GENERAL INSTRUCTIONS: Respond in {{responseLanguage}}. Act as an expert Digital Marketing and Social Media consultant. 
Task: Run the tool "${app.name_en}" for the project/brand "{{project_name}}".
Context/Details: {{details}}
Tool description: ${app.description_en}
Provide a highly detailed, professional, and structured output (using Markdown) evaluating the inputs based on this tool's purpose. Make it actionable for the user.`
    };

    const { error } = await supabase
      .from('micro_apps')
      .upsert(fullApp, { onConflict: 'slug' });

    if (error) {
      console.error(`Error insertando ${app.slug}:`, error.message);
    } else {
      console.log(`✅ ${app.slug} insertada/actualizada correctamente.`);
    }
  }

  console.log('Proceso Batch 2 completado.');
}

run();
