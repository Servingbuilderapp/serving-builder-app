import type { ProyectoVisto } from '@/lib/proyectoVisto'

/**
 * "¿Qué hago ahora?" — el siguiente paso del cliente, calculado solo con lo que
 * ya hay guardado del proyecto. Sirve igual para proyectos nuevos y viejos, sin
 * que nadie del equipo tenga que intervenir.
 *
 * La tarjeta SIEMPRE dice dónde va el proyecto. Solo pide algo (con botón)
 * cuando de verdad hay algo que el cliente debe hacer; si no, dice qué viene
 * y que no tiene que hacer nada (27 oct 2026).
 */

export type SiguientePaso = {
  titulo: string
  texto: string
  /** Solo cuando el cliente debe hacer algo. */
  accion: { texto: string; href: string } | null
}

type FilaProyecto = {
  estado_actual: string | null
  archivo_proyecto_url: string | null
  evaluacion_aprobada: boolean | null
  busqueda_convocatorias_iniciada: boolean | null
}

async function contar(
  consulta: PromiseLike<{ count: number | null; error: unknown }>,
): Promise<number> {
  try {
    const { count, error } = await consulta
    return error ? 0 : count || 0
  } catch {
    return 0
  }
}

export async function calcularSiguientePaso(vista: ProyectoVisto): Promise<SiguientePaso | null> {
  if (!vista.proyectoId) return null
  const db = vista.db
  const id = vista.proyectoId

  const { data: proyecto } = await db
    .from('proyectos_clientes_serving')
    .select('estado_actual, archivo_proyecto_url, evaluacion_aprobada, busqueda_convocatorias_iniciada')
    .eq('id', id)
    .maybeSingle<FilaProyecto>()
  if (!proyecto) return null

  const estado = String(proyecto.estado_actual || '').toLowerCase()

  /* ---- antes de que arranque el trabajo ---- */
  if (estado === 'pendiente_aval') {
    return {
      titulo: 'Estamos revisando tu solicitud',
      texto: 'Serving revisa que tu proyecto entre en este plan. Apenas la aprobemos, te avisamos aquí. No tienes que hacer nada.',
      accion: null,
    }
  }
  if (estado === 'aval_rechazado') {
    return {
      titulo: 'Tu solicitud no entró en este plan',
      texto: 'Escríbenos y te contamos qué otra modalidad te corresponde.',
      accion: null,
    }
  }
  if (estado === 'cortesia_pendiente') {
    return {
      titulo: 'Lee y acepta las condiciones',
      texto: 'Con eso se activa tu invitación y empezamos con tu proyecto.',
      accion: { texto: 'Ver condiciones', href: '/cortesia' },
    }
  }
  if (estado === 'pendiente_pago') {
    return {
      titulo: 'Falta confirmar tu pago',
      texto: 'Cuando el pago se confirme, la estructuración de tu proyecto arranca sola.',
      accion: null,
    }
  }

  /* ---- lo que depende del cliente ---- */
  if (!proyecto.archivo_proyecto_url) {
    return {
      titulo: 'Sube el documento de tu proyecto',
      texto: 'Es lo que necesitamos para empezar a estructurarlo.',
      accion: { texto: 'Subir documento', href: '/pendientes' },
    }
  }

  const preguntasSinResponder = await contar(
    db
      .from('preguntas_pendientes_proyecto')
      .select('id', { count: 'exact', head: true })
      .eq('id_proyecto', id)
      .eq('respondida', false),
  )
  if (preguntasSinResponder > 0) {
    return {
      titulo: preguntasSinResponder === 1 ? 'Responde 1 pregunta' : `Responde ${preguntasSinResponder} preguntas`,
      texto: 'Con tus respuestas seguimos con tu proyecto. Si no las tienes, te sugerimos una respuesta y tú la confirmas.',
      accion: { texto: 'Ir a Lo que me piden', href: '/pendientes' },
    }
  }

  /* ---- alerta de cierre: convocatoria elegida que cierra en 7 días o menos ---- */
  const hoyUtc = new Date()
  const inicioHoy = Date.UTC(hoyUtc.getUTCFullYear(), hoyUtc.getUTCMonth(), hoyUtc.getUTCDate())
  const { data: elegidasConCierre } = await db
    .from('convocatorias_candidatas_proyecto')
    .select('nombre, fecha_cierre')
    .eq('id_proyecto', id)
    .eq('seleccionada', true)
    .eq('eleccion_cliente', 'elegida')
    .not('fecha_cierre', 'is', null)
  const { data: yaPostuladas } = await db
    .from('postulaciones')
    .select('convocatoria_nombre, estado')
    .eq('proyecto_id', id)

  const quitarTildes = (t: string) =>
    t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ').trim()
  const terminadas = new Set(
    ((yaPostuladas || []) as { convocatoria_nombre: string | null; estado: string | null }[])
      .filter((p) => ['Radicada', 'Adjudicada', 'Rechazada', 'Descartada'].includes(String(p.estado)))
      .map((p) => quitarTildes(String(p.convocatoria_nombre || ''))),
  )

  const porCerrar = ((elegidasConCierre || []) as { nombre: string | null; fecha_cierre: string }[])
    .map((c) => {
      const f = new Date(c.fecha_cierre)
      const dias = Math.round((Date.UTC(f.getUTCFullYear(), f.getUTCMonth(), f.getUTCDate()) - inicioHoy) / 86400000)
      return { nombre: String(c.nombre || 'una convocatoria'), dias }
    })
    .filter((c) => c.dias >= 0 && c.dias <= 7 && !terminadas.has(quitarTildes(c.nombre)))
    .sort((a, b) => a.dias - b.dias)

  if (porCerrar.length > 0) {
    const primera = porCerrar[0]
    const cuando = primera.dias === 0 ? 'hoy' : primera.dias === 1 ? 'mañana' : `en ${primera.dias} días`
    return {
      titulo: `Cierra ${cuando}: ${primera.nombre}`,
      texto:
        porCerrar.length > 1
          ? `Y hay ${porCerrar.length - 1} más que cierran esta semana. Revisa qué te falta para postular, porque pasada la fecha ya no se puede.`
          : 'Si vas a postular, hazlo antes de esa fecha. Revisa qué te falta, porque pasada la fecha ya no se puede.',
      accion: { texto: 'Ver mis convocatorias', href: '/mis-convocatorias' },
    }
  }

  const porElegir = await contar(
    db
      .from('convocatorias_candidatas_proyecto')
      .select('id', { count: 'exact', head: true })
      .eq('id_proyecto', id)
      .eq('seleccionada', true)
      .is('eleccion_cliente', null),
  )
  if (porElegir > 0) {
    return {
      titulo: 'Elige las convocatorias que te interesan',
      texto: 'Ya encontramos oportunidades para tu proyecto. Escoge con cuáles seguimos.',
      accion: { texto: 'Ver convocatorias', href: '/mis-convocatorias' },
    }
  }

  /* ---- lo que hace la plataforma ---- */
  if (proyecto.evaluacion_aprobada && !proyecto.busqueda_convocatorias_iniciada) {
    return {
      titulo: 'Tu proyecto ya fue calificado',
      texto: 'La búsqueda de convocatorias empieza sola en pocos días. Si quieres adelantarla, puedes hacerlo desde la calificación.',
      accion: { texto: 'Ver calificación', href: '/calificacion' },
    }
  }

  const elegidas = await contar(
    db
      .from('convocatorias_candidatas_proyecto')
      .select('id', { count: 'exact', head: true })
      .eq('id_proyecto', id)
      .eq('seleccionada', true)
      .eq('eleccion_cliente', 'elegida'),
  )
  const encajes = await contar(
    db.from('encajes_convocatoria_proyecto').select('id_convocatoria', { count: 'exact', head: true }).eq('id_proyecto', id),
  )

  if (elegidas > 0 && encajes > 0) {
    return {
      titulo: 'Revisa tu encaje',
      texto: 'Ya calculamos qué tanto encaja tu proyecto con las convocatorias que elegiste, y qué le falta a cada una.',
      accion: { texto: 'Ver mi encaje', href: '/mis-convocatorias' },
    }
  }
  if (elegidas > 0) {
    return {
      titulo: 'Estamos calculando tu encaje',
      texto: 'Estamos comparando tu proyecto con las convocatorias que elegiste. No tienes que hacer nada.',
      accion: null,
    }
  }

  if (proyecto.busqueda_convocatorias_iniciada) {
    return {
      titulo: 'Estamos buscando convocatorias para ti',
      texto: 'Cuando encontremos oportunidades, te avisamos aquí para que elijas. No tienes que hacer nada.',
      accion: null,
    }
  }

  return {
    titulo: 'Estamos estructurando tu proyecto',
    texto: 'Vamos armando el problema, los objetivos, el presupuesto y el cronograma. No tienes que hacer nada; si necesitamos algo de ti, te lo pedimos aquí.',
    accion: { texto: 'Ver el avance', href: '/mi-proyecto' },
  }
}
