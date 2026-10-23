import { NextRequest, NextResponse } from "next/server";
import { urlGemini, fetchGemini } from "@/lib/geminiEndpoint";
import { after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { esLlamadaInterna } from "@/lib/candadoMotores";

// El motor puede tardar minutos: sin esto Vercel lo corta antes de terminar.
export const maxDuration = 300;

/**
 * Modelos de Gemini que sabe usar este motor, en orden de preferencia.
 * Google reparte el cupo por modelo: cuando uno se agota o se congestiona, los
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

// Regla de extensión (26 sep 2026), misma cuenta que usa
// estructurar-proyecto/route.ts para el documento completo: el proyecto
// final debe salir entre 75 y 150 páginas en total (~500 palabras por
// página), repartidas entre los ~42 pasos de la metodología. Este archivo
// completa un paso a la vez, así que se le pide ese mismo nivel de
// profundidad por paso para que no quede corto frente a los demás.
const PALABRAS_MIN_PASO = Math.round((75 * 500) / 42);
const PALABRAS_MAX_PASO = Math.round((150 * 500) / 42);

const PROMPT_RESPUESTA = `
Eres el MOTOR DE ESTRUCTURACIÓN del sistema de Arquitectura Digital de Proyectos, trabajando ahora en modo de COMPLETAR UN PASO ESPECÍFICO a partir de la respuesta que el cliente acaba de dar a una pregunta puntual.

Recibirás: el nombre del paso a completar, la pregunta que se le hizo al cliente, y la respuesta que dio.

Tu tarea es redactar el contenido completo y técnico de ESE paso específico, usando la respuesta del cliente como base. Redacta con el mismo nivel de calidad y profundidad que usarías si tuvieras el documento completo del proyecto.

REGLA DE EXTENSIÓN: este paso, igual que todos los demás del proyecto, debe salir como documento profesional real, no como resumen — apunta a algo entre ${PALABRAS_MIN_PASO} y ${PALABRAS_MAX_PASO} palabras, con contexto, justificación e implicaciones. Puede quedar más corto SOLO si de verdad no hay más información real que desarrollar sin inventar — nunca alargues con relleno, repetición, ni datos que el cliente no dio.

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
    const respuesta = await fetchGemini(urlGemini(MODELOS_GEMINI[Math.min(intento - 1, MODELOS_GEMINI.length - 1)], apiKey),
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
    const { id_pregunta, respuesta, es_supuesto, sin_respuesta } = await req.json();
    // Supuesto: el cliente no respondió a tiempo y el reloj aplicó la sugerencia.
    // Solo lo puede pedir la propia plataforma (llave interna), nunca un cliente.
    const llamadaInterna = esLlamadaInterna(req);
    const comoSupuesto = es_supuesto === true && llamadaInterna;
    // Sin respuesta ni sugerencia: el paso se redacta solo con lo que ya hay y queda "por reforzar".
    const sinRespuesta = sin_respuesta === true && llamadaInterna;

    if (!id_pregunta || (!sinRespuesta && (!respuesta || !respuesta.trim()))) {
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
      .select("id, id_proyecto, id_paso, pregunta, respondida, es_supuesto")
      .eq("id", id_pregunta)
      .single();

    if (errorPregunta || !preguntaRow) {
      return NextResponse.json(
        { error: "No se encontró la pregunta", detalle: errorPregunta?.message },
        { status: 404 }
      );
    }

    // Una pregunta ya respondida no se vuelve a procesar, salvo que su respuesta
    // haya sido un supuesto del sistema y el cliente venga a corregirla.
    const clienteCorrigeSupuesto =
      preguntaRow.respondida === true &&
      preguntaRow.es_supuesto === true &&
      !comoSupuesto &&
      !sinRespuesta;

    if (preguntaRow.respondida && !clienteCorrigeSupuesto) {
      return NextResponse.json({ ok: true, ya_estaba_respondida: true });
    }

    const { data: pasoRow } = await supabase
      .from("pasos_estructuracion")
      .select("nombre_paso")
      .eq("id", preguntaRow.id_paso)
      .single();

    const nombrePaso = pasoRow?.nombre_paso || `paso ${preguntaRow.id_paso}`;

    let textoParaGemini = `Paso a completar: ${nombrePaso}\n\nPregunta que se le hizo al cliente: ${preguntaRow.pregunta}\n\nRespuesta del cliente: ${respuesta}`;

    if (sinRespuesta) {
      const { data: previo } = await supabase
        .from("contenido_pasos_proyecto")
        .select("id_paso, contenido")
        .eq("id_proyecto", preguntaRow.id_proyecto);
      const contexto = (previo || [])
        .map((c) => String(c.contenido || "").slice(0, 1500))
        .join("\n\n")
        .slice(0, 50000);
      textoParaGemini = `Paso a completar: ${nombrePaso}\n\nPregunta que se le hizo al cliente: ${preguntaRow.pregunta}\n\nEl cliente NO respondió. Redacta este paso usando ÚNICAMENTE lo que ya se sabe del proyecto (abajo). No inventes ningún dato, cifra, nombre ni fuente. Si no hay base suficiente, escribe una versión breve y deja claro qué falta, y pon una advertencia.\n\nLO QUE YA SE SABE DEL PROYECTO:\n${contexto || "(nada todavía)"}`;
    }

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
      advertencia: sinRespuesta
        ? "Por reforzar: el cliente no respondió a tiempo y este paso se redactó solo con lo que ya había en el proyecto. Falta que el cliente aporte este dato."
        : comoSupuesto
          ? "Supuesto por confirmar: el cliente no respondió a tiempo y se usó la sugerencia armada con su diagnóstico y documento."
          : resultado.advertencia || null,
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
        respuesta: sinRespuesta ? "(sin respuesta del cliente)" : respuesta,
        es_supuesto: comoSupuesto || sinRespuesta,
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
