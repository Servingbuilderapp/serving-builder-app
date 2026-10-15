import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import {
  COMISION_CORTESIA_POR_DEFECTO,
  DIAS_CORTESIA_POR_DEFECTO,
  ESTADO_PROYECTO_CORTESIA_PENDIENTE,
} from '@/lib/cortesias'

/**
 * Cortesías: el equipo invita a una persona a la que Serving le estructura el
 * proyecto sin cobrar la estructuración (solo comisión de éxito si gana).
 *
 * Acciones (POST, solo equipo Serving):
 *   crear   → crea la cuenta (si no existe), el proyecto y la cortesía
 *   iniciar → arranca el conteo de días hoy
 *   extender→ suma días al plazo
 *   estado  → cambia el estado (invitada | activa | ganada | cerrada)
 */

function clave() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let p = ''
  for (let i = 0; i < 10; i++) p += chars.charAt(Math.floor(Math.random() * chars.length))
  return p
}

function numero(v: unknown, por_defecto: number, min: number, max: number) {
  const n = Number(v)
  if (!Number.isFinite(n)) return por_defecto
  return Math.min(max, Math.max(min, Math.round(n)))
}

export async function POST(req: Request) {
  try {
    if (!(await esEquipoServing())) return NextResponse.json({ error: 'No autorizado' }, { status: 403 })
    const cuerpo = await req.json()
    const accion = String(cuerpo?.accion || '')

    if (accion === 'crear') {
      const nombre = String(cuerpo.nombre || '').trim().slice(0, 120)
      const correo = String(cuerpo.correo || '').trim().toLowerCase()
      const whatsapp = String(cuerpo.whatsapp || '').trim().slice(0, 40)
      const iniciativa = String(cuerpo.iniciativa || '').trim().slice(0, 200)
      const origen = String(cuerpo.origen || '').trim().slice(0, 80)
      const nota = String(cuerpo.nota || '').trim().slice(0, 500)
      const dias = numero(cuerpo.dias, DIAS_CORTESIA_POR_DEFECTO, 1, 120)
      const comision = numero(cuerpo.comisionPct, COMISION_CORTESIA_POR_DEFECTO, 1, 50)
      const iniciarYa = cuerpo.iniciarYa === true

      if (!nombre || !/^\S+@\S+\.\S+$/.test(correo)) {
        return NextResponse.json({ error: 'Escribe el nombre y un correo válido.' }, { status: 400 })
      }

      // Cuenta de acceso: si ya existe (por ejemplo porque hizo el diagnóstico) no se toca.
      let password: string | null = null
      const intento = clave()
      const { error: errAuth } = await supabaseAdmin.auth.admin.createUser({
        email: correo,
        password: intento,
        email_confirm: true,
        user_metadata: { first_name: nombre.split(' ')[0] },
      })
      if (!errAuth) {
        password = intento
      } else if (!/already|registered|exists/i.test(errAuth.message || '')) {
        return NextResponse.json({ error: 'No se pudo crear la cuenta: ' + errAuth.message }, { status: 500 })
      }

      const { data: proyecto, error: errProy } = await supabaseAdmin
        .from('proyectos_clientes_serving')
        .insert({
          nombre_cliente: nombre,
          correo_cliente: correo,
          telefono_whatsapp: whatsapp || 'sin dato',
          nombre_iniciativa: iniciativa || 'Proyecto de ' + nombre,
          estado_actual: ESTADO_PROYECTO_CORTESIA_PENDIENTE,
          estado_comercial: 'nuevo',
          contrato_firmado: false,
          plan_pago: 'cortesia',
          canal_origen: 'cortesia',
          pasarela_pago: 'Ninguno',
        })
        .select('id')
        .single()
      if (errProy) {
        return NextResponse.json({ error: 'No se pudo crear el proyecto: ' + errProy.message }, { status: 500 })
      }

      const ahora = new Date()
      const vence = new Date(ahora.getTime() + dias * 86400000)
      const { error: errCort } = await supabaseAdmin.from('cortesias').insert({
        proyecto_id: String(proyecto.id),
        correo,
        nombre,
        whatsapp: whatsapp || null,
        iniciativa: iniciativa || null,
        origen: origen || null,
        comision_pct: comision,
        dias,
        inicia_en: iniciarYa ? ahora.toISOString() : null,
        vence_en: iniciarYa ? vence.toISOString() : null,
        estado: 'invitada',
        nota: nota || null,
      })
      if (errCort) {
        return NextResponse.json({ error: 'No se pudo guardar la cortesía: ' + errCort.message }, { status: 500 })
      }
      return NextResponse.json({ success: true, password, proyectoId: String(proyecto.id) })
    }

    const id = String(cuerpo?.id || '')
    if (!id) return NextResponse.json({ error: 'Falta la cortesía.' }, { status: 400 })

    const { data: cort } = await supabaseAdmin
      .from('cortesias')
      .select('id, dias, vence_en')
      .eq('id', id)
      .maybeSingle<{ id: string; dias: number; vence_en: string | null }>()
    if (!cort) return NextResponse.json({ error: 'No encontramos esa cortesía.' }, { status: 404 })

    if (accion === 'iniciar') {
      const ahora = new Date()
      const { error } = await supabaseAdmin
        .from('cortesias')
        .update({ inicia_en: ahora.toISOString(), vence_en: new Date(ahora.getTime() + cort.dias * 86400000).toISOString(), estado: 'activa' })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (accion === 'extender') {
      const mas = numero(cuerpo.dias, 7, 1, 60)
      const base = cort.vence_en && new Date(cort.vence_en).getTime() > Date.now() ? new Date(cort.vence_en) : new Date()
      const { error } = await supabaseAdmin
        .from('cortesias')
        .update({ vence_en: new Date(base.getTime() + mas * 86400000).toISOString() })
        .eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    if (accion === 'estado') {
      const estado = String(cuerpo.estado || '')
      if (!['invitada', 'activa', 'ganada', 'cerrada'].includes(estado)) {
        return NextResponse.json({ error: 'Estado no válido.' }, { status: 400 })
      }
      const { error } = await supabaseAdmin.from('cortesias').update({ estado }).eq('id', id)
      if (error) return NextResponse.json({ error: error.message }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción no válida.' }, { status: 400 })
  } catch (e) {
    console.error('Error en cortesías:', e)
    return NextResponse.json({ error: 'No se pudo completar. Intenta de nuevo.' }, { status: 500 })
  }
}
