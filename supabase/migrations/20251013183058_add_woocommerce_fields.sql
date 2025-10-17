-- Add WooCommerce integration fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS woocommerce_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'paid', 'partial', 'refunded'));

-- Add index for woocommerce_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_orders_woocommerce_id ON public.orders(woocommerce_id);

-- Add items field to orders for easier access (JSONB)
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;

-- Create invoices table for Holded integration
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  holded_invoice_id TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')) DEFAULT 'draft',
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for invoices
CREATE INDEX IF NOT EXISTS idx_invoices_order_id ON public.invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_invoices_holded_id ON public.invoices(holded_invoice_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);

-- Enable RLS
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for invoices
CREATE POLICY "Users can view invoices" ON public.invoices
  FOR SELECT USING (true);

CREATE POLICY "Users can insert invoices" ON public.invoices
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update invoices" ON public.invoices
  FOR UPDATE USING (true);
