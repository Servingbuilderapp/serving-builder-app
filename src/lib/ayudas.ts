/**
 * AYUDAS — los textos que aparecen al pasar el cursor (o tocar el "?") sobre un título.
 * Cada ayuda explica tres cosas: qué es, para quién sirve y qué obtienes.
 *
 * Para cambiar un texto, se edita solo este archivo. La clave de cada ayuda es,
 * en el website, la misma clave del título (por ejemplo 'w.escalera.membresia1.titulo')
 * y, en el panel, un nombre propio (por ejemplo 'panel.mis_proyectos').
 * Idiomas: español e inglés. Quien navega en cualquier otro idioma ve la ayuda en inglés.
 * Regla del website: aquí no van precios, solo descriptores.
 */

export type TextoAyuda = {
  queEs: string
  paraQuien: string
  queObtienes: string
}

export type Ayuda = { es: TextoAyuda; en: TextoAyuda }

export const AYUDAS: Record<string, Ayuda> = {
  // ───────────── WEBSITE: servicios y membresías ─────────────
  'w.escalera.diagnostico.titulo': {
    es: {
      queEs: 'Un análisis inicial de tu idea o proyecto, sin costo.',
      paraQuien: 'Cualquier persona que tenga una idea y quiera saber si tiene potencial antes de invertir tiempo o dinero.',
      queObtienes: 'Un análisis con los nichos y oportunidades que vemos, las brechas por cerrar y recomendaciones para el siguiente paso, incluida la modalidad que mejor encaja con tu momento.',
    },
    en: {
      queEs: 'An initial analysis of your idea or project, free of charge.',
      paraQuien: 'Anyone with an idea who wants to know whether it has potential before investing time or money.',
      queObtienes: 'An analysis of the niches and opportunities we see, the gaps to close and recommendations for your next step, including the option that best fits where you are.',
    },
  },
  'w.escalera.membresia1.titulo': {
    es: {
      queEs: 'Una suscripción mensual o anual para que estructures tus propios proyectos y busques fondos con nuestras herramientas, sin contratar un servicio completo.',
      paraQuien: 'Personas, emprendedores y organizaciones que están empezando y quieren convertir una idea en un proyecto listo para postular.',
      queObtienes: 'Puedes estructurar hasta 12 proyectos al año (1 al mes), mientras estés al día con tus pagos. Cuando terminas uno, nuestro equipo te ayuda a postularlo a la convocatoria que elijas. Además tienes la App de Ideas, la lista de fondos con su buscador, el calendario de convocatorias y Centinela Digital. Si ganas, el 10 % es para Serving.',
    },
    en: {
      queEs: 'A monthly or yearly subscription to structure your own projects and search for funding with our tools, without hiring a full service.',
      paraQuien: 'Individuals, entrepreneurs and organizations that are just starting out and want to turn an idea into a project ready to apply.',
      queObtienes: 'You can structure up to 12 projects a year (1 per month) while your payments are up to date. When you finish one, our team helps you apply to the call you choose. You also get the Ideas App, the funding list with its search tool, the calls calendar and Centinela Digital. If you win, 10% goes to Serving.',
    },
  },
  'w.escalera.membresia2.titulo': {
    es: {
      queEs: 'La membresía para quien ya tiene más de un proyecto en marcha y quiere avanzar con apoyo en grupo.',
      paraQuien: 'Quienes manejan varias ideas o proyectos a la vez y quieren resolver dudas con el equipo y con otros miembros.',
      queObtienes: 'Todo lo de Explorador, pero con hasta 24 proyectos al año (2 al mes), mientras estés al día con tus pagos, y nuestro equipo te ayuda a postular cada uno. Además, 1 sesión grupal al mes. Si ganas, el 10 % es para Serving.',
    },
    en: {
      queEs: 'The membership for people who already have more than one project underway and want to move forward with group support.',
      paraQuien: 'Those who handle several ideas or projects at once and want to solve questions with our team and other members.',
      queObtienes: 'Everything in Explorer, with up to 24 projects a year (2 per month) while your payments are up to date, and our team helps you apply with each one. Plus 1 group session a month. If you win, 10% goes to Serving.',
    },
  },
  'w.escalera.membresia3.titulo': {
    es: {
      queEs: 'La membresía más completa: más proyectos, más sesiones y acompañamiento cercano del equipo.',
      paraQuien: 'Quienes quieren sacar adelante varios proyectos con constancia y prefieren no estar solos en el camino.',
      queObtienes: 'Todo lo de Constructor, con hasta 36 proyectos al año (3 al mes), mientras estés al día con tus pagos, y nuestro equipo te ayuda a postular cada uno. Además, 2 sesiones grupales al mes, acceso a la comunidad y un acompañamiento cada semana. Si ganas, el 10 % es para Serving.',
    },
    en: {
      queEs: 'The most complete membership: more projects, more sessions and close support from our team.',
      paraQuien: 'Those who want to move several projects forward consistently and prefer not to walk the path alone.',
      queObtienes: 'Everything in Builder, with up to 36 projects a year (3 per month) while your payments are up to date, and our team helps you apply with each one. Plus 2 group sessions a month, access to the community and a weekly check-in with our team. If you win, 10% goes to Serving.',
    },
  },
  'w.escalera.academia.titulo': {
    es: {
      queEs: 'Un curso completo para aprender a estructurar proyectos de financiación con una metodología paso a paso.',
      paraQuien: 'Quien quiere aprender a hacerlo por su cuenta y seguir haciéndolo en el futuro, sin depender de nadie.',
      queObtienes: 'La metodología explicada paso a paso, plantillas y ejemplos para practicar, y una certificación al terminar.',
    },
    en: {
      queEs: 'A complete course on how to structure funding projects using a step-by-step method.',
      paraQuien: 'Anyone who wants to learn to do it on their own and keep doing it in the future, without depending on anyone.',
      queObtienes: 'The method explained step by step, templates and examples to practice with, and a certificate when you finish.',
    },
  },
  'w.escalera.mentoria.titulo': {
    es: {
      queEs: 'Estructuramos tu proyecto contigo, durante un mes de acompañamiento personalizado.',
      paraQuien: 'Quien quiere avanzar con un experto al lado: aprender haciendo, sin hacerlo solo y sin dejarlo todo en manos de otros.',
      queObtienes: 'Un mes de acompañamiento, trabajo personalizado sobre una convocatoria y hasta 2 réplicas de tu proyecto en 6 meses.',
    },
    en: {
      queEs: 'We structure your project together with you, over one month of personalized support.',
      paraQuien: 'Anyone who wants to move forward with an expert by their side: learning by doing, without going it alone and without handing everything over.',
      queObtienes: 'One month of support, personalized work on one funding call, and up to 2 replicas of your project within 6 months.',
    },
  },
  'w.escalera.estructuracion.titulo': {
    es: {
      queEs: 'Un servicio integral en el que Serving estructura tu proyecto de principio a fin.',
      paraQuien: 'Quien no tiene el tiempo o la experiencia para formular, o quiere un proyecto de la mejor calidad para una convocatoria importante.',
      queObtienes: 'Formulación completa, dos modalidades para elegir, búsqueda de convocatorias incluida, y contrato con firma electrónica. Las condiciones y los valores los ves al contratar.',
    },
    en: {
      queEs: 'A full service in which Serving structures your project from start to finish.',
      paraQuien: 'Anyone who lacks the time or experience to write a proposal, or who wants the best possible project for an important call.',
      queObtienes: 'Complete project writing, two options to choose from, funding call search included, and a contract with electronic signature. Terms and prices are shown when you hire.',
    },
  },
  'w.escalera.replicas.titulo': {
    es: {
      queEs: 'Tomamos un proyecto que ya está estructurado y lo adaptamos a nuevas convocatorias, territorios o temáticas.',
      paraQuien: 'Quien ya tiene un proyecto sólido y quiere aprovecharlo en más oportunidades, sin empezar de cero cada vez.',
      queObtienes: 'La adaptación del proyecto a cada nueva oportunidad, para multiplicar tus postulaciones. El valor depende de cada caso.',
    },
    en: {
      queEs: 'We take a project that is already structured and adapt it to new calls, territories or themes.',
      paraQuien: 'Anyone who already has a solid project and wants to use it in more opportunities, without starting from scratch each time.',
      queObtienes: 'The project adapted to each new opportunity, to multiply your applications. The price depends on each case.',
    },
  },
  'w.escalera.fondoemprender.titulo': {
    es: {
      queEs: 'Te acompañamos en toda la ruta para postular a Fondo Emprender, el capital semilla para emprendimientos en Colombia.',
      paraQuien: 'Emprendedores que tienen una idea de negocio y buscan capital semilla para arrancar.',
      queObtienes: 'Capacitación previa de Serving, formulación completa de tu plan de negocio, acompañamiento en la postulación y preparación de tu pitch.',
    },
    en: {
      queEs: 'We guide you through the whole route to apply to Fondo Emprender, seed capital for new businesses in Colombia.',
      paraQuien: 'Entrepreneurs with a business idea who are looking for seed capital to get started.',
      queObtienes: 'Preparatory training from Serving, full writing of your business plan, support during your application and preparation for your pitch.',
    },
  },

  // ───────────── WEBSITE: las tres formas de trabajar ─────────────
  'w.nav.inicio': {
    es: {
      queEs: 'La portada de Arquitectura Digital.',
      paraQuien: 'Quien llega por primera vez.',
      queObtienes: 'Un resumen de lo que hacemos y el camino hacia la financiación de tu proyecto.',
    },
    en: {
      queEs: 'The Arquitectura Digital home page.',
      paraQuien: 'Anyone visiting for the first time.',
      queObtienes: 'A summary of what we do and the path to funding your project.',
    },
  },
  'w.nav.servicios': {
    es: {
      queEs: 'Nuestros planes y servicios, organizados según cuánto quieres hacer tú.',
      paraQuien: 'Quien quiere comparar opciones antes de decidir.',
      queObtienes: 'Diagnóstico gratuito, Academia, membresías, Mentoría, Estructuración, Réplicas y Fondo Emprender, cada uno explicado.',
    },
    en: {
      queEs: 'Our plans and services, organized by how much you want to do yourself.',
      paraQuien: 'Anyone who wants to compare options before deciding.',
      queObtienes: 'Free diagnosis, Academy, memberships, Mentoring, Structuring, Replicas and Fondo Emprender, each explained.',
    },
  },
  'w.nav.que_hacemos': {
    es: {
      queEs: 'El recorrido completo que acompañamos: desde la idea hasta la postulación.',
      paraQuien: 'Quien quiere entender qué hace Serving por su proyecto.',
      queObtienes: 'Una vista paso a paso del camino. Nuestro servicio llega hasta la postulación; la decisión final siempre es de quien convoca.',
    },
    en: {
      queEs: 'The whole journey we support: from the idea to the application.',
      paraQuien: 'Anyone who wants to understand what Serving does for their project.',
      queObtienes: 'A step-by-step view of the path. Our service goes up to the application; the final decision always belongs to the funder.',
    },
  },
  'w.nav.como_funciona': {
    es: {
      queEs: 'La forma de trabajar de Serving: rapidez, más oportunidades y más tiempo para postular.',
      paraQuien: 'Quien quiere saber por qué este método funciona.',
      queObtienes: 'Entiendes qué hace distinto el proceso y qué puedes esperar de él.',
    },
    en: {
      queEs: 'How Serving works: speed, more opportunities and more time to apply.',
      paraQuien: 'Anyone who wants to know why this method works.',
      queObtienes: 'You understand what makes the process different and what to expect from it.',
    },
  },
  'w.nav.recursos': {
    es: {
      queEs: 'Las preguntas frecuentes sobre el proceso, las convocatorias y los servicios.',
      paraQuien: 'Quien tiene dudas antes de empezar.',
      queObtienes: 'Respuestas claras a lo que más nos preguntan.',
    },
    en: {
      queEs: 'Frequently asked questions about the process, funding calls and services.',
      paraQuien: 'Anyone with doubts before starting.',
      queObtienes: 'Clear answers to what people ask us most.',
    },
  },
  'w.nav.trabaja': {
    es: {
      queEs: 'La sección para quienes quieren aliarse con Serving.',
      paraQuien: 'Organizaciones con marca propia, personas que conocen proyectos y quienes prefieren vender.',
      queObtienes: 'Las tres formas de construir con nosotros: marca blanca, referidor y comercial, cada una con sus condiciones.',
    },
    en: {
      queEs: 'The section for those who want to partner with Serving.',
      paraQuien: 'Organizations with their own brand, people who know projects and those who prefer to sell.',
      queObtienes: 'The three ways to build with us: white label, referrer and sales agent, each with its own terms.',
    },
  },
  'w.valor.rapidez.titulo': {
    es: {
      queEs: 'Tu proyecto queda formulado y listo para presentarse en mucho menos tiempo.',
      paraQuien: 'Quien no quiere perder meses armando su proyecto.',
      queObtienes: 'Un proceso estructurado, apoyado con herramientas digitales e inteligencia artificial.',
    },
    en: {
      queEs: 'Your project is written up and ready to present in much less time.',
      paraQuien: 'Anyone who does not want to lose months putting a project together.',
      queObtienes: 'A structured process supported by digital tools and artificial intelligence.',
    },
  },
  'w.valor.volumen.titulo': {
    es: {
      queEs: 'No dependes de una sola convocatoria: buscamos y analizamos oportunidades de forma continua.',
      paraQuien: 'Quien no quiere apostarle todo a una sola puerta.',
      queObtienes: 'Tu proyecto tiene varias oportunidades por dónde entrar.',
    },
    en: {
      queEs: 'You do not depend on a single call: we search and analyze opportunities continuously.',
      paraQuien: 'Anyone who does not want to bet everything on one door.',
      queObtienes: 'Your project has several opportunities to enter through.',
    },
  },
  'w.valor.personas.titulo': {
    es: {
      queEs: 'El acompañamiento no se agota en una sola presentación.',
      paraQuien: 'Quien necesita tiempo real para postular con calma.',
      queObtienes: 'Según la modalidad, entre tres y seis meses de búsqueda activa. En Fondo Emprender y en las réplicas el período es de un mes.',
    },
    en: {
      queEs: 'The support does not end with a single submission.',
      paraQuien: 'Anyone who needs real time to apply without rushing.',
      queObtienes: 'Depending on the option, three to six months of active searching. For Fondo Emprender and replicas the period is one month.',
    },
  },
  'w.planes.g1.titulo': {
    es: {
      queEs: 'Tú construyes tu propio proyecto, con nuestras herramientas y nuestra formación.',
      paraQuien: 'Quien quiere aprender y hacerlo por sí mismo, a su ritmo.',
      queObtienes: 'Aquí están la Academia y las membresías: aprendes el método y estructuras tus proyectos con apoyo de la plataforma.',
    },
    en: {
      queEs: 'You build your own project, using our tools and training.',
      paraQuien: 'Anyone who wants to learn and do it themselves, at their own pace.',
      queObtienes: 'Here you will find the Academy and the memberships: you learn the method and structure your projects with the platform’s support.',
    },
  },
  'w.planes.g2.titulo': {
    es: {
      queEs: 'El equipo de Serving trabaja a tu lado durante un mes.',
      paraQuien: 'Quien quiere avanzar con acompañamiento experto, participando en cada decisión de su proyecto.',
      queObtienes: 'Aquí está la Mentoría: trabajo personalizado, paso a paso, hasta dejar tu proyecto listo.',
    },
    en: {
      queEs: 'The Serving team works side by side with you for one month.',
      paraQuien: 'Anyone who wants expert support while taking part in every decision about their project.',
      queObtienes: 'Here you will find Mentoring: personalized, step-by-step work until your project is ready.',
    },
  },
  'w.planes.g3.titulo': {
    es: {
      queEs: 'Nosotros estructuramos tu proyecto y lo llevamos hacia las convocatorias.',
      paraQuien: 'Quien prefiere delegar el trabajo técnico y concentrarse en su propia labor.',
      queObtienes: 'Aquí están la Estructuración profesional, las Réplicas y la ruta de Fondo Emprender.',
    },
    en: {
      queEs: 'We structure your project and take it to the funding calls.',
      paraQuien: 'Anyone who prefers to delegate the technical work and focus on their own mission.',
      queObtienes: 'Here you will find Professional Structuring, Replicas and the Fondo Emprender route.',
    },
  },

  // ───────────── WEBSITE: trabaja con nosotros ─────────────
  'w.trabaja.marcablanca.titulo': {
    es: {
      queEs: 'Usas el motor de estructuración de Arquitectura Digital con tu propio logo y tus propios colores, para ofrecérselo a tus clientes.',
      paraQuien: 'Organizaciones con marca propia y clientes que necesitan proyectos: una “fábrica de proyectos” que estructura para otros.',
      queObtienes: 'Diagnóstico, estructuración, búsqueda de convocatorias y postulación con tu marca puesta encima. Tú decides a quién se lo ofreces; nosotros hacemos el trabajo técnico. Las condiciones se conversan caso por caso.',
    },
    en: {
      queEs: 'You use the Arquitectura Digital structuring engine with your own logo and colors, and offer it to your clients.',
      paraQuien: 'Organizations with their own brand and clients who need projects: a “project factory” that structures projects for others.',
      queObtienes: 'Diagnosis, structuring, funding call search and application, with your brand on top. You decide who to offer it to; we do the technical work. Terms are discussed case by case.',
    },
  },
  'w.trabaja.referidor.titulo': {
    es: {
      queEs: 'Nos presentas a alguien con un proyecto o una idea, y nosotros hacemos toda la venta.',
      paraQuien: 'Quien conoce personas con proyectos pero no quiere dedicarse a vender.',
      queObtienes: 'Ganas el 10 % cuando esa persona contrata.',
    },
    en: {
      queEs: 'You introduce us to someone with a project or idea, and we handle the whole sale.',
      paraQuien: 'Anyone who knows people with projects but does not want to spend time selling.',
      queObtienes: 'You earn 10% when that person signs up.',
    },
  },
  'w.trabaja.comercial.titulo': {
    es: {
      queEs: 'Tú mismo presentas el servicio, resuelves dudas y cierras el contrato.',
      paraQuien: 'Quien prefiere llevar la venta completa, de principio a fin.',
      queObtienes: 'Ganas el 30 % cuando la persona contrata.',
    },
    en: {
      queEs: 'You present the service yourself, answer questions and close the contract.',
      paraQuien: 'Anyone who prefers to handle the whole sale from start to finish.',
      queObtienes: 'You earn 30% when the person signs up.',
    },
  },

  // ───────────── PANEL DEL CLIENTE ─────────────
  'panel.resumen': {
    es: {
      queEs: 'Tu pantalla de inicio: un vistazo general a tu cuenta.',
      paraQuien: 'Todos los usuarios.',
      queObtienes: 'Ves cómo va tu proyecto y a dónde ir después, sin tener que buscar.',
    },
    en: {
      queEs: 'Your home screen: a quick overview of your account.',
      paraQuien: 'All users.',
      queObtienes: 'You see how your project is doing and where to go next, without having to search.',
    },
  },
  'panel.avance': {
    es: {
      queEs: 'El seguimiento de la estructuración de tu proyecto contratado.',
      paraQuien: 'Clientes que contrataron la Estructuración profesional.',
      queObtienes: 'Ves paso a paso cómo avanza tu proyecto, en tiempo real, y lo que ya está listo.',
    },
    en: {
      queEs: 'Tracking of the structuring of your hired project.',
      paraQuien: 'Clients who hired Professional Structuring.',
      queObtienes: 'You see your project advance step by step, in real time, and what is already done.',
    },
  },
  'panel.calificacion': {
    es: {
      queEs: 'Una evaluación de qué tan bien podría calificar tu proyecto, antes de postularlo.',
      paraQuien: 'Clientes con un proyecto estructurado por Serving.',
      queObtienes: 'Un puntaje y las debilidades que conviene corregir, para llegar a la convocatoria con el mejor proyecto posible.',
    },
    en: {
      queEs: 'An evaluation of how well your project could score before you apply.',
      paraQuien: 'Clients with a project structured by Serving.',
      queObtienes: 'A score and the weaknesses worth fixing, so you reach the call with the best project possible.',
    },
  },
  'panel.pendientes': {
    es: {
      queEs: 'Lo que el equipo necesita de ti para seguir avanzando.',
      paraQuien: 'Clientes con un proyecto en marcha.',
      queObtienes: 'Preguntas, datos o documentos pendientes. Cuando los respondes, tu proyecto sigue su camino sin demoras.',
    },
    en: {
      queEs: 'What the team needs from you to keep moving.',
      paraQuien: 'Clients with a project underway.',
      queObtienes: 'Pending questions, data or documents. When you answer them, your project keeps moving without delays.',
    },
  },
  'panel.documentos': {
    es: {
      queEs: 'Todos los documentos de tu proyecto, en un solo lugar.',
      paraQuien: 'Clientes con un proyecto en marcha.',
      queObtienes: 'Puedes revisarlos y descargarlos cuando los necesites.',
    },
    en: {
      queEs: 'All the documents of your project, in one place.',
      paraQuien: 'Clients with a project underway.',
      queObtienes: 'You can review and download them whenever you need.',
    },
  },
  'panel.mis_convocatorias': {
    es: {
      queEs: 'Las convocatorias que encajan con tu proyecto y el estado de cada postulación.',
      paraQuien: 'Clientes con un proyecto estructurado.',
      queObtienes: 'Eliges a cuáles quieres postular y sigues el avance de cada una.',
    },
    en: {
      queEs: 'The funding calls that fit your project and the status of each application.',
      paraQuien: 'Clients with a structured project.',
      queObtienes: 'You choose which ones to apply to and follow the progress of each.',
    },
  },
  'panel.mis_replicas': {
    es: {
      queEs: 'Las adaptaciones de tu proyecto a nuevas convocatorias, territorios o temáticas.',
      paraQuien: 'Clientes que ya tienen un proyecto estructurado y quieren aprovecharlo en más oportunidades.',
      queObtienes: 'Pides una réplica y sigues su avance sin empezar de cero.',
    },
    en: {
      queEs: 'The adaptations of your project to new calls, territories or themes.',
      paraQuien: 'Clients who already have a structured project and want to use it in more opportunities.',
      queObtienes: 'You request a replica and follow its progress without starting from scratch.',
    },
  },
  'panel.ideas': {
    es: {
      queEs: 'Herramientas gratuitas para convertir una idea en un proyecto, con hojas de trabajo y guías.',
      paraQuien: 'Cualquier persona que esté empezando, tenga o no una membresía.',
      queObtienes: 'Tres herramientas propias para pensar tu idea, hojas de trabajo que llenas en pantalla y guías que se leen o se imprimen.',
    },
    en: {
      queEs: 'Free tools to turn an idea into a project, with worksheets and guides.',
      paraQuien: 'Anyone just starting out, with or without a membership.',
      queObtienes: 'Three tools to think through your idea, worksheets you fill in on screen and guides you can read or print.',
    },
  },
  'panel.academia': {
    es: {
      queEs: 'El curso para aprender a estructurar proyectos de financiación.',
      paraQuien: 'Quien quiere aprender el método y hacerlo por sí mismo.',
      queObtienes: 'Lecciones paso a paso, plantillas y ejemplos.',
    },
    en: {
      queEs: 'The course to learn how to structure funding projects.',
      paraQuien: 'Anyone who wants to learn the method and do it themselves.',
      queObtienes: 'Step-by-step lessons, templates and examples.',
    },
  },
  'panel.mi_membresia': {
    es: {
      queEs: 'Tu nivel de membresía, hasta cuándo está activa y cuánto te queda este mes.',
      paraQuien: 'Miembros Explorador, Constructor y Arquitecto.',
      queObtienes: 'Ves tus cupos del mes, la fecha de vencimiento y cómo renovar. Mientras estés al día con tus pagos, tus beneficios siguen activos.',
    },
    en: {
      queEs: 'Your membership level, until when it is active and what you have left this month.',
      paraQuien: 'Explorer, Builder and Architect members.',
      queObtienes: 'You see your monthly allowance, the expiry date and how to renew. While your payments are up to date, your benefits stay active.',
    },
  },
  'panel.convocatorias_mes': {
    es: {
      queEs: 'La lista de convocatorias de la biblioteca, ordenada por estado: próximas a cerrar, abiertas, abiertas todo el año y próximas a abrir.',
      paraQuien: 'Miembros que quieren ver qué hay disponible ahora.',
      queObtienes: 'Abres la ficha completa de cada convocatoria: monto, requisitos, cómo se postula y el enlace oficial.',
    },
    en: {
      queEs: 'The list of calls in the library, sorted by status: closing soon, open, open all year and opening soon.',
      paraQuien: 'Members who want to see what is available right now.',
      queObtienes: 'You open the full record of each call: amount, requirements, how to apply and the official link.',
    },
  },
  'panel.buscar_fondos': {
    es: {
      queEs: 'El buscador de fondos: encuentras convocatorias de toda la biblioteca.',
      paraQuien: 'Miembros que buscan una oportunidad concreta para su proyecto.',
      queObtienes: 'Filtras por palabra, país, sector, tipo de financiador y estado, y ves los detalles de cada convocatoria.',
    },
    en: {
      queEs: 'The funding search tool: find calls across the whole library.',
      paraQuien: 'Members looking for a specific opportunity for their project.',
      queObtienes: 'You filter by keyword, country, sector, funder type and status, and see the details of each call.',
    },
  },
  'panel.calendario': {
    es: {
      queEs: 'Un calendario de los próximos 12 meses con lo que cierra en cada uno.',
      paraQuien: 'Miembros que quieren planear con tiempo.',
      queObtienes: 'Ves los cierres mes a mes, las convocatorias abiertas todo el año y las que suelen abrir en ciertos meses, para anticiparte.',
    },
    en: {
      queEs: 'A calendar of the next 12 months showing what closes in each one.',
      paraQuien: 'Members who want to plan ahead.',
      queObtienes: 'You see closings month by month, calls open all year and those that usually open in certain months, so you can get ahead.',
    },
  },
  'panel.mis_proyectos': {
    es: {
      queEs: 'Aquí estructuras tus propios proyectos, paso a paso, con tus propias palabras. Lo que escribes se guarda solo y puedes volver cuando quieras.',
      paraQuien: 'Miembros que quieren hacer su proyecto por su cuenta.',
      queObtienes: 'Cada mes tienes un cupo de proyectos según tu membresía. Cuando terminas uno, eliges una convocatoria de la biblioteca y nuestro equipo te ayuda a postular. Si ganas, el 10 % es para Serving.',
    },
    en: {
      queEs: 'Here you structure your own projects, step by step, in your own words. What you write is saved automatically and you can come back any time.',
      paraQuien: 'Members who want to build their project on their own.',
      queObtienes: 'Each month you have an allowance of projects depending on your membership. When you finish one, you choose a call from the library and our team helps you apply. If you win, 10% goes to Serving.',
    },
  },
  'panel.sesiones': {
    es: {
      queEs: 'Sesiones en vivo en grupo con el equipo de Serving.',
      paraQuien: 'Miembros Constructor y Arquitecto.',
      queObtienes: 'Reservas tu lugar (1 sesión al mes en Constructor, 2 en Arquitecto), resuelves dudas y aprendes de las preguntas de otros miembros.',
    },
    en: {
      queEs: 'Live group sessions with the Serving team.',
      paraQuien: 'Builder and Architect members.',
      queObtienes: 'You reserve your seat (1 session a month in Builder, 2 in Architect), solve questions and learn from other members’ questions.',
    },
  },
  'panel.comunidad': {
    es: {
      queEs: 'El espacio de los miembros Arquitecto para conversar entre sí.',
      paraQuien: 'Miembros Arquitecto.',
      queObtienes: 'Compartes preguntas, avances y aprendizajes, y te nutres de la experiencia de otros.',
    },
    en: {
      queEs: 'The space where Architect members talk to each other.',
      paraQuien: 'Architect members.',
      queObtienes: 'You share questions, progress and lessons, and learn from the experience of others.',
    },
  },
  'panel.acompanamiento': {
    es: {
      queEs: 'Un encuentro cada semana con el equipo de Serving para avanzar en tus proyectos.',
      paraQuien: 'Miembros Arquitecto.',
      queObtienes: 'Cuentas sobre qué quieres hablar, te confirmamos fecha y enlace, y llegas con el tema preparado.',
    },
    en: {
      queEs: 'A weekly meeting with the Serving team to move your projects forward.',
      paraQuien: 'Architect members.',
      queObtienes: 'You tell us what you want to talk about, we confirm date and link, and you arrive with the topic prepared.',
    },
  },

  // ───────────── PANEL DEL EQUIPO ─────────────
  'panel.mi_cortesia': {
    es: {
      queEs: 'Tu invitación para estructurar tu proyecto con Serving sin pagar la estructuración.',
      paraQuien: 'Personas invitadas por Serving o por una organización aliada.',
      queObtienes: 'Lees y aceptas las condiciones, y ves cuántos días te quedan para que Serving busque convocatorias y postule tu proyecto. Solo se cobra una comisión si el proyecto gana.',
    },
    en: {
      queEs: 'Your invitation to have Serving structure your project without paying for the structuring.',
      paraQuien: 'People invited by Serving or by a partner organization.',
      queObtienes: 'You read and accept the conditions and see how many days you have left for Serving to search for calls and apply with your project. A fee is charged only if the project wins.',
    },
  },
  'equipo.cortesias': {
    es: {
      queEs: 'Las invitaciones a proyectos sin costo de estructuración, con comisión de éxito si ganan.',
      paraQuien: 'Equipo de Serving.',
      queObtienes: 'Invitas personas, ves quién aceptó, cuántos días les quedan y cuántas cortesías llevas por organización aliada (Coomeva, Parque Soft…).',
    },
    en: {
      queEs: 'Invitations to projects with no structuring fee, with a success fee if they win.',
      paraQuien: 'Serving team.',
      queObtienes: 'You invite people, see who accepted, how many days they have left and how many courtesies you have per partner organization (Coomeva, Parque Soft…).',
    },
  },
  'equipo.proyectos': {
    es: {
      queEs: 'Todos los proyectos de clientes que Serving está estructurando.',
      paraQuien: 'Equipo de Serving.',
      queObtienes: 'Ves el estado de cada proyecto, confirmas pagos y entras al detalle para hacer seguimiento.',
    },
    en: {
      queEs: 'All the client projects Serving is structuring.',
      paraQuien: 'Serving team.',
      queObtienes: 'You see the status of each project, confirm payments and open the detail to follow up.',
    },
  },
  'equipo.diagnosticos': {
    es: {
      queEs: 'Los diagnósticos gratuitos que ha hecho la gente.',
      paraQuien: 'Equipo de Serving.',
      queObtienes: 'Son tus posibles clientes: ves su puntaje, el plan recomendado y sus datos de contacto.',
    },
    en: {
      queEs: 'The free diagnoses people have completed.',
      paraQuien: 'Serving team.',
      queObtienes: 'These are your potential clients: you see their score, recommended plan and contact details.',
    },
  },
  'equipo.convocatorias': {
    es: {
      queEs: 'La biblioteca de convocatorias, para revisar, filtrar y corregir fichas.',
      paraQuien: 'Equipo de Serving.',
      queObtienes: 'Mantienes al día fechas, montos y requisitos, que son lo que ven los clientes.',
    },
    en: {
      queEs: 'The call library, to review, filter and correct records.',
      paraQuien: 'Serving team.',
      queObtienes: 'You keep dates, amounts and requirements up to date, which is what clients see.',
    },
  },
  'equipo.centinela': {
    es: {
      queEs: 'Centinela Digital: el vigilante que lee las fuentes y detecta convocatorias nuevas.',
      paraQuien: 'Equipo de Serving.',
      queObtienes: 'Ves qué fuentes están conectadas y cuáles todavía faltan, y lanzas la lectura de las que quedan.',
    },
    en: {
      queEs: 'Centinela Digital: the watcher that reads the sources and detects new calls.',
      paraQuien: 'Serving team.',
      queObtienes: 'You see which sources are connected and which are still missing, and launch the reading of the rest.',
    },
  },
  'equipo.membresias': {
    es: {
      queEs: 'Las membresías de todos los clientes.',
      paraQuien: 'Equipo de Serving.',
      queObtienes: 'Confirmas pagos, ves quién está activo o vencido y registras el uso de beneficios.',
    },
    en: {
      queEs: 'The memberships of all clients.',
      paraQuien: 'Serving team.',
      queObtienes: 'You confirm payments, see who is active or expired and record benefit usage.',
    },
  },
  'equipo.servicios_membresia': {
    es: {
      queEs: 'Lo que piden los miembros: postulaciones, acompañamientos, sesiones y comunidad.',
      paraQuien: 'Equipo de Serving.',
      queObtienes: 'Lees el proyecto de cada miembro, cambias el estado de su postulación, agendas encuentros y programas sesiones.',
    },
    en: {
      queEs: 'What members ask for: applications, check-ins, sessions and community.',
      paraQuien: 'Serving team.',
      queObtienes: 'You read each member’s project, change the status of their application, schedule meetings and set up sessions.',
    },
  },
  'equipo.soporte': {
    es: {
      queEs: 'Las consultas y problemas que reportan los usuarios.',
      paraQuien: 'Equipo de Serving.',
      queObtienes: 'Los atiendes desde un solo lugar y no se pierde ninguno.',
    },
    en: {
      queEs: 'The questions and problems users report.',
      paraQuien: 'Serving team.',
      queObtienes: 'You handle them from one place and none get lost.',
    },
  },
  'equipo.motores': {
    es: {
      queEs: 'Los motores de inteligencia artificial que estructuran, buscan y evalúan.',
      paraQuien: 'Equipo de Serving.',
      queObtienes: 'Ves su estado y puedes lanzarlos a mano si hace falta.',
    },
    en: {
      queEs: 'The artificial intelligence engines that structure, search and evaluate.',
      paraQuien: 'Serving team.',
      queObtienes: 'You see their status and can run them manually if needed.',
    },
  },
  'equipo.configuracion': {
    es: {
      queEs: 'Los ajustes generales de la plataforma.',
      paraQuien: 'Equipo de Serving.',
      queObtienes: 'Controlas cómo se comporta la plataforma sin tocar el código.',
    },
    en: {
      queEs: 'The general settings of the platform.',
      paraQuien: 'Serving team.',
      queObtienes: 'You control how the platform behaves without touching the code.',
    },
  },
  'equipo.academia': {
    es: {
      queEs: 'La administración de la Academia.',
      paraQuien: 'Equipo de Serving.',
      queObtienes: 'Gestionas cursos, lecciones y quiénes tienen acceso.',
    },
    en: {
      queEs: 'The administration of the Academy.',
      paraQuien: 'Serving team.',
      queObtienes: 'You manage courses, lessons and who has access.',
    },
  },
  'equipo.marca_blanca': {
    es: {
      queEs: 'Los socios que usan la plataforma con su propia marca.',
      paraQuien: 'Equipo de Serving.',
      queObtienes: 'Ves a cada socio, sus clientes y los proyectos que han estructurado.',
    },
    en: {
      queEs: 'The partners who use the platform under their own brand.',
      paraQuien: 'Serving team.',
      queObtienes: 'You see each partner, their clients and the projects they have structured.',
    },
  },
  'equipo.administracion': {
    es: {
      queEs: 'El panel central de administración.',
      paraQuien: 'Equipo de Serving.',
      queObtienes: 'Una vista general de la plataforma y accesos a sus áreas.',
    },
    en: {
      queEs: 'The central administration panel.',
      paraQuien: 'Serving team.',
      queObtienes: 'An overview of the platform and shortcuts to its areas.',
    },
  },
}
