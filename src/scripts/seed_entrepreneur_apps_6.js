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
  // Módulo 14: E-commerce y Retail (10)
  { slug: 'product-margin-calc', icon: 'DollarSign', name_es: 'Calculadora de Margen de Producto', name_en: 'Product Margin Calculator', description_es: 'Precio de venta vs. costo de adquisición.', description_en: 'Selling price vs. acquisition cost.' },
  { slug: 'product-description-gen', icon: 'Type', name_es: 'Generador de Descripciones de Producto', name_en: 'Product Description Gen', description_es: 'Textos que venden beneficios, no solo funciones.', description_en: 'Texts that sell benefits, not just features.' },
  { slug: 'checkout-optimizer', icon: 'ShoppingCart', name_es: 'Optimizador de Checkout', name_en: 'Checkout Optimizer', description_es: 'Pasos para reducir el abandono de carrito.', description_en: 'Steps to reduce cart abandonment.' },
  { slug: 'volume-discount-calc', icon: 'Percent', name_es: 'Calculadora de Descuento por Volumen', name_en: 'Volume Discount Calc', description_es: 'Escalas de precios para mayoristas.', description_en: 'Price scales for wholesalers.' },
  { slug: 'competitor-price-tracker', icon: 'Activity', name_es: 'Rastreador de Precios de Competencia', name_en: 'Competitor Price Tracker', description_es: 'Monitorea cambios en el mercado.', description_en: 'Monitor market changes.' },
  { slug: 'shipping-label-gen', icon: 'Printer', name_es: 'Generador de Etiquetas de Envío', name_en: 'Shipping Label Gen', description_es: 'Formato listo para imprimir.', description_en: 'Ready to print format.' },
  { slug: 'packaging-cost-calc', icon: 'Box', name_es: 'Calculadora de Costo de Packaging', name_en: 'Packaging Cost Calc', description_es: 'Incluye cajas y cinta en tu costo total.', description_en: 'Include boxes and tape in your total cost.' },
  { slug: 'upsell-simulator', icon: 'TrendingUp', name_es: 'Simulador de Ventas Cruzadas (Upsell)', name_en: 'Upsell Simulator', description_es: 'Sugiere productos complementarios.', description_en: 'Suggest complementary products.' },
  { slug: 'product-review-manager', icon: 'Star', name_es: 'Gestor de Reseñas de Producto', name_en: 'Product Review Manager', description_es: 'Organiza las estrellas y comentarios.', description_en: 'Organize stars and comments.' },
  { slug: 'reorder-point-calc', icon: 'RefreshCw', name_es: 'Calculadora de Punto de Reorden', name_en: 'Reorder Point Calc', description_es: 'Cuándo comprar más stock automáticamente.', description_en: 'When to automatically buy more stock.' },

  // Módulo 15: Productividad del Fundador (10)
  { slug: 'eisenhower-matrix', icon: 'Grid', name_es: 'Matriz de Eisenhower', name_en: 'Eisenhower Matrix', description_es: 'Clasifica tareas en Urgente e Importante.', description_en: 'Classify tasks into Urgent and Important.' },
  { slug: 'achievement-journal', icon: 'Award', name_es: 'Diario de Logros', name_en: 'Achievement Journal', description_es: 'Registra una victoria diaria para motivarte.', description_en: 'Record a daily victory to motivate yourself.' },
  { slug: 'pomodoro-timer', icon: 'Clock', name_es: 'Temporizador Pomodoro', name_en: 'Pomodoro Timer', description_es: 'Bloques de 25 min de trabajo profundo.', description_en: '25-minute blocks of deep work.' },
  { slug: 'hourly-value-calc', icon: 'DollarSign', name_es: 'Calculadora de Valor/Hora', name_en: 'Hourly Value Calc', description_es: 'Cuánto vale una hora de tu tiempo.', description_en: 'How much an hour of your time is worth.' },
  { slug: 'habit-tracker', icon: 'CheckSquare', name_es: 'Rastreador de Hábitos', name_en: 'Habit Tracker', description_es: 'Monitorea sueño, ejercicio y lectura.', description_en: 'Monitor sleep, exercise and reading.' },
  { slug: 'affirmation-generator', icon: 'Smile', name_es: 'Generador de Afirmaciones', name_en: 'Affirmation Generator', description_es: 'Frases para reprogramar la mente emprendedora.', description_en: 'Phrases to reprogram the entrepreneurial mind.' },
  { slug: 'reading-organizer', icon: 'Book', name_es: 'Organizador de Lecturas', name_en: 'Reading Organizer', description_es: 'Lista de libros y artículos con resumen.', description_en: 'List of books and articles with summary.' },
  { slug: 'financial-freedom-calc', icon: 'TrendingUp', name_es: 'Calculadora de Libertad Financiera', name_en: 'Financial Freedom Calc', description_es: 'Cuánto ahorro necesitas para retirarte.', description_en: 'How much savings you need to retire.' },
  { slug: 'express-meditation', icon: 'Wind', name_es: 'Meditación Express', name_en: 'Express Meditation', description_es: 'Guías de 2 minutos para el estrés.', description_en: '2-minute guides for stress.' },
  { slug: 'distraction-blocker', icon: 'Shield', name_es: 'Bloqueador de Distracciones', name_en: 'Distraction Blocker', description_es: 'Lista de sitios prohibidos durante el trabajo.', description_en: 'List of prohibited sites during work.' },

  // Módulo 16: Marketing de Contenidos Pro (10)
  { slug: 'blog-topic-gen', icon: 'MessageCircle', name_es: 'Generador de Temas de Blog', name_en: 'Blog Topic Generator', description_es: 'Ideas basadas en preguntas de clientes.', description_en: 'Ideas based on customer questions.' },
  { slug: 'readability-calc', icon: 'Eye', name_es: 'Calculadora de Legibilidad', name_en: 'Readability Calculator', description_es: 'Revisa si tus textos son fáciles de leer.', description_en: 'Check if your texts are easy to read.' },
  { slug: 'visual-quote-gen', icon: 'Image', name_es: 'Generador de Citas Visuales', name_en: 'Visual Quote Generator', description_es: 'Convierte frases en imágenes para compartir.', description_en: 'Convert phrases into images to share.' },
  { slug: 'bounce-rate-analyzer', icon: 'Activity', name_es: 'Analizador de Tasa de Rebote', name_en: 'Bounce Rate Analyzer', description_es: 'Entiende por qué la gente se va de tu blog.', description_en: 'Understand why people leave your blog.' },
  { slug: 'question-finder', icon: 'Search', name_es: 'Buscador de Preguntas (Quora/Reddit)', name_en: 'Question Finder', description_es: 'Qué está preguntando tu nicho.', description_en: 'What your niche is asking.' },
  { slug: 'success-story-gen', icon: 'Star', name_es: 'Generador de Casos de Éxito', name_en: 'Success Story Generator', description_es: 'Estructura para mostrar resultados reales.', description_en: 'Structure to show real results.' },
  { slug: 'whitepaper-planner', icon: 'FileText', name_es: 'Planificador de Whitepapers', name_en: 'Whitepaper Planner', description_es: 'Guía para crear contenido técnico profundo.', description_en: 'Guide to creating deep technical content.' },
  { slug: 'infographic-struct-gen', icon: 'Layout', name_es: 'Generador de Infografías (Estructura)', name_en: 'Infographic Struct Gen', description_es: 'Jerarquía de información visual.', description_en: 'Visual information hierarchy.' },
  { slug: 'content-roi-calc', icon: 'PieChart', name_es: 'Calculadora de ROI de Contenido', name_en: 'Content ROI Calculator', description_es: 'Cuántas ventas trajo ese post de blog.', description_en: 'How many sales that blog post brought.' },
  { slug: 'brand-asset-manager', icon: 'Briefcase', name_es: 'Gestor de Activos de Marca', name_en: 'Brand Asset Manager', description_es: 'Centraliza logos, fuentes y manual.', description_en: 'Centralize logos, fonts and manual.' },

  // Módulo 17: Relaciones Públicas y Networking (10)
  { slug: 'press-release-gen', icon: 'Mic', name_es: 'Generador de Notas de Prensa', name_en: 'Press Release Generator', description_es: 'Formato profesional para medios.', description_en: 'Professional format for media.' },
  { slug: 'niche-journalist-finder', icon: 'Search', name_es: 'Buscador de Periodistas de Nicho', name_en: 'Niche Journalist Finder', description_es: 'Lista de contactos para difusión.', description_en: 'Contact list for broadcasting.' },
  { slug: 'cold-email-structure', icon: 'Mail', name_es: 'Estructura de Email Frío (Outreach)', name_en: 'Cold Email Structure', description_es: 'Para contactar socios potenciales.', description_en: 'To contact potential partners.' },
  { slug: 'sponsorship-value-calc', icon: 'DollarSign', name_es: 'Calculadora de Valor de Patrocinio', name_en: 'Sponsorship Value Calc', description_es: 'Cuánto cobrar por espacio en tu web.', description_en: 'How much to charge for space on your website.' },
  { slug: 'event-webinar-manager', icon: 'Video', name_es: 'Gestor de Eventos y Webinars', name_en: 'Event & Webinar Manager', description_es: 'Registro de asistentes y recordatorios.', description_en: 'Registration of attendees and reminders.' },
  { slug: 'digital-card-gen', icon: 'User', name_es: 'Generador de Tarjetas Digitales', name_en: 'Digital Card Generator', description_es: 'QR con todos tus datos de contacto.', description_en: 'QR with all your contact info.' },
  { slug: 'brand-mention-tracker', icon: 'Globe', name_es: 'Rastreador de Menciones de Marca', name_en: 'Brand Mention Tracker', description_es: 'Dónde se habla de ti en internet.', description_en: 'Where they talk about you on the internet.' },
  { slug: 'pitch-video-script', icon: 'Film', name_es: 'Guionista de Video de Presentación', name_en: 'Pitch Video Scriptwriter', description_es: 'Qué decir en tu video de "Sobre mí".', description_en: 'What to say in your "About me" video.' },
  { slug: 'networking-planner', icon: 'Users', name_es: 'Planificador de Networking', name_en: 'Networking Planner', description_es: 'Personas clave con las que debes conectar.', description_en: 'Key people you should connect with.' },
  { slug: 'letter-of-intent-gen', icon: 'FileText', name_es: 'Generador de Cartas de Intención', name_en: 'Letter of Intent Generator', description_es: 'Formaliza acuerdos preliminares.', description_en: 'Formalize preliminary agreements.' },

  // Módulo 18: Seguridad y Mantenimiento (10)
  { slug: 'vulnerability-scanner', icon: 'Shield', name_es: 'Escáner de Vulnerabilidades', name_en: 'Vulnerability Scanner', description_es: 'Checklist de seguridad para tu portal.', description_en: 'Security checklist for your portal.' },
  { slug: 'auto-backup-gen', icon: 'Save', name_es: 'Generador de Backup Automático', name_en: 'Auto Backup Generator', description_es: 'Configuración de copias de seguridad.', description_en: 'Backup configuration.' },
  { slug: 'user-permission-manager', icon: 'Key', name_es: 'Gestor de Permisos de Usuario', name_en: 'User Permission Manager', description_es: 'Quién puede ver qué en tu Supabase.', description_en: 'Who can see what in your Supabase.' },
  { slug: 'api-consumption-calc', icon: 'Activity', name_es: 'Calculadora de Consumo de API', name_en: 'API Consumption Calc', description_es: 'Monitorea cuánto gastas en Gemini/Google.', description_en: 'Monitor how much you spend on Gemini/Google.' },
  { slug: 'db-cleaner', icon: 'Trash2', name_es: 'Limpiador de Base de Datos', name_en: 'Database Cleaner', description_es: 'Elimina registros basura o duplicados.', description_en: 'Remove junk or duplicate records.' },
  { slug: 'ip-reputation-checker', icon: 'CheckCircle', name_es: 'Verificador de Reputación de IP', name_en: 'IP Reputation Checker', description_es: 'Revisa si tus correos caerán en spam.', description_en: 'Check if your emails will land in spam.' },
  { slug: 'error-log-analyzer', icon: 'AlertTriangle', name_es: 'Analizador de Logs de Error', name_en: 'Error Log Analyzer', description_es: 'Encuentra fallos en tu Next.js 15 rápido.', description_en: 'Find bugs in your Next.js 15 fast.' },
  { slug: 'maintenance-page-gen', icon: 'Settings', name_es: 'Generador de Página "En Mantenimiento"', name_en: 'Maintenance Page Gen', description_es: 'Aviso profesional para usuarios.', description_en: 'Professional notice for users.' },
  { slug: 'latency-calc', icon: 'Clock', name_es: 'Calculadora de Latencia', name_en: 'Latency Calculator', description_es: 'Mide qué tan rápido responde tu servidor.', description_en: 'Measure how fast your server responds.' },
  { slug: 'vision-board-mapper', icon: 'Map', name_es: 'Mapa de Sueños y Visión', name_en: 'Vision Board Mapper', description_es: 'Panel visual para tus objetivos a 5 años.', description_en: 'Visual board for your 5-year goals.' }
];

async function run() {
  console.log(`Poblando base de datos con ${apps.length} aplicaciones de Emprendimiento (Batch FINAL)...`);
  
  for (const app of apps) {
    const fullApp = {
      ...app,
      form_schema: [
        { name: "project_name", type: "input", label_es: "Nombre de tu Proyecto / Tarea", label_en: "Project / Task Name", required: true },
        { name: "details", type: "textarea", label_es: "Detalles (Métricas, Productos, Errores o Contactos)", label_en: "Details (Metrics, Products, Errors or Contacts)", required: true }
      ],
      autofill_presets: [
        { id: 'example-1', name_es: 'Ejemplo General', name_en: 'General Example', values: { project_name: 'Lanzamiento Q4', details: 'Datos del contexto: Necesitamos evaluar el impacto y los costos del último lanzamiento.' } }
      ],
      prompt_template: `GENERAL INSTRUCTIONS: Respond in {{responseLanguage}}. Act as an expert E-commerce, Productivity, and Security consultant.
Task: Run the tool "${app.name_en}" for the project/task "{{project_name}}".
Context/Details: {{details}}
Tool description: ${app.description_en}
Provide a highly detailed, professional, and structured output (using Markdown) evaluating the inputs based on this tool's purpose. Ensure all advice is actionable for an entrepreneur.`
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

  console.log('Proceso Batch FINAL completado. 🎉');
}

run();
