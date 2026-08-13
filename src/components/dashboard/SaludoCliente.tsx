'use client'

import { useState, useEffect } from 'react'

export function SaludoCliente({ nombreMostrar }: { nombreMostrar: string }) {
  const [saludo, setSaludo] = useState('Hola')

  useEffect(() => {
    const hora = new Date().getHours()
    if (hora >= 5 && hora < 12) setSaludo('Buenos días')
    else if (hora >= 12 && hora < 18) setSaludo('Buenas tardes')
    else setSaludo('Buenas noches')
  }, [])

  return (
    <h2 className="text-2xl md:text-3xl font-black text-color-base-content tracking-tighter italic uppercase">
      {saludo}, <span className="text-gradient-magma">{nombreMostrar}</span>
    </h2>
  )
}
