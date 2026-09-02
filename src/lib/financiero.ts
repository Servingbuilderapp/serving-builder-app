export interface ResultadoHonorarios {
  montoSolicitadoNum: number
  tipoHonorarios: 'revision' | 'exito' | 'fijo'
  valorDisplay: string
  valorNumerico: number
  honorariosTexto: string
  descripcion: string
  requiereRevisionManual: boolean
  esModalidadExito: boolean
  aplicaFondoEmprender: boolean
}

/**
 * Normaliza cualquier entrada de texto o número a valor entero en COP
 */
export function parseMontoCOP(montoInput: number | string): number {
  if (typeof montoInput === 'number') {
    return Math.max(0, Math.floor(montoInput))
  }

  if (!montoInput) return 0

  // Extraer dígitos del string
  const cleaned = String(montoInput).replace(/[^0-9]/g, '')
  const parsed = parseInt(cleaned, 10)
  return isNaN(parsed) ? 0 : parsed
}

/**
 * Evalúa los montos solicitados al fondo según las reglas comerciales de Arquitectura Digital:
 * - Menor a $30M: Revisión técnica
 * - $30M a $49.9M: Modalidad a éxito ($0 COP inicial)
 * - $50M a $120M: $9.000.000 COP de Honorarios de Estructuración
 * - $121M a $299M: $12.000.000 COP de Honorarios de Estructuración
 * - Mayor a $300M: $17.000.000 COP de Honorarios de Estructuración
 */
export function calcularHonorariosEstructuracion(montoInput: number | string): ResultadoHonorarios {
  const montoSolicitadoNum = parseMontoCOP(montoInput)

  // 1. Menor a $30M COP
  if (montoSolicitadoNum < 30000000) {
    return {
      montoSolicitadoNum,
      tipoHonorarios: 'revision',
      valorDisplay: 'Sujeto a Revisión',
      valorNumerico: 0,
      honorariosTexto: 'Honorarios de Estructuración: Sujetos a Evaluación',
      descripcion: 'Para proyectos menores a $30.000.000 COP, la solicitud requiere una revisión técnica previa de viabilidad.',
      requiereRevisionManual: true,
      esModalidadExito: false,
      aplicaFondoEmprender: true
    }
  }

  // 2. De $30M a $49.9M COP
  if (montoSolicitadoNum >= 30000000 && montoSolicitadoNum < 50000000) {
    return {
      montoSolicitadoNum,
      tipoHonorarios: 'exito',
      valorDisplay: '$0 COP (A Éxito)',
      valorNumerico: 0,
      honorariosTexto: 'Honorarios de Estructuración: $0 COP (Modalidad a Éxito)',
      descripcion: 'Para este rango de financiamiento, la estructuración se realiza bajo modalidad a éxito sin cobro inicial.',
      requiereRevisionManual: false,
      esModalidadExito: true,
      aplicaFondoEmprender: true
    }
  }

  // 3. De $50M a $120M COP
  if (montoSolicitadoNum >= 50000000 && montoSolicitadoNum <= 120000000) {
    return {
      montoSolicitadoNum,
      tipoHonorarios: 'fijo',
      valorDisplay: '$9.000.000 COP',
      valorNumerico: 9000000,
      honorariosTexto: 'Honorarios de Estructuración: $9.000.000 COP',
      descripcion: 'Honorarios de Estructuración técnica formal para proyectos de $50M a $120M COP con garantía extendida.',
      requiereRevisionManual: false,
      esModalidadExito: false,
      aplicaFondoEmprender: true
    }
  }

  // 4. De $121M a $299M COP
  if (montoSolicitadoNum > 120000000 && montoSolicitadoNum < 300000000) {
    return {
      montoSolicitadoNum,
      tipoHonorarios: 'fijo',
      valorDisplay: '$12.000.000 COP + IVA',
      valorNumerico: 12000000,
      honorariosTexto: 'Honorarios de Estructuración: $12.000.000 COP',
      descripcion: 'Honorarios de Estructuración para convocatorias de $121M a $299M COP con acompañamiento continuo por hitos.',
      requiereRevisionManual: false,
      esModalidadExito: false,
      aplicaFondoEmprender: true
    }
  }

  // 5. Mayor o igual a $300M COP
  return {
    montoSolicitadoNum,
    tipoHonorarios: 'fijo',
    valorDisplay: '$17.000.000 COP + IVA',
    valorNumerico: 17000000,
    honorariosTexto: 'Honorarios de Estructuración: $17.000.000 COP',
    descripcion: 'Honorarios de Estructuración técnica avanzada para proyectos de gran escala, alianzas y cooperación internacional.',
    requiereRevisionManual: false,
    esModalidadExito: false,
    aplicaFondoEmprender: true
  }
}
