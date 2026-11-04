import { describe, it, expect, beforeEach } from 'vitest';
import { useScenarioStore } from '../src/lib/scenario-store';

describe('useScenarioStore — Reactive Scenario State & Valuation Engine', () => {
  beforeEach(() => {
    // Reset store to known fresh baseline before each test
    useScenarioStore.getState().resetToDefaults();
  });

  describe('1. Store Initialization & Default State', () => {
    it('initializes with default symbol RELIANCE, baseYear 2024, and activeScenario base', () => {
      const state = useScenarioStore.getState();
      expect(state.symbol).toBe('RELIANCE');
      expect(state.baseYear).toBe(2024);
      expect(state.baseRevenue).toBe(901064);
      expect(state.activeScenario).toBe('base');
      expect(state.useSegmentAggregation).toBe(true);
      expect(state.comparisonMode).toBe(false);
      expect(state.saveStatus).toBe('idle');
    });

    it('contains valid default parameters for base, bull, and bear cases', () => {
      const { scenarios } = useScenarioStore.getState();

      expect(scenarios.base.revenueCagrPct).toBe(10.0);
      expect(scenarios.base.ebitdaMarginPct).toBe(18.0);
      expect(scenarios.base.taxRatePct).toBe(25.0);

      expect(scenarios.bull.revenueCagrPct).toBe(15.0);
      expect(scenarios.bull.ebitdaMarginPct).toBe(21.0);

      expect(scenarios.bear.revenueCagrPct).toBe(4.0);
      expect(scenarios.bear.ebitdaMarginPct).toBe(14.5);
    });

    it('initializes per-segment drivers across 5 Reliance operating divisions', () => {
      const { segmentDrivers } = useScenarioStore.getState();
      const baseSegments = segmentDrivers.base;

      expect(baseSegments.length).toBeGreaterThanOrEqual(5);
      const o2c = baseSegments.find((s) => s.id === 'seg_o2c');
      const retail = baseSegments.find((s) => s.id === 'seg_retail');
      const digital = baseSegments.find((s) => s.id === 'seg_digital');

      expect(o2c).toBeDefined();
      expect(o2c?.baseRevenue).toBe(500000);
      expect(retail).toBeDefined();
      expect(retail?.baseRevenue).toBe(275000);
      expect(digital).toBeDefined();
      expect(digital?.baseRevenue).toBe(115000);
    });

    it('pre-computes 5 projection years (FY25E to FY29E) on initial load', () => {
      const { outputs } = useScenarioStore.getState();
      const baseYears = outputs.base.projectedYears;

      expect(baseYears).toHaveLength(5);
      expect(baseYears[0].year).toBe('FY25E');
      expect(baseYears[4].year).toBe('FY29E');
      expect(baseYears[0].revenue).toBeGreaterThan(0);
      expect(outputs.base.cagr5Y).toBeGreaterThan(0);
      expect(outputs.base.cumulativeFcf5Y).toBeGreaterThan(0);
    });
  });

  describe('2. Scenario Switching & Comparison Mode', () => {
    it('switches active scenario between base, bull, and bear', () => {
      const store = useScenarioStore.getState();

      store.setActiveScenario('bull');
      expect(useScenarioStore.getState().activeScenario).toBe('bull');

      store.setActiveScenario('bear');
      expect(useScenarioStore.getState().activeScenario).toBe('bear');

      store.setActiveScenario('base');
      expect(useScenarioStore.getState().activeScenario).toBe('base');
    });

    it('toggles comparison mode between single and side-by-side views', () => {
      const store = useScenarioStore.getState();
      expect(store.comparisonMode).toBe(false);

      store.setComparisonMode(true);
      expect(useScenarioStore.getState().comparisonMode).toBe(true);

      store.setComparisonMode(false);
      expect(useScenarioStore.getState().comparisonMode).toBe(false);
    });
  });

  describe('3. Reactive Recalculation on Driver Updates', () => {
    it('reactively recalculates 5-year revenues and margins when revenueCagrPct is updated', () => {
      const store = useScenarioStore.getState();
      // Disable segment aggregation to test pure consolidated CAGR mode
      store.setUseSegmentAggregation(false);

      const initialFy25Rev = useScenarioStore.getState().outputs.base.projectedYears[0].revenue;

      // Update CAGR from 10% to 20%
      store.setDriver('base', 'revenueCagrPct', 20.0);

      const updatedOutputs = useScenarioStore.getState().outputs.base;
      const updatedFy25Rev = updatedOutputs.projectedYears[0].revenue;

      expect(updatedFy25Rev).toBeGreaterThan(initialFy25Rev);
      expect(updatedOutputs.cagr5Y).toBeCloseTo(20.0, 1);
    });

    it('reactively updates EBITDA, PAT, and FCF when ebitdaMarginPct changes', () => {
      const store = useScenarioStore.getState();
      store.setUseSegmentAggregation(false);

      const initialEbitda = useScenarioStore.getState().outputs.base.projectedYears[0].ebitda;
      const initialPat = useScenarioStore.getState().outputs.base.projectedYears[0].pat;
      const initialFcf = useScenarioStore.getState().outputs.base.projectedYears[0].fcf;

      // Expand EBITDA margin from 18% to 25%
      store.setDriver('base', 'ebitdaMarginPct', 25.0);

      const updated = useScenarioStore.getState().outputs.base.projectedYears[0];
      expect(updated.ebitda).toBeGreaterThan(initialEbitda);
      expect(updated.pat).toBeGreaterThan(initialPat);
      expect(updated.fcf).toBeGreaterThan(initialFcf);
      expect(updated.ebitdaMarginPct).toBe(25.0);
    });

    it('reactively updates capex and FCF when capexPctOfSales increases', () => {
      const store = useScenarioStore.getState();
      store.setUseSegmentAggregation(false);

      const initialCapex = useScenarioStore.getState().outputs.base.projectedYears[0].capex;
      const initialFcf = useScenarioStore.getState().outputs.base.projectedYears[0].fcf;

      // Increase capex intensity from 11% to 18%
      store.setDriver('base', 'capexPctOfSales', 18.0);

      const updated = useScenarioStore.getState().outputs.base.projectedYears[0];
      expect(updated.capex).toBeGreaterThan(initialCapex);
      // Higher capex reduces free cash flow
      expect(updated.fcf).toBeLessThan(initialFcf);
    });

    it('modifying bull case drivers does not contaminate base or bear outputs', () => {
      const store = useScenarioStore.getState();
      const baseFy25RevBefore = store.outputs.base.projectedYears[0].revenue;
      const bearFy25RevBefore = store.outputs.bear.projectedYears[0].revenue;

      // Modify bull driver
      store.setDriver('bull', 'revenueCagrPct', 35.0);

      const stateAfter = useScenarioStore.getState();
      expect(stateAfter.outputs.base.projectedYears[0].revenue).toBe(baseFy25RevBefore);
      expect(stateAfter.outputs.bear.projectedYears[0].revenue).toBe(bearFy25RevBefore);
      expect(stateAfter.scenarios.bull.revenueCagrPct).toBe(35.0);
    });
  });

  describe('4. Segment Driver Aggregations', () => {
    it('reactively recalculates consolidated revenue when segment volume growth changes', () => {
      const store = useScenarioStore.getState();
      store.setUseSegmentAggregation(true);

      const initialFy25Rev = store.outputs.base.projectedYears[0].revenue;

      // Accelerate Retail volume growth from 14% to 30%
      store.updateSegmentDriver('base', 'seg_retail', { volumeGrowthPct: 30.0 });

      const updatedFy25Rev = useScenarioStore.getState().outputs.base.projectedYears[0].revenue;
      expect(updatedFy25Rev).toBeGreaterThan(initialFy25Rev);
    });

    it('supports adding and removing custom segments dynamically', () => {
      const store = useScenarioStore.getState();
      const initialSegmentCount = store.segmentDrivers.base.length;
      const initialFy25Rev = store.outputs.base.projectedYears[0].revenue;

      // Add a New Energy / Solar segment
      store.addSegment('base', {
        name: 'New Energy & Giga Factories',
        baseRevenue: 50000,
        volumeGrowthPct: 25.0,
        priceRealizationPct: 0.0,
        projectedEbitdaMarginPct: 20.0,
      });

      const withNewSeg = useScenarioStore.getState();
      expect(withNewSeg.segmentDrivers.base).toHaveLength(initialSegmentCount + 1);
      expect(withNewSeg.outputs.base.projectedYears[0].revenue).toBeGreaterThan(initialFy25Rev);

      // Remove the newly added segment
      const newSegId = withNewSeg.segmentDrivers.base[withNewSeg.segmentDrivers.base.length - 1].id;
      store.removeSegment('base', newSegId);

      const afterRemoval = useScenarioStore.getState();
      expect(afterRemoval.segmentDrivers.base).toHaveLength(initialSegmentCount);
    });
  });

  describe('5. Import and Export Roundtrip', () => {
    it('exports scenario to JSON and imports it back losslessly', () => {
      const store = useScenarioStore.getState();
      store.setDriver('base', 'revenueCagrPct', 18.5);
      store.setDriver('base', 'ebitdaMarginPct', 22.0);

      const jsonStr = store.exportScenarioJSON('base');
      expect(jsonStr).toContain('"symbol": "RELIANCE"');
      expect(jsonStr).toContain('"revenueCagrPct": 18.5');
      expect(jsonStr).toContain('"ebitdaMarginPct": 22');

      // Reset store
      store.resetToDefaults();
      expect(useScenarioStore.getState().scenarios.base.revenueCagrPct).toBe(10.0);

      // Import JSON back
      const result = useScenarioStore.getState().importScenarioJSON(jsonStr);
      expect(result.success).toBe(true);

      const importedState = useScenarioStore.getState();
      expect(importedState.scenarios.base.revenueCagrPct).toBe(18.5);
      expect(importedState.scenarios.base.ebitdaMarginPct).toBe(22.0);
    });

    it('exports scenario projections to CSV and imports driver values back', () => {
      const store = useScenarioStore.getState();
      store.setDriver('base', 'revenueCagrPct', 14.0);

      const csvStr = store.exportScenarioCSV('base');
      expect(csvStr).toContain('Consolidated Revenue CAGR');
      expect(csvStr).toContain('Target EBITDA Margin');
      expect(csvStr).toContain('Free Cash Flow (FCF)');

      // Import CSV with updated values
      const modifiedCsv = `Category,Parameter / Metric,Unit,FY25E\nDriver,Consolidated Revenue CAGR,%,16.5\nDriver,Target EBITDA Margin,%,23.5`;
      const result = store.importScenarioCSV(modifiedCsv);
      expect(result.success).toBe(true);

      const updated = useScenarioStore.getState().scenarios.base;
      expect(updated.revenueCagrPct).toBe(16.5);
      expect(updated.ebitdaMarginPct).toBe(23.5);
    });

    it('gracefully handles malformed JSON and CSV imports without crashing', () => {
      const store = useScenarioStore.getState();

      const badJsonResult = store.importScenarioJSON('{ invalid json syntax ');
      expect(badJsonResult.success).toBe(false);

      const badCsvResult = store.importScenarioCSV('single line header only');
      expect(badCsvResult.success).toBe(false);
    });
  });

  describe('6. Calculation Formula Invariants', () => {
    it('satisfies EBIT = EBITDA - Depreciation and FCF = EBIT*(1-t) + Depr - Capex - NWC', () => {
      const { outputs } = useScenarioStore.getState();
      const yr = outputs.base.projectedYears[0];

      // Test EBIT formula
      expect(yr.ebit).toBeCloseTo(yr.ebitda - yr.depreciation, 1);

      // Test Free Cash Flow formula: EBIT*(1 - taxRate) + Depr - Capex - NWC
      const taxRate = useScenarioStore.getState().scenarios.base.taxRatePct / 100;
      const expectedFcf = yr.ebit * (1 - taxRate) + yr.depreciation - yr.capex - yr.nwcChange;

      expect(yr.fcf).toBeCloseTo(expectedFcf, 1);
    });

    it('calculates terminal value correctly via Gordon Growth formula', () => {
      const { scenarios, outputs } = useScenarioStore.getState();
      const params = scenarios.base;
      const finalYr = outputs.base.projectedYears[4];

      const g = params.terminalGrowthRatePct / 100;
      const wacc = params.waccPct / 100;
      const expectedTv = (finalYr.fcf * (1 + g)) / (wacc - g);

      expect(outputs.base.terminalValue).toBeCloseTo(expectedTv, 0);
    });
  });

  describe('7. Database Persistence Lifecycle', () => {
    it('triggers saveScenario and updates saveStatus to saved', async () => {
      const store = useScenarioStore.getState();
      await store.saveScenario();

      const updated = useScenarioStore.getState();
      expect(updated.saveStatus).toBe('saved');
      expect(updated.lastSavedAt).toBeDefined();
    });
  });
});
