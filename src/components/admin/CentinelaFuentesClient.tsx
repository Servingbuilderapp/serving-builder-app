'use client'

import React, { useMemo, useState } from 'react'
import {
  Search, Plus, X, Mail, Rss, Bot, Lock, UserRound, Check, ExternalLink, AlertTriangle,
} from 'lucide-react'
import {
  NIVELES, NOMBRE_NIVEL, ESTADOS, NOMBRE_ESTADO, COLOR_ESTADO,
  BUZON_CENTINELA, estadosDelNivel,
} from '@/lib/centinela'

/**
 * FUENTES DEL CENTINELA DIGITAL
 *
 * Es el tablero de dónde salen las convocatorias. Una fila por fuente.
 *
 * Lo que esta pantalla tiene que dejar claro de un vistazo es UNA cosa:
 * cuántas de las fuentes de nivel 1 ya están llegando de verdad al buzón. Ese
 * número, y no la lista completa, es el avance real del Centinela: una fuente
 * suscrita de la que nunca llegó un correo no está funcionando, aunque en el
 * papel figure.
 */

type Fuente = {
  id: string
  nombre: string
  categoria: string
  nivel: number
  estado: string
  url: string | null
  url_newsletter: string | null
  correo_remitente: string | null
  notas: string | null
  primer_correo_en: string | null
  ultima_revision: string | null
}

type Props = {
  fuentes: Fuente[]
  errorCarga: string | null
}

const ICONO_NIVEL: Record<number, React.ElementType> = {
  1: Mail,
  2: Rss,
  3: Bot,
  0: Lock,
  9: UserRound,
}

export function CentinelaFuentesClient({ fuentes, errorCarga }: Props) {
  const [lista, setLista] = useState<Fuente[]>(fuentes)
  const [busqueda, setBusqueda] = useState('')
  const [nivelFiltro, setNivelFiltro] = useState<string>('1')
  const [estadoFiltro, setEstadoFiltro] = useState<string>('')
  const [categoriaFiltro, setCategoriaFiltro] = useState<string>('')
  const [guardando, setGuardando] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [formulario, setFormulario] = useState(false)

  const categorias = useMemo(
    () => Array.from(new Set(lista.map((f) => f.categoria))).sort(),
    [lista],
  )

  // El avance del nivel 1: de las que se pueden seguir por boletín, cuántas
  // están confirmadas.
  const avance = useMemo(() => {
    const n1 = lista.filter((f) => f.nivel === 1 && f.estado !== 'descartada')
    return {
      total: n1.length,
      confirmadas: n1.filter((f) => f.estado === 'confirmado').length,
      suscritas: n1.filter((f) => f.estado === 'suscrito').length,
      pendientes: n1.filter((f) => f.estado === 'pendiente').length,
    }
  }, [lista])

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase()
    return lista
      .filter((f) => {
        if (nivelFiltro !== '' && f.nivel !== Number(nivelFiltro)) return false
        if (estadoFiltro !== '' && f.estado !== estadoFiltro) return false
        if (categoriaFiltro !== '' && f.categoria !== categoriaFiltro) return false
        if (texto && !f.nombre.toLowerCase().includes(texto)) return false
        return true
      })
      .sort((a, b) => a.categoria.localeCompare(b.categoria) || a.nombre.localeCompare(b.nombre))
  }, [lista, busqueda, nivelFiltro, estadoFiltro, categoriaFiltro])

  async function cambiar(id: string, cambios: Partial<Fuente>) {
    setGuardando(id)
    setAviso(null)
    try {
      const r = await fetch('/api/centinela/fuentes', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...cambios }),
      })
      const datos = await r.json()
      if (!r.ok) {
        setAviso(datos.error || 'No se pudo guardar.')
        return
      }
      setLista((actual) => actual.map((f) => (f.id === id ? { ...f, ...cambios } : f)))
    } catch {
      setAviso('No se pudo guardar. Revisa la conexión.')
    } finally {
      setGuardando(null)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-semibold">Fuentes del Centinela Digital</h1>
        <p className="mt-2 text-sm text-color-base-content/70 max-w-3xl">
          Aquí está la lista de quién publica convocatorias y por qué vía nos vamos a
          enterar de lo que publica. Las de <strong>Boletín al buzón</strong> son las
          primeras: se suscribe <code className="px-1.5 py-0.5 rounded bg-color-base-200">{BUZON_CENTINELA}</code>{' '}
          al boletín de cada una, y la plataforma lo lee sola cada semana.
        </p>
      </div>

      {/* El avance de verdad, no la lista */}
      <div className="p-5 rounded-2xl border border-color-base-content/10 bg-color-base-200">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="text-3xl font-semibold">{avance.confirmadas}</span>
          <span className="text-color-base-content/70">
            de {avance.total} fuentes de boletín están llegando al buzón
          </span>
        </div>
        <div className="mt-3 h-2.5 w-full rounded-full bg-color-base-300 overflow-hidden">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{
              width: avance.total ? `${(avance.confirmadas / avance.total) * 100}%` : '0%',
            }}
          />
        </div>
        <p className="mt-3 text-sm text-color-base-content/70">
          {avance.suscritas} suscritas esperando el primer correo · {avance.pendientes} sin
          suscribir todavía.
          {avance.suscritas > 0 && (
            <>
              {' '}Una fuente suscrita no cuenta como funcionando hasta que llegue un correo
              suyo: hasta entonces no hay prueba de que la suscripción quedó bien.
            </>
          )}
        </p>
      </div>

      {errorCarga && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-800 text-sm">
          No se pudo leer la lista de fuentes: {errorCarga}
        </div>
      )}

      {aviso && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{aviso}</span>
        </div>
      )}

      {/* Filtros */}
      <div className="p-5 rounded-2xl border border-color-base-content/10 bg-color-base-200 space-y-4">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-color-base-content/40" />
          <input
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar una entidad por nombre"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-color-base-300 bg-white text-sm"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <select
            value={nivelFiltro}
            onChange={(e) => setNivelFiltro(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-color-base-300 bg-white text-sm"
          >
            <option value="">Todos los niveles</option>
            {NIVELES.map((n) => (
              <option key={n.nivel} value={String(n.nivel)}>
                {n.nombre}
              </option>
            ))}
          </select>

          <select
            value={estadoFiltro}
            onChange={(e) => setEstadoFiltro(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-color-base-300 bg-white text-sm"
          >
            <option value="">Todos los estados</option>
            {ESTADOS.map((e) => (
              <option key={e.clave} value={e.clave}>
                {e.nombre}
              </option>
            ))}
          </select>

          <select
            value={categoriaFiltro}
            onChange={(e) => setCategoriaFiltro(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-color-base-300 bg-white text-sm"
          >
            <option value="">Todos los grupos</option>
            {categorias.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setFormulario(true)}
            className="ml-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-color-primary text-white text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Agregar fuente
          </button>
        </div>

        {nivelFiltro !== '' && (
          <p className="text-sm text-color-base-content/70">
            {NIVELES.find((n) => String(n.nivel) === nivelFiltro)?.explicacion}
          </p>
        )}
      </div>

      <p className="text-sm text-color-base-content/60">
        {visibles.length} {visibles.length === 1 ? 'fuente' : 'fuentes'}
      </p>

      <div className="space-y-3">
        {visibles.map((f) => {
          const Icono = ICONO_NIVEL[f.nivel] || Mail
          return (
            <div
              key={f.id}
              className="p-5 rounded-2xl border border-color-base-content/10 bg-white space-y-3"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Icono className="w-4 h-4 text-color-base-content/50 shrink-0" />
                    <h3 className="font-medium truncate">{f.nombre}</h3>
                  </div>
                  <p className="mt-1 text-xs text-color-base-content/60">
                    {f.categoria} · {NOMBRE_NIVEL[f.nivel]}
                  </p>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-lg border text-xs font-medium shrink-0 ${
                    COLOR_ESTADO[f.estado] || 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  {NOMBRE_ESTADO[f.estado] || f.estado}
                </span>
              </div>

              {f.notas && (
                <p className="text-sm text-color-base-content/70">{f.notas}</p>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={f.estado}
                  disabled={guardando === f.id}
                  onChange={(e) => cambiar(f.id, { estado: e.target.value })}
                  className="px-3 py-2 rounded-xl border border-color-base-300 bg-white text-sm"
                >
                  {estadosDelNivel(f.nivel).map((clave) => (
                    <option key={clave} value={clave}>
                      {NOMBRE_ESTADO[clave]}
                    </option>
                  ))}
                </select>

                <select
                  value={String(f.nivel)}
                  disabled={guardando === f.id}
                  onChange={(e) => cambiar(f.id, { nivel: Number(e.target.value) })}
                  className="px-3 py-2 rounded-xl border border-color-base-300 bg-white text-sm"
                >
                  {NIVELES.map((n) => (
                    <option key={n.nivel} value={String(n.nivel)}>
                      {n.nombre}
                    </option>
                  ))}
                </select>

                {f.url && (
                  <a
                    href={f.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-color-base-300 text-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Página
                  </a>
                )}

                {f.url_newsletter && (
                  <a
                    href={f.url_newsletter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-color-base-300 text-sm"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    Suscribirse
                  </a>
                )}

                {guardando === f.id && (
                  <span className="text-xs text-color-base-content/50">Guardando…</span>
                )}
              </div>
            </div>
          )
        })}

        {visibles.length === 0 && (
          <div className="p-10 text-center rounded-2xl border border-dashed border-color-base-content/15">
            <p className="text-color-base-content/60">
              Ninguna fuente coincide con lo que buscas.
            </p>
          </div>
        )}
      </div>

      {formulario && (
        <FormularioFuente
          onCerrar={() => setFormulario(false)}
          onGuardada={(nueva) => {
            setLista((actual) => [...actual, nueva])
            setFormulario(false)
          }}
        />
      )}
    </div>
  )
}

/** Para las fuentes que aparezcan después: un aliado, un experto, un portal nuevo. */
function FormularioFuente({
  onCerrar,
  onGuardada,
}: {
  onCerrar: () => void
  onGuardada: (f: Fuente) => void
}) {
  const [nombre, setNombre] = useState('')
  const [categoria, setCategoria] = useState('')
  const [nivel, setNivel] = useState('1')
  const [url, setUrl] = useState('')
  const [urlNewsletter, setUrlNewsletter] = useState('')
  const [notas, setNotas] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  const campo = 'w-full px-3 py-2.5 rounded-xl border border-color-base-300 bg-white text-sm'

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      const r = await fetch('/api/centinela/fuentes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          categoria: categoria || undefined,
          nivel: Number(nivel),
          estado: Number(nivel) === 1 ? 'pendiente' : 'sin_revisar',
          url,
          url_newsletter: urlNewsletter,
          notas,
        }),
      })
      const datos = await r.json()
      if (!r.ok) {
        setError(datos.error || 'No se pudo guardar.')
        return
      }
      onGuardada({
        id: datos.id,
        nombre: nombre.trim(),
        categoria: categoria.trim() || 'Agregadas a mano',
        nivel: Number(nivel),
        estado: Number(nivel) === 1 ? 'pendiente' : 'sin_revisar',
        url: url.trim() || null,
        url_newsletter: urlNewsletter.trim() || null,
        correo_remitente: null,
        notas: notas.trim() || null,
        primer_correo_en: null,
        ultima_revision: null,
      })
    } catch {
      setError('No se pudo guardar. Revisa la conexión.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto p-4">
      <form
        onSubmit={enviar}
        className="max-w-xl mx-auto my-8 bg-white rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-xl font-semibold">Agregar una fuente</h2>
          <button type="button" onClick={onCerrar} aria-label="Cerrar">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-xl border border-red-200 bg-red-50 text-red-800 text-sm">
            {error}
          </div>
        )}

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Nombre de la entidad</span>
          <input
            required
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className={campo}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Grupo</span>
          <input
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            placeholder="Por ejemplo: Clima y ambiente"
            className={campo}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">¿Cómo nos enteramos de lo que publica?</span>
          <select value={nivel} onChange={(e) => setNivel(e.target.value)} className={campo}>
            {NIVELES.map((n) => (
              <option key={n.nivel} value={String(n.nivel)}>
                {n.nombre}
              </option>
            ))}
          </select>
          <span className="block text-xs text-color-base-content/60">
            {NIVELES.find((n) => String(n.nivel) === nivel)?.explicacion}
          </span>
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Página web</span>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://"
            className={campo}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Enlace para suscribirse al boletín</span>
          <input
            type="url"
            value={urlNewsletter}
            onChange={(e) => setUrlNewsletter(e.target.value)}
            placeholder="https://"
            className={campo}
          />
        </label>

        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Notas</span>
          <textarea
            rows={3}
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            className={campo}
          />
        </label>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={enviando}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-color-primary text-white text-sm font-medium disabled:opacity-60"
          >
            <Check className="w-4 h-4" />
            {enviando ? 'Guardando…' : 'Guardar fuente'}
          </button>
          <button
            type="button"
            onClick={onCerrar}
            className="px-5 py-2.5 rounded-xl border border-color-base-300 text-sm"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
