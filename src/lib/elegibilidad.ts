/**
 * VEREDICTO DE ELEGIBILIDAD — "¿puedo postularme a esta convocatoria?"
 *
 * Compara las condiciones que guarda la biblioteca (quién puede postular,
 * monto máximo, consorcio, contrapartida, requisitos habilitantes, madurez)
 * contra lo que se sabe del proyecto. Es honesto sobre lo que no sabe: si falta
 * el dato, dice "por confirmar" en vez de inventar un sí o un no.
 *
 * Cuatro resultados:
 *   elegible       → cumple lo que podemos comprobar y no hay nada extra que probar
 *   con_evidencia  → puede postular, pero tiene que demostrar algo (consorcio,
 *                    contrapartida, documentos habilitantes, madurez)
 *   falta          → hay algo que lo deja fuera tal como está (tipo de postulante o monto)
 *   por_confirmar  → no tenemos datos suficientes para decidir
 */

export type EstadoElegibilidad = 'elegible' | 'con_evidencia' | 'falta' | 'por_confirmar'

export type VeredictoElegibilidad = {
  estado: EstadoElegibilidad
  /** Etiqueta corta para el sello. */
  etiqueta: string
  /** Frases sencillas que explican el veredicto. */
  razones: string[]
}

/** Lo que la biblioteca sabe de la convocatoria (todos los campos pueden venir vacíos). */
export type CondicionesConvocatoria = {
  tipo_postulante?: string[] | null
  monto_maximo?: number | null
  moneda?: string | null
  contrapartida_exigida?: boolean | null
  contrapartida_detalle?: string | null
  consorcio_obligatorio?: boolean | null
  requisitos_habilitantes?: string | null
  madurez_financiable?: string | null
  verificada_en?: string | null
}

/** Lo que se sabe del proyecto. */
export type PerfilProyecto = {
  /** Texto del formulario ("Persona Natural", "Empresa Constituida"…), si lo llenó. */
  tipoSolicitante?: string | null
  montoSolicitadoCop?: number | null
}

/** Cómo se presenta cada tipo de solicitante del formulario frente a los tipos que exigen los pliegos. */
const TIPOS_POR_SOLICITANTE: Record<string, string[]> = {
  'persona natural': ['persona_natural'],
  'persona natural con establecimiento': ['persona_natural', 'empresa'],
  'empresa constituida': ['empresa', 'empresa_social'],
  'entidad sin ánimo de lucro': ['esal', 'ong', 'fundacion'],
  'asociación o cooperativa': ['cooperativa', 'esal'],
  'consorcio o unión temporal': ['consorcio'],
  'entidad pública': ['entidad_publica'],
}

const NOMBRE_TIPO: Record<string, string> = {
  ong: 'ONG',
  fundacion: 'fundación',
  esal: 'entidad sin ánimo de lucro',
  empresa: 'empresa',
  empresa_social: 'empresa social',
  universidad: 'universidad',
  centro_investigacion: 'centro de investigación',
  entidad_publica: 'entidad pública',
  persona_natural: 'persona natural',
  consorcio: 'consorcio',
  cooperativa: 'cooperativa',
}

function pesos(valor: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(valor)
}

function tieneTexto(valor: string | null | undefined): boolean {
  return typeof valor === 'string' && valor.trim().length > 0
}

export function veredictoElegibilidad(conv: CondicionesConvocatoria, perfil: PerfilProyecto): VeredictoElegibilidad {
  const faltas: string[] = []
  const pruebas: string[] = []
  const notas: string[] = []
  let comprobadoAlgo = false

  /* ---- 1. Quién puede postular ---- */
  const exigidos = (conv.tipo_postulante || []).filter(Boolean)
  const tipoDelProyecto = perfil.tipoSolicitante ? TIPOS_POR_SOLICITANTE[perfil.tipoSolicitante.trim().toLowerCase()] : undefined

  if (exigidos.length > 0 && tipoDelProyecto) {
    comprobadoAlgo = true
    const coincide = exigidos.some((t) => tipoDelProyecto.includes(t))
    if (!coincide) {
      const quienes = exigidos.map((t) => NOMBRE_TIPO[t] || t).join(', ')
      faltas.push(`Pide que postule: ${quienes}. Tu proyecto se presenta como ${perfil.tipoSolicitante}.`)
    }
  } else if (exigidos.length > 0) {
    const quienes = exigidos.map((t) => NOMBRE_TIPO[t] || t).join(', ')
    notas.push(`Pide que postule: ${quienes}. Confirma que tu proyecto se presenta así.`)
  }

  /* ---- 2. Monto ---- */
  const esPesos = !conv.moneda || conv.moneda.trim().toUpperCase() === 'COP'
  if (conv.monto_maximo && conv.monto_maximo > 0 && perfil.montoSolicitadoCop && perfil.montoSolicitadoCop > 0 && esPesos) {
    comprobadoAlgo = true
    if (perfil.montoSolicitadoCop > conv.monto_maximo) {
      faltas.push(
        `Tu proyecto pide ${pesos(perfil.montoSolicitadoCop)} y la convocatoria entrega como máximo ${pesos(conv.monto_maximo)}. Hay que ajustar el presupuesto.`,
      )
    }
  }

  /* ---- 3. Lo que hay que demostrar ---- */
  if (conv.consorcio_obligatorio === true) {
    pruebas.push('Exige consorcio o alianza: necesitas aliados para postular.')
  }
  if (conv.contrapartida_exigida === true) {
    pruebas.push(
      tieneTexto(conv.contrapartida_detalle)
        ? `Exige contrapartida: ${conv.contrapartida_detalle!.trim()}`
        : 'Exige contrapartida: tienes que poner una parte del costo.',
    )
  }
  if (tieneTexto(conv.requisitos_habilitantes)) {
    pruebas.push('Pide documentos o condiciones habilitantes. Sin ellos no reciben la postulación.')
  }
  if (tieneTexto(conv.madurez_financiable)) {
    pruebas.push(`Pide un proyecto en esta etapa: ${conv.madurez_financiable!.trim()}.`)
  }

  /* ---- 4. Qué tan fresca está la información ---- */
  if (conv.verificada_en) {
    const dias = Math.round((Date.now() - new Date(conv.verificada_en).getTime()) / 86400000)
    if (Number.isFinite(dias) && dias > 120) {
      notas.push('Esta información se revisó hace más de 4 meses. Confírmala en la página oficial.')
    }
  }

  /* ---- Veredicto ---- */
  if (faltas.length > 0) {
    return { estado: 'falta', etiqueta: 'Falta algo', razones: [...faltas, ...pruebas, ...notas] }
  }
  if (pruebas.length > 0) {
    return { estado: 'con_evidencia', etiqueta: 'Elegible con evidencia', razones: [...pruebas, ...notas] }
  }
  if (comprobadoAlgo) {
    return { estado: 'elegible', etiqueta: 'Elegible', razones: ['Cumple lo que pudimos comprobar.', ...notas] }
  }
  return {
    estado: 'por_confirmar',
    etiqueta: 'Por confirmar',
    razones: [
      notas.length > 0 ? notas[0] : 'Todavía no tenemos datos suficientes de esta convocatoria para decirte si puedes postular.',
      ...notas.slice(1),
    ],
  }
}
