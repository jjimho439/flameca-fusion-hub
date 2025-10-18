import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Función para mapear estados de WooCommerce a nuestros estados locales simplificados
function mapWooCommerceStatus(wooStatus: string): string {
  switch (wooStatus) {
    case 'pending':
      return 'pending';
    case 'processing':
      return 'pending';
    case 'completed':
      return 'pending'; // Los pedidos de WooCommerce llegan como pending, se completan al facturar
    case 'cancelled':
      return 'pending'; // Tratamos cancelados como pending
    case 'refunded':
      return 'pending'; // Tratamos reembolsados como pending
    default:
      return 'pending';
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
    const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');
    const storeUrl = Deno.env.get('WOOCOMMERCE_STORE_URL');

    if (!consumerKey || !consumerSecret || !storeUrl) {
      console.error('Missing WooCommerce credentials');
      throw new Error('WooCommerce credentials not configured');
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { action, orderId, limit } = await req.json();

    if (action === 'get_recent_orders') {
      // Obtener pedidos recientes para polling
      const limitCount = limit || 5;
      const woocommerceUrl = `${storeUrl}/wp-json/wc/v3/orders?status=processing,completed&per_page=${limitCount}&orderby=date&order=desc`;
      
      console.log('Getting recent orders from WooCommerce:', woocommerceUrl);
      
      const response = await fetch(woocommerceUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`,
          'User-Agent': 'Flamenca-Store/1.0',
        },
        keepalive: false
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('WooCommerce API error:', response.status, errorText);
        throw new Error(`WooCommerce API error: ${response.status}`);
      }

      const orders = await response.json();
      console.log(`Found ${orders.length} recent orders`);

      return new Response(
        JSON.stringify({
          success: true,
          orders: orders,
          count: orders.length
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );

    } else if (action === 'sync_new_orders') {
      // Obtener pedidos recientes de WooCommerce (últimas 24 horas)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const afterDate = yesterday.toISOString();

      const woocommerceUrl = `${storeUrl}/wp-json/wc/v3/orders?after=${afterDate}&status=processing,completed&per_page=50`;
      
      console.log('Calling WooCommerce:', woocommerceUrl);
      
      const response = await fetch(woocommerceUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
      }

      const orders = await response.json();
      console.log(`Found ${orders.length} recent orders from WooCommerce`);

      let syncedCount = 0;
      let notificationCount = 0;

      for (const order of orders) {
        // Verificar si el pedido ya existe
        const { data: existingOrder, error: checkError } = await supabaseAdmin
          .from('orders')
          .select('id')
          .eq('woocommerce_order_id', order.id.toString())
          .maybeSingle();

        if (checkError) {
          console.log(`Error checking order ${order.id}:`, checkError);
        }

        if (existingOrder) {
          console.log(`Order ${order.id} already exists, skipping`);
          continue;
        }

        console.log(`Creating new order ${order.id}`);

        // Crear el pedido en nuestra base de datos
        const orderData = {
          woocommerce_order_id: order.id.toString(),
          customer_name: `${order.billing.first_name} ${order.billing.last_name}`.trim(),
          customer_phone: order.billing.phone || 'No proporcionado',
          customer_email: order.billing.email,
          total_amount: parseFloat(order.total),
          status: mapWooCommerceStatus(order.status),
          payment_method: 'Web',
          payment_status: order.status === 'completed' ? 'paid' : 'unpaid',
          notes: order.customer_note || `Pedido WooCommerce #${order.id}`,
          delivery_date: order.date_created ? new Date(order.date_created).toISOString().split('T')[0] : null,
        };

        console.log(`Order data for ${order.id}:`, orderData);

        const { data: newOrder, error: orderError } = await supabaseAdmin
          .from('orders')
          .insert(orderData)
          .select()
          .single();

        if (orderError) {
          console.error(`Error creating order ${order.id}:`, orderError);
          continue;
        }

        console.log(`Order ${order.id} created successfully:`, newOrder);

        // Crear los items del pedido
        for (const item of order.line_items) {
          const itemData = {
            order_id: newOrder.id,
            product_id: null, // No tenemos productos locales, solo referencias a WooCommerce
            name: item.name, // ¡Agregar el nombre del producto!
            quantity: item.quantity,
            unit_price: parseFloat(item.price),
            subtotal: parseFloat(item.total),
          };

          const { error: itemError } = await supabaseAdmin
            .from('order_items')
            .insert(itemData);

          if (itemError) {
            console.error(`Error creating order item for order ${order.id}:`, itemError);
          }
        }

        syncedCount++;
        console.log(`Order ${order.id} synced successfully`);

        // Enviar notificación de nuevo pedido
        try {
          const notificationData = {
            order_id: order.id.toString(),
            customer_name: orderData.customer_name,
            total_amount: orderData.total_amount,
            items: order.line_items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity
            }))
          };

          const { data: notificationResult, error: notificationError } = await supabaseAdmin.functions.invoke('auto-notify', {
            body: {
              type: 'new_order',
              data: notificationData,
            },
          });

          if (!notificationError) {
            notificationCount++;
            console.log(`Notification sent for order ${order.id}`);
          } else {
            console.error(`Error sending notification for order ${order.id}:`, notificationError);
          }
        } catch (notificationError) {
          console.error(`Exception sending notification for order ${order.id}:`, notificationError);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: `Synchronized ${syncedCount} new orders and sent ${notificationCount} notifications`,
          synced_orders: syncedCount,
          notifications_sent: notificationCount,
          total_woocommerce_orders: orders.length
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (action === 'sync_single_order' && orderId) {
      // Sincronizar un pedido específico
      const woocommerceUrl = `${storeUrl}/wp-json/wc/v3/orders/${orderId}`;
      
      console.log('Calling WooCommerce for single order:', woocommerceUrl);
      
      const response = await fetch(woocommerceUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${btoa(`${consumerKey}:${consumerSecret}`)}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`WooCommerce API error: ${response.status} ${response.statusText}`);
      }

      const order = await response.json();
      
      // Verificar si el pedido ya existe
      const { data: existingOrder, error: checkError } = await supabaseAdmin
        .from('orders')
        .select('id')
        .eq('woocommerce_order_id', order.id.toString())
        .maybeSingle();

      if (existingOrder) {
        return new Response(
          JSON.stringify({
            success: false,
            message: `Order ${order.id} already exists`,
            order_id: order.id
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }

      // Crear el pedido (mismo código que arriba)
      const orderData = {
        woocommerce_order_id: order.id.toString(),
        customer_name: `${order.billing.first_name} ${order.billing.last_name}`.trim(),
        customer_phone: order.billing.phone || 'No proporcionado',
        customer_email: order.billing.email,
        total_amount: parseFloat(order.total),
        status: mapWooCommerceStatus(order.status),
        payment_method: 'Web',
        payment_status: order.status === 'completed' ? 'paid' : 'unpaid',
        notes: order.customer_note || `Pedido WooCommerce #${order.id}`,
        delivery_date: order.date_created ? new Date(order.date_created).toISOString().split('T')[0] : null,
      };

      const { data: newOrder, error: orderError } = await supabaseAdmin
        .from('orders')
        .insert(orderData)
        .select()
        .single();

      if (orderError) {
        throw new Error(`Error creating order: ${orderError.message}`);
      }

      // Crear los items del pedido
      for (const item of order.line_items) {
        const itemData = {
          order_id: newOrder.id,
          product_id: null,
          name: item.name, // ¡Agregar el nombre del producto!
          quantity: item.quantity,
          unit_price: parseFloat(item.price),
          subtotal: parseFloat(item.total),
        };

        const { error: itemError } = await supabaseAdmin
          .from('order_items')
          .insert(itemData);

        if (itemError) {
          console.error(`Error creating order item:`, itemError);
        }
      }

      // Enviar notificación
      const notificationData = {
        order_id: order.id.toString(),
        customer_name: orderData.customer_name,
        total_amount: orderData.total_amount,
        items: order.line_items.map((item: any) => ({
          name: item.name,
          quantity: item.quantity
        }))
      };

      const { data: notificationResult, error: notificationError } = await supabaseAdmin.functions.invoke('auto-notify', {
        body: {
          type: 'new_order',
          data: notificationData,
        },
      });

      return new Response(
        JSON.stringify({
          success: true,
          message: `Order ${order.id} synchronized successfully`,
          order: newOrder,
          notification_sent: !notificationError
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action. Use sync_new_orders or sync_single_order' }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error: any) {
    console.error('Error in sync-woocommerce-orders:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});