-- Add name column to order_items table
ALTER TABLE public.order_items ADD COLUMN IF NOT EXISTS name TEXT;

-- Add comment to explain the column
COMMENT ON COLUMN public.order_items.name IS 'Product name for direct sales (when product_id is null)';
