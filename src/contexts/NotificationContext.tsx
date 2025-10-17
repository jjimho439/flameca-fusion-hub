import React, { createContext, useContext, useState, useCallback, useEffect } from "react";

interface AppNotification {
  id: string;
  type: 'new_order' | 'out_of_stock' | 'low_stock' | 'incident' | 'payment_issue';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  section: 'orders' | 'products' | 'incidents' | 'pos' | 'general';
}

interface NotificationContextType {
  notifications: AppNotification[];
  unreadCount: number;
  sectionCounts: Record<string, number>;
  addNotification: (notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (notificationId?: string, section?: string) => void;
  clearOldNotifications: () => void;
  simulateNotification: (type: AppNotification['type']) => void;
  playNotificationSound: (type: AppNotification['type']) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [sectionCounts, setSectionCounts] = useState<Record<string, number>>({
    orders: 0,
    products: 0,
    incidents: 0,
    pos: 0,
    general: 0
  });
  const [isPlayingSound, setIsPlayingSound] = useState(false);

  // Función para reproducir sonidos distintos según el tipo
  const playNotificationSound = useCallback((type: AppNotification['type']) => {
    if (isPlayingSound) return;
    
    setIsPlayingSound(true);
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Sonidos distintos para cada tipo
    const soundConfigs = {
      new_order: {
        frequencies: [600, 800, 1000], // Sonido ascendente - nuevo pedido
        duration: 0.4
      },
      out_of_stock: {
        frequencies: [1000, 800, 600, 400], // Sonido descendente - urgencia
        duration: 0.6
      },
      low_stock: {
        frequencies: [800, 600, 800], // Sonido de advertencia
        duration: 0.5
      },
      incident: {
        frequencies: [400, 400, 400], // Sonido repetitivo - incidencia
        duration: 0.7
      },
      payment_issue: {
        frequencies: [1000, 500, 1000, 500], // Sonido de alerta - problema
        duration: 0.8
      }
    };
    
    const config = soundConfigs[type];
    
    // Crear el patrón de sonido
    config.frequencies.forEach((freq, index) => {
      const startTime = audioContext.currentTime + (index * 0.1);
      oscillator.frequency.setValueAtTime(freq, startTime);
    });
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + config.duration);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + config.duration);
    
    setTimeout(() => setIsPlayingSound(false), config.duration * 1000);
  }, [isPlayingSound]);

  // Función para agregar una nueva notificación
  const addNotification = useCallback((notification: Omit<AppNotification, 'id' | 'timestamp' | 'read'> & { id?: string }) => {
    const newNotification: AppNotification = {
      ...notification,
      id: notification.id || `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: notification.timestamp || new Date(),
      read: notification.read || false,
    };

    console.log('Agregando notificación:', newNotification);

    setNotifications(prev => [newNotification, ...prev.slice(0, 9)]);
    setUnreadCount(prev => prev + 1);
    
    // Actualizar contador por sección
    setSectionCounts(prev => {
      const newCounts = {
        ...prev,
        [notification.section]: prev[notification.section] + 1
      };
      console.log('Actualizando contadores de sección:', newCounts);
      return newCounts;
    });
    
    // Reproducir sonido específico
    playNotificationSound(notification.type);
  }, [playNotificationSound]);

  // Función para marcar notificaciones como leídas
  const markAsRead = useCallback((notificationId?: string, section?: string) => {
    if (notificationId) {
      const notification = notifications.find(n => n.id === notificationId);
      if (notification) {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === notificationId ? { ...notif, read: true } : notif
          )
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
        setSectionCounts(prev => ({
          ...prev,
          [notification.section]: Math.max(0, prev[notification.section] - 1)
        }));
      }
    } else if (section) {
      const sectionNotifications = notifications.filter(n => n.section === section && !n.read);
      setNotifications(prev => 
        prev.map(notif => 
          notif.section === section ? { ...notif, read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - sectionNotifications.length));
      setSectionCounts(prev => ({
        ...prev,
        [section]: 0
      }));
    } else {
      setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
      setUnreadCount(0);
      setSectionCounts({
        orders: 0,
        products: 0,
        incidents: 0,
        pos: 0,
        general: 0
      });
    }
  }, [notifications]);

  // Función para limpiar notificaciones antiguas
  const clearOldNotifications = useCallback(() => {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    setNotifications(prev => prev.filter(notif => notif.timestamp > oneHourAgo));
  }, []);

  // Función para simular notificaciones
  const simulateNotification = useCallback((type: AppNotification['type']) => {
    const notificationTemplates = {
      new_order: {
        title: "🛍️ Nuevo Pedido",
        message: "Se ha recibido un nuevo pedido desde WooCommerce",
        section: 'orders' as const
      },
      out_of_stock: {
        title: "🚨 Stock Agotado",
        message: "Algunos productos se han agotado completamente",
        section: 'products' as const
      },
      low_stock: {
        title: "⚠️ Stock Bajo",
        message: "Algunos productos tienen stock bajo",
        section: 'products' as const
      },
      incident: {
        title: "📋 Nueva Incidencia",
        message: "Se ha reportado una nueva incidencia",
        section: 'incidents' as const
      },
      payment_issue: {
        title: "💳 Problema de Pago",
        message: "Se ha detectado un problema con un pago",
        section: 'pos' as const
      }
    };

    const template = notificationTemplates[type];
    console.log('Simulando notificación:', { type, template });
    addNotification({
      type,
      title: template.title,
      message: template.message,
      section: template.section
    });
  }, [addNotification]);

  // Limpiar notificaciones antiguas cada hora
  useEffect(() => {
    const interval = setInterval(clearOldNotifications, 60 * 60 * 1000);
    return () => clearInterval(interval);
  }, [clearOldNotifications]);


  const value: NotificationContextType = {
    notifications,
    unreadCount,
    sectionCounts,
    addNotification,
    markAsRead,
    clearOldNotifications,
    simulateNotification,
    playNotificationSound
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
