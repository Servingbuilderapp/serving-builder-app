/**
 * PLANTILLAS DE RÉPLICA
 * =====================
 *
 * Antes, para decir hacia dónde iba una réplica, había una sola casilla de
 * texto libre: quien la llenaba tenía que redactar el enunciado técnico
 * completo a mano. Este archivo es el único sitio donde vive esa redacción —
 * cada uno de los once tipos sabe qué dato puntual pedir (el territorio, la
 * entidad, el monto…) y arma solo la frase. Quien llena el formulario solo
 * escribe el dato.
 *
 * Lo usan dos pantallas — la del equipo (`ReplicasClient.tsx`, en admin) y la
 * del cliente (`SolicitarVarianteReplica.tsx`, en su panel) — desde aquí,
 * para que las dos redacten exactamente igual y un cambio futuro no haya que
 * repetirlo en dos sitios.
 */

export type CampoDestino = {
  etiqueta: string
  ejemplo: string
  opcional?: boolean
  frase: (valor: string) => string
}

export const CAMPO_DESTINO: Record<string, CampoDestino> = {
  'misma convocatoria': {
    etiqueta: 'Detalle de la próxima apertura (opcional)',
    ejemplo: 'Ej: edición 2027',
    opcional: true,
    frase: (valor) =>
      valor ? `En la misma convocatoria, en su próxima apertura (${valor}).` : 'En la misma convocatoria, en su próxima apertura.',
  },
  'otra convocatoria': {
    etiqueta: 'Nombre de la convocatoria de destino',
    ejemplo: 'Ej: Fondo Emprender, convocatoria 2027',
    frase: (valor) => `Hacia la convocatoria «${valor}».`,
  },
  'otro territorio': {
    etiqueta: 'Departamento, municipio o país',
    ejemplo: 'Ej: Nariño, o Pasto (Nariño), o Ecuador',
    frase: (valor) => `Hacia el territorio: ${valor}.`,
  },
  'otros beneficiarios': {
    etiqueta: 'Población beneficiaria nueva',
    ejemplo: 'Ej: mujeres cabeza de familia rurales',
    frase: (valor) => `Hacia la población beneficiaria: ${valor}.`,
  },
  'otro proponente': {
    etiqueta: 'Entidad que presentaría el proyecto',
    ejemplo: 'Ej: Alcaldía de Pasto',
    frase: (valor) => `Con la entidad proponente: ${valor}.`,
  },
  'otros aliados': {
    etiqueta: 'Aliados nuevos que entran',
    ejemplo: 'Ej: Cámara de Comercio, Universidad de Nariño',
    frase: (valor) => `Con los aliados: ${valor}.`,
  },
  'otra linea tematica': {
    etiqueta: 'Línea temática nueva',
    ejemplo: 'Ej: economía circular',
    frase: (valor) => `Hacia la línea temática: ${valor}.`,
  },
  'otro enfoque sectorial': {
    etiqueta: 'Sector nuevo',
    ejemplo: 'Ej: turismo rural',
    frase: (valor) => `Hacia el sector: ${valor}.`,
  },
  'otro enfoque de innovacion': {
    etiqueta: 'Enfoque de innovación nuevo',
    ejemplo: 'Ej: innovación social en vez de tecnológica',
    frase: (valor) => `Hacia el enfoque de innovación: ${valor}.`,
  },
  'otro monto': {
    etiqueta: 'Monto al que se lleva',
    ejemplo: 'Ej: 300 millones de pesos',
    frase: (valor) => `Al monto: ${valor}.`,
  },
  'otro alcance de metas': {
    etiqueta: 'Nuevo alcance de metas',
    ejemplo: 'Ej: el doble de beneficiarios',
    frase: (valor) => `Al alcance de metas: ${valor}.`,
  },
}

/** Arma el enunciado técnico completo — la nota queda pegada al final. */
export function armarDestino(tipo: string, valor: string, notaAdicional: string): string {
  const campo = CAMPO_DESTINO[tipo]
  if (!campo) return [valor, notaAdicional].filter(Boolean).join(' — ')
  return [campo.frase(valor.trim()), notaAdicional.trim() ? `Nota: ${notaAdicional.trim()}` : ''].filter(Boolean).join(' ')
}
