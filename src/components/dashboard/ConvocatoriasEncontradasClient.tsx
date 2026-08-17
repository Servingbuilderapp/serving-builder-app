'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown, ChevronUp, ExternalLink, Loader2 } from 'lucide-react'

interface Encaje {
  resumen_convocatoria: string | null
  encaje_actual: string | null
  encaje_potencial: string | null
  semaforo: string | null
  puntaje_general: number | null
  escenario_recomendado: string | null
  recomendaciones: string | null
  checklist_preparacion: string[] | null
  documentacion_faltante: string | null
  version_postulacion: string | null
}

interface Convocatoria {
  id: string
  nombre: string
  entidad: string
  tipo: string
  fecha_cierre: string
  monto: string
  fuente_oficial: string
  lote: number
  encaje: Encaje | null
}

interface Props {
  proyectoId: string
  convocatoriasIniciales: Convocatoria[]
}

const COLORES_SEMAFORO: Record<string, { bg: string; texto: string; borde: string; emoji: string }> = {
  verde: { bg: 'bg-emerald-50', texto: 'text-emerald-700', borde: 'border-emerald-300', emoji: '🟢' },
  amarillo: { bg: 'bg-amber-50', texto: 'text-amber-700', borde: 'border-amber-300', emoji: '🟡' },
  rojo: { bg: 'bg-red-50', texto: 'text-red-700', borde: 'border-red-300', emoji: '🔴' },
}

function GaugePuntaje({ puntaje }: { puntaje: number }) {
  const angulo = (puntaje / 100) * 180
  const colorAguja = puntaje >= 70 ? '#1D9E75' : puntaje >= 40 ? '#EF9F27' : '#E24B4A'
  return (
    <svg width="90" height="55" viewBox="0 0 100 55">
      <path d="M 8 50 A 42 42 0 0 1 92 50" fill="none" stroke="currentColor" className="text-color-base-content/10" strokeWidth="9" strokeLinecap="round" />
      <path
        d="M 8 50 A 42 42 0 0 1 92 50"
        fill="none"
        stroke={colorAguja}
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${(puntaje / 100) * 132} 132`}
      />
      <text x="50" y="42" textAnchor="middle" fontSize="18" fontWeight="700" className="fill-color-base-content">
        {puntaje}
      </text>
    </svg>
  )
}

function TarjetaConvocatoria({ convocatoria }: { convocatoria: Convocatoria }) {
  const [expandido, setExpandido] = useState(false)
  const encaje = convocatoria.encaje
  const estiloSemaforo = encaje?.semaforo ? COLORES_SEMAFORO[encaje.semaforo.toLowerCase()] : null

  return (
    <div className="rounded-2xl border border-color-base-content/10 bg-white overflow-hidden">
      <div className="p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-black text-color-base-content text-sm">{convocatoria.nombre}</h4>
            <p className="text-xs text-color-base-content/50">{convocatoria.entidad} · {convocatoria.tipo}</p>
          </div>
          {encaje?.puntaje_general != null && <GaugePuntaje puntaje={encaje.puntaje_general} />}
        </div>

        {!encaje && (
          <div className="flex items-center gap-2 text-xs text-color-base-content/50 py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
            Analizando el encaje con esta convocatoria...
          </div>
        )}

        {encaje && estiloSemaforo && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${estiloSemaforo.bg} ${estiloSemaforo.texto} border ${estiloSemaforo.borde}`}>
            <span>{estiloSemaforo.emoji}</span>
            <span>{encaje.semaforo?.toUpperCase()}</span>
            {encaje.escenario_recomendado && <span className="font-normal opacity-70">· Escenario {encaje.escenario_recomendado.slice(0, 1)}</span>}
          </div>
        )}

        {encaje?.resumen_convocatoria && (
          <p className="text-xs text-color-base-content/70">{encaje.resumen_convocatoria}</p>
        )}

        <div className="flex items-center gap-4 text-xs text-color-base-content/50 pt-1">
          <span>Cierre: {convocatoria.fecha_cierre || 'No especificado'}</span>
          <span>Monto: {convocatoria.monto || 'No especificado'}</span>
        </div>

        <div className="flex items-center gap-4 pt-1">
          {convocatoria.fuente_oficial && (
            <a
              href={convocatoria.fuente_oficial}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-bold text-color-primary hover:underline"
            >
              Ver fuente oficial <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {encaje && (
            <button
              onClick={() => setExpandido(!expandido)}
              className="inline-flex items-center gap-1 text-xs font-bold text-color-base-content/60 hover:text-color-base-content"
            >
              {expandido ? 'Ver menos' : 'Ver análisis completo'}
              {expandido ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {expandido && encaje && (
        <div className="border-t border-color-base-content/10 bg-color-base-content/5 p-5 space-y-4">
          {encaje.encaje_actual && (
            <div>
              <p className="text-xs font-black text-color-base-content/70 uppercase tracking-wide mb-1">Encaje actual</p>
              <p className="text-xs text-color-base-content/80">{encaje.encaje_actual}</p>
            </div>
          )}
          {encaje.encaje_potencial && (
            <div>
              <p className="text-xs font-black text-color-base-content/70 uppercase tracking-wide mb-1">Encaje potencial (con adaptación)</p>
              <p className="text-xs text-color-base-content/80">{encaje.encaje_potencial}</p>
            </div>
          )}
          {encaje.recomendaciones && (
            <div>
              <p className="text-xs font-black text-color-base-content/70 uppercase tracking-wide mb-1">Recomendaciones</p>
              <p className="text-xs text-color-base-content/80">{encaje.recomendaciones}</p>
            </div>
          )}
          {encaje.checklist_preparacion && encaje.checklist_preparacion.length > 0 && (
            <div>
              <p className="text-xs font-black text-color-base-content/70 uppercase tracking-wide mb-1">
                Checklist de preparación ({encaje.checklist_preparacion.length})
              </p>
              <ul className="space-y-1">
                {encaje.checklist_preparacion.map((item, i) => (
                  <li key={i} className="text-xs text-color-base-content/80 flex gap-2">
                    <span className="text-color-base-content/30">□</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {encaje.documentacion_faltante && (
            <div>
              <p className="text-xs font-black text-color-base-content/70 uppercase tracking-wide mb-1">Documentación faltante</p>
              <p className="text-xs text-color-base-content/80">{encaje.documentacion_faltante}</p>
            </div>
          )}
          {encaje.version_postulacion && (
            <div>
              <p className="text-xs font-black text-color-base-content/70 uppercase tracking-wide mb-1">Versión de Postulación</p>
              <p className="text-xs text-color-base-content/80 whitespace-pre-line">{encaje.version_postulacion}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function ConvocatoriasEncontradasClient({ proyectoId, convocatoriasIniciales }: Props) {
  const [convocatorias, setConvocatorias] = useState<Convocatoria[]>(convocatoriasIniciales)

  useEffect(() => {
    const supabase = createClient()

    const actualizarDatos = async () => {
      const { data: convs } = await supabase
        .from('convocatorias_candidatas_proyecto')
        .select('*')
        .eq('id_proyecto', proyectoId)
        .eq('seleccionada', true)
        .order('lote', { ascending: false })
        .order('creado_en', { ascending: false })

      const { data: encajes } = await supabase
        .from('encajes_convocatoria_proyecto')
        .select('*')
        .eq('id_proyecto', proyectoId)

      const mapaEncajes = new Map((encajes || []).map((e) => [e.id_convocatoria, e]))

      setConvocatorias(
        (convs || []).map((c) => ({
          ...c,
          encaje: mapaEncajes.get(c.id) || null,
        }))
      )
    }

    const canal = supabase
      .channel(`convocatorias-proyecto-${proyectoId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'convocatorias_candidatas_proyecto', filter: `id_proyecto=eq.${proyectoId}` },
        () => actualizarDatos()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'encajes_convocatoria_proyecto', filter: `id_proyecto=eq.${proyectoId}` },
        () => actualizarDatos()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(canal)
    }
  }, [proyectoId])

  if (convocatorias.length === 0) return null

  return (
    <div className="p-8 rounded-3xl border border-color-base-content/10 bg-color-base-content/5 space-y-4">
      <h3 className="text-lg font-black text-color-base-content">Convocatorias encontradas para tu proyecto</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        {convocatorias.map((c) => (
          <TarjetaConvocatoria key={c.id} convocatoria={c} />
        ))}
      </div>
    </div>
  )
}
