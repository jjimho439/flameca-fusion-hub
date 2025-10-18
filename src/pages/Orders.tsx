import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Package, RefreshCw, Phone, DollarSign, CreditCard, Clock, User, MapPin, FileText, CheckCircle } from "lucide-react";
import { useWooCommerceOrders } from "@/hooks/useWooCommerceOrders";
import { useHoldedDocuments } from "@/hooks/useHoldedDocuments";
import { PermissionGate } from "@/components/PermissionGate";

interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  total_amount: number;
  status: string;
  payment_method: string;
  payment_status: string;
  notes: string | null;
  woocommerce_order_id: string | null;
  created_at: string;
  order_items: {
    id: string;
    name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
  }[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [invoicing, setInvoicing] = useState<string | null>(null);
  
  const { syncNewOrders } = useWooCommerceOrders();
  const { createInvoiceFromOrder } = useHoldedDocuments();
  

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            name,
            quantity,
            unit_price,
            subtotal
          )
        `)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      setOrders(data || []);
    } catch (error: any) {
      toast.error("Error al cargar encargos");
    } finally {
      setLoading(false);
    }
  };

  const handleSyncOrders = async () => {
    setSyncing(true);
    try {
      await syncNewOrders();
      fetchOrders();
    } catch (error: any) {
      toast.error("Error al sincronizar encargos");
    } finally {
      setSyncing(false);
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", orderId);

      if (error) throw error;
      
      toast.success("Estado actualizado correctamente");
      fetchOrders();
    } catch (error: any) {
      toast.error("Error al actualizar estado");
    }
  };


  const handleCreateInvoice = async (order: Order) => {
    setInvoicing(order.id);
    try {
      console.log("Order data being sent to createInvoiceFromOrder:", order);
      console.log("Order items:", order.order_items);
      
      // Mapear el pedido al formato esperado por createInvoiceFromOrder
      const orderForHolded = {
        id: order.id,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        customer_phone: order.customer_phone,
        items: order.order_items.map(item => ({
          name: item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          sku: undefined // No tenemos SKU en order_items
        })),
        total_amount: order.total_amount,
        notes: order.notes
      };
      
      console.log("Mapped order for Holded:", orderForHolded);
      await createInvoiceFromOrder(orderForHolded);
      
      // Actualizar el estado del pedido a "completed" después de facturar
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: "completed" })
        .eq("id", order.id);

      if (updateError) {
        console.error("Error actualizando estado del pedido:", updateError);
      }
      
      toast.success("¡Factura creada en Holded y pedido completado!");
      fetchOrders(); // Recargar para actualizar el estado
    } catch (error: any) {
      toast.error("Error al crear factura: " + (error.message || "Error desconocido"));
    } finally {
      setInvoicing(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES');
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES');
  };

  const translatePaymentMethod = (method: string) => {
    const translations: { [key: string]: string } = {
      'cash': 'Efectivo',
      'card': 'Tarjeta',
      'mixed': 'Mixto',
      'web': 'Web',
      'transfer': 'Transferencia',
      'paypal': 'PayPal',
      'stripe': 'Stripe',
      'bacs': 'Transferencia bancaria',
      'cheque': 'Cheque',
      'cod': 'Contra reembolso',
      'Tarjeta': 'Tarjeta',
      'Efectivo': 'Efectivo',
      'Mixto': 'Mixto',
      'Web': 'Web',
      'Transferencia': 'Transferencia'
    };
    return translations[method.toLowerCase()] || method;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendiente';
      case 'completed': return 'Completado';
      default: return status;
    }
  };


  // Datos de prueba para mostrar la página funcionando
  const sampleOrders: Order[] = [
    {
      id: "1",
      customer_name: "María García",
      customer_phone: "612345678",
      customer_email: "maria.garcia@email.com",
      total_amount: 89.99,
      status: "pending",
      payment_method: "Tarjeta",
      payment_status: "paid",
      notes: "Cliente VIP - Entrega urgente",
      woocommerce_order_id: "101",
      created_at: "2025-10-15T10:30:00Z",
      order_items: [
        { id: "1", quantity: 1, unit_price: 89.99, subtotal: 89.99 }
      ]
    },
    {
      id: "2",
      customer_name: "Carlos López",
      customer_phone: "623456789",
      customer_email: "carlos.lopez@email.com",
      total_amount: 156.50,
      status: "pending",
      payment_method: "Efectivo",
      payment_status: "pending",
      notes: "Pedido especial - Talla personalizada",
      woocommerce_order_id: "102",
      created_at: "2025-10-15T11:15:00Z",
      order_items: [
        { id: "2", quantity: 2, unit_price: 78.25, subtotal: 156.50 }
      ]
    },
    {
      id: "3",
      customer_name: "Ana Rodríguez",
      customer_phone: "634567890",
      customer_email: "ana.rodriguez@email.com",
      total_amount: 234.75,
      status: "completed",
      payment_method: "Transferencia",
      payment_status: "paid",
      notes: "Entrega completada - Cliente satisfecho",
      woocommerce_order_id: "103",
      created_at: "2025-10-15T09:45:00Z",
      order_items: [
        { id: "3", quantity: 1, unit_price: 234.75, subtotal: 234.75 }
      ]
    }
  ];

  // Usar solo datos reales
  const displayOrders = orders;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Cargando encargos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
          Pedidos
        </h1>
        <p className="text-muted-foreground text-lg">Gestiona los encargos de tus clientes de forma eficiente</p>
      </div>

      {/* Sincronización Card */}
      <Card className="shadow-lg border-primary/20 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-6 w-6 text-primary" />
            Sincronización de Pedidos
          </CardTitle>
          <CardDescription>Sincroniza los pedidos desde WooCommerce automáticamente</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <PermissionGate permission="sync_woocommerce">
              <Button 
                onClick={handleSyncOrders} 
                disabled={syncing}
                className="bg-gradient-hero flex-1" 
                size="lg"
              >
                <RefreshCw className={`mr-2 h-5 w-5 ${syncing ? 'animate-spin' : ''}`} />
                {syncing ? 'Sincronizando...' : 'Sincronizar WooCommerce'}
              </Button>
            </PermissionGate>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Sistema conectado</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Pedidos */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Lista de Pedidos</h2>
            <p className="text-sm text-muted-foreground">
              {displayOrders.length} {displayOrders.length === 1 ? 'pedido' : 'pedidos'} registrados
            </p>
          </div>
        </div>
        
        {displayOrders.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Package className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay encargos registrados</h3>
              <p className="text-muted-foreground">Sincroniza con WooCommerce para ver los pedidos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {displayOrders.map((order, index) => (
              <Card 
                key={order.id} 
                className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary animate-in slide-in-from-bottom-4"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CardContent className="pt-6">
                  <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                    {/* Información del Cliente */}
                    <div className="space-y-4 flex-1">
                      {/* Header del Cliente */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="relative">
                            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                              <User className="h-5 w-5 text-primary" />
                            </div>
                            <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                              order.status === 'completed' ? 'bg-green-500' :
                              order.status === 'pending' ? 'bg-yellow-500' :
                              order.status === 'cancelled' ? 'bg-red-500' : 'bg-blue-500'
                            }`}></div>
                          </div>
                          <div>
                            <p className="font-semibold text-xl">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">{order.customer_email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-2xl font-bold text-primary">{formatCurrency(order.total_amount)}</span>
                        </div>
                      </div>
                      
                      {/* Grid de Información */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <Phone className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Teléfono</p>
                            <p className="font-medium">{order.customer_phone}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                          <CreditCard className="h-5 w-5 text-primary" />
                          <div>
                            <p className="text-xs text-muted-foreground">Pago</p>
                            <p className="font-medium">{translatePaymentMethod(order.payment_method)}</p>
                          </div>
                        </div>
                        
                        {order.woocommerce_order_id && (
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Package className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">WooCommerce</p>
                              <p className="font-medium">#{order.woocommerce_order_id}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Notas */}
                      {order.notes && (
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-start gap-2">
                            <MapPin className="h-4 w-4 text-blue-600 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-900">Notas del Pedido</p>
                              <p className="text-sm text-blue-700 mt-1">{order.notes}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Productos */}
                      {order.order_items && order.order_items.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm font-medium text-muted-foreground">Productos del Pedido</p>
                          <div className="flex flex-wrap gap-2">
                            {order.order_items.slice(0, 4).map((item) => (
                              <div 
                                key={item.id}
                                className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-3 py-2"
                              >
                                <span className="text-sm font-medium text-primary">{item.quantity}x</span>
                                <span className="text-sm text-foreground">{formatCurrency(item.unit_price)}</span>
                              </div>
                            ))}
                            {order.order_items.length > 4 && (
                              <div className="flex items-center gap-2 bg-muted border border-muted-foreground/20 rounded-lg px-3 py-2">
                                <span className="text-sm text-muted-foreground">+{order.order_items.length - 4} más</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Fecha de Creación */}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>Creado: {formatDateTime(order.created_at)}</span>
                      </div>
                    </div>

                    {/* Controles */}
                    <div className="flex flex-col sm:flex-row xl:flex-col gap-4 xl:min-w-[240px]">
                      {/* Estado del Pedido */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Estado del Pedido</p>
                        <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(order.status)}`}></div>
                          <span className="font-medium">{getStatusLabel(order.status)}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {order.status === 'completed' ? 'Pedido completado y facturado' : 'El estado se actualiza automáticamente'}
                        </p>
                      </div>


                      {/* Botón de Facturación */}
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-muted-foreground">Facturación</p>
                        {order.status === 'completed' ? (
                          <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                            <CheckCircle className="h-5 w-5 text-green-600" />
                            <span className="text-sm font-medium text-green-800">Ya facturado</span>
                          </div>
                        ) : (
                          <PermissionGate permission="create_invoice">
                            <Button
                              onClick={() => handleCreateInvoice(order)}
                              disabled={invoicing === order.id}
                              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white"
                              size="lg"
                            >
                              <FileText className="mr-2 h-4 w-4" />
                              {invoicing === order.id ? 'Facturando...' : 'Facturar en Holded'}
                            </Button>
                          </PermissionGate>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}