import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  try {
    const hoy = new Date()

    const convocatorias = [
      {
        id: 'c1',
        nombre: 'Fondo Emprender SENA - Convocatoria Nacional 2026',
        entidad: 'SENA / Gobierno de Colombia',
        monto: 'Hasta $100M - $180M COP',
        fechaCierre: '2026-08-20',
        categoria: 'Capital Semilla',
        tdr: 'Financiación condonable del 100% del plan de negocio para nuevas empresas formadas en Colombia con componentes de innovación y empleo.',
        urlOficial: 'https://www.fondoemprender.com',
        requisitosClave: ['Plan de negocio formalizado', 'Asesoría y validación SENA', 'Constitución de SAS']
      },
      {
        id: 'c2',
        nombre: 'APC Colombia - Fondo de Cooperación Sur-Sur & Triangular',
        entidad: 'Agencia Presidencial de Cooperación Internacional',
        monto: '$50,000 USD - $150,000 USD',
        fechaCierre: '2026-08-05',
        categoria: 'Subvención No Reembolsable',
        tdr: 'Subvención técnica y financiera no reembolsable para iniciativas de desarrollo sostenible, comunidades vulnerables y tecnologías limpias.',
        urlOficial: 'https://www.apccolombia.gov.co',
        requisitosClave: ['Entidad legal o alianza con ESAL', 'Matriz de Marco Lógico', 'Indicadores de impacto social']
      },
      {
        id: 'c3',
        nombre: 'BID Lab - Desafío de Innovación y Aceleración Tecnológica',
        entidad: 'Banco Interamericano de Desarrollo',
        monto: '$100,000 USD - $300,000 USD',
        fechaCierre: '2026-07-28',
        categoria: 'Capital Semilla & Aceleración',
        tdr: 'Financiamiento directo para modelos de negocio escalables de alto impacto ambiental o social en América Latina.',
        urlOficial: 'https://bidlab.org',
        requisitosClave: ['MVP funcional', 'Tracción preliminar', 'Modelo de ingresos validado']
      },
      {
        id: 'c4',
        nombre: 'iNNpulsa Colombia - Programa Vouchers de Innovación MGA',
        entidad: 'Ministerio de Comercio, Industria y Turismo',
        monto: '$40M COP',
        fechaCierre: '2026-07-10',
        categoria: 'Cofinanciación',
        tdr: 'Cofinanciación de prototipado y validación comercial para micro y pequeñas empresas registradas.',
        urlOficial: 'https://innpulsacolombia.com',
        requisitosClave: ['RUT activo con mínimo 6 meses de registro', 'Certificado de Existencia']
      }
    ]

    const convocatoriasConSemaforo = convocatorias.map(c => {
      const cierre = new Date(c.fechaCierre)
      const diffTime = cierre.getTime() - hoy.getTime()
      const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      let color = 'verde'
      if (diasRestantes <= 0) color = 'negro'
      else if (diasRestantes <= 8) color = 'rojo'
      else if (diasRestantes <= 20) color = 'amarillo'
      else color = 'verde'

      return {
        ...c,
        diasRestantes,
        colorSemaforo: color
      }
    })

    return NextResponse.json({
      proyectoNombre: 'Proyecto EcoInnovación Digital',
      pasosCompletadosCount: 12,
      totalPasos: 32,
      convocatorias: convocatoriasConSemaforo
    })
  } catch (error: any) {
    console.error('Error en /api/convocatorias/seguimiento:', error)
    return NextResponse.json({ error: error.message || 'Error al obtener convocatorias' }, { status: 500 })
  }
}
