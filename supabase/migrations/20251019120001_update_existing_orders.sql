-- Update existing orders to use simplified status system
-- Map old statuses to new simplified ones

UPDATE public.orders 
SET status = CASE 
  WHEN status IN ('pending', 'in_progress', 'ready', 'delivered') THEN 'pending'::order_status
  WHEN status = 'completed' THEN 'completed'::order_status
  WHEN status = 'cancelled' THEN 'pending'::order_status -- Treat cancelled as pending for now
  ELSE 'pending'::order_status
END;

-- Add comment to explain the change
COMMENT ON COLUMN public.orders.status IS 'Order status: pending (default) or completed (after invoicing)';
