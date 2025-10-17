import { useEffect } from "react";
import { useNotificationContext } from "@/contexts/NotificationContext";

export const useNotificationEvents = () => {
  const { addNotification } = useNotificationContext();

  useEffect(() => {
    // Función para manejar nuevos pedidos
    const handleNewOrder = (event: CustomEvent) => {
      const { order_id, customer_name, total_amount, items } = event.detail;
      
      addNotification({
        type: 'new_order',
        title: '🛍️ Nuevo Pedido',
        message: `Pedido #${order_id} de ${customer_name} por ${total_amount}€`,
        section: 'orders'
      });
    };

    // Función para manejar stock agotado
    const handleOutOfStock = (event: CustomEvent) => {
      const { products } = event.detail;
      
      addNotification({
        type: 'out_of_stock',
        title: '🚨 Stock Agotado',
        message: `${products.length} producto(s) se han agotado`,
        section: 'products'
      });
    };

    // Función para manejar stock bajo
    const handleLowStock = (event: CustomEvent) => {
      const { products } = event.detail;
      
      addNotification({
        type: 'low_stock',
        title: '⚠️ Stock Bajo',
        message: `${products.length} producto(s) tienen stock bajo`,
        section: 'products'
      });
    };

    // Función para manejar nuevas incidencias
    const handleNewIncident = (event: CustomEvent) => {
      const { incident_title, incident_type, priority } = event.detail;
      
      addNotification({
        type: 'incident',
        title: '📋 Nueva Incidencia',
        message: `${incident_type}: ${incident_title}`,
        section: 'incidents'
      });
    };

    // Función para manejar problemas de pago
    const handlePaymentIssue = (event: CustomEvent) => {
      const { order_id, issue_type, amount } = event.detail;
      
      addNotification({
        type: 'payment_issue',
        title: '💳 Problema de Pago',
        message: `Pedido #${order_id}: ${issue_type} (${amount}€)`,
        section: 'pos'
      });
    };

    // Registrar listeners para eventos personalizados
    window.addEventListener('newOrder', handleNewOrder as EventListener);
    window.addEventListener('outOfStock', handleOutOfStock as EventListener);
    window.addEventListener('lowStock', handleLowStock as EventListener);
    window.addEventListener('newIncident', handleNewIncident as EventListener);
    window.addEventListener('paymentIssue', handlePaymentIssue as EventListener);

    // Cleanup
    return () => {
      window.removeEventListener('newOrder', handleNewOrder as EventListener);
      window.removeEventListener('outOfStock', handleOutOfStock as EventListener);
      window.removeEventListener('lowStock', handleLowStock as EventListener);
      window.removeEventListener('newIncident', handleNewIncident as EventListener);
      window.removeEventListener('paymentIssue', handlePaymentIssue as EventListener);
    };
  }, [addNotification]);
};
