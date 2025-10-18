import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64
    type: string;
  }>;
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

    const { to, subject, body, attachments, user_id, template_id, variables }: EmailRequest = await req.json();

    console.log("Email request:", { to, subject, body: body.substring(0, 50) + "...", user_id, template_id });

    if (!to || !subject || !body) {
      return new Response(
        JSON.stringify({ error: "To, subject and body are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Si se proporciona template_id, obtener la plantilla
    let finalSubject = subject;
    let finalBody = body;
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
      finalBody = template.template;
      if (variables) {
        Object.entries(variables).forEach(([key, value]) => {
          finalBody = finalBody.replace(new RegExp(`{{${key}}}`, 'g'), value);
        });
      }
    }

    // Crear registro en la base de datos
    const { data: notification, error: insertError } = await supabaseAdmin
      .from("email_notifications")
      .insert({
        email: to,
        subject: finalSubject,
        body: finalBody,
        status: "pending",
        user_id: user_id || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting email notification:", insertError);
      throw insertError;
    }

    // Enviar email usando Resend (simulado para desarrollo)
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const fromEmail = Deno.env.get("FROM_EMAIL") || "noreply@flamenca.com";

    let providerId = null;
    let status = "sent";
    let errorMessage = null;

    if (resendApiKey) {
      try {
        // En producción, usar la API real de Resend
        const resendUrl = "https://api.resend.com/emails";
        
        const emailData: any = {
          from: fromEmail,
          to: [to],
          subject: finalSubject,
          html: finalBody.replace(/\n/g, '<br>'),
        };

        // Agregar adjuntos si los hay
        if (attachments && attachments.length > 0) {
          emailData.attachments = attachments.map(att => ({
            filename: att.filename,
            content: att.content,
            type: att.type
          }));
        }

        const resendResponse = await fetch(resendUrl, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        });

        if (resendResponse.ok) {
          const resendData = await resendResponse.json();
          providerId = resendData.id;
          status = "sent";
          console.log("Email sent successfully via Resend:", providerId);
        } else {
          const errorData = await resendResponse.text();
          console.error("Resend error:", errorData);
          status = "failed";
          errorMessage = `Resend error: ${resendResponse.status}`;
        }
      } catch (resendError) {
        console.error("Error calling Resend API:", resendError);
        status = "failed";
        errorMessage = `Resend API error: ${resendError.message}`;
      }
    } else {
      // Modo desarrollo - simular envío exitoso
      console.log("Development mode: Email would be sent to", to);
      console.log("Subject:", finalSubject);
      console.log("Body:", finalBody);
      if (attachments && attachments.length > 0) {
        console.log("Attachments:", attachments.map(att => att.filename));
      }
      providerId = `dev_email_${Date.now()}`;
      status = "sent";
    }

    // Actualizar el estado de la notificación
    const { error: updateError } = await supabaseAdmin
      .from("email_notifications")
      .update({
        status,
        sent_at: status === "sent" ? new Date().toISOString() : null,
        error_message: errorMessage,
        provider_id: providerId,
      })
      .eq("id", notification.id);

    if (updateError) {
      console.error("Error updating email notification:", updateError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email sent successfully",
        notification_id: notification.id,
        provider_id: providerId,
        status,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error: any) {
    console.error("Error in send-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
