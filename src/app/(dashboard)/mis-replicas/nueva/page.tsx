import React from 'react'
import { SolicitarReplicaClient } from '@/components/panel/SolicitarReplicaClient'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default function NuevaReplicaPage() {
  return <SolicitarReplicaClient />
}
