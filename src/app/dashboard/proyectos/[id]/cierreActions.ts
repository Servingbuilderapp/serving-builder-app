'use server'

import { createClient } from '@supabase/supabase-js'
import { analizarBrechasProyecto, TDRCriteriaMold, AliadoEvaluacion, generarCombinatoriaCruzada } from '@/lib/scoringEngine'
import { translateBrandsInObject } from '@/lib/brandProtector'

// Inicializa el cliente de Supabase usando Service Role Key
const getSupabaseClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

// Catálogo de semillas locales para resiliencia ex-ante
const LOCAL_MOLDES_SEED = [
  {
    id: 'f1011111-2222-3333-4444-555555555555',
    entidad_fuente: 'Fondo Verde Internacional',
    lineas_tematicas_sectores: ['Sostenibilidad', 'Transición Energética', 'Bioeconomía'],
    rubros_financiables_json: {"equipos": 35, "servicios": 30, "talento": 35, "insumos": 15},
    limites_financieros_monto: 1200000000,
    criterios_elegibilidad: 'Persona Jurídica Constituida con mínimo 2 años de existencia. Experiencia demostrada en proyectos agroecológicos o de reforestación.',
    requisitos_poblacion_territorio: 'Población rural del corredor andino-amazónico. Cobertura en mínimo 2 departamentos.',
    verticales_asociadas: ['medio_ambiente', 'agro', 'innovacion'],
    historico_territorial_json: {
      "puntaje_corte_promedio": 88,
      "densidad_ganadores_local": "baja",
      "sectores_saturados": ["Saturación de propuestas de reforestación sin base tecnológica"]
    }
  },
  {
    id: 'f2022222-3333-4444-5555-666666666666',
    entidad_fuente: 'Fundación Global para el Aprendizaje',
    lineas_tematicas_sectores: ['Educación Básica', 'Tecnología Educativa', 'Capacitación docente'],
    rubros_financiables_json: {"infraestructura": 20, "talento": 40, "divulgación": 20, "viajes": 20},
    limites_financieros_monto: 600000000,
    criterios_elegibilidad: 'Entidades sin ánimo de lucro y organizaciones comunitarias. Contar con aval de secretaría de educación territorial.',
    requisitos_poblacion_territorio: 'Zonas urbanas marginadas y municipios PDET. Alcance mínimo de 15 escuelas.',
    verticales_asociadas: ['educacion', 'vulnerabilidad_y_social', 'liderazgo'],
    historico_territorial_json: {
      "puntaje_corte_promedio": 82,
      "densidad_ganadores_local": "media",
      "sectores_saturados": []
    }
  },
  {
    id: 'f3033333-4444-5555-6666-777777777777',
    entidad_fuente: 'Aceleradora de Emprendimiento Social',
    lineas_tematicas_sectores: ['Economía Circular', 'Salud Comunitaria', 'Emprendimiento Juvenil'],
    rubros_financiables_json: {"capital_semilla": 50, "mentoria": 30, "administracion": 20},
    limites_financieros_monto: 350000000,
    criterios_elegibilidad: 'Jóvenes emprendedores entre 18 y 28 años. Prototipo funcional validado comercialmente.',
    requisitos_poblacion_territorio: 'Comunidades vulnerables de la región pacífica. Mínimo 50% de mujeres en el equipo fundador.',
    verticales_asociadas: ['emprendimiento', 'salud_mental', 'vulnerabilidad_y_social'],
    historico_territorial_json: {
      "puntaje_corte_promedio": 85,
      "densidad_ganadores_local": "alta",
      "sectores_saturados": ["Comercio básico y manualidades"]
    }
  },
  {
    id: 'f4044444-5555-6666-7777-888888888888',
    entidad_fuente: 'Fondo Fomento de Ciencia y Tecnología Regional',
    lineas_tematicas_sectores: ['Desarrollo de Software', 'Automatización Industrial', 'Biotecnología'],
    rubros_financiables_json: {"talento": 50, "equipos": 30, "patentes": 10, "administracion": 10},
    limites_financieros_monto: 1500000000,
    criterios_elegibilidad: 'Micro, Pequeñas y Medianas Empresas (MiPyMEs) de base tecnológica u organizaciones aliadas con centros de investigación.',
    requisitos_poblacion_territorio: 'Cobertura a nivel departamental. Proyectos con TRL 5 o superior.',
    verticales_asociadas: ['innovacion', 'empresas'],
    historico_territorial_json: {
      "puntaje_corte_promedio": 90,
      "densidad_ganadores_local": "baja",
      "sectores_saturados": []
    }
  },
  {
    id: 'f5055555-6666-7777-8888-999999999999',
    entidad_fuente: 'Alianza por el Bienestar Social y Comunitario',
    lineas_tematicas_sectores: ['Salud Mental', 'Tejido Social', 'Prevención de Violencias'],
    rubros_financiables_json: {"capacitaciones": 40, "talento": 30, "materiales": 20, "imprevistos": 10},
    limites_financieros_monto: 450000000,
    criterios_elegibilidad: 'Asociaciones comunitarias, Juntas de Acción Comunal y colectivos locales con personería jurídica.',
    requisitos_poblacion_territorio: 'Zonas rurales de alta vulnerabilidad social. Mínimo 100 familias impactadas directamente.',
    verticales_asociadas: ['salud_mental', 'vulnerabilidad_y_social', 'liderazgo'],
    historico_territorial_json: {
      "puntaje_corte_promedio": 80,
      "densidad_ganadores_local": "alta",
      "sectores_saturados": []
    }
  }
];

const LOCAL_CONCEPTOS_NOVEDOSOS = [
  {
    vertical_principal: 'medio_ambiente',
    concepto_vanguardia: 'Fito-remediación Simbiótica',
    descripcion_tecnica: 'Uso de especies vegetales endémicas asistidas por micorrizas para la extracción acelerada de metales pesados en suelos degradados por actividades industriales o mineras.'
  },
  {
    vertical_principal: 'innovacion',
    concepto_vanguardia: 'Arquitectura Edge Computing Descentralizada',
    descripcion_tecnica: 'Procesamiento de datos en el nodo local con compresión adaptativa para reducir la latencia y la dependencia de conectividad en la nube en zonas rurales.'
  },
  {
    vertical_principal: 'agro',
    concepto_vanguardia: 'Agricultura de Precisión Regenerativa',
    descripcion_tecnica: 'Monitoreo de humedad foliar y nutrición del suelo mediante espectroscopía de bajo costo con fertilización dirigida micro-dosificada.'
  },
  {
    vertical_principal: 'salud_mental',
    concepto_vanguardia: 'Círculos de Terapia Narrativa Comunitaria',
    descripcion_tecnica: 'Espacios autogestionados de apoyo psicosocial basados en círculos de escucha activa guiados por facilitadores locales previamente capacitados para mitigar brechas de acceso psicológico.'
  },
  {
    vertical_principal: 'educacion',
    concepto_vanguardia: 'Ambientes de Aprendizaje Inversivos Autogestionados',
    descripcion_tecnica: 'Modelos pedagógicos híbridos de autoaprendizaje apoyados por kits interactivos sin conectividad física a internet.'
  },
  {
    vertical_principal: 'liderazgo',
    concepto_vanguardia: 'Gobernanza Horizontal Comunitaria',
    descripcion_tecnica: 'Protocolo de toma de decisiones consensuadas a través de comités vecinales rotativos y mecanismos digitales de veeduría.'
  },
  {
    vertical_principal: 'vulnerabilidad_y_social',
    concepto_vanguardia: 'Micro-franquicias de Autoabastecimiento Colectivo',
    descripcion_tecnica: 'Células de autoempleo productivo para jefas de hogar basadas en la producción y distribución barrial de insumos básicos de primera necesidad.'
  }
];

/**
 * Obtiene la biblioteca completa de convocatorias y moldes para el Paso #4 (Sección Biblioteca).
 * Filtra opcionalmente por las verticales asociadas.
 */
export async function getBibliotecaPortalesAction(proyectoId: string) {
  console.log("-> getBibliotecaPortalesAction iniciada para proyecto:", proyectoId);
  const supabase = getSupabaseClient();

  try {
    // 1. Obtener el proyecto para conocer su vertical
    const { data: proyecto } = await supabase
      .from('proyectos_clientes_serving')
      .select('vertical_asignada')
      .eq('id', proyectoId)
      .single();

    // Mapeamos el nombre descriptivo de la vertical a los códigos internos de la base de datos
    const verticalMapeada = mapearVerticalNombreACodigo(proyecto?.vertical_asignada || '');

    // 2. Consultar todos los moldes de convocatorias de la biblioteca
    let moldes: any[] = [];
    try {
      const { data, error } = await supabase
        .from('biblioteca_convocatorias_moldes')
        .select('*');
        
      if (error || !data || data.length === 0) {
        moldes = LOCAL_MOLDES_SEED;
      } else {
        moldes = data;
      }
    } catch (dbErr) {
      console.warn("Fallo lectura de biblioteca_convocatorias_moldes, usando fallback seed:", dbErr);
      moldes = LOCAL_MOLDES_SEED;
    }

    // Clasificar y ordenar: las que coinciden con la vertical del proyecto van primero
    const moldesOrdenados = moldes.map((m: any) => {
      const coincideVertical = m.verticales_asociadas?.includes(verticalMapeada);
      return {
        ...m,
        coincideVertical,
        // Calcular afinidad nominal de demostración
        afinidad: coincideVertical ? 94 : 68
      };
    }).sort((a, b) => (b.coincideVertical ? 1 : 0) - (a.coincideVertical ? 1 : 0));

    return translateBrandsInObject(moldesOrdenados);
  } catch (err) {
    console.error("Error en getBibliotecaPortalesAction:", err);
    throw err;
  }
}

/**
 * Server Action para ejecutar la evaluación de brechas y adaptación inversa del proyecto contra un molde de convocatoria (Paso #3 y #5).
 */
export async function ejecutarDeconstruccionInversaAction(
  proyectoId: string, 
  convocatoriaId: string, 
  aliado?: AliadoEvaluacion, 
  diasCierre: number = 30
) {
  console.log("-> Iniciando deconstrucción inversa de proyecto:", proyectoId, "contra convocatoria:", convocatoriaId);
  const supabase = getSupabaseClient();

  try {
    // 1. Obtener el proyecto
    const { data: proyecto, error: pError } = await supabase
      .from('proyectos_clientes_serving')
      .select('*')
      .eq('id', proyectoId)
      .single();

    if (pError || !proyecto) {
      throw new Error("No se pudo obtener la información del proyecto.");
    }

    // 2. Obtener la convocatoria / molde
    let convocatoria: any = null;
    try {
      const { data, error: cError } = await supabase
        .from('biblioteca_convocatorias_moldes')
        .select('*')
        .eq('id', convocatoriaId)
        .single();
        
      if (cError || !data) {
        convocatoria = LOCAL_MOLDES_SEED.find(m => m.id === convocatoriaId) || LOCAL_MOLDES_SEED[0];
      } else {
        convocatoria = data;
      }
    } catch (dbErr) {
      console.warn("Fallo lectura de molde, usando fallback seed:", dbErr);
      convocatoria = LOCAL_MOLDES_SEED.find(m => m.id === convocatoriaId) || LOCAL_MOLDES_SEED[0];
    }

    // 3. Obtener consistencia del proyecto
    let consistencyScore = 80;
    try {
      const { data: evaluacion } = await supabase
        .from('evaluacion_multicriterio')
        .select('score_total')
        .eq('proyecto_id', proyectoId)
        .maybeSingle();
      if (evaluacion?.score_total) {
        consistencyScore = evaluacion.score_total;
      }
    } catch (dbErr) {
      console.warn("Fallo lectura de evaluacion, usando fallback score:", dbErr);
    }

    // 4. Consultar conceptos novedosos de la biblioteca para inyectar en la Combinatoria
    let conceptos: any[] = LOCAL_CONCEPTOS_NOVEDOSOS;
    try {
      const { data, error: conError } = await supabase
        .from('biblioteca_conceptos_novedosos')
        .select('*');
      if (!conError && data && data.length > 0) {
        conceptos = data;
      }
    } catch (dbErr) {
      console.warn("Fallo lectura de conceptos, usando fallback seed:", dbErr);
    }

    // 5. Instanciar el motor de evaluación multicriterio y brechas (scoringEngine)
    const analisis = analizarBrechasProyecto(
      proyecto.respuestas_fase1_json || {},
      proyecto.respuestas_fase2_json || {},
      consistencyScore,
      {
        calidad_tecnica_max: 30,
        impacto_territorial_max: 25,
        capacidades_locales_max: 20,
        sostenibilidad_transferencia_max: 15,
        escalabilidad_replicabilidad_max: 10
      },
      aliado,
      diasCierre
    );

    // 6. Generar Combinatoria Cruzada Híbrida
    const capacidadesProponente = [
      proyecto.respuestas_fase1_json?.q7_ventajas || "Estructura Operativa Ágil y Formación Territorial",
      proyecto.respuestas_fase2_json?.f2_q11_capacidad_produccion || "Desarrollo e Implementación Tecnológica en Nodo Edge"
    ];
    const combinaciones = generarCombinatoriaCruzada(capacidadesProponente, conceptos || []);

    // 7. Deconstrucción maleable del proyecto del cliente (Paradigma Inverso del Encaje)
    const aristas = deconstruirProyectoEnAristas(proyecto, convocatoria, analisis);

    // 8. Generar el Dossier de Postulación Adaptado Inversamente al Pliego Técnico (Paso #5)
    const dossierAdaptado = generarDossierAdaptadoInverso(proyecto, convocatoria, analisis, aristas, aliado, combinaciones);

    // 9. Guardar el resultado del encaje en un campo o responder directamente
    const updatedResultado = {
      ...(proyecto.resultado_agente_json || {}),
      encaje_convocatoria_actual: {
        convocatoria_id: convocatoriaId,
        entidad_fuente: convocatoria.entidad_fuente,
        score_actual: analisis.score_actual,
        dimensiones_detalladas: analisis.dimensiones_detalladas,
        aristas_debiles_detectadas: analisis.aristas_debiles_detectadas,
        recomendaciones_reconfiguracion: analisis.recomendaciones_reconfiguracion,
        simetria_arbol: analisis.simetria_arbol,
        aristas_maleables: aristas,
        dossier_adaptado: dossierAdaptado,
        combinatoria_cruzada: combinaciones.slice(0, 4), // Guardar top combinaciones hibridadas
        evaluacion_aliado: analisis.evaluacion_aliado,
        filtro_estrategia: analisis.filtro_estrategia
      }
    };

    try {
      const { error: updateError } = await supabase
        .from('proyectos_clientes_serving')
        .update({
          resultado_agente_json: updatedResultado
        })
        .eq('id', proyectoId);

      if (updateError) {
        console.warn("Fallo guardado en DB de resultado_agente_json:", updateError.message);
      }
    } catch (dbErr) {
      console.warn("Excepción al guardar en DB de resultado_agente_json:", dbErr);
    }

    return translateBrandsInObject(updatedResultado.encaje_convocatoria_actual);
  } catch (err) {
    console.error("Error en ejecutarDeconstruccionInversaAction:", err);
    throw err;
  }
}

/**
 * Deconstruye el proyecto en aristas maleables e independientes según el pliego técnico rígido.
 */
function deconstruirProyectoEnAristas(proyecto: any, convocatoria: any, analisis: any) {
  const respuestasFase2 = proyecto.respuestas_fase2_json || {};

  return [
    {
      nombre: "Arista Tecnológica e Innovación",
      descripcion: "Segmento enfocado en la adopción digital y el equipamiento modular de base técnica.",
      status: analisis.dimensiones_detalladas.calidad_tecnica >= 22 ? "Cumple al 100%" : "Requiere fortalecimiento",
      texto_adaptacion: `El componente tecnológico del proyecto "${proyecto.nombre_iniciativa}" se moldea bajo el pliego técnico de "${convocatoria.entidad_fuente}", reconfigurando la infraestructura solicitada a un modelo de TRL modular. Esto absorbe el rubro de '${Object.keys(convocatoria.rubros_financiables_json || {})[0] || 'equipos'}' del pliego técnico.`
    },
    {
      nombre: "Arista Operativa y Territorial",
      status: analisis.dimensiones_detalladas.impacto_territorial >= 18 ? "Cumple al 100%" : "Requiere fortalecimiento",
      descripcion: "Segmento enfocado en la distribución logística, plazos e hitos del plan PERT en zonas rurales.",
      texto_adaptacion: `Se deconstruye el plan operativo PERT de ${respuestasFase2.f2_q18_tiempo_ejecucion || 12} meses para alinear lo con el criterio de elegibilidad de "${convocatoria.entidad_fuente}". La arista operativa prioriza la ejecución de campo en los municipios focales, ajustando las metas mensuales.`
    },
    {
      nombre: "Arista de Fomento Humano y Liderazgo",
      status: analisis.dimensiones_detalladas.capacidades_locales >= 14 ? "Cumple al 100%" : "Requiere fortalecimiento",
      descripcion: "Segmento enfocado en capacitaciones comunitarias, equidad de género y alianzas con Juntas locales.",
      texto_adaptacion: `El programa de formación y articulación social se separa como arista autónoma. Si el pliego técnico exige equidad o participación comunitaria, esta arista absorbe el rol de la Junta de Acción Comunal local para maximizar la elegibilidad de gobernanza.`
    },
    {
      nombre: "Arista de Sostenibilidad Ecológica y Circular",
      status: analisis.dimensiones_detalladas.sostenibilidad_transferencia >= 11 ? "Cumple al 100%" : "Requiere fortalecimiento",
      descripcion: "Segmento enfocado en el modelo financiero circular y autogestión de largo plazo.",
      texto_adaptacion: `El flujo de ingresos secundarios se reconfigura para justificar el de retorno post-subvención. Se anexa la transferencia técnica como salvaguarda del impacto ambiental post-convenio.`
    }
  ];
}

/**
 * Genera el Dossier de Postulación Adaptado Inversamente al pliego técnico rígido (Paso #5).
 */
function generarDossierAdaptadoInverso(
  proyecto: any, 
  convocatoria: any, 
  analisis: any, 
  aristas: any[],
  aliado?: AliadoEvaluacion,
  combinaciones?: any[]
) {
  const nombreProyecto = proyecto.nombre_iniciativa || 'Iniciativa';

  let capituloGobernanza = `
## Capítulo: Gobernanza del Consorcio y Gestión de Actores
*   El proyecto se ejecutará de forma directa y autónoma por el proponente principal, estableciendo canales de articulación con los beneficiarios directos territoriales.
`;

  if (aliado) {
    const scoreAliado = analisis.evaluacion_aliado?.score_aliado || 0;
    capituloGobernanza = `
## Capítulo: Matriz de Gobernanza del Consorcio
Para mitigar la brecha operativa descrita por el fondo de financiamiento, se establece un esquema de Consorcio Operativo con las siguientes directrices basadas en la calificación ex-ante de aliados (Calificación Aliado: **${scoreAliado} / 100**):

*   **Distribución de Responsabilidades**: El proponente principal lidera el componente de innovación y transferencia tecnológica, mientras que el Aliado Estratégico calificado asume la co-ejecución del plan operativo territorial.
*   **Protocolo de Coordinación y Agilidad**: Se implementa un comité de gobernanza mensual con firma inmediata y resolución ágil de diferencias, contrarrestando la asfixia del cronograma y salvaguardando la calidad del entregable.
${analisis.evaluacion_aliado?.alertas_riesgo?.length > 0 ? `
> [!CAUTION]
> **Plan de Contingencia de Gobernanza**: Ante la agilidad de firma LENTA del aliado, se limita su rol al aporte de activos en especie valorados, asumiendo el proponente principal toda la radicación técnica directa.` : ''}
`;
  }

  const combinatoriasInyectadas = combinaciones && combinaciones.length > 0 ? `
## Capítulo: Combinatoria Cruzada e Hibridación de Conceptos Novedosos
Para maximizar el encaje técnico, se inyectan en el núcleo del proyecto los siguientes conceptos transversales de vanguardia de la firma:

${combinaciones.slice(0, 2).map((c: any, i: number) => `
### 💡 Concepto Híbrido #${i+1}: ${c.concepto_vanguardia}
*   **Capacidad Base**: ${c.capacidad}
*   **Vertical Inyectada**: ${c.vertical}
*   **Definición de Vanguardia**: ${c.descripcion_tecnica}
*   **Propuesta de Encaje**: ${c.idea_hibrida}
`).join('\n')}
` : '';

  return `
# DOSSIER DE POSTULACIÓN ADAPTADO (PARADIGMA INVERSO DE ENCAJE)
## Propuesta Formulada para: ${convocatoria.entidad_fuente}
## Proyecto Base: ${nombreProyecto}
### Estado de Viabilidad Técnica: **${analisis.score_actual >= 70 ? 'SÓLIDO Y APTO' : 'RECONFIGURACIÓN REQUERIDA'}**

---

> [!NOTE]
> **Nota de Metodología Ex-Ante:** Este documento ha sido deconstruido por el motor de IA de la firma y adaptado de forma inversa al pliego rígido de condiciones de la convocatoria. El proyecto original ha sido segmentado en aristas maleables para cumplir con la totalidad de los requisitos técnicos y presupuestarios.

---

## 1. Resumen de Encaje y Brechas de Elegibilidad

*   **Puntaje Global Estimado**: **${analisis.score_actual} / 100**
*   **Simetría Espejo del Árbol (Paso #3)**: ${analisis.simetria_arbol.valida ? '✔️ Simétrica (Conforme)' : '⚠️ Asimétrica (Ruptura Causal)'}
*   **Mensaje de Coherencia**: ${analisis.simetria_arbol.mensaje}
*   **Límite Financiero de la Convocatoria**: Up to $${Number(convocatoria.limites_financieros_monto).toLocaleString()} COP

### Evaluación de Dimensiones de Subvención (100 Puntos)
1.  **Calidad Técnica**: ${analisis.dimensiones_detalladas.calidad_tecnica} / 30
2.  **Impacto Territorial**: ${analisis.dimensiones_detalladas.impacto_territorial} / 25
3.  **Capacidades Locales**: ${analisis.dimensiones_detalladas.capacidades_locales} / 20
4.  **Sostenibilidad y Transferencia**: ${analisis.dimensiones_detalladas.sostenibilidad_transferencia} / 15
5.  **Escalabilidad y Replicabilidad**: ${analisis.dimensiones_detalladas.escalabilidad_replicabilidad} / 10

---

## 2. Reporte de Brechas Crudas y Componentes a Absorber

${analisis.aristas_debiles_detectadas.length > 0 ? `
> [!WARNING]
> **Alertas de Elegibilidad Detectadas:** Para alcanzar el 100% de aptitud técnica, el proyecto del cliente DEBE "estirarse" y absorber los siguientes elementos de la biblioteca:

${analisis.aristas_debiles_detectadas.map((d: string) => `*   **Debilidad**: ${d}`).join('\n')}

### Plan de Reconfiguración Inmediato:
${analisis.recomendaciones_reconfiguracion.map((r: string) => `1.  ${r}`).join('\n')}
` : `
> [!NOTE]
> **Felicidades:** El proyecto cumple con la consistencia óptima y no presenta brechas críticas frente a este pliego. Está listo para su postulación formal.
`}

---

## 3. Deconstrucción de Aristas Maleables Adaptadas

${aristas.map((a: any) => `
### ✔ ${a.nombre} [${a.status}]
*   **Definición Operativa**: ${a.descripcion}
*   **Redacción de Encaje**: ${a.texto_adaptacion}
`).join('\n')}

---

${combinatoriasInyectadas}

---

## Capítulo: Sostenibilidad Financiera y Transferencia (Módulo Portal B)
Con el propósito de cumplir con las exigencias del pliego sobre la permanencia de los resultados post-proyecto, se establece el siguiente modelo de Sostenibilidad y Transferencia:

*   **Modelo de Autogestión Financiera**: Se proyecta que una vez finalizados los fondos de cofinanciación, el proponente principal monetizará la infraestructura modular mediante acuerdos de servicios locales, garantizando la cobertura de los costos operativos recurrentes de la arista.
*   **Protocolo de Transferencia Metodológica**: Se capacitará a un equipo de mentores territoriales comunitarios durante los meses finales de ejecución, entregando un toolkit o caja de herramientas documentada. Esto asegura que la comunidad asuma la gobernanza técnica de la solución sin dependencia de consultores externos.

---

${capituloGobernanza}

---

## 4. Estructura Presupuestaria Sugerida según Pliego

Para encajar con los rubros financiables de **${convocatoria.entidad_fuente}**, se propone distribuir el presupuesto de **$${proyecto.monto_solicitado_cop ? proyecto.monto_solicitado_cop.toLocaleString() : '50,000,000'} COP** bajo el siguiente esquema:

| Rubro Financiable | Porcentaje Asignado | Monto Estimado (COP) | Entregable Asociado |
| :--- | :---: | :---: | :--- |
${Object.entries(convocatoria.rubros_financiables_json || {}).map(([rubro, pct]: any) => {
  const share = Number(pct) / 100;
  const total = proyecto.monto_solicitado_cop || 50000000;
  const rubroMonto = total * share;
  return `| ${rubro.toUpperCase()} | ${pct}% | $${Math.round(rubroMonto).toLocaleString()} | Entregable técnico auditado según plan PERT |`;
}).join('\n')}

---
*Serving IA Builder © 2026 - Módulo de Colocación y Cierre.*
`;
}

/**
 * Mapea la vertical asignada (nombre descriptivo) a los códigos de la restricción de la base de datos.
 */
function mapearVerticalNombreACodigo(nombre: string): string {
  const clean = nombre.toLowerCase().trim();
  if (clean.includes('ambiente') || clean.includes('ecolog') || clean.includes('verde')) return 'medio_ambiente';
  if (clean.includes('educa') || clean.includes('formacion')) return 'educacion';
  if (clean.includes('emprende') || clean.includes('semilla')) return 'emprendimiento';
  if (clean.includes('empresa') || clean.includes('cfc') || clean.includes('fomento')) return 'empresas';
  if (clean.includes('salud') || clean.includes('mental') || clean.includes('bienestar')) return 'salud_mental';
  if (clean.includes('innova') || clean.includes('tecnolo') || clean.includes('token')) return 'innovacion';
  if (clean.includes('agro') || clean.includes('campo') || clean.includes('rural')) return 'agro';
  if (clean.includes('lider') || clean.includes('gobiern')) return 'liderazgo';
  return 'vulnerabilidad_y_social'; // Default fallback
}
