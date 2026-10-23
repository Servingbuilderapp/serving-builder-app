import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { motorAutorizado, cabecerasInternas } from "@/lib/candadoMotores";
import { buildEmailTemplate, sendEmail } from "@/lib/email";

/**
 * El reloj de las 24 horas para las preguntas pendientes del Motor 1.
 *
 * Cuando el Motor 1 le deja preguntas al cliente, el proyecto se queda
 * esperando. Esta ruta (la llama una vez al día el reloj de Vercel) hace dos
 * cosas con las preguntas que llevan más de 24 horas sin respuesta:
 *
 *   - NO críticas (sin la marca "Importante") que traen sugerencia: se aplica
 *     la sugerencia como "supuesto por confirmar" y el proyecto sigue. Si con
 *     eso ya no queda nada crítico pendiente, arranca la búsqueda de
 *     convocatorias (lo hace la ruta responder-pregunta-proyecto).
 *   - Críticas ("Importante"): el proyecto espera. Se le manda al cliente UN
 *     recordatorio por correo (queda anotado para no repetirlo).
 *
 * Las NO críticas sin sugerencia (datos que solo el cliente conoce) también
 * siguen: el paso se redacta con lo que ya hay y queda "por reforzar", sin
 * inventar nada, para que el proyecto no quede parado para siempre.
 *
 * Protegida igual que los demás relojes.
 */

export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const HORAS_DE_ESPERA = 24;

export async function GET(req: NextRequest) {
  try {
    if (!(await motorAutorizado(req, null))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const limite = new Date(Date.now() - HORAS_DE_ESPERA * 60 * 60 * 1000).toISOString();

    const { data: vencidas, error } = await supabase
      .from("preguntas_pendientes_proyecto")
      .select("id, id_proyecto, critico, sugerencia, recordatorio_enviado_en")
      .eq("respondida", false)
      .lte("creado_en", limite);

    if (error) {
      console.error("Error consultando preguntas vencidas:", JSON.stringify(error));
      return NextResponse.json({ error: "No se pudo consultar las preguntas pendientes" }, { status: 500 });
    }

    const lista = vencidas || [];
    const origen = req.nextUrl.origin;

    // --- 1. No críticas con sugerencia: seguir con el supuesto ---------------
    const porProyecto = new Map<string, { id: string; sugerencia: string }[]>();
    // sugerencia vacía = no hay sugerencia: el paso se redacta con lo que ya hay y queda "por reforzar".
    for (const p of lista) {
      if (p.critico === true) continue;
      const sugerencia = typeof p.sugerencia === "string" ? p.sugerencia.trim() : "";
      const clave = String(p.id_proyecto);
      porProyecto.set(clave, [...(porProyecto.get(clave) || []), { id: String(p.id), sugerencia }]);
    }

    // Cada proyecto va en orden (una pregunta tras otra, para que Motor 2 arranque
    // una sola vez); los proyectos distintos corren en paralelo.
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

    // --- 2. Críticas: un recordatorio por correo ----------------------------
    const criticasSinAviso = lista.filter((p) => p.critico === true && !p.recordatorio_enviado_en);
    const proyectosARecordar = Array.from(new Set(criticasSinAviso.map((p) => String(p.id_proyecto))));
    const recordados: string[] = [];

    for (const idProyecto of proyectosARecordar) {
      const { data: proyecto } = await supabase
        .from("proyectos_clientes_serving")
        .select("nombre_iniciativa, correo_cliente")
        .eq("id", idProyecto)
        .maybeSingle();

      if (!proyecto?.correo_cliente) continue;

      const html = buildEmailTemplate({
        title: "Tu proyecto está esperando una respuesta tuya",
        greeting: "Hola,",
        bodyLines: [
          `Para seguir avanzando con <strong>${proyecto.nombre_iniciativa || "tu proyecto"}</strong> necesitamos que respondas unas preguntas importantes.`,
          "Mientras no las respondas, el proyecto no puede pasar a la búsqueda de convocatorias.",
        ],
        ctaText: "Responder ahora",
        ctaUrl: `${origen}/pendientes`,
      });

      const envio = await sendEmail({
        to: proyecto.correo_cliente,
        subject: "Tu proyecto está esperando una respuesta tuya",
        html,
      });

      if (!envio.success) {
        console.error(`No se pudo enviar el recordatorio del proyecto ${idProyecto}:`, envio.message);
        continue;
      }

      await supabase
        .from("preguntas_pendientes_proyecto")
        .update({ recordatorio_enviado_en: new Date().toISOString() })
        .eq("id_proyecto", idProyecto)
        .eq("respondida", false)
        .eq("critico", true);

      recordados.push(idProyecto);
    }

    return NextResponse.json({
      ok: true,
      preguntas_vencidas: lista.length,
      proyectos_con_supuesto: porProyecto.size,
      proyectos_recordados: recordados,
    });
  } catch (err: unknown) {
    console.error("Error en revisar-preguntas-vencidas:", err);
    return NextResponse.json(
      { error: "Error al revisar preguntas vencidas", detalle: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
