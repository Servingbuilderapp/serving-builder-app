/**
 * Los tipos de réplica, solos.
 *
 * Este archivo existe aparte de `motorReplica.ts` a propósito: no importa
 * NADA que solo funcione en el servidor (nada de `next/server`, nada de
 * `candadoMotores`). Así, una pantalla del cliente (como
 * `VariantesReplicaClient.tsx`) puede usar esta lista sin arrastrar al
 * navegador código que solo debe correr en el servidor — que es justo lo que
 * pasaba antes y hacía fallar la compilación en Vercel.
 */

export const TIPOS_REPLICA = [
  'misma convocatoria',
  'otra convocatoria',
  'otro territorio',
  'otros beneficiarios',
  'otro proponente',
  'otros aliados',
  'otra linea tematica',
  'otro enfoque sectorial',
  'otro enfoque de innovacion',
  'otro monto',
  'otro alcance de metas',
] as const

export type TipoReplica = (typeof TIPOS_REPLICA)[number]
