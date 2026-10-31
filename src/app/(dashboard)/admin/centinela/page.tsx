import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CentinelaFuentesClient } from '@/components/admin/CentinelaFuentesClient'
import { supabaseAdmin } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

/**
 * FUENTES DEL CENTINELA DIGITAL — pantalla del equipo.
 *
 * De aquí sale todo lo demás del Centinela: primero se sabe a quién se le va a
 * seguir la pista y por qué vía, y después se construye la lectura automática
 * de cada vía.
 */
export default async function AdminCentinelaPage() {
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

  const { data: fuentes, error } = await supabase
    .from('centinela_fuentes')
    // El texto del select va en UNA sola línea a propósito: si se parte con un
    // "+", TypeScript deja de reconocer las columnas y el resultado le llega a
    // la pantalla sin tipo. Es el error que ya arrastra la pantalla de
    // convocatorias.
    .select('id, nombre, categoria, nivel, estado, url, url_newsletter, correo_remitente, notas, primer_correo_en, ultima_revision')
    .order('categoria', { ascending: true })
    .limit(1000)

  // Informe del buzón: lo deja la ruta que cruza los correos que llegan con la lista de fuentes.
  type Informe = {
    actualizado?: string
    correos_revisados?: number
    fuentes_confirmadas_ahora?: number
    fuentes_ya_confirmadas?: number
    en_spam?: { fuente: string; correo: string; total: number }[]
    sin_fuente?: { correo: string; nombre: string; total: number }[]
    sin_llegar?: number
    sin_llegar_nombres?: string[]
  }
  let informe: Informe | null = null
  try {
    const { data } = await supabaseAdmin.from('resumen_equipo').select('datos').eq('id', 'centinela').maybeSingle()
    informe = (data?.datos || null) as Informe | null
  } catch {
    informe = null
  }

  return (
    <>
      <div className="mb-4">
        <a href="/admin/centinela/salud" className="inline-block rounded-lg border border-[#B08D57] bg-white px-4 py-2 text-sm font-bold text-[#3B1727] shadow-sm">
          Ver salud del Centinela (qué leyó cada día)
        </a>
      </div>
      <div className="mb-6 rounded-2xl border border-[#B08D57]/40 bg-[#3B1727] p-5 text-[#F3E7DC]">
        <h2 className="text-sm font-black uppercase tracking-wider text-[#C9A46B]">Qué está llegando al buzón</h2>
        {informe ? (
          <div className="mt-3 space-y-3 text-sm">
            <p className="text-[#F3E7DC]/80">
              Se revisaron {informe.correos_revisados ?? 0} correos de los últimos 60 días
              {informe.actualizado ? ` (revisado el ${new Date(informe.actualizado).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })})` : ''}.{' '}
              Fuentes llegando: <strong>{(informe.fuentes_ya_confirmadas ?? 0) + (informe.fuentes_confirmadas_ahora ?? 0)}</strong>. Fuentes que deberían mandar boletín y todavía no llega nada:{' '}
              <strong>{informe.sin_llegar ?? 0}</strong>.
            </p>
            {informe.en_spam && informe.en_spam.length > 0 ? (
              <div className="rounded-lg border border-[#C0604A]/50 bg-[#C0604A]/10 p-3">
                <div className="font-bold text-[#E0917E]">Boletines que están cayendo en SPAM ({informe.en_spam.length})</div>
                <p className="mt-1 text-xs text-[#F3E7DC]/70">
                  El Centinela no los lee desde ahí. En Gmail, abre cada uno y toca «No es spam».
                </p>
                <p className="mt-1 text-xs text-[#F3E7DC]/85">{informe.en_spam.slice(0, 15).map((x) => x.fuente).join(' · ')}</p>
              </div>
            ) : null}
            {informe.sin_fuente && informe.sin_fuente.length > 0 ? (
              <details className="text-xs text-[#F3E7DC]/75">
                <summary className="cursor-pointer font-bold text-[#C9A46B]">Remitentes que llegan pero no están en la lista de fuentes ({informe.sin_fuente.length})</summary>
                <p className="mt-1">{informe.sin_fuente.slice(0, 25).map((x) => x.nombre || x.correo).join(' · ')}</p>
              </details>
            ) : null}
            {informe.sin_llegar_nombres && informe.sin_llegar_nombres.length > 0 ? (
              <details className="text-xs text-[#F3E7DC]/75">
                <summary className="cursor-pointer font-bold text-[#C9A46B]">Fuentes de las que todavía no llega nada ({informe.sin_llegar})</summary>
                <p className="mt-1">{informe.sin_llegar_nombres.join(' · ')}</p>
              </details>
            ) : null}
          </div>
        ) : (
          <p className="mt-2 text-xs text-[#F3E7DC]/65">
            Todavía no hay informe. Se genera solo cada día; para verlo ahora, abre <code>/api/centinela/conciliar-fuentes</code> estando conectado como administrador.
          </p>
        )}
      </div>
      <CentinelaFuentesClient fuentes={fuentes || []} errorCarga={error?.message || null} />
    </>
  )
}
