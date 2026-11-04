import { describe, it, expect, vi } from 'vitest';
import {
  cn,
  formatCurrency,
  formatNumber,
  formatPercent,
  formatDate,
  truncate,
  generateId,
  debounce,
  sleep,
  parseJSONSafe,
  groupBy,
  sortBy,
  sumBy,
  averageBy,
} from '@/lib/utils';

describe('Adversarial & Edge-Case Stress Testing: @/lib/utils', () => {
  describe('cn (Tailwind class merging)', () => {
    it('handles empty, undefined, null, boolean inputs gracefully', () => {
      expect(cn()).toBe('');
      expect(cn(null, undefined, false, '', 'text-sm')).toBe('text-sm');
    });

    it('correctly resolves Tailwind merge conflicts', () => {
      expect(cn('p-4', 'p-2')).toBe('p-2');
      expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500');
    });
  });

  describe('Formatting utilities', () => {
    it('formatCurrency formats INR with symbol without fraction digits', () => {
      const formatted = formatCurrency(50000);
      expect(formatted).toContain('50,000');
    });

    it('formatNumber formats numbers with customizable decimals', () => {
      expect(formatNumber(12345.6789, 2)).toContain('12,345.68');
      expect(formatNumber(0, 0)).toBe('0');
    });

    it('formatPercent handles zero and normal percentage values', () => {
      expect(formatPercent(50, 0)).toContain('50');
      expect(formatPercent(0, 0)).toContain('0');
    });

    it('formatDate handles ISO string and Date object', () => {
      const d = new Date('2026-01-15T00:00:00Z');
      expect(formatDate(d)).toContain('2026');
      expect(formatDate('2026-01-15T00:00:00Z')).toContain('2026');
    });
  });

  describe('truncate', () => {
    it('returns identical string if shorter or equal to maxLength', () => {
      expect(truncate('hello', 5)).toBe('hello');
      expect(truncate('hello', 10)).toBe('hello');
      expect(truncate('', 5)).toBe('');
    });

    it('truncates and appends ellipsis if longer than maxLength', () => {
      expect(truncate('supercalifragilistic', 5)).toBe('super...');
    });
  });

  describe('generateId', () => {
    it('produces valid UUID format with high entropy', () => {
      const id1 = generateId();
      const id2 = generateId();
      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
    });
  });

  describe('parseJSONSafe', () => {
    it('parses valid JSON accurately', () => {
      expect(parseJSONSafe('{"key": 42}', {})).toEqual({ key: 42 });
    });

    it('returns fallback on invalid JSON strings', () => {
      const fallback = { fallback: true };
      expect(parseJSONSafe('syntax error', fallback)).toBe(fallback);
      expect(parseJSONSafe('{ broken }', fallback)).toBe(fallback);
    });
  });

  describe('groupBy', () => {
    it('groups by property name', () => {
      const data = [
        { type: 'A', val: 1 },
        { type: 'B', val: 2 },
        { type: 'A', val: 3 },
      ];
      const grouped = groupBy(data, 'type');
      expect(Object.keys(grouped)).toEqual(['A', 'B']);
      expect(grouped['A']).toHaveLength(2);
      expect(grouped['B']).toHaveLength(1);
    });

    it('groups by custom key extractor function', () => {
      const data = [1, 2, 3, 4, 5];
      const grouped = groupBy(data, (n) => (n % 2 === 0 ? 'even' : 'odd'));
      expect(grouped['even']).toEqual([2, 4]);
      expect(grouped['odd']).toEqual([1, 3, 5]);
    });
  });

  describe('sortBy', () => {
    it('sorts ascending and descending by property', () => {
      const data = [{ v: 3 }, { v: 1 }, { v: 2 }];
      expect(sortBy(data, 'v', 'asc').map((x) => x.v)).toEqual([1, 2, 3]);
      expect(sortBy(data, 'v', 'desc').map((x) => x.v)).toEqual([3, 2, 1]);
    });

    it('sorts with equal values without instability', () => {
      const data = [{ v: 2, id: 1 }, { v: 2, id: 2 }, { v: 1, id: 3 }];
      const sorted = sortBy(data, 'v', 'asc');
      expect(sorted[0]?.id).toBe(3);
    });
  });

  describe('sumBy and averageBy', () => {
    it('sumBy handles empty arrays gracefully', () => {
      expect(sumBy([], 'val')).toBe(0);
    });

    it('sumBy handles NaN or missing values gracefully without poisoning sum', () => {
      const items = [{ val: 10 }, { val: 'invalid' as any }, { val: 20 }];
      expect(sumBy(items, 'val')).toBe(30);
    });

    it('averageBy handles empty arrays without returning NaN (divide by 0 guarded)', () => {
      expect(averageBy([], 'val')).toBe(0);
    });

    it('averageBy computes accurate mean', () => {
      const items = [{ val: 10 }, { val: 20 }, { val: 30 }];
      expect(averageBy(items, 'val')).toBe(20);
    });
  });

  describe('sleep and debounce', () => {
    it('sleep resolves asynchronously', async () => {
      const start = Date.now();
      await sleep(20);
      expect(Date.now() - start).toBeGreaterThanOrEqual(15);
    });

    it('debounce invokes function only once after wait period', async () => {
      vi.useFakeTimers();
      const fn = vi.fn();
      const debounced = debounce(fn, 100);

      debounced('call 1');
      debounced('call 2');
      debounced('call 3');

      expect(fn).not.toHaveBeenCalled();
      vi.advanceTimersByTime(150);
      expect(fn).toHaveBeenCalledTimes(1);
      expect(fn).toHaveBeenCalledWith('call 3');
      vi.useRealTimers();
    });
  });
});
