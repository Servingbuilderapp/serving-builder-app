'use client'

import React, { useState } from 'react'

/**
 * Formulario que ve el cliente final al entrar por el enlace de un socio
 * de marca blanca. A propósito no muestra ningún precio en dólares — eso
 * es el trato entre Serving y el socio, no algo que le importe a este
 * cliente (él ya pagó al socio por su lado, a su manera).
 *
 * Los planes se muestran por ahora como "Plan 1", "Plan 2", "Plan 3" —
 * sin nombre comercial ni descripción de días/convocatorias — porque
 * todavía no está decidido qué va a incluir cada uno ni el precio
 * (Gonzalo, 28 sep 2026: está por definir con cada socio antes de fijar
 * nada). Antes eran "Estándar" (45 días, una convocatoria) y "Premium"
 * (90 días, varias en paralelo) — esa definición queda guardada por si
 * se retoma, pero hoy no se le muestra al cliente.
 */
export function FormularioIngresoSocio({
  slug,
  nombreSocio,
  logoUrl,
  colorPrimario,
}: {
  slug: string
  nombreSocio: string
  logoUrl?: string | null
  colorPrimario?: string | null
}) {
  // El color del socio pisa el color de Serving solo dentro de esta
  // pantalla, usando la misma variable que ya usan las clases
  // bg-color-primary / text-color-primary / border-color-primario en todo
  // el producto — así no hay que tocar cada clase, una por una.
  const estiloMarca = colorPrimario
    ? ({ ['--color-color-primary' as string]: colorPrimario, ['--color-primary' as string]: colorPrimario } as React.CSSProperties)
    : undefined
  const [nombreCliente, setNombreCliente] = useState('')
  const [correoCliente, setCorreoCliente] = useState('')
  const [whatsapp, setWhatsapp] = useState('')
  const [nombreIniciativa, setNombreIniciativa] = useState('')
  const [paquete, setPaquete] = useState<'plan1' | 'plan2' | 'plan3' | ''>('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [enviando, setEnviando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{ correoCliente: string; passwordTemporal: string | null } | null>(null)

  const handleEnviar = async () => {
    if (!nombreCliente.trim() || !correoCliente.trim() || !whatsapp.trim() || !nombreIniciativa.trim() || !paquete) {
      setError('Completa todos los campos y elige un paquete')
      return
    }
    if (!aceptaTerminos) {
      setError('Debes aceptar los términos para continuar')
      return
    }
    setEnviando(true)
    setError(null)
    try {
      const res = await fetch('/api/marca-blanca/crear-proyecto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, nombreCliente, correoCliente, whatsapp, nombreIniciativa, paquete }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'No se pudo crear el proyecto')

      setResultado({ correoCliente, passwordTemporal: data.passwordTemporal || null })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hubo un problema, intenta de nuevo')
    } finally {
      setEnviando(false)
    }
  }

  if (resultado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F4F7FC] p-6" style={estiloMarca}>
        <div className="max-w-md w-full rounded-2xl border border-[#0F172A]/10 bg-white p-8 text-center space-y-4">
          <h1 className="text-lg font-bold text-[#0F172A]">¡Listo! Tu proyecto quedó registrado</h1>
          <p className="text-sm text-[#0F172A]/70">
            Ya puedes entrar con tu cuenta para seguir el avance y subir la información de tu idea.
          </p>
          <div className="rounded-xl bg-[#0F172A]/5 p-4 text-left text-sm space-y-1">
            <div>
              <span className="font-semibold">Correo:</span> {resultado.correoCliente}
            </div>
            {resultado.passwordTemporal ? (
              <div>
                <span className="font-semibold">Clave temporal:</span> {resultado.passwordTemporal}
              </div>
            ) : (
              <div className="text-[#0F172A]/60">Ya tenías una cuenta — entra con tu clave de siempre.</div>
            )}
          </div>
          <a
            href="/login"
            className="inline-block px-5 py-2.5 rounded-full bg-color-primary text-white text-sm font-bold hover:brightness-110"
          >
            Ir a iniciar sesión
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F4F7FC] p-6 flex items-center justify-center" style={estiloMarca}>
      <div className="max-w-lg w-full rounded-2xl border border-[#0F172A]/10 bg-white p-8 space-y-5">
        <div>
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={nombreSocio} className="h-10 max-w-[220px] object-contain mb-2" />
          ) : null}
          <h1 className="text-xl font-bold text-[#0F172A]">{nombreSocio}</h1>
          <p className="text-sm text-[#0F172A]/60 mt-1">
            Cuéntanos de tu proyecto para empezar a estructurarlo y buscar financiación.
          </p>
        </div>

        <div className="space-y-3">
          <input
            type="text"
            value={nombreCliente}
            onChange={(e) => setNombreCliente(e.target.value)}
            placeholder="Tu nombre completo"
            className="w-full rounded-lg border border-[#0F172A]/15 px-3 py-2 text-sm"
          />
          <input
            type="email"
            value={correoCliente}
            onChange={(e) => setCorreoCliente(e.target.value)}
            placeholder="Tu correo"
            className="w-full rounded-lg border border-[#0F172A]/15 px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="Tu WhatsApp"
            className="w-full rounded-lg border border-[#0F172A]/15 px-3 py-2 text-sm"
          />
          <input
            type="text"
            value={nombreIniciativa}
            onChange={(e) => setNombreIniciativa(e.target.value)}
            placeholder="Nombre de tu proyecto o idea"
            className="w-full rounded-lg border border-[#0F172A]/15 px-3 py-2 text-sm"
          />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-black uppercase tracking-wider text-[#0F172A]/50">Elige tu plan</div>

          <button
            type="button"
            onClick={() => setPaquete('plan1')}
            className={`w-full text-left rounded-xl border p-4 transition-colors ${
              paquete === 'plan1' ? 'border-color-primary bg-color-primary/5' : 'border-[#0F172A]/15'
            }`}
          >
            <div className="font-bold text-sm text-[#0F172A]">Plan 1</div>
          </button>

          <button
            type="button"
            onClick={() => setPaquete('plan2')}
            className={`w-full text-left rounded-xl border p-4 transition-colors ${
              paquete === 'plan2' ? 'border-color-primary bg-color-primary/5' : 'border-[#0F172A]/15'
            }`}
          >
            <div className="font-bold text-sm text-[#0F172A]">Plan 2</div>
          </button>

          <button
            type="button"
            onClick={() => setPaquete('plan3')}
            className={`w-full text-left rounded-xl border p-4 transition-colors ${
              paquete === 'plan3' ? 'border-color-primary bg-color-primary/5' : 'border-[#0F172A]/15'
            }`}
          >
            <div className="font-bold text-sm text-[#0F172A]">Plan 3</div>
          </button>
        </div>

        <label className="flex items-start gap-2 text-xs text-[#0F172A]/60">
          <input
            type="checkbox"
            checked={aceptaTerminos}
            onChange={(e) => setAceptaTerminos(e.target.checked)}
            className="mt-0.5"
          />
          Acepto que mi información se use para estructurar mi proyecto y buscar financiación.
        </label>

        {error ? <div className="text-xs text-red-600">{error}</div> : null}

        <button
          type="button"
          onClick={handleEnviar}
          disabled={enviando}
          className="w-full py-3 rounded-full bg-color-primary text-white text-sm font-bold hover:brightness-110 disabled:opacity-50"
        >
          {enviando ? 'Enviando...' : 'Empezar'}
        </button>
      </div>
    </div>
  )
}
