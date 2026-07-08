-- ====================================================================
-- MIGRACIÓN DE SUPABASE: ARISTA DE CONVOCATORIAS Y FONDOS GLOBALES
-- ====================================================================

-- 1. Crear Enum para Tipo de Fondeo (Subvenciones y Financiamiento) de forma segura
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'tipo_fondeo_enum') THEN
        CREATE TYPE public.tipo_fondeo_enum AS ENUM ('subvencion', 'fomento', 'credito', 'capital_riesgo');
    END IF;
END
$$;

-- 2. Crear Tabla Principal de Convocatorias
CREATE TABLE IF NOT EXISTS public.tabla_convocatorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    titulo TEXT NOT NULL,
    entidad_otorgante TEXT NOT NULL,
    monto_maximo NUMERIC NOT NULL,
    tipo_fondeo public.tipo_fondeo_enum NOT NULL,
    fecha_cierre TIMESTAMP WITH TIME ZONE NOT NULL,
    idioma_origen VARCHAR(10) NOT NULL DEFAULT 'es',
    sectores_elegibles TEXT[] NOT NULL DEFAULT '{}',
    requisitos_clave TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Crear Índice GIN para Búsquedas Rápidas e Indexación en Sectores
CREATE INDEX IF NOT EXISTS idx_convocatorias_sectores ON public.tabla_convocatorias USING GIN (sectores_elegibles);

-- 4. Habilitar RLS (Seguridad a Nivel de Fila)
ALTER TABLE public.tabla_convocatorias ENABLE ROW LEVEL SECURITY;

-- 5. Crear Políticas de Seguridad
DROP POLICY IF EXISTS "Permitir lectura general a tabla_convocatorias" ON public.tabla_convocatorias;
CREATE POLICY "Permitir lectura general a tabla_convocatorias" 
    ON public.tabla_convocatorias FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir todo a Service Role en tabla_convocatorias" ON public.tabla_convocatorias;
CREATE POLICY "Permitir todo a Service Role en tabla_convocatorias" 
    ON public.tabla_convocatorias TO service_role USING (true) WITH CHECK (true);

-- 6. Insertar Semillero de Datos Oficial de Convocatorias Nacionales e Internacionales
DELETE FROM public.tabla_convocatorias;
INSERT INTO public.tabla_convocatorias 
(titulo, entidad_otorgante, monto_maximo, tipo_fondeo, fecha_cierre, idioma_origen, sectores_elegibles, requisitos_clave)
VALUES 
(
  'Fondo Verde para la Acción Climática Local',
  'Cooperación Alemana (GIZ)',
  1200000000,
  'subvencion',
  NOW() + INTERVAL '6 months',
  'es',
  ARRAY[
    'Reforestación y Restauración Ecológica', 
    'Economía Circular y Gestión de Residuos', 
    'Medición de Huella de Carbono', 
    'Medición de Huella Hídrica', 
    'Tratamiento y Conservación de Aguas'
  ],
  'Requiere personería jurídica de derecho privado sin fines de lucro con mínimo 2 años de existencia. Aporte propio del 10% del presupuesto.'
),
(
  'Subvenciones de Educación STEM y Equidad de Género',
  'Unión Europea (Grants.gov)',
  850000000,
  'subvencion',
  NOW() + INTERVAL '4 months',
  'en',
  ARRAY[
    'Educación STEM para Jóvenes', 
    'Alfabetización Digital Comunitaria', 
    'Plataformas E-learning de Habilidades Blandas'
  ],
  'Must target vulnerable youth populations in developing regions. All financial accounting and progress reports must be submitted in English.'
),
(
  'Programa Nacional de Aceleración y Fomento Empresarial',
  'Fondo Emprender SENA',
  150000000,
  'fomento',
  NOW() + INTERVAL '3 months',
  'es',
  ARRAY[
    'Startups Tecnológicas en Fase Temprana', 
    'Micro-apps y SaaS para PyMEs', 
    'Comercio Electrónico y D2C', 
    'Inteligencia Artificial Aplicada'
  ],
  'Emprendedores colombianos mayores de edad o empresas con menos de 12 meses de constitución mercantil. Requiere plan de negocio estructurado.'
),
(
  'Línea de Crédito de Desarrollo Rural Sostenible',
  'Banco Interamericano de Desarrollo (BID)',
  5000000000,
  'credito',
  NOW() + INTERVAL '12 months',
  'es',
  ARRAY[
    'Infraestructura Comunitaria Sostenible', 
    'Energías Renovables', 
    'Sistemas de Riego Automatizado'
  ],
  'Requiere aval de viabilidad técnica y ambiental del ministerio sectorial. Tasa de interés blanda con período de gracia de 24 meses.'
),
(
  'Fondo de Capital de Riesgo para Salud Digital y Bienestar',
  'Citibank Global Venture Fund',
  3000000000,
  'capital_riesgo',
  NOW() + INTERVAL '9 months',
  'en',
  ARRAY[
    'Plataformas de Apoyo Psicológico Digital', 
    'Salud y Seguridad en el Trabajo (SST)', 
    'Prevención de Desgaste Laboral (Burnout)'
  ],
  'Scalable digital solutions with MVP already validated in the market. Minority equity stake (10-15%) and board seat required.'
);
