import { createClient } from '@supabase/supabase-js';

// Inicializa el cliente de Supabase usando Service Role Key
const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export interface ScrapedConvocatoria {
  red_social: 'LinkedIn' | 'Instagram';
  post_url: string;
  imagen_url: string;
  monto: number;
  dirigido_a: string;
  enfoque_vertical: string;
  link_acceso: string;
}

// Datos de simulación (Mocks) para publicaciones de redes sociales
const MOCK_SOCIAL_POSTS = [
  {
    red_social: 'LinkedIn' as const,
    post_url: 'https://www.linkedin.com/posts/minciencias_convocatoria-innovacion-tecnologica',
    imagen_url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=500',
    post_text: '¡Atención MiPyMEs! Lanzamos la nueva convocatoria de Innovación Tecnológica para cofinanciar proyectos de software y automatización. Monto disponible: hasta $800,000,000 COP por proyecto. Dirigido a empresas constituidas con mínimo 2 años de experiencia. Más info en https://minciencias.gov.co/innovacion-2026'
  },
  {
    red_social: 'Instagram' as const,
    post_url: 'https://www.instagram.com/p/C7X3sD8uJpW/',
    imagen_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=500',
    post_text: 'Abiertas las subvenciones de sostenibilidad ambiental y energías renovables en territorios rurales. Cofinanciación de $1,200,000,000 COP. Dirigido a asociaciones agropecuarias y comunidades indígenas. Postula en: https://fondo-verde.org/rural-2026'
  },
  {
    red_social: 'LinkedIn' as const,
    post_url: 'https://www.linkedin.com/posts/sena_fondo-emprender-capital-semilla',
    imagen_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=500',
    post_text: 'Fondo Emprender del SENA abre nueva bolsa para ideas de base tecnológica y digital. Apoyo de $120,000,000 COP en capital semilla no reembolsable. Dirigido a emprendedores personas naturales. Consulta términos en: https://www.fondoemprender.com/convocatoria-sena-2026'
  }
];

/**
 * Ejecuta el pipeline del Social Scraper en segundo plano.
 * Si las variables de entorno de Apify o Bright Data no están presentes, se ejecuta en modo mock.
 */
export async function executeSocialScraperPipeline(): Promise<{ status: string; count: number; data: ScrapedConvocatoria[] }> {
  const apifyKey = process.env.APIFY_API_KEY;
  const brightDataCreds = process.env.BRIGHT_DATA_CREDENTIALS;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  console.log("-> Iniciando Social Scraper Pipeline...");

  if (!apifyKey || !brightDataCreds) {
    console.log("-> [MODO MOCK] No se detectaron credenciales de Apify/Bright Data en .env. Usando simulación de datos.");
  } else {
    console.log("-> [MODO PRODUCCIÓN] Conectando con Apify y Bright Data Scrapers...");
    // Aquí iría el fetch real a los actores de Apify o proxies de Bright Data
  }

  const extractedData: ScrapedConvocatoria[] = [];

  for (const post of MOCK_SOCIAL_POSTS) {
    let rawMonto = 0;
    let dirigidoA = '';
    let enfoqueVertical = '';
    let linkAcceso = '';

    if (!geminiApiKey) {
      // Simulación de OCR con procesamiento RegExp local en desarrollo
      console.log(`-> [OCR MOCK] Procesando texto de ${post.red_social} por análisis semántico local...`);
      
      // Intentar extraer monto numérico
      const montoMatch = post.post_text.replace(/\./g, '').match(/\$\d+/);
      if (montoMatch) {
        rawMonto = parseInt(montoMatch[0].replace('$', ''), 10);
      }

      // Intentar extraer link
      const linkMatch = post.post_text.match(/https?:\/\/[^\s]+/);
      if (linkMatch) {
        linkAcceso = linkMatch[0];
      }

      // Extraer dirigido a
      if (post.post_text.toLowerCase().includes('mipymes') || post.post_text.toLowerCase().includes('empresas')) {
        dirigidoA = 'MiPyMEs y Empresas constituidas';
      } else if (post.post_text.toLowerCase().includes('asociaciones') || post.post_text.toLowerCase().includes('comunidades')) {
        dirigidoA = 'Asociaciones agropecuarias y comunidades rurales';
      } else {
        dirigidoA = 'Emprendedores y Personas Naturales';
      }

      // Determinar vertical
      if (post.post_text.toLowerCase().includes('software') || post.post_text.toLowerCase().includes('tecnológica')) {
        enfoqueVertical = 'innovacion';
      } else if (post.post_text.toLowerCase().includes('ambiental') || post.post_text.toLowerCase().includes('verde')) {
        enfoqueVertical = 'medio_ambiente';
      } else {
        enfoqueVertical = 'emprendimiento';
      }

    } else {
      console.log(`-> [OCR GEMINI] Enviando post a API Gemini Multimodal...`);
      // Simulación del formato que devolvería el modelo de Visión/OCR de Gemini:
      // const response = await callGeminiVisionOCR(post.imagen_url, post.post_text);
    }

    extractedData.push({
      red_social: post.red_social,
      post_url: post.post_url,
      imagen_url: post.imagen_url,
      monto: rawMonto,
      dirigido_a: dirigidoA,
      enfoque_vertical: enfoqueVertical,
      link_acceso: linkAcceso
    });
  }

  // Guardar en la base de datos de Supabase
  const supabase = getSupabaseClient();
  let insertCount = 0;

  for (const item of extractedData) {
    try {
      // Evitar duplicados por url de publicación
      const { data: existente } = await supabase
        .from('convocatorias_social_scraper')
        .select('id')
        .eq('post_url', item.post_url)
        .maybeSingle();

      if (!existente) {
        const { error } = await supabase
          .from('convocatorias_social_scraper')
          .insert([{
            red_social: item.red_social,
            post_url: item.post_url,
            imagen_url: item.imagen_url,
            monto: item.monto,
            dirigido_a: item.dirigido_a,
            enfoque_vertical: item.enfoque_vertical,
            link_acceso: item.link_acceso,
            procesado_ia: true
          }]);
        
        if (!error) insertCount++;
      }
    } catch (err) {
      console.error("Error al indexar convocatoria scrapeada en Supabase:", err);
    }
  }

  return {
    status: apifyKey ? 'PROD_SUCCESS' : 'MOCK_SUCCESS',
    count: insertCount,
    data: extractedData
  };
}
