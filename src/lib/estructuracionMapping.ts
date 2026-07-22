export type RangoCapitalId = 'inicial' | 'crecimiento' | 'avanzado'

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

export function clasificarRangoCapital(montoObjetivo: string): PlanEstructuracionMapeado {
  const montoLower = (montoObjetivo || '').toLowerCase()

  // 1. Plan Inicial / Microproyectos: Hasta $30.000.000 COP
  if (
    (montoLower.includes('30m') && !montoLower.includes('80m') && !montoLower.includes('250m')) ||
    montoLower.includes('micro') ||
    montoLower.includes('semilla inicial')
  ) {
    return {
      id: 'inicial',
      nombre: 'Plan Inicial / Microproyectos',
      subtitulo: 'Fases Tempranas - Ruta Emprendedora SENA',
      rangoCapitalText: 'Hasta $30.000.000 COP',
      honorariosEstructuracion: '$7.000.000 COP',
      honorariosEstructuracionDetalle: 'Honorarios de Estructuración para microproyectos e ideación',
      duracionEntrega: 'Entrega Técnica en 20 días hábiles',
      garantiaAcompanamiento: 'Garantía 3+3 meses de acompañamiento activo',
      desgloseTecnico: {
        componenteTecnico: 'Ficha técnica resumida SENA / Formato simplificado de ideación y propuesta de valor.',
        componenteFinanciero: 'Estructura básica de costos, precio de venta y margen de rentabilidad unitario.',
        componenteLegal: 'Orientación para registro como Persona Natural con RUT y formalización básica.'
      },
      incluye: [
        'Ficha Técnica Simplificada SENA',
        'Presupuesto de Inversión y Análisis de Costos',
        'Asesoría en Requisitos de Postulación',
        '3 Meses de Acompañamiento en Búsqueda'
      ]
    }
  }

  // 3. Plan Avanzado: $73.000.000 a $300.000.000 COP y superiores (o montos en USD)
  if (
    montoLower.includes('usd') ||
    montoLower.includes('100.000') ||
    montoLower.includes('300m') ||
    montoLower.includes('más de $100.000') ||
    montoLower.includes('global') ||
    montoLower.includes('cooperacion')
  ) {
    return {
      id: 'avanzado',
      nombre: 'Plan Avanzado / Expansión y Fortalecimiento',
      subtitulo: 'Planes de Alto Impacto, APC Colombia, BID Lab & DRK Foundation',
      rangoCapitalText: '$73.000.000 a $300.000.000 COP (y Fondos Internacionales USD)',
      honorariosEstructuracion: '$17.000.000 COP',
      honorariosEstructuracionDetalle: 'Honorarios de Estructuración para convocatorias complejas e internacionales',
      duracionEntrega: 'Entrega Técnica Integral en 30 días calendario',
      garantiaAcompanamiento: 'Garantía Extendida de 12 meses de radicación y seguimiento continuo',
      desgloseTecnico: {
        componenteTecnico: 'Matriz de Marco Lógico Internacional, Teoría del Cambio e indicadores socioambientales medibles.',
        componenteFinanciero: 'Modelación Financiera Multimoneda (USD / EUR / COP) con flujo de caja proyectado a 5 años y análisis de sensibilidad.',
        componenteLegal: 'Dossier institucional para alianzas estratégicas, régimen tributario ESAL/SAS y gobernanza para transferencias internacionales.'
      },
      incluye: [
        'Matriz de Marco Lógico & Teoría del Cambio',
        'Modelación Financiera Multimoneda a 5 Años',
        'Dossier Técnico Traducido para Cooperación (APC / BID)',
        'Estructuración Jurídica y Gobernanza Institucional',
        '12 Meses de Acompañamiento Continuo'
      ]
    }
  }

  // 2. Plan Crecimiento (Por defecto para rangos $30M - $80M COP, $80M - $180M COP)
  return {
    id: 'crecimiento',
    nombre: 'Plan Crecimiento / Convocatoria Estándar',
    subtitulo: 'Líneas de Creación y Formalización - Fondo Emprender SENA',
    rangoCapitalText: '$30.000.000 a $73.000.000 COP (hasta $180.000.000 COP)',
    honorariosEstructuracion: '$12.000.000 COP',
    honorariosEstructuracionDetalle: 'Honorarios de Estructuración Estándar para convocatorias nacionales',
    duracionEntrega: 'Entrega Técnica Profesional en 30 días calendario',
    garantiaAcompanamiento: 'Garantía 6+6 meses: si no ganas en 6 meses, recibes +6 meses gratis',
    desgloseTecnico: {
      componenteTecnico: 'Formulación completa bajo metodología MGA (Metodología General Ajustada) y requerimientos SENA.',
      componenteFinanciero: 'Presupuesto detallado por rubros financiables, plan de ventas, nómina y flujo de caja proyectado a 5 años.',
      componenteLegal: 'Acompañamiento en la constitución de la sociedad SAS ante Cámara de Comercio y gobernanza de socios.'
    },
    incluye: [
      'Formulación MGA & Plan de Negocio SENA',
      'Presupuesto Detallado y Flujo de Caja 5 Años',
      'Acompañamiento en Constitución SAS / RUT',
      '6 Meses de Búsqueda y Radicación Activa',
      'Garantía 6+6 de Acompañamiento Extendido'
    ]
  }
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
    `*PLAN ASIGNADO:* ${planMapeado.nombre}`,
    `*Enfoque:* ${planMapeado.subtitulo}`,
    `*Honorarios de Estructuración:* ${planMapeado.honorariosEstructuracion}`,
    `*Garantía:* ${planMapeado.garantiaAcompanamiento}`,
    ``,
    `Hola equipo de *Arquitectura Digital*, acabo de completar mi Diagnóstico Gratuito. Deseo formalizar la contratación de los Honorarios de Estructuración para mi proyecto y recibir la propuesta formal.`
  ].join('\n')

  return `https://wa.me/573000000000?text=${encodeURIComponent(texto)}`
}
