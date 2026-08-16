import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import mammoth from "mammoth";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PROMPT_MOTOR_1 = `
Eres el MOTOR DE ESTRUCTURACIÓN del sistema de Arquitectura Digital de Proyectos.

Tu función es transformar una idea, necesidad, iniciativa, proyecto existente o conjunto de información suministrada por el usuario en un PROYECTO MAESTRO técnicamente estructurado, coherente, viable, financiable y preparado para posteriormente buscar oportunidades de financiación.

Tu responsabilidad termina con la construcción y validación del PROYECTO MAESTRO.

NO buscas convocatorias en este módulo.
NO haces encaje con una convocatoria específica.
NO adaptas el proyecto a una convocatoria.
NO realizas la postulación.

Esas funciones pertenecen a los motores posteriores.

---
2. PRINCIPIO FUNDAMENTAL
---

El resultado de este motor es un único:
PROYECTO MAESTRO

El Proyecto Maestro representa el proyecto real del cliente. Debe conservar:
- propósito
- identidad
- problema que pretende resolver
- población
- territorio
- solución
- lógica de intervención
- resultados esperados

Los módulos posteriores podrán crear versiones específicas para diferentes convocatorias, pero NUNCA deberán destruir, reemplazar ni alterar el Proyecto Maestro original.

---
3. ENTRADAS
---

Puedes recibir: idea de proyecto, proyecto preliminar, proyecto existente, diagnóstico, documentos, formularios, estudios, bases de datos, información institucional, información territorial, información de beneficiarios, presupuestos, cronogramas, antecedentes, experiencias previas, archivos suministrados por el cliente.

Debes analizar toda la información disponible antes de estructurar.
NO inventes información que no esté sustentada.

Cuando falte información crítica:
- identifícala
- explica por qué es necesaria
- solicita únicamente lo indispensable
- registra las incertidumbres

---
4. DIAGNÓSTICO ESTRATÉGICO
---

Determina: situación actual, necesidad, problema central, causas, efectos, población afectada, territorio, contexto, magnitud, antecedentes, capacidades existentes, oportunidades, restricciones, riesgos.

Genera el DIAGNÓSTICO ESTRATÉGICO DEL PROYECTO.

---
5. ÁRBOL DEL PROBLEMA
---

Construye y valida:
PROBLEMA CENTRAL → CAUSAS DIRECTAS → CAUSAS INDIRECTAS
y:
PROBLEMA CENTRAL → EFECTOS DIRECTOS → EFECTOS INDIRECTOS

Verifica: relación causal, temporalidad, coherencia, ausencia de circularidad, diferencia entre causa, problema y efecto.

---
6. ÁRBOL DE OBJETIVOS
---

Construye el espejo estratégico:
CAUSAS → MEDIOS
PROBLEMA → OBJETIVO
EFECTOS → FINES

Verifica que exista correspondencia entre ambos árboles.

---
7. ALTERNATIVAS
---

Identifica diferentes alternativas de solución. Evalúalas según: pertinencia, viabilidad, costo, capacidad institucional, impacto, innovación, sostenibilidad, escalabilidad, riesgo.

Selecciona la alternativa más sólida y justifica la decisión.

---
8. CADENA DE VALOR
---

Construye: OBJETIVO ESPECÍFICO → PRODUCTO → UNIDAD → CANTIDAD/META → ACTIVIDADES

Las actividades deben permitir producir efectivamente los productos. Cuando corresponda, organiza actividades en: actividades principales, administración, supervisión, seguimiento.

---
9. TEORÍA DE CAMBIO
---

Construye: INSUMOS → ACTIVIDADES → PRODUCTOS → RESULTADOS → EFECTOS → IMPACTO

Explica los supuestos que permiten que la cadena funcione.

---
10. PROPUESTA DE VALOR
---

Define: qué problema resuelve, para quién, cómo lo resuelve, qué lo diferencia, qué valor genera, por qué es relevante, por qué es viable.

---
11. COMPONENTES DEL PROYECTO
---

Define y desarrolla: nombre, entidad, responsables, problema, justificación, objetivo general, objetivos específicos, población beneficiaria, territorio, metodología, productos, actividades, indicadores, metas, resultados, impacto, innovación, sostenibilidad, escalabilidad, alianzas, riesgos, cronograma, presupuesto, cofinanciación, aportes en especie, seguimiento y evaluación.

---
12. PRESUPUESTO
---

Construye y valida el presupuesto. Verifica: coherencia entre actividades y costos, coherencia con cronograma, precios, cantidades, unidades, rubros, talento humano, equipos/software, servicios tecnológicos, materiales, formación, propiedad intelectual/divulgación, administración, supervisión, contingencias cuando correspondan, cofinanciación, aportes en especie.

Aplica las restricciones presupuestales disponibles en la metodología del sistema.
NO inventes precios cuando se requiera una cotización real.

---
13. VIABILIDAD
---

Evalúa: técnica, financiera, institucional, operativa, territorial, social, ambiental cuando corresponda, jurídica cuando corresponda, sostenibilidad.

Genera un concepto de viabilidad.

---
14. DOCUMENTACIÓN
---

Identifica: DOCUMENTOS DISPONIBLES, DOCUMENTOS FALTANTES, DOCUMENTOS QUE DEBEN ACTUALIZARSE, DOCUMENTOS QUE DEBEN PRODUCIRSE.

---
15. PERFIL DE FINANCIACIÓN
---

Sin buscar convocatorias específicas, identifica las características del proyecto que posteriormente servirán para la búsqueda: sectores, líneas temáticas, poblaciones, territorios, tecnologías, enfoques, problemas, objetivos, capacidades, alianzas, tipos de financiación potencial, características diferenciales.

No limites artificialmente las categorías. El proyecto puede tener múltiples aristas.

---
16. CONTROL DE CALIDAD
---

Antes de declarar terminado el Proyecto Maestro, verifica:
problema ↔ causas, problema ↔ objetivos, objetivos ↔ productos, productos ↔ actividades, actividades ↔ presupuesto, indicadores ↔ objetivos, metas ↔ indicadores, cronograma ↔ actividades, presupuesto ↔ cronograma, solución ↔ problema, resultados ↔ intervención.

Detecta contradicciones.

IMPORTANTE PARA ESTA INTEGRACIÓN: además de construir el contenido del Proyecto Maestro, debes evaluar el avance contra la lista de pasos de estructuración que se te entrega en el mensaje del usuario, y responder en el formato JSON estricto que se te solicita ahí — no agregues las 35 secciones de la salida final como texto libre, usa el formato JSON pedido en las instrucciones del usuario para esta tarea específica.

REGLA DE CRITICIDAD: los siguientes pasos son considerados CRÍTICOS y nunca deben quedar sin resolver silenciosamente: problema central, árbol del problema, población objetivo, población, presupuesto, objetivo general, solución propuesta. Si alguno de estos queda incompleto por falta de información, márcalo como crítico en tu respuesta. El resto de los pasos, si quedan incompletos, márcalos como no críticos.

REGLA DE ADVERTENCIA: si completas un paso pero la información que tienes es débil, poco sustentada, o el cliente tendría que reforzarla antes de postular a una convocatoria real (por ejemplo, un presupuesto sin cifras reales, o un problema sin evidencia clara), complétalo igual pero agrega una advertencia breve explicando qué debería reforzarse.
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
      console.log(`Gemini ocupado (intento ${intento}/${maxIntentos}), reintentando en ${intento * 5} segundos...`);
      await esperar(intento * 5000);
      continue;
    }

    return ultimoResultado;
  }

  return ultimoResultado;
}

export async function POST(req: NextRequest) {
  try {
    const { id_proyecto, ruta_documento, tipo_archivo } = await req.json();

    if (!id_proyecto || !ruta_documento) {
      return NextResponse.json(
        { error: "Falta id_proyecto o ruta_documento" },
        { status: 400 }
      );
    }

    const apiKeyGemini = process.env.GEMINI_KEY;
    if (!apiKeyGemini) {
      return NextResponse.json(
        { error: "Falta configurar GEMINI_KEY en el servidor" },
        { status: 500 }
      );
    }

    const { data: archivo, error: errorArchivo } = await supabase.storage
      .from("documentos-proyectos")
      .download(ruta_documento);

    if (errorArchivo || !archivo) {
      console.error("Error leyendo el documento del bucket:", JSON.stringify(errorArchivo));
      return NextResponse.json(
        { error: "No se pudo leer el documento subido", detalle: JSON.stringify(errorArchivo) },
        { status: 500 }
      );
    }

    const bufferArchivo = Buffer.from(await archivo.arrayBuffer());

    const { data: pasos, error: errorPasos } = await supabase
      .from("pasos_estructuracion")
      .select("id, nombre_paso, orden_secuencia")
      .order("orden_secuencia");

    if (errorPasos || !pasos) {
      console.error("Error leyendo pasos_estructuracion:", JSON.stringify(errorPasos));
      return NextResponse.json(
        { error: "No se pudieron leer los 42 pasos", detalle: JSON.stringify(errorPasos) },
        { status: 500 }
      );
    }

    // Traemos lo que ya está estructurado de este proyecto (si algo ya existe),
    // para que la IA lo use como base y no reemplace lo que ya está bien.
    const { data: contenidoExistente } = await supabase
      .from("contenido_pasos_proyecto")
      .select("id_paso, contenido")
      .eq("id_proyecto", id_proyecto);

    const hayContenidoPrevio = (contenidoExistente?.length || 0) > 0;
    const resumenContenidoPrevio = hayContenidoPrevio
      ? contenidoExistente!
          .map((c) => {
            const nombrePaso = pasos.find((p) => p.id === c.id_paso)?.nombre_paso || `paso ${c.id_paso}`;
            return `--- ${nombrePaso} ---\n${c.contenido}`;
          })
          .join("\n\n")
      : "";

    const instruccionFormato = `
${hayContenidoPrevio ? `Este proyecto YA tiene contenido estructurado previamente. Aquí está lo que ya existe:\n\n${resumenContenidoPrevio}\n\nEl documento o texto nuevo que recibes a continuación es INFORMACIÓN COMPLEMENTARIA para completar lo que faltaba de ESE MISMO proyecto. Antes de usarlo, verifica que el contenido nuevo sea coherente con el proyecto ya existente (mismo tema, mismo problema, misma población). Si el contenido nuevo parece pertenecer a un proyecto completamente distinto y no tiene relación con lo ya estructurado, NO lo mezcles: en vez de eso, para el o los pasos afectados, responde con estado "incompleto" y una pregunta que diga textualmente: "La información recibida no parece corresponder a este proyecto. Por favor confirma o sube información relacionada con el mismo proyecto." No inventes conexión donde no la hay.\n\n` : ""}Analiza el documento y complétalo contra esta lista de ${pasos.length} pasos de estructuración:
${pasos.map((p) => `- id ${p.id}: ${p.nombre_paso}`).join("\n")}

Para CADA paso, responde si hay información suficiente para desarrollarlo completo, o si falta información esencial.

Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después, con este formato exacto:
{
  "pasos": [
    { "id_paso": 1, "estado": "completo", "contenido": "texto desarrollado del paso...", "advertencia": null },
    { "id_paso": 2, "estado": "completo", "contenido": "texto desarrollado...", "advertencia": "Esta parte quedó débil porque..." },
    { "id_paso": 3, "estado": "incompleto", "pregunta": "pregunta clara y específica...", "critico": true }
  ]
}

El campo "advertencia" solo aplica a pasos "completo" y va en null si no hay ninguna advertencia. El campo "critico" solo aplica a pasos "incompleto" (true o false).
`;

    const partesUsuario: any[] = [];

    if (tipo_archivo === "word") {
      const resultadoMammoth = await mammoth.extractRawText({ buffer: bufferArchivo });
      const textoExtraido = resultadoMammoth.value;
      partesUsuario.push({
        text: `Contenido del documento del cliente (extraído de un archivo Word):\n\n${textoExtraido}\n\n${instruccionFormato}`,
      });
    } else {
      const base64Archivo = bufferArchivo.toString("base64");
      const mimeType = tipo_archivo === "imagen" ? "image/jpeg" : "application/pdf";
      partesUsuario.push({
        inlineData: { mimeType, data: base64Archivo },
      });
      partesUsuario.push({ text: instruccionFormato });
    }

    const cuerpoSolicitud = {
      systemInstruction: { parts: [{ text: PROMPT_MOTOR_1 }] },
      contents: [{ role: "user", parts: partesUsuario }],
    };

    const { ok: geminiOk, data: dataGemini } = await llamarGeminiConReintentos(
      apiKeyGemini,
      cuerpoSolicitud
    );

    if (!geminiOk) {
      console.error("Error de la API de Gemini (tras reintentos):", JSON.stringify(dataGemini));
      return NextResponse.json(
        { error: "La API de Gemini devolvió un error", detalle: dataGemini },
        { status: 500 }
      );
    }

    const textoRespuesta = dataGemini.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    const jsonLimpio = textoRespuesta.replace(/```json|```/g, "").trim();
    const resultado = JSON.parse(jsonLimpio);

    for (const paso of resultado.pasos) {
      if (paso.estado === "completo" && paso.contenido) {
        await supabase.from("contenido_pasos_proyecto").upsert({
          id_proyecto,
          id_paso: paso.id_paso,
          contenido: paso.contenido,
          advertencia: paso.advertencia || null,
        });
        await supabase.from("avance_estructuracion_proyecto").upsert({
          proyecto_id: id_proyecto,
          paso_id: paso.id_paso,
          completado: true,
          fecha_completado: new Date().toISOString(),
        });
        // Si este paso tenía una pregunta pendiente de antes, la marcamos como resuelta
        await supabase
          .from("preguntas_pendientes_proyecto")
          .update({ respondida: true, respondido_en: new Date().toISOString() })
          .eq("id_proyecto", id_proyecto)
          .eq("id_paso", paso.id_paso)
          .eq("respondida", false);
      } else if (paso.estado === "incompleto" && paso.pregunta) {
        // Evitamos duplicar la misma pregunta pendiente si ya existía una sin responder para ese paso
        const { data: existente } = await supabase
          .from("preguntas_pendientes_proyecto")
          .select("id")
          .eq("id_proyecto", id_proyecto)
          .eq("id_paso", paso.id_paso)
          .eq("respondida", false)
          .limit(1);

        if (!existente || existente.length === 0) {
          await supabase.from("preguntas_pendientes_proyecto").insert({
            id_proyecto,
            id_paso: paso.id_paso,
            pregunta: paso.pregunta,
            critico: paso.critico === true,
          });
        }
      }
    }

    // Actualizamos el candado: listo_para_busqueda = true solo si NO quedan
    // preguntas críticas sin responder para este proyecto.
    const { data: criticasPendientes } = await supabase
      .from("preguntas_pendientes_proyecto")
      .select("id")
      .eq("id_proyecto", id_proyecto)
      .eq("respondida", false)
      .eq("critico", true);

    const listoParaBusqueda = !criticasPendientes || criticasPendientes.length === 0;

    await supabase
      .from("proyectos_clientes_serving")
      .update({ listo_para_busqueda: listoParaBusqueda })
      .eq("id", id_proyecto);

    return NextResponse.json({ ok: true, pasos_procesados: resultado.pasos.length, listo_para_busqueda: listoParaBusqueda });
  } catch (err: any) {
    console.error("Error en Motor 1:", err);
    return NextResponse.json(
      { error: "Error al procesar el proyecto", detalle: err?.message || String(err) },
      { status: 500 }
    );
  }
}
