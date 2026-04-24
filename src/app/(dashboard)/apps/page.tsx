
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getUserAccessibleApps } from '@/lib/access'
import { AppsGrid } from '@/components/apps/AppsGrid'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function AppsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // 1. Obtener apps accesibles
  const accessibleSlugs = await getUserAccessibleApps(user.id, user.email)
  const ADMIN_EMAIL = 'servingbuilderapp@gmail.com';

  // Fetch app limit and overrides count
  const { data: userData } = await supabase
    .from('users')
    .select('plans(app_limit)')
    .eq('id', user.id)
    .single()

  const { count: overridesCount } = await supabase
    .from('user_app_overrides')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const appLimit = userData?.plans?.app_limit || 0;
  const usedCredits = overridesCount || 0;

  // 2. Obtener TODAS las apps de la DB
  let { data: apps } = await supabase
    .from('micro_apps')
    .select('*')
    .order('created_at', { ascending: true })

  // Para el Admin, siempre mostramos los motores de demo si hay pocos o ninguno en la DB
  if (user.email === ADMIN_EMAIL) {
    const demoApps = [
      { id: 'd1', slug: 'escritor-pro', name_es: 'Escritor Maestro IA', description_es: 'Genera contenido persuasivo y artículos de alta calidad en segundos.', icon: 'PenTool', category: 'Contenido' },
      { id: 'd2', slug: 'vision-art', name_es: 'Visión Artística 3D', description_es: 'Transforma conceptos simples en imágenes fotorrealistas e impactantes.', icon: 'Sparkles', category: 'Imagen & Video' },
      { id: 'd3', slug: 'video-gen', name_es: 'Generador de Video Pro', description_es: 'Crea clips cinematográficos a partir de texto con inteligencia cinemática.', icon: 'Video', category: 'Imagen & Video' },
      { id: 'd4', slug: 'seo-boost', name_es: 'Optimizador SEO Elite', description_es: 'Domina los buscadores con análisis profundo de palabras clave.', icon: 'Zap', category: 'Optimización' },
      { id: 'd5', slug: 'social-ninja', name_es: 'Social Media Ninja', description_es: 'Automatiza tu presencia en redes sociales con contenido viral.', icon: 'Share2', category: 'Contenido' },
      { id: 'd6', slug: 'code-wizard', name_es: 'Asistente Code Wizard', description_es: 'Desarrolla aplicaciones y resuelve bugs con lógica de nivel experto.', icon: 'LayoutGrid', category: 'Optimización' },
    ] as any[];

    // Combinar con los de la DB, evitando duplicados por slug
    const existingSlugs = new Set((apps || []).map(a => a.slug));
    const mergedApps = [...(apps || [])];
    
    demoApps.forEach(da => {
      if (!existingSlugs.has(da.slug)) {
        mergedApps.push(da);
        if (!accessibleSlugs.includes(da.slug)) accessibleSlugs.push(da.slug);
      }
    });
    
    apps = mergedApps;

    // Asegurar que el admin tiene acceso a TODO lo que ve en la lista
    apps.forEach(a => {
      if (!accessibleSlugs.includes(a.slug)) accessibleSlugs.push(a.slug);
    });
  }

  return (
    <div className="max-w-7xl mx-auto w-full space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white tracking-tight">
          Mis Aplicaciones
        </h1>
        <p className="text-white/40">
          Explora las herramientas de IA disponibles en tu plan
        </p>
      </div>

      <AppsGrid 
        apps={apps || []} 
        accessibleSlugs={accessibleSlugs} 
        userEmail={user.email}
        appLimit={appLimit}
        usedCredits={usedCredits}
      />
    </div>
  )
}
