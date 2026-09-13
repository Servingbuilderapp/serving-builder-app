-- ACADEMIA — columnas para relacionar cada compra con su pago de Bold.
--
-- Se corre UNA vez en Supabase, después de `supabase_migration_academia.sql`.

alter table academia_compras
  add column if not exists bold_order_id text,
  add column if not exists bold_payment_id text;

-- Evita procesar el mismo pago de Bold dos veces si llega repetido
-- (Bold reintenta el webhook si no responde a tiempo).
create unique index if not exists academia_compras_bold_payment_id_idx
  on academia_compras (bold_payment_id)
  where bold_payment_id is not null;

create index if not exists academia_compras_bold_order_id_idx
  on academia_compras (bold_order_id)
  where bold_order_id is not null;
