import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface WooCommerceOrder {
  id: number;
  status: string;
  total: string;
  customer: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
  line_items: Array<{
    name: string;
    quantity: number;
    price: string;
    sku?: string;
  }>;
  billing: {
    first_name: string;
    last_name: string;
    email: string;
    phone?: string;
  };
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verificar credenciales
    const woocommerceUrl = Deno.env.get('WOOCOMMERCE_STORE_URL')
    const woocommerceKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY')
    const woocommerceSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET')
    const holdedApiKey = Deno.env.get('HOLDED_API_KEY')

    if (!woocommerceUrl || !woocommerceKey || !woocommerceSecret || !holdedApiKey) {
      throw new Error('Faltan credenciales de WooCommerce o Holded')
    }

    // Crear cliente de Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // 1. Obtener pedidos de WooCommerce
    const auth = btoa(`${woocommerceKey}:${woocommerceSecret}`)
    const woocommerceResponse = await fetch(`${woocommerceUrl}/wp-json/wc/v3/orders?status=completed&per_page=10`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    })

    if (!woocommerceResponse.ok) {
      throw new Error(`Error obteniendo pedidos de WooCommerce: ${woocommerceResponse.statusText}`)
    }

    const orders: WooCommerceOrder[] = await woocommerceResponse.json()
    console.log(`📦 Obtenidos ${orders.length} pedidos de WooCommerce`)

    // 2. Procesar cada pedido
    const processedOrders = []
    
    for (const order of orders) {
      try {
        // Verificar si ya existe en nuestra base de datos
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('woocommerce_id', order.id.toString())
          .single()

        if (existingOrder) {
          console.log(`⏭️ Pedido ${order.id} ya existe, saltando...`)
          continue
        }

        // Crear cliente en Holded si no existe
        const customerName = `${order.billing.first_name} ${order.billing.last_name}`.trim()
        const customerEmail = order.billing.email
        const customerPhone = order.billing.phone

        // Buscar cliente en Holded
        const customerSearchResponse = await fetch('https://api.holded.com/api/accounting/v1/contacts', {
          method: 'GET',
          headers: {
            'key': holdedApiKey,
            'Content-Type': 'application/json'
          }
        })

        let customerId = null
        if (customerSearchResponse.ok) {
          const customers = await customerSearchResponse.json()
          const existingCustomer = customers.find((c: any) => c.email === customerEmail)
          if (existingCustomer) {
            customerId = existingCustomer.id
          }
        }

        // Crear cliente si no existe
        if (!customerId) {
          const customerData = {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            type: 'customer'
          }

          const createCustomerResponse = await fetch('https://api.holded.com/api/accounting/v1/contacts', {
            method: 'POST',
            headers: {
              'key': holdedApiKey,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(customerData)
          })

          if (createCustomerResponse.ok) {
            const newCustomer = await createCustomerResponse.json()
            customerId = newCustomer.id
            console.log(`✅ Cliente creado en Holded: ${customerName}`)
          }
        }

        // Crear factura en Holded
        const invoiceData = {
          customer: {
            id: customerId,
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            type: 'customer'
          },
          items: order.line_items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: parseFloat(item.price),
            sku: item.sku
          })),
          total: parseFloat(order.total),
          notes: `Factura generada automáticamente desde WooCommerce - Pedido #${order.id}`,
          type: 'invoice',
          status: 'draft'
        }

        const createInvoiceResponse = await fetch('https://api.holded.com/api/accounting/v1/documents/invoice', {
          method: 'POST',
          headers: {
            'key': holdedApiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(invoiceData)
        })

        if (!createInvoiceResponse.ok) {
          console.error(`❌ Error creando factura para pedido ${order.id}:`, await createInvoiceResponse.text())
          continue
        }

        const holdedInvoice = await createInvoiceResponse.json()
        console.log(`✅ Factura creada en Holded para pedido ${order.id}:`, holdedInvoice.id)

        // Guardar en nuestra base de datos
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .insert({
            woocommerce_id: order.id.toString(),
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            total_amount: parseFloat(order.total),
            status: 'completed',
            payment_status: 'paid',
            items: order.line_items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              unit_price: parseFloat(item.price),
              subtotal: parseFloat(item.price) * item.quantity,
              sku: item.sku
            })),
            notes: `Pedido sincronizado desde WooCommerce`,
            created_at: new Date().toISOString()
          })
          .select()
          .single()

        if (orderError) {
          console.error(`❌ Error guardando pedido ${order.id}:`, orderError)
          continue
        }

        // Guardar factura
        const { error: invoiceError } = await supabase
          .from('invoices')
          .insert({
            order_id: orderData.id,
            holded_invoice_id: holdedInvoice.id,
            customer_name: customerName,
            customer_email: customerEmail,
            customer_phone: customerPhone,
            total_amount: parseFloat(order.total),
            status: 'draft',
            items: order.line_items.map(item => ({
              name: item.name,
              quantity: item.quantity,
              price: parseFloat(item.price),
              sku: item.sku
            })),
            notes: `Factura generada automáticamente desde WooCommerce - Pedido #${order.id}`,
            created_at: new Date().toISOString()
          })

        if (invoiceError) {
          console.error(`❌ Error guardando factura para pedido ${order.id}:`, invoiceError)
        } else {
          console.log(`✅ Factura guardada en base de datos para pedido ${order.id}`)
        }

        processedOrders.push({
          woocommerce_id: order.id,
          holded_invoice_id: holdedInvoice.id,
          customer_name: customerName,
          total: parseFloat(order.total)
        })

      } catch (error) {
        console.error(`❌ Error procesando pedido ${order.id}:`, error)
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Procesados ${processedOrders.length} pedidos`,
        processed_orders: processedOrders
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('❌ Error en sync-woocommerce-holded:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
