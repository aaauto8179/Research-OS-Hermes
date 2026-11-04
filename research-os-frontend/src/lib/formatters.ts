/**
 * Institutional Number Formatting Utilities for Indian Equity Research
 * Complies with Ind AS, Screener.in, and BSE reporting standards in INR Crores.
 */

export interface FormatINROptions {
  decimals?: number;
  useParenthesesForNegative?: boolean;
  includeSymbol?: boolean;
  includeUnit?: boolean;
}

/**
 * Format a number using Indian comma grouping (e.g. 12,34,567.89)
 */
export function formatIndianGrouping(num: number | string, decimals: number = 0): string {
  if (num === null || num === undefined) return '—';
  const val = typeof num === 'number' ? num : Number(num);
  if (isNaN(val) || !isFinite(val)) return '—';

  const isNeg = val < 0;
  const absNum = Math.abs(val);

  const fixed = absNum.toFixed(decimals);
  const [intPart, decPart] = fixed.split('.');

  let formattedInt = intPart;
  if (intPart.length > 3) {
    const lastThree = intPart.slice(-3);
    const remaining = intPart.slice(0, -3);
    const groups: string[] = [];
    let rem = remaining;
    while (rem.length > 2) {
      groups.unshift(rem.slice(-2));
      rem = rem.slice(0, -2);
    }
    if (rem.length > 0) {
      groups.unshift(rem);
    }
    formattedInt = [...groups, lastThree].join(',');
  }

  const result = decPart !== undefined && decimals > 0 ? `${formattedInt}.${decPart}` : formattedInt;
  return isNeg ? `-${result}` : result;
}

/**
 * Format value in INR Crores (₹ Cr)
 * Examples:
 *   974819 => "₹9,74,819 Cr"
 *   -5420  => "(₹5,420 Cr)" or "-₹5,420 Cr" (based on options)
 *   0      => "₹0 Cr"
 *   null   => "—"
 */
export function formatINRCrores(
  value: number | string | null | undefined,
  options: FormatINROptions = {}
): string {
  if (value === null || value === undefined) {
    return '—';
  }

  const val = typeof value === 'number' ? value : Number(value);
  if (isNaN(val) || !isFinite(val)) {
    return '—';
  }

  const {
    decimals = 0,
    useParenthesesForNegative = true,
    includeSymbol = true,
    includeUnit = true,
  } = options;

  if (val === 0) {
    const sym = includeSymbol ? '₹' : '';
    const unit = includeUnit ? ' Cr' : '';
    const zeroVal = decimals > 0 ? `0.${'0'.repeat(decimals)}` : '0';
    return `${sym}${zeroVal}${unit}`;
  }

  const isNeg = val < 0;
  const absVal = Math.abs(val);
  const formattedAbs = formatIndianGrouping(absVal, decimals);
  const sym = includeSymbol ? '₹' : '';
  const unit = includeUnit ? ' Cr' : '';

  if (isNeg) {
    if (useParenthesesForNegative) {
      return `(${sym}${formattedAbs}${unit})`;
    } else {
      return `-${sym}${formattedAbs}${unit}`;
    }
  }

  return `${sym}${formattedAbs}${unit}`;
}

/**
 * Format a value as percentage
 * Handles both decimal representations (0.185 => "18.5%") and already scaled (18.5 => "18.5%")
 * Default is already scaled numbers common in financial tables (e.g., margins = 18.5).
 */
export function formatPercent(
  value: number | string | null | undefined,
  options?: { decimals?: number; isDecimal?: boolean }
): string {
  if (value === null || value === undefined) {
    return '—';
  }

  const val = typeof value === 'number' ? value : Number(value);
  if (isNaN(val) || !isFinite(val)) {
    return '—';
  }

  const decimals = options?.decimals ?? 1;
  const num = options?.isDecimal ? val * 100 : val;

  return `${num.toFixed(decimals)}%`;
}

/**
 * Format a valuation multiplier or multiple
 * Example: 24.5 => "24.5x"
 */
export function formatMultiplier(
  value: number | string | null | undefined,
  decimals: number = 1
): string {
  if (value === null || value === undefined) {
    return '—';
  }

  const val = typeof value === 'number' ? value : Number(value);
  if (isNaN(val) || !isFinite(val)) {
    return '—';
  }

  return `${val.toFixed(decimals)}x`;
}

/**
 * Format per-share value in INR
 * Example: 45.2 => "₹45.20"
 */
export function formatPerShare(
  value: number | string | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) {
    return '—';
  }

  const val = typeof value === 'number' ? value : Number(value);
  if (isNaN(val) || !isFinite(val)) {
    return '—';
  }

  const isNeg = val < 0;
  const absVal = Math.abs(val);
  const formatted = formatIndianGrouping(absVal, decimals);

  return isNeg ? `-₹${formatted}` : `₹${formatted}`;
}

/**
 * Compact Indian Lakh/Crore short formatter
 * e.g. 15000000 => "1.50 Cr", 250000 => "2.50 L"
 */
export function formatCompactINR(
  value: number | string | null | undefined,
  decimals: number = 2
): string {
  if (value === null || value === undefined) {
    return '—';
  }

  const val = typeof value === 'number' ? value : Number(value);
  if (isNaN(val) || !isFinite(val)) {
    return '—';
  }

  const absVal = Math.abs(val);
  const sign = val < 0 ? '-' : '';

  if (absVal >= 10000000) {
    return `${sign}₹${(absVal / 10000000).toFixed(decimals)} Cr`;
  } else if (absVal >= 100000) {
    return `${sign}₹${(absVal / 100000).toFixed(decimals)} L`;
  } else {
    return `${sign}₹${formatIndianGrouping(absVal, decimals)}`;
  }
}
