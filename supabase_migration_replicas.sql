-- ===========================================================================
-- RÉPLICAS
--
-- Replicar es volver a usar un proyecto que ya está estructurado para otra
-- convocatoria, otro territorio u otros beneficiarios, sin volver a empezar
-- de cero.
--
-- Cada réplica guarda tres cosas separadas, que es como lo pide el método:
--   * el NÚCLEO, lo que no se toca (el propósito, el enfoque, la metodología)
--   * lo que SÍ se adapta (territorio, beneficiarios, metas, indicadores)
--   * lo que cambia OBLIGADO por la convocatoria (formato, tope de
--     presupuesto, requisitos habilitantes)
--
-- Es aditiva: no toca nada de lo que ya existe.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.replicas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    proyecto_origen_id UUID NOT NULL
      REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,

    -- el proyecto nuevo que sale de la réplica, cuando ya se creó
    proyecto_replica_id UUID
      REFERENCES public.proyectos_clientes_serving(id) ON DELETE SET NULL,

    -- convocatoria de destino, si la réplica es hacia una convocatoria concreta
    biblioteca_id UUID
      REFERENCES public.biblioteca_convocatorias(id) ON DELETE SET NULL,

    -- los once tipos de réplica del método
    tipo TEXT NOT NULL CHECK (tipo IN (
      'misma convocatoria',
      'otra convocatoria',
      'otro territorio',
      'otros beneficiarios',
      'otro proponente',
      'otros aliados',
      'otra linea tematica',
      'otro enfoque sectorial',
      'otro enfoque de innovacion',
      'otro monto',
      'otro alcance de metas'
    )),

    destino TEXT,          -- a dónde va: territorio, población o convocatoria

    nucleo_json JSONB DEFAULT '[]'::jsonb,       -- lo que NO cambia
    adaptaciones_json JSONB DEFAULT '[]'::jsonb, -- lo que SÍ se adapta
    obligados_json JSONB DEFAULT '[]'::jsonb,    -- lo que exige la convocatoria
    riesgos TEXT,

    estado TEXT NOT NULL DEFAULT 'Planeada'
      CHECK (estado IN ('Planeada', 'Proyecto creado', 'Postulada', 'Descartada')),

    notas_equipo TEXT,
    creada_en TIMESTAMPTZ DEFAULT now(),
    actualizada_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_replicas_origen
    ON public.replicas (proyecto_origen_id, estado);

-- De qué proyecto salió cada réplica, para poder rastrearlo desde el proyecto
-- nuevo sin tener que buscar en la tabla de réplicas.
ALTER TABLE public.proyectos_clientes_serving
    ADD COLUMN IF NOT EXISTS replica_de_proyecto_id UUID
    REFERENCES public.proyectos_clientes_serving(id) ON DELETE SET NULL;
