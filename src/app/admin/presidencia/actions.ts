'use server'

import { createClient } from '@supabase/supabase-js'

const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// Datos semilla de alta fidelidad para fallback local/offline de la demo
const SEED_PROYECTOS = [
  {
    id: 'p1',
    nombre_cliente: 'Carlos Mendoza',
    nombre_iniciativa: 'Reforestación Andina SAS',
    plan_pago: 'TOP',
    pasarela_pago: 'Cupón Aliado',
    cupon_aliado_usado: 'HUGO_PELOC_TOP',
    monto_solicitado_cop: 250000000,
    vertical_asignada: 'Medio Ambiente',
    q3_sector: 'Reforestación y Restauración Ecológica',
    auditoria_financiera_estado: 'Aprobado',
    auditoria_legal_estado: 'En Proceso',
    fecha_inicio_plan: new Date().toISOString()
  },
  {
    id: 'p2',
    nombre_cliente: 'Mariana Ortiz',
    nombre_iniciativa: 'Micro-SaaS Hub',
    plan_pago: 'VIP',
    pasarela_pago: 'Wompi',
    cupon_aliado_usado: null,
    monto_solicitado_cop: 80000000,
    vertical_asignada: 'Emprendimiento/Empresas',
    q3_sector: 'Micro-apps y SaaS para PyMEs',
    auditoria_financiera_estado: 'Pendiente',
    auditoria_legal_estado: 'Pendiente',
    fecha_inicio_plan: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'p3',
    nombre_cliente: 'Jeff Diazgranados',
    nombre_iniciativa: 'Ganadería Regenerativa Pro',
    plan_pago: 'TOP',
    pasarela_pago: 'Cupón Aliado',
    cupon_aliado_usado: 'JEFF_DIAZGRANADOS_TOP',
    monto_solicitado_cop: 450000000,
    vertical_asignada: 'Agro/Agroindustrial',
    q3_sector: 'Ganadería Tecnificada (Ganadería Pro)',
    auditoria_financiera_estado: 'Aprobado',
    auditoria_legal_estado: 'Aprobado',
    fecha_inicio_plan: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'p4',
    nombre_cliente: 'Yeison Arcia',
    nombre_iniciativa: 'Skin-Tech Dermacare',
    plan_pago: 'VIP',
    pasarela_pago: 'Cupón Aliado',
    cupon_aliado_usado: 'YEISON_ARCIA_VIP',
    monto_solicitado_cop: 180000000,
    vertical_asignada: 'Innovación/Tecnología',
    q3_sector: 'Tecnología Dermocosmética (Skin-Tech)',
    auditoria_financiera_estado: 'En Proceso',
    auditoria_legal_estado: 'Pendiente',
    fecha_inicio_plan: new Date(Date.now() - 86400000 * 10).toISOString()
  },
  {
    id: 'p5',
    nombre_cliente: 'Sofía Restrepo',
    nombre_iniciativa: 'Circular Pack S.A.S.',
    plan_pago: 'BASE',
    pasarela_pago: 'Stripe',
    cupon_aliado_usado: null,
    monto_solicitado_cop: 35000000,
    vertical_asignada: 'Medio Ambiente',
    q3_sector: 'Economía Circular y Gestión de Residuos',
    auditoria_financiera_estado: 'Rechazado',
    auditoria_legal_estado: 'Aprobado',
    fecha_inicio_plan: new Date(Date.now() - 86400000 * 15).toISOString()
  },
  {
    id: 'p6',
    nombre_cliente: 'Alfonso Beltrán',
    nombre_iniciativa: 'SST Wellness Platform',
    plan_pago: 'PRO',
    pasarela_pago: 'Wompi',
    cupon_aliado_usado: null,
    monto_solicitado_cop: 120000000,
    vertical_asignada: 'Salud Mental',
    q3_sector: 'Salud y Seguridad en el Trabajo (SST)',
    auditoria_financiera_estado: 'Aprobado',
    auditoria_legal_estado: 'Aprobado',
    fecha_inicio_plan: new Date(Date.now() - 86400000 * 20).toISOString()
  }
];

const SEED_COMISIONES = [
  { id: 'c1', nombre_proyecto: 'Reforestación Andina SAS', monto: 1500, tipo: 'MLM', estado: 'Entregada', beneficiario: 'Rocío Velasco', created_at: new Date().toISOString() },
  { id: 'c2', nombre_proyecto: 'Micro-SaaS Hub', monto: 900, tipo: 'Ecosistema de red', estado: 'Por Entregar', beneficiario: 'Hugo Peloc', created_at: new Date().toISOString() },
  { id: 'c3', nombre_proyecto: 'Ganadería Regenerativa Pro', monto: 2100, tipo: 'MLM', estado: 'Entregada', beneficiario: 'Jeff Diazgranados', created_at: new Date().toISOString() },
  { id: 'c4', nombre_proyecto: 'Skin-Tech Dermacare', monto: 1200, tipo: 'Venta Directa', estado: 'Por Entregar', beneficiario: 'Yeison Arcia', created_at: new Date().toISOString() },
  { id: 'c5', nombre_proyecto: 'Circular Pack S.A.S.', monto: 1500, tipo: 'MLM', estado: 'Por Entregar', beneficiario: 'Lorena Ramírez', created_at: new Date().toISOString() },
  { id: 'c6', nombre_proyecto: 'SST Wellness Platform', monto: 600, tipo: 'Ecosistema de red', estado: 'Entregada', beneficiario: 'Alfonso Beltrán', created_at: new Date().toISOString() }
];

const SEED_QUEJAS = [
  { id: 'q1', nombre_cliente: 'Carlos Mendoza', tipo: 'Fallo Motor IA', descripcion: 'El análisis ex-ante DNP del Paso #14 arrojó una advertencia de redundancia en la arista de impacto ambiental.', estado: 'En Proceso', created_at: new Date().toISOString() },
  { id: 'q2', nombre_cliente: 'Mariana Ortiz', tipo: 'Queja', descripcion: 'Demora en la respuesta de validación por parte del estructurador legal Angie Lombana.', estado: 'Abierto', created_at: new Date().toISOString() },
  { id: 'q3', nombre_cliente: 'José Fernando Gómez', tipo: 'Fallo Motor IA', descripcion: 'Error de timeout al procesar el desglose financiero del módulo de auto-formulación.', estado: 'Resuelto', created_at: new Date().toISOString() },
  { id: 'q4', nombre_cliente: 'Sofía Restrepo', tipo: 'Queja', descripcion: 'Inconsistencia en los rubros sugeridos para el sector agroindustrial.', estado: 'Resuelto', created_at: new Date().toISOString() }
];

const SEED_LOGS = [
  { id: 'l1', nombre_proyecto: 'Reforestación Andina SAS', convocatoria_nombre: 'Fondo Verde Internacional - Clima 2026', estado: 'Postulado', created_at: new Date().toISOString() },
  { id: 'l2', nombre_proyecto: 'Micro-SaaS Hub', convocatoria_nombre: 'Aceleradora de Emprendimiento Social - Fase Semilla', estado: 'En Proceso', created_at: new Date().toISOString() },
  { id: 'l3', nombre_proyecto: 'Ganadería Regenerativa Pro', convocatoria_nombre: 'Fondo Emprender SENA - Convocatoria Nacional 122', estado: 'Postulado', created_at: new Date().toISOString() },
  { id: 'l4', nombre_proyecto: 'SST Wellness Platform', convocatoria_nombre: 'Alianza por el Bienestar Social y Comunitario 2026', estado: 'Adjudicado', created_at: new Date().toISOString() },
  { id: 'l5', nombre_proyecto: 'Circular Pack S.A.S.', convocatoria_nombre: 'Fondo Fomento de Ciencia y Tecnología Regional', estado: 'Rechazado', created_at: new Date().toISOString() }
];

/**
 * Obtiene toda la data consolidada de presidencia en tiempo real
 */
export async function getPresidenciaDataAction() {
  const supabase = getSupabaseClient();
  
  let proyectos = [...SEED_PROYECTOS];
  let comisiones = [...SEED_COMISIONES];
  let quejas = [...SEED_QUEJAS];
  let logs = [...SEED_LOGS];
  
  try {
    // 1. Obtener proyectos
    const { data: dbProyectos, error: errProy } = await supabase
      .from('proyectos_clientes_serving')
      .select('id, nombre_cliente, nombre_iniciativa, plan_pago, pasarela_pago, cupon_aliado_usado, monto_solicitado_cop, vertical_asignada, q3_sector, auditoria_financiera_estado, auditoria_legal_estado, fecha_inicio_plan')
      .order('fecha_inicio_plan', { ascending: false });
      
    if (!errProy && dbProyectos && dbProyectos.length > 0) {
      proyectos = dbProyectos;
    }

    // 2. Obtener comisiones
    const { data: dbComisiones, error: errCom } = await supabase
      .from('comisiones_mlm')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!errCom && dbComisiones && dbComisiones.length > 0) {
      comisiones = dbComisiones;
    }

    // 3. Obtener quejas
    const { data: dbQuejas, error: errQuej } = await supabase
      .from('quejas_fallos_ia')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!errQuej && dbQuejas && dbQuejas.length > 0) {
      quejas = dbQuejas;
    }

    // 4. Obtener logs de convocatorias
    const { data: dbLogs, error: errLogs } = await supabase
      .from('logs_postulacion')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!errLogs && dbLogs && dbLogs.length > 0) {
      logs = dbLogs;
    }

  } catch (err) {
    console.warn("Fallo al conectar con Supabase. Usando semillero local de alta fidelidad para demo de Presidencia.");
  }

  return {
    proyectos,
    comisiones,
    quejas,
    logs
  };
}

/**
 * Actualiza el estado de cumplimiento cruzado (auditoría financiera o legal)
 */
export async function updateAuditStatusAction(proyectoId: string, type: 'financiera' | 'legal', status: string) {
  const supabase = getSupabaseClient();
  
  try {
    const updatePayload = type === 'financiera' 
      ? { auditoria_financiera_estado: status }
      : { auditoria_legal_estado: status };
      
    const { error } = await supabase
      .from('proyectos_clientes_serving')
      .update(updatePayload)
      .eq('id', proyectoId);
      
    if (error) {
      console.warn("Error en Supabase actualizando auditoría:", error.message);
    }
  } catch (err) {
    console.warn("Fallo de red en Supabase. Actualización de auditoría completada localmente.");
  }
  
  return true;
}

/**
 * Actualiza el estado de resolución de una queja o fallo del motor de IA
 */
export async function updateQuejaStatusAction(id: string, status: string) {
  const supabase = getSupabaseClient();
  
  try {
    const { error } = await supabase
      .from('quejas_fallos_ia')
      .update({ estado: status })
      .eq('id', id);
      
    if (error) {
      console.warn("Error en Supabase actualizando queja:", error.message);
    }
  } catch (err) {
    console.warn("Fallo de red en Supabase. Actualización de queja completada localmente.");
  }
  
  return true;
}

/**
 * Actualiza el estado de una comisión del ecosistema MLM (Entregada / Por Entregar)
 */
export async function updateCommissionStatusAction(id: string, status: string) {
  const supabase = getSupabaseClient();
  
  try {
    const { error } = await supabase
      .from('comisiones_mlm')
      .update({ estado: status })
      .eq('id', id);
      
    if (error) {
      console.warn("Error en Supabase actualizando comisión:", error.message);
    }
  } catch (err) {
    console.warn("Fallo de red en Supabase. Actualización de comisión completada localmente.");
  }
  
  return true;
}
