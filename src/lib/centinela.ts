/**
 * CENTINELA DIGITAL — el vocabulario compartido de las fuentes.
 *
 * El Centinela es la parte del portal que vigila de dónde salen las
 * convocatorias. Antes se llamaba RADAR; ese nombre quedó prohibido porque es
 * marca ajena. En todo el proyecto se dice Centinela Digital.
 *
 * Una fuente es una entidad que publica convocatorias. Lo único que las
 * diferencia de verdad es CÓMO se puede enterar uno de lo que publica, y eso
 * es lo que llamamos nivel. Del nivel depende cuánto trabajo cuesta seguirla
 * y en qué orden se construye.
 */

export type NivelCentinela = 0 | 1 | 2 | 3 | 9

export const NIVELES: {
  nivel: NivelCentinela
  nombre: string
  explicacion: string
}[] = [
  {
    nivel: 1,
    nombre: 'Boletín al buzón',
    explicacion:
      'Mandan un boletín por correo. Se suscribe el buzón del Centinela y la plataforma lo lee sola cada semana. Es la vía más fácil y la primera que se construye.',
  },
  {
    nivel: 2,
    nombre: 'Lectura automática',
    explicacion:
      'No mandan boletín, pero publican su lista en un formato que la plataforma puede pedir directamente, sin pasar por el correo.',
  },
  {
    nivel: 3,
    nombre: 'Robot semanal',
    explicacion:
      'No avisan de ninguna manera. Toca entrar a la página una vez por semana y comparar con la semana pasada. Funciona, pero se rompe cada vez que el sitio cambia de diseño. Por eso van de últimas.',
  },
  {
    nivel: 0,
    nombre: 'Por invitación',
    explicacion:
      'No abren convocatoria pública: invitan a quien ya conocen. No se pueden seguir. Quedan aquí solo como referencia, por si se busca contacto directo.',
  },
  {
    nivel: 9,
    nombre: 'Experto',
    explicacion:
      'Personas, no entidades. Se revisan a mano. Si alguno tiene boletín propio, se le cambia el nivel a "Boletín al buzón" y entra al automático.',
  },
]

export const NOMBRE_NIVEL: Record<number, string> = Object.fromEntries(
  NIVELES.map((n) => [n.nivel, n.nombre]),
)

export type EstadoFuente =
  | 'pendiente'
  | 'suscrito'
  | 'confirmado'
  | 'sin_boletin'
  | 'sin_revisar'
  | 'no_aplica'
  | 'descartada'

export const ESTADOS: {
  clave: EstadoFuente
  nombre: string
  explicacion: string
  color: string
}[] = [
  {
    clave: 'pendiente',
    nombre: 'Falta suscribir',
    explicacion: 'Todavía nadie inscribió el buzón del Centinela a su boletín.',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  {
    clave: 'suscrito',
    nombre: 'Suscrito, sin confirmar',
    explicacion:
      'Ya se llenó el formulario de suscripción, pero al buzón todavía no ha llegado el primer correo. Hasta que llegue, no hay prueba de que funcione.',
    color: 'bg-amber-100 text-amber-800 border-amber-200',
  },
  {
    clave: 'confirmado',
    nombre: 'Llegando al buzón',
    explicacion: 'Ya llegó al menos un correo. Esta fuente está viva.',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  },
  {
    clave: 'sin_boletin',
    nombre: 'No tiene boletín',
    explicacion:
      'Se revisó y no ofrece boletín. Hay que bajarla a lectura automática o a robot semanal.',
    color: 'bg-orange-100 text-orange-800 border-orange-200',
  },
  {
    clave: 'sin_revisar',
    nombre: 'Sin revisar',
    explicacion: 'Todavía no se ha mirado cómo publica esta fuente.',
    color: 'bg-slate-100 text-slate-600 border-slate-200',
  },
  {
    clave: 'no_aplica',
    nombre: 'No se puede seguir',
    explicacion: 'Es por invitación. No entra al sistema automático.',
    color: 'bg-slate-100 text-slate-500 border-slate-200',
  },
  {
    clave: 'descartada',
    nombre: 'Descartada',
    explicacion: 'Se revisó y no sirve para los clientes del portal.',
    color: 'bg-red-100 text-red-800 border-red-200',
  },
]

export const NOMBRE_ESTADO: Record<string, string> = Object.fromEntries(
  ESTADOS.map((e) => [e.clave, e.nombre]),
)

export const COLOR_ESTADO: Record<string, string> = Object.fromEntries(
  ESTADOS.map((e) => [e.clave, e.color]),
)

/** El buzón que recibe SOLO boletines. Nunca el correo personal ni el de administración. */
export const BUZON_CENTINELA = 'serving.builder.app@gmail.com'

/**
 * Los estados que tienen sentido para cada nivel. Ofrecerle al usuario
 * "Llegando al buzón" en una fuente por invitación es ofrecerle un error.
 */
export function estadosDelNivel(nivel: number): EstadoFuente[] {
  if (nivel === 1) return ['pendiente', 'suscrito', 'confirmado', 'sin_boletin', 'descartada']
  if (nivel === 2 || nivel === 3) return ['sin_revisar', 'confirmado', 'descartada']
  if (nivel === 9) return ['sin_revisar', 'suscrito', 'confirmado', 'sin_boletin', 'descartada']
  return ['no_aplica', 'descartada']
}

/** Normaliza el nombre para no guardar dos veces la misma fuente. */
export function claveDeFuente(nombre: string): string {
  return nombre
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()
}
