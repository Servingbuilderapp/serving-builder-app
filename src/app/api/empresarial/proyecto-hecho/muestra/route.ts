import { NextResponse } from 'next/server'
import { callGemini } from '@/lib/gemini'
import { leerJSON } from '@/lib/empresarial/iaOportunidades'
import { clienteAdmin } from '@/lib/empresarial/membresia'
import { asignarTramo, calcularPrecio, leerMuestra, promptMuestra } from '@/lib/empresarial/proyectoHecho'
import { datosParaIA, entradaDeLaPersona } from '@/lib/empresarial/proyectoHechoServidor'

export const maxDuration = 120

/**
 * Arma la muestra gratis (adelanto del proyecto) y fija el precio según el tipo de empresa.
 * Solo se calcula una vez por proyecto: si ya existe, se devuelve la guardada (cuida el consumo de la IA).
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { proyecto_id?: string } | null
    if (!body?.proyecto_id) return NextResponse.json({ error: 'Solicitud incompleta.' }, { status: 400 })

    const r = await entradaDeLaPersona(body.proyecto_id)
    if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status })
    const { entrada, nombre, pais } = r

    if (entrada.muestra) return NextResponse.json({ ok: true, yaExistia: true })

    const { datos, avisoDocumento } = await datosParaIA(entrada, nombre, pais)
    if (!datos.idea?.trim() && !datos.textoDocumento.trim()) {
      return NextResponse.json(
        { error: avisoDocumento ?? 'No pudimos leer tu documento. Escribe tu idea con tus palabras e intenta de nuevo.' },
        { status: 422 },
      )
    }

    let muestra = null
    for (let intento = 1; intento <= 2 && !muestra; intento++) {
      muestra = leerMuestra(leerJSON(await callGemini(promptMuestra(datos), 40000)))
    }
    if (!muestra) {
      return NextResponse.json({ error: 'La IA no pudo armar tu adelanto ahora. Intenta de nuevo en unos minutos.' }, { status: 502 })
    }

    const tramo = asignarTramo(entrada.etapa ?? '', entrada.ya_vendio, entrada.personas)
    const precio = calcularPrecio(tramo)
    const { error } = await clienteAdmin()
      .from('sfpe_entrada')
      .update({ muestra, tramo, precio_base_cop: precio.base, precio_total_cop: precio.total })
      .eq('id', entrada.id)
      .is('muestra', null)
    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error armando la muestra del proyecto hecho:', err)
    return NextResponse.json({ error: 'No se pudo armar tu adelanto. Intenta de nuevo en unos minutos.' }, { status: 500 })
  }
}
