'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NotaConceptoTexto } from '@/components/panel/NotaConceptoTexto'

type Pregunta = { clave: string; titulo: string; ayuda: string; obligatoria?: boolean }

const PREGUNTAS: Pregunta[] = [
  { clave: 'tipo_de_proyecto', titulo: 'Tipo de proyecto', ayuda: 'Por ejemplo: social, ambiental, educativo, productivo, tecnológico…' },
  { clave: 'problema_central', titulo: 'Problema central', ayuda: '¿Qué problema quieres resolver y por qué importa?', obligatoria: true },
  { clave: 'poblacion_objetivo', titulo: 'Población o mercado objetivo', ayuda: '¿A quiénes beneficia? ¿Cuántas personas, aproximadamente, si lo sabes?', obligatoria: true },
  { clave: 'ubicacion_geografica', titulo: 'Ubicación geográfica', ayuda: '¿En qué municipio, departamento o país se hará?' },
  { clave: 'solucion_propuesta', titulo: 'Solución propuesta', ayuda: '¿Qué vas a hacer, en palabras simples?', obligatoria: true },
  { clave: 'vision_largo_plazo', titulo: 'Visión a largo plazo', ayuda: '¿Cómo imaginas el proyecto en 5 años?' },
  { clave: 'modelo_sostenibilidad', titulo: 'Modelo de sostenibilidad', ayuda: '¿Cómo seguirá funcionando cuando termine la financiación?' },
  { clave: 'impacto_esperado', titulo: 'Impacto esperado', ayuda: '¿Qué cambio concreto esperas lograr?' },
  { clave: 'escalabilidad', titulo: 'Escalabilidad', ayuda: '¿Podría crecer o replicarse en otros lugares?' },
  { clave: 'experiencia_equipo', titulo: 'Experiencia del equipo', ayuda: '¿Quiénes lo harán y qué experiencia tienen?' },
  { clave: 'credibilidad_entidad', titulo: 'Credibilidad de la entidad', ayuda: '¿Qué respalda a tu organización (años, proyectos hechos, aliados)?' },
]

export function FormularioNotaMiembro({ sinCupo }: { sinCupo: boolean }) {
  const router = useRouter()
  const [nombre, setNombre] = useState('')
  const [idioma, setIdioma] = useState<'es' | 'es_en'>('es')
  const [respuestas, setRespuestas] = useState<Record<string, string>>({})
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{ documento: string; faltantes: string[]; prueba: boolean } | null>(null)

  const enviar = async () => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch('/api/membresias/nota-concepto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombreProyecto: nombre, idioma, respuestas }),
      })
      const datos = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(datos.error || 'No se pudo generar la nota. Intenta de nuevo.')
        return
      }
      setResultado({ documento: datos.documento, faltantes: datos.faltantes || [], prueba: Boolean(datos.prueba) })
      router.refresh()
    } catch {
      setError('No se pudo generar la nota. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  if (resultado) {
    return (
      <div>
        <p className="mb-3 rounded-xl bg-[#7A8B6F]/20 px-3 py-2 text-[13px] text-[#9BB18D]">
          {resultado.prueba
            ? 'Nota de prueba lista. Como administrador, no se guardó ni se descontó cupo.'
            : 'Tu nota está lista y quedó guardada abajo, en "Mis notas anteriores". Se descontó 1 de tu cupo.'}
        </p>
        {resultado.faltantes.length > 0 && (
          <p className="mb-3 rounded-xl bg-[#C99A3D]/15 px-3 py-2 text-[13px] text-[#E0B868]">
            Quedaron pendientes por falta de información: {resultado.faltantes.join(', ')}.
          </p>
        )}
        <NotaConceptoTexto documento={resultado.documento} />
      </div>
    )
  }

  const campo = 'mt-1 w-full rounded-xl border border-white/10 bg-[#3B1727] px-3 py-2 text-[13.5px] text-[#F3E7DC] placeholder:text-[#F3E7DC]/30'

  return (
    <div className="space-y-4">
      <div>
        <label className="text-[13.5px] font-bold text-[#F3E7DC]">Nombre de tu proyecto</label>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} maxLength={150} className={campo} />
      </div>

      {PREGUNTAS.map((p) => (
        <div key={p.clave}>
          <label className="text-[13.5px] font-bold text-[#F3E7DC]">
            {p.titulo}{p.obligatoria && <span className="text-[#C9A46B]"> *</span>}
          </label>
          <p className="text-[12px] text-[#F3E7DC]/50">{p.ayuda}</p>
          <textarea
            rows={3}
            maxLength={1500}
            value={respuestas[p.clave] || ''}
            onChange={(e) => setRespuestas((r) => ({ ...r, [p.clave]: e.target.value }))}
            className={campo}
          />
        </div>
      ))}

      <div>
        <label className="text-[13.5px] font-bold text-[#F3E7DC]">Idioma de la nota</label>
        <select value={idioma} onChange={(e) => setIdioma(e.target.value as 'es' | 'es_en')} className={campo}>
          <option value="es">Español (convocatorias de Colombia)</option>
          <option value="es_en">Español e inglés (convocatorias internacionales)</option>
        </select>
      </div>

      <p className="text-[12px] text-[#F3E7DC]/50">
        Los campos con * son obligatorios. La IA solo ordena y redacta lo que tú escribes: no agrega datos que no hayas dicho.
      </p>

      {error && <p className="text-[13px] text-[#E0917E]">{error}</p>}

      <button
        onClick={enviar}
        disabled={cargando || sinCupo || !nombre.trim()}
        className="rounded-xl bg-[#C9A46B] px-5 py-2.5 text-[13.5px] font-bold text-[#3B1727] disabled:opacity-50"
      >
        {cargando ? 'Redactando tu nota… (puede tardar un minuto)' : sinCupo ? 'Sin cupo este mes' : 'Generar mi nota (usa 1 del cupo)'}
      </button>
    </div>
  )
}
