import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testWooCommerceConnection() {
  try {
    console.log('🧪 Probando conexión con WooCommerce...');
    console.log('');

    // Probar la función sync-woocommerce-products
    const response = await fetch('http://localhost:54321/functions/v1/sync-woocommerce-products', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'list',
        params: {
          page: 1,
          per_page: 5
        }
      })
    });

    const result = await response.json();
    
    if (response.ok) {
      console.log('✅ Conexión exitosa con WooCommerce');
      console.log('📦 Productos encontrados:', result.data?.length || 0);
      if (result.data && result.data.length > 0) {
        console.log('🔍 Primer producto:', result.data[0].name);
      }
    } else {
      console.log('❌ Error en la conexión:');
      console.log('📋 Status:', response.status);
      console.log('📋 Error:', result.error);
      console.log('📋 Detalles:', result.details);
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

testWooCommerceConnection();
