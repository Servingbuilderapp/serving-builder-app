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
  // Módulo 12: Creación de Contenido Digital (10)
  { slug: 'podcast-script-generator', icon: 'Mic', name_es: 'Generador de Guiones para Podcast', name_en: 'Podcast Script Generator', description_es: 'Estructura de introducción, nudo y cierre.', description_en: 'Structure of introduction, climax and closing.' },
  { slug: 'youtube-title-optimizer', icon: 'Youtube', name_es: 'Optimizador de Títulos de YouTube', name_en: 'YouTube Title Optimizer', description_es: 'Mejora el CTR de tus videos.', description_en: 'Improve the CTR of your videos.' },
  { slug: 'influencer-value-calc', icon: 'DollarSign', name_es: 'Calculadora de Valor de Influencer', name_en: 'Influencer Value Calc', description_es: 'Estima cuánto cobrar o pagar por un post.', description_en: 'Estimate how much to charge or pay for a post.' },
  { slug: 'tts-script-converter', icon: 'Volume2', name_es: 'Conversor de Texto a Voz (Script)', name_en: 'TTS Script Converter', description_es: 'Prepara textos para locuciones.', description_en: 'Prepare texts for voiceovers.' },
  { slug: 'brand-palette-analyzer', icon: 'Aperture', name_es: 'Analizador de Paleta de Marca', name_en: 'Brand Palette Analyzer', description_es: 'Saca colores de cualquier logo.', description_en: 'Extract colors from any logo.' },
  { slug: 'placeholder-generator', icon: 'Image', name_es: 'Generador de Placeholders', name_en: 'Placeholder Generator', description_es: 'Imágenes temporales para tus diseños.', description_en: 'Temporary images for your designs.' },
  { slug: 'qr-reader', icon: 'Maximize', name_es: 'Lector de Códigos QR', name_en: 'QR Reader', description_es: 'Decodifica información con tu cámara.', description_en: 'Decode information with your camera.' },
  { slug: 'favicon-generator', icon: 'Star', name_es: 'Generador de Favicons', name_en: 'Favicon Generator', description_es: 'Crea el icono pequeño de tu web.', description_en: 'Create the small icon of your website.' },
  { slug: 'bg-remover', icon: 'Scissors', name_es: 'Eliminador de Fondo (Background)', name_en: 'Background Remover', description_es: 'Herramienta para limpiar fotos de producto.', description_en: 'Tool to clean product photos.' },
  { slug: 'mockup-generator', icon: 'Monitor', name_es: 'Generador de Mockups', name_en: 'Mockup Generator', description_es: 'Visualiza tu logo en camisetas o pantallas.', description_en: 'Visualize your logo on t-shirts or screens.' },

  // Módulo 13: Tecnología y Desarrollo (10)
  { slug: 'webhook-tester', icon: 'Link', name_es: 'Webhook Tester', name_en: 'Webhook Tester', description_es: 'Verifica si tus automatizaciones reciben datos.', description_en: 'Verify if your automations receive data.' },
  { slug: 'json-generator', icon: 'Code', name_es: 'Generador de JSON', name_en: 'JSON Generator', description_es: 'Estructuras de datos para conectar APIs.', description_en: 'Data structures to connect APIs.' },
  { slug: 'csv-json-converter', icon: 'RefreshCw', name_es: 'Conversor de Formatos (CSV/JSON)', name_en: 'CSV/JSON Converter', description_es: 'Mueve datos entre herramientas.', description_en: 'Move data between tools.' },
  { slug: 'uptime-monitor', icon: 'Activity', name_es: 'Monitor de Uptime', name_en: 'Uptime Monitor', description_es: 'Avisa si tu página se cae.', description_en: 'Alerts you if your page goes down.' },
  { slug: 'web-speed-analyzer', icon: 'Zap', name_es: 'Analizador de Velocidad Web', name_en: 'Web Speed Analyzer', description_es: 'Mide la carga en dispositivos móviles.', description_en: 'Measure loading on mobile devices.' },
  { slug: 'secure-password-gen', icon: 'Lock', name_es: 'Generador de Contraseñas Seguras', name_en: 'Secure Password Gen', description_es: 'Crea claves imposibles de hackear.', description_en: 'Create unhackable passwords.' },
  { slug: 'dns-propagation-checker', icon: 'Globe', name_es: 'Verificador de Propagación DNS', name_en: 'DNS Propagation Checker', description_es: 'Revisa si tu dominio ya funciona.', description_en: 'Check if your domain is working.' },
  { slug: 'htaccess-generator', icon: 'Settings', name_es: 'Generador de .htaccess', name_en: '.htaccess Generator', description_es: 'Configuraciones de seguridad para tu servidor.', description_en: 'Security settings for your server.' },
  { slug: 'ssl-cert-reader', icon: 'Shield', name_es: 'Lector de Certificados SSL', name_en: 'SSL Cert Reader', description_es: 'Verifica si tu web es segura (HTTPS).', description_en: 'Verify if your website is secure (HTTPS).' },
  { slug: 'readme-md-generator', icon: 'FileText', name_es: 'Generador de Readme.md', name_en: 'Readme.md Generator', description_es: 'Documentación para tus proyectos en GitHub.', description_en: 'Documentation for your projects on GitHub.' }
];

async function run() {
  console.log(`Poblando base de datos con ${apps.length} aplicaciones de Emprendimiento (Batch 5)...`);
  
  for (const app of apps) {
    const fullApp = {
      ...app,
      form_schema: [
        { name: "project_name", type: "input", label_es: "Plataforma / Canal / Proyecto", label_en: "Platform / Channel / Project", required: true },
        { name: "details", type: "textarea", label_es: "Detalles (Keywords, código, ideas o enlaces)", label_en: "Details (Keywords, code, ideas, or links)", required: true }
      ],
      autofill_presets: [
        { id: 'example-1', name_es: 'Ejemplo Tecnológico', name_en: 'Tech Example', values: { project_name: 'App de IA', details: 'Necesito crear la estructura JSON para la base de datos de usuarios.' } }
      ],
      prompt_template: `GENERAL INSTRUCTIONS: Respond in {{responseLanguage}}. Act as an expert Content Creator and Senior Developer.
Task: Run the tool "${app.name_en}" for the platform/project "{{project_name}}".
Context/Details: {{details}}
Tool description: ${app.description_en}
Provide a highly detailed, professional, and structured output (using Markdown) evaluating the inputs based on this tool's purpose. For development tools, provide clean code blocks. For content, provide creative output.`
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

  console.log('Proceso Batch 5 completado.');
}

run();
