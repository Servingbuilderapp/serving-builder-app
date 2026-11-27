import { NextResponse } from 'next/server'
import { callGemini } from '@/lib/gemini'
import { clienteAdmin } from '@/lib/empresarial/membresia'
import { PARTES, promptParte } from '@/lib/empresarial/proyectoHecho'
import { datosParaIA, entradaDeLaPersona } from '@/lib/empresarial/proyectoHechoServidor'
import { buildEmailTemplate, sendEmail } from '@/lib/email'

export const maxDuration = 120

const TOPE_POR_MODELO_MS = 50000

/**
 * Formula el proyecto completo. Solo corre si el pago ya fue aprobado por Bold.
 * Si ya está formulado, devuelve ok sin gastar IA otra vez. Al terminar, avisa por correo.
 */
export async function POST(req: Request) {
  try {
    const body = (await req.json().catch(() => null)) as { proyecto_id?: string } | null
    if (!body?.proyecto_id) return NextResponse.json({ error: 'Solicitud incompleta.' }, { status: 400 })

    const r = await entradaDeLaPersona(body.proyecto_id)
    if ('error' in r) return NextResponse.json({ error: r.error }, { status: r.status })
    const { entrada, nombre, pais, user } = r

    if (entrada.proyecto_final) return NextResponse.json({ ok: true, yaExistia: true })
    if (entrada.estado_pago !== 'pagado') return NextResponse.json({ error: 'El pago todavía no está confirmado.' }, { status: 402 })

    const { datos } = await datosParaIA(entrada, nombre, pais)

    // Las tres partes se piden a la vez para no pasarse del tiempo.
    const partes = await Promise.all(PARTES.map((p) => callGemini(promptParte(datos, p.pide), TOPE_POR_MODELO_MS)))
    const cuerpo = partes.map((t) => t.replace(/```(?:markdown)?\n?|\n?```/g, '').trim())
    if (cuerpo.some((t) => t.length < 200)) {
      return NextResponse.json({ error: 'La IA no pudo terminar tu documento. Vuelve a intentar en un minuto.' }, { status: 502 })
    }

    const documento = `# ${nombre}\n\n${cuerpo.join('\n\n')}`
    const admin = clienteAdmin()
    const { error } = await admin
      .from('sfpe_entrada')
      .update({ proyecto_final: documento, entregado_en: new Date().toISOString() })
      .eq('id', entrada.id)
      .is('proyecto_final', null)
    if (error) throw error

    // Aviso por correo: si falla, el documento igual queda en su panel.
    if (user.email) {
      const origin = new URL(req.url).origin
      await sendEmail({
        to: user.email,
        subject: `Tu proyecto "${nombre}" ya está listo`,
        html: buildEmailTemplate({
          title: 'Tu proyecto está listo',
          greeting: 'Hola,',
          bodyLines: [
            `La IA terminó de formular "${nombre}". Ya puedes leerlo, imprimirlo o guardarlo en PDF desde tu cuenta.`,
            'Revisa con calma las partes marcadas como "por validar": son supuestos que conviene confirmar antes de invertir dinero.',
          ],
          ctaText: 'Ver mi proyecto',
          ctaUrl: `${origin}/empresarial/proyecto-hecho?proyecto=${entrada.proyecto_id}`,
        }),
      }).catch(() => null)
    }

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Error formulando el proyecto completo:', err)
    return NextResponse.json({ error: 'No se pudo terminar tu documento. Vuelve a intentar en un minuto.' }, { status: 500 })
  }
}
