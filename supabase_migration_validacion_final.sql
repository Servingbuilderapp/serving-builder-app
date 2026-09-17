-- ===========================================================================
-- VALIDACIÓN FINAL
--
-- Pieza confirmada como pendiente desde el 9 de septiembre: una revisión
-- CUALITATIVA de todo el proyecto ya estructurado, contra lo que pide una
-- convocatoria concreta, justo antes de radicar. A propósito NO da puntaje
-- — el puntaje sobre 100 ya lo da el evaluador de Motor 4
-- (motorPostulacion.ts, tabla postulaciones). Esta pieza busca otra cosa:
-- vacíos genuinos (la convocatoria pide algo que el proyecto no cubre) y
-- párrafos que están pero quedaron flojos o genéricos para esa convocatoria
-- en particular.
--
-- Se corre sola, automáticamente, cada vez que el equipo prepara o vuelve a
-- preparar una postulación (misma llamada que ya dispara el evaluador de
-- 100 puntos) — nadie tiene que pedirla aparte.
--
-- Es aditiva: no toca ni borra nada de lo que ya existe.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.validaciones_finales (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    proyecto_id UUID NOT NULL
      REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,

    postulacion_id UUID
      REFERENCES public.postulaciones(id) ON DELETE CASCADE,

    convocatoria_nombre TEXT,

    -- igual que en el evaluador de estructuración: cada vez que se vuelve a
    -- correr queda una fila nueva, para ver si lo que se corrigió sirvió.
    corrida SMALLINT NOT NULL DEFAULT 1,

    -- [{ "seccion": "...", "descripcion": "...", "tipo": "vacio" | "parrafo_flojo" }]
    hallazgos_json JSONB NOT NULL DEFAULT '[]'::jsonb,

    creada_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_validaciones_finales_proyecto
    ON public.validaciones_finales (proyecto_id, creada_en DESC);

CREATE INDEX IF NOT EXISTS idx_validaciones_finales_postulacion
    ON public.validaciones_finales (postulacion_id, corrida DESC);
