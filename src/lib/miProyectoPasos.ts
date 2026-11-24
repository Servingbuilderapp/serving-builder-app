/**
 * MIS PROYECTOS (membresías) — los pasos que el miembro llena él mismo.
 * Basado en la "Guía Serving para redactar tu proyecto" (19 pasos en 6 etapas).
 *
 * Desde el 23 nov 2026 es un proyecto COMPLETO, no un resumen: cada paso se
 * divide en varias preguntas y cada pregunta pide una extensión mínima de
 * caracteres. Un proyecto no se puede marcar como terminado con respuestas de
 * una o dos líneas. Escrito con calma, el documento final queda de muchas hojas.
 *
 * Para cambiar una pregunta, un título, una ayuda o un mínimo, se edita solo este archivo.
 * Cada campo se guarda con su clave (`id`) dentro de las respuestas del proyecto.
 * Las claves que ya existían se conservan, para no perder lo que el miembro ya escribió.
 */

export type CampoPaso = {
  id: string
  etiqueta: string
  ayuda?: string
  /** 'texto' = recuadro de escribir; 'check' = casilla de confirmación. */
  tipo?: 'texto' | 'check'
  filas?: number
  opcional?: boolean
  /** Caracteres mínimos para dar el campo por completo (por defecto 3). */
  minimo?: number
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

/**
 * LA PERILLA DE EXTENSIÓN. Multiplica los mínimos de las preguntas largas (las de 150
 * caracteres o más). Con 2.5, el proyecto terminado queda en unas 45 a 55 hojas ya
 * impreso en formato formal (letra 12, espacio de 1,5). Más alto = más largo; más bajo = más corto.
 */
export const FACTOR_EXTENSION = 2.5

/** Caracteres que caben en una hoja impresa en formato formal (letra 12, espacio 1,5). */
export const CARACTERES_POR_HOJA = 1800

const escalar = (minimo: number): number =>
  minimo >= 150 ? Math.round((minimo * FACTOR_EXTENSION) / 50) * 50 : minimo

/** Atajo para una pregunta de texto con mínimo de caracteres. */
const t = (id: string, etiqueta: string, minimo: number, filas: number, ayuda?: string, opcional?: boolean): CampoPaso => ({
  id,
  etiqueta,
  minimo: escalar(minimo),
  filas,
  ...(ayuda ? { ayuda } : {}),
  ...(opcional ? { opcional: true } : {}),
})

export const ETAPAS_PROYECTO: EtapaProyecto[] = [
  {
    letra: 'A',
    titulo: 'La presentación',
    pasos: [
      {
        n: 1,
        titulo: 'Título y quién presenta',
        ayuda: 'El título debe ser claro, oficial y orientado al beneficio principal. Lo ideal: un verbo de acción más el territorio o la población. Evita siglas poco conocidas. Aquí también cuentas quién presenta el proyecto.',
        campos: [
          t('titulo_opciones', 'Tres opciones de título', 30, 3),
          t('titulo_elegido', 'El título que eliges', 10, 2),
          t('organizacion_ejecutora', 'Quién presenta el proyecto', 250, 6, 'Nombre de la organización o persona, tipo (fundación, empresa, cooperativa, persona natural…), documento o NIT, representante, años de existencia, lo que hace y los proyectos parecidos que ya ha realizado.'),
          t('contacto_responsable', 'Datos de contacto del responsable', 20, 2, 'Nombre, cargo, correo y teléfono.'),
          t('capacidad_tecnica', 'Capacidad técnica: equipo, experiencia y recursos con los que ya cuentas', 300, 5, 'Personas, conocimientos, equipos, espacios y trayectoria que ya tienes y que respaldan que puedes ejecutar este proyecto.'),
        ],
      },
      {
        n: 2,
        titulo: 'Resumen ejecutivo',
        ayuda: 'Un párrafo largo y bien escrito, sin listas. Cuenta en orden: el problema, la solución, a quién ayuda, las actividades principales, el tiempo, el monto y los resultados esperados. Quien lo lea debe entender el valor del proyecto en un minuto. Escríbelo al final si prefieres, cuando ya conozcas todo tu proyecto.',
        campos: [
          t('resumen', 'Resumen ejecutivo', 700, 10),
          t('palabras_clave', 'Palabras clave (de 5 a 8)', 10, 2, undefined, true),
        ],
      },
      {
        n: 3,
        titulo: 'Ubicación',
        ayuda: 'País, región y municipio(s). Si hay varias zonas, indica cuál es la principal y cuáles las secundarias, siempre con los mismos nombres.',
        campos: [
          t('ubicacion', 'Dónde se hará el proyecto', 80, 3),
          t('ubicacion_contexto', 'Cómo es ese territorio y por qué se escoge', 350, 6, 'Población, economía, condiciones de acceso, situación social o ambiental y por qué el proyecto hace falta justo ahí.'),
        ],
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
        ayuda: 'Menciona a la población y al territorio. Explica las causas y los efectos con hechos concretos y con fuente. Un buen problema se demuestra con datos, no solo se afirma.',
        campos: [
          t('problema', 'El problema que vas a resolver', 600, 8, 'Qué pasa, a quién le pasa, dónde y desde cuándo. Al menos tres causas y tres efectos, escritos de forma concreta.'),
          t('problema_evidencia', 'Datos, cifras y fuentes que lo demuestran', 400, 6, 'Cifras oficiales, estudios, encuestas propias o testimonios. Indica de dónde sale cada dato.'),
          t('problema_poblacion_afectada', 'Quiénes lo viven y cómo les afecta', 300, 5),
          t('problema_antecedentes', 'Qué se ha intentado antes y por qué no fue suficiente', 300, 5),
          t('problema_si_no_se_resuelve', 'Qué pasa si el problema no se resuelve', 250, 4),
        ],
      },
      {
        n: 5,
        titulo: 'Objetivos',
        ayuda: 'El objetivo general es una sola frase con verbo en infinitivo (mejorar, fortalecer, aumentar…) que diga quién cambia, qué cambia y dónde. Es el problema dicho en positivo. Los específicos son los pasos medibles para lograrlo.',
        campos: [
          t('objetivo_general', 'Objetivo general', 60, 3),
          t('objetivos_especificos', 'Objetivos específicos (de 3 a 5)', 350, 6, 'Cada uno con su verbo, y cada uno ligado a una causa del problema.'),
          t('objetivo_resultados_esperados', 'Resultados que esperas al terminar', 300, 5),
        ],
      },
      {
        n: 6,
        titulo: 'Árbol de problemas',
        ayuda: 'Ordena el problema central con sus causas y efectos. En cada columna debe leerse causa → problema → efecto. Quita repeticiones. Si citas hechos, que tengan fuente. También puedes apoyarte en la hoja "Árbol de Problemas y Objetivos" de la App de Ideas.',
        campos: [
          t('arbol_problema_central', 'Problema central', 40, 2),
          t('arbol_causas_directas', 'Causas directas', 150, 4),
          t('arbol_causas_indirectas', 'Causas indirectas', 150, 4),
          t('arbol_efectos_directos', 'Efectos directos', 150, 4),
          t('arbol_efectos_indirectos', 'Efectos indirectos', 150, 4),
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
        ayuda: 'Explica tu proyecto con todo el detalle: alcance, grandes bloques de trabajo y forma de operar. Cada bloque se conecta con un objetivo específico. Texto fluido y enfocado en resultados.',
        campos: [
          t('descripcion', 'Descripción detallada de la propuesta', 900, 12),
          t('justificacion', 'Por qué este proyecto, por qué ahora y por qué ustedes', 500, 7),
          t('enfoque_metodologico', 'Cómo van a trabajar (metodología y enfoque)', 400, 6, 'Incluye, si aplica, el enfoque de género, de territorio, de cultura y de inclusión.'),
          t('innovacion', 'Qué tiene de nuevo o diferente', 250, 4),
          t('comparacion_alternativas', 'Qué otras soluciones existen y en qué se diferencia la tuya', 300, 5, 'Otras organizaciones, programas o formas de resolver el mismo problema, y por qué la tuya aporta algo más.'),
          t('marco_normativo', 'Con qué políticas, planes, normas y ODS se alinea', 300, 5, 'Planes de desarrollo, políticas públicas, leyes o metas de los Objetivos de Desarrollo Sostenible con los que tu proyecto conversa.'),
        ],
      },
      {
        n: 8,
        titulo: 'Beneficiarios y metas',
        ayuda: 'Cuántas personas se benefician de forma directa y cuántas de forma indirecta, y qué las caracteriza. Metas realistas, con indicadores y fuentes que lo demuestren. La hoja "Beneficiario Ideal" de la App de Ideas te ayuda.',
        campos: [
          t('benef_directos', 'Beneficiarios directos (cuántos y quiénes)', 200, 4),
          t('benef_indirectos', 'Beneficiarios indirectos (cuántos y quiénes)', 200, 4),
          t('benef_metas', 'Metas, indicadores y de dónde sale el dato', 300, 6),
          t('benef_seleccion', 'Cómo se escogen y cómo se garantiza su participación', 250, 4),
          t('benef_linea_base', 'Cómo está hoy esta población (punto de partida)', 250, 4),
          t('benef_enfoque_diferencial', 'Enfoque diferencial: mujeres, jóvenes, pueblos étnicos, personas con discapacidad, víctimas, etc.', 250, 4, 'Explica cómo el proyecto tiene en cuenta las condiciones particulares de cada grupo.'),
        ],
      },
      {
        n: 9,
        titulo: 'Actividades',
        ayuda: 'Qué se hace en cada bloque, cómo se mide y por qué esas actividades llevan a los productos y a los objetivos. Si usas códigos (1.1, 1.2, 2.1…), inclúyelos y úsalos igual en el cronograma y en el presupuesto.',
        campos: [
          t('actividades', 'Actividades por bloque', 1000, 14),
          t('actividades_responsables', 'Quién hace cada cosa (equipo y perfiles)', 400, 6),
          t('actividades_recursos', 'Qué se necesita para hacerlas (lugares, equipos, materiales)', 300, 5),
          t('actividades_verificacion', 'Cómo se comprueba que cada actividad se hizo', 300, 5, 'Listas de asistencia, fotos, informes, actas, facturas.'),
          t('plan_comunicacion', 'Cómo se dará a conocer el proyecto y sus resultados', 250, 4, 'Convocatoria a los beneficiarios, divulgación, rendición de cuentas y reconocimiento al financiador.'),
        ],
      },
      {
        n: 10,
        titulo: 'Cronograma',
        ayuda: 'Actividades por fases y mes a mes, con qué depende de qué. Usa los mismos códigos que usarás en el presupuesto.',
        campos: [
          t('cronograma', 'Cronograma por fases y por mes', 500, 10),
          t('cronograma_hitos', 'Hitos principales y sus fechas', 250, 4),
          t('cronograma_dependencias', 'Qué actividad depende de cuál', 200, 4),
        ],
      },
      {
        n: 11,
        titulo: 'Duración',
        ayuda: 'Meses totales y, si puedes, fechas de inicio y cierre. Revisa que el tiempo alcance para las metas y que el riesgo no se acumule en una sola fase.',
        campos: [
          t('duracion', 'Duración del proyecto', 60, 3),
          t('duracion_justificacion', 'Por qué ese tiempo es suficiente', 250, 4),
        ],
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
        campos: [
          t('aliados', 'Aliados, su rol y su aporte', 300, 7),
          t('aliados_evidencias', 'Qué documentos tienes de ellos y cuáles faltan', 200, 4),
        ],
      },
      {
        n: 13,
        titulo: 'Contrapartidas',
        ayuda: 'Quién aporta, qué aporta en especie (con valor), cuánto en efectivo y observaciones. Suma el total y confirma que cada aporte se vincule a un producto o tarea.',
        campos: [
          t('contrapartidas', 'Contrapartidas (quién, qué y cuánto)', 300, 7),
          t('contrapartidas_total', 'Total de contrapartidas (en dinero y en especie)', 40, 2),
        ],
      },
      {
        n: 14,
        titulo: 'Monto solicitado',
        ayuda: 'El valor total que pides, justificado con productos y metas. Debe ser coherente con el tamaño del proyecto.',
        campos: [
          t('monto', 'Monto que solicitas y por qué', 200, 4),
          t('monto_fuentes', 'Cómo se reparte entre lo que pides, tus contrapartidas y otras fuentes', 200, 4),
        ],
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
          t('objetivos_fines', 'Fines (lo que se logra al final)', 150, 4),
          t('objetivos_medios', 'Medios (lo que hay que hacer para lograrlo)', 150, 4),
          t('objetivos_coherencia', 'Cómo cada causa del árbol de problemas se vuelve un medio', 250, 5),
        ],
      },
      {
        n: 16,
        titulo: 'Cadena de valor, riesgos y sostenibilidad',
        ayuda: 'Por cada objetivo específico: producto, indicador, unidad, meta y actividades. Debe poder seguirse el camino objetivo → producto → indicador → meta, y las metas deben poder contarse y comprobarse. Aquí también cuentas los riesgos y cómo seguirá el proyecto cuando termine el dinero.',
        campos: [
          t('cadena_valor', 'Objetivo, producto, indicador, meta y actividades', 800, 12),
          t('indicadores_detalle', 'Para cada indicador: cómo se calcula, de dónde sale el dato y cada cuánto', 400, 6),
          t('supuestos', 'Qué debe cumplirse por fuera del proyecto para que funcione', 250, 4),
          t('riesgos_respuestas', 'Principales riesgos y qué harás para manejarlos', 400, 6),
          t('sostenibilidad', 'Cómo seguirá funcionando cuando termine la financiación', 400, 6),
          t('seguimiento_evaluacion', 'Cómo vas a seguir y evaluar el avance', 300, 5),
          t('sostenibilidad_ambiental', 'Impacto ambiental y cómo se maneja', 250, 4, 'Residuos, consumo de recursos, emisiones y medidas para reducir o compensar. Si no aplica, explica por qué.'),
          t('replicabilidad', 'Cómo se puede replicar o crecer después', 250, 4, 'Qué se podría repetir en otros lugares o con otros grupos, y qué haría falta.'),
        ],
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
        ayuda: 'Rubros: talento humano, equipos y software, servicios, materiales e insumos, capacitación y divulgación, viajes, imprevistos, administración y supervisión. Con valor unitario, cantidad y total de cada línea, total general y relación con los códigos de actividades.',
        campos: [
          t('presupuesto', 'Presupuesto por rubros', 800, 14),
          t('presupuesto_justificacion', 'Por qué cada rubro y de dónde salen los precios', 400, 6),
          t('presupuesto_desembolsos', 'Cuándo se gasta cada parte (por fases o por mes)', 250, 4),
          t('gestion_financiera', 'Quién administra el dinero y cómo se controla', 300, 5, 'Responsable financiero, cuenta del proyecto, soportes contables, controles y rendición de cuentas.'),
        ],
      },
      {
        n: 18,
        titulo: 'Revisión de coherencia',
        ayuda: 'Recorre todo el documento: problema, objetivos, solución, productos, beneficiarios, duración y presupuesto deben reforzarse sin contradecirse. Si algo choca (por ejemplo, metas muy grandes para poco tiempo), ajústalo.',
        campos: [
          t('coherencia_revision', 'Cómo se conectan problema, objetivos, actividades, productos y presupuesto', 300, 6),
          t('evaluador_preguntas', 'Preguntas que haría un evaluador y cómo las responderías', 400, 6, 'Ponte en el lugar de quien califica: ¿qué dudas tendría? Escríbelas y responde cada una.'),
          t('coherencia_ajustes', 'Ajustes que hiciste al revisar', 3, 4, undefined, true),
          { id: 'coherencia_ok', etiqueta: 'Recorrí todo el proyecto y es coherente de principio a fin', tipo: 'check' },
        ],
      },
      {
        n: 19,
        titulo: 'Armado final',
        ayuda: 'Reúne todo en un solo documento. Revisa sumas, títulos de tablas, evidencia de cada producto y que no quede ninguna sección obligatoria sin cerrar.',
        campos: [
          t('anexos_lista', 'Lista de anexos que vas a adjuntar', 3, 3, undefined, true),
          t('armado_notas', 'Notas finales o documentos que faltan por conseguir', 3, 3, undefined, true),
          { id: 'armado_ok', etiqueta: 'Revisé sumas, tablas y evidencias, y mi proyecto está listo para postular', tipo: 'check' },
        ],
      },
    ],
  },
]

export const TODOS_LOS_PASOS: PasoProyecto[] = ETAPAS_PROYECTO.flatMap((e) => e.pasos)

export type RespuestasProyecto = Record<string, string>

/** Un campo está completo si tiene el texto mínimo que pide (o la casilla marcada). */
export function campoCompleto(campo: CampoPaso, respuestas: RespuestasProyecto): boolean {
  const v = (respuestas[campo.id] || '').trim()
  if (campo.tipo === 'check') return v === 'si'
  if (campo.opcional) return true
  return v.length >= (campo.minimo ?? 3)
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

/** Tope de largo de cada respuesta. */
export const MAX_CARACTERES_CAMPO = 20000

/** Total de caracteres mínimos que pide todo el proyecto. */
export const MINIMO_TOTAL_CARACTERES: number = TODOS_LOS_PASOS.reduce(
  (suma, p) => suma + p.campos.reduce((a, c) => a + (c.tipo === 'check' || c.opcional ? 0 : (c.minimo ?? 3)), 0),
  0,
)

/** Hojas estimadas (impreso en formato formal) según lo escrito hasta ahora. Incluye portada, índice y cortes por paso. */
export function hojasEstimadas(respuestas: RespuestasProyecto): number {
  const texto = TODOS_LOS_PASOS.reduce(
    (suma, p) => suma + p.campos.reduce((a, c) => a + (c.tipo === 'check' ? 0 : (respuestas[c.id] || '').trim().length), 0),
    0,
  )
  const porPasos = TODOS_LOS_PASOS.reduce((suma, p) => {
    const chars = p.campos.reduce((a, c) => a + (c.tipo === 'check' ? 0 : (respuestas[c.id] || '').trim().length), 0)
    return suma + (chars > 0 ? Math.max(1, Math.ceil(chars / CARACTERES_POR_HOJA)) : 0)
  }, 0)
  return texto > 0 ? porPasos + 3 : 0
}

/** Limpia lo que llega del navegador: solo claves conocidas, solo texto, con tope de largo. */
export function limpiarRespuestas(bruto: unknown): RespuestasProyecto {
  const salida: RespuestasProyecto = {}
  if (!bruto || typeof bruto !== 'object') return salida
  const conocidos = new Set(TODOS_LOS_PASOS.flatMap((p) => p.campos.map((c) => c.id)))
  for (const [k, v] of Object.entries(bruto as Record<string, unknown>)) {
    if (conocidos.has(k) && typeof v === 'string') salida[k] = v.slice(0, MAX_CARACTERES_CAMPO)
  }
  return salida
}
