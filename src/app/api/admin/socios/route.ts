import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { esEquipoServing as equipoServing } from '@/lib/guardiaEquipo'

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

async function esEquipoServing() {
  if (await equipoServing()) return true
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

    const { nombre, marca, contactoNombre, contactoCorreo, contactoTelefono, mantenimientoMensualUsd, modalidad, cupoGratis } = await req.json()
    if (!nombre || !String(nombre).trim()) {
      return NextResponse.json({ error: 'Falta el nombre del socio' }, { status: 400 })
    }

    // La tabla socios solo la puede tocar el servidor (RLS), igual que en
    // /admin/marca-blanca al listarlos — por eso aquí también se usa la
    // llave de servicio (supabaseAdmin) para leer y escribir, en vez del
    // cliente normal de la sesión del usuario.
    const slugBase = generarSlugBase(nombre) || 'socio'
    let slug = slugBase
    let intento = 1
    while (true) {
      const { data: existente } = await supabaseAdmin.from('socios').select('id').eq('slug', slug).maybeSingle()
      if (!existente) break
      intento += 1
      slug = `${slugBase}-${intento}`
    }

    const esGratis = modalidad === 'cinco_gratis'
    const cupo = esGratis ? Math.min(50, Math.max(1, Number(cupoGratis) || 5)) : 0

    const filaSocio = {
        nombre: String(nombre).trim(),
        marca: marca || null,
        contacto_nombre: contactoNombre || null,
        contacto_correo: contactoCorreo || null,
        contacto_telefono: contactoTelefono || null,
        slug,
        mantenimiento_mensual_usd: mantenimientoMensualUsd || 500,
      }

    let { data, error } = await supabaseAdmin
      .from('socios')
      .insert({ ...filaSocio, modalidad: esGratis ? 'cinco_gratis' : 'uso', cupo_gratis: cupo })
      .select('id, nombre, slug')
      .single()

    // Si el SQL de marca blanca gratis todavía no se corrió, se crea el socio sin esos dos campos.
    if (error && /modalidad|cupo_gratis/i.test(error.message || '')) {
      if (esGratis) throw new Error('Falta correr en Supabase el archivo supabase_migration_marca_blanca_gratis.sql')
      ;({ data, error } = await supabaseAdmin.from('socios').insert(filaSocio).select('id, nombre, slug').single())
    }

    if (error) throw error

    return NextResponse.json({ success: true, socio: data })
  } catch (error) {
    // Antes esto se perdía: los errores que vienen de Supabase (tabla
    // "socios") no son instancias de Error de JavaScript, son objetos
    // planos con .message, .details, .hint y .code — por eso el mensaje
    // real nunca llegaba a esta respuesta. Ahora sí se muestra el motivo
    // de verdad, para poder diagnosticar sin adivinar.
    const detalle =
      error && typeof error === 'object' && 'message' in error
        ? String((error as { message?: unknown }).message)
        : error instanceof Error
        ? error.message
        : 'Error al crear el socio'
    console.error('[api/admin/socios] Error al crear socio:', error)
    return NextResponse.json({ error: detalle }, { status: 500 })
  }
}
