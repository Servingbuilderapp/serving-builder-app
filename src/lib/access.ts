interface PlanAppRow {
  micro_apps: { slug: string } | null;
}

export async function getUserAccessibleApps(userId: string): Promise<string[]> {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SECRET_KEY!
  );

  // 1. Obtener el plan_id del usuario
  const { data: user } = await supabase
    .from('users')
    .select('plan_id')
    .eq('id', userId)
    .single();

  const slugs = new Set<string>();

  // 2. Obtener apps incluidas en su plan
  if (user?.plan_id) {
    const { data: planApps } = await supabase
      .from('plan_apps')
      .select('micro_apps(slug)')
      .eq('plan_id', user.plan_id);

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

