/**
 * Motor de Evaluación Multicriterio y Auditoría Ex-Ante (Metodología Serving)
 * Evalúa el proyecto bajo 5 dimensiones técnicas clave (escala 0-20 por dimensión).
 * Actúa bajo el rol de Auditor de Viabilidad Técnica.
 */

export interface EvaluationResult {
  puntaje_propuesta_tecnica: number;
  puntaje_impacto_potencial: number;
  puntaje_capacidades_locales: number;
  puntaje_sostenibilidad: number;
  puntaje_replicabilidad: number;
  score_total: number;
  comentarios_criterios: Record<string, string>;
  recomendaciones_mejora: string[];
}

/**
 * Realiza la evaluación técnica ex-ante del proyecto basada en las respuestas y métricas de consistencia.
 */
export function evaluateProjectViability(
  fase1Data: any,
  fase2Data: any,
  consistencyScore: number // Porcentaje (0-100) obtenido en la validación causal
): EvaluationResult {
  const recomendaciones_mejora: string[] = [];
  const comentarios_criterios: Record<string, string> = {};

  // --- 1. PROPUESTA TÉCNICA (Máx: 20 pts) ---
  // Se basa principalmente en la coherencia y consistencia causal del Árbol
  const puntaje_propuesta_tecnica = Math.round((consistencyScore / 100) * 20);
  if (puntaje_propuesta_tecnica >= 17) {
    comentarios_criterios["Propuesta Técnica"] = "Excelente coherencia interna entre el problema central, causas inmediatas y objetivos específicos.";
  } else if (puntaje_propuesta_tecnica >= 12) {
    comentarios_criterios["Propuesta Técnica"] = "Estructura causal lógica aceptable. Se sugiere refinar la precisión semántica entre causas raíces indirectas y actividades del cronograma.";
    recomendaciones_mejora.push("Refinar la articulación causa-efecto del árbol lógico para asegurar un cierre de brechas del 100%.");
  } else {
    comentarios_criterios["Propuesta Técnica"] = "Debilidad detectada en la trazabilidad causal. El espejo de causas/objetivos presenta discrepancias metodológicas.";
    recomendaciones_mejora.push("Reestructurar los objetivos específicos técnico y comercial para que funcionen como espejo estricto de las causas prioritarias.");
  }

  // --- 2. IMPACTO POTENCIAL (Máx: 20 pts) ---
  // Evalúa la declaración de metas de impacto y mitigación de problemas
  let puntaje_impacto_potencial = 10;
  const descripcionImpacto = fase2Data?.f2_q6_objetivo_impacto || '';
  if (descripcionImpacto.length > 50) {
    puntaje_impacto_potencial += 8;
    comentarios_criterios["Impacto Potencial"] = "Las aristas de impacto socioambiental están correctamente estructuradas y cuantificadas.";
  } else if (descripcionImpacto.length > 15) {
    puntaje_impacto_potencial += 4;
    comentarios_criterios["Impacto Potencial"] = "Impacto proyectado en niveles básicos. Se sugiere incorporar métricas cuantitativas del alcance social o ambiental.";
    recomendaciones_mejora.push("Cuantificar el impacto estimado en la huella de carbono o la generación de empleos directos locales.");
  } else {
    comentarios_criterios["Impacto Potencial"] = "Impacto difuso o ausente. El proyecto no detalla los fines indirectos a largo plazo de la solución.";
    recomendaciones_mejora.push("Definir una meta clara de impacto social y/o ambiental medible a través de indicadores de fin directos.");
  }
  // Ajustar bonificación según consistencia
  if (consistencyScore > 80 && puntaje_impacto_potencial < 20) puntaje_impacto_potencial += 2;
  puntaje_impacto_potencial = Math.min(20, puntaje_impacto_potencial);

  // --- 3. CAPACIDADES LOCALES Y ARTICULACIÓN (Máx: 20 pts) ---
  // Evalúa la alianza y localización territorial clara
  let puntaje_capacidades_locales = 10;
  const aliados = fase2Data?.f2_q17_aliados || '';
  const ubicacion = fase1Data?.q2_ubicacion || '';
  if (aliados.length > 40 && ubicacion.length > 5) {
    puntaje_capacidades_locales += 9;
    comentarios_criterios["Capacidades Locales"] = "Estructura de alianzas local-institucionales sólida y cobertura territorial bien definida.";
  } else if (aliados.length > 10) {
    puntaje_capacidades_locales += 4;
    comentarios_criterios["Capacidades Locales"] = "Presencia de aliados iniciales. Se sugiere formalizar las cartas de intención y detallar el rol operativo de cada uno.";
    recomendaciones_mejora.push("Formalizar la vinculación de aliados estratégicos en el territorio mediante aportes en especie valorados en el presupuesto.");
  } else {
    comentarios_criterios["Capacidades Locales"] = "Riesgo de gobernanza: el proyecto no registra alianzas locales o institucionales de apoyo.";
    recomendaciones_mejora.push("Establecer un convenio preliminar con un actor institucional local (JAC, Alcaldía, Asociación) para mitigar riesgos de ejecución.");
  }
  puntaje_capacidades_locales = Math.min(20, puntaje_capacidades_locales);

  // --- 4. SOSTENIBILIDAD (Máx: 20 pts) ---
  // Evalúa el modelo de ingresos de largo plazo y costos
  let puntaje_sostenibilidad = 10;
  const ingresos = fase2Data?.f2_q21_fuentes_ingresos || '';
  const costos = fase2Data?.f2_q20_estructura_costos || '';
  if (ingresos.length > 40 && costos.length > 20) {
    puntaje_sostenibilidad += 9;
    comentarios_criterios["Sostenibilidad"] = "Modelo de sostenibilidad robusto soportado en diversificación de ingresos y claridad en costos fijos/variables.";
  } else if (ingresos.length > 10) {
    puntaje_sostenibilidad += 4;
    comentarios_criterios["Sostenibilidad"] = "Viabilidad financiera inicial. Falta robustecer la proyección de ingresos recurrentes post-proyecto.";
    recomendaciones_mejora.push("Detallar los flujos de ingresos recurrentes (suscripciones, ventas secundarias) que mantendrán la operación una vez finalizada la subvención.");
  } else {
    comentarios_criterios["Sostenibilidad"] = "Modelo financiero dependiente exclusivamente de la inyección de capital inicial sin retorno recurrente.";
    recomendaciones_mejora.push("Diseñar un esquema de monetización o recuperación de costos operativos para asegurar la continuidad del proyecto a largo plazo.");
  }
  puntaje_sostenibilidad = Math.min(20, puntaje_sostenibilidad);

  // --- 5. REPLICABILIDAD Y ESCALABILIDAD (Máx: 20 pts) ---
  // Evalúa el potencial de expansión sectorial y territorial
  let puntaje_replicabilidad = 10;
  const tamanoMercado = fase2Data?.f2_q14_tamano_mercado || '';
  const sector = fase1Data?.q3_sector || '';
  if (tamanoMercado.length > 40 && sector !== '') {
    puntaje_replicabilidad += 9;
    comentarios_criterios["Replicabilidad"] = "Alto potencial de replicabilidad tecnológica a nivel regional y nacional debido al tamaño de la brecha y modularidad del producto.";
  } else if (tamanoMercado.length > 10) {
    puntaje_replicabilidad += 4;
    comentarios_criterios["Replicabilidad"] = "Capacidad de replicación inicial restringida a la misma zona o comunidad. Requiere modularizar el producto.";
    recomendaciones_mejora.push("Diseñar un paquete o módulo técnico transferible (caja de herramientas) para facilitar el escalamiento en otros municipios del departamento.");
  } else {
    comentarios_criterios["Replicabilidad"] = "Baja escalabilidad evidenciada. El proyecto se concibe como una solución ad-hoc no estandarizada.";
    recomendaciones_mejora.push("Estandarizar los entregables y metodologías en el plan operativo para que puedan ser adaptados en futuros territorios con mínimas modificaciones.");
  }
  puntaje_replicabilidad = Math.min(20, puntaje_replicabilidad);

  // --- CÁLCULO DEL SCORE TOTAL ---
  const score_total = puntaje_propuesta_tecnica + puntaje_impacto_potencial + puntaje_capacidades_locales + puntaje_sostenibilidad + puntaje_replicabilidad;

  return {
    puntaje_propuesta_tecnica,
    puntaje_impacto_potencial,
    puntaje_capacidades_locales,
    puntaje_sostenibilidad,
    puntaje_replicabilidad,
    score_total,
    comentarios_criterios,
    recomendaciones_mejora
  };
}
