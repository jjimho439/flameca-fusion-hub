import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AutoNotificationRequest {
  type: 'password_reset' | 'new_order' | 'low_stock' | 'critical_stock' | 'out_of_stock' | 'check_in' | 'check_out' | 'incident' | 'payment_issue';
  data: any;
  user_id?: string;
  title?: string;
  message?: string;
  section?: string;
  source?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    const { type, data, user_id, title, message, section, source }: AutoNotificationRequest = await req.json();

    console.log("Auto notification request:", { type, data, user_id });

    // Obtener configuración de notificaciones del admin
    const { data: adminSettings, error: settingsError } = await supabaseAdmin
      .from("notification_settings")
      .select("*")
      .eq("user_id", (await getAdminUserId(supabaseAdmin)))
      .single();

    if (settingsError) {
      console.error("Error fetching admin settings:", settingsError);
      return new Response(
        JSON.stringify({ error: "Admin settings not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    let notificationSent = false;

    switch (type) {
      case 'password_reset':
        notificationSent = await handlePasswordReset(supabaseAdmin, data, adminSettings);
        break;
      
      case 'new_order':
        notificationSent = await handleNewOrder(supabaseAdmin, data, adminSettings);
        break;
      
      case 'low_stock':
        notificationSent = await handleLowStock(supabaseAdmin, data, adminSettings);
        break;
      
      case 'critical_stock':
        notificationSent = await handleCriticalStock(supabaseAdmin, data, adminSettings);
        break;
      
      case 'out_of_stock':
        notificationSent = await handleOutOfStock(supabaseAdmin, data, adminSettings);
        break;
      
      case 'check_in':
      case 'check_out':
        notificationSent = await handleCheckInOut(supabaseAdmin, data, adminSettings, type);
        break;
      
      case 'incident':
        notificationSent = await handleIncident(supabaseAdmin, data, adminSettings);
        break;
      
      case 'payment_issue':
        notificationSent = await handlePaymentIssue(supabaseAdmin, data, adminSettings);
        break;
      
      default:
        return new Response(
          JSON.stringify({ error: "Unknown notification type" }),
          {
            status: 400,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
    }

    // Si es una notificación de WooCommerce, también enviar notificación in-app
    if (source === 'woocommerce' && title && message && section) {
      try {
        // Disparar evento personalizado para notificación in-app
        const event = new CustomEvent('woocommerceNotification', {
          detail: {
            type,
            title,
            message,
            section,
            data
          }
        });
        
        // En un entorno real, esto se manejaría a través de WebSockets o similar
        console.log('WooCommerce notification event:', { type, title, message, section });
      } catch (error) {
        console.error('Error creating WooCommerce notification event:', error);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Auto notification processed",
        sent: notificationSent,
        source: source || 'internal'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in auto-notify function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});

// Helper function to get admin user ID
async function getAdminUserId(supabaseAdmin: any): Promise<string> {
  const { data: adminRole, error } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin")
    .limit(1)
    .single();

  if (error || !adminRole) {
    throw new Error("No admin user found");
  }

  return adminRole.user_id;
}

// Helper function to get employees on active shift
async function getActiveEmployees(supabaseAdmin: any): Promise<any[]> {
  try {
    const { data: activeEmployees, error } = await supabaseAdmin
      .from("time_entries")
      .select(`
        user_id,
        profiles!inner(full_name, phone)
      `)
      .is("clock_out", null)
      .not("clock_in", "is", null);

    if (error) {
      console.error("Error fetching active employees:", error);
      return [];
    }

    console.log("Active employees found:", activeEmployees);
    return activeEmployees || [];
  } catch (error) {
    console.error("Exception in getActiveEmployees:", error);
    return [];
  }
}

// Handle password reset notifications
async function handlePasswordReset(supabaseAdmin: any, data: any, adminSettings: any): Promise<boolean> {
  const { employee_phone, temp_password, employee_name } = data;
  
  if (!adminSettings.sms_enabled || !employee_phone) {
    return false;
  }

  const message = `¡Hola ${employee_name}! Tu contraseña temporal es: ${temp_password}. Por favor, cámbiala en tu próximo inicio de sesión. - Flamenca Store`;

  try {
    const { data: result, error } = await supabaseAdmin.functions.invoke("send-sms", {
      body: {
        phone: employee_phone,
        message: message,
        user_id: data.employee_id,
      },
    });

    return !error;
  } catch (error) {
    console.error("Error sending password reset SMS:", error);
    return false;
  }
}

// Handle new order notifications (WhatsApp only to admin)
async function handleNewOrder(supabaseAdmin: any, data: any, adminSettings: any): Promise<boolean> {
  // Manejar diferentes formatos de datos (WooCommerce vs interno)
  const order_id = data.id || data.order_id;
  const customer_name = data.billing ? 
    `${data.billing.first_name || ''} ${data.billing.last_name || ''}`.trim() : 
    data.customer_name || 'Cliente';
  const total_amount = data.total || data.total_amount;
  const items = data.line_items || data.items || [];
  
  const itemsText = items.length > 0 ? 
    items.slice(0, 2).map((item: any) => item.name || item.product_name).join(", ") : 
    'Productos varios';
  const moreItems = items.length > 2 ? ` y ${items.length - 2} más` : "";
  
  const message = `🛍️ NUEVO PEDIDO #${order_id}\nCliente: ${customer_name}\nTotal: ${total_amount}€\nProductos: ${itemsText}${moreItems}\n\nFlamenca Store`;

  try {
    // Solo enviar WhatsApp al admin
    if (adminSettings.whatsapp_enabled && adminSettings.whatsapp_phone) {
      const { data: result, error } = await supabaseAdmin.functions.invoke("send-whatsapp", {
        body: {
          phone: adminSettings.whatsapp_phone,
          message: message,
          user_id: adminSettings.user_id,
        },
      });

      if (!error) {
        console.log("New order WhatsApp sent to admin");
        return true;
      } else {
        console.error("Error sending new order WhatsApp:", error);
        return false;
      }
    } else {
      console.log("WhatsApp not enabled for admin, skipping new order notification");
      return false;
    }

  } catch (error) {
    console.error("Error sending new order notification:", error);
    return false;
  }
}

// Handle low stock notifications (Email + WhatsApp)
async function handleLowStock(supabaseAdmin: any, data: any, adminSettings: any): Promise<boolean> {
  // Manejar diferentes formatos de datos (WooCommerce vs interno)
  const products = data.products || (data.name ? [data] : []);
  
  const productsText = products.map((product: any) => 
    `• ${product.name}: ${product.stock_quantity || product.stock || 0} unidades`
  ).join("\n");
  
  let notificationsSent = 0;

  try {
    // 1. Enviar EMAIL al admin (siempre)
    if (adminSettings.email_enabled && adminSettings.email) {
      try {
        const emailSubject = `⚠️ Stock Bajo - Flamenca Store`;
        const emailBody = `
          <h2>⚠️ Alerta de Stock Bajo</h2>
          <p>Los siguientes productos tienen stock bajo:</p>
          <ul>
            ${products.map((product: any) => `<li><strong>${product.name}:</strong> ${product.stock} unidades</li>`).join('')}
          </ul>
          <p><strong>Acción recomendada:</strong> Revisar inventario y realizar pedido de reposición.</p>
          <hr>
          <p><em>Flamenca Store - Sistema de Gestión</em></p>
        `;

        const { data: emailResult, error: emailError } = await supabaseAdmin.functions.invoke("send-email", {
          body: {
            email: adminSettings.email,
            subject: emailSubject,
            body: emailBody,
            user_id: adminSettings.user_id,
          },
        });

        if (!emailError) {
          notificationsSent++;
          console.log("Low stock EMAIL sent to admin");
        }
      } catch (error) {
        console.error("Error sending low stock email to admin:", error);
      }
    }

    // 2. Enviar WhatsApp al admin (si está habilitado)
    if (adminSettings.whatsapp_enabled && adminSettings.whatsapp_phone) {
      try {
        const message = `⚠️ STOCK BAJO\n\n${productsText}\n\nRevisa el inventario en Flamenca Store`;

        const { data: result, error } = await supabaseAdmin.functions.invoke("send-whatsapp", {
          body: {
            phone: adminSettings.whatsapp_phone,
            message: message,
            user_id: adminSettings.user_id,
          },
        });

        if (!error) {
          notificationsSent++;
          console.log("Low stock WhatsApp sent to admin");
        }
      } catch (error) {
        console.error("Error sending low stock WhatsApp:", error);
      }
    }

    return notificationsSent > 0;
  } catch (error) {
    console.error("Error sending low stock notifications:", error);
    return false;
  }
}

// Handle out of stock notifications (Email + SMS + WhatsApp - ALL CHANNELS)
async function handleOutOfStock(supabaseAdmin: any, data: any, adminSettings: any): Promise<boolean> {
  // Manejar diferentes formatos de datos (WooCommerce vs interno)
  const products = data.products || (data.name ? [data] : []);
  
  const productsText = products.map((product: any) => 
    `${product.name} (${product.stock_quantity || product.stock || 0})`
  ).join(", ");
  
  let notificationsSent = 0;

  try {
    // 1. Enviar EMAIL al admin (siempre - URGENTE)
    if (adminSettings.email_enabled && adminSettings.email) {
      try {
        const emailSubject = `🚨 STOCK AGOTADO - Flamenca Store`;
        const emailBody = `
          <h2 style="color: red;">🚨 ALERTA: PRODUCTOS AGOTADOS</h2>
          <p><strong>Los siguientes productos están completamente agotados:</strong></p>
          <ul>
            ${products.map((product: any) => `<li><strong>${product.name}:</strong> ${product.stock} unidades</li>`).join('')}
          </ul>
          <p style="color: red; font-weight: bold;">🚨 ACCIÓN INMEDIATA REQUERIDA: Realizar pedido de emergencia URGENTE.</p>
          <hr>
          <p><em>Flamenca Store - Sistema de Gestión</em></p>
        `;

        const { data: emailResult, error: emailError } = await supabaseAdmin.functions.invoke("send-email", {
          body: {
            email: adminSettings.email,
            subject: emailSubject,
            body: emailBody,
            user_id: adminSettings.user_id,
          },
        });

        if (!emailError) {
          notificationsSent++;
          console.log("Out of stock EMAIL sent to admin");
        }
      } catch (error) {
        console.error("Error sending out of stock email to admin:", error);
      }
    }

    // 2. Enviar SMS al admin (si está habilitado - URGENTE)
    if (adminSettings.sms_enabled && adminSettings.sms_phone) {
      try {
        const message = `🚨 STOCK AGOTADO: ${productsText} - Flamenca Store`;

        const { data: result, error } = await supabaseAdmin.functions.invoke("send-sms", {
          body: {
            phone: adminSettings.sms_phone,
            message: message,
            user_id: adminSettings.user_id,
          },
        });

        if (!error) {
          notificationsSent++;
          console.log("Out of stock SMS sent to admin");
        }
      } catch (error) {
        console.error("Error sending out of stock SMS:", error);
      }
    }

    // 3. Enviar WhatsApp al admin (si está habilitado - URGENTE)
    if (adminSettings.whatsapp_enabled && adminSettings.whatsapp_phone) {
      try {
        const whatsappMessage = `🚨 STOCK AGOTADO\n\n${productsText}\n\n🚨 ACCIÓN INMEDIATA REQUERIDA\n\nFlamenca Store`;

        const { data: result, error } = await supabaseAdmin.functions.invoke("send-whatsapp", {
          body: {
            phone: adminSettings.whatsapp_phone,
            message: whatsappMessage,
            user_id: adminSettings.user_id,
          },
        });

        if (!error) {
          notificationsSent++;
          console.log("Out of stock WhatsApp sent to admin");
        }
      } catch (error) {
        console.error("Error sending out of stock WhatsApp:", error);
      }
    }

    return notificationsSent > 0;
  } catch (error) {
    console.error("Error sending out of stock notifications:", error);
    return false;
  }
}

// Handle check-in/check-out notifications (WhatsApp)
async function handleCheckInOut(supabaseAdmin: any, data: any, adminSettings: any, type: string): Promise<boolean> {
  const { employee_name, time, location } = data;
  
  const action = type === 'check_in' ? 'ENTRADA' : 'SALIDA';
  const emoji = type === 'check_in' ? '✅' : '🚪';
  
  const message = `${emoji} FICHAJE ${action}\n\nEmpleado: ${employee_name}\nHora: ${time}\nUbicación: ${location}\n\nFlamenca Store`;

  // Intentar WhatsApp primero si está habilitado
  if (adminSettings.whatsapp_enabled && adminSettings.whatsapp_phone) {
    try {
      const { data: result, error } = await supabaseAdmin.functions.invoke("send-whatsapp", {
        body: {
          phone: adminSettings.whatsapp_phone,
          message: message,
          user_id: adminSettings.user_id,
        },
      });

      if (!error) {
        console.log(`Check-in/out WhatsApp sent successfully: ${type}`);
        return true;
      } else {
        console.log(`WhatsApp failed, trying SMS as fallback: ${error.message}`);
      }
    } catch (error) {
      console.error("Error sending check-in/out WhatsApp:", error);
    }
  }

  // Fallback a SMS si WhatsApp falla o no está habilitado
  if (adminSettings.sms_enabled && adminSettings.sms_phone) {
    try {
      const { data: result, error } = await supabaseAdmin.functions.invoke("send-sms", {
        body: {
          phone: adminSettings.sms_phone,
          message: message,
          user_id: adminSettings.user_id,
        },
      });

      if (!error) {
        console.log(`Check-in/out SMS sent successfully as fallback: ${type}`);
        return true;
      } else {
        console.error(`SMS fallback also failed: ${error.message}`);
      }
    } catch (error) {
      console.error("Error sending check-in/out SMS fallback:", error);
    }
  }

  console.error("Both WhatsApp and SMS failed for check-in/out notification");
  return false;
}

// Handle incident notifications (Email + SMS)
async function handleIncident(supabaseAdmin: any, data: any, adminSettings: any): Promise<boolean> {
  const { incident_title, incident_type, reported_by, priority } = data;
  
  const priorityEmoji = priority === 'high' ? '🚨' : priority === 'medium' ? '⚠️' : 'ℹ️';
  const priorityColor = priority === 'high' ? 'red' : priority === 'medium' ? 'orange' : 'blue';
  
  let notificationsSent = 0;

  try {
    // 1. Enviar EMAIL al admin (siempre)
    if (adminSettings.email_enabled && adminSettings.email) {
      try {
        const emailSubject = `${priorityEmoji} Incidencia ${priority.toUpperCase()} - Flamenca Store`;
        const emailBody = `
          <h2 style="color: ${priorityColor};">${priorityEmoji} Nueva Incidencia Reportada</h2>
          <p><strong>Prioridad:</strong> <span style="color: ${priorityColor}; font-weight: bold;">${priority.toUpperCase()}</span></p>
          <p><strong>Tipo:</strong> ${incident_type}</p>
          <p><strong>Título:</strong> ${incident_title}</p>
          <p><strong>Reportado por:</strong> ${reported_by}</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <hr>
          <p><em>Flamenca Store - Sistema de Gestión</em></p>
        `;

        const { data: emailResult, error: emailError } = await supabaseAdmin.functions.invoke("send-email", {
          body: {
            email: adminSettings.email,
            subject: emailSubject,
            body: emailBody,
            user_id: adminSettings.user_id,
          },
        });

        if (!emailError) {
          notificationsSent++;
          console.log("Incident EMAIL sent to admin");
        }
      } catch (error) {
        console.error("Error sending incident email to admin:", error);
      }
    }

    // 2. Enviar SMS al admin (si está habilitado)
    if (adminSettings.sms_enabled && adminSettings.sms_phone) {
      try {
        const message = `${priorityEmoji} INCIDENCIA ${priority.toUpperCase()}\n\nTipo: ${incident_type}\nTítulo: ${incident_title}\nReportado por: ${reported_by}\n\nFlamenca Store`;

        const { data: result, error } = await supabaseAdmin.functions.invoke("send-sms", {
          body: {
            phone: adminSettings.sms_phone,
            message: message,
            user_id: adminSettings.user_id,
          },
        });

        if (!error) {
          notificationsSent++;
          console.log("Incident SMS sent to admin");
        }
      } catch (error) {
        console.error("Error sending incident SMS:", error);
      }
    }

    return notificationsSent > 0;
  } catch (error) {
    console.error("Error sending incident notifications:", error);
    return false;
  }
}

// Handle payment issue notifications (Email + SMS)
async function handlePaymentIssue(supabaseAdmin: any, data: any, adminSettings: any): Promise<boolean> {
  const { order_id, customer_name, issue_type, amount } = data;
  
  let notificationsSent = 0;

  try {
    // 1. Enviar EMAIL al admin (siempre - URGENTE)
    if (adminSettings.email_enabled && adminSettings.email) {
      try {
        const emailSubject = `💳 Problema de Pago - Pedido #${order_id} - Flamenca Store`;
        const emailBody = `
          <h2 style="color: red;">💳 Problema de Pago Detectado</h2>
          <p><strong>Número de Pedido:</strong> #${order_id}</p>
          <p><strong>Cliente:</strong> ${customer_name}</p>
          <p><strong>Tipo de Problema:</strong> ${issue_type}</p>
          <p><strong>Importe:</strong> ${amount}€</p>
          <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
          <p style="color: red; font-weight: bold;">⚠️ ACCIÓN REQUERIDA: Revisar y resolver el problema de pago.</p>
          <hr>
          <p><em>Flamenca Store - Sistema de Gestión</em></p>
        `;

        const { data: emailResult, error: emailError } = await supabaseAdmin.functions.invoke("send-email", {
          body: {
            email: adminSettings.email,
            subject: emailSubject,
            body: emailBody,
            user_id: adminSettings.user_id,
          },
        });

        if (!emailError) {
          notificationsSent++;
          console.log("Payment issue EMAIL sent to admin");
        }
      } catch (error) {
        console.error("Error sending payment issue email to admin:", error);
      }
    }

    // 2. Enviar SMS al admin (si está habilitado - URGENTE)
    if (adminSettings.sms_enabled && adminSettings.sms_phone) {
      try {
        const message = `💳 PROBLEMA DE PAGO\n\nPedido: #${order_id}\nCliente: ${customer_name}\nProblema: ${issue_type}\nImporte: ${amount}€\n\nFlamenca Store`;

        const { data: result, error } = await supabaseAdmin.functions.invoke("send-sms", {
          body: {
            phone: adminSettings.sms_phone,
            message: message,
            user_id: adminSettings.user_id,
          },
        });

        if (!error) {
          notificationsSent++;
          console.log("Payment issue SMS sent to admin");
        }
      } catch (error) {
        console.error("Error sending payment issue SMS:", error);
      }
    }

    return notificationsSent > 0;
  } catch (error) {
    console.error("Error sending payment issue notifications:", error);
    return false;
  }
}
