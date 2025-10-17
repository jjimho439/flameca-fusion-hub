import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { Package, ClipboardList, AlertCircle, Users, DollarSign, TrendingUp, ShoppingCart, ArrowRight, AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Order, Product, DashboardStats } from "@/types";
import { toast } from "sonner";
import { NotificationTester } from "@/components/NotificationTester";

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    products: 0,
    orders: 0,
    pendingOrders: 0,
    employees: 0,
    todaySales: 0,
    weekSales: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);


  const fetchDashboardData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Obtener estadísticas básicas
      const [productsResponse, allOrders, employees] = await Promise.all([
        supabase.functions.invoke('sync-woocommerce-products', {
          body: { 
            action: 'list',
            params: { per_page: 100 }
          }
        }),
        supabase.from("orders").select("*"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      const ordersData = allOrders.data || [];
      const pendingOrders = ordersData.filter(o => 
        o.status === 'pending' || o.status === 'in_progress'
      );

      // Calcular ventas de hoy
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todaySales = ordersData
        .filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate >= today && o.status === 'delivered';
        })
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      // Calcular ventas de la semana
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekSales = ordersData
        .filter(o => {
          const orderDate = new Date(o.created_at);
          return orderDate >= weekAgo && o.status === 'delivered';
        })
        .reduce((sum, o) => sum + Number(o.total_amount), 0);

      // Transformar productos de WooCommerce
      const products = productsResponse.data?.data || [];
      const transformedProducts = products.map((product: any) => ({
        id: product.id,
        name: product.name,
        price: parseFloat(product.price),
        stock: product.stock_quantity || 0
      }));

      setStats({
        products: products.length,
        orders: ordersData.length,
        pendingOrders: pendingOrders.length,
        employees: employees.count || 0,
        todaySales,
        weekSales,
      });

      // Productos con stock bajo
      const lowStock = transformedProducts
        .filter(p => p.stock <= 5)
        .sort((a, b) => a.stock - b.stock)
        .slice(0, 5);
      setLowStockProducts(lowStock);

      // Encargos recientes
      const recent = ordersData
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentOrders(recent);

      if (isRefresh) {
        toast.success("Dashboard actualizado");
      }

    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const statusColors = {
    pending: "bg-yellow-500",
    in_progress: "bg-blue-500",
    ready: "bg-green-500",
    delivered: "bg-gray-500",
    cancelled: "bg-red-500",
  };

  const statusLabels = {
    pending: "Pendiente",
    in_progress: "En Proceso",
    ready: "Listo",
    delivered: "Entregado",
    cancelled: "Cancelado",
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-10 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-8 rounded-lg" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-3 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(2)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[...Array(3)].map((_, j) => (
                    <div key={j} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-20" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Resumen general de tu tienda de flamenca</p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => fetchDashboardData(true)}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="ml-2">Actualizar</span>
        </Button>
      </div>

      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Hoy</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
              <DollarSign className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{stats.todaySales.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground mt-1">Ventas completadas hoy</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ventas Semana</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600">
              <TrendingUp className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats.weekSales.toFixed(2)}€</div>
            <p className="text-xs text-muted-foreground mt-1">Últimos 7 días</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encargos Pendientes</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-orange-600">
              <ClipboardList className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">{stats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground mt-1">Requieren atención</p>
          </CardContent>
        </Card>

        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Productos</CardTitle>
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-purple-600">
              <Package className="h-4 w-4 text-white" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">{stats.products}</div>
            <p className="text-xs text-muted-foreground mt-1">En catálogo</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de Stock Bajo */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                <CardTitle>Productos con Stock Bajo</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/products')}>
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Productos que necesitan reposición</CardDescription>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                ✅ Todo el stock está en niveles normales
              </p>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.price.toFixed(2)}€</p>
                    </div>
                    <Badge 
                      variant="destructive" 
                      className={product.stock <= 2 ? "animate-pulse" : ""}
                    >
                      {product.stock <= 2 ? "🚨" : "⚠️"} {product.stock} unidades
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Encargos Recientes */}
        <Card className="shadow-md">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-primary" />
                <CardTitle>Encargos Recientes</CardTitle>
              </div>
              <Button variant="ghost" size="sm" onClick={() => navigate('/orders')}>
                Ver todos
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
            <CardDescription>Últimos pedidos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No hay encargos registrados
              </p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{order.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-primary">{Number(order.total_amount).toFixed(2)}€</span>
                      <div className={`w-2 h-2 rounded-full ${statusColors[order.status as keyof typeof statusColors]}`} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Accesos Rápidos */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Accesos Rápidos</CardTitle>
          <CardDescription>Accede rápidamente a las funciones más utilizadas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => navigate('/pos')}
            >
              <ShoppingCart className="h-6 w-6" />
              <span>Nueva Venta</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => navigate('/orders')}
            >
              <ClipboardList className="h-6 w-6" />
              <span>Nuevo Encargo</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => navigate('/products')}
            >
              <Package className="h-6 w-6" />
              <span>Productos</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex-col gap-2"
              onClick={() => navigate('/invoices')}
            >
              <DollarSign className="h-6 w-6" />
              <span>Facturación</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Probador de notificaciones - Solo para desarrollo */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-6">
          <NotificationTester />
        </div>
      )}
    </div>
  );
}
