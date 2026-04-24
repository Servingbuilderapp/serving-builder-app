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
    if (name.includes('video') || name.includes('guion') || name.includes('podcast')) return 'Video & Audio';
    if (name.includes('instagram') || name.includes('social') || name.includes('ninja') || name.includes('viral')) return 'Redes Sociales';
    if (name.includes('seo') || name.includes('web') || name.includes('optimiza')) return 'SEO & Web';
    if (name.includes('escritor') || name.includes('artículo') || name.includes('pro') || name.includes('texto')) return 'Escritura & Contenido';
    return 'Herramientas Pro';
  };
  
  // Fetch apps for showcase
  let { data: allApps } = await supabase
    .from('micro_apps')
    .select('*')
    .limit(20)

  // Fallback si la DB de apps está vacía o falla
  if (!allApps || allApps.length === 0) {
    allApps = [
      { id: '1', slug: 'escritor-pro', name_es: 'Escritor Maestro IA', description_es: 'Genera contenido persuasivo y artículos de alta calidad en segundos.', icon: 'PenTool', category: 'Contenido' },
      { id: '2', slug: 'vision-art', name_es: 'Visión Artística 3D', description_es: 'Transforma conceptos simples en imágenes fotorrealistas e impactantes.', icon: 'Sparkles', category: 'Imagen & Video' },
      { id: '3', slug: 'video-gen', name_es: 'Generador de Video Pro', description_es: 'Crea clips cinematográficos a partir de texto con inteligencia cinemática.', icon: 'Video', category: 'Imagen & Video' },
      { id: '4', slug: 'seo-boost', name_es: 'Optimizador SEO Elite', description_es: 'Domina los buscadores con análisis profundo de palabras clave.', icon: 'Zap', category: 'Optimización' },
      { id: '5', slug: 'social-ninja', name_es: 'Social Media Ninja', description_es: 'Automatiza tu presencia en redes sociales con contenido viral.', icon: 'Share2', category: 'Contenido' },
      { id: '6', slug: 'code-wizard', name_es: 'Asistente Code Wizard', description_es: 'Desarrolla aplicaciones y resuelve bugs con lógica de nivel experto.', icon: 'LayoutGrid', category: 'Optimización' },
    ] as any;
  }

  const trialApps = allApps?.slice(0, 3) || []
  const arsenalApps = allApps?.slice(3, 12) || []

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
      items_en: ['Productivity Tools Unlocked', '10 A la Carte Miniapps', 'No Watermarks', 'Fast Generation Queue', 'Email Support', 'Commercial License'], 
      items_es: ['Herramientas de Productividad Desbloqueadas', '10 Miniapps a la Carta', 'Sin Marcas de Agua', 'Cola de Generación Rápida', 'Soporte por Email', 'Licencia Comercial'] 
    },
    { 
      slug: 'growth', name_en: 'Growth', name_es: 'Crecimiento', 
      description_en: 'Scale with project management and advanced vertical tools.', 
      description_es: 'Escala con gestión de proyectos y herramientas verticales avanzadas.', 
      price_monthly: 49.00, 
      items_en: ['Project Tools Unlocked', '20 A la Carte Miniapps', 'Custom Domain Integration', 'Advanced Analytics', 'SEO Optimization', 'Priority Generation'], 
      items_es: ['Herramientas de Proyectos Desbloqueadas', '20 Miniapps a la Carta', 'Integración de Dominio Propio', 'Analíticas Avanzadas', 'Optimización SEO', 'Generación Prioritaria'] 
    },
    { 
      slug: 'professional', name_en: 'Professional', name_es: 'Profesional', 
      description_en: 'Full suite for professional creators and agencies.', 
      description_es: 'Suite completa para creadores profesionales y agencias.', 
      price_monthly: 97.00, 
      items_en: ['Vertical Tools Fully Unlocked', '35 A la Carte Miniapps', 'Full White-Label Capabilities', 'Team Management', 'Priority Support', 'Extended Commercial Rights'], 
      items_es: ['Herramientas Verticales Desbloqueadas', '35 Miniapps a la Carta', 'Marca Blanca Total', 'Gestión de Equipo', 'Soporte Prioritario', 'Derechos Comerciales Extendidos'] 
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
      items_en: ['Everything Unlimited', 'UNLIMITED AI Idea Generator', '3 Custom Apps/mo + 30% off extra', 'Full White-Label Deployment', 'Direct Access to Roadmap', 'Priority Engineering Support'], 
      items_es: ['Todo Ilimitado', 'Generador de Ideas IA ILIMITADO', '3 Apps Nuevas/mes + 30% dcto extra', 'Despliegue de Marca Blanca Total', 'Acceso Directo al Roadmap', 'Soporte de Ingeniería Prioritario'] 
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
