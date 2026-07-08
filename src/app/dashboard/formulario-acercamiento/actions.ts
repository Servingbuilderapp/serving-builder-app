'use server'

import { createClient } from '@supabase/supabase-js'
import { calculatePredictiveRouting } from '@/lib/routingEngine'

export async function submitFormularioAction(payload: any) {
  // Inicializamos el cliente de Supabase usando la llave maestra (Service Role Key)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Calcular el enrutamiento predictivo a partir de las respuestas de Fase 1
  const montoSolicitado = Number(payload.monto_solicitado_cop) || 0
  const respuestasFase1 = payload.respuestas_fase1_json || {}
  
  let routingResult = {
    routing_predictivo: {},
    experto_sugerido_id: null,
    vertical_asignada: 'Banca'
  }

  try {
    const result = await calculatePredictiveRouting(
      respuestasFase1,
      montoSolicitado,
      payload.nombre_iniciativa || 'Iniciativa'
    )
    routingResult = {
      routing_predictivo: result.routing_predictivo,
      experto_sugerido_id: result.experto_sugerido_id as any,
      vertical_asignada: result.vertical_asignada
    }
  } catch (err) {
    console.error("Error calculando enrutamiento predictivo:", err)
  }

  // Enriquecemos el payload con los resultados del enrutamiento y la vertical asignada
  const enrichedPayload = {
    ...payload,
    vertical_asignada: routingResult.vertical_asignada,
    aristas_impacto_json: {
      routing_predictivo: routingResult.routing_predictivo
    },
    experto_sugerido_id: routingResult.experto_sugerido_id
  }

  const { data, error } = await supabase
    .from('proyectos_clientes_serving')
    .insert([enrichedPayload])
    .select()
    .single()

  if (error) {
    console.error("Error de Supabase al insertar proyecto:", error)
    throw new Error(error.message)
  }

  return data
}

