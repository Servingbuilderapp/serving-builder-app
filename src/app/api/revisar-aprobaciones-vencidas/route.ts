import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { motorAutorizado, cabecerasInternas } from "@/lib/candadoMotores";

/**
 * El reloj de los 3 días.
 *
 * Cuando el evaluador automático aprueba un proyecto, el cliente tiene 3 días
 * para decir "sí, busquemos convocatorias" desde su panel
 * (/api/aprobar-busqueda-convocatorias). Si no dice nada, esta ruta —
 * llamada una vez al día por el reloj de Vercel — arranca el Motor 2 por su
 * cuenta, para que ningún proyecto se quede esperando para siempre.
 *
 * Protegida igual que la búsqueda masiva semanal: solo pasan la llave interna,
 * el reloj de Vercel (con CRON_SECRET) o el equipo de Serving.
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

    const { data: proyectosVencidos, error } = await supabase
      .from("proyectos_clientes_serving")
      .select("id, nombre_iniciativa, evaluacion_aprobada_en")
      .eq("evaluacion_aprobada", true)
      .eq("busqueda_convocatorias_iniciada", false)
      .lte("evaluacion_aprobada_en", haceTresDias);

    if (error) {
      console.error("Error consultando proyectos con aprobación vencida:", JSON.stringify(error));
      return NextResponse.json({ error: "No se pudo consultar la lista de proyectos" }, { status: 500 });
    }

    const origen = req.nextUrl.origin;
    const arrancados: string[] = [];

    for (const proyecto of proyectosVencidos || []) {
      const { error: errorUpdate } = await supabase
        .from("proyectos_clientes_serving")
        .update({ busqueda_convocatorias_iniciada: true })
        .eq("id", proyecto.id);

      if (errorUpdate) {
        console.error(`No se pudo marcar el proyecto ${proyecto.id} como iniciado:`, JSON.stringify(errorUpdate));
        continue;
      }

      arrancados.push(proyecto.id);

      after(async () => {
        try {
          await fetch(`${origen}/api/buscar-convocatorias`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...cabecerasInternas() },
            body: JSON.stringify({ id_proyecto: proyecto.id }),
          });
        } catch (e) {
          console.error(`Error arrancando el Motor 2 automático para ${proyecto.id}:`, e);
        }
      });
    }

    return NextResponse.json({
      ok: true,
      proyectos_revisados: (proyectosVencidos || []).length,
      proyectos_arrancados: arrancados,
    });
  } catch (err: any) {
    console.error("Error en revisar-aprobaciones-vencidas:", err);
    return NextResponse.json(
      { error: "Error al revisar aprobaciones vencidas", detalle: err?.message || String(err) },
      { status: 500 }
    );
  }
}
