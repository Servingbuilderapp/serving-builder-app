import { NextResponse } from 'next/server'
import { callGemini } from '@/lib/gemini'
import { VerticalId, TipoAccesoSocio } from '@/types/verticales'

export interface DiagnosticoInput {
  nombre: string
  empresa: string
  email: string
  whatsapp: string
  verticalId?: VerticalId
  tipoAcceso?: TipoAccesoSocio
  tipoProyecto: 'emprendimiento' | 'formalizacion' | 'social' | 'ambiental' | 'tecnologia'
  estadoLegal: 'idea' | 'persona_natural' | 'sas_tramite' | 'sas_constituida' | 'fundacion_esal'
  tipoFinanciamiento: 'capital_semilla' | 'cooperacion_internacional' | 'becas_premios' | 'cofinanciacion' | 'credito_inversion'
  montoObjetivo: string
  descripcion: string
}

export interface FondoSugerido {
  nombre: string
  entidad: string
  tipo: string
  coincidenciaPorcentaje: number
  montoEstimado: string
  descripcion: string
  requisitosClave: string[]
}

export interface DiagnosticoResultado {
  scores: {
    formalizacionLegal: number // 0-100
    elegibilidadFinanciera: number // 0-100
    madurezProyecto: number // 0-100
    preparacionConvocatorias: number // 0-100
  }
  resumenEjecutivo: string
  fondosSugeridos: FondoSugerido[]
  brechasCriticas: string[]
  pasosRecomendados: string[]
  planRecomendado: 'explorador' | 'basic' | 'growth' | 'professional' | 'elite' | 'master'
  estatusSocio?: TipoAccesoSocio
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const data: DiagnosticoInput = body

    // 1. Algoritmo base de puntuación determinista
    let formalizacionLegal = 35
    if (data.estadoLegal === 'sas_constituida') formalizacionLegal = 92
    else if (data.estadoLegal === 'fundacion_esal') formalizacionLegal = 88
    else if (data.estadoLegal === 'sas_tramite') formalizacionLegal = 68
    else if (data.estadoLegal === 'persona_natural') formalizacionLegal = 48

    let madurezProyecto = 50
    if (data.descripcion && data.descripcion.length > 80) madurezProyecto += 20
    if (data.tipoProyecto === 'tecnologia' || data.tipoProyecto === 'ambiental') madurezProyecto += 15
    if (data.tipoProyecto === 'social') madurezProyecto += 10
    
    // Bonificación de Madurez por Estatus de Socio Anual VIP
    if (data.tipoAcceso === 'socio_anual') {
      madurezProyecto += 10
    }
    madurezProyecto = Math.min(98, madurezProyecto)

    let elegibilidadFinanciera = 60
    if (data.tipoFinanciamiento === 'cooperacion_internacional' && (data.tipoProyecto === 'social' || data.tipoProyecto === 'ambiental')) {
      elegibilidadFinanciera = 90
    } else if (data.tipoFinanciamiento === 'capital_semilla' && (data.tipoProyecto === 'emprendimiento' || data.tipoProyecto === 'tecnologia' || data.tipoProyecto === 'formalizacion')) {
      elegibilidadFinanciera = 94
    } else if (data.tipoFinanciamiento === 'becas_premios') {
      elegibilidadFinanciera = 82
    }

    let preparacionConvocatorias = Math.round((formalizacionLegal * 0.4) + (madurezProyecto * 0.3) + (elegibilidadFinanciera * 0.3))

    // 2. Fondos adaptados según vertical oficial seleccionada
    const fondosBase: FondoSugerido[] = []

    // Adaptación por Verticales
    if (data.verticalId === 'agro_ganaderia') {
      fondosBase.push({
        nombre: 'MADR - El Campo Emprende & Finagro ICR',
        entidad: 'Ministerio de Agricultura & FINAGRO',
        tipo: 'Cofinanciación Rural & Incentivo Capitalizable',
        coincidenciaPorcentaje: 96,
        montoEstimado: '$40M - $160M COP',
        descripcion: 'Subvenciones directas para proyectos productivos agropecuarios, ganadería sostenible e infraestructura rural.',
        requisitosClave: ['Predio o contrato de arriendo registrado', 'Asociatividad o plan productivo', 'Aval técnico']
      })
    } else if (data.verticalId === 'salud_mental') {
      fondosBase.push({
        nombre: 'Convocatoria Salud Mental & Bienestar Comunitario',
        entidad: 'MINSALUD / Fondos Internacionales de Salud Pública',
        tipo: 'Subvención de Impacto Social',
        coincidenciaPorcentaje: 95,
        montoEstimado: '$50M - $200M COP',
        descripcion: 'Financiación de programas preventivos en salud mental, resiliencia comunitaria y apoyo psicosocial.',
        requisitosClave: ['Equipo profesional registrado', 'Metodología de intervención comunitarios', 'Indicadores de salud pública']
      })
    } else if (data.verticalId === 'educacion') {
      fondosBase.push({
        nombre: 'Vouchers de Educación & Fondo Formativo SENA',
        entidad: 'MINEDUCACIÓN & SENA',
        tipo: 'Capital Semilla & Cofinanciación EdTech',
        coincidenciaPorcentaje: 94,
        montoEstimado: '$30M - $140M COP',
        descripcion: 'Apoyo a proyectos de tecnología educativa, capacitación técnica y democratización del aprendizaje.',
        requisitosClave: ['Contenidos educativos validados', 'Plataforma o modelo pedagógico', 'Medición de egresados']
      })
    } else if (data.verticalId === 'liderazgo') {
      fondosBase.push({
        nombre: 'Fondo de Formación en Liderazgo & Gobernanza Local',
        entidad: 'Escuela de Gobierno ESAP / Fundaciones Internacionales',
        tipo: 'Subvención & Beca Institucional',
        coincidenciaPorcentaje: 92,
        montoEstimado: '$25M - $100M COP',
        descripcion: 'Fortalecimiento de capacidades directivas, veeduría ciudadana y liderazgo de mujeres/jóvenes.',
        requisitosClave: ['Aval comunitario o institucional', 'Plan de estudios/formación', 'Impacto en gobernanza']
      })
    }

    // Fondo Emprender SENA
    const matchFondoEmprender = (data.tipoProyecto === 'emprendimiento' || data.tipoProyecto === 'tecnologia' || data.verticalId === 'emprendimiento')
      ? Math.min(98, preparacionConvocatorias + 10)
      : 70

    fondosBase.push({
      nombre: 'Fondo Emprender SENA',
      entidad: 'SENA / Gobierno de Colombia',
      tipo: 'Capital Semilla No Reembolsable',
      coincidenciaPorcentaje: matchFondoEmprender,
      montoEstimado: 'Hasta $100M - $180M COP',
      descripcion: 'Capital Semilla condonable para la creación e inicio de operaciones de nuevas empresas en Colombia.',
      requisitosClave: ['Plan de negocio formalizado', 'Asesoría y validación SENA', 'Constitución de empresa en territorio nacional']
    })

    // APC Colombia & Cooperación Internacional
    const matchAPC = (data.tipoProyecto === 'social' || data.tipoProyecto === 'ambiental' || data.verticalId === 'proyectos_sociales' || data.verticalId === 'medio_ambiente')
      ? 95
      : 65

    fondosBase.push({
      nombre: 'APC Colombia - Fondo Cooperación Sur-Sur',
      entidad: 'Agencia Presidencial de Cooperación',
      tipo: 'Subvención No Reembolsable / Cooperación Técnica',
      coincidenciaPorcentaje: matchAPC,
      montoEstimado: '$20,000 USD - $150,000 USD',
      descripcion: 'Fondos para proyectos de impacto social, sostenibilidad, desarrollo rural y equidad comunitaria.',
      requisitosClave: ['Estructura formal o alianza con ESAL', 'Matriz de marco lógico detallada', 'Indicadores de impacto medibles']
    })

    // BID Lab / DRK Foundation
    const matchBID = (data.tipoProyecto === 'tecnologia' || data.verticalId === 'innovacion_tecnologica' || data.verticalId === 'desarrollo_empresarial')
      ? 94
      : 60

    fondosBase.push({
      nombre: 'BID Lab & DRK Foundation',
      entidad: 'Banco Interamericano de Desarrollo / Draper Richards Kaplan',
      tipo: 'Capital Semilla & Aceleración de Impacto',
      coincidenciaPorcentaje: matchBID,
      montoEstimado: '$50,000 USD - $300,000 USD',
      descripcion: 'Inversión y subvenciones para emprendimientos de innovación social y soluciones tecnológicas escalables.',
      requisitosClave: ['Modelo de negocio sostenible', 'Equipo multidisciplinario', 'Prueba de concepto o MVP validado']
    })

    // 3. Generar análisis cualitativo
    const socioPrefix = data.tipoAcceso === 'socio_anual' ? '[SOCIO ANUAL VIP] ' : ''
    let resumenEjecutivo = `${socioPrefix}El proyecto "${data.empresa || data.nombre}" (Vertical: ${data.verticalId || 'General'}) presenta un nivel de preparación global del ${preparacionConvocatorias}%. Su perfil demuestra alto potencial para acceder a convocatorias de ${data.tipoFinanciamiento.replace(/_/g, ' ')}.`

    const brechasCriticas: string[] = []
    const pasosRecomendados: string[] = []

    if (data.tipoAcceso === 'socio_anual') {
      pasosRecomendados.push('Acceder al canal directo de radicación preferencial en 32 pasos con prioridad de revisión.')
    }

    if (data.estadoLegal === 'idea' || data.estadoLegal === 'persona_natural') {
      brechasCriticas.push('Pendiente formalización jurídica de sociedad (SAS/ESAL) requerida para desembolsos directos.')
      pasosRecomendados.push('Completar trámite de constitución jurídica y obtención de RUT ante Cámara de Comercio.')
    } else {
      brechasCriticas.push('Optimizar los estados financieros proyectados y la estructura de costos operativos.')
      pasosRecomendados.push('Consolidar la memoria de cálculo presupuestal según los rubros financiables del fondo objetivo.')
    }

    brechasCriticas.push('Definición de Matriz de Marco Lógico MGA y KPIs de impacto verificables.')
    pasosRecomendados.push('Estructurar los indicadores de producto e impacto bajo la metodología MGA.')

    // Determinar plan recomendado
    let planRecomendado: DiagnosticoResultado['planRecomendado'] = 'growth'
    if (preparacionConvocatorias < 50) planRecomendado = 'basic'
    else if (preparacionConvocatorias >= 80) planRecomendado = 'professional'

    const resultado: DiagnosticoResultado = {
      scores: {
        formalizacionLegal,
        elegibilidadFinanciera,
        madurezProyecto,
        preparacionConvocatorias
      },
      resumenEjecutivo,
      fondosSugeridos: fondosBase.sort((a, b) => b.coincidenciaPorcentaje - a.coincidenciaPorcentaje),
      brechasCriticas,
      pasosRecomendados,
      planRecomendado,
      estatusSocio: data.tipoAcceso || 'estandar'
    }

    return NextResponse.json(resultado)
  } catch (error: any) {
    console.error('Error en /api/diagnostico:', error)
    return NextResponse.json(
      { error: error.message || 'Error al procesar el diagnóstico' },
      { status: 500 }
    )
  }
}
