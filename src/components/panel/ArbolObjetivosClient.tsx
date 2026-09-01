'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Loader2, Minus, Save, Sparkles } from 'lucide-react'
import {
  arrancaConInfinitivo,
  espejoObjetivoGeneral,
  espejoPositivo,
  VERBOS_OBJETIVO,
} from '@/lib/espejoObjetivos'
import {
  guardarObjetivos,
  type TipoObjetivo,
} from '@/app/(dashboard)/admin/proyectos/[id]/objetivos/actions'

/* ==========================================================================
   Árbol de objetivos. Pantalla INTERNA del equipo.

   Cada línea muestra el nodo del árbol de problemas a la izquierda y su
   espejo en positivo a la derecha. El botón propone el espejo cambiando solo
   la palabra de polaridad; si no la reconoce, no inventa nada y lo deja al
   estructurador.
   ========================================================================== */

export type ParEspejo = {
  problemaId: string
  tipoProblema: string
  tipoObjetivo: TipoObjetivo
  orden: number
  textoProblema: string
  textoObjetivo: string
}

type Props = {
  proyectoId: string
  nombreProyecto: string
  nombreCliente: string
  pares: ParEspejo[]
}

const SOMBRA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)]'
const TINTA = 'text-[#0B2A4A]'
const TINTA_SUAVE = 'text-[#5B6B84]'
const TINTA_TENUE = 'text-[#7C8CA5]'
const BORDE = 'border-[#E4EAF3]'

const TITULO_BLOQUE: Record<string, { titulo: string; se_convierte_en: string; ayuda: string }> = {
  EFECTO_INDIRECTO: {
    titulo: 'Efectos indirectos',
    se_convierte_en: 'Fines indirectos · los impactos',
    ayuda: 'El cambio grande al que el proyecto contribuye, años después.',
  },
  EFECTO_DIRECTO: {
    titulo: 'Efectos directos',
    se_convierte_en: 'Fines directos · los resultados esperados',
    ayuda: 'Lo que cambia en la gente al terminar el proyecto.',
  },
  CENTRAL: {
    titulo: 'Problema central',
    se_convierte_en: 'Objetivo general',
    ayuda: 'Uno solo, y arranca con un verbo en infinitivo.',
  },
  CAUSA_DIRECTA: {
    titulo: 'Causas directas',
    se_convierte_en: 'Objetivos específicos',
    ayuda: 'Entre dos y cinco. Cada uno ataca una causa.',
  },
  CAUSA_INDIRECTA: {
    titulo: 'Causas indirectas',
    se_convierte_en: 'Actividades',
    ayuda: 'Lo que el equipo va a hacer para mover cada objetivo específico.',
  },
}

const ORDEN_BLOQUES = [
  'EFECTO_INDIRECTO',
  'EFECTO_DIRECTO',
  'CENTRAL',
  'CAUSA_DIRECTA',
  'CAUSA_INDIRECTA',
]

function Tarjeta({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl border ${BORDE} bg-white ${SOMBRA} ${className}`}>{children}</div>
}

export function ArbolObjetivosClient({
  proyectoId,
  nombreProyecto,
  nombreCliente,
  pares,
}: Props) {
  const [textos, setTextos] = React.useState<Record<string, string>>(() =>
    Object.fromEntries(pares.map((p) => [p.problemaId, p.textoObjetivo])),
  )
  const [verbo, setVerbo] = React.useState<string>(VERBOS_OBJETIVO[0])
  const [aviso, setAviso] = React.useState<{ ok: boolean; texto: string } | null>(null)
  const [guardando, empezarGuardado] = React.useTransition()

  const central = pares.find((p) => p.tipoProblema === 'CENTRAL')

  const cambiar = (problemaId: string, valor: string) => {
    setAviso(null)
    setTextos((prev) => ({ ...prev, [problemaId]: valor }))
  }

  const proponerUno = (par: ParEspejo) => {
    const propuesta =
      par.tipoProblema === 'CENTRAL'
        ? espejoObjetivoGeneral(par.textoProblema, verbo)
        : espejoPositivo(par.textoProblema)

    if (!propuesta) {
      setAviso({
        ok: false,
        texto: 'No reconozco la palabra con la que arranca ese enunciado. Escríbelo a mano.',
      })
      return
    }
    cambiar(par.problemaId, propuesta)
  }

  const proponerVacios = () => {
    setAviso(null)
    let sinReconocer = 0
    const nuevos = { ...textos }

    for (const par of pares) {
      if ((nuevos[par.problemaId] || '').trim()) continue
      const propuesta =
        par.tipoProblema === 'CENTRAL'
          ? espejoObjetivoGeneral(par.textoProblema, verbo)
          : espejoPositivo(par.textoProblema)
      if (propuesta) nuevos[par.problemaId] = propuesta
      else sinReconocer += 1
    }

    setTextos(nuevos)
    if (sinReconocer > 0) {
      setAviso({
        ok: false,
        texto: `Quedaron ${sinReconocer} sin propuesta: no reconocí con qué palabra arrancan. Esos van a mano.`,
      })
    }
  }

  const revision = React.useMemo(() => {
    const llenos = pares.filter((p) => (textos[p.problemaId] || '').trim().length > 0)
    const generalTexto = central ? (textos[central.problemaId] || '').trim() : ''
    const especificos = pares.filter((p) => p.tipoProblema === 'CAUSA_DIRECTA')
    const especificosLlenos = especificos.filter((p) => (textos[p.problemaId] || '').trim())

    return [
      {
        texto: `Cada parte del árbol tiene su espejo (${llenos.length} de ${pares.length})`,
        bien: pares.length > 0 && llenos.length === pares.length,
      },
      { texto: 'Hay un objetivo general escrito', bien: generalTexto.length > 0 },
      {
        texto: 'El objetivo general arranca con un verbo en infinitivo',
        bien: generalTexto.length > 0 && arrancaConInfinitivo(generalTexto),
      },
      {
        texto: `Cada causa directa tiene su objetivo específico (${especificosLlenos.length} de ${especificos.length})`,
        bien: especificos.length > 0 && especificosLlenos.length === especificos.length,
      },
    ]
  }, [pares, textos, central])

  const alGuardar = () => {
    setAviso(null)
    empezarGuardado(async () => {
      const r = await guardarObjetivos(
        proyectoId,
        pares.map((p) => ({
          problemaId: p.problemaId,
          tipo: p.tipoObjetivo,
          descripcion: textos[p.problemaId] || '',
        })),
      )
      setAviso({ ok: r.ok, texto: r.mensaje })
    })
  }

  /* ---------------------------------------------------------------------- */

  if (pares.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16">
        <Tarjeta className="p-8 text-center">
          <h1 className={`text-xl font-extrabold ${TINTA}`}>Todavía no hay árbol de problemas</h1>
          <p className={`mt-3 text-[14px] leading-relaxed ${TINTA_SUAVE}`}>
            El árbol de objetivos es el reflejo del de problemas, así que primero hay que armar ese.
          </p>
          <Link
            href={`/admin/proyectos/${proyectoId}/arbol`}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] px-4 py-2.5 text-[13px] font-bold text-white"
          >
            Ir al árbol de problemas <ArrowRight className="h-4 w-4" />
          </Link>
        </Tarjeta>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-6 sm:px-6">
      <header className="mb-5">
        <Link
          href={`/admin/proyectos/${proyectoId}/arbol`}
          className={`mb-2 inline-flex items-center gap-1.5 text-[12px] font-semibold ${TINTA_SUAVE} hover:text-[#1D4ED8]`}
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver al árbol de problemas
        </Link>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className={`text-[19px] font-extrabold uppercase tracking-tight ${TINTA}`}>
            Árbol de objetivos
          </h1>
          <span className="rounded-full bg-[#0B2A4A] px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
            Interno
          </span>
        </div>
        <p className={`text-[13px] ${TINTA_TENUE}`}>
          {nombreProyecto}
          {nombreCliente ? ` · ${nombreCliente}` : ''} · el mismo árbol, dicho en positivo
        </p>
      </header>

      {aviso ? (
        <div
          className={`mb-4 rounded-xl border px-4 py-3 text-[13px] font-medium ${
            aviso.ok
              ? 'border-[#9FD9BC] bg-[#DCF3E6] text-[#186A46]'
              : 'border-[#F0AFAF] bg-[#FBE3E3] text-[#9B2C2C]'
          }`}
          role="status"
        >
          {aviso.texto}
        </div>
      ) : null}

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div>
          <Tarjeta className="p-4 sm:p-5">
            <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl bg-[#F5F9FF] p-3">
              <div className="flex items-center gap-2">
                <label className={`text-[11px] font-bold uppercase tracking-wider ${TINTA_TENUE}`}>
                  Verbo del objetivo general
                </label>
                <select
                  value={verbo}
                  onChange={(e) => setVerbo(e.target.value)}
                  className={`rounded-lg border ${BORDE} bg-white px-2.5 py-1.5 text-[12px] ${TINTA} focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/25`}
                >
                  {VERBOS_OBJETIVO.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={proponerVacios}
                className={`inline-flex items-center gap-2 rounded-xl border border-[#BCD4F5] bg-white px-3 py-1.5 text-[12px] font-bold text-[#1D4ED8] transition hover:-translate-y-px`}
              >
                <Sparkles className="h-3.5 w-3.5" /> Proponer los que están vacíos
              </button>
            </div>

            {ORDEN_BLOQUES.map((tipoProblema) => {
              const delBloque = pares.filter((p) => p.tipoProblema === tipoProblema)
              if (delBloque.length === 0) return null
              const info = TITULO_BLOQUE[tipoProblema]

              return (
                <section key={tipoProblema} className="mb-5">
                  <div className="mb-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                    <h3 className={`text-[12px] font-bold uppercase tracking-wider ${TINTA}`}>
                      {info.titulo}
                    </h3>
                    <ArrowRight className="h-3 w-3 text-[#A9B6C8]" />
                    <span className="text-[12px] font-semibold text-[#1D4ED8]">
                      {info.se_convierte_en}
                    </span>
                    <p className={`text-[12px] ${TINTA_TENUE}`}>{info.ayuda}</p>
                  </div>

                  <div className="space-y-2.5">
                    {delBloque.map((par) => (
                      <div
                        key={par.problemaId}
                        className="grid gap-2.5 rounded-xl border border-[#EEF2F8] bg-[#FAFCFF] p-3 md:grid-cols-2"
                      >
                        <div>
                          <span
                            className={`mb-1 block text-[10px] font-bold uppercase tracking-wider ${TINTA_TENUE}`}
                          >
                            Como está en el problema
                          </span>
                          <p className={`text-[13px] leading-snug ${TINTA_SUAVE}`}>
                            {par.textoProblema}
                          </p>
                        </div>
                        <div>
                          <div className="mb-1 flex items-center justify-between">
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider ${TINTA_TENUE}`}
                            >
                              En positivo
                            </span>
                            <button
                              type="button"
                              onClick={() => proponerUno(par)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#1D4ED8] hover:underline"
                            >
                              <Sparkles className="h-3 w-3" /> Proponer
                            </button>
                          </div>
                          <textarea
                            value={textos[par.problemaId] || ''}
                            onChange={(e) => cambiar(par.problemaId, e.target.value)}
                            rows={2}
                            placeholder="Escribe aquí el espejo en positivo…"
                            className={`w-full resize-none rounded-lg border ${BORDE} bg-white px-2.5 py-2 text-[13px] leading-snug ${TINTA} placeholder:text-[#A9B6C8] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/25`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              )
            })}

            <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-[#EEF2F8] pt-4">
              <button
                type="button"
                onClick={alGuardar}
                disabled={guardando}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_1px_0_rgba(255,255,255,0.25)_inset,0_6px_16px_-8px_rgba(29,78,216,0.9)] transition hover:-translate-y-px disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {guardando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {guardando ? 'Guardando…' : 'Guardar los objetivos'}
              </button>
              <p className={`max-w-md text-[12px] ${TINTA_TENUE}`}>
                La propuesta solo cambia la palabra del principio. El resto de la frase queda igual, y lo
                que no se reconozca se escribe a mano.
              </p>
            </div>
          </Tarjeta>
        </div>

        <aside className="space-y-4">
          <Tarjeta className="p-4">
            <h2 className={`mb-3 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
              Revisión del espejo
            </h2>
            <ul className="space-y-2">
              {revision.map((p) => (
                <li key={p.texto} className="flex items-start gap-2">
                  <span
                    className={`mt-0.5 flex h-4 w-4 flex-none items-center justify-center rounded-full ${
                      p.bien ? 'bg-[#DCF3E6] text-[#186A46]' : 'bg-[#FCEFD2] text-[#8A5307]'
                    }`}
                  >
                    {p.bien ? <Check className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
                  </span>
                  <span className={`text-[12.5px] leading-snug ${p.bien ? TINTA_SUAVE : TINTA}`}>
                    {p.texto}
                  </span>
                </li>
              ))}
            </ul>
          </Tarjeta>

          <Tarjeta className="p-4">
            <h2 className={`mb-2 text-[13px] font-bold uppercase tracking-wider ${TINTA}`}>
              Lo que sigue
            </h2>
            <p className={`text-[12.5px] leading-snug ${TINTA_SUAVE}`}>
              Con los objetivos específicos y las actividades ya escritos, la cadena de valor se arma casi
              sola: falta ponerle a cada objetivo su producto, su unidad de medida y su meta.
            </p>
          </Tarjeta>
        </aside>
      </div>
    </div>
  )
}
