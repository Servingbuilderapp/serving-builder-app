-- Migration to update plans to the new tiered structure

-- 1. Ensure all old plans are deactivated or updated
UPDATE plans SET is_active = false;

-- 2. Insert or Update the 6 specific plans
INSERT INTO plans (slug, name_en, name_es, description_en, description_es, price_monthly, items_en, items_es, is_active, sort_order)
VALUES 
('explorador', 'Explorer', 'Explorador', 'Test our interface with limited access.', 'Acceso limitado para conocer la interfaz.', 0.00, 
 '{"3 Demo Apps (1 Tool, 1 Productivity, 1 Project)", "Community Support", "Limited Access (No AI)"}', 
 '{"3 Apps Demo (1 Herramienta, 1 Productividad, 1 Proyecto)", "Soporte vía Comunidad", "Acceso Limitado (Sin IA)"}', 
 true, 1),

('basic', 'Entrepreneur', 'Emprendedor', 'Start your journey with essential productivity tools.', 'Inicia tu camino con herramientas esenciales de productividad.', 29.00, 
 '{"Productivity Tools Unlocked", "7 Specialized Miniapps", "No Watermarks", "Fast Generation Queue", "Email Support", "Commercial License"}', 
 '{"Herramientas de Productividad Desbloqueadas", "7 Miniapps Especializadas", "Sin Marcas de Agua", "Cola de Generación Rápida", "Soporte por Email", "Licencia Comercial"}', 
 true, 2),

('growth', 'Growth', 'Crecimiento', 'Scale with project management and advanced vertical tools.', 'Escala con gestión de proyectos y herramientas verticales avanzadas.', 49.00, 
 '{"Project Tools Unlocked", "15 Advanced Miniapps", "Custom Domain Integration", "Advanced Analytics", "SEO Optimization", "Priority Generation"}', 
 '{"Herramientas de Proyectos Desbloqueadas", "15 Miniapps Avanzadas", "Integración de Dominio Propio", "Analíticas Avanzadas", "Optimización SEO", "Generación Prioritaria"}', 
 true, 3),

('professional', 'Professional', 'Profesional', 'Full suite for professional creators and agencies.', 'Suite completa para creadores profesionales y agencias.', 97.00, 
 '{"Vertical Tools Fully Unlocked", "30+ Premium Miniapps", "Full White-Label Capabilities", "Team Management", "24/7 VIP Support", "Extended Commercial Rights"}', 
 '{"Herramientas Verticales Desbloqueadas", "Más de 30 Miniapps Premium", "Marca Blanca Total", "Gestión de Equipo", "Soporte VIP 24/7", "Derechos Comerciales Extendidos"}', 
 true, 4),

('elite', 'Elite', 'Elite', 'The premium experience with AI Idea Generation.', 'La experiencia premium con Generador de Ideas de IA.', 197.00, 
 '{"All Tools at Maximum Capacity", "AI Idea Generator (10 queries/mo)", "Private Beta Access", "Monthly Growth Strategy", "Dedicated Success Manager", "Custom Development Requests"}', 
 '{"Todas las Herramientas al Máximo", "Generador de Ideas IA (10 consultas/mes)", "Acceso a Betas Privadas", "Estrategia de Crecimiento Mensual", "Gestor de Éxito Dedicado", "Peticiones de Desarrollo a Medida"}', 
 true, 5),

('master', 'Business Master', 'Master Empresarial', 'The ultimate business powerhouse. Everything unlimited.', 'La potencia empresarial definitiva. Todo ilimitado.', 497.00, 
 '{"Everything Unlimited", "UNLIMITED AI Idea Generator", "10 Custom Apps per Month", "Full White-Label Deployment", "Direct Access to Roadmap", "Priority Engineering Support"}', 
 '{"Todo Ilimitado", "Generador de Ideas IA ILIMITADO", "10 Apps Personalizadas al Mes", "Despliegue de Marca Blanca Total", "Acceso Directo al Roadmap", "Soporte de Ingeniería Prioritario"}', 
 true, 6)
ON CONFLICT (slug) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_es = EXCLUDED.name_es,
  description_en = EXCLUDED.description_en,
  description_es = EXCLUDED.description_es,
  price_monthly = EXCLUDED.price_monthly,
  items_en = EXCLUDED.items_en,
  items_es = EXCLUDED.items_es,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order;
