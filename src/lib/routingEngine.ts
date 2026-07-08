import { createClient } from '@supabase/supabase-js';

// Inicializa el cliente de Supabase usando Service Role Key
const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export interface RoutingResult {
  vertical_asignada: string;
  experto_sugerido_nombre: string;
  experto_sugerido_id: string | null;
  routing_predictivo: Record<string, number>;
}

/**
 * Calcula de forma dinámica la vertical asignada y el especialista sugerido
 * basándose en el sector y tipo de solicitante, sin pesos numéricos ni porcentajes quemados.
 */
export async function calculatePredictiveRouting(
  respuestasFase1: any,
  montoSolicitadoCop: number,
  iniciativaId: string
): Promise<RoutingResult> {
  console.log("-> Iniciando enrutamiento dinámico para:", respuestasFase1?.q1_nombre_iniciativa || iniciativaId);
  
  let sector = respuestasFase1?.q3_sector || '';
  const tipoSolicitante = respuestasFase1?.q4_tipo_solicitante || '';

  // Mapeo dinámico de subsectores específicos a categorías generales para mantener compatibilidad
  const sectorMapping: Record<string, string> = {
    // Agro / Agroindustrial
    'Ganadería Tecnificada (Ganadería Pro)': 'Agropecuario',
    'Cultivo de Arándanos y Frutas de Exportación': 'Agropecuario',
    'Agricultura de Precisión e Hidroponía': 'Agropecuario',
    'Procesamiento Agroindustrial de Alimentos': 'Agroindustrial',
    'Sistemas de Riego Automatizado': 'Agroindustrial',
    'Certificaciones Orgánicas y Comercio Justo': 'Agroindustrial',
    // Innovación / Tecnología
    'Inteligencia Artificial Aplicada': 'Tecnología y Software',
    'Tecnología Dermocosmética (Skin-Tech)': 'Tecnología y Software',
    'Blockchain y Tokenización de Activos': 'Tecnología y Software',
    'Internet de las Cosas (IoT) Industrial': 'Tecnología y Software',
    'Impresión 3D y Manufactura Aditiva': 'Tecnología y Software',
    'Ciberseguridad y Protección de Datos': 'Tecnología y Software',
    // Emprendimiento / Empresas
    'Micro-apps y SaaS para PyMEs': 'Comercio y Retail',
    'Startups Tecnológicas en Fase Temprana': 'Comercio y Retail',
    'Financiamiento y Aceleración de Negocios': 'Comercio y Retail',
    'Modelos de Negocio Franquiciables': 'Comercio y Retail',
    'Comercio Electrónico y D2C': 'Comercio y Retail',
    'Desarrollo de Proveedores Locales': 'Comercio y Retail',
    // Salud Mental
    'Salud y Seguridad en el Trabajo (SST)': 'Salud y Ciencias de la Vida',
    'Programas de Bienestar y Clima Organizacional': 'Salud y Ciencias de la Vida',
    'Plataformas de Apoyo Psicológico Digital': 'Salud y Ciencias de la Vida',
    'Prevención de Desgaste Laboral (Burnout)': 'Salud y Ciencias de la Vida',
    'Mindfulness y Terapia Ocupacional': 'Salud y Ciencias de la Vida',
    'Intervención de Estrés Postraumático Comunitario': 'Salud y Ciencias de la Vida',
    // Proyectos Sociales / Vulnerabilidad
    'Empoderamiento de Mujeres Rurales': 'Social y ONG',
    'Integración de Población Migrante': 'Social y ONG',
    'Infraestructura Comunitaria Sostenible': 'Social y ONG',
    'Reducción de Pobreza Extrema': 'Social y ONG',
    'Soberanía Alimentaria en Zonas Vulnerables': 'Social y ONG',
    'Inclusión de Personas con Discapacidad': 'Social y ONG',
    // Educación / Cultura
    'Formación en Liderazgo y Gobernanza': 'Educación',
    'Educación STEM para Jóvenes': 'Educación',
    'Preservación de Patrimonio Cultural': 'Educación',
    'Escuelas de Formación Artística': 'Educación',
    'Plataformas E-learning de Habilidades Blandas': 'Educación',
    'Alfabetización Digital Comunitaria': 'Educación',
    // Medio Ambiente
    'Medición de Huella de Carbono': 'Medio Ambiente y Sostenibilidad',
    'Medición de Huella Hídrica': 'Medio Ambiente y Sostenibilidad',
    'Economía Circular y Gestión de Residuos': 'Medio Ambiente y Sostenibilidad',
    'Tratamiento y Conservación de Aguas': 'Medio Ambiente y Sostenibilidad',
    'Reforestación y Restauración Ecológica': 'Medio Ambiente y Sostenibilidad',
    'Bioenergía y Compostaje Industrial': 'Medio Ambiente y Sostenibilidad'
  };

  if (sectorMapping[sector]) {
    sector = sectorMapping[sector];
  }

  let vertical_asignada = 'Banca';
  let experto_sugerido_nombre = 'Lorena Ramírez';

  // Obtener plan de pago para validación de restricciones
  let plan = 'BASE';
  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(iniciativaId);
  if (isUuid) {
    try {
      const supabase = getSupabaseClient();
      const { data } = await supabase
        .from('proyectos_clientes_serving')
        .select('plan_pago')
        .eq('id', iniciativaId)
        .limit(1)
        .maybeSingle();
      if (data && data.plan_pago) {
        plan = data.plan_pago.toUpperCase();
      }
    } catch (err) {
      console.error("Error al obtener plan para enrutamiento:", err);
    }
  }

  // Regla dinámica 1: Sector Agropecuario/Agroindustrial o Turismo y Hotelería
  if (sector === 'Agropecuario' || sector === 'Agroindustrial' || sector === 'Turismo y Hotelería') {
    vertical_asignada = 'Fondo Emprender';
    experto_sugerido_nombre = 'Yeison Arcia';
  }
  // Regla dinámica 2: Entidades comunitarias, públicas o sin ánimo de lucro (Subvenciones)
  else if (
    tipoSolicitante === 'Entidad Sin Ánimo de Lucro' ||
    tipoSolicitante === 'Asociación o Cooperativa' ||
    tipoSolicitante === 'Junta de Acción Comunal' ||
    tipoSolicitante === 'Cabildo o Resguardo' ||
    tipoSolicitante === 'Consejo Comunitario' ||
    tipoSolicitante === 'Entidad Pública'
  ) {
    // El Especialista en Subvenciones (Estructurador Senior) requiere Plan PRO, VIP o TOP
    if (plan === 'BASE') {
      vertical_asignada = 'Estructuración';
      experto_sugerido_nombre = 'Estructuración';
    } else {
      vertical_asignada = 'Subvenciones';
      experto_sugerido_nombre = 'Estructurador Senior';
    }
  }
  // Regla dinámica 3: Sector de Alta Tecnología o Fintech
  else if (sector === 'Tecnología y Software' || sector === 'Fintech y Servicios Financieros' || sector === 'Arte, Cultura y Entretenimiento') {
    vertical_asignada = 'Tokenización';
    experto_sugerido_nombre = 'Edward';
  }
  // Regla dinámica 4: Infraestructura y construcción (Broker Internacional)
  else if (sector === 'Infraestructura y Construcción' || sector === 'Energías Renovables') {
    vertical_asignada = 'Broker Internacional';
    experto_sugerido_nombre = 'Alfonso Beltrán';
  }
  // Regla dinámica 5: Empresas constituidas del sector manufacturero o comercial
  else if (sector === 'Comercio y Retail' || sector === 'Industria Manufacturera' || sector === 'Logística y Transporte') {
    vertical_asignada = 'CFC';
    experto_sugerido_nombre = 'Marco Campoverde';
  }
  // Regla dinámica de respaldo
  else {
    vertical_asignada = 'Banca';
    experto_sugerido_nombre = 'Lorena Ramírez';
  }

  // Buscar dinámicamente el experto en la base de datos
  let experto_sugerido_id: string | null = null;
  try {
    const supabase = getSupabaseClient();
    const { data: experto } = await supabase
      .from('expertos')
      .select('id')
      .eq('nombre', experto_sugerido_nombre)
      .limit(1)
      .maybeSingle();

    if (experto) {
      experto_sugerido_id = experto.id;
    }
  } catch (dbErr) {
    console.error("Error al buscar id del experto en Supabase:", dbErr);
  }

  // Generar la matriz binaria de afinidad para mantener compatibilidad con el dashboard
  const routing_predictivo: Record<string, number> = {
    "Fondo Emprender (Ruta asignada a Yeison Arcia)": vertical_asignada === 'Fondo Emprender' ? 100 : 0,
    "Subvención (Ruta asignada a Estructurador Senior)": vertical_asignada === 'Subvenciones' ? 100 : 0,
    "Tokenización (Ruta asignada a Edward)": vertical_asignada === 'Tokenización' ? 100 : 0,
    "Préstamo por Broker Internacional (Ruta asignada a Alfonso Beltrán)": vertical_asignada === 'Broker Internacional' ? 100 : 0,
    "Crédito blando con CFC (Ruta asignada a Marco Campoverde)": vertical_asignada === 'CFC' ? 100 : 0,
    "Banca Internacional y Nacional (Ruta asignada a Lorena Ramírez)": vertical_asignada === 'Banca' ? 100 : 0,
  };

  return {
    vertical_asignada,
    experto_sugerido_nombre,
    experto_sugerido_id,
    routing_predictivo
  };
}
