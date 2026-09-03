import React from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  PendientesCliente,
  PendientesSinProyecto,
  type ArchivoSubido,
  type DocumentoPedido,
  type PreguntaPendiente,
} from '@/components/panel/PendientesCliente'

const BUCKET = 'documentos-proyectos'

export const dynamic = 'force-dynamic'
export const revalidate = 0

/**
 * "Lo que me piden" — la pantalla del CLIENTE donde destraba su propio proyecto.
 *
 * El motor de estructuración deja preguntas cuando le falta un dato, y el
 * equipo marca requisitos que solo el cliente puede conseguir. Hasta ahora esas
 * dos cosas existían por dentro pero el cliente no tenía dónde verlas: el
 * proyecto se quedaba quieto sin que él supiera por qué.
 *
 * Aquí se juntan en un solo sitio, y solo lo que depende de él.
 */

type FilaPregunta = {
  id: string
  id_paso: number
  pregunta: string
  critico: boolean | null
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

export default async function PendientesPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const correo = user?.email || ''

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, archivo_proyecto_nombre, archivo_proyecto_url')
    .eq('correo_cliente', correo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!proyecto?.id) return <PendientesSinProyecto />

  const proyectoId = String(proyecto.id)

  /* --- preguntas que dejó el motor --------------------------------------- */

  const { data: filasPreguntas } = await supabase
    .from('preguntas_pendientes_proyecto')
    .select('id, id_paso, pregunta, critico')
    .eq('id_proyecto', proyectoId)
    .eq('respondida', false)
    .order('critico', { ascending: false })
    .order('creado_en', { ascending: true })

  const preguntasCrudas = (filasPreguntas || []) as FilaPregunta[]

  let preguntas: PreguntaPendiente[] = []
  if (preguntasCrudas.length > 0) {
    const { data: pasos } = await supabase.from('pasos_estructuracion').select('id, nombre_paso')

    const mapaPasos = new Map((pasos || []).map((p) => [p.id, p.nombre_paso as string]))

    preguntas = preguntasCrudas.map((p) => ({
      id: String(p.id),
      nombrePaso: mapaPasos.get(p.id_paso) || 'Tu proyecto',
      pregunta: String(p.pregunta || ''),
      critico: Boolean(p.critico),
    }))
  }

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

  return (
    <PendientesCliente
      datos={{
        proyectoId,
        nombreProyecto: String(proyecto.nombre_iniciativa || 'Tu proyecto'),
        preguntas,
        documentosPedidos,
        archivosSubidos,
        archivoBase: proyecto.archivo_proyecto_nombre
          ? {
              nombre: String(proyecto.archivo_proyecto_nombre),
              url: (proyecto.archivo_proyecto_url as string | null) || null,
            }
          : null,
      }}
    />
  )
}
