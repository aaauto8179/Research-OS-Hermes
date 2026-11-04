'use client';

import React from 'react';
import {
  useScenarioStore,
  ScenarioParameters,
} from '@/lib/scenario-store';
import {
  TrendingUp,
  Percent,
  Sliders,
  DollarSign,
  Briefcase,
  Shield,
  Hammer,
} from 'lucide-react';

interface DriverConfig {
  key: keyof ScenarioParameters;
  label: string;
  category: 'growth' | 'profitability' | 'capital';
  min: number;
  max: number;
  step: number;
  unit: string;
  description: string;
  icon: React.ReactNode;
}

const DRIVER_CONFIGS: DriverConfig[] = [
  {
    key: 'revenueCagrPct',
    label: 'Revenue CAGR',
    category: 'growth',
    min: -10,
    max: 40,
    step: 0.5,
    unit: '%',
    description: 'Annual consolidated topline compound growth rate',
    icon: <TrendingUp className="w-4 h-4 text-blue-500" />,
  },
  {
    key: 'volumeGrowthPct',
    label: 'Volume Growth',
    category: 'growth',
    min: -15,
    max: 30,
    step: 0.5,
    unit: '%',
    description: 'Volume / units shipped annual expansion rate',
    icon: <TrendingUp className="w-4 h-4 text-cyan-500" />,
  },
  {
    key: 'priceRealizationPct',
    label: 'Price Realization',
    category: 'growth',
    min: -10,
    max: 20,
    step: 0.25,
    unit: '%',
    description: 'Blended price realization / tariff hike annual expansion',
    icon: <DollarSign className="w-4 h-4 text-emerald-500" />,
  },
  {
    key: 'grossMarginPct',
    label: 'Gross Margin',
    category: 'profitability',
    min: 15,
    max: 75,
    step: 0.5,
    unit: '%',
    description: 'Gross profit percentage after direct raw materials/COGS',
    icon: <Percent className="w-4 h-4 text-amber-500" />,
  },
  {
    key: 'ebitdaMarginPct',
    label: 'Target EBITDA Margin',
    category: 'profitability',
    min: 5,
    max: 50,
    step: 0.25,
    unit: '%',
    description: 'Operating profit margin before depreciation & interest',
    icon: <Percent className="w-4 h-4 text-emerald-500" />,
  },
  {
    key: 'depreciationPct',
    label: 'Depreciation % Sales',
    category: 'profitability',
    min: 1,
    max: 15,
    step: 0.1,
    unit: '%',
    description: 'Annual non-cash D&A amortized as percentage of sales',
    icon: <Percent className="w-4 h-4 text-slate-400" />,
  },
  {
    key: 'taxRatePct',
    label: 'Effective Tax Rate',
    category: 'profitability',
    min: 10,
    max: 40,
    step: 0.5,
    unit: '%',
    description: 'Standard Ind AS statutory & effective corporate tax rate',
    icon: <Shield className="w-4 h-4 text-purple-500" />,
  },
  {
    key: 'capexPctOfSales',
    label: 'Capex % of Sales',
    category: 'capital',
    min: 2,
    max: 30,
    step: 0.5,
    unit: '%',
    description: 'Capital reinvestment in PPE, 5G rollouts, retail store expansion',
    icon: <Hammer className="w-4 h-4 text-orange-500" />,
  },
  {
    key: 'nwcChangePct',
    label: 'ΔNWC % of Sales',
    category: 'capital',
    min: -5,
    max: 10,
    step: 0.25,
    unit: '%',
    description: 'Incremental working capital investment absorbed per ₹100 revenue',
    icon: <Briefcase className="w-4 h-4 text-indigo-500" />,
  },
  {
    key: 'waccPct',
    label: 'Discount Rate (WACC)',
    category: 'capital',
    min: 7,
    max: 20,
    step: 0.25,
    unit: '%',
    description: 'Weighted average cost of capital used for DCF enterprise valuation',
    icon: <Percent className="w-4 h-4 text-pink-500" />,
  },
  {
    key: 'terminalGrowthRatePct',
    label: 'Terminal Growth Rate',
    category: 'growth',
    min: 1,
    max: 7,
    step: 0.25,
    unit: '%',
    description: 'Perpetual long-term growth rate beyond FY29E in India',
    icon: <TrendingUp className="w-4 h-4 text-teal-500" />,
  },
];

export const DriverInputs: React.FC = () => {
  const {
    activeScenario,
    scenarios,
    setDriver,
  } = useScenarioStore();

  const currentParams = scenarios[activeScenario];
  const baseParams = scenarios.base;

  const handleInputChange = (key: keyof ScenarioParameters, valStr: string) => {
    const val = parseFloat(valStr);
    if (!isNaN(val)) {
      setDriver(activeScenario, key, val);
    }
  };

  const handleStep = (key: keyof ScenarioParameters, delta: number) => {
    const current = currentParams[key] as number;
    const nextVal = Math.round((current + delta) * 100) / 100;
    setDriver(activeScenario, key, nextVal);
  };

  // Group drivers by category
  const categories: { id: DriverConfig['category']; title: string; desc: string }[] = [
    { id: 'growth', title: 'Topline Growth Drivers', desc: 'Volume expansion, pricing realization & long-term trajectory' },
    { id: 'profitability', title: 'Margin & Tax Assumptions', desc: 'Operating leverage, gross/EBITDA margins, and taxation' },
    { id: 'capital', title: 'Capital Intensity & Discounting', desc: 'Reinvestment capex, working capital absorption & WACC' },
  ];

  return (
    <div className="space-y-6">
      {categories.map((cat) => {
        const drivers = DRIVER_CONFIGS.filter((d) => d.category === cat.id);

        return (
          <div key={cat.id} className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-border/60 pb-2">
              <h3 className="text-sm font-semibold text-foreground flex items-center space-x-2">
                <Sliders className="w-4 h-4 text-primary" />
                <span>{cat.title}</span>
              </h3>
              <p className="text-xs text-muted-foreground">{cat.desc}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {drivers.map((driver) => {
                const value = (currentParams[driver.key] as number) ?? 0;
                const baseValue = (baseParams[driver.key] as number) ?? 0;
                const diffFromBase = Math.round((value - baseValue) * 100) / 100;

                return (
                  <div
                    key={driver.key}
                    className="p-3.5 rounded-lg border border-border/60 bg-secondary/20 hover:bg-secondary/40 transition-colors space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {driver.icon}
                        <label className="text-xs font-semibold text-foreground cursor-pointer" title={driver.description}>
                          {driver.label}
                        </label>
                      </div>

                      {/* Delta from Base Case indicator */}
                      {activeScenario !== 'base' && diffFromBase !== 0 && (
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold ${
                            diffFromBase > 0
                              ? 'bg-emerald-500/10 text-emerald-500'
                              : 'bg-rose-500/10 text-rose-500'
                          }`}
                        >
                          {diffFromBase > 0 ? `+${diffFromBase}` : diffFromBase}% vs Base
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      {/* Slider Input */}
                      <input
                        type="range"
                        min={driver.min}
                        max={driver.max}
                        step={driver.step}
                        value={value}
                        onChange={(e) => handleInputChange(driver.key, e.target.value)}
                        className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary"
                      />

                      {/* Direct Numeric Input with Steppers */}
                      <div className="flex items-center space-x-1 shrink-0">
                        <input
                          type="number"
                          min={driver.min}
                          max={driver.max}
                          step={driver.step}
                          value={value}
                          onChange={(e) => handleInputChange(driver.key, e.target.value)}
                          className="w-16 px-2 py-1 text-xs font-mono font-semibold text-right bg-background border border-border rounded focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                        <span className="text-xs text-muted-foreground font-mono">{driver.unit}</span>
                      </div>
                    </div>

                    {/* Step buttons and description */}
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground pt-0.5">
                      <span className="truncate pr-1 text-[10px]" title={driver.description}>
                        {driver.description}
                      </span>
                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStep(driver.key, -driver.step)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-secondary hover:bg-secondary/80 text-foreground font-bold border border-border"
                          title={`Decrease by ${driver.step}`}
                        >
                          -
                        </button>
                        <button
                          type="button"
                          onClick={() => handleStep(driver.key, driver.step)}
                          className="w-5 h-5 flex items-center justify-center rounded bg-secondary hover:bg-secondary/80 text-foreground font-bold border border-border"
                          title={`Increase by ${driver.step}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
