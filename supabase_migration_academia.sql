-- ACADEMIA — compras de cursos y notas del lector de presentación.
--
-- Esta migración ya se corrió en Supabase (12 sep 2026). Queda aquí, en el
-- repositorio, para que el código coincida con la base real y para quien
-- necesite volver a crear el entorno desde cero.

create table if not exists academia_compras (
  id uuid primary key default gen_random_uuid(),
  nombre_cliente text not null,
  correo_cliente text not null,
  telefono_whatsapp text not null,
  pais text not null,
  curso text not null check (curso in ('estructuracion', 'formulacion')),
  monto_usd numeric not null,
  monto_cop numeric,
  estado text not null default 'pendiente_pago' check (estado in ('pendiente_pago', 'pagado')),
  fecha_pago timestamptz,
  created_at timestamptz not null default now()
);

-- Una persona no puede comprar el mismo curso dos veces.
create unique index if not exists academia_compras_correo_curso_idx
  on academia_compras (lower(correo_cliente), curso);

create table if not exists academia_notas (
  id uuid primary key default gen_random_uuid(),
  correo_cliente text not null,
  curso text not null check (curso in ('estructuracion', 'formulacion')),
  diapositiva integer not null,
  nota text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- El autoguardado hace upsert sobre esta combinación.
create unique index if not exists academia_notas_correo_curso_diapositiva_idx
  on academia_notas (lower(correo_cliente), curso, diapositiva);

alter table academia_compras enable row level security;
alter table academia_notas enable row level security;

-- Las lecturas y escrituras normales pasan por rutas de API con la
-- service role (igual que membresías), así que no hace falta una política
-- de "select" para el cliente anónimo. Se deja la tabla con RLS activo y
-- sin políticas abiertas, por seguridad.
