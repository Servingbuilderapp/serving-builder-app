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
  // Módulo 8: Legal y Cumplimiento (10)
  { slug: 'terms-conditions-gen', icon: 'FileText', name_es: 'Generador de Términos y Condiciones', name_en: 'T&C Generator', description_es: 'Texto legal básico para tu web.', description_en: 'Basic legal text for your website.' },
  { slug: 'privacy-policy-gen', icon: 'Shield', name_es: 'Política de Privacidad', name_en: 'Privacy Policy', description_es: 'Documento para el manejo de datos personales.', description_en: 'Document for handling personal data.' },
  { slug: 'nda-generator', icon: 'Lock', name_es: 'Contrato de Confidencialidad (NDA)', name_en: 'NDA Generator', description_es: 'Protege tus ideas al hablar con terceros.', description_en: 'Protect your ideas when talking to third parties.' },
  { slug: 'service-contract-gen', icon: 'Briefcase', name_es: 'Contrato de Prestación de Servicios', name_en: 'Service Contract Generator', description_es: 'Acuerdo básico freelancer-cliente.', description_en: 'Basic freelancer-client agreement.' },
  { slug: 'partners-agreement', icon: 'Users', name_es: 'Acuerdo de Socios', name_en: 'Partners Agreement', description_es: 'Define reglas claras entre los fundadores.', description_en: 'Define clear rules between founders.' },
  { slug: 'legal-notice-gen', icon: 'AlertCircle', name_es: 'Generador de Avisos Legales', name_en: 'Legal Notice Generator', description_es: 'Textos para pie de página y correos.', description_en: 'Texts for footers and emails.' },
  { slug: 'ip-manager', icon: 'Award', name_es: 'Gestor de Propiedad Intelectual', name_en: 'IP Manager', description_es: 'Registro de fechas de tus creaciones.', description_en: 'Date record of your creations.' },
  { slug: 'severance-calculator', icon: 'Calculator', name_es: 'Calculadora de Liquidación', name_en: 'Severance Calculator', description_es: 'Estima pagos legales al terminar contratos.', description_en: 'Estimate legal payments upon ending contracts.' },
  { slug: 'incorporation-checklist', icon: 'CheckSquare', name_es: 'Checklist de Formalización', name_en: 'Incorporation Checklist', description_es: 'Pasos para registrar tu empresa legalmente.', description_en: 'Steps to legally register your company.' },
  { slug: 'trademark-checker', icon: 'Search', name_es: 'Verificador de Marcas', name_en: 'Trademark Checker', description_es: 'Enlaces para evitar plagios de nombres.', description_en: 'Links to avoid name plagiarism.' },

  // Módulo 9: Capital Humano (10)
  { slug: 'job-profile-gen', icon: 'UserPlus', name_es: 'Generador de Perfiles de Cargo', name_en: 'Job Profile Generator', description_es: 'Define qué habilidades buscas en un empleado.', description_en: 'Define what skills you seek in an employee.' },
  { slug: 'candidate-filter', icon: 'Filter', name_es: 'Filtro de Candidatos', name_en: 'Candidate Filter', description_es: 'Sistema de puntuación para entrevistas.', description_en: 'Scoring system for interviews.' },
  { slug: 'net-salary-calc', icon: 'DollarSign', name_es: 'Calculadora de Salario Neto', name_en: 'Net Salary Calc', description_es: 'Pasa de salario bruto a lo que recibe el empleado.', description_en: 'Go from gross salary to what the employee receives.' },
  { slug: 'onboarding-planner', icon: 'Map', name_es: 'Planificador de Onboarding', name_en: 'Onboarding Planner', description_es: 'Pasos para recibir a un nuevo integrante.', description_en: 'Steps to welcome a new team member.' },
  { slug: 'performance-evaluator', icon: 'Activity', name_es: 'Evaluador de Desempeño', name_en: 'Performance Evaluator', description_es: 'Formatos simples para dar feedback.', description_en: 'Simple formats to give feedback.' },
  { slug: 'shift-organizer', icon: 'Calendar', name_es: 'Organizador de Turnos', name_en: 'Shift Organizer', description_es: 'Gestión de horarios para equipos de servicio.', description_en: 'Schedule management for service teams.' },
  { slug: 'vacation-manager', icon: 'Sun', name_es: 'Gestor de Vacaciones', name_en: 'Vacation Manager', description_es: 'Calendario compartido de ausencias.', description_en: 'Shared calendar of absences.' },
  { slug: 'labor-cost-calc', icon: 'TrendingUp', name_es: 'Calculadora de Costo Laboral', name_en: 'Labor Cost Calc', description_es: 'Cuánto le cuesta realmente un empleado a la empresa.', description_en: 'How much an employee really costs the company.' },
  { slug: 'work-climate-survey', icon: 'Smile', name_es: 'Encuesta de Clima Laboral', name_en: 'Work Climate Survey', description_es: 'Mide el nivel de estrés de tu equipo.', description_en: 'Measure your team’s stress level.' },
  { slug: 'anonymous-suggestion-box', icon: 'Inbox', name_es: 'Buzón de Sugerencias Anónimo', name_en: 'Anonymous Suggestion Box', description_es: 'Espacio para ideas sin miedo al juicio.', description_en: 'Space for ideas without fear of judgment.' },

  // Módulo 10: Email Marketing y Automatización (10)
  { slug: 'email-subject-gen', icon: 'Mail', name_es: 'Generador de Asuntos de Email', name_en: 'Email Subject Generator', description_es: 'Crea líneas de asunto que obliguen a abrir el correo.', description_en: 'Create subject lines that compel opening.' },
  { slug: 'welcome-sequence-designer', icon: 'Layout', name_es: 'Diseñador de Secuencia de Bienvenida', name_en: 'Welcome Sequence Designer', description_es: 'Pasos para enamorar al nuevo suscriptor.', description_en: 'Steps to make the new subscriber fall in love.' },
  { slug: 'open-rate-calc', icon: 'Eye', name_es: 'Calculadora de Open Rate', name_en: 'Open Rate Calc', description_es: 'Mide qué porcentaje de gente abre tus correos.', description_en: 'Measure what percentage of people open your emails.' },
  { slug: 'spam-checker', icon: 'AlertTriangle', name_es: 'Verificador de Spam', name_en: 'Spam Checker', description_es: 'Revisa si tu correo tiene palabras que lo manden a la basura.', description_en: 'Check if your email has words that send it to trash.' },
  { slug: 'unsubscribe-link-gen', icon: 'Unlink', name_es: 'Generador de Link de Desuscripción', name_en: 'Unsubscribe Link Gen', description_es: 'Esencial para cumplir leyes de email.', description_en: 'Essential to comply with email laws.' },
  { slug: 'list-cleaner', icon: 'Trash2', name_es: 'Limpiador de Listas', name_en: 'List Cleaner', description_es: 'Checklist para eliminar correos inactivos.', description_en: 'Checklist to remove inactive emails.' },
  { slug: 'signup-form-creator', icon: 'PlusSquare', name_es: 'Creador de Formularios de Suscripción', name_en: 'Signup Form Creator', description_es: 'Estructura para captar correos en tu web.', description_en: 'Structure to capture emails on your website.' },
  { slug: 'email-ctr-analyzer', icon: 'MousePointer', name_es: 'Analizador de Tasa de Clics en Email', name_en: 'Email CTR Analyzer', description_es: 'Qué enlaces son los más populares.', description_en: 'Which links are the most popular.' },
  { slug: 'pre-header-gen', icon: 'Type', name_es: 'Generador de Texto Pre-header', name_en: 'Pre-header Gen', description_es: 'El texto pequeño que aparece después del asunto.', description_en: 'The small text that appears after the subject.' },
  { slug: 'webinar-planner', icon: 'Video', name_es: 'Planificador de Webinars', name_en: 'Webinar Planner', description_es: 'Cronograma de correos antes y después de un evento.', description_en: 'Email schedule before and after an event.' },

  // Módulo 11: Experiencia del Cliente (10)
  { slug: 'nps-calc', icon: 'Heart', name_es: 'Calculadora de NPS', name_en: 'NPS Calculator', description_es: 'Mide qué tanto te recomiendan tus clientes.', description_en: 'Measure how much your customers recommend you.' },
  { slug: 'public-feedback-box', icon: 'MessageSquare', name_es: 'Buzón de Feedback Público', name_en: 'Public Feedback Box', description_es: 'Deja que usuarios voten por la siguiente función.', description_en: 'Let users vote for the next feature.' },
  { slug: 'testimonial-generator', icon: 'Star', name_es: 'Generador de Testimonios', name_en: 'Testimonial Generator', description_es: 'Formato para pedir reseñas profesionales.', description_en: 'Format to ask for professional reviews.' },
  { slug: 'csat-calculator', icon: 'ThumbsUp', name_es: 'Calculadora de CSAT', name_en: 'CSAT Calculator', description_es: 'Mide la satisfacción tras una compra.', description_en: 'Measure satisfaction after a purchase.' },
  { slug: 'manual-heatmap', icon: 'Map', name_es: 'Mapa de Calor Manual', name_en: 'Manual Heatmap', description_es: 'Registra dónde hacen más clics tus usuarios.', description_en: 'Record where your users click the most.' },
  { slug: 'support-ticket-analyzer', icon: 'LifeBuoy', name_es: 'Analizador de Ticket de Soporte', name_en: 'Support Ticket Analyzer', description_es: 'Clasifica los problemas más comunes.', description_en: 'Classify the most common problems.' },
  { slug: 'refund-manager', icon: 'RefreshCcw', name_es: 'Gestor de Reembolsos', name_en: 'Refund Manager', description_es: 'Registro y control de devoluciones.', description_en: 'Registration and control of returns.' },
  { slug: 'exit-survey', icon: 'LogOut', name_es: 'Encuesta de Salida', name_en: 'Exit Survey', description_es: 'Pregunta por qué un cliente dejó de comprarte.', description_en: 'Ask why a customer stopped buying from you.' },
  { slug: 'user-guide-gen', icon: 'BookOpen', name_es: 'Generador de Guías de Usuario', name_en: 'User Guide Generator', description_es: 'Crea manuales "paso a paso" rápidamente.', description_en: 'Create "step-by-step" manuals quickly.' },
  { slug: 'response-time-calc', icon: 'Clock', name_es: 'Calculadora de Tiempo de Respuesta', name_en: 'Response Time Calc', description_es: 'Mide cuánto tardas en atender un chat.', description_en: 'Measure how long it takes you to answer a chat.' }
];

async function run() {
  console.log(`Poblando base de datos con ${apps.length} aplicaciones de Emprendimiento (Batch 4)...`);
  
  for (const app of apps) {
    const fullApp = {
      ...app,
      form_schema: [
        { name: "project_name", type: "input", label_es: "Tema / Problema / Documento a tratar", label_en: "Topic / Problem / Document", required: true },
        { name: "details", type: "textarea", label_es: "Ingresa los datos exactos (Emails, métricas, feedback de usuarios o cláusulas)", label_en: "Enter the exact data", required: true }
      ],
      autofill_presets: [
        { id: 'example-1', name_es: 'Ejemplo Rápido', name_en: 'Quick Example', values: { project_name: 'Análisis Mensual', details: 'Datos de prueba: 15% de usuarios dejaron la app por precio alto.' } }
      ],
      prompt_template: `GENERAL INSTRUCTIONS: Respond in {{responseLanguage}}. Act as an expert Legal, HR, Email Marketing, and Customer Experience consultant.
Task: Run the tool "${app.name_en}" for the topic "{{project_name}}".
Context/Details: {{details}}
Tool description: ${app.description_en}
Provide a highly detailed, professional, and structured output (using Markdown) evaluating the inputs based on this tool's purpose. Ensure accuracy, empathy, and professional formatting.`
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

  console.log('Proceso Batch 4 completado.');
}

run();
