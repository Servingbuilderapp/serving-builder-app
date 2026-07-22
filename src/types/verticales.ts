export type VerticalId =
  | 'salud_mental'
  | 'educacion'
  | 'medio_ambiente'
  | 'emprendimiento'
  | 'desarrollo_empresarial'
  | 'innovacion_tecnologica'
  | 'proyectos_sociales'
  | 'agro_ganaderia'
  | 'liderazgo'

export type TipoAccesoSocio = 'estandar' | 'socio_anual'

export interface VerticalItem {
  id: VerticalId
  nombre: string
  subtitulo: string
  descripcion: string
  iconoNombre: string
  colorTheme: string
  badgeColor: string
  fondosDestacados: string[]
  esExclusivoSocio?: boolean
}

export const VERTICALES_OFICIALES: VerticalItem[] = [
  {
    id: 'salud_mental',
    nombre: 'Salud Mental Preventiva',
    subtitulo: 'Bienestar Comunitario & Resiliencia',
    descripcion: 'Proyectos focalizados en psicología preventiva, salud pública, apoyo comunitario y bienestar laboral.',
    iconoNombre: 'HeartPulse',
    colorTheme: 'from-pink-500 to-rose-600',
    badgeColor: 'bg-pink-500/10 text-pink-600 border-pink-500/30 dark:bg-pink-400/20 dark:text-pink-300',
    fondosDestacados: ['MINSALUD', 'OPS/OMS', 'Foundations Mental Health']
  },
  {
    id: 'educacion',
    nombre: 'Educación',
    subtitulo: 'Formación, EdTech & Capacitación',
    descripcion: 'Iniciativas de educación inclusiva, formación técnica rural, desarrollo STEAM y modelos pedagógicos.',
    iconoNombre: 'GraduationCap',
    colorTheme: 'from-blue-500 to-indigo-600',
    badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/30 dark:bg-blue-400/20 dark:text-blue-300',
    fondosDestacados: ['MINEDUCACIÓN', 'SENA Ruta Formativa', 'Erasmus+']
  },
  {
    id: 'medio_ambiente',
    nombre: 'Medio Ambiente',
    subtitulo: 'Sostenibilidad, Clima & Bioeconomía',
    descripcion: 'Economía circular, energías renovables, conservación de biodiversidad y gestión de agua/residuos.',
    iconoNombre: 'Leaf',
    colorTheme: 'from-emerald-500 to-teal-600',
    badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30 dark:bg-emerald-400/20 dark:text-emerald-300',
    fondosDestacados: ['MINAMBIENTE', 'Fondo Biocarbono', 'GEF Small Grants']
  },
  {
    id: 'emprendimiento',
    nombre: 'Emprendimiento',
    subtitulo: 'Ideación, Capital Semilla & Startups',
    descripcion: 'Fases tempranas de negocio, validación de mercado, modelo CANVAS y convocatorias de capital semilla.',
    iconoNombre: 'Rocket',
    colorTheme: 'from-amber-500 to-orange-600',
    badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/30 dark:bg-amber-400/20 dark:text-amber-300',
    fondosDestacados: ['Fondo Emprender SENA', 'iNNpulsa Semilla', 'Ventures']
  },
  {
    id: 'desarrollo_empresarial',
    nombre: 'Desarrollo Empresarial',
    subtitulo: 'Escalamiento, MiPyMEs & Productividad',
    descripcion: 'Fortalecimiento de empresas existentes, optimización de procesos, formalización y aceleración.',
    iconoNombre: 'Building2',
    colorTheme: 'from-violet-500 to-purple-600',
    badgeColor: 'bg-violet-500/10 text-violet-600 border-violet-500/30 dark:bg-violet-400/20 dark:text-violet-300',
    fondosDestacados: ['Bancóldex', 'Fábricas de Productividad', 'MINCIT']
  },
  {
    id: 'innovacion_tecnologica',
    nombre: 'Innovación Tecnológica',
    subtitulo: 'I+D+i, IA & Software Avanzado',
    descripcion: 'Desarrollo de software profundo, inteligencia artificial, robótica, IoT y patentes de invención.',
    iconoNombre: 'Cpu',
    colorTheme: 'from-cyan-500 to-blue-600',
    badgeColor: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/30 dark:bg-cyan-400/20 dark:text-cyan-300',
    fondosDestacados: ['MINCIENCIAS', 'Ruta N Tech', 'BID Lab Innovación']
  },
  {
    id: 'proyectos_sociales',
    nombre: 'Proyectos Sociales',
    subtitulo: 'Impacto Comunitario & Población Vulnerable',
    descripcion: 'Iniciativas de inclusión, desarrollo territorial, equidad de género y reconstrucción del tejido social.',
    iconoNombre: 'Users',
    colorTheme: 'from-rose-500 to-red-600',
    badgeColor: 'bg-rose-500/10 text-rose-600 border-rose-500/30 dark:bg-rose-400/20 dark:text-rose-300',
    fondosDestacados: ['DPS Prosperidad Social', 'APC Colombia', 'USAID']
  },
  {
    id: 'agro_ganaderia',
    nombre: 'Agro y Ganadería',
    subtitulo: 'Desarrollo Rural, Agroindustria & Ganadería Sostenible',
    descripcion: 'Tecnificación del campo colombiano, sostenibilidad pecuaria, riego y seguridad alimentaria.',
    iconoNombre: 'Sprout',
    colorTheme: 'from-lime-500 to-emerald-600',
    badgeColor: 'bg-lime-500/10 text-lime-600 border-lime-500/30 dark:bg-lime-400/20 dark:text-lime-300',
    fondosDestacados: ['MADR ADR', 'Finagro ICR', 'Alianza El Campo Emprende']
  },
  {
    id: 'liderazgo',
    nombre: 'Liderazgo',
    subtitulo: 'Gobernanza, Formación de Líderes & DDHH',
    descripcion: 'Capacitación en alta gerencia pública y privada, liderazgo de mujeres, veeduría y gobernanza local.',
    iconoNombre: 'Award',
    colorTheme: 'from-yellow-500 to-amber-600',
    badgeColor: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/30 dark:bg-yellow-400/20 dark:text-yellow-300',
    fondosDestacados: ['Escuela de Gobierno ESAP', 'Ford Foundation', 'NED Liderazgo']
  }
]
