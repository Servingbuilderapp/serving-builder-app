'use client'

import React, { useMemo, useState } from 'react'
import {
  Search, Plus, FileText, Upload, Link2, X, AlertTriangle,
  CalendarClock, Globe2, Building2, Check,
} from 'lucide-react'
import { MESES, PERIODICIDADES, TIPOS_POSTULANTE, semaforoCierre } from '@/lib/radar'

/**
 * LA BIBLIOTECA DE CONVOCATORIAS
 *
 * Tres cosas en una pantalla:
 *   1. Buscar con los filtros de la anatomía (país elegible, tipo de
 *      postulante, quién pone la plata, cuándo cierra).
 *   2. Cargar a mano la convocatoria que llegó por un boletín o por redes.
 *   3. Guardar los términos de referencia, que es lo que hace posible el
 *      encaje de verdad.
 *
 * La columna que más importa es "Pliego": una ficha sin términos de
 * referencia es un resumen, y contra un resumen no se puede encajar nada.
 */

export type Convocatoria = {
  id: string
  nombre: string
  entidad: string | null
  tipo_financiador: string | null
  ambito: string | null
  pais: string | null
  paises_elegibles: string[] | null
  tipo_postulante: string[] | null
  sector: string | null
  objetivo: string | null
  monto: string | null
  monto_maximo: number | null
  moneda: string | null
  contrapartida_exigida: boolean | null
  fecha_cierre: string | null
  fecha_cierre_texto: string | null
  fecha_apertura: string | null
  abierta_todo_el_anio: boolean | null
  mes_apertura_tipico: number | null
  periodicidad: string | null
  enlace_aplicacion: string | null
  fuente_oficial: string | null
  linea_tematica: string | null
  territorio: string | null
  origen_ficha: string | null
  actualizado_en: string | null
}

type Props = {
  convocatorias: Convocatoria[]
  conteoDocumentos: Record<string, number>
  errorCarga: string | null
  correoEquipo: string
}

const TIPOS_FINANCIADOR = [
  'estado_nacional', 'estado_local', 'cooperacion_bilateral', 'cooperacion_multilateral',
  'onu', 'banca_desarrollo', 'filantropia_privada', 'filantropia_corporativa',
  'academia', 'empresa_privada', 'ong', 'por_clasificar',
]

const ETIQUETAS_FINANCIADOR: Record<string, string> = {
  estado_nacional: 'Estado nacional',
  estado_local: 'Estado local',
  cooperacion_bilateral: 'Cooperación bilateral',
  cooperacion_multilateral: 'Multilateral',
  onu: 'ONU',
  banca_desarrollo: 'Banca de desarrollo',
  filantropia_privada: 'Filantropía privada',
  filantropia_corporativa: 'Filantropía corporativa',
  academia: 'Academia',
  empresa_privada: 'Empresa privada',
  ong: 'ONG',
  por_clasificar: 'Por clasificar',
}

const COLOR_SEMAFORO: Record<string, string> = {
  critico: 'bg-red-100 text-red-800 border-red-200',
  corriendo: 'bg-amber-100 text-amber-900 border-amber-200',
  holgado: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  cerrada: 'bg-slate-100 text-slate-500 border-slate-200',
  sin_fecha: 'bg-slate-100 text-slate-600 border-slate-200',
}

export function ConvocatoriasClient({ convocatorias, conteoDocumentos, errorCarga, correoEquipo }: Props) {
  const [texto, setTexto] = useState('')
  const [pais, setPais] = useState('')
  const [postulante, setPostulante] = useState('')
  const [financiador, setFinanciador] = useState('')
  const [cuando, setCuando] = useState('abiertas')
  const [soloConPliego, setSoloConPliego] = useState(false)
  const [abriendoFormulario, setAbriendoFormulario] = useState(false)
  const [documentoPara, setDocumentoPara] = useState<Convocatoria | null>(null)

  const filtradas = useMemo(() => {
    const busqueda = texto.trim().toLowerCase()
    const paisBuscado = pais.trim().toLowerCase()

    return convocatorias.filter((c) => {
      if (busqueda) {
        const bolsa = [
          c.nombre, c.entidad, c.objetivo, c.sector, c.linea_tematica, c.territorio,
        ].filter(Boolean).join(' ').toLowerCase()
        if (!bolsa.includes(busqueda)) return false
      }

      if (paisBuscado) {
        const lista = (c.paises_elegibles || []).map((p) => p.toLowerCase())
        const suelto = (c.pais || '').toLowerCase()
        const territorio = (c.territorio || '').toLowerCase()
        const hayCoincidencia =
          lista.some((p) => p.includes(paisBuscado)) ||
          suelto.includes(paisBuscado) ||
          territorio.includes(paisBuscado)
        // Una ficha sin países cargados no se descarta: se desconoce, no se
        // sabe que no aplique. Descartarla sería perder convocatorias buenas.
        if (lista.length > 0 && !hayCoincidencia) return false
        if (lista.length === 0 && !hayCoincidencia && (suelto || territorio)) return false
      }

      if (postulante) {
        const lista = c.tipo_postulante || []
        if (lista.length > 0 && !lista.includes(postulante)) return false
      }

      if (financiador && c.tipo_financiador !== financiador) return false

      if (soloConPliego && !(conteoDocumentos[c.id] > 0)) return false

      const semaforo = semaforoCierre(c.fecha_cierre)
      if (cuando === 'abiertas' && semaforo.estado === 'cerrada' && !c.abierta_todo_el_anio) return false
      if (cuando === 'urgentes' && !['critico', 'corriendo'].includes(semaforo.estado)) return false
      if (cuando === 'todo_el_anio' && !c.abierta_todo_el_anio) return false
      if (cuando === 'cerradas' && semaforo.estado !== 'cerrada') return false

      return true
    })
  }, [convocatorias, texto, pais, postulante, financiador, cuando, soloConPliego, conteoDocumentos])

  const conPliego = convocatorias.filter((c) => conteoDocumentos[c.id] > 0).length

  return (
    <div className="w-full max-w-7xl mx-auto p-6 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-color-base-content">Biblioteca de convocatorias</h1>
          <p className="text-color-base-content/60 text-sm mt-1">
            {convocatorias.length} fichas · {conPliego} con los términos de referencia guardados
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAbriendoFormulario(true)}
          className="shrink-0 inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-color-primary text-white font-bold text-sm hover:brightness-110 transition-all"
        >
          <Plus className="h-4 w-4" />
          Cargar una a mano
        </button>
      </div>

      {conPliego < convocatorias.length && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 text-sm">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <p>
            <strong>{convocatorias.length - conPliego} fichas todavía son solo un resumen.</strong>{' '}
            Sin los términos de referencia guardados no se puede encajar un proyecto contra ellas:
            se estaría encajando contra un párrafo, no contra las reglas.
          </p>
        </div>
      )}

      {errorCarga && (
        <div className="p-4 rounded-2xl border border-red-200 bg-red-50 text-red-800 text-sm">
          No se pudo leer la biblioteca: {errorCarga}
          <span className="block text-xs mt-1 opacity-80">
            Si dice que no existe una columna, falta correr supabase_migration_radar.sql.
          </span>
        </div>
      )}

      {/* Búsqueda */}
      <div className="p-5 rounded-2xl border border-color-base-content/10 bg-color-base-200 space-y-4">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-color-base-content/40" />
          <input
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            placeholder="Buscar por nombre, entidad, objetivo, sector o territorio"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-color-base-300 bg-white text-sm"
          />
        </div>

        <div className="grid md:grid-cols-4 gap-3">
          <input
            value={pais}
            onChange={(e) => setPais(e.target.value)}
            placeholder="País elegible (ej. Colombia)"
            className="px-3 py-2.5 rounded-xl border border-color-base-300 bg-white text-sm"
          />

          <select
            value={postulante}
            onChange={(e) => setPostulante(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-color-base-300 bg-white text-sm"
          >
            <option value="">Cualquier postulante</option>
            {TIPOS_POSTULANTE.map((t) => (
              <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>
            ))}
          </select>

          <select
            value={financiador}
            onChange={(e) => setFinanciador(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-color-base-300 bg-white text-sm"
          >
            <option value="">Quién pone la plata</option>
            {TIPOS_FINANCIADOR.map((t) => (
              <option key={t} value={t}>{ETIQUETAS_FINANCIADOR[t]}</option>
            ))}
          </select>

          <select
            value={cuando}
            onChange={(e) => setCuando(e.target.value)}
            className="px-3 py-2.5 rounded-xl border border-color-base-300 bg-white text-sm"
          >
            <option value="abiertas">Abiertas</option>
            <option value="urgentes">Cierran pronto (20 días o menos)</option>
            <option value="todo_el_anio">Abiertas todo el año</option>
            <option value="cerradas">Ya cerradas</option>
            <option value="todas">Todas</option>
          </select>
        </div>

        <label className="inline-flex items-center gap-2 text-sm font-semibold text-color-base-content cursor-pointer">
          <input
            type="checkbox"
            checked={soloConPliego}
            onChange={(e) => setSoloConPliego(e.target.checked)}
            className="h-4 w-4 rounded border-color-base-300"
          />
          Solo las que ya tienen los términos de referencia
        </label>
      </div>

      <p className="text-sm text-color-base-content/60">
        {filtradas.length} de {convocatorias.length}
      </p>

      {/* Lista */}
      <div className="space-y-3">
        {filtradas.map((c) => {
          const semaforo = semaforoCierre(c.fecha_cierre)
          const documentos = conteoDocumentos[c.id] || 0

          return (
            <div
              key={c.id}
              className="p-5 rounded-2xl border border-color-base-content/10 bg-white space-y-3"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="space-y-1 min-w-0">
                  <h3 className="font-black text-color-base-content leading-snug">{c.nombre}</h3>
                  <p className="text-xs text-color-base-content/60 flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1">
                      <Building2 className="h-3 w-3" />
                      {c.entidad || 'Sin entidad'}
                    </span>
                    <span>{ETIQUETAS_FINANCIADOR[c.tipo_financiador || 'por_clasificar']}</span>
                    {c.sector && <span>{c.sector}</span>}
                    {c.origen_ficha === 'manual' && (
                      <span className="text-color-primary font-bold">Cargada a mano</span>
                    )}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${COLOR_SEMAFORO[semaforo.estado]}`}>
                    {c.abierta_todo_el_anio ? 'Abierta todo el año' : semaforo.texto}
                  </span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-full border inline-flex items-center gap-1 ${
                      documentos > 0
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-200'
                        : 'bg-slate-100 text-slate-600 border-slate-200'
                    }`}
                  >
                    {documentos > 0 ? <Check className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
                    {documentos > 0 ? `Pliego guardado (${documentos})` : 'Sin pliego'}
                  </span>
                </div>
              </div>

              {c.objetivo && (
                <p className="text-sm text-color-base-content/75 leading-relaxed line-clamp-2">
                  {c.objetivo}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-color-base-content/60">
                {(c.paises_elegibles || []).length > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Globe2 className="h-3 w-3" />
                    {(c.paises_elegibles || []).slice(0, 4).join(', ')}
                    {(c.paises_elegibles || []).length > 4 && ` +${(c.paises_elegibles || []).length - 4}`}
                  </span>
                )}
                {(c.tipo_postulante || []).length > 0 && (
                  <span>Postula: {(c.tipo_postulante || []).join(', ').replace(/_/g, ' ')}</span>
                )}
                {(c.monto_maximo || c.monto) && (
                  <span>
                    {c.monto_maximo
                      ? `Hasta ${c.monto_maximo.toLocaleString('es-CO')} ${c.moneda || ''}`.trim()
                      : c.monto}
                  </span>
                )}
                {c.contrapartida_exigida && <span>Exige contrapartida</span>}
                {c.mes_apertura_tipico && (
                  <span className="inline-flex items-center gap-1">
                    <CalendarClock className="h-3 w-3" />
                    Suele abrir en {MESES[c.mes_apertura_tipico - 1]}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setDocumentoPara(c)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-color-primary/30 text-color-primary text-xs font-bold hover:bg-color-primary/5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  {documentos > 0 ? 'Agregar documento' : 'Guardar los términos de referencia'}
                </button>

                {c.enlace_aplicacion && (
                  <a
                    href={c.enlace_aplicacion}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-color-base-300 text-xs font-bold text-color-base-content hover:bg-color-base-200"
                  >
                    <Link2 className="h-3.5 w-3.5" />
                    Aplicar aquí
                  </a>
                )}

                {c.fuente_oficial && (
                  <a
                    href={c.fuente_oficial}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-color-base-300 text-xs font-bold text-color-base-content hover:bg-color-base-200"
                  >
                    Página de la entidad
                  </a>
                )}
              </div>
            </div>
          )
        })}

        {filtradas.length === 0 && (
          <div className="p-10 text-center rounded-2xl border border-dashed border-color-base-content/15">
            <p className="text-sm text-color-base-content/60">
              Ninguna ficha cumple ese filtro. Prueba con &laquo;Todas&raquo; en el último selector.
            </p>
          </div>
        )}
      </div>

      {abriendoFormulario && (
        <FormularioFicha
          correoEquipo={correoEquipo}
          onCerrar={() => setAbriendoFormulario(false)}
        />
      )}

      {documentoPara && (
        <SubirDocumento
          convocatoria={documentoPara}
          onCerrar={() => setDocumentoPara(null)}
        />
      )}
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/* Cargar una convocatoria a mano, siguiendo la anatomía de los TdR          */
/* ------------------------------------------------------------------------ */

function FormularioFicha({ correoEquipo, onCerrar }: { correoEquipo: string; onCerrar: () => void }) {
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [postulantes, setPostulantes] = useState<string[]>([])
  const [todoElAnio, setTodoElAnio] = useState(false)

  const guardar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setGuardando(true)
    setError(null)
    setMensaje(null)

    const datos = Object.fromEntries(new FormData(e.currentTarget).entries())

    try {
      const respuesta = await fetch('/api/convocatorias/ficha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...datos,
          tipo_postulante: postulantes,
          abierta_todo_el_anio: todoElAnio,
          cargadaPor: correoEquipo,
        }),
      })
      const salida = await respuesta.json()
      if (!respuesta.ok) throw new Error(salida?.error || 'No se pudo guardar')

      setMensaje(
        salida.creada
          ? 'Convocatoria guardada. Ahora súbele los términos de referencia.'
          : 'Esa convocatoria ya estaba en la biblioteca: se completó con lo que escribiste.',
      )
      setTimeout(() => window.location.reload(), 1200)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setGuardando(false)
    }
  }

  const campo = 'w-full px-3 py-2.5 rounded-xl border border-color-base-300 bg-white text-sm'
  const etiqueta = 'block text-[11px] font-black uppercase tracking-wider text-color-base-content/70 mb-1'

  return (
    <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto p-4">
      <form
        onSubmit={guardar}
        className="max-w-3xl mx-auto my-8 bg-white rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-color-base-content">Cargar una convocatoria</h2>
            <p className="text-sm text-color-base-content/60 mt-1">
              Es la anatomía de un pliego. Lo que no sepas, déjalo en blanco: se completa después.
            </p>
          </div>
          <button type="button" onClick={onCerrar} className="p-2 rounded-lg hover:bg-color-base-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className={etiqueta}>Nombre de la convocatoria *</label>
            <input name="nombre" required className={campo} />
          </div>
          <div>
            <label className={etiqueta}>Entidad que convoca</label>
            <input name="entidad" className={campo} />
          </div>
          <div>
            <label className={etiqueta}>Quién pone la plata</label>
            <select name="tipo_financiador" className={campo} defaultValue="por_clasificar">
              {TIPOS_FINANCIADOR.map((t) => (
                <option key={t} value={t}>{ETIQUETAS_FINANCIADOR[t]}</option>
              ))}
            </select>
          </div>
        </div>

        <Bloque titulo="1 y 2 · Quién está habilitado, y dónde">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={etiqueta}>Países elegibles (separados por coma)</label>
              <input name="paises_elegibles" placeholder="Colombia, Perú, Ecuador" className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Sector</label>
              <input name="sector" placeholder="Agua, educación, agro..." className={campo} />
            </div>
          </div>
          <div>
            <label className={etiqueta}>Tipo de postulante que exige</label>
            <div className="flex flex-wrap gap-2">
              {TIPOS_POSTULANTE.map((t) => {
                const activo = postulantes.includes(t)
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() =>
                      setPostulantes((antes) =>
                        antes.includes(t) ? antes.filter((x) => x !== t) : [...antes, t],
                      )
                    }
                    className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      activo
                        ? 'bg-color-primary text-white border-color-primary'
                        : 'bg-white text-color-base-content/70 border-color-base-300'
                    }`}
                  >
                    {t.replace(/_/g, ' ')}
                  </button>
                )
              })}
            </div>
          </div>
        </Bloque>

        <Bloque titulo="3 y 4 · El objetivo real y con qué califica">
          <div>
            <label className={etiqueta}>Objetivo real de la convocatoria</label>
            <textarea name="objetivo" rows={3} className={campo} placeholder="Para qué entrega el dinero de verdad, no lo que dice el título" />
          </div>
          <div>
            <label className={etiqueta}>Criterios de evaluación</label>
            <textarea name="criterios_evaluacion" rows={3} className={campo} placeholder="Cómo puntúan y con qué peso" />
          </div>
        </Bloque>

        <Bloque titulo="5 · Monto y contrapartida">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={etiqueta}>Monto máximo</label>
              <input name="monto_maximo" inputMode="numeric" className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Moneda</label>
              <input name="moneda" placeholder="COP, USD, EUR" className={campo} />
            </div>
            <div>
              <label className={etiqueta}>¿Exige contrapartida?</label>
              <select name="contrapartida_exigida" className={campo} defaultValue="">
                <option value="">No se sabe</option>
                <option value="true">Sí</option>
                <option value="false">No</option>
              </select>
            </div>
          </div>
          <div>
            <label className={etiqueta}>Detalle de la contrapartida</label>
            <input name="contrapartida_detalle" placeholder="Porcentaje, si acepta especie, qué cuenta" className={campo} />
          </div>
        </Bloque>

        <Bloque titulo="6 · Los hitos">
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={etiqueta}>Abre</label>
              <input type="date" name="fecha_apertura" className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Cierra</label>
              <input type="date" name="fecha_cierre" className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Resultados</label>
              <input type="date" name="fecha_resultados" className={campo} />
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={etiqueta}>Si la fecha viene en palabras</label>
              <input name="fecha_cierre_texto" placeholder="Primer trimestre de 2027" className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Suele abrir en</label>
              <select name="mes_apertura_tipico" className={campo} defaultValue="">
                <option value="">No se sabe</option>
                {MESES.map((m, i) => (
                  <option key={m} value={i + 1}>{m}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={etiqueta}>Cada cuánto abre</label>
              <select name="periodicidad" className={campo} defaultValue="">
                <option value="">No se sabe</option>
                {PERIODICIDADES.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>
          <label className="inline-flex items-center gap-2 text-sm font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={todoElAnio}
              onChange={(e) => setTodoElAnio(e.target.checked)}
              className="h-4 w-4 rounded border-color-base-300"
            />
            Está abierta todo el año
          </label>
        </Bloque>

        <Bloque titulo="7 · Requisitos habilitantes y enlaces">
          <div>
            <label className={etiqueta}>Requisitos habilitantes</label>
            <textarea name="requisitos_habilitantes" rows={3} className={campo} placeholder="Los documentos y condiciones sin los cuales ni reciben la postulación" />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className={etiqueta}>Enlace para aplicar</label>
              <input name="enlace_aplicacion" placeholder="https://..." className={campo} />
            </div>
            <div>
              <label className={etiqueta}>Página de la entidad</label>
              <input name="fuente_oficial" placeholder="https://..." className={campo} />
            </div>
          </div>
          <div>
            <label className={etiqueta}>Notas del equipo</label>
            <textarea name="notas_equipo" rows={2} className={campo} />
          </div>
        </Bloque>

        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
        {mensaje && <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{mensaje}</p>}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-color-base-200">
          <button type="button" onClick={onCerrar} className="px-5 py-3 rounded-xl text-sm font-bold text-color-base-content/70">
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className="px-6 py-3 rounded-xl bg-color-primary text-white font-bold text-sm disabled:opacity-50"
          >
            {guardando ? 'Guardando...' : 'Guardar convocatoria'}
          </button>
        </div>
      </form>
    </div>
  )
}

function Bloque({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4 p-5 rounded-2xl bg-color-base-100 border border-color-base-300">
      <h3 className="text-xs font-black uppercase tracking-widest text-color-primary">{titulo}</h3>
      {children}
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/* Guardar los términos de referencia                                        */
/* ------------------------------------------------------------------------ */

function SubirDocumento({ convocatoria, onCerrar }: { convocatoria: Convocatoria; onCerrar: () => void }) {
  const [modo, setModo] = useState<'archivo' | 'enlace' | 'texto'>('archivo')
  const [trabajando, setTrabajando] = useState(false)
  const [resultado, setResultado] = useState<string | null>(null)
  const [aviso, setAviso] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const enviar = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setTrabajando(true)
    setError(null)
    setResultado(null)
    setAviso(null)

    const formulario = e.currentTarget
    const datos = new FormData(formulario)

    try {
      let respuesta: Response

      if (modo === 'archivo') {
        datos.set('convocatoriaId', convocatoria.id)
        respuesta = await fetch('/api/convocatorias/documentos', { method: 'POST', body: datos })
      } else {
        respuesta = await fetch('/api/convocatorias/documentos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            convocatoriaId: convocatoria.id,
            clase: String(datos.get('clase') || 'terminos_referencia'),
            url: modo === 'enlace' ? String(datos.get('url') || '') : undefined,
            texto: modo === 'texto' ? String(datos.get('texto') || '') : undefined,
          }),
        })
      }

      const salida = await respuesta.json()
      if (!respuesta.ok) throw new Error(salida?.error || 'No se pudo guardar')

      setResultado(
        `Guardado: ${salida.documento?.caracteres?.toLocaleString('es-CO') || 0} caracteres` +
          (salida.documento?.paginas ? ` · ${salida.documento.paginas} páginas` : ''),
      )
      if (salida.aviso) setAviso(salida.aviso)
      else setTimeout(() => window.location.reload(), 1500)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setTrabajando(false)
    }
  }

  const campo = 'w-full px-3 py-2.5 rounded-xl border border-color-base-300 bg-white text-sm'

  return (
    <div className="fixed inset-0 z-50 bg-black/40 overflow-y-auto p-4">
      <form onSubmit={enviar} className="max-w-xl mx-auto my-8 bg-white rounded-3xl p-6 md:p-8 space-y-5 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h2 className="text-lg font-black text-color-base-content">Términos de referencia</h2>
            <p className="text-sm text-color-base-content/60 mt-1 truncate">{convocatoria.nombre}</p>
          </div>
          <button type="button" onClick={onCerrar} className="p-2 rounded-lg hover:bg-color-base-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="text-xs text-color-base-content/60 leading-relaxed">
          Lo que se guarda es el TEXTO del documento: es lo que lee el motor para encajar el
          proyecto pieza por pieza. El archivo original no se guarda.
        </p>

        <div className="flex gap-2">
          {([
            ['archivo', 'Subir archivo'],
            ['enlace', 'Desde un enlace'],
            ['texto', 'Pegar el texto'],
          ] as const).map(([valor, titulo]) => (
            <button
              key={valor}
              type="button"
              onClick={() => setModo(valor)}
              className={`px-3 py-2 rounded-lg text-xs font-bold border ${
                modo === valor
                  ? 'bg-color-primary text-white border-color-primary'
                  : 'bg-white text-color-base-content/70 border-color-base-300'
              }`}
            >
              {titulo}
            </button>
          ))}
        </div>

        <div>
          <label className="block text-[11px] font-black uppercase tracking-wider text-color-base-content/70 mb-1">
            Qué documento es
          </label>
          <select name="clase" className={campo} defaultValue="terminos_referencia">
            <option value="terminos_referencia">Términos de referencia</option>
            <option value="anexo">Anexo</option>
            <option value="formato">Formato</option>
            <option value="guia">Guía</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {modo === 'archivo' && (
          <div>
            <input type="file" name="archivo" accept=".pdf,.docx,.txt,.md" required className={campo} />
            <p className="text-[11px] text-color-base-content/50 mt-1">
              PDF, Word o texto. Hasta 20 MB. Si el PDF es escaneado no trae texto: en ese caso
              usa &laquo;Pegar el texto&raquo;.
            </p>
          </div>
        )}

        {modo === 'enlace' && (
          <div>
            <input name="url" type="url" placeholder="https://.../terminos.pdf" required className={campo} />
            <p className="text-[11px] text-color-base-content/50 mt-1">
              El enlace directo al documento, no la página donde está.
            </p>
          </div>
        )}

        {modo === 'texto' && (
          <textarea
            name="texto"
            rows={10}
            required
            placeholder="Pega aquí el contenido del pliego"
            className={campo}
          />
        )}

        {error && <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</p>}
        {resultado && <p className="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl p-3">{resultado}</p>}
        {aviso && (
          <p className="text-sm text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-3">
            {aviso}
          </p>
        )}

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-color-base-200">
          <button type="button" onClick={onCerrar} className="px-5 py-3 rounded-xl text-sm font-bold text-color-base-content/70">
            Cerrar
          </button>
          <button
            type="submit"
            disabled={trabajando}
            className="px-6 py-3 rounded-xl bg-color-primary text-white font-bold text-sm disabled:opacity-50"
          >
            {trabajando ? 'Leyendo el documento...' : 'Guardar'}
          </button>
        </div>
      </form>
    </div>
  )
}
