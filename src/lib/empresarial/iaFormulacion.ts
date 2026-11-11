/**
 * IA (Gemini) para Formulación (Camino A). Opcional y siempre como SUGERENCIA.
 * Mismos filtros que Oportunidades: sin fuentes, sin enlaces y sin porcentajes ni montos
 * que la persona no haya dado. Nada se guarda sin que la persona lo acepte.
 */
import { REGLAS_SIN_INVENTAR, limpiarTextoIA, traeCifraInventada } from '@/lib/empresarial/iaOportunidades'

export const CAMPOS_IA = ['justificacion', 'objetivo_general', 'alcance', 'exclusiones'] as const
export type CampoIA = (typeof CAMPOS_IA)[number]

export interface ContextoFormulacionIA {
  nombre: string
  perfil: string | null
  pais: string | null
  tipo_proyecto: string
  sector: string
  ubicacion: string
  problema: string
  justificacion: string
  objetivo_general: string
  alcance: string
  exclusiones: string
  beneficiarios: string[]
  objetivos_especificos: string[]
  resultados: string[]
  antecedentes: string
}

export interface SugerenciasFormulacion {
  campos: Partial<Record<CampoIA, string>>
  objetivos_especificos: string[]
  resultados: string[]
}

const linea = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()

function textoContexto(c: ContextoFormulacionIA): string {
  const filas: string[] = [
    `Proyecto: ${linea(c.nombre)}`,
    `Perfil: ${c.perfil ?? 'sin definir'}. País: ${c.pais ?? 'sin definir'}.`,
    `Tipo de proyecto: ${linea(c.tipo_proyecto) || '(vacío)'}`,
    `Sector: ${linea(c.sector) || '(vacío)'}. Dónde: ${linea(c.ubicacion) || '(vacío)'}`,
    `Problema u oportunidad: ${linea(c.problema).slice(0, 700) || '(vacío)'}`,
    `Justificación escrita: ${linea(c.justificacion).slice(0, 500) || '(vacía)'}`,
    `Antecedentes (lo que ya se comprobó): ${linea(c.antecedentes).slice(0, 900) || '(vacío)'}`,
    `Beneficiarios o clientes: ${c.beneficiarios.map(linea).join(' | ') || '(vacío)'}`,
    `Objetivo general escrito: ${linea(c.objetivo_general) || '(vacío)'}`,
    `Objetivos específicos escritos: ${c.objetivos_especificos.map(linea).join(' | ') || '(vacío)'}`,
    `Alcance escrito: ${linea(c.alcance).slice(0, 500) || '(vacío)'}`,
    `Exclusiones escritas: ${linea(c.exclusiones).slice(0, 400) || '(vacío)'}`,
    `Resultados esperados escritos: ${c.resultados.map(linea).join(' | ') || '(vacío)'}`,
  ]
  return filas.join('\n')
}

export function datosBaseFormulacion(c: ContextoFormulacionIA): string {
  return textoContexto(c)
}

export function armarPromptFormulacion(c: ContextoFormulacionIA): string {
  const faltan: string[] = []
  if (!linea(c.justificacion)) faltan.push('"justificacion": por qué vale la pena el proyecto (máx. 50 palabras)')
  if (!linea(c.objetivo_general)) faltan.push('"objetivo_general": una sola frase que empiece con verbo en infinitivo (máx. 35 palabras)')
  if (!linea(c.alcance)) faltan.push('"alcance": qué incluye el proyecto (máx. 50 palabras)')
  if (!linea(c.exclusiones)) faltan.push('"exclusiones": qué NO incluye el proyecto (máx. 40 palabras)')
  if (c.objetivos_especificos.length === 0)
    faltan.push('"objetivos_especificos": lista de 2 o 3 objetivos, cada uno con verbo en infinitivo (máx. 25 palabras cada uno)')
  if (c.resultados.length === 0)
    faltan.push('"resultados": lista de 2 o 3 resultados esperados, cambios que se podrán comprobar (máx. 25 palabras cada uno)')
  return `Eres un asistente de Arquitectura Digital de Proyectos. Ayudas a una persona a redactar la formulación de su proyecto empresarial, sin inventar nada.

${REGLAS_SIN_INVENTAR}
- No pongas fechas, plazos ni cantidades que la persona no haya dado.
- El problema NO es la falta de una solución (no escribas "falta una app"). Los objetivos dicen qué se quiere lograr, no qué se va a comprar.

Propón SOLO estas partes, que están vacías. Si lo entregado no alcanza, pon null (o una lista vacía):
${faltan.map((x) => `- ${x}`).join('\n') || '- (nada: todo está escrito)'}

DATOS DE LA PERSONA:
${textoContexto(c)}

Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después, con exactamente las claves pedidas arriba.`
}

const lista = (valor: unknown, maximo: number, cuantos: number, datosBase: string): string[] => {
  if (!Array.isArray(valor)) return []
  const salida: string[] = []
  for (const x of valor.slice(0, cuantos + 2)) {
    const texto = limpiarTextoIA(x, maximo)
    if (!texto || texto.toLowerCase() === 'null') continue
    if (traeCifraInventada(texto, datosBase)) continue
    if (salida.some((s) => s.toLowerCase() === texto.toLowerCase())) continue
    salida.push(texto)
    if (salida.length === cuantos) break
  }
  return salida
}

/** Convierte la respuesta de la IA en sugerencias limpias, solo para lo que está vacío. */
export function interpretarFormulacion(respuesta: unknown, c: ContextoFormulacionIA): SugerenciasFormulacion {
  const salida: SugerenciasFormulacion = { campos: {}, objetivos_especificos: [], resultados: [] }
  if (!respuesta || typeof respuesta !== 'object') return salida
  const o = respuesta as Record<string, unknown>
  const datosBase = datosBaseFormulacion(c)
  const vacio: Record<CampoIA, boolean> = {
    justificacion: !linea(c.justificacion),
    objetivo_general: !linea(c.objetivo_general),
    alcance: !linea(c.alcance),
    exclusiones: !linea(c.exclusiones),
  }
  for (const campo of CAMPOS_IA) {
    if (!vacio[campo]) continue
    const texto = limpiarTextoIA(o[campo], 450)
    if (texto && texto.toLowerCase() !== 'null' && !traeCifraInventada(texto, datosBase)) salida.campos[campo] = texto
  }
  if (c.objetivos_especificos.length === 0) salida.objetivos_especificos = lista(o.objetivos_especificos, 300, 3, datosBase)
  if (c.resultados.length === 0) salida.resultados = lista(o.resultados, 300, 3, datosBase)
  return salida
}

export const haySugerencias = (s: SugerenciasFormulacion) =>
  Object.keys(s.campos).length > 0 || s.objetivos_especificos.length > 0 || s.resultados.length > 0
