-- ===========================================================================
-- NOTA DE CONCEPTO
--
-- El motor que genera la Nota de Concepto (src/lib/motorNotaConcepto.ts) y la
-- pantalla que se la muestra al cliente (EntregablesProyecto.tsx, dentro de
-- "Avance de mi proyecto") ya estaban construidos y conectados: el Motor 1
-- la dispara solo, sin que nadie la pida, apenas la estructuración queda
-- lista (ver estructurar-proyecto/route.ts).
--
-- La tabla `notas_concepto` YA EXISTÍA en Supabase (se creó en algún momento
-- por fuera del repositorio — no había ningún archivo .sql que la trajera).
-- Por eso el primer intento de correr esta migración falló: "créala si no
-- existe" no hizo nada porque ya existía, y el paso de abajo intentaba usar
-- una columna que esa tabla vieja no tenía. Esta versión corregida agrega las
-- columnas que faltan SIN volver a crear la tabla, así que es segura de
-- correr sin importar si la tabla ya estaba o no.
--
-- Se agregan convocatoria_id y convocatoria_nombre (opcionales): la nota
-- general del proyecto (la que se genera sola) no le pertenece a ninguna
-- convocatoria y esas dos columnas quedan en null. Cuando el equipo prepara
-- la postulación a una convocatoria concreta (Motor 4), además de la nota
-- general se genera una versión AJUSTADA a lo que esa convocatoria pide —
-- esa versión sí queda amarrada a la convocatoria.
--
-- Es aditiva: no toca ni borra nada de lo que ya existe.
-- ===========================================================================

-- Por si en algún ambiente todavía no existiera (ej. una base nueva desde
-- cero): la crea completa. En tu caso, como ya existe, esta línea no hace
-- nada y sigue de largo a los ALTER de abajo.
CREATE TABLE IF NOT EXISTS public.notas_concepto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL
      REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    idioma TEXT NOT NULL DEFAULT 'es',
    contenido_es TEXT NOT NULL,
    contenido_en TEXT,
    temas_faltantes TEXT[] NOT NULL DEFAULT '{}',
    creada_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Las columnas nuevas, agregadas a la tabla exista o no exista de antes.
ALTER TABLE public.notas_concepto
    ADD COLUMN IF NOT EXISTS convocatoria_id UUID
      REFERENCES public.biblioteca_convocatorias(id) ON DELETE SET NULL;

ALTER TABLE public.notas_concepto
    ADD COLUMN IF NOT EXISTS convocatoria_nombre TEXT;

CREATE INDEX IF NOT EXISTS idx_notas_concepto_proyecto
    ON public.notas_concepto (proyecto_id, creada_en DESC);

CREATE INDEX IF NOT EXISTS idx_notas_concepto_convocatoria
    ON public.notas_concepto (convocatoria_id)
    WHERE convocatoria_id IS NOT NULL;
