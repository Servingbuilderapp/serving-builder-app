import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { LandingClient } from '@/components/landing/LandingClient'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Helper para organizar por temas si la DB no tiene el campo category
  const getAppCategory = (app: any) => {
    if (app.category) return app.category;
    const name = (app.name_es || app.name_en || '').toLowerCase();
    if (name.includes('video') || name.includes('guion') || name.includes('podcast')) return 'Medios & Eco-Conciencia';
    if (name.includes('instagram') || name.includes('social') || name.includes('ninja') || name.includes('viral')) return 'Comunidad Verde';
    if (name.includes('seo') || name.includes('web') || name.includes('optimiza')) return 'SEO Sostenible';
    if (name.includes('escritor') || name.includes('artículo') || name.includes('pro') || name.includes('texto')) return 'Reportes & Análisis';
    return 'Impacto General';
  };
  
  // Fetch apps for showcase
  let { data: allApps } = await supabase
    .from('micro_apps')
    .select('*')
    .limit(20)

  // Fallback si la DB de apps está vacía o falla
  if (!allApps || allApps.length === 0) {
    allApps = [
      { id: '1', slug: 'carbon-footprint', name_es: 'Calculadora Huella Carbono', description_es: 'Mide y compensa emisiones.', icon: 'Calculator', category: 'Herramientas' },
      { id: '2', slug: 'green-grants', name_es: 'Buscador de Subvenciones', description_es: 'Encuentra fondos verdes disponibles.', icon: 'Search', category: 'Proyectos' },
      { id: '3', slug: 'eco-newsletter', name_es: 'Generador Eco-Newsletter', description_es: 'Noticias climáticas listas para enviar.', icon: 'Mail', category: 'Productividad' },
      { id: '4', slug: 'solar-roi', name_es: 'Calculadora ROI Solar', description_es: 'Calcula retorno de paneles solares.', icon: 'Sun', category: 'Herramientas' },
      { id: '5', slug: 'climate-simulator', name_es: 'Simulador Climático', description_es: 'Visualiza impactos a largo plazo.', icon: 'Globe', category: 'Educación' },
      { id: '6', slug: 'sustainability-kpis', name_es: 'Dashboard de KPIs', description_es: 'Métricas de sostenibilidad para empresas.', icon: 'PieChart', category: 'Productividad' },
    ] as any;
  }

  // 1. Fetch specific Trial Apps requested by user
  const trialSlugs = ['hogar-sano', 'corp-eco-manager', 'comunidad-circular', 'eco-campus', 'gov-impact-mon'];
  let { data: trialAppsDb } = await supabase
    .from('micro_apps')
    .select('*')
    .in('slug', trialSlugs)
    
  let trialApps = trialAppsDb || [];

  // Fallback just in case they are not in DB yet
  if (trialApps.length === 0) {
    const defaultSchema = [{"name": "input", "type": "textarea", "label_es": "Describe tu necesidad", "required": true}];
    trialApps = [
      { id: 't1', slug: 'hogar-sano', name_es: 'Gestión de Residuos en el Hogar', description_es: 'Plan práctico para reciclar y reducir desechos en casa.', icon: 'Home', category: 'Residuos', form_schema: defaultSchema },
      { id: 't2', slug: 'corp-eco-manager', name_es: 'Gestión de Residuos en la Empresa', description_es: 'Estrategias corporativas de cero residuos.', icon: 'Briefcase', category: 'Residuos', form_schema: defaultSchema },
      { id: 't3', slug: 'comunidad-circular', name_es: 'Gestión de Residuos en la Comunidad', description_es: 'Organización vecinal para el manejo de basura.', icon: 'Users', category: 'Residuos', form_schema: defaultSchema },
      { id: 't4', slug: 'eco-campus', name_es: 'Gestión de Residuos en Colegios', description_es: 'Programas educativos y reciclaje en campus.', icon: 'GraduationCap', category: 'Residuos', form_schema: defaultSchema },
      { id: 't5', slug: 'gov-impact-mon', name_es: 'Gestión de Residuos para Gobierno', description_es: 'Políticas públicas y manejo municipal.', icon: 'Landmark', category: 'Residuos', form_schema: defaultSchema }
    ] as any;
  }

  // 2. Hardcode 3 general, easy-to-understand apps for Arsenal
  const arsenalApps = [
    { id: 'a1', slug: 'carbon-footprint', name_es: 'Calculadora Huella Carbono', description_es: 'Mide y compensa emisiones de forma sencilla.', icon: 'Calculator', category: 'Herramientas' },
    { id: 'a2', slug: 'eco-newsletter', name_es: 'Generador Eco-Newsletter', description_es: 'Noticias climáticas listas para enviar a tu audiencia.', icon: 'Mail', category: 'Productividad' },
    { id: 'a3', slug: 'green-grants', name_es: 'Buscador de Subvenciones', description_es: 'Encuentra fondos verdes disponibles para tus proyectos.', icon: 'Search', category: 'Proyectos' }
  ]

  // Group arsenal by category
  const arsenalCategories = arsenalApps.reduce((acc: Record<string, any[]>, app) => {
    const cat = getAppCategory(app)
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(app)
    return acc
  }, {})

  // 2. Obtener planes activos de la DB
  let { data: dbPlans } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Definición de contenido local (Source of Truth para presentación)
  const localPlans = [
    { 
      slug: 'basic', name_en: 'Eco Seed', name_es: 'Semilla Eco', 
      description_en: 'Test our interface with limited access.', 
      description_es: 'Acceso básico para probar 5 herramientas fundamentales.', 
      price_monthly: 0.00, 
      items_en: ['5 Pre-assigned Master Apps', 'Basic AI Generation', 'Limited Access'], 
      items_es: ['5 Apps Maestras Pre-asignadas', 'Familia, Empresas, Comunidad, Colegios, Gobierno', 'Generación Básica con IA'] 
    },
    { 
      slug: 'growth-29', name_en: 'Green Sprout', name_es: 'Brote Verde', 
      description_en: 'Start your environmental impact with essential tools.', 
      description_es: 'Inicia tu impacto con 15 herramientas ambientales.', 
      price_monthly: 29.00, 
      items_en: ['Everything in Free, PLUS:', '15 Apps in Total', 'Advanced Export Options', 'Standard Priority Support'], 
      items_es: ['Todo lo del plan Gratuito, MÁS:', '15 Herramientas a tu elección', 'Exportación Avanzada (PDF/Word)', 'Soporte Estándar Prioritario'] 
    },
    { 
      slug: 'growth-49', name_en: 'Eco Catalyst', name_es: 'Catalizador Eco', 
      description_en: 'Scale your projects with advanced tools.', 
      description_es: 'Escala tus iniciativas con 30 herramientas avanzadas.', 
      price_monthly: 49.00, 
      items_en: ['Everything in Green Sprout, PLUS:', '30 Apps in Total', 'Ultra-fast Generation Speed', 'Priority Support'], 
      items_es: ['Todo lo del plan anterior, MÁS:', '30 Herramientas Avanzadas a tu elección', 'Velocidad de Generación Ultra-rápida', 'Soporte Prioritario'] 
    },
    { 
      slug: 'growth-97', name_en: 'Sustainable Leader', name_es: 'Líder Sostenible', 
      description_en: 'Full access to 70 apps.', 
      description_es: 'Acceso total a 70 apps de impacto ambiental.', 
      price_monthly: 97.00, 
      items_en: ['Everything in Eco Catalyst, PLUS:', '70 Apps in Total', 'Includes 15 Project Funding Apps', 'VIP Support'], 
      items_es: ['Todo lo del plan anterior, MÁS:', '70 Herramientas Desbloqueadas', 'Incluye 15 Apps de Financiamiento y Subvenciones', 'Soporte VIP'] 
    },
    { 
      slug: 'elite', name_en: 'Impact Elite', name_es: 'Élite de Impacto', 
      description_en: 'The premium experience with unlimited AI Generation.', 
      description_es: 'La experiencia premium para agencias u ONGs.', 
      price_monthly: 197.00, 
      items_en: ['Everything in Sustainable Leader, PLUS:', '80 Apps in Total', 'Unlimited Strategy Generator', 'Dedicated VIP Support', 'Custom Development Requests'], 
      items_es: ['Todo lo del plan anterior, MÁS:', '80 Herramientas a tu elección', 'Generador de Estrategias y Proyectos IA ILIMITADO', 'Marca Blanca Total (Añade tu Logo)', 'Soporte VIP Dedicado', 'Prioridad en Peticiones de Desarrollo a Medida'] 
    },
    { 
      slug: 'master', name_en: 'Global Vision', name_es: 'Visión Global', 
      description_en: 'The ultimate powerhouse. Everything unlimited plus custom apps.', 
      description_es: 'Potencia empresarial. Apps a medida para tu gobierno o multinacional.', 
      price_monthly: 497.00, 
      items_en: ['Everything in Impact Elite, PLUS:', '120 Apps (Total Unlimited Access)', 'We build 3 Custom Apps / Month', 'Full White-Label Portal Deployment', 'Exclusive Server', 'Enterprise Support'], 
      items_es: ['Todo lo del plan Elite, MÁS:', '120 Herramientas (Acceso Total a TODA la Suite)', 'Construimos 3 Apps 100% Personalizadas / Mes', 'Despliegue Completo de Portal Marca Blanca Propio', 'Alojamiento en Servidor Privado Exclusivo', 'Soporte Técnico Empresarial'] 
    }
  ];

  const syncPlans = localPlans.map(lp => {
    const dbPlan = dbPlans?.find(dbp => dbp.slug === lp.slug);
    return {
      ...lp,
      id: dbPlan?.id || `temp-${lp.slug}`,
      plan_apps: []
    };
  });

  return (
    <LandingClient 
      user={user}
      trialApps={trialApps}
      arsenalCategories={arsenalCategories}
      syncPlans={syncPlans}
    />
  )
}
