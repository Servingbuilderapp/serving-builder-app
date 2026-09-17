-- ===========================================================================
-- NOTA DE CONCEPTO
--
-- El motor que genera la Nota de Concepto (src/lib/motorNotaConcepto.ts) y la
-- pantalla que se la muestra al cliente (EntregablesProyecto.tsx, dentro de
-- "Avance de mi proyecto") ya estaban construidos y conectados: el Motor 1
-- la dispara solo, sin que nadie la pida, apenas la estructuración queda
-- lista (ver estructurar-proyecto/route.ts). Lo único que faltaba era esta
-- tabla — sin ella, cada intento de guardar la nota fallaba en silencio.
--
-- Se agregan también convocatoria_id y convocatoria_nombre (opcionales):
-- la nota general del proyecto (la que se genera sola) no le pertenece a
-- ninguna convocatoria y esas dos columnas quedan en null. Cuando el equipo
-- prepara la postulación a una convocatoria concreta (Motor 4), además de la
-- nota general se genera una versión AJUSTADA a lo que esa convocatoria pide
-- — esa versión sí queda amarrada a la convocatoria.
--
-- Es aditiva: no toca ni borra nada de lo que ya existe.
-- ===========================================================================

CREATE TABLE IF NOT EXISTS public.notas_concepto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    proyecto_id UUID NOT NULL
      REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,

    -- null = nota general del proyecto (la automática). Con valor = versión
    -- ajustada a esa convocatoria concreta.
    convocatoria_id UUID
      REFERENCES public.biblioteca_convocatorias(id) ON DELETE SET NULL,
    convocatoria_nombre TEXT,

    -- 'es' | 'en' ya no se usa como único idioma: cuando el proyecto no es de
    -- Latinoamérica se guardan los dos (contenido_en queda lleno) y aquí se
    -- deja 'es_en' para saberlo sin tener que mirar las columnas de texto.
    idioma TEXT NOT NULL DEFAULT 'es',
    contenido_es TEXT NOT NULL,
    contenido_en TEXT,

    -- de los once temas fijos del método, cuáles quedaron sin suficiente
    -- información en el proyecto (no se inventan, se dejan marcados).
    temas_faltantes TEXT[] NOT NULL DEFAULT '{}',

    creada_en TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_notas_concepto_proyecto
    ON public.notas_concepto (proyecto_id, creada_en DESC);

CREATE INDEX IF NOT EXISTS idx_notas_concepto_convocatoria
    ON public.notas_concepto (convocatoria_id)
    WHERE convocatoria_id IS NOT NULL;
