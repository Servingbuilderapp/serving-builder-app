import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendWelcomeEmail } from '@/lib/email';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const { event, customer, plan: planSlug, source, transaction_id, amount, currency } = payload;

    // 1. Validar campos obligatorios
    if (!event || !customer?.email || !planSlug || !source || !transaction_id) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // 2. Buscar el plan por slug
    const { data: plan } = await supabaseAdmin
      .from('plans')
      .select('id, name_es')
      .eq('slug', planSlug)
      .single();

    if (!plan) {
      // Loggear fallo
      await supabaseAdmin.from('webhook_logs').insert({
        source,
        event_type: event,
        raw_payload: payload,
        status: 'failed',
        error_message: `Plan slug not found: ${planSlug}`
      });
      return NextResponse.json({ error: 'Invalid plan slug' }, { status: 400 });
    }

    // 3. Buscar o crear usuario
    let userId: string | null = null;
    let isNewUser = false;
    let generatedPassword = '';

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', customer.email)
      .single();

    if (existingUser) {
      userId = existingUser.id;
    } else if (event === 'payment.completed') {
      // Crear nuevo usuario
      isNewUser = true;
      generatedPassword = Math.random().toString(36).slice(-8);
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: customer.email,
        password: generatedPassword,
        email_confirm: true,
        user_metadata: { 
          first_name: customer.first_name || '', 
          last_name: customer.last_name || '' 
        }
      });

      if (createError) throw createError;
      userId = newUser.user.id;
    }

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // 4. Lógica por evento
    if (event === 'payment.completed') {
      await supabaseAdmin.from('users').update({
        plan_id: plan.id,
        plan_assigned_at: new Date().toISOString(),
        plan_source: source
      }).eq('id', userId);
    } else if (event === 'subscription.cancelled') {
      await supabaseAdmin.from('users').update({
        plan_id: null,
        plan_assigned_at: null,
        plan_source: null
      }).eq('id', userId);
    }

    // 5. Enviar Email de Bienvenida en caso de pago completado
    let emailSent = false;
    if (event === 'payment.completed' && userId) {
      const emailResult = await sendWelcomeEmail({
        to: customer.email,
        firstName: customer.first_name || '',
        planName: plan.name_es,
        password: isNewUser ? generatedPassword : undefined,
        loginUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
      });
      emailSent = emailResult.success;
    }

    // 6. Loggear éxito
    await supabaseAdmin.from('webhook_logs').insert({
      source,
      event_type: event,
      user_id: userId,
      plan_id: plan.id,
      raw_payload: payload,
      normalized_payload: { amount, currency, transaction_id },
      status: 'processed'
    });

    return NextResponse.json({ 
      success: true, 
      user_id: userId, 
      is_new_user: isNewUser,
      generated_password: generatedPassword,
      email_sent: emailSent
    }, { status: 200 });

  } catch (error: any) {
    console.error('Webhook Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
