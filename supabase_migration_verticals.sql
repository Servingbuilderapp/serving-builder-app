-- ====================================================================
-- MIGRACIÓN DE SUPABASE: BIBLIOTECA DE CONVOCATORIAS Y MOLDES
-- ====================================================================

-- 1. Tabla de Biblioteca de Convocatorias / Moldes
CREATE TABLE IF NOT EXISTS public.biblioteca_convocatorias_moldes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entidad_fuente TEXT NOT NULL,
    lineas_tematicas_sectores TEXT[] DEFAULT '{}',
    rubros_financiables_json JSONB DEFAULT '{}',
    limites_financieros_monto NUMERIC NOT NULL,
    criterios_elegibilidad TEXT NOT NULL,
    requisitos_poblacion_territorio TEXT NOT NULL,
    vigencia_cronograma TIMESTAMP WITH TIME ZONE,
    -- Array que define en cuáles de las 9 verticales aplica (multi-indexación)
    verticales_asociadas TEXT[] CHECK (verticales_asociadas <@ ARRAY['medio_ambiente', 'educacion', 'emprendimiento', 'empresas', 'salud_mental', 'innovacion', 'agro', 'liderazgo', 'vulnerabilidad_y_social'])
);

-- 2. Crear Índice GIN para consultas rápidas de multi-indexación por verticales
CREATE INDEX IF NOT EXISTS idx_biblioteca_verticales ON public.biblioteca_convocatorias_moldes USING GIN (verticales_asociadas);

-- 3. Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.biblioteca_convocatorias_moldes ENABLE ROW LEVEL SECURITY;

-- 4. Crear política de lectura general para RLS (Permitir lectura general de consulta)
CREATE POLICY "Permitir lectura general a biblioteca_convocatorias_moldes" 
ON public.biblioteca_convocatorias_moldes FOR SELECT USING (true);

-- 5. Insertar Datos de Semilla de Convocatorias Reales
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
