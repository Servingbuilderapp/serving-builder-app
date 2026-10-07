import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { CLAVES_BENEFICIO, type ClaveBeneficio } from '@/lib/membresias'

/**
 * El equipo anota que un cliente gastó un beneficio de su membresía
 * (por ejemplo, "se le entregó 1 TDR"). Solo lo puede usar el equipo.
 */
export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.email?.toLowerCase() !== 'servingbuilderapp@gmail.com') {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    }

    const { membresiaId, beneficio, nota } = await req.json()
    if (!membresiaId || !CLAVES_BENEFICIO.includes(beneficio as ClaveBeneficio)) {
      return NextResponse.json({ error: 'Faltan datos' }, { status: 400 })
    }

    const servicio = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    const { error } = await servicio.from('membresias_consumos').insert({
      membresia_id: membresiaId,
      beneficio,
      cantidad: 1,
      nota: typeof nota === 'string' ? nota.slice(0, 200) : null,
    })
    if (error) throw error
    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    console.error('Error registrando uso de membresía:', error)
    const mensaje = error instanceof Error ? error.message : 'Error al registrar el uso'
    return NextResponse.json({ error: mensaje }, { status: 500 })
  }
}
