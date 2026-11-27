import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { armarBotonBold } from '@/lib/bold'
import { clienteAdmin } from '@/lib/empresarial/membresia'
import { TRAMOS, type Tramo } from '@/lib/empresarial/proyectoHecho'
import { entradaDeLaPersona } from '@/lib/empresarial/proyectoHechoServidor'

/**
 * Arma el botón de Bold para el pago único de la formulación del proyecto.
 * El monto sale de la base de datos (lo fijó el servidor), nunca de lo que mande el navegador.
 * Cuando Bold avise que el pago fue aprobado, /api/webhooks/bold lo marca como pagado.
 * Lo recibe BotonPagoBold con campoId="proyectoId".
 */
export async function POST(req: Request) {
  try {
    const { proyectoId } = (await req.json().catch(() => ({}))) as { proyectoId?: string }
    if (!proyectoId) return NextResponse.json({ error: 'Falta el proyecto' }, { status: 400 })

    const r = await entradaDeLaPersona(proyectoId)
    if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status })
    const { entrada } = r

    if (entrada.estado_pago === 'pagado') return NextResponse.json({ error: 'Este proyecto ya está pagado.' }, { status: 409 })
    if (!entrada.muestra || !entrada.precio_total_cop || !entrada.tramo) {
      return NextResponse.json({ error: 'Primero hay que armar tu adelanto.' }, { status: 409 })
    }

    const referencia = randomUUID()
    await clienteAdmin().from('sfpe_entrada').update({ bold_order_id: referencia }).eq('id', entrada.id)

    const origin = new URL(req.url).origin
    const nombreTramo = TRAMOS[entrada.tramo as Tramo]?.nombre ?? 'Proyecto'
    const boton = armarBotonBold({
      orderId: referencia,
      amount: Number(entrada.precio_total_cop),
      currency: 'COP',
      description: `Camino A, formulación del proyecto (${nombreTramo})`,
      redirectionUrl: `${origin}/empresarial/proyecto-hecho?proyecto=${entrada.proyecto_id}&pago=en_proceso`,
    })
    return NextResponse.json(boton)
  } catch (error: unknown) {
    console.error('Error iniciando el cobro de la formulación:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Error al iniciar el pago' }, { status: 500 })
  }
}
