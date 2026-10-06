import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { MisDocumentosClient, type EtapaDocumentos } from '@/components/panel/MisDocumentosClient'
import {
  diagnosticoAMarkdown,
  calificacionAMarkdown,
  encajeAMarkdown,
  postulacionAMarkdown,
} from '@/lib/entregablesMarkdown'
import type { DiagnosticoResultadoV2 } from '@/app/api/diagnostico-v2/route'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const slug = (t: string) => t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'documento'

/**
 * "Mis documentos" — todo lo que el cliente puede ver, bajar en Word o guardar en PDF,
 * ordenado por etapa: del diagnóstico a la postulación. Lee solo lo del propio cliente:
 * el proyecto se busca con SU sesión y de ahí se toma todo lo demás.
 */
export default async function MisDocumentosPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const correo = (user?.email || '').trim()

  const etapas: EtapaDocumentos[] = []

  // 1. Diagnóstico (se busca por el correo del cliente)
  const { data: diag } = correo
    ? await supabaseAdmin
        .from('diagnosticos')
        .select('tipo_proyecto, resultado_completo')
        .ilike('email', correo)
        .not('resultado_completo', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }
  const rd = (diag?.resultado_completo || null) as DiagnosticoResultadoV2 | null
  const nombreDiag = String(diag?.tipo_proyecto || 'tu proyecto')
  etapas.push({
    etapa: '1. Diagnóstico',
    documentos: [
      {
        titulo: 'Tu diagnóstico',
        descripcion: 'Rueda, sectores, mecanismos de financiamiento, brechas y ruta de acción.',
        nombreArchivo: `${slug(nombreDiag)}-diagnostico`,
        contenido: rd ? diagnosticoAMarkdown(rd, nombreDiag) : null,
        pendiente: 'Aparece aquí cuando haces el diagnóstico con este mismo correo.',
      },
      {
        titulo: 'Nota de concepto del diagnóstico',
        descripcion: 'Primer borrador de tu proyecto, hecho al terminar el diagnóstico.',
        nombreArchivo: `${slug(nombreDiag)}-nota-concepto-diagnostico`,
        contenido: rd?.notaConceptoMarkdown || null,
        pendiente: 'Aparece junto con tu diagnóstico.',
      },
    ],
  })

  const { data: proyecto } = correo
    ? await supabase
        .from('proyectos_clientes_serving')
        .select('id, nombre_iniciativa, dossier_markdown')
        .eq('correo_cliente', correo)
        .or('es_solicitud_replica_cliente.is.null,es_solicitud_replica_cliente.eq.false')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null }

  const proyectoId = proyecto ? String(proyecto.id) : null
  const nombre = String(proyecto?.nombre_iniciativa || 'tu proyecto')

  // 2. Estructuración
  let nota: string | null = null
  let evaluacion: { puntaje: number; veredicto: string; hallazgos_json: unknown } | null = null
  if (proyectoId) {
    const { data: n } = await supabase
      .from('notas_concepto')
      .select('contenido_es')
      .eq('proyecto_id', proyectoId)
      .order('creada_en', { ascending: false })
      .limit(1)
      .maybeSingle()
    nota = (n?.contenido_es as string) || null
    const { data: ev } = await supabase
      .from('evaluaciones_estructuracion')
      .select('puntaje, veredicto, hallazgos_json')
      .eq('proyecto_id', proyectoId)
      .order('corrida', { ascending: false })
      .limit(1)
      .maybeSingle()
    evaluacion = ev
  }
  const hallazgos = (Array.isArray(evaluacion?.hallazgos_json) ? (evaluacion!.hallazgos_json as Record<string, unknown>[]) : []).map(
    (h) => ({ descripcion: String(h?.descripcion || ''), critico: h?.critico === true }),
  )
  etapas.push({
    etapa: '2. Estructuración',
    documentos: [
      {
        titulo: 'Tu proyecto completo',
        descripcion: 'El documento técnico completo de tu proyecto, ya estructurado.',
        nombreArchivo: `${slug(nombre)}-proyecto-completo`,
        contenido: (proyecto?.dossier_markdown as string) || null,
        pendiente: 'Se prepara cuando contratas la estructuración y el equipo termina de estructurar.',
      },
      {
        titulo: 'Nota de concepto',
        descripcion: 'Resumen corto de tu proyecto, listo para presentar a un financiador.',
        nombreArchivo: `${slug(nombre)}-nota-de-concepto`,
        contenido: nota,
        pendiente: 'Se genera sola cuando la estructuración queda lista.',
      },
      {
        titulo: 'Calificación final',
        descripcion: 'La nota de tu proyecto sobre 100 y lo que se revisó.',
        nombreArchivo: `${slug(nombre)}-calificacion-final`,
        contenido: evaluacion
          ? calificacionAMarkdown(nombre, Number(evaluacion.puntaje) || 0, evaluacion.veredicto, hallazgos)
          : null,
        pendiente: 'Aparece cuando se evalúa tu estructuración.',
      },
    ],
  })

  // 3. Convocatorias (encaje)
  const docsEncaje: EtapaDocumentos['documentos'] = []
  if (proyectoId) {
    const { data: candidatas } = await supabase
      .from('convocatorias_candidatas_proyecto')
      .select('id, nombre')
      .eq('id_proyecto', proyectoId)
      .eq('eleccion_cliente', 'elegida')
    const nombres = new Map((candidatas || []).map((c) => [String(c.id), String(c.nombre || 'Convocatoria')]))
    const { data: encajes } = await supabase
      .from('encajes_convocatoria_proyecto')
      .select('id_convocatoria, resumen_convocatoria, encaje_actual, encaje_potencial, semaforo, puntaje_general, recomendaciones, checklist_preparacion, documentacion_faltante')
      .eq('id_proyecto', proyectoId)
    for (const e of encajes || []) {
      const nom = nombres.get(String(e.id_convocatoria))
      if (!nom) continue
      docsEncaje.push({
        titulo: `Encaje: ${nom}`,
        descripcion: 'Qué tan bien encaja tu proyecto, qué recomendamos y qué documentos faltan.',
        nombreArchivo: `${slug(nombre)}-encaje-${slug(nom)}`,
        contenido: encajeAMarkdown(nom, e),
      })
    }
  }
  if (docsEncaje.length === 0) {
    docsEncaje.push({
      titulo: 'Encaje con tus convocatorias',
      descripcion: '',
      nombreArchivo: 'encaje',
      contenido: null,
      pendiente: 'Aparece cuando eliges tus convocatorias y se analiza el encaje.',
    })
  }
  etapas.push({ etapa: '3. Convocatorias', documentos: docsEncaje })

  // 4. Postulación: solo lo ya revisado por el equipo (no el borrador en preparación)
  const docsPost: EtapaDocumentos['documentos'] = []
  if (proyectoId) {
    const { data: posts } = await supabaseAdmin
      .from('postulaciones')
      .select('convocatoria_nombre, entidad, estado, puntaje_total, carta_intencion')
      .eq('proyecto_id', proyectoId)
      .in('estado', ['Lista para radicar', 'Radicada', 'Adjudicada', 'Rechazada'])
    for (const p of posts || []) {
      docsPost.push({
        titulo: `Postulación: ${p.convocatoria_nombre}`,
        descripcion: 'Estado, puntaje de la evaluación y carta de intención.',
        nombreArchivo: `${slug(nombre)}-postulacion-${slug(p.convocatoria_nombre)}`,
        contenido: postulacionAMarkdown(p),
      })
    }
  }
  if (docsPost.length === 0) {
    docsPost.push({
      titulo: 'Tu postulación',
      descripcion: '',
      nombreArchivo: 'postulacion',
      contenido: null,
      pendiente: 'Aparece cuando el equipo deja lista tu postulación.',
    })
  }
  etapas.push({ etapa: '4. Postulación', documentos: docsPost })

  // 5. Réplicas
  const docsReplica: EtapaDocumentos['documentos'] = []
  if (correo) {
    const { data: replicas } = await supabase
      .from('proyectos_clientes_serving')
      .select('id, nombre_iniciativa, dossier_markdown')
      .eq('correo_cliente', correo)
      .eq('es_solicitud_replica_cliente', true)
      .not('dossier_markdown', 'is', null)
      .order('created_at', { ascending: false })
    for (const r of replicas || []) {
      const nom = String(r.nombre_iniciativa || 'Réplica')
      docsReplica.push({
        titulo: `Réplica: ${nom}`,
        descripcion: 'Tu proyecto adaptado a otra convocatoria.',
        nombreArchivo: `${slug(nom)}-replica`,
        contenido: r.dossier_markdown as string,
      })
    }
  }
  if (docsReplica.length === 0) {
    docsReplica.push({
      titulo: 'Tus réplicas',
      descripcion: '',
      nombreArchivo: 'replicas',
      contenido: null,
      pendiente: 'Aparecen cuando una réplica queda terminada.',
    })
  }
  etapas.push({ etapa: '5. Réplicas', documentos: docsReplica })

  return <MisDocumentosClient etapas={etapas} />
}
