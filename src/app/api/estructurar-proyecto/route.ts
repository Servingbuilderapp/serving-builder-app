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
`;

export async function POST(req: NextRequest) {
  try {
    const { id_proyecto, ruta_documento, tipo_archivo } = await req.json();

    if (!id_proyecto || !ruta_documento) {
      return NextResponse.json(
        { error: "Falta id_proyecto o ruta_documento" },
        { status: 400 }
      );
    }

    const { data: archivo, error: errorArchivo } = await supabase.storage
      .from("documentos-proyectos")
      .download(ruta_documento);

    if (errorArchivo || !archivo) {
      return NextResponse.json(
        { error: "No se pudo leer el documento subido" },
        { status: 500 }
      );
    }

    const bufferArchivo = Buffer.from(await archivo.arrayBuffer());

    const { data: pasos, error: errorPasos } = await supabase
      .from("pasos_estructuracion")
      .select("id, nombre, orden")
      .order("orden");

    if (errorPasos || !pasos) {
      return NextResponse.json(
        { error: "No se pudieron leer los 42 pasos" },
        { status: 500 }
      );
    }

    const instruccionFormato = `
Analiza el documento y complétalo contra esta lista de ${pasos.length} pasos de estructuración:
${pasos.map((p) => `- id ${p.id}: ${p.nombre}`).join("\n")}

Para CADA paso, responde si hay información suficiente en el documento para desarrollarlo completo, o si falta información esencial.

Responde ÚNICAMENTE con un JSON válido, sin texto antes ni después, con este formato exacto:
{
  "pasos": [
    { "id_paso": 1, "estado": "completo", "contenido": "texto desarrollado del paso..." },
    { "id_paso": 2, "estado": "incompleto", "pregunta": "pregunta clara y específica para el cliente sobre lo que falta..." }
  ]
}
`;

    // Armamos el contenido según el tipo de archivo:
    // - Word (.doc/.docx): se extrae el texto con mammoth y se manda como texto plano
    // - PDF e imágenes: se mandan directo a Claude, que los lee sin conversión
    let contentParaClaude: any[];

    if (tipo_archivo === "word") {
      const resultadoMammoth = await mammoth.extractRawText({ buffer: bufferArchivo });
      const textoExtraido = resultadoMammoth.value;
      contentParaClaude = [
        {
          type: "text",
          text: `Contenido del documento del cliente (extraído de un archivo Word):\n\n${textoExtraido}\n\n${instruccionFormato}`,
        },
      ];
    } else {
      const base64Archivo = bufferArchivo.toString("base64");
      const mediaType = tipo_archivo === "imagen" ? "image/jpeg" : "application/pdf";
      const contentBlock =
        tipo_archivo === "imagen"
          ? { type: "image", source: { type: "base64", media_type: mediaType, data: base64Archivo } }
          : { type: "document", source: { type: "base64", media_type: mediaType, data: base64Archivo } };
      contentParaClaude = [contentBlock, { type: "text", text: instruccionFormato }];
    }

    const respuestaClaude = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-5",
        max_tokens: 8000,
        system: PROMPT_MOTOR_1,
        messages: [
          {
            role: "user",
            content: contentParaClaude,
          },
        ],
      }),
    });

    const dataClaude = await respuestaClaude.json();
    const textoRespuesta = dataClaude.content?.[0]?.text ?? "";
    const jsonLimpio = textoRespuesta.replace(/```json|```/g, "").trim();
    const resultado = JSON.parse(jsonLimpio);

    for (const paso of resultado.pasos) {
      if (paso.estado === "completo" && paso.contenido) {
        await supabase.from("contenido_pasos_proyecto").upsert({
          id_proyecto,
          id_paso: paso.id_paso,
          contenido: paso.contenido,
        });
        await supabase.from("avance_estructuracion_proyecto").upsert({
          proyecto_id: id_proyecto,
          paso_id: paso.id_paso,
          completado: true,
          fecha_completado: new Date().toISOString(),
        });
      } else if (paso.estado === "incompleto" && paso.pregunta) {
        await supabase.from("preguntas_pendientes_proyecto").insert({
          id_proyecto,
          id_paso: paso.id_paso,
          pregunta: paso.pregunta,
        });
      }
    }

    return NextResponse.json({ ok: true, pasos_procesados: resultado.pasos.length });
  } catch (err: any) {
    console.error("Error en Motor 1:", err);
    return NextResponse.json(
      { error: "Error al procesar el proyecto", detalle: err?.message || String(err) },
      { status: 500 }
    );
  }
