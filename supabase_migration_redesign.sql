-- 1. Añadir columnas de rediseño de arquitectura a 'proyectos_clientes_serving'
ALTER TABLE public.proyectos_clientes_serving 
ADD COLUMN IF NOT EXISTS plan_pago TEXT,
ADD COLUMN IF NOT EXISTS archivo_proyecto_url TEXT,
ADD COLUMN IF NOT EXISTS archivo_proyecto_nombre TEXT,
ADD COLUMN IF NOT EXISTS progreso_estructuracion INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS transferido_agente_convocatorias BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS agente_evaluacion_status TEXT DEFAULT 'Pendiente',
ADD COLUMN IF NOT EXISTS resultado_agente_json JSONB;

-- 2. Asegurar que las tablas 'expertos' y 'reglas_enrutamiento' estén limpias y bien estructuradas
-- Opcional: Para evitar conflictos drásticos de claves foráneas, usamos INSERT ON CONFLICT DO UPDATE

-- 3. Poblar la tabla de 'expertos' con los datos corporativos correctos
INSERT INTO public.expertos (nombre, alias_routing, especialidad, activo) VALUES
('Yeison Arcia', 'Fondo Emprender (Ruta asignada a Yeison Arcia)', 'Emprendimiento en Fondo Emprender para cualquier sector económico.', true),
('Marco Campoverde', 'Crédito blando con CFC (Ruta asignada a Marco Campoverde)', 'Exclusivamente Créditos blandos y líneas de fomento.', true),
('Lorena Ramírez', 'Banca Internacional y Nacional (Ruta asignada a Lorena Ramírez)', 'Gestión de Banca nacional e internacional.', true),
('Alfonso Beltrán', 'Préstamo por Broker de Citibank (Ruta asignada a Alfonso Beltrán)', 'Préstamos de Citibank con póliza.', true),
('Edward', 'Tokenización (Ruta asignada a Edward)', 'Única y estrictamente Tokenización.', true),
('Estructuración', 'Estructuración (Ruta asignada a Motor de Auto-formulación)', 'Motor de auto-formulación con 32 pasos en menos de 5 minutos.', true)
ON CONFLICT (alias_routing) DO UPDATE 
SET nombre = EXCLUDED.nombre, especialidad = EXCLUDED.especialidad, activo = true;

-- 4. Poblar la tabla de 'reglas_enrutamiento' con los pesos y palabras clave alineados corporativamente
-- Primero eliminamos las reglas anteriores para poblar desde cero de manera limpia
DELETE FROM public.reglas_enrutamiento;

-- Regla 1: Yeison Arcia (Fondo Emprender)
INSERT INTO public.reglas_enrutamiento (experto_id, nombre_ruta, sectores_compatibles, palabras_clave_destino, tipos_solicitante, peso_sector, peso_destino, peso_solicitante, monto_minimo_cop, monto_maximo_cop)
SELECT 
    id, 
    'Fondo Emprender (Ruta asignada a Yeison Arcia)',
    ARRAY['Agropecuario', 'Agroindustrial', 'Tecnología y Software', 'Salud y Ciencias de la Vida', 'Educación', 'Infraestructura y Construcción', 'Energías Renovables', 'Medio Ambiente y Sostenibilidad', 'Comercio y Retail', 'Turismo y Hotelería', 'Social y ONG', 'Industria Manufacturera', 'Logística y Transporte', 'Arte, Cultura y Entretenimiento', 'Fintech y Servicios Financieros', 'Otro'], -- Todos los sectores
    ARRAY['fondo emprender', 'sena', 'capital semilla', 'emprendedor', 'emprendimiento', 'iniciar', 'crear empresa'],
    ARRAY['Persona Natural', 'Persona Natural con Establecimiento'],
    10, 60, 30, -- Enfoque máximo en el destino y palabras clave de emprendimiento
    0, 200000000 -- Típicamente montos de Fondo Emprender
FROM public.expertos WHERE nombre = 'Yeison Arcia' AND alias_routing = 'Fondo Emprender (Ruta asignada a Yeison Arcia)';

-- Regla 2: Marco Campoverde (Crédito Bando / CFC)
INSERT INTO public.reglas_enrutamiento (experto_id, nombre_ruta, sectores_compatibles, palabras_clave_destino, tipos_solicitante, peso_sector, peso_destino, peso_solicitante, monto_minimo_cop, monto_maximo_cop)
SELECT 
    id, 
    'Crédito blando con CFC (Ruta asignada a Marco Campoverde)',
    ARRAY['Agropecuario', 'Agroindustrial', 'Tecnología y Software', 'Salud y Ciencias de la Vida', 'Educación', 'Infraestructura y Construcción', 'Energías Renovables', 'Medio Ambiente y Sostenibilidad', 'Comercio y Retail', 'Turismo y Hotelería', 'Social y ONG', 'Industria Manufacturera', 'Logística y Transporte', 'Arte, Cultura y Entretenimiento', 'Fintech y Servicios Financieros', 'Otro'],
    ARRAY['crédito blando', 'crédito', 'banco fomento', 'cfc', 'tasa compensada', 'bancóldex', 'finagro', 'capital de trabajo', 'operativo', 'caja', 'flujo', 'insumos', 'financiamiento'],
    ARRAY['Empresa Constituida', 'Persona Natural con Establecimiento'],
    10, 50, 40,
    50000000, 2000000000
FROM public.expertos WHERE nombre = 'Marco Campoverde' AND alias_routing = 'Crédito blando con CFC (Ruta asignada a Marco Campoverde)';

-- Regla 3: Lorena Ramírez (Banca Nacional e Internacional)
INSERT INTO public.reglas_enrutamiento (experto_id, nombre_ruta, sectores_compatibles, palabras_clave_destino, tipos_solicitante, peso_sector, peso_destino, peso_solicitante, monto_minimo_cop, monto_maximo_cop)
SELECT 
    id, 
    'Banca Internacional y Nacional (Ruta asignada a Lorena Ramírez)',
    ARRAY['Agropecuario', 'Agroindustrial', 'Tecnología y Software', 'Salud y Ciencias de la Vida', 'Educación', 'Infraestructura y Construcción', 'Energías Renovables', 'Medio Ambiente y Sostenibilidad', 'Comercio y Retail', 'Turismo y Hotelería', 'Social y ONG', 'Industria Manufacturera', 'Logística y Transporte', 'Arte, Cultura y Entretenimiento', 'Fintech y Servicios Financieros', 'Otro'],
    ARRAY['banca nacional', 'banca internacional', 'cooperación', 'bid', 'banco mundial', 'fondos extranjeros', 'donación', 'subvención', 'impacto', 'ambiental', 'social', 'desarrollo'],
    ARRAY['Empresa Constituida', 'Entidad Sin Ánimo de Lucro', 'Asociación o Cooperativa', 'Junta de Acción Comunal', 'Cabildo o Resguardo', 'Consejo Comunitario'],
    10, 50, 40,
    300000000, 999999999999
FROM public.expertos WHERE nombre = 'Lorena Ramírez' AND alias_routing = 'Banca Internacional y Nacional (Ruta asignada a Lorena Ramírez)';

-- Regla 4: Alfonso Beltrán (Préstamos Citibank con póliza)
INSERT INTO public.reglas_enrutamiento (experto_id, nombre_ruta, sectores_compatibles, palabras_clave_destino, tipos_solicitante, peso_sector, peso_destino, peso_solicitante, monto_minimo_cop, monto_maximo_cop)
SELECT 
    id, 
    'Préstamo por Broker de Citibank (Ruta asignada a Alfonso Beltrán)',
    ARRAY['Agropecuario', 'Agroindustrial', 'Tecnología y Software', 'Salud y Ciencias de la Vida', 'Educación', 'Infraestructura y Construcción', 'Energías Renovables', 'Medio Ambiente y Sostenibilidad', 'Comercio y Retail', 'Turismo y Hotelería', 'Social y ONG', 'Industria Manufacturera', 'Logística y Transporte', 'Arte, Cultura y Entretenimiento', 'Fintech y Servicios Financieros', 'Otro'],
    ARRAY['préstamo citibank', 'citibank', 'broker', 'póliza de crédito', 'póliza', 'garantía', 'seguro', 'comercial', 'banca tradicional'],
    ARRAY['Empresa Constituida', 'Consorcio o Unión Temporal'],
    10, 60, 30,
    500000000, 999999999999
FROM public.expertos WHERE nombre = 'Alfonso Beltrán' AND alias_routing = 'Préstamo por Broker de Citibank (Ruta asignada a Alfonso Beltrán)';

-- Regla 5: Edward (Tokenización)
INSERT INTO public.reglas_enrutamiento (experto_id, nombre_ruta, sectores_compatibles, palabras_clave_destino, tipos_solicitante, peso_sector, peso_destino, peso_solicitante, monto_minimo_cop, monto_maximo_cop)
SELECT 
    id, 
    'Tokenización (Ruta asignada a Edward)',
    ARRAY['Agropecuario', 'Agroindustrial', 'Tecnología y Software', 'Salud y Ciencias de la Vida', 'Educación', 'Infraestructura y Construcción', 'Energías Renovables', 'Medio Ambiente y Sostenibilidad', 'Comercio y Retail', 'Turismo y Hotelería', 'Social y ONG', 'Industria Manufacturera', 'Logística y Transporte', 'Arte, Cultura y Entretenimiento', 'Fintech y Servicios Financieros', 'Otro'],
    ARRAY['tokenización', 'token', 'tokens', 'security token', 'utility token', 'rwa', 'real world assets', 'fraccionamiento', 'activos digitales'],
    ARRAY['Empresa Constituida', 'Persona Natural', 'Otro'],
    10, 60, 30,
    100000000, 999999999999
FROM public.expertos WHERE nombre = 'Edward' AND alias_routing = 'Tokenización (Ruta asignada a Edward)';

-- Regla 6: Estructuración (Motor de Auto-formulación)
INSERT INTO public.reglas_enrutamiento (experto_id, nombre_ruta, sectores_compatibles, palabras_clave_destino, tipos_solicitante, peso_sector, peso_destino, peso_solicitante, monto_minimo_cop, monto_maximo_cop)
SELECT 
    id, 
    'Estructuración (Ruta asignada a Motor de Auto-formulación)',
    ARRAY['Agropecuario', 'Agroindustrial', 'Tecnología y Software', 'Salud y Ciencias de la Vida', 'Educación', 'Infraestructura y Construcción', 'Energías Renovables', 'Medio Ambiente y Sostenibilidad', 'Comercio y Retail', 'Turismo y Hotelería', 'Social y ONG', 'Industria Manufacturera', 'Logística y Transporte', 'Arte, Cultura y Entretenimiento', 'Fintech y Servicios Financieros', 'Otro'],
    ARRAY['auto-formulación', 'estructuración', 'motor', '32 pasos', 'automatización', 'viabilidad', 'estructurar', 'formular', 'documento'],
    ARRAY['Persona Natural', 'Persona Natural con Establecimiento', 'Empresa Constituida', 'Entidad Sin Ánimo de Lucro', 'Asociación o Cooperativa', 'Junta de Acción Comunal', 'Cabildo o Resguardo', 'Consejo Comunitario', 'Consorcio o Unión Temporal', 'Entidad Pública', 'Otro'],
    10, 60, 30,
    0, 999999999999
FROM public.expertos WHERE nombre = 'Estructuración' AND alias_routing = 'Estructuración (Ruta asignada a Motor de Auto-formulación)';
