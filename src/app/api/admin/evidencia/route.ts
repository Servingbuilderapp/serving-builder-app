import { NextRequest, NextResponse } from 'next/server'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { supabaseAdmin } from '@/lib/supabase/admin'

/**
 * EVIDENCIA DEL SERVICIO — una hoja imprimible con todo lo que la plataforma hizo por un proyecto,
 * sacado de los registros reales: cuándo se firmó, cuándo se estructuró, qué convocatorias se le
 * entregaron, cuál eligió y cómo va su postulación. Sirve para mostrarle al cliente (o a un abogado)
 * qué trabajo prestó Arquitectura Digital, por ejemplo si el cliente termina radicando por su cuenta.
 *
 * Solo el equipo. Se abre en una pestaña nueva: /api/admin/evidencia?proyecto=<id>
 * Para guardarla: botón «Imprimir / guardar como PDF».
 *
 * Solo dice lo que está registrado. Lo que la plataforma no guarda (por ejemplo la fecha exacta en
 * que el cliente eligió) lo dice de frente en vez de inventarlo.
 */

const esc = (t: unknown) => String(t ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
const fecha = (v: unknown) => {
  if (!v) return '—'
  const d = new Date(String(v))
  return Number.isNaN(d.getTime()) ? esc(v) : d.toLocaleDateString('es-CO', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'America/Bogota' })
}

export async function GET(req: NextRequest) {
  if (!(await esEquipoServing())) return NextResponse.json({ error: 'Solo el equipo de Serving' }, { status: 401 })
  const id = req.nextUrl.searchParams.get('proyecto')
  if (!id) return NextResponse.json({ error: 'Falta el proyecto' }, { status: 400 })

  const { data: p } = await supabaseAdmin
    .from('proyectos_clientes_serving')
    .select('id, nombre_iniciativa, nombre_cliente, correo_cliente, created_at, contrato_firmado, plan_pago, estado_actual')
    .eq('id', id)
    .maybeSingle()
  if (!p) return NextResponse.json({ error: 'No existe ese proyecto' }, { status: 404 })

  const [avance, pasos, candidatas, postulaciones] = await Promise.all([
    supabaseAdmin.from('avance_estructuracion_proyecto').select('paso_id, completado, fecha_completado').eq('proyecto_id', id),
    supabaseAdmin.from('contenido_pasos_proyecto').select('id_paso', { count: 'exact', head: true }).eq('id_proyecto', id),
    supabaseAdmin
      .from('convocatorias_candidatas_proyecto')
      .select('nombre, entidad, fecha_cierre, disponible_para_cliente_desde, eleccion_cliente, seleccionada')
      .eq('id_proyecto', id)
      .order('disponible_para_cliente_desde', { ascending: true }),
    supabaseAdmin
      .from('postulaciones')
      .select('convocatoria_nombre, entidad, fecha_cierre, estado, puntaje_total, veredicto, creada_en, actualizada_en, fecha_radicacion')
      .eq('proyecto_id', id)
      .order('creada_en', { ascending: true }),
  ])

  const hechos = ((avance.data || []) as { completado: boolean | null; fecha_completado: string | null }[]).filter((a) => a.completado && a.fecha_completado)
  const fechas = hechos.map((a) => new Date(String(a.fecha_completado)).getTime()).filter((n) => !Number.isNaN(n))
  const primero = fechas.length ? new Date(Math.min(...fechas)).toISOString() : null
  const ultimo = fechas.length ? new Date(Math.max(...fechas)).toISOString() : null
  const lista = (candidatas.data || []) as { nombre: string | null; entidad: string | null; fecha_cierre: string | null; disponible_para_cliente_desde: string | null; eleccion_cliente: string | null; seleccionada: boolean | null }[]
  const entregadas = lista.filter((c) => c.disponible_para_cliente_desde)
  const elegidas = lista.filter((c) => c.eleccion_cliente === 'elegida')
  const post = (postulaciones.data || []) as { convocatoria_nombre: string; entidad: string | null; fecha_cierre: string | null; estado: string; puntaje_total: number | null; veredicto: string | null; creada_en: string | null; actualizada_en: string | null; fecha_radicacion: string | null }[]

  const filasConv = entregadas.length
    ? entregadas
        .map(
          (c) => `<tr><td>${esc(c.nombre)}</td><td>${esc(c.entidad)}</td><td>${fecha(c.fecha_cierre)}</td><td>${fecha(c.disponible_para_cliente_desde)}</td><td>${c.eleccion_cliente === 'elegida' ? '<strong>Sí</strong>' : c.eleccion_cliente === 'no_elegida' ? 'No' : 'Sin decidir'}</td></tr>`,
        )
        .join('')
    : '<tr><td colspan="5">No hay convocatorias registradas como entregadas.</td></tr>'
  const filasPost = post.length
    ? post
        .map(
          (x) => `<tr><td>${esc(x.convocatoria_nombre)}</td><td>${esc(x.entidad)}</td><td>${esc(x.estado)}</td><td>${x.puntaje_total ?? '—'}${x.veredicto ? ` (${esc(x.veredicto)})` : ''}</td><td>${fecha(x.creada_en)}</td><td>${fecha(x.fecha_radicacion)}</td></tr>`,
        )
        .join('')
    : '<tr><td colspan="6">No hay postulación registrada en la plataforma.</td></tr>'

  const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Evidencia del servicio — ${esc(p.nombre_iniciativa)}</title>
<style>
 body{font-family:Georgia,'Times New Roman',serif;color:#2a1a1f;max-width:820px;margin:32px auto;padding:0 20px;line-height:1.5}
 h1{font-size:22px;margin:0 0 4px;color:#54142B} h2{font-size:15px;margin:26px 0 8px;color:#54142B;border-bottom:1px solid #B08D57;padding-bottom:4px}
 .sub{color:#6b4a52;font-size:13px} table{width:100%;border-collapse:collapse;font-size:12.5px;margin-top:6px}
 th,td{border:1px solid #d9c7b0;padding:6px 8px;text-align:left;vertical-align:top} th{background:#f3e7dc}
 .nota{font-size:11.5px;color:#6b4a52;margin-top:26px;border-top:1px solid #d9c7b0;padding-top:10px}
 button{background:#B08D57;color:#2a1a1f;border:0;border-radius:8px;padding:9px 16px;font-weight:bold;cursor:pointer;margin-bottom:14px}
 @media print{button{display:none}body{margin:0}}
</style></head><body>
<button onclick="window.print()">Imprimir / guardar como PDF</button>
<h1>Evidencia del servicio prestado</h1>
<div class="sub">Arquitectura Digital de Proyectos — Serving Proyectos Estratégicos SAS<br>Generada el ${fecha(new Date().toISOString())} a partir de los registros de la plataforma</div>

<h2>1. El proyecto y el cliente</h2>
<table><tr><th>Proyecto</th><td>${esc(p.nombre_iniciativa)}</td></tr>
<tr><th>Cliente</th><td>${esc(p.nombre_cliente)} (${esc(p.correo_cliente)})</td></tr>
<tr><th>Proyecto creado en la plataforma</th><td>${fecha(p.created_at)}</td></tr>
<tr><th>Contrato firmado electrónicamente</th><td>${p.contrato_firmado ? 'Sí' : 'No consta en el registro'}</td></tr>
<tr><th>Plan contratado</th><td>${esc(p.plan_pago || '—')}</td></tr></table>

<h2>2. Estructuración del proyecto</h2>
<table><tr><th>Pasos de estructuración con contenido redactado</th><td>${pasos.count ?? 0}</td></tr>
<tr><th>Pasos marcados como completados</th><td>${hechos.length}</td></tr>
<tr><th>Primer y último paso completado</th><td>${fecha(primero)} — ${fecha(ultimo)}</td></tr></table>

<h2>3. Convocatorias que la plataforma encontró y le entregó</h2>
<p class="sub">${entregadas.length} convocatoria(s) entregada(s); ${elegidas.length} elegida(s) por el cliente.</p>
<table><tr><th>Convocatoria</th><th>Entidad</th><th>Cierre</th><th>Entregada al cliente</th><th>La eligió</th></tr>${filasConv}</table>

<h2>4. Postulación preparada en la plataforma</h2>
<table><tr><th>Convocatoria</th><th>Entidad</th><th>Estado</th><th>Puntaje del evaluador</th><th>Creada</th><th>Radicada</th></tr>${filasPost}</table>

<p class="nota">Este documento solo reproduce lo que la plataforma tiene registrado. No incluye la fecha exacta en que el cliente eligió cada convocatoria (el sistema guarda la decisión, no su hora) ni lo que el cliente haga fuera de la plataforma. No es un concepto jurídico: sirve como soporte del trabajo realizado.</p>
</body></html>`
  return new NextResponse(html, { headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
}
