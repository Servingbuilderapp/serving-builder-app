import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { esEquipoServing } from '@/lib/guardiaEquipo'
import { ResumenProyecto, type DatosResumen } from '@/components/panel/ResumenProyecto'
import { AvanceProyecto, type DatosAvance } from '@/components/panel/AvanceProyecto'
import { ConvocatoriasCliente, type ConvocatoriaCliente } from '@/components/panel/ConvocatoriasCliente'
import { PendientesCliente, type DatosPendientes } from '@/components/panel/PendientesCliente'
import { ResultadoDiagnosticoVista } from '@/components/diagnostico/ResultadoDiagnosticoVista'
import type { DiagnosticoResultadoV2 } from '@/app/api/diagnostico-v2/route'

export const dynamic = 'force-dynamic'

/**
 * PROYECTO DE EJEMPLO — solo para el equipo de Serving, para presentar la plataforma.
 *
 * Muestra las mismas pantallas que ve un cliente, pero con un proyecto INVENTADO: ninguna
 * organización, entidad ni convocatoria es real, y nada de esto toca la base de datos. Así,
 * quien está decidiendo si compra ve la plataforma llena y con su estética real, sin que
 * aparezcan datos de ningún cliente.
 */

const NOMBRE_PROYECTO = 'Huertas Comunitarias Semillas del Alba'

function enDias(dias: number): string {
  const f = new Date()
  f.setUTCDate(f.getUTCDate() + dias)
  return f.toISOString().slice(0, 10)
}

const PANTALLAS = [
  { clave: 'diagnostico', nombre: 'Diagnóstico' },
  { clave: 'inicio', nombre: 'Inicio' },
  { clave: 'proyecto', nombre: 'Mi proyecto' },
  { clave: 'convocatorias', nombre: 'Convocatorias para ti' },
  { clave: 'pendientes', nombre: 'Lo que me piden' },
] as const

/* ---------------- datos inventados ---------------- */

const DIAGNOSTICO: DiagnosticoResultadoV2 = {
  scoreGeneral: 72,
  esViable: true,
  resumenEjecutivo:
    'Un proyecto de huertas comunitarias que combina producción de alimentos y formación para familias de un barrio. Tiene una necesidad clara y un piloto en marcha; le falta fortalecer su presupuesto y su plan de sostenibilidad.',
  sectoresSugeridos: [
    { nombre: 'Seguridad alimentaria', porcentaje: 86 },
    { nombre: 'Desarrollo comunitario', porcentaje: 71 },
    { nombre: 'Medio ambiente', porcentaje: 54 },
  ],
  mecanismosSugeridos: [
    { nombre: 'Convocatorias públicas', porcentaje: 78, descripcion: 'Su etapa de validación encaja con convocatorias de impacto comunitario.' },
    { nombre: 'Fundaciones', porcentaje: 66, descripcion: 'Las fundaciones apoyan proyectos con piloto en marcha y resultados medibles.' },
    { nombre: 'Crowdfunding', porcentaje: 49, descripcion: 'Su historia comunitaria puede movilizar aportes pequeños de mucha gente.' },
  ],
  brechasCriticas: [
    'El presupuesto no separa los costos de personal y de materiales.',
    'Falta definir cómo continuará el proyecto cuando termine el financiamiento.',
    'No hay indicadores para medir cuántas familias mejoran su alimentación.',
  ],
  pasosRecomendados: [
    'Sube tu documento del proyecto para empezar la estructuración.',
    'Reúne la certificación de la organización y el soporte del piloto.',
    'Escoge a cuáles convocatorias quieres postular cuando te las mostremos.',
  ],
  notaConceptoMarkdown: 'Nota de concepto de ejemplo.',
  nivelMadurez: 2,
  justificacionNivel: 'Tu proyecto ya tiene un piloto en marcha con 40 familias, por eso lo ubicamos en validación.',
  ejesRueda: [
    { label: 'Tipo de organización', score: 7, recomendacion: 'Detectamos: organización comunitaria. Coincide bien con convocatorias y fundaciones.' },
    { label: 'Naturaleza', score: 8, recomendacion: 'Detectamos: impacto social. Coincide con las fuentes que te sugerimos.' },
    { label: 'Capacidad', score: 5, recomendacion: 'Detectamos: media. Un aliado administrativo te daría tranquilidad con los reportes.' },
    { label: 'Etapa de madurez', score: 5, recomendacion: 'Etapa: validación. Te falta documentar los resultados del piloto para subir de nivel.' },
    { label: 'Alcance', score: 7, recomendacion: 'Detectamos: un barrio de una ciudad intermedia. Está bien definido.' },
    { label: 'Escala', score: 6, recomendacion: 'El monto y el plazo son realistas para tu etapa.' },
  ],
}

const RESUMEN: DatosResumen = {
  proyecto: { id: 'ejemplo', nombre: NOMBRE_PROYECTO, estado: 'en_estructuracion' },
  progresoGeneral: 67,
  pasos: { total: 42, completados: 28 },
  pasoActual: { orden: 29, nombre: 'Cronograma de actividades' },
  convocatoria: {
    nombre: 'Fondo Verde Regional (ejemplo)',
    entidad: 'Entidad de ejemplo',
    fechaCierre: enDias(24),
    diasRestantes: 24,
  },
  documentos: { completos: 5, total: 8 },
  encaje: { actual: 72, potencial: 88 },
  proximoPaso: {
    titulo: 'Reúne 3 documentos para postular',
    detalle: 'Tienes 24 días. Te faltan: certificación de la organización, soporte del piloto y carta de aliado. Súbelos y dejamos tu postulación lista.',
  },
  semaforos: [
    { etiqueta: 'Tiempo', estado: 'verde' },
    { etiqueta: 'Documentos', estado: 'amarillo' },
    { etiqueta: 'Encaje', estado: 'verde' },
  ],
  ruta: [
    { nombre: 'Diagnóstico', estado: 'completado' },
    { nombre: 'Estructuración', estado: 'en_proceso' },
    { nombre: 'Convocatorias', estado: 'pendiente' },
    { nombre: 'Postulación', estado: 'pendiente' },
  ],
  recomendacionIA:
    'Tu proyecto está bien encaminado. Lo más valioso ahora es reunir los documentos de la organización: con ellos tu postulación queda lista antes del cierre.',
  progresoAreas: [
    { nombre: 'Problema y objetivos', valor: 100 },
    { nombre: 'Solución y actividades', valor: 85 },
    { nombre: 'Presupuesto', valor: 70 },
    { nombre: 'Cronograma', valor: 45 },
    { nombre: 'Sostenibilidad', valor: 40 },
  ],
  ejesRueda: [
    { nombre: 'Tipo de organización', puntaje: 7 },
    { nombre: 'Naturaleza', puntaje: 8 },
    { nombre: 'Capacidad', puntaje: 5 },
    { nombre: 'Etapa de madurez', puntaje: 5 },
    { nombre: 'Alcance', puntaje: 7 },
    { nombre: 'Escala', puntaje: 6 },
  ],
  convocatoriasTop: [
    { nombre: 'Fondo Verde Regional (ejemplo)', entidad: 'Entidad de ejemplo', afinidad: 72, cierre: enDias(24), dias: 24, estado: 'Abierta', semaforos: ['verde', 'amarillo'] },
    { nombre: 'Cooperación Agroecológica (ejemplo)', entidad: 'Agencia de ejemplo', afinidad: 81, cierre: enDias(10), dias: 10, estado: 'Abierta', semaforos: ['amarillo', 'verde'] },
    { nombre: 'Premio Innovación Social (ejemplo)', entidad: 'Fundación de ejemplo', afinidad: 58, cierre: enDias(45), dias: 45, estado: 'Abierta', semaforos: ['verde', 'verde'] },
  ],
  alertas: [
    { tipo: 'atencion', titulo: 'Cierra en 10 días: Cooperación Agroecológica (ejemplo)', detalle: 'Si vas a postular, revisa qué te falta. Pasada la fecha ya no se puede.' },
    { tipo: 'info', titulo: 'Tu cronograma está en construcción', detalle: 'Lo estamos armando con base en tus actividades. No tienes que hacer nada.' },
  ],
  actividades: [
    { texto: 'Se completó el árbol de objetivos', cuando: 'Hace 2 h' },
    { texto: 'Se calculó el encaje con 3 convocatorias', cuando: 'Ayer' },
    { texto: 'Recibimos el documento de tu proyecto', cuando: 'Hace 3 días' },
  ],
  pendientes: [
    { texto: 'Subir la certificación de la organización', prioridad: 'alta', fecha: enDias(5) },
    { texto: 'Confirmar la población beneficiaria', prioridad: 'media' },
  ],
}

const NOMBRES_PASOS = [
  'Problema central', 'Causas y consecuencias', 'Población afectada', 'Población objetivo', 'Contexto del territorio',
  'Antecedentes', 'Justificación', 'Marco normativo', 'Actores involucrados', 'Análisis de alternativas',
  'Diagnóstico de capacidades', 'Riesgos iniciales', 'Línea base', 'Necesidades detectadas', 'Oportunidades',
  'Restricciones', 'Resumen del diagnóstico', 'Validación con la comunidad', 'Cierre del diagnóstico',
  'Objetivo general', 'Objetivos específicos', 'Árbol de objetivos', 'Alternativa de solución', 'Resultados esperados',
  'Indicadores', 'Matriz de coherencia',
  'Actividades', 'Cronograma de actividades', 'Presupuesto por rubros', 'Talento humano', 'Equipos y materiales',
  'Cofinanciación', 'Plan de riesgos', 'Plan de sostenibilidad', 'Seguimiento y evaluación', 'Plan de comunicación', 'Revisión de coherencia',
  'Resumen ejecutivo', 'Anexos', 'Lista de documentos', 'Revisión final', 'Entrega para postular',
]

const AVANCE: DatosAvance = {
  proyecto: { id: 'ejemplo', nombre: NOMBRE_PROYECTO, estado: 'en_estructuracion', modalidad: 'Estructuración Estratégica' },
  porcentaje: 67,
  pasos: NOMBRES_PASOS.map((nombre, i) => ({
    id: i + 1,
    orden: i + 1,
    nombre,
    completado: i < 28,
    advertencia: i === 24 ? 'Los indicadores quedaron generales. Con los datos de tu piloto los hacemos más precisos.' : null,
  })),
}

const CONVOCATORIAS: ConvocatoriaCliente[] = [
  {
    id: 'ej-1',
    nombre: 'Fondo Verde Regional (ejemplo)',
    entidad: 'Entidad de ejemplo',
    tipo: 'Convocatoria pública',
    fechaCierre: enDias(24),
    monto: 'Hasta $120.000.000',
    fuenteOficial: 'https://example.org/convocatoria-de-ejemplo',
    lineaTematica: 'Seguridad alimentaria y desarrollo comunitario',
    territorio: 'Regional',
    beneficiarios: 'Organizaciones comunitarias',
    encaje: {
      resumen: 'Financia proyectos que mejoran la alimentación de familias en barrios urbanos, con participación de la comunidad.',
      encajeActual: '72 % — buen encaje',
      encajePotencial: '88 % — con los documentos completos',
      hoyPct: 72,
      potencialPct: 88,
      semaforo: 'verde',
      puntaje: 72,
      recomendaciones: 'Tu proyecto responde a la línea temática. Para subir el encaje, agrega la carta de un aliado y los resultados del piloto.',
      checklist: ['Certificación de la organización', 'Soporte del piloto', 'Carta de aliado'],
      documentacionFaltante: 'Certificación de la organización. Carta de aliado.',
    },
    postulacion: { estado: 'Preparando', fechaRadicacion: null, puntaje: null },
  },
  {
    id: 'ej-2',
    nombre: 'Cooperación Agroecológica (ejemplo)',
    entidad: 'Agencia de ejemplo',
    tipo: 'Cooperación internacional',
    fechaCierre: enDias(10),
    monto: 'Hasta USD 60.000',
    fuenteOficial: 'https://example.org/convocatoria-de-ejemplo',
    lineaTematica: 'Agroecología',
    territorio: 'Latinoamérica',
    beneficiarios: 'Organizaciones sociales',
    encaje: {
      resumen: 'Apoya iniciativas de producción agroecológica con enfoque comunitario.',
      encajeActual: '81 % — encaja muy bien',
      encajePotencial: '90 % — con los ajustes sugeridos',
      hoyPct: 81,
      potencialPct: 90,
      semaforo: 'verde',
      puntaje: 81,
      recomendaciones: 'Es la mejor opción por afinidad. Cierra pronto: conviene dejar lista la documentación esta semana.',
      checklist: ['Carta de aliado', 'Presupuesto en dólares'],
      documentacionFaltante: null,
    },
    postulacion: { estado: 'Lista para radicar', fechaRadicacion: null, puntaje: null },
  },
  {
    id: 'ej-3',
    nombre: 'Premio Innovación Social (ejemplo)',
    entidad: 'Fundación de ejemplo',
    tipo: 'Premio',
    fechaCierre: enDias(45),
    monto: 'Premio de $30.000.000',
    fuenteOficial: 'https://example.org/convocatoria-de-ejemplo',
    lineaTematica: 'Innovación social',
    territorio: 'Nacional',
    beneficiarios: 'Iniciativas con piloto',
    encaje: {
      resumen: 'Reconoce soluciones sociales con resultados demostrables.',
      encajeActual: '58 % — encaje medio',
      encajePotencial: '75 % — si documentas los resultados del piloto',
      hoyPct: 58,
      potencialPct: 75,
      semaforo: 'amarillo',
      puntaje: 58,
      recomendaciones: 'Piden resultados medidos. Con los datos de tu piloto, el encaje sube.',
      checklist: ['Resultados del piloto', 'Video de presentación'],
      documentacionFaltante: 'Resultados del piloto.',
    },
    postulacion: null,
  },
]

const PENDIENTES: DatosPendientes = {
  proyectoId: 'ejemplo',
  nombreProyecto: NOMBRE_PROYECTO,
  preguntas: [
    {
      id: 'p1',
      nombrePaso: 'Población objetivo',
      pregunta: '¿A cuántas familias piensan llegar durante el primer año?',
      critico: true,
      sugerencia: 'Según tu documento, el piloto atiende 40 familias. Para el primer año te sugerimos 120 familias.',
      venceEn: enDias(1),
    },
    {
      id: 'p2',
      nombrePaso: 'Sostenibilidad',
      pregunta: '¿Cómo continuará el proyecto cuando termine el financiamiento?',
      critico: false,
      sugerencia: 'Una cuota simbólica de las familias y la venta de excedentes de la huerta podrían cubrir los costos básicos.',
      venceEn: enDias(2),
    },
  ],
  supuestos: [
    {
      id: 's1',
      nombrePaso: 'Duración',
      pregunta: '¿Cuánto durará el proyecto?',
      supuesto: 'Asumimos 12 meses, que es lo más común en las convocatorias a las que aplicas.',
    },
  ],
  pasosDebiles: [
    {
      idPaso: 25,
      nombrePaso: 'Indicadores',
      contenido: 'Número de familias que reciben capacitación.',
      advertencia: 'Faltan indicadores que midan el cambio en la alimentación de las familias. Con los datos de tu piloto lo completamos.',
    },
  ],
  documentosPedidos: [
    { id: 'd1', requisito: 'Certificación de la organización', obligatorio: true, nota: 'Expedida en los últimos 30 días.', origen: 'Fondo Verde Regional (ejemplo)' },
    { id: 'd2', requisito: 'Soporte del piloto', obligatorio: true, nota: 'Fotos, listas de asistencia o un informe corto.', origen: 'Fondo Verde Regional (ejemplo)' },
    { id: 'd3', requisito: 'Carta de aliado', obligatorio: false, nota: 'Sube la carta si la tienes.', origen: 'Cooperación Agroecológica (ejemplo)' },
  ],
  archivoBase: { nombre: 'Documento del proyecto.pdf', url: null },
  archivosSubidos: [],
}

/* ---------------- la pantalla ---------------- */

export default async function EjemploPage({
  searchParams,
}: {
  searchParams?: Promise<{ pantalla?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user || !(await esEquipoServing())) redirect('/dashboard')

  const params = searchParams ? await searchParams : undefined
  const actual = PANTALLAS.find((p) => p.clave === params?.pantalla)?.clave || 'diagnostico'

  return (
    <div className="space-y-4 pb-10">
      <div className="rounded-2xl border border-[#C99A3D]/40 bg-[#C99A3D]/12 px-4 py-3 text-[13px] leading-relaxed text-[#E0B868]">
        <strong>Proyecto de ejemplo.</strong> Todo lo que ves aquí es inventado: la organización, las convocatorias y los
        números. Sirve para mostrar cómo se ve la plataforma por dentro. No toca ningún cliente real.
      </div>

      <nav className="flex flex-wrap gap-2" aria-label="Pantallas del ejemplo">
        {PANTALLAS.map((p) => (
          <Link
            key={p.clave}
            href={`/admin/ejemplo?pantalla=${p.clave}`}
            className={
              p.clave === actual
                ? 'rounded-full bg-gradient-to-b from-[#C9A46B] to-[#B08D57] px-4 py-2 text-xs font-bold text-[#3A1420] shadow-md'
                : 'rounded-full border border-[#B08D57]/40 px-4 py-2 text-xs font-bold text-color-base-content/75 hover:bg-color-primary/10'
            }
          >
            {p.nombre}
          </Link>
        ))}
      </nav>

      <div className="overflow-hidden rounded-2xl">
        {actual === 'diagnostico' ? (
          <div className="bg-[#54142B] p-4 md:p-6">
            <ResultadoDiagnosticoVista resultado={DIAGNOSTICO} nombreProyecto={NOMBRE_PROYECTO} mostrarCierre={false} />
          </div>
        ) : null}
        {actual === 'inicio' ? <ResumenProyecto datos={RESUMEN} /> : null}
        {actual === 'proyecto' ? <AvanceProyecto datos={AVANCE} /> : null}
        {actual === 'convocatorias' ? <ConvocatoriasCliente convocatorias={CONVOCATORIAS} /> : null}
        {actual === 'pendientes' ? <PendientesCliente datos={PENDIENTES} soloVista /> : null}
      </div>
    </div>
  )
}
