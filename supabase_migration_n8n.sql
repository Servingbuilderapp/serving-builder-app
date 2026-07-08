-- ====================================================================
-- MIGRACIÓN DE SUPABASE: INTEGRACIÓN DE WEBHOOKS PARA n8n
-- ====================================================================

-- Habilitar la extensión pg_net en Supabase (utilizada para peticiones HTTP asíncronas)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 1. Crear función para invocar el webhook de n8n en segundo plano
CREATE OR REPLACE FUNCTION public.trigger_n8n_structuring()
RETURNS trigger AS $$
BEGIN
  -- Solo disparar si el estado cambia a 'Estructurando_IA' (evita bucles infinitos)
  IF (NEW.estado_actual = 'Estructurando_IA') AND 
     (OLD.estado_actual IS DISTINCT FROM 'Estructurando_IA') THEN
     
    PERFORM net.http_post(
      -- Reemplazar por tu URL pública o de túnel local (ej: ngrok) de n8n
      url := 'http://host.docker.internal:5678/webhook/process-structuring',
      headers := '{"Content-Type": "application/json"}'::jsonb,
      body := json_build_object(
        'id', NEW.id,
        'fase2Data', NEW.respuestas_fase2_json,
        'planPago', NEW.plan_pago,
        'nombreProyecto', COALESCE(NEW.nombre_iniciativa, 'Iniciativa Sin Nombre')
      )::text
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Vincular la función a un trigger de UPDATE en proyectos_clientes_serving
DROP TRIGGER IF EXISTS on_project_structuring_n8n ON public.proyectos_clientes_serving;
CREATE TRIGGER on_project_structuring_n8n
  AFTER UPDATE ON public.proyectos_clientes_serving
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_n8n_structuring();

-- NOTA: Si utilizas Supabase Cloud, puedes crear este Webhook directamente
-- desde la UI de Supabase: Database -> Webhooks -> Add Webhook.
