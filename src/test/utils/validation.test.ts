// Funciones de validación simples para testing
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
}

export function validatePrice(price: number): boolean {
  return price >= 0 && !isNaN(price);
}

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct email addresses', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name@domain.co.uk')).toBe(true);
      expect(validateEmail('admin@company.org')).toBe(true);
    });

    it('should reject invalid email addresses', () => {
      expect(validateEmail('invalid-email')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
      expect(validateEmail('')).toBe(false);
    });
  });

  describe('validatePhone', () => {
    it('should validate correct phone numbers', () => {
      expect(validatePhone('+34612345678')).toBe(true);
      expect(validatePhone('612345678')).toBe(true);
      expect(validatePhone('+1 555 123 4567')).toBe(true);
    });

    it('should reject invalid phone numbers', () => {
      expect(validatePhone('abc123')).toBe(false);
      expect(validatePhone('')).toBe(false);
    });
  });

  describe('validatePrice', () => {
    it('should validate correct prices', () => {
      expect(validatePrice(0)).toBe(true);
      expect(validatePrice(10.99)).toBe(true);
      expect(validatePrice(1000)).toBe(true);
    });

    it('should reject invalid prices', () => {
      expect(validatePrice(-10)).toBe(false);
      expect(validatePrice(NaN)).toBe(false);
    });
  });
});
