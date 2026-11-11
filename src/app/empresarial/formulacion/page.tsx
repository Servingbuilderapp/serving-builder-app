import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { FormulacionClient } from '@/components/empresarial/FormulacionClient'
import {
  armarBorrador,
  formulacionVacia,
  type Condicion,
  type EvidenciaOrigen,
  type Formulacion,
  type HipotesisOrigen,
  type ItemFormulacion,
  type CampoTexto,
  type OrigenItem,
  type TipoItem,
} from '@/lib/empresarial/formulacion'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Formulación | Serving',
}

const mensaje = (titulo: string, texto: string) => (
  <main className="min-h-screen bg-gradient-to-b from-[#2E0E1A] via-[#3B1727] to-[#54142B] text-[#F3E7DC] flex items-center justify-center px-5">
    <div className="max-w-md text-center">
      <h1 className="text-2xl font-extrabold">{titulo}</h1>
      <p className="mt-3 text-[#F3E7DC]/80">{texto}</p>
      <Link href="/empresarial" className="mt-6 inline-block underline">
        Volver
      </Link>
    </div>
  </main>
)

/**
 * Formulación del proyecto derivado de una oportunidad (Camino A).
 * Si la formulación ya se guardó, se muestra lo guardado. Si no, se arma un borrador
 * con lo que la persona ya trabajó en Oportunidades (sin inventar nada) y queda por revisar.
 * Todo se lee con la sesión de la persona: solo ve lo suyo.
 */
export default async function FormulacionPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')

  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para formularlo.')

  const { data: proyecto } = await supabase
    .from('sfpe_proyectos')
    .select('id, nombre, estado, perfil_confirmado, pais, moneda, profundidad')
    .eq('id', proyectoId)
    .maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  // La oportunidad de la que nació este proyecto (vive en el proyecto de origen).
  const { data: oportunidad } = await supabase
    .from('sfpe_oportunidades')
    .select(
      'id, proyecto_id, problema_id, nombre, descripcion, categoria, cliente_o_beneficiario, solucion_propuesta, valor_generado, sector, ubicacion',
    )
    .eq('proyecto_derivado_id', proyecto.id)
    .maybeSingle()

  let problema = null
  let hipotesis: HipotesisOrigen[] = []
  if (oportunidad) {
    if (oportunidad.problema_id) {
      const { data } = await supabase
        .from('sfpe_problemas')
        .select('titulo, descripcion, afectados, frecuencia, consecuencias')
        .eq('id', oportunidad.problema_id)
        .maybeSingle()
      problema = data
    }
    const { data: hs } = await supabase
      .from('sfpe_hipotesis')
      .select('id, tipo, enunciado, estado')
      .eq('oportunidad_id', oportunidad.id)
      .order('creada_en', { ascending: true })
    const ids = (hs ?? []).map((h) => h.id as string)
    const { data: evs } = ids.length
      ? await supabase
          .from('sfpe_evidencias')
          .select('hipotesis_id, tipo, nivel, descripcion, fuente, enlace, estado_revision')
          .in('hipotesis_id', ids)
      : { data: [] }
    hipotesis = (hs ?? []).map((h) => ({
      id: h.id as string,
      tipo: h.tipo as string,
      enunciado: h.enunciado as string,
      estado: h.estado as string,
      evidencias: (evs ?? [])
        .filter((e) => e.hipotesis_id === h.id)
        .map(
          (e): EvidenciaOrigen => ({
            tipo: e.tipo as string,
            nivel: e.nivel as string,
            descripcion: e.descripcion as string | null,
            fuente: e.fuente as string | null,
            enlace: e.enlace as string | null,
            estado_revision: e.estado_revision as string,
          }),
        ),
    }))
  }

  const borrador = armarBorrador(
    proyecto.nombre as string,
    oportunidad
      ? {
          id: oportunidad.id as string,
          nombre: oportunidad.nombre as string,
          descripcion: oportunidad.descripcion as string | null,
          categoria: oportunidad.categoria as string | null,
          cliente_o_beneficiario: oportunidad.cliente_o_beneficiario as string | null,
          solucion_propuesta: oportunidad.solucion_propuesta as string | null,
          valor_generado: oportunidad.valor_generado as string | null,
          sector: oportunidad.sector as string | null,
          ubicacion: oportunidad.ubicacion as string | null,
        }
      : null,
    problema,
    hipotesis,
  )

  // ¿Ya hay una formulación guardada?
  const { data: guardada } = await supabase
    .from('sfpe_formulacion')
    .select(
      'tipo_proyecto, sector, ubicacion, duracion_meses, problema, justificacion, antecedentes, objetivo_general, alcance, exclusiones, condiciones',
    )
    .eq('proyecto_id', proyecto.id)
    .maybeSingle()

  let inicial: Formulacion = borrador.formulacion
  let items: ItemFormulacion[] = borrador.items
  if (guardada) {
    const base = formulacionVacia()
    inicial = {
      ...base,
      tipo_proyecto: String(guardada.tipo_proyecto ?? ''),
      sector: String(guardada.sector ?? ''),
      ubicacion: String(guardada.ubicacion ?? ''),
      duracion_meses: guardada.duracion_meses === null || guardada.duracion_meses === undefined ? '' : String(guardada.duracion_meses),
      problema: String(guardada.problema ?? ''),
      justificacion: String(guardada.justificacion ?? ''),
      antecedentes: String(guardada.antecedentes ?? ''),
      objetivo_general: String(guardada.objetivo_general ?? ''),
      alcance: String(guardada.alcance ?? ''),
      exclusiones: String(guardada.exclusiones ?? ''),
      condiciones: (guardada.condiciones ?? {}) as Partial<Record<CampoTexto, Condicion>>,
    }
    const { data: guardados } = await supabase
      .from('sfpe_formulacion_items')
      .select('id, tipo, texto, condicion, origen')
      .eq('proyecto_id', proyecto.id)
      .order('orden', { ascending: true })
    items = (guardados ?? []).map((i) => ({
      id: i.id as string,
      tipo: i.tipo as TipoItem,
      texto: i.texto as string,
      condicion: i.condicion as Condicion,
      origen: i.origen as OrigenItem,
    }))
  }

  return (
    <FormulacionClient
      proyecto={{
        id: proyecto.id as string,
        nombre: proyecto.nombre as string,
        estado: proyecto.estado as string,
        profundidad: proyecto.profundidad as string | null,
        moneda: proyecto.moneda as string | null,
      }}
      oportunidad={
        oportunidad ? { id: oportunidad.id as string, nombre: oportunidad.nombre as string, proyectoOrigenId: oportunidad.proyecto_id as string } : null
      }
      formulacionInicial={inicial}
      itemsIniciales={items}
      yaGuardada={Boolean(guardada)}
      comprobadas={borrador.comprobadas}
      pendientes={borrador.pendientes}
    />
  )
}
