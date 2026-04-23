interface PlanAppRow {
  micro_apps: { slug: string } | null;
}

export async function getUserAccessibleApps(userId: string): Promise<string[]> {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  // 1. Obtener el perfil del usuario (plan y rol)
  const { data: userProfile } = await supabase
    .from('users')
    .select('plan_id, role')
    .eq('id', userId)
    .single();

  // Si es admin, tiene acceso a TODO
  if (userProfile?.role === 'admin') {
    const { data: allApps } = await supabase
      .from('micro_apps')
      .select('slug')
      .eq('is_active', true);
    
    return (allApps || []).map(a => a.slug);
  }

  const slugs = new Set<string>();

  // 2. Obtener apps incluidas en su plan
  if (userProfile?.plan_id) {
    const { data: planApps } = await supabase
      .from('plan_apps')
      .select('micro_apps(slug)')
      .eq('plan_id', userProfile.plan_id);

    (planApps as PlanAppRow[] | null)?.forEach((row: PlanAppRow) => {
      if (row.micro_apps?.slug) slugs.add(row.micro_apps.slug);
    });
  }

  // 3. Obtener apps por excepciones individuales (overrides)
  const { data: overrides } = await supabase
    .from('user_app_overrides')
    .select('micro_apps(slug)')
    .eq('user_id', userId);

  (overrides as PlanAppRow[] | null)?.forEach((row: PlanAppRow) => {
    if (row.micro_apps?.slug) slugs.add(row.micro_apps.slug);
  });

  return Array.from(slugs);
}

