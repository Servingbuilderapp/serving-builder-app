import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { consumirBeneficio, membresiaVigente } from '@/lib/membresiasConsumo'
import { periodoMensual } from '@/lib/membresiasUso'

/**
 * El miembro abre la ficha completa de una convocatoria del mes.
 * - Si ya la había abierto en este período, no se cobra otra vez.
 * - Si no, se descuenta 1 del cupo "Convocatorias del mes" de su nivel.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user?.email) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })

    const { convocatoriaId } = await req.json()
    if (!convocatoriaId || typeof convocatoriaId !== 'string') {
      return NextResponse.json({ error: 'Falta la convocatoria' }, { status: 400 })
    }

    const servicio = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { vigente } = await membresiaVigente(servicio, user.email)
    if (!vigente) {
      return NextResponse.json({ error: 'Necesitas una membresía activa para abrir convocatorias.' }, { status: 403 })
    }

    const marca = `conv:${convocatoriaId}`
    const { desde, hasta } = periodoMensual(vigente.fecha_inicio)
    const { data: yaAbierta } = await servicio
      .from('membresias_consumos')
      .select('id')
      .eq('membresia_id', vigente.id)
      .eq('beneficio', 'convocatorias')
      .eq('nota', marca)
      .gte('created_at', desde.toISOString())
      .lt('created_at', hasta.toISOString())
      .limit(1)
    if (yaAbierta && yaAbierta.length > 0) {
      return NextResponse.json({ success: true, yaAbierta: true })
    }

    const r = await consumirBeneficio(servicio, user.email, 'convocatorias', marca)
    if (!r.ok) return NextResponse.json({ error: r.mensaje }, { status: 409 })
    return NextResponse.json({ success: true, restante: r.restante })
  } catch (error: unknown) {
    console.error('Error abriendo convocatoria del mes:', error)
    return NextResponse.json({ error: 'No se pudo abrir la convocatoria. Intenta de nuevo.' }, { status: 500 })
  }
}
