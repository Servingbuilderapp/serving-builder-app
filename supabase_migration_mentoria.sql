-- ===========================================================================
-- MENTORÍA — reutiliza la tabla de compras de Academia
-- ===========================================================================
--
-- La Mentoría (confirmada por el dueño el 17 sep 2026 — ver
-- claude/producto-mentoria-definicion-y-precio-2026-09-17.md en el Proyecto)
-- usa exactamente el mismo flujo de compra y de pago que ya existe para los
-- cursos de Academia: mismo formulario, mismo botón de Bold, misma
-- transferencia manual de respaldo. Por eso no necesita tablas nuevas —
-- solo hace falta que la tabla `academia_compras` acepte 'mentoria' como
-- valor de la columna `curso`, que hoy solo permite 'estructuracion' y
-- 'formulacion'.
--
-- Es aditiva: no toca ni borra ningún dato que ya exista.
-- ===========================================================================

ALTER TABLE public.academia_compras
    DROP CONSTRAINT IF EXISTS academia_compras_curso_check;

ALTER TABLE public.academia_compras
    ADD CONSTRAINT academia_compras_curso_check
    CHECK (curso IN ('estructuracion', 'formulacion', 'mentoria'));
