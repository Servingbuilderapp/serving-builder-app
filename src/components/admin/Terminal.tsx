'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  Copy,
  Layers,
  Lock,
  Shuffle,
  Sparkles,
} from 'lucide-react'
import { PRECIOS_REPLICA, type ModalidadReplica } from '@/lib/precioReplicas'
import { precioConEquivalenciaCOP } from '@/lib/conversionMoneda'
import { COBRO_COLOMBIA, COBRO_EXTERIOR } from '@/lib/mediosDePago'
import { CAMPO_DESTINO } from '@/lib/plantillasReplica'

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
  modalidad_cobro: ModalidadReplica | null
  estado_pago: 'Sin cotizar' | 'Cotizado' | 'Pagado'
}

export type ConvocatoriaOpcion = {
  id: string
  nombre: string
  entidad: string | null
}

/* -------------------------------------------------------------------------- */

const SOMBRA = 'shadow-[0_1px_2px_rgba(0,0,0,0.30),0_8px_24px_-14px_rgba(0,0,0,0.50)]'

const COLOR_ESTADO: Record<string, string> = {
  Planeada: 'bg-[#C99A3D]/20 text-[#E0B868]',
  'Proyecto creado': 'bg-[#8C93A6]/20 text-[#AEB4C4]',
  Postulada: 'bg-[#7A8B6F]/20 text-[#9BB18D]',
  Descartada: 'bg-[#6E4A50]/40 text-[#F3E7DC]/60',
}

const COLOR_ESTADO_PAGO: Record<string, string> = {
  'Sin cotizar': 'bg-[#6E4A50]/40 text-[#F3E7DC]/60',
  Cotizado: 'bg-[#C99A3D]/20 text-[#E0B868]',
  Pagado: 'bg-[#7A8B6F]/20 text-[#9BB18D]',
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
    <div className="rounded-xl border border-[#6E4A50] bg-[#4C2032] p-4">
      <div className="flex items-center gap-2">
        <Icono className="h-4 w-4 shrink-0" style={{ color }} />
        <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#F3E7DC]">{titulo}</h4>
      </div>
      <p className="mt-1 text-[12px] leading-snug text-[#F3E7DC]/50">{descripcion}</p>

      {puntos.length === 0 ? (
        <p className="mt-3 text-[12.5px] text-[#F3E7DC]/50">Sin puntos anotados.</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {puntos.map((p, i) => (
            <li key={i} className="text-[12.5px] leading-relaxed">
              <span className="font-semibold text-[#F3E7DC]">{p.que}</span>
              {p.detalle ? <span className="block text-[#F3E7DC]/65">{p.detalle}</span> : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/** Cómo se le cobra al cliente — mismos datos que ve en /contratar, en modo lectura. */
function InfoDeCobro() {
  return (
    <div className="mt-3 rounded-lg border border-[#6E4A50] bg-[#3B1727] p-3.5 text-[12.5px] leading-relaxed text-[#F3E7DC]/65">
      <p className="font-semibold text-[#F3E7DC]">Cómo cobrarle</p>
      <p className="mt-1">
        Cliente en Colombia: transferencia a {COBRO_COLOMBIA.cuenta?.banco}, cuenta{' '}
        {COBRO_COLOMBIA.cuenta?.tipo} {COBRO_COLOMBIA.cuenta?.numero}, a nombre de{' '}
        {COBRO_COLOMBIA.cuenta?.titular} (NIT {COBRO_COLOMBIA.cuenta?.nit}).
        {COBRO_COLOMBIA.cuenta?.llaves?.length
          ? ` También por llave Bre-B: ${COBRO_COLOMBIA.cuenta.llaves
              .map((l) => `${l.etiqueta} ${l.valor}`)
              .join(' o ')}.`
          : ''}
      </p>
      <p className="mt-1.5">
        Cliente en el exterior: {COBRO_EXTERIOR.paypal ? 'PayPal' : 'factura, sin PayPal por ahora'}.
      </p>
      <p className="mt-1.5 text-[11.5px] text-[#F3E7DC]/50">
        El peso al lado del dólar es solo referencia — el cobro real siempre es en dólares.
      </p>
    </div>
  )
}

/** Tarjeta de cotización de una réplica: elegir modalidad, ver precio, mover el estado de pago. */
function Cotizacion({
  replica,
  yaCubiertaPor,
  onCotizar,
  onCambiarEstadoPago,
  trabajando,
}: {
  replica: Replica
  yaCubiertaPor: Replica | null
  onCotizar: (modalidad: ModalidadReplica) => void
  onCambiarEstadoPago: (estado: 'Sin cotizar' | 'Cotizado' | 'Pagado') => void
  trabajando: boolean
}) {
  const [modalidadElegida, setModalidadElegida] = useState<ModalidadReplica | ''>('')

  if (!replica.modalidad_cobro) {
    return (
      <div className="mx-5 mb-5 rounded-xl border border-dashed border-[#6E4A50] bg-[#4C2032] p-4">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-[#E0B868]" />
          <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#F3E7DC]">
            Sin cotizar todavía
          </h4>
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#F3E7DC]/65">
          Elegí en cuál de las dos modalidades entra esta réplica para saber cuánto cobrarle.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {(Object.values(PRECIOS_REPLICA)).map((p) => (
            <button
              key={p.id}
              type="button"
              onClick={() => setModalidadElegida(p.id)}
              className={`rounded-lg border p-3 text-left transition ${
                modalidadElegida === p.id
                  ? 'border-[#B08D57] bg-[#B08D57]/15'
                  : 'border-[#6E4A50] bg-[#3B1727] hover:border-[#B08D57]'
              }`}
            >
              <p className="text-[12.5px] font-semibold text-[#F3E7DC]">{p.nombre}</p>
              <p className="mt-0.5 text-[11.5px] text-[#F3E7DC]/55">{p.descripcionCorta}</p>
              <p className="mt-1.5 text-[13px] font-bold text-[#B08D57]">
                {precioConEquivalenciaCOP(p.precioUSD)}
              </p>
            </button>
          ))}
        </div>
        <button
          type="button"
          disabled={!modalidadElegida || trabajando}
          onClick={() => modalidadElegida && onCotizar(modalidadElegida)}
          className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-4 text-[12.5px] font-semibold text-[#3A1420] disabled:opacity-45"
        >
          Guardar cotización
        </button>
      </div>
    )
  }

  const precio = PRECIOS_REPLICA[replica.modalidad_cobro]

  if (yaCubiertaPor) {
    return (
      <div className="mx-5 mb-5 rounded-xl border border-[#6E4A50] bg-[#4C2032] p-4">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-[#9BB18D]" />
          <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#F3E7DC]">
            Incluida en un pago único
          </h4>
        </div>
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#F3E7DC]/65">
          Es &ldquo;{precio.nombre.toLowerCase()}&rdquo; — ese pago ya se cotizó ({yaCubiertaPor.estado_pago.toLowerCase()})
          con otra réplica de este mismo proyecto, y cubre todas las formas en que se postule. No se cobra
          aparte por esta.
        </p>
      </div>
    )
  }

  return (
    <div className="mx-5 mb-5 rounded-xl border border-[#6E4A50] bg-[#4C2032] p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Banknote className="h-4 w-4 text-[#B08D57]" />
          <h4 className="text-[12px] font-bold uppercase tracking-wider text-[#F3E7DC]">
            {precio.nombre}
          </h4>
        </div>
        <span
          className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${COLOR_ESTADO_PAGO[replica.estado_pago]}`}
        >
          {replica.estado_pago}
        </span>
      </div>
      <p className="mt-1.5 text-[12.5px] leading-relaxed text-[#F3E7DC]/65">{precio.descripcion}</p>
      <p className="mt-2 text-[16px] font-extrabold text-[#F3E7DC]">
        {precioConEquivalenciaCOP(precio.precioUSD)}
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {replica.estado_pago !== 'Cotizado' ? (
          <button
            type="button"
            disabled={trabajando}
            onClick={() => onCambiarEstadoPago('Cotizado')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-[#6E4A50] bg-[#3B1727] px-3.5 text-[12.5px] font-semibold text-[#F3E7DC] disabled:opacity-45"
          >
            Marcar como cotizado
          </button>
        ) : null}
        {replica.estado_pago !== 'Pagado' ? (
          <button
            type="button"
            disabled={trabajando}
            onClick={() => onCambiarEstadoPago('Pagado')}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-gradient-to-b from-[#7A8B6F] to-[#5F6E56] px-3.5 text-[12.5px] font-semibold text-white disabled:opacity-45"
          >
            Marcar como pagado
          </button>
        ) : null}
      </div>

      <InfoDeCobro />
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
  const [valorCampoDestino, setValorCampoDestino] = useState('')
  const [notaAdicional, setNotaAdicional] = useState('')
  const [convocatoriaId, setConvocatoriaId] = useState('')
  const [modalidadCobro, setModalidadCobro] = useState<ModalidadReplica | ''>('')
  const [trabajando, setTrabajando] = useState<string | null>(null)
  const [aviso, setAviso] = useState<{ tono: 'ok' | 'mal'; texto: string } | null>(null)

  const campoDestino = tipo ? CAMPO_DESTINO[tipo] : null
  const faltaValorCampo = Boolean(campoDestino && !campoDestino.opcional && !valorCampoDestino.trim())

  // El enunciado técnico completo, armado solo — nadie tiene que redactarlo.
  const destinoCompuesto = campoDestino
    ? [campoDestino.frase(valorCampoDestino.trim()), notaAdicional.trim() ? `Nota: ${notaAdicional.trim()}` : '']
        .filter(Boolean)
        .join(' ')
    : ''

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
      setValorCampoDestino('')
      setNotaAdicional('')
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
        <h1 className="text-[19px] font-extrabold uppercase tracking-tight text-[#F3E7DC]">Réplicas</h1>
        <p className="text-[13px] text-[#F3E7DC]/55">{nombreProyecto}</p>
      </header>

      {/* preparar --------------------------------------------------------- */}
      <div className={`rounded-2xl border border-[#6E4A50] bg-[#3B1727] p-5 ${SOMBRA}`}>
        <h2 className="text-[13px] font-bold uppercase tracking-wider text-[#F3E7DC]">
          Preparar una réplica
        </h2>
        <p className="mt-1.5 text-[13px] leading-relaxed text-[#F3E7DC]/65">
          Este proyecto ya está estructurado, o ya se presentó — aquí no se vuelve a estructurar
          nada. Primero se piensa: qué se conserva, qué se adapta y qué exige el destino. Después,
          con un botón, se crea el proyecto nuevo llevando todo lo que el cliente ya armó, sin
          empezar de cero, y queda buscando convocatorias solo. La adaptación fina la hace el
          equipo en las pantallas de siempre.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <select
            value={tipo}
            onChange={(e) => {
              setTipo(e.target.value)
              setValorCampoDestino('')
              setNotaAdicional('')
            }}
            className="h-11 rounded-lg border border-[#6E4A50] bg-[#3B1727] px-3 text-[13.5px] text-[#F3E7DC] outline-none focus:border-[#B08D57] sm:col-span-2"
          >
            <option value="">Tipo de réplica…</option>
            {tipos.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>

          {campoDestino ? (
            <div className="sm:col-span-2">
              <label className="mb-1 block text-[12px] font-semibold text-[#F3E7DC]/65">
                {campoDestino.etiqueta}
              </label>
              <input
                type="text"
                value={valorCampoDestino}
                onChange={(e) => setValorCampoDestino(e.target.value)}
                placeholder={campoDestino.ejemplo}
                className="h-11 w-full rounded-lg border border-[#6E4A50] bg-[#3B1727] px-3 text-[13.5px] text-[#F3E7DC] outline-none placeholder:text-[#F3E7DC]/35 focus:border-[#B08D57]"
              />

              <label className="mb-1 mt-3 block text-[12px] font-semibold text-[#F3E7DC]/65">
                Nota adicional (opcional)
              </label>
              <textarea
                value={notaAdicional}
                onChange={(e) => setNotaAdicional(e.target.value)}
                rows={2}
                placeholder="Algo más que el equipo deba saber sobre esta réplica"
                className="w-full rounded-lg border border-[#6E4A50] bg-[#3B1727] px-3 py-2.5 text-[13.5px] text-[#F3E7DC] outline-none placeholder:text-[#F3E7DC]/35 focus:border-[#B08D57]"
              />

              {destinoCompuesto ? (
                <p className="mt-2 rounded-lg bg-[#4C2032] px-3 py-2 text-[12.5px] italic leading-relaxed text-[#F3E7DC]/65">
                  Así va a quedar redactado: &ldquo;{destinoCompuesto}&rdquo;
                </p>
              ) : null}
            </div>
          ) : null}

          <select
            value={convocatoriaId}
            onChange={(e) => setConvocatoriaId(e.target.value)}
            className="h-11 rounded-lg border border-[#6E4A50] bg-[#3B1727] px-3 text-[13.5px] text-[#F3E7DC] outline-none focus:border-[#B08D57] sm:col-span-2"
          >
            <option value="">Convocatoria de destino (opcional)</option>
            {convocatorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre}
                {c.entidad ? ` — ${c.entidad}` : ''}
              </option>
            ))}
          </select>

          <select
            value={modalidadCobro}
            onChange={(e) => setModalidadCobro(e.target.value as ModalidadReplica | '')}
            className="h-11 rounded-lg border border-[#6E4A50] bg-[#3B1727] px-3 text-[13.5px] text-[#F3E7DC] outline-none focus:border-[#B08D57] sm:col-span-2"
          >
            <option value="">Modalidad de cobro (se puede fijar después)…</option>
            {Object.values(PRECIOS_REPLICA).map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} — {precioConEquivalenciaCOP(p.precioUSD)}
              </option>
            ))}
          </select>
        </div>

        <button
          type="button"
          disabled={!tipo || faltaValorCampo || trabajando !== null}
          onClick={() =>
            llamar(
              {
                accion: 'preparar',
                proyectoId,
                tipo,
                destino: destinoCompuesto || undefined,
                convocatoriaId: convocatoriaId || undefined,
                modalidadCobro: modalidadCobro || undefined,
              },
              'preparar'
            )
          }
          className="mt-4 inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-6 text-[13px] font-semibold text-[#3A1420] disabled:opacity-45"
        >
          <Sparkles className="h-4 w-4" />
          {trabajando === 'preparar' ? 'Pensando la réplica…' : 'Preparar la réplica'}
        </button>

        {aviso ? (
          <p
            className={`mt-3 rounded-lg px-3 py-2 text-[13px] ${
              aviso.tono === 'ok' ? 'bg-[#7A8B6F]/20 text-[#9BB18D]' : 'bg-[#C0604A]/20 text-[#E0917E]'
            }`}
          >
            {aviso.texto}
          </p>
        ) : null}
      </div>

      {/* listado ---------------------------------------------------------- */}
      {replicas.length === 0 ? (
        <div className={`rounded-2xl border border-dashed border-[#6E4A50] bg-[#4C2032] p-10 text-center ${SOMBRA}`}>
          <Copy className="mx-auto h-6 w-6 text-[#F3E7DC]/50" />
          <p className="mt-3 text-[13.5px] text-[#F3E7DC]/65">
            Este proyecto todavía no tiene réplicas pensadas.
          </p>
        </div>
      ) : (
        replicas.map((r) => (
          <div key={r.id} className={`overflow-hidden rounded-2xl border border-[#6E4A50] bg-[#3B1727] ${SOMBRA}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#6E4A50]/40 px-5 py-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[15px] font-bold capitalize text-[#F3E7DC]">{r.tipo}</span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                      COLOR_ESTADO[r.estado] || 'bg-[#6E4A50]/40 text-[#F3E7DC]/60'
                    }`}
                  >
                    {r.estado}
                  </span>
                </div>
                {r.destino ? (
                  <p className="mt-1 text-[12.5px] text-[#F3E7DC]/55">Hacia: {r.destino}</p>
                ) : null}
              </div>

              {r.estado === 'Planeada' ? (
                <button
                  type="button"
                  disabled={trabajando !== null}
                  onClick={() => llamar({ accion: 'crear', replicaId: r.id }, `crear-${r.id}`)}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg bg-gradient-to-b from-[#6E4A50] to-[#3B1727] px-5 text-[13px] font-semibold text-white disabled:opacity-45"
                >
                  <Copy className="h-4 w-4" />
                  {trabajando === `crear-${r.id}` ? 'Creando…' : 'Crear el proyecto réplica'}
                </button>
              ) : r.proyecto_replica_id ? (
                <Link
                  href={`/admin/proyectos/${r.proyecto_replica_id}/arbol`}
                  className="inline-flex h-10 shrink-0 items-center gap-2 rounded-lg border border-[#6E4A50] bg-[#3B1727] px-4 text-[13px] font-semibold text-[#B08D57]"
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
                color="#9BB18D"
                puntos={comoPuntos(r.nucleo_json)}
              />
              <Columna
                titulo="Se adapta"
                descripcion="Lo que hay que reescribir"
                icono={Shuffle}
                color="#B08D57"
                puntos={comoPuntos(r.adaptaciones_json)}
              />
              <Columna
                titulo="Lo obligado"
                descripcion="Lo que exige el destino"
                icono={Layers}
                color="#E0B868"
                puntos={comoPuntos(r.obligados_json)}
              />
            </div>

            {r.riesgos ? (
              <div className="mx-5 mb-5 flex items-start gap-2.5 rounded-xl border border-[#C99A3D]/40 bg-[#C99A3D]/10 p-4">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#E0B868]" />
                <p className="text-[13px] leading-relaxed text-[#F3E7DC]/65">{r.riesgos}</p>
              </div>
            ) : null}

            <Cotizacion
              replica={r}
              trabajando={trabajando !== null}
              yaCubiertaPor={
                // "no_presentado" es un pago único por proyecto: si otra réplica de esta
                // misma modalidad ya se cotizó o se pagó, esta va incluida, no se cobra aparte.
                r.modalidad_cobro === 'no_presentado'
                  ? replicas.find(
                      (otra) =>
                        otra.id !== r.id &&
                        otra.modalidad_cobro === 'no_presentado' &&
                        otra.estado_pago !== 'Sin cotizar'
                    ) || null
                  : null
              }
              onCotizar={(modalidad) =>
                llamar({ accion: 'cotizar', replicaId: r.id, modalidadCobro: modalidad }, `cotizar-${r.id}`)
              }
              onCambiarEstadoPago={(estado) =>
                llamar({ accion: 'marcar_pago', replicaId: r.id, estadoPago: estado }, `pago-${r.id}`)
              }
            />
          </div>
        ))
      )}
    </div>
  )
}
