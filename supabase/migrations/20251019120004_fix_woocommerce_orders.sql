-- Fix existing WooCommerce orders that still have old statuses
-- Update all orders to use simplified status system

UPDATE public.orders 
SET status = CASE 
  WHEN status IN ('pending', 'in_progress', 'ready', 'delivered') THEN 'pending'::order_status
  WHEN status = 'completed' THEN 'completed'::order_status
  WHEN status = 'cancelled' THEN 'pending'::order_status
  ELSE 'pending'::order_status
END
WHERE status NOT IN ('pending', 'completed');

-- Add comment to explain the change
COMMENT ON COLUMN public.orders.status IS 'Order status: pending (default) or completed (after invoicing)';
