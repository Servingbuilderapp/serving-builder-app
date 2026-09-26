'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

/**
 * Pantalla del socio de marca blanca para poner su propio logo y su propio
 * color. Es lo ÚNICO que el socio cambia por sí mismo — los precios los
 * define Serving desde /admin/marca-blanca, nunca el socio (ver la decisión
 * ya cerrada sobre Marca Blanca).
 *
 * El logo se sube al bucket público "avatars" (el mismo que ya usa el
 * resto de la plataforma para fotos e imágenes de marca), en una carpeta
 * propia del usuario que subió el archivo — así funciona con el mismo
 * permiso que ya está probado, sin pedir uno nuevo.
 */

const BUCKET = 'avatars'
const TIPOS_PERMITIDOS = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml']
const TAMANO_MAXIMO = 1024 * 1024 // 1MB

export function EditarMarcaSocio({
  logoUrlInicial,
  colorInicial,
}: {
  logoUrlInicial: string | null
  colorInicial: string | null
}) {
  const supabase = createClient()
  const [logoUrl, setLogoUrl] = useState<string | null>(logoUrlInicial)
  const [color, setColor] = useState<string>(colorInicial || '#1D4ED8')
  const [subiendo, setSubiendo] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState<{ tipo: 'ok' | 'error'; texto: string } | null>(null)

  const guardar = async (cambios: { logoUrl?: string | null; colorPrimario?: string | null }) => {
    setGuardando(true)
    setMensaje(null)
    try {
      const res = await fetch('/api/socio/actualizar-marca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cambios),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'No se pudo guardar')
      setMensaje({ tipo: 'ok', texto: 'Guardado.' })
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e instanceof Error ? e.message : 'Hubo un problema, intenta de nuevo' })
    } finally {
      setGuardando(false)
    }
  }

  const handleSubirLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    e.target.value = ''

    if (!TIPOS_PERMITIDOS.includes(archivo.type)) {
      setMensaje({ tipo: 'error', texto: 'Formato inválido. Usa PNG, JPG, WEBP o SVG.' })
      return
    }
    if (archivo.size > TAMANO_MAXIMO) {
      setMensaje({ tipo: 'error', texto: 'El archivo pesa más de 1MB. Usa uno más liviano.' })
      return
    }

    setSubiendo(true)
    setMensaje(null)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('No se pudo confirmar tu sesión, vuelve a entrar.')

      const extension = archivo.name.split('.').pop() || 'png'
      const ruta = `${user.id}/marca-socio-${Date.now()}.${extension}`

      const { error: errorSubida } = await supabase.storage.from(BUCKET).upload(ruta, archivo, { upsert: true })
      if (errorSubida) throw errorSubida

      const {
        data: { publicUrl },
      } = supabase.storage.from(BUCKET).getPublicUrl(ruta)

      setLogoUrl(publicUrl)
      await guardar({ logoUrl: publicUrl })
    } catch (e) {
      setMensaje({ tipo: 'error', texto: e instanceof Error ? e.message : 'No se pudo subir el logo' })
    } finally {
      setSubiendo(false)
    }
  }

  const handleQuitarLogo = async () => {
    setLogoUrl(null)
    await guardar({ logoUrl: null })
  }

  const handleGuardarColor = async () => {
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) {
      setMensaje({ tipo: 'error', texto: 'Escribe el color como un código de 6 letras/números, ej. #1D4ED8' })
      return
    }
    await guardar({ colorPrimario: color })
  }

  return (
    <div className="rounded-2xl border border-color-base-content/10 p-5 space-y-5">
      <div>
        <h2 className="text-sm font-bold text-color-base-content">Tu marca</h2>
        <p className="text-xs text-color-base-content/55 mt-1">
          Así se ve tu portal frente a tus clientes: tu logo y tu color, no el de Serving. Esto no cambia nada más
          de tu plataforma.
        </p>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-color-base-content/10 bg-color-base-100">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt="Tu logo" className="h-full w-full object-contain" />
          ) : (
            <span className="text-[10px] text-color-base-content/40 text-center px-1">Sin logo</span>
          )}
        </div>
        <div className="space-y-2">
          <label className="inline-block cursor-pointer rounded-full bg-color-primary px-4 py-2 text-xs font-bold text-white hover:brightness-110">
            {subiendo ? 'Subiendo…' : logoUrl ? 'Cambiar logo' : 'Subir logo'}
            <input type="file" accept={TIPOS_PERMITIDOS.join(',')} className="hidden" onChange={handleSubirLogo} disabled={subiendo} />
          </label>
          {logoUrl ? (
            <button
              type="button"
              onClick={handleQuitarLogo}
              className="block text-xs text-color-base-content/50 underline hover:text-color-base-content/70"
            >
              Quitar logo
            </button>
          ) : null}
          <p className="text-[11px] text-color-base-content/45">PNG, JPG, WEBP o SVG. Máximo 1MB.</p>
        </div>
      </div>

      <div>
        <label className="text-xs font-bold text-color-base-content block mb-1.5">Tu color</label>
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : '#1D4ED8'}
            onChange={(e) => setColor(e.target.value)}
            className="h-9 w-9 rounded-lg border border-color-base-content/10 cursor-pointer"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="#1D4ED8"
            className="w-28 rounded-lg border border-color-base-content/15 px-2.5 py-1.5 text-xs"
          />
          <button
            type="button"
            onClick={handleGuardarColor}
            disabled={guardando}
            className="rounded-full bg-color-primary px-4 py-1.5 text-xs font-bold text-white hover:brightness-110 disabled:opacity-50"
          >
            Guardar color
          </button>
        </div>
      </div>

      {mensaje ? (
        <p className={`text-xs ${mensaje.tipo === 'ok' ? 'text-[#186A46]' : 'text-[#9B2C2C]'}`}>{mensaje.texto}</p>
      ) : null}
    </div>
  )
}
