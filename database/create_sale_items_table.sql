-- =====================================================
-- Tabla: sale_items
-- Descripción: Registra los detalles de cada producto vendido en una transacción
-- Relaciones:
--   - sales (venta principal)
--   - products (producto vendido)
--   - batches (lote de donde se descontó, opcional)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.sale_items (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4(),
  sale_id uuid NOT NULL,
  product_id uuid NOT NULL,
  batch_id uuid NULL,
  quantity integer NOT NULL,
  unit_price numeric(12, 2) NOT NULL,
  tax_rate numeric(5, 2) DEFAULT 0,
  line_total numeric(12, 2) NOT NULL,
  created_at timestamp with time zone DEFAULT now(),

  -- Constraints
  CONSTRAINT sale_items_pkey PRIMARY KEY (id),
  CONSTRAINT sale_items_sale_id_fkey FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE,
  CONSTRAINT sale_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  CONSTRAINT sale_items_batch_id_fkey FOREIGN KEY (batch_id) REFERENCES batches(id) ON DELETE SET NULL,

  -- Validaciones
  CONSTRAINT sale_items_quantity_check CHECK (quantity > 0),
  CONSTRAINT sale_items_unit_price_check CHECK (unit_price >= 0),
  CONSTRAINT sale_items_line_total_check CHECK (line_total >= 0)
) TABLESPACE pg_default;

-- Índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_batch_id ON public.sale_items(batch_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_created_at ON public.sale_items(created_at DESC);

-- Comentarios para documentación
COMMENT ON TABLE public.sale_items IS 'Detalles de productos vendidos en cada transacción. Permite rastrear qué lotes se usaron (FIFO).';
COMMENT ON COLUMN public.sale_items.batch_id IS 'Referencia al lote usado. NULL si el producto no tiene sistema de lotes.';
COMMENT ON COLUMN public.sale_items.tax_rate IS 'Tasa de IVA aplicada al momento de la venta (%)';
COMMENT ON COLUMN public.sale_items.line_total IS 'Total de la línea (quantity * unit_price)';
