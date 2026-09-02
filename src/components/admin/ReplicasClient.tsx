'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AlertTriangle, ArrowRight, Copy, Layers, Lock, Shuffle, Sparkles } from 'lucide-react'

/* -------------------------------------------------------------------------- */

export type Replica = {
  id: string
  tipo: string
  destino: string | null
  estado: string
  riesgos: string | null
  nucleo_json: unknown
  adaptaciones_json: unknown
  obligados_json: unknown
  proyecto_replica_id: string | null
}

export type ConvocatoriaOpcion = {
  id: string
  nombre: string
  entidad: string | null
}

/* -------------------------------------------------------------------------- */

const SOMBRA = 'shadow-[0_1px_2px_rgba(11,42,74,0.06),0_8px_24px_-14px_rgba(11,42,74,0.20)]'

const COLOR_ESTADO: Record<string, string> = {
  Planeada: 'bg-[#FBF0DF] text-[#8A5307]',
  'Proyecto creado': 'bg-[#E7EDFB] text-[#1D4ED8]',
  Postulada: 'bg-[#E4F2EB] text-[#186A46]',
  Descartada: 'bg-[#EEF2F8] text-[#7C8CA5]',
}

/** Qué se le pide al equipo según el tipo, para que el campo destino no quede en blanco. */
const PISTA_DESTINO: Record<string, string> = {
  'misma convocatoria': 'La misma convocatoria, en su próxima apertura',
  'otra convocatoria': 'Nombre de la otra convocatoria',
  'otro territorio': 'Departamento, municipio o país',
  'otros beneficiarios': 'Qué población nueva',
  'otro proponente': 'Qué entidad presentaría el proyecto',
  'otros aliados': 'Qué aliados entran',
  'otra linea tematica': 'Qué línea temática',
  'otro enfoque sectorial': 'Qué sector',
  'otro enfoque de innovacion': 'Qué enfoque de innovación',
  'otro monto': 'A qué monto se lleva',
  'otro alcance de metas': 'Qué alcance de metas',
}

type Punto = { que: string; detalle: string }

function comoPuntos(valor: unknown): Punto[] {
  if (!Array.isArray(valor)) return []
  return valor
    .map((v) => {
      if (typeof v === 'string') return { que: v, detalle: '' }
      if (v && typeof v === 'object') {
        const o = v as Record<string, unknown>
        return {
          que: typeof o.que === 'string' ? o.que : '',
          detalle: typeof o.detalle === 'string' ? o.detalle : '',
        }
      }
      return { que: '', detalle: '' }
    })
    .filter((p) => p.que || p.detalle)
}

function Columna({
  titulo,
  descripcion,
  icono: Icono,
  color,
  puntos,
}: {
  titulo: string
  descripcion: string
  icono: React.ElementType
  color: string
  puntos: Punto[]
}) {
  return (
    <div className="rounded-xl border border-[#E4EAF3] bg-[#F8FAFD] p-4">
      <div className="flex items-center gap-2">
        <Icono className="h-4 w-4 shrink-0" style={{ color }} />
        <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#0B2A4A]">{titulo}</h4>
      </div>
      <p className="mt-1 text-[12px] leading-snug text-[#94A3B8]">{descripcion}</p>

      {puntos.length === 0 ? (
        <p className="mt-3 text-[12.5px] text-[#94A3B8]">Sin puntos anotados.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {puntos.map((p, i) => (
            <li key={i} className="text-[12.5px] leading-relaxed">
              <span className="font-semibold text-[#0B2A4A]">{p.que}</span>
              {p.detalle ? <span className="block text-[#5B6B84]">{p.detalle}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */

export function ReplicasClient({
  proyectoId,
  nombreProyecto,
  replicas,
  tipos,
  convocatorias,
}: {
  proyectoId: string
  nombreProyecto: string
  replicas: Replica[]
  tipos: string[]
  convocatorias: ConvocatoriaOpcion[]
}) {
  const router = useRouter()
  const [tipo, setTipo] = useState('')
  const [destino, setDestino] = useState('')
  const [convocatoriaId, setConvocatoriaId] = useState('')
  const [trabajando, setTrabajando] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ tono: 'ok' | 'mal'; texto: string } | null>(null)

  const llamar = async (cuerpo: Record<string, unknown>, etiqueta: string) => {
    setTrabajando(etiqueta)
    setAviso(null)
    try {
      const res = await fetch('/api/replica', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cuerpo),
      })
      const datos = await res.json()
      if (!res.ok || datos?.ok === false) {
        setAviso({ tono: 'mal', texto: datos?.error || datos?.mensaje || 'No se pudo completar.' })
        return
      }
      setAviso({ tono: 'ok', texto: datos?.mensaje || 'Listo.' })
      setDestino('')
      router.refresh()
    } catch {
      setAviso({ tono: 'mal', texto: 'Se cayó la conexión. Intenta otra vez.' })
    } finally {
      setTrabajando(null)
    }
  }

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 p-4 lg:p-6">
      <header className="space-y-1">
        <h1 className="text-[19px] font-extrabold uppercase tracking-tight text-[#0B2A4A]">Réplicas</h1>
        <p className="text-[13px] text-[#7C8CA5]">{nombreProyecto}</p>
      </header>

      {/* preparar --------------------------------------------------------- */}
      <div className={`rounded-2xl border border-[#E4EAF3] bg-white p-5 ${SOMBRA}`}>
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#0B2A4A]">
          Preparar una réplica
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#5B6B84]">
          Primero se piensa: qué se conserva del proyecto, qué se adapta y qué exige el destino.
          Después, con un botón, se crea el proyecto nuevo copiando el árbol, los objetivos y la
          cadena de valor. La adaptación fina la hace el equipo en las pantallas de siempre.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            className="h-11 rounded-lg border border-[#DCE4F0] bg-white px-3 text-[13.5px] text-[#0B2A4A] outline-none focus:border-[#1D4ED8]"
          >
            <option value="">Tipo de réplica…</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          <input
            type="text"
            value={destino}
            onChange={(e) => setDestino(e.target.value)}
            placeholder={tipo ? PISTA_DESTINO[tipo] || 'A dónde va la réplica' : 'A dónde va la réplica'}
            className="h-11 rounded-lg border border-[#DCE4F0] bg-white px-3 text-[13.5px] text-[#0B2A4A] outline-none placeholder:text-[#A9B7CB] focus:border-[#1D4ED8]"
          />

          <select
            value={convocatoriaId}
            onChange={(e) => setConvocatoriaId(e.target.value)}
            className="h-11 rounded-lg border border-[#DCE4F0] bg-white px-3 text-[13.5px] text-[#0B2A4A] outline-none focus:border-[#1D4ED8] sm:col-span-2"
          >
            <option value="">Convocatoria de destino (opcional)</option>
            {convocatorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
                {c.entidad ? ` — ${c.entidad}` : ''}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={!tipo || trabajando !== null}
          onClick={() =>
            llamar(
              {
                accion: 'preparar',
                proyectoId,
                tipo,
                destino: destino || undefined,
                convocatoriaId: convocatoriaId || undefined,
              },
              'preparar'
            )
          }
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#2563EB] to-[#1D4ED8] px-6 text-[13px] font-semibold text-white disabled:opacity-45"
        >
          <Sparkles className="h-4 w-4" />
          {trabajando === 'preparar' ? 'Pensando la réplica…' : 'Preparar la réplica'}
        </button>

        {aviso ? (
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-[13px] ${
              aviso.tono === 'ok' ? 'bg-[#E4F2EB] text-[#186A46]' : 'bg-[#FAE7E7] text-[#9B2C2C]'
            }`}
          >
            {aviso.texto}
          </p>
        ) : null}
      </div>

      {/* listado ---------------------------------------------------------- */}
      {replicas.length === 0 ? (
        <div className={`rounded-2xl border border-dashed border-[#DCE4F0] bg-[#F8FAFD] p-10 text-center ${SOMBRA}`}>
          <Copy className="mx-auto h-6 w-6 text-[#94A3B8]" />
          <p className="mt-3 text-[13.5px] text-[#5B6B84]">
            Este proyecto todavía no tiene réplicas pensadas.
          </p>
        </div>
      ) : (
        replicas.map((r) => (
          <div key={r.id} className={`overflow-hidden rounded-2xl border border-[#E4EAF3] bg-white ${SOMBRA}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EEF2F8] px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-bold capitalize text-[#0B2A4A]">{r.tipo}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      COLOR_ESTADO[r.estado] || 'bg-[#EEF2F8] text-[#7C8CA5]'
                    }`}
                  >
                    {r.estado}
                  </span>
                </div>
                {r.destino ? (
                  <p className="mt-1 text-[12.5px] text-[#7C8CA5]">Hacia: {r.destino}</p>
                ) : null}
              </div>

              {r.estado === 'Planeada' ? (
                <button
                  type="button"
                  disabled={trabajando !== null}
                  onClick={() => llamar({ accion: 'crear', replicaId: r.id }, `crear-${r.id}`)}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-gradient-to-b from-[#143E77] to-[#0C2E5C] px-5 text-[13px] font-semibold text-white disabled:opacity-45"
                >
                  <Copy className="h-4 w-4" />
                  {trabajando === `crear-${r.id}` ? 'Creando…' : 'Crear el proyecto réplica'}
                </button>
              ) : r.proyecto_replica_id ? (
                <Link
                  href={`/admin/proyectos/${r.proyecto_replica_id}/arbol`}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[#DCE4F0] bg-white px-4 text-[13px] font-semibold text-[#1D4ED8]"
                >
                  Abrir el proyecto réplica <ArrowRight className="h-4 w-4" />
                </Link>
              ) : null}
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-3">
              <Columna
                titulo="El núcleo"
                descripcion="Lo que no se toca"
                icono={Lock}
                color="#186A46"
                puntos={comoPuntos(r.nucleo_json)}
              />
              <Columna
                titulo="Se adapta"
                descripcion="Lo que hay que reescribir"
                icono={Shuffle}
                color="#1D4ED8"
                puntos={comoPuntos(r.adaptaciones_json)}
              />
              <Columna
                titulo="Lo obligado"
                descripcion="Lo que exige el destino"
                icono={Layers}
                color="#8A5307"
                puntos={comoPuntos(r.obligados_json)}
              />
            </div>

            {r.riesgos ? (
              <div className="mx-5 mb-5 flex items-start gap-2.5 rounded-xl border border-[#F0DCBB] bg-[#FDF8F0] p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#8A5307]" />
                <p className="text-[13px] leading-relaxed text-[#5B6B84]">{r.riesgos}</p>
              </div>
            ) : null}
          </div>
        ))
      )}
    </div>
  )
}
