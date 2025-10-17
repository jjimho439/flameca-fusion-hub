import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createNotificationSettings() {
  try {
    console.log('🔧 Creando configuración de notificaciones...');

    const userId = '40661fc2-a686-4426-9366-c4c837949d60';

    // Crear configuración de notificaciones con las columnas correctas
    const { error: insertError } = await supabase
      .from('notification_settings')
      .insert({
        user_id: userId,
        sms_enabled: true,
        whatsapp_enabled: true,
        email_enabled: true,
        push_enabled: true,
        sms_phone: '+34600000000',
        whatsapp_phone: '+34600000000',
        email_address: 'admin@flamenca.com',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('❌ Error creando configuración:', insertError);
      return;
    }

    console.log('✅ Configuración de notificaciones creada correctamente');

    // Verificar que se creó
    const { data: settings, error: selectError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (selectError) {
      console.error('❌ Error verificando configuración:', selectError);
    } else {
      console.log('✅ Configuración verificada:', settings);
    }

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

createNotificationSettings();
