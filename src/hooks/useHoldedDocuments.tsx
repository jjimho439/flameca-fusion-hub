import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Tipos según la documentación de Holded
export interface HoldedDocument {
  holded_id: string;
  type: 'invoice' | 'salesreceipt' | 'creditnote' | 'receiptnote' | 'estimate' | 'salesorder' | 'waybill' | 'proform' | 'purchase' | 'purchaserefund' | 'purchaseorder';
  customer_name: string;
  customer_email: string;
  customer_phone?: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
    sku?: string;
    description?: string;
  }>;
  total_amount: number;
  notes?: string;
  status?: 'draft' | 'sent' | 'paid' | 'cancelled';
  date?: string;
  due_date?: string;
  currency?: string;
  language?: string;
  created_at: string;
  updated_at: string;
}

export interface HoldedContact {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  type: 'customer' | 'supplier';
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
}

interface HoldedResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export function useHoldedDocuments() {
  const [loading, setLoading] = useState(false);
  const [documents, setDocuments] = useState<HoldedDocument[]>([]);
  const [contacts, setContacts] = useState<HoldedContact[]>([]);

  // Función genérica para llamar a la API de Holded
  const callHoldedAPI = useCallback(async <T = any>(
    action: string, 
    params: any = {}
  ): Promise<HoldedResponse<T>> => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('holded-documents', {
        body: { action, ...params }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error(`Error en ${action}:`, error);
      toast.error(`Error en ${action}: ${error.message}`);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // DOCUMENTOS

  // Listar documentos
  const listDocuments = useCallback(async (filters?: {
    type?: HoldedDocument['type'];
    status?: HoldedDocument['status'];
    limit?: number;
    offset?: number;
  }) => {
    const result = await callHoldedAPI<{ documents: HoldedDocument[] }>('list_documents', filters);
    if (result.success && result.documents) {
      setDocuments(result.documents);
    }
    return result;
  }, [callHoldedAPI]);

  // Obtener documento específico
  const getDocument = useCallback(async (documentId: string) => {
    return await callHoldedAPI<{ document: HoldedDocument }>('get_document', { documentId });
  }, [callHoldedAPI]);

  // Crear documento
  const createDocument = useCallback(async (document: HoldedDocument) => {
    const result = await callHoldedAPI<{ document: HoldedDocument }>('create_document', { document });
    if (result.success) {
      toast.success('Documento creado correctamente en Holded');
      // Actualizar lista de documentos
      await listDocuments();
    }
    return result;
  }, [callHoldedAPI, listDocuments]);

  // Actualizar documento
  const updateDocument = useCallback(async (documentId: string, document: Partial<HoldedDocument>) => {
    const result = await callHoldedAPI<{ document: HoldedDocument }>('update_document', { 
      documentId, 
      document 
    });
    if (result.success) {
      toast.success('Documento actualizado correctamente');
      // Actualizar lista de documentos
      await listDocuments();
    }
    return result;
  }, [callHoldedAPI, listDocuments]);

  // Eliminar documento
  const deleteDocument = useCallback(async (documentId: string) => {
    const result = await callHoldedAPI('delete_document', { documentId });
    if (result.success) {
      toast.success('Documento eliminado correctamente');
      // Actualizar lista de documentos
      await listDocuments();
    }
    return result;
  }, [callHoldedAPI, listDocuments]);

  // Enviar documento por email
  const sendDocument = useCallback(async (
    documentId: string, 
    email: string, 
    subject?: string, 
    message?: string
  ) => {
    const result = await callHoldedAPI('send_document', { 
      documentId, 
      email, 
      subject, 
      message 
    });
    if (result.success) {
      toast.success('Documento enviado correctamente');
    }
    return result;
  }, [callHoldedAPI]);

  // Marcar documento como pagado
  const payDocument = useCallback(async (
    documentId: string, 
    amount?: number, 
    paymentMethod?: string
  ) => {
    const result = await callHoldedAPI('pay_document', { 
      documentId, 
      amount, 
      paymentMethod 
    });
    if (result.success) {
      toast.success('Documento marcado como pagado');
      // Actualizar lista de documentos
      await listDocuments();
    }
    return result;
  }, [callHoldedAPI, listDocuments]);

  // Obtener PDF del documento
  const getDocumentPDF = useCallback(async (documentId: string) => {
    return await callHoldedAPI<{ pdfUrl: string }>('get_document_pdf', { documentId });
  }, [callHoldedAPI]);

  // Descargar PDF del documento
  const downloadDocumentPDF = useCallback(async (documentId: string, documentType: string = 'invoice') => {
    try {
      // Buscar el documento en la lista local
      const document = documents.find(doc => doc.holded_id === documentId);
      
      if (!document) {
        toast.error('Documento no encontrado');
        return { success: false, error: 'Documento no encontrado' };
      }
      
      // Importar jsPDF
      const { default: jsPDF } = await import('jspdf');
      
      // Configuraciones por defecto (se pueden mejorar después)
      const settings = {
        primaryColor: '#dc2626',
        companyName: 'Flamenco Fusion Hub',
        storeName: 'Flamenco Fusion Hub',
        cif: '',
        fiscalAddress: '',
        postalCode: '',
        city: '',
        province: '',
        country: 'España',
        storePhone: '',
        storeEmail: '',
        storeWebsite: '',
        bankName: '',
        bankAccount: '',
        ivaRate: 21
      };
      
      // Generar PDF usando la misma plantilla profesional
      const doc = new jsPDF();
      
      // Configurar fuente
      doc.setFont('helvetica');
      
      // Función para convertir hex a RGB
      const hexToRgb = (hex: string) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16)
        } : { r: 41, g: 128, b: 185 }; // Color por defecto
      };
      
      const primaryColor = hexToRgb(settings.primaryColor);
      
      // === ENCABEZADO PROFESIONAL ===
      
      // Barra vertical izquierda
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.rect(0, 0, 8, 297, 'F'); // Barra vertical completa
      
      // Título FACTURA (grande y centrado)
      doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('FACTURA', 105, 25, { align: 'center' });
      
      // Barra de número y fecha
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.rect(20, 35, 170, 12, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text(`Número de factura: ${document.holded_id}`, 25, 42);
      doc.text(`Fecha: ${document.date ? new Date(document.date).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES')}`, 25, 46);
      
      // Logo placeholder (esquina superior derecha)
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.rect(150, 15, 40, 15, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('TU LOGO', 170, 23, { align: 'center' });
      
      // === DATOS DE LA EMPRESA Y CLIENTE ===
      let yPos = 60;
      
      // Datos de la empresa (izquierda) - OBLIGATORIOS PARA FACTURA LEGAL
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(settings.companyName || settings.storeName || 'Flamenco Fusion Hub', 20, yPos);
      yPos += 8;
      
      // CIF/NIF OBLIGATORIO
      if (settings.cif) {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text(`CIF/NIF: ${settings.cif}`, 20, yPos);
        yPos += 6;
      }
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      if (settings.fiscalAddress) {
        doc.text(settings.fiscalAddress, 20, yPos);
        yPos += 6;
      }
      if (settings.postalCode && settings.city) {
        doc.text(`${settings.postalCode} ${settings.city}`, 20, yPos);
        yPos += 6;
      }
      if (settings.province) {
        doc.text(settings.province, 20, yPos);
        yPos += 6;
      }
      if (settings.country) {
        doc.text(settings.country, 20, yPos);
        yPos += 6;
      }
      if (settings.storePhone) {
        doc.text(`Tel: ${settings.storePhone}`, 20, yPos);
        yPos += 6;
      }
      if (settings.storeEmail) {
        doc.text(`Email: ${settings.storeEmail}`, 20, yPos);
        yPos += 6;
      }
      if (settings.storeWebsite) {
        doc.text(`Web: ${settings.storeWebsite}`, 20, yPos);
      }
      
      // Datos del cliente (derecha)
      yPos = 60;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('EMPRESA COMPRADORA', 110, yPos);
      yPos += 8;
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(document.customer_name || 'Cliente', 110, yPos);
      yPos += 6;
      
      if (document.customer_email) {
        doc.text(document.customer_email, 110, yPos);
        yPos += 6;
      }
      
      if (document.customer_phone) {
        doc.text(`Tel: ${document.customer_phone}`, 110, yPos);
      }
      
      // === TABLA DE PRODUCTOS ===
      yPos = 100;
      
      // Encabezado de la tabla
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.rect(20, yPos, 170, 12, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Producto/Servicio', 25, yPos + 8);
      doc.text('Precio unitario', 120, yPos + 8);
      doc.text('Cantidad', 150, yPos + 8);
      doc.text('Total', 170, yPos + 8);
      
      yPos += 12;
      
      // Productos
      doc.setTextColor(0, 0, 0);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      
      if (document.items && document.items.length > 0) {
        document.items.forEach((item: any, index: number) => {
          // Línea separadora
          doc.setDrawColor(200, 200, 200);
          doc.line(20, yPos, 190, yPos);
          yPos += 3;
          
          // Nombre del producto
          doc.text(item.name || 'Producto', 25, yPos);
          
          // Precio unitario
          doc.text(`${item.price ? item.price.toFixed(2) : '0.00'}€`, 120, yPos);
          
          // Cantidad
          doc.text((item.quantity || 1).toString(), 150, yPos);
          
          // Total
          doc.text(`${item.subtotal ? item.subtotal.toFixed(2) : '0.00'}€`, 170, yPos);
          
          yPos += 8;
        });
      } else {
        // Línea separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos, 190, yPos);
        yPos += 3;
        
        doc.text('No hay productos', 25, yPos);
        yPos += 8;
      }
      
      // Línea final de la tabla
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, 190, yPos);
      
      // === TOTALES ===
      yPos += 15;
      
      // Subtotal
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('SUBTOTAL', 120, yPos);
      doc.text(`${document.total_amount ? document.total_amount.toFixed(2) : '0.00'}€`, 170, yPos);
      yPos += 8;
      
      // Descuento (siempre 0% por ahora)
      doc.text('DESCUENTO', 120, yPos);
      doc.text('0%', 150, yPos);
      doc.text('0,00€', 170, yPos);
      yPos += 8;
      
      // IVA
      doc.text('IVA', 120, yPos);
      doc.text(`${settings.ivaRate || 21}%`, 150, yPos);
      const tax = document.total_amount ? (document.total_amount * (settings.ivaRate || 21) / 100) : 0;
      doc.text(`${tax.toFixed(2)}€`, 170, yPos);
      yPos += 8;
      
      // Total final
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.rect(120, yPos - 5, 70, 12, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL', 125, yPos + 3);
      const total = document.total_amount ? (document.total_amount + tax) : 0;
      doc.text(`${total.toFixed(2)}€`, 170, yPos + 3);
      
      // === MÉTODOS DE PAGO ===
      yPos += 25;
      
      // Encabezado métodos de pago
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.rect(20, yPos, 170, 12, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('MÉTODOS DE PAGO', 25, yPos + 8);
      
      yPos += 15;
      
      // Datos bancarios
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      if (settings.bankName) {
        doc.text('Nombre del banco:', 25, yPos);
        doc.text(settings.bankName, 25, yPos + 6);
        yPos += 12;
      }
      
      doc.text('Nombre de la empresa:', 25, yPos);
      doc.text(settings.companyName || settings.storeName || 'Flamenco Fusion Hub', 25, yPos + 6);
      yPos += 12;
      
      if (settings.bankAccount) {
        doc.text('Cuenta de banco:', 25, yPos);
        doc.text(settings.bankAccount, 25, yPos + 6);
        yPos += 12;
      }
      
      if (settings.storeEmail) {
        doc.text('PayPal:', 25, yPos);
        doc.text(settings.storeEmail, 25, yPos + 6);
      }
      
      // === INFORMACIÓN LEGAL OBLIGATORIA ===
      yPos += 20;
      
      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, 190, yPos);
      yPos += 10;
      
      // Información legal
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('INFORMACIÓN LEGAL:', 20, yPos);
      yPos += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      
      // Condiciones de pago
      doc.text('• Condiciones de pago: Pago al contado', 20, yPos);
      yPos += 5;
      
      // Plazo de entrega
      doc.text('• Plazo de entrega: Inmediato', 20, yPos);
      yPos += 5;
      
      // Descuento por pronto pago
      doc.text('• Descuento por pronto pago: No aplicable', 20, yPos);
      yPos += 5;
      
      // Retención IRPF (si aplica)
      doc.text('• Retención IRPF: No aplicable', 20, yPos);
      yPos += 5;
      
      // Régimen fiscal
      doc.text('• Régimen fiscal: Régimen general del IVA', 20, yPos);
      yPos += 5;
      
      // Información sobre devoluciones
      doc.text('• Devoluciones: Según política de la empresa', 20, yPos);
      yPos += 5;
      
      // Información sobre garantías
      doc.text('• Garantías: Según normativa vigente', 20, yPos);
      yPos += 5;
      
      // Texto legal sobre facturación
      doc.text('• Esta factura se emite conforme a la normativa fiscal vigente', 20, yPos);
      yPos += 5;
      
      // Información sobre conservación
      doc.text('• Conservar esta factura durante 4 años', 20, yPos);
      yPos += 10;
      
      // === NOTAS ===
      if (document.notes) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', 20, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        // Dividir texto largo en líneas
        const lines = doc.splitTextToSize(document.notes, 150);
        lines.forEach((line: string) => {
          doc.text(line, 20, yPos);
          yPos += 6;
        });
      }
      
      // Descargar el PDF
      doc.save(`factura-${documentId}.pdf`);
      
      toast.success('PDF generado y descargado correctamente');
      return { success: true };
      
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF: ' + (error.message || 'Error desconocido'));
      return { success: false, error: error.message };
    }
  }, [documents]);

  // CONTACTOS

  // Listar contactos
  const listContacts = useCallback(async (filters?: {
    type?: 'customer' | 'supplier';
    limit?: number;
    offset?: number;
  }) => {
    const result = await callHoldedAPI<{ contacts: HoldedContact[] }>('list_contacts', filters);
    if (result.success && result.data) {
      setContacts(result.data.contacts);
    }
    return result;
  }, [callHoldedAPI]);

  // Obtener contacto específico
  const getContact = useCallback(async (contactId: string) => {
    return await callHoldedAPI<{ contact: HoldedContact }>('get_contact', { contactId });
  }, [callHoldedAPI]);

  // Crear contacto
  const createContact = useCallback(async (contact: HoldedContact) => {
    const result = await callHoldedAPI<{ contact: HoldedContact }>('create_contact', { contact });
    if (result.success) {
      toast.success('Contacto creado correctamente en Holded');
      // Actualizar lista de contactos
      await listContacts();
    }
    return result;
  }, [callHoldedAPI, listContacts]);

  // Actualizar contacto
  const updateContact = useCallback(async (contactId: string, contact: Partial<HoldedContact>) => {
    const result = await callHoldedAPI<{ contact: HoldedContact }>('update_contact', { 
      contactId, 
      contact 
    });
    if (result.success) {
      toast.success('Contacto actualizado correctamente');
      // Actualizar lista de contactos
      await listContacts();
    }
    return result;
  }, [callHoldedAPI, listContacts]);

  // Eliminar contacto
  const deleteContact = useCallback(async (contactId: string) => {
    const result = await callHoldedAPI('delete_contact', { contactId });
    if (result.success) {
      toast.success('Contacto eliminado correctamente');
      // Actualizar lista de contactos
      await listContacts();
    }
    return result;
  }, [callHoldedAPI, listContacts]);

  // FUNCIONES DE UTILIDAD

  // Crear factura desde pedido de WooCommerce
  const createInvoiceFromOrder = useCallback(async (order: {
    id: string;
    customer_name: string;
    customer_email: string;
    customer_phone?: string;
    items: Array<{
      name: string;
      quantity: number;
      unit_price: number;
      sku?: string;
    }>;
    total_amount: number;
    notes?: string;
  }) => {
    console.log("createInvoiceFromOrder received order:", order);
    console.log("Order items:", order.items);
    
    const document: HoldedDocument = {
      type: 'invoice',
      customer: {
        name: order.customer_name,
        email: order.customer_email,
        phone: order.customer_phone,
        type: 'customer'
      },
      items: order.items.map(item => ({
        name: item.name,
        quantity: item.quantity,
        price: item.unit_price,
        sku: item.sku
      })),
      total: order.total_amount,
      notes: order.notes || `Factura generada automáticamente para el pedido ${order.id}`,
      status: 'draft',
      date: new Date().toISOString(),
      currency: 'EUR',
      language: 'es'
    };

    console.log("Document being sent to Holded:", document);
    return await createDocument(document);
  }, [createDocument]);

  // Crear presupuesto
  const createEstimate = useCallback(async (estimate: Omit<HoldedDocument, 'type'>) => {
    const document: HoldedDocument = {
      ...estimate,
      type: 'estimate',
      status: 'draft'
    };
    return await createDocument(document);
  }, [createDocument]);

  // Crear albarán
  const createWaybill = useCallback(async (waybill: Omit<HoldedDocument, 'type'>) => {
    const document: HoldedDocument = {
      ...waybill,
      type: 'waybill',
      status: 'draft'
    };
    return await createDocument(document);
  }, [createDocument]);

  // Crear nota de crédito
  const createCreditNote = useCallback(async (creditNote: Omit<HoldedDocument, 'type'>) => {
    const document: HoldedDocument = {
      ...creditNote,
      type: 'creditnote',
      status: 'draft'
    };
    return await createDocument(document);
  }, [createDocument]);

  // Obtener estadísticas de documentos
  const getDocumentStats = useCallback(() => {
    const stats = {
      total: documents.length,
      draft: documents.filter(d => d.status === 'draft').length,
      sent: documents.filter(d => d.status === 'sent').length,
      paid: documents.filter(d => d.status === 'paid').length,
      cancelled: documents.filter(d => d.status === 'cancelled').length,
      totalAmount: documents.reduce((sum, doc) => sum + doc.total, 0)
    };
    return stats;
  }, [documents]);

  // Filtrar documentos
  const filterDocuments = useCallback((filters: {
    type?: HoldedDocument['type'];
    status?: HoldedDocument['status'];
    customer?: string;
    dateFrom?: string;
    dateTo?: string;
  }) => {
    return documents.filter(doc => {
      if (filters.type && doc.type !== filters.type) return false;
      if (filters.status && doc.status !== filters.status) return false;
      if (filters.customer && !doc.customer.name.toLowerCase().includes(filters.customer.toLowerCase())) return false;
      if (filters.dateFrom && doc.date && new Date(doc.date) < new Date(filters.dateFrom)) return false;
      if (filters.dateTo && doc.date && new Date(doc.date) > new Date(filters.dateTo)) return false;
      return true;
    });
  }, [documents]);

  return {
    // Estado
    loading,
    documents,
    contacts,
    
    // Documentos
    listDocuments,
    getDocument,
    createDocument,
    updateDocument,
    deleteDocument,
    sendDocument,
    payDocument,
    getDocumentPDF,
    downloadDocumentPDF,
    
    // Contactos
    listContacts,
    getContact,
    createContact,
    updateContact,
    deleteContact,
    
    // Funciones de utilidad
    createInvoiceFromOrder,
    createEstimate,
    createWaybill,
    createCreditNote,
    getDocumentStats,
    filterDocuments
  };
}
