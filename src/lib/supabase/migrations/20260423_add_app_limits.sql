-- Migration to add app_limit to plans for the "A la carta" system

-- 1. Add the new column (default to 0 so we don't break existing data)
ALTER TABLE plans ADD COLUMN IF NOT EXISTS app_limit INTEGER DEFAULT 0;

-- 2. Update the limits for each plan based on the new generous tiering
UPDATE plans SET app_limit = 3 WHERE slug = 'explorador';
UPDATE plans SET app_limit = 10 WHERE slug = 'basic'; -- Emprendedor
UPDATE plans SET app_limit = 20 WHERE slug = 'growth'; -- Crecimiento
UPDATE plans SET app_limit = 35 WHERE slug = 'professional'; -- Profesional
UPDATE plans SET app_limit = 100 WHERE slug = 'elite'; -- Elite
UPDATE plans SET app_limit = 999 WHERE slug = 'master'; -- Master Empresarial

-- 3. (Optional) Let's also update the JSON items arrays in the plans table to reflect these new limits in the pricing table
UPDATE plans SET 
  items_en = REPLACE(items_en::text, '"7 Specialized Miniapps"', '"10 A la Carte Miniapps"')::jsonb,
  items_es = REPLACE(items_es::text, '"7 Miniapps Especializadas"', '"10 Miniapps a la Carta"')::jsonb
WHERE slug = 'basic';

UPDATE plans SET 
  items_en = REPLACE(items_en::text, '"15 Advanced Miniapps"', '"20 A la Carte Miniapps"')::jsonb,
  items_es = REPLACE(items_es::text, '"15 Miniapps Avanzadas"', '"20 Miniapps a la Carta"')::jsonb
WHERE slug = 'growth';

UPDATE plans SET 
  items_en = REPLACE(items_en::text, '"30+ Premium Miniapps"', '"35 A la Carte Miniapps"')::jsonb,
  items_es = REPLACE(items_es::text, '"Más de 30 Miniapps Premium"', '"35 Miniapps a la Carta"')::jsonb
WHERE slug = 'professional';
