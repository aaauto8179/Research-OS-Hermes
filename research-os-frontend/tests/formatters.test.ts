import { describe, it, expect } from 'vitest';
import {
  formatINRCrores,
  formatPercent,
  formatMultiplier,
  formatPerShare,
  formatCompactINR,
  formatIndianGrouping,
} from '../src/lib/formatters';

describe('formatIndianGrouping', () => {
  it('formats numbers with standard Indian comma grouping (thousands, then pairs)', () => {
    expect(formatIndianGrouping(0)).toBe('0');
    expect(formatIndianGrouping(500)).toBe('500');
    expect(formatIndianGrouping(1000)).toBe('1,000');
    expect(formatIndianGrouping(10000)).toBe('10,000');
    expect(formatIndianGrouping(100000)).toBe('1,00,000');
    expect(formatIndianGrouping(974819)).toBe('9,74,819');
    expect(formatIndianGrouping(10000000)).toBe('1,00,00,000');
  });

  it('handles negative numbers and decimal precision', () => {
    expect(formatIndianGrouping(-974819)).toBe('-9,74,819');
    expect(formatIndianGrouping(974819.5, 2)).toBe('9,74,819.50');
    expect(formatIndianGrouping(-1234.56, 1)).toBe('-1,234.6');
  });
});

describe('formatINRCrores', () => {
  it('formats positive values in INR Crores', () => {
    expect(formatINRCrores(974819)).toBe('₹9,74,819 Cr');
    expect(formatINRCrores(892450)).toBe('₹8,92,450 Cr');
    expect(formatINRCrores(1000)).toBe('₹1,000 Cr');
    expect(formatINRCrores(50)).toBe('₹50 Cr');
  });

  it('formats zero correctly as ₹0 Cr', () => {
    expect(formatINRCrores(0)).toBe('₹0 Cr');
    expect(formatINRCrores(0, { includeSymbol: false })).toBe('0 Cr');
    expect(formatINRCrores(0, { includeUnit: false })).toBe('₹0');
  });

  it('handles negative numbers with parentheses by default or minus flag', () => {
    expect(formatINRCrores(-5420)).toBe('(₹5,420 Cr)');
    expect(formatINRCrores(-974819)).toBe('(₹9,74,819 Cr)');
    expect(formatINRCrores(-5420, { useParenthesesForNegative: false })).toBe('-₹5,420 Cr');
  });

  it('returns em-dash for null, undefined, and NaN', () => {
    expect(formatINRCrores(null)).toBe('—');
    expect(formatINRCrores(undefined)).toBe('—');
    expect(formatINRCrores(NaN)).toBe('—');
  });

  it('respects decimal and unit options', () => {
    expect(formatINRCrores(1234.56, { decimals: 2 })).toBe('₹1,234.56 Cr');
    expect(formatINRCrores(974819, { includeSymbol: false, includeUnit: false })).toBe('9,74,819');
    expect(formatINRCrores(974819, { includeUnit: false })).toBe('₹9,74,819');
  });
});

describe('formatPercent', () => {
  it('formats percentage values with decimal precision', () => {
    expect(formatPercent(18.5)).toBe('18.5%');
    expect(formatPercent(24.62, { decimals: 2 })).toBe('24.62%');
    expect(formatPercent(0)).toBe('0.0%');
  });

  it('handles decimal ratio conversion when isDecimal is true', () => {
    expect(formatPercent(0.185, { isDecimal: true })).toBe('18.5%');
    expect(formatPercent(0.075, { isDecimal: true, decimals: 2 })).toBe('7.50%');
  });

  it('returns em-dash for null or undefined', () => {
    expect(formatPercent(null)).toBe('—');
    expect(formatPercent(undefined)).toBe('—');
  });
});

describe('formatMultiplier', () => {
  it('formats multiples and valuation ratios', () => {
    expect(formatMultiplier(24.5)).toBe('24.5x');
    expect(formatMultiplier(1.8, 2)).toBe('1.80x');
  });

  it('returns em-dash for null or undefined', () => {
    expect(formatMultiplier(null)).toBe('—');
    expect(formatMultiplier(undefined)).toBe('—');
  });
});

describe('formatPerShare', () => {
  it('formats per-share metric values in INR', () => {
    expect(formatPerShare(102.9)).toBe('₹102.90');
    expect(formatPerShare(1312.45)).toBe('₹1,312.45');
    expect(formatPerShare(-15.2)).toBe('-₹15.20');
  });

  it('returns em-dash for null or undefined', () => {
    expect(formatPerShare(null)).toBe('—');
    expect(formatPerShare(undefined)).toBe('—');
  });
});

describe('formatCompactINR', () => {
  it('formats compact representations for Crores and Lakhs', () => {
    expect(formatCompactINR(15000000)).toBe('₹1.50 Cr');
    expect(formatCompactINR(250000)).toBe('₹2.50 L');
    expect(formatCompactINR(5000)).toBe('₹5,000.00');
    expect(formatCompactINR(null)).toBe('—');
  });
});
