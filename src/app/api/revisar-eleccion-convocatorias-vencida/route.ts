import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { motorAutorizado, cabecerasInternas } from "@/lib/candadoMotores";

/**
 * El reloj de los 3 días, aplicado a la "Parada 1" (elegir convocatoria).
 *
 * Cuando el Motor 2 encuentra convocatorias, el cliente tiene 3 días para
 * escoger cuáles le interesan (/api/elegir-convocatoria). Si no dice nada,
 * esta ruta —llamada una vez al día por el reloj de Vercel— decide por él:
 * se sigue con TODAS las convocatorias de ese lote que quedaron pendientes,
 * porque el Motor 2 ya las filtró para que solo lleguen las que de verdad
 * encajan con el proyecto. Así ninguna convocatoria se queda esperando para
 * siempre.
 *
 * Es la misma regla de 3 días que ya existía para aprobar el arranque de la
 * búsqueda (/api/revisar-aprobaciones-vencidas), aplicada aquí a un momento
 * distinto del proceso.
 *
 * Protegida igual que los demás relojes: solo pasan la llave interna, el
 * reloj de Vercel (con CRON_SECRET) o el equipo de Serving.
 */

export const maxDuration = 300;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    if (!(await motorAutorizado(req, null))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const haceTresDias = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();

    const { data: vencidas, error } = await supabase
      .from("convocatorias_candidatas_proyecto")
      .select("id, id_proyecto")
      .eq("seleccionada", true)
      .is("eleccion_cliente", null)
      .lte("disponible_para_cliente_desde", haceTresDias);

    if (error) {
      console.error("Error consultando elecciones vencidas:", JSON.stringify(error));
      return NextResponse.json({ error: "No se pudo consultar las convocatorias pendientes" }, { status: 500 });
    }

    const origen = req.nextUrl.origin;
    const decididas: string[] = [];

    for (const c of vencidas || []) {
      const { error: errorUpdate } = await supabase
        .from("convocatorias_candidatas_proyecto")
        .update({ eleccion_cliente: "elegida", decidido_automaticamente: true })
        .eq("id", c.id);

      if (errorUpdate) {
        console.error(`No se pudo decidir automáticamente la convocatoria ${c.id}:`, JSON.stringify(errorUpdate));
        continue;
      }

      decididas.push(String(c.id));

      after(async () => {
        try {
          await fetch(`${origen}/api/analizar-encaje`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...cabecerasInternas() },
            body: JSON.stringify({ id_convocatoria: c.id }),
          });
        } catch (e) {
          console.error(`Error arrancando el Motor 3 automático para la convocatoria ${c.id}:`, e);
        }
      });
    }

    return NextResponse.json({
      ok: true,
      convocatorias_revisadas: (vencidas || []).length,
      convocatorias_decididas: decididas,
    });
  } catch (err: any) {
    console.error("Error en revisar-eleccion-convocatorias-vencida:", err);
    return NextResponse.json(
      { error: "Error al revisar elecciones vencidas", detalle: err?.message || String(err) },
      { status: 500 }
    );
  }
}
