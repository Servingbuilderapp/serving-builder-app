import { createClient } from '@supabase/supabase-js'

// Registro de cada corrida de los procesos del Centinela (tabla centinela_registro).
// Nunca lanza error: si falla el registro, el proceso sigue como si nada.

export type ProcesoCentinela = 'alertas' | 'boletines' | 'fuentes' | 'enlaces' | 'terminos'

type Cuerpo = Record<string, unknown> | null | undefined

function num(valor: unknown): number {
  const n = Number(valor)
  return Number.isFinite(n) ? n : 0
}

function contarDetalle(lista: unknown, empieza: string[]): number {
  if (!Array.isArray(lista)) return 0
  return lista.filter((x) => {
    const r = String((x as { resultado?: unknown })?.resultado ?? '')
    return empieza.some((p) => r.startsWith(p))
  }).length
}

export async function registrarCorrida(proceso: ProcesoCentinela, status: number, cuerpo: Cuerpo): Promise<void> {
  try {
    const b: Record<string, unknown> = cuerpo || {}
    let leidos = 0
    let nuevas = 0
    let errores = 0

    if (proceso === 'alertas') {
      leidos = num(b.correos_revisados)
      nuevas = num(b.convocatorias_guardadas)
    } else if (proceso === 'boletines') {
      leidos = num(b.boletines_leidos)
      nuevas = num(b.convocatorias_guardadas)
      errores = num(b.boletines_con_fallo)
    } else if (proceso === 'fuentes') {
      leidos = num(b.fuentes_revisadas)
      nuevas = num(b.convocatorias_guardadas_en_este_lote)
      errores = num(b.fuentes_con_error)
    } else if (proceso === 'enlaces') {
      leidos = contarDetalle(b.detalle, ['completada'])
      errores = contarDetalle(b.detalle, ['falló', 'error'])
    } else if (proceso === 'terminos') {
      leidos = contarDetalle(b.resultado, ['guardado'])
      errores = contarDetalle(b.resultado, ['falló'])
    }

    const fallo = status >= 400 || !!b.error
    if (fallo) errores += 1

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
    await supabase.from('centinela_registro').insert({
      proceso,
      estado: fallo ? 'error' : 'ok',
      leidos,
      nuevas,
      errores,
      mensaje: fallo ? String(b.error || 'Error').slice(0, 500) : null,
    })
  } catch (e) {
    console.error('[registroCentinela]', e)
  }
}
