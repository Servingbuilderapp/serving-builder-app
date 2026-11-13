'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { DIAS_DE_AVISO } from '@/lib/empresarial/membresia'

/** Pantallas que se pueden ver aunque el acceso haya vencido (solo lectura). */
const PERMITIDAS_VENCIDO = ['/empresarial/documento', '/empresarial/membresia', '/empresarial/camino']

interface Props {
  activo: boolean
  diasRestantes: number
  enPeriodoInicial: boolean
}

/**
 * Cuida el acceso al Camino A.
 * - Vencido: solo deja ver el documento, el camino y la pantalla del plan; el resto lleva al plan.
 * - Faltando pocos días: muestra un aviso arriba.
 */
export function GuardaAcceso({ activo, diasRestantes, enPeriodoInicial }: Props) {
  const ruta = usePathname()
  const router = useRouter()
  const permitida = ruta === '/empresarial' || PERMITIDAS_VENCIDO.some((p) => ruta.startsWith(p))

  useEffect(() => {
    if (!activo && !permitida) router.replace('/empresarial/membresia')
  }, [activo, permitida, router])

  if (ruta.startsWith('/empresarial/membresia')) return null

  if (!activo) {
    return (
      <div className="bg-ca-vino px-4 py-2.5 text-center text-sm text-ca-tarjeta">
        Tu acceso terminó y estás en modo lectura: puedes ver y descargar tu documento.{' '}
        <Link href="/empresarial/membresia" className="font-bold underline text-ca-oro-claro">
          Elegir mi plan
        </Link>
      </div>
    )
  }

  if (diasRestantes <= DIAS_DE_AVISO) {
    return (
      <div className="bg-ca-suave px-4 py-2.5 text-center text-sm text-ca-vino border-b border-ca-oro/45">
        {enPeriodoInicial ? 'Tu mes para hacer el proyecto termina' : 'Tu plan termina'} en {diasRestantes}{' '}
        {diasRestantes === 1 ? 'día' : 'días'}.{' '}
        <Link href="/empresarial/membresia" className="font-bold underline">
          Ver mi plan
        </Link>
      </div>
    )
  }

  return null
}
