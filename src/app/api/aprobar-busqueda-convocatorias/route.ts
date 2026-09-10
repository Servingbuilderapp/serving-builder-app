import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { motorAutorizado, cabecerasInternas } from "@/lib/candadoMotores";

/**
 * El cliente dice "sí, me gusta, busquemos convocatorias".
 *
 * Cuando el evaluador automático aprueba la estructuración, el proyecto NO
 * arranca el Motor 2 de una vez: se le da al cliente una ventana de 3 días
 * para que revise el resultado y decida. Esta ruta es el botón de "sí" —
 * arranca el Motor 2 al toque, sin esperar los 3 días.
 *
 * Si el cliente no dice nada en 3 días, el reloj de
 * /api/revisar-aprobaciones-vencidas hace exactamente lo mismo por su cuenta,
 * para que ningún proyecto se quede esperando para siempre.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { id_proyecto } = await req.json();
    if (!id_proyecto) {
      return NextResponse.json({ error: "Falta id_proyecto" }, { status: 400 });
    }

    if (!(await motorAutorizado(req, id_proyecto))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: proyecto, error: errorProyecto } = await supabase
      .from("proyectos_clientes_serving")
      .select("id, evaluacion_aprobada, busqueda_convocatorias_iniciada")
      .eq("id", id_proyecto)
      .maybeSingle();

    if (errorProyecto || !proyecto) {
      return NextResponse.json({ error: "No se encontró el proyecto" }, { status: 404 });
    }

    if (!proyecto.evaluacion_aprobada) {
      return NextResponse.json(
        { error: "Todavía no está aprobada la evaluación de este proyecto." },
        { status: 400 }
      );
    }

    if (proyecto.busqueda_convocatorias_iniciada) {
      return NextResponse.json({ ok: true, mensaje: "La búsqueda de convocatorias ya había arrancado." });
    }

    const { error: errorUpdate } = await supabase
      .from("proyectos_clientes_serving")
      .update({
        cliente_aprobo_busqueda_en: new Date().toISOString(),
        busqueda_convocatorias_iniciada: true,
      })
      .eq("id", id_proyecto);

    if (errorUpdate) {
      console.error("Error guardando la aprobación del cliente:", JSON.stringify(errorUpdate));
      return NextResponse.json({ error: "No se pudo guardar tu decisión" }, { status: 500 });
    }

    const origen = req.nextUrl.origin;
    after(async () => {
      try {
        await fetch(`${origen}/api/buscar-convocatorias`, {
          method: "POST",
          headers: { "Content-Type": "application/json", ...cabecerasInternas() },
          body: JSON.stringify({ id_proyecto }),
        });
      } catch (e) {
        console.error("Error disparando Motor 2 tras la aprobación del cliente:", e);
      }
    });

    return NextResponse.json({ ok: true, mensaje: "Listo: ya empezamos a buscar convocatorias para tu proyecto." });
  } catch (err: any) {
    console.error("Error en aprobar-busqueda-convocatorias:", err);
    return NextResponse.json(
      { error: "Error al procesar la aprobación", detalle: err?.message || String(err) },
      { status: 500 }
    );
  }
}
