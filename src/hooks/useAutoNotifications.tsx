import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useAutoNotifications = () => {
  // Notificar contraseña temporal
  const notifyPasswordReset = useCallback(async (employeeData: {
    employee_id: string;
    employee_name: string;
    employee_phone: string;
    temp_password: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke("auto-notify", {
        body: {
          type: "password_reset",
          data: employeeData,
        },
      });

      if (error) {
        console.error("Error sending password reset notification:", error);
        return false;
      }

      console.log("Password reset notification sent:", data);
      return true;
    } catch (error) {
      console.error("Error in notifyPasswordReset:", error);
      return false;
    }
  }, []);

  // Notificar nuevo pedido
  const notifyNewOrder = useCallback(async (orderData: {
    order_id: string;
    customer_name: string;
    total_amount: number;
    items: Array<{ name: string; quantity: number }>;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke("auto-notify", {
        body: {
          type: "new_order",
          data: orderData,
        },
      });

      if (error) {
        console.error("Error sending new order notification:", error);
        return false;
      }

      console.log("New order notification sent:", data);
      return true;
    } catch (error) {
      console.error("Error in notifyNewOrder:", error);
      return false;
    }
  }, []);

  // Notificar stock bajo (WhatsApp)
  const notifyLowStock = useCallback(async (products: Array<{
    name: string;
    stock: number;
    id: string;
  }>) => {
    try {
      const { data, error } = await supabase.functions.invoke("auto-notify", {
        body: {
          type: "low_stock",
          data: { products },
        },
      });

      if (error) {
        console.error("Error sending low stock notification:", error);
        return false;
      }

      console.log("Low stock notification sent:", data);
      return true;
    } catch (error) {
      console.error("Error in notifyLowStock:", error);
      return false;
    }
  }, []);

  // Notificar stock agotado (Email + SMS + WhatsApp)
  const notifyOutOfStock = useCallback(async (products: Array<{
    name: string;
    stock: number;
    id: string;
  }>) => {
    try {
      const { data, error } = await supabase.functions.invoke("auto-notify", {
        body: {
          type: "critical_stock", // Mantenemos el tipo para compatibilidad
          data: { products },
        },
      });

      if (error) {
        console.error("Error sending out of stock notification:", error);
        return false;
      }

      console.log("Out of stock notification sent:", data);
      return true;
    } catch (error) {
      console.error("Error in notifyOutOfStock:", error);
      return false;
    }
  }, []);

  // Notificar check-in/check-out
  const notifyCheckInOut = useCallback(async (checkData: {
    employee_name: string;
    time: string;
    location: string;
    type: 'check_in' | 'check_out';
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke("auto-notify", {
        body: {
          type: checkData.type,
          data: checkData,
        },
      });

      if (error) {
        console.error("Error sending check-in/out notification:", error);
        return false;
      }

      console.log("Check-in/out notification sent:", data);
      return true;
    } catch (error) {
      console.error("Error in notifyCheckInOut:", error);
      return false;
    }
  }, []);

  // Notificar incidencia
  const notifyIncident = useCallback(async (incidentData: {
    incident_title: string;
    incident_type: string;
    reported_by: string;
    priority: 'low' | 'medium' | 'high';
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke("auto-notify", {
        body: {
          type: "incident",
          data: incidentData,
        },
      });

      if (error) {
        console.error("Error sending incident notification:", error);
        return false;
      }

      console.log("Incident notification sent:", data);
      return true;
    } catch (error) {
      console.error("Error in notifyIncident:", error);
      return false;
    }
  }, []);

  // Notificar problema de pago
  const notifyPaymentIssue = useCallback(async (paymentData: {
    order_id: string;
    customer_name: string;
    issue_type: string;
    amount: number;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke("auto-notify", {
        body: {
          type: "payment_issue",
          data: paymentData,
        },
      });

      if (error) {
        console.error("Error sending payment issue notification:", error);
        return false;
      }

      console.log("Payment issue notification sent:", data);
      return true;
    } catch (error) {
      console.error("Error in notifyPaymentIssue:", error);
      return false;
    }
  }, []);

  return {
    notifyPasswordReset,
    notifyNewOrder,
    notifyLowStock,
    notifyOutOfStock,
    notifyCheckInOut,
    notifyIncident,
    notifyPaymentIssue,
  };
};
