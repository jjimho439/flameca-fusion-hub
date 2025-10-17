// Script para probar la conexión del frontend a Supabase
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('🔍 Probando conexión del frontend a Supabase...');
  
  try {
    // Probar conexión básica
    const { data, error } = await supabase
      .from('app_notifications')
      .select('*')
      .eq('source', 'woocommerce')
      .eq('read', false)
      .limit(5);

    if (error) {
      console.error('❌ Error en la consulta:', error);
      return;
    }

    console.log('✅ Conexión exitosa!');
    console.log(`📊 Encontradas ${data.length} notificaciones no leídas:`);
    
    data.forEach((notif, index) => {
      console.log(`${index + 1}. [${notif.type}] ${notif.title}`);
      console.log(`   Mensaje: ${notif.message}`);
      console.log(`   Sección: ${notif.section}`);
      console.log(`   Fecha: ${notif.created_at}`);
      console.log('---');
    });

  } catch (err) {
    console.error('❌ Error de conexión:', err);
  }
}

testConnection();
