-- Crear tabla para notificaciones in-app
CREATE TABLE IF NOT EXISTS public.app_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    section TEXT NOT NULL,
    message TEXT NOT NULL,
    data JSONB,
    source TEXT DEFAULT 'internal',
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_app_notifications_section ON public.app_notifications(section);
CREATE INDEX IF NOT EXISTS idx_app_notifications_read ON public.app_notifications(read);
CREATE INDEX IF NOT EXISTS idx_app_notifications_created_at ON public.app_notifications(created_at DESC);

-- Habilitar RLS
ALTER TABLE public.app_notifications ENABLE ROW LEVEL SECURITY;

-- Política para que todos los usuarios autenticados puedan leer sus notificaciones
CREATE POLICY "Users can read all notifications" ON public.app_notifications
    FOR SELECT USING (auth.role() = 'authenticated');

-- Política para que solo el sistema pueda insertar notificaciones
CREATE POLICY "System can insert notifications" ON public.app_notifications
    FOR INSERT WITH CHECK (true);

-- Política para que los usuarios puedan marcar como leídas
CREATE POLICY "Users can update notifications" ON public.app_notifications
    FOR UPDATE USING (auth.role() = 'authenticated');

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at
CREATE TRIGGER update_app_notifications_updated_at 
    BEFORE UPDATE ON public.app_notifications 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
