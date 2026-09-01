/**
 * Biblioteca de convocatorias.
 *
 * Todo lo que el motor de búsqueda encuentra pasa por aquí y queda guardado
 * una sola vez, con su entidad, su fecha de cierre y su enlace oficial.
 *
 * Para qué sirve: para no volver a empezar de cero con la misma convocatoria
 * dentro de tres meses. La búsqueda siguiente arranca leyendo la biblioteca,
 * así que cada consulta al modelo cuesta menos y el equipo ve de una vez qué
 * está abierto y cuándo cierra.
 *
 * Regla: el motor NUNCA pisa lo que el equipo escribió a mano (notas_equipo),
 * y solo reemplaza un dato viejo cuando el nuevo trae información y el viejo
 * está vacío, o cuando cambió la fecha de cierre.
 */

export type ConvocatoriaEncontrada = {
  nombre?: string
  entidad?: string
  tipo?: string
  estado_convocatoria?: string
  fecha_cierre?: string
  monto?: string
  beneficiarios?: string
  territorio?: string
  linea_tematica?: string
  requisitos?: string
  mecanismo_postulacion?: string
  terminos_referencia?: string
  fuente_oficial?: string
  alertas?: string
  informacion_faltante?: string
}

const MESES: Record<string, number> = {
  enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
  julio: 7, agosto: 8, septiembre: 9, setiembre: 9, octubre: 10,
  noviembre: 11, diciembre: 12,
}

function texto(valor: unknown): string {
  return typeof valor === 'string' ? valor.trim() : ''
}

function sinTildes(valor: string): string {
  return valor.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

/**
 * Nombre y entidad reducidos a lo esencial. Es lo que impide que la misma
 * convocatoria entre dos veces escrita de otra forma.
 */
export function claveDeConvocatoria(nombre: string, entidad: string): string {
  const normalizar = (valor: string) =>
    sinTildes(texto(valor).toLowerCase())
      .replace(/[^a-z0-9 ]/g, ' ')
      .replace(/\b(convocatoria|programa|fondo|premio|de|del|la|el|los|las|para|y)\b/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()

  return `${normalizar(nombre)}|${normalizar(entidad)}`
}

/**
 * Intenta leer la fecha de cierre venga como venga: "2026-03-15",
 * "15/03/2026", "15 de marzo de 2026". Si dice "permanente" o algo que no es
 * una fecha, devuelve null en vez de inventar una.
 */
export function interpretarFecha(valor: unknown): string | null {
  const bruto = sinTildes(texto(valor).toLowerCase())
  if (!bruto) return null

  const iso = bruto.match(/(\d{4})-(\d{1,2})-(\d{1,2})/)
  if (iso) return armarFecha(Number(iso[1]), Number(iso[2]), Number(iso[3]))

  const barras = bruto.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/)
  if (barras) return armarFecha(Number(barras[3]), Number(barras[2]), Number(barras[1]))

  const enLetras = bruto.match(/(\d{1,2})\s+de\s+([a-z]+)\s+(?:de\s+)?(\d{4})/)
  if (enLetras && MESES[enLetras[2]]) {
    return armarFecha(Number(enLetras[3]), MESES[enLetras[2]], Number(enLetras[1]))
  }

  const soloMes = bruto.match(/([a-z]+)\s+(?:de\s+)?(\d{4})/)
  if (soloMes && MESES[soloMes[1]]) {
    // Sin día: se toma el último día del mes, que es lo que suele significar.
    const anio = Number(soloMes[2])
    const mes = MESES[soloMes[1]]
    const ultimoDia = new Date(Date.UTC(anio, mes, 0)).getUTCDate()
    return armarFecha(anio, mes, ultimoDia)
  }

  return null
}

function armarFecha(anio: number, mes: number, dia: number): string | null {
  if (!anio || !mes || !dia) return null
  if (anio < 2000 || anio > 2100 || mes < 1 || mes > 12 || dia < 1 || dia > 31) return null
  const dd = String(dia).padStart(2, '0')
  const mm = String(mes).padStart(2, '0')
  return `${anio}-${mm}-${dd}`
}

type FilaBiblioteca = {
  id: string
  clave: string
  nombre: string
  entidad: string
  tipo: string | null
  estado_convocatoria: string | null
  fecha_cierre: string | null
  fecha_cierre_texto: string | null
  monto: string | null
  beneficiarios: string | null
  territorio: string | null
  linea_tematica: string | null
  requisitos: string | null
  mecanismo_postulacion: string | null
  terminos_referencia: string | null
  fuente_oficial: string | null
  alertas: string | null
  informacion_faltante: string | null
  veces_encontrada: number | null
}

const CAMPOS =
  'id, clave, nombre, entidad, tipo, estado_convocatoria, fecha_cierre, fecha_cierre_texto, monto, ' +
  'beneficiarios, territorio, linea_tematica, requisitos, mecanismo_postulacion, terminos_referencia, ' +
  'fuente_oficial, alertas, informacion_faltante, veces_encontrada'

/** Se queda con el dato nuevo solo si el viejo estaba vacío. */
function completar(viejo: string | null, nuevo: string): string | null {
  const limpio = texto(nuevo)
  if (texto(viejo)) return viejo
  return limpio || null
}

/**
 * Guarda (o actualiza) las convocatorias en la biblioteca.
 * Devuelve un mapa clave -> id para poder enlazarlas con el proyecto.
 */
export async function guardarEnBiblioteca(
  supabase: any,
  convocatorias: ConvocatoriaEncontrada[],
): Promise<Map<string, string>> {
  const mapa = new Map<string, string>()

  const limpias = convocatorias
    .map((c) => ({ ...c, nombre: texto(c.nombre), entidad: texto(c.entidad) }))
    .filter((c) => c.nombre.length > 3)

  if (limpias.length === 0) return mapa

  // Una sola entrada por clave, aunque venga repetida en el mismo lote.
  const porClave = new Map<string, ConvocatoriaEncontrada>()
  for (const c of limpias) {
    porClave.set(claveDeConvocatoria(c.nombre!, c.entidad!), c)
  }

  const claves = [...porClave.keys()]

  const { data: existentesRaw, error: errorLectura } = await supabase
    .from('biblioteca_convocatorias')
    .select(CAMPOS)
    .in('clave', claves)

  if (errorLectura) {
    console.error('[Biblioteca] No se pudo leer la biblioteca:', errorLectura)
    return mapa
  }

  const existentes = new Map<string, FilaBiblioteca>(
    ((existentesRaw || []) as FilaBiblioteca[]).map((f) => [f.clave, f]),
  )

  const ahora = new Date().toISOString()

  for (const [clave, c] of porClave) {
    const fechaTexto = texto(c.fecha_cierre)
    const fecha = interpretarFecha(fechaTexto)
    const anterior = existentes.get(clave)

    if (anterior) {
      const { error } = await supabase
        .from('biblioteca_convocatorias')
        .update({
          // los datos nuevos solo rellenan huecos...
          tipo: completar(anterior.tipo, texto(c.tipo)),
          beneficiarios: completar(anterior.beneficiarios, texto(c.beneficiarios)),
          territorio: completar(anterior.territorio, texto(c.territorio)),
          linea_tematica: completar(anterior.linea_tematica, texto(c.linea_tematica)),
          requisitos: completar(anterior.requisitos, texto(c.requisitos)),
          mecanismo_postulacion: completar(anterior.mecanismo_postulacion, texto(c.mecanismo_postulacion)),
          terminos_referencia: completar(anterior.terminos_referencia, texto(c.terminos_referencia)),
          fuente_oficial: completar(anterior.fuente_oficial, texto(c.fuente_oficial)),
          monto: completar(anterior.monto, texto(c.monto)),
          // ...salvo el estado y la fecha, que sí se refrescan: son lo que cambia
          estado_convocatoria: texto(c.estado_convocatoria) || anterior.estado_convocatoria,
          fecha_cierre: fecha || anterior.fecha_cierre,
          fecha_cierre_texto: fechaTexto || anterior.fecha_cierre_texto,
          alertas: texto(c.alertas) || anterior.alertas,
          informacion_faltante: texto(c.informacion_faltante) || anterior.informacion_faltante,
          veces_encontrada: (anterior.veces_encontrada || 1) + 1,
          ultima_vez_vista: ahora,
          actualizado_en: ahora,
        })
        .eq('id', anterior.id)

      if (error) console.error('[Biblioteca] No se pudo actualizar una convocatoria:', error)
      mapa.set(clave, anterior.id)
      continue
    }

    const { data, error } = await supabase
      .from('biblioteca_convocatorias')
      .insert({
        clave,
        nombre: texto(c.nombre),
        entidad: texto(c.entidad),
        tipo: texto(c.tipo) || null,
        estado_convocatoria: texto(c.estado_convocatoria) || null,
        fecha_cierre: fecha,
        fecha_cierre_texto: fechaTexto || null,
        monto: texto(c.monto) || null,
        beneficiarios: texto(c.beneficiarios) || null,
        territorio: texto(c.territorio) || null,
        linea_tematica: texto(c.linea_tematica) || null,
        requisitos: texto(c.requisitos) || null,
        mecanismo_postulacion: texto(c.mecanismo_postulacion) || null,
        terminos_referencia: texto(c.terminos_referencia) || null,
        fuente_oficial: texto(c.fuente_oficial) || null,
        alertas: texto(c.alertas) || null,
        informacion_faltante: texto(c.informacion_faltante) || null,
        primera_vez_vista: ahora,
        ultima_vez_vista: ahora,
        actualizado_en: ahora,
      })
      .select('id')
      .single()

    if (error || !data) {
      console.error('[Biblioteca] No se pudo guardar una convocatoria:', error)
      continue
    }
    mapa.set(clave, data.id as string)
  }

  return mapa
}

/**
 * Lo que ya está en la biblioteca, escrito para metérselo al motor de
 * búsqueda. Primero lo que cierra pronto, que es lo que corre prisa.
 */
export async function leerBibliotecaParaPrompt(supabase: any, limite = 60): Promise<string> {
  const hoy = new Date().toISOString().slice(0, 10)

  const { data, error } = await supabase
    .from('biblioteca_convocatorias')
    .select('nombre, entidad, tipo, estado_convocatoria, fecha_cierre, fecha_cierre_texto, monto, territorio, linea_tematica, fuente_oficial')
    .or(`fecha_cierre.is.null,fecha_cierre.gte.${hoy}`)
    .order('fecha_cierre', { ascending: true, nullsFirst: false })
    .limit(limite)

  if (error) {
    console.warn('[Biblioteca] No se pudo leer para el prompt:', error)
    return 'BIBLIOTECA INTERNA: todavía vacía.'
  }

  if (!data || data.length === 0) {
    return 'BIBLIOTECA INTERNA DE CONVOCATORIAS: todavía vacía. Lo que encuentres hoy queda guardado para las próximas búsquedas.'
  }

  const filas = data
    .map(
      (c: any) =>
        `- ${c.nombre} | entidad: ${c.entidad || 'sin dato'} | tipo: ${c.tipo || 'sin dato'} | estado: ${c.estado_convocatoria || 'sin dato'} | cierra: ${c.fecha_cierre || c.fecha_cierre_texto || 'sin fecha'} | monto: ${c.monto || 'sin dato'} | territorio: ${c.territorio || 'sin dato'} | línea: ${c.linea_tematica || 'sin dato'} | enlace: ${c.fuente_oficial || 'sin enlace'}`,
    )
    .join('\n')

  return `BIBLIOTECA INTERNA DE CONVOCATORIAS (${data.length} fichas ya verificadas por la plataforma, ordenadas por cierre más próximo).
Úsala primero: si una de estas encaja, propónla y actualiza sus datos en vez de salir a buscar una equivalente. Verifica igual que la fecha siga vigente.

${filas}`
}
