import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

async function esEquipoServing() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false
  if ((user.email || '').toLowerCase().trim() === CORREO_ADMIN) return true
  const { data: perfil } = await supabase.from('users').select('role').eq('id', user.id).maybeSingle<{ role: string | null }>()
  return perfil?.role === 'admin'
}

function generarSlugBase(nombre: string) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // quita tildes
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}

/**
 * Crea un socio de marca blanca (por ejemplo, el gremio que trae volumen).
 * Solo el equipo de Serving puede crearlos.
 *
 * De paso le arma su enlace propio (slug): la palabra que va en
 * tuapp.com/mb/<slug>, por donde sus clientes van a entrar. Si el nombre ya
 * generó un slug repetido, le agrega -2, -3, etc. hasta que sea único.
 */
export async function POST(req: Request) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { nombre, marca, contactoNombre, contactoCorreo, contactoTelefono, mantenimientoMensualUsd } = await req.json()
    if (!nombre || !String(nombre).trim()) {
      return NextResponse.json({ error: 'Falta el nombre del socio' }, { status: 400 })
    }

    const supabase = await createClient()

    const slugBase = generarSlugBase(nombre) || 'socio'
    let slug = slugBase
    let intento = 1
    while (true) {
      const { data: existente } = await supabase.from('socios').select('id').eq('slug', slug).maybeSingle()
      if (!existente) break
      intento += 1
      slug = `${slugBase}-${intento}`
    }

    const { data, error } = await supabase
      .from('socios')
      .insert({
        nombre: String(nombre).trim(),
        marca: marca || null,
        contacto_nombre: contactoNombre || null,
        contacto_correo: contactoCorreo || null,
        contacto_telefono: contactoTelefono || null,
        slug,
        mantenimiento_mensual_usd: mantenimientoMensualUsd || 500,
      })
      .select('id, nombre, slug')
      .single()

    if (error) throw error

    return NextResponse.json({ success: true, socio: data })
  } catch (error) {
    const mensaje = error instanceof Error ? error.message : 'Error al crear el socio'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
