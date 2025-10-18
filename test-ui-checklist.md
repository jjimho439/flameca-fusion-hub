# 🧪 CHECKLIST DE PRUEBAS DE INTERFAZ DE USUARIO

## 📋 PRUEBAS DE AUTENTICACIÓN

### ✅ Login/Logout
- [ ] **Login con credenciales válidas**
  - Usuario: `admin@flamenca.com`
  - Contraseña: `admin123`
  - Verificar redirección al Dashboard

- [ ] **Login con credenciales inválidas**
  - Usuario incorrecto
  - Contraseña incorrecta
  - Verificar mensaje de error

- [ ] **Logout**
  - Cerrar sesión correctamente
  - Verificar redirección a login
  - Verificar limpieza de sesión

### ✅ Roles y Permisos
- [ ] **Usuario Admin**
  - Acceso a todas las secciones
  - Botones de crear/editar/eliminar visibles
  - Gestión de empleados y roles

- [ ] **Usuario Manager**
  - Acceso limitado según permisos
  - Verificar botones ocultos según rol

- [ ] **Usuario Employee**
  - Acceso básico
  - Sin permisos de administración

## 📊 PRUEBAS DEL DASHBOARD

### ✅ Estadísticas
- [ ] **Contadores de pedidos**
  - Pedidos pendientes
  - Pedidos completados
  - Total de pedidos

- [ ] **Ventas**
  - Ventas de hoy
  - Ventas de la semana
  - Total de ventas

- [ ] **Productos**
  - Total de productos
  - Productos con stock bajo
  - Productos sin stock

### ✅ Actualizaciones en Tiempo Real
- [ ] **Actualización automática**
  - Crear un pedido desde TPV
  - Verificar que Dashboard se actualiza
  - Verificar contadores

- [ ] **Actualización manual**
  - Botón de refrescar
  - Verificar datos actualizados

## 🛒 PRUEBAS DEL TPV (PUNTO DE VENTA)

### ✅ Funcionalidad Básica
- [ ] **Selección de productos**
  - Lista de productos disponibles
  - Solo productos con stock > 0
  - Filtrado por categoría

- [ ] **Carrito de compras**
  - Agregar productos
  - Modificar cantidades
  - Eliminar productos
  - Cálculo de totales

### ✅ Validaciones de Stock
- [ ] **Stock insuficiente**
  - Intentar agregar más cantidad que stock disponible
  - Verificar mensaje de error
  - Verificar que no se permite

- [ ] **Productos sin stock**
  - Verificar que no aparecen en la lista
  - Verificar mensaje de "Sin stock"

### ✅ Cálculos de IVA
- [ ] **Precios con IVA**
  - Verificar precios mostrados con IVA (21%)
  - Verificar precios sin IVA en texto pequeño
  - Verificar cálculo correcto

- [ ] **Resumen de venta**
  - Subtotal sin IVA
  - IVA (21%)
  - Total con IVA
  - Verificar cálculos correctos

### ✅ Proceso de Venta
- [ ] **Completar venta**
  - Seleccionar método de pago
  - Verificar creación de pedido
  - Verificar actualización de stock
  - Verificar redirección

## 📦 PRUEBAS DE GESTIÓN DE PEDIDOS

### ✅ Lista de Pedidos
- [ ] **Visualización**
  - Lista de pedidos ordenada por fecha
  - Información completa de cada pedido
  - Estados correctos (Pendiente/Completado)

- [ ] **Filtros**
  - Filtrar por estado
  - Filtrar por fecha
  - Filtrar por cliente

### ✅ Estados de Pedidos
- [ ] **Pedido Pendiente**
  - Botón "Facturar en Holded" visible
  - Campos editables
  - Estado correcto

- [ ] **Pedido Completado**
  - Botón "Ya facturado" con check verde
  - Campos no editables
  - Estado correcto

### ✅ Facturación
- [ ] **Facturar pedido**
  - Clic en "Facturar en Holded"
  - Verificar creación de factura
  - Verificar cambio de estado a "Completado"
  - Verificar mensaje de éxito

## 🏪 PRUEBAS DE GESTIÓN DE PRODUCTOS

### ✅ Lista de Productos
- [ ] **Visualización**
  - Lista de productos con información completa
  - Precios con y sin IVA
  - Stock disponible
  - Estado de stock (normal/bajo/sin stock)

### ✅ CRUD de Productos
- [ ] **Crear producto**
  - Formulario de creación
  - Validaciones de campos
  - Guardado correcto

- [ ] **Editar producto**
  - Formulario de edición
  - Datos pre-cargados
  - Actualización correcta

- [ ] **Eliminar producto**
  - Confirmación de eliminación
  - Eliminación correcta
  - Actualización de lista

### ✅ Gestión de Stock
- [ ] **Actualización de stock**
  - Modificar stock desde productos
  - Verificar actualización en TPV
  - Verificar alertas de stock bajo

## 👥 PRUEBAS DE GESTIÓN DE EMPLEADOS

### ✅ Lista de Empleados
- [ ] **Visualización**
  - Lista de empleados
  - Información de roles
  - Estado activo/inactivo

### ✅ CRUD de Empleados
- [ ] **Crear empleado**
  - Formulario de creación
  - Asignación de rol
  - Creación correcta

- [ ] **Editar empleado**
  - Cambio de rol
  - Actualización de datos
  - Guardado correcto

- [ ] **Eliminar empleado**
  - Confirmación
  - Eliminación correcta

## 🧾 PRUEBAS DE FACTURACIÓN

### ✅ Facturas de Holded
- [ ] **Lista de facturas**
  - Facturas creadas desde pedidos
  - Información completa
  - Estados correctos

- [ ] **Descarga de PDFs**
  - Botón "Descargar PDF"
  - Generación de PDF local
  - Descarga correcta
  - Plantilla profesional

### ✅ Facturas Locales
- [ ] **Generación de PDF local**
  - Botón "Generar PDF Local"
  - Formulario de datos del cliente
  - Selección de productos
  - Generación correcta

- [ ] **Envío por email**
  - Botón "Enviar por Correo"
  - Formulario de email
  - Envío correcto
  - PDF adjunto

## ⚙️ PRUEBAS DE CONFIGURACIÓN

### ✅ Configuración General
- [ ] **Datos de la tienda**
  - Nombre, dirección, teléfono
  - Email, sitio web
  - Guardado correcto

- [ ] **Temas y colores**
  - Selección de tema
  - Colores primarios/secundarios
  - Aplicación en la UI

### ✅ Configuración Fiscal
- [ ] **Datos fiscales**
  - CIF/NIF
  - Razón social
  - Dirección fiscal
  - Datos bancarios
  - Tipo de IVA

- [ ] **Serie de facturas**
  - Configuración de serie
  - Numeración automática

## 🔔 PRUEBAS DE NOTIFICACIONES

### ✅ Sistema de Notificaciones
- [ ] **Configuración**
  - SMS, WhatsApp, Email
  - Plantillas de mensajes
  - Guardado correcto

- [ ] **Notificaciones automáticas**
  - Nuevo pedido
  - Stock bajo
  - Check-in/out de empleados

## 🌐 PRUEBAS DE INTEGRACIÓN

### ✅ WooCommerce
- [ ] **Sincronización de pedidos**
  - Pedidos desde WooCommerce
  - Creación en sistema local
  - Estados correctos

- [ ] **Sincronización de productos**
  - Productos desde WooCommerce
  - Actualización de stock
  - Precios correctos

### ✅ Holded
- [ ] **Creación de facturas**
  - Facturas enviadas a Holded
  - Contactos creados
  - Datos correctos

- [ ] **Sincronización**
  - Documentos en Holded
  - Actualización local
  - Consistencia de datos

## 📱 PRUEBAS DE RESPONSIVIDAD

### ✅ Dispositivos Móviles
- [ ] **Navegación móvil**
  - Menú hamburguesa
  - Navegación táctil
  - Formularios adaptados

- [ ] **TPV móvil**
  - Interfaz táctil
  - Botones grandes
  - Fácil uso

## 🚨 PRUEBAS DE ERRORES

### ✅ Manejo de Errores
- [ ] **Errores de conexión**
  - Sin internet
  - Servidor no disponible
  - Mensajes de error claros

- [ ] **Errores de validación**
  - Campos obligatorios
  - Formatos incorrectos
  - Mensajes de ayuda

- [ ] **Errores de permisos**
  - Acceso denegado
  - Funciones bloqueadas
  - Mensajes informativos

## 📊 PRUEBAS DE RENDIMIENTO

### ✅ Carga de Datos
- [ ] **Tiempo de carga**
  - Dashboard < 2 segundos
  - Listas < 1 segundo
  - Formularios < 500ms

- [ ] **Memoria**
  - Sin memory leaks
  - Limpieza de datos
  - Optimización

## ✅ CHECKLIST FINAL

- [ ] **Todas las funcionalidades principales funcionan**
- [ ] **No hay errores en consola**
- [ ] **Datos se guardan correctamente**
- [ ] **Integraciones funcionan**
- [ ] **UI es responsive**
- [ ] **Rendimiento es aceptable**
- [ ] **Manejo de errores es robusto**
- [ ] **Experiencia de usuario es fluida**

---

## 📝 NOTAS DE PRUEBAS

**Fecha de pruebas:** ___________
**Probador:** ___________
**Versión:** ___________
**Navegador:** ___________
**Dispositivo:** ___________

**Problemas encontrados:**
1. 
2. 
3. 

**Recomendaciones:**
1. 
2. 
3. 

**Estado general:** ⭐⭐⭐⭐⭐ (1-5 estrellas)
