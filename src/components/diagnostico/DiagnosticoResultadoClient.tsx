'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { GlassCard } from '@/components/ui/GlassCard'
import { ResultadoDiagnosticoVista } from '@/components/diagnostico/ResultadoDiagnosticoVista'
import type { DiagnosticoResultadoV2 } from '@/app/api/diagnostico-v2/route'

/** Página personal del cliente: pide el correo y, si coincide, muestra su diagnóstico completo. */
export function DiagnosticoResultadoClient({ codigo }: { codigo: string }) {
  const [email, setEmail] = useState('')
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState('')
  const [resultado, setResultado] = useState<DiagnosticoResultadoV2 | null>(null)
  const [nombreProyecto, setNombreProyecto] = useState('')

  const abrir = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setError('')
    try {
      const res = await fetch('/api/diagnostico-v2/consultar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ codigo, email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'No se pudo abrir el diagnóstico.')
      setResultado(data.resultado)
      setNombreProyecto(data.nombreProyecto || '')
    } catch (err: unknown) {
      setError((err instanceof Error && err.message) || 'Hubo un problema. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <main className="min-h-screen bg-color-base-100 text-color-base-content py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-color-base-content/60 hover:text-color-base-content transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al inicio
        </Link>

        <GlassCard className="p-8 md:p-12 border border-color-primary/20 shadow-2xl bg-white/80">
          {!resultado ? (
            <form onSubmit={abrir} className="max-w-md mx-auto space-y-4 text-center">
              <h1 className="text-2xl font-black uppercase italic">Tu diagnóstico</h1>
              <p className="text-sm text-color-base-content/80">
                Escribe el correo con el que se hizo tu diagnóstico para abrirlo.
              </p>
              <input
                type="email"
                required
                value={email}
                onChange={(ev) => setEmail(ev.target.value)}
                placeholder="tu@correo.com"
                className="w-full px-4 py-3 rounded-xl border border-color-base-300 bg-white text-sm"
              />
              {error && <p className="text-xs font-bold text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={cargando || !email}
                className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-color-primary text-white font-black text-xs uppercase tracking-wider disabled:opacity-50"
              >
                {cargando ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Ver mi diagnóstico
              </button>
            </form>
          ) : (
            <ResultadoDiagnosticoVista resultado={resultado} nombreProyecto={nombreProyecto} />
          )}
        </GlassCard>
      </div>
    </main>
  )
}
