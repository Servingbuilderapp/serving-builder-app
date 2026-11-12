import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DescubrimientoClient } from '@/components/empresarial/DescubrimientoClient'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Ruta de descubrimiento | Serving',
}

const mensaje = (titulo: string, texto: string) => (
  <main className="min-h-screen bg-gradient-to-b from-ca-tarjeta via-ca-fondo to-ca-suave text-ca-vino flex items-center justify-center px-5">
    <div className="max-w-md text-center">
      <h1 className="text-2xl font-extrabold">{titulo}</h1>
      <p className="mt-3 text-ca-vino/80">{texto}</p>
      <Link href="/empresarial" className="mt-6 inline-block underline">
        Volver
      </Link>
    </div>
  </main>
)

/** Ruta de descubrimiento (perfil B): sin puntaje, solo guarda lo que la persona va contando. */
export default async function DescubrimientoPage({
  searchParams,
}: {
  searchParams: Promise<{ proyecto?: string }>
}) {
  const { proyecto: proyectoId } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?redirect=/empresarial')

  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para empezar.')

  const { data: proyecto } = await supabase
    .from('sfpe_proyectos')
    .select('id, nombre, perfil_confirmado')
    .eq('id', proyectoId)
    .maybeSingle()

  if (!proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')
  if (proyecto.perfil_confirmado !== 'B') {
    return mensaje('Esta ruta es para quien aún no tiene idea', 'Tu proyecto sigue otro camino.')
  }

  const { data: filas } = await supabase
    .from('sfpe_descubrimiento')
    .select('id, tipo, titulo, detalle, nivel, ejemplo_o_evidencia')
    .eq('proyecto_id', proyecto.id)

  return <DescubrimientoClient proyecto={{ id: proyecto.id, nombre: proyecto.nombre }} filasIniciales={filas ?? []} />
}
