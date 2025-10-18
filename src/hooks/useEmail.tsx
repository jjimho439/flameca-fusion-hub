import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAppSettings } from './useAppSettings';

export interface EmailData {
  to: string;
  subject: string;
  body: string;
  attachments?: Array<{
    filename: string;
    content: string; // base64
    type: string;
  }>;
}

export function useEmail() {
  const [isSending, setIsSending] = useState(false);
  const { settings } = useAppSettings();

  const sendEmail = async (emailData: EmailData) => {
    setIsSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-email', {
        body: {
          to: emailData.to,
          subject: emailData.subject,
          body: emailData.body,
          attachments: emailData.attachments || []
        }
      });

      if (error) throw error;

      toast.success("Correo enviado correctamente");
      return data;
      
    } catch (error: any) {
      toast.error("Error al enviar correo: " + (error.message || "Error desconocido"));
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  const sendInvoiceEmail = async (email: string, invoiceData: any) => {
    setIsSending(true);
    
    try {
      // Generar PDF usando jsPDF
      const { default: jsPDF } = await import('jspdf');
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
      doc.text(`Número de factura: ${invoiceData.invoiceNumber}`, 25, 42);
      doc.text(`Fecha: ${new Date(invoiceData.invoiceDate).toLocaleDateString('es-ES')}`, 25, 46);
      
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
      doc.text(settings.companyName || settings.storeName, 20, yPos);
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
      doc.text(invoiceData.customerName, 110, yPos);
      yPos += 6;
      
      if (invoiceData.customerCif) {
        doc.text(`CIF: ${invoiceData.customerCif}`, 110, yPos);
        yPos += 6;
      }
      
      if (invoiceData.customerAddress) {
        doc.text(invoiceData.customerAddress, 110, yPos);
        yPos += 6;
      }
      
      if (invoiceData.customerEmail) {
        doc.text(invoiceData.customerEmail, 110, yPos);
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
      
      invoiceData.items.forEach((item: any, index: number) => {
        // Línea separadora
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPos, 190, yPos);
        yPos += 3;
        
        // Nombre del producto
        doc.text(item.name, 25, yPos);
        
        // Precio unitario
        doc.text(`${item.price.toFixed(2)}€`, 120, yPos);
        
        // Cantidad
        doc.text(item.quantity.toString(), 150, yPos);
        
        // Total
        doc.text(`${item.subtotal.toFixed(2)}€`, 170, yPos);
        
        yPos += 8;
      });
      
      // Línea final de la tabla
      doc.setDrawColor(200, 200, 200);
      doc.line(20, yPos, 190, yPos);
      
      // === TOTALES ===
      yPos += 15;
      
      // Subtotal
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('SUBTOTAL', 120, yPos);
      doc.text(`${invoiceData.subtotal.toFixed(2)}€`, 170, yPos);
      yPos += 8;
      
      // Descuento (siempre 0% por ahora)
      doc.text('DESCUENTO', 120, yPos);
      doc.text('0%', 150, yPos);
      doc.text('0,00€', 170, yPos);
      yPos += 8;
      
      // IVA
      doc.text('IVA', 120, yPos);
      doc.text(`${settings.ivaRate || 21}%`, 150, yPos);
      doc.text(`${invoiceData.tax.toFixed(2)}€`, 170, yPos);
      yPos += 8;
      
      // Total final
      doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b);
      doc.rect(120, yPos - 5, 70, 12, 'F');
      
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL', 125, yPos + 3);
      doc.text(`${invoiceData.total.toFixed(2)}€`, 170, yPos + 3);
      
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
      doc.text(settings.companyName || settings.storeName, 25, yPos + 6);
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
      if (invoiceData.notes) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', 20, yPos);
        yPos += 8;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        
        // Dividir texto largo en líneas
        const lines = doc.splitTextToSize(invoiceData.notes, 150);
        lines.forEach((line: string) => {
          doc.text(line, 20, yPos);
          yPos += 6;
        });
      }
      
      // Convertir PDF a base64
      const pdfBase64 = doc.output('datauristring').split(',')[1];
      
      const attachments = [{
        filename: `factura-${invoiceData.invoiceNumber}.pdf`,
        content: pdfBase64,
        type: 'application/pdf'
      }];

      const emailData: EmailData = {
        to: email,
        subject: `Factura ${invoiceData.invoiceNumber} - Flamenco Fusion Hub`,
        body: `
          <h2>Factura ${invoiceData.invoiceNumber}</h2>
          <p>Estimado/a ${invoiceData.customerName},</p>
          <p>Adjunto encontrará la factura correspondiente a su compra.</p>
          <p><strong>Detalles de la factura:</strong></p>
          <ul>
            <li>Número: ${invoiceData.invoiceNumber}</li>
            <li>Fecha: ${new Date(invoiceData.invoiceDate).toLocaleDateString('es-ES')}</li>
            <li>Total: ${invoiceData.total.toFixed(2)}€</li>
          </ul>
          <p>Gracias por su compra.</p>
          <p>Saludos cordiales,<br>Flamenco Fusion Hub</p>
        `,
        attachments
      };

      return await sendEmail(emailData);
      
    } catch (error: any) {
      toast.error("Error al enviar factura por correo: " + (error.message || "Error desconocido"));
      throw error;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendEmail,
    sendInvoiceEmail,
    isSending
  };
}
