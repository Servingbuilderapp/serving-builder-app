import React from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { membresiaVigente } from '@/lib/membresiasConsumo'
import { resumenDeUso } from '@/lib/membresiasUso'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { FormularioNotaMiembro } from '@/components/panel/FormularioNotaMiembro'
import { NotaConceptoTexto } from '@/components/panel/NotaConceptoTexto'

export const dynamic = 'force-dynamic'
export const revalidate = 0

const SOMBRA_TARJETA =
  'shadow-[0_1px_2px_rgba(20,5,10,0.28),0_8px_24px_-14px_rgba(20,5,10,0.55)]'

export default async function NotaDeConceptoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const correo = (user?.email || '').toLowerCase()

  const servicio = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )

  const { vigente } = correo ? await membresiaVigente(servicio, correo) : { vigente: undefined }
  // El equipo de Serving entra a todo y prueba sin membresía ni cupo.
  const esEquipo = await esEquipoServing()

  if (!vigente && !esEquipo) {
    return (
      <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">Nota de concepto</h1>
        <div className={`mx-auto mt-6 max-w-xl rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-8 text-center ${SOMBRA_TARJETA}`}>
          <h2 className="text-[15px] font-extrabold text-[#F3E7DC]">Esta sección es para miembros</h2>
          <p className="mx-auto mt-2 max-w-md text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
            Con una membresía activa generas cada mes una nota de concepto de tu idea, lista para presentar a un financiador.
          </p>
          <Link href="/membresia" className="mt-4 inline-flex rounded-xl bg-[#C9A46B] px-4 py-2.5 text-[13px] font-bold text-[#3B1727]">
            Ver las membresías
          </Link>
        </div>
      </div>
    )
  }

  const uso = vigente ? await resumenDeUso(servicio, vigente) : null
  const linea = uso?.lineas.find((l) => l.clave === 'nota_concepto')
  const limite = esEquipo ? null : (linea?.limite ?? 0)
  const restante = esEquipo ? null : (linea?.restante ?? null)
  const sinCupo = !esEquipo && (limite === 0 || (restante !== null && restante <= 0))

  const { data: anteriores } = await servicio
    .from('membresias_notas_concepto')
    .select('id, nombre_proyecto, documento, created_at')
    .ilike('correo_cliente', correo)
    .order('created_at', { ascending: false })
    .limit(10)

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-5">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#F3E7DC]">Nota de concepto</h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          {esEquipo
            ? 'Vista de administrador: puedes generar notas para probar, sin membresía y sin gastar cupo. Estas pruebas no se guardan.'
            : limite === 0
              ? 'Tu nivel no incluye notas de concepto.'
              : restante === null
                ? 'Tu nivel no tiene límite de notas.'
                : `Este mes puedes generar ${limite}. Te quedan ${restante}. Se renuevan el ${uso?.hasta.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}.`}
        </p>
      </header>

      <section className={`rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
        <FormularioNotaMiembro sinCupo={sinCupo} />
      </section>

      {anteriores && anteriores.length > 0 && (
        <section className={`mt-4 rounded-2xl border border-[#B08D57]/35 bg-[#4C2032] p-5 ${SOMBRA_TARJETA}`}>
          <h2 className="text-[15px] font-extrabold text-[#F3E7DC]">Mis notas anteriores</h2>
          <div className="mt-3 space-y-2">
            {anteriores.map((n: { id: string; nombre_proyecto: string; documento: string; created_at: string }) => (
              <details key={n.id} className="rounded-xl bg-[#3B1727] p-3">
                <summary className="cursor-pointer text-[13.5px] font-bold text-[#F3E7DC]">
                  {n.nombre_proyecto}{' '}
                  <span className="font-normal text-[#F3E7DC]/50">
                    · {new Date(n.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' })}
                  </span>
                </summary>
                <div className="mt-3">
                  <NotaConceptoTexto documento={n.documento} />
                </div>
              </details>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
