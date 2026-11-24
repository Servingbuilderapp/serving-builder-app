import { NextResponse } from 'next/server'
import { consumirBeneficio } from '@/lib/membresiasConsumo'
import { contextoMiembro } from '@/lib/membresiasServicios'
import { createHash } from 'crypto'
import { limpiarRespuestas, TODOS_LOS_PASOS, pasoCompleto } from '@/lib/miProyectoPasos'
import {
  BUCKET_PROYECTOS,
  CARPETA_LISTOS,
  CLAVE_ARCHIVO_BYTES,
  CLAVE_ARCHIVO_HUELLA,
  CLAVE_ARCHIVO_NOMBRE,
  CLAVE_ARCHIVO_RUTA,
  CLAVE_DECLARACION,
  CLAVE_ORIGEN,
  CLAVE_POSTULACIONES,
  MAX_POSTULACIONES_POR_PROYECTO,
  leerPostulaciones,
  type PostulacionRegistrada,
  EXTENSIONES_PERMITIDAS,
  MAX_BYTES_PROYECTO_LISTO,
  ORIGEN_TRAIDO,
  TEXTO_DECLARACION_AUTORIA,
  carpetaDeCorreo,
  esProyectoTraido,
  nombreSeguroArchivo,
  type DeclaracionAutoria,
} from '@/lib/miProyectoListo'

/**
 * Los proyectos que el miembro estructura él mismo.
 * - crear: abre un proyecto nuevo y descuenta 1 del cupo del mes.
 * - guardar: guarda lo escrito (se llama solo mientras escribe).
 * - terminar: lo marca terminado, solo si todos los pasos están completos.
 * - preparar_listo / confirmar_listo: "trae tu proyecto listo" — el miembro sube un
 *   archivo ya hecho y firma la declaración de autoría. El cupo se descuenta solo
 *   cuando el archivo ya quedó guardado.
 */
export async function POST(req: Request) {
  try {
    const ctx = await contextoMiembro()
    if (!ctx.correo) return NextResponse.json({ error: 'Debes iniciar sesión' }, { status: 401 })
    if (!ctx.vigente && !ctx.esEquipo) {
      return NextResponse.json({ error: 'Necesitas una membresía activa.' }, { status: 403 })
    }

    const c = await req.json()

    if (c?.accion === 'crear') {
      const nombre = typeof c.nombre === 'string' ? c.nombre.trim().slice(0, 150) : ''
      if (!nombre) return NextResponse.json({ error: 'Escribe el nombre de tu proyecto.' }, { status: 400 })

      let membresiaId: string | null = null
      if (!ctx.esEquipo) {
        const consumo = await consumirBeneficio(ctx.servicio, ctx.correo, 'proyecto_minimo', `proy:${nombre}`)
        if (!consumo.ok) return NextResponse.json({ error: consumo.mensaje }, { status: 409 })
        membresiaId = consumo.membresiaId
      }
      const { data, error } = await ctx.servicio
        .from('membresias_proyectos')
        .insert({ membresia_id: membresiaId, correo_cliente: ctx.correo, nombre })
        .select('id')
        .single()
      if (error || !data) {
        console.error('Error creando proyecto de membresía:', error)
        return NextResponse.json({ error: 'No se pudo crear el proyecto. Intenta de nuevo.' }, { status: 500 })
      }
      return NextResponse.json({ success: true, id: data.id })
    }

    if (c?.accion === 'preparar_listo') {
      const nombreArchivo = typeof c.nombreArchivo === 'string' ? c.nombreArchivo : ''
      const extension = nombreArchivo.split('.').pop()?.toLowerCase() || ''
      if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
        return NextResponse.json({ error: 'Sube tu proyecto en PDF o Word (.pdf, .doc o .docx).' }, { status: 400 })
      }
      const ruta = `${CARPETA_LISTOS}/${carpetaDeCorreo(ctx.correo)}/${crypto.randomUUID()}-${nombreSeguroArchivo(nombreArchivo)}`
      const { data, error } = await ctx.servicio.storage.from(BUCKET_PROYECTOS).createSignedUploadUrl(ruta)
      if (error || !data) {
        console.error('No se pudo preparar la subida del proyecto listo:', error)
        return NextResponse.json({ error: 'No se pudo preparar la subida. Intenta de nuevo.' }, { status: 500 })
      }
      return NextResponse.json({ success: true, ruta, token: data.token })
    }

    if (c?.accion === 'confirmar_listo') {
      const nombre = typeof c.nombre === 'string' ? c.nombre.trim().slice(0, 150) : ''
      const ruta = typeof c.ruta === 'string' ? c.ruta : ''
      const nombreArchivo = typeof c.nombreArchivo === 'string' ? c.nombreArchivo.slice(0, 200) : ''
      const declarante = typeof c.declarante === 'string' ? c.declarante.trim().slice(0, 150) : ''
      if (!nombre) return NextResponse.json({ error: 'Escribe el nombre de tu proyecto.' }, { status: 400 })
      if (declarante.length < 5) return NextResponse.json({ error: 'Escribe tu nombre completo para firmar la declaración.' }, { status: 400 })
      if (c.acepto !== true) return NextResponse.json({ error: 'Debes aceptar la declaración de autoría.' }, { status: 400 })
      if (!ruta.startsWith(`${CARPETA_LISTOS}/${carpetaDeCorreo(ctx.correo)}/`)) {
        return NextResponse.json({ error: 'El archivo no corresponde a tu cuenta.' }, { status: 403 })
      }

      const { data: archivo, error: errorDescarga } = await ctx.servicio.storage.from(BUCKET_PROYECTOS).download(ruta)
      if (errorDescarga || !archivo) {
        return NextResponse.json({ error: 'No encontramos el archivo subido. Vuelve a intentarlo.' }, { status: 400 })
      }
      const bytes = Buffer.from(await archivo.arrayBuffer())
      if (bytes.length === 0 || bytes.length > MAX_BYTES_PROYECTO_LISTO) {
        return NextResponse.json({ error: 'El archivo debe pesar menos de 30 MB.' }, { status: 400 })
      }
      const huella = createHash('sha256').update(bytes).digest('hex')

      let membresiaId: string | null = null
      if (!ctx.esEquipo) {
        const consumo = await consumirBeneficio(ctx.servicio, ctx.correo, 'proyecto_minimo', `proy:${nombre}`)
        if (!consumo.ok) return NextResponse.json({ error: consumo.mensaje }, { status: 409 })
        membresiaId = consumo.membresiaId
      }

      const declaracion: DeclaracionAutoria = {
        texto: TEXTO_DECLARACION_AUTORIA,
        declarante,
        correo: ctx.correo,
        aceptada_en: new Date().toISOString(),
        ip: (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'desconocida',
        navegador: (req.headers.get('user-agent') || '').slice(0, 250),
        archivo_nombre: nombreArchivo,
        archivo_bytes: bytes.length,
        archivo_huella_sha256: huella,
      }
      const respuestas: Record<string, string> = {
        [CLAVE_ORIGEN]: ORIGEN_TRAIDO,
        [CLAVE_ARCHIVO_RUTA]: ruta,
        [CLAVE_ARCHIVO_NOMBRE]: nombreArchivo,
        [CLAVE_ARCHIVO_BYTES]: String(bytes.length),
        [CLAVE_ARCHIVO_HUELLA]: huella,
        [CLAVE_DECLARACION]: JSON.stringify(declaracion),
        titulo_elegido: nombre,
      }
      const { data, error } = await ctx.servicio
        .from('membresias_proyectos')
        .insert({ membresia_id: membresiaId, correo_cliente: ctx.correo, nombre, estado: 'terminado', respuestas })
        .select('id')
        .single()
      if (error || !data) {
        console.error('Error guardando proyecto traído listo:', error)
        return NextResponse.json({ error: 'No se pudo guardar el proyecto. Intenta de nuevo.' }, { status: 500 })
      }
      return NextResponse.json({ success: true, id: data.id })
    }

    const id = typeof c?.id === 'string' ? c.id : ''
    if (!id) return NextResponse.json({ error: 'Falta el proyecto.' }, { status: 400 })

    const { data: proyecto } = await ctx.servicio
      .from('membresias_proyectos')
      .select('id, estado, respuestas')
      .eq('id', id)
      .ilike('correo_cliente', ctx.correo)
      .maybeSingle<{ id: string; estado: string; respuestas: Record<string, string> | null }>()
    if (!proyecto) return NextResponse.json({ error: 'No encontramos ese proyecto.' }, { status: 404 })

    if (c?.accion === 'registrar_postulacion') {
      if (proyecto.estado !== 'terminado') {
        return NextResponse.json({ error: 'Primero termina tu proyecto.' }, { status: 400 })
      }
      const usadas = leerPostulaciones(proyecto.respuestas)
      if (usadas.length >= MAX_POSTULACIONES_POR_PROYECTO) {
        return NextResponse.json({ error: `Ya usaste las ${MAX_POSTULACIONES_POR_PROYECTO} postulaciones de este proyecto.` }, { status: 409 })
      }
      const convocatoriaId = typeof c.convocatoriaId === 'string' && c.convocatoriaId ? c.convocatoriaId : null
      const otra = typeof c.convocatoriaTexto === 'string' ? c.convocatoriaTexto.trim().slice(0, 300) : ''
      if (!convocatoriaId && !otra) return NextResponse.json({ error: 'Elige la convocatoria o escribe cuál es.' }, { status: 400 })
      if (c.acepto !== true) return NextResponse.json({ error: 'Confirma que entiendes que esto usa una de tus postulaciones.' }, { status: 400 })

      let nueva: PostulacionRegistrada = { id: null, texto: otra, fuente_oficial: null, requisitos: null, mecanismo: null, registrada_en: new Date().toISOString() }
      if (convocatoriaId) {
        if (usadas.some((u) => u.id === convocatoriaId)) {
          return NextResponse.json({ error: 'Esa convocatoria ya la registraste en este proyecto.' }, { status: 409 })
        }
        const { data: conv } = await ctx.servicio
          .from('biblioteca_convocatorias')
          .select('nombre, entidad, fuente_oficial, requisitos, mecanismo_postulacion')
          .eq('id', convocatoriaId)
          .maybeSingle<{ nombre: string | null; entidad: string | null; fuente_oficial: string | null; requisitos: string | null; mecanismo_postulacion: string | null }>()
        if (!conv) return NextResponse.json({ error: 'No encontramos esa convocatoria.' }, { status: 404 })
        nueva = {
          id: convocatoriaId,
          texto: [conv.nombre, conv.entidad].filter(Boolean).join(' — '),
          fuente_oficial: conv.fuente_oficial,
          requisitos: conv.requisitos,
          mecanismo: conv.mecanismo_postulacion,
          registrada_en: nueva.registrada_en,
        }
      }
      const respuestasNuevas = { ...(proyecto.respuestas || {}), [CLAVE_POSTULACIONES]: JSON.stringify([...usadas, nueva]) }
      const { error } = await ctx.servicio
        .from('membresias_proyectos')
        .update({ respuestas: respuestasNuevas, actualizado_en: new Date().toISOString() })
        .eq('id', id)
      if (error) return NextResponse.json({ error: 'No se pudo registrar. Intenta de nuevo.' }, { status: 500 })
      return NextResponse.json({ success: true, usadas: usadas.length + 1 })
    }

    if (esProyectoTraido(proyecto.respuestas)) {
      return NextResponse.json({ error: 'Este proyecto lo trajiste ya hecho; no se edita aquí.' }, { status: 409 })
    }

    if (c?.accion === 'guardar') {
      if (proyecto.estado === 'terminado') {
        return NextResponse.json({ error: 'Este proyecto ya está terminado.' }, { status: 409 })
      }
      const respuestas = limpiarRespuestas(c.respuestas)
      const { error } = await ctx.servicio
        .from('membresias_proyectos')
        .update({ respuestas, actualizado_en: new Date().toISOString() })
        .eq('id', id)
      if (error) {
        console.error('Error guardando proyecto:', error)
        return NextResponse.json({ error: 'No se pudo guardar.' }, { status: 500 })
      }
      return NextResponse.json({ success: true })
    }

    if (c?.accion === 'terminar') {
      // Si ya está terminado no se vuelve a escribir: así nadie borra el conteo de postulaciones.
      if (proyecto.estado === 'terminado') {
        return NextResponse.json({ error: 'Este proyecto ya está terminado.' }, { status: 409 })
      }
      const respuestas = limpiarRespuestas(c.respuestas)
      const faltan = TODOS_LOS_PASOS.filter((p) => !pasoCompleto(p, respuestas))
      if (faltan.length > 0) {
        return NextResponse.json({ error: `Todavía faltan pasos por completar: ${faltan.map((p) => p.n).join(', ')}.` }, { status: 400 })
      }
      const { error } = await ctx.servicio
        .from('membresias_proyectos')
        .update({ respuestas, estado: 'terminado', actualizado_en: new Date().toISOString() })
        .eq('id', id)
      if (error) return NextResponse.json({ error: 'No se pudo cerrar el proyecto.' }, { status: 500 })
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Acción desconocida.' }, { status: 400 })
  } catch (error: unknown) {
    console.error('Error en proyectos de membresía:', error)
    return NextResponse.json({ error: 'No se pudo completar. Intenta de nuevo.' }, { status: 500 })
  }
}
