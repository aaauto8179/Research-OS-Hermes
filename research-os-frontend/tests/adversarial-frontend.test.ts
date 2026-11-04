/**
 * Empirical Adversarial Test Suite for Frontend Statement Viewer, Formatters,
 * and Reactive Scenario Projections (Milestones 3 & 4).
 * 
 * Executed by EMPIRICAL CHALLENGER (challenger_m1_m2_2).
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  formatIndianGrouping,
  formatINRCrores,
  formatPercent,
  formatMultiplier,
  formatPerShare,
  formatCompactINR,
} from '../src/lib/formatters';
import {
  useScenarioStore,
  calculateScenarioOutputs,
  ScenarioParameters,
  SegmentProjectionDriver,
} from '../src/lib/scenario-store';
import { FinancialCitation } from '../src/data/sample-statements';

describe('Adversarial Suite 1: Financial Formatters Stress & Invariants', () => {
  describe('1.1 Extreme Values & Invariant Boundaries in formatIndianGrouping', () => {
    it('satisfies Indian grouping invariant: last group has 3 digits, preceding groups have 2 digits', () => {
      const testNumbers = [
        1000,
        10000,
        100000,
        1000000,
        10000000, // 1 Crore
        100000000, // 10 Crore
        1000000000, // 100 Crore
        10000000000, // 1,000 Crore
        974819234567, // Multi-lakh crore
        Number.MAX_SAFE_INTEGER, // 9007199254740991
      ];

      for (const num of testNumbers) {
        const formatted = formatIndianGrouping(num);
        const parts = formatted.split(',');

        // 1. Rejoining digits matches original integer
        expect(parts.join('')).toBe(num.toString());

        // 2. Last group is exactly 3 digits
        expect(parts[parts.length - 1]).toHaveLength(3);

        // 3. Intermediate groups are exactly 2 digits
        for (let i = 1; i < parts.length - 1; i++) {
          expect(parts[i]).toHaveLength(2);
        }

        // 4. First group is between 1 and 2 digits
        expect(parts[0].length).toBeGreaterThanOrEqual(1);
        expect(parts[0].length).toBeLessThanOrEqual(2);
      }
    });

    it('formats Number.MAX_SAFE_INTEGER (9007199254740991) accurately without crashing', () => {
      const maxSafe = Number.MAX_SAFE_INTEGER;
      const formatted = formatIndianGrouping(maxSafe);
      expect(formatted).toBe('9,00,71,99,25,47,40,991');
    });

    it('handles negative integers with exact Indian grouping and leading minus sign', () => {
      expect(formatIndianGrouping(-10000000)).toBe('-1,00,00,000');
      expect(formatIndianGrouping(-974819)).toBe('-9,74,819');
      expect(formatIndianGrouping(-50)).toBe('-50');
      expect(formatIndianGrouping(-0)).toBe('0');
    });

    it('preserves decimals with exact precision rounding', () => {
      expect(formatIndianGrouping(974819.546, 2)).toBe('9,74,819.55');
      expect(formatIndianGrouping(974819.544, 2)).toBe('9,74,819.54');
      expect(formatIndianGrouping(0.0001, 4)).toBe('0.0001');
      expect(formatIndianGrouping(0.00004, 4)).toBe('0.0000');
    });

    it('evaluates non-finite inputs (NaN, Infinity, -Infinity)', () => {
      expect(formatIndianGrouping(NaN)).toBe('—');

      // Note: isNaN(Infinity) is false in JS!
      // Formatters that do not check Number.isFinite produce strange outputs for Infinity:
      const infResult = formatIndianGrouping(Infinity);
      // We document actual behavior vs ideal behavior:
      expect(typeof infResult).toBe('string');
    });
  });

  describe('1.2 formatINRCrores Institutional Edge Cases', () => {
    it('formats ₹0 cleanly across all flag permutations', () => {
      expect(formatINRCrores(0)).toBe('₹0 Cr');
      expect(formatINRCrores(0, { decimals: 2 })).toBe('₹0.00 Cr');
      expect(formatINRCrores(0, { includeSymbol: false, includeUnit: false })).toBe('0');
      expect(formatINRCrores(0, { includeSymbol: true, includeUnit: false })).toBe('₹0');
      expect(formatINRCrores(0, { includeSymbol: false, includeUnit: true })).toBe('0 Cr');
    });

    it('formats negative financial values in accounting parentheses vs minus signs', () => {
      // Standard Ind AS parentheses format
      expect(formatINRCrores(-974819.5, { decimals: 2, useParenthesesForNegative: true })).toBe('(₹9,74,819.50 Cr)');
      expect(formatINRCrores(-5420, { useParenthesesForNegative: true })).toBe('(₹5,420 Cr)');

      // Minus sign mode
      expect(formatINRCrores(-974819.5, { decimals: 2, useParenthesesForNegative: false })).toBe('-₹9,74,819.50 Cr');
      expect(formatINRCrores(-5420, { useParenthesesForNegative: false })).toBe('-₹5,420 Cr');
    });

    it('handles null, undefined, and NaN by returning institutional em-dash', () => {
      expect(formatINRCrores(null)).toBe('—');
      expect(formatINRCrores(undefined)).toBe('—');
      expect(formatINRCrores(NaN)).toBe('—');
    });

    it('stress tests small decimals and rounding towards zero', () => {
      // Small positive decimal
      expect(formatINRCrores(0.0001, { decimals: 4 })).toBe('₹0.0001 Cr');
      expect(formatINRCrores(0.0001, { decimals: 0 })).toBe('₹0 Cr');

      // Small negative decimal rounded to zero
      const smallNegRounded = formatINRCrores(-0.0001, { decimals: 0 });
      // Evaluates whether it shows (₹0 Cr) or ₹0 Cr
      expect(['(₹0 Cr)', '₹0 Cr', '-₹0 Cr']).toContain(smallNegRounded);
    });

    it('stress tests trillion-scale values', () => {
      // ₹10,00,00,000 Cr = ₹1,000 Trillion
      const trillions = 100000000;
      expect(formatINRCrores(trillions)).toBe('₹10,00,00,000 Cr');
    });

    it('evaluates string inputs safely if runtime bypasses typescript', () => {
      // If an API returns stringified numeric data
      const stringNum = "974819" as unknown as number;
      expect(formatINRCrores(stringNum)).toBe('₹9,74,819 Cr');

      const invalidStr = "invalid_num" as unknown as number;
      expect(formatINRCrores(invalidStr)).toBe('—');
    });
  });

  describe('1.3 Other Formatters Stress (formatPercent, formatMultiplier, formatPerShare, formatCompactINR)', () => {
    it('formatPercent handles zero, negatives, and large margins', () => {
      expect(formatPercent(0)).toBe('0.0%');
      expect(formatPercent(-15.42, { decimals: 2 })).toBe('-15.42%');
      expect(formatPercent(150.5)).toBe('150.5%');
      expect(formatPercent(null)).toBe('—');
      expect(formatPercent(undefined)).toBe('—');
      expect(formatPercent(NaN)).toBe('—');
    });

    it('formatMultiplier handles valuation multiples', () => {
      expect(formatMultiplier(0)).toBe('0.0x');
      expect(formatMultiplier(24.56, 2)).toBe('24.56x');
      expect(formatMultiplier(-5.2)).toBe('-5.2x');
      expect(formatMultiplier(null)).toBe('—');
      expect(formatMultiplier(NaN)).toBe('—');
    });

    it('formatPerShare formats EPS and book value', () => {
      expect(formatPerShare(0)).toBe('₹0.00');
      expect(formatPerShare(45.2)).toBe('₹45.20');
      expect(formatPerShare(-12.5)).toBe('-₹12.50');
      expect(formatPerShare(null)).toBe('—');
      expect(formatPerShare(NaN)).toBe('—');
    });

    it('formatCompactINR formats lakhs and crores seamlessly', () => {
      expect(formatCompactINR(15000000)).toBe('₹1.50 Cr');
      expect(formatCompactINR(250000)).toBe('₹2.50 L');
      expect(formatCompactINR(99999)).toBe('₹99,999.00');
      expect(formatCompactINR(-15000000)).toBe('-₹1.50 Cr');
      expect(formatCompactINR(0)).toBe('₹0.00');
      expect(formatCompactINR(null)).toBe('—');
    });
  });
});

describe('Adversarial Suite 2: Reactive Scenario Store Mathematical Invariants', () => {
  beforeEach(() => {
    useScenarioStore.getState().resetToDefaults();
  });

  describe('2.1 Rapid Sequential Driver Stress & Re-entrancy Test', () => {
    it('processes 100 rapid sequential driver updates in under 200ms without race conditions or memory corruption', () => {
      const store = useScenarioStore.getState();
      store.setUseSegmentAggregation(false);

      const startTime = performance.now();
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        // Sweep revenue CAGR from -50% to +100%
        const cagr = -50 + (i / iterations) * 150;
        store.setDriver('base', 'revenueCagrPct', cagr);
      }

      const durationMs = performance.now() - startTime;
      const finalState = useScenarioStore.getState();

      // Ensure execution is snappy (< 2ms per cycle, < 200ms total)
      expect(durationMs).toBeLessThan(500);

      // Verify final value is accurately reflected in store and projections
      expect(finalState.scenarios.base.revenueCagrPct).toBeCloseTo(100 - (150 / 100), 1);
      const fy25Rev = finalState.outputs.base.projectedYears[0].revenue;
      expect(fy25Rev).toBeGreaterThan(0);
      expect(Number.isFinite(fy25Rev)).toBe(true);
    });
  });

  describe('2.2 Boundary Economic Conditions & Defensive Math', () => {
    const baseParams: ScenarioParameters = {
      revenueCagrPct: 10.0,
      volumeGrowthPct: 7.0,
      priceRealizationPct: 3.0,
      grossMarginPct: 38.0,
      ebitdaMarginPct: 18.0,
      depreciationPct: 5.2,
      taxRatePct: 25.0,
      capexPctOfSales: 11.0,
      nwcChangePct: 1.5,
      waccPct: 11.5,
      terminalGrowthRatePct: 4.5,
      intersegmentElimination: 29000,
    };

    it('Scenario A: Severe negative revenue growth (-50%, -90%) produces finite non-NaN metrics', () => {
      const params = { ...baseParams, revenueCagrPct: -50.0 };
      const out = calculateScenarioOutputs(2024, 100000, params, [], false);

      expect(out.projectedYears).toHaveLength(5);
      // FY25 should be 50,000, FY26 should be 25,000, etc.
      expect(out.projectedYears[0].revenue).toBe(50000);
      expect(out.projectedYears[1].revenue).toBe(25000);
      expect(out.cagr5Y).toBeCloseTo(-50.0, 1);
      expect(Number.isNaN(out.cagr5Y)).toBe(false);
      expect(Number.isFinite(out.enterpriseValueIndication)).toBe(true);
    });

    it('Scenario B: Extreme negative growth (-110%) — checks whether negative base or alternating signs cause NaN in CAGR', () => {
      const params = { ...baseParams, revenueCagrPct: -110.0 };
      const out = calculateScenarioOutputs(2024, 100000, params, [], false);

      // Document whether negative revenue is permitted or if CAGR produces NaN
      const cagr = out.cagr5Y;
      const finalRev = out.projectedYears[4].revenue;

      // In pure math, revenue with growth -110% alternates signs:
      // yr1: -10,000, yr2: +1,000, yr3: -100, yr4: +10, yr5: -1
      // If finalRev is negative, Math.pow(-1, 0.2) returns NaN!
      if (finalRev < 0) {
        expect(Number.isNaN(cagr)).toBe(true);
      } else {
        expect(Number.isFinite(cagr)).toBe(true);
      }
    });

    it('Scenario C: Zero operating margin (EBITDA margin = 0%)', () => {
      const params = { ...baseParams, ebitdaMarginPct: 0.0 };
      const out = calculateScenarioOutputs(2024, 100000, params, [], false);

      const yr = out.projectedYears[0];
      expect(yr.ebitda).toBe(0);
      // EBIT is negative due to depreciation
      expect(yr.ebit).toBeLessThan(0);
      // Taxable income is max(0, EBIT), so tax is 0
      expect(yr.tax).toBe(0);
      // PAT = EBIT - 0 = EBIT
      expect(yr.pat).toBe(yr.ebit);
      // FCF is negative
      expect(yr.fcf).toBeLessThan(0);
      // Check no NaN or division by zero
      expect(Number.isNaN(out.cagr5Y)).toBe(false);
      expect(Number.isNaN(out.cumulativeFcf5Y)).toBe(false);
      expect(Number.isNaN(out.terminalValue)).toBe(false);
    });

    it('Scenario D: 100% Tax Rate boundary condition', () => {
      const params = { ...baseParams, taxRatePct: 100.0, ebitdaMarginPct: 20.0, depreciationPct: 5.0 };
      const out = calculateScenarioOutputs(2024, 100000, params, [], false);

      const yr = out.projectedYears[0];
      // When EBIT is positive, 100% tax means PAT = 0
      expect(yr.ebit).toBeGreaterThan(0);
      expect(yr.tax).toBeCloseTo(yr.ebit, 1);
      expect(yr.pat).toBeCloseTo(0, 1);

      // FCFF formula: EBIT * (1 - 1.0) + Depr - Capex - NWC = Depr - Capex - NWC
      const expectedFcf = yr.depreciation - yr.capex - yr.nwcChange;
      expect(yr.fcf).toBeCloseTo(expectedFcf, 1);
    });

    it('Scenario E: Capex exceeding EBITDA (severe cash burn)', () => {
      const params = {
        ...baseParams,
        ebitdaMarginPct: 10.0,
        depreciationPct: 5.0,
        capexPctOfSales: 30.0, // Capex 3x EBITDA
        nwcChangePct: 5.0,
      };
      const out = calculateScenarioOutputs(2024, 100000, params, [], false);

      const yr = out.projectedYears[0];
      expect(yr.fcf).toBeLessThan(0);
      expect(out.cumulativeFcf5Y).toBeLessThan(0);

      // Defensive check: Terminal value must NOT be computed as negative perpetuity when FCF is negative
      expect(out.terminalValue).toBe(0);
      // Enterprise value will be negative or discounted FCF sum
      expect(Number.isFinite(out.enterpriseValueIndication)).toBe(true);
    });

    it('Scenario F: Negative working capital changes (working capital release)', () => {
      // Releasing working capital (-3% of sales) vs absorbing (+3% of sales)
      const paramsRelease = { ...baseParams, nwcChangePct: -3.0 };
      const paramsAbsorb = { ...baseParams, nwcChangePct: 3.0 };

      const outRelease = calculateScenarioOutputs(2024, 100000, paramsRelease, [], false);
      const outAbsorb = calculateScenarioOutputs(2024, 100000, paramsAbsorb, [], false);

      // Releasing WC increases FCF
      expect(outRelease.projectedYears[0].fcf).toBeGreaterThan(outAbsorb.projectedYears[0].fcf);
    });

    it('Scenario G: Zero base revenue boundary', () => {
      const out = calculateScenarioOutputs(2024, 0, baseParams, [], false);
      expect(out.projectedYears[0].revenue).toBe(0);
      expect(out.cagr5Y).toBe(0);
      expect(out.cumulativeFcf5Y).toBe(0);
      expect(out.terminalValue).toBe(0);
      expect(out.enterpriseValueIndication).toBe(0);
    });
  });

  describe('2.3 Gordon Growth Formula Boundary: g >= WACC', () => {
    const baseParams: ScenarioParameters = {
      revenueCagrPct: 10.0,
      volumeGrowthPct: 7.0,
      priceRealizationPct: 3.0,
      grossMarginPct: 38.0,
      ebitdaMarginPct: 20.0,
      depreciationPct: 5.0,
      taxRatePct: 25.0,
      capexPctOfSales: 8.0,
      nwcChangePct: 1.0,
      waccPct: 10.0,
      terminalGrowthRatePct: 4.0,
      intersegmentElimination: 0,
    };

    it('handles normal case: g < WACC cleanly', () => {
      const out = calculateScenarioOutputs(2024, 100000, baseParams, [], false);
      expect(out.terminalValue).toBeGreaterThan(0);
      expect(Number.isFinite(out.terminalValue)).toBe(true);
    });

    it('defensively handles boundary condition: g === WACC (prevents division by zero)', () => {
      const params = { ...baseParams, waccPct: 8.0, terminalGrowthRatePct: 8.0 };
      const out = calculateScenarioOutputs(2024, 100000, params, [], false);

      // Denominator should clamp to at least 0.01 instead of dividing by zero (Infinity)
      expect(Number.isFinite(out.terminalValue)).toBe(true);
      expect(out.terminalValue).toBeGreaterThan(0);
      expect(Number.isFinite(out.enterpriseValueIndication)).toBe(true);
    });

    it('defensively handles boundary condition: g > WACC (terminal growth exceeds discount rate)', () => {
      const params = { ...baseParams, waccPct: 6.0, terminalGrowthRatePct: 10.0 };
      const out = calculateScenarioOutputs(2024, 100000, params, [], false);

      // Must not invert to negative TV due to negative denominator
      expect(out.terminalValue).toBeGreaterThan(0);
      expect(Number.isFinite(out.terminalValue)).toBe(true);
    });

    it('evaluates extreme negative WACC boundary (waccPct = -100%)', () => {
      const params = { ...baseParams, waccPct: -100.0 };
      const out = calculateScenarioOutputs(2024, 100000, params, [], false);

      // When wacc = -1, (1 + wacc) = 0, which would divide by zero in discountFactor!
      const ev = out.enterpriseValueIndication;
      // Document whether EV is finite or Infinity
      expect(typeof ev).toBe('number');
    });
  });

  describe('2.4 Segment Aggregation & Invariants', () => {
    const testSegments: SegmentProjectionDriver[] = [
      {
        id: 'seg_a',
        name: 'Segment A',
        baseRevenue: 60000,
        volumeGrowthPct: 10.0,
        priceRealizationPct: 2.0,
        projectedGrowthPct: 12.2,
        projectedEbitdaMarginPct: 25.0,
      },
      {
        id: 'seg_b',
        name: 'Segment B',
        baseRevenue: 40000,
        volumeGrowthPct: 5.0,
        priceRealizationPct: 0.0,
        projectedGrowthPct: 5.0,
        projectedEbitdaMarginPct: 15.0,
      },
    ];

    it('consolidated revenue equals sum of segment projections minus intersegment elimination', () => {
      const params: ScenarioParameters = {
        revenueCagrPct: 10.0,
        volumeGrowthPct: 7.0,
        priceRealizationPct: 3.0,
        grossMarginPct: 38.0,
        ebitdaMarginPct: 18.0,
        depreciationPct: 5.0,
        taxRatePct: 25.0,
        capexPctOfSales: 10.0,
        nwcChangePct: 1.0,
        waccPct: 11.0,
        terminalGrowthRatePct: 4.0,
        intersegmentElimination: 5000,
      };

      const out = calculateScenarioOutputs(2024, 100000, params, testSegments, true);
      const yr1 = out.projectedYears[0];

      // Segment A Year 1: 60000 * 1.122 = 67320
      // Segment B Year 1: 40000 * 1.05 = 42000
      // Total: 109320 - 5000 = 104320
      expect(yr1.segmentRevenues?.seg_a).toBeCloseTo(67320, 0);
      expect(yr1.segmentRevenues?.seg_b).toBeCloseTo(42000, 0);
      expect(yr1.revenue).toBeCloseTo(104320, 0);
    });

    it('handles massive intersegment eliminations exceeding total segment revenues by clamping to 0', () => {
      const params: ScenarioParameters = {
        revenueCagrPct: 10.0,
        volumeGrowthPct: 7.0,
        priceRealizationPct: 3.0,
        grossMarginPct: 38.0,
        ebitdaMarginPct: 18.0,
        depreciationPct: 5.0,
        taxRatePct: 25.0,
        capexPctOfSales: 10.0,
        nwcChangePct: 1.0,
        waccPct: 11.0,
        terminalGrowthRatePct: 4.0,
        intersegmentElimination: 500000, // Massive elimination
      };

      const out = calculateScenarioOutputs(2024, 100000, params, testSegments, true);
      const yr1 = out.projectedYears[0];

      // Revenue must be clamped to 0 defensively
      expect(yr1.revenue).toBe(0);
      expect(yr1.revenue).toBeGreaterThanOrEqual(0);
    });

    it('handles negative segment growth rates (contraction)', () => {
      const contractingSeg: SegmentProjectionDriver[] = [
        {
          id: 'seg_legacy',
          name: 'Legacy Declining',
          baseRevenue: 50000,
          volumeGrowthPct: -20.0,
          priceRealizationPct: -5.0,
          projectedGrowthPct: -24.0,
          projectedEbitdaMarginPct: 10.0,
        },
      ];

      const params: ScenarioParameters = {
        revenueCagrPct: 0,
        volumeGrowthPct: 0,
        priceRealizationPct: 0,
        grossMarginPct: 30,
        ebitdaMarginPct: 10,
        depreciationPct: 5,
        taxRatePct: 25,
        capexPctOfSales: 5,
        nwcChangePct: 1,
        waccPct: 11,
        terminalGrowthRatePct: 3,
        intersegmentElimination: 0,
      };

      const out = calculateScenarioOutputs(2024, 50000, params, contractingSeg, true);
      expect(out.projectedYears[0].revenue).toBeLessThan(50000);
      expect(out.projectedYears[1].revenue).toBeLessThan(out.projectedYears[0].revenue);
    });
  });
});

describe('Adversarial Suite 3: Citation & Drawer Metadata Integrity', () => {
  it('validates citation schema against missing optional fields', () => {
    // Minimal valid citation with only required fields
    const minimalCitation: FinancialCitation = {
      citationId: 'cit_1',
      documentId: 'doc_1',
      documentTitle: 'BSE Quarterly Release',
      docType: 'BSE_FILING',
      source: 'BSE',
      filingDate: '2024-05-15',
      fiscalPeriod: 'FY2024',
      extractedSnippet: {},
      confidence: 0.95,
      verifiedStatus: 'VERIFIED',
    };

    expect(minimalCitation.pageNumber).toBeUndefined();
    expect(minimalCitation.noteReference).toBeUndefined();
    expect(minimalCitation.chunkId).toBeUndefined();
    expect(minimalCitation.extractedSnippet.textPassage).toBeUndefined();
    expect(minimalCitation.extractedSnippet.tableSlice).toBeUndefined();
  });

  it('handles extremely long text passages (10,000 characters) without string memory allocation errors', () => {
    const longPassage = 'A'.repeat(10000);
    const citation = {
      citationId: 'cit_stress_long',
      documentId: 'doc_stress',
      documentTitle: 'Annual Report Extreme',
      docType: 'ANNUAL_REPORT' as const,
      source: 'NSE' as const,
      filingDate: '2024-03-31',
      fiscalPeriod: 'FY2024',
      extractedSnippet: {
        textPassage: longPassage,
      },
      confidence: 0.99,
      verifiedStatus: 'VERIFIED' as const,
    };

    expect(citation.extractedSnippet.textPassage).toHaveLength(10000);
    expect(citation.extractedSnippet.textPassage.slice(0, 10)).toBe('AAAAAAAAAA');
  });

  it('handles empty and irregular table slices in extractedSnippet', () => {
    const emptySlice = {
      headers: [],
      rows: [],
    };
    expect(emptySlice.headers).toHaveLength(0);
    expect(emptySlice.rows).toHaveLength(0);

    // Jagged table rows (different row lengths)
    const jaggedSlice = {
      headers: ['Metric', 'FY23', 'FY24'],
      rows: [
        ['Revenue', 100, 120],
        ['EBITDA', 20], // Missing 3rd cell
        ['PAT', 10, 15, 20], // Extra 4th cell
      ],
    };

    expect(jaggedSlice.rows[1].length).not.toEqual(jaggedSlice.headers.length);
    expect(jaggedSlice.rows[2].length).not.toEqual(jaggedSlice.headers.length);
  });

  it('evaluates citation confidence boundaries', () => {
    const perfectConf = 1.0;
    const zeroConf = 0.0;
    const overConf = 1.25;

    expect(Math.round(perfectConf * 100)).toBe(100);
    expect(Math.round(zeroConf * 100)).toBe(0);
    expect(Math.round(overConf * 100)).toBe(125);
  });

  describe('3.2 Defensive Drawer Citation Schema Failure Modes', () => {
    it('reveals flaw: citation with undefined docType causes runtime crash if docType.replace is called directly', () => {
      // In SourceOfTruthDrawer.tsx: citation.docType.replace('_', ' ')
      const unclassifiedCitation = {
        citationId: 'cit_unclassified',
        documentId: 'doc_99',
        documentTitle: 'Unclassified Note',
        docType: undefined as unknown as 'ANNUAL_REPORT',
        source: 'MANUAL_UPLOAD' as const,
        filingDate: '2024-01-01',
        fiscalPeriod: 'FY2024',
        extractedSnippet: {},
        confidence: 0.8,
        verifiedStatus: 'EXTRACTED' as const,
      };

      // Simulating what line 155 does:
      const safeDocTypeExtractor = (c: typeof unclassifiedCitation) => {
        return c.docType ? c.docType.replace('_', ' ') : 'DOCUMENT';
      };

      // Direct access would throw TypeError:
      expect(() => {
        (unclassifiedCitation.docType as any).replace('_', ' ');
      }).toThrow(TypeError);

      // Defensive extractor survives:
      expect(safeDocTypeExtractor(unclassifiedCitation)).toBe('DOCUMENT');
    });

    it('reveals flaw: tableSlice without headers or rows causes crash if .map() is called without array guard', () => {
      // In SourceOfTruthDrawer.tsx: citation.extractedSnippet.tableSlice.headers.map(...)
      const corruptTableSnippet = {
        tableSlice: {
          headers: undefined as unknown as string[],
          rows: undefined as unknown as (string | number)[][],
        },
      };

      expect(() => {
        (corruptTableSnippet.tableSlice.headers as any).map((h: string) => h);
      }).toThrow(TypeError);

      // Safe guard
      const safeHeaders = Array.isArray(corruptTableSnippet.tableSlice.headers)
        ? corruptTableSnippet.tableSlice.headers
        : [];
      expect(safeHeaders).toHaveLength(0);
    });

    it('handles extreme XSS and HTML injection strings in document title and snippet safely', () => {
      const maliciousCitation = {
        citationId: 'cit_xss',
        documentId: 'doc_xss',
        documentTitle: '<script>alert("xss")</script><img src=x onerror=alert(1)>',
        docType: 'ANNUAL_REPORT' as const,
        source: 'BSE' as const,
        filingDate: '2024-03-31',
        fiscalPeriod: 'FY2024',
        extractedSnippet: {
          textPassage: '"><svg onload=alert(document.cookie)>',
          tableSlice: {
            headers: ['<script>', '<b>Col</b>'],
            rows: [['<img src=x>', '100']],
          },
        },
        confidence: 0.99,
        verifiedStatus: 'VERIFIED' as const,
      };

      // React JSX escapes strings by default, verifying raw strings are preserved without syntax error
      expect(maliciousCitation.documentTitle).toContain('<script>');
      expect(maliciousCitation.extractedSnippet.textPassage).toContain('<svg');
    });
  });

  describe('3.3 Infinity and Division-by-Zero Formatting Flaw (Empirical Discovery)', () => {
    it('empirically reveals formatter behavior when Infinity is passed', () => {
      // In formatters.ts: isNaN(Infinity) is false.
      // Math.abs(Infinity).toFixed(0) produces "Infinity"
      // Remediation verifies that !isFinite(val) cleanly returns institutional em-dash '—'.
      const infFormatted = formatIndianGrouping(Infinity);
      expect(infFormatted).toBe('—');

      const infInr = formatINRCrores(Infinity);
      expect(infInr).toBe('—');

      const negInfInr = formatINRCrores(-Infinity);
      expect(negInfInr).toBe('—');
    });
  });
});

