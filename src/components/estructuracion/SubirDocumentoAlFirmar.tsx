'use client'

import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle2, FileText, Loader2 } from 'lucide-react'

/**
 * Las 7 cosas que el motor necesita sí o sí. Se muestran ANTES de subir el
 * documento para que el cliente sepa qué tener a la mano y no se quede parado
 * cuando el sistema le pregunte. Si algo no lo tiene, no pasa nada: al subir el
 * documento el sistema le propone una respuesta sugerida y él solo confirma.
 */
const LAS_SIETE = [
  { titulo: 'El problema central', ejemplo: 'Qué situación quieres resolver. Ej.: "Los pequeños productores no tienen cómo vender sin intermediarios".' },
  { titulo: 'Las causas del problema (árbol del problema)', ejemplo: 'Por qué pasa y qué consecuencias trae. Con 3 causas y 3 consecuencias basta.' },
  { titulo: 'A quién le pasa (población)', ejemplo: 'Quiénes son, cuántos aproximadamente y dónde viven o trabajan.' },
  { titulo: 'Para quién es el proyecto (población objetivo)', ejemplo: 'De todas esas personas, a cuántas piensas llegar con este proyecto.' },
  { titulo: 'El objetivo general', ejemplo: 'Lo que quieres lograr, en una sola frase que empiece con un verbo. Ej.: "Aumentar las ventas de 50 productores".' },
  { titulo: 'Tu solución', ejemplo: 'Qué vas a hacer para resolver el problema, en pocas palabras.' },
  { titulo: 'El presupuesto', ejemplo: 'Cuánto dinero necesitas, aunque sea aproximado, y en qué lo gastarías.' },
]

interface Props {
  proyectoId: string
  correo: string
  /** Solo viene si la cuenta se acaba de crear; con ella entramos solos. */
  passwordTemporal: string | null
  /** Texto de lo que pasa después, según el plan (pago, aval, etc.). */
  cuandoArranca: string
}

export function SubirDocumentoAlFirmar({ proyectoId, correo, passwordTemporal, cuandoArranca }: Props) {
  const [sesion, setSesion] = useState<'revisando' | 'lista' | 'sin-sesion'>('revisando')
  const [cargando, setCargando] = useState(false)
  const [subido, setSubido] = useState<string | null>(null)
  const [error, setError] = useState('')

  // Entramos con la contraseña temporal para que el cliente pueda subir sin pasos extra.
  useEffect(() => {
    let vivo = true
    ;(async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase.auth.getUser()
        if (data.user) {
          if (vivo) setSesion('lista')
          return
        }
        if (passwordTemporal) {
          const { error: errorEntrada } = await supabase.auth.signInWithPassword({ email: correo, password: passwordTemporal })
          if (vivo) setSesion(errorEntrada ? 'sin-sesion' : 'lista')
          return
        }
        if (vivo) setSesion('sin-sesion')
      } catch {
        if (vivo) setSesion('sin-sesion')
      }
    })()
    return () => {
      vivo = false
    }
  }, [correo, passwordTemporal])

  const subir = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const archivo = e.target.files?.[0]
    if (!archivo) return
    setCargando(true)
    setError('')
    try {
      const supabase = createClient()
      // El almacenamiento rechaza tildes, ñ y símbolos raros en el nombre ("Invalid key").
      const nombreSeguro = archivo.name
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-zA-Z0-9._-]+/g, '_')
      const ruta = `${proyectoId}/${Date.now()}-${nombreSeguro}`
      const { error: errorSubida } = await supabase.storage.from('documentos-proyectos').upload(ruta, archivo)
      if (errorSubida) throw errorSubida
      const { data: url, error: errorUrl } = await supabase.storage
        .from('documentos-proyectos')
        .createSignedUrl(ruta, 60 * 60 * 24 * 365)
      if (errorUrl) throw errorUrl
      const { error: errorGuardar } = await supabase
        .from('proyectos_clientes_serving')
        .update({ archivo_proyecto_url: url.signedUrl, archivo_proyecto_nombre: archivo.name })
        .eq('id', proyectoId)
      if (errorGuardar) throw errorGuardar
      // El motor NO se enciende aquí: arranca solo cuando se confirma el pago o el aval.
      setSubido(archivo.name)
    } catch (err) {
      const mensaje = (err as { message?: string } | null)?.message || ''
      setError(mensaje || 'No se pudo subir el archivo. Intenta de nuevo.')
    } finally {
      setCargando(false)
    }
  }

  return (
    <div className="text-left p-6 rounded-2xl bg-white border-2 border-color-primary/30 space-y-5">
      <div className="space-y-1">
        <p className="text-xs font-black uppercase tracking-widest text-color-primary">Último paso para activar tu programa</p>
        <h3 className="text-lg font-black text-[#1f1f1f]">Sube el documento de tu proyecto</h3>
        <p className="text-sm text-[#1f1f1f]/75 leading-relaxed">
          Puede ser tu idea, un borrador o un proyecto ya escrito (PDF o Word). Con eso empezamos a trabajar.
          {' '}{cuandoArranca}
        </p>
      </div>

      <div className="rounded-xl bg-color-primary/5 border border-color-primary/20 p-4 space-y-3">
        <p className="text-sm font-black text-[#1f1f1f]">Ten a la mano estas 7 cosas</p>
        <ol className="space-y-2 list-decimal pl-5">
          {LAS_SIETE.map((item) => (
            <li key={item.titulo} className="text-xs text-[#1f1f1f]">
              <strong>{item.titulo}.</strong> <span className="text-[#1f1f1f]/70">{item.ejemplo}</span>
            </li>
          ))}
        </ol>
        <p className="text-xs font-bold text-[#1f1f1f]">
          Si alguna no la tienes, no te preocupes: al subir tu documento te proponemos una respuesta para cada una
          y tú solo confirmas o corriges.
        </p>
      </div>

      {subido ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-300">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
          <span className="text-sm font-bold text-emerald-800">Recibimos tu documento: {subido}</span>
        </div>
      ) : sesion === 'sin-sesion' ? (
        <p className="text-sm text-[#1f1f1f]">
          Para subir tu documento, primero{' '}
          <a href="/login" className="text-color-primary underline font-bold">inicia sesión</a>{' '}
          con tu cuenta y lo subes desde tu panel, en «Lo que me piden».
        </p>
      ) : (
        <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-color-primary/50 bg-color-primary/5 cursor-pointer hover:bg-color-primary/10 transition-colors">
          {cargando || sesion === 'revisando' ? (
            <Loader2 className="h-5 w-5 animate-spin text-color-primary" />
          ) : (
            <FileText className="h-5 w-5 text-color-primary" />
          )}
          <span className="text-sm font-bold text-[#1f1f1f]">
            {cargando ? 'Subiendo...' : 'Haz clic para subir tu documento (PDF o Word)'}
          </span>
          <input type="file" accept=".pdf,.doc,.docx" onChange={subir} disabled={cargando || sesion !== 'lista'} className="hidden" />
        </label>
      )}
      {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
    </div>
  )
}
