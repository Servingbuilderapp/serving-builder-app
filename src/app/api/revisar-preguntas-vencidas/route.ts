import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { motorAutorizado, cabecerasInternas } from "@/lib/candadoMotores";
import { buildEmailTemplate, sendEmail } from "@/lib/email";

/**
 * El reloj de las 24 horas para las preguntas pendientes del Motor 1.
 *
 * Regla única (decidida el 22 oct 2026): el cliente tiene 24 horas, contadas
 * desde que se le avisa, para responder. Pasado ese plazo el proyecto SIGUE,
 * sin importar si la pregunta es "Importante" o no.
 *
 *   1. Primera pasada: a cada pregunta sin responder que aún no tiene aviso se
 *      le anota la hora del aviso (columna recordatorio_enviado_en) y se le
 *      manda UN correo al cliente por proyecto. Ese es el inicio del plazo.
 *      La hora se anota aunque el correo falle, para que el plazo nunca quede
 *      abierto para siempre.
 *   2. Pasadas 24 horas del aviso: si la pregunta trae sugerencia, se aplica
 *      como "supuesto por confirmar"; si no, el paso se redacta con lo que ya
 *      hay y queda "por reforzar" (sin inventar nada). Si con eso el proyecto
 *      queda completo, arranca la búsqueda de convocatorias (lo hace
 *      responder-pregunta-proyecto).
 *
 * El cliente puede corregir después cualquier supuesto desde "Lo que me piden".
 *
 * Conviene que corra cada hora para que el plazo sea de 24 horas y no más.
 * Protegida igual que los demás relojes.
 */

export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const HORAS_DE_PLAZO = 24;

export async function GET(req: NextRequest) {
  try {
    if (!(await motorAutorizado(req, null))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const ahora = new Date();
    const limite = new Date(ahora.getTime() - HORAS_DE_PLAZO * 60 * 60 * 1000).toISOString();
    const origen = req.nextUrl.origin;

    const { data: sinResponder, error } = await supabase
      .from("preguntas_pendientes_proyecto")
      .select("id, id_proyecto, sugerencia, recordatorio_enviado_en")
      .eq("respondida", false);

    if (error) {
      console.error("Error consultando preguntas pendientes:", JSON.stringify(error));
      return NextResponse.json({ error: "No se pudo consultar las preguntas pendientes" }, { status: 500 });
    }

    const lista = sinResponder || [];

    // --- 1. Avisar y arrancar el plazo ---------------------------------------
    const proyectosSinAviso = Array.from(
      new Set(lista.filter((p) => !p.recordatorio_enviado_en).map((p) => String(p.id_proyecto)))
    );
    const avisados: string[] = [];

    for (const idProyecto of proyectosSinAviso) {
      // Primero se anota la hora: así el plazo corre aunque el correo falle.
      await supabase
        .from("preguntas_pendientes_proyecto")
        .update({ recordatorio_enviado_en: ahora.toISOString() })
        .eq("id_proyecto", idProyecto)
        .eq("respondida", false)
        .is("recordatorio_enviado_en", null);

      const { data: proyecto } = await supabase
        .from("proyectos_clientes_serving")
        .select("nombre_iniciativa, correo_cliente")
        .eq("id", idProyecto)
        .maybeSingle();

      if (!proyecto?.correo_cliente) continue;

      const html = buildEmailTemplate({
        title: "Tu proyecto necesita unas respuestas tuyas",
        greeting: "Hola,",
        bodyLines: [
          `Para completar <strong>${proyecto.nombre_iniciativa || "tu proyecto"}</strong> necesitamos que respondas unas preguntas.`,
          `Tienes ${HORAS_DE_PLAZO} horas. Pasado ese plazo seguimos con tu proyecto sin esa información: lo que falte quedará marcado como "por reforzar" y podrás completarlo cuando quieras.`,
          "Responder toma pocos minutos: entra a \"Lo que me piden\".",
        ],
        ctaText: "Responder ahora",
        ctaUrl: `${origen}/pendientes`,
      });

      const envio = await sendEmail({
        to: proyecto.correo_cliente,
        subject: "Tu proyecto necesita unas respuestas tuyas (plazo: 24 horas)",
        html,
      });

      if (!envio.success) {
        console.error(`No se pudo enviar el aviso del proyecto ${idProyecto}:`, envio.message);
        continue;
      }
      avisados.push(idProyecto);
    }

    // --- 2. Pasadas 24 horas del aviso: el proyecto sigue --------------------
    const vencidas = lista.filter(
      (p) => p.recordatorio_enviado_en && String(p.recordatorio_enviado_en) <= limite
    );

    const porProyecto = new Map<string, { id: string; sugerencia: string }[]>();
    for (const p of vencidas) {
      const sugerencia = typeof p.sugerencia === "string" ? p.sugerencia.trim() : "";
      const clave = String(p.id_proyecto);
      porProyecto.set(clave, [...(porProyecto.get(clave) || []), { id: String(p.id), sugerencia }]);
    }

    // Cada proyecto va en orden (una pregunta tras otra, para que el Motor 2
    // arranque una sola vez); los proyectos distintos corren en paralelo.
    after(async () => {
      await Promise.all(
        Array.from(porProyecto.values()).map(async (preguntas) => {
          for (const q of preguntas) {
            try {
              await fetch(`${origen}/api/responder-pregunta-proyecto`, {
                method: "POST",
                headers: { "Content-Type": "application/json", ...cabecerasInternas() },
                body: JSON.stringify(
                  q.sugerencia
                    ? { id_pregunta: q.id, respuesta: q.sugerencia, es_supuesto: true }
                    : { id_pregunta: q.id, sin_respuesta: true, es_supuesto: true }
                ),
              });
            } catch (e) {
              console.error(`Error aplicando el supuesto de la pregunta ${q.id}:`, e);
            }
          }
        })
      );
    });

    return NextResponse.json({
      ok: true,
      preguntas_sin_responder: lista.length,
      proyectos_avisados: avisados,
      proyectos_que_siguen_sin_cliente: porProyecto.size,
    });
  } catch (err: unknown) {
    console.error("Error en revisar-preguntas-vencidas:", err);
    return NextResponse.json(
      { error: "Error al revisar preguntas vencidas", detalle: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
