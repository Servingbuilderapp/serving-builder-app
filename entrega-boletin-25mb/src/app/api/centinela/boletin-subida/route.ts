import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { esEquipoServing } from '@/lib/guardiaEquipo'

/**
 * CENTINELA — PERMISO PARA SUBIR UN BOLETÍN GRANDE.
 *
 * Vercel no deja pasar peticiones de más de 4,5 MB, así que un boletín pesado no puede viajar
 * por el servidor. En lugar de eso, esta ruta le entrega al equipo un permiso de un solo uso para
 * subir el archivo DIRECTO a Supabase Storage (hasta 25 MB). Después, "subir-boletin" lo lee desde allí.
 *
 * Crea el depósito privado "boletines-centinela" la primera vez, si no existe. No toca ningún otro
 * depósito ni ningún dato existente.
 *
 * POST JSON: { nombre }  →  { bucket, ruta, token }
 * Solo el equipo de Serving.
 */

const BUCKET_BOLETINES = 'boletines-centinela'
const MAX_BYTES_BOLETIN = 25 * 1024 * 1024

export async function POST(req: NextRequest) {
  try {
    if (!(await esEquipoServing())) {
      return NextResponse.json({ error: 'Solo el equipo de Serving' }, { status: 401 })
    }

    const { nombre } = (await req.json().catch(() => ({}))) as { nombre?: string }
    const limpio = String(nombre || 'boletin')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .slice(-80)

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const { data: existente } = await supabase.storage.getBucket(BUCKET_BOLETINES)
    if (!existente) {
      const { error: errorCrear } = await supabase.storage.createBucket(BUCKET_BOLETINES, {
        public: false,
        fileSizeLimit: MAX_BYTES_BOLETIN + 1024 * 1024,
      })
      if (errorCrear && !/already exists/i.test(errorCrear.message)) {
        return NextResponse.json({ error: `No se pudo preparar el depósito: ${errorCrear.message}` }, { status: 500 })
      }
    }

    const ruta = `${new Date().toISOString().slice(0, 10)}/${crypto.randomUUID()}-${limpio}`
    const { data, error } = await supabase.storage.from(BUCKET_BOLETINES).createSignedUploadUrl(ruta)
    if (error || !data) {
      return NextResponse.json({ error: `No se pudo crear el permiso de subida: ${error?.message}` }, { status: 500 })
    }

    return NextResponse.json({ ok: true, bucket: BUCKET_BOLETINES, ruta, token: data.token })
  } catch (e) {
    console.error('[Centinela boletin-subida] Error:', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
