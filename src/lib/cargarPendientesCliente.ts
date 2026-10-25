import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  ArchivoSubido,
  DatosPendientes,
  DocumentoPedido,
  PasoDebil,
  PreguntaPendiente,
  PreguntaSupuesta,
} from '@/components/panel/PendientesCliente'

const BUCKET = 'documentos-proyectos'

type FilaPregunta = {
  id: string
  id_paso: number
  pregunta: string
  critico: boolean | null
  sugerencia: string | null
  recordatorio_enviado_en: string | null
}

type FilaRequisito = {
  id: string
  requisito: string
  obligatorio: boolean | null
  nota: string | null
  responsable: string | null
  postulacion_id: string
}

/** Un requisito le toca al cliente si nadie más quedó a cargo. */
function esDelCliente(responsable: string | null): boolean {
  const texto = (responsable || '').toLowerCase().trim()
  if (!texto) return true
  return texto.includes('cliente')
}

/**
 * Junta TODO lo que "Lo que me piden" le muestra a un cliente.
 *
 * Se usa en dos pantallas:
 *  - la del cliente (con su propia sesión), y
 *  - "Ver lo que ve el cliente" del equipo (con la llave de servicio, para
 *    poder mirar el proyecto de cualquier cliente).
 * Así las dos muestran exactamente lo mismo: si una cambia, la otra también.
 */
export async function cargarPendientesCliente(
  supabase: SupabaseClient,
  proyecto: {
    id: string | number
    nombre_iniciativa?: string | null
    archivo_proyecto_nombre?: string | null
    archivo_proyecto_url?: string | null
  }
): Promise<DatosPendientes> {
  const proyectoId = String(proyecto.id)

  /* --- nombres de los pasos (una sola vez) ------------------------------- */

  const { data: pasos } = await supabase.from('pasos_estructuracion').select('id, nombre_paso, orden_secuencia')
  const mapaPasos = new Map<number, string>(
    (pasos || []).map((p: { id: number; nombre_paso: string }) => [p.id, p.nombre_paso])
  )
  const mapaOrden = new Map<number, number>(
    (pasos || []).map((p: { id: number; orden_secuencia?: number | null }) => [p.id, Number(p.orden_secuencia ?? p.id)])
  )

  /* --- preguntas que dejó el motor --------------------------------------- */

  const { data: filasPreguntas } = await supabase
    .from('preguntas_pendientes_proyecto')
    .select('id, id_paso, pregunta, critico, sugerencia, recordatorio_enviado_en')
    .eq('id_proyecto', proyectoId)
    .eq('respondida', false)
    .order('critico', { ascending: false })
    .order('creado_en', { ascending: true })

  const preguntas: PreguntaPendiente[] = ((filasPreguntas || []) as FilaPregunta[]).map((p) => ({
    id: String(p.id),
    nombrePaso: mapaPasos.get(p.id_paso) || 'Tu proyecto',
    pregunta: String(p.pregunta || ''),
    critico: Boolean(p.critico),
    sugerencia: p.sugerencia ? String(p.sugerencia) : null,
    venceEn: p.recordatorio_enviado_en
      ? new Date(new Date(p.recordatorio_enviado_en).getTime() + 24 * 60 * 60 * 1000).toISOString()
      : null,
  }))

  /* --- respuestas que puso el sistema porque no se respondió a tiempo ----- */

  const { data: filasSupuestos } = await supabase
    .from('preguntas_pendientes_proyecto')
    .select('id, id_paso, pregunta, respuesta')
    .eq('id_proyecto', proyectoId)
    .eq('respondida', true)
    .eq('es_supuesto', true)

  const supuestos: PreguntaSupuesta[] = (filasSupuestos || []).map(
    (f: { id: string; id_paso: number; pregunta: string | null; respuesta: string | null }) => {
      const resp = String(f.respuesta || '')
      return {
        id: String(f.id),
        nombrePaso: mapaPasos.get(f.id_paso) || 'Tu proyecto',
        pregunta: String(f.pregunta || ''),
        supuesto: resp === '(sin respuesta del cliente)' ? null : resp,
      }
    }
  )

  /* --- pasos escritos pero débiles ("por reforzar") ----------------------- */

  const { data: filasDebiles } = await supabase
    .from('contenido_pasos_proyecto')
    .select('id_paso, contenido, advertencia')
    .eq('id_proyecto', proyectoId)

  const idsConSupuesto = new Set((filasSupuestos || []).map((f: { id_paso: number }) => f.id_paso))

  const pasosDebiles: PasoDebil[] = (
    (filasDebiles || []) as { id_paso: number; contenido: string | null; advertencia: string | null }[]
  )
    .filter((f) => (f.advertencia || '').trim().length > 0 && (f.contenido || '').trim().length > 0)
    // Los pasos que nacieron de un supuesto ya tienen su propio bloque
    // ("Lo que supusimos por ti"); no se muestran dos veces.
    .filter((f) => !idsConSupuesto.has(f.id_paso))
    .sort((a, b) => (mapaOrden.get(a.id_paso) ?? a.id_paso) - (mapaOrden.get(b.id_paso) ?? b.id_paso))
    .map((f) => ({
      idPaso: f.id_paso,
      nombrePaso: mapaPasos.get(f.id_paso) || 'Un paso de tu proyecto',
      contenido: String(f.contenido || ''),
      advertencia: String(f.advertencia || ''),
    }))

  /* --- documentos que el equipo está esperando --------------------------- */

  let documentosPedidos: DocumentoPedido[] = []

  const { data: postulaciones } = await supabase
    .from('postulaciones')
    .select('id, convocatoria_nombre')
    .eq('proyecto_id', proyectoId)

  const listaPostulaciones = (postulaciones || []) as {
    id: string
    convocatoria_nombre: string | null
  }[]

  if (listaPostulaciones.length > 0) {
    const mapaConvocatorias = new Map(
      listaPostulaciones.map((p) => [String(p.id), p.convocatoria_nombre])
    )

    const { data: requisitos } = await supabase
      .from('postulacion_requisitos')
      .select('id, requisito, obligatorio, nota, responsable, postulacion_id')
      .in(
        'postulacion_id',
        listaPostulaciones.map((p) => p.id)
      )
      .eq('cumplido', false)
      .eq('tipo', 'documento')
      .order('orden', { ascending: true })

    documentosPedidos = ((requisitos || []) as FilaRequisito[])
      .filter((r) => esDelCliente(r.responsable))
      .map((r) => ({
        id: String(r.id),
        requisito: String(r.requisito || ''),
        obligatorio: r.obligatorio !== false,
        nota: r.nota || null,
        origen: mapaConvocatorias.get(String(r.postulacion_id)) || null,
      }))
  }

  /* --- lo que el cliente ya subió ---------------------------------------- */

  let archivosSubidos: ArchivoSubido[] = []

  const { data: archivosBucket } = await supabase.storage
    .from(BUCKET)
    .list(proyectoId, { limit: 100, sortBy: { column: 'created_at', order: 'desc' } })

  const entradas = (archivosBucket || []).filter(
    (f) => f.name && f.name !== '.emptyFolderPlaceholder'
  )

  if (entradas.length > 0) {
    const rutas = entradas.map((f) => `${proyectoId}/${f.name}`)
    const { data: firmados } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(rutas, 60 * 60 * 24 * 7)

    const mapaUrls = new Map((firmados || []).map((f) => [f.path || '', f.signedUrl || null]))

    archivosSubidos = entradas.map((f) => ({
      nombre: f.name.replace(/^\d+-/, ''),
      ruta: `${proyectoId}/${f.name}`,
      url: mapaUrls.get(`${proyectoId}/${f.name}`) || null,
      fecha: f.created_at
        ? new Date(f.created_at).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })
        : null,
    }))
  }

  return {
    proyectoId,
    nombreProyecto: String(proyecto.nombre_iniciativa || 'Tu proyecto'),
    preguntas,
    supuestos,
    pasosDebiles,
    documentosPedidos,
    archivosSubidos,
    archivoBase: proyecto.archivo_proyecto_nombre
      ? {
          nombre: String(proyecto.archivo_proyecto_nombre),
          url: proyecto.archivo_proyecto_url || null,
        }
      : null,
  }
}
