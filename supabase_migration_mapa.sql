-- ===========================================================================
-- EL MAPA DE LA FINANCIACIÓN
--
-- Buscar bien no es buscar más: es saber a qué puerta se toca. Por eso cada
-- ficha de la biblioteca queda clasificada por DOS cosas:
--
--   1. quién pone la plata  -> tipo_financiador
--   2. hasta dónde llega    -> ambito (municipal, departamental, nacional,
--                              regional o internacional)
--
-- Con eso, para un proyecto en Barranquilla que pide 80 millones se puede
-- preguntar directamente qué financiadores aplican, en vez de revisar las
-- cuatrocientas fichas a mano.
--
-- Es aditiva: no toca nada de lo que ya existe.
-- ===========================================================================

ALTER TABLE public.biblioteca_convocatorias
  ADD COLUMN IF NOT EXISTS tipo_financiador TEXT NOT NULL DEFAULT 'por_clasificar',
  ADD COLUMN IF NOT EXISTS ambito TEXT NOT NULL DEFAULT 'por_definir',
  ADD COLUMN IF NOT EXISTS pais TEXT;

-- Quién pone la plata. Son las categorías del método, sin inventar ninguna.
ALTER TABLE public.biblioteca_convocatorias
  DROP CONSTRAINT IF EXISTS chk_tipo_financiador;

ALTER TABLE public.biblioteca_convocatorias
  ADD CONSTRAINT chk_tipo_financiador CHECK (tipo_financiador IN (
    'estado_nacional',          -- ministerios, SENA, Minciencias, Fondo Emprender, iNNpulsa
    'estado_local',             -- gobernaciones y alcaldías (Cali, Barranquilla, Bogotá...)
    'cooperacion_bilateral',    -- embajadas y agencias de un país (USAID, GIZ, AECID, JICA)
    'cooperacion_multilateral', -- BID, Banco Mundial, CAF, Unión Europea
    'onu',                      -- PNUD, UNICEF, FAO, OIT, ONU Mujeres, UNESCO
    'banca_desarrollo',         -- Bancóldex, Findeter, IFC, KfW
    'filantropia_privada',      -- fundaciones familiares o independientes
    'filantropia_corporativa',  -- fundaciones de empresas
    'academia',                 -- universidades y centros de investigación
    'empresa_privada',          -- premios, aceleradoras, fondos de inversión
    'ong',                      -- corporaciones, federaciones y asociaciones sin ánimo de lucro
    'por_clasificar'
  ));

-- Hasta dónde llega la convocatoria.
ALTER TABLE public.biblioteca_convocatorias
  DROP CONSTRAINT IF EXISTS chk_ambito;

ALTER TABLE public.biblioteca_convocatorias
  ADD CONSTRAINT chk_ambito CHECK (ambito IN (
    'municipal',
    'departamental',
    'nacional',
    'regional',        -- América Latina, el Caribe, los Andes
    'internacional',
    'por_definir'
  ));

CREATE INDEX IF NOT EXISTS idx_biblioteca_mapa
  ON public.biblioteca_convocatorias (tipo_financiador, ambito, fecha_cierre);

-- Cómo va quedando el mapa: cuántas fichas hay de cada tipo y cuántas siguen
-- vigentes. Sirve para ver de un vistazo dónde está el hueco.
CREATE OR REPLACE VIEW public.mapa_financiacion AS
SELECT
  tipo_financiador,
  ambito,
  COUNT(*)                                                            AS fichas,
  COUNT(*) FILTER (WHERE fecha_cierre IS NULL)                        AS permanentes,
  COUNT(*) FILTER (WHERE fecha_cierre >= CURRENT_DATE)                AS abiertas,
  COUNT(*) FILTER (WHERE fecha_cierre <  CURRENT_DATE)                AS cerradas
FROM public.biblioteca_convocatorias
GROUP BY tipo_financiador, ambito
ORDER BY fichas DESC;
