import type { Order, Product, Employee, DashboardStats, CartItem } from '@/types';

describe('TypeScript Types', () => {
  describe('Order type', () => {
    it('should have required properties', () => {
      const order: Order = {
        id: '1',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
        customer_phone: '+34612345678',
        total_amount: 99.99,
        status: 'Pendiente',
        payment_method: 'cash',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      expect(order.id).toBe('1');
      expect(order.customer_name).toBe('John Doe');
      expect(order.total_amount).toBe(99.99);
      expect(order.status).toBe('Pendiente');
    });
  });

  describe('Product type', () => {
    it('should have required properties', () => {
      const product: Product = {
        id: 1,
        name: 'Test Product',
        price: 29.99,
        stock: 10,
        description: 'Test description',
        sku: 'TEST-001',
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      expect(product.id).toBe(1);
      expect(product.name).toBe('Test Product');
      expect(product.price).toBe(29.99);
      expect(product.stock).toBe(10);
    });
  });

  describe('Employee type', () => {
    it('should have required properties', () => {
      const employee: Employee = {
        id: '1',
        full_name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+34612345678',
        role: 'employee',
        is_active: true,
        created_at: '2025-01-01T00:00:00Z',
        updated_at: '2025-01-01T00:00:00Z'
      };

      expect(employee.id).toBe('1');
      expect(employee.full_name).toBe('Jane Smith');
      expect(employee.role).toBe('employee');
      expect(employee.is_active).toBe(true);
    });
  });

  describe('DashboardStats type', () => {
    it('should have required properties', () => {
      const stats: DashboardStats = {
        products: 50,
        orders: 100,
        pendingOrders: 5,
        employees: 10,
        todaySales: 500.00,
        weekSales: 2500.00
      };

      expect(stats.products).toBe(50);
      expect(stats.orders).toBe(100);
      expect(stats.pendingOrders).toBe(5);
      expect(stats.employees).toBe(10);
      expect(stats.todaySales).toBe(500.00);
      expect(stats.weekSales).toBe(2500.00);
    });
  });

  describe('CartItem type', () => {
    it('should have required properties', () => {
      const cartItem: CartItem = {
        product_id: 1,
        name: 'Test Product',
        price: 29.99,
        quantity: 2,
        total: 59.98
      };

      expect(cartItem.product_id).toBe(1);
      expect(cartItem.name).toBe('Test Product');
      expect(cartItem.price).toBe(29.99);
      expect(cartItem.quantity).toBe(2);
      expect(cartItem.total).toBe(59.98);
    });
  });
});
