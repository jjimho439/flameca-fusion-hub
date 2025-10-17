import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface DatabaseNotification {
  id: string;
  type: 'new_order' | 'out_of_stock' | 'low_stock' | 'incident' | 'payment_issue';
  title: string;
  message: string;
  section: 'orders' | 'products' | 'incidents' | 'pos' | 'general';
  source: string;
  data: any;
  read: boolean;
  created_at: string;
}

export const useDatabaseNotifications = () => {
  const [notifications, setNotifications] = useState<DatabaseNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar notificaciones desde la base de datos
  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('app_notifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error cargando notificaciones:', error);
        setError(error.message);
        return;
      }

      setNotifications(data || []);
      setError(null);
    } catch (err) {
      console.error('Error inesperado cargando notificaciones:', err);
      setError('Error inesperado');
    } finally {
      setLoading(false);
    }
  }, []);

  // Marcar notificación como leída
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('app_notifications')
        .update({ read: true })
        .eq('id', notificationId);

      if (error) {
        console.error('Error marcando notificación como leída:', error);
        return;
      }

      // Actualizar estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error('Error inesperado marcando notificación:', err);
    }
  }, []);

  // Marcar todas las notificaciones de una sección como leídas
  const markSectionAsRead = useCallback(async (section: string) => {
    try {
      const { error } = await supabase
        .from('app_notifications')
        .update({ read: true })
        .eq('section', section)
        .eq('read', false);

      if (error) {
        console.error('Error marcando sección como leída:', error);
        return;
      }

      // Actualizar estado local
      setNotifications(prev => 
        prev.map(notif => 
          notif.section === section ? { ...notif, read: true } : notif
        )
      );
    } catch (err) {
      console.error('Error inesperado marcando sección:', err);
    }
  }, []);

  // Calcular contadores por sección
  const sectionCounts = notifications.reduce((acc, notif) => {
    if (!notif.read) {
      acc[notif.section] = (acc[notif.section] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  // Contador total de no leídas
  const unreadCount = notifications.filter(n => !n.read).length;

  // Cargar notificaciones al montar el componente
  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    const channel = supabase
      .channel('app_notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'app_notifications'
        },
        (payload) => {
          console.log('Nueva notificación recibida:', payload.new);
          const newNotification = payload.new as DatabaseNotification;
          setNotifications(prev => [newNotification, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    notifications,
    sectionCounts,
    unreadCount,
    loading,
    error,
    loadNotifications,
    markAsRead,
    markSectionAsRead
  };
};
