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

  // Fetch specific Trial Apps
  const trialSlugs = ['lean-canvas-gen', 'podcast-script-generator', 'product-margin-calc', 'terms-conditions-gen', 'blog-topic-gen'];
    
  let { data: trialAppsDb } = await supabase
    .from('micro_apps')
    .select('*')
    .in('slug', trialSlugs)
    
  let trialApps = trialAppsDb || [];

  // Fallback just in case they are not in DB yet
  if (trialApps.length === 0) {
    const defaultSchema = [{"name": "input", "type": "textarea", "label_es": "Describe tu necesidad", "required": true}];
    trialApps = [
      { id: 't1', slug: 'lean-canvas-gen', name_es: 'Lean Canvas', description_es: 'Genera tu modelo de negocio.', icon: 'Briefcase', category: 'Negocios', form_schema: defaultSchema },
      { id: 't2', slug: 'podcast-script-generator', name_es: 'Guiones de Podcast', description_es: 'Estructura tus episodios.', icon: 'Mic', category: 'Contenido', form_schema: defaultSchema },
      { id: 't3', slug: 'product-margin-calc', name_es: 'Margen de Producto', description_es: 'Calculadora de costos y ventas.', icon: 'DollarSign', category: 'Finanzas', form_schema: defaultSchema },
      { id: 't4', slug: 'terms-conditions-gen', name_es: 'Términos y Condiciones', description_es: 'Textos legales para tu web.', icon: 'FileText', category: 'Legal', form_schema: defaultSchema },
      { id: 't5', slug: 'blog-topic-gen', name_es: 'Temas de Blog', description_es: 'Ideas de artículos.', icon: 'MessageCircle', category: 'Marketing', form_schema: defaultSchema }
    ] as any;
  }

  // Hardcode 3 apps generales para el Arsenal
  const arsenalApps = [
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

  // Obtener planes activos de la DB
  let { data: dbPlans } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  // Planes reales de Arquitectura Digital
  const localPlans = [
    {
      slug: 'esencial',
      name_en: 'Essential Structuring',
      name_es: 'Estructuración Esencial',
      description_en: 'Full project structuring with 3 months of grant search.',
      description_es: 'Estructuración completa de tu proyecto con 3 meses de búsqueda de convocatorias.',
      price_monthly: 12000000,
      items_en: [
        'Free Diagnosis Included',
        'Full Formulation Process (32 Steps)',
        '3 Months of Grant & Funding Search',
        'Terms of Reference Matching',
        '+3 Extra Months if Nothing is Won'
      ],
      items_es: [
        'Diagnóstico Gratuito Incluido',
        'Formulación Completa (32 Pasos)',
        '3 Meses de Búsqueda de Convocatorias',
        'Encaje con Términos de Referencia',
        '+3 Meses de Cortesía si no se Gana Nada'
      ]
    },
    {
      slug: 'completo',
      name_en: 'Complete Structuring',
      name_es: 'Estructuración Completa',
      description_en: 'Our most complete plan: 6 months of grant search and priority matching.',
      description_es: 'Nuestro plan más completo: 6 meses de búsqueda de convocatorias y encaje prioritario.',
      price_monthly: 17000000,
      featured: true,
      items_en: [
        'Free Diagnosis Included',
        'Full Formulation Process (32 Steps)',
        '6 Months of Grant & Funding Search',
        'Terms of Reference Matching',
        '+6 Extra Months if Nothing is Won',
        'Priority Support'
      ],
      items_es: [
        'Diagnóstico Gratuito Incluido',
        'Formulación Completa (32 Pasos)',
        '6 Meses de Búsqueda de Convocatorias',
        'Encaje con Términos de Referencia',
        '+6 Meses de Cortesía si no se Gana Nada',
        'Soporte Prioritario'
      ]
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
