// Contenido del curso "Entendiendo la Estructuración de Proyectos" (Academia).
// Formato de LECTURA: 4 bloques, cada uno con varias unidades.
// Contenido reescrito con palabras propias a partir del material de origen
// del dueño de la plataforma. No debe incluirse en ningún lugar el nombre
// de la fuente original ni ninguna otra marca de terceros.

export interface Subtema {
  titulo: string;
  parrafos: string[];
  lista?: string[];
}

export interface Unidad {
  id: string;
  numero: string;
  titulo: string;
  parrafos: string[];
  subtemas?: Subtema[];
  checklist?: { titulo: string; items: string[] };
  preguntas?: string[];
}

export interface CasoDeEstudio {
  titulo: string;
  parrafos: string[];
  preguntas?: string[];
}

export interface Bloque {
  id: string;
  numero: number;
  titulo: string;
  subtitulo: string;
  introduccion: string[];
  unidades: Unidad[];
  casosDeEstudio?: CasoDeEstudio[];
  erroresComunes?: { titulo: string; items: string[] };
  recomendaciones?: string[];
  cierre?: string[];
  autoevaluacion?: string[];
  puntosClave: string[];
  glosario: { termino: string; definicion: string }[];
}

export const academiaContenido: Bloque[] = [
  {
    id: "bloque-1",
    numero: 1,
    titulo: "Ecosistema de financiación y rol del estructurador",
    subtitulo: "Entender el terreno antes de diseñar el proyecto",
    introduccion: [
      "Ningún proyecto avanza sin recursos. Antes de escribir un objetivo, definir actividades o armar un presupuesto, quien va a estructurar un proyecto necesita entender el terreno donde se mueve: qué caminos existen para conseguir financiación, quién participa en cada uno, y qué papel juega la persona que conecta todo ese proceso. De eso trata este primer bloque: construir un mapa claro del ecosistema de financiación y del rol del estructurador dentro de él.",
      "Este mapa no es un ejercicio teórico aislado: es la base sobre la que se apoyan las decisiones de los tres bloques siguientes. Un error típico de quien empieza en este campo es ponerse a redactar un proyecto sin haber decidido antes a qué tipo de financiador se va a dirigir. Este bloque busca evitar justamente ese error, entregando un marco de referencia que se usará todo el programa.",
      "En las siguientes unidades vas a ver, en orden: un panorama de los mecanismos de financiación disponibles hoy, los actores que participan en cada uno y qué los mueve, el rol concreto del estructurador dentro de ese ecosistema, y un conjunto de criterios prácticos para hacer una primera lectura de qué oportunidades de financiación encajan con una iniciativa concreta.",
    ],
    unidades: [
      {
        id: "1-1",
        numero: "1.1",
        titulo: "Ecosistema de financiación",
        parrafos: [
          "El ecosistema de financiación es el conjunto de mecanismos, instituciones y flujos de recursos a través de los cuales una organización —pública, privada o de la sociedad civil— puede conseguir financiamiento para sus iniciativas. No hay un único camino: hay varios, cada uno con su propia lógica, sus requisitos, sus tiempos y sus expectativas de retorno o de impacto. Entender bien este panorama es el primer paso para decidir con criterio hacia dónde dirigir un proyecto.",
          "Es útil imaginar este ecosistema como un espectro: en un extremo están los mecanismos que buscan casi exclusivamente impacto social o de desarrollo; en el otro, los que buscan principalmente retorno financiero. La mayoría de las fuentes se ubican en algún punto intermedio, combinando ambas expectativas en proporciones distintas.",
        ],
        subtemas: [
          {
            titulo: "Cooperación internacional",
            parrafos: [
              "Agrupa los recursos no reembolsables —o en condiciones muy favorables— que aportan agencias multilaterales, agencias bilaterales de países donantes, organismos de Naciones Unidas y fundaciones internacionales. Suelen apuntar a objetivos de desarrollo alineados con agendas globales, como los Objetivos de Desarrollo Sostenible, y exigen procesos de formulación técnica rigurosos, muchas veces basados en el marco lógico.",
            ],
            lista: [
              "Formalidad: alta. Pide documentación técnica extensa y evaluación en varias etapas.",
              "Plazos: procesos de postulación de varios meses; proyectos financiados de uno a cinco años.",
              "Quién suele acceder: entidades públicas, organizaciones de la sociedad civil y, con menos frecuencia, alianzas con el sector privado.",
              "Documentos típicos: diagnóstico, marco lógico, presupuesto detallado, cartas de compromiso institucional, informes de sostenibilidad.",
            ],
          },
          {
            titulo: "Convocatorias públicas",
            parrafos: [
              "Son fondos concursables que abren gobiernos nacionales, departamentales o municipales, ministerios y agencias estatales, para financiar proyectos que respondan a una política pública, un programa sectorial o una necesidad territorial concreta. Se rigen por bases y términos de referencia bien definidos, con criterios de elegibilidad que hay que cumplir por completo para que la propuesta llegue a evaluación.",
            ],
            lista: [
              "Formalidad: alta, con procesos administrativos y de contratación pública que pueden ser exigentes.",
              "Plazos: ventanas de postulación cortas —semanas o pocos meses— con cronogramas públicos y fijos.",
              "Quién suele acceder: entidades públicas, organizaciones formalmente registradas y, a veces, empresas.",
              "Documentos típicos: formato oficial de postulación, certificaciones legales y tributarias, avales institucionales.",
            ],
          },
          {
            titulo: "Banca de desarrollo",
            parrafos: [
              "Son entidades financieras multilaterales o nacionales que otorgan créditos en condiciones más favorables que la banca comercial —tasas preferenciales, plazos más largos, periodos de gracia— para proyectos de infraestructura, desarrollo productivo o impacto social. A diferencia de la cooperación, estos recursos se devuelven, así que exigen un análisis financiero serio que demuestre capacidad de pago.",
            ],
            lista: [
              "Formalidad: muy alta. Exige estudios técnicos, financieros y, muchas veces, ambientales y sociales.",
              "Plazos: estructuración y aprobación de varios meses a más de un año, sobre todo en infraestructura.",
              "Quién suele acceder: entidades públicas, empresas y, en menor medida, organizaciones con capacidad financiera comprobada.",
              "Documentos típicos: estudios de factibilidad, estados financieros, garantías, evaluación de salvaguardas ambientales y sociales.",
            ],
          },
          {
            titulo: "Inversión privada",
            parrafos: [
              "Agrupa los recursos de inversionistas individuales, fondos de capital de riesgo o fondos de inversión de impacto, que buscan retorno financiero y, en algunos casos, retorno social o ambiental medible. Es el camino más relevante para emprendimientos, y exige demostrar potencial de crecimiento, un modelo de negocio escalable y un equipo sólido.",
            ],
            lista: [
              "Formalidad: variable. Va desde inversionistas ángel con procesos flexibles hasta fondos institucionales con debida diligencia exhaustiva.",
              "Plazos: negociaciones de semanas a varios meses, con retorno esperado a mediano o largo plazo.",
              "Quién suele acceder: emprendimientos y empresas con potencial de crecimiento demostrable.",
              "Documentos típicos: Pitch Deck, plan de negocio, proyecciones financieras y, en etapas avanzadas, auditorías legales y financieras.",
            ],
          },
          {
            titulo: "Fundaciones y filantropía",
            parrafos: [
              "Son organizaciones sin fines de lucro que destinan recursos propios o de terceros a causas específicas, con procesos de postulación normalmente más flexibles que la cooperación internacional, aunque igual de exigentes en resultados verificables. Muchas fundaciones se enfocan en sectores muy concretos, así que conviene revisar bien la alineación antes de postular.",
            ],
            lista: [
              "Formalidad: media. Menos burocrática que la cooperación multilateral, pero igual de exigente en el fondo.",
              "Plazos: variables según la fundación; en general más ágiles que la cooperación multilateral.",
              "Quién suele acceder: organizaciones de la sociedad civil, con menos frecuencia entidades públicas o empresas con programas de impacto.",
              "Documentos típicos: nota conceptual, informes de resultados previos, referencias institucionales.",
            ],
          },
          {
            titulo: "Financiamiento colectivo (crowdfunding)",
            parrafos: [
              "Un proyecto consigue recursos a través de aportes de muchas personas, casi siempre por plataformas digitales. Funciona como vía complementaria a otros mecanismos y también como validación pública de una idea: cómo responde la gente a una campaña da señales tempranas del interés que despierta el proyecto.",
            ],
            lista: [
              "Formalidad: baja a media, según la plataforma.",
              "Plazos: campañas de semanas a pocos meses, con resultados visibles en tiempo real.",
              "Quién suele acceder: emprendimientos y proyectos culturales o sociales con capacidad de comunicar y movilizar una comunidad.",
              "Documentos típicos: material audiovisual, narrativa persuasiva del proyecto y, a veces, comprobación de identidad legal del promotor.",
            ],
          },
          {
            titulo: "Tendencias actuales del ecosistema",
            parrafos: [
              "El ecosistema no es estático: cambia con las prioridades globales, las crisis económicas o ambientales, y la maduración de nuevos instrumentos financieros. Conocer algunas tendencias ayuda a anticipar hacia dónde se mueven las oportunidades.",
              "Financiamiento combinado (blended finance): cada vez más proyectos combinan recursos no reembolsables, créditos concesionales y capital privado en lugar de depender de una sola fuente, lo que reduce el riesgo de cada financiador y amplía la escala posible.",
              "Fondos climáticos y ambientales: la expansión de fondos para mitigación y adaptación al cambio climático abrió una categoría propia, con criterios técnicos adicionales a los del sector de origen del proyecto.",
              "Inversión de impacto: crecen los fondos que exigen retorno financiero y resultados sociales o ambientales medibles al mismo tiempo, difuminando la frontera entre cooperación tradicional e inversión privada.",
              "Digitalización de los procesos: casi todas las fuentes migraron su postulación, seguimiento y reporte a plataformas digitales, así que conviene manejar herramientas de gestión documental.",
              "Estas tendencias no reemplazan a los mecanismos tradicionales: se superponen a ellos. Un mismo proyecto de infraestructura sostenible puede recibir a la vez un crédito de banca de desarrollo, un componente no reembolsable de un fondo climático y una contrapartida de inversión privada.",
            ],
          },
          {
            titulo: "Financiamiento según la etapa del proyecto",
            parrafos: [
              "Además de mirar la naturaleza del mecanismo, conviene mirar el ecosistema según el ciclo de vida del proyecto. No todos los mecanismos son igual de accesibles ni igual de pertinentes en cada etapa: una idea sin validar difícilmente llega a banca de desarrollo, así como un proyecto consolidado con ingresos estables casi nunca recurre al crowdfunding como fuente principal.",
              "Reconocer en qué etapa está un proyecto evita un error frecuente: apuntar a mecanismos que piden un nivel de madurez que la iniciativa todavía no tiene. En esos casos, lo razonable no es forzar una postulación prematura, sino buscar un mecanismo acorde a la etapa actual que ayude a generar la evidencia necesaria para, más adelante, acceder a fuentes más exigentes.",
            ],
          },
          {
            titulo: "El ecosistema en el contexto latinoamericano",
            parrafos: [
              "Aunque los mecanismos descritos son de alcance global, su peso relativo cambia de una región a otra. En Latinoamérica, la banca de desarrollo regional y nacional tiene un lugar particularmente relevante en infraestructura y desarrollo productivo, dado su papel histórico en programas de gran escala. La cooperación internacional bilateral y multilateral también mantiene presencia fuerte en educación, salud, medio ambiente y fortalecimiento institucional.",
              "Las convocatorias públicas ganan relevancia sobre todo a nivel municipal y departamental, donde gobiernos locales destinan recursos propios o de regalías a programas sociales y productivos. La inversión privada y el capital de riesgo, aunque crecen de forma sostenida en la región, siguen siendo comparativamente menos maduros que en otras partes del mundo, lo que se traduce en procesos menos estandarizados y en mayor peso de las relaciones directas con inversionistas.",
              "Conocer estas particularidades no reemplaza el análisis específico de cada país o territorio, pero da un punto de partida razonable: en buena parte de la región, la combinación de banca de desarrollo, cooperación internacional y convocatorias públicas territoriales sigue siendo el eje del financiamiento de proyectos de desarrollo, mientras la inversión privada avanza con más fuerza en proyectos de base tecnológica o de alto potencial de escalamiento comercial.",
            ],
          },
          {
            titulo: "Cómo elegir entre mecanismos similares",
            parrafos: [
              "En muchos casos un proyecto es compatible, en principio, con más de un mecanismo a la vez. Cuando pasa esto, conviene evaluar no solo si el tema encaja, sino si la organización tiene la capacidad real de sostener el nivel de exigencia administrativa de cada alternativa. Elegir el mecanismo más exigente sin tener la capacidad instalada puede generar retrasos, incumplimientos o, en el peor caso, la pérdida del financiamiento ya otorgado.",
            ],
          },
        ],
        checklist: {
          titulo: "Panorama inicial",
          items: [
            "Puedo nombrar al menos cuatro mecanismos distintos de financiación relevantes para mi sector.",
            "Entiendo la diferencia entre recursos reembolsables y no reembolsables.",
            "Sé, de forma general, qué nivel de formalidad exige cada mecanismo.",
            "Identifiqué qué mecanismos son, a priori, más compatibles con el tipo de organización que represento.",
          ],
        },
        preguntas: [
          "¿Qué mecanismos de financiación ha usado —o intentado usar— la organización o el proyecto en el que trabajas hoy?",
          "¿Qué tan claro tienes cuál sería el mecanismo más adecuado para tu proyecto?",
          "¿Qué combinación de mecanismos podría tener sentido para tu proyecto en distintas etapas de su desarrollo?",
        ],
      },
      {
        id: "1-2",
        numero: "1.2",
        titulo: "Actores del ecosistema",
        parrafos: [
          "Cada mecanismo de financiación involucra actores con lógicas, incentivos y expectativas distintas. Reconocerlos permite anticipar qué información valora cada uno y cómo comunicar el proyecto en consecuencia. Presentar el mismo proyecto, con el mismo énfasis, a audiencias que valoran cosas distintas, corre el riesgo de no conectar con lo que esa audiencia necesita ver para decidir a favor.",
        ],
        subtemas: [
          {
            titulo: "Organismos internacionales",
            parrafos: [
              "Agencias de cooperación, organismos multilaterales y entidades del sistema de Naciones Unidas. Su lógica apunta al impacto en desarrollo, la alineación con agendas globales y la sostenibilidad de largo plazo. Valoran especialmente que el proyecto genere aprendizajes replicables y sea coherente con las prioridades estratégicas de la agencia en el país o la región.",
            ],
          },
          {
            titulo: "Entidades públicas",
            parrafos: [
              "Ministerios, gobernaciones, alcaldías y agencias estatales. Su lógica es cumplimiento normativo, ejecución presupuestal, rendición de cuentas y alineación con planes de desarrollo o políticas sectoriales vigentes. Un proyecto que no pueda mostrar esa alineación difícilmente avanza, sin importar su calidad técnica.",
            ],
          },
          {
            titulo: "Empresas y banca de desarrollo",
            parrafos: [
              "Combinan viabilidad financiera, gestión de riesgo y, cada vez más, criterios de sostenibilidad ambiental y social. Cuando una empresa financia proyectos a través de programas de responsabilidad social o de innovación abierta, se suma el interés por su reputación institucional y su relación con sus grupos de interés.",
            ],
          },
          {
            titulo: "Fundaciones",
            parrafos: [
              "Su lógica está centrada en la causa o el problema social que atienden, y en la capacidad demostrada de la organización ejecutora para generar resultados verificables. Muchas construyen relaciones de largo plazo con las organizaciones que financian, lo que abre la puerta a renovar fondos si los resultados iniciales son sólidos.",
            ],
          },
          {
            titulo: "Inversionistas",
            parrafos: [
              "Priorizan el retorno financiero, la escalabilidad del modelo y la solidez del equipo emprendedor, aunque en inversión de impacto se suma la exigencia de resultados sociales o ambientales medibles. Suelen evaluar no solo la idea, sino la capacidad del equipo para ejecutarla y adaptarse ante la incertidumbre.",
            ],
          },
          {
            titulo: "Organizaciones de apoyo",
            parrafos: [
              "Incubadoras, aceleradoras, redes y consultoras especializadas que no financian directamente, pero acompañan la estructuración y conectan proyectos con fuentes de financiación. Su lógica es fortalecer la capacidad técnica de los proyectos que acompañan, y muchas veces actúan como puente de confianza entre el proyecto y el financiador final.",
            ],
          },
          {
            titulo: "Herramienta: matriz de poder e interés",
            parrafos: [
              "Es una herramienta para analizar a los actores relevantes de un proyecto, clasificándolos según dos dimensiones: el nivel de influencia que tienen sobre el proyecto y el nivel de interés que muestran hacia él. Esta clasificación ayuda a decidir qué tipo de relación y comunicación conviene mantener con cada uno.",
              "Entender la lógica de cada actor evita uno de los errores más comunes: presentar la misma narrativa, con el mismo énfasis, a audiencias que valoran cosas distintas. Un mismo proyecto puede —y debe— comunicarse de forma diferente según a quién se dirija, sin que eso cambie su esencia técnica. Volvemos sobre esta idea en el bloque 4, al hablar de adaptar el proyecto para distintas fuentes.",
              "También suele pasar que distintos actores necesitan coordinarse entre sí para que el financiamiento se concrete: una convocatoria pública puede pedir una carta de respaldo de una entidad territorial, o un fondo de cooperación puede exigir evidencia de alianza con una empresa local. Anticipar estas necesidades de coordinación, y no solo la relación con el financiador principal, evita retrasos de última hora en la postulación.",
            ],
          },
          {
            titulo: "Alianzas multiactor",
            parrafos: [
              "Cada vez más proyectos, sobre todo los de mayor escala o complejidad, se estructuran a partir de alianzas entre varios tipos de actores: una entidad pública que aporta el marco normativo y territorial, una organización de la sociedad civil que aporta la ejecución operativa, y una empresa o un organismo de cooperación que aporta el financiamiento o el conocimiento técnico especializado. Este tipo de alianzas amplía las posibilidades de financiamiento, pero también complica la coordinación.",
              "Para que una alianza multiactor funcione conviene definir desde el inicio los roles y responsabilidades de cada parte, cómo se toman las decisiones conjuntas, y cómo se reparten los créditos y la visibilidad institucional del proyecto. No tener esto claro desde el principio es una de las causas más frecuentes de conflictos entre aliados durante la ejecución.",
            ],
          },
          {
            titulo: "Cómo investigar la lógica real de un actor",
            parrafos: [
              "Más allá de la descripción general de cada tipo de actor, conviene investigar la lógica específica de los actores concretos con los que se va a interactuar en un proyecto determinado. Esta investigación puede apoyarse en fuentes públicas —informes anuales, estrategias institucionales, comunicados de prensa— y en conversaciones directas con personas que ya hayan tenido relación con ese actor.",
            ],
            lista: [
              "Revisar las prioridades estratégicas que la institución o el inversionista declara públicamente.",
              "Identificar proyectos que ese actor haya financiado antes, y qué características comparten.",
              "Conversar, cuando sea posible, con organizaciones que ya hayan tenido relación con ese actor específico.",
              "Prestar atención al lenguaje que usa el actor en sus comunicaciones públicas: suele reflejar lo que valora.",
            ],
          },
        ],
        preguntas: [
          "¿Quiénes son los actores de alto poder y alto interés en tu proyecto actual?",
          "¿Qué información necesitaría cada uno de esos actores para apoyar tu proyecto?",
          "¿Qué fuentes de información tienes a la mano para investigar la lógica específica de esos actores?",
        ],
      },
      {
        id: "1-3",
        numero: "1.3",
        titulo: "Rol del estructurador de proyectos",
        parrafos: [
          "El estructurador de proyectos es la persona —o el equipo— que conecta, de forma técnica y estratégica, las necesidades u oportunidades de una organización con las alternativas de financiación del ecosistema. No es solo quien redacta un documento: es quien diagnostica, diseña la arquitectura del proyecto y prepara el camino para que ese proyecto pueda dialogar con distintas fuentes de financiación.",
          "Vale la pena distinguir este rol de otros con los que suele confundirse, porque en la práctica muchas organizaciones asignan estas funciones de manera indiferenciada a una sola persona, lo que genera confusión sobre el alcance real de cada una.",
        ],
        subtemas: [
          {
            titulo: "Funciones principales del estructurador",
            parrafos: [],
            lista: [
              "Diagnóstico organizacional y de contexto: entender a fondo la organización, sus capacidades y el entorno en el que opera.",
              "Traducir necesidades u oportunidades a lenguaje de proyecto: convertir una idea o un problema en objetivos, resultados y actividades organizadas.",
              "Articular la organización con las fuentes de financiación: identificar y establecer relación con los actores relevantes del ecosistema.",
              "Acompañar la elaboración de la documentación técnica: asegurar que el expediente cumpla los estándares exigidos.",
              "Identificar y gestionar riesgos temprano: anticipar factores que puedan afectar la viabilidad o el financiamiento de la iniciativa.",
            ],
          },
          {
            titulo: "Competencias necesarias",
            parrafos: [],
            lista: [
              "Competencias analíticas, para diagnosticar con rigor una situación, un contexto o una organización, distinguiendo causas de síntomas.",
              "Competencias comunicativas, para traducir información técnica en narrativas claras, adaptadas a audiencias distintas.",
              "Conocimiento metodológico: dominio de herramientas como el marco lógico o la teoría de cambio, que se ven en los bloques 2 y 3.",
              "Conducta ética consistente: el estructurador suele acceder a información sensible de la organización y la representa frente a terceros, lo que exige integridad y confidencialidad.",
            ],
          },
          {
            titulo: "El trabajo del estructurador en la práctica",
            parrafos: [
              "En el día a día, el trabajo del estructurador rara vez es una sola tarea a la vez. Combina reuniones de diagnóstico con distintas áreas de la organización, revisión de información sobre el contexto del proyecto, redacción y ajuste de documentos técnicos, e investigación activa de posibles fuentes de financiación. Esto exige organización y priorización, sobre todo cuando se trabajan varios proyectos o postulaciones al mismo tiempo.",
              "Este programa incorpora, de forma transversal, el uso de herramientas de inteligencia artificial como apoyo en distintas etapas de este trabajo: desde el análisis inicial de información y la organización de ideas, hasta borradores de redacción y revisión técnica de documentos. Estas herramientas no reemplazan el criterio del estructurador —que sigue siendo responsable de la calidad y veracidad de la información— pero sí aceleran tareas que antes tomaban mucho tiempo, liberando espacio para el análisis estratégico, que es el verdadero valor del rol.",
            ],
          },
          {
            titulo: "Herramientas y plantillas del estructurador",
            parrafos: [
              "A lo largo del programa se presentan herramientas y plantillas reutilizables en proyectos futuros, adaptándolas a cada contexto. Familiarizarse con ellas desde el inicio ayuda a aplicarlas con más fluidez en las actividades prácticas de los bloques siguientes.",
            ],
            lista: [
              "Matriz de poder e interés, para mapear actores relevantes de un proyecto.",
              "Árbol de problemas y análisis de involucrados, que se profundizan en el bloque 2.",
              "Matriz de marco lógico, cronograma y presupuesto, que se desarrollan en el bloque 3.",
              "Matriz de matching y checklist de adaptación documental, que se ven en el bloque 4.",
            ],
          },
          {
            titulo: "Errores comunes del estructurador novato",
            parrafos: [
              "Quien empieza en este rol suele cometer un conjunto de errores previsibles, que conviene tener presentes desde el principio para evitarlos a propósito.",
            ],
            lista: [
              "Asumir solo el rol de formulador, sin dedicar tiempo suficiente al diagnóstico previo.",
              "Comunicarse con los financiadores en un lenguaje demasiado técnico o, al contrario, demasiado informal para el contexto.",
              "No documentar de forma ordenada las decisiones y supuestos tomados durante la estructuración, lo que dificulta explicar el proyecto ante audiencias distintas.",
              "Subestimar el tiempo que toma construir relaciones de confianza con los actores del ecosistema, esperando resultados inmediatos.",
            ],
          },
        ],
        checklist: {
          titulo: "Rol del estructurador",
          items: [
            "Distingo con claridad las diferencias entre estructurar, formular y gestionar un proyecto.",
            "Identifiqué las competencias que ya tengo desarrolladas y las que necesito fortalecer.",
            "Entiendo la responsabilidad ética que implica representar a una organización frente a un financiador.",
          ],
        },
      },
      {
        id: "1-4",
        numero: "1.4",
        titulo: "Identificación de oportunidades de financiación",
        parrafos: [
          "Antes de buscar convocatorias o fondos específicos —tema que se profundiza en el bloque 4— hace falta contar con criterios claros para analizar una iniciativa y orientar la búsqueda. Estos criterios permiten hacer un primer filtro razonado, en vez de dispersar esfuerzos en muchas direcciones sin análisis previo.",
        ],
        subtemas: [
          {
            titulo: "Criterios para el análisis inicial",
            parrafos: [],
            lista: [
              "Tipo de organización que presenta el proyecto: entidad pública, sociedad civil, empresa o emprendimiento.",
              "Naturaleza del proyecto: impacto social o ambiental, retorno financiero, o una combinación de ambos.",
              "Etapa de madurez de la iniciativa: idea inicial, piloto, escalamiento o consolidada.",
              "Escala de recursos que se requieren y plazos previstos de ejecución.",
              "Alcance geográfico y sectorial del proyecto.",
              "Capacidad instalada de la organización para cumplir los requisitos administrativos y de reporte de cada tipo de fuente.",
            ],
          },
          {
            titulo: "Un ejercicio simple de autoevaluación",
            parrafos: [
              "Una forma práctica de aplicar estos criterios es construir una tabla que cruce las características del proyecto con los requisitos generales de cada mecanismo visto en la unidad 1.1. No se trata de elegir ya una convocatoria específica, sino de delimitar el universo de mecanismos razonablemente compatibles: un ejercicio de orientación que reduce el riesgo de invertir tiempo en postulaciones con baja probabilidad de éxito desde el inicio.",
            ],
          },
          {
            titulo: "Errores comunes en esta etapa",
            parrafos: [],
            lista: [
              "Buscar financiamiento sin haber definido con claridad la naturaleza y la escala real del proyecto.",
              "Enfocarse solo en la fuente más conocida o prestigiosa, sin evaluar si realmente encaja.",
              "Subestimar la capacidad administrativa que exige cada mecanismo, generando postulaciones incompletas o fuera de plazo.",
              "No considerar la posibilidad de combinar más de un mecanismo en distintas etapas del proyecto.",
            ],
          },
          {
            titulo: "Construir un radar propio de oportunidades",
            parrafos: [
              "Más allá del análisis puntual de una iniciativa, conviene que todo estructurador tenga el hábito de mantener un radar permanente de oportunidades relevantes para su sector: identificar con anticipación qué instituciones, fondos y convocatorias tienden a repetirse cada cierto tiempo, y qué señales anuncian la apertura de nuevas oportunidades. Este radar no reemplaza la búsqueda activa que se profundiza en el bloque 4, pero sí ayuda a reaccionar más rápido cuando se abre una oportunidad compatible.",
              "Un buen radar combina fuentes formales —boletines institucionales, portales de convocatorias— con fuentes informales —relaciones con actores del ecosistema, participación en espacios sectoriales— y se revisa de forma periódica, no solo cuando surge una necesidad urgente. Las organizaciones que consiguen financiamiento de forma más consistente suelen ser, justamente, las que mantienen este tipo de vigilancia activa, en lugar de buscar solo cuando el proyecto ya está listo.",
            ],
          },
          {
            titulo: "Priorizar entre varias oportunidades",
            parrafos: [
              "Cuando el análisis inicial arroja más de una alternativa razonable, conviene tener un método simple de priorización para decidir por dónde empezar. Una forma práctica es asignar una valoración —alta, media o baja— a cada oportunidad, según su alineación temática, la capacidad de la organización para cumplir sus requisitos, y la urgencia del proyecto frente al plazo de la convocatoria.",
              "Este ejercicio, sencillo en apariencia, ayuda a evitar una trampa común: dedicar el mismo esfuerzo a todas las oportunidades identificadas, en lugar de concentrar el tiempo disponible en las que tienen mayor probabilidad real de éxito.",
            ],
          },
        ],
        preguntas: [
          "Según el tipo de organización y de proyecto que tienes en mente, ¿qué mecanismos del ecosistema parecen, a primera vista, más compatibles?",
          "¿Qué capacidades administrativas o técnicas tiene hoy tu organización para responder a los requisitos de esas fuentes?",
          "¿Qué error de los mencionados en esta unidad reconoces que has cometido, o podrías cometer, en tu propio proceso de búsqueda?",
        ],
      },
      {
        id: "1-5",
        numero: "1.5",
        titulo: "Consideraciones éticas y transparencia",
        parrafos: [
          "El trabajo del estructurador no es solo técnico: implica una responsabilidad ética importante, porque actúa como puente entre una organización que necesita recursos y actores que deciden, muchas veces, en función de la confianza que genera la información presentada. Esta sección reúne algunas consideraciones que conviene tener presentes a lo largo de todo el programa, y que se retoman en los bloques siguientes al hablar de la documentación técnica y la adaptación del proyecto.",
        ],
        subtemas: [
          {
            titulo: "Veracidad de la información presentada",
            parrafos: [
              "Toda la información de un proyecto —diagnósticos, cifras, indicadores, referencias institucionales— debe ser cierta y verificable. Exagerar el alcance de un problema, inflar cifras de beneficiarios o atribuirse resultados que no corresponden no solo compromete la ética del estructurador: expone a la organización a consecuencias serias si esas inconsistencias se detectan durante la evaluación o, peor, durante la ejecución.",
            ],
          },
          {
            titulo: "Manejo de información sensible",
            parrafos: [
              "Durante el diagnóstico, el estructurador suele acceder a información interna de la organización —financiera, operativa, e incluso personal de sus integrantes o beneficiarios— que debe manejarse con confidencialidad. Esto es especialmente relevante cuando se trabaja con datos de poblaciones vulnerables, donde una divulgación inadecuada puede generar riesgos reales para las personas involucradas.",
            ],
          },
          {
            titulo: "Conflictos de interés",
            parrafos: [
              "Un estructurador puede, en ciertos contextos, tener relación simultánea con la organización que representa y con actores del ecosistema —por ejemplo, si trabajó antes para un posible financiador—. Declarar estos posibles conflictos a tiempo, en vez de ocultarlos, protege tanto la credibilidad del estructurador como la del proyecto que representa.",
            ],
          },
        ],
        checklist: {
          titulo: "Ética y transparencia",
          items: [
            "Verifiqué que toda la información presentada en el proyecto es precisa y se puede sustentar.",
            "Identifiqué qué información de la organización debe manejarse con confidencialidad especial.",
            "Declaré explícitamente cualquier posible conflicto de interés relacionado con el proyecto.",
          ],
        },
      },
    ],
    casosDeEstudio: [
      {
        titulo: "Aplicando los conceptos del bloque",
        parrafos: [
          "Para integrar lo que vimos en este bloque, recorrámoslo de forma aplicada con un caso hipotético. Imaginemos una fundación educativa de tamaño mediano que durante varios años operó programas de refuerzo escolar financiados sobre todo con recursos propios y donaciones puntuales de empresas locales. La organización decidió escalar su modelo a tres ciudades adicionales, y necesita un camino de financiamiento adecuado para ese crecimiento.",
          "El primer paso del equipo es mapear el ecosistema relevante para su sector: revisan cooperación internacional orientada a educación, fondos de fundaciones especializadas en infancia y juventud, y algunas convocatorias públicas de los nuevos municipios donde planean operar. Descartan de entrada la banca de desarrollo, porque su proyecto no genera ingresos propios que sostengan un crédito, y consideran el crowdfunding solo como mecanismo complementario para un componente específico, como materiales pedagógicos.",
          "En el análisis de actores, el equipo encuentra que las fundaciones internacionales especializadas en educación priorizan evidencia de resultados y la posibilidad de replicar el modelo en otros contextos, mientras que las alcaldías de los nuevos municipios valoran, sobre todo, la alineación con sus planes de desarrollo educativo local. Esta diferencia lleva al equipo a preparar dos narrativas del mismo proyecto: una centrada en evidencia de impacto y escalabilidad, para la fundación internacional, y otra centrada en alineación con política pública local, para las alcaldías.",
          "Quien asume el rol de estructurador dentro del equipo no se limita a redactar documentos: lidera un diagnóstico interno sobre la capacidad real de operar en tres ciudades nuevas a la vez, identifica riesgos operativos —como la disponibilidad de personal capacitado en los nuevos territorios— y coordina la relación con ambos tipos de financiador de forma diferenciada, evitando enviar la misma comunicación genérica a audiencias con expectativas distintas.",
          "Finalmente, al aplicar los criterios de identificación de oportunidades, el equipo concluye que, como el proyecto está en etapa de escalamiento y ya tiene evidencia de resultados en su ciudad de origen, tiene sentido postular a la vez a la fundación internacional —para financiar la expansión— y a una convocatoria pública en al menos uno de los nuevos municipios —para asegurar la sostenibilidad operativa local—. La contrapartida que la organización puede ofrecer es la experiencia y los materiales pedagógicos ya validados en su ciudad de origen.",
          "Este caso, aunque hipotético, muestra cómo los conceptos del bloque —ecosistema, actores, rol del estructurador y criterios de identificación de oportunidades— no se aplican por separado, sino de forma integrada, y cómo las decisiones de esta etapa inicial condicionan directamente el diseño estratégico y la estructuración técnica de los bloques siguientes.",
          "Vale la pena notar que el equipo del caso no intentó encajar su proyecto en la primera fuente que encontró: dedicó tiempo a entender la lógica de cada actor antes de acercarse, y aceptó que un mismo proyecto podía —y debía— comunicarse distinto según la audiencia. Esa disposición a adaptar la narrativa sin alterar la esencia del proyecto es, quizás, la actitud más importante que puede desarrollar un estructurador en formación, y es exactamente lo que este programa busca cultivar en sus cuatro bloques.",
        ],
        preguntas: [
          "Si tu proyecto tuviera que elegir, como en el caso anterior, entre dos audiencias con lógicas distintas, ¿qué narrativa diferenciada podrías construir para cada una?",
          "¿Qué evidencia de resultados o de capacidad institucional puede ofrecer hoy tu organización frente a un financiador exigente?",
        ],
      },
    ],
    recomendaciones: [
      "Institucional: revisa directamente los sitios web y los informes anuales de organismos de cooperación, bancos de desarrollo y fundaciones relevantes para tu sector, prestando atención a sus líneas estratégicas vigentes.",
      "Normativo: familiarízate con la regulación local sobre contratación pública y sobre constitución de organizaciones sin fines de lucro, porque estas normas condicionan de forma directa el acceso a buena parte de los mecanismos revisados.",
      "Comunidad de práctica: participa en redes, foros o espacios sectoriales donde se encuentran estructuradores, financiadores y organizaciones ejecutoras, porque buena parte del conocimiento práctico de este campo circula de manera informal a través de esas relaciones.",
      "Vale la pena también leer, de forma crítica, propuestas que hayan sido financiadas con éxito en tu propio sector —cuando estén disponibles públicamente— para identificar patrones comunes en su estructura, su narrativa y su nivel de evidencia.",
    ],
    cierre: [
      "Este primer bloque construyó el mapa de referencia sobre el que se apoya todo el programa: el ecosistema de financiación, los actores que lo componen, el rol del estructurador dentro de él, y los criterios iniciales para identificar oportunidades compatibles con un proyecto concreto. Con este mapa claro, el siguiente paso natural es dejar de mirar hacia afuera —el ecosistema— y empezar a mirar hacia adentro: hacia el diseño mismo del proyecto que se quiere llevar a ese ecosistema.",
      "El bloque 2 retoma justo ese punto: cómo identificar con precisión el problema, la necesidad o la oportunidad que da origen al proyecto, cómo construir una propuesta de valor clara, y cómo comunicarla de forma efectiva a través de un Pitch Deck. Los criterios de compatibilidad de este bloque no desaparecen: se convierten, más adelante, en el filtro final que determina hacia qué actores del ecosistema se dirigirá el proyecto una vez diseñado.",
    ],
    autoevaluacion: [
      "Puedo explicar, con mis propias palabras, la diferencia entre al menos cuatro mecanismos de financiación distintos.",
      "Puedo nombrar y describir la lógica de al menos cuatro tipos de actores del ecosistema de financiación.",
      "Puedo explicar con claridad qué distingue al estructurador de proyectos del formulador y del gestor de proyectos.",
      "Apliqué, al menos de forma preliminar, los criterios de identificación de oportunidades a mi propio proyecto o iniciativa.",
      "Entiendo por qué la ética y la transparencia son parte constitutiva del trabajo del estructurador, y no un aspecto accesorio.",
    ],
    puntosClave: [
      "El ecosistema de financiación tiene múltiples mecanismos —cooperación internacional, convocatorias públicas, banca de desarrollo, inversión privada, fundaciones y crowdfunding— cada uno con su propia lógica, requisitos y expectativas.",
      "Tendencias como el financiamiento combinado, los fondos climáticos y la inversión de impacto están difuminando las fronteras entre mecanismos tradicionalmente separados.",
      "La etapa de madurez del proyecto condiciona qué mecanismos son razonablemente accesibles en cada momento de su desarrollo.",
      "Cada mecanismo involucra actores con intereses distintos; entender esa lógica, apoyándose en herramientas como la matriz de poder e interés, permite adaptar la comunicación del proyecto sin alterar su esencia técnica.",
      "El estructurador de proyectos articula las necesidades de una organización con las oportunidades de financiación, un rol distinto al de formulador o gestor de proyectos.",
      "La ética y la transparencia —veracidad de la información, manejo de datos sensibles y declaración de conflictos de interés— son parte constitutiva del trabajo del estructurador.",
      "Antes de buscar una fuente específica, hay que analizar la iniciativa con criterios claros: tipo de organización, naturaleza del proyecto, etapa de madurez, escala de recursos y capacidad institucional.",
      "Este análisis inicial es la base sobre la que se apoyan el diseño estratégico (bloque 2), la estructuración técnica (bloque 3) y el matching con fuentes específicas (bloque 4).",
    ],
    glosario: [
      { termino: "Cooperación internacional", definicion: "Recursos no reembolsables o en condiciones favorables aportados por agencias multilaterales, bilaterales u organismos internacionales para financiar iniciativas de desarrollo." },
      { termino: "Convocatoria pública", definicion: "Fondo concursable abierto por una entidad gubernamental para financiar proyectos que respondan a una política o programa determinado." },
      { termino: "Banca de desarrollo", definicion: "Entidades financieras orientadas a otorgar créditos en condiciones favorables para proyectos de desarrollo, infraestructura o impacto social." },
      { termino: "Financiamiento colectivo (crowdfunding)", definicion: "Mecanismo de captación de recursos mediante aportes de un número amplio de personas, habitualmente a través de plataformas digitales." },
      { termino: "Estructurador de proyectos", definicion: "Profesional que articula, de manera técnica y estratégica, las necesidades de una organización con las alternativas de financiación disponibles en el ecosistema." },
      { termino: "Matriz de poder e interés", definicion: "Herramienta que clasifica a los actores de un proyecto según su nivel de influencia y su nivel de interés, para definir la estrategia de relacionamiento con cada uno." },
      { termino: "Financiamiento combinado (blended finance)", definicion: "Estructura que combina recursos no reembolsables, créditos concesionales y capital privado dentro de un mismo proyecto para reducir el riesgo y ampliar su escala." },
      { termino: "Inversión de impacto", definicion: "Inversión que busca, de manera simultánea, un retorno financiero y resultados sociales o ambientales medibles." },
      { termino: "Alianza multiactor", definicion: "Asociación entre distintos tipos de actores —públicos, privados o de la sociedad civil— que combinan recursos y capacidades para ejecutar un proyecto conjunto." },
      { termino: "Contrapartida", definicion: "Aporte propio, en dinero o en especie, que realiza la organización ejecutora de un proyecto como complemento al financiamiento externo recibido." },
    ],
  },
  {
    id: "bloque-2",
    numero: 2,
    titulo: "Diseño estratégico del proyecto y Pitch Deck",
    subtitulo: "De la idea a una propuesta clara, coherente y comunicable",
    introduccion: [
      "Ya entendido el ecosistema de financiación y el rol del estructurador dentro de él, el siguiente paso es diseñar el proyecto en sí mismo. Este bloque trabaja la etapa estratégica: definir con precisión qué problema, necesidad u oportunidad aborda el proyecto, construir su propuesta de valor y organizar sus componentes de forma coherente. Termina con la construcción del Pitch Deck, la herramienta para comunicar esa estrategia de forma clara y persuasiva.",
      "Conviene distinguir esta etapa de la estructuración técnica, que se ve en el bloque 3. Aquí el énfasis está en la claridad estratégica —qué se quiere lograr y por qué— más que en el detalle operativo de cómo se va a ejecutar cada actividad. Un proyecto con debilidades técnicas se puede corregir; un proyecto sin claridad estratégica difícilmente va a convencer a ningún financiador, sin importar qué tan detallado esté su cronograma.",
      "En las unidades siguientes vas a ver, en orden: cómo identificar con rigor el problema, la necesidad o la oportunidad que da origen al proyecto; cómo diseñar la arquitectura estratégica que se deriva de ese análisis; cómo darle coherencia conceptual a esa arquitectura; y cómo traducir todo ese trabajo en un Pitch Deck capaz de comunicar la propuesta ante distintas audiencias.",
    ],
    unidades: [
      {
        id: "2-1",
        numero: "2.1",
        titulo: "Identificación del problema, necesidad u oportunidad",
        parrafos: [
          "Todo proyecto nace como respuesta a algo: un problema que resolver, una necesidad insatisfecha o una oportunidad que aprovechar. El primer paso del diseño estratégico es analizar el contexto con rigor y definir con precisión cuál es la situación que el proyecto busca intervenir.",
          "Un error habitual en esta etapa es confundir el problema con su síntoma más visible, o formularlo como la ausencia de una solución particular —por ejemplo, decir 'falta un centro comunitario' en vez de identificar la necesidad real que ese centro resolvería—. Formular bien el problema amplía el abanico de soluciones posibles y evita atarse antes de tiempo a una única alternativa.",
        ],
        subtemas: [
          {
            titulo: "Problema, necesidad y oportunidad: tres puntos de partida distintos",
            parrafos: [
              "Aunque suelen tratarse como sinónimos, conviene distinguir estos tres puntos de partida porque cada uno pide un análisis distinto. Un problema es una situación negativa existente que afecta a un grupo de personas o a un sistema determinado. Una necesidad es una carencia —material, de conocimiento, de acceso— que puede no verse como un problema evidente para quienes la sufren, pero que limita su bienestar o su desarrollo. Una oportunidad, en cambio, no parte de una carencia sino de una condición favorable todavía no aprovechada: un recurso disponible, una tendencia emergente, una ventaja comparativa sin explotar.",
              "Distinguir entre estos tres puntos de partida evita un error común: aplicarle a una oportunidad la lógica de un problema —diagnóstico de causas, árbol de problemas— cuando el análisis relevante no es de causalidad negativa, sino de condiciones favorables y de capacidad para aprovecharlas a tiempo.",
            ],
          },
          {
            titulo: "Validar el problema con datos primarios",
            parrafos: [
              "Además de apoyarse en estadísticas o estudios existentes, conviene validar el problema identificado con un acercamiento directo a quienes lo viven: entrevistas breves, grupos focales o conversaciones informales con potenciales beneficiarios. Esto cumple dos propósitos: confirma —o corrige— lo que el equipo entendió al inicio sobre el problema, y aporta información cualitativa que enriquece la justificación del proyecto más allá de las cifras agregadas.",
            ],
            lista: [
              "Preguntar de forma abierta cómo describen las propias personas afectadas la situación, sin inducir la respuesta hacia la solución que el equipo ya tiene en mente.",
              "Prestar atención a las palabras y expresiones que usan los propios afectados, porque suelen revelar matices que no aparecen en fuentes secundarias.",
              "Contrastar la percepción de distintos grupos de involucrados sobre el mismo problema, porque no siempre coinciden entre sí.",
            ],
          },
          {
            titulo: "El árbol de problemas",
            parrafos: [
              "Es una herramienta que organiza visualmente las causas, el problema central y los efectos de una situación determinada. El problema central va en el tronco; las causas que lo generan se representan como raíces, en distintos niveles de profundidad; y los efectos que produce se representan como ramas. Esta estructura ayuda a distinguir causas de síntomas, y a identificar en qué nivel de la cadena causal conviene intervenir.",
            ],
            lista: [
              "Causas directas: factores que generan el problema de forma inmediata.",
              "Causas estructurales: condiciones de fondo, más difíciles de modificar, que sostienen a las causas directas.",
              "Efectos directos: consecuencias inmediatas del problema central.",
              "Efectos de mayor alcance: consecuencias de largo plazo que se derivan de los efectos directos.",
            ],
          },
          {
            titulo: "Análisis de involucrados",
            parrafos: [
              "Identifica a los actores afectados por la situación —positiva o negativamente— y su nivel de interés e influencia sobre el proyecto. A diferencia del análisis de actores del ecosistema de financiación del bloque 1, este análisis se concentra en los actores relacionados con el problema mismo: beneficiarios potenciales, comunidades afectadas, instituciones con competencia sobre el tema, y otros actores que podrían apoyar u obstaculizar la intervención.",
            ],
          },
          {
            titulo: "Justificación del proyecto",
            parrafos: [
              "El análisis del problema debe traducirse, al final, en una justificación clara: por qué es pertinente intervenir esta situación en este momento, y por qué la organización que propone el proyecto está en condiciones de hacerlo. Una buena justificación combina evidencia sobre la magnitud y la urgencia del problema, argumentos sobre la pertinencia de la intervención, y elementos que respalden la capacidad de la organización ejecutora.",
            ],
          },
        ],
        checklist: {
          titulo: "Identificación del problema",
          items: [
            "El problema está formulado como una situación negativa existente, no como la ausencia de una solución específica.",
            "Distinguí con claridad las causas directas de las causas estructurales del problema.",
            "Identifiqué a los principales involucrados y su nivel de interés e influencia.",
            "La justificación del proyecto se apoya en evidencia concreta, no solo en percepciones generales.",
          ],
        },
        preguntas: [
          "¿Cómo está formulado hoy el problema de tu proyecto? ¿Incluye, sin darte cuenta, una solución predeterminada?",
          "¿Qué actor involucrado en tu problema no habías considerado hasta ahora?",
        ],
      },
      {
        id: "2-2",
        numero: "2.2",
        titulo: "Diseño estratégico del proyecto",
        parrafos: [
          "Con el problema, necesidad u oportunidad ya identificado, el siguiente paso es definir la arquitectura estratégica del proyecto: qué propone, para quién, y qué cambio busca generar.",
        ],
        subtemas: [
          {
            titulo: "Propuesta de valor",
            parrafos: [
              "Es la síntesis de qué ofrece el proyecto y por qué resulta relevante para sus beneficiarios o para el problema que aborda. Responde a: ¿qué hace este proyecto que otras alternativas no hacen, o hace mejor? Una propuesta de valor sólida es específica, verificable y diferenciada; una débil suele ser genérica y podría aplicarse, sin cambios, a cualquier otro proyecto del mismo sector.",
            ],
          },
          {
            titulo: "Beneficiarios directos e indirectos",
            parrafos: [
              "Los beneficiarios directos reciben de forma inmediata los bienes, servicios o resultados del proyecto; los indirectos se benefician de forma secundaria, por ejemplo las familias de los participantes directos o la comunidad ampliada. Definir con precisión —con cifras estimadas cuando se pueda— a ambos grupos es un requisito habitual de la documentación técnica que se profundiza en el bloque 3.",
            ],
          },
          {
            titulo: "Cómo dimensionar a los beneficiarios",
            parrafos: [
              "Definir con precisión a los beneficiarios no es solo describirlos cualitativamente: también implica, siempre que se pueda, dimensionarlos con cifras. Esta estimación puede construirse con fuentes secundarias —estadísticas oficiales, censos, estudios sectoriales— o con fuentes propias, como encuestas o registros de participantes en intervenciones previas.",
              "Una estimación razonablemente sustentada, aunque no sea perfecta, resulta más creíble ante un evaluador que una cifra sin ningún respaldo. Es preferible declarar con transparencia el método y las limitaciones de la estimación, que presentar una cifra exacta sin ninguna fuente que la sustente.",
            ],
          },
          {
            titulo: "Herramienta: mapa de empatía",
            parrafos: [
              "Ayuda a comprender a los beneficiarios desde una perspectiva más cercana a su experiencia cotidiana, complementando los datos cuantitativos con una mirada cualitativa. Organiza la información alrededor de preguntas simples: qué piensa y siente el beneficiario frente a la situación, qué ve en su entorno, qué escucha de las personas cercanas, qué dice y hace públicamente, y cuáles son sus principales frustraciones y motivaciones.",
              "Aplicar esta herramienta, aunque sea de forma breve, ayuda a que la propuesta de valor responda a necesidades reales de los beneficiarios, y no solo a supuestos del equipo sobre lo que esos beneficiarios necesitan.",
            ],
          },
          {
            titulo: "Objetivos general y específicos",
            parrafos: [
              "El objetivo general expresa el cambio de mayor nivel al que el proyecto busca contribuir; los objetivos específicos desagregan ese cambio en componentes más concretos y alcanzables dentro del alcance y plazo del proyecto. Una buena práctica es formular los objetivos específicos de modo que, en conjunto, sean suficientes para alcanzar el objetivo general, sin duplicidades ni vacíos evidentes entre ellos.",
            ],
          },
          {
            titulo: "El criterio SMART aplicado a los objetivos",
            parrafos: [
              "Un criterio muy usado para evaluar la calidad de un objetivo es el acrónimo SMART, que revisa si el objetivo es específico, medible, alcanzable, relevante y con plazo definido. Aplicar este criterio de forma sistemática a cada objetivo específico ayuda a detectar formulaciones vagas o poco realistas antes de llegar a la evaluación externa.",
            ],
          },
          {
            titulo: "Resultados esperados e impacto",
            parrafos: [
              "Los resultados son los cambios directamente atribuibles al proyecto una vez terminado; el impacto es el cambio de más largo plazo al que el proyecto contribuye, casi siempre junto con otros factores externos. Esta distinción, aunque sutil, importa: un proyecto puede —y debe— comprometerse con sus resultados de forma directa, pero debe ser prudente al atribuirse en solitario el impacto de largo plazo, que casi siempre depende también de factores fuera de su control.",
            ],
          },
          {
            titulo: "Teoría de cambio",
            parrafos: [
              "Para darle coherencia a esta cadena —desde las actividades hasta el impacto— sirve el concepto de teoría de cambio: un modelo que explica la lógica causal de largo plazo entre lo que el proyecto hace y el cambio que busca generar. La teoría de cambio no reemplaza al marco lógico —que se ve en el bloque 3— sino que lo antecede: primero se explicita la lógica de cambio en términos amplios, y después esa lógica se traduce en una matriz técnica detallada.",
              "Construir una teoría de cambio implica, en simple, responder a una pregunta encadenada: si el proyecto hace estas actividades, entonces se generarán estos productos; si se generan estos productos, entonces se lograrán estos resultados; y si se logran estos resultados, entonces se contribuirá a este cambio de mayor alcance. Hacer explícita esta cadena de supuestos permite identificar, desde el diseño, los puntos más frágiles de la lógica del proyecto.",
            ],
          },
          {
            titulo: "El análisis FODA como complemento",
            parrafos: [
              "Un complemento útil al diseño estratégico es el análisis FODA, que examina las fortalezas y debilidades internas de la organización ejecutora, junto con las oportunidades y amenazas del entorno externo donde el proyecto se va a desarrollar. Mientras la teoría de cambio explica la lógica causal del proyecto, el FODA aporta una mirada complementaria sobre qué tan viable es ejecutarlo con la organización y en el contexto disponibles.",
              "Las debilidades y amenazas que salgan de este análisis no deben esconderse en la documentación del proyecto: al contrario, reconocerlas de forma explícita y explicar cómo el proyecto las gestiona o las mitiga suele fortalecer la credibilidad de la propuesta ante un evaluador experimentado, que de todas formas las va a detectar en su propio análisis.",
            ],
          },
        ],
        preguntas: [
          "¿Qué cambio de largo plazo busca generar tu proyecto, más allá de sus actividades inmediatas?",
          "¿Puedes explicar, en dos o tres frases, la propuesta de valor de tu proyecto sin usar tecnicismos?",
          "¿Cuál es el eslabón más frágil de la cadena causal de tu proyecto, es decir, el supuesto que, si falla, pondría en riesgo todo lo demás?",
        ],
      },
      {
        id: "2-3",
        numero: "2.3",
        titulo: "Estructuración conceptual",
        parrafos: [
          "La estructuración conceptual es el paso que le da coherencia interna a las decisiones estratégicas tomadas hasta este punto. Consiste en organizar de forma lógica los componentes del proyecto —problema, propuesta de valor, objetivos, beneficiarios, resultados esperados— de modo que cada uno se derive claramente del anterior y todos apunten en la misma dirección.",
          "Esta coherencia se revisa en dos sentidos. La coherencia vertical revisa que exista una relación lógica entre el problema identificado, los objetivos planteados y los resultados esperados: que el proyecto realmente atienda lo que dice atender. La coherencia horizontal, que se profundiza en el bloque 3, revisa que cada objetivo tenga indicadores, medios de verificación y supuestos bien definidos. En esta etapa del diseño basta con asegurar la coherencia vertical; el detalle técnico de indicadores y verificación se ve más adelante.",
        ],
        subtemas: [
          {
            titulo: "La nota conceptual",
            parrafos: [
              "Un proyecto conceptualmente bien estructurado se puede resumir, sin perder rigor, en una nota conceptual breve: un documento corto —de una a tres páginas, habitualmente— que sintetiza la idea del proyecto para una primera evaluación de un financiador. Poder sintetizar el proyecto en pocas páginas —o incluso en pocos párrafos— es, de hecho, una buena señal de que la estructuración conceptual es sólida.",
              "Una nota conceptual suele incluir una descripción breve del problema y su contexto, la propuesta de valor y los objetivos del proyecto, una identificación general de los beneficiarios, una estimación preliminar de presupuesto y duración, y una mención de la organización ejecutora y su capacidad. Muchas fuentes de financiación usan la nota conceptual como filtro inicial antes de pedir la documentación técnica completa, lo que la convierte en una pieza estratégica, no un simple resumen.",
            ],
          },
        ],
        checklist: {
          titulo: "Estructuración conceptual",
          items: [
            "Puedo explicar, en un párrafo, cómo se conectan el problema, los objetivos y los resultados esperados de mi proyecto.",
            "Si tuviera que resumir mi proyecto en una página, sabría qué información priorizar.",
            "No hay contradicciones evidentes entre lo que el proyecto dice buscar y lo que sus actividades previstas realmente hacen.",
          ],
        },
      },
      {
        id: "2-4",
        numero: "2.4",
        titulo: "Construcción del Pitch Deck",
        parrafos: [
          "El Pitch Deck es una presentación ejecutiva —habitualmente entre diez y quince diapositivas— pensada para comunicar de forma clara, estructurada y persuasiva la propuesta de un proyecto ante potenciales financiadores, aliados o inversionistas. No sustituye a la documentación técnica del proyecto: es una puerta de entrada que despierta interés y facilita una primera evaluación.",
          "Aunque el contenido exacto varía según la audiencia, la mayoría de los pitch decks efectivos incluyen estos componentes: el problema, necesidad u oportunidad que motiva el proyecto; la propuesta de valor y la solución planteada; los beneficiarios o el mercado al que se dirige; el modelo de intervención o de negocio, según corresponda; el equipo responsable y su idoneidad; los resultados esperados o el impacto proyectado; un resumen del plan financiero y de los recursos requeridos; y la solicitud concreta: qué se pide al financiador o inversionista.",
        ],
        subtemas: [
          {
            titulo: "Adaptar el énfasis según la audiencia",
            parrafos: [
              "El énfasis de cada sección cambia según la audiencia. Un inversionista privado le dará más peso al modelo de negocio, la escalabilidad y el retorno financiero; un organismo de cooperación priorizará el impacto social y la alineación con sus líneas de trabajo; una convocatoria pública valorará, sobre todo, el cumplimiento de los criterios de sus bases. Esta idea de adaptar el énfasis narrativo sin alterar la esencia técnica del proyecto se retoma con más detalle en el bloque 4, al preparar el proyecto para fuentes específicas.",
            ],
          },
          {
            titulo: "Principios de diseño",
            parrafos: [
              "En diseño, un buen Pitch Deck combina dato y narrativa: cifras concretas que respaldan la propuesta, dentro de una historia clara y fácil de seguir. La claridad visual —texto breve, apoyo gráfico, jerarquía de la información— pesa tanto como el contenido mismo, porque estas presentaciones se revisan, muchas veces, en pocos minutos.",
            ],
            lista: [
              "Una idea principal por diapositiva, evitando saturar cada lámina con texto extenso.",
              "Datos concretos —cifras, porcentajes, comparaciones— en vez de afirmaciones vagas.",
              "Consistencia visual: misma paleta de colores, tipografía y estilo en toda la presentación.",
              "Una narrativa que fluye de forma lógica de una diapositiva a la siguiente, sin saltos abruptos.",
            ],
          },
          {
            titulo: "Guía diapositiva por diapositiva",
            parrafos: [
              "A modo de guía, así se puede organizar un Pitch Deck estándar. La secuencia se puede ajustar según el proyecto y la audiencia, pero da un punto de partida sólido para armar el primer Pitch Deck.",
            ],
            lista: [
              "1. Portada: nombre del proyecto, organización responsable y una frase breve que resuma la propuesta de valor en una línea.",
              "2. El problema: presentación clara y respaldada con datos de la situación que el proyecto busca atender, sin tecnicismos innecesarios.",
              "3. La solución: qué propone el proyecto y por qué esa propuesta es pertinente frente al problema presentado.",
              "4. Beneficiarios o mercado: quiénes reciben el proyecto, con una dimensión aproximada, y por qué ese grupo es relevante para esa audiencia.",
              "5. Modelo de intervención o de negocio: cómo funciona el proyecto en la práctica, sus componentes principales y su lógica.",
              "6. Evidencia o validación: resultados previos, pilotos realizados o cualquier evidencia que respalde la viabilidad de la propuesta.",
              "7. Equipo: quiénes ejecutan el proyecto y por qué están en condiciones de lograrlo.",
              "8. Resultados esperados o impacto: qué cambios concretos se espera lograr, idealmente con metas cuantificables.",
              "9. Plan financiero resumido: presupuesto general y fuentes de financiamiento previstas, incluyendo la contrapartida si existe.",
              "10. La solicitud: qué se pide exactamente al financiador —monto, tipo de apoyo, o el siguiente paso concreto que se espera de la conversación.",
            ],
          },
          {
            titulo: "Tiempo de presentación por diapositiva",
            parrafos: [
              "Cuando el Pitch Deck se presenta de forma oral —y no solo se envía como documento— conviene planear cuánto tiempo dedicar a cada sección, para que la presentación completa quepa en el tiempo disponible, que en muchos procesos de evaluación es breve y cronometrado.",
              "Ensayar con esa distribución de tiempo evita uno de los errores más frecuentes en presentaciones en vivo: gastar la mayor parte del tiempo explicando el problema y el contexto, y quedarse sin tiempo para explicar con claridad la solicitud concreta que se hace al financiador.",
            ],
          },
        ],
        checklist: {
          titulo: "Pitch Deck",
          items: [
            "El Pitch Deck responde con claridad a: qué problema, qué solución, para quién, con qué equipo y qué se solicita.",
            "Cada diapositiva contiene una idea principal, no una acumulación de ideas dispersas.",
            "Preparé, o al menos esbocé, una versión con énfasis distinto para al menos dos tipos de audiencia.",
            "El diseño visual es consistente en toda la presentación.",
          ],
        },
      },
    ],
    casosDeEstudio: [
      {
        titulo: "Del problema al Pitch Deck",
        parrafos: [
          "Retomemos, de forma aplicada, el recorrido de este bloque con un caso hipotético. Un equipo emprendedor identifica que, en su ciudad, los pequeños productores agrícolas pierden una parte importante de su cosecha por falta de acceso a sistemas de almacenamiento adecuados. Al construir el árbol de problemas, el equipo distingue que la causa estructural no es la falta de tecnología de almacenamiento en el mercado, sino la falta de acceso financiero de los productores a esa tecnología, y la dispersión geográfica que encarece cualquier solución individual.",
          "A partir de ese diagnóstico, el equipo diseña una propuesta de valor centrada en un modelo de almacenamiento compartido, gestionado de forma comunitaria entre varios productores de una misma zona, en vez de vender equipos individuales que pocos podrían pagar. Define como objetivo general reducir las pérdidas poscosecha de los productores participantes, y como objetivos específicos instalar la infraestructura compartida y capacitar a los productores en su uso y mantenimiento.",
          "Al construir la teoría de cambio, el equipo identifica un supuesto crítico: que los productores estén dispuestos a compartir infraestructura con otros productores de la zona, algo que no es evidente en un contexto de alta desconfianza entre competidores locales. Este hallazgo los lleva a incorporar un componente adicional de mediación comunitaria antes de instalar la infraestructura, fortaleciendo así la coherencia vertical del proyecto.",
          "Al construir el Pitch Deck, el equipo prepara dos versiones: una para un fondo de inversión de impacto, que resalta el potencial de escalar el modelo a otras zonas rurales y generar ingresos por cuotas de uso de la infraestructura; y otra para una convocatoria pública de desarrollo rural, que resalta la reducción de pérdidas poscosecha como aporte directo a la seguridad alimentaria del territorio.",
          "Un aprendizaje adicional de este caso: el trabajo de mediación comunitaria, incorporado como respuesta al supuesto crítico de la teoría de cambio, terminó siendo un elemento diferenciador de la propuesta. Mientras otras iniciativas similares solo ofrecían infraestructura, este proyecto podía demostrar que había pensado, desde el diseño, en las condiciones sociales necesarias para que esa infraestructura realmente se usara de forma colectiva y sostenida.",
        ],
      },
      {
        titulo: "Segundo caso: una oportunidad, no un problema",
        parrafos: [
          "Para ilustrar un proyecto que parte de una oportunidad, y no de un problema, pensemos en un equipo dentro de una entidad pública de salud que identifica una condición favorable: la reciente disponibilidad de una plataforma tecnológica nacional de telemedicina que otras regiones del país todavía no han empezado a usar de forma sistemática. En vez de partir de un árbol de problemas, el equipo construye un análisis de condiciones favorables: infraestructura tecnológica ya disponible, personal médico dispuesto a capacitarse, y una brecha de cobertura en zonas rurales alejadas de centros de atención especializada.",
          "La propuesta de valor de este proyecto no es 'resolver la falta de atención médica especializada' —lo que repetiría el error de meter la solución dentro del problema— sino 'aprovechar la infraestructura de telemedicina ya disponible para ampliar la cobertura de atención especializada en zonas rurales'. Esta diferencia, sutil en apariencia, cambia por completo la narrativa del Pitch Deck: en vez de abrir con estadísticas de carencia, el equipo abre con la oportunidad tecnológica ya instalada y el potencial de aprovecharla rápido, algo especialmente atractivo para financiadores interesados en soluciones de implementación rápida.",
        ],
        preguntas: [
          "¿Tu proyecto parte más de un problema, de una necesidad o de una oportunidad, según las distinciones de la unidad 2.1? ¿La forma en que lo has comunicado hasta ahora refleja esa naturaleza con claridad?",
        ],
      },
    ],
    erroresComunes: {
      titulo: "Errores comunes en el diseño estratégico",
      items: [
        "Formular el problema incluyendo, de forma implícita, la solución que el proyecto quiere ofrecer.",
        "Definir objetivos ambiciosos que no guardan relación realista con el alcance y los recursos del proyecto.",
        "Omitir actores relevantes en el análisis de involucrados, sobre todo posibles opositores o actores con influencia indirecta.",
        "Construir un Pitch Deck saturado de información técnica, sin una narrativa clara que conecte cada diapositiva con la siguiente.",
        "Usar el mismo Pitch Deck, sin ajustes, para audiencias con lógicas e intereses claramente distintos.",
        "Formular objetivos que no cumplen el criterio SMART, sobre todo en plazo y capacidad de medición.",
        "Dimensionar a los beneficiarios sin ninguna fuente de respaldo, generando cifras que no resisten una revisión cuidadosa.",
      ],
    },
    recomendaciones: [
      "Practica la construcción de árboles de problemas y teorías de cambio con casos reales de tu propio sector, más allá del proyecto específico en el que estés trabajando.",
      "Revisa Pitch Decks de proyectos ya financiados —cuando estén disponibles públicamente— y analiza su estructura narrativa: qué información se prioriza, en qué orden se presenta, y cómo se equilibra el dato con la narrativa.",
      "Somete tu nota conceptual o tu Pitch Deck a la revisión de alguien externo al proyecto, que no tenga la misma familiaridad con la iniciativa: suele detectar vacíos de coherencia o supuestos no explicitados.",
      "Practica también la presentación oral del Pitch Deck, no solo su diseño visual, y simula preguntas difíciles que un evaluador exigente podría hacer, preparando respuestas honestas y bien fundamentadas antes de la presentación real.",
    ],
    cierre: [
      "Este bloque tradujo una necesidad, un problema o una oportunidad en una arquitectura estratégica clara: propuesta de valor, objetivos, beneficiarios, resultados esperados y una teoría de cambio que conecta todo lo anterior. Esa arquitectura se sintetizó, al final, en un Pitch Deck capaz de comunicar la propuesta ante distintas audiencias del ecosistema descrito en el bloque 1.",
      "El siguiente paso natural es darle densidad técnica a esa arquitectura: convertir los objetivos en una matriz de marco lógico con indicadores verificables, construir un cronograma realista y un presupuesto coherente, y organizar la documentación de soporte necesaria. Eso es exactamente lo que trabaja el bloque 3, y lo que convierte una buena idea, ya bien comunicada, en un proyecto técnicamente sólido y listo para que cualquier fuente de financiación lo evalúe a fondo.",
    ],
    autoevaluacion: [
      "Puedo formular el problema de mi proyecto sin incluir, de forma implícita, la solución.",
      "Puedo explicar la diferencia entre resultados e impacto en el contexto de mi propio proyecto.",
      "Cuento con una nota conceptual o un primer borrador de Pitch Deck de mi proyecto.",
      "Sé identificar qué aspectos de mi Pitch Deck cambiarían según la audiencia a la que me dirija.",
      "Apliqué el criterio SMART a al menos uno de mis objetivos específicos.",
      "Sometí, o pienso someter, mi Pitch Deck a la revisión de alguien externo al proyecto.",
    ],
    puntosClave: [
      "El diseño estratégico parte de identificar con precisión el problema, necesidad u oportunidad, apoyado en herramientas como el árbol de problemas y el análisis de involucrados.",
      "La propuesta de valor, los beneficiarios, los objetivos y los resultados esperados forman la arquitectura estratégica del proyecto.",
      "La teoría de cambio explica la lógica causal de largo plazo entre las acciones del proyecto y el cambio que se busca generar, y ayuda a identificar sus supuestos más frágiles.",
      "La estructuración conceptual le da coherencia vertical al proyecto, y se puede sintetizar en una nota conceptual breve.",
      "El Pitch Deck comunica la propuesta de forma clara y persuasiva, adaptando el énfasis narrativo según la audiencia sin alterar la esencia técnica del proyecto.",
      "Los errores más frecuentes en esta etapa —problemas mal formulados, objetivos poco realistas, narrativas no diferenciadas— se pueden evitar con revisión rigurosa y retroalimentación externa.",
    ],
    glosario: [
      { termino: "Árbol de problemas", definicion: "Herramienta que organiza de manera visual las causas, el problema central y los efectos de una situación determinada." },
      { termino: "Análisis de involucrados", definicion: "Identificación de los actores afectados por un problema y su nivel de interés e influencia sobre el proyecto que busca intervenirlo." },
      { termino: "Propuesta de valor", definicion: "Síntesis de qué ofrece el proyecto y por qué resulta relevante para sus beneficiarios o para el problema que aborda." },
      { termino: "Teoría de cambio", definicion: "Modelo que explica la lógica causal de largo plazo entre las acciones de un proyecto y el cambio que se busca generar." },
      { termino: "Nota conceptual", definicion: "Documento breve que resume la idea de un proyecto para una primera evaluación por parte de un cooperante o convocatoria." },
      { termino: "Pitch deck", definicion: "Presentación ejecutiva orientada a comunicar de manera clara y estratégica la propuesta de valor de un proyecto ante potenciales financiadores o inversionistas." },
      { termino: "Coherencia vertical", definicion: "Relación lógica entre el problema identificado, los objetivos planteados y los resultados esperados de un proyecto." },
      { termino: "Análisis FODA", definicion: "Herramienta que examina fortalezas y debilidades internas de una organización, junto con oportunidades y amenazas del entorno externo." },
      { termino: "Oportunidad (como punto de partida)", definicion: "Condición favorable del entorno, aún no aprovechada, que puede dar origen a un proyecto sin partir de una carencia negativa." },
      { termino: "Mapa de empatía", definicion: "Herramienta que organiza información cualitativa sobre lo que piensa, siente, ve, escucha, dice y hace un beneficiario frente a una situación determinada." },
      { termino: "Criterio SMART", definicion: "Conjunto de cinco atributos —específico, medible, alcanzable, relevante y con plazo definido— usados para evaluar la calidad de un objetivo." },
    ],
  },
  {
    id: "bloque-3",
    numero: 3,
    titulo: "Estructuración técnica del proyecto",
    subtitulo: "De la estrategia a la matriz, el cronograma y el presupuesto",
    introduccion: [
      "El bloque anterior definió la arquitectura estratégica del proyecto: qué problema aborda, qué propone y qué cambio busca generar. Este bloque traduce esa estrategia en una estructura técnica detallada: objetivos e indicadores precisos, un cronograma de actividades, un presupuesto y la documentación de soporte necesaria. Es, en buena medida, el corazón operativo del proyecto: la parte que un financiador va a revisar con más detenimiento para evaluar qué tan viable y sólida es la propuesta.",
      "Mientras el diseño estratégico responde a qué y por qué, la estructuración técnica responde a cómo, cuándo, con qué recursos y con qué evidencia. Un proyecto puede tener una estrategia brillante, pero si su estructuración técnica es débil —cronogramas poco realistas, presupuestos inconsistentes, indicadores mal formulados— pierde credibilidad frente a cualquier fuente de financiación, sin importar qué tan atractiva sea la idea.",
      "Las siguientes unidades desarrollan, en orden, los componentes técnicos centrales del proyecto —organizados alrededor de la matriz de marco lógico—, la planeación operativa que ordena las actividades en el tiempo, la planeación financiera que traduce esas actividades en presupuesto, y la documentación técnica que consolida todo el trabajo en un expediente presentable ante cualquier fuente de financiación.",
    ],
    unidades: [
      {
        id: "3-1",
        numero: "3.1",
        titulo: "Componentes técnicos del proyecto",
        parrafos: [
          "La herramienta de referencia para estructurar técnicamente un proyecto es el marco lógico: una metodología que organiza objetivos, indicadores, medios de verificación y supuestos en una matriz integrada. El marco lógico no reemplaza la teoría de cambio del bloque 2; la traduce a un formato técnico verificable, que exige la gran mayoría de las fuentes de financiación.",
        ],
        subtemas: [
          {
            titulo: "La lógica vertical de la matriz",
            parrafos: [
              "La matriz de marco lógico se organiza, habitualmente, en cuatro niveles que replican la cadena causal trabajada en la teoría de cambio del bloque 2: el fin o impacto de largo plazo, el propósito u objetivo específico central del proyecto, los resultados o componentes que ese propósito requiere, y las actividades necesarias para producir cada resultado. Esta jerarquía se llama lógica vertical de la matriz, y su coherencia es de lo primero que revisa cualquier evaluador técnico.",
            ],
          },
          {
            titulo: "Componentes de cada nivel",
            parrafos: [],
            lista: [
              "Objetivos y resultados: heredados del diseño estratégico, ahora formulados con mayor precisión técnica: qué cambio concreto se espera lograr y en qué plazo.",
              "Actividades: las acciones específicas que el proyecto va a ejecutar para alcanzar cada resultado. Deben tener una relación de causalidad clara y suficiente con el resultado al que corresponden.",
              "Entregables: los productos tangibles o verificables de cada actividad o conjunto de actividades: un informe, una infraestructura construida, un número de personas capacitadas, un sistema implementado.",
              "Indicadores: medidas concretas —cuantitativas o cualitativas— que permiten verificar si un objetivo o resultado se está cumpliendo. Un buen indicador es específico, medible, alcanzable, relevante y con plazo definido.",
              "Medios de verificación: las fuentes de información que van a permitir comprobar el valor de cada indicador: registros administrativos, encuestas, informes de auditoría, actas, entre otros.",
              "Supuestos: condiciones externas que deben cumplirse para que la lógica del proyecto funcione, pero que están fuera del control directo de quien lo ejecuta. Identificarlos con honestidad es, a la vez, un ejercicio técnico y una muestra de rigor ante el financiador.",
            ],
          },
          {
            titulo: "La lógica horizontal de la matriz",
            parrafos: [
              "Además de la lógica vertical, la matriz exige una lógica horizontal: que cada nivel —fin, propósito, resultados y actividades— tenga al menos un indicador claro, un medio de verificación creíble, y un supuesto explícito. Esta doble lógica, vertical y horizontal, es lo que distingue a un marco lógico completo de una simple lista de objetivos y actividades.",
            ],
          },
          {
            titulo: "Tipos de indicadores",
            parrafos: [
              "No todos los indicadores cumplen la misma función dentro de la matriz. Distinguir entre distintos tipos ayuda a construir un sistema de seguimiento equilibrado, que no dependa solo de un tipo de medición.",
              "Un sistema de indicadores bien balanceado combina indicadores de proceso —que permiten monitorear la ejecución en tiempo real— con indicadores de resultado —que permiten evaluar, al final del proyecto o en momentos de corte específicos, si el cambio esperado realmente se produjo—. Depender solo de indicadores de proceso puede dar una falsa sensación de éxito si las actividades se ejecutan a tiempo pero no generan el cambio esperado en la población objetivo.",
            ],
          },
          {
            titulo: "Cómo formular un buen indicador",
            parrafos: [
              "Formular indicadores es, muchas veces, uno de los pasos más difíciles de la estructuración técnica. Un indicador débil suele pecar de vago —'mejorar la calidad de vida de los beneficiarios'— o de imposible de medir con los recursos disponibles del proyecto. Un buen indicador combina una unidad de medida clara, una meta cuantificable, una población de referencia específica y un plazo definido.",
            ],
          },
        ],
        checklist: {
          titulo: "Marco lógico",
          items: [
            "Cada nivel de la matriz tiene al menos un indicador claro y verificable.",
            "Los medios de verificación propuestos son razonablemente accesibles y creíbles.",
            "Los supuestos identificados son condiciones externas plausibles, no riesgos que en realidad debería gestionar el proyecto.",
            "Existe una relación de causalidad clara entre actividades, resultados, propósito y fin.",
          ],
        },
        preguntas: [
          "Revisa el objetivo específico central de tu proyecto: ¿qué indicador propondrías para verificar su cumplimiento?",
          "¿Qué supuesto de tu proyecto es, en realidad, más frágil de lo que te gustaría admitir?",
        ],
      },
      {
        id: "3-2",
        numero: "3.2",
        titulo: "Planeación operativa",
        parrafos: [
          "Definidos los objetivos, resultados y actividades, el siguiente paso es organizarlos en el tiempo. La planeación operativa responde a cómo se secuencian y coordinan las actividades para lograr los resultados esperados dentro del plazo del proyecto.",
        ],
        subtemas: [
          {
            titulo: "El cronograma y el diagrama de Gantt",
            parrafos: [
              "Los elementos centrales de esta planeación son construir el cronograma —habitualmente en un diagrama de Gantt, que muestra la duración y la secuencia de cada actividad—, definir hitos —puntos de control que permiten verificar avances importantes en momentos específicos del proyecto— y asignar responsables para cada actividad o conjunto de actividades, para que quede claro quién responde por cada entregable.",
            ],
            lista: [
              "Identificar todas las actividades necesarias para cada resultado, sin omitir tareas preparatorias o administrativas.",
              "Estimar la duración de cada actividad con base en experiencia previa, no solo en el tiempo ideal bajo condiciones perfectas.",
              "Identificar dependencias: qué actividades no pueden empezar hasta que otras hayan terminado.",
              "Definir hitos de control en momentos clave del proyecto, no solo al final de cada gran componente.",
            ],
          },
          {
            titulo: "Estructura de desglose de trabajo (EDT)",
            parrafos: [
              "Antes de construir el cronograma detallado, conviene elaborar una estructura de desglose de trabajo: una descomposición jerárquica del proyecto en componentes cada vez más pequeños, hasta llegar a actividades manejables y asignables a una persona o equipo responsable. Esta herramienta ayuda a asegurar que ninguna tarea relevante quede fuera de la planeación, y facilita luego la asignación de tiempos y responsables.",
            ],
          },
          {
            titulo: "Asignación de responsables",
            parrafos: [
              "Una herramienta útil para aclarar responsabilidades es la matriz RACI, que identifica, para cada actividad, quién es Responsable de ejecutarla, quién debe Aprobar o rendir cuentas por ella, a quién se debe Consultar antes de decisiones relevantes, y a quién se debe Informar sobre su avance. Esta claridad evita ambigüedades que, en la práctica, suelen generar retrasos por falta de definición sobre quién debe actuar en cada momento.",
              "Una secuencia lógica bien construida no solo ordena las actividades en el tiempo: identifica dependencias, y anticipa los momentos de mayor riesgo operativo del proyecto. Un cronograma poco realista —que subestima los tiempos administrativos, los procesos de contratación o los periodos de aprobación institucional— es una de las causas más frecuentes de que un proyecto, incluso bien financiado, no se ejecute según lo planeado.",
            ],
          },
          {
            titulo: "Gestión de riesgos operativos",
            parrafos: [
              "Además de los supuestos de la matriz de marco lógico, la planeación operativa se beneficia de un análisis de riesgos más detallado, que identifique posibles obstáculos a la ejecución y sus medidas de mitigación. A diferencia de los supuestos —condiciones externas que se asumen favorables— los riesgos identificados aquí son factores que el equipo del proyecto puede, al menos en parte, gestionar de forma activa.",
              "Incluir un análisis de riesgos operativos, aunque no siempre sea un requisito explícito de todas las fuentes, fortalece la credibilidad técnica del proyecto y le muestra al evaluador que el equipo pensó de forma realista en los obstáculos que podría enfrentar durante la ejecución.",
            ],
          },
        ],
        checklist: {
          titulo: "Planeación operativa",
          items: [
            "Identifiqué todas las actividades relevantes, incluyendo tareas preparatorias y administrativas.",
            "Definí con claridad las dependencias entre actividades.",
            "Cada actividad tiene un responsable claramente asignado.",
            "El cronograma contempla tiempos realistas para procesos administrativos o de aprobación institucional.",
          ],
        },
      },
      {
        id: "3-3",
        numero: "3.3",
        titulo: "Planeación financiera",
        parrafos: [
          "La planeación financiera traduce las actividades del proyecto en recursos económicos concretos. Un presupuesto bien construido no es solo una lista de cifras: es la expresión monetaria de la lógica del proyecto, y debe guardar una coherencia estricta con el cronograma y con las actividades definidas.",
        ],
        subtemas: [
          {
            titulo: "Categorías del presupuesto",
            parrafos: [
              "Un presupuesto de proyecto organiza los costos, habitualmente, en categorías como personal, insumos y materiales, equipamiento, servicios de terceros, gastos de operación y gastos administrativos. A esto se suma identificar las fuentes de financiación previstas para cada rubro.",
            ],
          },
          {
            titulo: "Distribución de fuentes por rubro",
            parrafos: [
              "Además de organizar el presupuesto por categorías de gasto, conviene construir una vista complementaria que muestre, para cada rubro, qué proporción se va a financiar con el aporte del financiador principal y qué proporción con contrapartida propia u otras fuentes. Esta vista facilita, más adelante, la conversación con distintos financiadores que podrían cubrir componentes específicos del mismo proyecto.",
              "Distribuir explícitamente los gastos administrativos como contrapartida propia es una práctica habitual que muchas fuentes valoran positivamente, porque reduce su carga administrativa directa y muestra un compromiso institucional tangible de la organización ejecutora.",
            ],
          },
          {
            titulo: "Riesgo cambiario e inflacionario",
            parrafos: [
              "En proyectos con financiamiento en moneda extranjera, o que se ejecutan en periodos largos en contextos de alta inflación, conviene incorporar al presupuesto una previsión razonable frente a la variación de precios y de tipo de cambio durante la vida del proyecto. Ignorar este factor puede generar, hacia el final de la ejecución, un desfase entre el presupuesto original aprobado y los costos reales de las actividades pendientes.",
            ],
            lista: [
              "Incluir un rubro de contingencia o imprevistos, habitualmente entre un 3% y un 10% del presupuesto total, según la duración y el contexto del proyecto.",
              "Cuando el financiamiento se recibe en una moneda distinta a la de ejecución, considerar el riesgo de variación cambiaria al presupuestar los rubros más sensibles.",
              "Revisar, en proyectos de larga duración, si es razonable ajustar ciertos rubros —como salarios— según la inflación proyectada del periodo.",
            ],
          },
          {
            titulo: "Contrapartida y sostenibilidad",
            parrafos: [
              "La contrapartida —el aporte propio de la organización, en dinero o en especie— es un elemento especialmente valorado por muchas fuentes, porque muestra compromiso institucional con el proyecto. También es importante que el presupuesto contemple, cuando corresponda, la sostenibilidad del proyecto una vez terminado el periodo de financiamiento externo: qué recursos van a permitir que los resultados se mantengan en el tiempo.",
            ],
            lista: [
              "Aporte en dinero: recursos financieros directos que la organización destina al proyecto.",
              "Aporte en especie: uso de infraestructura propia, tiempo de personal ya contratado, u otros recursos no monetarios valorizados.",
              "Sostenibilidad institucional: capacidad de la organización de mantener el equipo o el conocimiento generado después del proyecto.",
              "Sostenibilidad financiera: fuentes de ingreso propias o alternativas que permitan seguir operando sin depender del financiamiento externo original.",
            ],
          },
          {
            titulo: "Coherencia entre presupuesto, cronograma y actividades",
            parrafos: [
              "Uno de los errores técnicos más frecuentes en la estructuración de proyectos es la falta de coherencia entre presupuesto, cronograma y actividades. Un evaluador experimentado revisa, de forma cruzada, si cada actividad relevante tiene un respaldo presupuestal razonable, y si los tiempos de desembolso previstos coinciden con el momento en que cada actividad realmente se va a ejecutar.",
            ],
          },
        ],
        preguntas: [
          "Si tuvieras que justificar, rubro por rubro, cada línea de tu presupuesto ante un evaluador exigente, ¿qué partidas te resultaría más difícil sustentar hoy?",
          "¿Qué aporte propio —económico o en especie— podría hacer tu organización como contrapartida?",
          "¿Qué haría tu proyecto sostenible una vez terminado el financiamiento externo?",
        ],
      },
      {
        id: "3-4",
        numero: "3.4",
        titulo: "Documentación técnica",
        parrafos: [
          "La estructuración técnica termina con la organización del expediente técnico del proyecto: el conjunto de documentos que consolidan y sustentan toda la información desarrollada hasta este punto, y que se va a presentar ante la fuente de financiación seleccionada.",
        ],
        subtemas: [
          {
            titulo: "Componentes habituales del expediente técnico",
            parrafos: [],
            lista: [
              "Diagnóstico y justificación del proyecto, heredados del trabajo del bloque 2.",
              "Matriz de marco lógico completa, con indicadores, medios de verificación y supuestos.",
              "Cronograma de actividades, habitualmente en formato de diagrama de Gantt.",
              "Presupuesto detallado por categorías y fuentes de financiamiento.",
              "Anexos legales o institucionales: estatutos, certificaciones tributarias, cartas de compromiso de aliados.",
            ],
          },
          {
            titulo: "Organización y control de versiones del expediente",
            parrafos: [
              "Un expediente técnico bien construido no solo debe ser completo: debe estar organizado de forma que facilite su revisión por un evaluador externo, y que le permita al propio equipo mantener el control sobre las distintas versiones del documento a medida que se van incorporando ajustes. Esto es especialmente relevante cuando varios miembros del equipo trabajan a la vez en distintas secciones del expediente.",
            ],
            lista: [
              "Mantener una convención clara de nombres de archivo que incluya versión y fecha.",
              "Centralizar el expediente en un único repositorio compartido, evitando versiones dispersas entre distintos correos o dispositivos.",
              "Llevar un registro breve de los cambios importantes en cada nueva versión del documento.",
              "Verificar, antes de cada envío, que la versión compartida sea efectivamente la más actualizada.",
            ],
          },
          {
            titulo: "Salvaguardas ambientales y sociales",
            parrafos: [
              "En proyectos dirigidos a la banca de desarrollo o a ciertos organismos de cooperación, es frecuente encontrar el requisito de salvaguardas ambientales y sociales: un conjunto de criterios para clasificar y gestionar los riesgos ambientales y sociales que un proyecto pudiera generar. Aunque el proyecto no se dirija inicialmente a este tipo de fuentes, conocer esta exigencia amplía la visión del estructurador sobre los estándares que puede llegar a encontrar en el ecosistema.",
            ],
          },
          {
            titulo: "Herramientas digitales de apoyo",
            parrafos: [
              "Además de las herramientas de inteligencia artificial mencionadas antes, existe una variedad de herramientas digitales de uso extendido que facilitan distintos aspectos de la estructuración técnica: hojas de cálculo para construir y verificar presupuestos, software de gestión de proyectos para cronogramas y diagramas de Gantt, y plataformas colaborativas de documentos que permiten a varios miembros del equipo trabajar a la vez en el mismo expediente.",
              "La elección de herramientas específicas depende, en buena parte, de la capacidad instalada de la organización y de los requisitos de formato de cada fuente de financiación. Lo más importante no es dominar una herramienta en particular, sino entender la lógica de cada componente técnico —qué información debe tener un cronograma, cómo se estructura un presupuesto— para poder aplicarla con cualquier herramienta disponible, incluyendo los formatos oficiales que cada financiador exija.",
            ],
          },
        ],
        checklist: {
          titulo: "Documentación técnica",
          items: [
            "El expediente técnico incluye todos los componentes habituales exigidos por fuentes de financiación similares.",
            "La matriz de marco lógico, el cronograma y el presupuesto son coherentes entre sí.",
            "Los anexos legales e institucionales están vigentes y disponibles.",
            "Revisé si el tipo de proyecto podría estar sujeto a criterios de salvaguardas ambientales y sociales.",
          ],
        },
      },
    ],
    casosDeEstudio: [
      {
        titulo: "De la estrategia a la matriz técnica",
        parrafos: [
          "Retomemos, de forma aplicada, los conceptos de este bloque con un caso hipotético. Un equipo estructurador trabaja en un proyecto de fortalecimiento de capacidades para pequeños productores agropecuarios de una región determinada, cuyo diseño estratégico —desarrollado siguiendo la lógica del bloque 2— definió como propósito central mejorar los ingresos de los productores participantes mediante la adopción de prácticas productivas más eficientes.",
          "Al construir la matriz de marco lógico, el equipo formula como indicador de propósito 'incremento de al menos 15% en el ingreso promedio de los productores participantes, dieciocho meses después de terminada la capacitación', con encuestas de seguimiento como medio de verificación. Como supuesto, identifican que las condiciones climáticas de la región se mantengan dentro de rangos normales durante ese periodo, porque una sequía o una inundación severa podría afectar los resultados sin importar la calidad de la capacitación.",
          "En la planeación operativa, el equipo construye una estructura de desglose de trabajo que distingue entre el diseño curricular, la ejecución de las capacitaciones en campo, y el acompañamiento posterior a los productores. Al aplicar la matriz RACI, notan que la aprobación final del contenido curricular corresponde a un comité técnico externo, lo que introduce un tiempo de revisión que no habían considerado en su primer borrador de cronograma, y que deben incorporar para evitar un retraso no anticipado.",
          "En la planeación financiera, el equipo presupuesta el acompañamiento posterior con recursos de contrapartida de la propia organización, en vez de pedirlo íntegramente al financiador principal, como forma de mostrar compromiso institucional con la sostenibilidad de los resultados más allá del financiamiento externo directo. Finalmente, como el proyecto involucra el uso de suelos agrícolas y podría tener implicaciones ambientales menores, el equipo revisa de forma preventiva los criterios de salvaguardas ambientales de su principal fuente de financiación potencial, evitando sorpresas durante la evaluación técnica.",
        ],
      },
      {
        titulo: "Segundo caso: ajustando un indicador poco realista",
        parrafos: [
          "Un equipo estructurador, trabajando en un proyecto de alfabetización digital para adultos mayores, formula al inicio como indicador de propósito 'el 100% de los participantes usa dispositivos digitales de manera autónoma al finalizar el programa'. Al revisarlo con más cuidado, el equipo reconoce dos problemas: la meta del 100% es poco realista dada la heterogeneidad de los participantes, y el término 'de manera autónoma' es difícil de verificar objetivamente sin una prueba estandarizada.",
          "El equipo reformula el indicador así: 'al menos el 65% de los participantes logra completar de manera independiente tres tareas digitales básicas previamente definidas, evaluadas mediante una prueba práctica al finalizar el programa'. Esta reformulación resuelve ambos problemas: establece una meta realista basada en la experiencia de programas similares, y define con precisión qué se entiende por 'autonomía' a través de tareas específicas y verificables.",
        ],
        preguntas: [
          "Revisa uno de tus propios indicadores: ¿la meta que propone es realmente alcanzable, o refleja más una aspiración que una estimación fundamentada?",
          "¿Qué supuesto climático, económico o social podría afectar los resultados de tu proyecto, sin importar la calidad de su ejecución?",
        ],
      },
    ],
    erroresComunes: {
      titulo: "Errores comunes en la estructuración técnica",
      items: [
        "Formular indicadores vagos, difíciles de medir o sin un medio de verificación creíble asociado.",
        "Confundir supuestos con riesgos que en realidad deberían gestionarse dentro del propio proyecto.",
        "Construir cronogramas que no contemplan tiempos administrativos o de aprobación institucional.",
        "Presentar un presupuesto que no guarda coherencia con el cronograma o con las actividades descritas.",
        "Omitir anexos legales o institucionales relevantes, generando observaciones evitables durante la evaluación.",
        "Depender solo de indicadores de proceso, sin incluir indicadores de resultado que muestren el cambio real generado.",
        "Fijar metas poco realistas en los indicadores, motivadas más por el deseo de impresionar al evaluador que por una estimación fundamentada.",
      ],
    },
    recomendaciones: [
      "Practica la construcción de matrices de marco lógico con proyectos hipotéticos de distinta naturaleza —sociales, productivos, de infraestructura— porque cada tipo tiende a generar retos particulares en la formulación de indicadores.",
      "Revisa formatos oficiales de marco lógico de distintas fuentes de financiación —cuando estén disponibles públicamente— para familiarizarte con las variaciones que puedes encontrar en la práctica.",
      "Somete tu matriz de marco lógico a una revisión cruzada antes de darla por terminada: léela de abajo hacia arriba, verificando que las actividades produzcan los resultados descritos, y luego de arriba hacia abajo, verificando que los resultados sean necesarios y suficientes para el propósito planteado.",
      "Guarda, como banco de referencia personal, los indicadores, cronogramas y estructuras presupuestales de proyectos anteriores, aunque no hayan sido financiados: con el tiempo se vuelve una biblioteca que agiliza la estructuración de proyectos nuevos.",
    ],
    cierre: [
      "Este bloque convirtió la arquitectura estratégica del proyecto en una estructura técnica sólida: una matriz de marco lógico con indicadores verificables, un cronograma realista con responsables definidos, un presupuesto coherente con las actividades planificadas, y un expediente técnico organizado y completo. Con este trabajo, el proyecto ya cuenta con toda la sustancia necesaria para dialogar, en términos técnicos, con cualquier actor del ecosistema de financiación descrito en el bloque 1.",
      "El bloque 4 cierra el recorrido del programa conectando este proyecto ya estructurado con fuentes de financiación concretas: cómo buscarlas de forma activa, cómo interpretar sus términos de referencia, cómo evaluar la compatibilidad entre el proyecto y cada fuente, y cómo adaptar la documentación —sin desnaturalizar el proyecto— para maximizar sus probabilidades de éxito.",
    ],
    autoevaluacion: [
      "Puedo explicar la diferencia entre la lógica vertical y la lógica horizontal de una matriz de marco lógico.",
      "Puedo formular al menos un indicador SMART para el propósito central de mi proyecto.",
      "Cuento con un primer borrador de cronograma que contempla dependencias y tiempos administrativos realistas.",
      "Mi presupuesto guarda coherencia con el cronograma y las actividades descritas en mi proyecto.",
      "Revisé si mi proyecto podría estar sujeto a criterios de salvaguardas ambientales y sociales.",
      "Incluí un rubro de contingencia razonable frente a riesgos cambiarios o inflacionarios, si aplica a mi contexto.",
    ],
    puntosClave: [
      "El marco lógico organiza objetivos, indicadores, medios de verificación y supuestos en una matriz técnica coherente, con una lógica vertical y una lógica horizontal.",
      "Un buen indicador combina unidad de medida, meta cuantificable, población de referencia y plazo definido, y conviene balancear indicadores de proceso con indicadores de resultado.",
      "Actividades y entregables deben tener una relación de causalidad clara con los resultados esperados del proyecto.",
      "La planeación operativa ordena las actividades en el tiempo mediante un cronograma realista, apoyado en herramientas como la EDT y la matriz RACI.",
      "El presupuesto debe ser coherente con el cronograma y las actividades, e identificar claramente las fuentes de financiación, la contrapartida institucional y los riesgos cambiarios o inflacionarios relevantes.",
      "El expediente técnico consolida toda la documentación de soporte del proyecto, incluyendo, cuando corresponda, criterios de salvaguardas ambientales y sociales.",
      "Los errores técnicos más frecuentes —indicadores vagos, supuestos mal identificados, incoherencias entre presupuesto y cronograma— se pueden evitar con revisión cruzada y rigor metodológico.",
    ],
    glosario: [
      { termino: "Marco lógico", definicion: "Metodología que organiza objetivos, indicadores, medios de verificación y supuestos de un proyecto en una matriz integrada." },
      { termino: "Indicador", definicion: "Medida concreta que permite verificar el cumplimiento de un objetivo o resultado de un proyecto." },
      { termino: "Lógica vertical", definicion: "Relación jerárquica entre fin, propósito, resultados y actividades dentro de una matriz de marco lógico." },
      { termino: "Lógica horizontal", definicion: "Correspondencia entre cada nivel de la matriz de marco lógico y sus indicadores, medios de verificación y supuestos." },
      { termino: "Estructura de desglose de trabajo (EDT)", definicion: "Descomposición jerárquica de un proyecto en componentes, subcomponentes, actividades y tareas manejables." },
      { termino: "Matriz RACI", definicion: "Herramienta que asigna, para cada actividad, quién es responsable, quién aprueba, a quién se consulta y a quién se informa." },
      { termino: "Contrapartida", definicion: "Aporte propio de la organización ejecutora, en dinero o en especie, destinado a complementar el financiamiento externo de un proyecto." },
      { termino: "Salvaguardas ambientales y sociales", definicion: "Conjunto de criterios usados por la banca de desarrollo para clasificar y gestionar los riesgos ambientales y sociales de un proyecto." },
      { termino: "Expediente técnico", definicion: "Conjunto de documentos, formatos y soportes que consolidan la información necesaria para sustentar técnica y administrativamente un proyecto." },
      { termino: "Indicador de proceso", definicion: "Medida que evalúa el avance en la ejecución de actividades de un proyecto, sin evaluar todavía el cambio generado en la población objetivo." },
      { termino: "Indicador de resultado", definicion: "Medida que evalúa el cambio generado por un proyecto en su población objetivo, más allá de la simple ejecución de actividades." },
    ],
  },
  {
    id: "bloque-4",
    numero: 4,
    titulo: "Matching y preparación para fuentes de financiación",
    subtitulo: "De un proyecto estructurado a una postulación compatible",
    introduccion: [
      "Con el diseño estratégico y la estructuración técnica completos, el proyecto está listo para dialogar con el ecosistema de financiación del bloque 1. Este último bloque cierra el recorrido del programa: cómo buscar oportunidades de financiación de forma activa, cómo interpretar bien los términos de referencia de una convocatoria, cómo evaluar la compatibilidad entre el proyecto y una fuente específica, y cómo adaptar la documentación técnica sin comprometer la esencia del proyecto.",
      "Este bloque retoma, de forma aplicada, varias ideas de bloques anteriores: la lógica de los distintos actores del ecosistema (bloque 1), la adaptación del énfasis narrativo del Pitch Deck (bloque 2) y la solidez de la documentación técnica (bloque 3). El proceso de matching y adaptación es, en ese sentido, el punto de encuentro de todo el programa.",
      "Las unidades siguientes desarrollan, en orden, la búsqueda activa de oportunidades de financiación, la interpretación rigurosa de los términos de referencia, el proceso de matching entre un proyecto y una fuente específica, y la adaptación final de la documentación para maximizar las probabilidades de éxito de una postulación.",
    ],
    unidades: [
      {
        id: "4-1",
        numero: "4.1",
        titulo: "Búsqueda de oportunidades de financiación",
        parrafos: [
          "Una vez delimitado el universo de mecanismos compatibles con el proyecto —ejercicio del bloque 1—, corresponde hacer una búsqueda activa de oportunidades concretas. Esta búsqueda puede apoyarse en portales de convocatorias de organismos de cooperación y bancos de desarrollo, bases de datos y boletines de fondos concursables públicos, redes y plataformas de inversionistas o de aceleración de emprendimientos, y plataformas de financiamiento colectivo.",
        ],
        subtemas: [
          {
            titulo: "Búsqueda activa frente a búsqueda pasiva",
            parrafos: [
              "Conviene distinguir una búsqueda pasiva —revisar de vez en cuando los canales habituales— de una búsqueda activa, que incluye suscribirse a alertas y boletines de las fuentes más relevantes para el sector del proyecto, construir y mantener relaciones con actores del ecosistema identificados en el bloque 1, y participar en espacios de encuentro entre proyectos y financiadores, como ferias, foros o convocatorias de aceleración.",
              "La búsqueda activa suele identificar oportunidades con más anticipación, lo que amplía el tiempo disponible para preparar una postulación de calidad. Las organizaciones que consiguen financiamiento de forma más consistente en el tiempo suelen ser, justamente, las que mantienen ese tipo de vigilancia activa, en vez de empezar a buscar solo cuando el proyecto ya está listo o surge una necesidad urgente de recursos.",
            ],
          },
          {
            titulo: "Construir un sistema propio de monitoreo",
            parrafos: [
              "Más allá de revisar oportunidades de vez en cuando, conviene construir un sistema propio y sencillo de monitoreo: una lista organizada de fuentes relevantes para el sector del proyecto, con la frecuencia habitual de sus convocatorias, para anticipar cuándo es probable que se abra una nueva oportunidad.",
            ],
            lista: [
              "Identificar las fuentes que ya han financiado proyectos similares en el pasado, y revisar la periodicidad de sus convocatorias.",
              "Suscribirse a los boletines o alertas oficiales de esas fuentes, en vez de depender solo de búsquedas puntuales.",
              "Mantener una hoja de seguimiento simple con fechas de apertura y cierre históricas de las convocatorias más relevantes.",
              "Revisar este sistema de monitoreo de forma periódica, no solo cuando el proyecto necesita financiamiento con urgencia.",
            ],
          },
        ],
        checklist: {
          titulo: "Búsqueda de oportunidades",
          items: [
            "Cuento con una lista organizada de al menos cinco fuentes de financiación relevantes para mi proyecto.",
            "Estoy suscrito a alertas o boletines de las fuentes más relevantes para mi sector.",
            "Identifiqué la periodicidad habitual de las convocatorias más relevantes para mi proyecto.",
          ],
        },
      },
      {
        id: "4-2",
        numero: "4.2",
        titulo: "Interpretación de términos de referencia (TDR)",
        parrafos: [
          "Los términos de referencia (TDR) son el documento que establece los requisitos, criterios de elegibilidad, condiciones de participación y lineamientos para acceder a una oportunidad de financiación. Interpretarlos bien es, muchas veces, tan importante como la calidad técnica del proyecto mismo: un excelente proyecto que no cumple los requisitos formales de una convocatoria queda descartado antes de una evaluación de fondo.",
        ],
        subtemas: [
          {
            titulo: "Elementos a identificar en un TDR",
            parrafos: [],
            lista: [
              "El objetivo de la convocatoria y las líneas temáticas o sectoriales que financia.",
              "Los criterios de elegibilidad: qué tipo de organizaciones o proyectos pueden postular.",
              "El monto mínimo y máximo de financiamiento, y si se exige contrapartida.",
              "Los plazos: fecha límite de postulación, duración máxima del proyecto y periodo de ejecución permitido.",
              "La documentación específica que se solicita y el formato exigido para presentarla.",
              "Los criterios y la metodología de evaluación que se usarán para seleccionar los proyectos ganadores.",
            ],
          },
          {
            titulo: "Método de lectura recomendado",
            parrafos: [
              "Dada la extensión y densidad técnica que suelen tener los TDR, conviene aplicar un método de lectura en varias pasadas en vez de leerlos de principio a fin de corrido. Una primera pasada rápida identifica la estructura general del documento y localiza las secciones más relevantes; una segunda pasada, más detenida, se concentra en los criterios de elegibilidad y de evaluación; y una tercera pasada final revisa los detalles administrativos y de formato que, aunque menos determinantes para la calidad de la propuesta, con frecuencia son causa de descalificaciones evitables.",
            ],
          },
          {
            titulo: "Cómo leer los criterios de evaluación",
            parrafos: [
              "La mayoría de los TDR incluyen una tabla de criterios de evaluación con una ponderación específica para cada aspecto —por ejemplo, 30% calidad técnica, 20% presupuesto, 25% impacto esperado, 15% capacidad institucional y 10% innovación—. Esta ponderación no es un detalle secundario: indica exactamente dónde concentrar el esfuerzo de preparación de la postulación.",
              "Un error frecuente es leer el TDR de forma superficial, buscando solo el monto disponible y la fecha límite, sin prestar atención a los criterios de evaluación. Distribuir el tiempo de preparación según la ponderación de cada criterio —y no de forma uniforme entre todas las secciones— suele mejorar bastante la calidad final de la propuesta.",
            ],
          },
          {
            titulo: "Vocabulario habitual en un TDR",
            parrafos: [
              "Los términos de referencia suelen usar un vocabulario técnico y administrativo específico, cuya interpretación correcta evita confusiones costosas durante la preparación de una postulación. Familiarizarse con este vocabulario permite leer un TDR con más velocidad y precisión.",
              "No todos los TDR contemplan una etapa de subsanación: en muchos procesos, un error formal —un documento faltante, un formato incorrecto— es motivo suficiente para descartar la postulación sin posibilidad de corregirla después. Verificar si el TDR contempla o no esta posibilidad es, entonces, un dato relevante para calibrar el nivel de revisión previa que exige el envío final.",
            ],
          },
        ],
        checklist: {
          titulo: "Interpretación del TDR",
          items: [
            "Identifiqué con claridad todos los criterios de elegibilidad de la convocatoria.",
            "Revisé la ponderación de cada criterio de evaluación, y no solo el monto y el plazo disponibles.",
            "Verifiqué el formato exacto de documentación exigido, incluyendo extensión máxima y anexos requeridos.",
            "Apliqué el método de lectura en tres pasadas, dedicando el mayor tiempo a elegibilidad y criterios de evaluación.",
          ],
        },
        preguntas: [
          "Piensa en una convocatoria que conozcas: ¿podrías nombrar, sin consultar el documento, sus tres criterios de evaluación más importantes?",
        ],
      },
      {
        id: "4-3",
        numero: "4.3",
        titulo: "Matching entre proyecto y fuente de financiación",
        parrafos: [
          "El matching es el proceso de análisis con el que se evalúa la compatibilidad entre un proyecto ya estructurado y los requisitos de una convocatoria, fondo o entidad financiadora, para determinar si tiene sentido presentarlo.",
        ],
        subtemas: [
          {
            titulo: "Criterios del análisis de matching",
            parrafos: [
              "Este análisis retoma los criterios iniciales del bloque 1 —tipo de organización, naturaleza del proyecto, escala de recursos, capacidad institucional— y los contrasta ahora con las condiciones específicas de una fuente concreta. A diferencia del análisis preliminar del bloque 1, que trabajaba con mecanismos genéricos, este análisis se hace sobre una fuente específica, ya identificada por su nombre, con un TDR concreto ya publicado o próximo a publicarse.",
            ],
            lista: [
              "Alineación temática y geográfica: ¿el proyecto está dentro de las líneas temáticas y el alcance geográfico que financia la fuente?",
              "Coherencia de escala: ¿el monto solicitado está dentro del rango que ofrece la convocatoria?",
              "Compatibilidad de plazos: ¿la duración del proyecto es compatible con el periodo de ejecución que permite la fuente?",
              "Capacidad institucional real: ¿la organización puede cumplir los requisitos de contrapartida, reporte y rendición de cuentas que exige esa fuente en particular?",
            ],
          },
          {
            titulo: "La matriz de matching",
            parrafos: [
              "Una herramienta útil para sistematizar este análisis es la matriz de matching: una tabla sencilla que cruza, para cada oportunidad identificada, los criterios de compatibilidad frente a las características del proyecto.",
              "Construir esta matriz exige, antes que nada, tener un perfil claro del propio proyecto —heredado del trabajo de los bloques 2 y 3— para poder contrastarlo de forma sistemática contra cada fuente. Sin ese perfil de referencia, la evaluación de compatibilidad tiende a volverse subjetiva e inconsistente entre una fuente y otra.",
              "Esta matriz permite comparar varias oportunidades a la vez y priorizar las que tienen mayor probabilidad real de éxito, evitando dispersar esfuerzos en postulaciones de baja compatibilidad.",
            ],
          },
          {
            titulo: "Cuándo postergar y cuándo descartar",
            parrafos: [
              "No toda oportunidad de baja compatibilidad debe descartarse de forma definitiva. Conviene distinguir entre oportunidades que se descartan por incompatibilidad estructural —por ejemplo, una fuente que financia solo proyectos de un sector distinto— y oportunidades que se postergan porque la organización todavía no tiene la madurez o la capacidad institucional necesaria, pero podría alcanzarla más adelante.",
            ],
          },
          {
            titulo: "Después del matching: el primer contacto",
            parrafos: [
              "En muchos casos, antes de enviar una postulación formal, es posible —y recomendable— tener un primer contacto informal con el financiador: una consulta por correo, una llamada breve, o participar en una sesión informativa que la propia fuente organice. Este primer contacto cumple dos propósitos: despeja dudas puntuales sobre el TDR que no queden claras en el documento escrito, y da una primera señal —aunque informal— sobre el nivel de interés que el financiador podría tener en una propuesta como la que se está preparando.",
              "Este contacto también sirve para verificar información que el TDR podría no detallar lo suficiente: el nivel real de competencia esperado en esa convocatoria, si hay prioridades no explícitas dentro de las líneas temáticas generales, o si el financiador estaría dispuesto a recibir observaciones sobre algún punto ambiguo del documento antes del cierre del plazo.",
            ],
            lista: [
              "Preparar preguntas concretas y específicas antes del contacto, evitando consultas que ya estén respondidas en el propio TDR.",
              "Presentar el proyecto de forma breve y clara si la conversación lo permite, sin convertir la consulta en una presentación completa no solicitada.",
              "Documentar cualquier respuesta relevante que se obtenga en ese contacto, porque puede aclarar ambigüedades del TDR que afecten la preparación de la propuesta.",
            ],
          },
        ],
        preguntas: [
          "De las fuentes de financiación que consideras para tu proyecto, ¿cuál tiene hoy el mayor nivel de compatibilidad según estos criterios?",
          "¿Qué requisito de esa fuente representa hoy el mayor desafío para tu organización?",
        ],
      },
      {
        id: "4-4",
        numero: "4.4",
        titulo: "Adaptación del proyecto para su presentación",
        parrafos: [
          "Identificada una fuente compatible, el paso final es adaptar la documentación del proyecto a sus requerimientos específicos, sin alterar la esencia técnica ni estratégica del proyecto construida a lo largo del programa.",
        ],
        subtemas: [
          {
            titulo: "Qué se puede adaptar y qué no",
            parrafos: [
              "Esta adaptación puede implicar ajustar el formato de la documentación técnica al modelo exigido por la convocatoria, reorganizar o ajustar el nivel de detalle del cronograma y el presupuesto según lo solicitado, y modificar el énfasis narrativo del Pitch Deck y de la nota conceptual —retomando la idea del bloque 2— para resaltar los aspectos que esa fuente en particular valora más.",
              "Es importante distinguir entre adaptar y desnaturalizar un proyecto. Adaptar significa ajustar cómo se presenta la información, o incluso matizar el énfasis de ciertos componentes, sin alterar los objetivos, resultados o presupuesto reales del proyecto. Desnaturalizar significa modificar el proyecto mismo —sus objetivos, su alcance, su población beneficiaria— solo para encajar en los requisitos de una convocatoria, lo que compromete tanto la viabilidad de ejecución como la credibilidad técnica de quien lo presenta.",
            ],
          },
        ],
        checklist: {
          titulo: "Ética en la adaptación",
          items: [
            "Todas las cifras presentadas en la versión adaptada del proyecto son consistentes con la información real de la organización.",
            "No omití información materialmente relevante que el financiador necesitaría para decidir de forma informada.",
            "Las capacidades institucionales que declaro en la postulación reflejan la situación real de mi organización, no una aspiración futura presentada como si ya existiera.",
          ],
        },
      },
    ],
    casosDeEstudio: [
      {
        titulo: "Matching y adaptación en la práctica",
        parrafos: [
          "Retomemos, de forma aplicada, los conceptos de este bloque final con un caso hipotético que integra todo el recorrido del programa. Una organización de la sociedad civil estructuró, en los tres bloques anteriores, un proyecto de fortalecimiento de emprendimientos liderados por mujeres en una región determinada, con un propósito central de incremento de ingresos y un componente de acompañamiento técnico y financiero.",
          "Al iniciar la búsqueda activa de oportunidades, el equipo identifica tres fuentes potencialmente compatibles: un fondo internacional de inversión de impacto con enfoque de género, una convocatoria pública regional de emprendimiento, y una fundación local con línea de financiamiento para mujeres rurales. Al revisar los TDR de cada una, el equipo nota que el fondo de inversión de impacto pondera fuertemente la escalabilidad y el modelo de retorno financiero —criterios que el proyecto, de naturaleza principalmente social, no logra cumplir con solidez—, mientras que la convocatoria pública y la fundación local ponderan más el impacto social directo y la pertinencia territorial.",
          "Al construir su matriz de matching, el equipo decide priorizar la convocatoria pública y la fundación local, y postergar —no descartar del todo— el fondo de inversión de impacto hasta que el proyecto demuestre, con una primera fase ya ejecutada, un modelo de generación de ingresos más consolidado. Para la convocatoria pública, adaptan su Pitch Deck resaltando la alineación con la política regional de equidad de género; para la fundación local, resaltan la trayectoria previa de la organización trabajando directamente con la población beneficiaria de esa misma zona.",
          "En ningún caso el equipo modifica el número real de beneficiarias proyectadas, el presupuesto total del proyecto, ni los indicadores de resultado ya definidos en el bloque 3: lo que cambia, de una postulación a otra, es qué aspectos se destacan primero, qué evidencia se prioriza en la narrativa, y qué lenguaje se usa para conectar con las prioridades específicas de cada financiador. Ese es, en esencia, el ejercicio de adaptación sin desnaturalización que este bloque buscó enseñar.",
          "Meses después, la convocatoria pública responde de forma positiva, mientras que la fundación local pide ajustes antes de una decisión final. El equipo revisa con cuidado las observaciones de la fundación, distingue cuáles implican una adaptación razonable de la propuesta y cuáles implicarían alterar la esencia del proyecto, y responde con una propuesta ajustada donde correspondía, manteniendo su posición técnica donde una observación no era consistente con la evidencia recogida durante el diagnóstico del bloque 2.",
          "Un año después, con la primera fase del proyecto ya en ejecución gracias a la convocatoria pública, el equipo retoma el contacto con el fondo de inversión de impacto que había postergado. Esta vez, la propuesta se presenta con resultados preliminares concretos —número de emprendimientos acompañados, incremento inicial de ingresos observado— que fortalecen bastante el componente de evidencia que antes era su principal debilidad frente a ese tipo de financiador. Este cierre del caso muestra cómo el matching no es necesariamente una decisión de una sola vez, sino un proceso que se puede revisar a medida que el proyecto y la organización maduran.",
        ],
      },
    ],
    erroresComunes: {
      titulo: "Errores comunes en la etapa de matching y adaptación",
      items: [
        "Postular a una fuente por su prestigio o visibilidad, sin haber verificado antes su compatibilidad real con el proyecto.",
        "Leer el TDR de forma superficial, ignorando los criterios de evaluación y su ponderación específica.",
        "Modificar cifras sustantivas del proyecto —presupuesto, metas, población beneficiaria— para ajustarse de forma artificial a una convocatoria.",
        "Enviar el mismo documento, sin ninguna adaptación, a fuentes con lógicas y criterios de evaluación claramente distintos.",
        "Dejar inconsistencias entre las distintas versiones adaptadas del expediente técnico, sobre todo en cifras de presupuesto e indicadores.",
        "Enviar la postulación en el último momento, sin margen para corregir errores formales detectados en una revisión final.",
        "Interpretar un rechazo aislado como una señal definitiva sobre la calidad del proyecto, sin pedir retroalimentación específica.",
      ],
    },
    recomendaciones: [
      "Practica la lectura crítica de TDR reales —cuando estén disponibles públicamente— identificando de forma sistemática sus criterios de evaluación y su ponderación, aunque no pienses postular a esa convocatoria específica.",
      "Mantén un archivo organizado de las distintas versiones adaptadas de un mismo proyecto a lo largo del tiempo, documentando qué cambió entre una versión y otra, y por qué.",
      "Construye, con el tiempo, una red de contactos dentro del ecosistema de financiación de tu sector: personas que trabajan en fuentes relevantes, colegas de otras organizaciones, consultores con experiencia en estructuración de proyectos.",
      "Revisa periódicamente los resultados de tus propias postulaciones —exitosas y no exitosas— con mirada crítica y constructiva, identificando patrones que se repiten entre los procesos que avanzaron y los que no.",
    ],
    cierre: [
      "Con este bloque se completa el recorrido del programa. El bloque 1 permitió entender el ecosistema de financiación y el rol del estructurador dentro de él. El bloque 2 tradujo una necesidad, problema u oportunidad en una propuesta estratégica clara, comunicada a través de un Pitch Deck. El bloque 3 convirtió esa estrategia en una estructura técnica sólida: marco lógico, cronograma, presupuesto y documentación de soporte. Este último bloque cerró el ciclo, conectando ese proyecto ya estructurado con fuentes de financiación reales, a través de un proceso de búsqueda, interpretación, matching y adaptación.",
      "El resultado de este recorrido no es solo un conjunto de conocimientos teóricos, sino un proyecto propio, estructurado de principio a fin y preparado para adaptarse a distintas fuentes de financiación. Estructurar un proyecto no es, en el fondo, un ejercicio puramente técnico ni puramente narrativo, sino un ejercicio de traducción honesta entre una necesidad real y una fuente de financiación real, sostenido por rigor metodológico, claridad estratégica y una conducta ética consistente a lo largo de todo el proceso.",
    ],
    autoevaluacion: [
      "Cuento con un sistema propio, aunque sea sencillo, de monitoreo de oportunidades de financiación relevantes para mi proyecto.",
      "Puedo identificar, en un TDR real, sus criterios de evaluación y la ponderación de cada uno.",
      "Apliqué, al menos de forma preliminar, una matriz de matching a mi propio proyecto frente a más de una fuente de financiación.",
      "Puedo explicar con claridad la diferencia entre adaptar y desnaturalizar un proyecto.",
      "Cuento con un checklist propio de adaptación documental que puedo reutilizar en futuras postulaciones.",
      "Tengo un plan claro sobre cómo gestionaría, de forma constructiva, una respuesta negativa a una postulación.",
    ],
    puntosClave: [
      "La búsqueda activa de oportunidades, apoyada en un sistema propio de monitoreo, amplía el tiempo disponible para preparar postulaciones de calidad.",
      "Interpretar correctamente los términos de referencia —en especial los criterios de evaluación y su ponderación— es tan relevante como la calidad técnica del proyecto.",
      "El matching evalúa la compatibilidad entre un proyecto estructurado y los requisitos de una fuente específica, apoyándose en una matriz sistemática de análisis, y distinguiendo entre oportunidades para descartar y oportunidades para postergar.",
      "Adaptar un proyecto significa ajustar su presentación, formato y énfasis narrativo, no modificar sus objetivos, cifras o beneficiarios reales.",
      "Un mismo proyecto puede sostener varias narrativas coherentes en paralelo, dirigidas a fuentes distintas, sin que eso comprometa su integridad técnica.",
      "Gestionar respuestas negativas con una actitud de aprendizaje continuo, en vez de desánimo, es parte del trabajo sostenido de un estructurador de proyectos.",
      "El recorrido completo del programa —ecosistema, diseño estratégico, estructuración técnica y matching— termina en un proyecto propio, estructurado y preparado para presentarse ante distintas fuentes de financiación.",
    ],
    glosario: [
      { termino: "Términos de Referencia (TDR)", definicion: "Documento que establece los requisitos, criterios de elegibilidad, condiciones de participación y lineamientos para acceder a una oportunidad de financiación." },
      { termino: "Matching", definicion: "Proceso de análisis mediante el cual se evalúa la compatibilidad entre un proyecto estructurado y los requisitos de una fuente de financiación." },
      { termino: "Matriz de matching", definicion: "Herramienta que sistematiza el análisis de compatibilidad entre un proyecto y varias oportunidades de financiación, cruzando criterios clave de cada una." },
      { termino: "Adaptación del proyecto", definicion: "Ajuste de la documentación técnica, el cronograma, el presupuesto y el énfasis narrativo de un proyecto según los requerimientos de una fuente específica, sin alterar su esencia técnica." },
      { termino: "Búsqueda activa", definicion: "Estrategia sistemática de monitoreo de oportunidades de financiación, apoyada en alertas, relaciones institucionales y participación en espacios sectoriales." },
      { termino: "Criterios de evaluación", definicion: "Aspectos ponderados que una fuente de financiación usa para calificar y seleccionar las propuestas recibidas en una convocatoria." },
      { termino: "Elegibilidad", definicion: "Condiciones mínimas que debe cumplir un postulante para que su propuesta se considere en un proceso de evaluación." },
      { termino: "Subsanación", definicion: "Oportunidad, cuando el proceso la contempla, de corregir errores formales menores en una postulación después de una revisión inicial." },
    ],
  },
];
