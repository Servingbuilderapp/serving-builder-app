import React from 'react'
import Link from 'next/link'
import { CostoClienteClient } from '@/components/empresarial/CostoClienteClient'
import { cargarContexto } from '@/lib/empresarial/calculadorasServidor'
import { clienteVacio, clienteDesdeFinanciero, type CostoCliente } from '@/lib/empresarial/calculadoras'

export const dynamic = 'force-dynamic'

export const metadata = {
  title: 'Costo por cliente | Serving',
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

export default async function Pagina({ searchParams }: { searchParams: Promise<{ proyecto?: string }> }) {
  const { proyecto: proyectoId } = await searchParams
  if (!proyectoId) return mensaje('Falta el proyecto', 'Entra desde tu proyecto para usar esta calculadora.')
  const ctx = await cargarContexto(proyectoId, 'costo_cliente')
  if (!ctx.proyecto) return mensaje('No encontramos ese proyecto', 'Revisa que hayas entrado con tu cuenta.')

  const base = clienteVacio()
  const guardado = ctx.guardado as Partial<CostoCliente> | null
  const inicial: CostoCliente = guardado
    ? { ...base, ...guardado, condiciones: { ...base.condiciones, ...(guardado.condiciones ?? {}) } }
    : ctx.precarga
      ? clienteDesdeFinanciero(ctx.precarga)
      : base

  return <CostoClienteClient proyecto={ctx.proyecto} inicial={inicial} yaGuardado={Boolean(guardado)} copiadoDeFinanciero={!guardado && Boolean(ctx.precarga)} />
}
