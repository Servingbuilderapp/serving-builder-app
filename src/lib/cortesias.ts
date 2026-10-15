/**
 * CORTESÍAS — proyectos que Serving estructura sin cobrar la estructuración.
 *
 * A cambio, Serving cobra solo una comisión de éxito si el proyecto gana.
 * Aquí viven los números por defecto y el texto de las condiciones, en un solo
 * sitio, para que lo vea igual el cliente (pantalla «Mi cortesía») y el equipo.
 */

export const COMISION_CORTESIA_POR_DEFECTO = 15
export const DIAS_CORTESIA_POR_DEFECTO = 15
/** Cuántas cortesías se acuerdan por organización aliada (Coomeva, Parque Soft…). */
export const CUPO_POR_ORIGEN = 5

/** Estado del proyecto mientras el cliente todavía no acepta las condiciones. */
export const ESTADO_PROYECTO_CORTESIA_PENDIENTE = 'cortesia_pendiente'

export type Cortesia = {
  id: string
  proyecto_id: string | null
  correo: string
  nombre: string | null
  whatsapp: string | null
  iniciativa: string | null
  origen: string | null
  comision_pct: number
  dias: number
  inicia_en: string | null
  vence_en: string | null
  acepto_en: string | null
  estado: string
  nota: string | null
  created_at: string
}

/** Días que le quedan (0 si ya venció). null si el conteo todavía no arranca. */
export function diasRestantes(venceEn: string | null): number | null {
  if (!venceEn) return null
  const ms = new Date(venceEn).getTime() - new Date().getTime()
  return Math.max(0, Math.ceil(ms / 86400000))
}

/** Las condiciones tal como las lee y las acepta el cliente. */
export function textoCondiciones(comisionPct: number, dias: number): string[] {
  return [
    'Serving estructura tu proyecto sin costo: no pagas nada por la estructuración.',
    `Desde el día en que subes tu documento, tienes ${dias} días para que Serving busque convocatorias y postule tu proyecto.`,
    `Si tu proyecto gana, Serving cobra el ${comisionPct} % del valor que te desembolsen. Si no gana, no pagas nada.`,
    'Serving se compromete a poner todo su trabajo y experiencia, pero no puede garantizar que una convocatoria apruebe tu proyecto: la decisión es siempre de quien convoca.',
    'Aplican los Términos y Condiciones de Serving, incluida la autorización de uso anonimizado de la estructura de tu proyecto como modelo para otros.',
  ]
}
