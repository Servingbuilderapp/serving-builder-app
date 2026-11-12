import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { MercadoClient } from '@/components/empresarial/MercadoClient'
import type { Condicion } from '@/lib/empresarial/formulacion'
import {
  armarBorradorMercado,
  mercadoVacio,
  type CampoMercado,
  type Mercado,
  type Segmento,
} from '@/lib/empresarial/mercado'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Estudio de mercado | Serving',
}

const mensaje = (titulo: string, texto: string) => (
  <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino flex items-center justify-center px-5">
    <div className="max-w-md text-center">
      <h1 className="text-2xl font-extrabold">{titulo}</h1>
      <p className="mt-3 text-ca-vino/80">{texto}</p>
      <Link href="/empresarial" className="mt-6 inline-block underline">
        Volver
      </Link>
    </div>
  </main>
)

/**
 * Estudio de mercado, pantalla 1 (Camino A): qué mercado es, dónde se atiende y quiénes son los clientes.
 * Si ya se guardó, se muestra lo guardado. Si no, se arma un borrador con lo que la persona
 * ya escribió en Formulación (sector, lugar y beneficiarios), sin inventar nada.
 * Todo se lee con la sesión de la persona: solo ve lo suyo.
 */
export default async function MercadoPage({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')

  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para hacer el estudio de mercado.')

  const { data: proyecto } = await supabase
    .from('sfpe_proyectos')
    .select('id, nombre, pais, moneda, profundidad')
    .eq('id', proyectoId)
    .maybeSingle()
  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  // Lo que ya se formuló (para traer el borrador y mostrarlo como referencia).
  const { data: formulacion } = await supabase
    .from('sfpe_formulacion')
    .select('sector, ubicacion, problema, alcance')
    .eq('proyecto_id', proyecto.id)
    .maybeSingle()

  const { data: benef } = await supabase
    .from('sfpe_formulacion_items')
    .select('texto, condicion')
    .eq('proyecto_id', proyecto.id)
    .eq('tipo', 'beneficiario')
    .order('orden', { ascending: true })

  const borrador = armarBorradorMercado(
    formulacion
      ? {
          sector: formulacion.sector as string | null,
          ubicacion: formulacion.ubicacion as string | null,
          problema: formulacion.problema as string | null,
          alcance: formulacion.alcance as string | null,
        }
      : null,
    (benef ?? []).map((b) => ({ texto: b.texto as string, condicion: b.condicion as Condicion })),
  )

  // ¿Ya hay un estudio guardado?
  const { data: guardado } = await supabase
    .from('sfpe_mercado')
    .select(
      'producto, tipo_comprador, naturaleza, cobertura, etapa_mercado, sector, ubicacion, atencion_remota, descripcion_mercado, delimitacion, restricciones, condiciones',
    )
    .eq('proyecto_id', proyecto.id)
    .maybeSingle()

  let inicial: Mercado = borrador.mercado
  let segmentos: Segmento[] = borrador.segmentos
  if (guardado) {
    const base = mercadoVacio()
    inicial = {
      ...base,
      producto: String(guardado.producto ?? ''),
      tipo_comprador: String(guardado.tipo_comprador ?? ''),
      naturaleza: String(guardado.naturaleza ?? ''),
      cobertura: String(guardado.cobertura ?? ''),
      etapa_mercado: String(guardado.etapa_mercado ?? 'no_se'),
      sector: String(guardado.sector ?? ''),
      ubicacion: String(guardado.ubicacion ?? ''),
      atencion_remota: String(guardado.atencion_remota ?? ''),
      descripcion_mercado: String(guardado.descripcion_mercado ?? ''),
      delimitacion: String(guardado.delimitacion ?? ''),
      restricciones: String(guardado.restricciones ?? ''),
      condiciones: (guardado.condiciones ?? {}) as Partial<Record<CampoMercado, Condicion>>,
    }
    const { data: segs } = await supabase
      .from('sfpe_mercado_segmentos')
      .select('id, nombre, descripcion, necesidades, capacidad_compra, barreras, canales, roles, condicion, origen')
      .eq('proyecto_id', proyecto.id)
      .order('orden', { ascending: true })
    segmentos = (segs ?? []).map((s) => ({
      id: s.id as string,
      nombre: String(s.nombre ?? ''),
      descripcion: String(s.descripcion ?? ''),
      necesidades: String(s.necesidades ?? ''),
      capacidad_compra: String(s.capacidad_compra ?? ''),
      barreras: String(s.barreras ?? ''),
      canales: String(s.canales ?? ''),
      roles: (s.roles ?? []) as string[],
      condicion: s.condicion as Condicion,
      origen: (s.origen === 'formulacion' ? 'formulacion' : 'persona') as Segmento['origen'],
    }))
  }

  return (
    <MercadoClient
      proyecto={{
        id: proyecto.id as string,
        nombre: proyecto.nombre as string,
        pais: proyecto.pais as string | null,
        moneda: proyecto.moneda as string | null,
        profundidad: proyecto.profundidad as string | null,
      }}
      mercadoInicial={inicial}
      segmentosIniciales={segmentos}
      yaGuardado={Boolean(guardado)}
      formulacion={
        formulacion
          ? { problema: (formulacion.problema as string | null) ?? '', alcance: (formulacion.alcance as string | null) ?? '' }
          : null
      }
    />
  )
}
