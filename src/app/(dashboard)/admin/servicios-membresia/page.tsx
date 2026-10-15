import React from 'react'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { ServiciosMembresiaClient } from '@/components/admin/ServiciosMembresiaClient'
import { Ayuda } from '@/components/ui/Ayuda'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function ServiciosMembresiaPage() {
  const s = createAdminClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

  const [{ data: posts }, { data: ses }, { data: ins }, { data: acomp }, { data: msgs }] = await Promise.all([
    s.from('membresias_postulaciones').select('id, correo_cliente, proyecto_id, convocatoria_texto, comentario, estado, nota_equipo, created_at').order('created_at', { ascending: false }).limit(100),
    s.from('membresias_sesiones').select('id, titulo, fecha_hora').order('fecha_hora', { ascending: false }).limit(50),
    s.from('membresias_sesiones_inscritos').select('sesion_id'),
    s.from('membresias_acompanamiento').select('id, correo_cliente, tema, estado, fecha_hora, enlace, nota_equipo').order('created_at', { ascending: false }).limit(100),
    s.from('membresias_comunidad_mensajes').select('id, nombre, texto').order('created_at', { ascending: false }).limit(40),
  ])

  const ids = (posts || []).map((p: { proyecto_id: string }) => p.proyecto_id)
  const { data: proys } = ids.length
    ? await s.from('membresias_proyectos').select('id, nombre').in('id', ids)
    : { data: [] as { id: string; nombre: string }[] }
  const nombres = new Map((proys || []).map((p: { id: string; nombre: string }) => [p.id, p.nombre]))
  const conteo = new Map<string, number>()
  for (const i of ins || []) conteo.set(i.sesion_id, (conteo.get(i.sesion_id) || 0) + 1)

  return (
    <div className="min-h-full bg-[#54142B] px-4 py-6 lg:px-6">
      <header className="mb-6">
        <h1 className="text-[19px] font-extrabold tracking-tight text-[#F3E7DC]"><Ayuda clave="equipo.servicios_membresia" claro={false}>Servicios de membresía</Ayuda></h1>
        <p className="mt-1 max-w-2xl text-[13.5px] leading-relaxed text-[#F3E7DC]/60">
          Lo que los miembros piden: postulaciones, acompañamiento semanal, sesiones grupales y la comunidad.
        </p>
      </header>
      <ServiciosMembresiaClient
        postulaciones={(posts || []).map((p: { id: string; correo_cliente: string; proyecto_id: string; convocatoria_texto: string | null; comentario: string | null; estado: string; nota_equipo: string | null; created_at: string }) => ({
          id: p.id,
          proyectoId: p.proyecto_id,
          correo: p.correo_cliente,
          proyecto: nombres.get(p.proyecto_id) || 'Proyecto',
          convocatoria: p.convocatoria_texto || '',
          comentario: p.comentario,
          estado: p.estado,
          nota_equipo: p.nota_equipo,
          fecha: new Date(p.created_at).toLocaleDateString('es-CO', { day: 'numeric', month: 'long' }),
        }))}
        sesiones={(ses || []).map((x: { id: string; titulo: string; fecha_hora: string }) => ({ ...x, inscritos: conteo.get(x.id) || 0 }))}
        acompanamientos={(acomp || []).map((a: { id: string; correo_cliente: string; tema: string; estado: string; fecha_hora: string | null; enlace: string | null; nota_equipo: string | null }) => ({
          id: a.id, correo: a.correo_cliente, tema: a.tema, estado: a.estado, fecha_hora: a.fecha_hora, enlace: a.enlace, nota_equipo: a.nota_equipo,
        }))}
        mensajes={(msgs || []) as { id: string; nombre: string; texto: string }[]}
      />
    </div>
  )
}
