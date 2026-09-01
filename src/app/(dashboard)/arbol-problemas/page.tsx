import React from 'react'
import { createClient } from '@/lib/supabase/server'
import {
  ArbolProblemasClient,
  type NodoVista,
  type TipoNodo,
} from '@/components/panel/ArbolProblemasClient'

export const dynamic = 'force-dynamic'

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
 * Arma las once posiciones del árbol (1 central + 3 causas directas +
 * 3 causas indirectas + 3 efectos directos + 3 efectos indirectos) a partir
 * de lo que haya guardado, dejando en blanco lo que falte.
 *
 * Las filas viejas pueden venir sin `orden`; en ese caso se les asigna según
 * el momento en que se crearon, para que no se pisen entre ellas.
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

export default async function PaginaArbolProblemas() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const correo = user?.email || 'local@desarrollo.test'

  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa')
    .eq('correo_cliente', correo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle<{ id: string; nombre_iniciativa: string | null }>()

  if (!proyecto?.id) {
    return (
      <ArbolProblemasClient
        proyectoId=""
        nombreProyecto=""
        nodos={TIPOS.flatMap((t) =>
          Array.from({ length: t === 'CENTRAL' ? 1 : 3 }, (_, i) => vacio(t, i + 1)),
        )}
        lineaBase=""
        respuestas={{}}
        notas={{}}
      />
    )
  }

  const { data: filas } = await supabase
    .from('problemas_proyecto')
    .select(
      'id, tipo, orden, descripcion, evidencia_fuente, evidencia_url, evidencia_nota, linea_base, created_at',
    )
    .eq('proyecto_id', proyecto.id)

  const listaFilas = (filas || []) as FilaProblema[]
  const central = listaFilas.find((f) => f.tipo === 'CENTRAL')

  const { data: validacion } = await supabase
    .from('validaciones_arbol')
    .select('respuestas_json, notas_json')
    .eq('proyecto_id', proyecto.id)
    .maybeSingle<{
      respuestas_json: Record<string, string> | null
      notas_json: Record<string, string> | null
    }>()

  return (
    <ArbolProblemasClient
      proyectoId={proyecto.id}
      nombreProyecto={proyecto.nombre_iniciativa || ''}
      nodos={armarNodos(listaFilas)}
      lineaBase={central?.linea_base || ''}
      respuestas={validacion?.respuestas_json || {}}
      notas={validacion?.notas_json || {}}
    />
  )
}
