// Script para simular un pedido real y verificar notificaciones
const SUPABASE_URL = 'http://localhost:54321';

async function simulateRealOrder() {
  try {
    console.log('🧪 Simulando pedido real...');
    
    // Simular un pedido real
    const orderData = {
      id: 'real-order-' + Date.now(),
      status: 'processing',
      date_created: new Date().toISOString(),
      billing: {
        first_name: 'Ana',
        last_name: 'Martín',
        email: 'ana.martin@email.com',
        phone: '+34698765432'
      },
      total: '125.50',
      customer_note: 'Entregar en horario de tarde',
      line_items: [
        {
          id: 1,
          name: 'Vestido Flamenco Negro Premium',
          quantity: 1,
          price: '125.50'
        }
      ]
    };

    // Llamar directamente a auto-notify
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auto-notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'
      },
      body: JSON.stringify({
        type: 'new_order',
        data: orderData,
        title: '🛍️ Nuevo Pedido WooCommerce',
        message: `Pedido #${orderData.id} de ${orderData.billing.first_name} ${orderData.billing.last_name} - Total: €${orderData.total}`,
        section: 'orders',
        source: 'woocommerce'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Notificación enviada correctamente:', result);
    } else {
      console.log('❌ Error enviando notificación:', result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

async function simulateStockAlert() {
  try {
    console.log('\n🧪 Simulando alerta de stock...');
    
    // Simular un producto con stock agotado
    const productData = {
      id: 'product-' + Date.now(),
      name: 'Vestido Flamenco Rojo Premium',
      stock_quantity: 0,
      price: '156.99',
      sku: 'VEST-ROJO-PREMIUM-001',
      description: 'Vestido flamenco rojo de alta calidad',
      categories: [
        { name: 'Vestidos Premium' }
      ]
    };

    // Llamar directamente a auto-notify
    const response = await fetch(`${SUPABASE_URL}/functions/v1/auto-notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz'
      },
      body: JSON.stringify({
        type: 'out_of_stock',
        data: productData,
        title: '🚨 Stock Agotado',
        message: `Producto "${productData.name}" se ha agotado`,
        section: 'products',
        source: 'woocommerce'
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Notificación de stock enviada correctamente:', result);
    } else {
      console.log('❌ Error enviando notificación de stock:', result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error:', error);
    return null;
  }
}

async function runSimulation() {
  console.log('🚀 Simulando notificaciones reales...\n');
  
  // Simular pedido
  await simulateRealOrder();
  
  // Esperar un poco
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simular alerta de stock
  await simulateStockAlert();
  
  console.log('\n🎉 Simulación completada!');
  console.log('\n📱 Verifica en la aplicación:');
  console.log('1. Abre http://localhost:8080');
  console.log('2. Deberías ver notificaciones en el sidebar');
  console.log('3. Escucha los sonidos distintos para cada tipo');
  console.log('4. Verifica las marquitas en las secciones');
}

// Ejecutar la simulación
runSimulation().catch(console.error);
