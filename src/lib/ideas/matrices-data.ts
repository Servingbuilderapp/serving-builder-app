// Datos base de las 3 herramientas de la App de Ideas.
// Nombres propios y genéricos — no se usa ningún nombre de marca o metodología de terceros.

// ============================================================
// HERRAMIENTA 1: Matriz de Reinvención
// 4 preguntas para repensar un negocio o idea existente
// ============================================================
export interface PreguntaReinvencion {
  id: string
  pregunta: string
  ayuda: string
}

export const PREGUNTAS_REINVENCION: PreguntaReinvencion[] = [
  {
    id: 'eliminar',
    pregunta: '¿Qué deberíamos eliminar por completo?',
    ayuda: 'Cosas que el sector da por hechas pero que ya no aportan valor real.'
  },
  {
    id: 'reducir',
    pregunta: '¿Qué deberíamos reducir?',
    ayuda: 'Elementos que hoy se hacen "de más" y se pueden simplificar sin perder valor.'
  },
  {
    id: 'incrementar',
    pregunta: '¿Qué deberíamos aumentar?',
    ayuda: 'Elementos que hoy están por debajo de lo que el cliente realmente necesita.'
  },
  {
    id: 'crear',
    pregunta: '¿Qué deberíamos crear que no existe todavía?',
    ayuda: 'Algo completamente nuevo que el sector nunca ha ofrecido.'
  }
]

// ============================================================
// HERRAMIENTA 2: Mapa de Convergencia Tecnológica
// Cruza el sector del usuario contra 14 tecnologías emergentes
// ============================================================
export interface TecnologiaEmergente {
  id: string
  nombre: string
  icono: string
}

export const TECNOLOGIAS_EMERGENTES: TecnologiaEmergente[] = [
  { id: 'ia', nombre: 'Inteligencia Artificial', icono: '🧠' },
  { id: 'iot', nombre: 'Internet de las Cosas (IoT)', icono: '📡' },
  { id: 'impresion3d', nombre: 'Impresión 3D', icono: '🖨️' },
  { id: 'robotica', nombre: 'Robótica', icono: '🦾' },
  { id: 'realidad_mixta', nombre: 'Realidad Virtual y Aumentada', icono: '👓' },
  { id: 'agrotech', nombre: 'AgroTech', icono: '🌱' },
  { id: 'edtech', nombre: 'EdTech', icono: '🎓' },
  { id: 'saludtech', nombre: 'Salud Digital', icono: '🏥' },
  { id: 'ambiental', nombre: 'Sostenibilidad Ambiental', icono: '♻️' },
  { id: 'energia', nombre: 'Energías Renovables', icono: '☀️' },
  { id: 'tokenizacion', nombre: 'Tokenización / Blockchain', icono: '🔗' },
  { id: 'vision_computacional', nombre: 'Visión Computacional', icono: '👁️' },
  { id: 'biotech', nombre: 'Biotecnología', icono: '🧬' },
  { id: 'bigdata', nombre: 'Big Data y Analítica', icono: '📊' }
]

// ============================================================
// HERRAMIENTA 3: Brújula de Necesidades Humanas
// Cruza 9 necesidades humanas contra 4 formas de satisfacerlas (36 combinaciones)
// ============================================================
export interface NecesidadHumana {
  id: string
  nombre: string
  icono: string
}

export const NECESIDADES_HUMANAS: NecesidadHumana[] = [
  { id: 'subsistencia', nombre: 'Subsistencia', icono: '🌾' },
  { id: 'proteccion', nombre: 'Protección', icono: '🛡️' },
  { id: 'afecto', nombre: 'Afecto', icono: '❤️' },
  { id: 'entendimiento', nombre: 'Entendimiento', icono: '💡' },
  { id: 'participacion', nombre: 'Participación', icono: '🤝' },
  { id: 'ocio', nombre: 'Ocio', icono: '🎭' },
  { id: 'creacion', nombre: 'Creación', icono: '🎨' },
  { id: 'identidad', nombre: 'Identidad', icono: '🪪' },
  { id: 'libertad', nombre: 'Libertad', icono: '🕊️' }
]

export interface FormaDeSatisfaccion {
  id: string
  nombre: string
  ayuda: string
}

export const FORMAS_DE_SATISFACCION: FormaDeSatisfaccion[] = [
  { id: 'ser', nombre: 'Ser', ayuda: 'Cualidades y actitudes (ej. ser autónomo, ser solidario)' },
  { id: 'tener', nombre: 'Tener', ayuda: 'Instituciones, herramientas, normas (ej. tener acceso, tener un espacio)' },
  { id: 'hacer', nombre: 'Hacer', ayuda: 'Acciones y actividades (ej. colaborar, aprender, cuidar)' },
  { id: 'estar', nombre: 'Estar', ayuda: 'Entornos y espacios (ej. estar en comunidad, estar en un entorno seguro)' }
]
