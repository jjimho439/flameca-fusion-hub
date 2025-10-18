import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Order {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  total_amount: number;
  status: string;
  payment_status: string;
  items?: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    sku?: string;
  }>;
  created_at: string;
}

export function useWooCommerceOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(false);

  const syncNewOrders = useCallback(async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('sync-woocommerce-orders', {
        body: { 
          action: 'sync_new_orders'
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Sincronizados ${data.synced_orders} pedidos nuevos. ${data.notifications_sent} notificaciones enviadas.`);
        return data;
      } else {
        throw new Error(data.message || 'Error desconocido');
      }
    } catch (err: any) {
      console.error('Error syncing orders:', err);
      toast.error('Error al sincronizar pedidos: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const syncSingleOrder = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase.functions.invoke('sync-woocommerce-orders', {
        body: { 
          action: 'sync_single_order',
          orderId: orderId
        }
      });

      if (error) throw error;

      if (data.success) {
        toast.success(`Pedido ${orderId} sincronizado correctamente`);
        return data;
      } else {
        throw new Error(data.message || 'Error desconocido');
      }
    } catch (err: any) {
      console.error('Error syncing single order:', err);
      toast.error('Error al sincronizar pedido: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (
            id,
            name,
            quantity,
            unit_price,
            subtotal
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapear los datos para incluir items en el formato esperado
      const ordersWithItems = (data || []).map(order => ({
        ...order,
        items: order.order_items || []
      }));
      
      setOrders(ordersWithItems);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Error al cargar pedidos');
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    orders,
    loading,
    fetchOrders,
    syncNewOrders,
    syncSingleOrder
  };
}
