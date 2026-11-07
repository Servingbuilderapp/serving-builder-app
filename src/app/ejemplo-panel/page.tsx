import React from 'react'
import type { Metadata } from 'next'
import { EjemploPanelClient } from '@/components/landing/EjemploPanelClient'

export const metadata: Metadata = {
  title: 'Así se ve tu panel | Arquitectura Digital',
}

export default function EjemploPanelPage() {
  return <EjemploPanelClient />
}
