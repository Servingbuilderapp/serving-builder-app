-- ============================================================
-- SALUD DEL CENTINELA — registro de cada corrida automática
-- 30 de octubre de 2026
-- Es aditivo: se puede correr varias veces sin romper nada.
-- ============================================================

CREATE TABLE IF NOT EXISTS centinela_registro (
  id        uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creado_en timestamptz NOT NULL DEFAULT now(),
  -- alertas | boletines | fuentes | enlaces | terminos
  proceso   text NOT NULL,
  -- ok | error
  estado    text NOT NULL DEFAULT 'ok',
  leidos    integer NOT NULL DEFAULT 0,
  nuevas    integer NOT NULL DEFAULT 0,
  errores   integer NOT NULL DEFAULT 0,
  mensaje   text
);

CREATE INDEX IF NOT EXISTS centinela_registro_creado_idx ON centinela_registro (creado_en DESC);

-- Solo se escribe y se lee con la llave de servicio (desde el servidor).
ALTER TABLE centinela_registro ENABLE ROW LEVEL SECURITY;
