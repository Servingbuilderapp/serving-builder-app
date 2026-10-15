'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'

export type PostulacionAdmin = { id: string; correo: string; proyecto: string; convocatoria: string; comentario: string | null; estado: string; nota_equipo: string | null; fecha: string }
export type SesionAdmin = { id: string; titulo: string; fecha_hora: string; inscritos: number }
export type AcompAdmin = { id: string; correo: string; tema: string; estado: string; fecha_hora: string | null; enlace: string | null; nota_equipo: string | null }
export type MensajeAdmin = { id: string; nombre: string; texto: string }

const CAMPO = 'mt-1 w-full rounded-lg border border-white/10 bg-[#3B1727] px-2.5 py-1.5 text-[13px] text-[#F3E7DC]'
const BOTON = 'rounded-lg bg-[#C9A46B] px-3 py-1.5 text-[12.5px] font-bold text-[#3B1727] disabled:opacity-50'
const TARJETA = 'rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-4'

function aLocal(iso: string | null) {
  if (!iso) return ''
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

function useAccion() {
  const router = useRouter()
  const [cargando, setCargando] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const ejecutar = async (cuerpo: Record<string, unknown>) => {
    setCargando(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/servicios-membresia', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) })
      const datos = await res.json().catch(() => ({}))
      if (!res.ok) setError(datos.error || 'No se pudo guardar.')
      else router.refresh()
    } catch {
      setError('No se pudo guardar.')
    } finally {
      setCargando(false)
    }
  }
  return { cargando, error, ejecutar }
}

function FilaPostulacion({ p }: { p: PostulacionAdmin }) {
  const { cargando, error, ejecutar } = useAccion()
  const [estado, setEstado] = useState(p.estado)
  const [nota, setNota] = useState(p.nota_equipo || '')
  return (
    <div className={TARJETA}>
      <p className="text-[13.5px] font-extrabold text-[#F3E7DC]">{p.proyecto}</p>
      <p className="text-[12.5px] text-[#F3E7DC]/60">{p.correo} · {p.fecha}</p>
      <p className="mt-1 text-[13px] text-[#E0B868]">Quiere postular a: {p.convocatoria || 'sin dato'}</p>
      {p.comentario && <p className="text-[12.5px] text-[#F3E7DC]/70">Comentario: {p.comentario}</p>}
      <div className="mt-2 grid gap-2 sm:grid-cols-3">
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={CAMPO}>
          <option value="solicitada">Solicitada</option>
          <option value="en_revision">En revisión</option>
          <option value="postulada">Postulada</option>
          <option value="no_viable">No viable</option>
        </select>
        <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Mensaje para el cliente" className={`${CAMPO} sm:col-span-2`} />
      </div>
      {error && <p className="mt-1 text-[12.5px] text-[#E0917E]">{error}</p>}
      <button className={`${BOTON} mt-2`} disabled={cargando} onClick={() => ejecutar({ accion: 'estado_postulacion', id: p.id, estado, nota_equipo: nota })}>Guardar</button>
    </div>
  )
}

function FilaAcomp({ a }: { a: AcompAdmin }) {
  const { cargando, error, ejecutar } = useAccion()
  const [estado, setEstado] = useState(a.estado)
  const [fecha, setFecha] = useState(aLocal(a.fecha_hora))
  const [enlace, setEnlace] = useState(a.enlace || '')
  const [nota, setNota] = useState(a.nota_equipo || '')
  return (
    <div className={TARJETA}>
      <p className="text-[12.5px] text-[#F3E7DC]/60">{a.correo}</p>
      <p className="text-[13.5px] text-[#F3E7DC]">{a.tema}</p>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        <select value={estado} onChange={(e) => setEstado(e.target.value)} className={CAMPO}>
          <option value="pedida">Pedida</option>
          <option value="agendada">Agendada</option>
          <option value="realizada">Realizada</option>
        </select>
        <input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} className={CAMPO} />
        <input value={enlace} onChange={(e) => setEnlace(e.target.value)} placeholder="Enlace de la reunión" className={CAMPO} />
        <input value={nota} onChange={(e) => setNota(e.target.value)} placeholder="Mensaje para el cliente" className={CAMPO} />
      </div>
      {error && <p className="mt-1 text-[12.5px] text-[#E0917E]">{error}</p>}
      <button className={`${BOTON} mt-2`} disabled={cargando} onClick={() => ejecutar({ accion: 'agendar_acompanamiento', id: a.id, estado, fecha_hora: fecha, enlace, nota_equipo: nota })}>Guardar</button>
    </div>
  )
}

export function ServiciosMembresiaClient({ postulaciones, sesiones, acompanamientos, mensajes }: {
  postulaciones: PostulacionAdmin[]
  sesiones: SesionAdmin[]
  acompanamientos: AcompAdmin[]
  mensajes: MensajeAdmin[]
}) {
  const { cargando, error, ejecutar } = useAccion()
  const [titulo, setTitulo] = useState('')
  const [fecha, setFecha] = useState('')
  const [enlace, setEnlace] = useState('')
  const [descripcion, setDescripcion] = useState('')

  return (
    <div className="space-y-8">
      <section>
        <h2 className="mb-3 text-[15px] font-extrabold text-[#E0B868]">Postulaciones pedidas ({postulaciones.length})</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {postulaciones.length === 0 && <p className="text-[13px] text-[#F3E7DC]/55">Todavía no hay solicitudes.</p>}
          {postulaciones.map((p) => <FilaPostulacion key={p.id} p={p} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-extrabold text-[#E0B868]">Acompañamiento semanal ({acompanamientos.length})</h2>
        <div className="grid gap-3 lg:grid-cols-2">
          {acompanamientos.length === 0 && <p className="text-[13px] text-[#F3E7DC]/55">Todavía no hay pedidos.</p>}
          {acompanamientos.map((a) => <FilaAcomp key={a.id} a={a} />)}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-extrabold text-[#E0B868]">Sesiones grupales</h2>
        <div className={`${TARJETA} mb-3`}>
          <p className="text-[13px] font-bold text-[#F3E7DC]">Programar una sesión nueva</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Título" className={CAMPO} />
            <input type="datetime-local" value={fecha} onChange={(e) => setFecha(e.target.value)} className={CAMPO} />
            <input value={enlace} onChange={(e) => setEnlace(e.target.value)} placeholder="Enlace (Meet o Zoom)" className={CAMPO} />
            <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="De qué trata (opcional)" className={CAMPO} />
          </div>
          {error && <p className="mt-1 text-[12.5px] text-[#E0917E]">{error}</p>}
          <button
            className={`${BOTON} mt-2`}
            disabled={cargando || !titulo.trim() || !fecha}
            onClick={async () => {
              await ejecutar({ accion: 'crear_sesion', titulo, fecha_hora: fecha, enlace, descripcion })
              setTitulo(''); setFecha(''); setEnlace(''); setDescripcion('')
            }}
          >
            Programar
          </button>
        </div>
        <div className="space-y-2">
          {sesiones.map((s) => (
            <div key={s.id} className={`${TARJETA} flex items-center justify-between gap-3`}>
              <div>
                <p className="text-[13.5px] font-bold text-[#F3E7DC]">{s.titulo}</p>
                <p className="text-[12.5px] text-[#F3E7DC]/60">
                  {new Date(s.fecha_hora).toLocaleString('es-CO', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'America/Bogota' })} · {s.inscritos} inscritos
                </p>
              </div>
              <button className={BOTON} disabled={cargando} onClick={() => ejecutar({ accion: 'borrar_sesion', id: s.id })}>Quitar</button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-[15px] font-extrabold text-[#E0B868]">Comunidad: últimos mensajes</h2>
        <div className="space-y-2">
          {mensajes.length === 0 && <p className="text-[13px] text-[#F3E7DC]/55">Todavía no hay mensajes.</p>}
          {mensajes.map((m) => (
            <div key={m.id} className={`${TARJETA} flex items-start justify-between gap-3`}>
              <div>
                <p className="text-[12.5px] font-bold text-[#E0B868]">{m.nombre}</p>
                <p className="text-[13px] text-[#F3E7DC]/85">{m.texto}</p>
              </div>
              <button className={BOTON} disabled={cargando} onClick={() => ejecutar({ accion: 'borrar_mensaje', id: m.id })}>Borrar</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
