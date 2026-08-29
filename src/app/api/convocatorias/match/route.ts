import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { CONVOCATORIA_TRANSLATIONS } from '@/lib/convocatoriasTranslations';
import { translateBrandsInObject } from '@/lib/brandProtector';

function getLocalSuggestions(
  convId: string,
  conv: any,
  nota_concepto: any,
  score: number,
  idioma: string
): string[] {
  const isEn = idioma === 'en';
  const suggestions: string[] = [];

  if (convId === 'c1' || convId === '1' || conv.titulo.includes('Verde') || conv.titulo.includes('Green')) {
    if (isEn) {
      suggestions.push(
        "Include a 10% cash contribution from the applicant to satisfy GIZ's mandatory matching funds requirement.",
        "Verify that the applicant organization is registered as a private non-profit with at least 2 years of legal existence.",
        "Detail carbon or water footprint reduction metrics to align with the green indicators of GIZ.",
        "Detail the Structuring Fees clearly instead of placing them under generic advance payment rubrics.",
        "Establish local stakeholder partnerships to ensure community engagement and project sustainability."
      );
    } else {
      suggestions.push(
        "Incorporar un aporte propio del 10% del presupuesto para cumplir con la contrapartida obligatoria de la Cooperación Alemana (GIZ).",
        "Asegurar que la entidad proponente certifique personería jurídica sin fines de lucro con mínimo 2 años de vigencia legal.",
        "Robustecer el marco lógico enfocándose en métricas de reducción de huella de carbono e hídrica.",
        "Estructurar los Honorarios de Estructuración de forma explícita en lugar de gastos administrativos globales.",
        "Agregar actas de concertación previa o alianzas locales con juntas de acción comunal del territorio de impacto."
      );
    }
  } else if (convId === 'c2' || convId === '2' || conv.titulo.includes('STEM') || conv.titulo.includes('Género') || conv.titulo.includes('Gender')) {
    if (isEn) {
      suggestions.push(
        "Ensure all financial accounting and progress reports are prepared and submitted in English.",
        "Focus project objectives directly on vulnerable youth populations and gender equity in developing regions.",
        "Strengthen the core curriculum by introducing specific STEM modules or digital literacy programs.",
        "Allocate the Structuring Fees transparently without mentioning any advance payment concepts.",
        "Provide letters of commitment from local educational institutions to validate the pilot's reach."
      );
    } else {
      suggestions.push(
        "Adecuar toda la contabilidad financiera y preparar los informes de progreso en idioma inglés.",
        "Alinear los objetivos del proyecto directamente con la inclusión de poblaciones juveniles vulnerables y equidad de género.",
        "Fortalecer la propuesta incorporando módulos específicos de educación STEM o alfabetización digital comunitaria.",
        "Definir un presupuesto detallado enfocado exclusivamente bajo el concepto de Honorarios de Estructuración de Serving.",
        "Presentar cartas de intención con colegios o centros comunitarios locales que validen la cobertura del piloto."
      );
    }
  } else if (convId === 'c3' || convId === '3' || conv.titulo.includes('Emprender') || conv.titulo.includes('Aceleración') || conv.titulo.includes('Entrepreneurial')) {
    if (isEn) {
      suggestions.push(
        "Ensure the applicant is a Colombian national of legal age or that the company has been registered for less than 12 months.",
        "Format the business proposal according to the official Fondo Emprender SENA structured methodology.",
        "Highlight the technical innovation, early-stage SaaS design, or applied artificial intelligence.",
        "Include Structuring Fees under specialized consultation items, avoiding terms like advance payments.",
        "Elaborate on market validation and target demographics to demonstrate commercial viability."
      );
    } else {
      suggestions.push(
        "Asegurar que el representante legal sea colombiano mayor de edad y la empresa tenga menos de 12 meses de constitución mercantil.",
        "Estructurar un plan de negocios formal siguiendo la metodología del Fondo Emprender SENA.",
        "Enfocar el componente innovador en base tecnológica, micro-apps o inteligencia artificial aplicada.",
        "Detallar los Honorarios de Estructuración de Serving dentro de la sección de servicios especializados del presupuesto.",
        "Desarrollar el análisis de mercado del SaaS o micro-app demostrando tracción comercial inicial."
      );
    }
  } else if (convId === 'c4' || convId === '4' || conv.titulo.includes('Rural') || conv.titulo.includes('BID') || conv.titulo.includes('IDB')) {
    if (isEn) {
      suggestions.push(
        "Obtain the technical and environmental feasibility endorsement from the corresponding sector ministry.",
        "Integrate green infrastructure elements, such as renewable energies or automated irrigation, into the proposal.",
        "Refine project cash flows to leverage the 24-month grace period and soft interest rate.",
        "Use Structuring Fees instead of any advance payments inside the financial budget worksheets.",
        "Demonstrate direct economic benefits to local farming families and rural communities."
      );
    } else {
      suggestions.push(
        "Tramitar el aval de viabilidad técnica y ambiental ante el ministerio sectorial competente.",
        "Robustecer el modelo de gobernanza rural integrando energías renovables o riego automatizado en la propuesta.",
        "Ajustar el plan de amortización y flujos de caja considerando la tasa blanda y el período de gracia de 24 meses.",
        "Estructurar el presupuesto de costos bajo el concepto de Honorarios de Estructuración.",
        "Detallar el impacto social y económico directo sobre los pequeños productores agrícolas de la región."
      );
    }
  } else if (convId === 'c5' || convId === '5' || conv.titulo.includes('Citibank') || conv.titulo.includes('Salud Digital') || conv.titulo.includes('Venture')) {
    if (isEn) {
      suggestions.push(
        "Verify that a Minimum Viable Product (MVP) is fully functional and validated by real market users.",
        "Prepare the corporate structure to accommodate a 10-15% minority equity stake for the venture fund.",
        "Include a board seat reservation for a representative designated by the Citibank Venture Fund.",
        "List Structuring Fees in the investment budget, avoiding terms like advances or down-payments.",
        "Focus the technical scope on burnout prevention or scalable digital psychological support solutions."
      );
    } else {
      suggestions.push(
        "Acreditar un Producto Mínimo Viable (MVP) funcional y validado con usuarios activos en el mercado.",
        "Estructurar la propuesta corporativa contemplando una participación accionaria minoritaria del 10% al 15% para el fondo.",
        "Aceptar e incluir la reserva de un puesto en la junta directiva para un representante de Citibank.",
        "Garantizar que los Honorarios de Estructuración de Serving estén debidamente desglosados en el flujo de inversión.",
        "Enfocar el desarrollo tecnológico hacia la prevención de burnout laboral y plataformas de apoyo psicológico escalables."
      );
    }
  } else {
    const montoProyecto = Number(nota_concepto.monto_solicitado_cop || 0);
    const montoMaximo = conv.monto_maximo || 0;

    if (isEn) {
      if (montoProyecto > montoMaximo) {
        suggestions.push("Scale down the project budget phases so that the requested funding fits within the maximum limit of " + montoMaximo.toLocaleString() + " COP.");
      }
      suggestions.push(
        "Align the project's strategic keywords with the funding agency's core sectors.",
        "Incorporate quantitative impact metrics directly mapped to the UN Sustainable Development Goals (SDGs).",
        "Detail the Structuring Fees transparently and make sure no advance payment terms are mentioned."
      );
    } else {
      if (montoProyecto > montoMaximo) {
        suggestions.push("Ajustar las fases y presupuesto del proyecto para que el monto solicitado no supere el límite máximo de " + montoMaximo.toLocaleString() + " COP.");
      }
      suggestions.push(
        "Alinear las palabras clave de la propuesta con los sectores clave prioritarios definidos por el fondo.",
        "Incorporar metas e indicadores cuantitativos de impacto vinculados directamente con los Objetivos de Desarrollo Sostenible (ODS).",
        "Estructurar transparentemente todos los rubros bajo el concepto de Honorarios de Estructuración."
      );
    }
  }

  return suggestions.slice(0, 5);
}

// Cliente Supabase con Service Role
const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// Convocatorias locales en caso de que la tabla en Supabase no esté lista
const SEED_CONVOCATORIAS = [
  {
    id: 'c1',
    titulo: 'Fondo Verde para la Acción Climática Local',
    entidad_otorgante: 'Cooperación Alemana (GIZ)',
    monto_maximo: 1200000000,
    tipo_fondeo: 'subvencion',
    fecha_cierre: new Date(Date.now() + 86400000 * 180).toISOString(),
    idioma_origen: 'es',
    sectores_elegibles: [
      'Reforestación y Restauración Ecológica', 
      'Economía Circular y Gestión de Residuos', 
      'Medición de Huella de Carbono', 
      'Medición de Huella Hídrica', 
      'Tratamiento y Conservación de Aguas'
    ],
    requisitos_clave: 'Requiere personería jurídica de derecho privado sin fines de lucro con mínimo 2 años de existencia. Aporte propio del 10% del presupuesto.'
  },
  {
    id: 'c2',
    titulo: 'Subvenciones de Educación STEM y Equidad de Género',
    entidad_otorgante: 'Unión Europea (Grants.gov)',
    monto_maximo: 850000000,
    tipo_fondeo: 'subvencion',
    fecha_cierre: new Date(Date.now() + 86400000 * 120).toISOString(),
    idioma_origen: 'en',
    sectores_elegibles: [
      'Educación STEM para Jóvenes', 
      'Alfabetización Digital Comunitaria', 
      'Plataformas E-learning de Habilidades Blandas'
    ],
    requisitos_clave: 'Must target vulnerable youth populations in developing regions. All financial accounting and progress reports must be submitted in English.'
  },
  {
    id: 'c3',
    titulo: 'Programa Nacional de Aceleración y Fomento Empresarial',
    entidad_otorgante: 'Fondo Emprender SENA',
    monto_maximo: 150000000,
    tipo_fondeo: 'fomento',
    fecha_cierre: new Date(Date.now() + 86400000 * 90).toISOString(),
    idioma_origen: 'es',
    sectores_elegibles: [
      'Startups Tecnológicas en Fase Temprana', 
      'Micro-apps y SaaS para PyMEs', 
      'Comercio Electrónico y D2C', 
      'Inteligencia Artificial Aplicada'
    ],
    requisitos_clave: 'Emprendedores colombianos mayores de edad o empresas con menos de 12 meses de constitución mercantil. Requiere plan de negocio estructurado.'
  },
  {
    id: 'c4',
    titulo: 'Línea de Crédito de Desarrollo Rural Sostenible',
    entidad_otorgante: 'Banco Interamericano de Desarrollo (BID)',
    monto_maximo: 5000000000,
    tipo_fondeo: 'credito',
    fecha_cierre: new Date(Date.now() + 86400000 * 365).toISOString(),
    idioma_origen: 'es',
    sectores_elegibles: [
      'Infraestructura Comunitaria Sostenible', 
      'Energías Renovables', 
      'Sistemas de Riego Automatizado'
    ],
    requisitos_clave: 'Requiere aval de viabilidad técnica y ambiental del ministerio sectorial. Tasa de interés blanda con período de gracia de 24 meses.'
  },
  {
    id: 'c5',
    titulo: 'Fondo de Capital de Riesgo para Salud Digital y Bienestar',
    entidad_otorgante: 'Citibank Global Venture Fund',
    monto_maximo: 3000000000,
    tipo_fondeo: 'capital_riesgo',
    fecha_cierre: new Date(Date.now() + 86400000 * 270).toISOString(),
    idioma_origen: 'en',
    sectores_elegibles: [
      'Plataformas de Apoyo Psicológico Digital', 
      'Salud y Seguridad en el Trabajo (SST)', 
      'Prevención de Desgaste Laboral (Burnout)'
    ],
    requisitos_clave: 'Scalable digital solutions with MVP already validated in the market. Minority equity stake (10-15%) and board seat required.'
  }
];

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { nota_concepto, idioma = 'es' } = body;

    if (!nota_concepto) {
      return NextResponse.json({ error: 'Falta nota_concepto en el cuerpo de la petición' }, { status: 400 });
    }

    // 1. Obtener convocatorias activas (Supabase o Fallback Local)
    let convocatorias = [...SEED_CONVOCATORIAS];
    try {
      const supabase = getSupabaseClient();
      const { data: dbConvocatorias, error: dbErr } = await supabase
        .from('tabla_convocatorias')
        .select('*');

      if (!dbErr && dbConvocatorias && dbConvocatorias.length > 0) {
        convocatorias = dbConvocatorias;
      }
    } catch (e) {
      console.warn("Fallo de conexión a Supabase. Usando convocatorias semilla de fallback.");
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // 2. Si hay API Key de Gemini, llamar a Google AI Studio
    if (geminiApiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`;
        
        const simplifiedConvs = convocatorias.map(c => ({
          id: c.id,
          titulo: c.titulo,
          entidad: c.entidad_otorgante,
          monto_maximo: c.monto_maximo,
          tipo: c.tipo_fondeo,
          sectores: c.sectores_elegibles,
          requisitos: c.requisitos_clave
        }));

        const prompt = `Eres un evaluador de convocatorias experto de la firma de consultoría Serving.
Toma los datos del proyecto (Nota de Concepto) y compáralos con la lista de convocatorias de financiamiento.
Debes calcular un porcentaje de match (0-100%) para cada convocatoria.
Traduce toda la información de cada convocatoria (incluyendo "titulo", "entidad_otorgante", "requisitos_clave", "sectores_elegibles") y redacta una "justificacion_estrategica" personalizada, todo en el idioma "${idioma}".

Si el score de compatibilidad (match_percentage) para una convocatoria es inferior al 90%, debes generar una lista de 3 a 5 sugerencias y requerimientos técnicos específicos basados en los hitos faltantes o debilidades del borrador (campo "sugerencias_optimizacion", que debe ser un arreglo de strings), explicándole claramente al cliente qué debe ajustar o agregar en su propuesta/matriz para elevar su probabilidad a más de un 90%. Si el score es igual o mayor a 90%, este campo debe ser un arreglo vacío.

REGLA DE CUMPLIMIENTO: Bajo ninguna circunstancia uses el término financiero prohibido "anticipo". Si necesitas referirte a fondos adelantados para estructuración o similares, usa única y estrictamente el término "Honorarios de Estructuración". Esto aplica para todo el texto generado (incluyendo justificaciones y sugerencias).

Tu respuesta debe ser únicamente un arreglo JSON plano, sin bloques de código markdown como \`\`\`json ni formatos adicionales. Cada elemento del arreglo debe ser un objeto con los siguientes campos exactos:
- id (el ID de la convocatoria evaluada)
- match_percentage (el porcentaje calculado, como número de 0 a 100)
- titulo (el título traducido si aplica)
- entidad_otorgante (la entidad traducida si aplica)
- requisitos_clave (los requisitos traducidos si aplica)
- sectores_elegibles (los sectores traducidos si aplica)
- justificacion_estrategica (la justificación detallada en el idioma solicitado)
- sugerencias_optimizacion (un arreglo de 3 a 5 strings con sugerencias si el score < 90, de lo contrario un arreglo vacío)

Nota de Concepto del Proyecto:
- Nombre: ${nota_concepto.nombre_iniciativa || 'Proyecto sin nombre'}
- Sector: ${nota_concepto.sector || ''}
- Presupuesto Requerido (COP): $${nota_concepto.monto_solicitado_cop || 0} COP
- Descripción: ${nota_concepto.descripcion || ''}

Lista de Convocatorias a Evaluar:
${JSON.stringify(simplifiedConvs)}
`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              responseMimeType: "application/json"
            }
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            const matches = JSON.parse(rawText.trim());
            // Vincular de vuelta las convocatorias completas con los scores y traducciones
            const results = convocatorias.map(conv => {
              const matchInfo = matches.find((m: any) => m.convocatoria_id === conv.id || m.id === conv.id);
              
              // Si es una convocatoria semilla, forzar sus traducciones locales del catálogo para máxima fidelidad
              const seedTrans = CONVOCATORIA_TRANSLATIONS[conv.id]?.[idioma] || CONVOCATORIA_TRANSLATIONS[conv.id]?.es;

              const match_percentage = matchInfo ? Number(matchInfo.match_percentage) : 0;
              let sugerencias_optimizacion = matchInfo?.sugerencias_optimizacion || [];
              
              if ((!sugerencias_optimizacion || sugerencias_optimizacion.length === 0) && match_percentage < 90) {
                sugerencias_optimizacion = getLocalSuggestions(conv.id, conv, nota_concepto, match_percentage, idioma);
              }

              return {
                ...conv,
                titulo: seedTrans ? seedTrans.titulo : (matchInfo?.titulo || conv.titulo),
                entidad_otorgante: seedTrans ? seedTrans.entidad_otorgante : (matchInfo?.entidad_otorgante || conv.entidad_otorgante),
                requisitos_clave: seedTrans ? seedTrans.requisitos_clave : (matchInfo?.requisitos_clave || conv.requisitos_clave),
                sectores_elegibles: seedTrans ? seedTrans.sectores_elegibles : (matchInfo?.sectores_elegibles || conv.sectores_elegibles),
                match_percentage,
                justificacion_estrategica: matchInfo?.justificacion_estrategica || 
                  (seedTrans ? (match_percentage >= 70 ? seedTrans.justificacion_high : seedTrans.justificacion_low) : 'No analysis.'),
                sugerencias_optimizacion
              };
            });
            const sanitizedResults = translateBrandsInObject(results);
            return NextResponse.json(sanitizedResults);
          }
        }
      } catch (geminiErr) {
        console.error("Error al llamar o procesar con Gemini:", geminiErr);
      }
    }

    // 3. Fallback Local de Emparejamiento Semántico Algorítmico (Si no hay internet/Gemini falla)
    console.log("-> Ejecutando emparejamiento semántico algorítmico local de fallback...");
    const matchedResults = convocatorias.map(conv => {
      let score = 20; // Puntuación base
      const sectorProyecto = (nota_concepto.sector || '').toLowerCase();
      const descProyecto = (nota_concepto.descripcion || '').toLowerCase();
      const montoProyecto = Number(nota_concepto.monto_solicitado_cop || 0);

      // A. Coincidencia de Sectores específicos
      const matchingSectores = conv.sectores_elegibles.filter(sec => 
        sectorProyecto.includes(sec.toLowerCase()) || 
        sec.toLowerCase().includes(sectorProyecto) ||
        descProyecto.includes(sec.toLowerCase())
      );

      if (matchingSectores.length > 0) {
        score += 40 + (matchingSectores.length * 10);
      }

      // B. Viabilidad de Presupuesto (Monto Máximo)
      if (montoProyecto > 0 && montoProyecto <= conv.monto_maximo) {
        score += 20;
      } else if (montoProyecto > conv.monto_maximo) {
        score -= 10;
      }

      // C. Coincidencia por tipo de fondeo
      if (conv.tipo_fondeo === 'subvencion' && (descProyecto.includes('social') || descProyecto.includes('verde') || descProyecto.includes('comunidad'))) {
        score += 10;
      }

      // Limitar a rango 0-100%
      const finalScore = Math.min(100, Math.max(0, score));

      // Buscar traducciones locales del catálogo semilla
      const seedTrans = CONVOCATORIA_TRANSLATIONS[conv.id]?.[idioma] || CONVOCATORIA_TRANSLATIONS[conv.id]?.es;

      let title = conv.titulo;
      let entidad = conv.entidad_otorgante;
      let requisitos = conv.requisitos_clave;
      let sectores = conv.sectores_elegibles;
      let justificacion = '';

      if (seedTrans) {
        title = seedTrans.titulo;
        entidad = seedTrans.entidad_otorgante;
        requisitos = seedTrans.requisitos_clave;
        sectores = seedTrans.sectores_elegibles;
        justificacion = finalScore >= 70 ? seedTrans.justificacion_high : seedTrans.justificacion_low;
      } else {
        // Fallback genérico para registros que no sean semilla
        if (idioma === 'en') {
          justificacion = `The project matches this funding program at a ${finalScore}% level. ` +
            (finalScore >= 70 
              ? `The sector '${nota_concepto.sector}' has high alignment with the eligible areas of ${conv.entidad_otorgante}. Financial cap is respected.` 
              : `The project aligns in some areas, but needs to customize its indicators to meet the specific requirements of ${conv.entidad_otorgante}.`);
        } else {
          justificacion = `El proyecto tiene una afinidad del ${finalScore}% con la convocatoria. ` +
            (finalScore >= 70 
              ? `El sector '${nota_concepto.sector}' tiene alta coincidencia con las directrices de ${conv.entidad_otorgante}. El techo de $${conv.monto_maximo.toLocaleString()} COP cubre el presupuesto solicitado.`
              : `Existe alineación sectorial básica, pero se sugiere reformular los objetivos y adecuar la propuesta a los requisitos particulares de ${conv.entidad_otorgante}.`);
        }
      }

      let sugerencias_optimizacion: string[] = [];
      if (finalScore < 90) {
        sugerencias_optimizacion = getLocalSuggestions(conv.id, conv, nota_concepto, finalScore, idioma);
      }

      return {
        ...conv,
        titulo: title,
        entidad_otorgante: entidad,
        requisitos_clave: requisitos,
        sectores_elegibles: sectores,
        match_percentage: finalScore,
        justificacion_estrategica: justificacion,
        sugerencias_optimizacion
      };
    });

    // Ordenar de mayor a menor score
    matchedResults.sort((a, b) => b.match_percentage - a.match_percentage);

    const sanitizedResults = translateBrandsInObject(matchedResults);
    return NextResponse.json(sanitizedResults);
  } catch (error: any) {
    console.error("Error en API Match Convocatorias:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
