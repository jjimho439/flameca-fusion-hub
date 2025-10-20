// Funciones de cálculo para testing
export function calculateTotal(items: Array<{ price: number; quantity: number }>): number {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
}

export function calculateIVA(amount: number, ivaRate: number = 0.21): number {
  return amount * ivaRate;
}

export function calculateWithIVA(amount: number, ivaRate: number = 0.21): number {
  return amount + calculateIVA(amount, ivaRate);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

describe('Calculation Utils', () => {
  describe('calculateTotal', () => {
    it('should calculate total for multiple items', () => {
      const items = [
        { price: 10, quantity: 2 },
        { price: 5, quantity: 3 },
        { price: 15, quantity: 1 }
      ];
      
      expect(calculateTotal(items)).toBe(50);
    });

    it('should handle empty array', () => {
      expect(calculateTotal([])).toBe(0);
    });

    it('should handle single item', () => {
      const items = [{ price: 25.99, quantity: 1 }];
      expect(calculateTotal(items)).toBe(25.99);
    });
  });

  describe('calculateIVA', () => {
    it('should calculate IVA with default rate', () => {
      expect(calculateIVA(100)).toBe(21);
    });

    it('should calculate IVA with custom rate', () => {
      expect(calculateIVA(100, 0.10)).toBe(10);
    });

    it('should handle zero amount', () => {
      expect(calculateIVA(0)).toBe(0);
    });
  });

  describe('calculateWithIVA', () => {
    it('should calculate total with IVA', () => {
      expect(calculateWithIVA(100)).toBe(121);
    });

    it('should calculate total with custom IVA rate', () => {
      expect(calculateWithIVA(100, 0.10)).toBe(110);
    });
  });

  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(10.99)).toContain('10,99');
      expect(formatCurrency(10.99)).toContain('€');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toContain('0,00');
    });

    it('should handle large numbers', () => {
      expect(formatCurrency(1234.56)).toContain('1234,56');
    });
  });
});
