import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import nodemailer from 'nodemailer'
import { buildEmailTemplate } from '@/lib/email'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    
    // 1. Verificar que el usuario sea administrador
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const ADMIN_EMAIL = 'servingbuilderapp@gmail.com';
    const isGodAdmin = user.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

    if (!isGodAdmin && (!profile || profile.role !== 'admin')) {
      return NextResponse.json({ error: 'Permisos insuficientes' }, { status: 403 })
    }

    // 2. Obtener datos del payload
    const { 
      host, 
      port, 
      username, 
      password, 
      from_email, 
      from_name, 
      test_recipient 
    } = await req.json()

    // Limpiar password de espacios en blanco (común en contraseñas de app de Google)
    const cleanPassword = password ? password.replace(/\s+/g, '') : ''

    // 3. Crear transporte temporal para el test
    const transport = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: {
        user: username,
        pass: cleanPassword || (await getExistingPassword()) // Usar existente si el nuevo viene vacío
      },
    })

    // Función auxiliar para obtener password existente si no se provee uno nuevo
    async function getExistingPassword() {
      const { data } = await supabaseAdmin.from('smtp_settings').select('password').single()
      return data?.password || ''
    }

    const finalPassword = cleanPassword || (await getExistingPassword())

    // 4. Intentar enviar email de prueba
    const testHtml = buildEmailTemplate({
      title: '✅ Configuración SMTP Exitosa',
      greeting: '¡Hola!',
      bodyLines: [
        'Este es un email de prueba para confirmar que tu configuración SMTP en **ECOSERVING** está funcionando correctamente.',
        'Desde ahora, el sistema podrá enviar emails de bienvenida y notificaciones automáticas.'
      ],
      ctaText: 'Ir al Panel',
      ctaUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000/admin/email'
    })

    const info = await transport.sendMail({
      from: `"${from_name}" <${from_email}>`,
      to: test_recipient,
      subject: '✅ Test Email — SMTP Configuration Working',
      html: testHtml,
    })

    // 5. Si es exitoso, guardar configuración en la DB
    const { error: dbError } = await supabaseAdmin
      .from('smtp_settings')
      .upsert({
        host,
        port,
        username,
        password: finalPassword,
        from_email,
        from_name,
        is_verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'id' }) // Esto asume que solo hay una fila, pero upsert sin ID puede insertar una nueva.
      // Mejor obtenemos el ID si existe.
    
    // Ajuste para asegurar que solo hay una fila:
    const { data: existing } = await supabaseAdmin.from('smtp_settings').select('id').single()
    const { error: finalDbError } = await supabaseAdmin
      .from('smtp_settings')
      .upsert({
        id: existing?.id, // Si existe, lo actualiza. Si no, genera uno nuevo.
        host,
        port,
        username,
        password: finalPassword,
        from_email,
        from_name,
        is_verified: true,
        verified_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (finalDbError) throw finalDbError

    return NextResponse.json({ 
      success: true, 
      message: 'Email enviado y configuración guardada', 
      smtp_response: info.response 
    })

  } catch (error: any) {
    console.error('Error en test de email:', error)
    return NextResponse.json({ 
      success: false, 
      message: error.message || 'Error desconocido al probar SMTP'
    }, { status: 400 })
  }
}
