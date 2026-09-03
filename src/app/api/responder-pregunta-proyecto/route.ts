import { NextRequest, NextResponse } from "next/server";
import { after } from "next/server";
import { createClient } from "@supabase/supabase-js";

// El motor puede tardar minutos: sin esto Vercel lo corta antes de terminar.
export const maxDuration = 300;

/**
 * Modelos de Gemini que sabe usar este motor, en orden de preferencia.
 * Google limita el uso por modelo: cuando uno se agota o se congestiona, los
 * demas siguen disponibles. Cada reintento usa el siguiente de la lista, asi
 * que quedarse sin cupo en uno ya no deja el motor muerto.
 */
const MODELOS_GEMINI = [
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-2.5-flash",
];


const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UMBRAL_MINIMO_PORCENTAJE = 90;

const PROMPT_RESPUESTA = `
Eres el MOTOR DE ESTRUCTURACIÓN del sistema de Arquitectura Digital de Proyectos, trabajando ahora en modo de COMPLETAR UN PASO ESPECÍFICO a partir de la respuesta que el cliente acaba de dar a una pregunta puntual.

Recibirás: el nombre del paso a completar, la pregunta que se le hizo al cliente, y la respuesta que dio.

Tu tarea es redactar el contenido completo y técnico de ESE paso específico, usando la respuesta del cliente como base. Redacta con el mismo nivel de calidad y profundidad que usarías si tuvieras el documento completo del proyecto.

Si la respuesta del cliente sigue sin ser suficiente para completar el paso con solidez, igual redacta lo mejor posible con lo que tienes, pero agrega una advertencia breve explicando qué se debería reforzar más adelante.

Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después, con este formato exacto:
{
  "contenido": "texto desarrollado del paso, usando la respuesta del cliente",
  "advertencia": null
}

o, si quedó débil:

{
  "contenido": "texto desarrollado del paso...",
  "advertencia": "breve explicación de qué se debería reforzar"
}
`;

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function llamarGeminiConReintentos(
  apiKey: string,
  body: any,
  maxIntentos = MODELOS_GEMINI.length
): Promise<{ ok: boolean; data: any }> {
  let ultimoResultado: { ok: boolean; data: any } = { ok: false, data: null };

  for (let intento = 1; intento <= maxIntentos; intento++) {
    const respuesta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${MODELOS_GEMINI[Math.min(intento - 1, MODELOS_GEMINI.length - 1)]}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    const data = await respuesta.json();

    if (respuesta.ok) {
      return { ok: true, data };
    }

    ultimoResultado = { ok: false, data };

    const esErrorTemporal = respuesta.status === 503 || respuesta.status === 429;
    const quedanIntentos = intento < maxIntentos;

    if (esErrorTemporal && quedanIntentos) {
      await esperar(intento * 5000);
      continue;
    }

    return ultimoResultado;
  }

  return ultimoResultado;
}

export async function POST(req: NextRequest) {
  try {
    const { id_pregunta, respuesta } = await req.json();

    if (!id_pregunta || !respuesta || !respuesta.trim()) {
      return NextResponse.json(
        { error: "Falta id_pregunta o respuesta" },
        { status: 400 }
      );
    }

    const apiKeyGemini = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
    if (!apiKeyGemini) {
      return NextResponse.json(
        { error: "Falta configurar GEMINI_API_KEY en el servidor" },
        { status: 500 }
      );
    }

    const { data: preguntaRow, error: errorPregunta } = await supabase
      .from("preguntas_pendientes_proyecto")
      .select("id, id_proyecto, id_paso, pregunta, respondida")
      .eq("id", id_pregunta)
      .single();

    if (errorPregunta || !preguntaRow) {
      return NextResponse.json(
        { error: "No se encontró la pregunta", detalle: errorPregunta?.message },
        { status: 404 }
      );
    }

    if (preguntaRow.respondida) {
      return NextResponse.json({ ok: true, ya_estaba_respondida: true });
    }

    const { data: pasoRow } = await supabase
      .from("pasos_estructuracion")
      .select("nombre_paso")
      .eq("id", preguntaRow.id_paso)
      .single();

    const nombrePaso = pasoRow?.nombre_paso || `paso ${preguntaRow.id_paso}`;

    const textoParaGemini = `Paso a completar: ${nombrePaso}\n\nPregunta que se le hizo al cliente: ${preguntaRow.pregunta}\n\nRespuesta del cliente: ${respuesta}`;

    const cuerpoSolicitud = {
      systemInstruction: { parts: [{ text: PROMPT_RESPUESTA }] },
      contents: [{ role: "user", parts: [{ text: textoParaGemini }] }],
    };

    const { ok: geminiOk, data: dataGemini } = await llamarGeminiConReintentos(
      apiKeyGemini,
      cuerpoSolicitud
    );

    if (!geminiOk) {
      console.error("Error de Gemini al responder pregunta:", JSON.stringify(dataGemini));
      return NextResponse.json(
        { error: "La API de Gemini devolvió un error", detalle: dataGemini },
        { status: 500 }
      );
    }

    const textoRespuestaIA = dataGemini.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const jsonLimpio = textoRespuestaIA.replace(/```json|```/g, "").trim();
    const resultado = JSON.parse(jsonLimpio);

    await supabase.from("contenido_pasos_proyecto").upsert({
      id_proyecto: preguntaRow.id_proyecto,
      id_paso: preguntaRow.id_paso,
      contenido: resultado.contenido,
      advertencia: resultado.advertencia || null,
    });

    await supabase.from("avance_estructuracion_proyecto").upsert({
      proyecto_id: preguntaRow.id_proyecto,
      paso_id: preguntaRow.id_paso,
      completado: true,
      fecha_completado: new Date().toISOString(),
    });

    await supabase
      .from("preguntas_pendientes_proyecto")
      .update({
        respuesta,
        respondida: true,
        respondido_en: new Date().toISOString(),
      })
      .eq("id", id_pregunta);

    const { data: proyectoAntes } = await supabase
      .from("proyectos_clientes_serving")
      .select("listo_para_encaje")
      .eq("id", preguntaRow.id_proyecto)
      .maybeSingle();

    const yaEstabaListo = proyectoAntes?.listo_para_encaje === true;

    const { data: criticasPendientes } = await supabase
      .from("preguntas_pendientes_proyecto")
      .select("id")
      .eq("id_proyecto", preguntaRow.id_proyecto)
      .eq("respondida", false)
      .eq("critico", true);

    const { data: porcentajeActual } = await supabase.rpc("calcular_avance_estructuracion", {
      id_proyecto: preguntaRow.id_proyecto,
    });

    const sinCriticasPendientes = !criticasPendientes || criticasPendientes.length === 0;
    const cumplePorcentajeMinimo = (porcentajeActual || 0) >= UMBRAL_MINIMO_PORCENTAJE;
    const listoParaEncaje = sinCriticasPendientes && cumplePorcentajeMinimo;

    await supabase
      .from("proyectos_clientes_serving")
      .update({ listo_para_encaje: listoParaEncaje })
      .eq("id", preguntaRow.id_proyecto);

    if (listoParaEncaje && !yaEstabaListo) {
      const origen = req.nextUrl.origin;
      const idProyecto = preguntaRow.id_proyecto;
      after(async () => {
        try {
          await fetch(`${origen}/api/buscar-convocatorias`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id_proyecto: idProyecto }),
          });
        } catch (e) {
          console.error("Error disparando Motor 2 desde responder-pregunta-proyecto:", e);
        }
      });
    }

    return NextResponse.json({ ok: true, listo_para_encaje: listoParaEncaje });
  } catch (err: any) {
    console.error("Error en responder-pregunta-proyecto:", err);
    return NextResponse.json(
      { error: "Error al procesar la respuesta", detalle: err?.message || String(err) },
      { status: 500 }
    );
  }
}
