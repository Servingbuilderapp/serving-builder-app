import React from 'react'
import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { resolverProyectoVisto } from '@/lib/proyectoVisto'
import { BannerProyectoVisto } from '@/components/panel/BannerProyectoVisto'
import {
  palabrasDelProyecto,
  puntuarConvocatoria,
  type ConvocatoriaParaPuntaje,
} from '@/lib/puntajeRapido'

export const dynamic = 'force-dynamic'

/**
 * COINCIDENCIAS — toda la biblioteca de convocatorias abiertas, ordenada por qué tanto
 * encaja con ESTE proyecto. Es un puntaje rápido (no usa IA): sirve para decidir qué
 * mirar primero. El análisis completo se hace cuando se elige una convocatoria.
 * El equipo la ve con ?proyecto=<id>, en solo lectura.
 */

const COLUMNAS_BASE =
  'id, nombre, entidad, sector, objetivo, linea_tematica, territorio, paises_elegibles, tipo_postulante, monto_maximo, moneda, contrapartida_exigida, contrapartida_detalle, requisitos_habilitantes, fecha_cierre, fuente_oficial, enlace_aplicacion'
const COLUMNAS_CON_CONDICIONES = `${COLUMNAS_BASE}, consorcio_obligatorio, madurez_financiable, verificada_en`

const UMBRALES = [
  { valor: 80, etiqueta: '80 % o más · encaje alto' },
  { valor: 60, etiqueta: '60 % o más · encaje medio' },
  { valor: 40, etiqueta: '40 % o más · ver más' },
]

const MAXIMO_EN_PANTALLA = 40

function pesos(valor: number, moneda?: string | null): string {
  const codigo = (moneda || 'COP').toUpperCase()
  try {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: codigo, maximumFractionDigits: 0 }).format(valor)
  } catch {
    return `${valor.toLocaleString('es-CO')} ${codigo}`
  }
}

function colorPuntaje(p: number): string {
  if (p >= 80) return 'text-[#C9A46B] border-[#C9A46B]'
  if (p >= 60) return 'text-[#F3E7DC] border-[#B08D57]'
  return 'text-[#F3E7DC]/60 border-[#F3E7DC]/30'
}

export default async function CoincidenciasPage({
  searchParams,
}: {
  searchParams?: Promise<{ proyecto?: string; minimo?: string }>
}) {
  const params = searchParams ? await searchParams : undefined
  const vista = await resolverProyectoVisto(params?.proyecto)
  const minimo = [40, 60, 80].includes(Number(params?.minimo)) ? Number(params?.minimo) : 60
  const aProyecto = vista.vistaEquipo ? `&proyecto=${vista.proyectoId}` : ''

  if (!vista.proyectoId) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10 text-[#F3E7DC]">
        <h1 className="text-xl font-extrabold">Coincidencias</h1>
        <p className="mt-2 text-sm text-[#F3E7DC]/70">
          Cuando tengas un proyecto con nosotros, aquí verás las convocatorias abiertas que más encajan con él.
        </p>
      </div>
    )
  }

  /* ---- lo que sabemos del proyecto: su nombre, su documento y lo que contó en el diagnóstico ---- */
  const { data: proyecto } = await vista.db
    .from('proyectos_clientes_serving')
    .select('nombre_iniciativa, dossier_markdown, monto_solicitado_cop, respuestas_fase1_json')
    .eq('id', vista.proyectoId)
    .maybeSingle()

  let textoDiagnostico = ''
  if (vista.correoCliente) {
    const { data: diag } = await supabaseAdmin
      .from('diagnosticos')
      .select('datos_formulario')
      .ilike('email', vista.correoCliente)
      .not('datos_formulario', 'is', null)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    if (diag?.datos_formulario && typeof diag.datos_formulario === 'object') {
      textoDiagnostico = Object.entries(diag.datos_formulario as Record<string, unknown>)
        .filter(([clave, valor]) => !/documento|identidad|correo|email|tel[eé]fono|whats|contrase|password/i.test(clave) && typeof valor === 'string')
        .map(([, valor]) => String(valor))
        .join(' ')
        .slice(0, 6000)
    }
  }

  const textoProyecto = [proyecto?.nombre_iniciativa, String(proyecto?.dossier_markdown || '').slice(0, 6000), textoDiagnostico]
    .filter(Boolean)
    .join(' ')

  const perfil = {
    tipoSolicitante:
      String((proyecto?.respuestas_fase1_json as Record<string, unknown> | null)?.q4_tipo_solicitante || '') || null,
    montoSolicitadoCop: Number(proyecto?.monto_solicitado_cop || 0) || null,
  }

  /* ---- la biblioteca abierta (con las condiciones si la base ya las tiene) ---- */
  const hoy = new Date().toISOString().slice(0, 10)
  let consulta = await supabaseAdmin
    .from('biblioteca_convocatorias')
    .select(COLUMNAS_CON_CONDICIONES)
    .or(`fecha_cierre.is.null,fecha_cierre.gte.${hoy}`)
    .limit(2000)
  if (consulta.error) {
    consulta = await supabaseAdmin
      .from('biblioteca_convocatorias')
      .select(COLUMNAS_BASE)
      .or(`fecha_cierre.is.null,fecha_cierre.gte.${hoy}`)
      .limit(2000) as unknown as typeof consulta
  }
  const biblioteca = ((consulta.data || []) as unknown as ConvocatoriaParaPuntaje[]).filter((c) => c.nombre)

  const claves = palabrasDelProyecto(textoProyecto, biblioteca)
  const puntuadas = biblioteca
    .map((c) => ({ c, resultado: puntuarConvocatoria(c, claves, perfil) }))
    .sort((a, b) => b.resultado.puntaje - a.resultado.puntaje)

  const conteo = { 80: 0, 60: 0, 40: 0 } as Record<number, number>
  for (const p of puntuadas) {
    for (const u of [80, 60, 40]) if (p.resultado.puntaje >= u) conteo[u] += 1
  }
  const visibles = puntuadas.filter((p) => p.resultado.puntaje >= minimo).slice(0, MAXIMO_EN_PANTALLA)

  return (
    <>
      <BannerProyectoVisto vista={vista} />
      <div className="mx-auto max-w-4xl px-4 py-6 text-[#F3E7DC]">
        <h1 className="text-xl font-extrabold">Coincidencias</h1>
        <p className="mt-1 text-sm text-[#F3E7DC]/70">
          Las convocatorias abiertas, ordenadas por qué tanto encajan con tu proyecto. Es un puntaje rápido para
          decidir cuáles mirar primero: el análisis completo se hace cuando eliges una.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {UMBRALES.map((u) => (
            <Link
              key={u.valor}
              href={`/coincidencias?minimo=${u.valor}${aProyecto}`}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                minimo === u.valor
                  ? 'border-[#C9A46B] bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420]'
                  : 'border-[#B08D57]/50 text-[#F3E7DC]/80 hover:bg-[#4C2032]'
              }`}
            >
              {u.etiqueta} ({conteo[u.valor]})
            </Link>
          ))}
        </div>

        <p className="mt-3 text-xs text-[#F3E7DC]/55">
          {biblioteca.length} convocatorias abiertas en la biblioteca. Mostrando las {visibles.length} de mayor encaje.
        </p>

        {visibles.length === 0 ? (
          <div className="mt-6 rounded-xl border border-[#B08D57]/40 bg-[#4C2032] p-5 text-sm">
            No hay convocatorias con ese nivel de encaje todavía. Prueba con «40 % o más» para ver más opciones.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            {visibles.map(({ c, resultado }) => {
              const enlace = c.enlace_aplicacion || c.fuente_oficial
              return (
                <div key={c.id} className="rounded-xl border border-[#B08D57]/40 bg-[#4C2032] p-4">
                  <div className="flex gap-4">
                    <div
                      className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full border-2 text-base font-black ${colorPuntaje(resultado.puntaje)}`}
                    >
                      {resultado.puntaje}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-extrabold">{c.nombre}</div>
                      <div className="text-xs text-[#F3E7DC]/65">{c.entidad || 'Entidad por confirmar'}</div>
                      <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-[#F3E7DC]/75">
                        <span>
                          Cierre:{' '}
                          {c.fecha_cierre ? new Date(c.fecha_cierre).toLocaleDateString('es-CO') : 'sin fecha confirmada'}
                        </span>
                        {c.monto_maximo ? <span>Hasta {pesos(c.monto_maximo, c.moneda)}</span> : null}
                        <span className="font-bold text-[#C9A46B]">{resultado.elegibilidad.etiqueta}</span>
                      </div>
                      <ul className="mt-1.5 space-y-0.5 text-xs text-[#F3E7DC]/60">
                        {resultado.razones.slice(0, 3).map((r) => (
                          <li key={r}>• {r}</li>
                        ))}
                      </ul>
                      {enlace ? (
                        <a
                          href={enlace}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-[#B08D57] hover:underline"
                        >
                          Ver la convocatoria <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      ) : null}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
