-- Ventana de 3 días para que el cliente apruebe pasar a la búsqueda de
-- convocatorias, con arranque automático si no contesta a tiempo.
--
-- evaluacion_aprobada_en:            cuándo el evaluador automático aprobó el proyecto.
-- cliente_aprobo_busqueda_en:        cuándo el cliente dijo "sí, busquemos convocatorias" (si lo dijo).
-- busqueda_convocatorias_iniciada:   ya se arrancó el Motor 2 para este proyecto (por el cliente o por el reloj de 3 días) — evita arrancarlo dos veces.

alter table proyectos_clientes_serving
  add column if not exists evaluacion_aprobada_en timestamptz,
  add column if not exists cliente_aprobo_busqueda_en timestamptz,
  add column if not exists busqueda_convocatorias_iniciada boolean not null default false;

create index if not exists idx_proyectos_esperando_aprobacion
  on proyectos_clientes_serving (evaluacion_aprobada_en)
  where evaluacion_aprobada = true and busqueda_convocatorias_iniciada = false;
