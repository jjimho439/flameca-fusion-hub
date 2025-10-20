import { formatPrice } from '@/lib/utils';

describe('formatPrice utility', () => {
  it('should format price with euro symbol', () => {
    expect(formatPrice(10.99)).toContain('10,99');
    expect(formatPrice(10.99)).toContain('€');
    expect(formatPrice(0)).toContain('0,00');
    expect(formatPrice(1000)).toContain('1000,00');
  });

  it('should handle decimal places correctly', () => {
    expect(formatPrice(10.1)).toContain('10,10');
    expect(formatPrice(10.123)).toContain('10,12');
    expect(formatPrice(10.999)).toContain('11,00');
  });

  it('should handle negative prices', () => {
    expect(formatPrice(-10.99)).toContain('-10,99');
    expect(formatPrice(-0.01)).toContain('-0,01');
  });

  it('should handle very large numbers', () => {
    expect(formatPrice(1234567.89)).toContain('1.234.567,89');
  });
});
