import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type Fila = {
  creado_en: string
  proceso: string
  estado: string
  leidos: number | null
  nuevas: number | null
  errores: number | null
  mensaje: string | null
}

type Dia = {
  alertas: number
  boletines: number
  fuentes: number
  enlaces: number
  terminos: number
  nuevas: number
  errores: number
  corridas: Record<string, number>
}

const PROCESOS: { clave: keyof Omit<Dia, 'nuevas' | 'errores' | 'corridas'>; titulo: string }[] = [
  { clave: 'alertas', titulo: 'Correos de alerta leídos' },
  { clave: 'boletines', titulo: 'Boletines leídos' },
  { clave: 'fuentes', titulo: 'Fuentes revisadas' },
  { clave: 'enlaces', titulo: 'Enlaces leídos' },
  { clave: 'terminos', titulo: 'Términos bajados' },
]

function hace14Dias(): string {
  return new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
}

function diaColombia(iso: string): string {
  return new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Bogota' })
}

/**
 * SALUD DEL CENTINELA — pantalla del equipo.
 * Muestra, día por día, qué leyó cada proceso automático del Centinela.
 */
export default async function SaludCentinelaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const correo = (user.email || '').toLowerCase().trim()
  let esEquipo = correo === 'servingbuilderapp@gmail.com'
  if (!esEquipo) {
    const { data: perfil } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle<{ role: string | null }>()
    esEquipo = perfil?.role === 'admin'
  }
  if (!esEquipo) redirect('/dashboard')

  const desde = hace14Dias()
  const { data, error } = await supabaseAdmin
    .from('centinela_registro')
    .select('creado_en, proceso, estado, leidos, nuevas, errores, mensaje')
    .gte('creado_en', desde)
    .order('creado_en', { ascending: false })
    .limit(2000)

  const filas = (data || []) as Fila[]
  const dias = new Map<string, Dia>()
  for (const f of filas) {
    const d = diaColombia(f.creado_en)
    if (!dias.has(d)) dias.set(d, { alertas: 0, boletines: 0, fuentes: 0, enlaces: 0, terminos: 0, nuevas: 0, errores: 0, corridas: {} })
    const dia = dias.get(d)!
    if (f.proceso in dia) (dia as unknown as Record<string, number>)[f.proceso] += f.leidos || 0
    dia.nuevas += f.nuevas || 0
    dia.errores += f.errores || 0
    dia.corridas[f.proceso] = (dia.corridas[f.proceso] || 0) + 1
  }
  const listaDias = Array.from(dias.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1))

  const ultimos = new Map<string, Fila>()
  for (const f of filas) if (!ultimos.has(f.proceso)) ultimos.set(f.proceso, f)
  const fallos = filas.filter((f) => f.estado === 'error' && f.mensaje).slice(0, 8)

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/centinela" className="text-xs font-bold text-[#7A5A2B] underline">
          ← Volver al Centinela
        </Link>
        <h1 className="mt-2 text-2xl font-black text-[#3B1727]">Salud del Centinela</h1>
        <p className="mt-1 text-sm text-[#3B1727]/70">
          Qué leyó cada proceso automático en los últimos 14 días. Las horas y los días son de Colombia.
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-[#C0604A]/50 bg-[#C0604A]/10 p-4 text-sm text-[#7A2E1E]">
          No se pudo leer el registro: {error.message}. Si es la primera vez, falta pegar el SQL de <code>centinela_registro</code> en Supabase.
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {PROCESOS.map((p) => {
          const u = ultimos.get(p.clave)
          return (
            <div key={p.clave} className="rounded-xl border border-[#B08D57]/40 bg-white p-3 shadow-sm">
              <div className="text-xs font-bold uppercase tracking-wide text-[#7A5A2B]">{p.titulo}</div>
              {u ? (
                <div className="mt-1 text-sm text-[#3B1727]">
                  Última corrida:{' '}
                  <strong>
                    {new Date(u.creado_en).toLocaleString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </strong>
                  <div className={u.estado === 'ok' ? 'text-[#2E6B3F]' : 'font-bold text-[#B03A24]'}>
                    {u.estado === 'ok' ? 'Funcionó' : 'Falló'}
                  </div>
                </div>
              ) : (
                <div className="mt-1 text-sm font-bold text-[#B03A24]">Sin corridas en 14 días</div>
              )}
            </div>
          )
        })}
      </div>

      <div className="overflow-x-auto rounded-xl border border-[#B08D57]/40 bg-white shadow-sm">
        <table className="w-full text-left text-sm text-[#3B1727]">
          <thead className="bg-[#F3E7DC] text-xs uppercase tracking-wide text-[#7A5A2B]">
            <tr>
              <th className="px-3 py-2">Día</th>
              {PROCESOS.map((p) => (
                <th key={p.clave} className="px-3 py-2">{p.titulo}</th>
              ))}
              <th className="px-3 py-2">Convocatorias nuevas</th>
              <th className="px-3 py-2">Errores</th>
            </tr>
          </thead>
          <tbody>
            {listaDias.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-3 py-4 text-[#3B1727]/60">
                  Todavía no hay corridas anotadas. Aparecen desde la próxima ejecución automática.
                </td>
              </tr>
            ) : (
              listaDias.map(([d, v]) => (
                <tr key={d} className="border-t border-[#B08D57]/20">
                  <td className="px-3 py-2 font-bold">{d}</td>
                  {PROCESOS.map((p) => (
                    <td key={p.clave} className={'px-3 py-2 ' + (v.corridas[p.clave] ? '' : 'font-bold text-[#B03A24]')}>
                      {v.corridas[p.clave] ? v[p.clave] : 'no corrió'}
                    </td>
                  ))}
                  <td className="px-3 py-2">{v.nuevas}</td>
                  <td className={'px-3 py-2 ' + (v.errores ? 'font-bold text-[#B03A24]' : '')}>{v.errores}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {fallos.length > 0 ? (
        <div className="rounded-xl border border-[#C0604A]/50 bg-[#C0604A]/10 p-4 text-sm text-[#7A2E1E]">
          <div className="font-bold">Últimos errores</div>
          <ul className="mt-1 list-disc pl-5 text-xs">
            {fallos.map((f, i) => (
              <li key={i}>
                {new Date(f.creado_en).toLocaleString('es-CO', { timeZone: 'America/Bogota', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })} · {f.proceso}: {f.mensaje}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
