-- ============================================================
-- CENTINELA DIGITAL — Fuentes de convocatorias
-- 6 de septiembre de 2026
--
-- Es aditivo: se puede correr varias veces sin romper nada.
--
-- Guarda las 166 fuentes clasificadas por nivel de automatización:
--   Nivel 1 = boletín al buzón del Centinela (la vía fácil, la primera)
--   Nivel 2 = lectura automática directa (RSS / API)
--   Nivel 3 = robot semanal (páginas sin salida automática, frágil)
--   Nivel 0 = por invitación: no se les puede seguir, quedan de referencia
--   Nivel 9 = expertos: se revisan a mano salvo que tengan boletín propio
-- ============================================================

CREATE TABLE IF NOT EXISTS centinela_fuentes (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre         text NOT NULL,
  categoria      text NOT NULL,
  nivel          smallint NOT NULL DEFAULT 1,
  -- pendiente | suscrito | confirmado | sin_boletin | sin_revisar | no_aplica | descartada
  estado         text NOT NULL DEFAULT 'pendiente',
  url            text,
  url_newsletter text,
  correo_remitente text,
  notas          text,
  ultima_revision  timestamptz,
  primer_correo_en timestamptz,
  creado_en      timestamptz NOT NULL DEFAULT now(),
  actualizado_en timestamptz NOT NULL DEFAULT now()
);

-- Dos fuentes con el mismo nombre son la misma fuente. Esto es lo que permite
-- volver a correr el archivo sin duplicar las 166 filas.
CREATE UNIQUE INDEX IF NOT EXISTS centinela_fuentes_nombre_unico
  ON centinela_fuentes (lower(nombre));

CREATE INDEX IF NOT EXISTS centinela_fuentes_nivel_idx  ON centinela_fuentes (nivel);
CREATE INDEX IF NOT EXISTS centinela_fuentes_estado_idx ON centinela_fuentes (estado);

ALTER TABLE centinela_fuentes ENABLE ROW LEVEL SECURITY;

-- Lectura para quien tenga sesión. NINGUNA política de escritura a propósito:
-- las fuentes solo se tocan por /api/centinela/fuentes, que usa la llave de
-- servicio y tiene su propio candado de equipo. Es el mismo patrón que se usó
-- en convocatoria_documentos, y evita depender de users.role, que en esta base
-- todavía no existe.
DROP POLICY IF EXISTS centinela_fuentes_lectura ON centinela_fuentes;
CREATE POLICY centinela_fuentes_lectura ON centinela_fuentes
  FOR SELECT USING (auth.role() = 'authenticated');

-- ------------------------------------------------------------
-- Las 166 fuentes
-- ------------------------------------------------------------
INSERT INTO centinela_fuentes (nombre, categoria, nivel, estado) VALUES
  ('BID Lab', 'Multilaterales y ONU', 1, 'pendiente'),
  ('CAF', 'Multilaterales y ONU', 1, 'pendiente'),
  ('Banco Mundial', 'Multilaterales y ONU', 1, 'pendiente'),
  ('IFC', 'Multilaterales y ONU', 1, 'pendiente'),
  ('FIDA', 'Multilaterales y ONU', 1, 'pendiente'),
  ('Banco de Desarrollo del Caribe', 'Multilaterales y ONU', 1, 'pendiente'),
  ('FONPLATA', 'Multilaterales y ONU', 1, 'pendiente'),
  ('FONTAGRO', 'Multilaterales y ONU', 1, 'pendiente'),
  ('PNUD', 'Multilaterales y ONU', 1, 'pendiente'),
  ('UNESCO', 'Multilaterales y ONU', 1, 'pendiente'),
  ('UNICEF', 'Multilaterales y ONU', 1, 'pendiente'),
  ('OIT', 'Multilaterales y ONU', 1, 'pendiente'),
  ('ONU Mujeres', 'Multilaterales y ONU', 1, 'pendiente'),
  ('FAO', 'Multilaterales y ONU', 1, 'pendiente'),
  ('ACNUR', 'Multilaterales y ONU', 1, 'pendiente'),
  ('ONUDI', 'Multilaterales y ONU', 1, 'pendiente'),
  ('BID-FOMIN', 'Multilaterales y ONU', 1, 'pendiente'),
  ('GIZ (Alemania)', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('KfW (Alemania)', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('AECID (España)', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('Global Affairs Canada', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('IDRC (Canadá)', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('Norad (Noruega)', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('Sida (Suecia)', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('SECO (Suiza)', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('COSUDE (Suiza)', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('AFD (Francia)', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('JICA (Japón)', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('KOICA (Corea)', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('FCDO (Reino Unido)', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('LACIF', 'Cooperación bilateral y embajadas', 1, 'pendiente'),
  ('GEF', 'Clima y ambiente', 1, 'pendiente'),
  ('Fondo Verde para el Clima', 'Clima y ambiente', 1, 'pendiente'),
  ('IKI', 'Clima y ambiente', 1, 'pendiente'),
  ('Adaptation Fund', 'Clima y ambiente', 1, 'pendiente'),
  ('Fondo Colombia Sostenible', 'Clima y ambiente', 1, 'pendiente'),
  ('GEF-PPD', 'Clima y ambiente', 1, 'pendiente'),
  ('Blue Action Fund', 'Clima y ambiente', 1, 'pendiente'),
  ('Fondo Acción', 'Clima y ambiente', 1, 'pendiente'),
  ('Biofin', 'Clima y ambiente', 1, 'pendiente'),
  ('Restor', 'Clima y ambiente', 1, 'pendiente'),
  ('Climate 2025', 'Clima y ambiente', 1, 'pendiente'),
  ('Fundación Telefónica', 'Filantropía con convocatoria abierta', 1, 'pendiente'),
  ('Fundación "la Caixa"', 'Filantropía con convocatoria abierta', 1, 'pendiente'),
  ('Fundación Botín', 'Filantropía con convocatoria abierta', 1, 'pendiente'),
  ('Fundación Mapfre', 'Filantropía con convocatoria abierta', 1, 'pendiente'),
  ('Fundación Carolina', 'Filantropía con convocatoria abierta', 1, 'pendiente'),
  ('Fundación Chile', 'Filantropía con convocatoria abierta', 1, 'pendiente'),
  ('Fundación Corona', 'Filantropía con convocatoria abierta', 1, 'pendiente'),
  ('Fundación Saldarriaga Concha', 'Filantropía con convocatoria abierta', 1, 'pendiente'),
  ('Fundación Grupo Éxito', 'Filantropía con convocatoria abierta', 1, 'pendiente'),
  ('Fundación WWB Colombia', 'Filantropía con convocatoria abierta', 1, 'pendiente'),
  ('Fundación Interamericana (IAF)', 'Filantropía con convocatoria abierta', 1, 'pendiente'),
  ('Fundación Capital', 'Filantropía con convocatoria abierta', 1, 'pendiente'),
  ('Echoing Green', 'Impacto y premios', 1, 'pendiente'),
  ('Acumen', 'Impacto y premios', 1, 'pendiente'),
  ('Grand Challenges', 'Impacto y premios', 1, 'pendiente'),
  ('Grand Challenges Canada', 'Impacto y premios', 1, 'pendiente'),
  ('Roddenberry Foundation', 'Impacto y premios', 1, 'pendiente'),
  ('Novo Nordisk Foundation', 'Impacto y premios', 1, 'pendiente'),
  ('Google.org', 'Corporativas y tecnología', 1, 'pendiente'),
  ('Epic MegaGrants', 'Corporativas y tecnología', 1, 'pendiente'),
  ('AWS (IMAGINE Grant)', 'Corporativas y tecnología', 1, 'pendiente'),
  ('Microsoft', 'Corporativas y tecnología', 1, 'pendiente'),
  ('Cisco Foundation', 'Corporativas y tecnología', 1, 'pendiente'),
  ('Coca-Cola Foundation', 'Corporativas y tecnología', 1, 'pendiente'),
  ('Citi Foundation', 'Corporativas y tecnología', 1, 'pendiente'),
  ('Visa Foundation', 'Corporativas y tecnología', 1, 'pendiente'),
  ('AB InBev/Bavaria', 'Corporativas y tecnología', 1, 'pendiente'),
  ('Salesforce.org', 'Corporativas y tecnología', 1, 'pendiente'),
  ('Autodesk Foundation', 'Corporativas y tecnología', 1, 'pendiente'),
  ('Mastercard Foundation', 'Corporativas y tecnología', 1, 'pendiente'),
  ('Mastercard Center for Inclusive Growth', 'Corporativas y tecnología', 1, 'pendiente'),
  ('British Council', 'Cultura', 1, 'pendiente'),
  ('Programas Iber', 'Cultura', 1, 'pendiente'),
  ('Prince Claus Fund', 'Cultura', 1, 'pendiente'),
  ('UNESCO Diversidad Cultural', 'Cultura', 1, 'pendiente'),
  ('National Endowment of the Arts', 'Cultura', 1, 'pendiente'),
  ('Art Works', 'Cultura', 1, 'pendiente'),
  ('Propaís', 'Entidades colombianas', 1, 'pendiente'),
  ('CCI', 'Entidades colombianas', 1, 'pendiente'),
  ('Promotora de Comercio Social', 'Entidades colombianas', 1, 'pendiente'),
  ('MinCIT', 'Entidades colombianas', 1, 'pendiente'),
  ('DNP', 'Entidades colombianas', 1, 'pendiente'),
  ('ProColombia', 'Entidades colombianas', 1, 'pendiente'),
  ('Minuto de Dios', 'Entidades colombianas', 1, 'pendiente'),
  ('Agrosolidaria', 'Entidades colombianas', 1, 'pendiente'),
  ('Federación Nacional de Municipios', 'Entidades colombianas', 1, 'pendiente'),
  ('Federación Nacional de Departamentos', 'Entidades colombianas', 1, 'pendiente'),
  ('ADR', 'Entidades colombianas', 1, 'pendiente'),
  ('OIM', 'Entidades colombianas', 1, 'pendiente'),
  ('Agencia de Renovación del Territorio', 'Entidades colombianas', 1, 'pendiente'),
  ('Fondo Francisco José de Caldas', 'Entidades colombianas', 1, 'pendiente'),
  ('Fondo de Pago por Resultados', 'Entidades colombianas', 1, 'pendiente'),
  ('Fondo Mujer Emprende', 'Entidades colombianas', 1, 'pendiente'),
  ('Asomicrofinanzas', 'Entidades colombianas', 1, 'pendiente'),
  ('MinCiencias', 'Entidades colombianas', 1, 'pendiente'),
  ('Prosperidad Social', 'Entidades colombianas', 1, 'pendiente'),
  ('FNG', 'Entidades colombianas', 1, 'pendiente'),
  ('Cuso International', 'Entidades colombianas', 1, 'pendiente'),
  ('Fundación PLAN Internacional', 'Entidades colombianas', 1, 'pendiente'),
  ('APC Colombia', 'Entidades colombianas', 1, 'pendiente'),
  ('Howard Hughes', 'Fundaciones internacionales', 1, 'pendiente'),
  ('Robert Wood Johnson Foundation', 'Fundaciones internacionales', 1, 'pendiente'),
  ('Fundación Walton', 'Fundaciones internacionales', 1, 'pendiente'),
  ('Tata Trusts', 'Fundaciones internacionales', 1, 'pendiente'),
  ('Silicon Valley Community Foundation', 'Fundaciones internacionales', 1, 'pendiente'),
  ('Garfield Weston', 'Fundaciones internacionales', 1, 'pendiente'),
  ('Li Ka Shing Foundation', 'Fundaciones internacionales', 1, 'pendiente'),
  ('Helmsley', 'Fundaciones internacionales', 1, 'pendiente'),
  ('Mellon', 'Fundaciones internacionales', 1, 'pendiente'),
  ('Wellcome Trust', 'Fundaciones internacionales', 1, 'pendiente'),
  ('Humanities', 'Temáticos por verificar', 1, 'pendiente'),
  ('American Library Association', 'Temáticos por verificar', 1, 'pendiente'),
  ('Pfizer', 'Temáticos por verificar', 1, 'pendiente'),
  ('ACS', 'Temáticos por verificar', 1, 'pendiente'),
  ('ITVS', 'Temáticos por verificar', 1, 'pendiente'),
  ('American Heart Association', 'Temáticos por verificar', 1, 'pendiente'),
  ('Morgan Stanley', 'Temáticos por verificar', 1, 'pendiente'),
  ('American Academy of Neurology', 'Temáticos por verificar', 1, 'pendiente'),
  ('NSE', 'Temáticos por verificar', 1, 'pendiente'),
  ('National and Community Service', 'Temáticos por verificar', 1, 'pendiente'),
  ('Devex', 'Motores y portales agregadores', 2, 'sin_revisar'),
  ('Funding and Tenders Portal (Unión Europea)', 'Motores y portales agregadores', 2, 'sin_revisar'),
  ('GrantStation', 'Motores y portales agregadores', 2, 'sin_revisar'),
  ('GrantForward', 'Motores y portales agregadores', 2, 'sin_revisar'),
  ('Grantwatch', 'Motores y portales agregadores', 2, 'sin_revisar'),
  ('Terra Viva Grants Directory', 'Motores y portales agregadores', 2, 'sin_revisar'),
  ('IDB Lab Opportunities', 'Motores y portales agregadores', 2, 'sin_revisar'),
  ('Philanthropy News Digest (PND) RFPs', 'Motores y portales agregadores', 2, 'sin_revisar'),
  ('Global Giving Opportunities', 'Motores y portales agregadores', 2, 'sin_revisar'),
  ('Candid', 'Motores y portales agregadores', 2, 'sin_revisar'),
  ('Funds4Impact', 'Motores y portales agregadores', 2, 'sin_revisar'),
  ('Funds for NGOs', 'Páginas sin salida automática', 3, 'sin_revisar'),
  ('Nodoka', 'Páginas sin salida automática', 3, 'sin_revisar'),
  ('Innpactia', 'Páginas sin salida automática', 3, 'sin_revisar'),
  ('Innovamos', 'Páginas sin salida automática', 3, 'sin_revisar'),
  ('Grantmakers', 'Páginas sin salida automática', 3, 'sin_revisar'),
  ('Gestionando', 'Páginas sin salida automática', 3, 'sin_revisar'),
  ('Bandadas', 'Páginas sin salida automática', 3, 'sin_revisar'),
  ('Recursos Culturales', 'Páginas sin salida automática', 3, 'sin_revisar'),
  ('Open Society Foundations', 'Páginas sin salida automática', 3, 'sin_revisar'),
  ('Fundación Bill y Melinda Gates', 'Por invitación', 0, 'no_aplica'),
  ('Fundación Ford', 'Por invitación', 0, 'no_aplica'),
  ('Fundación Rockefeller', 'Por invitación', 0, 'no_aplica'),
  ('Fundación W.K. Kellogg', 'Por invitación', 0, 'no_aplica'),
  ('Oak Foundation', 'Por invitación', 0, 'no_aplica'),
  ('Porticus', 'Por invitación', 0, 'no_aplica'),
  ('Skoll Foundation', 'Por invitación', 0, 'no_aplica'),
  ('Schwab Foundation', 'Por invitación', 0, 'no_aplica'),
  ('MacArthur Foundation', 'Por invitación', 0, 'no_aplica'),
  ('Fundación Packard', 'Por invitación', 0, 'no_aplica'),
  ('Bloomberg Philanthropies', 'Por invitación', 0, 'no_aplica'),
  ('Will Cotrino', 'Expertos', 9, 'sin_revisar'),
  ('Daniel Corradine', 'Expertos', 9, 'sin_revisar'),
  ('agileimpacts', 'Expertos', 9, 'sin_revisar'),
  ('darwinrosas.a', 'Expertos', 9, 'sin_revisar'),
  ('Jorge Cuevas Oyarzun', 'Expertos', 9, 'sin_revisar'),
  ('Jennyortiz.grants', 'Expertos', 9, 'sin_revisar'),
  ('Gustavo Slafer', 'Expertos', 9, 'sin_revisar'),
  ('Keicy Cabrera', 'Expertos', 9, 'sin_revisar'),
  ('matideviag', 'Expertos', 9, 'sin_revisar'),
  ('Sandra Giraldo', 'Expertos', 9, 'sin_revisar'),
  ('Marta Videa', 'Expertos', 9, 'sin_revisar'),
  ('Juan Federico Pino Uribe', 'Expertos', 9, 'sin_revisar'),
  ('Mento Creativo', 'Expertos', 9, 'sin_revisar')
ON CONFLICT (lower(nombre)) DO NOTHING;

-- Cuenta final, para ver en pantalla que quedó bien.
SELECT nivel, count(*) AS fuentes FROM centinela_fuentes GROUP BY nivel ORDER BY nivel;
