// Contenido del curso "Entendiendo la Formulación de Proyectos" (Academia, curso 2).
// Formato PRESENTACIÓN: 6 temas, cada uno con partes (a, b, c...), cada parte
// con sus diapositivas. Contenido reescrito con palabras propias a partir del
// material de origen que compartió el dueño de la plataforma. No debe
// aparecer en ningún lugar el nombre ni la marca de la fuente original.

export interface DiapositivaFormulacion {
  titulo: string;
  puntos?: string[];
  texto?: string[];
  ejemplo?: string;
  checklist?: string[];
}

export interface ParteFormulacion {
  letra: string;
  titulo: string;
  diapositivas: DiapositivaFormulacion[];
}

export interface TemaFormulacion {
  id: string;
  numero: number;
  titulo: string;
  subtitulo: string;
  partes: ParteFormulacion[];
}

export const academiaContenidoFormulacion: TemaFormulacion[] = [
  {
    id: "tema-1",
    numero: 1,
    titulo: "Qué es un proyecto y cómo leer el contexto antes de formular",
    subtitulo: "De la idea suelta al primer objetivo, pasando por un buen diagnóstico",
    partes: [
      {
        letra: "a",
        titulo: "Qué es un proyecto y cómo se redacta un objetivo general",
        diapositivas: [
          {
            titulo: "¿Qué es un proyecto?",
            texto: [
              "Un proyecto es un esfuerzo organizado que tiene inicio y fin, un objetivo claro, recursos limitados y un resultado concreto. No es solo una buena idea: es una solución pensada y estructurada.",
            ],
            puntos: ["Inicio y fin", "Objetivo claro", "Recursos limitados", "Actividades definidas", "Resultado concreto"],
          },
          {
            titulo: "Lo que NO es un proyecto",
            texto: [
              "No todo lo que hacemos es un proyecto. Para identificarlo, hazte estas preguntas.",
              "Si no puedes responder que sí a todas, todavía no tienes un proyecto bien definido.",
            ],
            puntos: [
              "¿Tiene fecha de inicio y de cierre?",
              "¿Tiene un resultado específico?",
              "¿Requiere recursos y organización?",
              "¿Se puede saber cuándo terminó?",
            ],
          },
          {
            titulo: "Las piezas básicas de un proyecto",
            texto: [
              "Todo proyecto bien formulado tiene, como mínimo, estas piezas, y no son ideas sueltas: son una estructura lógica.",
              "El problema justifica el proyecto. El objetivo general marca el cambio principal. Las actividades son lo que hacemos para lograrlo. Los indicadores demuestran si funcionó.",
            ],
          },
          {
            titulo: "De la idea al proyecto",
            texto: ["Formular es pasar de lo general a lo específico. Una idea suelta no basta: hay que darle forma concreta."],
            ejemplo: "Idea suelta: \"Quiero ayudar a los jóvenes\" — vaga, difícil de medir. Versión estructurada: \"Quiero fortalecer habilidades para el empleo de jóvenes desempleados del municipio\" — ya tiene población, acción y propósito claro.",
          },
          {
            titulo: "¿Qué es el objetivo general?",
            texto: [
              "Es la declaración del cambio principal que el proyecto quiere lograr al final. Responde directamente al problema identificado y orienta todo lo demás.",
            ],
            puntos: [
              "Verbo en infinitivo — fortalecer, mejorar, incrementar…",
              "Qué se va a hacer — capacidades, procesos, condiciones…",
              "Para quién — la población beneficiaria específica",
              "Para qué — el cambio o impacto esperado",
            ],
          },
          {
            titulo: "Desarmemos un objetivo general",
            ejemplo: "\"Fortalecer las capacidades técnicas y productivas de 85 productores de café del corregimiento W para mejorar su competitividad en el mercado y aumentar sus ingresos.\" Verbo: fortalecer. Qué: capacidades técnicas y productivas. Para quién: 85 productores de café del corregimiento W. Para qué: mejorar competitividad y aumentar ingresos.",
            texto: ["Ojo: actividad no es lo mismo que objetivo. \"Realizar 10 talleres\" es una actividad. El objetivo es el cambio que buscamos."],
          },
          {
            titulo: "Ahora te toca a ti",
            texto: ["Completa esta fórmula con tu propia idea. No busques perfección: busca claridad."],
            puntos: ["Plantilla: [Verbo] + [qué] + de [para quién] + para [cambio esperado]", "Verbos útiles: fortalecer, mejorar, incrementar, desarrollar, ampliar"],
            checklist: ["¿Para quién es?", "¿Qué cambio busca?", "¿Se entiende con claridad?"],
          },
        ],
      },
      {
        letra: "b",
        titulo: "El diagnóstico: entender el contexto antes de formular",
        diapositivas: [
          {
            titulo: "¿Qué es un diagnóstico?",
            texto: [
              "Es un proceso de investigación, análisis y síntesis que permite entender a fondo una situación antes de proponer una solución. Sin diagnóstico, la solución puede ser superficial, equivocada o insuficiente.",
              "Funciona como en medicina: si una persona llega con dolor, el médico no receta sin revisar qué tiene. En proyectos pasa igual: primero se entiende el problema, después se formula la solución.",
            ],
          },
          {
            titulo: "Un buen diagnóstico responde seis preguntas",
            puntos: ["¿Qué está pasando?", "¿Dónde está pasando?", "¿A quién le está pasando?", "¿Desde cuándo está pasando?", "¿Por qué está pasando?", "¿Qué cuesta no hacer nada?"],
          },
          {
            titulo: "Una opinión no es un diagnóstico",
            ejemplo: "Opinión: \"En el barrio hay mucha inseguridad\". Diagnóstico: \"Según el informe de la Policía 2023, en el barrio X se registraron 47 hurtos y 12 lesiones personales en los últimos 12 meses\".",
            texto: ["La regla de oro: todo dato del diagnóstico debe traer el dato concreto, la fuente y la fecha."],
          },
          {
            titulo: "¿De dónde saco la información?",
            texto: [
              "Lo ideal es combinar información que ya existe con información producida directamente en el territorio.",
              "Fuentes secundarias: datos, estudios y reportes de otras entidades (DANE, DNP, ministerios, gobernaciones, alcaldías, Terridata, SISPRO, universidades, organismos internacionales). Son la primera opción porque ahorran tiempo.",
              "Fuentes primarias: información que tú produces cuando los datos existentes no alcanzan, están desactualizados o son muy generales (encuestas, entrevistas, grupos focales, observación directa, cartografía social).",
            ],
          },
          {
            titulo: "Un diagnóstico completo mira varias dimensiones",
            puntos: [
              "Demográfica: cantidad de personas, edad, sexo, poblaciones especiales, tendencias de crecimiento.",
              "Socioeconómica: pobreza, empleo, educación, salud, vivienda, servicios públicos, acceso a internet.",
              "Del problema específico: problema exacto, personas afectadas, causas, consecuencias, intentos previos, vacíos.",
              "Institucional: entidades públicas, ONG, organizaciones comunitarias, empresas, cooperación internacional.",
              "Territorial: municipio, barrio, vereda, condiciones de acceso, conectividad, geografía y ambiente.",
            ],
          },
          {
            titulo: "La brecha: el corazón del diagnóstico",
            texto: [
              "La brecha es la distancia entre la situación actual y la situación deseada. Es el problema que el proyecto busca resolver. Para cuantificarla necesitas un indicador de referencia, el dato actual, la diferencia entre ambos y la traducción a personas afectadas.",
            ],
            ejemplo: "Situación actual: solo el 58% de los niños entre 3 y 5 años accede a educación inicial. Situación deseada: 95%. Brecha: 37 puntos porcentuales, equivalente a cerca de 1.240 niños sin acceso.",
          },
          {
            titulo: "Los actores del diagnóstico",
            texto: [
              "Los proyectos no ocurren en el vacío: siempre hay personas e instituciones alrededor. El análisis de actores identifica quiénes se relacionan con el problema o la solución.",
            ],
            puntos: ["Beneficiarios directos e indirectos", "Aliados potenciales", "Actores neutros", "Actores críticos", "Tomadores de decisión"],
          },
          {
            titulo: "Cómo se escribe un diagnóstico en la propuesta",
            texto: [
              "El texto va de lo general a lo específico — lógica de embudo: contexto nacional, contexto regional, situación local, población afectada.",
            ],
            checklist: [
              "¿Tiene datos con fuente y fecha?",
              "¿Habla del territorio específico?",
              "¿Describe bien a la población afectada?",
              "¿Explica causas y consecuencias?",
              "¿Cuantifica la brecha?",
              "¿Justifica la intervención?",
              "¿Conecta con el objetivo del proyecto?",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tema-2",
    numero: 2,
    titulo: "El problema: cómo definirlo y sustentarlo",
    subtitulo: "Del diagnóstico al problema central del proyecto",
    partes: [
      {
        letra: "a",
        titulo: "Síntoma vs. problema y cómo redactarlo",
        diapositivas: [
          {
            titulo: "La pieza que hace ganar o perder una propuesta",
            texto: [
              "Todo lo que viene después —objetivos, actividades, presupuesto— depende de que el problema esté bien definido. Si el problema está mal, los objetivos quedan mal planteados, las actividades no responden a la necesidad real, el presupuesto pierde lógica y el evaluador no confía en la propuesta.",
              "El problema central es el cimiento: si no es sólido, todo el edificio se cae.",
            ],
          },
          {
            titulo: "Síntoma vs. problema central",
            texto: [
              "El síntoma es lo visible, lo inmediato: una señal de que algo está mal, pero no explica el fondo. El problema central es la situación negativa real que explica lo que ocurre, con causas identificables que se pueden intervenir.",
              "Tratar solo síntomas produce cambios temporales. El proyecto debe apuntar al problema real — como en medicina, la fiebre no es la enfermedad: hay que buscar qué la causa.",
            ],
            ejemplo: "Síntoma: \"Los jóvenes no consiguen trabajo\". Problema central: \"El 41% de jóvenes carece de formación alineada al mercado laboral local\".",
          },
          {
            titulo: "Ejemplos: síntoma vs. problema bien definido",
            ejemplo: "Síntoma débil: \"Los agricultores tienen bajos ingresos\". Problema bien definido: \"Los pequeños productores del corregimiento tienen acceso limitado a canales de comercialización formal y venden a intermediarios con márgenes muy altos, lo que reduce sus ingresos en hasta un 60%\".",
          },
          {
            titulo: "¿Cómo sé si el problema está bien definido?",
            puntos: [
              "Situación negativa existente: un estado negativo documentado con datos o evidencia, no una opinión ni un deseo.",
              "Población afectada específica: quiénes lo padecen, con edad, territorio o condición.",
              "Causas intervenibles: el problema tiene causas que se pueden modificar con acciones concretas.",
            ],
          },
          {
            titulo: "Errores muy comunes al redactar el problema",
            puntos: [
              "Redactarlo como ausencia de solución: \"No hay un centro comunitario\".",
              "Usar un deseo general vago: \"El desarrollo humano es insuficiente\".",
              "Emitir una opinión sin datos: \"Los jóvenes no quieren trabajar\".",
              "Mezclar problema, causa y efecto en una sola oración.",
              "Usar frases demasiado amplias que no permiten intervención.",
            ],
            texto: ["Si tu problema suena a solución, empieza de nuevo."],
          },
          {
            titulo: "Cómo redactar el problema central",
            texto: ["Una fórmula básica de punto de partida, con cuatro elementos:"],
            puntos: [
              "Situación negativa: ¿qué está mal?",
              "Grupo afectado: ¿quiénes lo padecen?",
              "Magnitud / evidencia: ¿cuántos, con qué frecuencia, desde cuándo, con qué datos?",
              "Causa principal, si se conoce.",
            ],
            ejemplo: "\"El 43% de los jóvenes entre 15 y 24 años del municipio X no completa la educación media, situación asociada a la necesidad de generar ingresos familiares y a la ausencia de rutas de atención para estudiantes en riesgo.\"",
          },
        ],
      },
      {
        letra: "b",
        titulo: "El árbol de problemas",
        diapositivas: [
          {
            titulo: "El árbol de problemas",
            texto: [
              "Es una herramienta visual para ordenar de forma lógica el problema central, las causas que lo generan y los efectos que produce. Ayuda a entender el problema como un sistema, no como un hecho aislado.",
            ],
          },
          {
            titulo: "Cómo se organiza el árbol",
            puntos: [
              "Arriba, los efectos: consecuencias del problema, son las ramas del árbol.",
              "En el centro, el problema: es el tronco, la situación negativa que une causas y efectos.",
              "Abajo, las causas: son las raíces, explican por qué existe el problema.",
            ],
          },
          {
            titulo: "Causas directas y causas raíz",
            texto: [
              "La causa directa genera el problema de forma inmediata y visible; está en el primer nivel bajo el tronco. La causa raíz es más profunda o estructural, está detrás de la directa, y suele ser más difícil de transformar pero más importante de atacar.",
            ],
            ejemplo: "Causa directa: la oferta de formación no está alineada al mercado laboral. Causa raíz: débil articulación histórica entre instituciones educativas y sector productivo.",
          },
          {
            titulo: "Efectos directos e indirectos",
            texto: [
              "El efecto directo es la consecuencia inmediata del problema. El efecto indirecto es la consecuencia más amplia o de largo plazo, y refleja el impacto estructural en la comunidad.",
            ],
            ejemplo: "Efecto directo: ingresos insuficientes en los hogares de jóvenes desempleados. Efecto indirecto: aumento sostenido de la pobreza y la desigualdad social en el territorio.",
          },
          {
            titulo: "Paso a paso para construir el árbol",
            puntos: [
              "1. Definir el problema central (situación negativa + población + magnitud + causa conocida).",
              "2. Preguntar por qué existe → causas directas.",
              "3. Anotar las causas directas en el nivel inferior al tronco.",
              "4. Repetir la pregunta para cada causa directa → causas raíz.",
              "5. Preguntar qué consecuencias tiene → efectos directos e indirectos.",
              "6. Verificar la lógica leyendo el árbol de abajo hacia arriba.",
            ],
            texto: ["Prueba de coherencia: \"si [causa raíz], entonces [causa directa]; si [causa directa], entonces [problema central]\". Si la cadena no tiene sentido, hay que revisar el árbol."],
          },
          {
            titulo: "Del árbol de problemas al árbol de objetivos",
            texto: [
              "El árbol de objetivos no se inventa: se construye transformando cada elemento negativo del árbol de problemas en su versión positiva y alcanzable.",
            ],
            puntos: [
              "El problema central se convierte en el objetivo general del proyecto.",
              "Cada causa directa se convierte en un objetivo específico o resultado esperado.",
              "Cada efecto se convierte en el impacto esperado del proyecto.",
            ],
            ejemplo: "Alto desempleo juvenil → reducir el desempleo e informalidad juvenil. Formación no alineada → fortalecer la pertinencia de la formación. Ingresos insuficientes → mejora de ingresos y bienestar familiar.",
          },
          {
            titulo: "¿Mi problema está bien formulado?",
            checklist: [
              "¿Describe una situación negativa real y existente?",
              "¿Incluye dato cuantitativo, fuente y fecha?",
              "¿Identifica con claridad la población afectada?",
              "¿Expresa la magnitud del problema?",
              "¿Menciona al menos una causa identificable?",
              "¿Explica qué efectos produce el problema?",
              "¿Evita proponer la solución directamente?",
              "¿Se conecta con el futuro objetivo general?",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tema-3",
    numero: 3,
    titulo: "Los objetivos: general y específicos",
    subtitulo: "Cómo convertir el problema en una dirección clara de intervención",
    partes: [
      {
        letra: "a",
        titulo: "El objetivo general",
        diapositivas: [
          {
            titulo: "¿Qué es un objetivo?",
            texto: [
              "Es la declaración de lo que el proyecto quiere lograr: la respuesta a \"¿para qué hacemos este proyecto?\". Marca la dirección, organiza la intervención y define el cambio que se busca.",
              "Si el problema muestra lo que está mal, el objetivo muestra el cambio que se quiere lograr — y no se inventa: responde directamente al problema ya identificado.",
            ],
          },
          {
            titulo: "¿Qué es el objetivo general?",
            texto: [
              "Es el propósito principal que el proyecto quiere alcanzar al final: el gran cambio esperado que justifica toda la intervención. Responde al problema central y orienta todo lo demás — objetivos específicos, actividades y resultados se derivan de él. Es el norte del proyecto.",
            ],
          },
          {
            titulo: "Fórmula básica del objetivo general",
            puntos: ["Verbo en infinitivo: fortalecer", "¿Qué se va a hacer?: las capacidades técnicas y productivas", "¿Para quién?: de 85 productores de café del corregimiento W", "¿Para qué?: para mejorar su competitividad e ingresos"],
            ejemplo: "\"Fortalecer las capacidades técnicas y productivas de 85 productores de café del corregimiento W para mejorar su competitividad en el mercado y aumentar sus ingresos.\"",
          },
          {
            titulo: "Características de un buen objetivo general",
            puntos: [
              "Claridad: se entiende a la primera lectura.",
              "Coherencia: se relaciona directamente con el problema del diagnóstico.",
              "Enfoque en el cambio: señala una transformación real, no una tarea.",
              "Alcance razonable: ambicioso pero posible.",
              "Lenguaje preciso: verbos concretos y términos verificables.",
            ],
          },
          {
            titulo: "Errores frecuentes en el objetivo general",
            puntos: [
              "Usar verbos difíciles de medir o comprobar.",
              "Mezclar demasiadas ideas en un solo objetivo.",
              "Redactar una actividad en vez de un objetivo.",
              "Escribir algo tan amplio que no se pueda verificar.",
              "Incluir soluciones implícitas sin relación con el problema.",
            ],
            texto: ["Verbos que, si no se concretan bien, hacen el objetivo vago: sensibilizar, concientizar, promover la cultura de, impulsar, apoyar. La clave: siempre preguntarse ¿cómo sabré que lo logré?"],
          },
          {
            titulo: "No confundas objetivo con actividad",
            ejemplo: "Actividad mal usada como objetivo: \"Realizar 10 talleres de capacitación con productores de la comunidad\" (describe una tarea, no un cambio). Objetivo bien formulado: \"Fortalecer las capacidades productivas de 85 beneficiarios para mejorar su desempeño en el mercado\" (describe el cambio esperado).",
          },
        ],
      },
      {
        letra: "b",
        titulo: "Los objetivos específicos",
        diapositivas: [
          {
            titulo: "¿Qué son los objetivos específicos?",
            texto: [
              "Son logros parciales y concretos que, juntos, permiten cumplir el objetivo general — como piezas de un rompecabezas. Descomponen el propósito general en partes manejables, organizan la lógica interna del proyecto y son medibles: se puede verificar si se lograron o no.",
            ],
          },
          {
            titulo: "¿Cuántos objetivos específicos debería tener un proyecto?",
            texto: ["Regla práctica: entre 3 y 4 objetivos específicos por proyecto, para mantener el foco sin dispersar esfuerzos."],
            puntos: [
              "Más de 5: probablemente estás intentando abarcar demasiado.",
              "Solo 1: quizás tu objetivo general es demasiado estrecho.",
              "Si parecen repetirse entre sí: revisa si realmente son distintos.",
            ],
          },
          {
            titulo: "Coherencia entre objetivo general y específicos",
            ejemplo: "Objetivo general: fortalecer las capacidades técnicas y productivas de 85 productores de café del corregimiento W. Específico 1: capacitar en buenas prácticas agrícolas sostenibles. Específico 2: dotar con herramientas e insumos para mejorar la calidad del grano. Específico 3: conectar a los productores con compradores formales mediante acuerdos comerciales.",
            texto: ["Cada objetivo específico trabaja una dimensión diferente del mismo propósito general."],
          },
          {
            titulo: "Prueba rápida de coherencia",
            checklist: [
              "¿Contribuye al objetivo general?",
              "¿Está formulado como logro y no como tarea?",
              "¿Se entiende con claridad?",
              "¿Responde a una causa del problema?",
              "¿Es viable con los recursos y el tiempo del proyecto?",
            ],
          },
          {
            titulo: "Verbos que ayudan vs. verbos que conviene revisar",
            puntos: [
              "Recomendados: fortalecer, mejorar, incrementar, desarrollar, ampliar, implementar, facilitar, consolidar.",
              "Conviene revisar (suelen ser amplios si no se concretan): sensibilizar, concientizar, impulsar, promover, apoyar.",
            ],
          },
          {
            titulo: "Comparemos dos versiones",
            ejemplo: "Versión débil: \"Mejorar la calidad de vida de la comunidad\" (¿qué comunidad? ¿qué aspecto? ¿en cuánto tiempo? nada es verificable). Versión bien formulada: \"Fortalecer las capacidades productivas de 120 mujeres rurales del municipio X para mejorar sus ingresos y su autonomía económica en 18 meses\" (tiene población, cambio, contexto y tiempo).",
          },
          {
            titulo: "Los cuatro niveles: no mezclemos conceptos",
            puntos: [
              "Actividad: acción concreta que realiza el equipo. Ej.: \"Realizar talleres de capacitación\".",
              "Resultado: cambio observable en la población o situación. Ej.: \"Productores aplican buenas prácticas\".",
              "Objetivo específico: logro parcial que contribuye al cambio principal. Ej.: \"Capacitar en técnicas sostenibles\".",
              "Objetivo general: el cambio principal que justifica todo el proyecto. Ej.: \"Fortalecer capacidades productivas\".",
            ],
          },
          {
            titulo: "¿Mis objetivos están bien formulados?",
            checklist: [
              "¿El objetivo general responde directamente al problema identificado?",
              "¿Los objetivos específicos desarrollan partes del objetivo general?",
              "¿Todos están redactados con claridad y precisión?",
              "¿Ninguno está escrito como una actividad o tarea?",
              "¿Tienen un alcance razonable para el proyecto?",
              "¿Mantienen coherencia con el diagnóstico y el problema central?",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tema-4",
    numero: 4,
    titulo: "Resultados, productos e impacto",
    subtitulo: "La diferencia entre hacer cosas y lograr cambios reales",
    partes: [
      {
        letra: "a",
        titulo: "Actividad, producto, resultado e impacto",
        diapositivas: [
          {
            titulo: "Hacer no es lo mismo que transformar",
            texto: [
              "Esta es la confusión más común en formulación de proyectos: creer que ejecutar acciones —hacer talleres, entregar equipos, realizar reuniones— ya equivale a generar cambio. Lo que realmente importa es si algo cambió en la población, si mejoró alguna situación, si hay evidencia del cambio.",
              "Un proyecto no se evalúa solo por lo que hace, sino por lo que cambia.",
            ],
          },
          {
            titulo: "La lógica de intervención",
            texto: [
              "Todo proyecto bien formulado sigue una cadena lógica donde cada nivel depende del anterior: actividades → productos → resultados → impacto. Cada nivel responde a una pregunta distinta: ¿qué hicimos? ¿qué entregamos? ¿qué cambió? ¿qué mejora de fondo se logró?",
            ],
          },
          {
            titulo: "Actividad: lo que el equipo hace",
            texto: ["Una actividad es una acción concreta que ejecuta el equipo del proyecto. Es trabajo operativo, todavía no es cambio en la población."],
            puntos: ["Ejemplos: realizar talleres de formación, hacer visitas técnicas en campo, entregar insumos, diseñar material pedagógico, organizar jornadas."],
          },
          {
            titulo: "Producto: lo que el proyecto entrega",
            texto: [
              "Es el entregable concreto que resulta de las actividades: cuantificable, verificable y tangible. Muestra que algo se hizo, pero por sí solo no demuestra transformación.",
              "El producto habla de cobertura; el resultado habla de cambio.",
            ],
            ejemplo: "100 personas capacitadas, 50 kits entregados, 1 ruta de atención diseñada, 3 ferias realizadas.",
          },
          {
            titulo: "Resultado: el cambio que ocurre gracias al proyecto",
            texto: ["Es el efecto observable en la población objetivo o en la situación intervenida. Ya no hablamos de lo que hizo el equipo, sino de lo que cambió."],
            puntos: ["Mejora en competencias técnicas que las personas aplican.", "Aumento del acceso a mercados en mejores condiciones.", "Mayor uso de servicios institucionales disponibles."],
          },
          {
            titulo: "Impacto: el cambio profundo y sostenido",
            texto: [
              "Es un cambio de largo plazo al que el proyecto contribuye, pero que no depende exclusivamente de él: otros factores del entorno también influyen.",
              "El proyecto contribuye al impacto, pero no siempre puede atribuirlo por completo a sí mismo.",
            ],
            puntos: ["Reducción de la pobreza rural.", "Mejora sostenida del bienestar familiar.", "Disminución estructural de la deserción escolar."],
          },
          {
            titulo: "Piensa en esta secuencia",
            ejemplo: "Actividad: doy la capacitación → Producto: personas capacitadas → Resultado: personas aplican lo aprendido → Impacto: mejora sostenida en su situación de vida o desempeño.",
            texto: ["Cada peldaño depende del anterior. Si las actividades no se ejecutan bien, los productos se debilitan, y así toda la cadena."],
          },
        ],
      },
      {
        letra: "b",
        titulo: "Distinguir bien los niveles",
        diapositivas: [
          {
            titulo: "Tres ejemplos para entender la cadena",
            ejemplo: "Proyecto educativo — Actividad: tutorías semanales. Producto: 200 estudiantes atendidos. Resultado: mejora del rendimiento académico. Impacto: reducción de la deserción escolar. Proyecto productivo — Actividad: capacitación y entrega de insumos. Producto: productores capacitados e insumos entregados. Resultado: mejor calidad del producto y acceso a compradores. Impacto: aumento de ingresos y reducción de pobreza.",
          },
          {
            titulo: "Una diferencia que hay que aprender bien",
            texto: [
              "La confusión más frecuente es presentar un producto como si fuera un resultado. Producto es la cobertura alcanzada, dice cuántos; resultado es el cambio verificable, dice qué transformación ocurrió.",
              "El resultado ocurre dentro del proyecto, es observable durante o al final de la intervención. El impacto se consolida más allá del proyecto, en el mediano y largo plazo.",
            ],
          },
          {
            titulo: "Preguntas que ayudan a distinguir los niveles",
            puntos: [
              "¿Qué hizo el equipo? → Actividad",
              "¿Qué entregó el proyecto? → Producto",
              "¿Qué cambió en la población? → Resultado",
              "¿Qué mejora estructural se espera a largo plazo? → Impacto",
            ],
          },
          {
            titulo: "Errores frecuentes en la formulación",
            ejemplo: "Error 1, actividad redactada como resultado: \"Realizar talleres para mejorar la empleabilidad\" (en realidad la actividad es realizar talleres, y el resultado sería jóvenes con competencias fortalecidas para acceder al empleo formal). Error 2, producto presentado como impacto: \"Entregar 100 kits productivos para reducir la pobreza\" (el producto son los 100 kits, el resultado es el aumento de capacidad productiva, y el impacto es la mejora sostenida de ingresos).",
            texto: ["Error 3: usar palabras grandes sin evidencia, como \"transformar la comunidad\" o \"generar desarrollo integral\", que sin indicadores debilitan la formulación."],
          },
          {
            titulo: "Claves para redactar bien cada nivel",
            puntos: [
              "Producto: qué se entregó, cuánto, para quién y en qué plazo. Ej.: \"250 jóvenes certificados en formación técnica antes del mes 12\".",
              "Resultado: un cambio verificable, en la población objetivo, con magnitud observable. Ej.: \"Al menos el 70% de los participantes mejora sus condiciones de empleabilidad al finalizar el proyecto\".",
              "Impacto: de largo plazo, creíble y relacionado con el problema inicial. Ej.: \"Reducción sostenida del desempleo juvenil en el territorio durante los 3 años siguientes al proyecto\".",
            ],
            texto: ["El impacto no debe sonar grandioso: debe sonar creíble."],
          },
          {
            titulo: "Lista de chequeo rápida",
            checklist: [
              "¿Las actividades describen acciones concretas del equipo?",
              "¿Los productos describen entregables cuantificables?",
              "¿Los resultados muestran cambios verificables en la población?",
              "¿El impacto es de largo plazo y guarda relación con el problema inicial?",
              "¿La secuencia actividad → producto → resultado → impacto tiene lógica interna?",
              "¿Hay coherencia entre el objetivo general y los resultados esperados?",
            ],
          },
        ],
      },
    ],
  },
  {
    id: "tema-5",
    numero: 5,
    titulo: "Indicadores y medios de verificación",
    subtitulo: "Cómo demostrar que el proyecto sí está funcionando",
    partes: [
      {
        letra: "a",
        titulo: "Qué es un indicador y cómo se construye",
        diapositivas: [
          {
            titulo: "¿Qué es un indicador?",
            texto: [
              "Imagina un termómetro: no te dice si parece que alguien tiene fiebre, te dice exactamente cuánta fiebre tiene. Un indicador es una medida verificable que muestra si algo está cambiando, en qué dirección y en qué magnitud. No es una opinión: es un dato comprobable.",
            ],
            ejemplo: "Opinión: \"El proyecto mejoró el empleo de los jóvenes\". Indicador: \"El 70% de los 250 participantes accedió a empleo formal al mes 18\".",
          },
          {
            titulo: "¿Para qué sirve un indicador?",
            puntos: [
              "Verificar cumplimiento: confirma si los objetivos se están alcanzando.",
              "Hacer seguimiento durante la ejecución.",
              "Reportar al financiador con datos concretos.",
              "Aprender y ajustar lo que no está funcionando.",
              "Dar credibilidad a la propuesta.",
            ],
          },
          {
            titulo: "Las cuatro cualidades de un buen indicador",
            puntos: [
              "Específico: mide exactamente lo que se quiere medir, sin ambigüedad.",
              "Medible: tiene una unidad clara — número, porcentaje, proporción o promedio.",
              "Verificable: existe una fuente de evidencia que permite comprobarlo.",
              "Con base y meta: tiene un punto de partida (línea de base) y un punto de llegada (meta).",
            ],
            texto: ["Si falta una de estas cuatro, el indicador queda débil y un evaluador lo va a notar de inmediato."],
          },
          {
            titulo: "Específico y medible",
            ejemplo: "Vago: \"Mejora en el empleo juvenil\" (no dice quiénes, cuántos, ni en qué condiciones). Específico: \"Porcentaje de jóvenes entre 18 y 28 años que acceden a empleo formal al finalizar el proyecto\". Medible: \"175 de 250 jóvenes\" o \"70%\" sí son medibles; \"muchos jóvenes\" o \"bastante progreso\" no lo son.",
          },
          {
            titulo: "Verificable: la prueba que lo sostiene",
            texto: ["Un indicador es verificable cuando existe una fuente concreta de evidencia que permite comprobar su valor de forma objetiva. Sin medio de verificación, el indicador es solo una promesa."],
            puntos: ["Contratos firmados", "Certificados emitidos por instituciones reconocidas", "Registros de asistencia", "Bases de datos sistematizadas", "Encuestas aplicadas con metodología definida"],
          },
          {
            titulo: "Tipos de indicadores: la cadena del proyecto",
            texto: ["Cada tipo de indicador corresponde a un nivel diferente de la cadena lógica del proyecto."],
            puntos: [
              "De proceso: ¿hicimos lo planeado? Miden el avance de las actividades. Sirven para seguimiento, pero no prueban cambio real.",
              "De producto: ¿entregamos lo prometido? Miden los entregables concretos.",
              "De resultado: miden los cambios en las personas beneficiarias. Son los más valorados porque muestran cambio real y demostrable.",
              "De impacto: miden cambios más amplios en el territorio o la sociedad, generalmente a largo plazo. El proyecto contribuye, pero no lo controla por completo.",
            ],
          },
          {
            titulo: "Fórmula práctica para redactar un indicador",
            puntos: [
              "Unidad de medida: %, número, proporción, promedio.",
              "Objeto medido: ¿qué se mide exactamente?",
              "Grupo de referencia: ¿en quiénes se mide?",
              "Condición: criterio que debe cumplirse.",
              "Período: ¿cuándo se mide?",
            ],
            ejemplo: "\"Porcentaje de los 250 jóvenes participantes que acceden a empleo formal con contrato en logística o tecnología, al finalizar el mes 18.\"",
          },
        ],
      },
      {
        letra: "b",
        titulo: "Línea de base, meta y medios de verificación",
        diapositivas: [
          {
            titulo: "Línea de base y meta: el antes y el después",
            texto: [
              "Todo indicador necesita dos puntos de referencia: de dónde partimos y adónde queremos llegar. Sin ellos, es imposible saber si hubo avance real.",
            ],
            puntos: [
              "Línea de base: cómo estaba la situación antes del proyecto — si existe medición previa se usa ese dato; si no, el equipo mide al inicio; si el fenómeno aún no existe, puede ser cero.",
              "Meta: a dónde queremos llegar al finalizar — ambiciosa pero alcanzable, realista según el contexto, con plazo claro.",
            ],
            ejemplo: "Línea de base: 0 jóvenes con empleo formal al inicio. Meta: 70% = 175 jóvenes al mes 18.",
          },
          {
            titulo: "Medios de verificación: la prueba del indicador",
            texto: [
              "Definir un indicador no basta: hay que demostrar cómo se va a comprobar su valor. El medio de verificación es el documento, registro o fuente de datos que acredita el indicador de forma objetiva e independiente. Sin medio de verificación, el indicador es solo una promesa.",
            ],
            puntos: ["Contratos y convenios", "Certificados y diplomas", "Encuestas y evaluaciones con metodología definida", "Bases de datos e informes oficiales verificables"],
          },
          {
            titulo: "Un indicador bien formulado, completo",
            ejemplo: "Resultado esperado: al menos el 70% de los jóvenes participantes accede a empleo formal al finalizar el proyecto. Indicador: porcentaje de los 250 jóvenes participantes que acrediten contrato de trabajo formal en sectores de logística o tecnología, con vigencia mínima de 3 meses, al finalizar el mes 18. Línea de base: 0. Meta: 70% (175). Medio de verificación: contratos firmados y base de datos del proyecto. Frecuencia: medición final al mes 18, seguimiento parcial al mes 9.",
          },
          {
            titulo: "La matriz de indicadores",
            texto: [
              "En la práctica, los indicadores se organizan en una matriz de seguimiento: la columna vertebral del sistema de monitoreo. Cada fila corresponde a un objetivo o resultado, con su indicador, línea de base, meta, medio de verificación, frecuencia y responsable.",
              "Completar esta matriz desde el diseño del proyecto facilita el seguimiento, los informes y la evaluación final.",
            ],
          },
          {
            titulo: "Errores que debilitan una propuesta",
            puntos: [
              "Indicador sin número: \"mejorar la calidad de vida\" es un deseo, no un indicador.",
              "Sin línea de base: si no sabes de dónde partiste, no puedes demostrar que avanzaste.",
              "Meta sin fundamento: \"100% de los participantes\" puede ser irreal e indefendible.",
              "Medio de verificación genérico: \"informes del proyecto\" no sustituye la evidencia directa.",
              "Depender solo de indicadores de proceso.",
              "Demasiados indicadores: pocos bien formulados valen más que muchos débiles.",
            ],
          },
          {
            titulo: "Ejercicio: construye tu indicador",
            checklist: [
              "¿Qué se mide?",
              "¿En quién?",
              "¿En qué unidad?",
              "¿En qué plazo?",
              "¿Con qué evidencia?",
            ],
            texto: ["Indicador + meta + evidencia = credibilidad."],
          },
        ],
      },
    ],
  },
  {
    id: "tema-6",
    numero: 6,
    titulo: "Actividades, cronograma, equipo, presupuesto y sostenibilidad",
    subtitulo: "Del objetivo a la ejecución real, con números y con quién",
    partes: [
      {
        letra: "a",
        titulo: "Actividades, cronograma y equipo",
        diapositivas: [
          {
            titulo: "¿Cómo se vuelve ejecutable un proyecto?",
            texto: [
              "Un proyecto se vuelve ejecutable cuando traduce sus objetivos en actividades concretas, las organiza en el tiempo con un cronograma, y define quién será responsable de cada una. Sin estas tres piezas, el proyecto existe solo en el papel.",
            ],
          },
          {
            titulo: "Actividad: la acción concreta del proyecto",
            texto: [
              "Es una acción específica que el equipo ejecuta para avanzar hacia un objetivo. Si el objetivo es el cambio que buscamos, la actividad es el trabajo concreto que hacemos para acercarnos a ese cambio.",
            ],
            puntos: ["Se puede ejecutar", "Se puede medir", "Tiene un inicio y un fin", "La realiza alguien del equipo"],
          },
          {
            titulo: "No confundamos cambio con acción",
            ejemplo: "Objetivo específico: \"Fortalecer las competencias técnicas de 250 jóvenes de la región\" (el para qué). Actividades: \"Diseñar módulos, convocar participantes y realizar 12 talleres de formación técnica\" (el qué hacemos, paso a paso).",
          },
          {
            titulo: "Las actividades nacen de los objetivos específicos",
            texto: [
              "Cada objetivo específico se traduce en varias actividades concretas. Esta desagregación garantiza que ningún objetivo quede solo como una buena intención.",
            ],
          },
          {
            titulo: "Características de una buena actividad",
            puntos: ["Concreta: una acción específica, no una intención vaga.", "Ejecutable con los recursos disponibles.", "Con responsable asignado.", "Con tiempo definido en el cronograma.", "Vinculada a un objetivo específico."],
          },
          {
            titulo: "Cronograma: el calendario del proyecto",
            texto: [
              "Organiza las actividades en el tiempo y muestra cuándo debe ocurrir cada una. No es una lista de fechas sueltas: es la ruta temporal de ejecución, con secuencia, duración y relación entre actividades.",
            ],
            puntos: ["Ordenar la ejecución", "Evitar la improvisación", "Coordinar al equipo en el tiempo", "Hacer seguimiento al avance", "Detectar retrasos a tiempo"],
          },
          {
            titulo: "Errores frecuentes en los cronogramas",
            puntos: [
              "Agrupar todas las actividades en el primer mes.",
              "No reservar tiempo para monitorear el avance.",
              "Olvidar incluir el cierre y la evaluación final.",
              "Ignorar las dependencias entre actividades.",
            ],
          },
          {
            titulo: "El equipo: las personas que hacen posible la ejecución",
            texto: [
              "Es el conjunto de roles necesarios para ejecutar, coordinar, monitorear y apoyar todas las actividades. Primero se define el rol; después se busca la persona adecuada.",
            ],
            puntos: ["Coordinador/a del proyecto", "Profesional técnico/a", "Monitor/a de seguimiento", "Asistente administrativo/a", "Facilitador/a comunitario/a"],
          },
          {
            titulo: "Cada actividad necesita responsable",
            texto: ["Si una actividad no tiene responsable, nadie sabe quién debe hacerla y el riesgo de que no ocurra aumenta mucho."],
            checklist: [
              "Nombre claro de la actividad",
              "Objetivo al que contribuye",
              "Tiempo en el cronograma",
              "Rol responsable de ejecutarla",
              "Producto o entregable esperado",
            ],
          },
        ],
      },
      {
        letra: "b",
        titulo: "Presupuesto y sostenibilidad",
        diapositivas: [
          {
            titulo: "Presupuesto: ponerle valor a lo que prometemos",
            texto: [
              "Es la estimación detallada de los recursos económicos que el proyecto necesita para ejecutar sus actividades y alcanzar sus resultados. Es la traducción financiera del proyecto completo: si algo no está en el presupuesto, financieramente no existe.",
            ],
          },
          {
            titulo: "Funciones del presupuesto",
            puntos: [
              "Demuestra viabilidad financiera.",
              "Evidencia eficiencia: cada peso bien pensado y justificado.",
              "Muestra coherencia interna entre el plan operativo y el presupuesto.",
              "Sustenta la contrapartida de la organización ejecutora.",
            ],
          },
          {
            titulo: "Rubros: las categorías del gasto",
            texto: [
              "Un rubro agrupa costos del mismo tipo, para que el presupuesto sea fácil de leer y verificar.",
              "Cada rubro debe corresponder a actividades reales del plan operativo.",
            ],
            puntos: ["Personal", "Equipos y materiales", "Servicios contratados", "Comunicaciones y tecnología", "Administración", "Imprevistos"],
          },
          {
            titulo: "Personal: casi siempre el mayor costo",
            texto: [
              "El personal suele representar entre el 40% y el 65% del presupuesto total en proyectos sociales y de formación. Incluye honorarios o salarios, el porcentaje de dedicación al proyecto, los meses de vinculación y, si aplica contrato laboral, las prestaciones sociales.",
            ],
            ejemplo: "Fórmula: valor mensual × % de dedicación × número de meses = costo total por persona.",
          },
          {
            titulo: "Costos directos e indirectos",
            texto: [
              "El costo directo se puede atribuir a una actividad específica (honorario del instructor, materiales de talleres). El costo indirecto sostiene el proyecto en general, pero no corresponde a una sola actividad (arriendo de oficina, contabilidad, internet del equipo administrativo).",
              "Pregunta guía: si esta actividad no existiera, ¿este costo también existiría? Si la respuesta es no, es directo; si es sí, es indirecto.",
            ],
          },
          {
            titulo: "Imprevistos y contrapartida",
            texto: [
              "Los imprevistos son una reserva razonable —muchos financiadores permiten entre 3% y 5% del subtotal— para cubrir costos no previstos pero necesarios. Nunca deben usarse para esconder un colchón inflando otros rubros.",
              "La contrapartida es el aporte que hace la organización ejecutora además de lo que solicita al financiador: en dinero, en tiempo de personal propio, en uso de instalaciones o equipos, o en servicios y conocimiento aportado.",
            ],
          },
          {
            titulo: "Valor estratégico de la contrapartida",
            puntos: [
              "Demuestra compromiso institucional.",
              "Reduce el riesgo percibido por el financiador.",
              "Distribuye el costo total entre más actores.",
              "Puede ser una ventaja competitiva frente a otras propuestas.",
            ],
          },
          {
            titulo: "Costo por beneficiario y errores frecuentes",
            texto: ["El costo por beneficiario se calcula dividiendo el presupuesto total entre el número de beneficiarios directos, y conviene compararlo con referentes similares para saber si es razonable."],
            puntos: [
              "Subestimar costos para parecer más barato.",
              "Olvidar costos indirectos.",
              "Rubros sin actividad asociada, o actividades sin costo asignado.",
              "No incluir impuestos o prestaciones cuando aplica.",
            ],
          },
          {
            titulo: "La pregunta de fondo: ¿qué queda cuando se acaba el dinero?",
            texto: [
              "La sostenibilidad es la capacidad del proyecto de mantener sus efectos, logros o servicios después de que termine el financiamiento externo. Un proyecto que termina cuando se acaba el dinero genera cambios temporales, no transformaciones reales.",
            ],
          },
          {
            titulo: "Los cuatro tipos de sostenibilidad",
            puntos: [
              "Financiera: existe una fuente de recursos para mantener los resultados.",
              "Institucional: una institución adopta el proyecto o sus resultados de forma permanente.",
              "Comunitaria: la comunidad se apropia del proceso y lo lidera sin depender del equipo externo.",
              "De política pública: el modelo influye en normas, programas o decisiones públicas de mayor alcance.",
            ],
          },
          {
            titulo: "La sostenibilidad no se inventa: se demuestra",
            texto: ["Una buena sección de sostenibilidad incluye riesgos de continuidad identificados, mecanismos concretos de mantenimiento, aliados comprometidos formalmente y una estrategia realista de continuidad."],
            ejemplo: "En vez de escribir solo \"el proyecto será sostenible\", es mucho más sólido decir: una entidad aliada asume el servicio como parte permanente de su oferta, otra institución adopta el modelo formativo en su programa oficial, y se forman gestores comunitarios entre los propios beneficiarios.",
          },
          {
            titulo: "Antes de cerrar una propuesta, revisa esto",
            checklist: [
              "¿Cada actividad tiene costo asignado?",
              "¿Cada costo tiene justificación clara?",
              "¿Los valores vienen de precios reales del mercado?",
              "¿El costo por beneficiario es razonable y comparable?",
              "¿Hay contrapartida identificada y valorada?",
              "¿La sostenibilidad tiene un mecanismo concreto?",
            ],
          },
        ],
      },
    ],
  },
];
