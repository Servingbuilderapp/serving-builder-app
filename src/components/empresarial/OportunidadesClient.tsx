'use client'

import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import {
  CATEGORIAS,
  sugerirDesdeHallazgos,
  type HallazgoEntrada,
  type SugerenciaOportunidad,
} from '@/lib/empresarial/oportunidades'
import {
  sugerirDesdeDescubrimiento,
  type DescubrimientoEntrada,
  type SugerenciaRutaB,
} from '@/lib/empresarial/problemas'

const RELIEVE_BOTON =
  'shadow-md hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 active:shadow-sm transition-all duration-200'
const RELIEVE_TARJETA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_10px_28px_-14px_rgba(11,42,74,0.22)]'

interface Oportunidad {
  id: string
  hallazgo_id: string | null
  nombre: string
  descripcion: string | null
  categoria: string | null
  cliente_o_beneficiario: string | null
  solucion_propuesta: string | null
  valor_generado: string | null
  sector: string | null
  ubicacion: string | null
  estado: string
  puntaje_preliminar: number | null
  creada_en: string
}

interface Props {
  proyecto: { id: string; nombre: string; perfil: string | null }
  hallazgos: HallazgoEntrada[]
  dimensiones: { id: string; codigo: string; nombre: string }[]
  oportunidadesIniciales: Oportunidad[]
  descubrimiento: DescubrimientoEntrada[]
  resumenHipotesis: Record<string, { total: number; validadas: number }>
}

const CAMPOS_FICHA: { clave: keyof Oportunidad; etiqueta: string; ayuda: string; largo?: boolean }[] = [
  { clave: 'descripcion', etiqueta: 'Qué situación quieres mejorar', ayuda: 'Cuéntalo con tus palabras.', largo: true },
  { clave: 'cliente_o_beneficiario', etiqueta: 'Para quién genera valor', ayuda: 'Quién se beneficia: clientes, tu equipo, una comunidad.' },
  { clave: 'solucion_propuesta', etiqueta: 'Qué solución podrías desarrollar', ayuda: 'Una idea inicial; después se prueba.', largo: true },
  { clave: 'valor_generado', etiqueta: 'Qué beneficio produciría', ayuda: 'Ahorro, ingresos, tiempo, bienestar…' },
  { clave: 'sector', etiqueta: 'Sector', ayuda: 'Por ejemplo: alimentos, servicios, tecnología.' },
  { clave: 'ubicacion', etiqueta: 'Dónde', ayuda: 'Ciudad, región o país.' },
]

const COLOR_GRAVEDAD: Record<string, string> = {
  Crítico: 'Prioridad máxima',
  Alto: 'Prioridad alta',
  Medio: 'Prioridad media',
  Bajo: 'Prioridad baja',
}

const campoClase =
  'mt-1 w-full rounded-xl border border-[#B08D57]/40 bg-[#2E0E1A] px-4 py-3 text-[#F3E7DC] placeholder:text-[#F3E7DC]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A46B]'

export function OportunidadesClient({ proyecto, hallazgos, dimensiones, oportunidadesIniciales, descubrimiento, resumenHipotesis }: Props) {
  const [oportunidades, setOportunidades] = useState<Oportunidad[]>(oportunidadesIniciales)
  const [error, aviso] = useState<string | null>(null)
  const [guardando, setGuardando] = useState<string | null>(null)
  const [nuevo, setNuevo] = useState({ nombre: '', descripcion: '', categoria: '' })

  const botonOro = `h-12 px-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] font-extrabold disabled:opacity-50 disabled:cursor-not-allowed ${RELIEVE_BOTON}`
  const botonSuave = `h-12 px-5 inline-flex items-center justify-center gap-2 rounded-xl border border-[#B08D57]/50 bg-[#3B1727] text-[#F3E7DC] font-semibold disabled:opacity-40 ${RELIEVE_BOTON}`

  const sugeridas = useMemo(() => {
    const convertidos = new Set(oportunidades.map((o) => o.hallazgo_id).filter((x): x is string => Boolean(x)))
    return sugerirDesdeHallazgos(hallazgos, dimensiones, convertidos)
  }, [hallazgos, dimensiones, oportunidades])

  // Ruta B: sugeridas desde lo que la persona contó en el descubrimiento
  const sugeridasB = useMemo(
    () => sugerirDesdeDescubrimiento(descubrimiento, new Set(oportunidades.map((o) => o.nombre))),
    [descubrimiento, oportunidades],
  )

  const columnas =
    'id, hallazgo_id, nombre, descripcion, categoria, cliente_o_beneficiario, solucion_propuesta, valor_generado, sector, ubicacion, estado, puntaje_preliminar, creada_en'

  async function convertir(s: SugerenciaOportunidad) {
    aviso(null)
    setGuardando(s.hallazgo_id)
    const supabase = createClient()
    const { data, error: e } = await supabase
      .from('sfpe_oportunidades')
      .insert({
        proyecto_id: proyecto.id,
        hallazgo_id: s.hallazgo_id,
        nombre: s.nombre,
        descripcion: s.descripcion,
        categoria: s.categoria,
      })
      .select(columnas)
      .single()
    setGuardando(null)
    if (e || !data) return aviso('No pudimos guardar la oportunidad. Intenta de nuevo.')
    setOportunidades((prev) => [data as Oportunidad, ...prev])
  }

  async function convertirRutaB(s: SugerenciaRutaB) {
    aviso(null)
    setGuardando(s.clave)
    const supabase = createClient()
    let problemaId: string | null = null
    if (s.problema) {
      // Si nace de un problema observado, también queda guardado como problema por comprobar.
      const { data: p, error: ep } = await supabase
        .from('sfpe_problemas')
        .insert({
          proyecto_id: proyecto.id,
          titulo: s.problema.titulo,
          descripcion: s.problema.descripcion,
          nivel_certeza: 'hipotesis',
        })
        .select('id')
        .single()
      if (ep || !p) {
        setGuardando(null)
        return aviso('No pudimos guardar el problema. Intenta de nuevo.')
      }
      problemaId = p.id as string
    }
    const { data, error: e } = await supabase
      .from('sfpe_oportunidades')
      .insert({
        proyecto_id: proyecto.id,
        problema_id: problemaId,
        nombre: s.nombre,
        descripcion: s.descripcion,
        categoria: s.categoria,
      })
      .select(columnas)
      .single()
    setGuardando(null)
    if (e || !data) return aviso('No pudimos guardar la oportunidad. Intenta de nuevo.')
    setOportunidades((prev) => [data as Oportunidad, ...prev])
  }

  async function agregarMia() {
    if (!nuevo.nombre.trim()) return aviso('Ponle un nombre a tu oportunidad.')
    aviso(null)
    setGuardando('nueva')
    const supabase = createClient()
    const { data, error: e } = await supabase
      .from('sfpe_oportunidades')
      .insert({
        proyecto_id: proyecto.id,
        nombre: nuevo.nombre.trim(),
        descripcion: nuevo.descripcion.trim() || null,
        categoria: nuevo.categoria || null,
      })
      .select(columnas)
      .single()
    setGuardando(null)
    if (e || !data) return aviso('No pudimos guardar la oportunidad. Intenta de nuevo.')
    setOportunidades((prev) => [data as Oportunidad, ...prev])
    setNuevo({ nombre: '', descripcion: '', categoria: '' })
  }

  async function guardarFicha(o: Oportunidad) {
    aviso(null)
    setGuardando(o.id)
    const supabase = createClient()
    const { error: e } = await supabase
      .from('sfpe_oportunidades')
      .update({
        nombre: o.nombre.trim() || 'Sin nombre',
        descripcion: o.descripcion,
        categoria: o.categoria,
        cliente_o_beneficiario: o.cliente_o_beneficiario,
        solucion_propuesta: o.solucion_propuesta,
        valor_generado: o.valor_generado,
        sector: o.sector,
        ubicacion: o.ubicacion,
        actualizada_en: new Date().toISOString(),
      })
      .eq('id', o.id)
    setGuardando(null)
    if (e) aviso('No pudimos guardar los cambios. Intenta de nuevo.')
  }

  function cambiar(id: string, clave: keyof Oportunidad, valor: string) {
    setOportunidades((prev) => prev.map((o) => (o.id === id ? { ...o, [clave]: valor } : o)))
  }

  const faltantes = (o: Oportunidad) =>
    ['cliente_o_beneficiario', 'solucion_propuesta', 'valor_generado'].filter((c) => !o[c as keyof Oportunidad]).length

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#2E0E1A] via-[#3B1727] to-[#54142B] text-[#F3E7DC]">
      <div className="max-w-[900px] mx-auto px-5 lg:px-8 py-10 lg:py-14">
        <Link
          href={`/empresarial/diagnostico?proyecto=${proyecto.id}`}
          className="inline-flex items-center gap-2 text-sm text-[#F3E7DC]/70 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a mi diagnóstico
        </Link>

        <div className="mt-6 text-sm font-bold uppercase tracking-[0.25em] text-[#C9A46B]">
          Oportunidades · {proyecto.nombre}
        </div>
        <h1 className="mt-3 text-3xl lg:text-4xl font-extrabold">¿Qué proyecto vale la pena desarrollar?</h1>
        <p className="mt-3 text-[#F3E7DC]/80 leading-relaxed">
          Aquí convertimos lo que salió de tu diagnóstico, y lo que tú has observado, en oportunidades claras. Una
          oportunidad es una posibilidad de generar valor; todavía no es un negocio probado. En el siguiente paso las
          calificarás y las compararás.
        </p>

        {error && (
          <div role="alert" className="mt-6 rounded-2xl border border-[#B3261E]/60 bg-[#B3261E]/15 p-4 text-sm">
            {error}
          </div>
        )}

        {/* SUGERIDAS */}
        <section className="mt-12">
          <h2 className="text-xl font-extrabold">Sugeridas desde tu diagnóstico</h2>
          {sugeridas.length === 0 ? (
            <p className={`mt-4 rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 text-sm text-[#F3E7DC]/80 ${RELIEVE_TARJETA}`}>
              {hallazgos.length === 0
                ? 'Todavía no hay sugerencias porque tu diagnóstico no está terminado. Puedes completarlo o agregar tus propias oportunidades abajo.'
                : 'Ya convertiste todas las sugerencias. Puedes agregar más abajo.'}
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {sugeridas.map((s) => (
                <div key={s.hallazgo_id} className={`rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 ${RELIEVE_TARJETA}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="font-bold">{s.nombre}</div>
                    <div className="flex gap-2 text-xs font-semibold">
                      {s.gravedad && (
                        <span className="rounded-full bg-[#2E0E1A] border border-[#B08D57]/40 px-3 py-1">
                          {COLOR_GRAVEDAD[s.gravedad]}
                        </span>
                      )}
                      <span className="rounded-full bg-[#2E0E1A] border border-[#B08D57]/40 px-3 py-1">{s.categoria}</span>
                    </div>
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-[#F3E7DC]/85">{s.descripcion}</p>
                  <button
                    type="button"
                    className={`${botonSuave} mt-4`}
                    disabled={guardando === s.hallazgo_id}
                    onClick={() => convertir(s)}
                  >
                    {guardando === s.hallazgo_id ? 'Guardando…' : 'Convertir en oportunidad'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* RUTA B: DESDE LO QUE ME CONTASTE */}
        {descubrimiento.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-extrabold">Sugeridas desde lo que me contaste</h2>
            <p className="mt-1 text-sm text-[#F3E7DC]/70">
              Salen de tus conocimientos, capacidades, intereses y problemas que has visto. Son ideas para explorar, no
              negocios probados.
            </p>
            {sugeridasB.length === 0 ? (
              <p className={`mt-4 rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 text-sm text-[#F3E7DC]/80 ${RELIEVE_TARJETA}`}>
                Ya convertiste todas las sugerencias de esta ruta. Si agregas más cosas en tu descubrimiento, aparecerán aquí.
              </p>
            ) : (
              <div className="mt-4 space-y-3">
                {sugeridasB.map((s) => (
                  <div key={s.clave} className={`rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 ${RELIEVE_TARJETA}`}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="font-bold">{s.nombre}</div>
                      <div className="flex gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-[#2E0E1A] border border-[#B08D57]/40 px-3 py-1">
                          {s.origen === 'problema' ? 'Nace de un problema' : 'Nace de lo que sabes y te gusta'}
                        </span>
                        <span className="rounded-full bg-[#2E0E1A] border border-[#B08D57]/40 px-3 py-1">{s.categoria}</span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[#F3E7DC]/85">{s.descripcion}</p>
                    <ul className="mt-2 list-disc pl-5 text-xs text-[#F3E7DC]/65">
                      {s.basadoEn.map((b) => (
                        <li key={b}>{b}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      className={`${botonSuave} mt-4`}
                      disabled={guardando === s.clave}
                      onClick={() => convertirRutaB(s)}
                    >
                      {guardando === s.clave ? 'Guardando…' : 'Convertir en oportunidad'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* MIS OPORTUNIDADES */}
        <section className="mt-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold">Mis oportunidades</h2>
            <div className="flex flex-wrap gap-3">
              <Link href={`/empresarial/oportunidades/problemas?proyecto=${proyecto.id}`} className={botonSuave}>
                Mis problemas
              </Link>
              {oportunidades.length > 0 && (
                <Link href={`/empresarial/oportunidades/evaluar?proyecto=${proyecto.id}`} className={botonSuave}>
                  Evaluar y comparar
                </Link>
              )}
              {oportunidades.length > 0 && (
                <Link href={`/empresarial/oportunidades/convertir?proyecto=${proyecto.id}`} className={botonOro}>
                  Pasar a proyecto
                </Link>
              )}
            </div>
          </div>
          {oportunidades.length === 0 ? (
            <p className={`mt-4 rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 text-sm text-[#F3E7DC]/80 ${RELIEVE_TARJETA}`}>
              Aún no tienes oportunidades guardadas. Convierte una sugerencia o agrega la tuya.
            </p>
          ) : (
            <div className="mt-4 space-y-4">
              {oportunidades.map((o) => (
                <details key={o.id} className={`rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 ${RELIEVE_TARJETA}`}>
                  <summary className="cursor-pointer list-none">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="font-bold">{o.nombre}</div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold">
                        <span className="rounded-full bg-gradient-to-b from-[#C9A46B] to-[#B08D57] text-[#3A1420] px-3 py-1">
                          {o.estado}
                        </span>
                        {o.categoria && (
                          <span className="rounded-full bg-[#2E0E1A] border border-[#B08D57]/40 px-3 py-1">{o.categoria}</span>
                        )}
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-[#F3E7DC]/65">
                      {faltantes(o) > 0
                        ? `Faltan ${faltantes(o)} dato${faltantes(o) === 1 ? '' : 's'} clave en la ficha. Ábrela para completarla.`
                        : 'Ficha con los datos clave. Ábrela para revisarla.'}
                    </p>
                    <p className="mt-1 text-xs text-[#F3E7DC]/65">
                      {resumenHipotesis[o.id]
                        ? `Validación: ${resumenHipotesis[o.id].validadas} de ${resumenHipotesis[o.id].total} hipótesis validadas.`
                        : 'Validación: todavía no has escrito hipótesis.'}
                    </p>
                  </summary>

                  <div className="mt-5 space-y-4">
                    <label className="block text-sm font-semibold">
                      Nombre
                      <input className={campoClase} value={o.nombre} onChange={(e) => cambiar(o.id, 'nombre', e.target.value)} />
                    </label>
                    <label className="block text-sm font-semibold">
                      Tipo de oportunidad
                      <select
                        className={campoClase}
                        value={o.categoria ?? ''}
                        onChange={(e) => cambiar(o.id, 'categoria', e.target.value)}
                      >
                        <option value="">Elige una</option>
                        {CATEGORIAS.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </label>
                    {CAMPOS_FICHA.map((c) => (
                      <label key={c.clave} className="block text-sm font-semibold">
                        {c.etiqueta}
                        <span className="block text-xs font-normal text-[#F3E7DC]/60">{c.ayuda}</span>
                        {c.largo ? (
                          <textarea
                            rows={3}
                            className={campoClase}
                            value={(o[c.clave] as string | null) ?? ''}
                            onChange={(e) => cambiar(o.id, c.clave, e.target.value)}
                          />
                        ) : (
                          <input
                            className={campoClase}
                            value={(o[c.clave] as string | null) ?? ''}
                            onChange={(e) => cambiar(o.id, c.clave, e.target.value)}
                          />
                        )}
                      </label>
                    ))}
                    <button type="button" className={botonOro} disabled={guardando === o.id} onClick={() => guardarFicha(o)}>
                      {guardando === o.id ? 'Guardando…' : 'Guardar ficha'}
                    </button>
                    <Link
                      href={`/empresarial/oportunidades/validar?proyecto=${proyecto.id}&oportunidad=${o.id}`}
                      className={`${botonSuave} ml-3`}
                    >
                      Validar esta oportunidad
                    </Link>
                  </div>
                </details>
              ))}
            </div>
          )}
        </section>

        {/* AGREGAR LA MÍA */}
        <section className="mt-12">
          <h2 className="text-xl font-extrabold">Agregar una oportunidad mía</h2>
          <p className="mt-1 text-sm text-[#F3E7DC]/70">
            No tiene que salir del diagnóstico. Si la viste en tus clientes, en tu operación o en tu entorno, cuéntala.
          </p>
          <div className={`mt-4 rounded-2xl border border-[#B08D57]/35 bg-[#3B1727] p-5 space-y-4 ${RELIEVE_TARJETA}`}>
            <label className="block text-sm font-semibold">
              Nombre
              <input
                className={campoClase}
                value={nuevo.nombre}
                placeholder="Por ejemplo: vender también por internet"
                onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
              />
            </label>
            <label className="block text-sm font-semibold">
              Cuéntala en pocas palabras
              <textarea
                rows={3}
                className={campoClase}
                value={nuevo.descripcion}
                onChange={(e) => setNuevo({ ...nuevo, descripcion: e.target.value })}
              />
            </label>
            <label className="block text-sm font-semibold">
              Tipo de oportunidad
              <select className={campoClase} value={nuevo.categoria} onChange={(e) => setNuevo({ ...nuevo, categoria: e.target.value })}>
                <option value="">Elige una (opcional)</option>
                {CATEGORIAS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </label>
            <button type="button" className={botonOro} disabled={guardando === 'nueva'} onClick={agregarMia}>
              {guardando === 'nueva' ? 'Guardando…' : 'Guardar oportunidad'}
            </button>
          </div>
        </section>

        <p className="mt-12 text-center text-sm text-[#F3E7DC]/65">
          Las sugerencias salen de reglas fijas aplicadas a tus respuestas. Son una guía: no confirman que exista demanda ni
          garantizan resultados.
        </p>
      </div>
    </main>
  )
}
