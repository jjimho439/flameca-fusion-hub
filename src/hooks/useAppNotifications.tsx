import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

interface AppNotification {
  id: string;
  type: 'new_order' | 'out_of_stock' | 'low_stock' | 'incident' | 'payment_issue';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
}

export const useAppNotifications = () => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Función para reproducir sonido de notificación
  const playNotificationSound = useCallback(() => {
    if (isPlayingSound) return; // Evitar múltiples sonidos simultáneos
    
    setIsPlayingSound(true);
    
    // Crear un sonido de notificación simple
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Configurar el sonido (tono agudo y corto)
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
    
    // Resetear el flag después del sonido
    setTimeout(() => setIsPlayingSound(false), 300);
  }, [isPlayingSound]);

  // Función para agregar una nueva notificación
  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: AppNotification = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]); // Mantener solo las últimas 10
    setUnreadCount(prev => prev + 1);
    
    // Reproducir sonido
    playNotificationSound();
  }, [playNotificationSound]);

  // Función para marcar notificaciones como leídas
  const markAsRead = useCallback((notificationId?: string) => {
    if (notificationId) {
      setNotifications(prev => 
        prev.map(notif => 
          notif.id === notificationId ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } else {
      // Marcar todas como leídas
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
    }
  }, []);

  // Función para limpiar notificaciones antiguas
  const clearOldNotifications = useCallback(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    setNotifications(prev => prev.filter(notif => notif.timestamp > oneHourAgo));
  }, []);

  // Limpiar notificaciones antiguas cada hora
  useEffect(() => {
    const interval = setInterval(clearOldNotifications, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clearOldNotifications]);

  // Función para simular notificaciones (para testing)
  const simulateNotification = useCallback((type: AppNotification['type']) => {
    const notificationTemplates = {
      new_order: {
        title: "🛍️ Nuevo Pedido",
        message: "Se ha recibido un nuevo pedido desde WooCommerce"
      },
      out_of_stock: {
        title: "🚨 Stock Agotado",
        message: "Algunos productos se han agotado completamente"
      },
      low_stock: {
        title: "⚠️ Stock Bajo",
        message: "Algunos productos tienen stock bajo"
      },
      incident: {
        title: "📋 Nueva Incidencia",
        message: "Se ha reportado una nueva incidencia"
      },
      payment_issue: {
        title: "💳 Problema de Pago",
        message: "Se ha detectado un problema con un pago"
      }
    };

    const template = notificationTemplates[type];
    addNotification({
      type,
      title: template.title,
      message: template.message
    });
  }, [addNotification]);

  return {
    notifications,
    unreadCount,
    addNotification,
    markAsRead,
    clearOldNotifications,
    simulateNotification,
    playNotificationSound
  };
};
