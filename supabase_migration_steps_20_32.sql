-- ====================================================================
-- MIGRACIÓN DE SUPABASE: PASOS #20 AL #32 DE LA METODOLOGÍA SERVING
-- ====================================================================

-- 1. Tabla de Plan Operativo PERT Detallado (Paso #21)
CREATE TABLE IF NOT EXISTS public.plan_operativo_detallado (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    entregable TEXT NOT NULL,
    duracion_optimista_dias INTEGER NOT NULL,
    duracion_probable_dias INTEGER NOT NULL,
    duracion_pesimista_dias INTEGER NOT NULL,
    duracion_esperada_dias INTEGER NOT NULL, -- Calculado mediante fórmula PERT
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Evaluación de Viabilidad Multicriterio (Paso #32)
CREATE TABLE IF NOT EXISTS public.evaluacion_multicriterio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL UNIQUE REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    puntaje_propuesta_tecnica INTEGER NOT NULL CHECK (puntaje_propuesta_tecnica BETWEEN 0 AND 20),
    puntaje_impacto_potencial INTEGER NOT NULL CHECK (puntaje_impacto_potencial BETWEEN 0 AND 20),
    puntaje_capacidades_locales INTEGER NOT NULL CHECK (puntaje_capacidades_locales BETWEEN 0 AND 20),
    puntaje_sostenibilidad INTEGER NOT NULL CHECK (puntaje_sostenibilidad BETWEEN 0 AND 20),
    puntaje_replicabilidad INTEGER NOT NULL CHECK (puntaje_replicabilidad BETWEEN 0 AND 20),
    score_total INTEGER NOT NULL CHECK (score_total BETWEEN 0 AND 100),
    comentarios_criterios JSONB DEFAULT '{}', -- Detalle cualitativo por criterio
    recomendaciones_mejora TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.plan_operativo_detallado ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evaluacion_multicriterio ENABLE ROW LEVEL SECURITY;

-- Crear políticas de lectura para Service Role y acceso general de consulta
CREATE POLICY "Permitir lectura general a plan_operativo_detallado" ON public.plan_operativo_detallado FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a evaluacion_multicriterio" ON public.evaluacion_multicriterio FOR SELECT USING (true);
