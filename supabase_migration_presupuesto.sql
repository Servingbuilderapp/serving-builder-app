-- ===========================================================================
-- Presupuesto del proyecto
--
-- Qué agrega y por qué:
--  1. presupuesto_proyecto -> las reglas de plata de la convocatoria: moneda,
--     tope máximo, contrapartida mínima, porcentaje de imprevistos y qué
--     rubros no financia. Una sola fila por proyecto.
--  2. presupuesto_items    -> el detalle. Cada ítem cuelga de UNA actividad
--     de la cadena de valor, porque así lo piden los formatos: el evaluador
--     tiene que poder ver qué actividad justifica cada peso.
--
-- Las actividades viven dentro de tareas_json de cadena_valor_actividades y
-- no tienen id propio, así que el ítem apunta a la fila de la cadena
-- (cadena_valor_id) más la posición de la actividad dentro de esa fila
-- (actividad_indice, de 0 a 5).
--
-- Es aditiva: no borra ni cambia nada de lo que ya existe.
-- ===========================================================================

-- 1. Reglas de plata de la convocatoria -------------------------------------
CREATE TABLE IF NOT EXISTS public.presupuesto_proyecto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL UNIQUE
      REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    moneda VARCHAR(10) NOT NULL DEFAULT 'COP',
    -- Tope que la convocatoria deja pedir. 0 o NULL = todavía no se sabe.
    monto_maximo NUMERIC,
    -- Porcentaje mínimo de contrapartida que exige la convocatoria.
    contrapartida_minima_pct NUMERIC DEFAULT 0,
    -- Imprevistos: la metodología pide entre 5 y 10 por ciento.
    imprevistos_pct NUMERIC DEFAULT 5,
    -- Texto libre: lo que la convocatoria NO financia.
    rubros_no_financiables TEXT,
    notas TEXT,
    actualizado_en TIMESTAMPTZ DEFAULT now()
);

-- 2. Detalle del presupuesto ------------------------------------------------
CREATE TABLE IF NOT EXISTS public.presupuesto_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID NOT NULL
      REFERENCES public.proyectos_clientes_serving(id) ON DELETE CASCADE,
    cadena_valor_id UUID NOT NULL
      REFERENCES public.cadena_valor_actividades(id) ON DELETE CASCADE,
    -- Posición de la actividad dentro de tareas_json: 0..5
    actividad_indice SMALLINT NOT NULL DEFAULT 0,
    rubro VARCHAR(40) NOT NULL CHECK (rubro IN (
      'TALENTO_HUMANO',
      'EQUIPOS_Y_SOFTWARE',
      'MATERIALES_E_INSUMOS',
      'CAPACITACION',
      'GASTOS_DE_VIAJE',
      'OTROS'
    )),
    descripcion TEXT NOT NULL,
    -- Ficha del ítem que pide el método.
    especificaciones TEXT,
    justificacion TEXT,
    unidad VARCHAR(60) NOT NULL DEFAULT 'unidad',
    cantidad NUMERIC NOT NULL DEFAULT 1,
    valor_unitario NUMERIC NOT NULL DEFAULT 0,
    -- De dónde sale la plata de este ítem.
    fuente VARCHAR(20) NOT NULL DEFAULT 'SOLICITADO'
      CHECK (fuente IN ('SOLICITADO', 'CONTRAPARTIDA')),
    orden SMALLINT DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT now(),
    actualizado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_presupuesto_items_proyecto
  ON public.presupuesto_items (proyecto_id, rubro);

CREATE INDEX IF NOT EXISTS idx_presupuesto_items_cadena
  ON public.presupuesto_items (cadena_valor_id, actividad_indice);

-- 3. Seguridad --------------------------------------------------------------
ALTER TABLE public.presupuesto_proyecto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presupuesto_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Lectura de presupuesto_proyecto" ON public.presupuesto_proyecto;
CREATE POLICY "Lectura de presupuesto_proyecto"
  ON public.presupuesto_proyecto FOR SELECT USING (true);

DROP POLICY IF EXISTS "Lectura de presupuesto_items" ON public.presupuesto_items;
CREATE POLICY "Lectura de presupuesto_items"
  ON public.presupuesto_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Escritura autenticada presupuesto_proyecto" ON public.presupuesto_proyecto;
CREATE POLICY "Escritura autenticada presupuesto_proyecto"
  ON public.presupuesto_proyecto FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Escritura autenticada presupuesto_items" ON public.presupuesto_items;
CREATE POLICY "Escritura autenticada presupuesto_items"
  ON public.presupuesto_items FOR ALL
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');
