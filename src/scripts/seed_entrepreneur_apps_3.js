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
  // Módulo 5: Publicidad Digital y Ads (10)
  { slug: 'ad-copy-generator', icon: 'Edit', name_es: 'Generador de Copy para Ads', name_en: 'Ad Copy Generator', description_es: 'Crea textos persuasivos para Meta y Google Ads.', description_en: 'Create persuasive texts for Meta and Google Ads.' },
  { slug: 'roas-calculator', icon: 'DollarSign', name_es: 'Calculadora de ROAS', name_en: 'ROAS Calculator', description_es: 'Mide el éxito de tu inversión publicitaria.', description_en: 'Measure the success of your advertising investment.' },
  { slug: 'ads-budget-estimator', icon: 'PieChart', name_es: 'Estimador de Presupuesto Ads', name_en: 'Ads Budget Estimator', description_es: 'Cuánto debes invertir para lograr X ventas.', description_en: 'How much you should invest to achieve X sales.' },
  { slug: 'ab-test-calculator', icon: 'Split', name_es: 'A/B Test Calculator', name_en: 'A/B Test Calculator', description_es: 'Determina qué versión de un anuncio funcionó mejor.', description_en: 'Determine which version of an ad worked best.' },
  { slug: 'lookalike-audience-gen', icon: 'Users', name_es: 'Generador de Públicos Similares', name_en: 'Lookalike Audience Gen', description_es: 'Guía para crear audiencias en Business Manager.', description_en: 'Guide to creating audiences in Business Manager.' },
  { slug: 'cpc-cpm-calculator', icon: 'Calculator', name_es: 'Calculadora de CPC y CPM', name_en: 'CPC & CPM Calculator', description_es: 'Costo por clic y por cada mil impresiones.', description_en: 'Cost per click and per thousand impressions.' },
  { slug: 'landing-page-analyzer', icon: 'Layout', name_es: 'Analizador de Landing Pages', name_en: 'Landing Page Analyzer', description_es: 'Checklist de conversión para tus páginas de venta.', description_en: 'Conversion checklist for your sales pages.' },
  { slug: 'video-ad-script-gen', icon: 'Video', name_es: 'Generador de Guiones de Video Ads', name_en: 'Video Ad Script Generator', description_es: 'Estructura de 15 segundos para anuncios.', description_en: '15-second structure for ads.' },
  { slug: 'pixel-tracker', icon: 'Target', name_es: 'Rastreador de Píxeles', name_en: 'Pixel Tracker', description_es: 'Verifica si tus códigos de seguimiento están activos.', description_en: 'Verify if your tracking codes are active.' },
  { slug: 'ctr-estimator', icon: 'MousePointer', name_es: 'Estimador de Tasa de Clics (CTR)', name_en: 'CTR Estimator', description_es: 'Compara tus anuncios con el promedio de la industria.', description_en: 'Compare your ads with the industry average.' },

  // Módulo 6: Ventas y CRM (10)
  { slug: 'mini-crm-leads', icon: 'Users', name_es: 'Mini CRM de Leads', name_en: 'Mini Leads CRM', description_es: 'Gestiona el estado de tus prospectos (Frío, Tibio, Caliente).', description_en: 'Manage the status of your prospects.' },
  { slug: 'sales-script-generator', icon: 'PhoneCall', name_es: 'Generador de Guiones de Venta', name_en: 'Sales Script Generator', description_es: 'Plantillas para llamadas y cierres por chat.', description_en: 'Templates for calls and chat closings.' },
  { slug: 'quote-tracker', icon: 'FileText', name_es: 'Rastreador de Cotizaciones', name_en: 'Quote Tracker', description_es: 'Sigue qué propuestas han sido abiertas o aceptadas.', description_en: 'Track which proposals have been opened or accepted.' },
  { slug: 'commission-calculator', icon: 'Percent', name_es: 'Calculadora de Comisiones', name_en: 'Commission Calculator', description_es: 'Calcula cuánto pagar a tus vendedores por metas.', description_en: 'Calculate how much to pay your salespeople for goals.' },
  { slug: 'dynamic-qr-generator', icon: 'Maximize', name_es: 'Generador de QR Dinámicos', name_en: 'Dynamic QR Generator', description_es: 'Crea códigos para pagos, menús o contacto.', description_en: 'Create codes for payments, menus or contact.' },
  { slug: 'visual-pipeline', icon: 'Trello', name_es: 'Pipeline Visual', name_en: 'Visual Pipeline', description_es: 'Arrastra tus negocios por diferentes etapas de cierre.', description_en: 'Drag your deals through different closing stages.' },
  { slug: 'followup-scheduler', icon: 'Calendar', name_es: 'Programador de Seguimientos', name_en: 'Follow-up Scheduler', description_es: 'Alarmas para no olvidar volver a llamar a un cliente.', description_en: 'Alarms so you do not forget to call a customer back.' },
  { slug: 'churn-analyzer', icon: 'UserMinus', name_es: 'Analizador de Churn', name_en: 'Churn Analyzer', description_es: 'Mide cuántos clientes pierdes cada mes.', description_en: 'Measure how many customers you lose each month.' },
  { slug: 'coupon-generator', icon: 'Tag', name_es: 'Generador de Cupones', name_en: 'Coupon Generator', description_es: 'Crea códigos de descuento únicos para campañas.', description_en: 'Create unique discount codes for campaigns.' },
  { slug: 'conversion-rate-calc', icon: 'TrendingUp', name_es: 'Calculadora de Tasa de Conversión', name_en: 'Conversion Rate Calc', description_es: 'Porcentaje de visitas que compran.', description_en: 'Percentage of visits that buy.' },

  // Módulo 7: Operaciones y Producto (10)
  { slug: 'simple-kanban-board', icon: 'Columns', name_es: 'Tablero Kanban Simple', name_en: 'Simple Kanban Board', description_es: 'Gestiona tareas pendientes, en proceso y terminadas.', description_en: 'Manage pending, in-progress, and finished tasks.' },
  { slug: 'time-tracker', icon: 'Clock', name_es: 'Rastreador de Tiempo', name_en: 'Time Tracker', description_es: 'Mide cuánto tiempo inviertes en cada tarea del negocio.', description_en: 'Measure how much time you invest in each business task.' },
  { slug: 'inventory-manager', icon: 'Box', name_es: 'Gestor de Inventario', name_en: 'Inventory Manager', description_es: 'Control básico de stock para productos físicos.', description_en: 'Basic stock control for physical products.' },
  { slug: 'minutes-organizer', icon: 'FileText', name_es: 'Organizador de Actas', name_en: 'Minutes Organizer', description_es: 'Toma notas de reuniones y asigna responsables.', description_en: 'Take meeting notes and assign responsibilities.' },
  { slug: 'shipping-cost-calc', icon: 'Truck', name_es: 'Calculadora de Costos de Envío', name_en: 'Shipping Cost Calc', description_es: 'Estima fletes según peso y destino.', description_en: 'Estimate freight according to weight and destination.' },
  { slug: 'sku-generator', icon: 'Hash', name_es: 'Generador de SKU', name_en: 'SKU Generator', description_es: 'Crea códigos únicos para organizar tus productos.', description_en: 'Create unique codes to organize your products.' },
  { slug: 'shipment-tracker', icon: 'MapPin', name_es: 'Rastreador de Envíos', name_en: 'Shipment Tracker', description_es: 'Consulta paquetes en múltiples transportadoras.', description_en: 'Check packages with multiple carriers.' },
  { slug: 'supplier-manager', icon: 'Briefcase', name_es: 'Gestor de Proveedores', name_en: 'Supplier Manager', description_es: 'Directorio con contactos y tiempos de entrega.', description_en: 'Directory with contacts and delivery times.' },
  { slug: 'route-optimizer', icon: 'Map', name_es: 'Optimizador de Rutas', name_en: 'Route Optimizer', description_es: 'Planea entregas para ahorrar gasolina y tiempo.', description_en: 'Plan deliveries to save gas and time.' },
  { slug: 'quality-checklist', icon: 'CheckSquare', name_es: 'Checklist de Calidad', name_en: 'Quality Checklist', description_es: 'Pasos obligatorios antes de entregar un pedido.', description_en: 'Mandatory steps before delivering an order.' }
];

async function run() {
  console.log(`Poblando base de datos con ${apps.length} aplicaciones de Emprendimiento (Batch 3)...`);
  
  for (const app of apps) {
    const fullApp = {
      ...app,
      form_schema: [
        { name: "project_name", type: "input", label_es: "Nombre de tu Proyecto / Campaña", label_en: "Project / Campaign Name", required: true },
        { name: "details", type: "textarea", label_es: "Detalles o métricas (ej: Inversión, Clics, Cierres, etc.)", label_en: "Details or metrics (e.g., Investment, Clicks, Deals)", required: true }
      ],
      autofill_presets: [
        { id: 'example-1', name_es: 'Ejemplo: Campaña de Zapatos', name_en: 'Example: Shoe Campaign', values: { project_name: 'Zapatos Deportivos XYZ', details: 'Inversión: $500, Ventas logradas: $2000, Público objetivo: Jóvenes 18-25.' } }
      ],
      prompt_template: `GENERAL INSTRUCTIONS: Respond in {{responseLanguage}}. Act as an expert Operations, Sales, and Ads consultant. 
Task: Run the tool "${app.name_en}" for the project/campaign "{{project_name}}".
Context/Details: {{details}}
Tool description: ${app.description_en}
Provide a highly detailed, professional, and structured output (using Markdown) evaluating the inputs based on this tool's purpose. Ensure all calculations and strategic advice are highly accurate.`
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

  console.log('Proceso Batch 3 completado.');
}

run();
