import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import {
  ArbolProblemasClient,
  type NodoVista,
  type TipoNodo,
} from '@/components/panel/ArbolProblemasClient'

export const dynamic = 'force-dynamic'

const CORREO_ADMIN = 'servingbuilderapp@gmail.com'

type FilaProblema = {
  id: string
  tipo: string
  orden: number | null
  descripcion: string | null
  evidencia_fuente: string | null
  evidencia_url: string | null
  evidencia_nota: string | null
  linea_base: string | null
  created_at: string | null
}

const TIPOS: TipoNodo[] = [
  'CENTRAL',
  'CAUSA_DIRECTA',
  'CAUSA_INDIRECTA',
  'EFECTO_DIRECTO',
  'EFECTO_INDIRECTO',
]

function vacio(tipo: TipoNodo, orden: number): NodoVista {
  return {
    tipo,
    orden,
    descripcion: '',
    evidenciaFuente: '',
    evidenciaUrl: '',
    evidenciaNota: '',
  }
}

/**
 * Arma las trece posiciones del árbol (1 problema central + 3 causas directas
 * + 3 causas indirectas + 3 efectos directos + 3 efectos indirectos) a partir
 * de lo que haya guardado, dejando en blanco lo que falte.
 *
 * Las filas viejas pueden venir sin `orden`; en ese caso se ordenan por el
 * momento en que se crearon, para que no se pisen entre ellas.
 */
function armarNodos(filas: FilaProblema[]): NodoVista[] {
  const porTipo = new Map<string, FilaProblema[]>()
  for (const fila of filas) {
    const lista = porTipo.get(fila.tipo) || []
    lista.push(fila)
    porTipo.set(fila.tipo, lista)
  }

  const nodos: NodoVista[] = []

  for (const tipo of TIPOS) {
    const cuantos = tipo === 'CENTRAL' ? 1 : 3
    const lista = (porTipo.get(tipo) || []).sort((a, b) => {
      const oa = a.orden ?? 0
      const ob = b.orden ?? 0
      if (oa !== ob) return oa - ob
      return String(a.created_at || '').localeCompare(String(b.created_at || ''))
    })

    for (let i = 1; i <= cuantos; i += 1) {
      const fila = lista.find((f) => (f.orden ?? 0) === i) || lista[i - 1]
      if (!fila) {
        nodos.push(vacio(tipo, i))
        continue
      }
      nodos.push({
        tipo,
        orden: i,
        descripcion: fila.descripcion || '',
        evidenciaFuente: fila.evidencia_fuente || '',
        evidenciaUrl: fila.evidencia_url || '',
        evidenciaNota: fila.evidencia_nota || '',
      })
    }
  }

  return nodos
}

export default async function PaginaArbolInterno({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const esCorreoAdmin = (user.email || '').toLowerCase().trim() === CORREO_ADMIN
  let permitido = esCorreoAdmin

  if (!permitido) {
    const { data: perfil } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle<{ role: string | null }>()
    permitido = perfil?.role === 'admin'
  }

  if (!permitido) redirect('/dashboard')

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, nombre_cliente, correo_cliente, estado_actual')
    .eq('id', id)
    .maybeSingle<{
      id: string
      nombre_iniciativa: string | null
      nombre_cliente: string | null
      correo_cliente: string | null
      estado_actual: string | null
    }>()

  if (!proyecto?.id) redirect('/admin/proyectos')

  const [filasRes, validacionRes, pasosRes, preguntasRes] = await Promise.all([
    supabase
      .from('problemas_proyecto')
      .select(
        'id, tipo, orden, descripcion, evidencia_fuente, evidencia_url, evidencia_nota, linea_base, created_at',
      )
      .eq('proyecto_id', proyecto.id),
    supabase
      .from('validaciones_arbol')
      .select('respuestas_json, notas_json')
      .eq('proyecto_id', proyecto.id)
      .maybeSingle<{
        respuestas_json: Record<string, string> | null
        notas_json: Record<string, string> | null
      }>(),
    supabase
      .from('pasos_estructuracion')
      .select('id, nombre_paso, orden_secuencia')
      .order('orden_secuencia', { ascending: true }),
    supabase
      .from('preguntas_pendientes_proyecto')
      .select('id, pregunta, critico, id_paso, respondida, respuesta')
      .eq('id_proyecto', proyecto.id)
      .order('created_at', { ascending: false }),
  ])

  const listaFilas = (filasRes.data || []) as FilaProblema[]
  const central = listaFilas.find((f) => f.tipo === 'CENTRAL')

  const pasos = (pasosRes.data || []).map((p) => ({
    id: String(p.id),
    nombre: String(p.nombre_paso || 'Paso sin nombre'),
    orden: Number(p.orden_secuencia ?? 0),
  }))

  const preguntas = (preguntasRes.data || []).map((p) => ({
    id: String(p.id),
    texto: String(p.pregunta || ''),
    critica: p.critico === true,
    respondida: p.respondida === true,
    respuesta: p.respuesta ? String(p.respuesta) : '',
    nombrePaso: pasos.find((x) => x.id === String(p.id_paso))?.nombre || '',
  }))

  return (
    <ArbolProblemasClient
      proyectoId={proyecto.id}
      nombreProyecto={proyecto.nombre_iniciativa || 'Proyecto sin nombre'}
      nombreCliente={proyecto.nombre_cliente || proyecto.correo_cliente || ''}
      nodos={armarNodos(listaFilas)}
      lineaBase={central?.linea_base || ''}
      respuestas={validacionRes.data?.respuestas_json || {}}
      notas={validacionRes.data?.notas_json || {}}
      pasos={pasos}
      preguntas={preguntas}
    />
  )
}
