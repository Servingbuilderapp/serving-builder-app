import React from 'react'
import { Search } from 'lucide-react'
import { contextoMiembro } from '@/lib/membresiasServicios'
import { AvisoMiembros } from '@/components/panel/AvisoMiembros'
import { Ayuda } from '@/components/ui/Ayuda'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

type Ficha = {
  id: string
  nombre: string | null
  entidad: string | null
  pais: string | null
  sector: string | null
  tipo_financiador: string | null
  monto: string | null
  fecha_cierre: string | null
  fecha_cierre_texto: string | null
  abierta_todo_el_anio: boolean | null
  estado_convocatoria: string | null
  tipo: string | null
  linea_tematica: string | null
  requisitos: string | null
  mecanismo_postulacion: string | null
  fuente_oficial: string | null
}

type Params = { q?: string; pais?: string; sector?: string; financiador?: string; estado?: string }

function limpiar(v: string | undefined) {
  // Se quitan comas, paréntesis y comodines para que el texto no rompa el filtro.
  return (v || '').replace(/[,()%_*\\]/g, ' ').trim().slice(0, 80)
}

function cierreTexto(c: Ficha) {
  if (!c.fecha_cierre && (c.abierta_todo_el_anio || /todo el a/i.test(c.estado_convocatoria || '') || c.tipo === 'permanente')) return 'Abierta todo el año'
  if (c.fecha_cierre) {
    return 'Cierra: ' + new Date(c.fecha_cierre + 'T12:00:00').toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })
  }
  return c.fecha_cierre_texto || 'Sin fecha de cierre'
}

export default async function BuscarFondosPage({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams
  const ctx = await contextoMiembro()
  if (!ctx.vigente && !ctx.esEquipo) {
    return (
      <AvisoMiembros
        titulo="Buscador de fondos"
        texto="Con una membresía activa buscas fondos por palabra, país, sector y tipo de financiador, y ves cuáles están abiertos hoy."
      />
    )
  }

  const hoy = new Date().toISOString().slice(0, 10)
  const q = limpiar(p.q)
  const pais = limpiar(p.pais)
  const sector = limpiar(p.sector)
  const financiador = limpiar(p.financiador)
  const estado = p.estado === 'todas' ? 'todas' : 'abiertas'

  let consulta = ctx.servicio
    .from('biblioteca_convocatorias')
    .select('id, nombre, entidad, pais, sector, tipo_financiador, monto, fecha_cierre, fecha_cierre_texto, abierta_todo_el_anio, estado_convocatoria, tipo, linea_tematica, requisitos, mecanismo_postulacion, fuente_oficial')
  if (estado === 'abiertas') consulta = consulta.or(`fecha_cierre.is.null,fecha_cierre.gte.${hoy}`)
  if (q) consulta = consulta.or(`nombre.ilike.%${q}%,entidad.ilike.%${q}%,linea_tematica.ilike.%${q}%,objetivo.ilike.%${q}%`)
  if (pais) consulta = consulta.ilike('pais', `%${pais}%`)
  if (sector) consulta = consulta.ilike('sector', `%${sector}%`)
  if (financiador) consulta = consulta.ilike('tipo_financiador', `%${financiador}%`)
  const { data, count } = await consulta
    .order('fecha_cierre', { ascending: true, nullsFirst: false })
    .limit(60)
  const lista = (data || []) as Ficha[]
  void count

  // Opciones de los filtros, tomadas de lo que realmente hay en la biblioteca.
  const { data: opciones } = await ctx.servicio
    .from('biblioteca_convocatorias')
    .select('pais, sector, tipo_financiador')
    .limit(2000)
  const unicos = (clave: 'pais' | 'sector' | 'tipo_financiador') =>
    Array.from(new Set((opciones || []).map((o: Record<string, string | null>) => (o[clave] || '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, 'es')).slice(0, 80)
  const paises = unicos('pais')
  const sectores = unicos('sector')
  const financiadores = unicos('tipo_financiador')

  const campo = 'mt-1 w-full rounded-xl border border-white/10 bg-[#3B1727] px-3 py-2 text-[13.5px] text-[#F3E7DC]'
  const etiqueta = 'text-[12px] font-bold text-[#F3E7DC]/70'

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">
          <Search className="h-5 w-5 text-[#C9A46B]" />
          <Ayuda clave="panel.buscar_fondos" claro={false}>Buscador de fondos</Ayuda>
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          Busca entre todas las convocatorias de la biblioteca. Filtra por palabra, país, sector o tipo de financiador.
        </p>
      </header>

      <form method="get" className={`mb-6 grid gap-3 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-4 sm:grid-cols-2 lg:grid-cols-5 ${SOMBRA_TARJETA}`}>
        <div className="sm:col-span-2 lg:col-span-5">
          <label className={etiqueta}>Palabra (nombre, entidad o tema)</label>
          <input name="q" defaultValue={q} placeholder="Ej.: agua, mujeres, educación…" className={campo} />
        </div>
        <div>
          <label className={etiqueta}>País</label>
          <select name="pais" defaultValue={pais} className={campo}>
            <option value="">Todos</option>
            {paises.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={etiqueta}>Sector</label>
          <select name="sector" defaultValue={sector} className={campo}>
            <option value="">Todos</option>
            {sectores.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={etiqueta}>Tipo de financiador</label>
          <select name="financiador" defaultValue={financiador} className={campo}>
            <option value="">Todos</option>
            {financiadores.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </div>
        <div>
          <label className={etiqueta}>Estado</label>
          <select name="estado" defaultValue={estado} className={campo}>
            <option value="abiertas">Abiertas o por abrir</option>
            <option value="todas">Todas, incluso cerradas</option>
          </select>
        </div>
        <div className="flex items-end">
          <button type="submit" className="w-full rounded-xl bg-[#C9A46B] px-4 py-2.5 text-[13.5px] font-bold text-[#3B1727]">
            Buscar
          </button>
        </div>
      </form>

      <p className="mb-3 text-[12.5px] text-[#F3E7DC]/55">
        {lista.length === 0 ? 'No encontramos convocatorias con esos filtros.' : `Mostrando ${lista.length} convocatorias${lista.length === 60 ? ' (afina los filtros para ver más específicas)' : ''}.`}
      </p>

      <div className="grid items-start gap-4 lg:grid-cols-2">
        {lista.map((c) => (
          <article key={c.id} className={`rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
            <h2 className="text-[14.5px] font-extrabold text-[#F3E7DC]">{c.nombre}</h2>
            <p className="text-[12.5px] text-[#F3E7DC]/55">
              {[c.entidad, c.pais].filter(Boolean).join(' · ') || 'Entidad sin dato'}
            </p>
            <p className="mt-1 text-[12.5px] font-semibold text-[#E0B868]">{cierreTexto(c)}</p>
            <dl className="mt-3 space-y-1.5 text-[13px] text-[#F3E7DC]/75">
              {c.monto && <div><dt className="inline font-bold text-[#F3E7DC]">Monto: </dt><dd className="inline">{c.monto}</dd></div>}
              {c.sector && <div><dt className="inline font-bold text-[#F3E7DC]">Sector: </dt><dd className="inline">{c.sector}</dd></div>}
              {c.tipo_financiador && <div><dt className="inline font-bold text-[#F3E7DC]">Financiador: </dt><dd className="inline">{c.tipo_financiador}</dd></div>}
              {c.linea_tematica && <div><dt className="inline font-bold text-[#F3E7DC]">Línea temática: </dt><dd className="inline">{c.linea_tematica}</dd></div>}
              {c.requisitos && <div><dt className="inline font-bold text-[#F3E7DC]">Requisitos: </dt><dd className="inline">{c.requisitos}</dd></div>}
              {c.mecanismo_postulacion && <div><dt className="inline font-bold text-[#F3E7DC]">Cómo se postula: </dt><dd className="inline">{c.mecanismo_postulacion}</dd></div>}
              {c.fuente_oficial && (
                <div>
                  <a href={c.fuente_oficial} target="_blank" rel="noopener noreferrer" className="font-bold text-[#C9A46B] underline">
                    Ver la convocatoria oficial
                  </a>
                </div>
              )}
            </dl>
          </article>
        ))}
      </div>
    </div>
  )
}
