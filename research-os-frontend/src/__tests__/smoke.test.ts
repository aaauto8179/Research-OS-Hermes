import { describe, it, expect } from 'vitest';
import { cn, truncate, parseJSONSafe, sumBy } from '@/lib/utils';

describe('Frontend Test Runner Smoke Test', () => {
  it('should execute basic boolean and math assertions cleanly', () => {
    expect(true).toBe(true);
    expect(1 + 1).toBe(2);
  });

  it('should resolve @/ path alias and execute cn class merging correctly', () => {
    const className = cn('px-4 py-2', 'bg-blue-500', { 'text-white': true, hidden: false });
    expect(className).toBe('px-4 py-2 bg-blue-500 text-white');
  });

  it('should execute string truncation utility correctly', () => {
    expect(truncate('Research OS Frontend', 8)).toBe('Research...');
    expect(truncate('Short', 10)).toBe('Short');
  });

  it('should safely parse JSON with fallback', () => {
    const fallback = { status: 'fallback' };
    const valid = parseJSONSafe('{"status": "ok"}', fallback);
    const invalid = parseJSONSafe('invalid json', fallback);

    expect(valid).toEqual({ status: 'ok' });
    expect(invalid).toEqual(fallback);
  });

  it('should calculate sum by property accurately', () => {
    const items = [{ val: 10 }, { val: 20 }, { val: 30 }];
    expect(sumBy(items, 'val')).toBe(60);
  });
});
