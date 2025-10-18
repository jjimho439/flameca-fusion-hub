const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testRealtime() {
  console.log('🔍 Probando Supabase Realtime...');
  
  try {
    // Crear un canal de Realtime
    const channel = supabase
      .channel('test_channel')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'orders' 
        }, 
        (payload) => {
          console.log('✅ Cambio detectado en orders:', payload);
        }
      )
      .subscribe((status) => {
        console.log('📡 Estado de la suscripción:', status);
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime funcionando correctamente');
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Error en Realtime');
        }
      });

    // Esperar un poco para que se establezca la conexión
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('📝 Ahora realiza una venta desde el TPV para probar...');
    
    // Mantener el script corriendo
    setTimeout(() => {
      console.log('🛑 Cerrando conexión Realtime...');
      channel.unsubscribe();
      process.exit(0);
    }, 30000); // Cerrar después de 30 segundos
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testRealtime();
