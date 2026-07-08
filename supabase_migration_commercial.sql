-- ====================================================================
-- MIGRACIÓN DE SUPABASE: ARQUITECTURA COMERCIAL Y AUTOMATIZACIÓN EXTENSA
-- ====================================================================

-- 1. Asegurar estructura de public.users para referidos
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS codigo_referido_unico TEXT UNIQUE DEFAULT substring(md5(random()::text) from 1 for 8),
ADD COLUMN IF NOT EXISTS referido_por TEXT,
ADD COLUMN IF NOT EXISTS pagos_referidos_efectivos INTEGER DEFAULT 0;

-- 2. Asegurar que referido_por apunte a codigo_referido_unico si no existe FK
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

-- 3. Agregar columnas a proyectos_clientes_serving para suscripciones y cierre legal
ALTER TABLE public.proyectos_clientes_serving 
ADD COLUMN IF NOT EXISTS fecha_inicio_plan TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS fecha_vencimiento_plan TIMESTAMPTZ DEFAULT now() + INTERVAL '1 month',
ADD COLUMN IF NOT EXISTS aristas_maximas INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS aristas_configuradas TEXT[] DEFAULT '{}'::text[],
ADD COLUMN IF NOT EXISTS upsell_aplicado JSONB DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS booking_confirmado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS contrato_firmado BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS firma_digital TEXT;

-- Convertir columna estado_actual a TEXT para flexibilidad de estados del embudo
ALTER TABLE public.proyectos_clientes_serving ALTER COLUMN estado_actual TYPE TEXT;

-- 4. Crear tabla convocatorias_social_scraper
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

-- 5. Crear tabla biblioteca_aliados_estrategicos
CREATE TABLE IF NOT EXISTS public.biblioteca_aliados_estrategicos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria VARCHAR(50) NOT NULL CHECK (categoria IN ('detectar_aliados', 'hacer_red_aliados')),
    titulo TEXT NOT NULL,
    contenido_metodologico TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Habilitar Seguridad a Nivel de Fila (RLS) en las nuevas tablas
ALTER TABLE public.convocatorias_social_scraper ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.biblioteca_aliados_estrategicos ENABLE ROW LEVEL SECURITY;

-- 7. Crear políticas de lectura general para RLS
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir lectura general a convocatorias_social_scraper') THEN
        CREATE POLICY "Permitir lectura general a convocatorias_social_scraper" 
        ON public.convocatorias_social_scraper FOR SELECT USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir lectura general a biblioteca_aliados_estrategicos') THEN
        CREATE POLICY "Permitir lectura general a biblioteca_aliados_estrategicos" 
        ON public.biblioteca_aliados_estrategicos FOR SELECT USING (true);
    END IF;
END
$$;

-- 8. Crear políticas de escritura para Service Role (para backend access)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir todo a Service Role en convocatorias_social_scraper') THEN
        CREATE POLICY "Permitir todo a Service Role en convocatorias_social_scraper" 
        ON public.convocatorias_social_scraper TO service_role USING (true) WITH CHECK (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Permitir todo a Service Role en biblioteca_aliados_estrategicos') THEN
        CREATE POLICY "Permitir todo a Service Role en biblioteca_aliados_estrategicos" 
        ON public.biblioteca_aliados_estrategicos TO service_role USING (true) WITH CHECK (true);
    END IF;
END
$$;

-- 9. Insertar Datos de Semilla de Biblioteca de Aliados Estratégicos
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
)
ON CONFLICT DO NOTHING;
