-- ====================================================================
-- MIGRACIÓN DE SUPABASE: PASOS #6 AL #19 DE LA METODOLOGÍA SERVING
-- ====================================================================

-- 1. Tabla Maestro de Planes de Desarrollo Territorial
CREATE TABLE IF NOT EXISTS public.planes_desarrollo_territorial (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nivel VARCHAR(20) NOT NULL CHECK (nivel IN ('DEPARTAMENTAL', 'MUNICIPAL')),
    departamento VARCHAR(100) NOT NULL,
    municipio VARCHAR(100), -- NULL si es departamental
    nombre_plan TEXT NOT NULL,
    lineas_estrategicas JSONB DEFAULT '[]', -- Ejes, metas y programas del plan
    fuente_oficial TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Tabla de Articulación Política (Paso #6)
CREATE TABLE IF NOT EXISTS public.articulacion_politica (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL UNIQUE REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    departamento VARCHAR(100) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    plan_departamental_id UUID REFERENCES public.planes_desarrollo_territorial(id) ON DELETE SET NULL,
    plan_municipal_id UUID REFERENCES public.planes_desarrollo_territorial(id) ON DELETE SET NULL,
    texto_articulacion_departamental TEXT NOT NULL, -- Micropaso #03
    texto_articulacion_municipal TEXT NOT NULL,     -- Micropaso #05
    registro_etnico_status VARCHAR(50) DEFAULT 'NO APLICA' CHECK (registro_etnico_status IN ('NO APLICA', 'ALERTA_REVISION', 'REVISADO_APROBADO')), -- Micropaso #08
    alerta_etnica_disparada BOOLEAN DEFAULT false,
    palabras_clave_etnicas_detectadas TEXT[] DEFAULT '{}',
    observaciones_agente TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de Descripción del Problema y Línea Base (Paso #7)
CREATE TABLE IF NOT EXISTS public.descripcion_problema_linea_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL UNIQUE REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    descripcion_tecnica_dnp TEXT NOT NULL, -- Datos duros + fuentes + espejo causas/efectos
    datos_duros_json JSONB DEFAULT '[]',   -- Cifras del DANE, etc.
    fuentes_oficiales TEXT[] DEFAULT '{}',
    espejo_causas_efectos JSONB DEFAULT '[]',
    linea_base_indicadores JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Tabla de Árbol de Problemas del Proyecto
CREATE TABLE IF NOT EXISTS public.problemas_proyecto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('CENTRAL', 'CAUSA_DIRECTA', 'CAUSA_INDIRECTA', 'EFECTO_DIRECTO', 'EFECTO_INDIRECTO')),
    descripcion TEXT NOT NULL,
    padre_id UUID REFERENCES public.problemas_proyecto(id) ON DELETE CASCADE, -- Coherencia vertical jerárquica
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Tabla de Árbol de Objetivos del Proyecto (Regla de Simetría Positiva)
CREATE TABLE IF NOT EXISTS public.objetivos_proyecto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    problema_id UUID UNIQUE NOT NULL REFERENCES public.problemas_proyecto(id) ON DELETE CASCADE, -- Herencia estricta para asegurar simetría
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('GENERAL', 'ESPECIFICO_TECNICO', 'ESPECIFICO_COMERCIAL', 'ESPECIFICO_IMPACTO', 'ACTIVIDAD', 'FIN_DIRECTO', 'FIN_INDIRECTO')),
    descripcion TEXT NOT NULL,
    padre_id UUID REFERENCES public.objetivos_proyecto(id) ON DELETE CASCADE, -- Coherencia vertical espejo
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Tabla de Cadena de Valor y Actividades (Paso #16 y #17)
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

-- 7. Tabla de Resultados e Impactos Multi-horizonte (Paso #19)
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

-- Habilitar Seguridad a Nivel de Fila (RLS)
ALTER TABLE public.planes_desarrollo_territorial ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articulacion_politica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.descripcion_problema_linea_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problemas_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.objetivos_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cadena_valor_actividades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resultados_impactos ENABLE ROW LEVEL SECURITY;

-- Crear políticas de lectura para Service Role y acceso general de consulta
CREATE POLICY "Permitir lectura general a planes_desarrollo_territorial" ON public.planes_desarrollo_territorial FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a articulacion_politica" ON public.articulacion_politica FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a descripcion_problema_linea_base" ON public.descripcion_problema_linea_base FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a problemas_proyecto" ON public.problemas_proyecto FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a objetivos_proyecto" ON public.objetivos_proyecto FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a cadena_valor_actividades" ON public.cadena_valor_actividades FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a resultados_impactos" ON public.resultados_impactos FOR SELECT USING (true);
