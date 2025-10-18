// Tipos compartidos para toda la aplicación

export interface Product {
  id: number;
  name: string;
  price: number | string;
  stock: number;
  category?: string;
  woocommerce_id?: number;
  description?: string;
  sku?: string;
  images?: string[];
  status?: string;
  stock_status?: string;
  stock_quantity?: number;
  regular_price?: string;
  sale_price?: string;
  on_sale?: boolean;
  purchasable?: boolean;
  virtual?: boolean;
  downloadable?: boolean;
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
  shipping_required?: boolean;
  reviews_allowed?: boolean;
  average_rating?: string;
  rating_count?: number;
  categories?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  tags?: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  images?: Array<{
    id: number;
    src: string;
    name: string;
    alt: string;
  }>;
  attributes?: any[];
  default_attributes?: any[];
  variations?: any[];
  grouped_products?: any[];
  menu_order?: number;
  price_html?: string;
  related_ids?: number[];
  meta_data?: Array<{
    id: number;
    key: string;
    value: string;
  }>;
  stock_status?: string;
  has_options?: boolean;
  post_password?: string;
  global_unique_id?: string;
  exclude_global_add_ons?: any[];
  addons?: any[];
  jetpack_publicize_connections?: any[];
  jetpack_sharing_enabled?: boolean;
  jetpack_likes_enabled?: boolean;
  _links?: {
    self: Array<{
      href: string;
      targetHints?: {
        allow: string[];
      };
    }>;
    collection: Array<{
      href: string;
    }>;
  };
}

export interface Order {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  total_amount: number;
  status: OrderStatus;
  payment_method: string;
  payment_status: string;
  notes: string;
  delivery_date: string;
  created_at: string;
  updated_at: string;
  items?: OrderItem[];
}

export interface OrderItem {
  id: number;
  order_id: string;
  product_id: number | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
  name?: string;
  products?: {
    name: string;
  };
}

export type OrderStatus = 'pending' | 'in_progress' | 'ready' | 'delivered' | 'cancelled' | 'completed';

export interface CartItem {
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface DashboardStats {
  products: number;
  orders: number;
  pendingOrders: number;
  employees: number;
  todaySales: number;
  weekSales: number;
}

export interface Employee {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
}

export interface TimeEntry {
  id: number;
  employee_id: string;
  date: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  total_hours: number;
  notes: string;
  created_at: string;
  updated_at: string;
  employee?: Employee;
}

export interface Incident {
  id: number;
  title: string;
  description: string;
  type: IncidentType;
  status: IncidentStatus;
  priority: 'low' | 'medium' | 'high';
  reported_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  reporter?: Employee;
  assignee?: Employee;
}

export type IncidentType = 'technical' | 'customer_service' | 'inventory' | 'other';
export type IncidentStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export interface Invoice {
  id: number;
  order_id: number;
  invoice_number: string;
  amount: number;
  status: 'pending' | 'sent' | 'paid' | 'cancelled';
  created_at: string;
  updated_at: string;
  order?: Order;
}

export interface DeliveryNote {
  id: number;
  order_id: number;
  delivery_date: string;
  status: 'pending' | 'delivered' | 'failed';
  notes: string;
  created_at: string;
  updated_at: string;
  order?: Order;
}

export interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  created_at: string;
  updated_at: string;
}

// Tipos para el sistema de notificaciones SMS/WhatsApp/Email
export interface SMSNotification {
  id: string;
  phone: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  created_at: string;
  sent_at?: string;
  error_message?: string;
  user_id?: string;
}

export interface WhatsAppNotification {
  id: string;
  phone: string;
  message: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  created_at: string;
  sent_at?: string;
  error_message?: string;
  user_id?: string;
}

export interface EmailNotification {
  id: string;
  email: string;
  subject: string;
  body: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed';
  created_at: string;
  sent_at?: string;
  error_message?: string;
  user_id?: string;
}

export type NotificationChannel = 'sms' | 'whatsapp' | 'email' | 'push';

export interface NotificationTemplate {
  id: string;
  name: string;
  channels: NotificationChannel[];
  template: string;
  variables: string[];
  created_at: string;
  updated_at: string;
}

export interface NotificationSettings {
  user_id: string;
  sms_enabled: boolean;
  whatsapp_enabled: boolean;
  email_enabled: boolean;
  push_enabled: boolean;
  sms_phone?: string;
  whatsapp_phone?: string;
  email_address?: string;
}

export interface NotificationRequest {
  channel: NotificationChannel;
  recipient: string; // phone number or email
  message: string;
  subject?: string; // for email
  template_id?: string;
  variables?: Record<string, string>;
}
