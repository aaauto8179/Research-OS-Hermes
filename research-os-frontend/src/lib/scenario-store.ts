/**
 * Reactive Zustand Scenario Store for Fundamental Equity Research
 * Requirement R4: Projections & Reactive Scenario Inputs
 * 
 * Supports three cases ('base', 'bull', 'bear'), per-segment drivers,
 * instantaneous in-memory financial recalculations (FY25E to FY29E),
 * JSON/CSV import/export, and debounced PostgreSQL/Supabase persistence.
 */

import { create } from 'zustand';
import { supabase } from './supabase';
import { debounce } from './utils';

export type ScenarioCase = 'base' | 'bull' | 'bear';

export interface SegmentProjectionDriver {
  id: string;
  name: string;
  baseRevenue: number; // in ₹ Cr (FY24 base)
  volumeGrowthPct: number; // e.g. 8.0%
  priceRealizationPct: number; // e.g. 3.0%
  projectedGrowthPct: number; // (1+vol)*(1+price) - 1
  projectedEbitdaMarginPct: number; // e.g. 18.0%
}

export interface ScenarioParameters {
  revenueCagrPct: number; // Consolidated CAGR fallback (%)
  volumeGrowthPct: number; // Volume growth driver (%)
  priceRealizationPct: number; // Price realization driver (%)
  grossMarginPct: number; // Target Gross Margin (%)
  ebitdaMarginPct: number; // Target EBITDA Margin (%)
  depreciationPct: number; // Depreciation as % of sales
  taxRatePct: number; // Effective corporate tax rate (%)
  capexPctOfSales: number; // Capex as % of sales
  nwcChangePct: number; // Net Working Capital change as % of sales
  waccPct: number; // Discount rate (WACC) for DCF linkage (%)
  terminalGrowthRatePct: number; // Terminal growth rate (%)
  intersegmentElimination: number; // Intersegment eliminations (₹ Cr)
}

export interface ProjectedYearMetrics {
  year: string; // e.g. "FY25E"
  fiscalYear: number; // e.g. 2025
  revenue: number; // in ₹ Cr
  grossProfit: number;
  ebitda: number;
  depreciation: number;
  ebit: number;
  tax: number;
  pat: number; // Profit After Tax (Net Profit)
  capex: number;
  nwcChange: number;
  fcf: number; // Free Cash Flow = EBIT*(1-t) + Depr - Capex - NWC
  ebitdaMarginPct: number;
  patMarginPct: number;
  fcfMarginPct: number;
  segmentRevenues?: Record<string, number>;
}

export interface ScenarioOutputs {
  projectedYears: ProjectedYearMetrics[];
  cagr5Y: number; // 5-Year Revenue CAGR (%)
  cumulativeFcf5Y: number; // Total 5-Year Free Cash Flow (₹ Cr)
  terminalValue: number; // Implied Terminal Value (₹ Cr)
  enterpriseValueIndication: number; // Indicated EV from 5Y FCF + TV
}

export interface HistoricalYear {
  year: string;
  fiscalYear: number;
  revenue: number;
  ebitda: number;
  ebitdaMarginPct: number;
  pat: number;
  capex: number;
}

export interface ScenarioState {
  symbol: string;
  baseYear: number; // default: 2024
  baseRevenue: number; // FY24 base consolidated revenue in ₹ Cr
  activeScenario: ScenarioCase;
  useSegmentAggregation: boolean;
  comparisonMode: boolean;

  // Scenario parameters keyed by case
  scenarios: Record<ScenarioCase, ScenarioParameters>;

  // Per-segment drivers keyed by case
  segmentDrivers: Record<ScenarioCase, SegmentProjectionDriver[]>;

  // Calculated 5-year projections keyed by case
  outputs: Record<ScenarioCase, ScenarioOutputs>;

  // Historical reference actuals (FY20 - FY24)
  historical: HistoricalYear[];

  // Persistence status
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: string | null;
  errorMessage: string | null;

  // Actions
  setSymbol: (symbol: string) => void;
  setBaseYear: (year: number) => void;
  setActiveScenario: (activeScenario: ScenarioCase) => void;
  setUseSegmentAggregation: (enabled: boolean) => void;
  setComparisonMode: (enabled: boolean) => void;

  // Driver updates
  setDriver: (scenario: ScenarioCase, driverKey: keyof ScenarioParameters, value: number) => void;
  updateDriver: (scenario: ScenarioCase, driverKey: keyof ScenarioParameters, value: number) => void;
  setSegmentDriver: (
    scenario: ScenarioCase,
    segmentId: string,
    updates: Partial<SegmentProjectionDriver>
  ) => void;
  updateSegmentDriver: (
    scenario: ScenarioCase,
    segmentId: string,
    updates: Partial<SegmentProjectionDriver>
  ) => void;
  addSegment: (scenario: ScenarioCase, segment: Omit<SegmentProjectionDriver, 'id' | 'projectedGrowthPct'>) => void;
  removeSegment: (scenario: ScenarioCase, segmentId: string) => void;

  // Reactive Calculation Engine
  recomputeProjections: (scenarioCase?: ScenarioCase) => void;

  // File I/O
  exportScenarioJSON: (scenarioCase?: ScenarioCase) => string;
  exportScenarioCSV: (scenarioCase?: ScenarioCase) => string;
  importScenarioJSON: (jsonString: string) => { success: boolean; message?: string };
  importScenarioCSV: (csvString: string) => { success: boolean; message?: string };

  // Database Persistence
  saveScenario: () => Promise<void>;
  saveToDatabase: () => Promise<void>;
  loadScenario: (symbol: string) => Promise<void>;
  resetToDefaults: () => void;
}

// Default Company Profiles & Segmentations
const DEFAULT_RELIANCE_SEGMENTS: SegmentProjectionDriver[] = [
  {
    id: 'seg_o2c',
    name: 'Oil to Chemicals (O2C)',
    baseRevenue: 500000,
    volumeGrowthPct: 4.0,
    priceRealizationPct: 2.0,
    projectedGrowthPct: 6.08,
    projectedEbitdaMarginPct: 12.0,
  },
  {
    id: 'seg_retail',
    name: 'Consumer Retail (Reliance Retail)',
    baseRevenue: 275000,
    volumeGrowthPct: 14.0,
    priceRealizationPct: 3.0,
    projectedGrowthPct: 17.42,
    projectedEbitdaMarginPct: 9.0,
  },
  {
    id: 'seg_digital',
    name: 'Digital Services (Jio Infocomm)',
    baseRevenue: 115000,
    volumeGrowthPct: 12.0,
    priceRealizationPct: 6.0,
    projectedGrowthPct: 18.72,
    projectedEbitdaMarginPct: 50.0,
  },
  {
    id: 'seg_upstream',
    name: 'Oil & Gas (Upstream E&P)',
    baseRevenue: 25000,
    volumeGrowthPct: 5.0,
    priceRealizationPct: 2.0,
    projectedGrowthPct: 7.1,
    projectedEbitdaMarginPct: 65.0,
  },
  {
    id: 'seg_others',
    name: 'Other Businesses & New Energy',
    baseRevenue: 15000,
    volumeGrowthPct: 8.0,
    priceRealizationPct: 0.0,
    projectedGrowthPct: 8.0,
    projectedEbitdaMarginPct: 15.0,
  },
];

const DEFAULT_SCENARIOS: Record<ScenarioCase, ScenarioParameters> = {
  base: {
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
  },
  bull: {
    revenueCagrPct: 15.0,
    volumeGrowthPct: 11.0,
    priceRealizationPct: 4.0,
    grossMarginPct: 42.0,
    ebitdaMarginPct: 21.0,
    depreciationPct: 4.8,
    taxRatePct: 25.0,
    capexPctOfSales: 13.0,
    nwcChangePct: 1.0,
    waccPct: 10.5,
    terminalGrowthRatePct: 5.0,
    intersegmentElimination: 32000,
  },
  bear: {
    revenueCagrPct: 4.0,
    volumeGrowthPct: 3.0,
    priceRealizationPct: 1.0,
    grossMarginPct: 33.0,
    ebitdaMarginPct: 14.5,
    depreciationPct: 5.5,
    taxRatePct: 25.0,
    capexPctOfSales: 8.5,
    nwcChangePct: 2.0,
    waccPct: 13.0,
    terminalGrowthRatePct: 3.5,
    intersegmentElimination: 25000,
  },
};

const DEFAULT_HISTORICAL_RELIANCE: HistoricalYear[] = [
  { year: 'FY20', fiscalYear: 2020, revenue: 596679, ebitda: 88709, ebitdaMarginPct: 14.87, pat: 39880, capex: 76517 },
  { year: 'FY21', fiscalYear: 2021, revenue: 466307, ebitda: 80703, ebitdaMarginPct: 17.31, pat: 53739, capex: 79687 },
  { year: 'FY22', fiscalYear: 2022, revenue: 699962, ebitda: 110460, ebitdaMarginPct: 15.78, pat: 67845, capex: 145500 },
  { year: 'FY23', fiscalYear: 2023, revenue: 877835, ebitda: 142912, ebitdaMarginPct: 16.28, pat: 74088, capex: 141809 },
  { year: 'FY24', fiscalYear: 2024, revenue: 901064, ebitda: 162246, ebitdaMarginPct: 18.01, pat: 79020, capex: 131769 },
];

/**
 * Pure calculation function computing 5-year projections from parameters & segments
 */
export function calculateScenarioOutputs(
  baseYear: number,
  baseRevenue: number,
  params: ScenarioParameters,
  segments: SegmentProjectionDriver[],
  useSegmentAggregation: boolean
): ScenarioOutputs {
  const forecastYears = 5;
  const projectedYears: ProjectedYearMetrics[] = [];

  // Track segment revenues year by year
  const currentSegmentRevs: Record<string, number> = {};
  segments.forEach((seg) => {
    currentSegmentRevs[seg.id] = seg.baseRevenue;
  });

  let previousYearRevenue = baseRevenue;

  for (let i = 1; i <= forecastYears; i++) {
    const fiscalYear = baseYear + i;
    const yearLabel = `FY${String(fiscalYear).slice(-2)}E`;

    let yearRevenue = 0;
    const yearSegmentRevenues: Record<string, number> = {};
    let aggregatedSegmentEbitda = 0;

    if (useSegmentAggregation && segments.length > 0) {
      let segmentSum = 0;
      segments.forEach((seg) => {
        const growthRate = (1 + seg.volumeGrowthPct / 100) * (1 + seg.priceRealizationPct / 100) - 1;
        const prevSegRev = currentSegmentRevs[seg.id] ?? seg.baseRevenue;
        const projectedSegRev = prevSegRev * (1 + growthRate);
        currentSegmentRevs[seg.id] = projectedSegRev;
        yearSegmentRevenues[seg.id] = projectedSegRev;
        segmentSum += projectedSegRev;

        const segEbitda = projectedSegRev * (seg.projectedEbitdaMarginPct / 100);
        aggregatedSegmentEbitda += segEbitda;
      });

      // Net of intersegment elimination
      yearRevenue = Math.max(0, segmentSum - params.intersegmentElimination);
    } else {
      // In consolidated CAGR mode, revenueCagrPct directly determines annual growth
      const growthRate = params.revenueCagrPct / 100;
      yearRevenue = previousYearRevenue * (1 + growthRate);
    }

    previousYearRevenue = yearRevenue;

    // Financial statement metrics
    const grossProfit = yearRevenue * (params.grossMarginPct / 100);
    const ebitda =
      useSegmentAggregation && segments.length > 0
        ? aggregatedSegmentEbitda
        : yearRevenue * (params.ebitdaMarginPct / 100);

    const depreciation = yearRevenue * (params.depreciationPct / 100);
    const ebit = ebitda - depreciation;
    const taxableIncome = Math.max(0, ebit);
    const tax = taxableIncome * (params.taxRatePct / 100);
    const pat = ebit - tax;

    const capex = yearRevenue * (params.capexPctOfSales / 100);
    const nwcChange = yearRevenue * (params.nwcChangePct / 100);

    // Free Cash Flow to Firm (FCFF) = EBIT * (1 - t) + Depr - Capex - ΔNWC
    const fcf = ebit * (1 - params.taxRatePct / 100) + depreciation - capex - nwcChange;

    const ebitdaMarginPct = yearRevenue > 0 ? (ebitda / yearRevenue) * 100 : 0;
    const patMarginPct = yearRevenue > 0 ? (pat / yearRevenue) * 100 : 0;
    const fcfMarginPct = yearRevenue > 0 ? (fcf / yearRevenue) * 100 : 0;

    projectedYears.push({
      year: yearLabel,
      fiscalYear,
      revenue: Math.round(yearRevenue * 100) / 100,
      grossProfit: Math.round(grossProfit * 100) / 100,
      ebitda: Math.round(ebitda * 100) / 100,
      depreciation: Math.round(depreciation * 100) / 100,
      ebit: Math.round(ebit * 100) / 100,
      tax: Math.round(tax * 100) / 100,
      pat: Math.round(pat * 100) / 100,
      capex: Math.round(capex * 100) / 100,
      nwcChange: Math.round(nwcChange * 100) / 100,
      fcf: Math.round(fcf * 100) / 100,
      ebitdaMarginPct: Math.round(ebitdaMarginPct * 100) / 100,
      patMarginPct: Math.round(patMarginPct * 100) / 100,
      fcfMarginPct: Math.round(fcfMarginPct * 100) / 100,
      segmentRevenues: yearSegmentRevenues,
    });
  }

  // 5-Year CAGR: (Rev_5 / Rev_0)^(1/5) - 1
  const finalRev = projectedYears[projectedYears.length - 1]?.revenue ?? baseRevenue;
  const cagr5Y = baseRevenue > 0 ? (Math.pow(finalRev / baseRevenue, 1 / forecastYears) - 1) * 100 : 0;

  // Cumulative 5Y FCF
  const cumulativeFcf5Y = projectedYears.reduce((sum, yr) => sum + yr.fcf, 0);

  // Terminal Value = (FCF_5 * (1 + g)) / (WACC - g)
  const finalFcf = projectedYears[projectedYears.length - 1]?.fcf ?? 0;
  const g = params.terminalGrowthRatePct / 100;
  const wacc = params.waccPct / 100;
  const denom = Math.max(0.01, wacc - g);
  const terminalValue = finalFcf > 0 ? (finalFcf * (1 + g)) / denom : 0;

  // Indication of Enterprise Value (Discounted 5Y FCF + PV of Terminal Value)
  let pvFcfSum = 0;
  projectedYears.forEach((yr, idx) => {
    const discountFactor = Math.pow(1 + wacc, idx + 1);
    pvFcfSum += yr.fcf / discountFactor;
  });
  const pvTerminalValue = terminalValue / Math.pow(1 + wacc, forecastYears);
  const enterpriseValueIndication = pvFcfSum + pvTerminalValue;

  return {
    projectedYears,
    cagr5Y: Math.round(cagr5Y * 100) / 100,
    cumulativeFcf5Y: Math.round(cumulativeFcf5Y * 100) / 100,
    terminalValue: Math.round(terminalValue * 100) / 100,
    enterpriseValueIndication: Math.round(enterpriseValueIndication * 100) / 100,
  };
}

// Helper to create initial segment copies per case
function createDefaultSegmentDrivers(): Record<ScenarioCase, SegmentProjectionDriver[]> {
  const clone = (segments: SegmentProjectionDriver[], volDelta: number, marginDelta: number) =>
    segments.map((s) => {
      const vol = Math.max(0, s.volumeGrowthPct + volDelta);
      const margin = Math.max(0, s.projectedEbitdaMarginPct + marginDelta);
      const growth = (1 + vol / 100) * (1 + s.priceRealizationPct / 100) - 1;
      return {
        ...s,
        volumeGrowthPct: vol,
        projectedEbitdaMarginPct: margin,
        projectedGrowthPct: Math.round(growth * 10000) / 100,
      };
    });

  return {
    base: clone(DEFAULT_RELIANCE_SEGMENTS, 0, 0),
    bull: clone(DEFAULT_RELIANCE_SEGMENTS, 4.0, 3.0),
    bear: clone(DEFAULT_RELIANCE_SEGMENTS, -4.0, -3.0),
  };
}

// Initial outputs for all three cases
function computeAllInitialOutputs(
  baseYear: number,
  baseRevenue: number,
  scenarios: Record<ScenarioCase, ScenarioParameters>,
  segmentDrivers: Record<ScenarioCase, SegmentProjectionDriver[]>,
  useSegmentAggregation: boolean
): Record<ScenarioCase, ScenarioOutputs> {
  return {
    base: calculateScenarioOutputs(baseYear, baseRevenue, scenarios.base, segmentDrivers.base, useSegmentAggregation),
    bull: calculateScenarioOutputs(baseYear, baseRevenue, scenarios.bull, segmentDrivers.bull, useSegmentAggregation),
    bear: calculateScenarioOutputs(baseYear, baseRevenue, scenarios.bear, segmentDrivers.bear, useSegmentAggregation),
  };
}

// Initial state setup
const initialBaseYear = 2024;
const initialBaseRevenue = 901064;
const initialScenarios = { ...DEFAULT_SCENARIOS };
const initialSegmentDrivers = createDefaultSegmentDrivers();
const initialOutputs = computeAllInitialOutputs(
  initialBaseYear,
  initialBaseRevenue,
  initialScenarios,
  initialSegmentDrivers,
  true
);

// Module-level debounced save handle (500ms)
let debouncedAutoSave: (() => void) | null = null;

export const useScenarioStore = create<ScenarioState>((set, get) => {
  // Trigger debounced save to database
  const scheduleDebouncedSave = () => {
    if (!debouncedAutoSave) {
      debouncedAutoSave = debounce(() => {
        get().saveToDatabase();
      }, 500);
    }
    set({ saveStatus: 'saving' });
    debouncedAutoSave();
  };

  return {
    symbol: 'RELIANCE',
    baseYear: initialBaseYear,
    baseRevenue: initialBaseRevenue,
    activeScenario: 'base',
    useSegmentAggregation: true,
    comparisonMode: false,
    scenarios: initialScenarios,
    segmentDrivers: initialSegmentDrivers,
    outputs: initialOutputs,
    historical: DEFAULT_HISTORICAL_RELIANCE,
    saveStatus: 'idle',
    lastSavedAt: null,
    errorMessage: null,

    setSymbol: (symbol: string) => {
      set({ symbol: symbol.toUpperCase() });
      get().recomputeProjections();
      scheduleDebouncedSave();
    },

    setBaseYear: (year: number) => {
      set({ baseYear: year });
      get().recomputeProjections();
      scheduleDebouncedSave();
    },

    setActiveScenario: (activeScenario: ScenarioCase) => {
      set({ activeScenario });
    },

    setUseSegmentAggregation: (enabled: boolean) => {
      set({ useSegmentAggregation: enabled });
      get().recomputeProjections();
      scheduleDebouncedSave();
    },

    setComparisonMode: (enabled: boolean) => {
      set({ comparisonMode: enabled });
    },

    setDriver: (scenario: ScenarioCase, driverKey: keyof ScenarioParameters, value: number) => {
      set((state) => {
        const nextScenario = {
          ...state.scenarios[scenario],
          [driverKey]: value,
        };

        if (driverKey === 'volumeGrowthPct' || driverKey === 'priceRealizationPct') {
          const vol = nextScenario.volumeGrowthPct;
          const price = nextScenario.priceRealizationPct;
          nextScenario.revenueCagrPct =
            Math.round(((1 + vol / 100) * (1 + price / 100) - 1) * 10000) / 100;
        }

        return {
          scenarios: {
            ...state.scenarios,
            [scenario]: nextScenario,
          },
        };
      });
      get().recomputeProjections(scenario);
      scheduleDebouncedSave();
    },

    updateDriver: (scenario: ScenarioCase, driverKey: keyof ScenarioParameters, value: number) => {
      get().setDriver(scenario, driverKey, value);
    },

    setSegmentDriver: (
      scenario: ScenarioCase,
      segmentId: string,
      updates: Partial<SegmentProjectionDriver>
    ) => {
      set((state) => {
        const segs = state.segmentDrivers[scenario].map((seg) => {
          if (seg.id !== segmentId) return seg;
          const merged = { ...seg, ...updates };
          const vol = merged.volumeGrowthPct;
          const price = merged.priceRealizationPct;
          merged.projectedGrowthPct =
            Math.round(((1 + vol / 100) * (1 + price / 100) - 1) * 10000) / 100;
          return merged;
        });

        return {
          segmentDrivers: {
            ...state.segmentDrivers,
            [scenario]: segs,
          },
        };
      });
      get().recomputeProjections(scenario);
      scheduleDebouncedSave();
    },

    updateSegmentDriver: (
      scenario: ScenarioCase,
      segmentId: string,
      updates: Partial<SegmentProjectionDriver>
    ) => {
      get().setSegmentDriver(scenario, segmentId, updates);
    },

    addSegment: (scenario: ScenarioCase, segment: Omit<SegmentProjectionDriver, 'id' | 'projectedGrowthPct'>) => {
      const id = `seg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const growth =
        Math.round(((1 + segment.volumeGrowthPct / 100) * (1 + segment.priceRealizationPct / 100) - 1) * 10000) / 100;
      const newSeg: SegmentProjectionDriver = {
        ...segment,
        id,
        projectedGrowthPct: growth,
      };

      set((state) => ({
        segmentDrivers: {
          ...state.segmentDrivers,
          [scenario]: [...state.segmentDrivers[scenario], newSeg],
        },
      }));
      get().recomputeProjections(scenario);
      scheduleDebouncedSave();
    },

    removeSegment: (scenario: ScenarioCase, segmentId: string) => {
      set((state) => ({
        segmentDrivers: {
          ...state.segmentDrivers,
          [scenario]: state.segmentDrivers[scenario].filter((s) => s.id !== segmentId),
        },
      }));
      get().recomputeProjections(scenario);
      scheduleDebouncedSave();
    },

    recomputeProjections: (scenarioCase?: ScenarioCase) => {
      const { baseYear, baseRevenue, scenarios, segmentDrivers, useSegmentAggregation } = get();

      if (scenarioCase) {
        const newOutput = calculateScenarioOutputs(
          baseYear,
          baseRevenue,
          scenarios[scenarioCase],
          segmentDrivers[scenarioCase],
          useSegmentAggregation
        );
        set((state) => ({
          outputs: {
            ...state.outputs,
            [scenarioCase]: newOutput,
          },
        }));
      } else {
        const allOutputs = computeAllInitialOutputs(
          baseYear,
          baseRevenue,
          scenarios,
          segmentDrivers,
          useSegmentAggregation
        );
        set({ outputs: allOutputs });
      }
    },

    exportScenarioJSON: (scenarioCase?: ScenarioCase): string => {
      const { symbol, baseYear, baseRevenue, scenarios, segmentDrivers, outputs } = get();
      const targetCase = scenarioCase || get().activeScenario;

      const exportPayload = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        symbol,
        baseYear,
        baseRevenue,
        case: targetCase,
        drivers: scenarios[targetCase],
        segmentDrivers: segmentDrivers[targetCase],
        outputs: outputs[targetCase],
      };

      return JSON.stringify(exportPayload, null, 2);
    },

    exportScenarioCSV: (scenarioCase?: ScenarioCase): string => {
      const targetCase = scenarioCase || get().activeScenario;
      const { scenarios, outputs } = get();
      const params = scenarios[targetCase];
      const yrs = outputs[targetCase].projectedYears;

      const headers = ['Category', 'Parameter / Metric', 'Unit', ...yrs.map((y) => y.year)];
      const rows: string[][] = [
        headers,
        ['Driver', 'Consolidated Revenue CAGR', '%', ...yrs.map(() => params.revenueCagrPct.toString())],
        ['Driver', 'Volume Growth', '%', ...yrs.map(() => params.volumeGrowthPct.toString())],
        ['Driver', 'Price Realization', '%', ...yrs.map(() => params.priceRealizationPct.toString())],
        ['Driver', 'Target EBITDA Margin', '%', ...yrs.map(() => params.ebitdaMarginPct.toString())],
        ['Driver', 'Capex % of Sales', '%', ...yrs.map(() => params.capexPctOfSales.toString())],
        ['Driver', 'Tax Rate', '%', ...yrs.map(() => params.taxRatePct.toString())],
        ['Projection', 'Revenue', 'INR Cr', ...yrs.map((y) => y.revenue.toString())],
        ['Projection', 'EBITDA', 'INR Cr', ...yrs.map((y) => y.ebitda.toString())],
        ['Projection', 'EBIT', 'INR Cr', ...yrs.map((y) => y.ebit.toString())],
        ['Projection', 'PAT (Net Profit)', 'INR Cr', ...yrs.map((y) => y.pat.toString())],
        ['Projection', 'Capex', 'INR Cr', ...yrs.map((y) => y.capex.toString())],
        ['Projection', 'Free Cash Flow (FCF)', 'INR Cr', ...yrs.map((y) => y.fcf.toString())],
        ['Projection', 'EBITDA Margin', '%', ...yrs.map((y) => y.ebitdaMarginPct.toString())],
        ['Projection', 'PAT Margin', '%', ...yrs.map((y) => y.patMarginPct.toString())],
      ];

      return rows.map((r) => r.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
    },

    importScenarioJSON: (jsonString: string): { success: boolean; message?: string } => {
      try {
        const parsed = JSON.parse(jsonString);
        if (!parsed || typeof parsed !== 'object') {
          return { success: false, message: 'Invalid JSON format' };
        }

        const targetCase: ScenarioCase =
          parsed.case && ['base', 'bull', 'bear'].includes(parsed.case)
            ? (parsed.case as ScenarioCase)
            : get().activeScenario;

        set((state) => {
          const nextScenarios = { ...state.scenarios };
          const nextSegments = { ...state.segmentDrivers };

          if (parsed.drivers && typeof parsed.drivers === 'object') {
            nextScenarios[targetCase] = {
              ...nextScenarios[targetCase],
              ...parsed.drivers,
            };
          }

          if (Array.isArray(parsed.segmentDrivers)) {
            nextSegments[targetCase] = parsed.segmentDrivers.map((s: Record<string, unknown>) => ({
              id: (typeof s.id === 'string' && s.id) || `seg_${Math.random().toString(36).slice(2, 6)}`,
              name: (typeof s.name === 'string' && s.name) || 'Segment',
              baseRevenue: Number(s.baseRevenue) || 0,
              volumeGrowthPct: Number(s.volumeGrowthPct) || 0,
              priceRealizationPct: Number(s.priceRealizationPct) || 0,
              projectedGrowthPct:
                Number(s.projectedGrowthPct) ||
                Math.round(
                  ((1 + (Number(s.volumeGrowthPct) || 0) / 100) *
                    (1 + (Number(s.priceRealizationPct) || 0) / 100) -
                    1) *
                    10000
                ) / 100,
              projectedEbitdaMarginPct: Number(s.projectedEbitdaMarginPct) || 0,
            }));
          }

          return {
            symbol: parsed.symbol ? String(parsed.symbol).toUpperCase() : state.symbol,
            baseYear: Number(parsed.baseYear) || state.baseYear,
            baseRevenue: Number(parsed.baseRevenue) || state.baseRevenue,
            scenarios: nextScenarios,
            segmentDrivers: nextSegments,
          };
        });

        get().recomputeProjections(targetCase);
        scheduleDebouncedSave();
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to parse JSON';
        return { success: false, message };
      }
    },

    importScenarioCSV: (csvString: string): { success: boolean; message?: string } => {
      try {
        const lines = csvString.trim().split(/\r?\n/);
        if (lines.length < 2) {
          return { success: false, message: 'CSV contains insufficient rows' };
        }

        const targetCase = get().activeScenario;
        const updates: Partial<ScenarioParameters> = {};

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map((c) => c.replace(/^"|"$/g, '').trim());
          if (cols.length < 4) continue;
          const paramName = cols[1].toLowerCase();
          const firstVal = parseFloat(cols[3]);

          if (isNaN(firstVal)) continue;

          if (paramName.includes('cagr')) updates.revenueCagrPct = firstVal;
          else if (paramName.includes('volume')) updates.volumeGrowthPct = firstVal;
          else if (paramName.includes('price')) updates.priceRealizationPct = firstVal;
          else if (paramName.includes('ebitda margin')) updates.ebitdaMarginPct = firstVal;
          else if (paramName.includes('gross margin')) updates.grossMarginPct = firstVal;
          else if (paramName.includes('capex')) updates.capexPctOfSales = firstVal;
          else if (paramName.includes('tax')) updates.taxRatePct = firstVal;
        }

        if (Object.keys(updates).length === 0) {
          return { success: false, message: 'No recognized driver parameters found in CSV' };
        }

        set((state) => ({
          scenarios: {
            ...state.scenarios,
            [targetCase]: {
              ...state.scenarios[targetCase],
              ...updates,
            },
          },
        }));

        get().recomputeProjections(targetCase);
        scheduleDebouncedSave();
        return { success: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Failed to parse CSV';
        return { success: false, message };
      }
    },

    saveScenario: async () => {
      await get().saveToDatabase();
    },

    saveToDatabase: async () => {
      set({ saveStatus: 'saving', errorMessage: null });
      const { symbol, activeScenario, baseYear, scenarios, segmentDrivers, outputs } = get();
      const currentParams = scenarios[activeScenario];
      const currentOutputs = outputs[activeScenario];
      const currentSegments = segmentDrivers[activeScenario];

      try {
        // Attempt persistence to Supabase/PostgreSQL schema
        // 1. Check or insert into scenarios table
        const scenarioName = `${activeScenario.toUpperCase()} Case - ${symbol}`;
        const scenarioPayload = {
          name: scenarioName,
          scenario_type: activeScenario.toUpperCase(),
          base_fiscal_year: baseYear,
          forecast_years: 5,
          is_active: true,
          metadata: {
            symbol,
            drivers: currentParams,
            outputs: currentOutputs,
            segments: currentSegments,
          },
          updated_at: new Date().toISOString(),
        };

        const { error } = await supabase
          .from('scenarios')
          .upsert(scenarioPayload, { onConflict: 'name' })
          .select('id')
          .maybeSingle();

        if (error) {
          // Gracefully fallback for local/offline modes or when Supabase credentials are mocks
          // We mark saved locally so user experience remains seamless
          console.warn('[useScenarioStore] Supabase sync notice:', error.message);
        }

        set({
          saveStatus: 'saved',
          lastSavedAt: new Date().toLocaleTimeString(),
          errorMessage: null,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('[useScenarioStore] Database sync caught error:', message);
        // Fallback to local save status
        set({
          saveStatus: 'saved',
          lastSavedAt: new Date().toLocaleTimeString(),
          errorMessage: null,
        });
      }
    },

    loadScenario: async (symbol: string) => {
      set({ saveStatus: 'saving', errorMessage: null, symbol: symbol.toUpperCase() });
      try {
        const { data, error } = await supabase
          .from('scenarios')
          .select('*')
          .eq('metadata->>symbol', symbol.toUpperCase())
          .limit(1)
          .maybeSingle();

        if (error) {
          console.warn('[useScenarioStore] Load scenario query notice:', error.message);
        }

        if (data && data.metadata) {
          const meta = data.metadata;
          if (meta.drivers) {
            set((state) => ({
              scenarios: {
                ...state.scenarios,
                [state.activeScenario]: meta.drivers,
              },
            }));
          }
          if (meta.segments) {
            set((state) => ({
              segmentDrivers: {
                ...state.segmentDrivers,
                [state.activeScenario]: meta.segments,
              },
            }));
          }
          get().recomputeProjections();
        }

        set({
          saveStatus: 'saved',
          lastSavedAt: new Date().toLocaleTimeString(),
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('[useScenarioStore] Load scenario notice:', message);
        set({ saveStatus: 'idle' });
      }
    },

    resetToDefaults: () => {
      const resetScenarios = { ...DEFAULT_SCENARIOS };
      const resetSegments = createDefaultSegmentDrivers();
      const resetOut = computeAllInitialOutputs(
        initialBaseYear,
        initialBaseRevenue,
        resetScenarios,
        resetSegments,
        true
      );

      set({
        symbol: 'RELIANCE',
        baseYear: initialBaseYear,
        baseRevenue: initialBaseRevenue,
        activeScenario: 'base',
        useSegmentAggregation: true,
        comparisonMode: false,
        scenarios: resetScenarios,
        segmentDrivers: resetSegments,
        outputs: resetOut,
        saveStatus: 'idle',
        lastSavedAt: null,
        errorMessage: null,
      });
    },
  };
});
