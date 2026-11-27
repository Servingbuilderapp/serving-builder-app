import { createClient } from '@/lib/supabase/server'
import { clienteAdmin } from '@/lib/empresarial/membresia'
import { extraerTexto } from '@/lib/extraerDocumento'
import type { DatosEntrada } from '@/lib/empresarial/proyectoHecho'

export interface FilaEntrada {
  id: string
  proyecto_id: string
  user_id: string
  idea: string | null
  documento_ruta: string | null
  documento_nombre: string | null
  tipo_negocio: string | null
  etapa: string | null
  dinero_inicial: string | null
  tiempo_dedicado: string | null
  ya_vendio: boolean | null
  a_quien_vende: string | null
  ciudad: string | null
  personas: number | null
  tramo: string | null
  precio_base_cop: number | null
  precio_total_cop: number | null
  muestra: unknown
  estado_pago: string
  bold_order_id: string | null
  proyecto_final: string | null
}

export const COLUMNAS_ENTRADA =
  'id, proyecto_id, user_id, idea, documento_ruta, documento_nombre, tipo_negocio, etapa, dinero_inicial, tiempo_dedicado, ya_vendio, a_quien_vende, ciudad, personas, tramo, precio_base_cop, precio_total_cop, muestra, estado_pago, bold_order_id, proyecto_final'

/** Sesión + fila de la persona. Solo devuelve lo que es suyo. */
export async function entradaDeLaPersona(proyectoId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { error: 'Inicia sesión para continuar.', status: 401 as const }

  const { data } = await supabase
    .from('sfpe_entrada')
    .select(COLUMNAS_ENTRADA)
    .eq('proyecto_id', proyectoId)
    .eq('user_id', user.id)
    .maybeSingle()
  if (!data) return { error: 'No encontramos tu proyecto.', status: 404 as const }

  const { data: proyecto } = await supabase.from('sfpe_proyectos').select('nombre, pais').eq('id', proyectoId).maybeSingle()
  return {
    user,
    entrada: data as unknown as FilaEntrada,
    nombre: (proyecto?.nombre as string | undefined) ?? 'Mi proyecto',
    pais: (proyecto?.pais as string | null | undefined) ?? null,
  }
}

/** Lee el documento que subió (si lo hay) y arma lo que se le entrega a la IA. */
export async function datosParaIA(e: FilaEntrada, nombre: string, pais: string | null): Promise<{ datos: DatosEntrada; avisoDocumento: string | null }> {
  let texto = ''
  let aviso: string | null = null
  if (e.documento_ruta) {
    const { data: archivo, error } = await clienteAdmin().storage.from('documentos-proyectos').download(e.documento_ruta)
    if (error || !archivo) {
      aviso = 'No pudimos abrir tu documento.'
    } else {
      const lectura = await extraerTexto(Buffer.from(await archivo.arrayBuffer()), e.documento_nombre ?? e.documento_ruta)
      texto = lectura.texto
      aviso = lectura.error
    }
  }
  return {
    avisoDocumento: aviso,
    datos: {
      nombre,
      idea: e.idea,
      textoDocumento: texto,
      tipo_negocio: e.tipo_negocio,
      etapa: e.etapa,
      dinero_inicial: e.dinero_inicial,
      tiempo_dedicado: e.tiempo_dedicado,
      ya_vendio: e.ya_vendio,
      a_quien_vende: e.a_quien_vende,
      ciudad: e.ciudad,
      pais,
      personas: e.personas,
    },
  }
}
