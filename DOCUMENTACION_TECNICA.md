# 📚 Documentación Técnica - Flamenco Fusion Hub

## 📋 Índice

1. [Arquitectura del Sistema](#arquitectura-del-sistema)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Base de Datos](#base-de-datos)
4. [APIs y Integraciones](#apis-y-integraciones)
5. [Componentes Frontend](#componentes-frontend)
6. [Hooks Personalizados](#hooks-personalizados)
7. [Edge Functions](#edge-functions)
8. [Sistema de Notificaciones](#sistema-de-notificaciones)
9. [Seguridad y Permisos](#seguridad-y-permisos)
10. [Testing](#testing)
11. [Despliegue](#despliegue)
12. [Troubleshooting](#troubleshooting)

---

## 🏗️ Arquitectura del Sistema

### **Arquitectura General**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Backend       │    │   External      │
│   (React)       │◄──►│   (Supabase)    │◄──►│   APIs          │
│                 │    │                 │    │                 │
│ • React 18      │    │ • PostgreSQL    │    │ • Holded        │
│ • TypeScript    │    │ • Edge Functions│    │ • WooCommerce   │
│ • Tailwind CSS  │    │ • Auth          │    │ • Twilio        │
│ • Shadcn/ui     │    │ • Realtime      │    │ • Resend        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Flujo de Datos**

1. **Frontend** → **Supabase Auth** (Autenticación)
2. **Frontend** → **Edge Functions** (Lógica de negocio)
3. **Edge Functions** → **APIs Externas** (Holded, WooCommerce, Twilio)
4. **Supabase Realtime** → **Frontend** (Actualizaciones en tiempo real)

---

## 📁 Estructura del Proyecto

```
flamenco-fusion-hub/
├── 📁 public/                     # Archivos estáticos
│   ├── favicon.ico
│   ├── placeholder.svg
│   └── robots.txt
├── 📁 src/                        # Código fuente principal
│   ├── 📁 components/             # Componentes reutilizables
│   │   ├── 📁 ui/                 # Componentes base (Shadcn/ui)
│   │   ├── AppSidebar.tsx         # Barra lateral de navegación
│   │   ├── ErrorBoundary.tsx      # Manejo de errores
│   │   ├── LoadingSpinner.tsx     # Spinner de carga
│   │   ├── NotificationBell.tsx   # Campana de notificaciones
│   │   ├── PermissionGate.tsx     # Control de permisos
│   │   ├── ProtectedRoute.tsx     # Rutas protegidas
│   │   ├── SessionManager.tsx     # Gestión de sesiones
│   │   └── ThemeToggle.tsx        # Toggle de tema
│   ├── 📁 contexts/               # Contextos de React
│   │   └── NotificationContext.tsx # Contexto de notificaciones
│   ├── 📁 hooks/                  # Hooks personalizados
│   │   ├── useAppNotifications.tsx # Notificaciones de la app
│   │   ├── useAppSettings.tsx     # Configuraciones
│   │   ├── useAppState.tsx        # Estado global
│   │   ├── useAutoNotifications.tsx # Notificaciones automáticas
│   │   ├── useAutoRefresh.tsx     # Auto-refresh
│   │   ├── useAutoSync.tsx        # Sincronización automática
│   │   ├── useDatabaseNotifications.tsx # Notificaciones de BD
│   │   ├── useHoldedInvoices.tsx  # Facturas de Holded
│   │   ├── useNotificationEvents.tsx # Eventos de notificación
│   │   ├── useNotifications.tsx   # Sistema de notificaciones
│   │   ├── usePasswordChange.tsx  # Cambio de contraseñas
│   │   ├── useSettings.tsx        # Configuraciones
│   │   ├── useTheme.tsx           # Gestión de temas
│   │   ├── useUserRole.tsx        # Roles de usuario
│   │   ├── useWooCommerceOrders.tsx # Pedidos WooCommerce
│   │   ├── useWooCommercePolling.tsx # Polling WooCommerce
│   │   └── useWooCommerceProducts.tsx # Productos WooCommerce
│   ├── 📁 integrations/           # Integraciones externas
│   │   └── 📁 supabase/
│   │       ├── client.ts          # Cliente de Supabase
│   │       └── types.ts           # Tipos de Supabase
│   ├── 📁 lib/                    # Utilidades y configuraciones
│   │   ├── constants.ts           # Constantes de la aplicación
│   │   ├── permissions.ts         # Sistema de permisos
│   │   └── utils.ts               # Utilidades generales
│   ├── 📁 pages/                  # Páginas principales
│   │   ├── Auth.tsx               # Página de autenticación
│   │   ├── Dashboard.tsx          # Dashboard principal
│   │   ├── Employees.tsx          # Gestión de empleados
│   │   ├── Incidents.tsx          # Gestión de incidencias
│   │   ├── Index.tsx              # Página de inicio
│   │   ├── Invoices.tsx           # Gestión de facturas
│   │   ├── NotFound.tsx           # Página 404
│   │   ├── Orders.tsx             # Gestión de pedidos
│   │   ├── PointOfSale.tsx        # TPV (Punto de Venta)
│   │   ├── Products.tsx           # Gestión de productos
│   │   ├── Settings.tsx           # Configuraciones
│   │   └── TimeEntries.tsx        # Gestión de fichajes
│   ├── 📁 types/                  # Definiciones de tipos
│   │   └── index.ts               # Tipos principales
│   ├── App.css                    # Estilos globales
│   ├── App.tsx                    # Componente principal
│   ├── index.css                  # Estilos base
│   └── main.tsx                   # Punto de entrada
├── 📁 supabase/                   # Configuración de Supabase
│   ├── 📁 functions/              # Edge Functions
│   │   ├── 📁 assign-role/        # Asignación de roles
│   │   ├── 📁 auto-notify/        # Notificaciones automáticas
│   │   ├── 📁 change-password/    # Cambio de contraseñas
│   │   ├── 📁 create-holded-invoice/ # Creación de facturas
│   │   ├── 📁 create-time-entry/  # Creación de fichajes
│   │   ├── 📁 create-user/        # Creación de usuarios
│   │   ├── 📁 delete-user/        # Eliminación de usuarios
│   │   ├── 📁 reset-password/     # Reset de contraseñas
│   │   ├── 📁 send-email/         # Envío de emails
│   │   ├── 📁 send-notification/  # Envío de notificaciones
│   │   ├── 📁 send-sms/           # Envío de SMS
│   │   ├── 📁 send-whatsapp/      # Envío de WhatsApp
│   │   ├── 📁 setup-admin-notifications/ # Configuración admin
│   │   ├── 📁 sync-woocommerce-holded/ # Sincronización
│   │   ├── 📁 sync-woocommerce-orders/ # Sincronización pedidos
│   │   ├── 📁 sync-woocommerce-products/ # Sincronización productos
│   │   └── 📁 update-user/        # Actualización de usuarios
│   ├── 📁 migrations/             # Migraciones de BD
│   └── config.toml                # Configuración de Supabase
├── 📁 src/test/                   # Pruebas unitarias
│   ├── setup.ts                   # Configuración de pruebas
│   ├── 📁 components/             # Pruebas de componentes
│   ├── 📁 hooks/                  # Pruebas de hooks
│   ├── 📁 lib/                    # Pruebas de utilidades
│   ├── 📁 types/                  # Pruebas de tipos
│   └── 📁 utils/                  # Pruebas de funciones
├── components.json                # Configuración de Shadcn/ui
├── package.json                   # Dependencias del proyecto
├── tailwind.config.ts             # Configuración de Tailwind
├── tsconfig.json                  # Configuración de TypeScript
├── vite.config.ts                 # Configuración de Vite
└── vitest.config.ts               # Configuración de Vitest
```

---

## 🗄️ Base de Datos

### **Esquema Principal**

#### **Tablas de Usuarios y Autenticación**

```sql
-- Perfiles de usuario
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  full_name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT DEFAULT 'employee',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Roles de usuario
CREATE TABLE user_roles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Configuraciones de notificaciones
CREATE TABLE notification_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  sms_enabled BOOLEAN DEFAULT false,
  whatsapp_enabled BOOLEAN DEFAULT false,
  email_enabled BOOLEAN DEFAULT true,
  push_enabled BOOLEAN DEFAULT false,
  sms_phone TEXT,
  whatsapp_phone TEXT,
  email_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tablas de Productos y Stock**

```sql
-- Productos
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  sku TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pedidos
CREATE TABLE orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  total_amount DECIMAL(10,2) NOT NULL,
  status order_status DEFAULT 'Pendiente',
  payment_method TEXT DEFAULT 'cash',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Items de pedidos
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Tablas de Gestión**

```sql
-- Fichajes de empleados
CREATE TABLE time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  check_in TIMESTAMP WITH TIME ZONE,
  check_out TIMESTAMP WITH TIME ZONE,
  date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Incidencias
CREATE TABLE incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  type TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  status TEXT DEFAULT 'open',
  reported_by UUID REFERENCES profiles(id),
  assigned_to UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Facturas locales
CREATE TABLE local_invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT UNIQUE NOT NULL,
  customer_name TEXT NOT NULL,
  customer_cif TEXT,
  customer_address TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  iva_amount DECIMAL(10,2) NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  created_by UUID REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### **Políticas de Seguridad (RLS)**

```sql
-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE local_invoices ENABLE ROW LEVEL SECURITY;

-- Políticas de ejemplo para profiles
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

---

## 🔌 APIs y Integraciones

### **Holded API**

#### **Configuración**
```typescript
const HOLDED_CONFIG = {
  baseUrl: 'https://api.holded.com/api',
  version: 'v1',
  endpoints: {
    documents: '/accounting/v1/documents',
    contacts: '/crm/v1/contacts',
    products: '/invoicing/v1/products'
  }
};
```

#### **Funciones Principales**
- **Crear Factura**: `createHoldedInvoice()`
- **Crear Contacto**: `createHoldedContact()`
- **Obtener Documentos**: `getHoldedDocuments()`
- **Descargar PDF**: `downloadHoldedPDF()`

### **WooCommerce API**

#### **Configuración**
```typescript
const WOOCOMMERCE_CONFIG = {
  baseUrl: process.env.VITE_WOOCOMMERCE_URL,
  consumerKey: process.env.VITE_WOOCOMMERCE_CONSUMER_KEY,
  consumerSecret: process.env.VITE_WOOCOMMERCE_CONSUMER_SECRET,
  version: 'wc/v3'
};
```

#### **Funciones Principales**
- **Sincronizar Productos**: `syncWooCommerceProducts()`
- **Sincronizar Pedidos**: `syncWooCommerceOrders()`
- **Actualizar Stock**: `updateProductStock()`

### **Twilio API**

#### **Configuración**
```typescript
const TWILIO_CONFIG = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  whatsappNumber: process.env.TWILIO_WHATSAPP_NUMBER
};
```

#### **Funciones Principales**
- **Enviar SMS**: `sendSMS()`
- **Enviar WhatsApp**: `sendWhatsApp()`

---

## 🧩 Componentes Frontend

### **Componentes Base (Shadcn/ui)**

#### **Button**
```typescript
interface ButtonProps {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}
```

#### **Card**
```typescript
interface CardProps {
  children: React.ReactNode;
  className?: string;
}
```

#### **Input**
```typescript
interface InputProps {
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  className?: string;
}
```

### **Componentes Personalizados**

#### **AppSidebar**
- Navegación principal
- Control de permisos por rol
- Indicadores de notificaciones
- Toggle de tema

#### **NotificationBell**
- Contador de notificaciones
- Lista de notificaciones recientes
- Marcado como leído
- Sonidos de notificación

#### **PermissionGate**
- Control de acceso basado en roles
- Renderizado condicional
- Mensajes de error personalizados

---

## 🎣 Hooks Personalizados

### **useUserRole**
```typescript
interface UseUserRoleReturn {
  role: UserRole | null;
  can: (permission: Permission) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  loading: boolean;
}
```

### **useNotifications**
```typescript
interface UseNotificationsReturn {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}
```

### **useWooCommerceProducts**
```typescript
interface UseWooCommerceProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  fetchProducts: () => Promise<void>;
  syncProducts: () => Promise<void>;
  updateProductStock: (id: number, stock: number) => Promise<void>;
}
```

### **useHoldedInvoices**
```typescript
interface UseHoldedInvoicesReturn {
  invoices: HoldedInvoice[];
  loading: boolean;
  error: string | null;
  fetchInvoices: () => Promise<void>;
  createInvoice: (data: CreateInvoiceData) => Promise<void>;
  downloadPDF: (documentId: string) => Promise<void>;
}
```

---

## ⚡ Edge Functions

### **auto-notify**
Función principal para notificaciones automáticas.

```typescript
interface AutoNotifyRequest {
  type: 'new_order' | 'low_stock' | 'critical_stock' | 'password_reset' | 'check_in' | 'check_out' | 'incident' | 'payment_issue';
  data: any;
}
```

**Tipos de notificaciones:**
- **new_order**: Nuevo pedido recibido
- **low_stock**: Stock bajo (≤2 unidades)
- **critical_stock**: Stock agotado (0 unidades)
- **password_reset**: Reset de contraseña
- **check_in/out**: Fichaje de empleado
- **incident**: Nueva incidencia
- **payment_issue**: Problema de pago

### **send-sms**
Envío de SMS via Twilio.

```typescript
interface SendSMSRequest {
  phone: string;
  message: string;
  user_id?: string;
}
```

### **send-whatsapp**
Envío de WhatsApp via Twilio.

```typescript
interface SendWhatsAppRequest {
  phone: string;
  message: string;
  user_id?: string;
}
```

### **send-email**
Envío de emails via Resend.

```typescript
interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
  user_id?: string;
}
```

### **sync-woocommerce-products**
Sincronización de productos con WooCommerce.

```typescript
interface SyncProductsRequest {
  action: 'sync' | 'update' | 'create';
  productId?: number;
  productData?: Partial<Product>;
}
```

### **create-holded-invoice**
Creación de facturas en Holded.

```typescript
interface CreateHoldedInvoiceRequest {
  customer: {
    name: string;
    email?: string;
    phone?: string;
    cif?: string;
    address?: string;
  };
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
}
```

---

## 🔔 Sistema de Notificaciones

### **Arquitectura**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Trigger       │    │   auto-notify   │    │   Delivery      │
│   Event         │───►│   Function      │───►│   Channels      │
│                 │    │                 │    │                 │
│ • New Order     │    │ • Process       │    │ • WhatsApp      │
│ • Low Stock     │    │ • Route         │    │ • SMS           │
│ • Check-in      │    │ • Format        │    │ • Email         │
│ • Incident      │    │ • Send          │    │ • Push          │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### **Configuración de Usuario**

```typescript
interface NotificationSettings {
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_phone?: string;
  whatsapp_phone?: string;
  email_address?: string;
}
```

### **Tipos de Notificaciones**

#### **Nuevo Pedido**
```typescript
const newOrderNotification = {
  type: 'new_order',
  data: {
    order_id: string;
    customer_name: string;
    total_amount: number;
    items: Array<{name: string; quantity: number}>;
  }
};
```

#### **Stock Bajo**
```typescript
const lowStockNotification = {
  type: 'low_stock',
  data: {
    products: Array<{
      id: string;
      name: string;
      stock: number;
    }>;
  }
};
```

#### **Reset de Contraseña**
```typescript
const passwordResetNotification = {
  type: 'password_reset',
  data: {
    employee_id: string;
    employee_name: string;
    employee_phone: string;
    temp_password: string;
  }
};
```

---

## 🔐 Seguridad y Permisos

### **Sistema de Roles**

```typescript
type UserRole = 'admin' | 'manager' | 'employee';

interface RolePermissions {
  admin: Permission[];
  manager: Permission[];
  employee: Permission[];
}
```

### **Permisos Disponibles**

```typescript
type Permission = 
  | 'view_dashboard'
  | 'manage_orders'
  | 'manage_products'
  | 'manage_employees'
  | 'manage_invoices'
  | 'view_reports'
  | 'manage_settings'
  | 'manage_notifications';
```

### **Verificación de Permisos**

```typescript
// Verificar un permiso específico
const canManageOrders = hasPermission(userRole, 'manage_orders');

// Verificar múltiples permisos
const canManageAll = hasAllPermissions(userRole, ['manage_orders', 'manage_products']);

// Verificar al menos un permiso
const canViewOrManage = hasAnyPermission(userRole, ['view_dashboard', 'manage_orders']);
```

### **Protección de Rutas**

```typescript
// Componente de ruta protegida
<ProtectedRoute 
  permission="manage_orders"
  fallback={<AccessDenied />}
>
  <OrdersPage />
</ProtectedRoute>

// Componente con control de permisos
<PermissionGate permission="manage_products">
  <AddProductButton />
</PermissionGate>
```

---

## 🧪 Testing

### **Configuración de Pruebas**

```typescript
// vitest.config.ts
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
```

### **Estructura de Pruebas**

```
src/test/
├── setup.ts                    # Configuración global
├── components/                 # Pruebas de componentes
│   ├── Button.test.tsx
│   ├── Card.test.tsx
│   ├── Input.test.tsx
│   └── Badge.test.tsx
├── hooks/                      # Pruebas de hooks
├── lib/                        # Pruebas de utilidades
├── types/                      # Pruebas de tipos
└── utils/                      # Pruebas de funciones
    ├── formatPrice.test.ts
    ├── validation.test.ts
    └── calculations.test.ts
```

### **Ejemplo de Prueba**

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/button';

describe('Button Component', () => {
  it('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    const button = screen.getByRole('button', { name: 'Click me' });
    fireEvent.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### **Comandos de Testing**

```bash
# Ejecutar todas las pruebas
npm run test:run

# Modo watch para desarrollo
npm run test

# Interfaz gráfica
npm run test:ui

# Cobertura de código
npm run test:coverage
```

---

## 🚀 Despliegue

### **Configuración de Variables de Entorno**

#### **Paso 1: Copiar archivos de configuración**
```bash
# Copiar configuración principal (frontend)
cp .env.example .env

# Copiar configuración para Edge Functions
cp supabase/functions/.env.example supabase/functions/.env
```

**Nota**: Los archivos `.env.example` ya están incluidos en el proyecto con todas las variables necesarias.

#### **Paso 2: Configurar variables del frontend (.env)**
```env
VITE_SUPABASE_URL=tu_supabase_url
VITE_SUPABASE_ANON_KEY=tu_supabase_anon_key
VITE_WOOCOMMERCE_URL=tu_woocommerce_url
VITE_WOOCOMMERCE_CONSUMER_KEY=tu_consumer_key
VITE_WOOCOMMERCE_CONSUMER_SECRET=tu_consumer_secret
```

#### **Paso 3: Configurar variables de Edge Functions (supabase/functions/.env)**
```env
SUPABASE_URL=tu_supabase_url
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key
HOLDED_API_KEY=tu_holded_api_key
TWILIO_ACCOUNT_SID=tu_twilio_sid
TWILIO_AUTH_TOKEN=tu_twilio_token
TWILIO_PHONE_NUMBER=tu_twilio_phone
TWILIO_WHATSAPP_NUMBER=tu_twilio_whatsapp
RESEND_API_KEY=tu_resend_api_key
```

### **Despliegue en Vercel**

```bash
# Instalar Vercel CLI
npm i -g vercel

# Desplegar
vercel --prod
```

### **Despliegue en Netlify**

```bash
# Build del proyecto
npm run build

# Desplegar carpeta dist
netlify deploy --prod --dir=dist
```

### **Configuración de Supabase**

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar proyecto
supabase init

# Desplegar Edge Functions
supabase functions deploy
```

---

## 🔧 Troubleshooting

### **Problemas Comunes**

#### **Error de Autenticación**
```typescript
// Verificar configuración de Supabase
const supabase = createClient(
  process.env.VITE_SUPABASE_URL!,
  process.env.VITE_SUPABASE_ANON_KEY!
);
```

#### **Error de CORS**
```typescript
// Configurar CORS en Edge Functions
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};
```

#### **Error de Permisos**
```typescript
// Verificar políticas RLS
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING (auth.uid() = user_id);
```

#### **Error de Notificaciones**
```typescript
// Verificar configuración de Twilio
const twilioConfig = {
  accountSid: process.env.TWILIO_ACCOUNT_SID,
  authToken: process.env.TWILIO_AUTH_TOKEN,
  phoneNumber: process.env.TWILIO_PHONE_NUMBER,
};
```

### **Logs y Debugging**

#### **Frontend**
```typescript
// Habilitar logs de desarrollo
localStorage.setItem('debug', 'true');

// Ver logs en consola
console.log('Debug info:', data);
```

#### **Edge Functions**
```typescript
// Logs en Edge Functions
console.log('Function called with:', requestData);
console.error('Error occurred:', error);
```

#### **Base de Datos**
```sql
-- Ver logs de Supabase
SELECT * FROM auth.users WHERE email = 'user@example.com';
SELECT * FROM profiles WHERE id = 'user-uuid';
```

### **Monitoreo**

#### **Métricas de Rendimiento**
- Tiempo de carga de páginas
- Tiempo de respuesta de APIs
- Uso de memoria
- Errores de JavaScript

#### **Métricas de Negocio**
- Número de pedidos por día
- Productos más vendidos
- Tiempo promedio de atención
- Satisfacción del cliente

---

## 📞 Soporte y Contacto

### **Documentación Adicional**
- [Guía de Testing](TESTING.md)
- [Configuración de Entorno](CONFIGURACION_ENV.md)
- [Guía de Webhooks](WEBHOOK_SETUP_GUIDE.md)

### **Recursos Útiles**
- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Holded](https://developers.holded.com/)
- [Documentación de WooCommerce](https://woocommerce.com/rest-api/)
- [Documentación de Twilio](https://www.twilio.com/docs)

### **Contacto**
- **Email**: soporte@flamencafusion.com
- **Discord**: [Comunidad de desarrolladores](https://discord.gg/flamencafusion)
- **GitHub**: [Reportar issues](https://github.com/tu-usuario/flamenco-fusion-hub/issues)

---

**Última actualización**: Octubre 2025  
**Versión**: 1.0.0  
**Desarrollado por**: OneWeek - Desarrolladores con IA
