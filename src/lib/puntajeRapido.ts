import { veredictoElegibilidad, type CondicionesConvocatoria, type PerfilProyecto, type VeredictoElegibilidad } from '@/lib/elegibilidad'

/**
 * PUNTAJE RÁPIDO DE ENCAJE — para ordenar TODA la biblioteca frente a un proyecto.
 *
 * No usa IA (no gasta saldo de Gemini): compara las palabras que más pesan en el
 * proyecto con las de cada convocatoria, y le suma la elegibilidad, el territorio y
 * el tiempo. Sirve para decidir qué mirar primero. El análisis profundo, con
 * matriz, brechas y versión de postulación, se hace después, cuando el cliente
 * elige una convocatoria.
 *
 * Reparto de los 100 puntos:
 *   60  tema: qué tanto se parecen el proyecto y la convocatoria
 *   25  elegibilidad: ¿puede postular? (veredicto de `elegibilidad.ts`)
 *   10  territorio: ¿la convocatoria llega a su zona?
 *    5  tiempo: ¿hay margen antes del cierre?
 */

export type ConvocatoriaParaPuntaje = CondicionesConvocatoria & {
  id: string
  nombre: string | null
  entidad: string | null
  sector?: string | null
  objetivo?: string | null
  linea_tematica?: string | null
  territorio?: string | null
  paises_elegibles?: string[] | null
  fecha_cierre?: string | null
  fuente_oficial?: string | null
  enlace_aplicacion?: string | null
}

export type PuntajeConvocatoria = {
  puntaje: number
  /** Frases cortas que explican por qué sale ese puntaje. */
  razones: string[]
  elegibilidad: VeredictoElegibilidad
}

const PALABRAS_VACIAS = new Set(
  (
    'para como pero esta este estos estas desde hasta sobre entre ante bajo cada todo toda todos todas ' +
    'tambien donde cuando porque aunque mediante segun cual cuales sera seran puede pueden debe deben ' +
    'tiene tienen hace hacen ser sus nuestro nuestra nuestros nuestras lugar tipo forma parte partes ' +
    'proyecto proyectos programa programas convocatoria convocatorias fondo fondos apoyo entidad entidades ' +
    'general generales importante principal principales actividad actividades persona personas con sin por'
  ).split(' '),
)

/** Pasa a minúsculas, quita tildes y deja solo palabras útiles (sin plurales ni palabras vacías). */
export function palabrasClave(texto: string): string[] {
  const limpio = texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ñ\s]/g, ' ')
  const resultado: string[] = []
  for (const bruta of limpio.split(/\s+/)) {
    if (bruta.length < 4 || PALABRAS_VACIAS.has(bruta)) continue
    let p = bruta
    if (p.endsWith('ciones')) p = p.slice(0, -2)
    else if (p.length > 5 && p.endsWith('es')) p = p.slice(0, -2)
    else if (p.length > 4 && p.endsWith('s')) p = p.slice(0, -1)
    if (!PALABRAS_VACIAS.has(p)) resultado.push(p)
  }
  return resultado
}

function textoDeConvocatoria(c: ConvocatoriaParaPuntaje): string {
  return [c.nombre, c.entidad, c.sector, c.objetivo, c.linea_tematica, c.territorio].filter(Boolean).join(' ')
}

/** Las palabras del proyecto que más lo distinguen, con su peso, calculadas contra toda la biblioteca. */
export function palabrasDelProyecto(
  textoProyecto: string,
  convocatorias: ConvocatoriaParaPuntaje[],
): { palabra: string; peso: number }[] {
  const frecuencia = new Map<string, number>()
  for (const p of palabrasClave(textoProyecto)) frecuencia.set(p, (frecuencia.get(p) || 0) + 1)

  // En cuántas convocatorias aparece cada palabra: las que aparecen en todas pesan casi nada.
  const aparece = new Map<string, number>()
  for (const c of convocatorias) {
    for (const p of new Set(palabrasClave(textoDeConvocatoria(c)))) aparece.set(p, (aparece.get(p) || 0) + 1)
  }
  const total = Math.max(1, convocatorias.length)

  return [...frecuencia.entries()]
    .map(([palabra, veces]) => ({
      palabra,
      peso: Math.sqrt(veces) * Math.log(1 + total / (1 + (aparece.get(palabra) || 0))),
    }))
    .sort((a, b) => b.peso - a.peso)
    .slice(0, 25)
}

const REGIONES_QUE_INCLUYEN_COLOMBIA = ['colombia', 'latinoamerica', 'america latina', 'latam', 'iberoamerica', 'global', 'mundial', 'internacional', 'todos', 'sudamerica', 'america del sur']

function territorio(c: ConvocatoriaParaPuntaje): { puntos: number; razon: string | null } {
  const paises = (c.paises_elegibles || []).map((p) =>
    p.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim(),
  )
  if (paises.length === 0) return { puntos: 5, razon: null }
  const incluye = paises.some((p) => REGIONES_QUE_INCLUYEN_COLOMBIA.some((r) => p.includes(r)))
  return incluye
    ? { puntos: 10, razon: 'Llega a Colombia.' }
    : { puntos: 0, razon: 'No parece llegar a Colombia: revisa los países elegibles.' }
}

function diasParaCierre(fecha: string | null | undefined): number | null {
  if (!fecha) return null
  const f = new Date(fecha)
  if (Number.isNaN(f.getTime())) return null
  const hoy = new Date()
  const base = Date.UTC(hoy.getUTCFullYear(), hoy.getUTCMonth(), hoy.getUTCDate())
  return Math.round((Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate()) - base) / 86400000)
}

export function puntuarConvocatoria(
  c: ConvocatoriaParaPuntaje,
  clavesProyecto: { palabra: string; peso: number }[],
  perfil: PerfilProyecto,
): PuntajeConvocatoria {
  const razones: string[] = []

  /* ---- tema (60) ---- */
  const palabrasConv = new Set(palabrasClave(textoDeConvocatoria(c)))
  const pesoTotal = clavesProyecto.reduce((s, k) => s + k.peso, 0)
  const coinciden = clavesProyecto.filter((k) => palabrasConv.has(k.palabra))
  const pesoCoincide = coinciden.reduce((s, k) => s + k.peso, 0)
  const parecido = pesoTotal > 0 ? pesoCoincide / pesoTotal : 0
  const tema = Math.min(1, parecido * 2.2) * 60
  if (coinciden.length > 0) {
    razones.push(
      `Tu proyecto y esta convocatoria hablan de: ${coinciden
        .slice(0, 4)
        .map((k) => k.palabra)
        .join(', ')}.`,
    )
  } else {
    razones.push('No vemos temas en común con tu proyecto.')
  }

  /* ---- elegibilidad (25) ---- */
  const elegibilidad = veredictoElegibilidad(c, perfil)
  const puntosElegibilidad = { elegible: 25, con_evidencia: 18, por_confirmar: 12, falta: 0 }[elegibilidad.estado]
  if (elegibilidad.estado === 'falta') razones.push(elegibilidad.razones[0])

  /* ---- territorio (10) ---- */
  const t = territorio(c)
  if (t.puntos === 0 && t.razon) razones.push(t.razon)

  /* ---- tiempo (5) ---- */
  const dias = diasParaCierre(c.fecha_cierre)
  let puntosTiempo = 5
  if (dias !== null) {
    if (dias < 0) puntosTiempo = 0
    else if (dias <= 7) {
      puntosTiempo = 1
      razones.push(`Cierra en ${dias === 0 ? 'menos de un día' : dias === 1 ? '1 día' : `${dias} días`}: hay poco margen.`)
    } else if (dias <= 14) puntosTiempo = 3
  }

  const puntaje = Math.max(0, Math.min(100, Math.round(tema + puntosElegibilidad + t.puntos + puntosTiempo)))
  return { puntaje, razones, elegibilidad }
}
