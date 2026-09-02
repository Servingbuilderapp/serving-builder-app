/**
 * Modalidades de estructuración.
 *
 * Son DOS, y solo dos:
 *   - Estructuración Estratégica  ($12.000.000 COP + IVA)  -> id interno `esencial`
 *   - Estructuración Élite        ($17.000.000 COP + IVA)  -> id interno `completo`
 *
 * Los identificadores `esencial` y `completo` NO se cambian: son los que
 * quedan guardados en la base de datos de los proyectos. Lo que se muestra
 * al cliente es el nombre visible.
 *
 * Las dos modalidades no compiten entre sí: se describen por propósito
 * (a qué tipo de convocatoria apunta cada una), no como "básica" y "avanzada".
 */

export type RangoCapitalId = 'esencial' | 'completo'

export interface PlanEstructuracionMapeado {
  id: RangoCapitalId
  nombre: string
  subtitulo: string
  rangoCapitalText: string
  /** Precio BASE en pesos, SIN IVA. Es el número con el que se calcula todo. */
  honorariosBase: number
  honorariosEstructuracion: string
  honorariosEstructuracionDetalle: string
  duracionEntrega: string
  garantiaAcompanamiento: string
  desgloseTecnico: {
    componenteTecnico: string
    componenteFinanciero: string
    componenteLegal: string
  }
  incluye: string[]
}

/**
 * El trabajo técnico es EL MISMO en las dos modalidades.
 *
 * Lo único que cambia entre Estratégica y Élite es el TIEMPO de búsqueda y el
 * nivel de atención. No hay una modalidad "para lo nacional" y otra "para lo
 * internacional": en las dos se formula lo que la convocatoria exija, sea un
 * fondo público colombiano o un cooperante extranjero.
 */
const DESGLOSE_TECNICO_COMUN = {
  componenteTecnico:
    'Formulación completa con la metodología que exija la convocatoria: MGA, Marco Lógico o Teoría del Cambio, con indicadores medibles.',
  componenteFinanciero:
    'Presupuesto detallado por rubros financiables, plan de ventas, nómina y flujo de caja proyectado a 5 años.',
  componenteLegal:
    'Acompañamiento en la constitución o el ajuste de la figura jurídica, régimen tributario y gobernanza de socios.'
}

export const ESTRUCTURACION_ESTRATEGICA: PlanEstructuracionMapeado = {
  id: 'esencial',
  nombre: 'Estructuración Estratégica',
  subtitulo: 'Formulación completa de tu proyecto y tres meses buscando convocatorias',
  rangoCapitalText: 'Tres meses de búsqueda y acompañamiento',
  honorariosBase: 12000000,
  honorariosEstructuracion: '$12.000.000 COP + IVA',
  honorariosEstructuracionDetalle: 'Honorarios de Estructuración — modalidad de tres meses',
  duracionEntrega: 'Entrega en 5 días hábiles desde que completas el formulario',
  garantiaAcompanamiento: 'Garantía 3+3: si en 3 meses no consigues la financiación, te damos 3 meses más sin costo',
  desgloseTecnico: DESGLOSE_TECNICO_COMUN,
  incluye: [
    'Diagnóstico incluido',
    'Formulación completa del proyecto',
    '3 meses de búsqueda de convocatorias',
    'Encaje con los términos de referencia',
    '3 meses adicionales de cortesía si no se gana nada'
  ]
}

export const ESTRUCTURACION_ELITE: PlanEstructuracionMapeado = {
  id: 'completo',
  nombre: 'Estructuración Élite',
  subtitulo: 'El acompañamiento más completo: seis meses de búsqueda y encaje prioritario',
  rangoCapitalText: 'Seis meses de búsqueda y atención prioritaria',
  honorariosBase: 17000000,
  honorariosEstructuracion: '$17.000.000 COP + IVA',
  honorariosEstructuracionDetalle:
    'Honorarios de Estructuración — modalidad de seis meses con atención prioritaria',
  duracionEntrega: 'Entrega en 5 días hábiles desde que completas el formulario',
  garantiaAcompanamiento: 'Garantía 6+6: si en 6 meses no consigues la financiación, te damos 6 meses más sin costo',
  desgloseTecnico: DESGLOSE_TECNICO_COMUN,
  incluye: [
    'Todo lo de la Estructuración Estratégica',
    '6 meses de búsqueda de convocatorias',
    'Encaje prioritario con los términos de referencia',
    '6 meses adicionales de cortesía si no se gana nada',
    'Atención prioritaria'
  ]
}

export const MODALIDADES_ESTRUCTURACION: PlanEstructuracionMapeado[] = [
  ESTRUCTURACION_ESTRATEGICA,
  ESTRUCTURACION_ELITE
]

/**
 * Sugiere una modalidad a partir de lo que el cliente respondió en el
 * diagnóstico. Es una SUGERENCIA: el cliente puede escoger la otra.
 *
 * Las dos modalidades hacen el mismo trabajo técnico. Lo que cambia es el
 * tiempo de búsqueda: 3 meses en la Estratégica y 6 en la Élite.
 *
 * Por eso se sugiere Élite cuando la búsqueda pinta larga — montos altos,
 * cooperación internacional, fondos en divisas o convocatorias que abren pocas
 * veces al año. No porque el proyecto sea "de otra clase".
 */
export function clasificarRangoCapital(montoObjetivo: string): PlanEstructuracionMapeado {
  const texto = (montoObjetivo || '').toLowerCase()

  const senalesDeBusquedaLarga = [
    'usd',
    'eur',
    'dólar',
    'dolar',
    'euro',
    'internacional',
    'cooperacion',
    'cooperación',
    'multilateral',
    'global',
    '300m',
    '300.000.000',
    '100.000'
  ]

  if (senalesDeBusquedaLarga.some((senal) => texto.includes(senal))) {
    return ESTRUCTURACION_ELITE
  }

  return ESTRUCTURACION_ESTRATEGICA
}

export interface GenerarWhatsappOptions {
  nombre: string
  empresa: string
  whatsapp: string
  email: string
  scorePreparacion: number
  montoObjetivo: string
  planMapeado: PlanEstructuracionMapeado
}

/** WhatsApp de contacto público de Serving. */
export const WHATSAPP_SERVING = '573227008727'

export function generarUrlWhatsappBloque2(options: GenerarWhatsappOptions): string {
  const { nombre, empresa, email, scorePreparacion, montoObjetivo, planMapeado } = options

  const texto = [
    `*SOLICITUD DE FORMALIZACIÓN DE ESTRUCTURACIÓN - ARQUITECTURA DIGITAL*`,
    ``,
    `*Líder / Solicitante:* ${nombre}`,
    `*Proyecto / Organización:* ${empresa || nombre}`,
    `*Correo Electrónico:* ${email}`,
    `*Score Diagnóstico Gratuito:* ${scorePreparacion}% (Apto para Postulación)`,
    `*Meta de Financiamiento:* ${montoObjetivo}`,
    ``,
    `*MODALIDAD SELECCIONADA:* ${planMapeado.nombre}`,
    `*Enfoque:* ${planMapeado.subtitulo}`,
    `*Honorarios de Estructuración:* ${planMapeado.honorariosEstructuracion}`,
    `*Garantía:* ${planMapeado.garantiaAcompanamiento}`,
    ``,
    `Hola equipo de *Arquitectura Digital*, acabo de completar mi Diagnóstico Gratuito. Deseo formalizar la contratación de los Honorarios de Estructuración para mi proyecto y recibir la propuesta formal.`
  ].join('\n')

  return `https://wa.me/${WHATSAPP_SERVING}?text=${encodeURIComponent(texto)}`
}
