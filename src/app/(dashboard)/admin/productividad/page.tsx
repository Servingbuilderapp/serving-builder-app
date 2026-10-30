import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { ultimoMovimientoPorProyecto } from '@/lib/actividadProyectos'
import { calcularSiguientePaso } from '@/lib/siguientePaso'
import type { ProyectoVisto } from '@/lib/proyectoVisto'
import { Eye } from 'lucide-react'

export const dynamic = 'force-dynamic'
export const maxDuration = 60

/**
 * TABLERO DE PRODUCTIVIDAD — dónde se está frenando el trabajo y por qué.
 *
 * Mide cuatro cosas, todas calculadas solas con las fechas que ya guarda la plataforma:
 *   1. Cuántos proyectos hay hoy en cada paso (para ver dónde se acumulan).
 *   2. Cuántos días lleva cada proyecto en su paso actual.
 *   3. Tiempo promedio que tarda un proyecto en cada paso.
 *   4. Cuántos proyectos terminan la estructuración cada semana.
 *
 * Y para los proyectos demorados dice QUIÉN los frena: el cliente (le falta responder o subir
 * algo) o la plataforma (no debería tardar más de una hora).
 */

const DIA_MS = 86400000
const HORA_MS = 3600000
const DIAS_AMARILLO = 3 // desde aquí se pone en amarillo
const DIAS_ROJO = 7 // desde aquí se pone en rojo
const HORAS_PLATAFORMA = 1 // si la frena la plataforma, más de esto ya es un problema
const MAX_CON_RAZON = 40 // a cuántos proyectos demorados se les calcula el "por qué" (cuida el gasto)
const SEMANAS = 8

// Proyectos que todavía no arrancan: no cuentan como trabajo en marcha.
const SIN_ARRANCAR = ['pendiente_pago', 'pendiente_aval', 'aval_rechazado', 'cortesia_pendiente']
const CORREOS_DEL_EQUIPO = ['servingbuilderapp@gmail.com', 'iagif1964@gmail.com']

function normalizarCorreo(correo: string | null | undefined): string {
  const [usuario = '', dominio = ''] = String(correo || '').toLowerCase().trim().split('@')
  return `${dominio === 'gmail.com' ? usuario.replace(/\./g, '') : usuario}@${dominio}`
}
const esPrueba = (correo: string | null | undefined) =>
  CORREOS_DEL_EQUIPO.map(normalizarCorreo).includes(normalizarCorreo(correo))

type Proyecto = {
  id: string
  nombre_cliente: string | null
  correo_cliente: string | null
  telefono_whatsapp: string | null
  nombre_iniciativa: string | null
  estado_actual: string | null
  created_at: string | null
}
type Paso = { id: string | number; nombre_paso: string | null; orden_secuencia: number | null }
type Avance = { proyecto_id: string; paso_id: string | number; completado: boolean | null; fecha_completado: string | null }

type Fila = {
  proyecto: Proyecto
  pasoIndex: number // índice del paso actual
  dias: number
  semaforo: 'verde' | 'amarillo' | 'rojo'
  razon: { quien: 'cliente' | 'plataforma'; texto: string; accion: string | null } | null
  horasSinMovimiento: number | null
}

function inicioDeSemana(d: Date): Date {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()))
  const dia = (x.getUTCDay() + 6) % 7 // lunes = 0
  x.setUTCDate(x.getUTCDate() - dia)
  return x
}

function formatoDias(n: number): string {
  if (n < 1) return 'menos de 1 día'
  return n === 1 ? '1 día' : `${Math.round(n * 10) / 10} días`
}

const COLOR = {
  verde: 'bg-[#7A8B6F]/20 text-[#9BB18D]',
  amarillo: 'bg-[#C99A3D]/20 text-[#E0B868]',
  rojo: 'bg-[#E0917E]/20 text-[#E0917E]',
}

export default async function ProductividadPage() {
  if (!(await esEquipoServing())) redirect('/dashboard')
  const db = supabaseAdmin

  const { data: filasProyectos } = await db
    .from('proyectos_clientes_serving')
    .select('id, nombre_cliente, correo_cliente, telefono_whatsapp, nombre_iniciativa, estado_actual, created_at')
    .order('created_at', { ascending: false })
    .limit(2000)

  const proyectos = ((filasProyectos || []) as Proyecto[]).filter(
    (p) => !esPrueba(p.correo_cliente) && !SIN_ARRANCAR.includes(String(p.estado_actual || '')),
  )
  const ids = proyectos.map((p) => String(p.id))

  const { data: filasPasos } = await db
    .from('pasos_estructuracion')
    .select('id, nombre_paso, orden_secuencia')
    .order('orden_secuencia', { ascending: true })
  const pasos = (filasPasos || []) as Paso[]

  const avances: Avance[] = []
  // En lotes para no pasarse del largo de la consulta.
  for (let i = 0; i < ids.length; i += 200) {
    const { data } = await db
      .from('avance_estructuracion_proyecto')
      .select('proyecto_id, paso_id, completado, fecha_completado')
      .in('proyecto_id', ids.slice(i, i + 200))
      .limit(10000)
    avances.push(...((data || []) as Avance[]))
  }
  const avancePorProyecto = new Map<string, Map<string, string | null>>()
  for (const a of avances) {
    if (!a.completado) continue
    const clave = String(a.proyecto_id)
    if (!avancePorProyecto.has(clave)) avancePorProyecto.set(clave, new Map())
    avancePorProyecto.get(clave)!.set(String(a.paso_id), a.fecha_completado)
  }

  const ahora = new Date().getTime()
  const ultimoMov = await ultimoMovimientoPorProyecto(
    db,
    proyectos.map((p) => ({ id: String(p.id), created_at: p.created_at })),
  )

  /* ---- por proyecto: paso actual, desde cuándo, y duración de cada paso terminado ---- */
  const duracionesPorPaso: number[][] = pasos.map(() => [])
  const terminadasPorSemana = new Map<number, number>()
  const conteoPorPaso: number[] = pasos.map(() => 0)
  let enBusqueda = 0
  let postulados = 0
  const filas: Fila[] = []

  for (const p of proyectos) {
    const hechos = avancePorProyecto.get(String(p.id)) || new Map<string, string | null>()
    const creado = p.created_at ? new Date(p.created_at).getTime() : null

    // Duración de cada paso terminado = fecha de este paso − fecha del paso anterior (o creación).
    let anterior = creado
    pasos.forEach((paso, i) => {
      const f = hechos.get(String(paso.id))
      const t = f ? new Date(f).getTime() : null
      if (t && anterior && t >= anterior) duracionesPorPaso[i].push((t - anterior) / DIA_MS)
      if (t) anterior = t
    })

    const indiceActual = pasos.findIndex((paso) => !hechos.has(String(paso.id)))
    const estado = String(p.estado_actual || '')

    if (pasos.length > 0 && indiceActual === -1) {
      // Terminó la estructuración: cuenta para "terminados por semana".
      const fechas = [...hechos.values()].filter(Boolean).map((f) => new Date(String(f)).getTime())
      const fin = fechas.length ? Math.max(...fechas) : null
      if (fin) {
        const semana = inicioDeSemana(new Date(fin)).getTime()
        terminadasPorSemana.set(semana, (terminadasPorSemana.get(semana) || 0) + 1)
      }
      if (estado === 'postulado') postulados++
      else enBusqueda++
      continue
    }
    if (estado === 'postulado') {
      postulados++
      continue
    }
    if (indiceActual === -1) continue

    conteoPorPaso[indiceActual]++
    const previo = indiceActual > 0 ? hechos.get(String(pasos[indiceActual - 1].id)) : null
    const desde = previo ? new Date(previo).getTime() : creado
    const dias = desde ? Math.max(0, (ahora - desde) / DIA_MS) : 0
    const mov = ultimoMov.get(String(p.id))
    filas.push({
      proyecto: p,
      pasoIndex: indiceActual,
      dias,
      semaforo: dias >= DIAS_ROJO ? 'rojo' : dias >= DIAS_AMARILLO ? 'amarillo' : 'verde',
      razon: null,
      horasSinMovimiento: mov ? (ahora - mov.getTime()) / HORA_MS : null,
    })
  }

  /* ---- el "por qué": solo a los proyectos que ya van lentos o llevan más de una hora quietos ---- */
  const candidatas = filas
    .filter((f) => f.dias >= DIAS_AMARILLO || (f.horasSinMovimiento !== null && f.horasSinMovimiento > HORAS_PLATAFORMA))
    .sort((a, b) => b.dias - a.dias)
    .slice(0, MAX_CON_RAZON)

  for (let i = 0; i < candidatas.length; i += 5) {
    await Promise.all(
      candidatas.slice(i, i + 5).map(async (f) => {
        try {
          const vista: ProyectoVisto = {
            db: db as unknown as ProyectoVisto['db'],
            proyectoId: String(f.proyecto.id),
            nombreProyecto: f.proyecto.nombre_iniciativa,
            nombreCliente: f.proyecto.nombre_cliente,
            correoCliente: f.proyecto.correo_cliente,
            vistaEquipo: true,
          }
          const paso = await calcularSiguientePaso(vista)
          if (!paso) return
          f.razon = {
            quien: paso.accion ? 'cliente' : 'plataforma',
            texto: paso.titulo,
            accion: paso.accion ? paso.accion.texto : null,
          }
        } catch {
          /* si no se puede calcular, simplemente no se muestra el por qué */
        }
      }),
    )
  }
  // Si la frena la plataforma y lleva más de una hora quieta, es rojo aunque lleve pocos días.
  for (const f of filas) {
    if (f.razon?.quien === 'plataforma' && f.horasSinMovimiento !== null && f.horasSinMovimiento > HORAS_PLATAFORMA) {
      f.semaforo = 'rojo'
    }
  }

  const orden = { rojo: 0, amarillo: 1, verde: 2 }
  filas.sort((a, b) => orden[a.semaforo] - orden[b.semaforo] || b.dias - a.dias)

  const promedios = duracionesPorPaso.map((d) => (d.length ? d.reduce((s, x) => s + x, 0) / d.length : null))
  const mayorPromedio = Math.max(0, ...promedios.map((x) => x || 0))
  const maxConteo = Math.max(1, ...conteoPorPaso)

  const semanasLista: { etiqueta: string; total: number }[] = []
  const lunesActual = inicioDeSemana(new Date()).getTime()
  for (let i = SEMANAS - 1; i >= 0; i--) {
    const lunes = lunesActual - i * 7 * DIA_MS
    semanasLista.push({
      etiqueta: new Date(lunes).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', timeZone: 'UTC' }),
      total: terminadasPorSemana.get(lunes) || 0,
    })
  }
  const maxSemana = Math.max(1, ...semanasLista.map((s) => s.total))

  const rojos = filas.filter((f) => f.semaforo === 'rojo').length
  const amarillos = filas.filter((f) => f.semaforo === 'amarillo').length
  const esperanCliente = filas.filter((f) => f.razon?.quien === 'cliente').length
  const frenaPlataforma = filas.filter((f) => f.razon?.quien === 'plataforma' && f.semaforo === 'rojo').length

  const tarjeta = 'bg-[#3B1727] border border-color-base-content/10 rounded-2xl p-6 space-y-4'
  const rotulo = 'text-[10px] font-black text-color-base-content/45 uppercase tracking-widest'

  return (
    <div className="space-y-8 pb-10">
      <div className="space-y-2">
        <h1 className="text-3xl font-black text-color-base-content tracking-tight">Productividad</h1>
        <p className="text-color-base-content/60 text-sm mt-2 max-w-3xl">
          Dónde se está frenando el trabajo y quién lo frena. Se calcula solo, con las fechas que ya guarda la
          plataforma. Los proyectos de prueba y los que aún no arrancan no cuentan.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { t: 'Trabajo en marcha', v: filas.length, c: 'text-color-base-content' },
          { t: 'En rojo', v: rojos, c: rojos > 0 ? 'text-[#E0917E]' : 'text-color-base-content' },
          { t: 'En amarillo', v: amarillos, c: amarillos > 0 ? 'text-[#E0B868]' : 'text-color-base-content' },
          { t: 'Esperan al cliente', v: esperanCliente, c: 'text-color-base-content' },
          { t: 'Los frena la plataforma', v: frenaPlataforma, c: frenaPlataforma > 0 ? 'text-[#E0917E]' : 'text-[#9BB18D]' },
        ].map((k) => (
          <div key={k.t} className="bg-[#3B1727]/80 border border-white/10 rounded-2xl p-4 flex flex-col gap-1">
            <span className={rotulo}>{k.t}</span>
            <span className={`text-2xl font-black tabular-nums ${k.c}`}>{k.v}</span>
          </div>
        ))}
      </div>

      {/* 1 + 3: conteo y tiempo promedio por paso */}
      <div className={tarjeta}>
        <h2 className="text-sm font-black text-color-base-content uppercase tracking-wider">Cuántos hay en cada paso y cuánto tarda cada uno</h2>
        <p className="text-xs text-color-base-content/50">
          Si un paso tiene muchos más proyectos que los demás, ahí se está acumulando el trabajo.
        </p>
        {pasos.length === 0 ? (
          <p className="text-sm text-color-base-content/50">Todavía no hay pasos de estructuración configurados.</p>
        ) : (
          <div className="space-y-2">
            {pasos.map((paso, i) => {
              const prom = promedios[i]
              const lento = prom !== null && mayorPromedio > 0 && prom === mayorPromedio && prom >= 1
              return (
                <div key={String(paso.id)} className="grid grid-cols-[minmax(0,1.4fr)_minmax(0,2fr)_auto] items-center gap-3 text-xs">
                  <span className="truncate text-color-base-content/80">
                    {paso.orden_secuencia ?? i + 1}. {paso.nombre_paso || 'Paso'}
                  </span>
                  <div className="h-3 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#B08D57] to-[#C9A46B]"
                      style={{ width: `${Math.round((conteoPorPaso[i] / maxConteo) * 100)}%` }}
                    />
                  </div>
                  <span className="whitespace-nowrap text-color-base-content/70">
                    <strong className="text-color-base-content tabular-nums">{conteoPorPaso[i]}</strong> proyectos ·{' '}
                    <span className={lento ? 'text-[#E0B868] font-bold' : ''}>
                      {prom === null ? 'sin datos' : `promedio ${formatoDias(prom)}`}
                    </span>
                  </span>
                </div>
              )
            })}
            <p className="text-xs text-color-base-content/50 pt-2">
              Con la estructuración terminada: <strong className="text-color-base-content">{enBusqueda}</strong> en búsqueda y
              encaje de convocatorias · <strong className="text-color-base-content">{postulados}</strong> ya postulados.
            </p>
          </div>
        )}
      </div>

      {/* 4: terminados por semana */}
      <div className={tarjeta}>
        <h2 className="text-sm font-black text-color-base-content uppercase tracking-wider">Estructuraciones terminadas por semana</h2>
        <div className="flex items-end gap-2 h-28">
          {semanasLista.map((s) => (
            <div key={s.etiqueta} className="flex-1 flex flex-col items-center justify-end gap-1 h-full">
              <span className="text-[11px] font-bold text-color-base-content tabular-nums">{s.total}</span>
              <div
                className="w-full rounded-t-md bg-gradient-to-t from-[#B08D57] to-[#C9A46B]"
                style={{ height: `${Math.max(4, Math.round((s.total / maxSemana) * 70))}px`, opacity: s.total ? 1 : 0.25 }}
              />
              <span className="text-[10px] text-color-base-content/45 whitespace-nowrap">{s.etiqueta}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 2 + el por qué: cada proyecto */}
      <div className="bg-[#3B1727] border border-color-base-content/10 rounded-2xl overflow-hidden">
        <div className="p-6 pb-3 space-y-1">
          <h2 className="text-sm font-black text-color-base-content uppercase tracking-wider">Cada proyecto: cuántos días lleva y por qué</h2>
          <p className="text-xs text-color-base-content/50">
            Verde hasta {DIAS_AMARILLO - 1} días, amarillo desde {DIAS_AMARILLO}, rojo desde {DIAS_ROJO}. Si lo frena la
            plataforma, más de {HORAS_PLATAFORMA} hora ya es rojo. El «por qué» se calcula para los {MAX_CON_RAZON} más demorados.
          </p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-color-base-content/10 bg-[#4C2032]">
                {['Proyecto', 'Paso actual', 'Lleva', 'Quién lo frena', 'Acción'].map((h) => (
                  <th key={h} className="px-5 py-3 text-xs font-bold text-color-base-content/40 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filas.map((f) => {
                const p = f.proyecto
                const tel = (p.telefono_whatsapp || '').replace(/[^0-9]/g, '')
                const mensaje = `Hola ${p.nombre_cliente || ''}, te escribimos de Arquitectura Digital sobre tu proyecto "${p.nombre_iniciativa || ''}". ${
                  f.razon?.quien === 'cliente' ? `Para avanzar necesitamos que: ${f.razon.texto.toLowerCase()}. ` : ''
                }Cualquier duda, aquí estamos.`
                const wa = tel ? `https://wa.me/${tel}?text=${encodeURIComponent(mensaje)}` : null
                const correo = p.correo_cliente
                  ? `mailto:${p.correo_cliente}?subject=${encodeURIComponent('Tu proyecto en Arquitectura Digital')}&body=${encodeURIComponent(mensaje)}`
                  : null
                const paso = pasos[f.pasoIndex]
                return (
                  <tr key={p.id} className="align-top hover:bg-color-base-content/5">
                    <td className="px-5 py-3">
                      <div className="text-sm font-semibold text-color-base-content max-w-[240px] truncate">{p.nombre_iniciativa || 'Sin nombre'}</div>
                      <div className="text-xs text-color-base-content/40 truncate max-w-[240px]">{p.nombre_cliente}</div>
                    </td>
                    <td className="px-5 py-3 text-xs text-color-base-content/80">
                      {paso ? `${paso.orden_secuencia ?? f.pasoIndex + 1}. ${paso.nombre_paso || ''}` : '-'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap ${COLOR[f.semaforo]}`}>
                        {formatoDias(f.dias)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs">
                      {f.razon ? (
                        <>
                          <div className={`font-bold ${f.razon.quien === 'plataforma' ? 'text-[#E0917E]' : 'text-[#E0B868]'}`}>
                            {f.razon.quien === 'cliente' ? 'Espera al cliente' : 'La plataforma'}
                          </div>
                          <div className="text-color-base-content/60 max-w-[260px]">{f.razon.texto}</div>
                        </>
                      ) : (
                        <span className="text-color-base-content/35">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col items-start gap-1.5">
                        <Link
                          href={`/admin/proyectos/${p.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-color-primary/15 border border-color-primary/25 text-color-primary text-xs font-bold hover:bg-color-primary/25 whitespace-nowrap"
                        >
                          <Eye className="h-3.5 w-3.5" /> Abrir
                        </Link>
                        {f.razon?.quien === 'cliente' && (wa || correo) ? (
                          <div className="flex gap-1.5">
                            {wa ? (
                              <a href={wa} target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 rounded-full bg-color-base-content/10 text-color-base-content/70 text-xs font-bold hover:bg-color-base-content/20 whitespace-nowrap">
                                WhatsApp
                              </a>
                            ) : null}
                            {correo ? (
                              <a href={correo} className="px-3 py-1.5 rounded-full bg-color-base-content/10 text-color-base-content/70 text-xs font-bold hover:bg-color-base-content/20 whitespace-nowrap">
                                Correo
                              </a>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                )
              })}
              {filas.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-color-base-content/40 italic">
                    No hay proyectos en marcha ahora mismo.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
