'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { estadoConversion, revisarRequisitos, type FichaConversion } from '@/lib/empresarial/convertir'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'

interface Oportunidad extends FichaConversion {
  id: string
  nombre: string
  categoria: string | null
  descripcion: string | null
}

interface Props {
  userId: string
  proyecto: {
    id: string
    nombre: string
    perfil_sugerido: string | null
    perfil_confirmado: string | null
    pais: string | null
    moneda: string | null
    profundidad: string | null
    contrato_proyecto_id: string | null
  }
  oportunidadesIniciales: Oportunidad[]
  hipotesis: { oportunidad_id: string; tipo: string; estado: string }[]
  puntajes: Record<string, number | null>
}

export function ConvertirClient({ userId, proyecto, oportunidadesIniciales, hipotesis, puntajes }: Props) {
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>(oportunidadesIniciales)
  const [error, aviso] = useState<string | null>(null)
  const [guardando, setGuardando] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState<string | null>(null)
  const [creados, setCreados] = useState<Record<string, string>>({})

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-12 px-5 inline-flex items-center justify-center gap-2 rounded-xl border border-ca-oro/50 bg-ca-tarjeta text-ca-vino font-semibold disabled:opacity-40 ${RELIEVE_BOTON}`

  async function convertir(o: Oportunidad) {
    aviso(null)
    setGuardando(o.id)
    const supabase = createClient()

    // 1) Se crea el proyecto nuevo, que hereda el perfil, el país y el contrato del proyecto de origen.
    const { data: nuevo, error: e1 } = await supabase
      .from('sfpe_proyectos')
      .insert({
        user_id: userId,
        contrato_proyecto_id: proyecto.contrato_proyecto_id,
        nombre: o.nombre,
        perfil_sugerido: proyecto.perfil_sugerido,
        perfil_confirmado: proyecto.perfil_confirmado,
        pais: proyecto.pais,
        moneda: proyecto.moneda,
        profundidad: proyecto.profundidad,
        estado: 'Formulación',
      })
      .select('id')
      .single()
    if (e1 || !nuevo) {
      setGuardando(null)
      return aviso('No pudimos crear el proyecto. Intenta de nuevo.')
    }

    // 2) La oportunidad queda enlazada con su proyecto y lista para formular.
    const { error: e2 } = await supabase
      .from('sfpe_oportunidades')
      .update({
        proyecto_derivado_id: nuevo.id,
        estado: 'Lista para formular',
        actualizada_en: new Date().toISOString(),
      })
      .eq('id', o.id)
    setGuardando(null)
    setConfirmando(null)
    if (e2) {
      return aviso(
        'El proyecto se creó, pero no pudimos marcar la oportunidad como convertida. No lo vuelvas a crear: avísanos para enlazarlo.',
      )
    }
    setOportunidades((prev) =>
      prev.map((x) =>
        x.id === o.id ? { ...x, proyecto_derivado_id: nuevo.id as string, estado: 'Lista para formular' } : x,
      ),
    )
    setCreados((prev) => ({ ...prev, [o.id]: nuevo.id as string }))
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link
          href={`/empresarial/oportunidades?proyecto=${proyecto.id}`}
          className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a mis oportunidades
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">
          Pasar a proyecto · {proyecto.nombre}
        </div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Cuál oportunidad ya merece un proyecto?</h1>
        <p className="mt-3 text-ca-vino/80 leading-relaxed">
          Convertir una oportunidad en proyecto crea un proyecto nuevo, listo para formular. Para hacerlo, la oportunidad
          debe estar clara y tener algo comprobado. Aquí ves qué le falta a cada una.
        </p>

        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-ca-rojo/60 bg-ca-rojo/10 p-4 text-sm">
            {error}
          </div>
        )}

        {oportunidades.length === 0 ? (
          <p className={`mt-8 rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 text-sm text-ca-vino/80 ${RELIEVE_TARJETA}`}>
            Aún no tienes oportunidades. Guarda una y valídala primero.
          </p>
        ) : (
          <div className="mt-8 space-y-4">
            {oportunidades.map((o) => {
              const reqs = revisarRequisitos(
                o,
                hipotesis.filter((h) => h.oportunidad_id === o.id),
                puntajes[o.id] ?? null,
              )
              const estado = estadoConversion(o, reqs)
              const faltanObligatorios = reqs.filter((r) => r.obligatorio && !r.cumple)
              const avisos = reqs.filter((r) => !r.obligatorio && !r.cumple)
              return (
                <div key={o.id} className={`rounded-2xl border border-ca-oro/50 bg-ca-tarjeta p-5 ${RELIEVE_TARJETA}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="font-bold">{o.nombre}</div>
                    <div className="flex flex-wrap gap-2 text-xs font-semibold">
                      <span className="rounded-full bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo px-3 py-1">
                        {o.estado}
                      </span>
                      {o.categoria && (
                        <span className="rounded-full bg-ca-fondo border border-ca-oro/40 px-3 py-1">{o.categoria}</span>
                      )}
                    </div>
                  </div>

                  {estado === 'ya_convertida' ? (
                    <div className="mt-4 rounded-xl bg-ca-fondo p-4 text-sm">
                      <p className="font-semibold">Esta oportunidad ya es un proyecto.</p>
                      {creados[o.id] && (
                        <p className="mt-1 text-ca-vino/75">Quedó creado con estado “Formulación”.</p>
                      )}
                      {o.proyecto_derivado_id && (
                        <Link
                          href={`/empresarial/formulacion?proyecto=${o.proyecto_derivado_id}`}
                          className={`mt-3 ${botonOro}`}
                        >
                          Formular este proyecto
                        </Link>
                      )}
                    </div>
                  ) : estado === 'descartada' ? (
                    <p className="mt-4 text-sm text-ca-vino/75">Está descartada, por eso no se puede convertir.</p>
                  ) : (
                    <>
                      <ul className="mt-4 space-y-2 text-sm">
                        {reqs.map((r) => (
                          <li key={r.clave} className="flex items-start gap-3 rounded-xl bg-ca-fondo px-4 py-3">
                            <span
                              aria-hidden
                              className={`mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-extrabold ${
                                r.cumple ? 'bg-ca-oro-claro text-ca-vino-hondo' : 'border border-ca-oro/60 text-ca-vino/75'
                              }`}
                            >
                              {r.cumple ? '✓' : '·'}
                            </span>
                            <span>
                              <span className="block">
                                {r.texto}{' '}
                                <span className="text-xs text-ca-vino/75">({r.obligatorio ? 'necesario' : 'recomendado'})</span>
                              </span>
                              {!r.cumple && <span className="block text-xs text-ca-vino/75">{r.ayuda}</span>}
                            </span>
                          </li>
                        ))}
                      </ul>

                      {estado === 'bloqueada' ? (
                        <p className="mt-4 text-sm text-ca-vino/80">
                          Todavía no se puede convertir: falta {faltanObligatorios.length}{' '}
                          {faltanObligatorios.length === 1 ? 'requisito necesario' : 'requisitos necesarios'}.
                        </p>
                      ) : confirmando === o.id ? (
                        <div className="mt-4 rounded-xl border border-ca-oro/60 bg-ca-fondo p-4 text-sm">
                          {avisos.length > 0 && (
                            <p className="mb-3">
                              Ten en cuenta: {avisos.length} {avisos.length === 1 ? 'cosa recomendada no está' : 'cosas recomendadas no están'}{' '}
                              cumplida{avisos.length === 1 ? '' : 's'}. Puedes convertirla igual y completarlas después.
                            </p>
                          )}
                          <p>Se creará un proyecto nuevo llamado “{o.nombre}”. Esta acción no se deshace desde aquí.</p>
                          <div className="mt-3 flex flex-wrap gap-3">
                            <button type="button" className={botonOro} disabled={guardando === o.id} onClick={() => convertir(o)}>
                              {guardando === o.id ? 'Creando…' : 'Sí, crear el proyecto'}
                            </button>
                            <button type="button" className={botonSuave} disabled={guardando === o.id} onClick={() => setConfirmando(null)}>
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button type="button" className={`${botonOro} mt-4`} onClick={() => setConfirmando(o.id)}>
                          Convertir en proyecto
                        </button>
                      )}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        )}

        <p className="mt-12 text-center text-sm text-ca-vino/75">
          Que una oportunidad pase a proyecto no garantiza que sea viable: eso se estudia en la formulación, el mercado, lo
          técnico y lo financiero.
        </p>
      </div>
    </main>
  )
}
