/**
 * Catálogo de las 29 matrices del Camino A y quién puede usar cuál.
 * Decidido el 13 nov 2026: Sencillo = 10 matrices, Completo = las 29.
 * Regla provisional (por confirmar): durante el mes del proyecto, sin plan pagado, se usan las del Sencillo.
 * Todo lo de "quién puede usar qué" vive aquí, en puedeUsar().
 */

import type { ClavePlan } from '@/lib/empresarial/membresia'

export type GrupoCatalogo = 'Entorno y cliente' | 'Negocio' | 'Finanzas' | 'Ventas' | 'Productividad' | 'Personas y riesgos' | 'Crecer'

export interface Matriz {
  clave: string
  titulo: string
  grupo: GrupoCatalogo
  plan: ClavePlan
  /** Dirección de la pantalla, o null si todavía no está construida. */
  ruta: string | null
  ayuda: string
}

export const MATRICES: Matriz[] = [
  // Plan Sencillo (10)
  { clave: 'entorno', titulo: 'Radar del Entorno', grupo: 'Entorno y cliente', plan: 'sencillo', ruta: '/empresarial/entorno', ayuda: 'Lo que pasa afuera y te ayuda o te perjudica.' },
  { clave: 'presiones', titulo: 'Mapa de Presiones del Sector', grupo: 'Entorno y cliente', plan: 'sencillo', ruta: '/empresarial/presiones', ayuda: 'Quién te aprieta y quién te protege.' },
  { clave: 'cliente', titulo: 'Mapa del Cliente', grupo: 'Entorno y cliente', plan: 'sencillo', ruta: '/empresarial/cliente', ayuda: 'Quién es tu cliente, qué necesita y dónde encontrarlo.' },
  { clave: 'lienzo', titulo: 'Lienzo de Negocio', grupo: 'Negocio', plan: 'sencillo', ruta: '/empresarial/lienzo', ayuda: 'Cómo funciona tu negocio en nueve piezas.' },
  { clave: 'propuesta', titulo: 'Propuesta de Valor', grupo: 'Negocio', plan: 'sencillo', ruta: '/empresarial/propuesta', ayuda: 'Por qué te elegirían a ti.' },
  { clave: 'metas', titulo: 'Tablero de Metas', grupo: 'Productividad', plan: 'sencillo', ruta: null, ayuda: 'Qué quieres lograr y cómo vas.' },
  { clave: 'flujo', titulo: 'Flujo de Caja a 12 meses', grupo: 'Finanzas', plan: 'sencillo', ruta: '/empresarial/calculadoras/flujo-caja', ayuda: 'En qué mes te quedas sin plata.' },
  { clave: 'costeo', titulo: 'Costeo', grupo: 'Finanzas', plan: 'sencillo', ruta: null, ayuda: 'Cuánto te cuesta lo que vendes.' },
  { clave: 'prioridades', titulo: 'Matriz de Prioridades', grupo: 'Productividad', plan: 'sencillo', ruta: null, ayuda: 'Qué hacer primero.' },
  { clave: 'riesgos', titulo: 'Termómetro de Riesgos', grupo: 'Personas y riesgos', plan: 'sencillo', ruta: '/empresarial/riesgos', ayuda: 'Qué podría salir mal y qué harás.' },
  // Solo Completo (19)
  { clave: 'ruta_compra', titulo: 'Ruta de Compra', grupo: 'Entorno y cliente', plan: 'completo', ruta: null, ayuda: 'Los pasos que da tu cliente hasta comprar.' },
  { clave: 'alianzas', titulo: 'Mapa de Alianzas', grupo: 'Negocio', plan: 'completo', ruta: null, ayuda: 'Con quién aliarte.' },
  { clave: 'precios', titulo: 'Matriz de Precios', grupo: 'Finanzas', plan: 'completo', ruta: null, ayuda: 'Cuánto cobrar y por qué.' },
  { clave: 'escenarios', titulo: 'Escenarios', grupo: 'Finanzas', plan: 'completo', ruta: '/empresarial/escenarios', ayuda: 'Qué pasa si todo sale peor, normal o mejor.' },
  { clave: 'financiacion', titulo: 'Plan de Financiación', grupo: 'Finanzas', plan: 'completo', ruta: null, ayuda: 'De dónde saldrá la plata.' },
  { clave: 'salud_financiera', titulo: 'Termómetro de Salud Financiera', grupo: 'Finanzas', plan: 'completo', ruta: null, ayuda: 'Cómo está el negocio por dentro.' },
  { clave: 'embudo', titulo: 'Embudo de Ventas', grupo: 'Ventas', plan: 'completo', ruta: null, ayuda: 'Cuántos se pierden en cada paso.' },
  { clave: 'canales', titulo: 'Matriz de Canales', grupo: 'Ventas', plan: 'completo', ruta: null, ayuda: 'Por dónde vender.' },
  { clave: 'clientes_valor', titulo: 'Clientes por Valor', grupo: 'Ventas', plan: 'completo', ruta: null, ayuda: 'Qué clientes valen más.' },
  { clave: 'calendario', titulo: 'Calendario Comercial', grupo: 'Ventas', plan: 'completo', ruta: null, ayuda: 'Cuándo vender qué.' },
  { clave: 'procesos', titulo: 'Mapa de Procesos', grupo: 'Productividad', plan: 'completo', ruta: null, ayuda: 'Cómo se hace cada cosa.' },
  { clave: 'responsables', titulo: 'Matriz de Responsables', grupo: 'Productividad', plan: 'completo', ruta: null, ayuda: 'Quién hace qué.' },
  { clave: 'indicadores', titulo: 'Tablero de Indicadores', grupo: 'Productividad', plan: 'completo', ruta: null, ayuda: 'Los números que miras cada semana.' },
  { clave: 'plan_b', titulo: 'Plan B', grupo: 'Personas y riesgos', plan: 'completo', ruta: null, ayuda: 'Qué haces si algo clave falla.' },
  { clave: 'roles', titulo: 'Mapa de Roles y Capacidades', grupo: 'Personas y riesgos', plan: 'completo', ruta: null, ayuda: 'Qué sabe hacer cada persona.' },
  { clave: 'crecimiento', titulo: 'Rutas de Crecimiento', grupo: 'Crecer', plan: 'completo', ruta: null, ayuda: 'Por dónde crecer.' },
  { clave: 'portafolio', titulo: 'Portafolio', grupo: 'Crecer', plan: 'completo', ruta: null, ayuda: 'Qué ofreces y qué conviene dejar.' },
  { clave: 'escalar', titulo: 'Preparación para Escalar', grupo: 'Crecer', plan: 'completo', ruta: null, ayuda: 'Si estás listo para crecer.' },
  { clave: 'proveedores', titulo: 'Mapa de Proveedores', grupo: 'Crecer', plan: 'completo', ruta: null, ayuda: 'De quién dependes.' },
]

export const ORDEN_GRUPOS: GrupoCatalogo[] = ['Entorno y cliente', 'Negocio', 'Finanzas', 'Ventas', 'Productividad', 'Personas y riesgos', 'Crecer']

export const TOTAL_SENCILLO = MATRICES.filter((m) => m.plan === 'sencillo').length
export const TOTAL_COMPLETO = MATRICES.length

export interface AccesoCatalogo {
  /** Hay acceso vigente (mes del proyecto o plan pagado al día). */
  activo: boolean
  /** null = todavía no ha pagado ningún plan (mes del proyecto). */
  plan: ClavePlan | null
}

/**
 * ¿Puede esta persona abrir esta matriz?
 * - Sin acceso vigente: no (va a Mi plan).
 * - Mes del proyecto (sin plan pagado): las del Sencillo. REGLA PROVISIONAL por confirmar con el dueño.
 * - Plan Sencillo: las del Sencillo. Plan Completo: todas.
 */
export function puedeUsar(m: Matriz, acceso: AccesoCatalogo): boolean {
  if (!acceso.activo) return false
  const planEfectivo: ClavePlan = acceso.plan ?? 'sencillo'
  return planEfectivo === 'completo' || m.plan === 'sencillo'
}

export type EstadoMatriz = 'abrir' | 'muy_pronto' | 'en_plan_completo' | 'sin_acceso'

/** Qué botón mostrar en el catálogo. */
export function estadoMatriz(m: Matriz, acceso: AccesoCatalogo): EstadoMatriz {
  if (!acceso.activo) return 'sin_acceso'
  if (!puedeUsar(m, acceso)) return 'en_plan_completo'
  return m.ruta ? 'abrir' : 'muy_pronto'
}
