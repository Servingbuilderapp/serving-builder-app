-- ====================================================================
-- MIGRACIÓN DE SUPABASE: EXTENSIÓN DE BIBLIOTECA Y CONCEPTOS NOVEDOSOS
-- ====================================================================

-- 1. Extender biblioteca_convocatorias_moldes con histórico territorial
ALTER TABLE public.biblioteca_convocatorias_moldes 
ADD COLUMN IF NOT EXISTS historico_territorial_json JSONB DEFAULT '{
    "puntaje_corte_promedio": 85,
    "densidad_ganadores_local": "baja",
    "sectores_saturados": []
}'::jsonb;

-- 2. Crear tabla para registrar el catálogo latente de ideas y conceptos novedosos de la firma
CREATE TABLE IF NOT EXISTS public.biblioteca_conceptos_novedosos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vertical_principal TEXT NOT NULL,
    concepto_vanguardia TEXT NOT NULL,
    descripcion_tecnica TEXT NOT NULL
);

-- 3. Habilitar Seguridad a Nivel de Fila (RLS) en la nueva tabla
ALTER TABLE public.biblioteca_conceptos_novedosos ENABLE ROW LEVEL SECURITY;

-- 4. Crear política de lectura general para RLS
CREATE POLICY "Permitir lectura general a biblioteca_conceptos_novedosos" 
ON public.biblioteca_conceptos_novedosos FOR SELECT USING (true);

-- 5. Insertar Datos de Semilla de Conceptos Novedosos Propietarios de la Firma
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
)
ON CONFLICT DO NOTHING;
