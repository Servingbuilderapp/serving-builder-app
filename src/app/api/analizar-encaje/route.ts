import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROMPT_MOTOR_3 = `
Eres el MOTOR DE ENCAJE E INGENIERÍA DE ADAPTACIÓN del sistema de Arquitectura Digital de Proyectos.

Recibes:
1. PROYECTO MAESTRO
2. OPORTUNIDADES seleccionadas por el MOTOR DE BÚSQUEDA

Tu misión es determinar el nivel de encaje y, posteriormente, diseñar la adaptación estratégica necesaria para convertir el proyecto en una propuesta altamente competitiva para una convocatoria específica.

---
2. PRINCIPIO FUNDAMENTAL
---

NO debes limitarte a decir: "El proyecto encaja." o "El proyecto no encaja."

Debes responder:
# ¿CÓMO PODEMOS HACER QUE ESTE PROYECTO ENCAJE MEJOR?

La adaptación debe respetar: propósito, esencia, identidad, problema, lógica de intervención, viabilidad, integridad del proyecto.

NO se permite inventar capacidades, beneficiarios, resultados, alianzas, experiencias o componentes inexistentes.

---
3. PROYECTO MAESTRO
---

El Proyecto Maestro es intocable. Nunca lo reemplaces. Nunca lo sobrescribas. Nunca pierdas su versión original.

Toda adaptación debe generar:
# VERSIÓN DE POSTULACIÓN

La versión de postulación pertenece al mismo proyecto.

---
4. ANÁLISIS PROFUNDO DE LA CONVOCATORIA
---

Analiza: objeto, objetivos, líneas, criterios, elegibilidad, beneficiarios, territorio, actividades, productos, resultados, indicadores, innovación, impacto, sostenibilidad, presupuesto, rubros, alianzas, cronograma, documentos, evaluación, puntajes, causales de rechazo, requisitos habilitantes, términos de referencia.

---
5. MATRIZ DE ENCAJE
---

Construye una matriz:
CRITERIO DE CONVOCATORIA | REQUERIMIENTO | SITUACIÓN ACTUAL DEL PROYECTO | BRECHA | NIVEL DE ENCAJE | ADAPTACIÓN POSIBLE | EVIDENCIA NECESARIA | RIESGO

Calcula: ENCAJE ACTUAL y ENCAJE POTENCIAL

---
6. INGENIERÍA DE ADAPTACIÓN
---

Determina qué puede modificarse estratégicamente: título, resumen, lenguaje, énfasis, justificación, objetivos específicos, productos, actividades, indicadores, metas, población, territorio, metodología, innovación, tecnología, sostenibilidad, alianzas, cronograma, presupuesto, rubros, resultados, evidencias.

Cada cambio debe explicar:
1. qué cambia
2. por qué
3. cómo mejora el encaje
4. qué evidencia lo respalda
5. qué riesgo tiene

---
7. LENGUAJE DE LA CONVOCATORIA
---

Adapta la redacción para utilizar el lenguaje institucional de la convocatoria. No significa copiar. Significa hablar en los términos que utiliza el evaluador, siempre que sean verdaderos y compatibles con el proyecto.

---
8. TRES ESCENARIOS
---

Determina:
ESCENARIO A — Postular sin modificaciones.
ESCENARIO B — Postular con adaptaciones menores.
ESCENARIO C — Realizar adaptación estratégica profunda.

Explica cuál recomienda el sistema.

---
9. SEMÁFORO
---

🟢 VERDE — Buen encaje y condiciones favorables.
🟡 AMARILLO — Existe oportunidad, pero hay brechas, restricciones o poco tiempo.
🔴 ROJO — No es recomendable postular o existe impedimento crítico.

El semáforo debe considerar como mínimo: posibilidad de competitividad, posibilidad de mejorar mediante adaptación, tiempo disponible.

---
10. PUNTAJE
---

Entrega un puntaje general y explica sus componentes. Diferencia: encaje actual, encaje potencial, competitividad, riesgo, tiempo.

---
11. CHECKLIST DE PREPARACIÓN
---

Genera un checklist exhaustivo: requisitos, documentos, certificados, cartas, alianzas, presupuesto, contrapartida, formularios, firmas, anexos, evidencias, registros, requisitos jurídicos, requisitos técnicos, requisitos financieros.

NO limites el checklist artificialmente. Si existen 8 elementos, entrega 8. Si existen 30, entrega 30.

---
12. GENERACIÓN AUTOMÁTICA DE LA VERSIÓN DE POSTULACIÓN
---

IMPORTANTE PARA ESTA INTEGRACIÓN: en este flujo NO se espera una decisión manual del cliente antes de generar la Versión de Postulación — siempre debes generarla como parte de tu entrega, incluso si el semáforo queda en amarillo o rojo (en esos casos, la Versión de Postulación se genera igual, pero tus recomendaciones y riesgos deben dejar muy claro qué tan recomendable es usarla).

Esta versión pasa al MOTOR DE POSTULACIÓN.

---
13. CONSERVACIÓN DEL PROYECTO
---

Mantén siempre: PROYECTO MAESTRO + VERSIÓN DE POSTULACIÓN

Nunca sustituir uno por otro. Una misma convocatoria puede tener una versión. Otra convocatoria puede tener otra versión. Todas pertenecen al mismo Proyecto Maestro.

---
14. SALIDA
---

Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después, con este formato exacto:
{
  "resumen_convocatoria": "resumen breve de la convocatoria",
  "encaje_actual": "descripción del encaje actual, con % aproximado",
  "encaje_potencial": "descripción del encaje potencial tras adaptación, con % aproximado",
  "matriz_requisitos": [
    { "criterio": "...", "requerimiento": "...", "situacion_actual": "...", "brecha": "...", "nivel_encaje": "...", "adaptacion_posible": "...", "evidencia_necesaria": "...", "riesgo": "..." }
  ],
  "brechas": "resumen de las brechas principales",
  "oportunidades_adaptacion": "resumen de oportunidades de adaptación",
  "ingenieria_adaptacion": [
    { "que_cambia": "...", "por_que": "...", "como_mejora": "...", "evidencia": "...", "riesgo": "..." }
  ],
  "lenguaje_recomendado": "notas sobre el lenguaje institucional a usar",
  "cambios_propuestos": "resumen de los cambios propuestos",
  "escenario_recomendado": "A | B | C, con explicación breve de por qué",
  "semaforo": "verde | amarillo | rojo",
  "puntaje_general": 0,
  "puntaje_detalle": { "encaje_actual": 0, "encaje_potencial": 0, "competitividad": 0, "riesgo": 0, "tiempo": 0 },
  "riesgos": "riesgos principales",
  "tiempo_disponible": "análisis del tiempo disponible antes del cierre",
  "checklist_preparacion": ["item 1", "item 2"],
  "documentacion_faltante": "documentación que falta conseguir",
  "recomendaciones": "recomendaciones finales para el cliente",
  "version_postulacion": "texto completo y desarrollado de la Versión de Postulación adaptada a esta convocatoria específica, lista para usarse como base de la postulación"
}

FIN DEL MOTOR DE ENCAJE.
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
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`,
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

async function ejecutarEncaje(id_convocatoria: string) {
  const apiKeyGemini = process.env.GEMINI_API_KEY || process.env.GEMINI_KEY;
  if (!apiKeyGemini) {
    return { status: 500, body: { error: "Falta configurar GEMINI_API_KEY en el servidor" } };
  }

  const { data: convocatoria, error: errorConvocatoria } = await supabase
    .from("convocatorias_candidatas_proyecto")
    .select("*")
    .eq("id", id_convocatoria)
    .single();

  if (errorConvocatoria || !convocatoria) {
    return { status: 404, body: { error: "No se encontró la convocatoria", detalle: errorConvocatoria?.message } };
  }

  const id_proyecto = convocatoria.id_proyecto;

  const { data: contenido, error: errorContenido } = await supabase
    .from("contenido_pasos_proyecto")
    .select("id_paso, contenido")
    .eq("id_proyecto", id_proyecto);

  if (errorContenido || !contenido || contenido.length === 0) {
    return { status: 400, body: { error: "No hay contenido estructurado para este proyecto todavía" } };
  }

  const { data: pasos } = await supabase
    .from("pasos_estructuracion")
    .select("id, nombre_paso, orden_secuencia")
    .order("orden_secuencia");

  const mapaNombres = new Map((pasos || []).map((p) => [p.id, p.nombre_paso]));
  const proyectoMaestroTexto = contenido
    .map((c) => `--- ${mapaNombres.get(c.id_paso) || "paso"} ---\n${c.contenido}`)
    .join("\n\n");

  const convocatoriaTexto = `
Nombre: ${convocatoria.nombre}
Entidad: ${convocatoria.entidad}
Tipo: ${convocatoria.tipo}
Estado de la convocatoria: ${convocatoria.estado_convocatoria}
Fecha de cierre: ${convocatoria.fecha_cierre}
Monto: ${convocatoria.monto}
Beneficiarios: ${convocatoria.beneficiarios}
Territorio: ${convocatoria.territorio}
Línea temática: ${convocatoria.linea_tematica}
Arista del proyecto relacionada: ${convocatoria.arista_relacionada}
Razón de relevancia: ${convocatoria.razon_relevancia}
Fuente oficial: ${convocatoria.fuente_oficial}
Términos de referencia: ${convocatoria.terminos_referencia}
Mecanismo de postulación: ${convocatoria.mecanismo_postulacion}
Alertas: ${convocatoria.alertas}
Información faltante: ${convocatoria.informacion_faltante}
`;

  const instruccionUsuario = `
PROYECTO MAESTRO:
${proyectoMaestroTexto}

OPORTUNIDAD SELECCIONADA POR EL MOTOR DE BÚSQUEDA:
${convocatoriaTexto}
`;

  const cuerpoSolicitud = {
    systemInstruction: { parts: [{ text: PROMPT_MOTOR_3 }] },
    contents: [{ role: "user", parts: [{ text: instruccionUsuario }] }],
  };

  const { ok: geminiOk, data: dataGemini } = await llamarGeminiConReintentos(apiKeyGemini, cuerpoSolicitud);

  if (!geminiOk) {
    console.error("Error de Gemini en Motor 3:", JSON.stringify(dataGemini));
    return { status: 500, body: { error: "La API de Gemini devolvió un error", detalle: dataGemini } };
  }

  const partesTexto = (dataGemini.candidates?.[0]?.content?.parts || [])
    .map((p: any) => p.text || "")
    .join("");
  const jsonLimpio = partesTexto.replace(/```json|```/g, "").trim();

  let resultado: any;
  try {
    resultado = JSON.parse(jsonLimpio);
  } catch (e) {
    console.error("No se pudo interpretar la respuesta del Motor 3 como JSON:", partesTexto);
    return { status: 500, body: { error: "Respuesta de Gemini no fue JSON válido", detalle: partesTexto.slice(0, 2000) } };
  }

  const { error: errorGuardar } = await supabase.from("encajes_convocatoria_proyecto").upsert(
    {
      id_proyecto,
      id_convocatoria,
      resumen_convocatoria: resultado.resumen_convocatoria,
      encaje_actual: resultado.encaje_actual,
      encaje_potencial: resultado.encaje_potencial,
      matriz_requisitos: resultado.matriz_requisitos,
      brechas: resultado.brechas,
      oportunidades_adaptacion: resultado.oportunidades_adaptacion,
      ingenieria_adaptacion: resultado.ingenieria_adaptacion,
      lenguaje_recomendado: resultado.lenguaje_recomendado,
      cambios_propuestos: resultado.cambios_propuestos,
      escenario_recomendado: resultado.escenario_recomendado,
      semaforo: resultado.semaforo,
      puntaje_general: resultado.puntaje_general,
      puntaje_detalle: resultado.puntaje_detalle,
      riesgos: resultado.riesgos,
      tiempo_disponible: resultado.tiempo_disponible,
      checklist_preparacion: resultado.checklist_preparacion,
      documentacion_faltante: resultado.documentacion_faltante,
      recomendaciones: resultado.recomendaciones,
      version_postulacion: resultado.version_postulacion,
    },
    { onConflict: "id_convocatoria" }
  );

  if (errorGuardar) {
    console.error("Error guardando el encaje:", JSON.stringify(errorGuardar));
    return { status: 500, body: { error: "Error al guardar el encaje", detalle: errorGuardar } };
  }

  return { status: 200, body: { ok: true, semaforo: resultado.semaforo, puntaje_general: resultado.puntaje_general } };
}

export async function POST(req: NextRequest) {
  try {
    const { id_convocatoria } = await req.json();
    if (!id_convocatoria) {
      return NextResponse.json({ error: "Falta id_convocatoria" }, { status: 400 });
    }
    const resultado = await ejecutarEncaje(id_convocatoria);
    return NextResponse.json(resultado.body, { status: resultado.status });
  } catch (err: any) {
    console.error("Error en Motor 3 (analizar-encaje, POST):", err);
    return NextResponse.json(
      { error: "Error al analizar el encaje", detalle: err?.message || String(err) },
      { status: 500 }
    );
  }
}

// Disparo manual por navegador, útil para pruebas: visita
// /api/analizar-encaje?id_convocatoria=EL-ID-DE-LA-CONVOCATORIA
export async function GET(req: NextRequest) {
  try {
    const id_convocatoria = req.nextUrl.searchParams.get("id_convocatoria");
    if (!id_convocatoria) {
      return NextResponse.json({ error: "Falta ?id_convocatoria= en la URL" }, { status: 400 });
    }
    const resultado = await ejecutarEncaje(id_convocatoria);
    return NextResponse.json(resultado.body, { status: resultado.status });
  } catch (err: any) {
    console.error("Error en Motor 3 (analizar-encaje, GET):", err);
    return NextResponse.json(
      { error: "Error al analizar el encaje", detalle: err?.message || String(err) },
      { status: 500 }
    );
  }
}
