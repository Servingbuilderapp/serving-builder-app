-- ===========================================================================
-- RADAR — LA ANATOMÍA DE LOS TÉRMINOS DE REFERENCIA
--
-- Hasta hoy la biblioteca guardaba un RESUMEN de cada convocatoria. Con un
-- resumen no se puede encajar un proyecto: para saber si encaja hay que leer
-- las reglas, y las reglas están en los términos de referencia.
--
-- Esta migración hace tres cosas:
--
--   1. Le agrega a cada ficha las partes de la anatomía de los TdR:
--      quién está habilitado, dónde, para qué entregan el dinero de verdad,
--      con qué criterios califican, cuánto dan y cuánto hay que poner,
--      cuándo abre y cuándo cierra, y qué requisitos habilitantes pide.
--
--   2. Guarda los términos de referencia mismos (el texto del documento),
--      que es contra lo que se hacen los nueve encajes.
--
--   3. Abre la tabla de FINANCIADORES, que sirve aunque no haya convocatoria
--      abierta: quién es, qué financia, qué NO financia y en qué rango.
--
-- Es aditiva: no toca ni borra nada de lo que ya existe.
-- ===========================================================================


-- ---------------------------------------------------------------------------
-- 1. LA ANATOMÍA, sobre la ficha que ya existe
-- ---------------------------------------------------------------------------
ALTER TABLE public.biblioteca_convocatorias
  -- 1 y 2. Elegibilidad: quién está habilitado, y dónde
  ADD COLUMN IF NOT EXISTS paises_elegibles TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tipo_postulante TEXT[] DEFAULT '{}',

  -- 3. El objetivo real: para qué entrega el dinero esta convocatoria
  ADD COLUMN IF NOT EXISTS objetivo TEXT,
  ADD COLUMN IF NOT EXISTS sector TEXT,

  -- 4. Con qué califica
  ADD COLUMN IF NOT EXISTS criterios_evaluacion TEXT,

  -- 5. Monto y contrapartida
  ADD COLUMN IF NOT EXISTS monto_maximo NUMERIC,
  ADD COLUMN IF NOT EXISTS moneda TEXT,
  ADD COLUMN IF NOT EXISTS contrapartida_exigida BOOLEAN,
  ADD COLUMN IF NOT EXISTS contrapartida_detalle TEXT,

  -- 6. Cronograma: los hitos de secuencia
  ADD COLUMN IF NOT EXISTS fecha_apertura DATE,
  ADD COLUMN IF NOT EXISTS fecha_resultados DATE,
  ADD COLUMN IF NOT EXISTS duracion_proyecto TEXT,

  -- 7. Requisitos habilitantes (los documentos y condiciones sin los cuales
  --    ni se recibe la postulación)
  ADD COLUMN IF NOT EXISTS requisitos_habilitantes TEXT,

  -- El enlace de aplicar NO es la página de la entidad. Son cosas distintas
  -- y confundirlas hace perder el cierre.
  ADD COLUMN IF NOT EXISTS enlace_aplicacion TEXT,

  -- Calendario predictivo: la biblioteca no solo guarda convocatorias vivas,
  -- guarda el patrón de apertura.
  ADD COLUMN IF NOT EXISTS abierta_todo_el_anio BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS mes_apertura_tipico SMALLINT,
  ADD COLUMN IF NOT EXISTS periodicidad TEXT,

  -- De dónde salió la ficha: la buscó el motor o la cargó el equipo a mano
  ADD COLUMN IF NOT EXISTS origen_ficha TEXT NOT NULL DEFAULT 'motor',
  ADD COLUMN IF NOT EXISTS cargada_por TEXT;

ALTER TABLE public.biblioteca_convocatorias
  DROP CONSTRAINT IF EXISTS chk_mes_apertura;
ALTER TABLE public.biblioteca_convocatorias
  ADD CONSTRAINT chk_mes_apertura
  CHECK (mes_apertura_tipico IS NULL OR (mes_apertura_tipico BETWEEN 1 AND 12));

ALTER TABLE public.biblioteca_convocatorias
  DROP CONSTRAINT IF EXISTS chk_origen_ficha;
ALTER TABLE public.biblioteca_convocatorias
  ADD CONSTRAINT chk_origen_ficha
  CHECK (origen_ficha IN ('motor', 'manual', 'boletin', 'importacion'));

-- Buscar por país elegible y por tipo de postulante es la primera puerta del
-- encaje, así que va indexado.
CREATE INDEX IF NOT EXISTS idx_biblioteca_paises
  ON public.biblioteca_convocatorias USING GIN (paises_elegibles);
CREATE INDEX IF NOT EXISTS idx_biblioteca_postulante
  ON public.biblioteca_convocatorias USING GIN (tipo_postulante);
CREATE INDEX IF NOT EXISTS idx_biblioteca_apertura
  ON public.biblioteca_convocatorias (mes_apertura_tipico);


-- ---------------------------------------------------------------------------
-- 2. LOS TÉRMINOS DE REFERENCIA
--
-- Una convocatoria puede tener varios documentos (los TdR, el anexo técnico,
-- el formato de presupuesto), por eso van en su propia tabla y no en una
-- columna. Lo que guarda de verdad es el TEXTO: es lo que lee el motor para
-- hacer los nueve encajes.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.convocatoria_documentos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    convocatoria_id UUID NOT NULL
      REFERENCES public.biblioteca_convocatorias(id) ON DELETE CASCADE,

    -- terminos_referencia | anexo | formato | guia | otro
    clase TEXT NOT NULL DEFAULT 'terminos_referencia',

    nombre_archivo TEXT,
    url_origen TEXT,

    -- 'archivo' cuando el equipo lo subió, 'enlace' cuando se bajó de la web
    origen TEXT NOT NULL DEFAULT 'archivo',

    -- el texto extraído del documento. Es la pieza que importa.
    texto TEXT,
    caracteres INTEGER,
    paginas INTEGER,

    -- si la extracción falló, aquí queda por qué, en vez de un texto vacío
    -- que nadie entiende
    error_extraccion TEXT,

    subido_por TEXT,
    creado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_convocatoria_documentos_conv
  ON public.convocatoria_documentos (convocatoria_id);

ALTER TABLE public.convocatoria_documentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "documentos solo equipo" ON public.convocatoria_documentos;
CREATE POLICY "documentos solo equipo"
  ON public.convocatoria_documentos FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );


-- ---------------------------------------------------------------------------
-- 3. FINANCIADORES
--
-- Sirve aunque no tenga convocatoria abierta: es la ficha de quién pone la
-- plata. Lo más útil de esta tabla son los SECTORES EXCLUIDOS: ahorran la
-- postulación que nunca iba a pasar.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financiadores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    clave TEXT NOT NULL UNIQUE,

    nombre TEXT NOT NULL,
    sitio_web TEXT,

    -- se reusa la misma clasificación del mapa de la financiación
    tipo_financiador TEXT NOT NULL DEFAULT 'por_clasificar',
    ambito TEXT NOT NULL DEFAULT 'por_definir',

    politica_inversion TEXT,
    sectores_preferentes TEXT[] DEFAULT '{}',
    sectores_excluidos TEXT[] DEFAULT '{}',
    etapa_organizacion TEXT,
    perfil_beneficiario TEXT,
    cobertura_geografica TEXT[] DEFAULT '{}',

    inversion_minima NUMERIC,
    inversion_maxima NUMERIC,
    moneda TEXT,

    contacto_nombre TEXT,
    contacto_cargo TEXT,
    contacto_correo TEXT,
    contacto_telefono TEXT,
    ciudad TEXT,
    pais TEXT,

    notas_equipo TEXT,
    creado_en TIMESTAMPTZ DEFAULT now(),
    actualizado_en TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_financiadores_tipo
  ON public.financiadores (tipo_financiador);
CREATE INDEX IF NOT EXISTS idx_financiadores_excluidos
  ON public.financiadores USING GIN (sectores_excluidos);

ALTER TABLE public.financiadores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "financiadores solo equipo" ON public.financiadores;
CREATE POLICY "financiadores solo equipo"
  ON public.financiadores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users u
      WHERE u.id = auth.uid() AND u.role = 'admin'
    )
  );


-- ---------------------------------------------------------------------------
-- RESUMEN — qué debe salir al final
-- ---------------------------------------------------------------------------
SELECT
  (SELECT count(*) FROM public.biblioteca_convocatorias)                 AS fichas_en_biblioteca,
  (SELECT count(*) FROM public.biblioteca_convocatorias
     WHERE enlace_aplicacion IS NOT NULL)                                AS fichas_con_enlace_de_aplicar,
  (SELECT count(*) FROM public.convocatoria_documentos)                  AS documentos_guardados,
  (SELECT count(*) FROM public.financiadores)                            AS financiadores,
  (SELECT count(*) FROM information_schema.columns
     WHERE table_name = 'biblioteca_convocatorias')                      AS columnas_de_la_ficha;
