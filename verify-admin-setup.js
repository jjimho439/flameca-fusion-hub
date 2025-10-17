import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAdminSetup() {
  try {
    console.log('🔍 Verificando configuración de admin...');

    const userId = '40661fc2-a686-4426-9366-c4c837949d60';

    // Verificar perfil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('❌ Error buscando perfil:', profileError);
    } else {
      console.log('✅ Perfil encontrado:', profile);
    }

    // Verificar rol
    const { data: role, error: roleError } = await supabase
      .from('user_roles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (roleError) {
      console.error('❌ Error buscando rol:', roleError);
    } else {
      console.log('✅ Rol encontrado:', role);
    }

    // Verificar configuración de notificaciones
    const { data: settings, error: settingsError } = await supabase
      .from('notification_settings')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (settingsError) {
      console.error('❌ Error buscando configuración:', settingsError);
      
      // Crear configuración si no existe
      console.log('🔧 Creando configuración de notificaciones...');
      const { error: insertError } = await supabase
        .from('notification_settings')
        .insert({
          user_id: userId,
          email_notifications: true,
          sms_notifications: true,
          whatsapp_notifications: true,
          phone_number: '+34600000000',
          created_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('❌ Error creando configuración:', insertError);
      } else {
        console.log('✅ Configuración de notificaciones creada');
      }
    } else {
      console.log('✅ Configuración encontrada:', settings);
    }

    console.log('🎉 Verificación completada!');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

verifyAdminSetup();
