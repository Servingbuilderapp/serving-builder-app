-- ===========================================================================
-- BIBLIOTECA DE CONVOCATORIAS
--
-- El problema que resuelve: hoy cada búsqueda queda guardada solo dentro del
-- proyecto que la pidió (convocatorias_candidatas_proyecto). Si dentro de tres
-- meses llega otro cliente parecido, el motor vuelve a buscar desde cero la
-- misma convocatoria y se vuelve a pagar la misma consulta.
--
-- Con esta tabla, TODA convocatoria que el motor encuentre —la haya elegido o
-- no— queda guardada una sola vez, con su entidad, sus fechas, su monto y su
-- enlace oficial. La próxima búsqueda arranca leyendo esto.
--
-- Es aditiva: no toca ni borra nada de lo que ya existe.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.biblioteca_convocatorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- nombre y entidad normalizados (sin tildes ni mayúsculas). Es lo que
    -- impide que la misma convocatoria entre dos veces con otra redacción.
    clave TEXT NOT NULL UNIQUE,

    nombre TEXT NOT NULL,
    entidad TEXT NOT NULL DEFAULT '',

    -- abierta actualmente | próxima apertura | recurrente | permanente |
    -- periódica | especial | cerrada pero reutilizable | futura
    tipo TEXT,
    estado_convocatoria TEXT,

    -- la fecha en formato de fecha (para poder ordenar y filtrar) y además
    -- tal como venía escrita, porque muchas veces dice "primer trimestre".
    fecha_cierre DATE,
    fecha_cierre_texto TEXT,

    monto TEXT,
    beneficiarios TEXT,
    territorio TEXT,
    linea_tematica TEXT,
    requisitos TEXT,
    mecanismo_postulacion TEXT,
    terminos_referencia TEXT,
    fuente_oficial TEXT,
    alertas TEXT,
    informacion_faltante TEXT,

    -- lo que escribe el equipo a mano; el motor nunca lo pisa
    notas_equipo TEXT,

    veces_encontrada INTEGER NOT NULL DEFAULT 1,
    primera_vez_vista TIMESTAMPTZ DEFAULT now(),
    ultima_vez_vista TIMESTAMPTZ DEFAULT now(),
    actualizado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_biblioteca_convocatorias_cierre
    ON public.biblioteca_convocatorias (fecha_cierre);

CREATE INDEX IF NOT EXISTS idx_biblioteca_convocatorias_entidad
    ON public.biblioteca_convocatorias (entidad);

-- Las que todavía sirven: sin fecha de cierre (permanentes o recurrentes) o
-- con fecha que no ha pasado.
CREATE OR REPLACE VIEW public.convocatorias_vigentes AS
SELECT *
FROM public.biblioteca_convocatorias
WHERE fecha_cierre IS NULL OR fecha_cierre >= CURRENT_DATE;

-- Enlace entre lo que se buscó para un proyecto y la ficha de la biblioteca.
ALTER TABLE public.convocatorias_candidatas_proyecto
    ADD COLUMN IF NOT EXISTS biblioteca_id UUID
    REFERENCES public.biblioteca_convocatorias(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_candidatas_biblioteca
    ON public.convocatorias_candidatas_proyecto (biblioteca_id);
