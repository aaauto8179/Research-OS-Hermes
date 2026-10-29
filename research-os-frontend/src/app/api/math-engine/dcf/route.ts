import { NextRequest, NextResponse } from 'next/server';
import { DCFInputs, DCFOutputs } from '@/lib/types';

// Simple in-memory cache for demo
const calculationCache = new Map<string, DCFOutputs>();

function hashInputs(inputs: DCFInputs): string {
  const str = JSON.stringify(inputs);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

function calculateDCF(inputs: DCFInputs): DCFOutputs {
  // WACC Calculation
  const costOfEquity = inputs.risk_free_rate + inputs.beta * inputs.equity_risk_premium;
  const wacc = (1 - inputs.debt_to_value) * costOfEquity + 
               inputs.debt_to_value * inputs.cost_of_debt * (1 - inputs.tax_rate);

  // Year-by-year projections
  const years = Array.from({ length: inputs.forecast_years }, (_, i) => i + 1);
  const revenueProj: number[] = [];
  const ebitProj: number[] = [];
  const nopatProj: number[] = [];
  const depreciationProj: number[] = [];
  const capexProj: number[] = [];
  const changeNwcProj: number[] = [];
  const fcffProj: number[] = [];

  let currentRevenue = inputs.revenue;
  let currentEbit = inputs.ebit;
  let currentDepr = inputs.depreciation;
  let currentCapex = inputs.capex;
  let currentNwc = inputs.change_nwc;

  for (let i = 0; i < inputs.forecast_years; i++) {
    const growth = inputs.revenue_growth_years[i];
    currentRevenue *= (1 + growth);
    revenueProj.push(currentRevenue);

    currentEbit = currentRevenue * inputs.ebit_margin;
    ebitProj.push(currentEbit);

    const nopat = currentEbit * (1 - inputs.tax_rate);
    nopatProj.push(nopat);

    currentDepr = currentRevenue * (inputs.depreciation / inputs.revenue);
    depreciationProj.push(currentDepr);

    currentCapex = currentRevenue * inputs.capex_pct_revenue;
    capexProj.push(currentCapex);

    const prevRevenue = i === 0 ? inputs.revenue : revenueProj[i - 1];
    const revenueChange = currentRevenue - prevRevenue;
    currentNwc = revenueChange * inputs.nwc_pct_revenue;
    changeNwcProj.push(currentNwc);

    const fcff = nopat + currentDepr - currentCapex - currentNwc;
    fcffProj.push(fcff);
  }

  // Discount factors
  const discountFactors = years.map(year => Math.pow(1 + wacc, -year));
  const pvFcff = fcffProj.map((fcff, i) => fcff * discountFactors[i]);

  // Terminal Value - Gordon Growth
  const fcffTerminal = fcffProj[fcffProj.length - 1] * (1 + inputs.terminal_growth_rate);
  const terminalValueGordon = fcffTerminal / (wacc - inputs.terminal_growth_rate);
  const pvTerminalGordon = terminalValueGordon * discountFactors[discountFactors.length - 1];

  // Terminal Value - Exit Multiple
  const ebitdaTerminal = ebitProj[ebitProj.length - 1] + depreciationProj[depreciationProj.length - 1];
  const terminalValueMultiple = ebitdaTerminal * inputs.exit_multiple;
  const pvTerminalMultiple = terminalValueMultiple * discountFactors[discountFactors.length - 1];

  // Enterprise Value
  const evGordon = pvFcff.reduce((a, b) => a + b, 0) + pvTerminalGordon;
  const evMultiple = pvFcff.reduce((a, b) => a + b, 0) + pvTerminalMultiple;

  // Equity Value
  const equityValueGordon = evGordon - inputs.total_debt + inputs.cash - inputs.minority_interest;
  const equityValueMultiple = evMultiple - inputs.total_debt + inputs.cash - inputs.minority_interest;

  // Fair Value Per Share
  const fairValueGordon = equityValueGordon / inputs.diluted_shares;
  const fairValueMultiple = equityValueMultiple / inputs.diluted_shares;

  // Sensitivity Analysis
  const waccRange = Array.from({ length: 7 }, (_, i) => wacc - 0.015 + i * 0.005);
  const growthRange = Array.from({ length: 7 }, (_, i) => inputs.terminal_growth_rate - 0.005 + i * 0.00167);

  const sensitivityMatrixGordon: number[][] = [];
  const sensitivityMatrixMultiple: number[][] = [];

  for (const g of growthRange) {
    const rowGordon: number[] = [];
    const rowMultiple: number[] = [];
    for (const w of waccRange) {
      const tvG = fcffProj[fcffProj.length - 1] * (1 + g) / (w - g);
      const pvTvG = tvG * Math.pow(1 + w, -inputs.forecast_years);
      const evG = pvFcff.reduce((sum, fcff, idx) => sum + fcff * Math.pow(1 + w, -(idx + 1)), 0) + pvTvG;
      const eqG = evG - inputs.total_debt + inputs.cash - inputs.minority_interest;
      rowGordon.push(eqG / inputs.diluted_shares);

      const tvM = ebitdaTerminal * inputs.exit_multiple;
      const pvTvM = tvM * Math.pow(1 + w, -inputs.forecast_years);
      const evM = pvFcff.reduce((sum, fcff, idx) => sum + fcff * Math.pow(1 + w, -(idx + 1)), 0) + pvTvM;
      const eqM = evM - inputs.total_debt + inputs.cash - inputs.minority_interest;
      rowMultiple.push(eqM / inputs.diluted_shares);
    }
    sensitivityMatrixGordon.push(rowGordon);
    sensitivityMatrixMultiple.push(rowMultiple);
  }

  return {
    years,
    revenue_proj: revenueProj,
    ebit_proj: ebitProj,
    nopat_proj: nopatProj,
    depreciation_proj: depreciationProj,
    capex_proj: capexProj,
    change_nwc_proj: changeNwcProj,
    fcff_proj: fcffProj,
    wacc,
    cost_of_equity: costOfEquity,
    discount_factors: discountFactors,
    pv_fcff: pvFcff,
    terminal_value_gordon: terminalValueGordon,
    terminal_value_multiple: terminalValueMultiple,
    pv_terminal_gordon: pvTerminalGordon,
    pv_terminal_multiple: pvTerminalMultiple,
    ev_gordon: evGordon,
    ev_multiple: evMultiple,
    equity_value_gordon: equityValueGordon,
    equity_value_multiple: equityValueMultiple,
    fair_value_per_share_gordon: fairValueGordon,
    fair_value_per_share_multiple: fairValueMultiple,
    sensitivity_wacc: waccRange,
    sensitivity_growth: growthRange,
    sensitivity_matrix_gordon: sensitivityMatrixGordon,
    sensitivity_matrix_multiple: sensitivityMatrixMultiple,
    inputs_hash: hashInputs(inputs),
    calculation_timestamp: new Date().toISOString(),
  };
}

export async function POST(request: NextRequest) {
  try {
    const inputs: DCFInputs = await request.json();
    
    // Validate
    const errors: string[] = [];
    if (inputs.diluted_shares <= 0) errors.push('diluted_shares must be > 0');
    if (inputs.tax_rate < 0 || inputs.tax_rate > 1) errors.push('tax_rate must be between 0 and 1');
    if (inputs.forecast_years < 1) errors.push('forecast_years must be >= 1');
    if (inputs.revenue_growth_years.length !== inputs.forecast_years) {
      errors.push(`revenue_growth_years length must equal forecast_years`);
    }
    if (inputs.terminal_growth_rate >= inputs.risk_free_rate + inputs.equity_risk_premium) {
      errors.push('terminal_growth_rate must be < risk_free_rate + equity_risk_premium');
    }
    
    if (errors.length > 0) {
      return NextResponse.json({ error: errors.join('; ') }, { status: 400 });
    }

    // Check cache
    const cacheKey = hashInputs(inputs);
    if (calculationCache.has(cacheKey)) {
      return NextResponse.json(calculationCache.get(cacheKey));
    }

    const outputs = calculateDCF(inputs);
    calculationCache.set(cacheKey, outputs);
    
    return NextResponse.json(outputs);
  } catch (error) {
    console.error('DCF calculation error:', error);
    return NextResponse.json({ error: 'Calculation failed' }, { status: 500 });
  }
}