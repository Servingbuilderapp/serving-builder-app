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
  // Módulo 1: Estrategia y Validación (15)
  { slug: 'lean-canvas-gen', icon: 'Layout', name_es: 'Generador de Lean Canvas', name_en: 'Lean Canvas Generator', description_es: 'Crea tu modelo de negocio en un solo lienzo visual.', description_en: 'Create your business model on a single visual canvas.' },
  { slug: 'buyer-persona-builder', icon: 'Users', name_es: 'Constructor de Buyer Persona', name_en: 'Buyer Persona Builder', description_es: 'Define el perfil psicológico y demográfico de tu cliente ideal.', description_en: 'Define the psychological and demographic profile of your ideal client.' },
  { slug: 'value-prop-analyzer', icon: 'Target', name_es: 'Analizador de Propuesta de Valor', name_en: 'Value Prop Analyzer', description_es: 'Alinea lo que vendes con lo que el cliente realmente necesita.', description_en: 'Align what you sell with what the customer really needs.' },
  { slug: 'tam-sam-som-calc', icon: 'PieChart', name_es: 'Calculadora TAM/SAM/SOM', name_en: 'TAM/SAM/SOM Calculator', description_es: 'Estima el tamaño total, alcanzable y real de tu mercado.', description_en: 'Estimate the total, serviceable, and obtainable market size.' },
  { slug: 'competitor-matrix', icon: 'Grid', name_es: 'Matriz de Competencia', name_en: 'Competitor Matrix', description_es: 'Compara tus funciones y precios contra tus rivales directos.', description_en: 'Compare your features and prices against your direct rivals.' },
  { slug: 'pre-mortem-sim', icon: 'AlertTriangle', name_es: 'Simulador de Pre-Mortem', name_en: 'Pre-Mortem Simulator', description_es: 'Identifica por qué tu negocio podría fallar antes de lanzarlo.', description_en: 'Identify why your business might fail before launching it.' },
  { slug: 'hypothesis-validator', icon: 'CheckCircle', name_es: 'Validador de Hipótesis', name_en: 'Hypothesis Validator', description_es: 'Registra qué quieres probar y qué métrica define el éxito.', description_en: 'Record what you want to test and what metric defines success.' },
  { slug: 'rice-prioritizer', icon: 'List', name_es: 'Priorizador RICE', name_en: 'RICE Prioritizer', description_es: 'Clasifica tus tareas por Alcance, Impacto, Confianza y Esfuerzo.', description_en: 'Rank your tasks by Reach, Impact, Confidence, and Effort.' },
  { slug: 'elevator-pitch-script', icon: 'Mic', name_es: 'Guionista de Elevator Pitch', name_en: 'Elevator Pitch Scriptwriter', description_es: 'Crea un discurso de 30 segundos para vender tu idea.', description_en: 'Create a 30-second pitch to sell your idea.' },
  { slug: 'empathy-map', icon: 'Heart', name_es: 'Mapa de Empatía', name_en: 'Empathy Map', description_es: 'Visualiza qué ve, oye, piensa y siente tu usuario.', description_en: 'Visualize what your user sees, hears, thinks, and feels.' },
  { slug: 'trend-analyzer', icon: 'TrendingUp', name_es: 'Analizador de Tendencias', name_en: 'Trend Analyzer', description_es: 'Conecta con datos actuales para ver si tu nicho está creciendo.', description_en: 'Connect with current data to see if your niche is growing.' },
  { slug: 'naming-gen', icon: 'Type', name_es: 'Generador de Nombres (Naming)', name_en: 'Naming Generator', description_es: 'Sugiere nombres disponibles basados en palabras clave.', description_en: 'Suggest available names based on keywords.' },
  { slug: 'domain-checker', icon: 'Globe', name_es: 'Verificador de Dominios', name_en: 'Domain Checker', description_es: 'Revisa disponibilidad de .com y redes sociales.', description_en: 'Check availability of .com and social networks.' },
  { slug: 'customer-journey-designer', icon: 'Map', name_es: 'Diseñador de Customer Journey', name_en: 'Customer Journey Designer', description_es: 'Dibuja cada paso que da el cliente desde que te conoce.', description_en: 'Draw every step the customer takes since they meet you.' },
  { slug: 'virality-calc', icon: 'Share2', name_es: 'Calculadora de Viralidad', name_en: 'Virality Calculator', description_es: 'Estima cuántos usuarios nuevos trae cada cliente actual.', description_en: 'Estimate how many new users each current customer brings.' },

  // Módulo 2: Finanzas y Unit Economics (15)
  { slug: 'break-even-calc', icon: 'DollarSign', name_es: 'Calculadora de Punto de Equilibrio', name_en: 'Break-Even Calculator', description_es: 'Cuántas ventas necesitas para no perder dinero.', description_en: 'How many sales you need to not lose money.' },
  { slug: 'burn-rate-tracker', icon: 'Flame', name_es: 'Rastreador de Burn Rate', name_en: 'Burn Rate Tracker', description_es: 'Mide qué tan rápido te gastas el capital mensual.', description_en: 'Measure how fast you spend monthly capital.' },
  { slug: 'cac-calc', icon: 'UserPlus', name_es: 'Calculadora de CAC', name_en: 'CAC Calculator', description_es: 'Determina cuánto te cuesta adquirir un cliente nuevo.', description_en: 'Determine how much it costs to acquire a new customer.' },
  { slug: 'ltv-calc', icon: 'Repeat', name_es: 'Calculadora de LTV', name_en: 'LTV Calculator', description_es: 'Estima cuánto dinero te dejará un cliente en toda su vida útil.', description_en: 'Estimate how much money a customer will leave you in their lifetime.' },
  { slug: 'what-if-sim', icon: 'HelpCircle', name_es: 'Simulador de Escenarios (What-if)', name_en: 'What-if Simulator', description_es: '¿Qué pasa si subes el precio o bajan las ventas?', description_en: 'What happens if you raise the price or sales drop?' },
  { slug: 'invoice-gen', icon: 'FileText', name_es: 'Generador de Facturas', name_en: 'Invoice Generator', description_es: 'Crea documentos profesionales para cobros inmediatos.', description_en: 'Create professional documents for immediate billing.' },
  { slug: 'runway-calc', icon: 'Calendar', name_es: 'Calculadora de Runway', name_en: 'Runway Calculator', description_es: 'Cuántos meses de vida le quedan a tu empresa con el dinero actual.', description_en: 'How many months of life your company has left with current money.' },
  { slug: 'tax-estimator', icon: 'Percent', name_es: 'Estimador de Impuestos', name_en: 'Tax Estimator', description_es: 'Proyecta el pago de IVA y retenciones según tu país.', description_en: 'Project VAT and withholding payments according to your country.' },
  { slug: 'currency-converter', icon: 'RefreshCw', name_es: 'Convertidor de Divisas', name_en: 'Currency Converter', description_es: 'Precios actualizados para negocios internacionales.', description_en: 'Updated prices for international business.' },
  { slug: 'opex-manager', icon: 'Briefcase', name_es: 'Gestor de Gastos Operativos', name_en: 'OpEx Manager', description_es: 'Registra arriendos, servicios y suscripciones de software.', description_en: 'Record rent, services, and software subscriptions.' },
  { slug: 'gross-margin-calc', icon: 'TrendingUp', name_es: 'Calculadora de Margen Bruto', name_en: 'Gross Margin Calculator', description_es: 'Cuánto te queda libre después de los costos directos.', description_en: 'How much you have left after direct costs.' },
  { slug: 'unit-economics-analyzer', icon: 'Activity', name_es: 'Analizador de Unit Economics', name_en: 'Unit Economics Analyzer', description_es: 'Revisa si ganas dinero por cada venta individual.', description_en: 'Check if you make money on each individual sale.' },
  { slug: 'roi-calculator', icon: 'ArrowUpRight', name_es: 'Calculadora de ROI', name_en: 'ROI Calculator', description_es: 'Mide el retorno de inversión de cualquier proyecto.', description_en: 'Measure the return on investment of any project.' },
  { slug: 'cashflow-planner', icon: 'BarChart2', name_es: 'Planificador de Flujo de Caja', name_en: 'Cashflow Planner', description_es: 'Predice cuánto dinero tendrás en el banco en 3 meses.', description_en: 'Predict how much money you will have in the bank in 3 months.' },
  { slug: 'discount-calc', icon: 'Tag', name_es: 'Calculadora de Descuentos', name_en: 'Discount Calculator', description_es: 'Evalúa si una promoción ayuda o destruye tu margen.', description_en: 'Evaluate if a promotion helps or destroys your margin.' }
];

async function run() {
  console.log(`Poblando base de datos con ${apps.length} aplicaciones de Emprendimiento...`);
  
  for (const app of apps) {
    const fullApp = {
      ...app,
      // Usamos un form schema robusto de dos campos para darle contexto al LLM
      form_schema: [
        { name: "project_name", type: "input", label_es: "Nombre de tu Proyecto / Empresa", label_en: "Project / Company Name", required: true },
        { name: "details", type: "textarea", label_es: "Detalles adicionales (datos numéricos, industria, o contexto)", label_en: "Additional details", required: true }
      ],
      autofill_presets: [
        { id: 'example-1', name_es: 'Ejemplo: App de Delivery', name_en: 'Example: Delivery App', values: { project_name: 'FastBite', details: 'Una app de delivery ecológico en bicicletas para restaurantes locales.' } }
      ],
      prompt_template: `GENERAL INSTRUCTIONS: Respond in {{responseLanguage}}. Act as an expert business consultant. 
Task: Run the tool "${app.name_en}" for the project "{{project_name}}".
Context/Details: {{details}}
Tool description: ${app.description_en}
Provide a highly detailed, professional, and structured output (using Markdown) evaluating the inputs based on this tool's purpose.`
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

  console.log('Proceso completado.');
}

run();
