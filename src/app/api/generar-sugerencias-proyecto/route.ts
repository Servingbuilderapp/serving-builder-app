import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { urlGemini, fetchGemini } from "@/lib/geminiEndpoint";
import { motorAutorizado } from "@/lib/candadoMotores";

/**
 * Pone sugerencia a las preguntas pendientes que ya existían antes de que el
 * Motor 1 empezara a sugerir (por ejemplo las de un proyecto que quedó parado).
 *
 * Usa lo que el proyecto ya tiene estructurado (que viene del diagnóstico y del
 * documento del cliente). Solo toca preguntas sin responder y sin sugerencia.
 * Si el dato solo lo puede saber el cliente, la deja sin sugerencia.
 */

export const maxDuration = 120;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const MODELOS_GEMINI = ["gemini-3.6-flash", "gemini-3.5-flash", "gemini-2.5-flash"];

const PROMPT = `Eres parte del sistema de Arquitectura Digital de Proyectos. Recibes lo que ya se sabe de un proyecto y una lista de preguntas que se le hicieron al cliente porque faltaba un dato.

Para CADA pregunta, redacta una respuesta sugerida en primera persona, como si la diera el cliente, usando ÚNICAMENTE lo que dice el contenido del proyecto (máximo 80 palabras).
Si el dato solo lo puede saber el cliente (nombres de personas o entidades, NIT, montos, fechas, cifras, ubicación exacta del territorio) o el contenido no alcanza para responder, pon "sugerencia": null. Nunca inventes un dato.

Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después:
{ "sugerencias": [ { "id": "id de la pregunta", "sugerencia": "texto o null" } ] }`;

export async function POST(req: NextRequest) {
  try {
    const { id_proyecto } = await req.json();
    if (!id_proyecto) {
      return NextResponse.json({ error: "Falta id_proyecto" }, { status: 400 });
    }
    if (!(await motorAutorizado(req, id_proyecto))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Falta configurar GEMINI_API_KEY en el servidor" }, { status: 500 });
    }

    const { data: preguntas } = await supabase
      .from("preguntas_pendientes_proyecto")
      .select("id, id_paso, pregunta")
      .eq("id_proyecto", id_proyecto)
      .eq("respondida", false)
      .is("sugerencia", null);

    if (!preguntas || preguntas.length === 0) {
      return NextResponse.json({ ok: true, revisadas: 0, con_sugerencia: 0 });
    }

    const [{ data: pasos }, { data: contenido }, { data: proyecto }] = await Promise.all([
      supabase.from("pasos_estructuracion").select("id, nombre_paso"),
      supabase.from("contenido_pasos_proyecto").select("id_paso, contenido").eq("id_proyecto", id_proyecto),
      supabase.from("proyectos_clientes_serving").select("nombre_iniciativa").eq("id", id_proyecto).maybeSingle(),
    ]);

    const nombrePaso = (id: number) => pasos?.find((p) => p.id === id)?.nombre_paso || `paso ${id}`;

    const resumen = (contenido || [])
      .map((c) => `--- ${nombrePaso(c.id_paso)} ---\n${String(c.contenido || "").slice(0, 2500)}`)
      .join("\n\n")
      .slice(0, 60000);

    const texto = `Proyecto: ${proyecto?.nombre_iniciativa || "sin nombre"}\n\nCONTENIDO YA ESTRUCTURADO:\n${resumen || "(vacío)"}\n\nPREGUNTAS:\n${preguntas
      .map((p) => `- id ${p.id} (${nombrePaso(p.id_paso)}): ${p.pregunta}`)
      .join("\n")}`;

    const cuerpo = {
      systemInstruction: { parts: [{ text: PROMPT }] },
      contents: [{ role: "user", parts: [{ text: texto }] }],
    };

    let textoIA = "";
    for (const modelo of MODELOS_GEMINI) {
      try {
        const r = await fetchGemini(urlGemini(modelo, apiKey), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cuerpo),
          signal: AbortSignal.timeout(80000),
        });
        const data = await r.json();
        if (r.ok) {
          textoIA = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
          break;
        }
        if (r.status !== 503 && r.status !== 429) break;
      } catch {
        // pasa al siguiente modelo
      }
    }

    if (!textoIA) {
      return NextResponse.json({ error: "La IA no pudo responder ahora. Intenta de nuevo en unos minutos." }, { status: 502 });
    }

    const resultado = JSON.parse(textoIA.replace(/```json|```/g, "").trim());
    const lista: { id: string; sugerencia: string | null }[] = Array.isArray(resultado?.sugerencias)
      ? resultado.sugerencias
      : [];

    const idsValidos = new Set(preguntas.map((p) => String(p.id)));
    let conSugerencia = 0;
    for (const s of lista) {
      const texto = typeof s.sugerencia === "string" ? s.sugerencia.trim() : "";
      if (!texto || !idsValidos.has(String(s.id))) continue;
      const { error } = await supabase
        .from("preguntas_pendientes_proyecto")
        .update({ sugerencia: texto })
        .eq("id", s.id);
      if (!error) conSugerencia++;
    }

    return NextResponse.json({ ok: true, revisadas: preguntas.length, con_sugerencia: conSugerencia });
  } catch (err: unknown) {
    console.error("Error en generar-sugerencias-proyecto:", err);
    return NextResponse.json(
      { error: "Error al generar sugerencias", detalle: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
