import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('Utility Functions', () => {
  describe('cn function', () => {
    it('combines class names correctly', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('handles conditional classes', () => {
      const result = cn('base-class', true && 'conditional-class', false && 'hidden-class');
      expect(result).toBe('base-class conditional-class');
    });

    it('filters out falsy values', () => {
      const result = cn('base-class', '', null, undefined, false, 'valid-class');
      expect(result).toBe('base-class valid-class');
    });

    it('handles empty input', () => {
      const result = cn();
      expect(result).toBe('');
    });

    it('handles single class', () => {
      const result = cn('single-class');
      expect(result).toBe('single-class');
    });
  });
});
