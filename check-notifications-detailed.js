// Script para verificar detalles de las notificaciones
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDetailed() {
  console.log('🔍 Verificando detalles de las notificaciones...');
  
  try {
    const { data, error } = await supabase
      .from('app_notifications')
      .select('*')
      .eq('source', 'woocommerce')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Error:', error);
      return;
    }

    console.log(`📊 Total de notificaciones: ${data.length}`);
    
    data.forEach((notif, index) => {
      console.log(`${index + 1}. ID: ${notif.id}`);
      console.log(`   Tipo: ${notif.type}`);
      console.log(`   Título: ${notif.title}`);
      console.log(`   User ID: ${notif.user_id || 'NULL'}`);
      console.log(`   Leída: ${notif.read}`);
      console.log(`   Fuente: ${notif.source}`);
      console.log('---');
    });

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

checkDetailed();
