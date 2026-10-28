/**
 * Las 7 cosas que el motor de estructuración necesita sí o sí. Una sola lista
 * para todas las pantallas (al firmar, informe del diagnóstico y Resumen), para
 * que nunca se desacomode.
 */
export const LAS_SIETE_COSAS_CLAVE = [
  { titulo: 'El problema central', ejemplo: 'Qué situación quieres resolver. Ej.: "Los pequeños productores no tienen cómo vender sin intermediarios".' },
  { titulo: 'Las causas del problema (árbol del problema)', ejemplo: 'Por qué pasa y qué consecuencias trae. Con 3 causas y 3 consecuencias basta.' },
  { titulo: 'A quién le pasa (población)', ejemplo: 'Quiénes son, cuántos aproximadamente y dónde viven o trabajan.' },
  { titulo: 'Para quién es el proyecto (población objetivo)', ejemplo: 'De todas esas personas, a cuántas piensas llegar con este proyecto.' },
  { titulo: 'El objetivo general', ejemplo: 'Lo que quieres lograr, en una sola frase que empiece con un verbo. Ej.: "Aumentar las ventas de 50 productores".' },
  { titulo: 'Tu solución', ejemplo: 'Qué vas a hacer para resolver el problema, en pocas palabras.' },
  { titulo: 'El presupuesto', ejemplo: 'Cuánto dinero necesitas, aunque sea aproximado, y en qué lo gastarías.' },
] as const
