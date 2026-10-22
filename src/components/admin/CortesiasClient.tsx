'use client'

import { SITIO_PUBLICO } from '@/lib/sitio'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { diasRestantes, type Cortesia } from '@/lib/cortesias'

const SOMBRA = 'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'
const campo = 'mt-1 w-full rounded-xl border border-white/10 bg-[#3B1727] px-3 py-2 text-[13.5px] text-[#F3E7DC]'
const etiqueta = 'text-[12px] font-bold text-[#F3E7DC]/70'

function fecha(f: string | null) {
  return f ? new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'
}

const ESTADOS = ['invitada', 'activa', 'ganada', 'cerrada']

export function CortesiasClient({
  cortesias,
  conteoPorOrigen,
  cupo,
}: {
  cortesias: Cortesia[]
  conteoPorOrigen: { origen: string; n: number }[]
  cupo: number
}) {
  const router = useRouter()
  const [enviando, setEnviando] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [entrega, setEntrega] = useState<{ correo: string; nombre: string; password: string | null } | null>(null)
  const [f, setF] = useState({ nombre: '', correo: '', whatsapp: '', iniciativa: '', origen: '', dias: '15', comisionPct: '15', iniciarYa: false })

  async function llamar(cuerpo: Record<string, unknown>) {
    const res = await fetch('/api/admin/cortesias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) })
    const datos = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(datos?.error || 'No se pudo completar.')
    return datos
  }

  async function crear(e: React.FormEvent) {
    e.preventDefault()
    setEnviando(true)
    setMensaje('')
    setEntrega(null)
    try {
      const datos = await llamar({ accion: 'crear', ...f })
      setEntrega({ correo: f.correo.trim().toLowerCase(), nombre: f.nombre, password: datos.password || null })
      setF({ ...f, nombre: '', correo: '', whatsapp: '', iniciativa: '' })
      router.refresh()
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo crear.')
    } finally {
      setEnviando(false)
    }
  }

  async function accion(cuerpo: Record<string, unknown>) {
    try {
      await llamar(cuerpo)
      router.refresh()
    } catch (err) {
      setMensaje(err instanceof Error ? err.message : 'No se pudo completar.')
    }
  }

  const enlace = SITIO_PUBLICO + '/login'
  const textoWhatsapp = entrega
    ? `Hola ${entrega.nombre.split(' ')[0]}, te invitamos a estructurar tu proyecto con Serving sin costo. Entra aquí: ${enlace}\nCorreo: ${entrega.correo}\n${entrega.password ? 'Clave temporal: ' + entrega.password : 'Entra con la clave que ya tienes (si no la recuerdas, usa "Olvidé mi contraseña").'}\nAl entrar lee y acepta las condiciones.`
    : ''

  return (
    <div className="space-y-6">
      {conteoPorOrigen.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {conteoPorOrigen.map((o) => (
            <span key={o.origen} className="rounded-full border border-[#B08D57]/40 bg-[#4C2032] px-3 py-1 text-[12.5px] font-semibold text-[#F3E7DC]">
              {o.origen}: {o.n} de {cupo}
            </span>
          ))}
        </div>
      )}

      <form onSubmit={crear} className={`grid gap-3 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-4 sm:grid-cols-2 lg:grid-cols-4 ${SOMBRA}`}>
        <h2 className="sm:col-span-2 lg:col-span-4 text-[15px] font-extrabold text-[#F3E7DC]">Invitar a una persona</h2>
        <div><label className={etiqueta}>Nombre</label><input required value={f.nombre} onChange={(e) => setF({ ...f, nombre: e.target.value })} className={campo} /></div>
        <div><label className={etiqueta}>Correo</label><input required type="email" value={f.correo} onChange={(e) => setF({ ...f, correo: e.target.value })} className={campo} /></div>
        <div><label className={etiqueta}>WhatsApp</label><input value={f.whatsapp} onChange={(e) => setF({ ...f, whatsapp: e.target.value })} className={campo} /></div>
        <div><label className={etiqueta}>Nombre del proyecto (opcional)</label><input value={f.iniciativa} onChange={(e) => setF({ ...f, iniciativa: e.target.value })} className={campo} /></div>
        <div><label className={etiqueta}>De dónde viene (Coomeva, Parque Soft…)</label><input value={f.origen} onChange={(e) => setF({ ...f, origen: e.target.value })} className={campo} /></div>
        <div><label className={etiqueta}>Días</label><input type="number" min={1} max={366} value={f.dias} onChange={(e) => setF({ ...f, dias: e.target.value })} className={campo} /></div>
        <div><label className={etiqueta}>Comisión de éxito (%)</label><input type="number" min={1} max={50} value={f.comisionPct} onChange={(e) => setF({ ...f, comisionPct: e.target.value })} className={campo} /></div>
        <label className="flex items-end gap-2 pb-2 text-[13px] text-[#F3E7DC]/85">
          <input type="checkbox" checked={f.iniciarYa} onChange={(e) => setF({ ...f, iniciarYa: e.target.checked })} className="h-4 w-4 accent-[#C9A46B]" />
          Ya subió su proyecto: contar los días desde hoy
        </label>
        <div className="sm:col-span-2 lg:col-span-4 flex items-center gap-3">
          <button type="submit" disabled={enviando} className="rounded-xl bg-[#C9A46B] px-5 py-2.5 text-[14px] font-bold text-[#3B1727] disabled:opacity-60">
            {enviando ? 'Creando…' : 'Crear invitación'}
          </button>
          {mensaje && <span className="text-[13px] font-semibold text-[#F0A8A8]">{mensaje}</span>}
        </div>
      </form>

      {entrega && (
        <div className={`rounded-2xl border border-[#C9A46B]/50 bg-[#3B1727] p-4 ${SOMBRA}`}>
          <p className="text-[14px] font-extrabold text-[#E0B868]">Copia este mensaje y mándalo por WhatsApp:</p>
          <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-black/25 p-3 text-[13px] text-[#F3E7DC]">{textoWhatsapp}</pre>
          <p className="mt-2 text-[12px] text-[#F3E7DC]/55">La clave solo se muestra ahora. Si se pierde, usa el botón “Ver mensaje (clave nueva)” de la lista.</p>
        </div>
      )}

      <div className={`overflow-x-auto rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] ${SOMBRA}`}>
        <table className="w-full text-left text-[13px] text-[#F3E7DC]">
          <thead className="text-[11px] uppercase tracking-wider text-[#F3E7DC]/50">
            <tr>
              <th className="p-3">Persona</th><th className="p-3">Origen</th><th className="p-3">Aceptó</th><th className="p-3">Días</th><th className="p-3">%</th><th className="p-3">Estado</th><th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {cortesias.length === 0 && (
              <tr><td colSpan={7} className="p-4 text-[#F3E7DC]/55">Todavía no hay cortesías.</td></tr>
            )}
            {cortesias.map((c) => {
              const restan = diasRestantes(c.vence_en)
              return (
                <tr key={c.id} className="border-t border-white/10 align-top">
                  <td className="p-3"><div className="font-bold">{c.nombre}</div><div className="text-[12px] text-[#F3E7DC]/55">{c.correo}</div></td>
                  <td className="p-3">{c.origen || '—'}</td>
                  <td className="p-3">{c.acepto_en ? fecha(c.acepto_en) : 'Falta'}</td>
                  <td className="p-3">
                    {c.inicia_en ? (restan === 0 ? <span className="font-bold text-[#F0A8A8]">Vencida ({fecha(c.vence_en)})</span> : `${restan} restantes · vence ${fecha(c.vence_en)}`) : `Sin iniciar (${c.dias})`}
                  </td>
                  <td className="p-3">{c.comision_pct}</td>
                  <td className="p-3">
                    <select value={c.estado} onChange={(e) => accion({ accion: 'estado', id: c.id, estado: e.target.value })} className="rounded-lg border border-white/10 bg-[#3B1727] px-2 py-1 text-[12.5px]">
                      {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
                    </select>
                  </td>
                  <td className="p-3 space-x-1 whitespace-nowrap">
                    {!c.acepto_en && (
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            const d = await llamar({ accion: 'nueva_clave', id: c.id })
                            setMensaje('')
                            setEntrega({ correo: d.correo, nombre: d.nombre || c.nombre || '', password: d.password })
                            window.scrollTo({ top: 0, behavior: 'smooth' })
                          } catch (err) {
                            setMensaje(err instanceof Error ? err.message : 'No se pudo generar la clave.')
                          }
                        }}
                        className="rounded-lg border border-[#C9A46B]/60 px-2.5 py-1 text-[12px] font-bold text-[#E0B868]"
                      >
                        Ver mensaje (clave nueva)
                      </button>
                    )}
                    {!c.inicia_en && <button type="button" onClick={() => accion({ accion: 'iniciar', id: c.id })} className="rounded-lg bg-[#C9A46B] px-2.5 py-1 text-[12px] font-bold text-[#3B1727]">Contar desde hoy</button>}
                    <button type="button" onClick={() => accion({ accion: 'extender', id: c.id, dias: 7 })} className="rounded-lg border border-[#C9A46B]/60 px-2.5 py-1 text-[12px] font-bold text-[#E0B868]">+7 días</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
