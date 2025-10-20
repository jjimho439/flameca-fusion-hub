-- Crear tabla para almacenar documentos de Holded
CREATE TABLE IF NOT EXISTS holded_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  holded_id TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('invoice', 'salesreceipt', 'creditnote', 'receiptnote', 'estimate', 'salesorder', 'waybill', 'proform', 'purchase', 'purchaserefund', 'purchaseorder')),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'sent', 'paid', 'cancelled')) DEFAULT 'draft',
  items JSONB NOT NULL DEFAULT '[]',
  notes TEXT,
  date TIMESTAMPTZ DEFAULT NOW(),
  due_date TIMESTAMPTZ,
  currency TEXT DEFAULT 'EUR',
  language TEXT DEFAULT 'es',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_holded_documents_type ON holded_documents(type);
CREATE INDEX IF NOT EXISTS idx_holded_documents_status ON holded_documents(status);
CREATE INDEX IF NOT EXISTS idx_holded_documents_customer_email ON holded_documents(customer_email);
CREATE INDEX IF NOT EXISTS idx_holded_documents_created_at ON holded_documents(created_at);

-- Crear tabla para contactos de Holded
CREATE TABLE IF NOT EXISTS holded_contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  holded_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  type TEXT NOT NULL CHECK (type IN ('customer', 'supplier')) DEFAULT 'customer',
  address JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para contactos
CREATE INDEX IF NOT EXISTS idx_holded_contacts_type ON holded_contacts(type);
CREATE INDEX IF NOT EXISTS idx_holded_contacts_email ON holded_contacts(email);

-- Habilitar RLS (Row Level Security)
ALTER TABLE holded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE holded_contacts ENABLE ROW LEVEL SECURITY;

-- Crear políticas de seguridad (permitir acceso a todos los usuarios autenticados)
CREATE POLICY "Allow all operations for authenticated users" ON holded_documents
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Allow all operations for authenticated users" ON holded_contacts
  FOR ALL USING (auth.role() = 'authenticated');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear triggers para actualizar updated_at
CREATE TRIGGER update_holded_documents_updated_at 
  BEFORE UPDATE ON holded_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_holded_contacts_updated_at 
  BEFORE UPDATE ON holded_contacts 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

