'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Lightbulb, Compass, Store, Building } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/* Mismos efectos de relieve del website */
const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_10px_28px_-14px_rgba(11,42,74,0.22)]'

type Perfil = 'A' | 'B' | 'C' | 'D'

/**
 * Los cuatro puntos de partida de la versión 1.
 * El sistema sugiere uno según las respuestas y la persona confirma (o cambia).
 */
const PERFILES: Record<
  Perfil,
  { titulo: string; descripcion: string; icono: React.ComponentType<{ className?: string }> }
> = {
  A: {
    titulo: 'Tengo una idea definida',
    descripcion: 'Sabes qué quieres crear y necesitas comprobar que tiene futuro y darle forma de proyecto.',
    icono: Lightbulb,
  },
  B: {
    titulo: 'Quiero emprender, pero aún no sé qué',
    descripcion: 'Partimos de lo que sabes, lo que te interesa y los problemas que ves, para descubrir tu oportunidad.',
    icono: Compass,
  },
  C: {
    titulo: 'Tengo un negocio en marcha',
    descripcion: 'Ya vendes o ya operas. Vemos qué fortalecer, qué mejorar y hacia dónde crecer.',
    icono: Store,
  },
  D: {
    titulo: 'Tengo una empresa consolidada',
    descripcion: 'Una empresa con varias áreas que busca crecer, innovar, expandirse o transformarse.',
    icono: Building,
  },
}

type Paso = 'preguntas' | 'confirmar' | 'guardado'

export function EmpresarialClient({ userId }: { userId: string | null }) {
  const [paso, setPaso] = useState<Paso>('preguntas')

  // Respuestas
  const [tieneNegocio, setTieneNegocio] = useState<boolean | null>(null)
  const [tieneIdea, setTieneIdea] = useState<boolean | null>(null)
  const [tamano, setTamano] = useState<'chico' | 'grande' | null>(null)

  // Confirmación
  const [sugerido, setSugerido] = useState<Perfil | null>(null)
  const [elegido, setElegido] = useState<Perfil | null>(null)
  const [nombre, setNombre] = useState('')
  const [pais, setPais] = useState('')

  const [proyectoId, setProyectoId] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState('')

  const preguntasListas =
    tieneNegocio !== null &&
    (tieneNegocio ? tamano !== null : tieneIdea !== null)

  function calcularSugerencia(): Perfil {
    if (tieneNegocio) return tamano === 'grande' ? 'D' : 'C'
    return tieneIdea ? 'A' : 'B'
  }

  function continuar() {
    const perfil = calcularSugerencia()
    setSugerido(perfil)
    setElegido(perfil)
    setPaso('confirmar')
  }

  async function guardar() {
    if (!userId || !elegido || !sugerido) return
    setGuardando(true)
    setError('')
    try {
      const supabase = createClient()
      const { data, error: errorGuardar } = await supabase
        .from('sfpe_proyectos')
        .insert({
          user_id: userId,
          nombre: nombre.trim() || 'Mi proyecto',
          pais: pais.trim() || null,
          perfil_sugerido: sugerido,
          perfil_confirmado: elegido,
          estado: 'Borrador',
        })
        .select('id')
        .single()
      if (errorGuardar || !data) throw errorGuardar ?? new Error('No se pudo guardar')
      setProyectoId(data.id as string)
      setPaso('guardado')
    } catch (err) {
      const mensaje = (err as { message?: string } | null)?.message || ''
      setError(mensaje || 'No se pudo guardar. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  const botonOro = `h-14 px-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] text-base font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`

  const opcion = (activa: boolean) =>
    `w-full text-left rounded-2xl border p-5 transition-all ${RELIEVE_TARJETA} ${
      activa
        ? 'border-[#C9A46B] bg-[#4C2032] ring-2 ring-[#C9A46B]/60'
        : 'border-[#B08D57]/35 bg-[#3B1727] hover:bg-[#4C2032]'
    }`

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E0E1A] via-[#3B1727] to-[#54142B] text-[#F3E7DC]">
      <div className="max-w-[820px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-[#F3E7DC]/70 hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <div className="mt-8 text-center">
          <div className="text-sm font-bold uppercase tracking-[0.25em] text-[#C9A46B]">Serving</div>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold uppercase tracking-tight leading-tight text-balance">
            Arquitectura de Proyectos Empresariales
          </h1>
          <p className="mt-4 text-lg text-[#F3E7DC]/80">Crea. Fortalece. Crece.</p>
        </div>

        {/* ---------------- PASO 1: PREGUNTAS ---------------- */}
        {paso === 'preguntas' && (
          <section className="mt-12 space-y-10">
            <div>
              <h2 className="text-xl font-extrabold">¿Ya tienes un negocio o una empresa funcionando?</h2>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <button type="button" className={opcion(tieneNegocio === true)} onClick={() => setTieneNegocio(true)}>
                  <div className="font-bold">Sí</div>
                  <div className="mt-1 text-sm text-[#F3E7DC]/75">Ya vendo, ya opero o ya tengo clientes.</div>
                </button>
                <button type="button" className={opcion(tieneNegocio === false)} onClick={() => setTieneNegocio(false)}>
                  <div className="font-bold">No</div>
                  <div className="mt-1 text-sm text-[#F3E7DC]/75">Todavía no tengo un negocio funcionando.</div>
                </button>
              </div>
            </div>

            {tieneNegocio === false && (
              <div>
                <h2 className="text-xl font-extrabold">¿Ya tienes una idea definida de lo que quieres crear?</h2>
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <button type="button" className={opcion(tieneIdea === true)} onClick={() => setTieneIdea(true)}>
                    <div className="font-bold">Sí, tengo una idea</div>
                    <div className="mt-1 text-sm text-[#F3E7DC]/75">Sé qué producto, servicio o negocio quiero crear.</div>
                  </button>
                  <button type="button" className={opcion(tieneIdea === false)} onClick={() => setTieneIdea(false)}>
                    <div className="font-bold">Todavía no</div>
                    <div className="mt-1 text-sm text-[#F3E7DC]/75">Quiero emprender, pero aún no sé qué.</div>
                  </button>
                </div>
              </div>
            )}

            {tieneNegocio === true && (
              <div>
                <h2 className="text-xl font-extrabold">¿Cómo describirías tu organización?</h2>
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <button type="button" className={opcion(tamano === 'chico')} onClick={() => setTamano('chico')}>
                    <div className="font-bold">Emprendimiento o negocio pequeño</div>
                    <div className="mt-1 text-sm text-[#F3E7DC]/75">Hasta unas 10 personas, con una estructura sencilla.</div>
                  </button>
                  <button type="button" className={opcion(tamano === 'grande')} onClick={() => setTamano('grande')}>
                    <div className="font-bold">Empresa consolidada</div>
                    <div className="mt-1 text-sm text-[#F3E7DC]/75">Más personas, varias áreas y procesos ya establecidos.</div>
                  </button>
                </div>
              </div>
            )}

            <div className="text-center">
              <button type="button" className={botonOro} disabled={!preguntasListas} onClick={continuar}>
                Continuar <ArrowRight className="h-5 w-5" />
              </button>
            </div>
          </section>
        )}

        {/* ---------------- PASO 2: CONFIRMAR PERFIL ---------------- */}
        {paso === 'confirmar' && elegido && sugerido && (
          <section className="mt-12 space-y-8">
            <div className="text-center">
              <h2 className="text-2xl font-extrabold">Por lo que nos cuentas, empezamos por aquí</h2>
              <p className="mt-2 text-[#F3E7DC]/75">
                Si no te describe bien, elige otra opción. Tú decides.
              </p>
            </div>

            <div className="grid gap-4">
              {(Object.keys(PERFILES) as Perfil[]).map((clave) => {
                const p = PERFILES[clave]
                const Icono = p.icono
                const activa = elegido === clave
                return (
                  <button key={clave} type="button" className={opcion(activa)} onClick={() => setElegido(clave)}>
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 shrink-0 rounded-xl bg-[#2E0E1A] ring-1 ring-[#B08D57]/40 flex items-center justify-center">
                        <Icono className="h-6 w-6 text-[#B08D57]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-bold text-lg">
                          {p.titulo}
                          {clave === sugerido && (
                            <span className="text-[11px] font-bold uppercase tracking-wider rounded-full bg-[#C9A46B] text-[#3A1420] px-2 py-0.5">
                              Sugerido
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-[#F3E7DC]/75">{p.descripcion}</div>
                      </div>
                      {activa && <Check className="h-6 w-6 text-[#C9A46B] shrink-0" />}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-semibold">Nombre de tu proyecto o empresa</span>
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Por ejemplo: Mi panadería"
                  className="mt-2 w-full h-12 rounded-xl border border-[#B08D57]/40 bg-[#2E0E1A] px-4 text-[#F3E7DC] placeholder:text-[#F3E7DC]/40"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">País</span>
                <input
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  placeholder="Por ejemplo: Colombia"
                  className="mt-2 w-full h-12 rounded-xl border border-[#B08D57]/40 bg-[#2E0E1A] px-4 text-[#F3E7DC] placeholder:text-[#F3E7DC]/40"
                />
              </label>
            </div>

            {error && <p className="text-center text-sm text-red-300">{error}</p>}

            {userId ? (
              <div className="text-center">
                <button type="button" className={botonOro} disabled={guardando} onClick={guardar}>
                  {guardando ? 'Guardando…' : 'Guardar y continuar'} <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-[#B08D57]/45 bg-[#3B1727] p-6 text-center">
                <p className="font-semibold">Para guardar tu proyecto necesitas una cuenta.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/signup"
                    className={`h-12 px-6 inline-flex items-center rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] font-extrabold ${RELIEVE_BOTON}`}
                  >
                    Crear cuenta
                  </Link>
                  <Link
                    href="/login?redirect=/empresarial"
                    className={`h-12 px-6 inline-flex items-center rounded-xl border border-[#B08D57]/50 bg-[#2E0E1A] font-semibold ${RELIEVE_BOTON}`}
                  >
                    Ya tengo cuenta
                  </Link>
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-[#F3E7DC]/70 hover:text-white underline"
                onClick={() => setPaso('preguntas')}
              >
                Volver a las preguntas
              </button>
            </div>
          </section>
        )}

        {/* ---------------- PASO 3: GUARDADO ---------------- */}
        {paso === 'guardado' && elegido && (
          <section className="mt-12 text-center rounded-3xl border border-[#B08D57]/45 bg-[#3B1727] p-8 md:p-10">
            <div className="mx-auto h-14 w-14 rounded-full bg-[#C9A46B] flex items-center justify-center">
              <Check className="h-7 w-7 text-[#3A1420]" />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold">Tu proyecto quedó guardado</h2>
            <p className="mt-3 text-[#F3E7DC]/80">
              Empezamos por: <strong>{PERFILES[elegido].titulo}</strong>. El siguiente paso es el diagnóstico de tu
              situación.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {proyectoId && (
                <Link href={`/empresarial/diagnostico?proyecto=${proyectoId}`} className={botonOro}>
                  Empezar mi diagnóstico <ArrowRight className="h-5 w-5" />
                </Link>
              )}
              <Link
                href="/dashboard"
                className={`h-14 px-6 inline-flex items-center rounded-xl border border-[#B08D57]/50 bg-[#2E0E1A] font-semibold ${RELIEVE_BOTON}`}
              >
                Ir a mi panel
              </Link>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
