import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAppNotifications } from "@/hooks/useAppNotifications";

export const NotificationTester: React.FC = () => {
  const { simulateNotification } = useAppNotifications();

  const testNotifications = [
    { type: 'new_order' as const, label: '🛍️ Nuevo Pedido' },
    { type: 'out_of_stock' as const, label: '🚨 Stock Agotado' },
    { type: 'low_stock' as const, label: '⚠️ Stock Bajo' },
    { type: 'incident' as const, label: '📋 Nueva Incidencia' },
    { type: 'payment_issue' as const, label: '💳 Problema de Pago' },
  ];

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🧪 Probador de Notificaciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {testNotifications.map((notification) => (
          <Button
            key={notification.type}
            variant="outline"
            size="sm"
            onClick={() => simulateNotification(notification.type)}
            className="w-full justify-start"
          >
            {notification.label}
          </Button>
        ))}
        <div className="text-xs text-muted-foreground mt-4">
          💡 Haz clic en los botones para probar las notificaciones y ver las marquitas en el sidebar
        </div>
      </CardContent>
    </Card>
  );
};
