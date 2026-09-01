import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Cliente Supabase con Service Role
const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// Antes había aquí un proyecto de mentira ("Carlos Mendoza / Reforestación
// Andina SAS") que se usaba cuando fallaba la base de datos: la carta salía
// redactada sobre un cliente que no existe y el sistema respondía que todo
// había salido bien. Se eliminó. Si no se puede leer el proyecto real, esto
// se detiene y lo dice.

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { proyectoId, convocatoria } = body;

    if (!proyectoId || !convocatoria) {
      return NextResponse.json({ error: 'Faltan parámetros obligatorios (proyectoId o convocatoria)' }, { status: 400 });
    }

    // 1. Obtener los datos reales del proyecto
    const supabase = getSupabaseClient();
    const { data: dbProy, error: dbErr } = await supabase
      .from('proyectos_clientes_serving')
      .select('*')
      .eq('id', proyectoId)
      .maybeSingle();

    if (dbErr || !dbProy) {
      console.error('No se pudo leer el proyecto al pre-postular:', dbErr);
      return NextResponse.json(
        { error: 'No se encontró el proyecto en la base de datos. No se redacta ninguna carta sin los datos reales del cliente.' },
        { status: 404 }
      );
    }

    const proyectoData = {
      id: dbProy.id,
      nombre_cliente: dbProy.nombre_cliente || 'Cliente de Serving',
      nombre_iniciativa: dbProy.nombre_iniciativa || 'Iniciativa Sin Nombre',
      plan_pago: dbProy.plan_pago || 'BASE',
      monto_solicitado_cop: dbProy.monto_solicitado_cop || 0,
      vertical_asignada: dbProy.vertical_asignada || 'General',
      q3_sector: dbProy.q3_sector || 'General',
      descripcion: dbProy.respuestas_fase2_json?.q14_descripcion_detallada || dbProy.respuestas_fase1_json?.q1_nombre_iniciativa || 'Proyecto de Consultoría y Estructuración'
    };

    const targetLang = convocatoria.idioma_origen || 'es';
    const geminiApiKey = process.env.GEMINI_API_KEY;

    let generatedLetter = '';

    // 2. Si hay API Key de Gemini, llamar a Google AI Studio
    if (geminiApiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${geminiApiKey}`;

        const prompt = `Eres un agente de redacción experto de la consultora de proyectos Serving.
Redacta una Carta de Intención (Letter of Intent - LOI) altamente persuasiva y estructurada para postular el siguiente proyecto a la convocatoria provista.
La carta debe redactarse COMPLETAMENTE en el idioma de origen de la convocatoria ("${targetLang}").
Debe incluir:
- Saludo formal a la entidad otorgante: ${convocatoria.entidad_otorgante}.
- Presentación de la iniciativa: "${proyectoData.nombre_iniciativa}" liderada por ${proyectoData.nombre_cliente}.
- Justificación del impacto y alineación con la convocatoria: "${convocatoria.titulo}".
- Solicitud de fondos por un monto acorde a $${proyectoData.monto_solicitado_cop.toLocaleString()} COP.
- Firma de cierre formal en representación de Serving & ${proyectoData.nombre_cliente}.

IMPORTANTE: Bajo ninguna circunstancia uses el término financiero prohibido "anticipo". Si requieres referirte a fondos adelantados para estructuración, usa única y estrictamente el término "Honorarios de Estructuración".

Detalles del Proyecto:
${JSON.stringify(proyectoData)}

Detalles de la Convocatoria:
${JSON.stringify(convocatoria)}
`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }]
          })
        });

        if (response.ok) {
          const resJson = await response.json();
          const rawText = resJson.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            generatedLetter = rawText;
          }
        }
      } catch (geminiErr) {
        console.error("Error al redactar con Gemini:", geminiErr);
      }
    }

    // 3. Fallback Local de Redacción (Si no hay Gemini o falla la llamada)
    if (!generatedLetter) {
      console.log("-> Ejecutando plantilla de redacción de fallback local...");
      if (targetLang === 'en') {
        generatedLetter = `DEAR ${convocatoria.entidad_otorgante.toUpperCase()},\n\n` +
          `On behalf of Serving Proyectos Estratégicos and our client ${proyectoData.nombre_cliente}, we are pleased to submit this Letter of Intent for the project "${proyectoData.nombre_iniciativa}" to be considered for the funding program "${convocatoria.titulo}".\n\n` +
          `Our project aims to implement sustainable solutions in the sector of ${proyectoData.q3_sector}. We are requesting a total financial allocation of $${proyectoData.monto_solicitado_cop.toLocaleString()} COP, which will be strictly used for project execution, including the required Honorarios de Estructuración for our engineering team.\n\n` +
          `We look forward to collaborating with ${convocatoria.entidad_otorgante} to drive high-impact results.\n\n` +
          `Sincerely,\n` +
          `Serving Proyectos Estratégicos & ${proyectoData.nombre_cliente}`;
      } else {
        generatedLetter = `ESTIMADOS DIRECTIVOS DE ${convocatoria.entidad_otorgante.toUpperCase()},\n\n` +
          `A través de la presente, en representación de Serving Proyectos Estratégicos y nuestro cliente ${proyectoData.nombre_cliente}, nos complace presentar la Carta de Intención para la iniciativa "${proyectoData.nombre_iniciativa}" con el fin de postular formalmente a la convocatoria "${convocatoria.titulo}".\n\n` +
          `Nuestra iniciativa se enfoca en el desarrollo tecnológico y social dentro del sector de ${proyectoData.q3_sector}. El presupuesto estimado de cofinanciación solicitado asciende a $${proyectoData.monto_solicitado_cop.toLocaleString()} COP. Este presupuesto cubrirá los gastos operativos y de personal técnico, garantizando los Honorarios de Estructuración necesarios para la viabilidad del proyecto.\n\n` +
          `Agradecemos su atención y quedamos atentos a los siguientes pasos del proceso de pre-postulación.\n\n` +
          `Atentamente,\n` +
          `Serving Proyectos Estratégicos & ${proyectoData.nombre_cliente}`;
      }
    }

    // 4. Agente Supervisor de Cumplimiento: Reemplazar estrictamente cualquier término prohibido ("anticipo")
    const searchRegex = /anticipo/gi;
    const isCompliant = !searchRegex.test(generatedLetter);
    if (!isCompliant) {
      console.log("-> [SUPERVISOR DE CUMPLIMIENTO] Términos prohibidos detectados. Aplicando corrección forzada...");
    }
    
    // Corrección en vivo garantizada
    const sanitizedLetter = generatedLetter.replace(searchRegex, "Honorarios de Estructuración");

    // 5. Registrar la Postulación en la Base de Datos (Supabase o Fallback Local)
    let dbSuccess = false;
    try {
      const { error: logErr } = await supabase
        .from('logs_postulacion')
        .insert([{
          proyecto_id: proyectoData.id,
          nombre_proyecto: proyectoData.nombre_iniciativa,
          convocatoria_nombre: convocatoria.titulo,
          estado: 'Postulado'
        }]);

      if (!logErr) {
        dbSuccess = true;
      } else {
        console.warn("Error insertando log en base de datos:", logErr.message);
      }
    } catch (e) {
      console.warn("Fallo de red al registrar log de postulación en Supabase.");
    }

    return NextResponse.json({
      success: true,
      db_registered: dbSuccess,
      sanitized: !isCompliant,
      convocatoria_titulo: convocatoria.titulo,
      proyecto_nombre: proyectoData.nombre_iniciativa,
      documento_redactado: sanitizedLetter
    });
  } catch (error: any) {
    console.error("Error en API Pre-postulación Convocatorias:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
