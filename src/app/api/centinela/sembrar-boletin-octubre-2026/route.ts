import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { guardarEnBiblioteca, type ConvocatoriaEncontrada } from '@/lib/bibliotecaConvocatorias'
import { motorAutorizado } from '@/lib/candadoMotores'

/**
 * CENTINELA — siembra puntual del boletín de convocatorias de octubre de 2026
 * (55 convocatorias, 8 sectores) que Gonzalo entregó el 3 de octubre de 2026.
 *
 * Igual que la siembra del boletín anterior: las fichas se transcriben aquí y
 * se guardan en la biblioteca con la misma función `guardarEnBiblioteca` que
 * usa el Motor 2. Si una ya existía (mismo nombre + entidad) solo se completan
 * los huecos; nunca se pisa lo que el equipo ya corrigió.
 *
 * Ruta de un solo uso: se visita una vez desde el navegador, con sesión del
 * equipo Serving iniciada: /api/centinela/sembrar-boletin-octubre-2026
 *
 * En `linea_tematica` queda "Sector · Tipo de recurso" (por ejemplo
 * "Salud · Subvención"), para poder filtrar por sector y por recurso en las
 * pantallas de la biblioteca.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
)

type Fila = {
  n: string // nombre
  e: string // entidad
  c: string // fecha de cierre AAAA-MM-DD, o 'permanente'
  cierreTexto?: string // aclaración de la fecha cuando hace falta
  m: string // monto
  b: string // beneficiarios
  t: string // territorio
  s: string // sector
  r: string // tipo de recurso
  f: string // fuente oficial
  fin: string // tipo de financiador del mapa
  a: string // ámbito
}

const FILAS: Fila[] = [
  // ───────── SALUD ─────────
  { n: 'IBRO Brain Awareness Week Grants 2027', e: 'IBRO', c: '2026-10-15', m: 'Hasta USD 1.250', b: 'Organizaciones e instituciones educativas', t: 'América Latina, África, Asia-Pacífico, EE.UU. y Canadá', s: 'Salud', r: 'Subvención', f: 'https://ibro.org/grant/brain-awareness-week-grants/#about-the-program', fin: 'ong', a: 'internacional' },
  { n: 'Clean Air Fund — Investigación sobre beneficios en salud y clima de reducir la exposición a carbono negro', e: 'Clean Air Fund', c: '2026-10-23', m: 'Hasta GBP 220.000', b: 'Universidades, institutos, organizaciones de investigación y consorcios', t: 'Entornos de clima frío en países de ingreso bajo y medio', s: 'Salud', r: 'Subvención', f: 'https://www.cleanairfund.org/wp-content/uploads/2026_RfP-Exposure-Reduction-Interventions-in-cold-climate-settings.pdf', fin: 'filantropia_privada', a: 'internacional' },
  { n: 'Ayudas a la Investigación Ignacio H. de Larramendi 2026', e: 'Fundación MAPFRE', c: '2026-10-22', cierreTexto: '2026-10-22, 14:00 hora de España', m: 'Hasta EUR 30.000 (salud) o EUR 15.000 (seguros)', b: 'Investigadores, equipos de investigación e investigadores independientes', t: 'Global, incluida América Latina', s: 'Salud', r: 'Subvención', f: 'https://www.fundacionmapfre.org/en/awards-aids/ignacio-larramendi-research-grants/', fin: 'filantropia_corporativa', a: 'internacional' },
  { n: 'Premios Carlos Slim en Salud (XX convocatoria)', e: 'Fundación Carlos Slim', c: '2026-11-30', m: 'USD 100.000 por categoría', b: 'Investigadores con más de 15 años de trayectoria (postulados por terceros) e instituciones sin ánimo de lucro', t: 'América Latina y el Caribe', s: 'Salud', r: 'Premio en efectivo', f: 'https://www.premiosensalud.org', fin: 'filantropia_privada', a: 'regional' },
  { n: 'W.K. Kellogg Foundation — solicitudes de financiamiento', e: 'W.K. Kellogg Foundation', c: 'permanente', m: 'No especificado', b: 'Organizaciones sin ánimo de lucro, comunitarias y universidades (no personas naturales)', t: 'México (Chiapas y península de Yucatán) y Haití', s: 'Salud', r: 'Subvención', f: 'https://www.wkkf.org/grantseekers/', fin: 'filantropia_privada', a: 'internacional' },
  { n: 'World Diabetes Foundation — notas de concepto', e: 'World Diabetes Foundation (Dinamarca)', c: 'permanente', m: 'No especificado', b: 'Organizaciones locales de salud e investigación', t: 'Países de ingreso bajo y medio, incluida América Latina', s: 'Salud', r: 'Subvención', f: 'https://www.worlddiabetesfoundation.org/how-to-apply/', fin: 'ong', a: 'internacional' },
  { n: 'Gilead — donativos para América Latina y el Caribe', e: 'Gilead Sciences', c: 'permanente', m: 'No especificado (proyectos de máximo un año)', b: 'Organizaciones sin ánimo de lucro legalmente registradas', t: 'Más de 40 países y territorios de América Latina y el Caribe', s: 'Salud', r: 'Donación', f: 'https://www.gilead.com/responsibility/giving-at-gilead/corporate-giving/how-to-apply-for-funding/giving-in-latin-america-and-the-caribbean', fin: 'filantropia_corporativa', a: 'regional' },

  // ───────── EDUCACIÓN ─────────
  { n: 'World Future Policy Award 2027 — Educación para el desarrollo sostenible en ciudades', e: 'World Future Council', c: '2026-10-31', m: 'No especificado', b: 'Organizaciones internacionales, universidades, ONG, gobiernos y comunidades', t: 'Global, incluida América Latina', s: 'Educación', r: 'Premio', f: 'https://www.worldfuturecouncil.org/education-for-sustainable-development-in-cities/', fin: 'ong', a: 'internacional' },
  { n: 'GTF Olympiad Grants — Convocatoria abierta 2026.3', e: 'Global Talent Foundation', c: '2026-10-15', m: 'USD 10.000 a 30.000 por año', b: 'ONG, universidades y entidades públicas organizadoras de olimpiadas', t: 'Países que participaron en olimpiadas de matemáticas o informática en los últimos 3 años', s: 'Educación', r: 'Subvención', f: 'https://www.globtalent.org/gtf-olympiad-grants', fin: 'filantropia_privada', a: 'internacional' },
  { n: 'Programa regional para el fortalecimiento de capacidades técnicas en resiliencia urbana y reducción del riesgo de desastres', e: 'ONU-Habitat', c: '2026-10-13', cierreTexto: '2026-10-13, 5:00 p. m. (hora del Este de EE.UU.)', m: 'USD 50.000', b: 'Instituciones académicas de educación superior', t: 'Bolivia, Colombia, Costa Rica, Cuba, Ecuador, El Salvador, Honduras y Perú', s: 'Educación', r: 'Subvención', f: 'https://onu-habitat.org/index.php/convocatoria-programa-regional-para-el-fortalecimiento-de-capacidades-tecnicas-en-resiliencia-urbana-y-reduccion-del-riesgo-de-desastres', fin: 'onu', a: 'regional' },
  { n: 'Teaching Innovation Awards', e: 'Insect Welfare Research Society', c: '2026-10-15', m: 'Hasta USD 2.000', b: 'Docentes e instituciones educativas', t: 'Global, incluida América Latina', s: 'Educación', r: 'Premio', f: 'https://www.insectwelfare.com/teaching-innovation-award', fin: 'ong', a: 'internacional' },
  { n: 'MIT Solve — Global Learning Challenge 2027', e: 'MIT Solve (Massachusetts Institute of Technology)', c: '2026-11-02', cierreTexto: '2026-11-02, mediodía (hora del Este de EE.UU.)', m: 'USD 10.000 por equipo, más premios adicionales', b: 'Personas, equipos y organizaciones en etapa de prototipo, piloto, crecimiento o escala', t: 'Global, incluida América Latina', s: 'Educación', r: 'Reto de innovación', f: 'https://solve.mit.edu/challenges/2027-global-learning-challenge', fin: 'academia', a: 'internacional' },
  { n: 'Convocatoria RIE — Proyectos Educativos Transformadores 2026-2027', e: 'Red Internacional de Educación (RIE)', c: '2026-11-15', m: 'USD 1.000 por proyecto (5 proyectos)', b: 'Colegios, universidades, fundaciones, ONG y redes educativas con más de 2 años de trayectoria', t: 'España e Hispanoamérica', s: 'Educación', r: 'Premio', f: 'https://riedu.org/convocatoria-rie/', fin: 'ong', a: 'regional' },
  { n: 'DAAD Research Grants 2027 — Estancias de investigación en Alemania', e: 'DAAD (Servicio Alemán de Intercambio Académico), oficina Región Andina', c: '2027-03-11', m: 'EUR 1.400 al mes, más seguro, curso de alemán y pasajes', b: 'Doctorandos e investigadores posdoctorales', t: 'Colombia, Ecuador, Perú y Venezuela', s: 'Educación', r: 'Beca', f: 'https://www.daad.co/es/becas/becas-de-posgrado/doctorado-e-investigacion/', fin: 'cooperacion_bilateral', a: 'regional' },
  { n: 'Concurso Maestro que Deja Huella 2026 (16.ª edición)', e: 'Interbank', c: '2026-10-23', m: 'PEN 130.000 para el maestro ganador y PEN 20.000 para su colegio', b: 'Maestros, subdirectores y directores de colegios públicos con más de 5 años de experiencia', t: 'Perú', s: 'Educación', r: 'Premio en efectivo', f: 'https://maestroquedejahuella.com.pe/', fin: 'empresa_privada', a: 'nacional' },
  { n: 'Programa de Apoyo a Publicaciones Científicas 2026', e: 'CONACYT Paraguay (programa PROCIENCIA II)', c: '2026-12-31', cierreTexto: '2026-12-31, 15:00', m: 'Hasta PYG 7.000.000 por publicación', b: 'Investigadores paraguayos o extranjeros residentes e instituciones de educación superior', t: 'Paraguay', s: 'Educación', r: 'Subvención', f: 'https://www.conacyt.gov.py/programa-apoyo-publicaciones-cientificas-ventanilla-2026', fin: 'estado_nacional', a: 'nacional' },
  { n: 'Wenner-Gren Dissertation Fieldwork Grants', e: 'Wenner-Gren Foundation', c: '2026-11-01', m: 'Hasta USD 25.000', b: 'Estudiantes de doctorado en antropología que ya terminaron cursos y exámenes', t: 'Global, de cualquier nacionalidad', s: 'Educación', r: 'Subvención', f: 'https://wennergren.org/programs/dissertation-fieldwork-grants/', fin: 'filantropia_privada', a: 'internacional' },

  // ───────── MEDIO AMBIENTE ─────────
  { n: 'Mohamed bin Zayed Species Conservation Fund — Grants', e: 'Mohamed bin Zayed Species Conservation Fund', c: '2026-10-15', m: 'No especificado', b: 'Conservacionistas, investigadores y organizaciones de conservación', t: 'Global, incluida América Latina', s: 'Medio Ambiente', r: 'Subvención', f: 'https://www.speciesconservation.org/biodiversity-nature-people/conservation-philanthropy/grants/', fin: 'filantropia_privada', a: 'internacional' },
  { n: 'BiodivFuture — Convocatoria conjunta Biodiversa+ 2026-2027', e: 'Biodiversa+', c: '2026-11-10', cierreTexto: 'Preinscripción 2026-11-10; propuesta completa 2027-04-16', m: 'No especificado', b: 'Equipos de investigación de universidades, centros y organizaciones, en consorcio internacional', t: 'Brasil, con socios de al menos 2 países europeos', s: 'Medio Ambiente', r: 'Subvención', f: 'https://www.biodiversa.eu/2026/06/09/2026-2027-joint-call/', fin: 'cooperacion_multilateral', a: 'internacional' },
  { n: 'Climate Intervention Environmental Impact Fund (CIEIF)', e: 'CIEIF', c: '2026-12-01', m: 'Hasta USD 75.000 (tres subvenciones)', b: 'Investigadores y organizaciones', t: 'Global, incluida América Latina', s: 'Medio Ambiente', r: 'Subvención', f: 'https://cieif.org/', fin: 'filantropia_privada', a: 'internacional' },
  { n: 'Wildlife Acoustics Grant Program', e: 'Wildlife Acoustics', c: '2026-11-15', m: 'Hasta USD 4.000 en equipos, más USD 1.000 para viaje', b: 'Investigadores y organizaciones educativas o sin ánimo de lucro', t: 'Global, incluida América Latina (excepto Cuba)', s: 'Medio Ambiente', r: 'Donación', f: 'https://www.wildlifeacoustics.com/grant-program', fin: 'empresa_privada', a: 'internacional' },
  { n: 'MIT Solve — Global Climate Challenge 2027', e: 'MIT Solve (Massachusetts Institute of Technology)', c: '2026-11-02', cierreTexto: '2026-11-02, mediodía (hora del Este de EE.UU.)', m: 'USD 10.000 por equipo, más premios adicionales', b: 'Personas, equipos y organizaciones en etapa de prototipo, piloto, crecimiento o escala', t: 'Global, incluida América Latina', s: 'Medio Ambiente', r: 'Reto de innovación', f: 'https://solve.mit.edu/challenges/2027-global-climate-challenge', fin: 'academia', a: 'internacional' },
  { n: 'Rainforest Trust — Protected or Conserved Area Creation Awards', e: 'Rainforest Trust', c: 'permanente', m: 'No especificado (los proyectos menores de USD 250.000 se revisan de forma continua)', b: 'ONG legalmente registradas en el país del proyecto', t: 'Zonas tropicales y subtropicales, incluida América Latina', s: 'Medio Ambiente', r: 'Subvención', f: 'https://www.rainforesttrust.org/get-involved/apply-for-funding/', fin: 'ong', a: 'internacional' },
  { n: 'Rufford Small Grants for Nature Conservation', e: 'The Rufford Foundation', c: 'permanente', m: 'GBP 7.000 a 18.000 según la etapa', b: 'Estudiantes y egresados de maestría o doctorado al inicio de su carrera en conservación', t: 'Países en desarrollo y economías emergentes, incluida América Latina', s: 'Medio Ambiente', r: 'Subvención', f: 'https://apply.ruffordsmallgrants.org/', fin: 'filantropia_privada', a: 'internacional' },
  { n: 'Global EbA Fund — Subvenciones medianas 2026', e: 'Global EbA Fund (UICN y PNUMA, con la Iniciativa Climática Internacional de Alemania)', c: '2026-11-16', m: 'Hasta USD 500.000 por proyecto', b: 'ONG, organizaciones comunitarias y de pueblos indígenas, universidades, centros de investigación, empresas y consorcios (no gobiernos)', t: 'Países elegibles para AOD, incluidos los de América Latina y el Caribe', s: 'Medio Ambiente', r: 'Subvención', f: 'https://globalebafund.org/medium-size-grants/', fin: 'cooperacion_multilateral', a: 'internacional' },

  // ───────── ARTES Y CULTURA ─────────
  { n: 'Sony World Photography Awards 2027 — Competencia juvenil', e: 'World Photography Organisation', c: '2027-01-05', m: 'Premio en especie: equipo Sony y viaje a Londres', b: 'Fotógrafos de 19 años o menos', t: 'Global, incluida América Latina', s: 'Artes y Cultura', r: 'Premio en especie', f: 'https://www.worldphoto.org/sony-world-photography-awards/youth', fin: 'empresa_privada', a: 'internacional' },
  { n: 'Living Legacy — Ayudas para fomentar y difundir las culturas constructivas tradicionales 2027', e: 'Fundación de Culturas de Construcción Tradicional', c: '2026-12-01', m: 'Hasta EUR 3.000 (tres ayudas)', b: 'Personas, asociaciones, fundaciones, universidades, centros de investigación e instituciones culturales', t: 'Global, incluida América Latina', s: 'Artes y Cultura', r: 'Subvención', f: 'https://culturasconstructivas.org/en/living-legacy-grants-for-fostering-and-spreading-the-traditional-building-cultures/', fin: 'ong', a: 'internacional' },
  { n: 'TRANSPOSE Innovation Challenge 2026', e: 'Yamaha', c: '2026-10-31', m: 'Hasta JPY 5.000.000 para prueba de concepto', b: 'Empresas y startups', t: 'Global, incluida América Latina', s: 'Artes y Cultura', r: 'Subvención', f: 'https://yamaha-music.agorize.com/en/challenges/transpose-innovation-challenge-2026?lang=en', fin: 'empresa_privada', a: 'internacional' },
  { n: 'Neville Shulman Challenge Award', e: 'Royal Geographical Society', c: '2027-01-08', m: 'Hasta GBP 10.000', b: 'Personas y grupos', t: 'Global, incluida América Latina', s: 'Artes y Cultura', r: 'Subvención', f: 'https://www.rgs.org/exploration/grants/expedition-grants/neville-shulman-challenge-award', fin: 'ong', a: 'internacional' },
  { n: 'Residencia Espace Brownstone × Art in Latin America 2027', e: 'Association Noemi – Espace Brownstone (con Art in Latin America)', c: '2026-10-15', cierreTexto: '2026-10-15, 23:59 hora de París', m: 'Sin dinero: alojamiento, taller y apoyo curatorial', b: 'Artistas de cualquier disciplina, edad y etapa', t: 'América Latina y el Caribe', s: 'Artes y Cultura', r: 'Premio en especie', f: 'https://www.artinlatam.com/p/open-call-espace-brownstone-art-in', fin: 'ong', a: 'regional' },
  { n: 'Programa PICE Movilidad 2027', e: 'Acción Cultural Española (AC/E), Ministerio de Cultura de España', c: '2027-09-05', m: 'Hasta EUR 15.000 por evento (máximo EUR 5.000 por artista)', b: 'Entidades culturales no españolas, públicas o privadas', t: 'Global, incluida América Latina', s: 'Artes y Cultura', r: 'Subvención', f: 'https://www.accioncultural.es/es/progPICE', fin: 'estado_nacional', a: 'internacional' },

  // ───────── TECNOLOGÍA E INNOVACIÓN ─────────
  { n: 'EA Funds — Transformative AI Fund', e: 'Effective Altruism Funds', c: 'permanente', m: 'USD 1.000 a 500.000', b: 'Personas y organizaciones', t: 'Global, incluida América Latina', s: 'Tecnología e Innovación', r: 'Subvención', f: 'https://funds.effectivealtruism.org/apply-for-funding', fin: 'filantropia_privada', a: 'internacional' },
  { n: 'Foresight Institute — AI Safety Nodes RFP: Coordinación y rendición de cuentas', e: 'Foresight Institute', c: '2026-10-31', m: 'USD 30.000 a 100.000', b: 'Personas, equipos y organizaciones con o sin ánimo de lucro', t: 'Global, incluida América Latina', s: 'Tecnología e Innovación', r: 'Subvención', f: 'https://foresight.org/grants/ai-science-safety-nodes-rfp-coordination-and-accountability/', fin: 'filantropia_privada', a: 'internacional' },
  { n: 'Fondo de Innovación para el Desarrollo (FID) — Convocatoria permanente', e: 'Fund for Innovation in Development (FID)', c: 'permanente', m: 'Hasta EUR 4.000.000 según la etapa (pilotos hasta EUR 200.000)', b: 'ONG, entidades públicas, universidades, centros de investigación y empresas (no personas naturales ni organismos internacionales)', t: 'Países de ingreso bajo y medio del CAD-OCDE, incluida América Latina', s: 'Tecnología e Innovación', r: 'Subvención', f: 'https://fundinnovation.dev/launch-project', fin: 'cooperacion_bilateral', a: 'internacional' },
  { n: 'MIT Solve — Global Health Challenge 2027', e: 'MIT Solve (Massachusetts Institute of Technology)', c: '2026-11-02', cierreTexto: '2026-11-02, mediodía (hora del Este de EE.UU.)', m: 'USD 10.000 por equipo, más premios adicionales', b: 'Personas, equipos y organizaciones en etapa de prototipo, piloto, crecimiento o escala', t: 'Global, incluida América Latina', s: 'Tecnología e Innovación', r: 'Reto de innovación', f: 'https://solve.mit.edu/challenges/2027-global-health-challenge', fin: 'academia', a: 'internacional' },
  { n: 'EU-LAC Digital Accelerator — Convocatoria abierta #6', e: 'EU-LAC Digital Accelerator (financiado por la Unión Europea)', c: '2026-11-30', m: 'Hasta EUR 10.500 por startup', b: 'Parejas formadas por una startup y una empresa grande de dos regiones distintas', t: 'Unión Europea, América Latina y el Caribe', s: 'Tecnología e Innovación', r: 'Aceleración', f: 'https://eulacdigitalaccelerator.com/open-call/', fin: 'cooperacion_multilateral', a: 'regional' },
  { n: 'Programa de Jóvenes Científicos 2027', e: 'SENACYT (Secretaría Nacional de Ciencia, Tecnología e Innovación de Panamá)', c: '2026-10-22', cierreTexto: '2026-10-22, 2:00 p. m. hora de Panamá', m: 'PAB 700 por proyecto', b: 'Estudiantes panameños de octavo a duodécimo grado en 2027, con mentor científico', t: 'Panamá', s: 'Tecnología e Innovación', r: 'Subvención', f: 'https://www.senacyt.gob.pa/convocatorias-abiertas/', fin: 'estado_nacional', a: 'nacional' },
  { n: 'Rapid Fund — Wikimedia Community Fund', e: 'Wikimedia Foundation', c: '2026-11-01', m: 'USD 500 a 5.000 por proyecto', b: 'Personas, grupos y organizaciones con historial en proyectos Wikimedia', t: 'Global, incluidos América Latina y el Caribe', s: 'Tecnología e Innovación', r: 'Subvención', f: 'https://meta.wikimedia.org/wiki/Grants:Project/Rapid', fin: 'ong', a: 'internacional' },

  // ───────── AGRICULTURA ─────────
  { n: 'Comparación de las contribuciones de PFAS a los sistemas agrícolas', e: 'The Water Research Foundation', c: '2026-10-26', m: 'USD 400.000', b: 'Organizaciones de investigación (no personas naturales)', t: 'Global (acepta propuestas de fuera de EE.UU.)', s: 'Agricultura', r: 'Subvención', f: 'https://portal.waterrf.org/outbound-grant-details/3348', fin: 'ong', a: 'internacional' },
  { n: 'Premio Mujer del Agro Mónica Gebert 2026', e: 'AFIPA (Asociación Nacional de Fabricantes e Importadores de Productos Fitosanitarios, Chile)', c: '2026-10-31', m: 'No especificado (reconocimiento y difusión)', b: 'Mujeres mayores de 18 años, chilenas o extranjeras, vinculadas a la agricultura', t: 'Chile', s: 'Agricultura', r: 'Premio', f: 'https://www.afipa.cl/premio-mujer-del-agro/', fin: 'ong', a: 'nacional' },
  { n: 'Premio Nacional de Innovación Alimentaria 2026', e: 'Transforma Alimentos (comité CORFO) y Nutrisco', c: '2026-10-15', cierreTexto: '2026-10-15, 23:59', m: 'No especificado (visibilidad, reconocimiento y conexiones)', b: 'Empresas y startups constituidas en Chile', t: 'Chile', s: 'Agricultura', r: 'Premio', f: 'https://transformalimentos.cl/', fin: 'estado_nacional', a: 'nacional' },
  { n: '¿A qué sabe la patria? Orgullosamente frijoleros', e: 'Secretaría de Cultura del Gobierno de México', c: '2026-10-11', m: 'MXN 50.000 a 125.000 (cuatro primeros lugares)', b: 'Colectivos de 3 a 7 cocineras o cocineros tradicionales (comunidades indígenas, afromexicanas, campesinas, urbanas y populares)', t: 'México', s: 'Agricultura', r: 'Premio en efectivo', f: 'https://convocatorias.cultura.gob.mx/vigentes/detalle/4168/a-que-sabe-la-patria-orgullosamente-frijoleros', fin: 'estado_nacional', a: 'nacional' },

  // ───────── SECTOR PRIVADO ─────────
  { n: 'D-Prize Global Competition 2026-2027', e: 'D-Prize', c: '2026-11-15', cierreTexto: 'Cierre 2026-11-15; con inscripción anticipada hasta 2026-10-25 y prórroga hasta 2026-12-06 si se registra', m: 'Hasta USD 20.000', b: 'Emprendedores y organizaciones nuevas (menos de 18 meses de operación)', t: 'Global (se anima a países de ingreso bajo y medio)', s: 'Sector Privado', r: 'Subvención', f: 'https://d-prize.org/', fin: 'filantropia_privada', a: 'internacional' },
  { n: 'Y Combinator — Winter 2027', e: 'Y Combinator', c: '2026-11-02', m: 'USD 500.000 de inversión (7% de la empresa más SAFE)', b: 'Startups de cualquier etapa', t: 'Global, incluida América Latina', s: 'Sector Privado', r: 'Inversión', f: 'https://www.ycombinator.com/apply', fin: 'empresa_privada', a: 'internacional' },
  { n: 'Roquette — Convocatoria de aplicaciones con Plug and Play', e: 'Plug and Play Tech Center', c: '2026-11-07', m: 'No especificado', b: 'Startups, pymes, laboratorios universitarios e institutos de investigación', t: 'Global, incluida América Latina', s: 'Sector Privado', r: 'Aceleración', f: 'https://www.plugandplaytechcenter.com/innovation-services/challenge-offerings/roquette-call-for-applications', fin: 'empresa_privada', a: 'internacional' },
  { n: 'MIT Solve — Global Economic Prosperity Challenge 2027', e: 'MIT Solve (Massachusetts Institute of Technology)', c: '2026-11-02', cierreTexto: '2026-11-02, mediodía (hora del Este de EE.UU.)', m: 'USD 10.000 por equipo, más premios adicionales', b: 'Personas, equipos y organizaciones en etapa de prototipo, piloto, crecimiento o escala', t: 'Global, incluida América Latina', s: 'Sector Privado', r: 'Reto de innovación', f: 'https://solve.mit.edu/challenges/2027-global-economic-prosperity-challenge', fin: 'academia', a: 'internacional' },
  { n: '11.º Concurso Nacional Desafío Emprendedor 2026', e: 'Banco de Chile (Programa Pymes para Chile)', c: '2026-10-18', m: 'CLP 25.000.000 al primer lugar de cada categoría (CLP 200.000.000 en premios en total)', b: 'Personas naturales con inicio de actividades y empresas formalizadas ante el SII con ventas hasta UF 25.000', t: 'Chile', s: 'Sector Privado', r: 'Premio en efectivo', f: 'https://sitiospublicos.bancochile.cl/desafio-emprendedor', fin: 'empresa_privada', a: 'nacional' },

  // ───────── DERECHOS Y COMUNIDADES ─────────
  { n: 'Apoyos de Respuesta Rápida — Fondo de Acción Urgente de América Latina y el Caribe', e: 'Fondo de Acción Urgente ALC', c: 'permanente', m: 'Hasta USD 8.000 (USD 10.000 con acciones de cuidado colectivo)', b: 'Organizaciones y colectivas de mujeres, feministas, transfeministas y personas disidentes de sexo-género (incluso sin personería jurídica)', t: 'Países hispanohablantes de América Latina y el Caribe', s: 'Derechos y Comunidades', r: 'Subvención', f: 'https://es.faulac.org/apoyos/', fin: 'filantropia_privada', a: 'regional' },
  { n: 'Protection Grants', e: 'Front Line Defenders', c: 'permanente', m: 'Hasta EUR 7.500', b: 'Personas defensoras de derechos humanos y organizaciones en riesgo', t: 'Global, incluida América Latina', s: 'Derechos y Comunidades', r: 'Subvención', f: 'https://www.frontlinedefenders.org/en/programme/protection-grants', fin: 'ong', a: 'internacional' },
  { n: 'Incident Response Fund', e: 'Digital Defenders Partnership (gestionado por Hivos)', c: 'permanente', m: 'Hasta USD 5.000 por caso', b: 'Defensores de derechos humanos, periodistas y activistas bajo amenazas o ataques digitales', t: 'Global, incluida América Latina', s: 'Derechos y Comunidades', r: 'Subvención', f: 'https://www.digitaldefenders.org/funds/', fin: 'ong', a: 'internacional' },
  { n: 'Asistencia a Proyectos Comunitarios de Seguridad Humana (APC-Kusanone) 2027 — Uruguay', e: 'Embajada de Japón en Uruguay', c: '2026-10-31', m: 'Menos de JPY 10.000.000 por proyecto', b: 'Gobiernos locales, instituciones educativas y de salud, y ONG sin ánimo de lucro', t: 'Uruguay', s: 'Derechos y Comunidades', r: 'Subvención', f: 'https://www.uy.emb-japan.go.jp/itpr_es/convocatoria_proyectos_APC_KUSANONE_2027.html', fin: 'cooperacion_bilateral', a: 'nacional' },
  { n: 'Proyectos Comunitarios de Seguridad Humana (Kusanone) — Colombia', e: 'Embajada de Japón en Colombia', c: 'permanente', m: 'Hasta JPY 10.000.000 (hasta JPY 25.000.000 según el proyecto)', b: 'ONG y autoridades locales sin ánimo de lucro (no personas naturales)', t: 'Colombia', s: 'Derechos y Comunidades', r: 'Subvención', f: 'https://www.colombia.emb-japan.go.jp/itpr_es/cooperacionKUSANONE.html', fin: 'cooperacion_bilateral', a: 'nacional' },
  { n: 'Rapid Response Fund', e: 'Open Technology Fund (OTF)', c: 'permanente', m: 'Hasta USD 50.000 (seis meses o menos)', b: 'Activistas, periodistas, defensoras de derechos humanos y organizaciones en riesgo (mayores de 18 años)', t: 'Global, incluida América Latina', s: 'Derechos y Comunidades', r: 'Subvención', f: 'https://www.opentech.fund/funds/rapid-response-fund/', fin: 'ong', a: 'internacional' },
  { n: 'Emergency Grants — ProtectDefenders.eu', e: 'ProtectDefenders.eu (mecanismo de la Unión Europea)', c: 'permanente', m: 'Hasta EUR 10.000 (promedio EUR 3.000)', b: 'Personas defensoras de derechos humanos en riesgo y organizaciones', t: 'Global, incluida América Latina', s: 'Derechos y Comunidades', r: 'Subvención', f: 'https://protectdefenders.eu/protecting-defenders/', fin: 'cooperacion_multilateral', a: 'internacional' },
  { n: 'The Pollination Project — Daily Grant (capital semilla)', e: 'The Pollination Project Foundation', c: 'permanente', m: 'Hasta USD 500', b: 'Personas, grupos informales y organizaciones nuevas sin personal pago (proyectos de voluntariado de menos de USD 10.000)', t: 'Global, incluida América Latina', s: 'Derechos y Comunidades', r: 'Subvención', f: 'https://thepollinationproject.org/apply/', fin: 'ong', a: 'internacional' },
]

function aFicha(f: Fila): ConvocatoriaEncontrada {
  const permanente = f.c === 'permanente'
  const ficha: ConvocatoriaEncontrada = {
    nombre: f.n,
    entidad: f.e,
    tipo: permanente ? 'permanente' : 'abierta actualmente',
    estado_convocatoria: permanente
      ? 'Ventanilla abierta todo el año'
      : `Abierta, cierra ${f.cierreTexto || f.c}`,
    fecha_cierre: permanente ? 'Ventanilla abierta' : f.c,
    monto: f.m,
    beneficiarios: f.b,
    territorio: f.t,
    linea_tematica: `${f.s} · ${f.r}`,
    fuente_oficial: f.f,
    tipo_financiador: f.fin,
    ambito: f.a,
  }
  if (/^No especificado/.test(f.m)) {
    ficha.informacion_faltante = 'Monto no especificado en el boletín; confirmar en la fuente oficial'
  }
  return ficha
}

async function ejecutarSiembra() {
  const fichas = FILAS.map(aFicha)
  const mapaGuardadas = await guardarEnBiblioteca(supabase, fichas)
  return {
    status: 200,
    body: {
      ok: true,
      convocatorias_en_el_boletin: fichas.length,
      convocatorias_guardadas: mapaGuardadas.size,
      fuente: 'Boletín de convocatorias, octubre de 2026',
    },
  }
}

// Se visita una sola vez desde el navegador, con sesión del equipo Serving
// iniciada: /api/centinela/sembrar-boletin-octubre-2026
export async function GET(req: NextRequest) {
  if (!(await motorAutorizado(req))) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const resultado = await ejecutarSiembra()
  return NextResponse.json(resultado.body, { status: resultado.status })
}
