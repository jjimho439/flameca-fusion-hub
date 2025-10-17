import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabaseUrl = 'http://localhost:54321';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImV4cCI6MTk4MzgxMjk5Nn0.EGIM96RAZx35lJzdJsyH-qQwv8Hdp7fsn3W0YpN81IU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  try {
    console.log('🔐 Creando usuario admin...');

    // Crear usuario en auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: 'admin@flamenca.com',
      password: 'admin123',
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Error creando usuario auth:', authError);
      return;
    }

    console.log('✅ Usuario auth creado:', authData.user.id);

    // Crear perfil de usuario
    const { error: profileError } = await supabase
      .from('user_roles')
      .insert({
        user_id: authData.user.id,
        email: 'admin@flamenca.com',
        role: 'admin',
        created_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('❌ Error creando perfil:', profileError);
      return;
    }

    console.log('✅ Perfil de usuario creado');

    // Crear configuración de notificaciones
    const { error: settingsError } = await supabase
      .from('notification_settings')
      .insert({
        user_id: authData.user.id,
        email_notifications: true,
        sms_notifications: true,
        whatsapp_notifications: true,
        phone_number: '+34600000000',
        created_at: new Date().toISOString()
      });

    if (settingsError) {
      console.error('❌ Error creando configuración:', settingsError);
      return;
    }

    console.log('✅ Configuración de notificaciones creada');

    console.log('🎉 Usuario admin creado exitosamente!');
    console.log('📧 Email: admin@flamenca.com');
    console.log('🔑 Password: admin123');

  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

createAdminUser();
