import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { PermissionGate } from "@/components/PermissionGate";
import { LoadingSpinner, LoadingOverlay } from "@/components/LoadingSpinner";
import { useUserRole } from "@/hooks/useUserRole";
import { useWooCommerceProducts } from "@/hooks/useWooCommerceProducts";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "sonner";
import { ShoppingCart, Trash2, CreditCard, Banknote, Plus, Minus, Search, DollarSign, Percent, Loader2 } from "lucide-react";
import { Product, CartItem } from "@/types";

export default function PointOfSale() {
  const { can } = useUserRole();
  const { products, loading: productsLoading, updateProductStock } = useWooCommerceProducts();
  const { showPromise } = useNotifications();
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [discountType, setDiscountType] = useState<"percentage" | "fixed">("percentage");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchTerm, products]);


  const addToCart = (product: Product) => {
    const existingItem = cartItems.find(item => item.product_id === product.id);
    
    if (existingItem) {
      if (existingItem.quantity >= product.stock) {
        toast.error(`Stock máximo alcanzado (${product.stock} disponibles)`);
        return;
      }
      updateQuantity(product.id, existingItem.quantity + 1);
    } else {
      const newItem: CartItem = {
        product_id: product.id,
        product_name: product.name,
        quantity: 1,
        unit_price: product.price,
        subtotal: product.price,
      };
      setCartItems([...cartItems, newItem]);
      toast.success(`${product.name} agregado al carrito`);
    }
  };

  const updateQuantity = (productId: string, newQuantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.stock) {
      toast.error(`Stock máximo: ${product.stock} unidades`);
      return;
    }

    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setCartItems(cartItems.map(item => 
      item.product_id === productId
        ? { ...item, quantity: newQuantity, subtotal: item.unit_price * newQuantity }
        : item
    ));
  };

  const removeFromCart = (productId: string) => {
    setCartItems(cartItems.filter(item => item.product_id !== productId));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((sum, item) => sum + item.subtotal, 0);
  };

  const calculateDiscount = () => {
    if (discountAmount <= 0) return 0;
    const subtotal = calculateSubtotal();
    if (discountType === "percentage") {
      return (subtotal * discountAmount) / 100;
    } else {
      return Math.min(discountAmount, subtotal);
    }
  };

  const calculateTotal = () => {
    return calculateSubtotal() - calculateDiscount();
  };

  const processSale = async () => {
    if (cartItems.length === 0) {
      toast.error("El carrito está vacío");
      return;
    }

    if (!confirm(`¿Confirmar venta por ${calculateTotal().toFixed(2)}€?`)) {
      return;
    }

    setProcessing(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const totalAmount = calculateTotal();

      // 1. Crear orden de venta
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert([{
          customer_name: "Venta en Tienda",
          customer_phone: "N/A",
          total_amount: totalAmount,
          payment_method: paymentMethod,
          payment_status: "paid", // Venta directa = pagado
          status: "delivered", // Venta directa = entregado
          created_by: session?.user.id || null,
        }])
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insertar items de la venta
      const itemsToInsert = cartItems.map(item => ({
        order_id: order.id,
        product_id: null, // Temporalmente null para ventas directas
        quantity: item.quantity,
        unit_price: parseFloat(item.unit_price.toString()),
        subtotal: parseFloat(item.subtotal.toString()),
      }));

      console.log("Order created:", order);
      console.log("Items to insert:", itemsToInsert);
      console.log("First item details:", itemsToInsert[0]);

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;

      // 3. Actualizar stock de productos en WooCommerce
      for (const item of cartItems) {
        const product = products.find(p => p.id === item.product_id);
        if (!product) continue;

        const newStock = product.stock - item.quantity;
        
        // Actualizar stock usando el hook
        try {
          await updateProductStock(product.id, newStock);
        } catch (syncError) {
          console.error("Error actualizando stock en WooCommerce:", syncError);
          // No lanzar error para no interrumpir la venta
        }
      }

      // 4. Limpiar carrito y mostrar éxito
      setCartItems([]);
      setPaymentMethod("cash");
      setSearchTerm("");
      setDiscountAmount(0);
      fetchProducts();
      
      toast.success(`¡Venta realizada! Total: ${totalAmount.toFixed(2)}€`);
    } catch (error: any) {
      toast.error("Error al procesar la venta: " + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const clearCart = () => {
    if (cartItems.length === 0) return;
    if (confirm("¿Vaciar el carrito?")) {
      setCartItems([]);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-bold">Punto de Venta (TPV)</h1>
        <p className="text-muted-foreground">Sistema de ventas en tienda física</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PRODUCTOS - 2/3 del espacio */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Productos Disponibles</CardTitle>
              <CardDescription>Selecciona productos para agregar al carrito</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar producto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Grid de productos */}
              {productsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Cargando productos...</span>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-[600px] overflow-y-auto">
                  {filteredProducts.map((product) => {
                  const isLowStock = product.stock <= 5;
                  const isVeryLowStock = product.stock <= 2;
                  
                  return (
                    <Card 
                      key={product.id}
                      className={`cursor-pointer hover:border-primary hover:shadow-md transition-all ${
                        isVeryLowStock ? 'border-destructive border-2' : 
                        isLowStock ? 'border-orange-500' : ''
                      }`}
                      onClick={() => addToCart(product)}
                    >
                      <CardContent className="p-3 flex flex-col h-full">
                        <div className="flex-1 space-y-1.5 mb-3">
                          <h3 className="font-semibold text-sm line-clamp-2 min-h-[40px]">{product.name}</h3>
                          {product.category && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                              {product.category}
                            </Badge>
                          )}
                        </div>
                        
                        <div className="space-y-1.5">
                          <div className="text-xl font-bold text-primary">
                            {product.price.toFixed(2)}€
                          </div>
                          
                          <div className={`text-xs font-semibold px-2 py-1 rounded-md inline-block ${
                            isVeryLowStock 
                              ? 'bg-destructive/10 text-destructive animate-pulse' 
                              : isLowStock 
                                ? 'bg-orange-100 text-orange-600'
                                : 'bg-muted text-muted-foreground'
                          }`}>
                            {isVeryLowStock ? '⚠️ ¡ÚLTIMAS! ' : isLowStock ? '⚠️ Poco stock: ' : 'Stock: '}
                            {product.stock}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                  
                  {filteredProducts.length === 0 && !productsLoading && (
                    <div className="text-center py-12 text-muted-foreground">
                      No hay productos disponibles
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* CARRITO - 1/3 del espacio */}
        <div className="space-y-4">
          <Card className="sticky top-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="h-5 w-5" />
                  Carrito ({cartItems.length})
                </CardTitle>
                {cartItems.length > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearCart}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Items del carrito */}
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {cartItems.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Carrito vacío</p>
                  </div>
                ) : (
                  cartItems.map((item) => (
                    <div key={item.product_id} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-start">
                        <span className="font-medium text-sm">{item.product_name}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.product_id)}
                          className="h-6 w-6 p-0"
                        >
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="h-7 w-7 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="font-semibold w-8 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="h-7 w-7 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                        <span className="font-bold text-primary">
                          {item.subtotal.toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cartItems.length > 0 && (
                <>
                  {/* Resumen de precios */}
                  <div className="border-t pt-4 space-y-3">
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>{calculateSubtotal().toFixed(2)}€</span>
                      </div>
                      
                      <PermissionGate permission="apply_discount">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">Descuento:</Label>
                            <Select value={discountType} onValueChange={(value: "percentage" | "fixed") => setDiscountType(value)}>
                              <SelectTrigger className="h-8 w-20">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="percentage">%</SelectItem>
                                <SelectItem value="fixed">€</SelectItem>
                              </SelectContent>
                            </Select>
                            <Input
                              type="number"
                              value={discountAmount}
                              onChange={(e) => setDiscountAmount(Number(e.target.value) || 0)}
                              className="h-8 w-20"
                              min="0"
                              max={discountType === "percentage" ? 100 : calculateSubtotal()}
                            />
                          </div>
                          {calculateDiscount() > 0 && (
                            <div className="flex justify-between text-green-600">
                              <span>Descuento aplicado:</span>
                              <span>-{calculateDiscount().toFixed(2)}€</span>
                            </div>
                          )}
                        </div>
                      </PermissionGate>
                    </div>
                    
                    <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
                      <span>TOTAL:</span>
                      <span className="text-2xl text-primary">
                        {calculateTotal().toFixed(2)}€
                      </span>
                    </div>
                  </div>

                    {/* Método de pago */}
                    <div className="space-y-2">
                      <Label>Método de Pago</Label>
                      <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="cash">
                            <div className="flex items-center gap-2">
                              <Banknote className="h-4 w-4" />
                              Efectivo
                            </div>
                          </SelectItem>
                          <SelectItem value="card">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-4 w-4" />
                              Tarjeta
                            </div>
                          </SelectItem>
                          <SelectItem value="mixed">
                            <div className="flex items-center gap-2">
                              <DollarSign className="h-4 w-4" />
                              Mixto
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Botón procesar venta */}
                    <Button 
                      className="w-full bg-gradient-hero text-lg h-12"
                      onClick={processSale}
                      disabled={processing}
                    >
                      {processing ? "Procesando..." : "Procesar Venta"}
                    </Button>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

