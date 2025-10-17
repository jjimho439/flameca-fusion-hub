import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestOrder() {
  try {
    console.log('🛍️ Creando pedido de prueba para la interfaz web...');
    
    const orderId = uuidv4();
    const orderItemId = uuidv4();
    
    // Crear el pedido
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        customer_name: 'María García López',
        customer_phone: '666123456',
        customer_email: 'maria.garcia@email.com',
        total_amount: 299.99,
        status: 'delivered',
        payment_method: 'Tarjeta de crédito',
        payment_status: 'paid',
        notes: 'Pedido de prueba para facturación web - Traje flamenca premium',
        delivery_date: new Date().toISOString().split('T')[0]
      })
      .select()
      .single();

    if (orderError) {
      console.error('❌ Error creando pedido:', orderError);
      return;
    }

    console.log('✅ Pedido creado:', order.id);

    // Crear los items del pedido
    const { error: itemError } = await supabase
      .from('order_items')
      .insert({
        id: orderItemId,
        order_id: orderId,
        product_id: null, // No tenemos productos locales
        quantity: 1,
        unit_price: 299.99,
        subtotal: 299.99
      });

    if (itemError) {
      console.error('❌ Error creando item:', itemError);
      return;
    }

    console.log('✅ Item creado para el pedido');

    console.log('\n🎯 PEDIDO LISTO PARA FACTURAR:');
    console.log(`📋 ID: ${order.id}`);
    console.log(`👤 Cliente: ${order.customer_name}`);
    console.log(`📧 Email: ${order.customer_email}`);
    console.log(`💰 Total: €${order.total_amount}`);
    console.log(`📱 Teléfono: ${order.customer_phone}`);
    console.log(`📝 Notas: ${order.notes}`);
    
    console.log('\n🌐 Ahora puedes ir a http://localhost:8082/ y crear una factura desde la interfaz web!');
    
  } catch (error) {
    console.error('❌ Error general:', error);
  }
}

createTestOrder();
