-- ====================================================================
-- MIGRACIÓN DE SUPABASE: SISTEMA DE ANALÍTICA GERENCIAL DE PRESIDENCIA
-- ====================================================================

-- 1. Asegurar columnas de cumplimiento y pasarelas en proyectos_clientes_serving
ALTER TABLE public.proyectos_clientes_serving 
ADD COLUMN IF NOT EXISTS auditoria_financiera_estado TEXT DEFAULT 'Pendiente' CHECK (auditoria_financiera_estado IN ('Pendiente', 'En Proceso', 'Aprobado', 'Rechazado')),
ADD COLUMN IF NOT EXISTS auditoria_legal_estado TEXT DEFAULT 'Pendiente' CHECK (auditoria_legal_estado IN ('Pendiente', 'En Proceso', 'Aprobado', 'Rechazado')),
ADD COLUMN IF NOT EXISTS pasarela_pago TEXT DEFAULT 'Ninguno' CHECK (pasarela_pago IN ('Stripe', 'Wompi', 'Cupón Aliado', 'Ninguno', 'Manual')),
ADD COLUMN IF NOT EXISTS cupon_aliado_usado TEXT DEFAULT NULL;

-- 2. Crear tabla de comisiones MLM
CREATE TABLE IF NOT EXISTS public.comisiones_mlm (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES public.proyectos_clientes_serving(id) ON DELETE SET NULL,
    nombre_proyecto TEXT NOT NULL,
    monto NUMERIC NOT NULL,
    tipo TEXT CHECK (tipo IN ('Ecosistema de red', 'MLM', 'Venta Directa')),
    estado TEXT CHECK (estado IN ('Entregada', 'Por Entregar')) DEFAULT 'Por Entregar',
    beneficiario TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Crear tabla de quejas y fallos de IA
CREATE TABLE IF NOT EXISTS public.quejas_fallos_ia (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES public.proyectos_clientes_serving(id) ON DELETE SET NULL,
    nombre_cliente TEXT NOT NULL,
    tipo TEXT CHECK (tipo IN ('Queja', 'Fallo Motor IA')),
    descripcion TEXT NOT NULL,
    estado TEXT CHECK (estado IN ('Abierto', 'En Proceso', 'Resuelto')) DEFAULT 'Abierto',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Crear tabla de logs de postulación a convocatorias
CREATE TABLE IF NOT EXISTS public.logs_postulacion (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proyecto_id UUID REFERENCES public.proyectos_clientes_serving(id) ON DELETE SET NULL,
    nombre_proyecto TEXT NOT NULL,
    convocatoria_nombre TEXT NOT NULL,
    estado TEXT CHECK (estado IN ('Postulado', 'En Proceso', 'Adjudicado', 'Rechazado')) DEFAULT 'En Proceso',
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.comisiones_mlm ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quejas_fallos_ia ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_postulacion ENABLE ROW LEVEL SECURITY;

-- Eliminar políticas previas para evitar colisiones
DROP POLICY IF EXISTS "Permitir lectura general a comisiones_mlm" ON public.comisiones_mlm;
DROP POLICY IF EXISTS "Permitir lectura general a quejas_fallos_ia" ON public.quejas_fallos_ia;
DROP POLICY IF EXISTS "Permitir lectura general a logs_postulacion" ON public.logs_postulacion;

DROP POLICY IF EXISTS "Permitir todo a Service Role en comisiones_mlm" ON public.comisiones_mlm;
DROP POLICY IF EXISTS "Permitir todo a Service Role en quejas_fallos_ia" ON public.quejas_fallos_ia;
DROP POLICY IF EXISTS "Permitir todo a Service Role en logs_postulacion" ON public.logs_postulacion;

-- Políticas de lectura
CREATE POLICY "Permitir lectura general a comisiones_mlm" ON public.comisiones_mlm FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a quejas_fallos_ia" ON public.quejas_fallos_ia FOR SELECT USING (true);
CREATE POLICY "Permitir lectura general a logs_postulacion" ON public.logs_postulacion FOR SELECT USING (true);

-- Políticas de escritura para Service Role (backend)
CREATE POLICY "Permitir todo a Service Role en comisiones_mlm" ON public.comisiones_mlm TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a Service Role en quejas_fallos_ia" ON public.quejas_fallos_ia TO service_role USING (true) WITH CHECK (true);
CREATE POLICY "Permitir todo a Service Role en logs_postulacion" ON public.logs_postulacion TO service_role USING (true) WITH CHECK (true);

-- 5. Poblar tablas con datos de semilla espectaculares
DELETE FROM public.comisiones_mlm;
INSERT INTO public.comisiones_mlm (nombre_proyecto, monto, tipo, estado, beneficiario) VALUES
('Reforestación Andina SAS', 1500, 'MLM', 'Entregada', 'Rocío Velasco'),
('Micro-SaaS Hub', 900, 'Ecosistema de red', 'Por Entregar', 'Hugo Peloc'),
('Ganadería Regenerativa Pro', 2100, 'MLM', 'Entregada', 'Jeff Diazgranados'),
('Skin-Tech Dermacare', 1200, 'Venta Directa', 'Por Entregar', 'Yeison Arcia'),
('Circular Pack S.A.S.', 1500, 'MLM', 'Por Entregar', 'Lorena Ramírez'),
('SST Wellness Platform', 600, 'Ecosistema de red', 'Entregada', 'Alfonso Beltrán');

DELETE FROM public.quejas_fallos_ia;
INSERT INTO public.quejas_fallos_ia (nombre_cliente, tipo, descripcion, estado) VALUES
('Carlos Mendoza', 'Fallo Motor IA', 'El análisis ex-ante DNP del Paso #14 arrojó una advertencia de redundancia en la arista de impacto ambiental.', 'En Proceso'),
('Mariana Ortiz', 'Queja', 'Demora en la respuesta de validación por parte del estructurador legal Angie Lombana.', 'Abierto'),
('José Fernando Gómez', 'Fallo Motor IA', 'Error de timeout al procesar el desglose financiero del módulo de auto-formulación.', 'Resuelto'),
('Sofía Restrepo', 'Queja', 'Inconsistencia en los rubros financiables sugeridos para el sector agroindustrial de exportación.', 'Resuelto');

DELETE FROM public.logs_postulacion;
INSERT INTO public.logs_postulacion (nombre_proyecto, convocatoria_nombre, estado) VALUES
('Reforestación Andina SAS', 'Fondo Verde Internacional - Clima 2026', 'Postulado'),
('Micro-SaaS Hub', 'Aceleradora de Emprendimiento Social - Fase Semilla', 'En Proceso'),
('Ganadería Regenerativa Pro', 'Fondo Emprender SENA - Convocatoria Nacional 122', 'Postulado'),
('SST Wellness Platform', 'Alianza por el Bienestar Social y Comunitario 2026', 'Adjudicado'),
('Circular Pack S.A.S.', 'Fondo Fomento de Ciencia y Tecnología Regional', 'Rechazado');
