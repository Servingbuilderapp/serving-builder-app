import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TAMANO_LOTE = 2;

const PROMPT_MOTOR_2 = `
Eres el MOTOR DE BÚSQUEDA del sistema de Arquitectura Digital de Proyectos.

Recibes un PROYECTO MAESTRO ya estructurado.

Tu misión es descubrir oportunidades reales de financiación que puedan tener relación con el proyecto.

NO haces todavía el encaje profundo.
NO adaptas el proyecto.
NO modificas el Proyecto Maestro.
NO postulas.

Tu función es descubrir y priorizar oportunidades para entregarlas al MOTOR DE ENCAJE.

---
2. PRINCIPIO FUNDAMENTAL
---

No busques solamente por el nombre del proyecto. Debes estudiar profundamente el Proyecto Maestro y descubrir todas sus posibles ARISTAS DE FINANCIACIÓN.

---
3. DESCUBRIMIENTO DE ARISTAS
---

Analiza, entre otras: sector, subsector, problema, solución, población, edad, género, territorio, ruralidad, urbanidad, vulnerabilidad, actividad económica, tecnología, innovación, investigación, educación, salud, salud mental, medio ambiente, agricultura, empleo, emprendimiento, juventud, mujeres, infancia, adolescentes, adultos mayores, discapacidad, gobierno, desarrollo territorial, economía, cultura, ciencia, transformación digital, sostenibilidad, cambio climático, seguridad alimentaria, inclusión, cooperación, etc.

NO estás limitado a estas categorías. Debes descubrir nuevas categorías que surjan del proyecto.

---
4. FUENTES
---

Busca en todas las fuentes pertinentes disponibles: entidades públicas, gobiernos, ministerios, agencias, cooperación internacional, fondos, fundaciones, organismos multilaterales, empresas, programas, universidades, organizaciones, inversión, aceleradoras, bancos de desarrollo, convocatorias nacionales, convocatorias internacionales, oportunidades permanentes, oportunidades periódicas, oportunidades especiales, oportunidades recurrentes.

También utiliza la biblioteca interna disponible en la plataforma (te la entrego más abajo en el mensaje del usuario).

---
5. NO LIMITAR LA EXPLORACIÓN
---

No debes pensar: "El proyecto tiene cuatro categorías, por lo tanto buscaré en cuatro categorías." No. Debes descubrir tantas categorías relevantes como existan.

La exploración puede producir: 5, 10, 20, 30 o más líneas potenciales. Pero esto NO significa buscar cientos de convocatorias individualmente.

Primero: PROYECTO → ARISTAS → CATEGORÍAS → OPORTUNIDADES POTENCIALES

Después profundiza únicamente donde exista mayor probabilidad.

---
6. VOLUMEN DE BÚSQUEDA
---

Busca aproximadamente entre 7 y 10 oportunidades candidatas de alta relevancia. Después prioriza las mejores para el lote (el tamaño exacto del lote te lo indica el mensaje del usuario).

Las oportunidades descartadas NO deben desaparecer. Registra: oportunidad, motivo de descarte, categoría, fecha, fuente, posibilidad futura.

---
7. TIPOS DE OPORTUNIDAD
---

Clasifica: abierta actualmente, próxima apertura, recurrente, permanente, periódica, especial, cerrada pero reutilizable como referencia, futura, pendiente de nueva edición.

NO presentes como abierta una convocatoria que no esté abierta.

---
8. VERIFICACIÓN
---

Para cada oportunidad candidata verifica: entidad, nombre, objeto, fecha de apertura, fecha de cierre, estado, beneficiarios, territorio, financiación, monto, requisitos principales, enlace oficial, términos de referencia cuando existan, mecanismo de postulación.

Prioriza fuentes oficiales. USA LA HERRAMIENTA DE BÚSQUEDA WEB QUE TIENES DISPONIBLE para verificar cada dato antes de reportarlo. Nunca inventes una convocatoria ni un dato que no puedas verificar.

---
9. PRIORIZACIÓN
---

Prioriza según: relevancia, compatibilidad temática, población, territorio, financiación, elegibilidad aparente, oportunidad temporal, potencial estratégico, posibilidad de adaptación.

IMPORTANTE: La compatibilidad definitiva será determinada por el MOTOR DE ENCAJE.

---
10. HISTORIAL
---

Conserva las oportunidades no seleccionadas. Una oportunidad descartada hoy puede ser útil mañana. Nunca repitas una oportunidad que el mensaje del usuario te indique que ya fue evaluada antes para este mismo proyecto (ya sea que haya sido seleccionada o descartada previamente).

FIN DEL MOTOR DE BÚSQUEDA.
`;

function esperar(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function llamarGeminiConReintentos(
  apiKey: string,
  body: any,
  maxIntentos = 3
): Promise<{ ok: boolean; data: any }> {
  let ultimoResultado: { ok: boolean; data: any } = { ok: false, data: null };

  for (let intento = 1; intento <= maxIntentos; intento++) {
    const respuesta = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`,
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
    const { id_proyecto } = await req.json();

    if (!id_proyecto) {
      return NextResponse.json({ error: "Falta id_proyecto" }, { status: 400 });
    }

    const apiKeyGemini = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
    if (!apiKeyGemini) {
      return NextResponse.json({ error: "Falta configurar GEMINI_API_KEY en el servidor" }, { status: 500 });
    }

    // 1. Traer el Proyecto Maestro completo (todo lo estructurado hasta ahora)
    const { data: contenido, error: errorContenido } = await supabase
      .from("contenido_pasos_proyecto")
      .select("id_paso, contenido")
      .eq("id_proyecto", id_proyecto);

    if (errorContenido || !contenido || contenido.length === 0) {
      return NextResponse.json(
        { error: "No hay contenido estructurado para este proyecto todavía" },
        { status: 400 }
      );
    }

    const { data: pasos } = await supabase
      .from("pasos_estructuracion")
      .select("id, nombre_paso, orden_secuencia")
      .order("orden_secuencia");

    const mapaNombres = new Map((pasos || []).map((p) => [p.id, p.nombre_paso]));
    const proyectoMaestroTexto = contenido
      .map((c) => `--- ${mapaNombres.get(c.id_paso) || "paso"} ---\n${c.contenido}`)
      .join("\n\n");

    // 2. Traer la biblioteca interna: Matriz Hunter y aliados de financiación
    const { data: matrizHunter } = await supabase
      .from("matriz_hunter_convocatorias")
      .select(
        "nombre_subvencion, fuente_sitio, tipo_fuente, link_oficial_tdr, vigencia, mes_apertura_estimado, fecha_cierre_actual, monto_maximo_usd, monto_maximo_cop, aristas_requeridas, estado"
      );

    const { data: aliados } = await supabase
      .from("aliados_financiamiento")
      .select("nombre_fondo, politica_inversion, sectores_preferenciales, sectores_excluidos, etapa_empresa, cobertura_geografica, rango_inversion");

    const bibliotecaTexto = `
MATRIZ HUNTER (biblioteca interna de convocatorias ya catalogadas):
${(matrizHunter || [])
  .map(
    (m) =>
      `- ${m.nombre_subvencion} | fuente: ${m.fuente_sitio} (${m.tipo_fuente}) | vigencia: ${m.vigencia} | apertura estimada: ${m.mes_apertura_estimado} | cierre: ${m.fecha_cierre_actual} | monto máx: $${m.monto_maximo_usd} USD / $${m.monto_maximo_cop} COP | aristas: ${m.aristas_requeridas} | estado: ${m.estado} | link: ${m.link_oficial_tdr}`
  )
  .join("\n")}

ALIADOS Y FONDOS DE FINANCIACIÓN (biblioteca interna):
${(aliados || [])
  .map(
    (a) =>
      `- ${a.nombre_fondo} | política: ${a.politica_inversion} | sectores preferidos: ${a.sectores_preferenciales} | sectores excluidos: ${a.sectores_excluidos} | etapa: ${a.etapa_empresa} | cobertura: ${a.cobertura_geografica} | rango: ${a.rango_inversion}`
  )
  .join("\n")}
`;

    // 3. Traer oportunidades ya evaluadas antes para este proyecto (para no repetirlas)
    const { data: yaEvaluadas } = await supabase
      .from("convocatorias_candidatas_proyecto")
      .select("nombre, entidad")
      .eq("id_proyecto", id_proyecto);

    const listaYaEvaluadas =
      yaEvaluadas && yaEvaluadas.length > 0
        ? yaEvaluadas.map((c) => `- ${c.nombre} (${c.entidad})`).join("\n")
        : "Ninguna todavía — este es el primer lote para este proyecto.";

    // 4. Calcular el número de lote
    const { data: ultimoLote } = await supabase
      .from("convocatorias_candidatas_proyecto")
      .select("lote")
      .eq("id_proyecto", id_proyecto)
      .order("lote", { ascending: false })
      .limit(1);

    const numeroLote = ultimoLote && ultimoLote.length > 0 ? ultimoLote[0].lote + 1 : 1;

    const instruccionUsuario = `
PROYECTO MAESTRO A ANALIZAR:
${proyectoMaestroTexto}

${bibliotecaTexto}

OPORTUNIDADES YA EVALUADAS ANTES PARA ESTE PROYECTO (no las repitas, ni seleccionadas ni descartadas):
${listaYaEvaluadas}

TAMAÑO DEL LOTE: selecciona exactamente ${TAMANO_LOTE} oportunidades para el lote de esta vez (las mejores, según tu criterio de priorización). Registra también las demás candidatas que evaluaste y no quedaron en el lote, como descartadas con su motivo.

Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después, con este formato exacto:
{
  "seleccionadas": [
    {
      "nombre": "...", "entidad": "...", "tipo": "abierta actualmente | próxima apertura | recurrente | permanente | periódica | especial | cerrada pero reutilizable | futura | pendiente de nueva edición",
      "estado_convocatoria": "...", "fecha_cierre": "...", "monto": "...", "beneficiarios": "...", "territorio": "...",
      "linea_tematica": "...", "arista_relacionada": "...", "razon_relevancia": "...", "fuente_oficial": "URL real y verificable",
      "terminos_referencia": "...", "mecanismo_postulacion": "...", "alertas": "...", "informacion_faltante": "..."
    }
  ],
  "descartadas": [
    {
      "nombre": "...", "entidad": "...", "tipo": "...", "estado_convocatoria": "...", "fecha_cierre": "...", "monto": "...",
      "beneficiarios": "...", "territorio": "...", "linea_tematica": "...", "arista_relacionada": "...", "razon_relevancia": "...",
      "fuente_oficial": "...", "terminos_referencia": "...", "mecanismo_postulacion": "...", "alertas": "...",
      "informacion_faltante": "...", "motivo_descarte": "explica brevemente por qué no quedó en el lote"
    }
  ]
}
`;

    const cuerpoSolicitud = {
      systemInstruction: { parts: [{ text: PROMPT_MOTOR_2 }] },
      contents: [{ role: "user", parts: [{ text: instruccionUsuario }] }],
      tools: [{ google_search: {} }],
    };

    const { ok: geminiOk, data: dataGemini } = await llamarGeminiConReintentos(apiKeyGemini, cuerpoSolicitud);

    if (!geminiOk) {
      console.error("Error de Gemini en Motor 2:", JSON.stringify(dataGemini));
      return NextResponse.json({ error: "La API de Gemini devolvió un error", detalle: dataGemini }, { status: 500 });
    }

    const partesTexto = (dataGemini.candidates?.[0]?.content?.parts || [])
      .map((p: any) => p.text || "")
      .join("");
    const jsonLimpio = partesTexto.replace(/```json|```/g, "").trim();
    const resultado = JSON.parse(jsonLimpio);

    const filasParaGuardar = [
      ...(resultado.seleccionadas || []).map((c: any) => ({ ...c, id_proyecto, lote: numeroLote, seleccionada: true })),
      ...(resultado.descartadas || []).map((c: any) => ({ ...c, id_proyecto, lote: numeroLote, seleccionada: false })),
    ];

    if (filasParaGuardar.length > 0) {
      await supabase.from("convocatorias_candidatas_proyecto").insert(filasParaGuardar);
    }

    await supabase
      .from("proyectos_clientes_serving")
      .update({ fecha_ultimo_lote_convocatorias: new Date().toISOString() })
      .eq("id", id_proyecto);

    return NextResponse.json({
      ok: true,
      lote: numeroLote,
      seleccionadas: resultado.seleccionadas?.length || 0,
      descartadas: resultado.descartadas?.length || 0,
    });
  } catch (err: any) {
    console.error("Error en Motor 2 (buscar-convocatorias):", err);
    return NextResponse.json(
      { error: "Error al buscar convocatorias", detalle: err?.message || String(err) },
      { status: 500 }
    );
  }
}
