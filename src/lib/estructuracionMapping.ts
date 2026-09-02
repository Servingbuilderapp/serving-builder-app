/**
 * Modalidades de estructuración.
 *
 * Son DOS, y solo dos:
 *   - Estructuración Estratégica  ($12.000.000 COP)  -> id interno `esencial`
 *   - Estructuración Élite        ($17.000.000 COP)  -> id interno `completo`
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

export const ESTRUCTURACION_ESTRATEGICA: PlanEstructuracionMapeado = {
  id: 'esencial',
  nombre: 'Estructuración Estratégica',
  subtitulo: 'Para convocatorias nacionales: ministerios, banca de desarrollo y fondos públicos',
  rangoCapitalText: 'Convocatorias nacionales en pesos',
  honorariosEstructuracion: '$12.000.000 COP',
  honorariosEstructuracionDetalle: 'Honorarios de Estructuración para convocatorias nacionales',
  duracionEntrega: 'Entrega en 5 días hábiles desde que completas el formulario',
  garantiaAcompanamiento: 'Garantía 3+3: si en 3 meses no consigues la financiación, te damos 3 meses más sin costo',
  desgloseTecnico: {
    componenteTecnico:
      'Formulación completa bajo metodología MGA (Metodología General Ajustada) y requerimientos SENA.',
    componenteFinanciero:
      'Presupuesto detallado por rubros financiables, plan de ventas, nómina y flujo de caja proyectado a 5 años.',
    componenteLegal:
      'Acompañamiento en la constitución de la sociedad SAS ante Cámara de Comercio y gobernanza de socios.'
  },
  incluye: [
    'Formulación MGA & Plan de Negocio SENA',
    'Presupuesto Detallado y Flujo de Caja 5 Años',
    'Acompañamiento en Constitución SAS / RUT',
    '3 meses de búsqueda y radicación activa',
    'Garantía 3+3 de acompañamiento extendido'
  ]
}

export const ESTRUCTURACION_ELITE: PlanEstructuracionMapeado = {
  id: 'completo',
  nombre: 'Estructuración Élite',
  subtitulo: 'Para cooperación internacional y convocatorias multilaterales, con dossier traducido',
  rangoCapitalText: 'Cooperación internacional y fondos en divisas',
  honorariosEstructuracion: '$17.000.000 COP',
  honorariosEstructuracionDetalle:
    'Honorarios de Estructuración para convocatorias complejas e internacionales',
  duracionEntrega: 'Entrega en 5 días hábiles desde que completas el formulario',
  garantiaAcompanamiento: 'Garantía 6+6: si en 6 meses no consigues la financiación, te damos 6 meses más sin costo',
  desgloseTecnico: {
    componenteTecnico:
      'Matriz de Marco Lógico Internacional, Teoría del Cambio e indicadores socioambientales medibles.',
    componenteFinanciero:
      'Modelación Financiera Multimoneda (USD / EUR / COP) con flujo de caja proyectado a 5 años y análisis de sensibilidad.',
    componenteLegal:
      'Dossier institucional para alianzas estratégicas, régimen tributario ESAL/SAS y gobernanza para transferencias internacionales.'
  },
  incluye: [
    'Matriz de Marco Lógico & Teoría del Cambio',
    'Modelación Financiera Multimoneda a 5 Años',
    'Dossier Técnico Traducido para Cooperación',
    'Estructuración Jurídica y Gobernanza Institucional',
    '6 meses de búsqueda y radicación activa',
    'Garantía 6+6 de acompañamiento extendido'
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
 * Se va a Élite cuando lo que busca apunta a cooperación internacional o a
 * fondos en divisas. En cualquier otro caso, Estratégica.
 */
export function clasificarRangoCapital(montoObjetivo: string): PlanEstructuracionMapeado {
  const texto = (montoObjetivo || '').toLowerCase()

  const senalesInternacionales = [
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

  if (senalesInternacionales.some((senal) => texto.includes(senal))) {
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
