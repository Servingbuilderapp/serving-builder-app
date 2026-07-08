-- 1. Crear tabla 'expertos'
CREATE TABLE IF NOT EXISTS public.expertos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre TEXT NOT NULL,
    alias_routing TEXT NOT NULL UNIQUE,
    correo TEXT,
    especialidad TEXT,
    activo BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Crear tabla 'reglas_enrutamiento'
CREATE TABLE IF NOT EXISTS public.reglas_enrutamiento (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    experto_id UUID REFERENCES public.expertos(id) ON DELETE CASCADE,
    nombre_ruta TEXT NOT NULL UNIQUE,
    sectores_compatibles TEXT[] DEFAULT '{}',
    palabras_clave_destino TEXT[] DEFAULT '{}',
    tipos_solicitante TEXT[] DEFAULT '{}',
    monto_minimo_cop NUMERIC DEFAULT 0,
    monto_maximo_cop NUMERIC DEFAULT 999999999999,
    peso_sector INTEGER DEFAULT 0,
    peso_destino INTEGER DEFAULT 0,
    peso_solicitante INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Modificar 'proyectos_clientes_serving' para añadir 'experto_sugerido_id'
ALTER TABLE public.proyectos_clientes_serving 
ADD COLUMN IF NOT EXISTS experto_sugerido_id UUID REFERENCES public.expertos(id) ON DELETE SET NULL;

-- 4. Habilitar RLS si es necesario (el backend usa Service Role, por lo que se salta RLS)
ALTER TABLE public.expertos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reglas_enrutamiento ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de lectura para RLS (Permitir lectura anónima/autenticada si es necesario, o solo Service Role)
-- Para simplificar, permitimos lectura a todos
CREATE POLICY "Permitir lectura de expertos" ON public.expertos FOR SELECT USING (true);
CREATE POLICY "Permitir lectura de reglas_enrutamiento" ON public.reglas_enrutamiento FOR SELECT USING (true);

-- 6. Poblar la tabla de 'expertos'
INSERT INTO public.expertos (nombre, alias_routing, especialidad) VALUES
('Yeison Arcia', 'Fondo Emprender (Ruta asignada a Yeison Arcia)', 'Fondo Emprender o convocatorias del gobierno nacional.'),
('Marco Campoverde', 'Crédito blando con CFC (Ruta asignada a Marco Campoverde)', 'CFC o líneas de fomento.'),
('Lorena Ramírez', 'Banca Internacional y Nacional (Ruta asignada a Lorena Ramírez)', 'Cooperación Internacional y fondos extranjeros.'),
('Alfonso Beltrán', 'Préstamo por Broker de Citibank (Ruta asignada a Alfonso Beltrán)', 'Banca Tradicional Comercial o Estructuración de Capital Privado.'),
('Edward', 'Tokenización (Ruta asignada a Edward)', 'Blockchain, Tokenización o Nuevas Tecnologías.'),
('Estructurador Senior', 'Subvención (Ruta asignada a Estructurador Senior)', 'Subvenciones, subsidios y estructuración técnica general.')
ON CONFLICT (alias_routing) DO UPDATE 
SET nombre = EXCLUDED.nombre, especialidad = EXCLUDED.especialidad;

-- 7. Poblar la tabla de 'reglas_enrutamiento'
INSERT INTO public.reglas_enrutamiento (experto_id, nombre_ruta, sectores_compatibles, palabras_clave_destino, tipos_solicitante, peso_sector, peso_destino, peso_solicitante)
SELECT 
    id, 
    'Fondo Emprender (Ruta asignada a Yeison Arcia)',
    ARRAY['Agropecuario', 'Agroindustrial', 'Turismo y Hotelería'],
    ARRAY['maquinaria', 'equipos', 'insumos', 'materia prima', 'finca', 'cultivo', 'tierra', 'terreno', 'herramientas'],
    ARRAY['Persona Natural', 'Persona Natural con Establecimiento'],
    30, 40, 30
FROM public.expertos WHERE nombre = 'Yeison Arcia'
ON CONFLICT (nombre_ruta) DO NOTHING;

INSERT INTO public.reglas_enrutamiento (experto_id, nombre_ruta, sectores_compatibles, palabras_clave_destino, tipos_solicitante, peso_sector, peso_destino, peso_solicitante)
SELECT 
    id, 
    'Crédito blando con CFC (Ruta asignada a Marco Campoverde)',
    ARRAY['Comercio y Retail', 'Industria Manufacturera', 'Logística y Transporte'],
    ARRAY['capital de trabajo', 'operativo', 'inventario', 'mercancía', 'caja', 'flujo'],
    ARRAY['Empresa Constituida'],
    30, 40, 30
FROM public.expertos WHERE nombre = 'Marco Campoverde'
ON CONFLICT (nombre_ruta) DO NOTHING;

INSERT INTO public.reglas_enrutamiento (experto_id, nombre_ruta, sectores_compatibles, palabras_clave_destino, tipos_solicitante, peso_sector, peso_destino, peso_solicitante)
SELECT 
    id, 
    'Banca Internacional y Nacional (Ruta asignada a Lorena Ramírez)',
    ARRAY['Social y ONG', 'Medio Ambiente y Sostenibilidad', 'Educación'],
    ARRAY['cooperación', 'subvención', 'donación', 'impacto', 'sostenible', 'social', 'ambiental', 'comunidad', 'ong'],
    ARRAY['Entidad Sin Ánimo de Lucro', 'Asociación o Cooperativa', 'Junta de Acción Comunal', 'Cabildo o Resguardo', 'Consejo Comunitario'],
    40, 30, 30
FROM public.expertos WHERE nombre = 'Lorena Ramírez'
ON CONFLICT (nombre_ruta) DO NOTHING;

INSERT INTO public.reglas_enrutamiento (experto_id, nombre_ruta, sectores_compatibles, palabras_clave_destino, tipos_solicitante, peso_sector, peso_destino, peso_solicitante)
SELECT 
    id, 
    'Préstamo por Broker de Citibank (Ruta asignada a Alfonso Beltrán)',
    ARRAY['Infraestructura y Construcción', 'Energías Renovables', 'Salud y Ciencias de la Vida'],
    ARRAY['infraestructura', 'construcción', 'activos fijos', 'compra de terrenos', 'obra', 'edificación', 'planta'],
    ARRAY['Empresa Constituida', 'Consorcio o Unión Temporal'],
    30, 40, 30
FROM public.expertos WHERE nombre = 'Alfonso Beltrán'
ON CONFLICT (nombre_ruta) DO NOTHING;

INSERT INTO public.reglas_enrutamiento (experto_id, nombre_ruta, sectores_compatibles, palabras_clave_destino, tipos_solicitante, peso_sector, peso_destino, peso_solicitante)
SELECT 
    id, 
    'Tokenización (Ruta asignada a Edward)',
    ARRAY['Tecnología y Software', 'Fintech y Servicios Financieros', 'Arte, Cultura y Entretenimiento'],
    ARRAY['blockchain', 'tokenización', 'software', 'plataforma', 'tecnología', 'cripto', 'web3', 'desarrollo', 'digital'],
    ARRAY['Empresa Constituida', 'Persona Natural', 'Otro'],
    30, 40, 30
FROM public.expertos WHERE nombre = 'Edward'
ON CONFLICT (nombre_ruta) DO NOTHING;

INSERT INTO public.reglas_enrutamiento (experto_id, nombre_ruta, sectores_compatibles, palabras_clave_destino, tipos_solicitante, peso_sector, peso_destino, peso_solicitante)
SELECT 
    id, 
    'Subvención (Ruta asignada a Estructurador Senior)',
    ARRAY['Educación', 'Salud y Ciencias de la Vida', 'Otro'],
    ARRAY['subvención', 'subsidio', 'cofinanciación', 'estado', 'gobierno'],
    ARRAY['Junta de Acción Comunal', 'Cabildo o Resguardo', 'Entidad Pública'],
    30, 40, 30
FROM public.expertos WHERE nombre = 'Estructurador Senior'
ON CONFLICT (nombre_ruta) DO NOTHING;
