-- ===========================================================================
-- Árbol de problemas: evidencia, orden y validación
--
-- Qué agrega y por qué:
--  1. `orden`  -> hoy no hay forma de saber cuál causa es la 1, la 2 o la 3.
--                 La pantalla del árbol necesita ese orden para dibujar las
--                 tres ramas siempre en el mismo lugar.
--  2. evidencia -> el método exige respaldar cada causa y cada efecto con una
--                 fuente verificable (estudio, informe oficial) y su enlace.
--                 Cuando no hay evidencia se deja en blanco: NO se inventa.
--  3. linea_base -> la magnitud del problema con su dato duro, exigida por la
--                 metodología oficial.
--  4. validaciones_arbol -> guarda la revisión de las 12 preguntas que
--                 recorren el árbol enlace por enlace.
--
-- Es aditiva: no borra ni cambia nada de lo que ya existe.
-- ===========================================================================

-- 1. Columnas nuevas en el árbol de problemas -------------------------------
ALTER TABLE public.problemas_proyecto
  ADD COLUMN IF NOT EXISTS orden SMALLINT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS evidencia_fuente TEXT,
  ADD COLUMN IF NOT EXISTS evidencia_url TEXT,
  ADD COLUMN IF NOT EXISTS evidencia_nota TEXT,
  ADD COLUMN IF NOT EXISTS linea_base TEXT,
  ADD COLUMN IF NOT EXISTS actualizado_en TIMESTAMPTZ DEFAULT now();

CREATE INDEX IF NOT EXISTS idx_problemas_proyecto_proyecto
  ON public.problemas_proyecto (proyecto_id, tipo, orden);

-- 2. Revisión de las 12 preguntas -------------------------------------------
CREATE TABLE IF NOT EXISTS public.validaciones_arbol (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL UNIQUE
      REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    -- { "1": "ok" | "debil" | "falta", ... }  una entrada por pregunta
    respuestas_json JSONB DEFAULT '{}'::jsonb,
    -- { "1": "texto de la nota", ... }
    notas_json JSONB DEFAULT '{}'::jsonb,
    actualizado_en TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.validaciones_arbol ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura general validaciones_arbol" ON public.validaciones_arbol;
CREATE POLICY "Lectura general validaciones_arbol"
  ON public.validaciones_arbol FOR SELECT USING (true);

DROP POLICY IF EXISTS "Escritura autenticada validaciones_arbol" ON public.validaciones_arbol;
CREATE POLICY "Escritura autenticada validaciones_arbol"
  ON public.validaciones_arbol FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- 3. Ordenar lo que ya estaba guardado --------------------------------------
-- A las filas viejas se les asigna el orden según cuándo se crearon, para que
-- la pantalla no las muestre todas como "1".
WITH numeradas AS (
  SELECT id,
         ROW_NUMBER() OVER (PARTITION BY proyecto_id, tipo ORDER BY created_at) AS n
  FROM public.problemas_proyecto
)
UPDATE public.problemas_proyecto p
SET orden = numeradas.n
FROM numeradas
WHERE p.id = numeradas.id
  AND (p.orden IS NULL OR p.orden = 1);
