import { NextRequest, NextResponse, after } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { motorAutorizado, cabecerasInternas } from "@/lib/candadoMotores";
import { arrancarEstructuracion } from "@/lib/arrancarEstructuracion";
import { correrEvaluadorEstructuracion } from "@/lib/motorEvaluadorEstructuracion";
import { lanzarBusquedaConvocatorias } from "@/lib/lanzarBusquedaConvocatorias";

/**
 * La red de seguridad de TODA la cadena de motores.
 *
 * La cadena es: Motor 1 (escribe el proyecto) → evaluador → Motor 2 (busca
 * convocatorias) → el cliente elige → Motor 3 (mide el encaje). Cada eslabón
 * se dispara "por detrás" del anterior, así que si uno se cae nadie se entera
 * y el proyecto se queda quieto. Este reloj corre cada 10 minutos y revisa los
 * cinco puntos donde eso puede pasar. Para escala masiva: no depende de que
 * nadie del equipo mire nada.
 *
 *   A. Motor 1 nunca escribió nada (0 pasos, 0 preguntas) → se arranca de nuevo.
 *   B. Motor 1 escribió a medias y se cayó antes de dejar la pregunta de los
 *      pasos que quedaron en blanco → se crea esa pregunta (sin gastar IA).
 *   C. El proyecto quedó listo pero el evaluador nunca terminó → se reintenta;
 *      si tras 3 intentos sigue sin poder, se da por evaluado y la búsqueda
 *      de convocatorias arranca igual (nadie se queda esperando).
 *   D. Se dio la orden de buscar convocatorias pero no apareció ninguna ni
 *      quedó registrado el lote → se vuelve a lanzar el Motor 2.
 *   E. El cliente eligió convocatorias y el Motor 3 no dejó su análisis →
 *      se vuelve a lanzar el Motor 3 para esas.
 *   F. El proyecto ya fue evaluado pero nunca se ordenó buscar convocatorias
 *      (por ejemplo, quedó esperando el "sí" del cliente o los 3 días de
 *      antes) → se ordena ya. Nadie espera a nadie.
 *
 * REGLA ANTI-DUPLICADOS (C, D y E): el reloj nunca actúa la primera vez que ve
 * algo raro. Lo anota ("lo vi") y solo actúa si 30 minutos después SIGUE igual.
 * Así no pisa a un motor que simplemente está trabajando.
 *
 * Protegida igual que los demás relojes (CRON_SECRET).
 */
export const maxDuration = 300;

const MAX_INTENTOS = 6; // Motor 1 (punto A)
const MINUTOS_ENTRE_INTENTOS = 15; // Motor 1 (punto A)
const MINUTOS_DE_ESPERA_CADENA = 30; // puntos C, D y E
const MAX_INTENTOS_EVALUADOR = 3;
const MAX_INTENTOS_MOTOR2 = 4;
const MAX_INTENTOS_MOTOR3 = 4;
const TOPE_POR_PUNTO = 20;
const TROZO = 100; // cuántos ids caben juntos en una consulta

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

type ProyectoCadena = {
  id: string;
  cadena_etapa: string | null;
  cadena_visto_en: string | null;
  cadena_intentos: number | null;
};

const CAMPOS_CADENA = "id, cadena_etapa, cadena_visto_en, cadena_intentos";

function trozos<T>(lista: T[], tamano: number): T[][] {
  const salida: T[][] = [];
  for (let i = 0; i < lista.length; i += tamano) salida.push(lista.slice(i, i + tamano));
  return salida;
}

/**
 * Decide qué hacer con un proyecto atascado en una etapa de la cadena.
 *  - "esperar": primera vez que se ve, o aún no pasan 30 minutos.
 *  - "actuar":  siguió igual 30 minutos después; se anota el intento.
 *  - "rendirse": ya se agotaron los intentos.
 */
async function turnoCadena(
  p: ProyectoCadena,
  etapa: string,
  maxIntentos: number,
  ahora: Date
): Promise<"esperar" | "actuar" | "rendirse"> {
  const visto = p.cadena_visto_en ? new Date(p.cadena_visto_en).getTime() : 0;
  const mismaEtapa = p.cadena_etapa === etapa && visto > 0;

  if (!mismaEtapa) {
    await supabase
      .from("proyectos_clientes_serving")
      .update({ cadena_etapa: etapa, cadena_visto_en: ahora.toISOString(), cadena_intentos: 0 })
      .eq("id", p.id);
    return "esperar";
  }

  const intentos = p.cadena_intentos || 0;
  const minutos = (ahora.getTime() - visto) / 60000;
  if (minutos < MINUTOS_DE_ESPERA_CADENA) return "esperar";
  if (intentos >= maxIntentos) return "rendirse";

  await supabase
    .from("proyectos_clientes_serving")
    .update({ cadena_visto_en: ahora.toISOString(), cadena_intentos: intentos + 1 })
    .eq("id", p.id);
  return "actuar";
}

export async function GET(req: NextRequest) {
  try {
    if (!(await motorAutorizado(req, null))) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const ahora = new Date();
    const origen = req.nextUrl.origin;
    const informe = {
      a_motor1_reanudados: [] as string[],
      b_preguntas_creadas: [] as string[],
      c_evaluador_reintentado: [] as string[],
      c_evaluador_saltado: [] as string[],
      d_motor2_relanzado: [] as string[],
      e_motor3_relanzado: [] as string[],
      f_busqueda_lanzada: [] as string[],
      sin_salida: [] as string[],
    };

    /* ====================================================================== */
    /* A. Motor 1 nunca escribió nada                                         */
    /* ====================================================================== */

    const espera = new Date(ahora.getTime() - MINUTOS_ENTRE_INTENTOS * 60 * 1000).toISOString();

    const { data: candidatosA, error: errorA } = await supabase
      .from("proyectos_clientes_serving")
      .select("id, motor1_intentos, motor1_ultimo_intento")
      .eq("estado_actual", "pagado")
      .lt("motor1_intentos", MAX_INTENTOS)
      .or(`motor1_ultimo_intento.is.null,motor1_ultimo_intento.lt.${espera}`)
      .limit(TOPE_POR_PUNTO);

    if (errorA) {
      console.error("Error buscando proyectos parados:", JSON.stringify(errorA));
      return NextResponse.json({ error: "No se pudo consultar los proyectos" }, { status: 500 });
    }

    for (const proyecto of candidatosA || []) {
      const id = String(proyecto.id);

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

      const resultado = await arrancarEstructuracion(id, origen);
      if (resultado.arrancado) {
        informe.a_motor1_reanudados.push(id);
      } else if (resultado.motivo === "sin-documento") {
        // Si el cliente todavía no sube nada, no hay motor que se haya caído:
        // ese intento no cuenta, para no gastar los 6 antes de que llegue el archivo.
        await supabase
          .from("proyectos_clientes_serving")
          .update({
            motor1_intentos: proyecto.motor1_intentos || 0,
            motor1_ultimo_intento: proyecto.motor1_ultimo_intento ?? null,
          })
          .eq("id", id);
      }
    }

    /* ====================================================================== */
    /* B. Motor 1 escribió a medias: pasos sin contenido y sin pregunta       */
    /* ====================================================================== */

    try {
      const { data: pasos } = await supabase
        .from("pasos_estructuracion")
        .select("id, nombre_paso");
      const listaPasos = pasos || [];

      const { data: candidatosB } = await supabase
        .from("proyectos_clientes_serving")
        .select("id")
        .eq("estado_actual", "pagado")
        .or("listo_para_encaje.is.null,listo_para_encaje.eq.false")
        .order("created_at", { ascending: false })
        .limit(300);

      const idsB = (candidatosB || []).map((p) => String(p.id));
      const PASOS_CRITICOS =
        /problema central|[aá]rbol del problema|poblaci[oó]n|presupuesto|objetivo general|soluci[oó]n propuesta/i;

      for (const grupo of trozos(idsB, TROZO)) {
        const { data: avance } = await supabase
          .from("avance_estructuracion_proyecto")
          .select("proyecto_id, paso_id")
          .in("proyecto_id", grupo)
          .eq("completado", true);
        const { data: abiertas } = await supabase
          .from("preguntas_pendientes_proyecto")
          .select("id_proyecto, id_paso")
          .in("id_proyecto", grupo)
          .eq("respondida", false);
        const { data: respondidas } = await supabase
          .from("preguntas_pendientes_proyecto")
          .select("id_proyecto, id_paso")
          .in("id_proyecto", grupo)
          .eq("respondida", true);

        const completosPor = new Map<string, Set<number>>();
        for (const a of avance || []) {
          const k = String(a.proyecto_id);
          if (!completosPor.has(k)) completosPor.set(k, new Set());
          completosPor.get(k)!.add(Number(a.paso_id));
        }
        const conPreguntaPor = new Map<string, Set<number>>();
        for (const q of [...(abiertas || []), ...(respondidas || [])]) {
          const k = String(q.id_proyecto);
          if (!conPreguntaPor.has(k)) conPreguntaPor.set(k, new Set());
          conPreguntaPor.get(k)!.add(Number(q.id_paso));
        }

        for (const idProyecto of grupo) {
          const completos = completosPor.get(idProyecto);
          // Sin ningún paso escrito el proyecto no está "a medias": es el punto A.
          if (!completos || completos.size === 0) continue;

          const conPregunta = conPreguntaPor.get(idProyecto) || new Set<number>();
          const faltan = listaPasos.filter(
            (p) => !completos.has(Number(p.id)) && !conPregunta.has(Number(p.id))
          );
          if (faltan.length === 0) continue;

          const filas = faltan.map((p) => ({
            id_proyecto: idProyecto,
            id_paso: p.id,
            pregunta: `Falta información para desarrollar el paso «${p.nombre_paso}». Cuéntanos con tus palabras lo que sepas sobre este tema; con eso lo completamos.`,
            critico: PASOS_CRITICOS.test(String(p.nombre_paso || "")),
            sugerencia: null,
          }));

          const { error: errorInsert } = await supabase
            .from("preguntas_pendientes_proyecto")
            .insert(filas);
          if (errorInsert) {
            console.error(`No se pudieron crear las preguntas del proyecto ${idProyecto}:`, JSON.stringify(errorInsert));
            continue;
          }
          informe.b_preguntas_creadas.push(`${idProyecto} (${filas.length})`);
        }
      }
    } catch (e) {
      console.error("Red de seguridad, punto B:", e);
    }

    /* ====================================================================== */
    /* C. Quedó listo pero el evaluador nunca terminó                         */
    /* ====================================================================== */

    try {
      const { data: candidatosC } = await supabase
        .from("proyectos_clientes_serving")
        .select(CAMPOS_CADENA)
        .eq("estado_actual", "pagado")
        .eq("listo_para_encaje", true)
        .is("evaluacion_aprobada", null)
        .is("fecha_ultimo_lote_convocatorias", null)
        .or("busqueda_convocatorias_iniciada.is.null,busqueda_convocatorias_iniciada.eq.false")
        .limit(TOPE_POR_PUNTO);

      for (const p of (candidatosC || []) as ProyectoCadena[]) {
        const id = String(p.id);
        const turno = await turnoCadena(p, "evaluador", MAX_INTENTOS_EVALUADOR, ahora);
        if (turno === "esperar") continue;

        if (turno === "actuar") {
          informe.c_evaluador_reintentado.push(id);
          after(async () => {
            try {
              const r = await correrEvaluadorEstructuracion(supabase, id, origen);
              if (!r.ok) console.error(`Evaluador reintentado para ${id} sin éxito: ${r.mensaje}`);
            } catch (e) {
              console.error(`Error reintentando el evaluador de ${id}:`, e);
            }
          });
          continue;
        }

        // Se agotaron los intentos: el proyecto NO puede quedarse quieto para
        // siempre por una falla del evaluador. Se da por evaluado y sigue por
        // el camino normal (el cliente dice "sí, busquemos" o corren los 3 días).
        const { error: errorSalto } = await supabase
          .from("proyectos_clientes_serving")
          .update({ evaluacion_aprobada: true, evaluacion_aprobada_en: ahora.toISOString() })
          .eq("id", id);
        if (errorSalto) {
          console.error(`No se pudo saltar el evaluador de ${id}:`, JSON.stringify(errorSalto));
          informe.sin_salida.push(`evaluador ${id}`);
        } else {
          console.error(`El evaluador no pudo con ${id} tras ${MAX_INTENTOS_EVALUADOR} intentos: se da por evaluado.`);
          informe.c_evaluador_saltado.push(id);
          // Y la búsqueda de convocatorias arranca de una vez, sin esperar nada.
          after(async () => {
            try {
              await lanzarBusquedaConvocatorias(supabase, id, origen);
            } catch (e) {
              console.error(`Error lanzando la búsqueda de ${id} tras saltar el evaluador:`, e);
            }
          });
        }
      }
    } catch (e) {
      console.error("Red de seguridad, punto C:", e);
    }

    /* ====================================================================== */
    /* D. Se ordenó buscar convocatorias y no apareció nada                   */
    /* ====================================================================== */

    try {
      const { data: candidatosD } = await supabase
        .from("proyectos_clientes_serving")
        .select(CAMPOS_CADENA)
        .eq("estado_actual", "pagado")
        .eq("busqueda_convocatorias_iniciada", true)
        .is("fecha_ultimo_lote_convocatorias", null)
        .limit(TOPE_POR_PUNTO);

      for (const p of (candidatosD || []) as ProyectoCadena[]) {
        const id = String(p.id);

        const { count: yaHay } = await supabase
          .from("convocatorias_candidatas_proyecto")
          .select("id", { count: "exact", head: true })
          .eq("id_proyecto", id);
        if ((yaHay || 0) > 0) continue;

        const turno = await turnoCadena(p, "motor2", MAX_INTENTOS_MOTOR2, ahora);
        if (turno === "esperar") continue;
        if (turno === "rendirse") {
          console.error(`El Motor 2 no pudo con ${id} tras ${MAX_INTENTOS_MOTOR2} intentos.`);
          informe.sin_salida.push(`motor2 ${id}`);
          continue;
        }

        informe.d_motor2_relanzado.push(id);
        after(async () => {
          try {
            await fetch(`${origen}/api/buscar-convocatorias`, {
              method: "POST",
              headers: { "Content-Type": "application/json", ...cabecerasInternas() },
              body: JSON.stringify({ id_proyecto: id }),
            });
          } catch (e) {
            console.error(`Error relanzando el Motor 2 de ${id}:`, e);
          }
        });
      }
    } catch (e) {
      console.error("Red de seguridad, punto D:", e);
    }

    /* ====================================================================== */
    /* E. El cliente eligió y el Motor 3 no dejó su análisis                  */
    /* ====================================================================== */

    try {
      const hace30Dias = new Date(ahora.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

      const { data: elegidas } = await supabase
        .from("convocatorias_candidatas_proyecto")
        .select("id, id_proyecto, lote")
        .eq("eleccion_cliente", "elegida")
        .gt("disponible_para_cliente_desde", hace30Dias)
        .limit(500);

      const listaElegidas = elegidas || [];
      const conAnalisis = new Set<string>();
      for (const grupo of trozos(
        listaElegidas.map((c) => String(c.id)),
        TROZO
      )) {
        const { data: encajes } = await supabase
          .from("encajes_convocatoria_proyecto")
          .select("id_convocatoria")
          .in("id_convocatoria", grupo);
        for (const e of encajes || []) conAnalisis.add(String(e.id_convocatoria));
      }

      const faltantesPor = new Map<string, { ids: string[]; lote: number }>();
      for (const c of listaElegidas) {
        if (conAnalisis.has(String(c.id))) continue;
        const k = String(c.id_proyecto);
        const actual = faltantesPor.get(k) || { ids: [], lote: Number(c.lote) || 0 };
        actual.ids.push(String(c.id));
        actual.lote = Math.min(actual.lote, Number(c.lote) || 0);
        faltantesPor.set(k, actual);
      }

      const idsProyectosE = Array.from(faltantesPor.keys()).slice(0, TOPE_POR_PUNTO);
      if (idsProyectosE.length > 0) {
        const { data: proyectosE } = await supabase
          .from("proyectos_clientes_serving")
          .select(CAMPOS_CADENA)
          .in("id", idsProyectosE);

        for (const p of (proyectosE || []) as ProyectoCadena[]) {
          const id = String(p.id);
          const faltantes = faltantesPor.get(id);
          if (!faltantes) continue;

          // La etapa lleva el lote: una tanda nueva se vigila desde cero.
          const turno = await turnoCadena(p, `motor3:${faltantes.lote}`, MAX_INTENTOS_MOTOR3, ahora);
          if (turno === "esperar") continue;
          if (turno === "rendirse") {
            console.error(`El Motor 3 no pudo con ${id} tras ${MAX_INTENTOS_MOTOR3} intentos.`);
            informe.sin_salida.push(`motor3 ${id}`);
            continue;
          }

          informe.e_motor3_relanzado.push(`${id} (${faltantes.ids.length})`);
          // Una convocatoria tras otra, para no saturar a Gemini con las de un
          // mismo cliente.
          after(async () => {
            for (const idConvocatoria of faltantes.ids.slice(0, 5)) {
              try {
                await fetch(`${origen}/api/analizar-encaje`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", ...cabecerasInternas() },
                  body: JSON.stringify({ id_convocatoria: idConvocatoria }),
                });
              } catch (e) {
                console.error(`Error relanzando el Motor 3 de ${idConvocatoria}:`, e);
              }
            }
          });
        }
      }
    } catch (e) {
      console.error("Red de seguridad, punto E:", e);
    }

    /* ====================================================================== */
    /* F. Evaluado, pero la búsqueda de convocatorias nunca se ordenó         */
    /* ====================================================================== */
    // Cubre proyectos que quedaron esperando "el sí del cliente" o los 3 días
    // de antes: ya no se espera a nadie. El reclamo es atómico, así que si el
    // evaluador está lanzando la búsqueda en este mismo instante, solo uno gana.

    try {
      const { data: candidatosF } = await supabase
        .from("proyectos_clientes_serving")
        .select("id")
        .eq("estado_actual", "pagado")
        .not("evaluacion_aprobada", "is", null)
        .or("busqueda_convocatorias_iniciada.is.null,busqueda_convocatorias_iniciada.eq.false")
        .is("fecha_ultimo_lote_convocatorias", null)
        .limit(TOPE_POR_PUNTO);

      for (const p of candidatosF || []) {
        const id = String(p.id);
        informe.f_busqueda_lanzada.push(id);
        after(async () => {
          try {
            await lanzarBusquedaConvocatorias(supabase, id, origen);
          } catch (e) {
            console.error(`Error lanzando la búsqueda de ${id}:`, e);
          }
        });
      }
    } catch (e) {
      console.error("Red de seguridad, punto F:", e);
    }

    return NextResponse.json({
      revisados: (candidatosA || []).length,
      reanudados: informe.a_motor1_reanudados,
      ...informe,
    });
  } catch (e) {
    console.error("Error en la red de seguridad de la cadena de motores:", e);
    return NextResponse.json({ error: "Error inesperado" }, { status: 500 });
  }
}
