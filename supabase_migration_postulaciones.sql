-- ===========================================================================
-- POSTULACIONES (Motor 4)
--
-- Una fila por cada vez que un proyecto se postula a una convocatoria.
-- Aquí queda todo lo que hoy se pierde: qué se adaptó del proyecto base para
-- esa convocatoria, qué documentos pedía, con cuánto puntaje quedó el
-- evaluador, cuándo cerraba y cuándo se radicó.
--
-- Dos reglas del método quedan escritas en la tabla:
--   * No se radica con menos de 90 puntos sobre 100.
--   * El evaluador se corre al menos dos veces antes de radicar (columna
--     `corrida`).
--
-- Es aditiva: no toca nada de lo que ya existe.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.postulaciones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL
      REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,

    -- la ficha de la biblioteca de la que salió, cuando existe
    biblioteca_id UUID
      REFERENCES public.biblioteca_convocatorias(id) ON DELETE SET NULL,

    convocatoria_nombre TEXT NOT NULL,
    entidad TEXT,
    fecha_cierre DATE,

    estado TEXT NOT NULL DEFAULT 'Preparando'
      CHECK (estado IN ('Preparando', 'Lista para radicar', 'Radicada', 'Adjudicada', 'Rechazada', 'Descartada')),

    -- Matriz del método: 30 + 30 + 15 + 15 + 10 = 100
    puntaje_tecnica SMALLINT CHECK (puntaje_tecnica BETWEEN 0 AND 30),
    puntaje_impacto SMALLINT CHECK (puntaje_impacto BETWEEN 0 AND 30),
    puntaje_capacidades SMALLINT CHECK (puntaje_capacidades BETWEEN 0 AND 15),
    puntaje_sostenibilidad SMALLINT CHECK (puntaje_sostenibilidad BETWEEN 0 AND 15),
    puntaje_replicabilidad SMALLINT CHECK (puntaje_replicabilidad BETWEEN 0 AND 10),
    puntaje_total SMALLINT CHECK (puntaje_total BETWEEN 0 AND 100),

    veredicto TEXT,               -- aprobar | aprobar con modificaciones | no aprobar
    corrida SMALLINT NOT NULL DEFAULT 1,

    comentarios_json JSONB DEFAULT '{}'::jsonb,   -- qué dice el evaluador de cada criterio
    mejoras_json JSONB DEFAULT '[]'::jsonb,       -- qué hay que corregir para subir el puntaje
    adaptaciones_json JSONB DEFAULT '[]'::jsonb,  -- qué se cambió del proyecto base para esta convocatoria

    carta_intencion TEXT,
    alertas TEXT,
    notas_equipo TEXT,

    fecha_radicacion TIMESTAMPTZ,
    creada_en TIMESTAMPTZ DEFAULT now(),
    actualizada_en TIMESTAMPTZ DEFAULT now()
);

-- Un proyecto no se postula dos veces a la misma convocatoria: se actualiza.
CREATE UNIQUE INDEX IF NOT EXISTS idx_postulacion_unica
    ON public.postulaciones (proyecto_id, convocatoria_nombre);

CREATE INDEX IF NOT EXISTS idx_postulaciones_proyecto
    ON public.postulaciones (proyecto_id, estado);

CREATE INDEX IF NOT EXISTS idx_postulaciones_cierre
    ON public.postulaciones (fecha_cierre);

-- Lo que la convocatoria exige, uno por renglón, para poder ir marcando.
CREATE TABLE IF NOT EXISTS public.postulacion_requisitos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    postulacion_id UUID NOT NULL
      REFERENCES public.postulaciones(id) ON DELETE CASCADE,
    requisito TEXT NOT NULL,
    tipo TEXT NOT NULL DEFAULT 'documento'
      CHECK (tipo IN ('documento', 'formulario', 'condicion')),
    obligatorio BOOLEAN NOT NULL DEFAULT true,
    cumplido BOOLEAN NOT NULL DEFAULT false,
    responsable TEXT,
    nota TEXT,
    orden SMALLINT DEFAULT 1
);

CREATE INDEX IF NOT EXISTS idx_requisitos_postulacion
    ON public.postulacion_requisitos (postulacion_id, orden);

-- Lo que está por cerrarse y todavía no se ha radicado. El método pide tener
-- el formulario final diligenciado al menos 20 días antes del cierre.
CREATE OR REPLACE VIEW public.postulaciones_urgentes AS
SELECT p.*,
       (p.fecha_cierre - CURRENT_DATE) AS dias_para_cierre
FROM public.postulaciones p
WHERE p.estado IN ('Preparando', 'Lista para radicar')
  AND p.fecha_cierre IS NOT NULL
  AND p.fecha_cierre >= CURRENT_DATE
ORDER BY p.fecha_cierre ASC;
