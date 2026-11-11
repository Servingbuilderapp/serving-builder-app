/**
 * Formulación del proyecto (Camino A, primera pantalla) — reglas simples, sin IA.
 * Aquí vive: las condiciones de un dato, el borrador que se trae de Oportunidades
 * y la revisión de qué le falta a la formulación.
 *
 * Regla de oro: el borrador solo COPIA lo que la persona ya escribió o comprobó.
 * No se inventa nada. Si no hay dato, el campo queda vacío.
 */

export type Condicion = 'verificado' | 'aportado' | 'estimado' | 'supuesto' | 'pendiente'

export const CONDICIONES: { valor: Condicion; etiqueta: string; ayuda: string }[] = [
  { valor: 'verificado', etiqueta: 'Verificado', ayuda: 'Hay un documento, registro o fuente que lo respalda.' },
  { valor: 'aportado', etiqueta: 'Aportado por ti', ayuda: 'Lo dices tú, sin documento que lo respalde todavía.' },
  { valor: 'estimado', etiqueta: 'Estimado', ayuda: 'Es un cálculo aproximado.' },
  { valor: 'supuesto', etiqueta: 'Supuesto', ayuda: 'Es algo que das por cierto para avanzar.' },
  { valor: 'pendiente', etiqueta: 'Pendiente de validar', ayuda: 'Aún no sabes si es cierto; hay que comprobarlo.' },
]

export const etiquetaCondicion = (c: string) => CONDICIONES.find((x) => x.valor === c)?.etiqueta ?? c

/** Campos de texto de la formulación (los que se guardan en sfpe_formulacion). */
export const CAMPOS_TEXTO = ['problema', 'justificacion', 'antecedentes', 'objetivo_general', 'alcance', 'exclusiones'] as const
export type CampoTexto = (typeof CAMPOS_TEXTO)[number]

export type TipoItem = 'objetivo_especifico' | 'beneficiario' | 'resultado'
export type OrigenItem = 'persona' | 'oportunidad' | 'ia'

export interface ItemFormulacion {
  id: string
  tipo: TipoItem
  texto: string
  condicion: Condicion
  origen: OrigenItem
}

export interface Formulacion {
  tipo_proyecto: string
  sector: string
  ubicacion: string
  duracion_meses: string
  problema: string
  justificacion: string
  antecedentes: string
  objetivo_general: string
  alcance: string
  exclusiones: string
  condiciones: Partial<Record<CampoTexto, Condicion>>
}

export const TIPOS_PROYECTO = [
  'Creación de una empresa o negocio',
  'Lanzamiento de un producto o servicio',
  'Expansión o nueva sede',
  'Automatización de procesos',
  'Transformación digital',
  'Innovación de producto o proceso',
  'Fortalecimiento empresarial',
  'Sostenibilidad o economía circular',
  'Investigación o desarrollo',
  'Otro',
]

export const formulacionVacia = (): Formulacion => ({
  tipo_proyecto: '',
  sector: '',
  ubicacion: '',
  duracion_meses: '',
  problema: '',
  justificacion: '',
  antecedentes: '',
  objetivo_general: '',
  alcance: '',
  exclusiones: '',
  condiciones: {},
})

/* -------------------------------------------------------------------------- */
/* Borrador desde Oportunidades                                               */
/* -------------------------------------------------------------------------- */

export interface OportunidadOrigen {
  id: string
  nombre: string
  descripcion: string | null
  categoria: string | null
  cliente_o_beneficiario: string | null
  solucion_propuesta: string | null
  valor_generado: string | null
  sector: string | null
  ubicacion: string | null
}

export interface ProblemaOrigen {
  titulo: string
  descripcion: string | null
  afectados: string | null
  frecuencia: string | null
  consecuencias: string | null
}

export interface EvidenciaOrigen {
  tipo: string
  nivel: string
  descripcion: string | null
  fuente: string | null
  enlace: string | null
  estado_revision: string
}

export interface HipotesisOrigen {
  id: string
  tipo: string
  enunciado: string
  estado: string
  evidencias: EvidenciaOrigen[]
}

const t = (s: string | null | undefined) => (s ?? '').replace(/\s+/g, ' ').trim()

export const TIPO_HIPOTESIS: Record<string, string> = {
  problema: 'El problema es real',
  cliente: 'Los clientes son los que creemos',
  solucion: 'La solución funciona',
  valor: 'El beneficio es el que esperamos',
  comercial: 'Alguien pagaría o compraría',
  operativa: 'Se puede hacer en la práctica',
}

export const ESTADO_HIPOTESIS: Record<string, string> = {
  pendiente: 'Pendiente',
  validada: 'Validada',
  parcialmente_validada: 'Validada en parte',
  no_validada: 'No se pudo validar',
  no_concluyente: 'Sin conclusión',
}

const esAfirmada = (estado: string) => estado === 'validada' || estado === 'parcialmente_validada'

/** Una evidencia cuenta como "verificado" solo si es de nivel alto y ya fue revisada. */
const esVerificada = (e: EvidenciaOrigen) => (e.nivel === 'E3' || e.nivel === 'E4') && e.estado_revision === 'revisada'

export interface BorradorFormulacion {
  formulacion: Formulacion
  items: ItemFormulacion[]
  /** Hipótesis que todavía no están comprobadas (se muestran como pendientes). */
  pendientes: HipotesisOrigen[]
  /** Hipótesis comprobadas (total o en parte) con su evidencia. */
  comprobadas: HipotesisOrigen[]
}

let contador = 0
const idLocal = () => `nuevo-${Date.now().toString(36)}-${contador++}`
export const esIdLocal = (id: string) => id.startsWith('nuevo-')
export const nuevoId = idLocal

/** Copia (sin inventar) lo que la persona ya trabajó en Oportunidades. */
export function armarBorrador(
  nombreProyecto: string,
  oportunidad: OportunidadOrigen | null,
  problema: ProblemaOrigen | null,
  hipotesis: HipotesisOrigen[],
): BorradorFormulacion {
  const f = formulacionVacia()
  const items: ItemFormulacion[] = []
  const comprobadas = hipotesis.filter((h) => esAfirmada(h.estado))
  const pendientes = hipotesis.filter((h) => !esAfirmada(h.estado))
  void nombreProyecto

  if (oportunidad) {
    f.sector = t(oportunidad.sector)
    f.ubicacion = t(oportunidad.ubicacion)

    // Problema: el problema registrado; si no hay, la descripción de la oportunidad.
    if (problema) {
      const partes = [
        t(problema.descripcion) || t(problema.titulo),
        problema.afectados ? `Afecta a: ${t(problema.afectados)}.` : '',
        problema.frecuencia ? `Frecuencia: ${t(problema.frecuencia)}.` : '',
        problema.consecuencias ? `Consecuencias: ${t(problema.consecuencias)}.` : '',
      ].filter(Boolean)
      f.problema = partes.join(' ')
    } else {
      f.problema = t(oportunidad.descripcion)
    }
    if (f.problema) f.condiciones.problema = 'aportado'

    // Justificación: el beneficio que la persona dijo que produciría.
    if (t(oportunidad.valor_generado)) {
      f.justificacion = `Beneficio esperado: ${t(oportunidad.valor_generado)}`
      f.condiciones.justificacion = 'aportado'
    }

    // Alcance: la solución que la persona propuso.
    if (t(oportunidad.solucion_propuesta)) {
      f.alcance = `Solución que se piensa desarrollar: ${t(oportunidad.solucion_propuesta)}`
      f.condiciones.alcance = 'aportado'
    }

    // Beneficiarios: quien la persona dijo que se beneficia.
    if (t(oportunidad.cliente_o_beneficiario)) {
      items.push({
        id: idLocal(),
        tipo: 'beneficiario',
        texto: t(oportunidad.cliente_o_beneficiario),
        condicion: 'aportado',
        origen: 'oportunidad',
      })
    }
  }

  // Antecedentes: lo que ya se comprobó, con su evidencia.
  if (comprobadas.length > 0) {
    const lineas = comprobadas.map((h) => {
      const ev = h.evidencias
        .map((e) => t(e.descripcion) || t(e.fuente))
        .filter(Boolean)
        .slice(0, 3)
      const sufijo = ev.length ? ` Evidencia: ${ev.join('; ')}.` : ' Sin evidencia registrada.'
      return `• ${t(h.enunciado)} (${ESTADO_HIPOTESIS[h.estado] ?? h.estado}).${sufijo}`
    })
    f.antecedentes = `Lo que se comprobó en la etapa de oportunidades:\n${lineas.join('\n')}`
    const todasVerificadas = comprobadas.every((h) => h.evidencias.length > 0 && h.evidencias.every(esVerificada))
    f.condiciones.antecedentes = todasVerificadas ? 'verificado' : 'aportado'
  }

  return { formulacion: f, items, pendientes, comprobadas }
}

/* -------------------------------------------------------------------------- */
/* Revisión                                                                   */
/* -------------------------------------------------------------------------- */

export interface Revision {
  clave: string
  texto: string
  cumple: boolean
  obligatorio: boolean
  ayuda: string
}

/** Un objetivo bien escrito empieza con un verbo en infinitivo: "Reducir…", "Crear…". */
export function empiezaConVerbo(texto: string): boolean {
  const primera = t(texto).split(' ')[0]?.toLowerCase() ?? ''
  return /^[a-záéíóúñ]{3,}(ar|er|ir|ír)$/.test(primera)
}

const hay = (s: string) => t(s).length > 0

export function revisarFormulacion(f: Formulacion, items: ItemFormulacion[]): Revision[] {
  const de = (tipo: TipoItem) => items.filter((i) => i.tipo === tipo && hay(i.texto))
  const objetivos = de('objetivo_especifico')
  const resultados = de('resultado')
  const beneficiarios = de('beneficiario')
  const sinVerbo = [f.objetivo_general, ...objetivos.map((o) => o.texto)].filter((x) => hay(x) && !empiezaConVerbo(x))
  return [
    {
      clave: 'identificacion',
      texto: 'Tiene el tipo de proyecto.',
      cumple: hay(f.tipo_proyecto),
      obligatorio: true,
      ayuda: 'Elige qué tipo de proyecto es en “Identificación”.',
    },
    {
      clave: 'problema',
      texto: 'Describe el problema o la oportunidad.',
      cumple: hay(f.problema),
      obligatorio: true,
      ayuda: 'Cuenta qué situación se quiere resolver o aprovechar.',
    },
    {
      clave: 'justificacion',
      texto: 'Explica por qué vale la pena hacerlo.',
      cumple: hay(f.justificacion),
      obligatorio: true,
      ayuda: 'Escribe qué valor genera y quién se beneficia.',
    },
    {
      clave: 'beneficiarios',
      texto: 'Dice quiénes son los beneficiarios o clientes.',
      cumple: beneficiarios.length > 0,
      obligatorio: true,
      ayuda: 'Agrega al menos una persona o grupo.',
    },
    {
      clave: 'objetivo_general',
      texto: 'Tiene un objetivo general.',
      cumple: hay(f.objetivo_general),
      obligatorio: true,
      ayuda: 'Escribe el cambio principal que quieres lograr.',
    },
    {
      clave: 'objetivos',
      texto: 'Tiene al menos un objetivo específico.',
      cumple: objetivos.length > 0,
      obligatorio: true,
      ayuda: 'Cada objetivo específico es un paso que lleva al objetivo general.',
    },
    {
      clave: 'alcance',
      texto: 'Define el alcance.',
      cumple: hay(f.alcance),
      obligatorio: true,
      ayuda: 'Di qué incluye el proyecto.',
    },
    {
      clave: 'resultados',
      texto: 'Tiene al menos un resultado esperado.',
      cumple: resultados.length > 0,
      obligatorio: true,
      ayuda: 'Un resultado es un cambio que se podrá comprobar al terminar.',
    },
    {
      clave: 'exclusiones',
      texto: 'Dice qué NO incluye el proyecto.',
      cumple: hay(f.exclusiones),
      obligatorio: false,
      ayuda: 'Ayuda a evitar malentendidos. Puedes dejarlo para después.',
    },
    {
      clave: 'antecedentes',
      texto: 'Tiene antecedentes (lo que ya se sabe o se comprobó).',
      cumple: hay(f.antecedentes),
      obligatorio: false,
      ayuda: 'Si ya validaste hipótesis, aquí se resumen.',
    },
    {
      clave: 'duracion',
      texto: 'Tiene una duración estimada en meses.',
      cumple: hay(f.duracion_meses),
      obligatorio: false,
      ayuda: 'Un cálculo aproximado basta por ahora.',
    },
    {
      clave: 'verbos',
      texto: 'Los objetivos empiezan con un verbo (Crear, Reducir, Aumentar…).',
      cumple: sinVerbo.length === 0,
      obligatorio: false,
      ayuda: 'Un objetivo dice qué se quiere lograr, no una cosa por comprar.',
    },
  ]
}

/** Cuántos datos del texto siguen sin respaldo (supuesto o pendiente). Sirve para avisar. */
export function datosSinRespaldo(f: Formulacion, items: ItemFormulacion[]): number {
  const campos = CAMPOS_TEXTO.filter((c) => hay(f[c]) && (f.condiciones[c] === 'supuesto' || f.condiciones[c] === 'pendiente')).length
  const lista = items.filter(
    (i) => i.tipo !== 'objetivo_especifico' && hay(i.texto) && (i.condicion === 'supuesto' || i.condicion === 'pendiente'),
  ).length
  return campos + lista
}
