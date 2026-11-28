import React from 'react'
import { leerDeclaracion, CLAVE_ARCHIVO_NOMBRE } from '@/lib/miProyectoListo'
import type { RespuestasProyecto } from '@/lib/miProyectoPasos'

/** Muestra el archivo que el miembro trajo ya hecho y la constancia de que es suyo. */
export function BloqueProyectoTraido({ respuestas, urlArchivo }: { respuestas: RespuestasProyecto; urlArchivo: string | null }) {
  const d = leerDeclaracion(respuestas)
  const nombre = respuestas[CLAVE_ARCHIVO_NOMBRE] || 'Proyecto'
  return (
    <div className="space-y-4 rounded-2xl border border-[#B08D57]/35 bg-[#1E5A7A] p-5 text-[13.5px] text-[#F3E7DC]/85">
      <div>
        <h2 className="text-[15px] font-extrabold text-[#E0B868]">Proyecto que trajiste ya hecho</h2>
        <p className="mt-1">Archivo: {nombre}</p>
        {urlArchivo ? (
          <a href={urlArchivo} target="_blank" rel="noreferrer" className="mt-2 inline-block rounded-xl bg-[#C9A46B] px-4 py-2 text-[13px] font-bold text-[#153F55]">
            Abrir el archivo
          </a>
        ) : (
          <p className="mt-1 text-[#E0917E]">No se pudo generar el enlace del archivo. Recarga la página.</p>
        )}
      </div>
      {d && (
        <div className="rounded-xl border border-[#9BB18D]/40 bg-[#153F55] p-4">
          <h3 className="font-extrabold text-[#9BB18D]">Constancia de autoría</h3>
          <p className="mt-2 text-[12.5px] leading-relaxed text-[#F3E7DC]/75">{d.texto}</p>
          <dl className="mt-3 grid gap-x-4 gap-y-1 text-[12.5px] sm:grid-cols-[auto,1fr]">
            <dt className="font-bold text-[#F3E7DC]/60">Firmó</dt>
            <dd>{d.declarante} ({d.correo})</dd>
            <dt className="font-bold text-[#F3E7DC]/60">Fecha y hora</dt>
            <dd>{new Date(d.aceptada_en).toLocaleString('es-CO', { dateStyle: 'long', timeStyle: 'short', timeZone: 'America/Bogota' })}</dd>
            <dt className="font-bold text-[#F3E7DC]/60">Conexión</dt>
            <dd>{d.ip}</dd>
            <dt className="font-bold text-[#F3E7DC]/60">Archivo firmado</dt>
            <dd>{d.archivo_nombre} · {(d.archivo_bytes / 1024 / 1024).toFixed(2)} MB</dd>
            <dt className="font-bold text-[#F3E7DC]/60">Huella digital (SHA-256)</dt>
            <dd className="break-all font-mono text-[11.5px]">{d.archivo_huella_sha256}</dd>
          </dl>
          <p className="mt-2 text-[11.5px] text-[#F3E7DC]/45">La huella identifica este archivo exacto: si se cambia una sola letra, la huella cambia.</p>
        </div>
      )}
    </div>
  )
}
