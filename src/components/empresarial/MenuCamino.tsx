'use client'

import React, { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Check, Lock, Map as IconoMapa } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/* -------------------------------------------------------------------------- */
/* Datos del camino: qué pasos hay, cuáles están hechos y a cuál ir           */
/* -------------------------------------------------------------------------- */

export type EstadoPaso = 'hecho' | 'en_curso' | 'por_hacer' | 'bloqueado' | 'proximamente'

export interface PasoCamino {
  clave: 'diagnostico' | 'oportunidades' | 'formulacion' | 'mercado' | 'demanda' | 'competencia' | 'tecnico' | 'financiero' | 'documento'
  titulo: string
  ayuda: string
  href: string | null
  estado: EstadoPaso
}

export interface DatosCamino {
  nombre: string
  origenId: string
  derivadoId: string | null
  pasos: PasoCamino[]
  /** El primer paso disponible que todavía no está hecho. */
  siguiente: PasoCamino | null
}

const contar = async (q: PromiseLike<{ count: number | null }>) => (await q).count ?? 0

/** Lee, con la sesión de la persona, en qué punto va su proyecto. Solo ve lo suyo. */
export async function cargarCamino(proyectoId: string): Promise<DatosCamino | null> {
  const supabase = createClient()
  const { data: p } = await supabase.from('sfpe_proyectos').select('id, nombre').eq('id', proyectoId).maybeSingle()
  if (!p) return null

  // ¿Este proyecto nació de una oportunidad? Entonces el punto de partida vive en otro proyecto.
  const { data: deOrigen } = await supabase
    .from('sfpe_oportunidades')
    .select('proyecto_id')
    .eq('proyecto_derivado_id', p.id)
    .maybeSingle()
  const origenId = (deOrigen?.proyecto_id as string | undefined) ?? (p.id as string)

  let nombre = p.nombre as string
  if (origenId !== p.id) {
    const { data: o } = await supabase.from('sfpe_proyectos').select('nombre').eq('id', origenId).maybeSingle()
    if (o?.nombre) nombre = o.nombre as string
  }

  const { data: convertidas } = await supabase
    .from('sfpe_oportunidades')
    .select('proyecto_derivado_id')
    .eq('proyecto_id', origenId)
    .not('proyecto_derivado_id', 'is', null)
  const derivados = (convertidas ?? []).map((c) => c.proyecto_derivado_id as string)
  const derivadoId = origenId !== p.id ? (p.id as string) : (derivados[0] ?? null)

  // Formulación y mercado trabajan sobre el proyecto derivado; si aún no hay uno, se puede entrar igual con este.
  const trabajoId = derivadoId ?? (p.id as string)
  const head = { count: 'exact' as const, head: true }
  const [sesiones, descubrimiento, oportunidades, formulacion, mercado, demanda, competencia] = await Promise.all([
    contar(supabase.from('sfpe_diag_sesiones').select('id', head).eq('proyecto_id', origenId).eq('estado', 'completado')),
    contar(supabase.from('sfpe_descubrimiento').select('id', head).eq('proyecto_id', origenId)),
    contar(supabase.from('sfpe_oportunidades').select('id', head).eq('proyecto_id', origenId)),
    contar(supabase.from('sfpe_formulacion').select('id', head).eq('proyecto_id', trabajoId)),
    contar(supabase.from('sfpe_mercado').select('id', head).eq('proyecto_id', trabajoId)),
    contar(supabase.from('sfpe_mercado_tamano').select('id', head).eq('proyecto_id', trabajoId)),
    contar(supabase.from('sfpe_mercado_precio').select('id', head).eq('proyecto_id', trabajoId)),
  ])

  const aviso = derivadoId ? '' : ' Puedes entrar ya; lo ideal es antes pasar una oportunidad a proyecto.'
  const pasos: PasoCamino[] = [
    {
      clave: 'diagnostico',
      titulo: 'Diagnóstico',
      ayuda: 'Tu punto de partida: dónde estás hoy.',
      href: `/empresarial/diagnostico?proyecto=${origenId}`,
      estado: sesiones + descubrimiento > 0 ? 'hecho' : 'por_hacer',
    },
    {
      clave: 'oportunidades',
      titulo: 'Oportunidades',
      ayuda: 'Elegir, comprobar y pasar a proyecto la que más vale la pena.',
      href: `/empresarial/oportunidades?proyecto=${origenId}`,
      estado: derivadoId ? 'hecho' : oportunidades > 0 ? 'en_curso' : 'por_hacer',
    },
    {
      clave: 'formulacion',
      titulo: 'Formulación',
      ayuda: `Problema, objetivos, alcance y resultados.${aviso}`,
      href: `/empresarial/formulacion?proyecto=${trabajoId}`,
      estado: formulacion > 0 ? 'hecho' : 'por_hacer',
    },
    {
      clave: 'mercado',
      titulo: 'Mercado: clientes y territorio',
      ayuda: `Qué mercado es, dónde se atiende y quiénes son tus clientes.${aviso}`,
      href: `/empresarial/mercado?proyecto=${trabajoId}`,
      estado: mercado > 0 ? 'hecho' : 'por_hacer',
    },
    {
      clave: 'demanda',
      titulo: 'Mercado: demanda y tamaño',
      ayuda: `Cuánta gente lo necesita y cuánto vale (TAM, SAM, SOM).${aviso}`,
      href: `/empresarial/mercado/demanda?proyecto=${trabajoId}`,
      estado: demanda > 0 ? 'hecho' : 'por_hacer',
    },
    {
      clave: 'competencia',
      titulo: 'Mercado: competencia y precios',
      ayuda: `Con quién compites, a qué precio y cómo llegas.${aviso}`,
      href: `/empresarial/mercado/competencia?proyecto=${trabajoId}`,
      estado: competencia > 0 ? 'hecho' : 'por_hacer',
    },
    { clave: 'tecnico', titulo: 'Estudio técnico', ayuda: 'Cómo se va a producir o prestar.', href: null, estado: 'proximamente' },
    { clave: 'financiero', titulo: 'Financiero básico', ayuda: 'Cuánto cuesta y cuánto deja.', href: null, estado: 'proximamente' },
    { clave: 'documento', titulo: 'Documento final', ayuda: 'Tu proyecto completo, listo para presentar.', href: null, estado: 'proximamente' },
  ]
  const siguiente = pasos.find((x) => x.href && x.estado !== 'hecho') ?? null
  return { nombre, origenId, derivadoId, pasos, siguiente }
}

export function useCamino(proyectoId: string | null) {
  const [datos, setDatos] = useState<DatosCamino | null>(null)
  const [cargando, setCargando] = useState(Boolean(proyectoId))
  useEffect(() => {
    if (!proyectoId) return
    let vigente = true
    cargarCamino(proyectoId)
      .then((d) => {
        if (vigente) setDatos(d)
      })
      .catch(() => {
        if (vigente) setDatos(null)
      })
      .finally(() => {
        if (vigente) setCargando(false)
      })
    return () => {
      vigente = false
    }
  }, [proyectoId])
  return { datos, cargando }
}

/** ¿En qué paso está la persona según la dirección? */
export function pasoActual(ruta: string): PasoCamino['clave'] | null {
  if (ruta.startsWith('/empresarial/diagnostico') || ruta.startsWith('/empresarial/descubrimiento')) return 'diagnostico'
  if (ruta.startsWith('/empresarial/oportunidades')) return 'oportunidades'
  if (ruta.startsWith('/empresarial/formulacion')) return 'formulacion'
  if (ruta.startsWith('/empresarial/mercado/competencia')) return 'competencia'
  if (ruta.startsWith('/empresarial/mercado/demanda')) return 'demanda'
  if (ruta.startsWith('/empresarial/mercado')) return 'mercado'
  return null
}

const ETIQUETA_ESTADO: Record<EstadoPaso, string> = {
  hecho: 'Hecho',
  en_curso: 'En curso',
  por_hacer: 'Por hacer',
  bloqueado: 'Aún no',
  proximamente: 'Muy pronto',
}

/* -------------------------------------------------------------------------- */
/* Menú lateral                                                               */
/* -------------------------------------------------------------------------- */

function ListaPasos({ pasos, actual }: { pasos: PasoCamino[]; actual: PasoCamino['clave'] | null }) {
  return (
    <ol className="space-y-1">
      {pasos.map((p, i) => {
        const esActual = p.clave === actual
        const cuerpo = (
          <span className="flex items-start gap-3">
            <span
              aria-hidden
              className={`mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                p.estado === 'hecho'
                  ? 'bg-[#C9A46B] text-[#3A1420]'
                  : esActual
                    ? 'border-2 border-[#C9A46B] text-[#C9A46B]'
                    : 'border border-[#B08D57]/50 text-[#F3E7DC]/60'
              }`}
            >
              {p.estado === 'hecho' ? <Check className="h-3.5 w-3.5" /> : p.href ? i + 1 : <Lock className="h-3 w-3" />}
            </span>
            <span>
              <span className={`block text-sm ${esActual ? 'font-extrabold text-white' : 'font-semibold'}`}>{p.titulo}</span>
              <span className="block text-xs text-[#F3E7DC]/60">{ETIQUETA_ESTADO[p.estado]}</span>
            </span>
          </span>
        )
        return (
          <li key={p.clave}>
            {p.href ? (
              <Link
                href={p.href}
                aria-current={esActual ? 'page' : undefined}
                className={`block rounded-xl px-3 py-2.5 transition-colors ${
                  esActual ? 'bg-[#4C2032] ring-1 ring-[#C9A46B]/70' : 'hover:bg-[#3B1727]'
                }`}
              >
                {cuerpo}
              </Link>
            ) : (
              <div className="cursor-not-allowed rounded-xl px-3 py-2.5 opacity-55" title={p.ayuda}>
                {cuerpo}
              </div>
            )}
          </li>
        )
      })}
    </ol>
  )
}

function MenuInterno() {
  const busqueda = useSearchParams()
  const ruta = usePathname()
  const proyectoId = busqueda.get('proyecto')
  const { datos } = useCamino(proyectoId)
  if (!proyectoId || !datos) return null
  const actual = pasoActual(ruta)

  return (
    <aside className="border-b border-[#B08D57]/30 bg-[#2E0E1A] text-[#F3E7DC] lg:sticky lg:top-0 lg:h-screen lg:w-72 lg:shrink-0 lg:overflow-y-auto lg:border-b-0 lg:border-r">
      {/* En celular: plegable, para no ocupar la pantalla */}
      <details className="lg:hidden">
        <summary className="flex cursor-pointer items-center gap-2 px-5 py-3 text-sm font-bold">
          <IconoMapa className="h-4 w-4 text-[#C9A46B]" /> Mi camino · {datos.nombre}
        </summary>
        <div className="px-3 pb-4">
          <ListaPasos pasos={datos.pasos} actual={actual} />
          <Link href="/empresarial" className="mt-3 block px-3 text-xs underline text-[#F3E7DC]/70">
            Mis proyectos
          </Link>
        </div>
      </details>

      <div className="hidden px-4 py-8 lg:block">
        <div className="px-3 text-xs font-bold uppercase tracking-[0.25em] text-[#C9A46B]">Mi camino</div>
        <div className="mt-2 px-3 text-lg font-extrabold leading-snug">{datos.nombre}</div>
        <div className="mt-5">
          <ListaPasos pasos={datos.pasos} actual={actual} />
        </div>
        <div className="mt-6 space-y-2 px-3 text-xs">
          <Link href={`/empresarial/camino?proyecto=${proyectoId}`} className="block underline text-[#F3E7DC]/80 hover:text-white">
            Ver el camino completo
          </Link>
          <Link href="/empresarial" className="block underline text-[#F3E7DC]/70 hover:text-white">
            Mis proyectos
          </Link>
        </div>
      </div>
    </aside>
  )
}

export function MenuCamino() {
  return (
    <Suspense fallback={null}>
      <MenuInterno />
    </Suspense>
  )
}
