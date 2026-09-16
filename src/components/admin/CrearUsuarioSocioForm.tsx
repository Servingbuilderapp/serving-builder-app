'use client'

import React, { useState } from 'react'

type SocioOpcion = { id: string; nombre: string }

/**
 * Da de alta un login para una persona de un socio de marca blanca. Puede
 * haber varias personas del mismo socio — todas comparten el mismo
 * panel y ven los mismos proyectos (los de su socio_id), nunca los de
 * Serving ni los de otro socio.
 *
 * Aparte del formulario de usuarios de clientes (AddUserModal) para no
 * mezclar los dos flujos.
 */
export function CrearUsuarioSocioForm({ socios }: { socios: SocioOpcion[] }) {
  const [abierto, setAbierto] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [socioId, setSocioId] = useState('')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCrear = async () => {
    if (!email.trim() || !password.trim() || !socioId) {
      setError('Falta el correo, la clave o el socio')
      return
    }
    setGuardando(true)
    setError(null)
    setMensaje(null)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, firstName, lastName, role: 'socio', socioId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'No se pudo crear el usuario')

      setMensaje(`Usuario creado para ${email}. Ya puede entrar con esa clave.`)
      setEmail('')
      setPassword('')
      setFirstName('')
      setLastName('')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Hubo un problema, intenta de nuevo')
    } finally {
      setGuardando(false)
    }
  }

  if (socios.length === 0) return null

  if (!abierto) {
    return (
      <button
        type="button"
        onClick={() => setAbierto(true)}
        className="px-4 py-2 rounded-full bg-color-base-content/10 text-color-base-content/70 text-sm font-bold hover:bg-color-base-content/20"
      >
        + Crear acceso para una persona del socio
      </button>
    )
  }

  return (
    <div className="rounded-2xl border border-color-base-content/10 p-5 space-y-3 max-w-lg">
      <div className="text-sm font-bold text-color-base-content">Nuevo acceso para un socio</div>

      <select
        value={socioId}
        onChange={(e) => setSocioId(e.target.value)}
        className="w-full rounded-lg border border-color-base-content/15 px-3 py-2 text-sm bg-color-base-200"
      >
        <option value="">Elige el socio</option>
        {socios.map((s) => (
          <option key={s.id} value={s.id}>
            {s.nombre}
          </option>
        ))}
      </select>
      <input
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="Nombre"
        className="w-full rounded-lg border border-color-base-content/15 px-3 py-2 text-sm"
      />
      <input
        type="text"
        value={lastName}
        onChange={(e) => setLastName(e.target.value)}
        placeholder="Apellido"
        className="w-full rounded-lg border border-color-base-content/15 px-3 py-2 text-sm"
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Correo con el que va a entrar"
        className="w-full rounded-lg border border-color-base-content/15 px-3 py-2 text-sm"
      />
      <input
        type="text"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Clave temporal"
        className="w-full rounded-lg border border-color-base-content/15 px-3 py-2 text-sm"
      />

      {error ? <div className="text-xs text-red-600">{error}</div> : null}
      {mensaje ? <div className="text-xs text-color-primary">{mensaje}</div> : null}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCrear}
          disabled={guardando}
          className="px-4 py-2 rounded-full bg-color-primary text-white text-sm font-bold hover:brightness-110 disabled:opacity-50"
        >
          {guardando ? 'Creando...' : 'Crear acceso'}
        </button>
        <button
          type="button"
          onClick={() => setAbierto(false)}
          className="px-4 py-2 rounded-full bg-color-base-content/10 text-color-base-content/70 text-sm font-bold"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
