import type { DiagnosticoResultadoV2 } from '@/app/api/diagnostico-v2/route'

/**
 * Convierte en documento (texto con formato) lo que hoy solo se ve en pantalla,
 * para que el cliente lo pueda ver, bajar en Word o guardar en PDF desde
 * "Mis documentos". No inventa nada: solo ordena lo que ya está guardado.
 */

function lista(valor: unknown): string[] {
  if (Array.isArray(valor)) return valor.map((v) => String(v)).filter(Boolean)
  if (typeof valor === 'string' && valor.trim()) {
    return valor.split(/\n|•|·/).map((v) => v.trim()).filter(Boolean)
  }
  return []
}

function viñetas(items: string[]): string {
  return items.length ? items.map((i) => `- ${i}`).join('\n') : '_Sin información._'
}

export function diagnosticoAMarkdown(r: DiagnosticoResultadoV2, proyecto: string): string {
  const partes: string[] = [
    `# Diagnóstico de ${proyecto || 'tu proyecto'}`,
    `**Puntaje general:** ${r.scoreGeneral}% — ${r.esViable ? 'Proyecto viable' : 'Requiere ajustes'}`,
    `## Resumen\n${r.resumenEjecutivo}`,
  ]
  if (r.ejesRueda?.length) {
    partes.push(
      '## Rueda de diagnóstico\n' +
        r.ejesRueda.map((e) => `- **${e.label}:** ${e.score}/10. ${e.recomendacion}`).join('\n'),
    )
  }
  if (r.sectoresSugeridos?.length) {
    partes.push('## Sectores con mayor afinidad\n' + viñetas(r.sectoresSugeridos.map((s) => `${s.nombre} (${s.porcentaje}%)`)))
  }
  if (r.mecanismosSugeridos?.length) {
    partes.push(
      '## Mecanismos de financiamiento recomendados\n' +
        viñetas(r.mecanismosSugeridos.map((m) => `**${m.nombre}** (${m.porcentaje}%): ${m.descripcion}`)),
    )
  }
  partes.push('## Brechas a fortalecer\n' + viñetas(r.brechasCriticas || []))
  partes.push('## Ruta de acción sugerida\n' + viñetas(r.pasosRecomendados || []))
  return partes.join('\n\n')
}

export function calificacionAMarkdown(
  proyecto: string,
  puntaje: number,
  veredicto: string,
  hallazgos: { descripcion: string; critico: boolean }[],
): string {
  return [
    `# Calificación final de ${proyecto}`,
    `**Puntaje:** ${puntaje}/100 — ${veredicto === 'aprobado' ? 'Aprobado' : 'Con observaciones'}`,
    '## Lo que se revisó',
    viñetas(hallazgos.map((h) => (h.critico ? `**Importante:** ${h.descripcion}` : h.descripcion))),
  ].join('\n\n')
}

export function encajeAMarkdown(
  convocatoria: string,
  e: {
    resumen_convocatoria: string | null
    encaje_actual: string | null
    encaje_potencial: string | null
    semaforo: string | null
    puntaje_general: number | null
    recomendaciones: unknown
    checklist_preparacion: unknown
    documentacion_faltante: unknown
  },
): string {
  const partes: string[] = [`# Encaje con ${convocatoria}`]
  if (e.puntaje_general != null) partes.push(`**Puntaje de encaje:** ${e.puntaje_general}${e.semaforo ? ` (${e.semaforo})` : ''}`)
  if (e.resumen_convocatoria) partes.push(`## Sobre la convocatoria\n${e.resumen_convocatoria}`)
  if (e.encaje_actual) partes.push(`## Cómo encaja hoy\n${e.encaje_actual}`)
  if (e.encaje_potencial) partes.push(`## Cómo podría encajar\n${e.encaje_potencial}`)
  const rec = lista(e.recomendaciones)
  if (rec.length) partes.push('## Recomendaciones\n' + viñetas(rec))
  const check = lista(e.checklist_preparacion)
  if (check.length) partes.push('## Lista de preparación\n' + viñetas(check))
  const falta = lista(e.documentacion_faltante)
  if (falta.length) partes.push('## Documentación que falta\n' + viñetas(falta))
  return partes.join('\n\n')
}

export function postulacionAMarkdown(p: {
  convocatoria_nombre: string
  entidad: string | null
  estado: string
  puntaje_total: number | null
  carta_intencion: string | null
}): string {
  const partes: string[] = [`# Postulación a ${p.convocatoria_nombre}`]
  if (p.entidad) partes.push(`**Entidad:** ${p.entidad}`)
  partes.push(`**Estado:** ${p.estado}`)
  if (p.puntaje_total != null) partes.push(`**Puntaje de la evaluación:** ${p.puntaje_total}/100`)
  if (p.carta_intencion) partes.push(`## Carta de intención\n${p.carta_intencion}`)
  return partes.join('\n\n')
}
