import React from 'react'
import { DiagnosticoResultadoClient } from '@/components/diagnostico/DiagnosticoResultadoClient'

export const metadata = {
  title: 'Tu diagnóstico | Arquitectura Digital',
  robots: { index: false, follow: false },
}

export default async function DiagnosticoResultadoPage({
  params,
}: {
  params: Promise<{ codigo: string }>
}) {
  const { codigo } = await params
  return <DiagnosticoResultadoClient codigo={codigo} />
}
