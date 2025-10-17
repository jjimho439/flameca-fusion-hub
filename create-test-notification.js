// Script para crear una notificación de prueba
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'http://127.0.0.1:54321';
const supabaseKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestNotification() {
  console.log('🔔 Creando notificación de prueba...');
  
  try {
    // Primero, obtener el ID del usuario admin
    const { data: users, error: usersError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', 'admin@flamenca.com')
      .limit(1);

    if (usersError) {
      console.error('❌ Error obteniendo usuario:', usersError);
      return;
    }

    if (!users || users.length === 0) {
      console.error('❌ No se encontró el usuario admin');
      return;
    }

    const userId = users[0].id;
    console.log('👤 Usuario admin encontrado:', userId);

    // Crear notificación de prueba
    const { data, error } = await supabase
      .from('app_notifications')
      .insert({
        user_id: userId,
        type: 'new_order',
        title: '🛍️ Nuevo Pedido de Prueba',
        message: 'Pedido #999 de Cliente Prueba - Total: €99.99',
        section: 'orders',
        data: { order_id: 999 },
        source: 'woocommerce',
        read: false
      })
      .select();

    if (error) {
      console.error('❌ Error creando notificación:', error);
      return;
    }

    console.log('✅ Notificación creada:', data[0]);

  } catch (err) {
    console.error('❌ Error:', err);
  }
}

createTestNotification();
