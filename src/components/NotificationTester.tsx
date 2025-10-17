import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNotificationContext } from '@/contexts/NotificationContext';

export const NotificationTester: React.FC = () => {
  const { simulateNotification, sectionCounts, unreadCount } = useNotificationContext();

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>🧪 Probador de Notificaciones</CardTitle>
        <CardDescription>
          Prueba las notificaciones in-app y verifica que aparezcan en el sidebar
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-muted-foreground">
          <p><strong>Total no leídas:</strong> {unreadCount}</p>
          <p><strong>Por sección:</strong></p>
          <ul className="ml-4">
            <li>🛍️ Pedidos: {sectionCounts.orders || 0}</li>
            <li>📦 Productos: {sectionCounts.products || 0}</li>
            <li>📋 Incidencias: {sectionCounts.incidents || 0}</li>
            <li>💳 POS: {sectionCounts.pos || 0}</li>
            <li>🔔 General: {sectionCounts.general || 0}</li>
          </ul>
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => simulateNotification('new_order')}
            variant="outline"
            size="sm"
          >
            🛍️ Nuevo Pedido
          </Button>
          
          <Button 
            onClick={() => simulateNotification('out_of_stock')}
            variant="outline"
            size="sm"
          >
            🚨 Stock Agotado
          </Button>
          
          <Button 
            onClick={() => simulateNotification('low_stock')}
            variant="outline"
            size="sm"
          >
            ⚠️ Stock Bajo
          </Button>
          
          <Button 
            onClick={() => simulateNotification('incident')}
            variant="outline"
            size="sm"
          >
            📋 Incidencia
          </Button>
          
          <Button 
            onClick={() => simulateNotification('payment_issue')}
            variant="outline"
            size="sm"
          >
            💳 Problema Pago
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <p>💡 <strong>Instrucciones:</strong></p>
          <p>1. Haz clic en cualquier botón</p>
          <p>2. Verifica que aparezca un badge en el sidebar</p>
          <p>3. Escucha el sonido distintivo</p>
          <p>4. Haz clic en la sección del sidebar para marcar como leída</p>
        </div>
      </CardContent>
    </Card>
  );
};