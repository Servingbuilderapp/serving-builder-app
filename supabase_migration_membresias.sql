-- MEMBRESÍAS — Explorador, Constructor, Arquitecto
-- Cobro recurrente (mensual o anual), por transferencia manual (Bold) +
-- comprobante por WhatsApp, igual que Estructuración y Réplicas.
-- No hay pasarela automática: el equipo confirma el pago a mano, igual que
-- ya se hace en /admin/proyectos.

create table if not exists membresias_clientes (
  id uuid primary key default gen_random_uuid(),
  nombre_cliente text not null,
  correo_cliente text not null,
  telefono_whatsapp text not null,
  pais text not null,
  nivel text not null check (nivel in ('explorador', 'constructor', 'arquitecto')),
  ciclo text not null check (ciclo in ('mensual', 'anual')),
  monto_usd numeric not null,
  monto_cop numeric,
  estado text not null default 'pendiente_pago' check (estado in ('pendiente_pago', 'activa', 'vencida', 'cancelada')),
  fecha_inicio timestamptz,
  fecha_proximo_pago timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists membresias_clientes_correo_idx on membresias_clientes (correo_cliente);
create index if not exists membresias_clientes_estado_idx on membresias_clientes (estado);
