import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupWooCommerceWebhook() {
  try {
    console.log('🔧 Configurando webhook de WooCommerce...');
    console.log('');

    // URL pública del webhook
    const webhookUrl = 'https://aidyn-nephelinitic-unsensuously.ngrok-free.dev/functions/v1/webhook-woocommerce';
    
    console.log('📋 INSTRUCCIONES PARA CONFIGURAR EL WEBHOOK:');
    console.log('');
    console.log('1. 🌐 Ve a tu panel de WordPress/WooCommerce');
    console.log('2. 📍 Navega a: WooCommerce → Configuración → Avanzado → Webhooks');
    console.log('3. ➕ Haz clic en "Añadir webhook"');
    console.log('');
    console.log('📝 CONFIGURACIÓN DEL WEBHOOK:');
    console.log('┌─────────────────────────────────────────────────────────────┐');
    console.log('│ Nombre: Flamenca Store Sync                                │');
    console.log('│ Estado: Activo                                            │');
    console.log('│ Evento: Pedido creado (o cualquier evento)                │');
    console.log('│ URL: ' + webhookUrl + ' │');
    console.log('│ Método: POST                                              │');
    console.log('│ Headers personalizados:                                   │');
    console.log('│   Clave: X-WC-Webhook-Event                               │');
    console.log('│   Valor: flamenca_sync                                    │');
    console.log('└─────────────────────────────────────────────────────────────┘');
    console.log('');
    console.log('4. 💾 Guarda el webhook');
    console.log('');
    console.log('🎯 EVENTOS QUE DISPARARÁN NOTIFICACIONES:');
    console.log('• 🛍️ Nuevo pedido → Notificación en "Encargos"');
    console.log('• 📦 Producto actualizado → Notificación en "Productos"');
    console.log('• 🚨 Stock agotado → Notificación en "Productos"');
    console.log('• ⚠️ Stock bajo → Notificación en "Productos"');
    console.log('');
    console.log('🧪 PARA PROBAR:');
    console.log('1. Crea un pedido en tu tienda WooCommerce');
    console.log('2. Actualiza el stock de un producto');
    console.log('3. Ve a la aplicación: http://localhost:8080');
    console.log('4. Deberías ver las notificaciones en tiempo real');
    console.log('');
    console.log('🔔 TIPOS DE NOTIFICACIONES:');
    console.log('• 🛍️ Nuevo Pedido: Sonido ascendente, badge en "Encargos"');
    console.log('• 🚨 Stock Agotado: Sonido descendente, badge en "Productos"');
    console.log('• ⚠️ Stock Bajo: Sonido de advertencia, badge en "Productos"');
    console.log('');
    console.log('📱 NOTIFICACIONES EXTERNAS:');
    console.log('• 📧 Email al administrador');
    console.log('• 📱 SMS al administrador');
    console.log('• 💬 WhatsApp al administrador');
    console.log('');
    console.log('✅ ¡Una vez configurado, las notificaciones serán automáticas!');

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

setupWooCommerceWebhook();
