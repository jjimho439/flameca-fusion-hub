import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAdminRole() {
  try {
    console.log('🔍 Verificando rol de admin...');

    // Buscar usuario admin
    const { data: users, error } = await supabase
      .from('user_roles')
      .select('*')
      .eq('email', 'admin@flamenca.com');

    if (error) {
      console.error('❌ Error buscando usuario:', error);
      return;
    }

    if (users && users.length > 0) {
      console.log('✅ Usuario admin encontrado:', users[0]);
    } else {
      console.log('❌ Usuario admin no encontrado, creándolo...');
      
      // Crear rol de admin
      const { error: insertError } = await supabase
        .from('user_roles')
        .insert({
          user_id: '559158d3-df68-4cf0-8632-d9efc7949747',
          email: 'admin@flamenca.com',
          role: 'admin',
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Error creando rol:', insertError);
        return;
      }

      console.log('✅ Rol de admin creado');
    }

    // Verificar configuración de notificaciones
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', '559158d3-df68-4cf0-8632-d9efc7949747');

    if (settingsError) {
      console.error('❌ Error buscando configuración:', settingsError);
      return;
    }

    if (settings && settings.length > 0) {
      console.log('✅ Configuración de notificaciones encontrada:', settings[0]);
    } else {
      console.log('❌ Configuración no encontrada, creándola...');
      
      const { error: insertSettingsError } = await supabase
        .from('notification_settings')
        .insert({
          user_id: '559158d3-df68-4cf0-8632-d9efc7949747',
          email_notifications: true,
          sms_notifications: true,
          whatsapp_notifications: true,
          phone_number: '+34600000000',
          created_at: new Date().toISOString()
        });

      if (insertSettingsError) {
        console.error('❌ Error creando configuración:', insertSettingsError);
        return;
      }

      console.log('✅ Configuración de notificaciones creada');
    }

    console.log('🎉 Usuario admin configurado correctamente!');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

checkAdminRole();
