/**
 * Guías de lectura de la App de Ideas (versiones propias de Serving).
 *
 * El texto vive aquí, como datos, y la pantalla de lectura lo dibuja. En los
 * textos, lo que va entre **dobles asteriscos** se muestra en negrita.
 */

export type Bloque =
  | { tipo: 'p'; texto: string }
  | { tipo: 'lista'; items: string[] }
  | { tipo: 'numerada'; items: string[] }
  | { tipo: 'cita'; texto: string }
  | { tipo: 'tabla'; cabecera: string[]; filas: string[][] }

export type SeccionGuia = {
  titulo: string
  bloques: Bloque[]
}

export type EnlaceGuia = { href: string; nombre: string }

export type Guia = {
  slug: 'redactar-tu-proyecto' | 'ruta-estrategica' | 'revision-final'
  titulo: string
  subtitulo: string
  resumen: string
  intro: Bloque[]
  secciones: SeccionGuia[]
  cierre?: Bloque[]
  enlaces: EnlaceGuia[]
}

const HOJA_ARBOL: EnlaceGuia = { href: '/ideas/arbol-de-problemas', nombre: 'Hoja: Árbol de Problemas y Objetivos' }
const HOJA_BENEFICIARIO: EnlaceGuia = { href: '/ideas/beneficiario-ideal', nombre: 'Hoja: Beneficiario Ideal' }

export const GUIAS: Guia[] = [
  /* ------------------------------------------------------------------ */
  {
    slug: 'redactar-tu-proyecto',
    titulo: 'Guía Serving para redactar tu proyecto',
    subtitulo: 'Para dejar tu proyecto claro, coherente y listo para postular',
    resumen: 'Cómo escribir tu proyecto pensando en quien lo va a evaluar, etapa por etapa.',
    intro: [
      {
        tipo: 'p',
        texto:
          'Escribe pensando en quien va a evaluar tu proyecto. Esa persona lee muchos documentos: lo que más le ayuda es que el tuyo sea **claro, coherente y completo**, sin jerga.',
      },
      { tipo: 'p', texto: 'Tres reglas para todo el documento:' },
      {
        tipo: 'numerada',
        items: [
          '**Todo se conecta.** Problema, objetivos, productos, actividades, beneficiarios, duración y presupuesto deben contar la misma historia.',
          '**Nada vago.** Cambia frases como "falta de…" por descripciones que se puedan observar y medir: "bajo", "insuficiente", "limitado", con un dato cuando lo tengas.',
          '**Hilo visible.** Cada sección debe poder rastrearse hasta la anterior. Si una meta aparece en el presupuesto, tiene que haber nacido en un objetivo.',
        ],
      },
      {
        tipo: 'p',
        texto: 'Los objetivos siempre empiezan con un verbo en infinitivo (mejorar, fortalecer, aumentar…).',
      },
    ],
    secciones: [
      {
        titulo: 'Etapa A. La presentación (pasos 1 a 3)',
        bloques: [
          {
            tipo: 'p',
            texto:
              '**1. Título.** Escribe tres opciones y elige una. Debe ser claro, oficial y orientado al beneficio principal. Lo ideal: un verbo de acción más el territorio o la población. Evita siglas poco conocidas. Corto y preciso.',
          },
          {
            tipo: 'p',
            texto:
              '**2. Resumen ejecutivo.** Un solo párrafo de 6 a 8 líneas, sin listas. Cuenta en orden: el problema, la solución, a quién ayuda, las actividades principales y los resultados esperados. Usa conectores como "por eso", "para que", "con el fin de". Quien lo lea debe entender el valor en un minuto.',
          },
          {
            tipo: 'p',
            texto:
              '**3. Ubicación.** País, región y municipio(s). Si hay varias zonas, indica cuál es la principal y cuáles las secundarias, siempre con los mismos nombres. Debe coincidir con la población y con los aliados.',
          },
        ],
      },
      {
        titulo: 'Etapa B. El diagnóstico (pasos 4 a 6)',
        bloques: [
          {
            tipo: 'p',
            texto:
              '**4. Problema.** De 3 a 5 líneas. Menciona la población y el territorio. Resume al menos tres causas y tres efectos, escritos de forma concreta. Esta precisión condiciona todo lo demás.',
          },
          {
            tipo: 'p',
            texto:
              '**5. Objetivo general.** Una sola frase con verbo en infinitivo que diga quién cambia, qué cambia y dónde. Es el problema dicho en positivo y debe poder comprobarse con indicadores generales.',
          },
          {
            tipo: 'p',
            texto:
              '**6. Árbol de problemas.** Ordena el problema central con sus causas directas e indirectas y sus efectos directos e indirectos: efectos arriba, problema al centro, causas abajo. En cada columna debe leerse causa → problema → efecto. Quita repeticiones y saltos lógicos. Si citas hechos, que tengan fuente verificable. De aquí salen los objetivos, productos e indicadores. Puedes llenarlo en la hoja de trabajo "Árbol de Problemas y Objetivos", y volver a él en la revisión de coherencia (paso 18).',
          },
        ],
      },
      {
        titulo: 'Etapa C. La propuesta (pasos 7 a 11)',
        bloques: [
          {
            tipo: 'p',
            texto:
              '**7. Descripción detallada.** De 8 a 12 líneas: alcance, grandes bloques de trabajo y forma de operar. Cada bloque se conecta con un objetivo específico. Texto fluido y enfocado en resultados.',
          },
          {
            tipo: 'p',
            texto:
              '**8. Beneficiarios y metas.** Cuántas personas se benefician de forma directa y cuántas de forma indirecta, y qué las caracteriza. Metas realistas, con indicadores y con fuentes que lo demuestren. La hoja "Beneficiario Ideal" te ayuda a definirlos.',
          },
          {
            tipo: 'p',
            texto:
              '**9. Actividades.** Qué se hace en cada bloque, cómo se mide y por qué esas actividades llevan a los productos y a los objetivos. Si usas códigos de actividades (ver el glosario al final), inclúyelos.',
          },
          {
            tipo: 'p',
            texto:
              '**10. Cronograma.** Actividades por fases, con qué depende de qué. Usa los mismos códigos que usarás en el presupuesto.',
          },
          {
            tipo: 'p',
            texto:
              '**11. Duración.** Meses totales y, si puedes, fechas de inicio y cierre. Revisa que el tiempo alcance para las metas y que no se acumule el riesgo en una sola fase.',
          },
        ],
      },
      {
        titulo: 'Etapa D. Los apoyos y el dinero (pasos 12 a 14)',
        bloques: [
          {
            tipo: 'p',
            texto:
              '**12. Aliados.** Nombre, rol, tipo de aporte (dinero, especie o gestión) y la evidencia (carta, correo o acta). Procura tener al menos un aporte concreto y documentado. El rol del aliado no debe repetir el de quien presenta el proyecto.',
          },
          {
            tipo: 'p',
            texto:
              '**13. Contrapartidas.** Quién aporta, qué aporta en especie (con valor), cuánto en efectivo y observaciones. Suma el total y confirma que cada aporte se vincule a un producto o tarea.',
          },
          {
            tipo: 'p',
            texto:
              '**14. Monto solicitado.** El valor total que pides, justificado con productos y metas. Debe ser coherente con el tamaño del proyecto. Si aplica, muestra qué proporción representan las contrapartidas.',
          },
        ],
      },
      {
        titulo: 'Etapa E. La lógica completa (pasos 15 y 16)',
        bloques: [
          {
            tipo: 'p',
            texto:
              '**15. Árbol de objetivos.** El mismo árbol de problemas en positivo: fines arriba, objetivo general al centro, medios abajo. Cada causa tiene un medio y cada efecto tiene un fin. Usa los objetivos ya definidos y no los reformules distinto.',
          },
          {
            tipo: 'p',
            texto:
              '**16. Cadena de valor.** Por cada objetivo específico: producto, indicador, unidad, meta y actividades. Debe poder seguirse el camino objetivo → producto → indicador → meta, y las metas deben poder contarse y comprobarse.',
          },
        ],
      },
      {
        titulo: 'Etapa F. Cierre (pasos 17 a 19)',
        bloques: [
          {
            tipo: 'p',
            texto:
              '**17. Presupuesto por rubros.** Rubros: talento humano, equipos y software, servicios, materiales e insumos, capacitación y divulgación, viajes, imprevistos, administración y supervisión. Con total general, equilibrio entre rubros y relación con los códigos de actividades.',
          },
          {
            tipo: 'p',
            texto:
              '**18. Revisión de coherencia.** Recorre todo el documento: problema, objetivos, solución, productos, beneficiarios, duración y presupuesto deben reforzarse sin contradecirse. Si algo choca (por ejemplo, metas muy grandes para poco tiempo), propone un ajuste concreto en metas, plazos, actividades o rubros.',
          },
          {
            tipo: 'p',
            texto:
              '**19. Armado final.** Reúne todo en un solo documento, con textos y tablas ordenados. Revisa sumas, títulos de tablas, evidencia de cada producto, presentación uniforme y que no quede ninguna sección obligatoria sin cerrar.',
          },
        ],
      },
      {
        titulo: 'Glosario',
        bloques: [
          {
            tipo: 'lista',
            items: [
              '**Árbol de problemas:** esquema del problema central con sus causas y efectos.',
              '**Árbol de objetivos:** el mismo esquema en positivo, con medios, objetivo general y fines.',
              '**Cadena de valor:** tabla que une objetivos, productos, indicadores, metas y actividades.',
              '**Código de actividades (EDT):** numeración por niveles (1.1, 1.2, 2.1…) que une actividades, cronograma y presupuesto.',
              '**Fuentes de verificación:** documentos que prueban que se cumplió algo: actas, bases de datos, listas de asistencia, informes.',
            ],
          },
        ],
      },
    ],
    enlaces: [HOJA_ARBOL, HOJA_BENEFICIARIO],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'ruta-estrategica',
    titulo: 'Ruta Estratégica Serving: del panorama al proyecto',
    subtitulo: 'Cómo decidir tu enfoque antes de armar tus árboles',
    resumen: 'Elegir, renunciar y conocer a tu beneficiario antes de escribir una sola línea del proyecto.',
    intro: [],
    secciones: [
      {
        titulo: '1. Primero el panorama, después el proyecto',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Antes de escribir una sola línea de tu proyecto, mira el panorama: el territorio, quiénes están en él, qué fondos y convocatorias existen y qué necesidades hay.',
          },
          {
            tipo: 'lista',
            items: [
              '**El panorama es la estrategia:** dónde estás parado y hacia dónde te conviene ir.',
              '**El proyecto es la ejecución:** lo concreto que vas a hacer una vez elegido el camino.',
            ],
          },
          {
            tipo: 'p',
            texto: 'Los proyectos que ganan casi siempre empiezan por entender el panorama, y no por la idea suelta.',
          },
        ],
      },
      {
        titulo: '2. Hacer estrategia es elegir y también renunciar',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Planear bien es usar mejor los recursos y las capacidades de tu equipo, para lograr más impacto con menos desgaste. Eso exige dos movimientos:',
          },
          { tipo: 'p', texto: '**Lo que eliges (tu enfoque):**' },
          {
            tipo: 'lista',
            items: ['Territorio', 'Aliados clave', 'Fondos', 'Convocatorias', 'Líneas temáticas', 'Sector', 'Quién presenta el proyecto'],
          },
          { tipo: 'p', texto: '**Lo que dejas por fuera (tus límites):**' },
          {
            tipo: 'lista',
            items: ['Temas descartados', 'Convocatorias inviables', 'Beneficiarios fuera de tu alcance'],
          },
          { tipo: 'p', texto: 'Si no eliges y no renuncias, tu proyecto queda disperso y se pierde la fuerza.' },
        ],
      },
      {
        titulo: '3. Conoce a tu beneficiario ideal y sus diez dificultades principales',
        bloques: [
          {
            tipo: 'p',
            texto:
              'Define con precisión a la persona o comunidad a la que quieres ayudar: tu **beneficiario ideal**. Luego anota las **diez dificultades principales** que esa persona vive. No son ideas tuyas: son las que ella reconocería como suyas.',
          },
          { tipo: 'p', texto: 'Estas diez dificultades son la materia prima de tu árbol de problemas.' },
          {
            tipo: 'p',
            texto:
              '**Un paso de revisión:** antes de seguir, alguien con ojo crítico (en Serving, el equipo de Estructuración) debe revisar el árbol de problemas para confirmar que el problema es real y que el proyecto es viable.',
          },
        ],
      },
      {
        titulo: '4. Anatomía del árbol de problemas',
        bloques: [
          {
            tipo: 'lista',
            items: [
              '**Tronco:** el problema central.',
              '**Raíces:** las causas (3 directas y 3 indirectas).',
              '**Ramas:** los efectos (3 directos y 3 indirectos).',
            ],
          },
        ],
      },
      {
        titulo: '5. Las líneas de coherencia',
        bloques: [
          { tipo: 'p', texto: 'Un árbol bien hecho se lee de abajo hacia arriba, en tres movimientos:' },
          {
            tipo: 'numerada',
            items: [
              '**Identifica las causas de fondo** de cada dificultad (las estructurales, no las superficiales).',
              '**Conéctalas con el problema central.** Cada causa tiene que llevar directamente a él.',
              '**Solo entonces atiende los efectos.** Si resuelves bien las causas, las consecuencias empiezan a resolverse.',
            ],
          },
        ],
      },
      {
        titulo: '6. La regla de pasar a positivo',
        bloques: [
          { tipo: 'cita', texto: 'Objetivo general = problema central en lenguaje positivo + verbo en infinitivo al inicio.' },
          {
            tipo: 'p',
            texto:
              'Ejemplo: "Pocos jóvenes participan en la vida cultural del barrio" pasa a "Aumentar la participación de los jóvenes en la vida cultural del barrio."',
          },
        ],
      },
      {
        titulo: '7. Anatomía del árbol de objetivos',
        bloques: [
          {
            tipo: 'lista',
            items: [
              '**Tronco:** el objetivo general.',
              '**Raíces:** los medios (directos e indirectos).',
              '**Ramas:** los fines (directos e indirectos).',
            ],
          },
        ],
      },
      {
        titulo: '8. La cadena de valor es el esqueleto del proyecto',
        bloques: [
          { tipo: 'p', texto: 'Cada parte de tus árboles tiene su lugar en el proyecto:' },
          {
            tipo: 'tabla',
            cabecera: ['Del árbol', 'Pasa a ser'],
            filas: [
              ['Problema central', 'Título del proyecto (alineado con él)'],
              ['Tronco (objetivo general)', 'Objetivo general'],
              ['Medios directos', 'Objetivos específicos: las metas o entregables principales'],
              ['Medios indirectos', 'Actividades de ejecución: los pasos para lograr cada objetivo específico'],
            ],
          },
        ],
      },
      {
        titulo: '9. Resumen en cuatro pasos',
        bloques: [
          {
            tipo: 'numerada',
            items: [
              '**El panorama:** elegir, renunciar y definir tu beneficiario ideal.',
              '**Árbol de problemas:** descubrir las causas de fondo y revisarlas.',
              '**Árbol de objetivos:** pasar todo a positivo, con verbos en infinitivo.',
              '**Cadena de valor:** armar el esqueleto de entregables y actividades.',
            ],
          },
        ],
      },
    ],
    cierre: [{ tipo: 'cita', texto: 'Una estructura coherente convierte las causas de fondo en resultados que se pueden ver y medir.' }],
    enlaces: [HOJA_BENEFICIARIO, HOJA_ARBOL],
  },

  /* ------------------------------------------------------------------ */
  {
    slug: 'revision-final',
    titulo: 'Guía Serving de Revisión Final',
    subtitulo: 'Cómo revisar y fortalecer tu proyecto antes de postular',
    resumen: 'La última revisión antes de enviar tu proyecto a una convocatoria, en cinco pasos.',
    intro: [
      {
        tipo: 'p',
        texto:
          'Es la última revisión antes de enviar tu proyecto a una convocatoria, fondo o licitación. El objetivo es comprobar que cumple lo técnico, lo financiero y lo estratégico, y subir su puntaje antes de que lo vea el evaluador.',
      },
      { tipo: 'p', texto: 'Funciona en cinco pasos, siempre en el mismo orden.' },
    ],
    secciones: [
      {
        titulo: 'Paso 1. Reúne todo el material',
        bloques: [
          { tipo: 'p', texto: 'Junta la información completa del proyecto, actualizada:' },
          {
            tipo: 'lista',
            items: [
              'Título',
              'Resumen ejecutivo',
              'Justificación (técnica y del contexto)',
              'Análisis de impacto',
              'Equipo y actividades',
              'Cronograma',
              'Presupuesto detallado',
              'Indicadores y forma de medir resultados',
            ],
          },
          {
            tipo: 'p',
            texto: '**Consejo:** revisa con el material completo desde el inicio. Una revisión con información a medias da un diagnóstico a medias.',
          },
        ],
      },
      {
        titulo: 'Paso 2. Califica por criterios',
        bloques: [
          {
            tipo: 'p',
            texto: 'Cada criterio se califica con un puntaje y con una razón concreta que lo explique. Los criterios más comunes son:',
          },
          {
            tipo: 'tabla',
            cabecera: ['Criterio', 'Qué se mira'],
            filas: [
              ['Propuesta técnica', 'Claridad, método y coherencia interna'],
              ['Impacto potencial', 'Alcance, transformación y resultados esperados'],
              ['Fortalecimiento de capacidades locales', 'Inclusión, trabajo con el territorio y formación'],
              ['Sostenibilidad', 'Que el proyecto pueda continuar en lo técnico, social y financiero'],
              ['Replicabilidad y escalabilidad', 'Posibilidad de repetirse o crecer en otros territorios'],
            ],
          },
          {
            tipo: 'p',
            texto:
              '**Importante:** cada convocatoria define sus propios criterios y su propia ponderación. En esos casos, se califica con los de la convocatoria. Los de arriba son la referencia de Serving cuando no hay otros.',
          },
          { tipo: 'p', texto: '**Resultado:** puntaje total, puntaje por criterio y una observación justificada en cada uno.' },
        ],
      },
      {
        titulo: 'Paso 3. Encuentra las debilidades',
        bloques: [
          { tipo: 'p', texto: 'Con la calificación a la vista, se listan los puntos débiles, agrupados así:' },
          {
            tipo: 'lista',
            items: [
              '**Coherencia técnica:** cosas que no cuadran entre secciones.',
              '**Justificación o diagnóstico:** el problema no está bien sustentado.',
              '**Riesgos financieros o de sostenibilidad:** qué pasa cuando se acabe el dinero.',
              '**Falta de evidencia:** afirmaciones sin soporte (cartas, datos, actas).',
              '**Alineación con la convocatoria:** el proyecto no responde a lo que se pide.',
            ],
          },
        ],
      },
      {
        titulo: 'Paso 4. Propón mejoras',
        bloques: [
          { tipo: 'p', texto: 'Por cada debilidad, una mejora concreta. Cada una lleva:' },
          {
            tipo: 'numerada',
            items: [
              'Qué se va a mejorar.',
              'Qué debilidad corrige.',
              'Qué efecto se espera.',
              'Prioridad: **Alta**, **Media** o **Baja**.',
              'Estado: **Pendiente**, **En proceso** o **Resuelto**.',
            ],
          },
          {
            tipo: 'p',
            texto:
              '**Ejemplo.** Debilidad: "El impacto ambiental no está cuantificado." Mejora: "Incluir indicadores de huella de carbono o consumo de agua para medir los resultados ambientales."',
          },
          { tipo: 'p', texto: 'Se empieza siempre por las de prioridad Alta.' },
        ],
      },
      {
        titulo: 'Paso 5. Informe de revisión final',
        bloques: [
          { tipo: 'p', texto: 'Al cerrar, se arma un informe con:' },
          {
            tipo: 'lista',
            items: [
              'Puntaje total y por criterio.',
              'Lista de debilidades encontradas.',
              'Mejoras ordenadas por prioridad.',
              'Recomendaciones para la postulación.',
            ],
          },
          { tipo: 'p', texto: 'Este informe se guarda con el proyecto y se adjunta al proceso previo a postular.' },
        ],
      },
      {
        titulo: 'Seguimiento',
        bloques: [
          {
            tipo: 'lista',
            items: [
              'Cada revisión admite comentarios, para aclarar dudas o recibir observaciones.',
              'Después de hacer los cambios, se puede pedir una segunda revisión.',
              'Se conserva el historial de versiones, para comparar la versión inicial con la mejorada.',
            ],
          },
        ],
      },
      {
        titulo: 'Buenas prácticas',
        bloques: [
          {
            tipo: 'lista',
            items: [
              'No te quedes solo con el puntaje: lee cada razón y cada debilidad. Ahí está lo que aprendes.',
              'Usa las mejoras como guía para preparar tu versión final.',
              'Haz una segunda revisión después de los cambios, para confirmar que mejoró.',
            ],
          },
        ],
      },
    ],
    enlaces: [],
  },
]

export function buscarGuia(slug: Guia['slug']): Guia {
  const guia = GUIAS.find((g) => g.slug === slug)
  if (!guia) throw new Error(`Guía no encontrada: ${slug}`)
  return guia
}
