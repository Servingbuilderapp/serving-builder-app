import type { ProyectoVisto } from '@/lib/proyectoVisto'

/**
 * Las 7 cosas que el motor de estructuración necesita sí o sí. Una sola lista
 * para todas las pantallas (al firmar, informe del diagnóstico y Resumen), para
 * que nunca se desacomode.
 */
export const LAS_SIETE_COSAS_CLAVE = [
  { ordenPaso: 13, titulo: 'El problema central', ejemplo: 'Qué situación quieres resolver. Ej.: "Los pequeños productores no tienen cómo vender sin intermediarios".' },
  { ordenPaso: 14, titulo: 'Las causas del problema (árbol del problema)', ejemplo: 'Por qué pasa y qué consecuencias trae. Con 3 causas y 3 consecuencias basta.' },
  { ordenPaso: 6, titulo: 'A quién le pasa (población)', ejemplo: 'Quiénes son, cuántos aproximadamente y dónde viven o trabajan.' },
  { ordenPaso: 7, titulo: 'Para quién es el proyecto (población objetivo)', ejemplo: 'De todas esas personas, a cuántas piensas llegar con este proyecto.' },
  { ordenPaso: 21, titulo: 'El objetivo general', ejemplo: 'Lo que quieres lograr, en una sola frase que empiece con un verbo. Ej.: "Aumentar las ventas de 50 productores".' },
  { ordenPaso: 23, titulo: 'Tu solución', ejemplo: 'Qué vas a hacer para resolver el problema, en pocas palabras.' },
  { ordenPaso: 33, titulo: 'El presupuesto', ejemplo: 'Cuánto dinero necesitas, aunque sea aproximado, y en qué lo gastarías.' },
] as const

/**
 * Cuál paso de estructuración guarda cada cosa clave (orden_secuencia):
 * 13 Identificación del problema central · 14 Causas y efectos · 6 Definición de
 * población · 7 Población objetivo · 21 Objetivos · 23 Solución propuesta ·
 * 33 Presupuesto.
 */
export type EstadoCosaClave = 'lista' | 'reforzar' | 'falta' | 'pendiente'

export type CosaClaveConEstado = {
  titulo: string
  ejemplo: string
  estado: EstadoCosaClave
  detalle: string
}

type FilaPaso = { id: number; orden_secuencia: number | null }
type FilaContenido = { id_paso: number; contenido: string | null; advertencia: string | null }
type FilaPregunta = { id_paso: number; respondida: boolean | null; es_supuesto: boolean | null }

/** ✔ ya la tenemos · ✎ está pero hay que reforzarla · ✖ falta (hay una pregunta) · ○ todavía no llega. */
export async function estadoSieteCosas(vista: ProyectoVisto): Promise<CosaClaveConEstado[] | null> {
  if (!vista.proyectoId) return null
  const db = vista.db
  const id = vista.proyectoId

  const [pasosRes, contenidoRes, preguntasRes] = await Promise.all([
    db.from('pasos_estructuracion').select('id, orden_secuencia'),
    db.from('contenido_pasos_proyecto').select('id_paso, contenido, advertencia').eq('id_proyecto', id),
    db.from('preguntas_pendientes_proyecto').select('id_paso, respondida, es_supuesto').eq('id_proyecto', id),
  ])

  const pasos = (pasosRes.data || []) as FilaPaso[]
  const contenidos = (contenidoRes.data || []) as FilaContenido[]
  const preguntas = (preguntasRes.data || []) as FilaPregunta[]

  const idPorOrden = new Map<number, number>(pasos.map((p) => [Number(p.orden_secuencia ?? p.id), p.id]))

  return LAS_SIETE_COSAS_CLAVE.map((cosa) => {
    const idPaso = idPorOrden.get(cosa.ordenPaso) ?? cosa.ordenPaso
    const fila = contenidos.find((c) => c.id_paso === idPaso)
    const tieneContenido = (fila?.contenido || '').trim().length > 0
    const tieneAdvertencia = (fila?.advertencia || '').trim().length > 0
    const sinResponder = preguntas.some((q) => q.id_paso === idPaso && !q.respondida)
    const supuesto = preguntas.some((q) => q.id_paso === idPaso && q.respondida && q.es_supuesto)

    let estado: EstadoCosaClave
    let detalle: string
    if (tieneContenido && !tieneAdvertencia && !sinResponder && !supuesto) {
      estado = 'lista'
      detalle = 'Ya la tenemos.'
    } else if (tieneContenido) {
      estado = 'reforzar'
      detalle = supuesto
        ? 'La supusimos por ti. Confírmala o corrígela en "Lo que me piden".'
        : sinResponder
          ? 'Tenemos una versión, pero hay una pregunta sin responder.'
          : 'Está escrita, pero conviene reforzarla.'
    } else if (sinResponder) {
      estado = 'falta'
      detalle = 'Te hicimos una pregunta sobre esto. Respóndela en "Lo que me piden".'
    } else {
      estado = 'pendiente'
      detalle = 'Todavía no la tenemos. Se arma cuando estructuremos tu proyecto.'
    }

    return { titulo: cosa.titulo, ejemplo: cosa.ejemplo, estado, detalle }
  })
}
