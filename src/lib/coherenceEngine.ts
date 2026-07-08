/**
 * Motor Matemático de Coherencia Metodológica (Metodología Serving)
 * Valida la consistencia cuantitativa y semántica de un indicador frente a la población objetivo.
 */

export interface CoherenceReport {
  score: number;                   // Puntaje final de consistencia (0-100)
  poblacion_detectada: number;     // Volumen numérico estimado de beneficiarios
  cobertura_porcentaje: number;    // Relación porcentual meta/población
  coherencia_semantica: boolean;   // Si hay concordancia de categorías
  estado: 'COMPATIBLE' | 'ADVERTENCIA' | 'INCOHERENTE';
  observaciones: string[];         // Diagnósticos técnicos detallados
}

/**
 * Extrae el primer número válido encontrado en un texto para estimar la población objetivo.
 * Si no encuentra números, retorna 0.
 */
function extraerNumeroPoblacion(texto: string): number {
  if (!texto) return 0;
  // Busca patrones como "300 personas", "1.200 beneficiarios", "50 agricultores"
  const cleanText = texto.replace(/\./g, ''); // Limpiar separadores de miles
  const matches = cleanText.match(/\b\d+\b/);
  if (matches) {
    return parseInt(matches[0], 10);
  }
  return 0;
}

/**
 * Compara tokens clave entre la unidad de medida y la población objetivo para evaluar concordancia semántica.
 */
function verificarAlineacionSemantica(unidadMedida: string, poblacionObjetivo: string): boolean {
  if (!unidadMedida || !poblacionObjetivo) return false;

  const normalizar = (txt: string) => txt.toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Quitar acentos
    .match(/[a-z]{4,}/g) || []; // Palabras de más de 3 letras

  const tokensUnidad = new Set(normalizar(unidadMedida));
  const tokensPoblacion = new Set(normalizar(poblacionObjetivo));

  // Diccionario de equivalencias o sinónimos conceptuales de población
  const familiasSinonimos: Array<Set<string>> = [
    new Set(['persona', 'mujer', 'hombre', 'joven', 'estudiante', 'beneficiario', 'productor', 'agricultor', 'participante', 'capacitado']),
    new Set(['finca', 'predio', 'hectarea', 'terreno', 'cultivo', 'tierra']),
    new Set(['empresa', 'asociacion', 'cooperativa', 'gremio', 'organizacion', 'jac', 'cabildo', 'consejo'])
  ];

  // 1. Intersección directa de palabras clave
  let interseccion = 0;
  for (const token of tokensUnidad) {
    if (tokensPoblacion.has(token)) {
      interseccion++;
    }
  }

  if (interseccion > 0) return true;

  // 2. Coincidencia por familias de sinónimos
  for (const familia of familiasSinonimos) {
    const unidadTieneFamilia = [...tokensUnidad].some(t => familia.has(t));
    const poblacionTieneFamilia = [...tokensPoblacion].some(t => familia.has(t));
    if (unidadTieneFamilia && poblacionTieneFamilia) {
      return true; // Pertenecen a la misma categoría conceptual
    }
  }

  return false;
}

/**
 * Calcula la coherencia matemática de la meta del indicador frente a la población objetivo.
 */
export function calculateIndicatorCoherence(
  unidadMedida: string,
  meta: number,
  poblacionTexto: string
): CoherenceReport {
  const observaciones: string[] = [];
  const poblacionDetectada = extraerNumeroPoblacion(poblacionTexto);
  
  let score = 100;
  let coherenciaSemantica = true;
  let coberturaPorcentaje = 0;

  // 1. Validación de entradas
  if (meta <= 0) {
    score = 0;
    observaciones.push("ERROR CRÍTICO: La meta del indicador debe ser mayor que cero.");
    return {
      score,
      poblacion_detectada: poblacionDetectada,
      cobertura_porcentaje: 0,
      coherencia_semantica: false,
      estado: 'INCOHERENTE',
      observaciones
    };
  }

  if (poblacionDetectada === 0) {
    score -= 20;
    observaciones.push("ADVERTENCIA: No se pudo determinar numéricamente la población objetivo desde el texto provisto.");
  } else {
    // Calcular porcentaje de cobertura
    coberturaPorcentaje = parseFloat(((meta / poblacionDetectada) * 100).toFixed(2));

    // Analizar relación cuantitativa
    if (coberturaPorcentaje > 100) {
      // Sobredimensionamiento o duplicación de servicios por beneficiario
      score -= 15;
      observaciones.push(`ADVERTENCIA: La meta (${meta}) supera la población objetivo estimada (${poblacionDetectada}) en un ${coberturaPorcentaje}%. Verifique si se trata de múltiples atenciones por beneficiario.`);
    } else if (coberturaPorcentaje < 5) {
      score -= 10;
      observaciones.push(`Sugerencia: La cobertura de la meta es baja (${coberturaPorcentaje}%) respecto al volumen de la población afectada.`);
    } else {
      observaciones.push(`Consistencia cuantitativa validada. Cobertura del ${coberturaPorcentaje}% de la población objetivo.`);
    }
  }

  // 2. Validación de Alineación Semántica
  coherenciaSemantica = verificarAlineacionSemantica(unidadMedida, poblacionTexto);
  if (!coherenciaSemantica && poblacionDetectada > 0) {
    score -= 30;
    observaciones.push(`ADVERTENCIA DE COHERENCIA: La unidad de medida "${unidadMedida}" no muestra una alineación semántica directa con el tipo de población objetivo ("${poblacionTexto}").`);
  } else if (coherenciaSemantica) {
    observaciones.push("Alineación semántica verificada y aprobada.");
  }

  // 3. Determinar estado final
  let estado: 'COMPATIBLE' | 'ADVERTENCIA' | 'INCOHERENTE' = 'COMPATIBLE';
  if (score < 50) {
    estado = 'INCOHERENTE';
  } else if (score < 85) {
    estado = 'ADVERTENCIA';
  }

  return {
    score: Math.max(0, score),
    poblacion_detectada: poblacionDetectada,
    cobertura_porcentaje: coberturaPorcentaje,
    coherencia_semantica: coherenciaSemantica,
    estado,
    observaciones
  };
}
