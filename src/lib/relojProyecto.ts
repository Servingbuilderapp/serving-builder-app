/**
 * EL RELOJ DEL PROYECTO — las cuatro etapas de madurez (definidas por el dueño el 30 oct 2026).
 *
 * El reloj mide MADUREZ, no tiempo. Cada etapa dice qué nivel de evidencia tiene el proyecto
 * y de dónde suele venir el dinero en ese punto. Todo vive aquí, en un solo sitio, para que el
 * diagnóstico, el panel y el video digan siempre lo mismo.
 *
 * La IA solo decide en qué etapa está el proyecto (1 a 4). Lo que se le recomienda a cada
 * etapa sale de esta tabla, no de la IA, para que sea siempre igual y verificable.
 */

export type NivelMadurez = 1 | 2 | 3 | 4

export type EtapaReloj = {
  nivel: NivelMadurez
  nombre: string
  /** Qué es el proyecto en esta etapa, en una frase. */
  descripcion: string
  evidencia: 'Baja' | 'Media' | 'Medio-alta' | 'Alta'
  /** De dónde suele venir el dinero en esta etapa. */
  fuentes: string[]
  /** Qué tan bien le queda lo que hace la plataforma (subvenciones y cooperación). */
  posibilidadesSubvencion: 'bajas' | 'medias' | 'medio-altas' | 'buenas'
  /** Lo que le recomendamos, en palabras simples. */
  recomendacion: string
  /** Si en esta etapa tiene sentido ofrecerle hablar con la analista financiera. */
  ofrecerAnalistaFinanciera: boolean
}

export const ETAPAS_RELOJ: EtapaReloj[] = [
  {
    nivel: 1,
    nombre: 'Idea inicial',
    descripcion: 'Tu proyecto apenas está naciendo y todavía tiene poca evidencia.',
    evidencia: 'Baja',
    fuentes: ['Fundaciones', 'Crowdfunding', 'Capital semilla'],
    posibilidadesSubvencion: 'bajas',
    recomendacion:
      'En esta etapa lo más probable es que te convenga primero un capital semilla, crowdfunding o una fundación. Las convocatorias y la cooperación internacional suelen pedir más evidencia. Si aun así quieres continuar con nosotros, te recomendamos empezar por una membresía para estar al tanto de las oportunidades, o por la Academia para fortalecer tu proyecto.',
    ofrecerAnalistaFinanciera: true,
  },
  {
    nivel: 2,
    nombre: 'Validación',
    descripcion: 'Estás probando tu proyecto con un plan piloto o de validación.',
    evidencia: 'Media',
    fuentes: ['Convocatorias', 'Inversión ángel'],
    posibilidadesSubvencion: 'medias',
    recomendacion:
      'Tu proyecto ya puede aspirar a convocatorias. Con una buena estructuración tienes opciones reales. Si prefieres, también puedes explorar inversión ángel con nuestra analista financiera.',
    ofrecerAnalistaFinanciera: true,
  },
  {
    nivel: 3,
    nombre: 'Escalamiento',
    descripcion: 'Tu proyecto ya demostró que funciona y se prepara para crecer.',
    evidencia: 'Medio-alta',
    fuentes: ['Cooperación internacional', 'Inversión de impacto'],
    posibilidadesSubvencion: 'medio-altas',
    recomendacion:
      'Estás en un punto muy bueno para la cooperación internacional y para las convocatorias exigentes. Una estructuración bien hecha marca la diferencia. La inversión de impacto es otra vía que puedes explorar con nuestra analista financiera.',
    ofrecerAnalistaFinanciera: true,
  },
  {
    nivel: 4,
    nombre: 'Consolidación',
    descripcion: 'Tu proyecto está establecido y tiene evidencia sólida.',
    evidencia: 'Alta',
    fuentes: ['Banca de desarrollo', 'Capital institucional'],
    posibilidadesSubvencion: 'buenas',
    recomendacion:
      'Tu fuente principal suele ser la banca de desarrollo o el capital institucional, y también puede haber subvenciones. Estructuramos tu proyecto para las subvenciones, y nuestra analista financiera puede orientarte en el crédito.',
    ofrecerAnalistaFinanciera: true,
  },
]

/** Los seis criterios del ADN de la iniciativa, en el orden del gráfico. */
export const CRITERIOS_ADN = [
  'Tipo de organización',
  'Naturaleza',
  'Capacidad',
  'Etapa de madurez',
  'Alcance',
  'Escala',
] as const

export function etapaPorNivel(nivel: unknown): EtapaReloj | null {
  const n = Math.round(Number(nivel))
  return ETAPAS_RELOJ.find((e) => e.nivel === n) || null
}
