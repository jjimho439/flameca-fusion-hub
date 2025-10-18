import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useHoldedDocuments, HoldedDocument } from "@/hooks/useHoldedDocuments";
import { PermissionGate } from "@/components/PermissionGate";
import { useLocalPDF, LocalInvoiceData } from "@/hooks/useLocalPDF";
import { useWooCommerceProducts } from "@/hooks/useWooCommerceProducts";
import { useEmail } from "@/hooks/useEmail";
import { useAppSettings } from "@/hooks/useAppSettings";
import { 
  FileText, 
  Download, 
  DollarSign, 
  Search, 
  Filter, 
  RefreshCw,
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
  Send,
  Eye,
  Trash2,
  Mail,
  CreditCard,
  FileDown,
  Calendar,
  Plus
} from "lucide-react";
import { toast } from "sonner";

const statusLabels = {
  draft: "Borrador",
  sent: "Enviada",
  paid: "Pagada",
  cancelled: "Cancelada",
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
  sent: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  paid: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
};

const statusIcons = {
  draft: Clock,
  sent: AlertCircle,
  paid: CheckCircle,
  cancelled: XCircle,
};

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedDocument, setSelectedDocument] = useState<HoldedDocument | null>(null);
  const [showDocumentDialog, setShowDocumentDialog] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [showLocalPDFDialog, setShowLocalPDFDialog] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  
  // Estado para el formulario de PDF local
  const [localInvoiceData, setLocalInvoiceData] = useState<LocalInvoiceData>({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    customerAddress: "",
    customerCif: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().split('T')[0],
    items: [],
    subtotal: 0,
    tax: 0,
    total: 0,
    notes: ""
  });

  const { 
    documents: holdedDocuments, 
    loading: holdedLoading,
    listDocuments,
    sendDocument,
    payDocument,
    downloadDocumentPDF,
    deleteDocument
  } = useHoldedDocuments();

  const { generatePDF, isGenerating } = useLocalPDF();
  const { products } = useWooCommerceProducts();
  const { sendInvoiceEmail, isSending } = useEmail();
  const { settings } = useAppSettings();

  useEffect(() => {
    listDocuments({ type: 'invoice' });
  }, [listDocuments]);

  const filteredHoldedDocuments = holdedDocuments.filter(doc => {
    const matchesSearch = (doc.customer_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (doc.customer_email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || doc.status === statusFilter;
    const matchesType = typeFilter === "all" || doc.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const documentStats = {
    total: holdedDocuments.length,
    draft: holdedDocuments.filter(d => d.status === 'draft').length,
    sent: holdedDocuments.filter(d => d.status === 'sent').length,
    paid: holdedDocuments.filter(d => d.status === 'paid').length,
    cancelled: holdedDocuments.filter(d => d.status === 'cancelled').length,
  };

  const handleSendDocument = async () => {
    if (!selectedDocument) return;
    
    try {
      await sendDocument(selectedDocument.holded_id, {
        to: emailTo,
        subject: emailSubject,
        message: emailMessage
      });
      toast.success("Documento enviado correctamente");
      setShowSendDialog(false);
      setEmailTo("");
      setEmailSubject("");
      setEmailMessage("");
      listDocuments({ type: 'invoice' });
    } catch (error: any) {
      toast.error("Error al enviar documento: " + (error.message || "Error desconocido"));
    }
  };

  const handlePayDocument = async (documentId: string) => {
    try {
      await payDocument(documentId);
      toast.success("Documento marcado como pagado");
      listDocuments({ type: 'invoice' });
    } catch (error: any) {
      toast.error("Error al marcar como pagado: " + (error.message || "Error desconocido"));
    }
  };

  const handleDownloadPDF = async (documentId: string) => {
    try {
      await downloadDocumentPDF(documentId);
    } catch (error: any) {
      toast.error("Error al descargar PDF: " + (error.message || "Error desconocido"));
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este documento?")) return;
    
    try {
      await deleteDocument(documentId);
      toast.success("Documento eliminado correctamente");
      listDocuments({ type: 'invoice' });
    } catch (error: any) {
      toast.error("Error al eliminar documento: " + (error.message || "Error desconocido"));
    }
  };

  const handleGenerateLocalPDF = () => {
    // Generar número de factura automático con serie
    const series = settings.invoiceSeries || "A";
    const timestamp = Date.now().toString().slice(-6); // Últimos 6 dígitos
    const invoiceNumber = `${series}-${timestamp}`;
    setLocalInvoiceData(prev => ({
      ...prev,
      invoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0]
    }));
    setShowLocalPDFDialog(true);
  };

  const handleGeneratePDF = async () => {
    if (!localInvoiceData.customerName.trim()) {
      toast.error("El nombre del cliente es obligatorio");
      return;
    }
    
    if (localInvoiceData.items.length === 0) {
      toast.error("Debe agregar al menos un producto");
      return;
    }

    // Validar que todos los productos tengan nombre
    const hasEmptyProducts = localInvoiceData.items.some(item => !item.name.trim());
    if (hasEmptyProducts) {
      toast.error("Todos los productos deben tener un nombre seleccionado");
      return;
    }

    // Calcular totales usando el tipo de IVA configurado
    const subtotal = localInvoiceData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * (settings.ivaRate / 100);
    const total = subtotal + tax;

    const invoiceDataWithTotals = {
      ...localInvoiceData,
      subtotal,
      tax,
      total
    };

    await generatePDF(invoiceDataWithTotals);
    setShowLocalPDFDialog(false);
  };

  const handleSendInvoiceEmail = async () => {
    if (!localInvoiceData.customerName.trim()) {
      toast.error("El nombre del cliente es obligatorio");
      return;
    }
    
    if (!localInvoiceData.customerEmail.trim()) {
      toast.error("El email del cliente es obligatorio para enviar por correo");
      return;
    }
    
    if (localInvoiceData.items.length === 0) {
      toast.error("Debe agregar al menos un producto");
      return;
    }

    // Validar que todos los productos tengan nombre
    const hasEmptyProducts = localInvoiceData.items.some(item => !item.name.trim());
    if (hasEmptyProducts) {
      toast.error("Todos los productos deben tener un nombre seleccionado");
      return;
    }

    // Calcular totales usando el tipo de IVA configurado
    const subtotal = localInvoiceData.items.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = subtotal * (settings.ivaRate / 100);
    const total = subtotal + tax;

    const invoiceDataWithTotals = {
      ...localInvoiceData,
      subtotal,
      tax,
      total
    };

    try {
      // Generar PDF y enviarlo por correo
      await sendInvoiceEmail(localInvoiceData.customerEmail, invoiceDataWithTotals);
      setShowLocalPDFDialog(false);
    } catch (error) {
      console.error("Error sending invoice email:", error);
    }
  };

  const handleViewDocument = (document: HoldedDocument) => {
    setSelectedDocument(document);
    setShowDocumentDialog(true);
  };

  const formatCurrency = (amount: number) => {
    if (isNaN(amount) || amount === null || amount === undefined) {
      return '0,00 €';
    }
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString || dateString === 'Invalid Date') {
      return 'Sin fecha';
    }
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Sin fecha';
    }
    return date.toLocaleDateString('es-ES');
  };

  if (holdedLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Cargando facturas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Facturas Holded
          </h1>
            <p className="text-muted-foreground text-lg">Gestiona todas tus facturas desde Holded</p>
        </div>
          <PermissionGate permission="create_invoice">
          <Button 
              onClick={handleGenerateLocalPDF}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              size="lg"
            >
              <FileText className="mr-2 h-4 w-4" />
              Generar PDF Local
          </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total</p>
                <p className="text-2xl font-bold">{documentStats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Borradores</p>
                <p className="text-2xl font-bold">{documentStats.draft}</p>
              </div>
              <Clock className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Enviadas</p>
                <p className="text-2xl font-bold">{documentStats.sent}</p>
            </div>
              <AlertCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pagadas</p>
                <p className="text-2xl font-bold">{documentStats.paid}</p>
            </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Canceladas</p>
                <p className="text-2xl font-bold">{documentStats.cancelled}</p>
            </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                  placeholder="Buscar por cliente o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="draft">Borrador</SelectItem>
                <SelectItem value="sent">Enviada</SelectItem>
                <SelectItem value="paid">Pagada</SelectItem>
                <SelectItem value="cancelled">Cancelada</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="invoice">Factura</SelectItem>
                <SelectItem value="estimate">Presupuesto</SelectItem>
                <SelectItem value="receipt">Recibo</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={() => listDocuments({ type: 'invoice' })}
              variant="outline"
              className="w-full sm:w-auto"
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Actualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Facturas */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Facturas</h2>
            <p className="text-sm text-muted-foreground">
              {filteredHoldedDocuments.length} {filteredHoldedDocuments.length === 1 ? 'factura' : 'facturas'} encontradas
            </p>
              </div>
              </div>
        
        {filteredHoldedDocuments.length === 0 ? (
          <Card className="shadow-md">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No hay facturas</h3>
              <p className="text-muted-foreground">Las facturas aparecerán aquí cuando se creen desde los pedidos</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredHoldedDocuments.map((document, index) => {
              const StatusIcon = statusIcons[document.status as keyof typeof statusIcons] || Clock;
              
                return (
                <Card 
                  key={document.holded_id} 
                  className="shadow-md hover:shadow-lg transition-all duration-300 border-l-4 border-l-primary/20 hover:border-l-primary animate-in slide-in-from-bottom-4"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <CardContent className="pt-6">
                    <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6">
                      {/* Información del Documento */}
                      <div className="space-y-4 flex-1">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                                <FileText className="h-5 w-5 text-primary" />
                              </div>
                              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-background ${
                                document.status === 'paid' ? 'bg-green-500' :
                                document.status === 'sent' ? 'bg-blue-500' :
                                document.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                              }`}></div>
                            </div>
                            <div>
                              <p className="font-semibold text-xl">{document.customer_name || 'Sin nombre'}</p>
                              <p className="text-sm text-muted-foreground">{document.customer_email || 'Sin email'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-2xl font-bold text-primary">{formatCurrency(document.total_amount)}</span>
                            <Badge className={statusColors[document.status as keyof typeof statusColors]}>
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {statusLabels[document.status as keyof typeof statusLabels]}
                            </Badge>
                          </div>
                          </div>
                          
                        {/* Información adicional */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <FileText className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">ID Holded</p>
                              <p className="font-medium">{document.holded_id}</p>
                            </div>
                            </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <Calendar className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Fecha</p>
                              <p className="font-medium">{formatDate(document.date)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                            <CreditCard className="h-5 w-5 text-primary" />
                            <div>
                              <p className="text-xs text-muted-foreground">Vencimiento</p>
                              <p className="font-medium">{formatDate(document.due_date)}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Items */}
                        {document.items && document.items.length > 0 && (
                          <div className="space-y-2">
                            <p className="text-sm font-medium text-muted-foreground">Productos</p>
                            <div className="space-y-1">
                              {document.items.slice(0, 3).map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                                  <span className="text-sm">{item.name}</span>
                                  <span className="text-sm font-medium">{item.quantity}x {formatCurrency(item.price)}</span>
                                </div>
                              ))}
                              {document.items.length > 3 && (
                                <p className="text-xs text-muted-foreground">+{document.items.length - 3} productos más</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Acciones */}
                      <div className="flex flex-col gap-2 xl:min-w-[200px]">
                        <Button
                          onClick={() => handleViewDocument(document)}
                          variant="outline"
                          className="w-full"
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Ver Detalles
                        </Button>

                        <Button
                          onClick={() => handleDownloadPDF(document.holded_id)}
                          variant="outline"
                          className="w-full"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Descargar PDF
                        </Button>

                        {document.status === 'draft' && (
                          <Button
                            onClick={() => {
                              setSelectedDocument(document);
                              setEmailTo(document.customer_email || '');
                              setEmailSubject(`Factura ${document.holded_id}`);
                              setEmailMessage("Adjunto encontrará su factura.");
                              setShowSendDialog(true);
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            <Send className="mr-2 h-4 w-4" />
                            Enviar por Email
                          </Button>
                        )}

                        {document.status === 'sent' && (
                          <Button
                            onClick={() => handlePayDocument(document.holded_id)}
                            className="w-full bg-green-600 hover:bg-green-700"
                          >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Marcar como Pagado
                          </Button>
                        )}

                        <PermissionGate permission="delete_invoice">
                          <Button
                            onClick={() => handleDeleteDocument(document.holded_id)}
                            variant="destructive"
                            className="w-full"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                            </Button>
                        </PermissionGate>
                      </div>
                      </div>
                    </CardContent>
                  </Card>
                );
            })}
          </div>
        )}
      </div>

      {/* Dialog para ver documento */}
      <Dialog open={showDocumentDialog} onOpenChange={setShowDocumentDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles del Documento</DialogTitle>
            <DialogDescription>
              Información completa del documento en Holded
            </DialogDescription>
          </DialogHeader>
          
          {selectedDocument && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Cliente</Label>
                  <p className="text-sm text-muted-foreground">{selectedDocument.customer_name || 'Sin nombre'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Email</Label>
                  <p className="text-sm text-muted-foreground">{selectedDocument.customer_email || 'Sin email'}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Total</Label>
                  <p className="text-sm text-muted-foreground">{formatCurrency(selectedDocument.total_amount)}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Estado</Label>
                  <Badge className={statusColors[selectedDocument.status as keyof typeof statusColors]}>
                    {statusLabels[selectedDocument.status as keyof typeof statusLabels]}
                  </Badge>
                </div>
              </div>

              {selectedDocument.items && selectedDocument.items.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Productos</Label>
                  <div className="space-y-2 mt-2">
                    {selectedDocument.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-muted rounded">
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                        </div>
                        <p className="font-medium">{formatCurrency(item.price * item.quantity)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedDocument.notes && (
                <div>
                  <Label className="text-sm font-medium">Notas</Label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedDocument.notes}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog para enviar documento */}
      <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar Documento por Email</DialogTitle>
            <DialogDescription>
              Envía este documento al cliente por correo electrónico
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email del destinatario</Label>
              <Input
                id="email"
                type="email"
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                placeholder="cliente@ejemplo.com"
              />
            </div>
            
            <div>
              <Label htmlFor="subject">Asunto</Label>
              <Input
                id="subject"
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                placeholder="Asunto del email"
              />
            </div>
            
            <div>
              <Label htmlFor="message">Mensaje</Label>
              <Textarea
                id="message"
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                placeholder="Mensaje personalizado..."
                rows={4}
              />
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowSendDialog(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSendDocument}>
                <Send className="mr-2 h-4 w-4" />
                Enviar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog para generar PDF local */}
      <Dialog open={showLocalPDFDialog} onOpenChange={setShowLocalPDFDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Generar Factura PDF Local</DialogTitle>
            <DialogDescription>
              Crea una factura PDF local para clientes en tienda
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                          <div>
                <Label htmlFor="customerName">Nombre del Cliente *</Label>
                <Input
                  id="customerName"
                  value={localInvoiceData.customerName}
                  onChange={(e) => setLocalInvoiceData(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="Nombre completo del cliente"
                />
                          </div>
                          <div>
                <Label htmlFor="customerEmail">Email del Cliente</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={localInvoiceData.customerEmail}
                  onChange={(e) => setLocalInvoiceData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  placeholder="cliente@ejemplo.com"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerPhone">Teléfono</Label>
                <Input
                  id="customerPhone"
                  value={localInvoiceData.customerPhone}
                  onChange={(e) => setLocalInvoiceData(prev => ({ ...prev, customerPhone: e.target.value }))}
                  placeholder="+34 123 456 789"
                />
                          </div>
                          <div>
                <Label htmlFor="customerAddress">Dirección</Label>
                <Input
                  id="customerAddress"
                  value={localInvoiceData.customerAddress}
                  onChange={(e) => setLocalInvoiceData(prev => ({ ...prev, customerAddress: e.target.value }))}
                  placeholder="Dirección del cliente"
                />
                          </div>
                          <div>
                <Label htmlFor="customerCif">CIF/NIF del Cliente</Label>
                <Input
                  id="customerCif"
                  value={localInvoiceData.customerCif || ""}
                  onChange={(e) => setLocalInvoiceData(prev => ({ ...prev, customerCif: e.target.value }))}
                  placeholder="A12345678 (opcional)"
                />
                          </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="invoiceNumber">Número de Factura</Label>
                <Input
                  id="invoiceNumber"
                  value={localInvoiceData.invoiceNumber}
                  onChange={(e) => setLocalInvoiceData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  placeholder="FAC-2024-001"
                />
              </div>
              <div>
                <Label htmlFor="invoiceDate">Fecha de Factura</Label>
                <Input
                  id="invoiceDate"
                  type="date"
                  value={localInvoiceData.invoiceDate}
                  onChange={(e) => setLocalInvoiceData(prev => ({ ...prev, invoiceDate: e.target.value }))}
                />
                        </div>
                      </div>
                      
            {/* Sección de productos */}
            <div>
              <Label>Productos</Label>
              <div className="space-y-2 mt-2">
                {localInvoiceData.items.map((item, index) => (
                  <div key={index} className="flex items-center gap-2 p-2 bg-muted rounded">
                    <Select
                      value={item.name}
                      onValueChange={(productName) => {
                        const selectedProduct = products.find(p => p.name === productName);
                        if (selectedProduct) {
                          const newItems = [...localInvoiceData.items];
                          newItems[index].name = selectedProduct.name;
                          newItems[index].price = parseFloat(selectedProduct.price); // Precio sin IVA
                          newItems[index].subtotal = newItems[index].quantity * newItems[index].price;
                          setLocalInvoiceData(prev => ({ ...prev, items: newItems }));
                        }
                      }}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Seleccionar producto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.name}>
                            <div className="flex items-center justify-between w-full">
                              <span>{product.name}</span>
                              <div className="text-sm text-muted-foreground ml-2 text-right">
                                <div>{parseFloat(product.price).toFixed(2)}€ (sin IVA)</div>
                                <div className="text-xs">{(parseFloat(product.price) * 1.21).toFixed(2)}€ (con IVA)</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newItems = [...localInvoiceData.items];
                        newItems[index].quantity = Number(e.target.value);
                        newItems[index].subtotal = newItems[index].quantity * newItems[index].price;
                        setLocalInvoiceData(prev => ({ ...prev, items: newItems }));
                      }}
                      placeholder="Cantidad"
                      className="w-20"
                    />
                    <div className="text-sm font-medium w-24 text-right">
                      <div>{item.price.toFixed(2)}€</div>
                      <div className="text-xs text-muted-foreground">{(item.price * 1.21).toFixed(2)}€ (con IVA)</div>
                    </div>
                    <div className="text-sm font-medium w-20 text-right">
                      <div>{item.subtotal.toFixed(2)}€</div>
                      <div className="text-xs text-muted-foreground">{(item.subtotal * 1.21).toFixed(2)}€</div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newItems = localInvoiceData.items.filter((_, i) => i !== index);
                        setLocalInvoiceData(prev => ({ ...prev, items: newItems }));
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                        </div>
                ))}
                        
                        <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setLocalInvoiceData(prev => ({
                      ...prev,
                      items: [...prev.items, { name: "", quantity: 1, price: 0, subtotal: 0 }]
                    }));
                  }}
                  className="w-full"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Agregar Producto
                        </Button>

                {/* Resumen de totales */}
                {localInvoiceData.items.length > 0 && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span>Subtotal:</span>
                      <span className="font-medium">
                        {localInvoiceData.items.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2)}€
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-sm mt-1">
                      <span>IVA (21%):</span>
                      <span className="font-medium">
                        {(localInvoiceData.items.reduce((sum, item) => sum + item.subtotal, 0) * 0.21).toFixed(2)}€
                      </span>
                      </div>
                    <div className="flex justify-between items-center text-base font-bold mt-2 pt-2 border-t">
                      <span>Total:</span>
                      <span>
                        {(localInvoiceData.items.reduce((sum, item) => sum + item.subtotal, 0) * 1.21).toFixed(2)}€
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="invoiceNotes">Notas</Label>
              <Textarea
                id="invoiceNotes"
                value={localInvoiceData.notes}
                onChange={(e) => setLocalInvoiceData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Notas adicionales para la factura..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowLocalPDFDialog(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleGeneratePDF}
                disabled={isGenerating || isSending}
                variant="outline"
              >
                <FileText className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generando...' : 'Generar PDF'}
              </Button>
              <Button 
                onClick={handleSendInvoiceEmail}
                disabled={isSending || isGenerating}
              >
                <Send className="mr-2 h-4 w-4" />
                {isSending ? 'Enviando...' : 'Enviar por Correo'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}