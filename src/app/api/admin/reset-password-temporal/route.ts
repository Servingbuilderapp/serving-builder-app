import { NextResponse } from 'next/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'

const SECRETO = 'cambiar-clave-2026-temporal'

export async function POST(req: Request) {
  try {
    const { secreto, email, nuevaPassword } = await req.json()

    if (secreto !== SECRETO) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const supabaseAdmin = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: usuarios } = await supabaseAdmin.auth.admin.listUsers()
    const usuario = usuarios?.users?.find((u) => u.email?.toLowerCase() === email.toLowerCase())

    if (!usuario) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 })
    }

    const { error } = await supabaseAdmin.auth.admin.updateUserById(usuario.id, {
      password: nuevaPassword,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error' }, { status: 500 })
  }
}
