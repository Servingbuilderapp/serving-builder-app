interface PlanAppRow {
  micro_apps: { slug: string } | null;
}

export async function getUserAccessibleApps(userId: string, email?: string): Promise<string[]> {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  // 1. Obtener el perfil del usuario (plan y rol)
  // Fallback inmediato para el admin principal
  const ADMIN_EMAIL = 'servingbuilderapp@gmail.com';
  
  const { data: userProfile, error: profileError } = await supabase
    .from('users')
    .select('plan_id, role, email, plans(app_limit)')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Error fetching user profile in access.ts:', profileError);
  }

  // Si es admin (por rol o por email reservado), tiene acceso a TODO
  const isAdmin = userProfile?.role === 'admin' || 
                  userProfile?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() || 
                  email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const appLimit = userProfile?.plans?.app_limit || 0;
  const hasUnlimitedAccess = appLimit >= 100; // Elite (100) or Master (999) get all apps unlocked

  if (isAdmin || hasUnlimitedAccess) {
    const { data: allApps } = await supabase
      .from('micro_apps')
      .select('slug')
      .eq('is_active', true);
    
    // Si hay apps en la DB, las devolvemos todas
    if (allApps && allApps.length > 0) {
      return allApps.map(a => a.slug);
    }
    
    // Si no hay apps en la DB, el admin debe seguir teniendo acceso a los slugs de demo
    return [
      'escritor-pro', 'vision-art', 'video-gen', 'seo-boost', 
      'social-ninja', 'code-wizard', 'image-upscaler', 'voice-pro'
    ];
  }

  const slugs = new Set<string>();

  // 2. Obtener apps incluidas en su plan (Apps base que vienen fijas)
  if (userProfile?.plan_id) {
    const { data: planApps } = await supabase
      .from('plan_apps')
      .select('micro_apps(slug)')
      .eq('plan_id', userProfile.plan_id);

    (planApps as PlanAppRow[] | null)?.forEach((row: PlanAppRow) => {
      if (row.micro_apps?.slug) slugs.add(row.micro_apps.slug);
    });
  }

  // 3. Obtener apps por excepciones individuales (overrides / a la carta)
  const { data: overrides } = await supabase
    .from('user_app_overrides')
    .select('micro_apps(slug)')
    .eq('user_id', userId);

  (overrides as PlanAppRow[] | null)?.forEach((row: PlanAppRow) => {
    if (row.micro_apps?.slug) slugs.add(row.micro_apps.slug);
  });

  return Array.from(slugs);
}

