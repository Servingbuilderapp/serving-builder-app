import { NextRequest, NextResponse } from 'next/server'
import { motorAutorizado } from '@/lib/candadoMotores'
import { buildEmailTemplate, sendEmail } from '@/lib/email'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { calcularAcceso, DIAS_DE_AVISO } from '@/lib/empresarial/membresia'

/**
 * AVISO DE VENCIMIENTO — Camino A (una vez al día, programado en vercel.json).
 *
 * Dentro de la plataforma ya se ve el aviso (GuardaAcceso); este correo es el
 * mismo aviso, pero al correo, por si la persona no entra esos días.
 *
 *   1. "Te quedan pocos días": a quien le falten 7 días o menos para vencer
 *      (mismo umbral que el aviso de adentro, DIAS_DE_AVISO). Se repite cada
 *      día que siga en esa ventana, igual que el aviso de adentro.
 *   2. "Ya venció": un solo correo, el día que pasa a modo lectura (se
 *      detecta porque venció en las últimas 24 horas, así no se repite).
 *
 * Probar a mano con /api/empresarial/membresia/avisos-vencimiento?probar=1
 * (no envía nada, solo dice a quién le escribiría).
 */

export const maxDuration = 120

export async function GET(req: NextRequest) {
  if (!(await motorAutorizado(req, null))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const soloProbar = req.nextUrl.searchParams.get('probar') === '1'
  const ahora = new Date()
  const hace24h = new Date(ahora.getTime() - 24 * 60 * 60 * 1000)

  const { data: filas, error } = await supabaseAdmin
    .from('sfpe_membresias')
    .select('id, user_id, plan, acceso_hasta')
    .lte('acceso_hasta', new Date(ahora.getTime() + DIAS_DE_AVISO * 24 * 60 * 60 * 1000).toISOString())

  if (error) {
    console.error('[avisos-vencimiento Camino A] Error leyendo sfpe_membresias:', error)
    return NextResponse.json({ error: 'Error leyendo membresías' }, { status: 500 })
  }

  const porVencer: { userId: string; dias: number }[] = []
  const recienVencidas: string[] = []

  for (const fila of filas || []) {
    const acceso = calcularAcceso(fila)
    const vencioHaceRato = new Date(fila.acceso_hasta) <= ahora
    if (vencioHaceRato) {
      if (new Date(fila.acceso_hasta) >= hace24h) recienVencidas.push(fila.user_id)
    } else if (acceso.diasRestantes <= DIAS_DE_AVISO) {
      porVencer.push({ userId: fila.user_id, dias: acceso.diasRestantes })
    }
  }

  if (soloProbar) {
    return NextResponse.json({ probar: true, porVencer, recienVencidas })
  }

  const origen = req.nextUrl.origin
  let enviados = 0

  for (const { userId, dias } of porVencer) {
    const correo = await correoDe(userId)
    if (!correo) continue
    const html = buildEmailTemplate({
      title: 'Tu acceso al Camino A está por vencer',
      greeting: 'Hola,',
      bodyLines: [
        `Te ${dias === 1 ? 'queda 1 día' : `quedan ${dias} días`} de acceso a tu proyecto en Arquitectura Digital.`,
        'Si no eliges un plan antes de esa fecha, tu cuenta pasa a modo solo lectura: podrás ver y descargar tu documento, pero no seguir editando.',
      ],
      ctaText: 'Elegir mi plan',
      ctaUrl: `${origen}/empresarial/membresia`,
    })
    const r = await sendEmail({ to: correo, subject: 'Tu acceso al Camino A está por vencer', html })
    if (r.success) enviados++
  }

  for (const userId of recienVencidas) {
    const correo = await correoDe(userId)
    if (!correo) continue
    const html = buildEmailTemplate({
      title: 'Tu acceso al Camino A venció',
      greeting: 'Hola,',
      bodyLines: [
        'Tu acceso terminó. Tu cuenta quedó en modo solo lectura: puedes ver y descargar tu documento, pero no seguir editando.',
        'Para seguir usando todas las herramientas, elige un plan mensual.',
      ],
      ctaText: 'Elegir mi plan',
      ctaUrl: `${origen}/empresarial/membresia`,
    })
    const r = await sendEmail({ to: correo, subject: 'Tu acceso al Camino A venció', html })
    if (r.success) enviados++
  }

  return NextResponse.json({ ok: true, enviados, porVencer: porVencer.length, recienVencidas: recienVencidas.length })
}

async function correoDe(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin.auth.admin.getUserById(userId)
  if (error || !data?.user?.email) return null
  return data.user.email
}
