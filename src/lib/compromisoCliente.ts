/**
 * "Mi compromiso con la plataforma": lo que el cliente de estructuración lee y
 * acepta antes de arrancar (reglas del dueño, 28 nov 2026).
 *
 * Vive aquí, en un solo sitio, para que la pantalla de contratar y el texto
 * del contrato lean exactamente las mismas palabras.
 */

export const TITULO_COMPROMISO = 'Mi compromiso con la plataforma'

export const PUNTOS_COMPROMISO: string[] = [
  'Después de hacer el diagnóstico, debo enviar obligatoriamente mi documento en PDF o Word. Sin ese documento la estructuración no arranca.',
  'La plataforma estructura mi proyecto, busca convocatorias y me ayuda a postular a la primera. Puedo parar ahí o seguir postulando durante el tiempo contratado.',
  'El tiempo contratado es para tener más oportunidades de postular, no me obliga a postular. Si postulé antes y no quiero seguir, puedo parar.',
  'Si la plataforma me presentó convocatorias acordes y no quise postular, no tengo derecho a prórroga ni a meses de cortesía. Esos meses solo se dan si no se consiguieron convocatorias.',
  'Debo responder las notificaciones de la plataforma: aceptar y escoger las convocatorias a las que quiero postular.',
]

/** Los mismos puntos como texto numerado, para pegarlo dentro del contrato. */
export const TEXTO_COMPROMISO = PUNTOS_COMPROMISO.map((p, i) => `${i + 1}. ${p}`).join('\n')
