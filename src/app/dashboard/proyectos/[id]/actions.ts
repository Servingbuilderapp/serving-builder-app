'use server'

import { createClient } from '@supabase/supabase-js'
import { translateBrandsInObject } from '@/lib/brandProtector'

export async function getProyectoAction(id: string) {
  // Inicializamos Supabase con la Llave Maestra (Service Role Key)
  // para poder leer cualquier proyecto sin importar el RLS.
  // Como esto se ejecuta en el backend, la llave jamás llega al navegador del usuario.
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: proyecto, error } = await supabase
    .from('proyectos_clientes_serving')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !proyecto) {
    console.error("Error leyendo proyecto desde Server Action:", error)
    return null
  }

  // Obtener información de referidos del perfil del usuario
  let codigoReferido = 'SERV-' + id.slice(0, 4).toUpperCase();
  let pagosReferidos = 0;
  try {
    const { data: userProfile } = await supabase
      .from('users')
      .select('codigo_referido_unico, pagos_referidos_efectivos')
      .eq('email', proyecto.correo_cliente)
      .maybeSingle();
    if (userProfile) {
      codigoReferido = userProfile.codigo_referido_unico || codigoReferido;
      pagosReferidos = userProfile.pagos_referidos_efectivos || 0;
    }
  } catch (err) {
    console.error("Error al obtener perfil de referidos:", err);
  }

  // Obtener datos relacionados de los Pasos #6 al #19
  const { data: articulacion } = await supabase
    .from('articulacion_politica')
    .select('*')
    .eq('proyecto_id', id)
    .maybeSingle();

  const { data: descripcionProblema } = await supabase
    .from('descripcion_problema_linea_base')
    .select('*')
    .eq('proyecto_id', id)
    .maybeSingle();

  const { data: impactos } = await supabase
    .from('resultados_impactos')
    .select('*')
    .eq('proyecto_id', id)
    .maybeSingle();

  const { data: problemas } = await supabase
    .from('problemas_proyecto')
    .select('*')
    .eq('proyecto_id', id);

  const { data: objetivos } = await supabase
    .from('objetivos_proyecto')
    .select('*')
    .eq('proyecto_id', id);

  let actividades: any[] = [];
  if (objetivos && objetivos.length > 0) {
    const objetivoIds = objetivos.map(o => o.id);
    const { data: acts } = await supabase
      .from('cadena_valor_actividades')
      .select('*')
      .in('objetivo_especifico_id', objetivoIds);
    actividades = acts || [];
  }

  // Obtener datos del Plan Operativo PERT (Paso #21) y de la Evaluación de Viabilidad (Paso #32)
  const { data: planOperativo } = await supabase
    .from('plan_operativo_detallado')
    .select('*')
    .eq('proyecto_id', id);

  const { data: evaluacion } = await supabase
    .from('evaluacion_multicriterio')
    .select('*')
    .eq('proyecto_id', id)
    .maybeSingle();

  const result = {
    ...proyecto,
    resultado_agent_json: proyecto.resultado_agente_json, // Map database column to UI property name
    articulacion,
    descripcion_problema: descripcionProblema,
    impactos,
    problemas: problemas || [],
    objetivos: objetivos || [],
    actividades,
    plan_operativo: planOperativo || [],
    evaluacion: evaluacion || null,
    codigo_referido_unico: codigoReferido,
    pagos_referidos_efectivos: pagosReferidos
  };

  return translateBrandsInObject(result);
}


export async function agendarCitaAction(id: string, asesor: string, fecha: string, hora: string) {
  console.log("-> agendarCitaAction iniciada para ID:", id);
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Obtener el expediente financiero (preguntas 28 a 32)
    const { data: proyectoData } = await supabase
      .from('proyectos_clientes_serving')
      .select('respuestas_fase2_json')
      .eq('id', id)
      .single();

    const respuestasF2 = proyectoData?.respuestas_fase2_json || {};
    const expedienteFinanciero = {
      pregunta_28_presupuesto: respuestasF2.f2_q28_presupuesto || respuestasF2.f2_q28 || 'No registrada',
      pregunta_29_flujo_caja: respuestasF2.f2_q29_flujo_caja || respuestasF2.f2_q29 || 'No registrada',
      pregunta_30_costos: respuestasF2.f2_q30_costos || respuestasF2.f2_q30 || 'No registrada',
      pregunta_31_ingresos: respuestasF2.f2_q31_ingresos || respuestasF2.f2_q31 || 'No registrada',
      pregunta_32_indicadores: respuestasF2.f2_q32_indicadores || respuestasF2.f2_q32 || 'No registrada'
    };

    console.log(`\n======================================================`);
    console.log(`[DESPACHO AUTOMÁTICO - HUMANO EN LOOP]`);
    console.log(`Despachando Expediente Financiero a: ${asesor}`);
    console.log(`Proyecto ID: ${id}`);
    console.log(`Detalles del Expediente Financiero:`, JSON.stringify(expedienteFinanciero, null, 2));
    console.log(`======================================================\n`);

    const { error } = await supabase
      .from('proyectos_clientes_serving')
      .update({ 
        asesor_asignado: asesor,
        fecha_cita: fecha,
        hora_cita: hora,
        estado_comercial: 'Cita Agendada',
        booking_confirmado: true
      })
      .eq('id', id)

    if (error) {
      console.error("-> Error de Supabase en agendarCitaAction:", error);
      throw new Error(error.message)
    }
    console.log("-> Cita agendada exitosamente en Supabase.");
    return true;
  } catch (err) {
    console.error("-> Error catched en agendarCitaAction:", err);
    throw err;
  }
}

// ====================================================================
// ACCIONES PARA LA ARQUITECTURA COMERCIAL Y LIMITACIONES DE ARISTAS
// ====================================================================

import { updateConfiguredAristas, applyPlanAndUpsell, applyAllyCoupon } from '@/lib/subscriptionEngine';
import { calculatePredictiveRouting } from '@/lib/routingEngine';

export async function updateConfiguredAristasAction(proyectoId: string, aristas: string[]) {
  console.log(`-> Actualizando aristas configuradas para ${proyectoId}:`, aristas);
  try {
    await updateConfiguredAristas(proyectoId, aristas);
    return { success: true };
  } catch (err: any) {
    console.error("Error en updateConfiguredAristasAction:", err);
    return { success: false, error: err.message };
  }
}

export async function applyPlanAndUpsellAction(
  proyectoId: string,
  plan: 'BASE' | 'PRO' | 'VIP' | 'TOP',
  upsell: 'BASE_300' | 'PRO_500' | 'VIP_800' | 'TOP_1200' | null
) {
  console.log(`-> Aplicando Plan ${plan} y Upsell ${upsell} al proyecto ${proyectoId}`);
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1. Aplicar plan y upsell
    const status = await applyPlanAndUpsell(proyectoId, plan, upsell);

    // 2. Obtener respuestas de Fase 1 para recalcular el enrutamiento predictivo
    const { data: proyecto } = await supabase
      .from('proyectos_clientes_serving')
      .select('respuestas_fase1_json, monto_solicitado_cop, aristas_impacto_json')
      .eq('id', proyectoId)
      .single();

    if (proyecto) {
      // 3. Recalcular enrutamiento predictivo basándose en el nuevo plan
      const routingResult = await calculatePredictiveRouting(
        proyecto.respuestas_fase1_json,
        proyecto.monto_solicitado_cop || 0,
        proyectoId
      );

      // 4. Actualizar enrutamiento en base de datos
      const aristasImpacto = proyecto.aristas_impacto_json || {};
      await supabase
        .from('proyectos_clientes_serving')
        .update({
          vertical_asignada: routingResult.vertical_asignada,
          asesor_asignado: routingResult.experto_sugerido_nombre,
          aristas_impacto_json: {
            ...aristasImpacto,
            routing_predictivo: routingResult.routing_predictivo
          }
        })
        .eq('id', proyectoId);
    }

    return { success: true, status };
  } catch (err: any) {
    console.error("Error en applyPlanAndUpsellAction:", err);
    return { success: false, error: err.message };
  }
}

export async function firmarContratoAction(proyectoId: string, firmaNombre: string) {
  console.log(`-> Firmando contrato legal para el proyecto ${proyectoId}. Firmante: ${firmaNombre}`);
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase
      .from('proyectos_clientes_serving')
      .update({
        contrato_firmado: true,
        firma_digital: firmaNombre,
        estado_actual: 'contrato_firmado'
      })
      .eq('id', proyectoId);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  } catch (err: any) {
    console.error("Error en firmarContratoAction:", err);
    return { success: false, error: err.message };
  }
}

export async function applyAllyCouponAction(proyectoId: string, cupon: string) {
  console.log(`-> Aplicando cupón de aliado '${cupon}' al proyecto ${proyectoId}`);
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const status = await applyAllyCoupon(proyectoId, cupon);

    const { data: proyecto } = await supabase
      .from('proyectos_clientes_serving')
      .select('respuestas_fase1_json, monto_solicitado_cop, aristas_impacto_json')
      .eq('id', proyectoId)
      .single();

    if (proyecto) {
      const routingResult = await calculatePredictiveRouting(
        proyecto.respuestas_fase1_json,
        proyecto.monto_solicitado_cop || 0,
        proyectoId
      );

      const aristasImpacto = proyecto.aristas_impacto_json || {};
      await supabase
        .from('proyectos_clientes_serving')
        .update({
          vertical_asignada: routingResult.vertical_asignada,
          asesor_asignado: routingResult.experto_sugerido_nombre,
          aristas_impacto_json: {
            ...aristasImpacto,
            routing_predictivo: routingResult.routing_predictivo
          }
        })
        .eq('id', proyectoId);
    }

    return { success: true, status };
  } catch (err: any) {
    console.error("Error en applyAllyCouponAction:", err);
    return { success: false, error: err.message };
  }
}



