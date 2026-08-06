'use client'

import React, { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, FileText, CheckCircle2 } from 'lucide-react'

interface Props {
  proyectoId: string
  archivoActualNombre: string | null
  archivoActualUrl: string | null
}

export function SubirDocumentoProyecto({ proyectoId, archivoActualNombre, archivoActualUrl }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const path = `${proyectoId}/${Date.now()}-${file.name}`

      const { error: uploadError } = await supabase.storage
        .from('documentos-proyectos')
        .upload(path, file)

      if (uploadError) throw uploadError

      const { data: urlData, error: urlError } = await supabase.storage
        .from('documentos-proyectos')
        .createSignedUrl(path, 60 * 60 * 24 * 365) // enlace válido por 1 año

      if (urlError) throw urlError

      const { error: updateError } = await supabase
        .from('proyectos_clientes_serving')
        .update({
          archivo_proyecto_url: urlData.signedUrl,
          archivo_proyecto_nombre: file.name,
        })
        .eq('id', proyectoId)

      if (updateError) throw updateError

      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Hubo un problema al subir el archivo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      {archivoActualNombre && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-white border border-emerald-200">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <span className="text-sm font-bold text-color-base-content">{archivoActualNombre}</span>
          {archivoActualUrl && (
            <a href={archivoActualUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-color-primary underline ml-auto">
              Ver
            </a>
          )}
        </div>
      )}

      <label className="flex items-center gap-3 p-4 rounded-xl border-2 border-dashed border-emerald-300 bg-white cursor-pointer hover:bg-emerald-50 transition-colors">
        {loading ? <Loader2 className="h-5 w-5 animate-spin text-emerald-600" /> : <FileText className="h-5 w-5 text-emerald-600" />}
        <span className="text-sm font-bold text-color-base-content">
          {loading ? 'Subiendo...' : archivoActualNombre ? 'Subir otro documento (reemplazar)' : 'Haz clic para subir tu documento (PDF o Word)'}
        </span>
        <input
          type="file"
          accept=".pdf,.doc,.docx"
          onChange={handleUpload}
          disabled={loading}
          className="hidden"
        />
      </label>

      {error && <p className="text-xs text-red-500 font-bold">{error}</p>}
    </div>
  )
}
