import { createClient } from '@supabase/supabase-js';

// Inicializa el cliente de Supabase usando Service Role Key para operaciones administrativas
const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export interface SubscriptionStatus {
  activo: boolean;
  plan: string;
  dias_restantes: number;
  aristas_maximas: number;
  aristas_configuradas: string[];
  booking_unlocked: boolean;
  booking_confirmado: boolean;
  recomendaciones_unlocked: boolean;
  especialista_subvenciones_unlocked: boolean;
  upsell_aplicado: any;
  fecha_vencimiento: string;
  contrato_firmado: boolean;
  firma_digital: string;
  estado_actual: string;
}

/**
 * Valida el estado del plan, vigencia y límites de un proyecto en Supabase.
 */
export async function validateProjectAccess(proyectoId: string): Promise<SubscriptionStatus> {
  const supabase = getSupabaseClient();
  
  const { data: proyecto, error } = await supabase
    .from('proyectos_clientes_serving')
    .select('plan_pago, fecha_inicio_plan, fecha_vencimiento_plan, aristas_maximas, aristas_configuradas, upsell_aplicado, booking_confirmado, contrato_firmado, firma_digital, estado_actual')
    .eq('id', proyectoId)
    .single();

  if (error || !proyecto) {
    throw new Error(`No se pudo encontrar el proyecto con ID: ${proyectoId}`);
  }

  const now = new Date();
  const fechaVencimiento = new Date(proyecto.fecha_vencimiento_plan || now);
  const diasRestantes = Math.max(0, Math.ceil((fechaVencimiento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  const activo = diasRestantes > 0;

  const plan = (proyecto.plan_pago || 'Base').toUpperCase();

  // Mapeo de accesos de características por Plan
  const booking_unlocked = ['PRO', 'VIP', 'TOP'].includes(plan);
  const recomendaciones_unlocked = ['PRO', 'VIP', 'TOP'].includes(plan);
  const especialista_subvenciones_unlocked = ['PRO', 'VIP', 'TOP'].includes(plan);

  return {
    activo,
    plan,
    dias_restantes: diasRestantes,
    aristas_maximas: proyecto.aristas_maximas || 1,
    aristas_configuradas: proyecto.aristas_configuradas || [],
    booking_unlocked,
    booking_confirmado: !!proyecto.booking_confirmado,
    recomendaciones_unlocked,
    especialista_subvenciones_unlocked,
    upsell_aplicado: proyecto.upsell_aplicado || {},
    fecha_vencimiento: fechaVencimiento.toISOString(),
    contrato_firmado: !!proyecto.contrato_firmado,
    firma_digital: proyecto.firma_digital || '',
    estado_actual: proyecto.estado_actual || 'pendiente_firma'
  };
}

/**
 * Aplica o actualiza un Plan de Pago y un Upsell a un proyecto, recalculando vigencia y límites.
 * También dispara la validación de referidos si el estado pasa a "pago_aprobado" (Pago Realizado).
 */
export async function applyPlanAndUpsell(
  proyectoId: string, 
  plan: 'BASE' | 'PRO' | 'VIP' | 'TOP', 
  upsell: 'BASE_300' | 'PRO_500' | 'VIP_800' | 'TOP_1200' | null
): Promise<SubscriptionStatus> {
  const supabase = getSupabaseClient();

  const now = new Date();
  let mesesBase = 1;
  let aristasBase = 1;

  switch (plan) {
    case 'PRO':
      mesesBase = 2;
      aristasBase = 2;
      break;
    case 'VIP':
      mesesBase = 3;
      aristasBase = 2;
      break;
    case 'TOP':
      mesesBase = 4;
      aristasBase = 3;
      break;
    case 'BASE':
    default:
      mesesBase = 1;
      aristasBase = 1;
      break;
  }

  // Sumar meses adicionales y aristas si hay Upsell activo
  let mesesAdicionales = 0;
  let aristasFinales = aristasBase;
  let upsellInfo = {};

  if (upsell) {
    if (upsell === 'BASE_300' && plan === 'BASE') {
      mesesAdicionales = 3;
      aristasFinales = 1;
      upsellInfo = { tipo: 'BASE_300', descripcion: 'Extiende rastreo 1 arista por 3 meses adicionales', costo: 300 };
    } else if (upsell === 'PRO_500' && plan === 'PRO') {
      mesesAdicionales = 5;
      aristasFinales = 2;
      upsellInfo = { tipo: 'PRO_500', descripcion: 'Extiende rastreo 2 aristas por 5 meses adicionales', costo: 500 };
    } else if (upsell === 'VIP_800' && plan === 'VIP') {
      mesesAdicionales = 12;
      aristasFinales = 3; // Eleva a 3 aristas
      upsellInfo = { tipo: 'VIP_800', descripcion: 'Eleva a 3 aristas y extiende por 12 meses adicionales', costo: 800 };
    } else if (upsell === 'TOP_1200' && plan === 'TOP') {
      mesesAdicionales = 24;
      aristasFinales = 3;
      upsellInfo = { tipo: 'TOP_1200', descripcion: 'Extiende rastreo máximo 3 aristas por 24 meses adicionales', costo: 1200 };
    }
  }

  const totalMeses = mesesBase + mesesAdicionales;
  const fechaInicio = now;
  const fechaVencimiento = new Date(now);
  fechaVencimiento.setMonth(now.getMonth() + totalMeses);

  // Obtener estado anterior para verificar si es una nueva aprobación
  const { data: proyectoPrev } = await supabase
    .from('proyectos_clientes_serving')
    .select('estado_actual, estado_comercial')
    .eq('id', proyectoId)
    .single();

  const esNuevaAprobacion = proyectoPrev && 
    proyectoPrev.estado_actual !== 'pago_aprobado' && 
    proyectoPrev.estado_comercial !== 'Pago Realizado';

  // Guardar en la base de datos de Supabase
  const { error } = await supabase
    .from('proyectos_clientes_serving')
    .update({
      plan_pago: plan,
      fecha_inicio_plan: fechaInicio.toISOString(),
      fecha_vencimiento_plan: fechaVencimiento.toISOString(),
      aristas_maximas: aristasFinales,
      upsell_aplicado: upsellInfo,
      estado_comercial: 'Pago Realizado',
      estado_actual: 'pago_aprobado'
    })
    .eq('id', proyectoId);

  if (error) {
    throw new Error(`Error actualizando plan/upsell en Supabase: ${error.message}`);
  }

  // Si pasa a pago aprobado, procesar la conversión de referidos
  if (esNuevaAprobacion) {
    try {
      await handleReferralConversion(proyectoId);
    } catch (refErr) {
      console.error("Error al procesar referidos durante pago:", refErr);
    }
  }

  return validateProjectAccess(proyectoId);
}

/**
 * Guarda la configuración de aristas activas en Supabase para un proyecto, validando el límite.
 */
export async function updateConfiguredAristas(proyectoId: string, aristas: string[]): Promise<void> {
  const supabase = getSupabaseClient();
  const status = await validateProjectAccess(proyectoId);

  // Validaciones del Servidor
  if (!status.activo) {
    throw new Error("El plan de este proyecto ha vencido. Adquiera un plan o realice upsell para reactivarlo.");
  }

  if (aristas.length > status.aristas_maximas) {
    throw new Error(`Límite excedido. Su plan (${status.plan}) permite un máximo de ${status.aristas_maximas} aristas activas. Actualmente intentó activar ${aristas.length}.`);
  }

  // Actualizar en Supabase
  const { error } = await supabase
    .from('proyectos_clientes_serving')
    .update({
      aristas_configuradas: aristas
    })
    .eq('id', proyectoId);

  if (error) {
    throw new Error(`Error al guardar configuración de aristas en Supabase: ${error.message}`);
  }
}

/**
 * Maneja el ciclo de conversión de referidos cuando el pago de un proyecto es aprobado.
 */
export async function handleReferralConversion(proyectoId: string): Promise<void> {
  console.log(`-> Procesando programa de referidos para conversión de proyecto: ${proyectoId}`);
  const supabase = getSupabaseClient();

  // 1. Consultar el correo del cliente del proyecto aprobado
  const { data: proyecto } = await supabase
    .from('proyectos_clientes_serving')
    .select('correo_cliente')
    .eq('id', proyectoId)
    .single();

  if (!proyecto || !proyecto.correo_cliente) {
    console.log("-> No se pudo obtener el correo del cliente del proyecto para referidos.");
    return;
  }

  // 2. Buscar el perfil de usuario asociado en public.users
  const { data: usuario } = await supabase
    .from('users')
    .select('id, referido_por')
    .eq('email', proyecto.correo_cliente)
    .maybeSingle();

  if (!usuario) {
    console.log(`-> No se encontró perfil de usuario para el correo: ${proyecto.correo_cliente}. Saltando referidos.`);
    return;
  }

  if (!usuario.referido_por) {
    console.log(`-> El usuario (${proyecto.correo_cliente}) no ingresó bajo ningún código de referido.`);
    return;
  }

  // 3. Buscar al referente por su código único
  const { data: referente } = await supabase
    .from('users')
    .select('id, email, pagos_referidos_efectivos')
    .eq('codigo_referido_unico', usuario.referido_por)
    .maybeSingle();

  if (!referente) {
    console.log(`-> Referente con código ${usuario.referido_por} no encontrado.`);
    return;
  }

  // 4. Incrementar contador de referidos efectivos
  const nuevosPagosEfectivos = (referente.pagos_referidos_efectivos || 0) + 1;
  console.log(`-> Referente ${referente.email} acumula ${nuevosPagosEfectivos} referidos efectivos (Meta: 4).`);

  if (nuevosPagosEfectivos >= 4) {
    console.log(`\n======================================================`);
    console.log(`[TRIGGER AUTOMÁTICO - UPGRADE DE PLAN POR REFERIDOS]`);
    console.log(`Referente: ${referente.email} ha alcanzado 4 referidos exitosos!`);
    console.log(`Ejecutando Upgrade de Plan gratuito inmediato.`);
    console.log(`======================================================\n`);

    // Resetear contador a 0
    await supabase
      .from('users')
      .update({ pagos_referidos_efectivos: 0 })
      .eq('id', referente.id);

    // Ejecutar upgrade automático
    try {
      await applyReferralUpgrade(referente.email);
    } catch (upgErr) {
      console.error("Error aplicando upgrade al referente:", upgErr);
    }
  } else {
    // Actualizar contador normal
    await supabase
      .from('users')
      .update({ pagos_referidos_efectivos: nuevosPagosEfectivos })
      .eq('id', referente.id);
  }
}

/**
 * Realiza el upgrade de plan automático al siguiente nivel para el referente.
 */
export async function applyReferralUpgrade(emailReferente: string): Promise<void> {
  const supabase = getSupabaseClient();

  // Buscar el proyecto más reciente del referente
  const { data: proyectos } = await supabase
    .from('proyectos_clientes_serving')
    .select('id, plan_pago')
    .eq('correo_cliente', emailReferente)
    .order('created_at', { ascending: false })
    .limit(1);

  if (!proyectos || proyectos.length === 0) {
    console.log(`-> El referente ${emailReferente} no tiene proyectos activos para actualizar plan.`);
    return;
  }

  const proyectoReferente = proyectos[0];
  const planActual = (proyectoReferente.plan_pago || 'BASE').toUpperCase();
  let siguientePlan: 'BASE' | 'PRO' | 'VIP' | 'TOP' = 'PRO';

  if (planActual === 'BASE') {
    siguientePlan = 'PRO';
  } else if (planActual === 'PRO') {
    siguientePlan = 'VIP';
  } else if (planActual === 'VIP') {
    siguientePlan = 'TOP';
  } else if (planActual === 'TOP') {
    siguientePlan = 'TOP'; // Ya está en el nivel máximo
    console.log(`-> El referente ya se encuentra en el nivel de Plan máximo (TOP).`);
    return;
  }

  console.log(`-> Aplicando Upgrade de Plan: ${planActual} ➔ ${siguientePlan} para el proyecto ${proyectoReferente.id}`);
  
  // Aplicar nuevo plan (sin upsell)
  await applyPlanAndUpsell(proyectoReferente.id, siguientePlan, null);
}

/**
 * Aplica un cupón de aliado estratégico VIP/TOP de forma gratuita, bypassando pasarela de pago.
 */
export async function applyAllyCoupon(proyectoId: string, cupon: string): Promise<SubscriptionStatus> {
  const supabase = getSupabaseClient();
  
  const cuponNorm = cupon.trim().toUpperCase();
  
  const cuponesAliados: Record<string, { aliado: string; plan: 'VIP' | 'TOP'; upsell: any }> = {
    'HUGO_PELOC': { aliado: 'Hugo Peloc', plan: 'TOP', upsell: { tipo: 'TOP_1200', costo: 0, descripcion: 'Licencia Semilla Piloto Gratis (TOP) por Hugo Peloc' } },
    'HUGO_PELOC_VIP': { aliado: 'Hugo Peloc', plan: 'VIP', upsell: { tipo: 'VIP_800', costo: 0, descripcion: 'Licencia Semilla Piloto Gratis (VIP) por Hugo Peloc' } },
    'HUGO_PELOC_TOP': { aliado: 'Hugo Peloc', plan: 'TOP', upsell: { tipo: 'TOP_1200', costo: 0, descripcion: 'Licencia Semilla Piloto Gratis (TOP) por Hugo Peloc' } },
    
    'ROCIO_VELASCO': { aliado: 'Rocío Velasco', plan: 'VIP', upsell: { tipo: 'VIP_800', costo: 0, descripcion: 'Licencia Semilla Piloto Gratis (VIP) por Rocío Velasco' } },
    'ROCIO_VELASCO_VIP': { aliado: 'Rocío Velasco', plan: 'VIP', upsell: { tipo: 'VIP_800', costo: 0, descripcion: 'Licencia Semilla Piloto Gratis (VIP) por Rocío Velasco' } },
    'ROCIO_VELASCO_TOP': { aliado: 'Rocío Velasco', plan: 'TOP', upsell: { tipo: 'TOP_1200', costo: 0, descripcion: 'Licencia Semilla Piloto Gratis (TOP) por Rocío Velasco' } },
    
    'JEFF_DIAZGRANADOS': { aliado: 'Jeff Diazgranados', plan: 'VIP', upsell: { tipo: 'VIP_800', costo: 0, descripcion: 'Licencia Semilla Piloto Gratis (VIP) por Jeff Diazgranados' } },
    'JEFF_DIAZGRANADOS_VIP': { aliado: 'Jeff Diazgranados', plan: 'VIP', upsell: { tipo: 'VIP_800', costo: 0, descripcion: 'Licencia Semilla Piloto Gratis (VIP) por Jeff Diazgranados' } },
    'JEFF_DIAZGRANADOS_TOP': { aliado: 'Jeff Diazgranados', plan: 'TOP', upsell: { tipo: 'TOP_1200', costo: 0, descripcion: 'Licencia Semilla Piloto Gratis (TOP) por Jeff Diazgranados' } },
    
    'YEISON_ARCIA': { aliado: 'Yeison Arcia', plan: 'TOP', upsell: { tipo: 'TOP_1200', costo: 0, descripcion: 'Licencia Semilla Piloto Gratis (TOP) por Yeison Arcia' } },
    'YEISON_ARCIA_VIP': { aliado: 'Yeison Arcia', plan: 'VIP', upsell: { tipo: 'VIP_800', costo: 0, descripcion: 'Licencia Semilla Piloto Gratis (VIP) por Yeison Arcia' } },
    'YEISON_ARCIA_TOP': { aliado: 'Yeison Arcia', plan: 'TOP', upsell: { tipo: 'TOP_1200', costo: 0, descripcion: 'Licencia Semilla Piloto Gratis (TOP) por Yeison Arcia' } },
  };

  const config = cuponesAliados[cuponNorm];
  if (!config) {
    throw new Error(`El código de cupón '${cupon}' no es válido para licencias gratuitas de aliados del Holding.`);
  }

  const now = new Date();
  const totalMeses = config.plan === 'TOP' ? 24 : 12; 
  const aristasFinales = 3; 

  const fechaInicio = now;
  const fechaVencimiento = new Date(now);
  fechaVencimiento.setMonth(now.getMonth() + totalMeses);

  try {
    const { error } = await supabase
      .from('proyectos_clientes_serving')
      .update({
        plan_pago: config.plan,
        fecha_inicio_plan: fechaInicio.toISOString(),
        fecha_vencimiento_plan: fechaVencimiento.toISOString(),
        aristas_maximas: aristasFinales,
        upsell_aplicado: config.upsell,
        estado_comercial: 'Pago Realizado',
        estado_actual: 'pago_aprobado',
        pasarela_pago: 'Cupón Aliado',
        cupon_aliado_usado: cuponNorm,
        contrato_firmado: true,
        firma_digital: `Aliado: ${config.aliado}`
      })
      .eq('id', proyectoId);

    if (error) {
      console.warn("Error Supabase al actualizar mediante cupón:", error.message);
    }
  } catch (err) {
    console.warn("Fallo de red Supabase en aplicar cupón:", err);
  }

  return {
    activo: true,
    plan: config.plan,
    dias_restantes: totalMeses * 30,
    aristas_maximas: aristasFinales,
    aristas_configuradas: [],
    booking_unlocked: true,
    booking_confirmado: true,
    recomendaciones_unlocked: true,
    especialista_subvenciones_unlocked: true,
    upsell_aplicado: config.upsell,
    fecha_vencimiento: fechaVencimiento.toISOString(),
    contrato_firmado: true,
    firma_digital: `Aliado: ${config.aliado}`,
    estado_actual: 'pago_aprobado'
  };
}

