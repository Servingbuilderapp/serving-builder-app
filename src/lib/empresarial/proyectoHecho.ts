/**
 * "Que la IA formule mi proyecto" (Camino A): precio, muestra y documento completo.
 * Reglas del dueño (27 nov 2026): pago único según el tipo de empresa, más IVA. Las membresías son aparte.
 */

export const IVA = 0.19

export type Tramo = 'cero' | 'emprendedor' | 'pyme' | 'grande'

export const TRAMOS: Record<Tramo, { nombre: string; precioCop: number }> = {
  cero: { nombre: 'Empiezas de cero', precioCop: 2_000_000 },
  emprendedor: { nombre: 'Emprendedor', precioCop: 4_000_000 },
  pyme: { nombre: 'Pyme', precioCop: 6_000_000 },
  grande: { nombre: 'Empresa grande', precioCop: 9_000_000 },
}

/**
 * Regla de asignación (el sistema la decide, la persona no elige su precio):
 *  - No ha vendido todavía (solo idea o armándolo) → de cero
 *  - Vende y trabajan hasta 10 personas → emprendedor
 *  - Vende y trabajan de 11 a 200 → pyme
 *  - Más de 200 personas → grande
 */
export function asignarTramo(etapa: string, yaVendio: boolean | null, personas: number | null): Tramo {
  const vende = etapa === 'vendiendo' || etapa === 'consolidada' || yaVendio === true
  if (!vende) return 'cero'
  const n = personas ?? 0
  if (n > 200) return 'grande'
  if (n > 10) return 'pyme'
  return 'emprendedor'
}

export function calcularPrecio(tramo: Tramo) {
  const base = TRAMOS[tramo].precioCop
  const iva = Math.round(base * IVA)
  return { base, iva, total: base + iva }
}

export interface Muestra {
  nombre_sugerido: string
  resumen: string
  oportunidad: string
  lo_que_falta: string[]
}

export interface DatosEntrada {
  nombre: string
  idea: string | null
  textoDocumento: string
  tipo_negocio: string | null
  etapa: string | null
  dinero_inicial: string | null
  tiempo_dedicado: string | null
  ya_vendio: boolean | null
  a_quien_vende: string | null
  ciudad: string | null
  pais: string | null
  personas: number | null
}

const ETIQUETA_ETAPA: Record<string, string> = {
  idea: 'Solo tiene la idea',
  armando: 'Ya empezó a armarlo, aún no vende',
  vendiendo: 'Ya vende y quiere fortalecerlo o crecer',
  consolidada: 'Es una empresa consolidada',
}
const ETIQUETA_DINERO: Record<string, string> = {
  nada: 'todavía nada',
  hasta_5: 'hasta $5 millones COP',
  '5_20': 'entre $5 y $20 millones COP',
  '20_100': 'entre $20 y $100 millones COP',
  mas_100: 'más de $100 millones COP',
}
const ETIQUETA_TIEMPO: Record<string, string> = {
  poco: 'menos de 10 horas a la semana',
  medio: 'entre 10 y 30 horas a la semana',
  completo: 'tiempo completo',
}

const LIMITE_TEXTO = 24000

function contexto(d: DatosEntrada): string {
  const doc = d.textoDocumento.trim().slice(0, LIMITE_TEXTO)
  return [
    `Nombre del proyecto: ${d.nombre}`,
    `Etapa: ${ETIQUETA_ETAPA[d.etapa ?? ''] ?? 'sin dato'}`,
    `Tipo de negocio: ${d.tipo_negocio ?? 'sin dato'}`,
    `Dinero disponible para empezar o crecer: ${ETIQUETA_DINERO[d.dinero_inicial ?? ''] ?? 'sin dato'}`,
    `Tiempo que le dedica: ${ETIQUETA_TIEMPO[d.tiempo_dedicado ?? ''] ?? 'sin dato'}`,
    `¿Ya ha vendido?: ${d.ya_vendio === null ? 'sin dato' : d.ya_vendio ? 'sí' : 'todavía no'}`,
    `A quién vende o vendería: ${d.a_quien_vende ?? 'sin dato'}`,
    `Personas que trabajan hoy: ${d.personas ?? 'sin dato'}`,
    `Ciudad y país: ${[d.ciudad, d.pais].filter(Boolean).join(', ') || 'sin dato'}`,
    '',
    'Idea escrita por la persona:',
    d.idea?.trim() || '(no escribió idea; está en el documento)',
    '',
    'Texto del documento que subió:',
    doc || '(no subió documento)',
  ].join('\n')
}

const REGLAS = `REGLAS OBLIGATORIAS:
- Escribe en español claro y sencillo, para una persona que no es experta.
- No inventes cifras, estadísticas, nombres de competidores ni datos de mercado. Si necesitas un número, déjalo como "por validar" o preséntalo como supuesto claramente marcado.
- Usa solo lo que la persona dijo o escribió; lo demás, propónlo como sugerencia y dilo.
- No nombres marcas ni metodologías de terceros.`

export function promptMuestra(d: DatosEntrada): string {
  return `Eres un analista que ayuda a formular proyectos empresariales. Lee la información y prepara un ADELANTO breve y honesto del proyecto.

${REGLAS}

Responde SOLO con un JSON válido, sin texto extra, con esta forma exacta:
{"nombre_sugerido":"...","resumen":"3 a 4 frases sobre qué es el proyecto, para quién y cómo gana dinero","oportunidad":"2 a 3 frases sobre por qué puede funcionar, sin inventar cifras","lo_que_falta":["3 a 5 cosas concretas que el proyecto completo va a resolver o que hoy no están claras"]}

INFORMACIÓN DE LA PERSONA:
${contexto(d)}`
}

/** Las partes del documento completo. Cada una se pide por separado para no pasarse del tiempo. */
export const PARTES: { clave: string; titulo: string; pide: string }[] = [
  {
    clave: 'a',
    titulo: 'Parte 1',
    pide: `Escribe en Markdown estas secciones, con encabezados "##":
## Resumen ejecutivo
## El problema y la oportunidad
## Propuesta de valor
## Cliente objetivo
## Mercado y competencia (cualitativo: tipos de competidores y cómo diferenciarse, sin cifras inventadas)`,
  },
  {
    clave: 'b',
    titulo: 'Parte 2',
    pide: `Escribe en Markdown estas secciones, con encabezados "##":
## Modelo de negocio (cómo se gana dinero, canales, relación con clientes)
## Operación y aspectos técnicos (qué se necesita para producir o prestar el servicio)
## Plan de arranque (primeros 90 días, paso a paso, acorde al dinero y tiempo disponibles)`,
  },
  {
    clave: 'c',
    titulo: 'Parte 3',
    pide: `Escribe en Markdown estas secciones, con encabezados "##":
## Análisis DOFA (debilidades, oportunidades, fortalezas, amenazas, en listas cortas)
## Riesgos principales y cómo reducirlos
## Visión financiera inicial (SOLO como supuestos por validar: qué costos habrá, de dónde vendrán los ingresos, qué hay que calcular. NO inventes montos; usa solo el dinero que la persona dijo tener)
## Metas a 3, 6 y 12 meses
## Lo que debes validar primero (lista corta de verificaciones antes de gastar dinero)`,
  },
]

export function promptParte(d: DatosEntrada, pide: string): string {
  return `Eres un analista que formula proyectos empresariales completos. Con la información de la persona, redacta una parte del documento final del proyecto.

${REGLAS}

${pide}

INFORMACIÓN DE LA PERSONA:
${contexto(d)}`
}

export function leerMuestra(json: unknown): Muestra | null {
  if (!json || typeof json !== 'object') return null
  const j = json as Record<string, unknown>
  const texto = (v: unknown) => (typeof v === 'string' ? v.trim() : '')
  const falta = Array.isArray(j.lo_que_falta) ? j.lo_que_falta.map((x) => texto(x)).filter(Boolean).slice(0, 6) : []
  const m = { nombre_sugerido: texto(j.nombre_sugerido), resumen: texto(j.resumen), oportunidad: texto(j.oportunidad), lo_que_falta: falta }
  return m.resumen ? m : null
}
