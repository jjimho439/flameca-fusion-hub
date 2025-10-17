# 🔧 Configuración de Variables de Entorno - Flamenco Fusion Hub

## 📋 Estructura de Archivos .env

### **Frontend (.env)**
- **Ubicación**: Raíz del proyecto
- **Propósito**: Variables para el frontend (VITE_)
- **Archivo de ejemplo**: `.env.example`

### **Backend (.env)**
- **Ubicación**: `supabase/functions/.env`
- **Propósito**: Variables para Edge Functions
- **Archivo de ejemplo**: `supabase/functions/.env.example`

---

## 🚀 Configuración Inicial

### **1. Frontend**
```bash
# Copiar archivo de ejemplo
cp .env.example .env

# Editar con tus valores
nano .env
```

### **2. Backend (Edge Functions)**
```bash
# Copiar archivo de ejemplo
cp supabase/functions/.env.example supabase/functions/.env

# Editar con tus credenciales reales
nano supabase/functions/.env
```

---

## 🔑 Variables por Categoría

### **Frontend (VITE_)**
- `VITE_APP_NAME` - Nombre de la aplicación
- `VITE_APP_VERSION` - Versión de la aplicación
- `VITE_NODE_ENV` - Entorno (development/production)
- `VITE_SUPABASE_URL` - URL de Supabase
- `VITE_SUPABASE_ANON_KEY` - Clave anónima de Supabase
- `VITE_WOOCOMMERCE_URL` - URL de la tienda WooCommerce

### **Backend (Edge Functions)**
- `SUPABASE_URL` - URL de Supabase
- `SUPABASE_ANON_KEY` - Clave anónima de Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Clave de servicio de Supabase
- `WOOCOMMERCE_STORE_URL` - URL de la tienda
- `WOOCOMMERCE_CONSUMER_KEY` - Clave de consumidor WooCommerce
- `WOOCOMMERCE_CONSUMER_SECRET` - Secreto de consumidor WooCommerce
- `HOLDED_API_KEY` - API key de Holded
- `TWILIO_ACCOUNT_SID` - SID de cuenta Twilio
- `TWILIO_AUTH_TOKEN` - Token de autenticación Twilio
- `TWILIO_PHONE_NUMBER` - Número de teléfono Twilio
- `TWILIO_WHATSAPP_NUMBER` - Número de WhatsApp Twilio
- `RESEND_API_KEY` - API key de Resend
- `FROM_EMAIL` - Email de envío

---

## 🔒 Seguridad

### **Archivos Protegidos (.gitignore)**
- `.env` - Configuración local del frontend
- `.env.local` - Configuración local adicional
- `.env.production` - Configuración de producción
- `supabase/functions/.env` - Configuración de Edge Functions
- `supabase/functions/.env.local` - Configuración local de Edge Functions
- `supabase/functions/.env.production` - Configuración de producción de Edge Functions

### **Archivos Públicos**
- `.env.example` - Ejemplo para frontend
- `supabase/functions/.env.example` - Ejemplo para Edge Functions

---

## 🎯 Mejores Prácticas

1. **Nunca subas credenciales reales a Git**
2. **Usa archivos .env.example como plantilla**
3. **Mantén credenciales sensibles solo en Edge Functions**
4. **Usa variables VITE_ solo para el frontend**
5. **Documenta todas las variables necesarias**

---

## 🚨 Solución de Problemas

### **Error: "Variable not defined"**
- Verifica que la variable esté en el archivo .env correcto
- Reinicia el servidor de desarrollo
- Verifica que el archivo .env esté en la ubicación correcta

### **Error: "API key invalid"**
- Verifica que las credenciales estén en `supabase/functions/.env`
- Confirma que las API keys sean válidas
- Verifica que no haya espacios extra en las variables

### **Error: "Supabase connection failed"**
- Verifica que `VITE_SUPABASE_URL` esté configurado
- Confirma que `VITE_SUPABASE_ANON_KEY` sea correcta
- Verifica que Supabase esté ejecutándose

---

## 📝 Notas Importantes

- **Frontend**: Solo variables `VITE_` son accesibles
- **Backend**: Todas las variables están disponibles en Edge Functions
- **Desarrollo**: Usa valores de localhost
- **Producción**: Usa valores de producción reales
- **Credenciales**: Nunca las expongas en el frontend
