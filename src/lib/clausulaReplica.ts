/**
 * AUTORIZACIÓN DE RÉPLICA METODOLÓGICA — UN SOLO SITIO.
 *
 * El Portal de Réplicas se alimenta de los proyectos ya estructurados: se toma
 * el núcleo de uno que funcionó y se adapta a otro territorio, sector o
 * población. Sin esta autorización escrita, esa biblioteca no es un activo
 * sino un problema legal esperando.
 *
 * Lo que se autoriza es la ESTRUCTURA y el MÉTODO, nunca la información
 * confidencial ni la identidad del cliente.
 *
 * De aquí lo leen el contrato que el cliente firma (ContratoDigitalModal) y el
 * texto legal de /contratar. Para cambiar la redacción se toca este archivo.
 */

export const TITULO_CLAUSULA_REPLICA = 'AUTORIZACIÓN DE RÉPLICA METODOLÓGICA'

export const PARRAFOS_CLAUSULA_REPLICA: string[] = [
  'EL CLIENTE autoriza a EL PRESTADOR, de forma no exclusiva y sin límite de ' +
    'territorio, a utilizar la estructura metodológica del proyecto estructurado ' +
    '—esto es, su árbol de problemas y objetivos, su marco lógico, su cadena de ' +
    'valor, sus indicadores y su diseño técnico— como modelo base para construir ' +
    'proyectos réplica adaptados a otros territorios, sectores o poblaciones.',

  'Esta autorización se limita a la estructura y al método. NO comprende, y EL ' +
    'PRESTADOR se obliga a no divulgar ni reutilizar, la razón social ni el nombre ' +
    'de EL CLIENTE, sus datos personales, su información financiera, sus secretos ' +
    'empresariales, su base de clientes o proveedores, ni ningún dato que permita ' +
    'identificarlo. Toda réplica se construye sobre información anonimizada.',

  'EL CLIENTE conserva la titularidad plena de su proyecto, de su idea y de los ' +
    'documentos y contenidos que aportó. Nada de lo aquí pactado le impide ' +
    'presentar, ejecutar o comercializar su propio proyecto como mejor le ' +
    'convenga, ni le exige exclusividad de ninguna clase.',

  'En caso de que EL PRESTADOR comercialice a un tercero un proyecto réplica ' +
    'derivado del proyecto de EL CLIENTE, EL CLIENTE tendrá derecho a un ' +
    'reconocimiento económico sobre esa operación, cuyo porcentaje y forma de pago ' +
    'se pactarán en documento anexo firmado por las partes.',

  'EL CLIENTE podrá revocar esta autorización hacia el futuro mediante ' +
    'comunicación escrita a EL PRESTADOR. La revocatoria no afecta las réplicas ' +
    'ya construidas o comercializadas antes de su recepción.',
]

/** La misma cláusula en texto plano, para el documento de términos. */
export const TEXTO_CLAUSULA_REPLICA = PARRAFOS_CLAUSULA_REPLICA.join('\n\n')
