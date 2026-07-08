/**
 * Motor de Evaluación Multicriterio, Análisis de Brechas y Combinatoria Cruzada (Metodología de Formulación)
 * Evalúa el proyecto frente a las dimensiones matemáticas exigidas por los fondos de cofinanciación,
 * valida la simetría espejo estricta entre causas y medios, califica aliados estratégicos y genera
 * propuestas de combinatoria cruzada con inyección de conceptos novedosos.
 */

export interface TDRCriteriaMold {
  calidad_tecnica_max: 30;
  impacto_territorial_max: 25;
  capacidades_locales_max: 20;
  sostenibilidad_transferencia_max: 15;
  escalabilidad_replicabilidad_max: 10;
}

export interface AliadoEvaluacion {
  antiguedad_meses: number;
  contratos_5_anos: number;
  liquidez_optima: boolean;
  factores_cualitativos: {
    accesibilidad: 'alta' | 'media' | 'baja';
    colaboracion: boolean;
    agilidad_firma: 'inmediata' | 'lenta';
  };
}

export interface FiltroEstrategia {
  ventana_dias_cierre: number;
  complejidad_operativa_alta: boolean;
  requiere_renuncia_automatica: boolean;
  decision_sugerida: string;
}

export interface ProyectoBrechaAnalisis {
  score_actual: number;
  dimensiones_detalladas: {
    calidad_tecnica: number;
    impacto_territorial: number;
    capacidades_locales: number;
    sostenibilidad_transferencia: number;
    escalabilidad_replicabilidad: number;
  };
  aristas_debiles_detectadas: string[];
  recomendaciones_reconfiguracion: string[];
  simetria_arbol: {
    valida: boolean;
    total_causas: number;
    total_medios: number;
    mensaje: string;
  };
  evaluacion_aliado?: {
    score_aliado: number;
    alertas_riesgo: string[];
  };
  filtro_estrategia?: FiltroEstrategia;
}

/**
 * Valida la simetría espejo estricta 1:1 entre el Árbol de Problemas y el Árbol de Objetivos.
 */
export function validarSimetriaEspejo(causas: string[], medios: string[]): { valida: boolean; mensaje: string } {
  const totalCausas = causas.filter(c => c.trim().length > 0).length;
  const totalMedios = medios.filter(m => m.trim().length > 0).length;

  if (totalCausas !== totalMedios) {
    return {
      valida: false,
      mensaje: `ERROR DE CONSISTENCIA CAUSAL: No existe correspondencia 1:1 en el árbol. Se detectaron ${totalCausas} causas y ${totalMedios} medios. La metodología de formulación exige simetría exacta.`
    };
  }

  return {
    valida: true,
    mensaje: `Coherencia de simetría validada: correspondencia espejo 1:1 conforme (${totalCausas} causas ➔ ${totalMedios} medios).`
  };
}

/**
 * Evalúa los insumos cuantitativos y cualitativos de un aliado frente al TDR y el tiempo de cierre.
 */
export function evaluarAliadoEstrategico(
  aliado: AliadoEvaluacion,
  diasCierre: number
): { score_aliado: number; alertas_riesgo: string[] } {
  const alertas_riesgo: string[] = [];
  let score = 0;

  // 1. Antigüedad (Máx: 30 pts)
  if (aliado.antiguedad_meses >= 36) score += 30;
  else if (aliado.antiguedad_meses >= 12) score += 15;
  else score += 5;

  // 2. Experiencia (Máx: 30 pts)
  if (aliado.contratos_5_anos >= 5) score += 30;
  else if (aliado.contratos_5_anos >= 2) score += 20;
  else score += 10;

  // 3. Músculo Financiero (Máx: 20 pts)
  if (aliado.liquidez_optima) score += 20;
  else score += 5;

  // 4. Factores Cualitativos (Máx: 20 pts)
  if (aliado.factores_cualitativos.accesibilidad === 'alta') score += 10;
  else if (aliado.factores_cualitativos.accesibilidad === 'media') score += 5;

  if (aliado.factores_cualitativos.colaboracion) score += 10;

  // 5. Alertas de Riesgo por Agilidad de Firma y Ventana de Cierre
  if (aliado.factores_cualitativos.agilidad_firma === 'lenta' && diasCierre <= 15) {
    alertas_riesgo.push(
      `ALERTA CRÍTICA: La agilidad de firma del aliado es LENTA y quedan solo ${diasCierre} días para el cierre. Riesgo alto de asfixia operativa.`
    );
  }

  return {
    score_aliado: score,
    alertas_riesgo
  };
}

/**
 * Filtro de Admisión Estratégica ex-ante para sugerir la continuidad del proyecto o su renuncia.
 */
export function aplicarFiltroEstrategico(
  diasCierre: number,
  complejidadAlta: boolean,
  focoLaserDefinido: boolean
): FiltroEstrategia {
  let requiere_renuncia_automatica = false;
  let decision_sugerida = "Proceder con la formulación y adaptación del dossier.";

  if (!focoLaserDefinido) {
    requiere_renuncia_automatica = true;
    decision_sugerida = "BLOQUEADO: Se requiere definir una línea temática estricta (Foco Láser) antes de iniciar.";
  } else if (diasCierre <= 5) {
    requiere_renuncia_automatica = true;
    decision_sugerida = "RENUNCIA SUGERIDA: Faltan menos de 5 días para el cierre. La asfixia operativa imposibilita un desarrollo viable.";
  } else if (diasCierre <= 12 && complejidadAlta) {
    requiere_renuncia_automatica = true;
    decision_sugerida = "RENUNCIA SUGERIDA: Complejidad técnica alta y menos de 12 días restantes. El margen de error compromete la calidad ex-ante.";
  }

  return {
    ventana_dias_cierre: diasCierre,
    complejidad_operativa_alta: complejidadAlta,
    requiere_renuncia_automatica,
    decision_sugerida
  };
}

/**
 * Matriz de Combinatoria Cruzada: Cruza las capacidades del proponente con las 9 verticales,
 * inyectando de forma estratégica conceptos novedosos de la biblioteca.
 */
export function generarCombinatoriaCruzada(
  capacidadesProponente: string[],
  conceptosNovedosos: any[]
): any[] {
  const verticales = [
    { cod: 'medio_ambiente', nom: 'Medio Ambiente y Sostenibilidad' },
    { cod: 'educacion', nom: 'Educación y Formación' },
    { cod: 'emprendimiento', nom: 'Emprendimiento y Capital Semilla' },
    { cod: 'empresas', nom: 'Desarrollo Empresarial' },
    { cod: 'salud_mental', nom: 'Salud Mental y Bienestar Social' },
    { cod: 'innovacion', nom: 'Innovación y Tecnología' },
    { cod: 'agro', nom: 'Desarrollo Agrícola y Rural' },
    { cod: 'liderazgo', nom: 'Liderazgo y Gobernanza' },
    { cod: 'vulnerabilidad_y_social', nom: 'Inclusión y Desarrollo Social' }
  ];

  const combinaciones: any[] = [];

  capacidadesProponente.forEach(capacidad => {
    verticales.forEach(vert => {
      // Buscar concepto novedoso correspondiente a la vertical principal
      const concepto = conceptosNovedosos.find(c => c.vertical_principal === vert.cod) || {
        concepto_vanguardia: "Modelo Modular Integrado",
        descripcion_tecnica: "Estructuración ágil mediante células de trabajo comunitarias autogestionadas."
      };

      combinaciones.push({
        capacidad,
        vertical: vert.nom,
        vertical_cod: vert.cod,
        concepto_vanguardia: concepto.concepto_vanguardia,
        descripcion_tecnica: concepto.descripcion_tecnica,
        idea_hibrida: `Fusión de la capacidad en "${capacidad}" con el concepto "${concepto.concepto_vanguardia}" para impactar la vertical de "${vert.nom}".`
      });
    });
  });

  return combinaciones;
}

/**
 * Analiza los insumos técnicos del cliente y calcula el encaje matemático contra el molde de criterios.
 * Realiza la validación espejo del árbol y califica aliados/estrategias si están provistos.
 */
export function analizarBrechasProyecto(
  respuestasFase1: any,
  respuestasFase2: any,
  consistencyScore: number, // Puntuación de coherencia causal (0-100)
  criteriosMold: TDRCriteriaMold = {
    calidad_tecnica_max: 30,
    impacto_territorial_max: 25,
    capacidades_locales_max: 20,
    sostenibilidad_transferencia_max: 15,
    escalabilidad_replicabilidad_max: 10
  },
  aliado?: AliadoEvaluacion,
  diasCierre: number = 30
): ProyectoBrechaAnalisis {
  const aristas_debiles_detectadas: string[] = [];
  const recomendaciones_reconfiguracion: string[] = [];

  // Extraer insumos clave de manera segura
  const ubicacion = respuestasFase1?.q2_ubicacion || '';
  const objetivoImpacto = respuestasFase2?.f2_q6_objetivo_impacto || '';
  const aliados = respuestasFase2?.f2_q17_aliados || '';
  const costos = respuestasFase2?.f2_q20_estructura_costos || '';
  const ingresos = respuestasFase2?.f2_q21_fuentes_ingresos || '';
  const mercado = respuestasFase2?.f2_q14_tamano_mercado || '';

  // 1. Simetría Espejo del Árbol (Paso #3)
  const causasList = respuestasFase2?.f2_q1_causas ? respuestasFase2.f2_q1_causas.split(/\r?\n/).filter((l: string) => l.trim().length > 0) : [];
  const objetivosList = respuestasFase2?.f2_q4_objetivo_tecnico ? [respuestasFase2.f2_q4_objetivo_tecnico] : [];
  if (respuestasFase2?.f2_q5_objetivo_comercial) objetivosList.push(respuestasFase2.f2_q5_objetivo_comercial);
  if (respuestasFase2?.f2_q6_objetivo_impacto) objetivosList.push(respuestasFase2.f2_q6_objetivo_impacto);

  const simetria = validarSimetriaEspejo(causasList, objetivosList);

  // 2. DIMENSIÓN: CALIDAD TÉCNICA (Máx: 30 pts)
  let calidad_tecnica = Math.round((consistencyScore / 100) * criteriosMold.calidad_tecnica_max);
  if (!simetria.valida) {
    calidad_tecnica = Math.max(5, calidad_tecnica - 10);
    aristas_debiles_detectadas.push("Ruptura del espejo causal: el número de causas raíces no coincide con los medios del proyecto.");
    recomendaciones_reconfiguracion.push(
      "Reestructurar los objetivos de inmediato para lograr simetría 1:1. Cada causa identificada debe contar con un objetivo espejo específico."
    );
  } else if (calidad_tecnica < 22) {
    aristas_debiles_detectadas.push("Deficiencia en consistencia semántica y simetría causal del árbol de problemas.");
    recomendaciones_reconfiguracion.push(
      "Reestructurar los objetivos específicos para que actúen como un espejo positivo estricto de las causas raíz. Se sugiere absorber el 'Módulo de Validación Causal' de nuestra biblioteca para restablecer el cierre de brechas semánticas al 100%."
    );
  }

  // 3. DIMENSIÓN: IMPACTO TERRITORIAL (Máx: 25 pts)
  let impacto_territorial = 12; // Base
  const tieneUbicacionFocalizada = ubicacion.length > 8;
  const tieneMetasImpactoClaras = objetivoImpacto.length > 40;

  if (tieneUbicacionFocalizada) impacto_territorial += 6;
  if (tieneMetasImpactoClaras) impacto_territorial += 7;

  const tieneNumerosPoblacion = /\b\d+\b/.test(objetivoImpacto);
  if (!tieneNumerosPoblacion && impacto_territorial > 12) {
    impacto_territorial -= 4;
    aristas_debiles_detectadas.push("Ausencia de cuantificación formal de la población afectada (línea base).");
    recomendaciones_reconfiguracion.push(
      "Incorporar métricas duras y cifras oficiales (DANE/DNP) en la justificación. Absorber el anexo de 'Estudios de Población Focalizada' en el territorio para sustentar el volumen de beneficiarios directos e indirectos."
    );
  }

  if (impacto_territorial < 18) {
    aristas_debiles_detectadas.push("Baja densidad o indeterminación del impacto geográfico territorial.");
    recomendaciones_reconfiguracion.push(
      "Alinear la intervención con municipios con planes de desarrollo vigentes y priorizados. Redactar una arista de impacto regional explícita para aumentar la puntuación de focalización."
    );
  }
  impacto_territorial = Math.min(criteriosMold.impacto_territorial_max, impacto_territorial);

  // 4. DIMENSIÓN: CAPACIDADES LOCALES (Máx: 20 pts)
  let capacities_score = 8;
  const tieneAliados = aliados.length > 25;
  const mencionaJuntaOAsociacion = /junta|jac|asociacion|cooperativa|cabildo|resguardo|alcaldia|secretaria/i.test(aliados);

  if (tieneAliados) capacities_score += 6;
  if (mencionaJuntaOAsociacion) capacities_score += 6;

  if (capacities_score < 14) {
    aristas_debiles_detectadas.push("Gobernanza precaria y falta de alianzas estratégicas locales verificables.");
    recomendaciones_reconfiguracion.push(
      "Formalizar convenios preliminares de cooperación. Se exige absorber de la biblioteca el 'Molde de Alianza Público-Comunitaria', vinculando explícitamente a una Junta de Acción Comunal o Asociación de Productores locales como co-ejecutores operativos."
    );
  }
  let capacidades_locales = Math.min(criteriosMold.capacidades_locales_max, capacities_score);

  // 5. DIMENSIÓN: SOSTENIBILIDAD Y TRANSFERENCIA (Máx: 15 pts)
  let sostenibilidad_score = 6;
  const tieneCostosDefinidos = costos.length > 20;
  const tieneIngresosDefinidos = ingresos.length > 20;
  const mencionaTransferencia = /transferencia|capacitacion|talleres|formacion|mentoria|autonomo/i.test(costos + ingresos);

  if (tieneCostosDefinidos) sostenibilidad_score += 3;
  if (tieneIngresosDefinidos) sostenibilidad_score += 3;
  if (mencionaTransferencia) sostenibilidad_score += 3;

  if (sostenibilidad_score < 11) {
    aristas_debiles_detectadas.push("Modelo de sostenibilidad financiera dependiente al 100% de la subvención inicial.");
    recomendaciones_reconfiguracion.push(
      "Diseñar un esquema de monetización o recuperación de costos operativos secundarios. Incorporar de nuestra biblioteca de componentes la arista de 'Sostenibilidad de Transferencia Tecnológica', capacitando a líderes locales para mantener la infraestructura operativa post-convenio."
    );
  }
  let sostenibilidad_transferencia = Math.min(criteriosMold.sostenibilidad_transferencia_max, sostenibilidad_score);

  // 6. DIMENSIÓN: ESCALABILIDAD Y REPLICABILIDAD (Máx: 10 pts)
  let replicability_score = 4;
  const tieneMercadoEstablecido = mercado.length > 25;
  const esModular = /modular|paquete|estandarizado|toolkit|herramientas|escalable/i.test(mercado + objetivoImpacto);

  if (tieneMercadoEstablecido) replicability_score += 3;
  if (esModular) replicability_score += 3;

  if (replicability_score < 7) {
    aristas_debiles_detectadas.push("Bajo potencial de replicabilidad por diseño ad-hoc altamente personalizado.");
    recomendaciones_reconfiguracion.push(
      "Estandarizar los entregables técnicos y convertirlos en un 'Módulo de Transferencia Modular'. Esto facilitará que la solución se replique en otros municipios con un costo marginal cercano a cero."
    );
  }
  let escalabilidad_replicabilidad = Math.min(criteriosMold.escalabilidad_replicabilidad_max, replicability_score);

  // --- SCORE TOTAL ---
  const score_actual = calidad_tecnica + impacto_territorial + capacidades_locales + sostenibilidad_transferencia + escalabilidad_replicabilidad;

  // 7. Calificar aliado si está presente
  let evaluacion_aliado;
  if (aliado) {
    evaluacion_aliado = evaluarAliadoEstrategico(aliado, diasCierre);
    if (evaluacion_aliado.alertas_riesgo.length > 0) {
      aristas_debiles_detectadas.push("Riesgo operacional elevado en la gobernanza del consorcio.");
      recomendaciones_reconfiguracion.push(evaluacion_aliado.alertas_riesgo[0]);
    }
  }

  // 8. Aplicar Filtro Estratégico ex-ante
  const focoLaserDefinido = respuestasFase1?.q5_foco_laser !== undefined && respuestasFase1.q5_foco_laser.trim().length > 0;
  const filtro_estrategia = aplicarFiltroEstrategico(diasCierre, respuestasFase2?.f2_q7_procesos_tecnicos?.length > 150, focoLaserDefinido);

  return {
    score_actual,
    dimensiones_detalladas: {
      calidad_tecnica,
      impacto_territorial,
      capacidades_locales,
      sostenibilidad_transferencia,
      escalabilidad_replicabilidad
    },
    aristas_debiles_detectadas,
    recomendaciones_reconfiguracion,
    simetria_arbol: {
      valida: simetria.valida,
      total_causas: causasList.length,
      total_medios: objetivosList.length,
      mensaje: simetria.mensaje
    },
    evaluacion_aliado,
    filtro_estrategia
  };
}
