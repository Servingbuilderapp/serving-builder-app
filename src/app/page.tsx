import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { LandingClient } from '@/components/landing/LandingClient'

import { headers } from 'next/headers'

export const dynamic = 'force-dynamic'

export default async function LandingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const headersList = await headers()
  const host = headersList.get('host') || ''
  const isEcoServing = false

  // Helper para organizar por temas si la DB no tiene el campo category
  const getAppCategory = (app: any) => {
    if (app.category) return app.category;
    const name = (app.name_es || app.name_en || '').toLowerCase();
    if (name.includes('video') || name.includes('guion') || name.includes('podcast')) return 'Medios & Contenido';
    if (name.includes('instagram') || name.includes('social') || name.includes('ninja') || name.includes('viral')) return 'Marketing & Social';
    if (name.includes('seo') || name.includes('web') || name.includes('optimiza')) return 'SEO & Web';
    if (name.includes('escritor') || name.includes('artículo') || name.includes('pro') || name.includes('texto')) return 'Reportes & Textos';
    return 'Productividad General';
  };
  
  // Fetch apps for showcase
  let { data: allApps } = await supabase
    .from('micro_apps')
    .select('*')
    .limit(20)

  // Fallback si la DB de apps está vacía o falla
  if (!allApps || allApps.length === 0) {
    allApps = [
      { id: '1', slug: 'buyer-persona-builder', name_es: 'Buyer Persona', description_es: 'Define tu cliente ideal.', icon: 'Users', category: 'Marketing' },
      { id: '2', slug: 'ad-copy-generator', name_es: 'Generador de Ads', description_es: 'Copys persuasivos.', icon: 'Type', category: 'Publicidad' },
      { id: '3', slug: 'roi-calculator', name_es: 'Calculadora ROI', description_es: 'Calcula tu retorno.', icon: 'TrendingUp', category: 'Finanzas' },
    ] as any;
  }

  // 1. Fetch specific Trial Apps requested by user
  const trialSlugs = isEcoServing 
    ? ['hogar-sano', 'corp-eco-manager', 'comunidad-circular', 'eco-campus', 'gov-impact-mon']
    : ['lean-canvas-gen', 'podcast-script-generator', 'product-margin-calc', 'terms-conditions-gen', 'blog-topic-gen'];
    
  let { data: trialAppsDb } = await supabase
    .from('micro_apps')
    .select('*')
    .in('slug', trialSlugs)
    
  let trialApps = trialAppsDb || [];

  // Fallback just in case they are not in DB yet
  if (trialApps.length === 0) {
    const defaultSchema = [{"name": "input", "type": "textarea", "label_es": "Describe tu necesidad", "required": true}];
    trialApps = isEcoServing ? [
      { id: 't1', slug: 'hogar-sano', name_es: 'Gestión de Residuos en el Hogar', description_es: 'Plan práctico para reciclar y reducir desechos en casa.', icon: 'Home', category: 'Residuos', form_schema: defaultSchema },
      { id: 't2', slug: 'corp-eco-manager', name_es: 'Gestión de Residuos en la Empresa', description_es: 'Estrategias corporativas de cero residuos.', icon: 'Briefcase', category: 'Residuos', form_schema: defaultSchema },
      { id: 't3', slug: 'comunidad-circular', name_es: 'Gestión de Residuos en la Comunidad', description_es: 'Organización vecinal para el manejo de basura.', icon: 'Users', category: 'Residuos', form_schema: defaultSchema },
      { id: 't4', slug: 'eco-campus', name_es: 'Gestión de Residuos en Colegios', description_es: 'Programas educativos y reciclaje en campus.', icon: 'GraduationCap', category: 'Residuos', form_schema: defaultSchema },
      { id: 't5', slug: 'gov-impact-mon', name_es: 'Gestión de Residuos para Gobierno', description_es: 'Políticas públicas y manejo municipal.', icon: 'Landmark', category: 'Residuos', form_schema: defaultSchema }
    ] : [
      { id: 't1', slug: 'lean-canvas-gen', name_es: 'Lean Canvas', description_es: 'Genera tu modelo de negocio.', icon: 'Briefcase', category: 'Negocios', form_schema: defaultSchema },
      { id: 't2', slug: 'podcast-script-generator', name_es: 'Guiones de Podcast', description_es: 'Estructura tus episodios.', icon: 'Mic', category: 'Contenido', form_schema: defaultSchema },
      { id: 't3', slug: 'product-margin-calc', name_es: 'Margen de Producto', description_es: 'Calculadora de costos y ventas.', icon: 'DollarSign', category: 'Finanzas', form_schema: defaultSchema },
      { id: 't4', slug: 'terms-conditions-gen', name_es: 'Términos y Condiciones', description_es: 'Textos legales para tu web.', icon: 'FileText', category: 'Legal', form_schema: defaultSchema },
      { id: 't5', slug: 'blog-topic-gen', name_es: 'Temas de Blog', description_es: 'Ideas de artículos.', icon: 'MessageCircle', category: 'Marketing', form_schema: defaultSchema }
    ] as any;
  }

  // 2. Hardcode 3 general, easy-to-understand apps for Arsenal
  const arsenalApps = isEcoServing ? [
    { id: 'a1', slug: 'carbon-footprint', name_es: 'Calculadora Huella Carbono', description_es: 'Mide y compensa emisiones de forma sencilla.', icon: 'Calculator', category: 'Herramientas' },
    { id: 'a2', slug: 'eco-newsletter', name_es: 'Generador Eco-Newsletter', description_es: 'Noticias climáticas listas para enviar a tu audiencia.', icon: 'Mail', category: 'Productividad' },
    { id: 'a3', slug: 'green-grants', name_es: 'Buscador de Subvenciones', description_es: 'Encuentra fondos verdes disponibles para tus proyectos.', icon: 'Search', category: 'Proyectos' }
  ] : [
    { id: 'a1', slug: 'buyer-persona-builder', name_es: 'Buyer Persona', description_es: 'Define tu cliente ideal.', icon: 'Users', category: 'Marketing' },
    { id: 'a2', slug: 'ad-copy-generator', name_es: 'Generador de Ads', description_es: 'Copys persuasivos.', icon: 'Type', category: 'Publicidad' },
    { id: 'a3', slug: 'roi-calculator', name_es: 'Calculadora ROI', description_es: 'Calcula tu retorno.', icon: 'TrendingUp', category: 'Finanzas' }
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
      slug: 'explorador', name_en: 'Explorer', name_es: 'Explorador', 
      description_en: 'Test our interface with limited access.', 
      description_es: 'Acceso limitado para conocer la interfaz.', 
      price_monthly: 0.00, 
      items_en: ['3 Demo Apps (1 Tool, 1 Productivity, 1 Project)', 'Community Support', 'Limited Access (No AI)'], 
      items_es: ['3 Apps Demo (1 Herramienta, 1 Productividad, 1 Proyecto)', 'Soporte vía Comunidad', 'Acceso Limitado (Sin IA)'] 
    },
    { 
      slug: 'basic', name_en: 'Entrepreneur', name_es: 'Emprendedor', 
      description_en: 'Start your journey with essential productivity tools.', 
      description_es: 'Inicia tu camino con herramientas esenciales de productividad.', 
      price_monthly: 29.00, 
      items_en: ['Productivity Tools Unlocked', '7 Specialized Miniapps', 'No Watermarks', 'Fast Generation Queue', 'Email Support', 'Commercial License'], 
      items_es: ['Herramientas de Productividad Desbloqueadas', '7 Miniapps Especializadas', 'Sin Marcas de Agua', 'Cola de Generación Rápida', 'Soporte por Email', 'Licencia Comercial'] 
    },
    { 
      slug: 'growth', name_en: 'Growth', name_es: 'Crecimiento', 
      description_en: 'Scale with project management and advanced vertical tools.', 
      description_es: 'Escala con gestión de proyectos y herramientas verticales avanzadas.', 
      price_monthly: 49.00, 
      items_en: ['Project Tools Unlocked', '15 Advanced Miniapps', 'Custom Domain Integration', 'Advanced Analytics', 'SEO Optimization', 'Priority Generation'], 
      items_es: ['Herramientas de Proyectos Desbloqueadas', '15 Miniapps Avanzadas', 'Integración de Dominio Propio', 'Analíticas Avanzadas', 'Optimización SEO', 'Generación Prioritaria'] 
    },
    { 
      slug: 'professional', name_en: 'Professional', name_es: 'Profesional', 
      description_en: 'Full suite for professional creators and agencies.', 
      description_es: 'Suite completa para creadores profesionales y agencias.', 
      price_monthly: 97.00, 
      items_en: ['Vertical Tools Fully Unlocked', '30+ Premium Miniapps', 'Full White-Label Capabilities', 'Team Management', '24/7 VIP Support', 'Extended Commercial Rights'], 
      items_es: ['Herramientas Verticales Desbloqueadas', 'Más de 30 Miniapps Premium', 'Marca Blanca Total', 'Gestión de Equipo', 'Soporte VIP 24/7', 'Derechos Comerciales Extendidos'] 
    },
    { 
      slug: 'elite', name_en: 'Elite', name_es: 'Elite', 
      description_en: 'The premium experience with AI Idea Generation.', 
      description_es: 'La experiencia premium con Generador de Ideas de IA.', 
      price_monthly: 197.00, 
      items_en: ['All Tools at Maximum Capacity', 'AI Idea Generator (10 queries/mo)', 'Private Beta Access', 'Monthly Growth Strategy', 'Dedicated Success Manager', 'Custom Development Requests'], 
      items_es: ['Todas las Herramientas al Máximo', 'Generador de Ideas IA (10 consultas/mes)', 'Acceso a Betas Privadas', 'Estrategia de Crecimiento Mensual', 'Gestor de Éxito Dedicado', 'Peticiones de Desarrollo a Medida'] 
    },
    { 
      slug: 'master', name_en: 'Business Master', name_es: 'Master Empresarial', 
      description_en: 'The ultimate business powerhouse. Everything unlimited.', 
      description_es: 'La potencia empresarial definitiva. Todo ilimitado.', 
      price_monthly: 497.00, 
      items_en: ['Everything Unlimited', 'UNLIMITED AI Idea Generator', '10 Custom Apps per Month', 'Full White-Label Deployment', 'Direct Access to Roadmap', 'Priority Engineering Support'], 
      items_es: ['Todo Ilimitado', 'Generador de Ideas IA ILIMITADO', '10 Apps Personalizadas al Mes', 'Despliegue de Marca Blanca Total', 'Acceso Directo al Roadmap', 'Soporte de Ingeniería Prioritario'] 
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
      isEcoServing={isEcoServing}
    />
  )
}
