import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { plan, contrato, dayZero } = body

    if (!contrato?.nombreFirmante || !contrato?.documentoIdentidad) {
      return NextResponse.json({ error: 'Faltan datos de firma de contrato' }, { status: 400 })
    }

    if (!dayZero?.videoUrl || !dayZero?.documentoFilename || !dayZero?.respuestas22) {
      return NextResponse.json({ error: 'Faltan entregables del Day Zero' }, { status: 400 })
    }

    // Registro exitoso del Day Zero
    const dayZeroRecord = {
      id: `dz-${Date.now()}`,
      fechaRegistro: new Date().toISOString(),
      fechaLimiteEntrega: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 días
      planId: plan.id,
      cliente: contrato.nombreFirmante,
      documento: contrato.documentoIdentidad,
      email: contrato.emailFirmante,
      status: 'day_zero_validado'
    }

    return NextResponse.json({ success: true, record: dayZeroRecord })
  } catch (error: any) {
    console.error('Error en Day Zero API:', error)
    return NextResponse.json({ error: error.message || 'Error al registrar Day Zero' }, { status: 500 })
  }
}
