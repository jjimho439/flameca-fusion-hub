-- Agregar columna user_id a app_notifications
ALTER TABLE public.app_notifications 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Crear índice para user_id
CREATE INDEX IF NOT EXISTS idx_app_notifications_user_id ON public.app_notifications(user_id);

-- Actualizar las políticas RLS
DROP POLICY IF EXISTS "Users can read all notifications" ON public.app_notifications;
DROP POLICY IF EXISTS "Users can update notifications" ON public.app_notifications;

-- Nueva política para que los usuarios solo puedan leer sus propias notificaciones
CREATE POLICY "Users can read their own notifications" ON public.app_notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Nueva política para que los usuarios puedan marcar como leídas sus propias notificaciones
CREATE POLICY "Users can update their own notifications" ON public.app_notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- Política para que los admins puedan leer todas las notificaciones
CREATE POLICY "Admins can read all notifications" ON public.app_notifications
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );

-- Política para que los admins puedan actualizar todas las notificaciones
CREATE POLICY "Admins can update all notifications" ON public.app_notifications
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM public.user_roles 
            WHERE user_id = auth.uid() AND role = 'admin'
        )
    );
