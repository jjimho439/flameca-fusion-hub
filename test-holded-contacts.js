import fetch from 'node-fetch';

const holdedApiKey = 'def395bb-8a5c-4b2d-9e3f-1a2b3c4d5e6f'; // Tu API key real

async function testHoldedContacts() {
  try {
    console.log('🔍 Probando API de contactos de Holded...');
    
    // 1. Listar contactos existentes
    console.log('\n📋 1. Listando contactos existentes...');
    const listResponse = await fetch('https://api.holded.com/api/accounting/v1/contacts', {
      method: 'GET',
      headers: {
        'key': holdedApiKey,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', listResponse.status);
    console.log('Headers:', Object.fromEntries(listResponse.headers.entries()));
    
    const listText = await listResponse.text();
    console.log('Response (first 500 chars):', listText.substring(0, 500));
    
    if (listResponse.ok) {
      try {
        const contacts = JSON.parse(listText);
        console.log('✅ Contactos encontrados:', contacts.length);
        contacts.forEach((contact, index) => {
          console.log(`  ${index + 1}. ${contact.name} - ${contact.email} (ID: ${contact.id})`);
        });
      } catch (e) {
        console.log('⚠️ Respuesta no es JSON válido');
      }
    }
    
    // 2. Crear un contacto de prueba
    console.log('\n👤 2. Creando contacto de prueba...');
    const newContact = {
      name: 'Cliente Prueba API',
      email: 'prueba.api@test.com',
      phone: '666123456',
      type: 'customer'
    };
    
    const createResponse = await fetch('https://api.holded.com/api/accounting/v1/contacts', {
      method: 'POST',
      headers: {
        'key': holdedApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newContact)
    });
    
    console.log('Create Status:', createResponse.status);
    console.log('Create Headers:', Object.fromEntries(createResponse.headers.entries()));
    
    const createText = await createResponse.text();
    console.log('Create Response (first 500 chars):', createText.substring(0, 500));
    
    // 3. Crear una factura de prueba
    console.log('\n📄 3. Creando factura de prueba...');
    const newInvoice = {
      customer: {
        name: 'Cliente Factura API',
        email: 'factura.api@test.com',
        phone: '666789123',
        type: 'customer'
      },
      items: [{
        name: 'Producto Prueba API',
        quantity: 1,
        price: 100.00
      }],
      total: 100.00,
      notes: 'Factura de prueba desde API',
      type: 'invoice'
    };
    
    const invoiceResponse = await fetch('https://api.holded.com/api/accounting/v1/documents/invoice', {
      method: 'POST',
      headers: {
        'key': holdedApiKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newInvoice)
    });
    
    console.log('Invoice Status:', invoiceResponse.status);
    console.log('Invoice Headers:', Object.fromEntries(invoiceResponse.headers.entries()));
    
    const invoiceText = await invoiceResponse.text();
    console.log('Invoice Response (first 500 chars):', invoiceText.substring(0, 500));
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testHoldedContacts();
