import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WhatsAppRequest {
  phone: string;
  message: string;
  user_id?: string;
  template_id?: string;
  variables?: Record<string, string>;
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

    const { phone, message, user_id, template_id, variables }: WhatsAppRequest = await req.json();

    console.log("WhatsApp request:", { phone, message: message.substring(0, 50) + "...", user_id, template_id });

    if (!phone || !message) {
      return new Response(
        JSON.stringify({ error: "Phone and message are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validar formato de teléfono (debe empezar con + y tener al menos 10 dígitos)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    if (!phoneRegex.test(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format. Must be in international format (+1234567890)" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Si se proporciona template_id, obtener la plantilla
    let finalMessage = message;
    if (template_id) {
      const { data: template, error: templateError } = await supabaseAdmin
        .from("notification_templates")
        .select("*")
        .eq("id", template_id)
        .single();

      if (templateError || !template) {
        return new Response(
          JSON.stringify({ error: "Template not found" }),
          {
            status: 404,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Reemplazar variables en la plantilla
      finalMessage = template.template;
      if (variables) {
        Object.entries(variables).forEach(([key, value]) => {
          finalMessage = finalMessage.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
      }
    }

    // Crear registro en la base de datos
    const { data: notification, error: insertError } = await supabaseAdmin
      .from("whatsapp_notifications")
      .insert({
        phone,
        message: finalMessage,
        status: "pending",
        user_id: user_id || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting WhatsApp notification:", insertError);
      throw insertError;
    }

    // Enviar WhatsApp real usando Twilio
    let twilioSid = null;
    let status = "failed";
    let errorMessage = null;
    
    try {
      // Verificar si las API keys de Twilio están configuradas
      const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
      const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
      const twilioWhatsAppNumber = Deno.env.get("TWILIO_WHATSAPP_NUMBER");
      
      if (!twilioAccountSid || !twilioAuthToken || !twilioWhatsAppNumber) {
        console.log("🧪 TESTING MODE: Twilio WhatsApp API keys not configured");
        console.log("📱 Would send WhatsApp to:", phone);
        console.log("💬 Message:", finalMessage);
        
        // Modo testing
        twilioSid = `test_whatsapp_${Date.now()}`;
        status = "sent";
        errorMessage = null;
      } else {
        console.log("💬 Sending real WhatsApp via Twilio to:", phone);
        
        // Enviar WhatsApp real usando Twilio
        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        
        const formData = new URLSearchParams();
        formData.append('To', `whatsapp:${phone}`);
        formData.append('From', `whatsapp:${twilioWhatsAppNumber}`);
        formData.append('Body', finalMessage);
        
        const response = await fetch(twilioUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${btoa(`${twilioAccountSid}:${twilioAuthToken}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: formData,
        });
        
        const result = await response.json();
        
        if (response.ok) {
          twilioSid = result.sid;
          status = "sent";
          errorMessage = null;
          console.log("✅ WhatsApp sent successfully via Twilio:", twilioSid);
        } else {
          status = "failed";
          errorMessage = result.message || "Unknown Twilio error";
          console.error("❌ Twilio WhatsApp failed:", errorMessage);
        }
      }
    } catch (error) {
      status = "failed";
      errorMessage = error.message;
      console.error("❌ Error sending WhatsApp:", error);
    }

    // Actualizar el estado de la notificación
    const { error: updateError } = await supabaseAdmin
      .from("whatsapp_notifications")
      .update({
        status,
        sent_at: status === "sent" ? new Date().toISOString() : null,
        error_message: errorMessage,
        twilio_sid: twilioSid,
      })
      .eq("id", notification.id);

    if (updateError) {
      console.error("Error updating WhatsApp notification:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: status === "sent",
        message: status === "sent" ? "WhatsApp message sent successfully" : "WhatsApp message failed to send",
        notification_id: notification.id,
        twilio_sid: twilioSid,
        status,
        error: errorMessage,
      }),
      {
        status: status === "sent" ? 200 : 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-whatsapp function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
