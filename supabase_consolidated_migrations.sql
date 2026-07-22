-- ====================================================================
-- SCRIPT DE MIGRACIÓN CONSOLIDADO - SERVING ARCHITECTURE 2026
-- ====================================================================

-- 1. Habilitar la extensión pg_net (utilizada para webhooks de n8n)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. Asegurar tabla public.users y sus columnas de referidos
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS codigo_referido_unico TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
ADD COLUMN IF NOT EXISTS referido_por TEXT,
ADD COLUMN IF NOT EXISTS pagos_referidos_efectivos INTEGER DEFAULT 0;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_users_referido_por'
    ) THEN
        ALTER TABLE public.users 
        ADD CONSTRAINT fk_users_referido_por 
        FOREIGN KEY (referido_por) 
        REFERENCES public.users(codigo_referido_unico);
    END IF;
END
$$;

-- 3. Asegurar columnas en la tabla public.proyectos_clientes_serving
ALTER TABLE public.proyectos_clientes_serving 
ADD COLUMN IF NOT EXISTS plan_pago TEXT,
ADD COLUMN IF NOT EXISTS archivo_proyecto_url TEXT,
ADD COLUMN IF NOT EXISTS archivo_proyecto_nombre TEXT,
ADD COLUMN IF NOT EXISTS progreso_estructuracion INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS transferido_agente_convocatorias BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS agente_evaluacion_status TEXT DEFAULT 'Pendiente',
ADD COLUMN IF NOT EXISTS resultado_agente_json JSONB,
ADD COLUMN IF NOT EXISTS fecha_inicio_plan TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS fecha_vencimiento_plan TIMESTAMPTZ DEFAULT now() + INTERVAL '1 month',
ADD COLUMN IF NOT EXISTS aristas_maximas INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS aristas_configuradas TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS upsell_aplicado JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS booking_confirmado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS contrato_firmado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS firma_digital TEXT,
ADD COLUMN IF NOT EXISTS auditoria_financiera_estado TEXT DEFAULT 'Pendiente' CHECK (auditoria_financiera_estado IN ('Pendiente', 'En Proceso', 'Aprobado', 'Rechazado')),
ADD COLUMN IF NOT EXISTS auditoria_legal_estado TEXT DEFAULT 'Pendiente' CHECK (auditoria_legal_estado IN ('Pendiente', 'En Proceso', 'Aprobado', 'Rechazado')),
ADD COLUMN IF NOT EXISTS pasarela_pago TEXT DEFAULT 'Ninguno' CHECK (pasarela_pago IN ('Stripe', 'Wompi', 'Cupón Aliado', 'Ninguno')),
ADD COLUMN IF NOT EXISTS cupon_aliado_usado TEXT DEFAULT NULL;

-- Convertir columna estado_actual a TEXT para flexibilidad de estados del embudo
ALTER TABLE public.proyectos_clientes_serving ALTER COLUMN estado_actual TYPE TEXT;

-- 4. Crear tabla Maestro de Planes de Desarrollo Territorial (Paso #6)
CREATE TABLE IF NOT EXISTS public.planes_desarrollo_territorial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('DEPARTAMENTAL', 'MUNICIPAL')),
    departamento VARCHAR(100) NOT NULL,
    municipio VARCHAR(100), -- NULL si es departamental
    nombre_plan TEXT NOT NULL,
    lineas_estrategicas JSONB DEFAULT '[]',
    fuente_oficial TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Crear tabla de Articulación Política (Paso #6)
CREATE TABLE IF NOT EXISTS public.articulacion_politica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL UNIQUE REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    departamento VARCHAR(100) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    plan_departamental_id UUID REFERENCES public.planes_desarrollo_territorial(id) ON DELETE SET NULL,
    plan_municipal_id UUID REFERENCES public.planes_desarrollo_territorial(id) ON DELETE SET NULL,
    texto_articulacion_departamental TEXT NOT NULL,
    texto_articulacion_municipal TEXT NOT NULL,
    registro_etnico_status VARCHAR(50) DEFAULT 'NO APLICA' CHECK (registro_etnico_status IN ('NO APLICA', 'ALERTA_REVISION', 'REVISADO_APROBADO')),
    alerta_etnica_disparada BOOLEAN DEFAULT false,
    palabras_clave_etnicas_detectadas TEXT[] DEFAULT '{}',
    observaciones_agente TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Crear tabla de Descripción del Problema y Línea Base (Paso #7)
CREATE TABLE IF NOT EXISTS public.descripcion_problema_linea_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL UNIQUE REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    descripcion_tecnica_dnp TEXT NOT NULL,
    datos_duros_json JSONB DEFAULT '[]',
    fuentes_oficiales TEXT[] DEFAULT '{}',
    espejo_causas_efectos JSONB DEFAULT '[]',
    linea_base_indicadores JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Crear tabla de Árbol de Problemas del Proyecto (Pasos 1-8)
CREATE TABLE IF NOT EXISTS public.problemas_proyecto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('CENTRAL', 'CAUSA_DIRECTA', 'CAUSA_INDIRECTA', 'EFECTO_DIRECTO', 'EFECTO_INDIRECTO')),
    descripcion TEXT NOT NULL,
    padre_id UUID REFERENCES public.problemas_proyecto(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Crear tabla de Árbol de Objetivos del Proyecto (Pasos 15-16)
CREATE TABLE IF NOT EXISTS public.objetivos_proyecto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    problema_id UUID UNIQUE NOT NULL REFERENCES public.problemas_proyecto(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('GENERAL', 'ESPECIFICO_TECNICO', 'ESPECIFICO_COMERCIAL', 'ESPECIFICO_IMPACTO', 'ACTIVIDAD', 'FIN_DIRECTO', 'FIN_INDIRECTO')),
    descripcion TEXT NOT NULL,
    padre_id UUID REFERENCES public.objetivos_proyecto(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Crear tabla de Cadena de Valor y Actividades (Paso #16 y #17)
CREATE TABLE IF NOT EXISTS public.cadena_valor_actividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    objetivo_especifico_id UUID NOT NULL REFERENCES public.objetivos_proyecto(id) ON DELETE CASCADE,
    producto_mga TEXT NOT NULL,
    unidad_medida VARCHAR(100) NOT NULL,
    meta NUMERIC NOT NULL,
    tareas_json JSONB DEFAULT '[]',
    responsable VARCHAR(255) NOT NULL,
    duracion_meses INTEGER NOT NULL,
    ruta_critica BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Crear tabla de Resultados e Impactos Multi-horizonte (Paso #19)
CREATE TABLE IF NOT EXISTS public.resultados_impactos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL UNIQUE REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    corto_plazo_regional TEXT NOT NULL,
    corto_plazo_nacional TEXT NOT NULL,
    mediano_plazo_regional TEXT NOT NULL,
    mediano_plazo_nacional TEXT NOT NULL,
    largo_plazo_regional TEXT NOT NULL,
    largo_plazo_nacional TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Crear tabla de Plan Operativo PERT Detallado (Paso #21)
CREATE TABLE IF NOT EXISTS public.plan_operativo_detallado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    entregable TEXT NOT NULL,
    duracion_optimista_dias INTEGER NOT NULL,
    duracion_probable_dias INTEGER NOT NULL,
    duracion_pesimista_dias INTEGER NOT NULL,
    duracion_esperada_dias INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 12. Crear tabla de Evaluación de Viabilidad Multicriterio (Paso #32)
CREATE TABLE IF NOT EXISTS public.evaluacion_multicriterio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL UNIQUE REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    puntaje_propuesta_tecnica INTEGER NOT NULL CHECK (puntaje_propuesta_tecnica BETWEEN 0 AND 20),
    puntaje_impacto_potencial INTEGER NOT NULL CHECK (puntaje_impacto_potencial BETWEEN 0 AND 20),
    puntaje_capacidades_locales INTEGER NOT NULL CHECK (puntaje_capacidades_locales BETWEEN 0 AND 20),
    puntaje_sostenibilidad INTEGER NOT NULL CHECK (puntaje_sostenibilidad BETWEEN 0 AND 20),
    puntaje_replicabilidad INTEGER NOT NULL CHECK (puntaje_replicabilidad BETWEEN 0 AND 20),
    score_total INTEGER NOT NULL CHECK (score_total BETWEEN 0 AND 100),
    comentarios_criterios JSONB DEFAULT '{}',
    recomendaciones_mejora TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 13. Crear tabla de comisiones MLM (Analítica Gerencial de Presidencia)
CREATE TABLE IF NOT EXISTS public.comisiones_mlm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES public.proyectos_clientes_serving(id) ON DELETE SET NULL,
    nombre_proyecto TEXT NOT NULL,
    monto NUMERIC NOT NULL,
    tipo TEXT CHECK (tipo IN ('Ecosistema de red', 'MLM', 'Venta Directa')),
    estado TEXT CHECK (estado IN ('Entregada', 'Por Entregar')) DEFAULT 'Por Entregar',
    beneficiario TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 14. Crear tabla de quejas y fallos de IA (Analítica Gerencial de Presidencia)
CREATE TABLE IF NOT EXISTS public.quejas_fallos_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES public.proyectos_clientes_serving(id) ON DELETE SET NULL,
    nombre_cliente TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('Queja', 'Fallo Motor IA')),
    descripcion TEXT NOT NULL,
    estado TEXT CHECK (estado IN ('Abierto', 'En Proceso', 'Resuelto')) DEFAULT 'Abierto',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 15. Crear tabla de logs de postulación a convocatorias (Analítica Gerencial de Presidencia)
CREATE TABLE IF NOT EXISTS public.logs_postulacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES public.proyectos_clientes_serving(id) ON DELETE SET NULL,
    nombre_proyecto TEXT NOT NULL,
    convocatoria_nombre TEXT NOT NULL,
    estado TEXT CHECK (estado IN ('Postulado', 'En Proceso', 'Adjudicado', 'Rechazado')) DEFAULT 'En Proceso',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 16. Crear tabla convocatorias_social_scraper (Scraper Comercial)
CREATE TABLE IF NOT EXISTS public.convocatorias_social_scraper (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    red_social VARCHAR(50) NOT NULL CHECK (red_social IN ('LinkedIn', 'Instagram')),
    post_url TEXT,
    imagen_url TEXT,
    monto NUMERIC DEFAULT 0,
    dirigido_a TEXT,
    enfoque_vertical TEXT,
    link_acceso TEXT,
    procesado_ia BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 17. Crear tabla biblioteca_aliados_estrategicos (Aliados Comerciales)
CREATE TABLE IF NOT EXISTS public.biblioteca_aliados_estrategicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('detectar_aliados', 'hacer_red_aliados')),
    titulo TEXT NOT NULL,
    contenido_metodologico TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 18. Crear tabla de Biblioteca de Convocatorias / Moldes (Verticales)
CREATE TABLE IF NOT EXISTS public.biblioteca_convocatorias_moldes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_fuente TEXT NOT NULL,
    lineas_tematicas_sectores TEXT[] DEFAULT '{}',
    rubros_financiables_json JSONB DEFAULT '{}',
    limites_financieros_monto NUMERIC NOT NULL,
    criterios_elegibilidad TEXT NOT NULL,
    requisitos_poblacion_territorio TEXT NOT NULL,
    vigencia_cronograma TIMESTAMP WITH TIME ZONE,
    verticales_asociadas TEXT[] CHECK (verticales_asociadas <@ ARRAY['medio_ambiente', 'educacion', 'emprendimiento', 'empresas', 'salud_mental', 'innovacion', 'agro', 'liderazgo', 'vulnerabilidad_y_social']),
    historico_territorial_json JSONB DEFAULT '{
        "puntaje_corte_promedio": 85,
        "densidad_ganadores_local": "baja",
        "sectores_saturados": []
    }'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_biblioteca_verticales ON public.biblioteca_convocatorias_moldes USING GIN (verticales_asociadas);

-- 19. Crear tabla para biblioteca_conceptos_novedosos
CREATE TABLE IF NOT EXISTS public.biblioteca_conceptos_novedosos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vertical_principal TEXT NOT NULL,
    concepto_vanguardia TEXT NOT NULL,
    descripcion_tecnica TEXT NOT NULL
);

-- 20. Habilitar Seguridad a Nivel de Fila (RLS) en todas las tablas creadas
ALTER TABLE public.planes_desarrollo_territorial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articulacion_politica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.descripcion_problema_linea_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problemas_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objetivos_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadena_valor_actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados_impactos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_operativo_detallado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluacion_multicriterio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comisiones_mlm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quejas_fallos_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_postulacion ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.convocatorias_social_scraper ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_aliados_estrategicos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_convocatorias_moldes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_conceptos_novedosos ENABLE ROW LEVEL SECURITY;

-- 21. Crear políticas de lectura para acceso general de consulta
CREATE POLICY "Permitir lectura general a planes_desarrollo_territorial" ON public.planes_desarrollo_territorial FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a articulacion_politica" ON public.articulacion_politica FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a descripcion_problema_linea_base" ON public.descripcion_problema_linea_base FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a problemas_proyecto" ON public.problemas_proyecto FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a objetivos_proyecto" ON public.objetivos_proyecto FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a cadena_valor_actividades" ON public.cadena_valor_actividades FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a resultados_impactos" ON public.resultados_impactos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a plan_operativo_detallado" ON public.plan_operativo_detallado FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a evaluacion_multicriterio" ON public.evaluacion_multicriterio FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a comisiones_mlm" ON public.comisiones_mlm FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a quejas_fallos_ia" ON public.quejas_fallos_ia FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a logs_postulacion" ON public.logs_postulacion FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a convocatorias_social_scraper" ON public.convocatorias_social_scraper FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a biblioteca_aliados_estrategicos" ON public.biblioteca_aliados_estrategicos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a biblioteca_convocatorias_moldes" ON public.biblioteca_convocatorias_moldes FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a biblioteca_conceptos_novedosos" ON public.biblioteca_conceptos_novedosos FOR SELECT USING (true);

-- 22. Crear políticas de escritura para Service Role (backend)
CREATE POLICY "Permitir todo a Service Role en comisiones_mlm" ON public.comisiones_mlm TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a Service Role en quejas_fallos_ia" ON public.quejas_fallos_ia TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a Service Role en logs_postulacion" ON public.logs_postulacion TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a Service Role en convocatorias_social_scraper" ON public.convocatorias_social_scraper TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a Service Role en biblioteca_aliados_estrategicos" ON public.biblioteca_aliados_estrategicos TO service_role USING (true) WITH CHECK (true);

-- 23. Crear tabla de configuración del sistema
CREATE TABLE IF NOT EXISTS public.configuracion_sistema (
    clave TEXT PRIMARY KEY,
    valor TEXT NOT NULL
);

ALTER TABLE public.configuracion_sistema ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir lectura general a configuracion_sistema" ON public.configuracion_sistema FOR SELECT USING (true);
CREATE POLICY "Permitir todo a Service Role en configuracion_sistema" ON public.configuracion_sistema TO service_role USING (true) WITH CHECK (true);

-- Insertar valor por defecto para n8n_webhook_url
INSERT INTO public.configuracion_sistema (clave, valor)
VALUES ('n8n_webhook_url', 'http://host.docker.internal:5678/webhook/process-structuring')
ON CONFLICT (clave) DO NOTHING;

-- 24. Crear función de webhook e integración para n8n
CREATE OR REPLACE FUNCTION public.trigger_n8n_structuring()
RETURNS trigger AS $$
DECLARE
  v_webhook_url TEXT;
BEGIN
  -- Solo disparar si el estado cambia a 'Estructurando_IA'
  IF (NEW.estado_actual = 'Estructurando_IA') AND 
     (OLD.estado_actual IS DISTINCT FROM 'Estructurando_IA') THEN
     
    -- Obtener la URL configurada
    SELECT valor INTO v_webhook_url 
    FROM public.configuracion_sistema 
    WHERE clave = 'n8n_webhook_url';
    
    -- Si no está configurada, usar el fallback local
    IF v_webhook_url IS NULL THEN
      v_webhook_url := 'http://host.docker.internal:5678/webhook/process-structuring';
    END IF;
     
    PERFORM net.http_post(
      url := v_webhook_url,
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'id', NEW.id,
        'fase2Data', NEW.respuestas_fase2_json,
        'planPago', NEW.plan_pago,
        'nombreProyecto', COALESCE(NEW.nombre_iniciativa, 'Iniciativa Sin Nombre')
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_project_structuring_n8n ON public.proyectos_clientes_serving;
CREATE TRIGGER on_project_structuring_n8n
  AFTER UPDATE ON public.proyectos_clientes_serving
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_n8n_structuring();

-- ====================================================================
-- SEMILLAS DE DATOS PARA LAS TABLAS DE MIGRACIÓN
-- ====================================================================

-- Poblar biblioteca_aliados_estrategicos
DELETE FROM public.biblioteca_aliados_estrategicos;
INSERT INTO public.biblioteca_aliados_estrategicos (categoria, titulo, contenido_metodologico)
VALUES
(
  'detectar_aliados', 
  'Metodología para la Búsqueda y Selección de Aliados Estratégicos en el Territorio', 
  '1. Identificación de Actores Clave: Realizar un mapeo de actores que incluya Juntas de Acción Comunales (JAC), asociaciones de productores locales y cooperativas activas.
2. Criterios de Evaluación: Evaluar la antigüedad jurídica (mínimo 12 meses), contratos previos con entidades públicas y el músculo financiero (liquidez).
3. Gobernanza y Reputación: Validar la representatividad en el territorio y la agilidad de firma de sus comités directivos.'
),
(
  'hacer_red_aliados', 
  'Estructuración del Consorcio y Redes de Cooperación Público-Comunitaria', 
  '1. Memorando de Entendimiento (MoU): Suscribir convenios preliminares de cooperación que estipulen el rol operativo de cada aliado y los aportes en especie valorados en el presupuesto.
2. Distribución de Tareas: Asignar responsabilidades según la especialidad del actor (ej. JAC para convocatoria de beneficiarios, Cooperativa para logística del territorio).
3. Red de Apoyo Sectorial: Integrar universidades, ONGs o gremios de segundo nivel para robustecer la transferencia tecnológica y sostenibilidad de la intervención post-proyecto.'
);

-- Poblar biblioteca_convocatorias_moldes
DELETE FROM public.biblioteca_convocatorias_moldes;
INSERT INTO public.biblioteca_convocatorias_moldes 
(entidad_fuente, lineas_tematicas_sectores, rubros_financiables_json, limites_financieros_monto, criterios_elegibilidad, requisitos_poblacion_territorio, vigencia_cronograma, verticales_asociadas)
VALUES 
(
  'Fondo Verde Internacional',
  ARRAY['Sostenibilidad', 'Transición Energética', 'Bioeconomía'],
  '{"equipos": 35, "servicios": 30, "talento": 35, "insumos": 15}',
  1200000000,
  'Persona Jurídica Constituida con mínimo 2 años de existencia. Experiencia demostrada en proyectos agroecológicos o de reforestación.',
  'Población rural del corredor andino-amazónico. Cobertura en mínimo 2 departamentos.',
  NOW() + INTERVAL '12 months',
  ARRAY['medio_ambiente', 'agro', 'innovacion']
),
(
  'Fundación Global para el Aprendizaje',
  ARRAY['Educación Básica', 'Tecnología Educativa', 'Capacitación docente'],
  '{"infraestructura": 20, "talento": 40, "divulgación": 20, "viajes": 20}',
  600000000,
  'Entidades sin ánimo de lucro y organizaciones comunitarias. Contar con aval de secretaría de educación territorial.',
  'Zonas urbanas marginadas y municipios PDET. Alcance mínimo de 15 escuelas.',
  NOW() + INTERVAL '6 months',
  ARRAY['educacion', 'vulnerabilidad_y_social', 'liderazgo']
),
(
  'Aceleradora de Emprendimiento Social',
  ARRAY['Economía Circular', 'Salud Comunitaria', 'Emprendimiento Juvenil'],
  '{"capital_semilla": 50, "mentoria": 30, "administracion": 20}',
  350000000,
  'Jóvenes emprendedores entre 18 y 28 años. Prototipo funcional validado comercialmente.',
  'Comunidades vulnerables de la región pacífica. Mínimo 50% de mujeres en el equipo fundador.',
  NOW() + INTERVAL '4 months',
  ARRAY['emprendimiento', 'salud_mental', 'vulnerabilidad_y_social']
),
(
  'Fondo Fomento de Ciencia y Tecnología Regional',
  ARRAY['Desarrollo de Software', 'Automatización Industrial', 'Biotecnología'],
  '{"talento": 50, "equipos": 30, "patentes": 10, "administracion": 10}',
  1500000000,
  'Micro, Pequeñas y Medianas Empresas (MiPyMEs) de base tecnológica u organizaciones aliadas con centros de investigación.',
  'Cobertura a nivel departamental. Proyectos con TRL 5 o superior.',
  NOW() + INTERVAL '9 months',
  ARRAY['innovacion', 'empresas']
),
(
  'Alianza por el Bienestar Social y Comunitario',
  ARRAY['Salud Mental', 'Tejido Social', 'Prevención de Violencias'],
  '{"capacitaciones": 40, "talento": 30, "materiales": 20, "imprevistos": 10}',
  450000000,
  'Asociaciones comunitarias, Juntas de Acción Comunal y colectivos locales con personería jurídica.',
  'Zonas rurales de alta vulnerabilidad social. Mínimo 100 familias impactadas directamente.',
  NOW() + INTERVAL '8 months',
  ARRAY['salud_mental', 'vulnerabilidad_y_social', 'liderazgo']
);

-- Poblar biblioteca_conceptos_novedosos
DELETE FROM public.biblioteca_conceptos_novedosos;
INSERT INTO public.biblioteca_conceptos_novedosos (vertical_principal, concepto_vanguardia, descripcion_tecnica)
VALUES
(
  'medio_ambiente', 
  'Fito-remediación Simbiótica', 
  'Uso de especies vegetales endémicas asistidas por micorrizas para la extracción acelerada de metales pesados en suelos degradados por actividades industriales o mineras.'
),
(
  'innovacion', 
  'Arquitectura Edge Computing Descentralizada', 
  'Procesamiento de datos en el nodo local con compresión adaptativa para reducir la latencia y la dependencia de conectividad en la nube en zonas rurales.'
),
(
  'agro', 
  'Agricultura de Precisión Regenerativa', 
  'Monitoreo de humedad foliar y nutrición del suelo mediante espectroscopía de bajo costo con fertilización dirigida micro-dosificada.'
),
(
  'salud_mental', 
  'Círculos de Terapia Narrativa Comunitaria', 
  'Espacios autogestionados de apoyo psicosocial basados en círculos de escucha activa guiados por facilitadores locales previamente capacitados para mitigar brechas de acceso psicológico.'
),
(
  'educacion', 
  'Ambientes de Aprendizaje Inversivos Autogestionados', 
  'Modelos pedagógicos híbridos de autoaprendizaje apoyados por kits interactivos sin conectividad física a internet.'
),
(
  'liderazgo', 
  'Gobernanza Horizontal Comunitaria', 
  'Protocolo de toma de decisiones consensuadas a través de comités vecinales rotativos y mecanismos digitales de veeduría.'
),
(
  'vulnerabilidad_y_social', 
  'Micro-franquicias de Autoabastecimiento Colectivo', 
  'Células de autoempleo productivo para jefas de hogar basadas en la producción y distribución barrial de insumos básicos de primera necesidad.'
);

-- Poblar comisiones_mlm
DELETE FROM public.comisiones_mlm;
INSERT INTO public.comisiones_mlm (nombre_proyecto, monto, tipo, estado, beneficiario) VALUES
('Reforestación Andina SAS', 1500, 'MLM', 'Entregada', 'Rocío Velasco'),
('Micro-SaaS Hub', 900, 'Ecosistema de red', 'Por Entregar', 'Hugo Peloc'),
('Ganadería Regenerativa Pro', 2100, 'MLM', 'Entregada', 'Jeff Diazgranados'),
('Skin-Tech Dermacare', 1200, 'Venta Directa', 'Por Entregar', 'Yeison Arcia'),
('Circular Pack S.A.S.', 1500, 'MLM', 'Por Entregar', 'Lorena Ramírez'),
('SST Wellness Platform', 600, 'Ecosistema de red', 'Entregada', 'Alfonso Beltrán');

-- Poblar quejas_fallos_ia
DELETE FROM public.quejas_fallos_ia;
INSERT INTO public.quejas_fallos_ia (nombre_cliente, tipo, descripcion, estado) VALUES
('Carlos Mendoza', 'Fallo Motor IA', 'El análisis ex-ante DNP del Paso #14 arrojó una advertencia de redundancia en la arista de impacto ambiental.', 'En Proceso'),
('Mariana Ortiz', 'Queja', 'Demora en la respuesta de validación por parte del estructurador legal Angie Lombana.', 'Abierto'),
('José Fernando Gómez', 'Fallo Motor IA', 'Error de timeout al procesar el desglose financiero del módulo de auto-formulación.', 'Resuelto'),
('Sofía Restrepo', 'Queja', 'Inconsistencia en los rubros financiables sugeridos para el sector agroindustrial de exportación.', 'Resuelto');

-- Poblar logs_postulacion
DELETE FROM public.logs_postulacion;
INSERT INTO public.logs_postulacion (nombre_proyecto, convocatoria_nombre, estado) VALUES
('Reforestación Andina SAS', 'Fondo Verde Internacional - Clima 2026', 'Postulado'),
('Micro-SaaS Hub', 'Aceleradora de Emprendimiento Social - Fase Semilla', 'En Proceso'),
('Ganadería Regenerativa Pro', 'Fondo Emprender SENA - Convocatoria Nacional 122', 'Postulado'),
('SST Wellness Platform', 'Alianza por el Bienestar Social y Comunitario 2026', 'Adjudicado'),
('Circular Pack S.A.S.', 'Fondo Fomento de Ciencia y Tecnología Regional', 'Rechazado');

-- Poblar planes_desarrollo_territorial (con datos genéricos y de Nariño)
DELETE FROM public.planes_desarrollo_territorial;
INSERT INTO public.planes_desarrollo_territorial (nivel, departamento, municipio, nombre_plan, lineas_estrategicas)
VALUES
(
  'DEPARTAMENTAL', 
  'NARIÑO', 
  NULL, 
  'Plan de Desarrollo Departamental Nariño 2024-2027', 
  '[{"eje": "Nariño Sostenible y Productivo", "meta": "Incrementar en un 20% la adopción de tecnologías limpias en el sector agropecuario."}]'::jsonb
),
(
  'MUNICIPAL', 
  'NARIÑO', 
  'PASTO', 
  'Plan de Desarrollo Pasto Capital 2024-2027', 
  '[{"eje": "Competitividad y Empleo Local", "meta": "Implementar 50 nuevos proyectos de base digital y social en el municipio."}]'::jsonb
);
