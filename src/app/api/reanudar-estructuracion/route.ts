import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { motorAutorizado } from "@/lib/candadoMotores";
import { arrancarEstructuracion } from "@/lib/arrancarEstructuracion";

/**
 * La red de seguridad de la estructuración.
 *
 * Si el motor se cae a mitad de camino (Gemini saturado, un corte, lo que sea),
 * nadie lo vuelve a encender y el proyecto queda parado horas. Este reloj lo
 * evita: cada pocos minutos busca los proyectos que YA están pagados (o con
 * cortesía aceptada) y siguen en cero pasos escritos, y los vuelve a arrancar.
 *
 * Cuidados:
 *   - No toca proyectos que ya escribieron algo o que ya tienen preguntas.
 *   - Espera 15 minutos entre un intento y otro, para no pisar un motor que
 *     todavía está trabajando.
 *   - Máximo 6 intentos por proyecto, para no gastar sin fin si el problema es
 *     de fondo (por ejemplo, un PDF que nadie puede leer).
 *
 * Protegida igual que los demás relojes (CRON_SECRET).
 */

export const maxDuration = 60;

const MAX_INTENTOS = 6;
const MINUTOS_ENTRE_INTENTOS = 15;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  try {
    if (!(await motorAutorizado(req, null))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const ahora = new Date();
    const espera = new Date(ahora.getTime() - MINUTOS_ENTRE_INTENTOS * 60 * 1000).toISOString();

    const { data: candidatos, error } = await supabase
      .from("proyectos_clientes_serving")
      .select("id, motor1_intentos, motor1_ultimo_intento")
      .eq("estado_actual", "pagado")
      .lt("motor1_intentos", MAX_INTENTOS)
      .or(`motor1_ultimo_intento.is.null,motor1_ultimo_intento.lt.${espera}`)
      .limit(20);

    if (error) {
      console.error("Error buscando proyectos parados:", JSON.stringify(error));
      return NextResponse.json({ error: "No se pudo consultar los proyectos" }, { status: 500 });
    }

    const reanudados: string[] = [];

    for (const proyecto of candidatos || []) {
      const id = String(proyecto.id);

      // ¿Ya escribió algo o ya tiene preguntas? Entonces no está parado.
      const { count: escritos } = await supabase
        .from("contenido_pasos_proyecto")
        .select("id_paso", { count: "exact", head: true })
        .eq("id_proyecto", id);
      if ((escritos || 0) > 0) continue;

      const { count: preguntas } = await supabase
        .from("preguntas_pendientes_proyecto")
        .select("id", { count: "exact", head: true })
        .eq("id_proyecto", id);
      if ((preguntas || 0) > 0) continue;

      // Se anota el intento ANTES de arrancar, para que dos relojes no lo pisen.
      await supabase
        .from("proyectos_clientes_serving")
        .update({
          motor1_intentos: (proyecto.motor1_intentos || 0) + 1,
          motor1_ultimo_intento: ahora.toISOString(),
        })
        .eq("id", id);

      const resultado = await arrancarEstructuracion(id, req.nextUrl.origin);
      if (resultado.arrancado) reanudados.push(id);
    }

    return NextResponse.json({ revisados: (candidatos || []).length, reanudados });
  } catch (e) {
    console.error("Error en el reanudador de estructuración:", e);
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
  }
}
