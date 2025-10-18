import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plus, Edit, Trash2, Package, RefreshCw, Search, Loader2 } from "lucide-react";
import { Product } from "@/types";
import { useWooCommerceProducts } from "@/hooks/useWooCommerceProducts";
import { PermissionGate } from "@/components/PermissionGate";

export default function Products() {
  const { products, loading, refetch, fetchProducts, syncProducts } = useWooCommerceProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [stockFilter, setStockFilter] = useState<"all" | "in-stock" | "low-stock" | "very-low-stock" | "out-of-stock">("all");
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    regular_price: "",
    sale_price: "",
    description: "",
    short_description: "",
    sku: "",
    stock_quantity: "",
    manage_stock: false,
  });

  // Filtrar productos por término de búsqueda y estado de stock
  const filteredProducts = useMemo(() => {
    let filtered = products;
    
    // Filtro por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filtro por estado de stock
    if (stockFilter !== "all") {
      filtered = filtered.filter(product => {
        const stock = product.stock_quantity || 0;
        switch (stockFilter) {
          case "in-stock":
            return stock > 5;
          case "low-stock":
            return stock > 2 && stock <= 5;
          case "very-low-stock":
            return stock > 0 && stock <= 2;
          case "out-of-stock":
            return stock === 0;
          default:
            return true;
        }
      });
    }
    
    return filtered;
  }, [products, searchTerm, stockFilter]);

  const handleSearch = () => {
    // La búsqueda se maneja automáticamente por el filtro
    // No necesitamos hacer una nueva llamada a la API
  };

  // Crear o actualizar producto directamente en WooCommerce
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        type: "simple",
        status: "publish",
        regular_price: formData.regular_price,
        sale_price: formData.sale_price || "",
        description: formData.description,
        short_description: formData.short_description,
        sku: formData.sku,
        stock_status: formData.stock_quantity && parseInt(formData.stock_quantity) > 0 ? "instock" : "outofstock",
        manage_stock: formData.stock_quantity !== "",
        stock_quantity: formData.stock_quantity ? parseInt(formData.stock_quantity) : null,
      };

      if (editingProduct) {
        // Actualizar producto existente en WooCommerce
        const { error } = await supabase.functions.invoke('sync-woocommerce-products', {
          body: { 
            action: 'update',
            productId: editingProduct.id,
            productData
          }
        });

        if (error) throw error;
        toast.success("Producto actualizado en WooCommerce");
      } else {
        // Crear nuevo producto en WooCommerce
        const { error } = await supabase.functions.invoke('sync-woocommerce-products', {
          body: { 
            action: 'create',
            productData
          }
        });

        if (error) throw error;
        toast.success("Producto creado en WooCommerce");
      }

      setDialogOpen(false);
      resetForm();
      refetch();
    } catch (error: any) {
      console.error('Error saving product:', error);
      toast.error("Error al guardar producto en WooCommerce: " + error.message);
    }
  };

  // Eliminar producto directamente de WooCommerce
  const handleDeleteConfirm = async () => {
    if (!deleteProduct) return;

    try {
      console.log('Deleting product from WooCommerce:', deleteProduct.id);
      
      const { data, error } = await supabase.functions.invoke('sync-woocommerce-products', {
        body: { 
          action: 'delete',
          productId: deleteProduct.id
        }
      });

      if (error) {
        console.error('Delete error:', error);
        throw error;
      }

      console.log('Delete response:', data);
      toast.success(`Producto "${deleteProduct.name}" eliminado de WooCommerce`);
      refetch();
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast.error("Error al eliminar producto de WooCommerce: " + error.message);
    } finally {
      setDeleteProduct(null);
    }
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      regular_price: product.regular_price,
      sale_price: product.sale_price || "",
      description: product.description || "",
      short_description: product.short_description || "",
      sku: product.sku || "",
      stock_quantity: product.stock_quantity?.toString() || "",
      stock_status: product.stock_status,
      manage_stock: product.stock_quantity !== null,
    });
    setDialogOpen(true);
  };

  const resetForm = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      regular_price: "",
      sale_price: "",
      description: "",
      short_description: "",
      sku: "",
      stock_quantity: "",
      manage_stock: false,
    });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-[400px]">Cargando...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold">Productos</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo de productos</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
          <PermissionGate permission="create_product">
            <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-hero">
                  <Plus className="mr-2 h-4 w-4" />
                  Nuevo Producto
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Editar" : "Nuevo"} Producto</DialogTitle>
                <DialogDescription>
                  Completa los datos del producto
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Producto *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    placeholder="Ej: Camiseta Premium"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="Código único del producto"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="regular_price">Precio Regular *</Label>
                    <Input
                      id="regular_price"
                      type="number"
                      step="0.01"
                      value={formData.regular_price}
                      onChange={(e) => setFormData({ ...formData, regular_price: e.target.value })}
                      required
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sale_price">Precio Oferta</Label>
                    <Input
                      id="sale_price"
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="stock_quantity">Cantidad en Stock</Label>
                    <Input
                      id="stock_quantity"
                      type="number"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      placeholder="Dejar vacío para sin gestión"
                    />
                  </div>

                </div>

                <div className="space-y-2">
                  <Label htmlFor="short_description">Descripción Corta</Label>
                  <Textarea
                    id="short_description"
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    rows={3}
                    className="resize-none"
                    placeholder="Resumen breve que aparecerá en las listas de productos"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción Completa</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={6}
                    className="resize-none"
                    placeholder="Descripción detallada del producto"
                  />
                </div>

                <DialogFooter>
                  <Button type="submit" className="bg-gradient-hero">
                    {editingProduct ? "Actualizar" : "Crear"} Producto
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </PermissionGate>
        </div>
      </div>

      {/* Estadísticas de Stock */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-green-500/30 bg-green-500/10 dark:bg-green-500/20 dark:border-green-400/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 dark:bg-green-400 rounded-full"></div>
              <span className="text-sm font-medium text-green-700 dark:text-green-300">En Stock</span>
            </div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">
              {(products.filter(p => (p.stock_quantity || 0) > 5)).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-orange-500/30 bg-orange-500/10 dark:bg-orange-500/20 dark:border-orange-400/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-orange-500 dark:bg-orange-400 rounded-full"></div>
              <span className="text-sm font-medium text-orange-700 dark:text-orange-300">Poco Stock</span>
            </div>
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mt-1">
              {(products.filter(p => { const stock = p.stock_quantity || 0; return stock > 2 && stock <= 5; })).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-500/30 bg-red-500/10 dark:bg-red-500/20 dark:border-red-400/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 dark:bg-red-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-red-700 dark:text-red-300">¡Últimas!</span>
            </div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
              {(products.filter(p => { const stock = p.stock_quantity || 0; return stock > 0 && stock <= 2; })).length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-destructive/30 bg-destructive/10 dark:bg-destructive/20 dark:border-destructive/50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-destructive dark:bg-red-400 rounded-full"></div>
              <span className="text-sm font-medium text-destructive dark:text-red-300">Agotados</span>
            </div>
            <div className="text-2xl font-bold text-destructive dark:text-red-400 mt-1">
              {(products.filter(p => (p.stock_quantity || 0) === 0)).length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search Bar y Filtros */}
      <div className="space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar productos por nombre, SKU o categoría..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={refetch} 
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            <span className="ml-2">Actualizar</span>
          </Button>
        </div>
        
        {/* Filtros de Stock */}
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={stockFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setStockFilter("all")}
          >
            Todos ({products.length})
          </Button>
          <Button
            variant={stockFilter === "in-stock" ? "default" : "outline"}
            size="sm"
            onClick={() => setStockFilter("in-stock")}
            className="border-green-500 text-green-600 hover:bg-green-50"
          >
            ✅ En Stock ({(products.filter(p => (p.stock_quantity || 0) > 5)).length})
          </Button>
          <Button
            variant={stockFilter === "low-stock" ? "default" : "outline"}
            size="sm"
            onClick={() => setStockFilter("low-stock")}
            className="border-orange-500 text-orange-600 hover:bg-orange-50"
          >
            ⚠️ Poco Stock ({(products.filter(p => { const stock = p.stock_quantity || 0; return stock > 2 && stock <= 5; })).length})
          </Button>
          <Button
            variant={stockFilter === "very-low-stock" ? "default" : "outline"}
            size="sm"
            onClick={() => setStockFilter("very-low-stock")}
            className="border-red-500 text-red-600 hover:bg-red-50"
          >
            🚨 ¡Últimas! ({(products.filter(p => { const stock = p.stock_quantity || 0; return stock > 0 && stock <= 2; })).length})
          </Button>
          <Button
            variant={stockFilter === "out-of-stock" ? "default" : "outline"}
            size="sm"
            onClick={() => setStockFilter("out-of-stock")}
            className="border-destructive text-destructive hover:bg-destructive/10"
          >
            ❌ Agotados ({(products.filter(p => (p.stock_quantity || 0) === 0)).length})
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          // Skeleton loading
          [...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-md">
              <CardHeader>
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-16 mr-2" />
                <Skeleton className="h-8 w-16" />
              </CardFooter>
            </Card>
          ))
        ) : filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No se encontraron productos</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Intenta con otros términos de búsqueda" : "No hay productos disponibles"}
            </p>
          </div>
        ) : (
          filteredProducts.map((product) => {
            const stock = product.stock_quantity || 0;
            const isLowStock = stock <= 5;
            const isVeryLowStock = stock <= 2;
            const isOutOfStock = stock === 0;
            
            return (
            <Card 
              key={product.id} 
              className={`shadow-md hover:shadow-lg transition-all ${
                isOutOfStock ? 'border-destructive border-2 opacity-75' :
                isVeryLowStock ? 'border-destructive border-2' : 
                isLowStock ? 'border-orange-500 border-2' : 
                'hover:border-primary'
              }`}
            >
              <CardHeader>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`p-2 rounded-lg ${
                    isOutOfStock ? 'bg-destructive' :
                    isVeryLowStock ? 'bg-destructive/80' :
                    isLowStock ? 'bg-orange-500' :
                    'bg-gradient-hero'
                  }`}>
                    <Package className="h-5 w-5 text-white" />
                  </div>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                </div>
                {product.short_description && (
                  <CardDescription className="line-clamp-2">{product.short_description}</CardDescription>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Precio:</span>
                    <div className="text-right">
                      {product.sale_price ? (
                        <>
                          <div className="font-semibold text-primary text-destructive">
                            ${(parseFloat(product.sale_price) * 1.21).toFixed(2)} (con IVA)
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${product.sale_price} (sin IVA)
                          </div>
                          <div className="text-xs text-muted-foreground line-through">
                            ${(parseFloat(product.regular_price) * 1.21).toFixed(2)} (con IVA)
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-semibold text-primary">
                            ${(parseFloat(product.price) * 1.21).toFixed(2)} (con IVA)
                          </div>
                          <div className="text-xs text-muted-foreground">
                            ${product.price} (sin IVA)
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Stock con indicador visual */}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Stock:</span>
                    <div className={`text-xs font-semibold px-2 py-1 rounded-md inline-block ${
                      isOutOfStock 
                        ? 'bg-destructive/10 text-destructive' 
                        : isVeryLowStock 
                          ? 'bg-destructive/10 text-destructive animate-pulse' 
                          : isLowStock 
                            ? 'bg-orange-100 text-orange-600'
                            : 'bg-green-100 text-green-600'
                    }`}>
                      {isOutOfStock ? '❌ Agotado' : 
                       isVeryLowStock ? '⚠️ ¡ÚLTIMAS! ' : 
                       isLowStock ? '⚠️ Poco stock: ' : 
                       '✅ Stock: '}
                      {stock}
                    </div>
                  </div>
                  
                  {product.sku && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">SKU:</span>
                      <span>{product.sku}</span>
                    </div>
                  )}
                  {product.categories && product.categories.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Categoría:</span>
                      <span>{product.categories[0].name}</span>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex gap-2">
                <PermissionGate permission="edit_product">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openEditDialog(product)} 
                    className="flex-1"
                    disabled={false}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                </PermissionGate>
                <PermissionGate permission="delete_product">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setDeleteProduct(product)} 
                    className="text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </PermissionGate>
              </CardFooter>
            </Card>
            );
          })
        )}
      </div>

      {!loading && products.length === 0 && (
        <Card className="shadow-md">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No se encontraron productos</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Intenta con otros términos de búsqueda' : 'No hay productos en tu tienda'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteProduct} onOpenChange={() => setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar producto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el producto "{deleteProduct?.name}" de tu tienda WooCommerce.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}