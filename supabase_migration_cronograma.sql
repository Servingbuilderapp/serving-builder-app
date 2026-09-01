-- ===========================================================================
-- Cronograma del proyecto
--
-- Qué agrega y por qué:
--  1. cronograma_proyecto    -> cuánto dura el proyecto en total y cuándo se
--     prevé arrancar. Una sola fila por proyecto.
--  2. cronograma_actividades -> en qué mes empieza y en qué mes termina cada
--     actividad de la cadena de valor, más el entregable con el que se
--     verifica que se hizo.
--
-- Igual que en el presupuesto: las actividades viven dentro de tareas_json y
-- no tienen id propio, así que la fila apunta a cadena_valor_id más la
-- posición de la actividad dentro de esa fila (actividad_indice, de 0 a 5).
--
-- Es aditiva: no borra ni cambia nada de lo que ya existe.
-- ===========================================================================

-- 1. Duración del proyecto --------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cronograma_proyecto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL UNIQUE
      REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    duracion_total_meses SMALLINT NOT NULL DEFAULT 12,
    -- Cuándo se prevé arrancar. Puede quedar vacío mientras no se sepa.
    fecha_inicio DATE,
    notas TEXT,
    actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 2. Cada actividad en el tiempo --------------------------------------------
CREATE TABLE IF NOT EXISTS public.cronograma_actividades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL
      REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    cadena_valor_id UUID NOT NULL
      REFERENCES public.cadena_valor_actividades(id) ON DELETE CASCADE,
    -- Posición de la actividad dentro de tareas_json: 0..5
    actividad_indice SMALLINT NOT NULL DEFAULT 0,
    mes_inicio SMALLINT NOT NULL DEFAULT 1,
    mes_fin SMALLINT NOT NULL DEFAULT 1,
    -- Con qué se demuestra que la actividad se hizo.
    entregable TEXT,
    actualizado_en TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT cronograma_actividad_unica UNIQUE (cadena_valor_id, actividad_indice),
    CONSTRAINT cronograma_meses_coherentes CHECK (mes_fin >= mes_inicio)
);

CREATE INDEX IF NOT EXISTS idx_cronograma_actividades_proyecto
  ON public.cronograma_actividades (proyecto_id);

-- 3. Seguridad --------------------------------------------------------------
ALTER TABLE public.cronograma_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cronograma_actividades ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de cronograma_proyecto" ON public.cronograma_proyecto;
CREATE POLICY "Lectura de cronograma_proyecto"
  ON public.cronograma_proyecto FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura de cronograma_actividades" ON public.cronograma_actividades;
CREATE POLICY "Lectura de cronograma_actividades"
  ON public.cronograma_actividades FOR SELECT USING (true);

DROP POLICY IF EXISTS "Escritura autenticada cronograma_proyecto" ON public.cronograma_proyecto;
CREATE POLICY "Escritura autenticada cronograma_proyecto"
  ON public.cronograma_proyecto FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Escritura autenticada cronograma_actividades" ON public.cronograma_actividades;
CREATE POLICY "Escritura autenticada cronograma_actividades"
  ON public.cronograma_actividades FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
