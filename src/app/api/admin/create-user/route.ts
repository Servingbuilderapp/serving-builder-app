import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin as adminClient } from '@/lib/supabase/admin'
import { sendWelcomeEmail } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: adminUser } } = await supabase.auth.getUser()

    // 1. Verificar que quien llama es admin
    const { data: adminData } = await supabase
      .from('users')
      .select('role')
      .eq('id', adminUser?.id)
      .single()

    if (adminData?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { email, password, firstName, lastName, planId } = await req.json()

    // 2. Crear usuario en Auth (bypass confirmación)
    const { data: authUser, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { first_name: firstName, last_name: lastName }
    })

    if (authError) throw authError

    // 3. Asignar plan si se especificó
    if (planId && authUser.user) {
      await adminClient
        .from('users')
        .update({
          plan_id: planId,
          plan_assigned_at: new Date().toISOString(),
          plan_source: 'manual'
        })
        .eq('id', authUser.user.id)
    }
    
    // 4. Enviar Email de Bienvenida
    let emailSent = false;
    if (authUser.user) {
      // Obtener nombre del plan si existe
      let planName = 'Plan Base';
      if (planId) {
        const { data: p } = await adminClient.from('plans').select('name_es').eq('id', planId).single();
        if (p) planName = p.name_es;
      }

      const emailResult = await sendWelcomeEmail({
        to: email,
        firstName,
        planName,
        password,
        loginUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      });
      emailSent = emailResult.success;
    }

    return NextResponse.json({ success: true, user: authUser.user, email_sent: emailSent })
  } catch (error: any) {
    console.error('Admin create user error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
