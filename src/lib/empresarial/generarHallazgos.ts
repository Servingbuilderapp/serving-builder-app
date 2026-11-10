/**
 * Hallazgos, brechas, recomendaciones y alertas del diagnóstico empresarial.
 *
 * Es una función pura: con las mismas respuestas siempre produce lo mismo.
 * No usa inteligencia artificial y no calcula cifras nuevas: parte de los
 * puntajes que ya salieron de calculoDiagnostico.ts y de las respuestas.
 * (Más adelante la IA podrá redactar mejor estos textos, pero las reglas de
 * clasificación quedan aquí, reproducibles.)
 *
 * Reglas:
 *  - Dimensión con puntaje 4,0 o más (de 5)  → fortaleza.
 *  - Dimensión con puntaje menor a 3,0       → debilidad, con gravedad:
 *      menor a 2,0 = Alto · de 2,0 a 2,49 = Medio · de 2,5 a 2,99 = Bajo.
 *  - Dimensión sin información suficiente    → brecha de información.
 *  - Cada debilidad trae su brecha (situación actual vs. deseada) y una
 *    recomendación con acciones, plazo y forma de medirla.
 *  - La causa probable de cada brecha es una hipótesis (causa_confirmada = false).
 *  - No se usa la alerta "Crítica": queda para cuando el dueño confirme reglas
 *    exactas por pregunta.
 */

import type { ResultadoDiagnostico } from './calculoDiagnostico'

export type Gravedad = 'Bajo' | 'Medio' | 'Alto' | 'Crítico'
export type Prioridad = 'baja' | 'media' | 'alta' | 'estratégica'
export type NivelAlerta = 'Informativa' | 'Preventiva' | 'Importante' | 'Crítica'
export type TipoHallazgo = 'fortaleza' | 'debilidad' | 'brecha_informacion'
export type ConfianzaGen = 'provisional' | 'baja' | 'media' | 'alta'

export interface DimensionEntrada {
  id: string
  codigo: string
  nombre: string
}
export interface PreguntaEntrada {
  id: string
  dimension_id: string
  codigo: string
  texto: string
  peso: number
}
export interface RespuestaEntrada {
  pregunta_id: string
  estado_respuesta: string
  valor: number | null
}

export interface HallazgoGen {
  id: string
  dimension_id: string
  tipo: TipoHallazgo
  descripcion: string
  gravedad: Gravedad | null
  confianza: ConfianzaGen
}
export interface BrechaGen {
  hallazgo_id: string
  situacion_actual: string
  situacion_deseada: string
  causa_probable: string
  causa_confirmada: boolean
  consecuencia: string
  prioridad: Prioridad
}
export interface RecomendacionGen {
  hallazgo_id: string
  titulo: string
  descripcion: string
  acciones: string[]
  prioridad: Prioridad
  plazo: string
  resultado_esperado: string
}
export interface AlertaGen {
  nivel: NivelAlerta
  descripcion: string
  regla: string
}
export interface SalidaHallazgos {
  hallazgos: HallazgoGen[]
  brechas: BrechaGen[]
  recomendaciones: RecomendacionGen[]
  alertas: AlertaGen[]
}

export interface EntradaHallazgos {
  perfil: 'A' | 'C' | 'D'
  dimensiones: DimensionEntrada[]
  preguntas: PreguntaEntrada[]
  respuestas: RespuestaEntrada[]
  calculo: ResultadoDiagnostico
  nuevoId: () => string
}

export const UMBRAL_FORTALEZA = 4
export const UMBRAL_DEBILIDAD = 3

interface TextoDimension {
  deseada: string
  causa: string
  consecuencia: string
  acciones: [string, string, string]
  medida: string
}

/** Textos base por dimensión. Perfiles C y D: EST…SOS. Perfil A: IDE…VAL. */
const TEXTOS: Record<string, TextoDimension> = {
  EST: {
    deseada: 'Una dirección clara: propósito, objetivos medibles y un plan escrito que el equipo conozca.',
    causa: 'Es probable que la dirección esté en la cabeza de quien lidera y no esté escrita ni medida.',
    consecuencia: 'Sin dirección escrita es difícil priorizar, decidir inversiones y alinear al equipo.',
    acciones: [
      'Escribir en una página el propósito, la visión y tres objetivos para los próximos 12 meses.',
      'Convertir cada objetivo en una meta con cifra y fecha.',
      'Compartir el plan con el equipo y revisarlo cada trimestre.',
    ],
    medida: 'Objetivos con meta y fecha escritos, y revisados al menos una vez por trimestre.',
  },
  COM: {
    deseada: 'Conocer bien a sus clientes, tener canales de venta definidos y medir sus ventas con regularidad.',
    causa: 'Es probable que las ventas dependan de pocos clientes o canales y que no se midan de forma ordenada.',
    consecuencia: 'Sin conocer al cliente ni medir las ventas, el crecimiento depende de la suerte.',
    acciones: [
      'Describir a los tres tipos de cliente más importantes y qué necesita cada uno.',
      'Registrar cada mes ventas por cliente, producto y canal.',
      'Definir una meta de ventas y una acción comercial concreta para alcanzarla.',
    ],
    medida: 'Ventas registradas cada mes y comparadas con la meta.',
  },
  FIN: {
    deseada: 'Saber cuánto cuesta cada producto o servicio, cuánto se gana y cuánta caja se necesita.',
    causa: 'Es probable que los costos y los ingresos no se lleven por separado o que no se proyecten.',
    consecuencia: 'Sin cifras claras se pueden tomar decisiones que consumen la caja o vender por debajo del costo.',
    acciones: [
      'Calcular el costo real de cada producto o servicio principal.',
      'Llevar un registro mensual de ingresos, costos y gastos, separado del dinero personal.',
      'Proyectar la caja de los próximos tres meses.',
    ],
    medida: 'Margen por producto conocido y caja proyectada a tres meses.',
  },
  OPE: {
    deseada: 'Procesos definidos, con responsable, controles de calidad y capacidad conocida.',
    causa: 'Es probable que el trabajo dependa de la costumbre de las personas y no de procedimientos escritos.',
    consecuencia: 'Sin procesos claros hay reprocesos, desperdicios y dificultad para crecer sin perder calidad.',
    acciones: [
      'Dibujar los tres procesos más importantes, paso a paso, con un responsable por cada uno.',
      'Definir qué se revisa para asegurar la calidad antes de entregar.',
      'Calcular cuánto se puede producir o atender hoy sin afectar la calidad.',
    ],
    medida: 'Procesos clave documentados y capacidad máxima calculada.',
  },
  TEC: {
    deseada: 'Herramientas digitales útiles, información ordenada y respaldada, y accesos protegidos.',
    causa: 'Es probable que la información esté dispersa y que no haya hábitos de respaldo y seguridad.',
    consecuencia: 'Se pierde tiempo, se repiten tareas y la información puede perderse o quedar expuesta.',
    acciones: [
      'Hacer una lista de las herramientas y archivos que usa el negocio y dónde está cada uno.',
      'Activar copias de seguridad automáticas y verificación en dos pasos en las cuentas principales.',
      'Elegir una tarea repetitiva para automatizar este trimestre.',
    ],
    medida: 'Copias de seguridad activas y una tarea automatizada.',
  },
  ORG: {
    deseada: 'Funciones y responsables definidos, equipo capacitado y liderazgo que delega.',
    causa: 'Es probable que muchas decisiones y tareas dependan de una sola persona.',
    consecuencia: 'Si esa persona falta, el negocio se frena; y el equipo no crece.',
    acciones: [
      'Escribir quién responde por cada área o tarea crítica.',
      'Definir qué decisiones puede tomar cada persona sin consultar.',
      'Armar un plan de formación con una capacitación por persona al año.',
    ],
    medida: 'Cada tarea crítica con un responsable y un suplente.',
  },
  LEG: {
    deseada: 'Negocio formalizado, con contratos claros, obligaciones al día y vencimientos controlados.',
    causa: 'Es probable que falten revisiones periódicas de permisos, contratos y obligaciones.',
    consecuencia: 'Puede haber sanciones, conflictos o pérdida de oportunidades por no cumplir requisitos.',
    acciones: [
      'Hacer una lista de permisos, registros y contratos vigentes con su fecha de vencimiento.',
      'Identificar qué normas de su sector le aplican.',
      'Consultar con un profesional legal los puntos que no tenga claros.',
    ],
    medida: 'Calendario de vencimientos al día y revisión legal hecha.',
  },
  SOS: {
    deseada: 'Conocer sus impactos económicos, sociales y ambientales y tener planes de continuidad.',
    causa: 'Es probable que no se hayan identificado los impactos ni los riesgos de interrupción.',
    consecuencia: 'Sin planes de continuidad, una interrupción o un cambio de reglas puede afectar al negocio.',
    acciones: [
      'Listar los principales impactos del negocio en las personas y el ambiente.',
      'Elegir un indicador sencillo (por ejemplo, residuos o consumo de energía) y medirlo.',
      'Escribir un plan breve de qué hacer si el negocio se interrumpe.',
    ],
    medida: 'Un indicador ambiental o social medido y un plan de continuidad escrito.',
  },
  IDE: {
    deseada: 'Poder explicar su idea en pocas frases: qué ofrece, a quién y cómo.',
    causa: 'Es probable que la idea todavía esté en forma de intuición y falte ponerla por escrito.',
    consecuencia: 'Una idea difusa dificulta explicarla, probarla y conseguir apoyo.',
    acciones: [
      'Escribir la idea en dos frases: qué ofrece, para quién y qué cambia para esa persona.',
      'Definir el producto o servicio mínimo con el que podría empezar.',
      'Pedir a tres personas que expliquen con sus palabras lo que entendieron.',
    ],
    medida: 'Descripción de la idea en dos frases que otras personas entienden.',
  },
  PRO: {
    deseada: 'Conocer bien el problema: a quién afecta, con qué frecuencia y qué pasa si no se resuelve.',
    causa: 'Es probable que el problema se haya supuesto y no se haya visto de cerca.',
    consecuencia: 'Si el problema no es real o no es importante, nadie querrá pagar por la solución.',
    acciones: [
      'Describir el problema, a quién afecta y con qué frecuencia.',
      'Hablar con cinco personas afectadas y anotar con sus palabras cómo lo viven.',
      'Anotar cómo lo resuelven hoy y qué les cuesta esa solución.',
    ],
    medida: 'Cinco conversaciones registradas con personas afectadas.',
  },
  MER: {
    deseada: 'Saber quién compraría, cuántos son y qué alternativas existen hoy.',
    causa: 'Es probable que falte información sobre los posibles clientes y la competencia.',
    consecuencia: 'Sin conocer el mercado es fácil calcular mal la demanda y el precio.',
    acciones: [
      'Describir al cliente ideal: quién es, dónde está y cuánto podría pagar.',
      'Listar cinco alternativas que ese cliente usa hoy y qué le falta a cada una.',
      'Estimar cuántos clientes podría atender el primer año y explicar cómo lo calculó.',
    ],
    medida: 'Cliente ideal descrito y cinco alternativas analizadas.',
  },
  CAP: {
    deseada: 'Contar con los conocimientos y el tiempo para llevar la idea adelante, y saber qué falta.',
    causa: 'Es probable que falten conocimientos clave o tiempo disponible para la idea.',
    consecuencia: 'Faltar capacidades clave retrasa el proyecto o lo vuelve dependiente de otros.',
    acciones: [
      'Listar lo que sabe hacer y lo que la idea necesita; marcar la diferencia.',
      'Decidir qué aprenderá, qué delegará y qué buscará en un aliado.',
      'Definir cuántas horas a la semana dedicará a la idea.',
    ],
    medida: 'Lista de capacidades faltantes con un plan para cada una.',
  },
  REC: {
    deseada: 'Saber con qué recursos cuenta y cuáles necesita para arrancar.',
    causa: 'Es probable que no se haya calculado qué se necesita para empezar.',
    consecuencia: 'Arrancar sin conocer los recursos necesarios puede detener el proyecto a mitad de camino.',
    acciones: [
      'Listar lo que necesita para arrancar: dinero, equipos, espacio, personas y permisos.',
      'Marcar qué ya tiene, qué puede conseguir prestado y qué debe comprar.',
      'Estimar el costo de los primeros tres meses.',
    ],
    medida: 'Lista de recursos con lo que ya se tiene y lo que falta.',
  },
  VAL: {
    deseada: 'Haber comprobado con posibles clientes que la idea interesa antes de invertir.',
    causa: 'Es probable que la idea aún no se haya puesto a prueba con personas reales.',
    consecuencia: 'Invertir sin comprobar puede llevar a construir algo que nadie quiere.',
    acciones: [
      'Elegir la suposición más importante de la idea y escribirla como algo que se puede comprobar.',
      'Diseñar una prueba pequeña: una entrevista, una encuesta o una preventa.',
      'Anotar los resultados y decidir si sigue, cambia o se detiene.',
    ],
    medida: 'Una prueba hecha con al menos diez personas y sus resultados registrados.',
  },
}

const TEXTO_GENERICO: TextoDimension = {
  deseada: 'Prácticas definidas, escritas y revisadas con regularidad.',
  causa: 'Es probable que esta área se maneje de forma informal.',
  consecuencia: 'Sin prácticas definidas es difícil mejorar y crecer con orden.',
  acciones: [
    'Escribir cómo se hace hoy esta área.',
    'Definir un responsable y una meta.',
    'Revisar el avance cada mes.',
  ],
  medida: 'Prácticas escritas y revisadas cada mes.',
}

/** Alertas por una sola pregunta (perfiles C y D). Solo con la respuesta más baja (1). */
const ALERTAS_PREGUNTA: Record<string, string> = {
  'TEC-07': 'No haces copias de seguridad de tu información: si algo falla, podrías perderla.',
  'OPE-08': 'No tienes identificados tus proveedores críticos: si uno falla, tu operación puede detenerse.',
  'OPE-10': 'No tienes cómo prevenir interrupciones en tu operación.',
  'SOS-12': 'No tienes un plan de continuidad ante interrupciones.',
}

function gravedadDe(puntaje15: number): Gravedad {
  if (puntaje15 < 2) return 'Alto'
  if (puntaje15 < 2.5) return 'Medio'
  return 'Bajo'
}

function prioridadDe(g: Gravedad): Prioridad {
  if (g === 'Alto' || g === 'Crítico') return 'alta'
  if (g === 'Medio') return 'media'
  return 'baja'
}

function plazoDe(p: Prioridad): string {
  if (p === 'alta') return 'Primeros 30 días'
  if (p === 'media') return 'De 30 a 60 días'
  return 'De 60 a 90 días'
}

const entreComillas = (t: string) => `«${t.trim()}»`

export function generarHallazgos(e: EntradaHallazgos): SalidaHallazgos {
  const { dimensiones, preguntas, respuestas, calculo, nuevoId } = e
  const salida: SalidaHallazgos = { hallazgos: [], brechas: [], recomendaciones: [], alertas: [] }
  if (!calculo.calculable) return salida

  const resp = new Map(respuestas.map((r) => [r.pregunta_id, r]))
  const confianza: ConfianzaGen = calculo.confianza ?? 'provisional'

  const debiles: { nombre: string; puntaje: number; codigo: string }[] = []
  const sinInfo: string[] = []

  for (const dim of dimensiones) {
    const puntaje = calculo.dimensiones.find((d) => d.dimension_id === dim.id)
    if (!puntaje) continue
    const textos = TEXTOS[dim.codigo] ?? TEXTO_GENERICO
    const delaDim = preguntas.filter((p) => p.dimension_id === dim.id && p.peso > 0)

    const bajas = delaDim.filter((p) => {
      const r = resp.get(p.id)
      return r?.estado_respuesta === 'respondida' && r.valor !== null && r.valor <= 2
    })
    const altas = delaDim.filter((p) => {
      const r = resp.get(p.id)
      return r?.estado_respuesta === 'respondida' && r.valor === 5
    })

    // 1. Información insuficiente
    if (!puntaje.informacion_suficiente || puntaje.puntaje_1_5 === null) {
      sinInfo.push(dim.nombre)
      const id = nuevoId()
      salida.hallazgos.push({
        id,
        dimension_id: dim.id,
        tipo: 'brecha_informacion',
        descripcion: `En «${dim.nombre}» respondiste el ${Math.round(puntaje.cobertura)} % de las preguntas que te aplican. Con eso no alcanza para calcular su puntaje.`,
        gravedad: 'Bajo',
        confianza: 'baja',
      })
      salida.recomendaciones.push({
        hallazgo_id: id,
        titulo: `Completar «${dim.nombre}»`,
        descripcion: 'Falta información para evaluar esta parte. Lo que no sepas, déjalo como «No sé»: no te resta puntos.',
        acciones: [
          'Volver a esta parte y responder las preguntas que quedaron en blanco.',
          'Si no tienes el dato, buscar quién en tu equipo lo conoce.',
        ],
        prioridad: 'media',
        plazo: 'Esta semana',
        resultado_esperado: 'Un puntaje confiable para esta parte del diagnóstico.',
      })
      continue
    }

    const p15 = puntaje.puntaje_1_5
    const p100 = Math.round(puntaje.puntaje_100 ?? 0)

    // 2. Fortaleza
    if (p15 >= UMBRAL_FORTALEZA) {
      const ejemplos = altas.slice(0, 2).map((p) => entreComillas(p.texto))
      salida.hallazgos.push({
        id: nuevoId(),
        dimension_id: dim.id,
        tipo: 'fortaleza',
        descripcion:
          `«${dim.nombre}» es una fortaleza (${p100} de 100).` +
          (ejemplos.length ? ` Destaca en: ${ejemplos.join(' · ')}.` : ''),
        gravedad: null,
        confianza,
      })
      continue
    }

    // 3. Debilidad
    if (p15 < UMBRAL_DEBILIDAD) {
      const gravedad = gravedadDe(p15)
      const prioridad = prioridadDe(gravedad)
      const peores = bajas.slice(0, 3).map((p) => entreComillas(p.texto))
      const id = nuevoId()
      debiles.push({ nombre: dim.nombre, puntaje: p15, codigo: dim.codigo })

      salida.hallazgos.push({
        id,
        dimension_id: dim.id,
        tipo: 'debilidad',
        descripcion:
          `«${dim.nombre}» tiene espacio para fortalecer (${p100} de 100).` +
          (peores.length ? ` Lo más bajo: ${peores.join(' · ')}.` : ''),
        gravedad,
        confianza,
      })
      salida.brechas.push({
        hallazgo_id: id,
        situacion_actual: peores.length
          ? `Todavía falta: ${peores.join(' · ')}.`
          : `Hoy, «${dim.nombre}» está en ${p100} de 100.`,
        situacion_deseada: textos.deseada,
        causa_probable: textos.causa,
        causa_confirmada: false,
        consecuencia: textos.consecuencia,
        prioridad,
      })
      salida.recomendaciones.push({
        hallazgo_id: id,
        titulo: `Fortalecer «${dim.nombre}»`,
        descripcion: textos.deseada,
        acciones: [...textos.acciones],
        prioridad,
        plazo: plazoDe(prioridad),
        resultado_esperado: `Cómo medirlo: ${textos.medida}`,
      })
    }
  }

  // ---------------- Alertas ----------------
  if (calculo.confianza === 'provisional') {
    salida.alertas.push({
      nivel: 'Informativa',
      regla: 'COB-01',
      descripcion:
        'Tu resultado es provisional porque respondiste menos del 60 % de las preguntas que te aplican. Mientras más respondas, más confiable será.',
    })
  }
  if (sinInfo.length) {
    salida.alertas.push({
      nivel: 'Informativa',
      regla: 'COB-02',
      descripcion: `Falta información para calcular: ${sinInfo.join(', ')}.`,
    })
  }
  for (const d of debiles.filter((x) => x.puntaje < 2)) {
    salida.alertas.push({
      nivel: 'Importante',
      regla: 'DIM-01',
      descripcion: `«${d.nombre}» tiene un puntaje muy bajo. Conviene atenderla primero, antes de seguir con otros pasos.`,
    })
  }
  if (debiles.length >= 3) {
    salida.alertas.push({
      nivel: 'Preventiva',
      regla: 'DIM-02',
      descripcion: `Varias áreas necesitan atención a la vez (${debiles.map((d) => d.nombre).join(', ')}). Empieza por las de prioridad alta.`,
    })
  }
  if (e.perfil !== 'A') {
    for (const [codigo, texto] of Object.entries(ALERTAS_PREGUNTA)) {
      const p = preguntas.find((x) => x.codigo === codigo)
      const r = p ? resp.get(p.id) : undefined
      if (r?.estado_respuesta === 'respondida' && r.valor === 1) {
        salida.alertas.push({ nivel: 'Preventiva', regla: codigo, descripcion: texto })
      }
    }
  }

  // Orden: lo más grave primero
  const orden: Record<string, number> = { Alto: 0, Crítico: 0, Medio: 1, Bajo: 2 }
  const rango = (h: HallazgoGen) => (h.tipo === 'debilidad' ? orden[h.gravedad ?? 'Bajo'] : h.tipo === 'brecha_informacion' ? 3 : 4)
  salida.hallazgos.sort((a, b) => rango(a) - rango(b))
  const nivelOrden: Record<NivelAlerta, number> = { Crítica: 0, Importante: 1, Preventiva: 2, Informativa: 3 }
  salida.alertas.sort((a, b) => nivelOrden[a.nivel] - nivelOrden[b.nivel])

  return salida
}
