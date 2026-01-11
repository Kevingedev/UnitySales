-- =====================================================
-- Vista: sales_history_view
-- Descripción: Vista optimizada para historial de ventas
-- Propósito: Mostrar resumen de ventas con productos agregados
-- =====================================================

-- Eliminar vista si existe (para recrearla)
DROP VIEW IF EXISTS public.sales_history_view;

-- Crear vista materializada para mejor rendimiento
CREATE OR REPLACE VIEW public.sales_history_view AS
SELECT
  -- Índice de fila (0-based para frontend)
  ROW_NUMBER() OVER (ORDER BY s.created_at DESC) - 1 AS idx,

  -- Información básica de la venta
  s.id AS sale_id,
  s.created_at,
  s.total_amount,
  s.payment_method,
  s.is_finalized,
  s.tbai_code,

  -- Información del vendedor (si existe perfil asociado)
  p.full_name AS seller_name,

  -- Resumen de productos vendidos (agregado)
  -- Formato: "Producto A (x2), Producto B (x1)"
  STRING_AGG(
    pr.name || ' (x' || si.quantity || ')',
    ', ' ORDER BY pr.name
  ) AS items_summary,

  -- Conteo de líneas de productos diferentes
  COUNT(DISTINCT si.id) AS total_items_count

FROM sales s
LEFT JOIN profiles p ON s.profile_id = p.id
LEFT JOIN sale_items si ON s.id = si.sale_id
LEFT JOIN products pr ON si.product_id = pr.id

-- Agrupar por venta
GROUP BY
  s.id,
  s.created_at,
  s.total_amount,
  s.payment_method,
  s.is_finalized,
  s.tbai_code,
  p.full_name

-- Ordenar por fecha descendente (más reciente primero)
ORDER BY s.created_at DESC;

-- Comentarios para documentación
COMMENT ON VIEW public.sales_history_view IS
'Vista optimizada para mostrar historial de ventas con resumen de productos. Incluye agregación de items y información del vendedor.';

-- =====================================================
-- Índices para mejorar rendimiento de búsquedas
-- =====================================================

-- Nota: Las vistas no pueden tener índices directamente,
-- pero las tablas subyacentes deben tenerlos

-- Verificar que existan estos índices en las tablas base:
-- CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at DESC);
-- CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
-- CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON sale_items(product_id);

-- =====================================================
-- Consultas de ejemplo
-- =====================================================

-- Obtener últimas 20 ventas
-- SELECT * FROM sales_history_view LIMIT 20;

-- Buscar por ID de transacción
-- SELECT * FROM sales_history_view WHERE sale_id::text LIKE '%38d97f92%';

-- Buscar por producto
-- SELECT * FROM sales_history_view WHERE items_summary ILIKE '%RAM%';

-- Filtrar por método de pago
-- SELECT * FROM sales_history_view WHERE payment_method = 'cash';

-- Filtrar por rango de fechas
-- SELECT * FROM sales_history_view
-- WHERE created_at >= '2024-01-01' AND created_at < '2024-02-01';

-- =====================================================
-- Permisos (ajustar según tus necesidades)
-- =====================================================

-- Otorgar permisos de lectura a usuarios autenticados
-- GRANT SELECT ON public.sales_history_view TO authenticated;

-- Revocar acceso público (solo si es necesario)
-- REVOKE ALL ON public.sales_history_view FROM anon;
