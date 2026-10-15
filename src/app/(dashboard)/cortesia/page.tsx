import React from 'react'
import Link from 'next/link'
import { Gift } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { AceptarCortesia } from '@/components/panel/AceptarCortesia'
import { Ayuda } from '@/components/ui/Ayuda'
import { diasRestantes, textoCondiciones, type Cortesia } from '@/lib/cortesias'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SOMBRA = 'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

function fecha(f: string | null) {
  return f ? new Date(f).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
}

export default async function MiCortesiaPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const correo = (user?.email || '').toLowerCase().trim()

  const { data: cort } = correo
    ? await supabaseAdmin
        .from('cortesias')
        .select('*')
        .ilike('correo', correo)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle<Cortesia>()
    : { data: null }

  if (!cort) {
    return (
      <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
        <h1 className="text-[19px] font-extrabold text-[#F3E7DC]">Mi cortesía</h1>
        <p className="mt-2 text-[13.5px] text-[#F3E7DC]/65">No tienes una invitación de cortesía en este momento.</p>
      </div>
    )
  }

  const restan = diasRestantes(cort.vence_en)
  const aceptada = !!cort.acepto_en

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="flex items-center gap-2 text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">
          <Gift className="h-5 w-5 text-[#C9A46B]" />
          <Ayuda clave="panel.mi_cortesia" claro={false}>Mi cortesía</Ayuda>
        </h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          {cort.nombre ? `${cort.nombre}, ` : ''}Serving te invita a estructurar tu proyecto sin costo.
        </p>
      </header>

      <section className={`max-w-2xl rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA}`}>
        <h2 className="text-[15px] font-extrabold text-[#F3E7DC]">Las condiciones</h2>
        <ul className="mt-3 space-y-2 text-[13.5px] leading-relaxed text-[#F3E7DC]/80">
          {textoCondiciones(cort.comision_pct, cort.dias).map((t) => (
            <li key={t}>• {t}</li>
          ))}
        </ul>

        {aceptada ? (
          <div className="mt-5 rounded-xl border border-[#C9A46B]/40 bg-[#3B1727] p-4 text-[13.5px] text-[#F3E7DC]/85">
            <p className="font-bold text-[#E0B868]">Aceptaste estas condiciones el {fecha(cort.acepto_en)}.</p>
            {cort.inicia_en ? (
              <p className="mt-1">
                Tus {cort.dias} días empezaron el {fecha(cort.inicia_en)}.{' '}
                {restan === 0 ? 'El plazo ya terminó.' : `Te quedan ${restan} días (hasta el ${fecha(cort.vence_en)}).`}
              </p>
            ) : (
              <p className="mt-1">
                Tus {cort.dias} días empiezan a contar el día en que subas tu documento en{' '}
                <Link href="/pendientes" className="font-bold text-[#C9A46B] underline">Lo que me piden</Link>.
              </p>
            )}
          </div>
        ) : (
          <AceptarCortesia />
        )}
      </section>
    </div>
  )
}
