/**
 * AYUDAS — el texto que aparece al pasar el cursor (o tocar el «?») sobre un título.
 *
 * Criterio: la ayuda NO repite lo que ya dice la tarjeta o la pantalla (precios,
 * cifras, porcentajes, lo que incluye). Cuenta lo que la tarjeta no dice: para
 * quién es y cómo se siente usarlo. Un solo párrafo corto, cálido y completo.
 *
 * Para cambiar un texto se edita solo este archivo. La clave es, en el website,
 * la misma clave del título (por ejemplo 'w.escalera.membresia1.titulo') y, en el
 * panel, un nombre propio (por ejemplo 'panel.mis_proyectos').
 * Idiomas: español e inglés; quien navega en otro idioma ve el inglés.
 */

export type Ayuda = { es: string; en: string }

export const AYUDAS: Record<string, Ayuda> = {
  // ───────────── WEBSITE: servicios y membresías ─────────────
  'w.escalera.diagnostico.titulo': {
    es: 'Es para quien tiene una idea y todavía no sabe si vale la pena seguir. Es el mejor primer paso: te da claridad antes de invertir tiempo o dinero, y no te compromete a nada.',
    en: 'For anyone with an idea who is not yet sure it is worth pursuing. It is the best first step: it gives you clarity before you invest time or money, with no commitment.',
  },
  'w.escalera.membresia1.titulo': {
    es: 'Es para quien está empezando y quiere aprender haciendo: tiene una idea o un proyecto sencillo y prefiere construirlo por su cuenta, con herramientas y una guía a la mano, antes de dar pasos más grandes.',
    en: 'For people just getting started who want to learn by doing: you have an idea or a simple project and prefer to build it yourself, with tools and a guide at hand, before taking bigger steps.',
  },
  'w.escalera.membresia2.titulo': {
    es: 'Es para quien ya sabe lo que quiere y maneja más de un proyecto a la vez. Funciona muy bien para emprendedores y organizaciones pequeñas que quieren un ritmo constante y poder resolver dudas con el equipo y con otros miembros.',
    en: 'For people who know what they want and handle more than one project at a time. It works very well for entrepreneurs and small organizations that want a steady rhythm and a chance to solve questions with the team and other members.',
  },
  'w.escalera.membresia3.titulo': {
    es: 'Es para quien ya convirtió la financiación en parte de su trabajo: fundaciones, consultores y emprendedores con varios proyectos en marcha que quieren cercanía con el equipo y una comunidad de gente que va por el mismo camino.',
    en: 'For those who have made funding part of their work: foundations, consultants and entrepreneurs with several projects underway who want close contact with the team and a community of people on the same path.',
  },
  'w.escalera.academia.titulo': {
    es: 'Es para quien quiere aprender el método y quedarse con él: equipos, consultores y emprendedores que prefieren dominar el proceso en vez de depender siempre de otros.',
    en: 'For those who want to learn the method and keep it: teams, consultants and entrepreneurs who prefer to master the process rather than always depend on others.',
  },
  'w.escalera.mentoria.titulo': {
    es: 'Es para quien quiere avanzar rápido sin hacerlo solo. Aprendes mientras construyes, con un experto al lado que revisa contigo cada decisión de tu proyecto.',
    en: 'For those who want to move fast without going it alone. You learn as you build, with an expert beside you reviewing each decision in your project.',
  },
  'w.escalera.estructuracion.titulo': {
    es: 'Es para quien necesita un proyecto de la mejor calidad y no tiene el tiempo ni la experiencia para formularlo: empresas, fundaciones y emprendedores que prefieren delegar lo técnico y concentrarse en su propia labor.',
    en: 'For those who need a top-quality project and lack the time or experience to write it: companies, foundations and entrepreneurs who prefer to delegate the technical work and focus on their own mission.',
  },
  'w.escalera.replicas.titulo': {
    es: 'Es para quien ya tiene un proyecto sólido y quiere aprovecharlo más. Lo adaptamos a nuevas convocatorias, regiones o temáticas, sin que tengas que empezar de cero cada vez.',
    en: 'For those who already have a solid project and want to get more out of it. We adapt it to new calls, regions or themes, so you never have to start from scratch.',
  },
  'w.escalera.fondoemprender.titulo': {
    es: 'Es para emprendedores colombianos con una idea de negocio que buscan capital semilla. Es una ruta pensada solo para ese fondo, de principio a fin, para que llegues preparado.',
    en: 'For Colombian entrepreneurs with a business idea who are looking for seed capital. A route designed just for that fund, from start to finish, so you arrive well prepared.',
  },

  // ───────────── WEBSITE: menú de arriba ─────────────
  'w.nav.inicio': {
    es: 'La portada: un resumen de lo que hacemos y del camino que sigue tu idea hasta convertirse en un proyecto listo para postular.',
    en: 'The home page: a summary of what we do and the path your idea follows until it becomes a project ready to apply.',
  },
  'w.nav.servicios': {
    es: 'Nuestros planes, ordenados según cuánto quieres hacer tú y cuánto prefieres que hagamos nosotros. Ideal si estás comparando opciones antes de decidir.',
    en: 'Our plans, arranged by how much you want to do yourself and how much you would rather we do. Ideal if you are comparing options before deciding.',
  },
  'w.nav.que_hacemos': {
    es: 'El recorrido completo que acompañamos, desde la idea hasta la postulación. Sirve para entender qué hace Serving por tu proyecto en cada etapa.',
    en: 'The whole journey we support, from the idea to the application. It helps you understand what Serving does for your project at each stage.',
  },
  'w.nav.como_funciona': {
    es: 'Lo que hace distinta nuestra forma de trabajar. Para quien quiere saber por qué este método funciona antes de confiarnos su proyecto.',
    en: 'What makes our way of working different. For anyone who wants to know why this method works before trusting us with their project.',
  },
  'w.nav.recursos': {
    es: 'Respuestas claras a las preguntas que más nos hacen sobre el proceso, las convocatorias y los servicios. Pensado para quien tiene dudas antes de empezar.',
    en: 'Clear answers to the questions we hear most about the process, funding calls and services. Made for anyone with doubts before getting started.',
  },
  'w.nav.trabaja': {
    es: 'Para quienes quieren aliarse con Serving: organizaciones con marca propia, personas que conocen proyectos y quienes prefieren vender. Aquí están las tres formas de hacerlo.',
    en: 'For those who want to partner with Serving: organizations with their own brand, people who know projects and those who prefer to sell. Here are the three ways to do it.',
  },

  // ───────────── WEBSITE: cómo funciona ─────────────
  'w.valor.rapidez.titulo': {
    es: 'Pensado para quien no quiere perder meses armando su proyecto. El proceso ya está ordenado, así que avanzas sin tener que descubrir el camino desde cero.',
    en: 'Made for anyone who does not want to lose months putting a project together. The process is already organized, so you move forward without having to find the path from scratch.',
  },
  'w.valor.volumen.titulo': {
    es: 'Para quien no quiere apostarle todo a una sola puerta. Mientras una convocatoria se cierra, otras siguen abiertas para tu proyecto.',
    en: 'For anyone who does not want to bet everything on a single door. While one call closes, others stay open for your project.',
  },
  'w.valor.personas.titulo': {
    es: 'Para quien necesita tiempo real para postular con calma. Postular bien lleva más que una tarde, y aquí tienes quien te acompañe durante todo ese periodo.',
    en: 'For anyone who needs real time to apply without rushing. Applying well takes more than an afternoon, and here you have someone beside you throughout.',
  },

  // ───────────── WEBSITE: las tres formas de trabajar ─────────────
  'w.planes.g1.titulo': {
    es: 'Para quien disfruta construir y aprender por su cuenta, a su propio ritmo, con buenas herramientas y una guía cuando la necesita.',
    en: 'For those who enjoy building and learning on their own, at their own pace, with good tools and a guide when they need one.',
  },
  'w.planes.g2.titulo': {
    es: 'Para quien quiere ir de la mano de un experto, participando en cada decisión pero sin cargar solo con todo el trabajo.',
    en: 'For those who want to walk hand in hand with an expert, taking part in every decision without carrying all the work alone.',
  },
  'w.planes.g3.titulo': {
    es: 'Para quien prefiere delegar lo técnico y concentrarse en su propia labor, mientras nosotros llevamos el proyecto hacia las convocatorias.',
    en: 'For those who prefer to delegate the technical work and focus on their own mission while we take the project to the funding calls.',
  },

  // ───────────── WEBSITE: trabaja con nosotros ─────────────
  'w.trabaja.marcablanca.titulo': {
    es: 'Es para organizaciones con marca propia y clientes que necesitan proyectos: gremios, cámaras de comercio, aceleradoras, parques tecnológicos y universidades. Tus clientes lo viven como un servicio tuyo, y el trabajo técnico lo hacemos nosotros. Las condiciones se conversan caso por caso.',
    en: 'For organizations with their own brand and clients who need projects: trade associations, chambers of commerce, accelerators, technology parks and universities. Your clients experience it as your service, and we do the technical work. Terms are discussed case by case.',
  },
  'w.trabaja.referidor.titulo': {
    es: 'Es para quien conoce personas con ideas o proyectos y disfruta conectarlas, pero no quiere dedicarse a vender. Tú haces la presentación y nosotros nos encargamos del resto.',
    en: 'For people who know others with ideas or projects and enjoy connecting them, but do not want to spend time selling. You make the introduction and we take care of the rest.',
  },
  'w.trabaja.comercial.titulo': {
    es: 'Es para quien tiene experiencia vendiendo y prefiere acompañar a su cliente durante todo el proceso: presentar el servicio, resolver dudas y cerrar el contrato.',
    en: 'For those with sales experience who prefer to accompany their client through the whole process: presenting the service, answering questions and closing the contract.',
  },

  // ───────────── PANEL DEL CLIENTE ─────────────
  'panel.resumen': {
    es: 'Tu pantalla de inicio: un vistazo a cómo va tu cuenta y a dónde ir después, para que no tengas que buscar.',
    en: 'Your home screen: a quick look at how your account is doing and where to go next, so you do not have to search.',
  },
  'panel.avance': {
    es: 'Para clientes de Estructuración profesional. Aquí ves, en tiempo real, cómo va tomando forma tu proyecto y qué parte ya está lista.',
    en: 'For Professional Structuring clients. Here you see, in real time, how your project is taking shape and which parts are ready.',
  },
  'panel.calificacion': {
    es: 'Una mirada honesta a qué tan bien podría calificar tu proyecto antes de postularlo, con las debilidades que conviene corregir a tiempo.',
    en: 'An honest look at how well your project could score before you apply, with the weaknesses worth fixing in time.',
  },
  'panel.pendientes': {
    es: 'Lo único que el equipo necesita de ti para seguir avanzando: una respuesta, un dato o un documento. Mientras más rápido lo resuelvas, más rápido sigue tu proyecto.',
    en: 'The only things the team needs from you to keep going: an answer, a piece of data or a document. The sooner you resolve them, the sooner your project moves on.',
  },
  'panel.documentos': {
    es: 'Todos los documentos de tu proyecto reunidos en un solo lugar, listos para revisarlos o descargarlos cuando los necesites.',
    en: 'All your project documents gathered in one place, ready to review or download whenever you need them.',
  },
  'panel.mis_convocatorias': {
    es: 'Las convocatorias que Centinela encontró para ti. Centinela es nuestro servicio de búsqueda: revisa fuentes todos los días y reúne las convocatorias de financiación que pueden servirle a tu proyecto. Aquí decides a cuáles quieres postular y sigues el estado de cada una.',
    en: 'The funding calls that Centinela found for you. Centinela is our search service: it reviews sources every day and gathers the funding calls that could suit your project. Here you decide which ones to apply to and follow the status of each.',
  },
  'panel.mi_abanico': {
    es: 'Un abanico es un lote de postulaciones: partes de tu proyecto ya estructurado y lo adaptamos a varias convocatorias a la vez, cambiando en cada una lo que pida (beneficiarios, territorio, quién postula). Tú escoges a cuáles quieres entrar.',
    en: 'A fan is a batch of applications: starting from your structured project, we adapt it to several calls at once, changing in each one whatever it asks for (beneficiaries, territory, applicant). You choose which ones to enter.',
  },
  'panel.a_tu_medida': {
    es: 'Las convocatorias abiertas que mejor le quedan a tu proyecto, de la que más a la que menos. Es una primera mirada rápida para decidir cuáles revisar primero; cuando eliges una, hacemos el análisis completo.',
    en: 'The open calls that best fit your project, from most to least. It is a quick first look to decide which ones to review first; when you choose one, we run the full analysis.',
  },
  'panel.mis_replicas': {
    es: 'Para quien ya tiene un proyecto estructurado y quiere sacarle más provecho: pides una adaptación a otra convocatoria o territorio y sigues su avance.',
    en: 'For those who already have a structured project and want to get more out of it: you request an adaptation to another call or territory and follow its progress.',
  },
  'panel.ideas': {
    es: 'Un espacio gratuito para pensar tu idea con calma, con herramientas propias, hojas de trabajo y guías. Sirve tanto si apenas empiezas como si quieres ordenar lo que ya tienes.',
    en: 'A free space to think through your idea calmly, with our own tools, worksheets and guides. It works whether you are just starting or want to organize what you already have.',
  },
  'panel.academia': {
    es: 'Para quien quiere aprender el método y dominarlo, con lecciones, plantillas y ejemplos para practicar a su ritmo.',
    en: 'For those who want to learn the method and master it, with lessons, templates and examples to practice at their own pace.',
  },
  'panel.mi_membresia': {
    es: 'Una membresía es una suscripción en la que tú llevas el timón: te damos el método, los recursos y las oportunidades, y tú construyes tu propio proyecto. Hay tres niveles: Explorador, Constructor y Arquitecto. Aquí ves el tuyo y todo lo que te queda disponible este mes; mientras estés al día con tus pagos, tus beneficios siguen activos.',
    en: 'A membership is a subscription where you take the helm: we give you the method, the resources and the opportunities, and you build your own project. There are three levels: Explorer, Builder and Architect. Here you see yours and everything you have left this month; while your payments are up to date, your benefits stay active.',
  },
  'panel.convocatorias_mes': {
    es: 'Lo que hay disponible ahora, ordenado por urgencia: lo que cierra pronto, lo que está abierto, lo que abre todo el año y lo que está por abrir. Abre cada ficha para ver los detalles y el enlace oficial.',
    en: 'What is available right now, sorted by urgency: closing soon, open, open all year and opening soon. Open each record for the details and the official link.',
  },
  'panel.buscar_fondos': {
    es: 'Para cuando buscas una oportunidad concreta. Escribe una palabra o filtra por país, sector o tipo de financiador y encuentra lo que encaja con tu proyecto.',
    en: 'For when you are looking for a specific opportunity. Type a word or filter by country, sector or funder type and find what fits your project.',
  },
  'panel.calendario': {
    es: 'Sirve para planear con tiempo: ves qué cierra en cada mes y qué suele abrir en ciertas épocas, para que prepares tu proyecto antes de que llegue la fecha.',
    en: 'Useful for planning ahead: you see what closes each month and what usually opens at certain times, so you can prepare your project before the date arrives.',
  },
  'panel.mis_proyectos': {
    es: 'Aquí construyes tus propios proyectos, paso a paso y con tus palabras. Lo que escribes se guarda solo y puedes volver cuando quieras. Al terminar uno, eliges la convocatoria y nosotros te ayudamos a postular.',
    en: 'Here you build your own projects, step by step and in your own words. What you write saves itself and you can come back any time. When you finish one, you choose the call and we help you apply.',
  },
  'panel.sesiones': {
    es: 'Encuentros en vivo con el equipo y otros miembros. Muy útiles para resolver dudas puntuales y aprender de las preguntas de los demás.',
    en: 'Live meetings with the team and other members. Very useful for solving specific questions and learning from what others ask.',
  },
  'panel.comunidad': {
    es: 'El lugar de los miembros Arquitecto para conversar entre sí: compartir avances, preguntas y aprendizajes con personas que van por el mismo camino.',
    en: 'The place for Architect members to talk to each other: share progress, questions and lessons with people on the same path.',
  },
  'panel.acompanamiento': {
    es: 'Tu espacio semanal con el equipo. Llegas con un tema, lo conversamos y sales con claridad sobre el siguiente paso de tus proyectos.',
    en: 'Your weekly time with the team. You arrive with a topic, we talk it through and you leave with clarity on the next step for your projects.',
  },
  'panel.mi_cortesia': {
    es: 'Tu invitación para estructurar tu proyecto con Serving. Aquí lees y aceptas las condiciones, y ves cuánto tiempo te queda.',
    en: 'Your invitation to have Serving structure your project. Here you read and accept the conditions and see how much time you have left.',
  },

  // ───────────── PANEL DEL EQUIPO ─────────────
  'equipo.cortesias': {
    es: 'Las invitaciones a proyectos sin costo de estructuración. Invitas, ves quién aceptó, cuántos días le quedan y cuántas llevas por organización aliada.',
    en: 'Invitations to projects with no structuring fee. You invite, see who accepted, how many days they have left and how many you have per partner organization.',
  },
  'equipo.proyectos': {
    es: 'Todos los proyectos de clientes que Serving está estructurando: estado, pagos y detalle para hacer seguimiento.',
    en: 'All the client projects Serving is structuring: status, payments and detail for follow-up.',
  },
  'equipo.diagnosticos': {
    es: 'Los diagnósticos gratuitos que ha hecho la gente. Son tus posibles clientes: su puntaje, el plan recomendado y sus datos de contacto.',
    en: 'The free diagnoses people have completed. These are your potential clients: their score, recommended plan and contact details.',
  },
  'equipo.convocatorias': {
    es: 'La biblioteca de convocatorias. Aquí revisas y corriges fechas, montos y requisitos, que es justo lo que ven los clientes.',
    en: 'The call library. Here you review and correct dates, amounts and requirements, which is exactly what clients see.',
  },
  'equipo.centinela': {
    es: 'El vigilante que lee las fuentes y detecta convocatorias nuevas. Ves cuáles fuentes están conectadas y cuáles faltan.',
    en: 'The watcher that reads the sources and detects new calls. You see which sources are connected and which are missing.',
  },
  'equipo.membresias': {
    es: 'Las membresías de todos los clientes: confirmas pagos, ves quién está activo o vencido y registras el uso de beneficios.',
    en: 'All clients’ memberships: you confirm payments, see who is active or expired and record benefit usage.',
  },
  'equipo.servicios_membresia': {
    es: 'Lo que piden los miembros: postulaciones, acompañamientos, sesiones y comunidad. Lees cada proyecto, cambias estados y agendas encuentros.',
    en: 'What members ask for: applications, check-ins, sessions and community. You read each project, change statuses and schedule meetings.',
  },
  'equipo.soporte': {
    es: 'Las consultas y problemas que reportan los usuarios, en un solo lugar para que ninguno se pierda.',
    en: 'The questions and problems users report, in one place so none get lost.',
  },
  'equipo.motores': {
    es: 'Los motores de inteligencia artificial que estructuran, buscan y evalúan. Ves su estado y puedes lanzarlos a mano si hace falta.',
    en: 'The artificial intelligence engines that structure, search and evaluate. You see their status and can run them manually if needed.',
  },
  'equipo.configuracion': {
    es: 'Los ajustes generales de la plataforma, para controlar cómo se comporta sin tocar el código.',
    en: 'The platform’s general settings, to control how it behaves without touching the code.',
  },
  'equipo.academia': {
    es: 'La administración de la Academia: cursos, lecciones y quiénes tienen acceso.',
    en: 'Academy administration: courses, lessons and who has access.',
  },
  'equipo.marca_blanca': {
    es: 'Los socios que usan la plataforma con su propia marca: sus enlaces, su mantenimiento, sus clientes y los proyectos que han estructurado.',
    en: 'The partners using the platform under their own brand: their links, maintenance, clients and the projects they have structured.',
  },
  'equipo.administracion': {
    es: 'El panel central: una vista general de la plataforma y accesos a cada área.',
    en: 'The central panel: an overview of the platform and shortcuts to each area.',
  },
}
