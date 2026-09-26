import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { motorAutorizado, cabecerasInternas } from "@/lib/candadoMotores";

/**
 * "Parada 1" — el cliente elige cuál o cuáles convocatorias quiere seguir.
 *
 * Decisión del dueño (26 sep 2026): el Motor 2 encuentra convocatorias y las
 * deja esperando (`eleccion_cliente = null`). El Motor 3 (encaje) ya NO
 * arranca solo al terminar el Motor 2 — espera a que el cliente diga aquí
 * "esta sí, esta también" (puede elegir una o varias del mismo lote), o a
 * que pasen 3 días sin respuesta, caso en el que
 * /api/revisar-eleccion-convocatorias-vencida decide por él, exactamente con
 * la misma regla de 3 días que ya existía para aprobar el arranque de la
 * búsqueda (/api/aprobar-busqueda-convocatorias) — es la misma idea aplicada
 * a un momento distinto, no una regla nueva.
 *
 * Solo las convocatorias elegidas pasan al Motor 3. Las que el cliente no
 * elige quedan marcadas como "no_elegida": no se borran, quedan en su
 * historial por si sirven de referencia más adelante.
 */

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { id_proyecto, ids_elegidas } = await req.json();

    if (!id_proyecto || !Array.isArray(ids_elegidas)) {
      return NextResponse.json({ error: "Falta id_proyecto o ids_elegidas" }, { status: 400 });
    }

    if (!(await motorAutorizado(req, id_proyecto))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { data: pendientes, error: errorPendientes } = await supabase
      .from("convocatorias_candidatas_proyecto")
      .select("id")
      .eq("id_proyecto", id_proyecto)
      .eq("seleccionada", true)
      .is("eleccion_cliente", null);

    if (errorPendientes) {
      console.error("Error consultando convocatorias pendientes de elección:", JSON.stringify(errorPendientes));
      return NextResponse.json({ error: "No se pudo consultar las convocatorias pendientes" }, { status: 500 });
    }

    const idsPendientes = new Set((pendientes || []).map((c) => String(c.id)));
    const idsElegidasValidas = (ids_elegidas as string[])
      .map((id) => String(id))
      .filter((id) => idsPendientes.has(id));
    const idsNoElegidas = [...idsPendientes].filter((id) => !idsElegidasValidas.includes(id));

    if (idsElegidasValidas.length === 0) {
      return NextResponse.json(
        { error: "Debes escoger al menos una convocatoria de las que están pendientes." },
        { status: 400 }
      );
    }

    const { error: errorElegidas } = await supabase
      .from("convocatorias_candidatas_proyecto")
      .update({ eleccion_cliente: "elegida" })
      .in("id", idsElegidasValidas);

    if (errorElegidas) {
      console.error("Error guardando las convocatorias elegidas:", JSON.stringify(errorElegidas));
      return NextResponse.json({ error: "No se pudo guardar tu elección" }, { status: 500 });
    }

    if (idsNoElegidas.length > 0) {
      const { error: errorNoElegidas } = await supabase
        .from("convocatorias_candidatas_proyecto")
        .update({ eleccion_cliente: "no_elegida" })
        .in("id", idsNoElegidas);

      if (errorNoElegidas) {
        console.error("Error guardando las convocatorias no elegidas:", JSON.stringify(errorNoElegidas));
      }
    }

    const origen = req.nextUrl.origin;
    for (const id_convocatoria of idsElegidasValidas) {
      after(async () => {
        try {
          await fetch(`${origen}/api/analizar-encaje`, {
            method: "POST",
            headers: { "Content-Type": "application/json", ...cabecerasInternas() },
            body: JSON.stringify({ id_convocatoria }),
          });
        } catch (e) {
          console.error("Error disparando Motor 3 tras la elección del cliente:", e);
        }
      });
    }

    return NextResponse.json({
      ok: true,
      elegidas: idsElegidasValidas.length,
      mensaje: "Listo: ya estamos analizando el encaje de las convocatorias que elegiste.",
    });
  } catch (err: any) {
    console.error("Error en elegir-convocatoria:", err);
    return NextResponse.json(
      { error: "Error al procesar tu elección", detalle: err?.message || String(err) },
      { status: 500 }
    );
  }
}
