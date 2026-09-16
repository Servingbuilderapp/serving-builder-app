'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Formulario chiquito para dar de alta un socio de marca blanca (ej. un
 * gremio). Vive arriba de /admin/marca-blanca. Solo pide el nombre —
 * los demás campos son opcionales, para no trabar el flujo si todavía no
 * se tienen esos datos.
 */
export function CrearSocioForm() {
  const router = useRouter()
  const [abierto, setAbierto] = useState(false)
  const [nombre, setNombre] = useState('')
  const [marca, setMarca] = useState('')
  const [contactoNombre, setContactoNombre] = useState('')
  const [contactoCorreo, setContactoCorreo] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGuardar = async () => {
    if (!nombre.trim()) {
      setError('Escribe el nombre del socio')
      return
    }
    setGuardando(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/socios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          marca: marca || null,
          contactoNombre: contactoNombre || null,
          contactoCorreo: contactoCorreo || null,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'No se pudo crear el socio')

      setNombre('')
      setMarca('')
      setContactoNombre('')
      setContactoCorreo('')
      setAbierto(false)
      router.refresh()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hubo un problema, intenta de nuevo')
    } finally {
      setGuardando(false)
    }
  }

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="px-4 py-2 rounded-full bg-color-primary text-white text-sm font-bold hover:brightness-110"
      >
        + Nuevo socio
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-color-base-content/10 p-5 space-y-3 max-w-lg">
      <div className="text-sm font-bold text-color-base-content">Nuevo socio de marca blanca</div>

      <input
        type="text"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        placeholder="Nombre del socio (obligatorio)"
        className="w-full rounded-lg border border-color-base-content/15 px-3 py-2 text-sm"
      />
      <input
        type="text"
        value={marca}
        onChange={(e) => setMarca(e.target.value)}
        placeholder="Nombre de su marca (opcional)"
        className="w-full rounded-lg border border-color-base-content/15 px-3 py-2 text-sm"
      />
      <input
        type="text"
        value={contactoNombre}
        onChange={(e) => setContactoNombre(e.target.value)}
        placeholder="Persona de contacto (opcional)"
        className="w-full rounded-lg border border-color-base-content/15 px-3 py-2 text-sm"
      />
      <input
        type="email"
        value={contactoCorreo}
        onChange={(e) => setContactoCorreo(e.target.value)}
        placeholder="Correo de contacto (opcional)"
        className="w-full rounded-lg border border-color-base-content/15 px-3 py-2 text-sm"
      />

      {error ? <div className="text-xs text-red-600">{error}</div> : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleGuardar}
          disabled={guardando}
          className="px-4 py-2 rounded-full bg-color-primary text-white text-sm font-bold hover:brightness-110 disabled:opacity-50"
        >
          {guardando ? 'Guardando...' : 'Crear socio'}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="px-4 py-2 rounded-full bg-color-base-content/10 text-color-base-content/70 text-sm font-bold"
        >
          Cancelar
        </button>
      </div>
    </div>
  )
}
