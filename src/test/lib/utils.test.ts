import { cn } from '@/lib/utils';

describe('cn utility function', () => {
  it('should merge class names correctly', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    expect(cn('base', true && 'conditional')).toBe('base conditional');
    expect(cn('base', false && 'conditional')).toBe('base');
  });

  it('should handle undefined and null values', () => {
    expect(cn('base', undefined, null)).toBe('base');
  });

  it('should merge conflicting Tailwind classes', () => {
    expect(cn('p-2 p-4')).toBe('p-4');
    expect(cn('bg-red-500 bg-blue-500')).toBe('bg-blue-500');
  });
});
