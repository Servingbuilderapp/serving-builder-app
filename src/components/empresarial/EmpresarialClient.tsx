'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Check, Lightbulb, Compass, Store, Building } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

/* Mismos efectos de relieve del website */
const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA =
  'shadow-[0_1px_2px_rgba(84,20,43,0.06),0_10px_28px_-14px_rgba(84,20,43,0.22)]'

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

export interface ProyectoResumen {
  id: string
  nombre: string
  estado: string
}

export function EmpresarialClient({ userId, proyectos = [] }: { userId: string | null; proyectos?: ProyectoResumen[] }) {
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

  const botonOro = `h-14 px-8 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo text-base font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`

  const opcion = (activa: boolean) =>
    `w-full text-left rounded-2xl border p-5 transition-all ${RELIEVE_TARJETA} ${
      activa
        ? 'border-ca-oro bg-ca-suave ring-2 ring-ca-oro-claro/60'
        : 'border-ca-oro/50 bg-ca-tarjeta hover:bg-ca-suave'
    }`

  return (
    <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino">
      <div className="max-w-[820px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-ca-vino/75 hover:text-ca-vino-hondo">
          <ArrowLeft className="h-4 w-4" /> Volver al inicio
        </Link>

        <div className="mt-8 text-center">
          <div className="text-sm font-bold uppercase tracking-[0.25em] text-ca-oro-texto">Serving</div>
          <h1 className="mt-3 text-3xl md:text-5xl font-extrabold uppercase tracking-tight leading-tight text-balance">
            Arquitectura de Proyectos Empresariales
          </h1>
          <p className="mt-4 text-lg text-ca-vino/80">Crea. Fortalece. Crece.</p>
        </div>

        {/* ---------------- MIS PROYECTOS ---------------- */}
        {paso === 'preguntas' && proyectos.length > 0 && (
          <section className={`mt-10 rounded-2xl border border-ca-oro/60 bg-ca-fondo p-5 ${RELIEVE_TARJETA}`}>
            <h2 className="text-xl font-extrabold">Continúa con tu proyecto</h2>
            <p className="mt-1 text-sm text-ca-vino/75">Ya tienes proyectos guardados. Entra a uno para ver tu camino completo.</p>
            <ul className="mt-4 space-y-3">
              {proyectos.map((p) => (
                <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-ca-tarjeta p-4">
                  <div>
                    <div className="font-bold">{p.nombre}</div>
                    <div className="text-xs text-ca-vino/75">{p.estado}</div>
                  </div>
                  <Link
                    href={`/empresarial/camino?proyecto=${p.id}`}
                    className={`h-11 px-5 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold ${RELIEVE_BOTON}`}
                  >
                    Continuar <ArrowRight className="h-4 w-4" />
                  </Link>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs text-ca-vino/75">¿Quieres empezar otro proyecto? Responde las preguntas de abajo.</p>
          </section>
        )}

        {/* ---------------- PASO 1: PREGUNTAS ---------------- */}
        {paso === 'preguntas' && (
          <section className="mt-12 space-y-10">
            <div>
              <h2 className="text-xl font-extrabold">¿Ya tienes un negocio o una empresa funcionando?</h2>
              <div className="mt-4 grid sm:grid-cols-2 gap-4">
                <button type="button" className={opcion(tieneNegocio === true)} onClick={() => setTieneNegocio(true)}>
                  <div className="font-bold">Sí</div>
                  <div className="mt-1 text-sm text-ca-vino/75">Ya vendo, ya opero o ya tengo clientes.</div>
                </button>
                <button type="button" className={opcion(tieneNegocio === false)} onClick={() => setTieneNegocio(false)}>
                  <div className="font-bold">No</div>
                  <div className="mt-1 text-sm text-ca-vino/75">Todavía no tengo un negocio funcionando.</div>
                </button>
              </div>
            </div>

            {tieneNegocio === false && (
              <div>
                <h2 className="text-xl font-extrabold">¿Ya tienes una idea definida de lo que quieres crear?</h2>
                <div className="mt-4 grid sm:grid-cols-2 gap-4">
                  <button type="button" className={opcion(tieneIdea === true)} onClick={() => setTieneIdea(true)}>
                    <div className="font-bold">Sí, tengo una idea</div>
                    <div className="mt-1 text-sm text-ca-vino/75">Sé qué producto, servicio o negocio quiero crear.</div>
                  </button>
                  <button type="button" className={opcion(tieneIdea === false)} onClick={() => setTieneIdea(false)}>
                    <div className="font-bold">Todavía no</div>
                    <div className="mt-1 text-sm text-ca-vino/75">Quiero emprender, pero aún no sé qué.</div>
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
                    <div className="mt-1 text-sm text-ca-vino/75">Hasta unas 10 personas, con una estructura sencilla.</div>
                  </button>
                  <button type="button" className={opcion(tamano === 'grande')} onClick={() => setTamano('grande')}>
                    <div className="font-bold">Empresa consolidada</div>
                    <div className="mt-1 text-sm text-ca-vino/75">Más personas, varias áreas y procesos ya establecidos.</div>
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
              <p className="mt-2 text-ca-vino/75">
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
                      <div className="h-12 w-12 shrink-0 rounded-xl bg-ca-fondo ring-1 ring-ca-oro/40 flex items-center justify-center">
                        <Icono className="h-6 w-6 text-ca-oro-texto" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 font-bold text-lg">
                          {p.titulo}
                          {clave === sugerido && (
                            <span className="text-[11px] font-bold uppercase tracking-wider rounded-full bg-ca-oro-claro text-ca-vino-hondo px-2 py-0.5">
                              Sugerido
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-ca-vino/75">{p.descripcion}</div>
                      </div>
                      {activa && <Check className="h-6 w-6 text-ca-oro-texto shrink-0" />}
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
                  className="mt-2 w-full h-12 rounded-xl border border-ca-oro/40 bg-ca-fondo px-4 text-ca-vino placeholder:text-ca-vino/65"
                />
              </label>
              <label className="block">
                <span className="text-sm font-semibold">País</span>
                <input
                  value={pais}
                  onChange={(e) => setPais(e.target.value)}
                  placeholder="Por ejemplo: Colombia"
                  className="mt-2 w-full h-12 rounded-xl border border-ca-oro/40 bg-ca-fondo px-4 text-ca-vino placeholder:text-ca-vino/65"
                />
              </label>
            </div>

            {error && <p className="text-center text-sm text-ca-rojo">{error}</p>}

            {userId ? (
              <div className="text-center">
                <button type="button" className={botonOro} disabled={guardando} onClick={guardar}>
                  {guardando ? 'Guardando…' : 'Guardar y continuar'} <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="rounded-2xl border border-ca-oro/45 bg-ca-tarjeta p-6 text-center">
                <p className="font-semibold">Para guardar tu proyecto necesitas una cuenta.</p>
                <div className="mt-4 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/signup"
                    className={`h-12 px-6 inline-flex items-center rounded-xl bg-gradient-to-b from-ca-oro-claro to-ca-oro text-ca-vino-hondo font-extrabold ${RELIEVE_BOTON}`}
                  >
                    Crear cuenta
                  </Link>
                  <Link
                    href="/login?redirect=/empresarial"
                    className={`h-12 px-6 inline-flex items-center rounded-xl border border-ca-oro/50 bg-ca-fondo font-semibold ${RELIEVE_BOTON}`}
                  >
                    Ya tengo cuenta
                  </Link>
                </div>
              </div>
            )}

            <div className="text-center">
              <button
                type="button"
                className="text-sm text-ca-vino/75 hover:text-ca-vino-hondo underline"
                onClick={() => setPaso('preguntas')}
              >
                Volver a las preguntas
              </button>
            </div>
          </section>
        )}

        {/* ---------------- PASO 3: GUARDADO ---------------- */}
        {paso === 'guardado' && elegido && (
          <section className="mt-12 text-center rounded-3xl border border-ca-oro/45 bg-ca-tarjeta p-8 md:p-10">
            <div className="mx-auto h-14 w-14 rounded-full bg-ca-oro-claro flex items-center justify-center">
              <Check className="h-7 w-7 text-ca-vino-hondo" />
            </div>
            <h2 className="mt-5 text-2xl font-extrabold">Tu proyecto quedó guardado</h2>
            <p className="mt-3 text-ca-vino/80">
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
                className={`h-14 px-6 inline-flex items-center rounded-xl border border-ca-oro/50 bg-ca-fondo font-semibold ${RELIEVE_BOTON}`}
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
