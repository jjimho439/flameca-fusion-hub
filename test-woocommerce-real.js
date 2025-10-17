// Script para probar webhook con el formato real de WooCommerce
const NGROK_URL = 'https://aidyn-nephelinitic-unsensuously.ngrok-free.dev';

// Simular exactamente lo que WooCommerce envía (form-urlencoded)
const formData = new URLSearchParams();
formData.append('webhook_id', '1');
formData.append('data', JSON.stringify({
  id: 99999,
  status: 'processing',
  date_created: new Date().toISOString(),
  billing: {
    first_name: 'María',
    last_name: 'González',
    email: 'maria.gonzalez@email.com',
    phone: '+34612345678'
  },
  total: '89.99',
  customer_note: 'Entregar por la mañana',
  line_items: [
    {
      id: 1,
      name: 'Vestido Flamenco Rojo',
      quantity: 1,
      price: '89.99'
    }
  ]
}));

async function testRealWooCommerceWebhook() {
  try {
    console.log('🧪 Probando webhook con formato real de WooCommerce...');
    console.log('📦 Form data:', formData.toString());
    
    const response = await fetch(`${NGROK_URL}/functions/v1/webhook-woocommerce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-WC-Webhook-Event': 'flamenca_sync'
      },
      body: formData.toString()
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook procesado correctamente:', result);
    } else {
      console.log('❌ Error en webhook:', result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error enviando webhook:', error);
    return null;
  }
}

// También probar con solo webhook_id (como en los logs)
async function testSimpleWebhook() {
  try {
    console.log('\n🧪 Probando webhook simple (solo webhook_id)...');
    
    const response = await fetch(`${NGROK_URL}/functions/v1/webhook-woocommerce`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-WC-Webhook-Event': 'flamenca_sync'
      },
      body: 'webhook_id=1'
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Webhook simple procesado correctamente:', result);
    } else {
      console.log('❌ Error en webhook simple:', result);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error enviando webhook simple:', error);
    return null;
  }
}

async function runRealTests() {
  console.log('🚀 Iniciando pruebas con formato real de WooCommerce...');
  console.log(`🌐 URL pública: ${NGROK_URL}`);
  console.log(`🔗 Webhook URL: ${NGROK_URL}/functions/v1/webhook-woocommerce\n`);
  
  // Esperar un poco para que las Edge Functions estén listas
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Probar webhook con formato real
  await testRealWooCommerceWebhook();
  
  // Esperar un poco entre pruebas
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Probar webhook simple
  await testSimpleWebhook();
  
  console.log('\n🎉 Pruebas completadas!');
  console.log('\n📋 Si las pruebas funcionan, el problema puede ser:');
  console.log('1. El webhook en WooCommerce no está configurado correctamente');
  console.log('2. WooCommerce no está enviando los datos al webhook');
  console.log('3. El evento no está disparando el webhook');
  console.log('\n📱 Verifica en la aplicación:');
  console.log('1. Abre http://localhost:8080');
  console.log('2. Deberías ver notificaciones en el sidebar');
  console.log('3. Escucha los sonidos distintos para cada tipo');
}

// Ejecutar las pruebas
runRealTests().catch(console.error);
