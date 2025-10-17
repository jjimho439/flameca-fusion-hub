import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkNotifications() {
  try {
    console.log('🔍 Verificando notificaciones en la base de datos...');

    const { data: notifications, error } = await supabase
      .from('app_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error obteniendo notificaciones:', error);
      return;
    }

    if (notifications && notifications.length > 0) {
      console.log(`✅ Se encontraron ${notifications.length} notificaciones:`);
      notifications.forEach((notif, index) => {
        console.log(`${index + 1}. [${notif.type}] ${notif.title}`);
        console.log(`   Mensaje: ${notif.message}`);
        console.log(`   Sección: ${notif.section}`);
        console.log(`   Fuente: ${notif.source}`);
        console.log(`   Fecha: ${notif.created_at}`);
        console.log(`   Leída: ${notif.read ? 'Sí' : 'No'}`);
        console.log('---');
      });
    } else {
      console.log('❌ No se encontraron notificaciones en la base de datos');
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

checkNotifications();
