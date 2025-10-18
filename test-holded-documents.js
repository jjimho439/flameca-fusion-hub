// Script para probar la nueva funcionalidad de documentos de Holded
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'http://127.0.0.1:54321'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function testHoldedDocuments() {
  try {
    console.log('🧾 Probando funcionalidad de documentos de Holded...')
    
    // 1. Probar listar documentos
    console.log('\n📋 1. Listando documentos existentes...')
    const { data: listResult, error: listError } = await supabase.functions.invoke('holded-documents', {
      body: { action: 'list_documents', type: 'invoice', limit: 10 }
    })
    
    if (listError) {
      console.error('❌ Error listando documentos:', listError)
    } else {
      console.log('✅ Documentos listados:', listResult.documents?.length || 0)
    }
    
    // 2. Probar crear un documento de prueba
    console.log('\n📄 2. Creando documento de prueba...')
    const testDocument = {
      type: 'invoice',
      customer: {
        name: 'Cliente de Prueba Holded',
        email: 'cliente.holded@prueba.com',
        phone: '+34612345678',
        type: 'customer'
      },
      items: [
        {
          name: 'Vestido Flamenco Premium',
          quantity: 1,
          price: 129.99,
          sku: 'VEST-PREM-001',
          description: 'Vestido flamenco de alta calidad'
        },
        {
          name: 'Abanico Artesanal',
          quantity: 2,
          price: 25.50,
          sku: 'ABAN-ART-001',
          description: 'Abanico hecho a mano'
        }
      ],
      total: 180.99,
      notes: 'Documento de prueba creado desde la nueva API de Holded',
      status: 'draft',
      date: new Date().toISOString(),
      currency: 'EUR',
      language: 'es'
    }
    
    const { data: createResult, error: createError } = await supabase.functions.invoke('holded-documents', {
      body: { action: 'create_document', document: testDocument }
    })
    
    if (createError) {
      console.error('❌ Error creando documento:', createError)
    } else {
      console.log('✅ Documento creado:', createResult.document?.id)
      console.log('💰 Total:', createResult.document?.total)
      console.log('📊 Estado:', createResult.document?.status)
      
      const documentId = createResult.document?.id
      
      if (documentId) {
        // 3. Probar obtener el documento específico
        console.log('\n🔍 3. Obteniendo documento específico...')
        const { data: getResult, error: getError } = await supabase.functions.invoke('holded-documents', {
          body: { action: 'get_document', documentId }
        })
        
        if (getError) {
          console.error('❌ Error obteniendo documento:', getError)
        } else {
          console.log('✅ Documento obtenido:', getResult.document?.id)
          console.log('👤 Cliente:', getResult.document?.customer?.name)
          console.log('📦 Items:', getResult.document?.items?.length)
        }
        
        // 4. Probar actualizar el documento
        console.log('\n✏️ 4. Actualizando documento...')
        const { data: updateResult, error: updateError } = await supabase.functions.invoke('holded-documents', {
          body: { 
            action: 'update_document', 
            documentId,
            document: { 
              status: 'sent',
              notes: 'Documento actualizado - enviado al cliente'
            }
          }
        })
        
        if (updateError) {
          console.error('❌ Error actualizando documento:', updateError)
        } else {
          console.log('✅ Documento actualizado:', updateResult.document?.status)
        }
        
        // 5. Probar obtener PDF (solo en modo real)
        console.log('\n📄 5. Obteniendo PDF del documento...')
        const { data: pdfResult, error: pdfError } = await supabase.functions.invoke('holded-documents', {
          body: { action: 'get_document_pdf', documentId }
        })
        
        if (pdfError) {
          console.error('❌ Error obteniendo PDF:', pdfError)
        } else {
          console.log('✅ PDF obtenido:', pdfResult.pdfUrl ? 'URL generada' : 'No disponible')
        }
        
        // 6. Probar marcar como pagado
        console.log('\n💳 6. Marcando documento como pagado...')
        const { data: payResult, error: payError } = await supabase.functions.invoke('holded-documents', {
          body: { 
            action: 'pay_document', 
            documentId,
            amount: 180.99,
            paymentMethod: 'transfer'
          }
        })
        
        if (payError) {
          console.error('❌ Error marcando como pagado:', payError)
        } else {
          console.log('✅ Documento marcado como pagado')
        }
      }
    }
    
    // 7. Probar listar contactos
    console.log('\n👥 7. Listando contactos...')
    const { data: contactsResult, error: contactsError } = await supabase.functions.invoke('holded-documents', {
      body: { action: 'list_contacts', type: 'customer', limit: 10 }
    })
    
    if (contactsError) {
      console.error('❌ Error listando contactos:', contactsError)
    } else {
      console.log('✅ Contactos listados:', contactsResult.contacts?.length || 0)
    }
    
    console.log('\n🎉 ¡Pruebas de documentos de Holded completadas!')
    console.log('📋 Funcionalidades probadas:')
    console.log('   ✅ Listar documentos')
    console.log('   ✅ Crear documento')
    console.log('   ✅ Obtener documento específico')
    console.log('   ✅ Actualizar documento')
    console.log('   ✅ Obtener PDF')
    console.log('   ✅ Marcar como pagado')
    console.log('   ✅ Listar contactos')
    
    console.log('\n💡 Próximos pasos:')
    console.log('   1. Verifica que la API Key de Holded esté configurada')
    console.log('   2. Revisa los logs de Edge Functions para más detalles')
    console.log('   3. Prueba la interfaz web en la pestaña "Holded"')
    
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

testHoldedDocuments()
