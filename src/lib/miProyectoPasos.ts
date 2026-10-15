/**
 * MIS PROYECTOS (membresías) — los pasos que el miembro llena él mismo.
 * Basado en la "Guía Serving para redactar tu proyecto" (19 pasos en 6 etapas).
 * Para cambiar una pregunta, un título o una ayuda, se edita solo este archivo.
 * Cada campo se guarda con su clave (`id`) dentro de las respuestas del proyecto.
 */

export type CampoPaso = {
  id: string
  etiqueta: string
  ayuda?: string
  /** 'texto' = recuadro de escribir; 'check' = casilla de confirmación. */
  tipo?: 'texto' | 'check'
  filas?: number
  opcional?: boolean
}

export type PasoProyecto = {
  n: number
  titulo: string
  ayuda: string
  campos: CampoPaso[]
}

export type EtapaProyecto = {
  letra: string
  titulo: string
  pasos: PasoProyecto[]
}

export const ETAPAS_PROYECTO: EtapaProyecto[] = [
  {
    letra: 'A',
    titulo: 'La presentación',
    pasos: [
      {
        n: 1,
        titulo: 'Título',
        ayuda: 'Escribe tres opciones y elige una. Debe ser claro, oficial y orientado al beneficio principal. Lo ideal: un verbo de acción más el territorio o la población. Evita siglas poco conocidas.',
        campos: [
          { id: 'titulo_opciones', etiqueta: 'Tres opciones de título', filas: 3 },
          { id: 'titulo_elegido', etiqueta: 'El título que eliges', filas: 2 },
        ],
      },
      {
        n: 2,
        titulo: 'Resumen ejecutivo',
        ayuda: 'Un solo párrafo de 6 a 8 líneas, sin listas. Cuenta en orden: el problema, la solución, a quién ayuda, las actividades principales y los resultados esperados. Quien lo lea debe entender el valor en un minuto.',
        campos: [{ id: 'resumen', etiqueta: 'Resumen ejecutivo', filas: 8 }],
      },
      {
        n: 3,
        titulo: 'Ubicación',
        ayuda: 'País, región y municipio(s). Si hay varias zonas, indica cuál es la principal y cuáles las secundarias, siempre con los mismos nombres.',
        campos: [{ id: 'ubicacion', etiqueta: 'Dónde se hará el proyecto', filas: 3 }],
      },
    ],
  },
  {
    letra: 'B',
    titulo: 'El diagnóstico',
    pasos: [
      {
        n: 4,
        titulo: 'Problema',
        ayuda: 'De 3 a 5 líneas. Menciona la población y el territorio. Resume al menos tres causas y tres efectos, escritos de forma concreta.',
        campos: [{ id: 'problema', etiqueta: 'El problema que vas a resolver', filas: 6 }],
      },
      {
        n: 5,
        titulo: 'Objetivo general',
        ayuda: 'Una sola frase con verbo en infinitivo (mejorar, fortalecer, aumentar…) que diga quién cambia, qué cambia y dónde. Es el problema dicho en positivo.',
        campos: [{ id: 'objetivo_general', etiqueta: 'Objetivo general', filas: 3 }],
      },
      {
        n: 6,
        titulo: 'Árbol de problemas',
        ayuda: 'Ordena el problema central con sus causas y efectos. En cada columna debe leerse causa → problema → efecto. Quita repeticiones. Si citas hechos, que tengan fuente. También puedes apoyarte en la hoja "Árbol de Problemas y Objetivos" de la App de Ideas.',
        campos: [
          { id: 'arbol_problema_central', etiqueta: 'Problema central', filas: 2 },
          { id: 'arbol_causas_directas', etiqueta: 'Causas directas', filas: 4 },
          { id: 'arbol_causas_indirectas', etiqueta: 'Causas indirectas', filas: 4 },
          { id: 'arbol_efectos_directos', etiqueta: 'Efectos directos', filas: 4 },
          { id: 'arbol_efectos_indirectos', etiqueta: 'Efectos indirectos', filas: 4 },
        ],
      },
    ],
  },
  {
    letra: 'C',
    titulo: 'La propuesta',
    pasos: [
      {
        n: 7,
        titulo: 'Descripción detallada',
        ayuda: 'De 8 a 12 líneas: alcance, grandes bloques de trabajo y forma de operar. Cada bloque se conecta con un objetivo específico. Texto fluido y enfocado en resultados.',
        campos: [{ id: 'descripcion', etiqueta: 'Descripción detallada', filas: 10 }],
      },
      {
        n: 8,
        titulo: 'Beneficiarios y metas',
        ayuda: 'Cuántas personas se benefician de forma directa y cuántas de forma indirecta, y qué las caracteriza. Metas realistas, con indicadores y fuentes que lo demuestren. La hoja "Beneficiario Ideal" de la App de Ideas te ayuda.',
        campos: [
          { id: 'benef_directos', etiqueta: 'Beneficiarios directos (cuántos y quiénes)', filas: 3 },
          { id: 'benef_indirectos', etiqueta: 'Beneficiarios indirectos (cuántos y quiénes)', filas: 3 },
          { id: 'benef_metas', etiqueta: 'Metas, indicadores y de dónde sale el dato', filas: 4 },
        ],
      },
      {
        n: 9,
        titulo: 'Actividades',
        ayuda: 'Qué se hace en cada bloque, cómo se mide y por qué esas actividades llevan a los productos y a los objetivos. Si usas códigos (1.1, 1.2, 2.1…), inclúyelos.',
        campos: [{ id: 'actividades', etiqueta: 'Actividades por bloque', filas: 10 }],
      },
      {
        n: 10,
        titulo: 'Cronograma',
        ayuda: 'Actividades por fases, con qué depende de qué. Usa los mismos códigos que usarás en el presupuesto.',
        campos: [{ id: 'cronograma', etiqueta: 'Cronograma por fases', filas: 8 }],
      },
      {
        n: 11,
        titulo: 'Duración',
        ayuda: 'Meses totales y, si puedes, fechas de inicio y cierre. Revisa que el tiempo alcance para las metas y que el riesgo no se acumule en una sola fase.',
        campos: [{ id: 'duracion', etiqueta: 'Duración del proyecto', filas: 3 }],
      },
    ],
  },
  {
    letra: 'D',
    titulo: 'Los apoyos y el dinero',
    pasos: [
      {
        n: 12,
        titulo: 'Aliados',
        ayuda: 'Nombre, rol, tipo de aporte (dinero, especie o gestión) y la evidencia (carta, correo o acta). Procura tener al menos un aporte concreto y documentado.',
        campos: [{ id: 'aliados', etiqueta: 'Aliados, su rol y su aporte', filas: 6 }],
      },
      {
        n: 13,
        titulo: 'Contrapartidas',
        ayuda: 'Quién aporta, qué aporta en especie (con valor), cuánto en efectivo y observaciones. Suma el total y confirma que cada aporte se vincule a un producto o tarea.',
        campos: [{ id: 'contrapartidas', etiqueta: 'Contrapartidas (quién, qué y cuánto)', filas: 6 }],
      },
      {
        n: 14,
        titulo: 'Monto solicitado',
        ayuda: 'El valor total que pides, justificado con productos y metas. Debe ser coherente con el tamaño del proyecto.',
        campos: [{ id: 'monto', etiqueta: 'Monto que solicitas y por qué', filas: 4 }],
      },
    ],
  },
  {
    letra: 'E',
    titulo: 'La lógica completa',
    pasos: [
      {
        n: 15,
        titulo: 'Árbol de objetivos',
        ayuda: 'El mismo árbol de problemas en positivo: fines arriba, objetivo general al centro, medios abajo. Cada causa tiene un medio y cada efecto tiene un fin.',
        campos: [
          { id: 'objetivos_fines', etiqueta: 'Fines (lo que se logra al final)', filas: 4 },
          { id: 'objetivos_medios', etiqueta: 'Medios (lo que hay que hacer para lograrlo)', filas: 4 },
        ],
      },
      {
        n: 16,
        titulo: 'Cadena de valor',
        ayuda: 'Por cada objetivo específico: producto, indicador, unidad, meta y actividades. Debe poder seguirse el camino objetivo → producto → indicador → meta, y las metas deben poder contarse y comprobarse.',
        campos: [{ id: 'cadena_valor', etiqueta: 'Objetivo, producto, indicador, meta y actividades', filas: 10 }],
      },
    ],
  },
  {
    letra: 'F',
    titulo: 'El cierre',
    pasos: [
      {
        n: 17,
        titulo: 'Presupuesto por rubros',
        ayuda: 'Rubros: talento humano, equipos y software, servicios, materiales e insumos, capacitación y divulgación, viajes, imprevistos, administración y supervisión. Con total general y relación con los códigos de actividades.',
        campos: [{ id: 'presupuesto', etiqueta: 'Presupuesto por rubros', filas: 10 }],
      },
      {
        n: 18,
        titulo: 'Revisión de coherencia',
        ayuda: 'Recorre todo el documento: problema, objetivos, solución, productos, beneficiarios, duración y presupuesto deben reforzarse sin contradecirse. Si algo choca (por ejemplo, metas muy grandes para poco tiempo), ajústalo.',
        campos: [
          { id: 'coherencia_ajustes', etiqueta: 'Ajustes que hiciste al revisar', filas: 4, opcional: true },
          { id: 'coherencia_ok', etiqueta: 'Recorrí todo el proyecto y es coherente de principio a fin', tipo: 'check' },
        ],
      },
      {
        n: 19,
        titulo: 'Armado final',
        ayuda: 'Reúne todo en un solo documento. Revisa sumas, títulos de tablas, evidencia de cada producto y que no quede ninguna sección obligatoria sin cerrar.',
        campos: [
          { id: 'armado_notas', etiqueta: 'Notas finales o documentos que faltan por conseguir', filas: 3, opcional: true },
          { id: 'armado_ok', etiqueta: 'Revisé sumas, tablas y evidencias, y mi proyecto está listo para postular', tipo: 'check' },
        ],
      },
    ],
  },
]

export const TODOS_LOS_PASOS: PasoProyecto[] = ETAPAS_PROYECTO.flatMap((e) => e.pasos)

export type RespuestasProyecto = Record<string, string>

/** Un campo está completo si tiene texto de verdad (o la casilla marcada). */
export function campoCompleto(campo: CampoPaso, respuestas: RespuestasProyecto): boolean {
  const v = (respuestas[campo.id] || '').trim()
  if (campo.tipo === 'check') return v === 'si'
  if (campo.opcional) return true
  return v.length >= 3
}

export function pasoCompleto(paso: PasoProyecto, respuestas: RespuestasProyecto): boolean {
  return paso.campos.every((c) => campoCompleto(c, respuestas))
}

export function pasosCompletos(respuestas: RespuestasProyecto): number {
  return TODOS_LOS_PASOS.filter((p) => pasoCompleto(p, respuestas)).length
}

export function porcentajeProyecto(respuestas: RespuestasProyecto): number {
  return Math.round((pasosCompletos(respuestas) / TODOS_LOS_PASOS.length) * 100)
}

/** Limpia lo que llega del navegador: solo claves conocidas, solo texto, con tope de largo. */
export function limpiarRespuestas(bruto: unknown): RespuestasProyecto {
  const salida: RespuestasProyecto = {}
  if (!bruto || typeof bruto !== 'object') return salida
  const conocidos = new Set(TODOS_LOS_PASOS.flatMap((p) => p.campos.map((c) => c.id)))
  for (const [k, v] of Object.entries(bruto as Record<string, unknown>)) {
    if (conocidos.has(k) && typeof v === 'string') salida[k] = v.slice(0, 6000)
  }
  return salida
}
