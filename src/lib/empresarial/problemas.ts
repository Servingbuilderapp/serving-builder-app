/**
 * Problemas y Ruta B (Camino A) — reglas simples, sin IA.
 * - Problemas: catálogos para la pantalla de problemas.
 * - Ruta B: convierte lo que la persona contó en el descubrimiento (conocimientos, capacidades,
 *   intereses, problemas observados) en oportunidades SUGERIDAS. Son una guía: la persona edita, guarda o ignora.
 */

import type { Categoria } from './oportunidades'

export const NIVELES_CERTEZA = [
  { valor: 'hipotesis', etiqueta: 'Es una sospecha mía', ayuda: 'Lo he notado, pero no lo he comprobado.' },
  { valor: 'parcial', etiqueta: 'Tengo algunas pruebas', ayuda: 'Hay señales o testimonios, pero falta confirmar.' },
  { valor: 'confirmado', etiqueta: 'Está confirmado', ayuda: 'Lo comprobé con datos, clientes o registros.' },
] as const

export type NivelCerteza = (typeof NIVELES_CERTEZA)[number]['valor']

export const FRECUENCIAS = [
  'Todos los días',
  'Varias veces por semana',
  'Cada semana',
  'Cada mes',
  'De vez en cuando',
  'No lo sé todavía',
] as const

export interface Problema {
  id: string
  titulo: string
  descripcion: string | null
  afectados: string | null
  ubicacion: string | null
  frecuencia: string | null
  consecuencias: string | null
  causas: string[]
  nivel_certeza: NivelCerteza | null
  hallazgo_id: string | null
  creada_en: string
}

/** Las causas se guardan como lista; en pantalla se escriben una por línea. */
export function causasATexto(causas: unknown): string {
  return Array.isArray(causas) ? causas.filter((c) => typeof c === 'string').join('\n') : ''
}

export function textoACausas(texto: string): string[] {
  return texto
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
}

/** Qué tan completa está la ficha de un problema (para avisar qué falta). */
export function camposFaltantes(p: Pick<Problema, 'descripcion' | 'afectados' | 'ubicacion' | 'frecuencia' | 'consecuencias' | 'causas' | 'nivel_certeza'>): string[] {
  const f: string[] = []
  if (!p.descripcion?.trim()) f.push('qué pasa')
  if (!p.afectados?.trim()) f.push('a quién afecta')
  if (!p.ubicacion?.trim()) f.push('dónde')
  if (!p.frecuencia) f.push('cada cuánto')
  if (!p.consecuencias?.trim()) f.push('qué consecuencias tiene')
  if (!p.causas || p.causas.length === 0) f.push('por qué ocurre')
  if (!p.nivel_certeza) f.push('qué tan seguro estás')
  return f
}

/* ------------------------------------------------------------------ */
/* RUTA B: oportunidades desde el descubrimiento                       */
/* ------------------------------------------------------------------ */

export interface DescubrimientoEntrada {
  id: string
  tipo: 'conocimiento' | 'capacidad' | 'interes' | 'problema_observado' | 'recurso' | string
  titulo: string
  detalle: string | null
  nivel: number | null
}

export interface SugerenciaRutaB {
  /** Clave estable para no repetir: coincide con el nombre con que se guarda la oportunidad. */
  clave: string
  origen: 'problema' | 'combinacion'
  nombre: string
  descripcion: string
  categoria: Categoria
  /** Solo en las que nacen de un problema observado: se guarda también como problema. */
  problema?: { titulo: string; descripcion: string | null }
  /** Qué de lo que contó la persona la respalda. */
  basadoEn: string[]
}

const PALABRAS_CATEGORIA: { palabras: string[]; categoria: Categoria }[] = [
  { palabras: ['digital', 'internet', 'app', 'aplicación', 'software', 'plataforma', 'web', 'tecnolog'], categoria: 'Transformación digital' },
  { palabras: ['automatiz', 'manual', 'repetitiv'], categoria: 'Automatización' },
  { palabras: ['costo', 'caro', 'ahorr', 'desperdicio'], categoria: 'Reducción de costos' },
  { palabras: ['residuo', 'reciclaj', 'basura', 'ambient', 'contamin', 'agua', 'energía', 'energia'], categoria: 'Sostenibilidad' },
  { palabras: ['exportar', 'exportación', 'internacional', 'otro país'], categoria: 'Internacionalización' },
  { palabras: ['vender', 'venta', 'cliente', 'canal', 'tienda'], categoria: 'Nuevos canales comerciales' },
  { palabras: ['capacitar', 'formación', 'formacion', 'aprender', 'enseñar', 'curso'], categoria: 'Desarrollo de capacidades' },
  { palabras: ['comunidad', 'social', 'vulnerable', 'inclusión', 'inclusion', 'mujeres', 'jóvenes', 'jovenes'], categoria: 'Impacto social' },
  { palabras: ['proveedor', 'cosecha', 'campesin', 'productor', 'cadena'], categoria: 'Cadenas productivas' },
  { palabras: ['servicio', 'atención', 'atencion'], categoria: 'Nuevos servicios' },
  { palabras: ['producto'], categoria: 'Nuevos productos' },
]

/** Categoría que se sugiere según las palabras del texto. La persona la puede cambiar. */
export function categoriaPorTexto(texto: string, porDefecto: Categoria): Categoria {
  const t = texto.toLowerCase()
  for (const regla of PALABRAS_CATEGORIA) {
    if (regla.palabras.some((p) => t.includes(p))) return regla.categoria
  }
  return porDefecto
}

const MAX_COMBINACIONES = 8

/**
 * Reglas (sin IA):
 * 1. Cada PROBLEMA OBSERVADO se vuelve una oportunidad "Resolver: …" (y también un problema por validar).
 * 2. Cada CONOCIMIENTO o CAPACIDAD fuerte (nivel 4 o 5) se junta con cada INTERÉS: "Aplicar … a …".
 *    Se muestran primero las combinaciones de mayor nivel y hasta {MAX_COMBINACIONES}.
 * 3. Los RECURSOS no generan oportunidades: se muestran como respaldo en las que sí.
 * No repite lo que ya se convirtió (se compara por nombre).
 */
export function sugerirDesdeDescubrimiento(
  entradas: DescubrimientoEntrada[],
  nombresYaGuardados: Set<string>,
): SugerenciaRutaB[] {
  const norm = (s: string) => s.trim().toLowerCase()
  const guardados = new Set(Array.from(nombresYaGuardados).map(norm))
  const recursos = entradas.filter((e) => e.tipo === 'recurso').map((e) => e.titulo.trim()).filter(Boolean)
  const res: SugerenciaRutaB[] = []

  // 1. Problemas observados
  for (const p of entradas.filter((e) => e.tipo === 'problema_observado')) {
    const titulo = p.titulo.trim()
    if (!titulo) continue
    const nombre = `Resolver: ${titulo}`
    if (guardados.has(norm(nombre))) continue
    const basadoEn = [`Problema que observaste: ${titulo}`]
    if (recursos.length) basadoEn.push(`Recursos con los que cuentas: ${recursos.slice(0, 3).join(', ')}`)
    res.push({
      clave: nombre,
      origen: 'problema',
      nombre,
      descripcion: p.detalle?.trim() || `Tú observaste este problema: ${titulo}. Falta contar a quién afecta y cómo se podría resolver.`,
      categoria: categoriaPorTexto(`${titulo} ${p.detalle ?? ''}`, 'Nuevos servicios'),
      problema: { titulo, descripcion: p.detalle?.trim() || null },
      basadoEn,
    })
  }

  // 2. Fortaleza × interés
  const fuertes = entradas
    .filter((e) => (e.tipo === 'conocimiento' || e.tipo === 'capacidad') && (e.nivel ?? 0) >= 4 && e.titulo.trim())
    .sort((a, b) => (b.nivel ?? 0) - (a.nivel ?? 0))
  const intereses = entradas.filter((e) => e.tipo === 'interes' && e.titulo.trim())
  const combos: SugerenciaRutaB[] = []
  for (const f of fuertes) {
    for (const i of intereses) {
      const nombre = `Aplicar ${f.titulo.trim()} a ${i.titulo.trim()}`
      if (guardados.has(norm(nombre))) continue
      const basadoEn = [
        `${f.tipo === 'conocimiento' ? 'Conocimiento' : 'Capacidad'} (nivel ${f.nivel}): ${f.titulo.trim()}`,
        `Interés: ${i.titulo.trim()}`,
      ]
      if (recursos.length) basadoEn.push(`Recursos con los que cuentas: ${recursos.slice(0, 3).join(', ')}`)
      combos.push({
        clave: nombre,
        origen: 'combinacion',
        nombre,
        descripcion: `Lo que sabes hacer bien (${f.titulo.trim()}) podría servir en un tema que te interesa (${i.titulo.trim()}). Falta comprobar si alguien lo necesita y pagaría por ello.`,
        categoria: categoriaPorTexto(`${f.titulo} ${i.titulo} ${f.detalle ?? ''} ${i.detalle ?? ''}`, 'Nuevos servicios'),
        basadoEn,
      })
    }
  }
  res.push(...combos.slice(0, MAX_COMBINACIONES))
  return res
}
