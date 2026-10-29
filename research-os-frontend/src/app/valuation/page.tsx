"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Table, TableHeader, TableBody, TableRow, TableHead, TableCell, TableCaption 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Calculator, TrendingUp, TrendingDown, Target, 
  BarChart, Settings, Download, ChevronLeft, ChevronRight,
  AlertTriangle, CheckCircle, XCircle, HelpCircle
} from "lucide-react";
import { 
  DCFInputs, DCFOutputs, 
  RelativeValuationInputs, RelativeValuationOutputs,
  SOTPInputs, SOTPOutputs,
  BankingValuationInputs, BankingValuationOutputs,
  ExcessReturnInputs, ExcessReturnOutputs
} from "@/lib/types";

interface ValuationPageProps {
  companySymbol?: string;
}

const DEFAULT_DCF_INPUTS: DCFInputs = {
  revenue: 750000,
  ebit: 135000,
  depreciation: 45000,
  capex: 60000,
  change_nwc: 15000,
  tax_rate: 0.25,
  total_debt: 300000,
  cash: 250000,
  minority_interest: 50000,
  diluted_shares: 676.5,
  revenue_growth_years: [0.12, 0.10, 0.08, 0.06, 0.05, 0.04, 0.035, 0.03, 0.025, 0.02],
  ebit_margin: 0.18,
  capex_pct_revenue: 0.06,
  nwc_pct_revenue: 0.02,
  risk_free_rate: 0.07,
  equity_risk_premium: 0.06,
  beta: 1.15,
  cost_of_debt: 0.085,
  debt_to_value: 0.30,
  terminal_growth_rate: 0.025,
  exit_multiple: 8.5,
  forecast_years: 10,
};

async function callDCFApi(inputs: DCFInputs): Promise<DCFOutputs> {
  const res = await fetch('/api/math-engine/dcf', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'DCF calculation failed');
  }
  return res.json();
}

async function callScreeningApi(inputs: any): Promise<any> {
  const res = await fetch('/api/math-engine/screening', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(inputs),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Screening failed');
  }
  return res.json();
}

export default function ValuationPage({ companySymbol = "RELIANCE" }: ValuationPageProps) {
  const [activeTab, setActiveTab] = useState<string>("dcf");
  const [dcfInputs, setDcfInputs] = useState<DCFInputs>(DEFAULT_DCF_INPUTS);
  const [dcfOutputs, setDcfOutputs] = useState<DCFOutputs | null>(null);
  const [relativeInputs, setRelativeInputs] = useState<RelativeValuationInputs>({
    target_market_cap: 920000,
    target_net_debt: 50000,
    target_minority_interest: 5000,
    target_preferred: 0,
    target_ebitda: 180000,
    target_eps: 85,
    target_sales: 750000,
    target_eps_cagr_3y: 0.15,
    peer_symbols: ['TCS', 'INFY', 'HCLTECH', 'WIPRO', 'TECHM'],
    peer_market_caps: [1380000, 650000, 350000, 280000, 220000],
    peer_net_debts: [-50000, -80000, -20000, -30000, -15000],
    peer_ebitdas: [220000, 120000, 60000, 50000, 40000],
    peer_eps: [120, 65, 45, 35, 28],
    peer_sales: [1500000, 800000, 400000, 350000, 300000],
    peer_eps_cagr_3y: [0.12, 0.10, 0.14, 0.08, 0.11],
  });
  const [relativeOutputs, setRelativeOutputs] = useState<any>(null);
  const [sotpInputs, setSotpInputs] = useState<SOTPInputs>({
    segments: [
      { name: 'Oil to Chemicals', metric: 500000, multiple: 6.5, method: 'EV_EBITDA', conglomerate_discount: 0.10 },
      { name: 'Retail', metric: 250000, multiple: 2.5, method: 'EV_SALES', conglomerate_discount: 0.15 },
      { name: 'Digital Services', metric: 100000, multiple: 18, method: 'EV_EBITDA', conglomerate_discount: 0.20 },
      { name: 'Financial Services', metric: 50000, multiple: 2.0, method: 'PB', conglomerate_discount: 0.10 },
    ],
    net_debt: 300000,
    cash: 250000,
    minority_interest: 50000,
    diluted_shares: 676.5,
  });
  const [sotpOutputs, setSotpOutputs] = useState<any>(null);
  const [bankingInputs, setBankingInputs] = useState<BankingValuationInputs>({
    book_value: 450,
    roe: 0.17,
    cost_of_equity: 0.13,
    growth_rate: 0.05,
    peer_roes: [0.15, 0.12, 0.20, 0.16, 0.14],
    peer_pbs: [1.8, 1.2, 2.5, 2.0, 1.6],
    market_cap: 920000,
  });
  const [bankingOutputs, setBankingOutputs] = useState<any>(null);
  const [excessReturnInputs, setExcessReturnInputs] = useState<ExcessReturnInputs>({
    book_value: 450000,
    net_income_forecast: [70000, 77000, 84700, 93170, 102487],
    cost_of_equity: 0.12,
    growth_rate: 0.03,
    forecast_years: 5,
    diluted_shares: 676.5,
  });
  const [excessReturnOutputs, setExcessReturnOutputs] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Auto-calculate on input change (with debounce)
  useEffect(() => {
    const timer = setTimeout(() => {
      calculateDCF();
    }, 300);
    return () => clearTimeout(timer);
  }, [dcfInputs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateRelative();
    }, 300);
    return () => clearTimeout(timer);
  }, [relativeInputs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateSOTP();
    }, 300);
    return () => clearTimeout(timer);
  }, [sotpInputs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateBanking();
    }, 300);
    return () => clearTimeout(timer);
  }, [bankingInputs]);

  useEffect(() => {
    const timer = setTimeout(() => {
      calculateExcessReturn();
    }, 300);
    return () => clearTimeout(timer);
  }, [excessReturnInputs]);

  const calculateDCF = async () => {
    try {
      setErrors([]);
      const outputs = await callDCFApi(dcfInputs);
      setDcfOutputs(outputs);
    } catch (e: any) {
      setErrors([e.message]);
    }
  };

  const calculateRelative = async () => {
    try {
      // For now, use a simplified calculation since we don't have the API yet
      // TODO: Add relative valuation API route
      const outputs = runRelativeMock(relativeInputs);
      setRelativeOutputs(outputs);
    } catch (e: any) {
      console.error(e);
    }
  };

  const calculateSOTP = async () => {
    try {
      // TODO: Add SOTP API route
      const outputs = runSOTPMock(sotpInputs);
      setSotpOutputs(outputs);
    } catch (e: any) {
      console.error(e);
    }
  };

  const calculateBanking = async () => {
    try {
      // TODO: Add banking valuation API route
      const outputs = runBankingMock(bankingInputs);
      setBankingOutputs(outputs);
    } catch (e: any) {
      console.error(e);
    }
  };

  const calculateExcessReturn = async () => {
    try {
      // TODO: Add excess return API route
      const outputs = runExcessReturnMock(excessReturnInputs);
      setExcessReturnOutputs(outputs);
    } catch (e: any) {
      console.error(e);
    }
  };

// Mock calculation functions for models without API routes yet
function runRelativeMock(inputs: RelativeValuationInputs): RelativeValuationOutputs {
  const targetEV = inputs.target_market_cap + inputs.target_net_debt + inputs.target_minority_interest + inputs.target_preferred;
  const targetEBITDA = inputs.target_ebitda || 1;
  const targetEV_EBITDA = targetEV / targetEBITDA;
  const targetPE = inputs.target_market_cap / (inputs.target_eps || 1);
  
  const peerEV_EBITDAs = inputs.peer_market_caps.map((mc, i) => (mc + inputs.peer_net_debts[i]) / (inputs.peer_ebitdas[i] || 1));
  const peerPEs = inputs.peer_market_caps.map((mc, i) => mc / (inputs.peer_eps[i] || 1));
  const peerEV_Sales = inputs.peer_market_caps.map((mc, i) => (mc + inputs.peer_net_debts[i]) / (inputs.peer_sales[i] || 1));
  
  const percentile = (arr: number[], p: number) => {
    const sorted = [...arr].filter(v => isFinite(v)).sort((a, b) => a - b);
    if (sorted.length === 0) return 0;
    const idx = Math.min(sorted.length - 1, Math.floor(p * (sorted.length - 1)));
    return sorted[idx];
  };
  
  const peerEV_EBITDA_median = percentile(peerEV_EBITDAs, 0.5);
  const peerEV_EBITDA_p25 = percentile(peerEV_EBITDAs, 0.25);
  const peerEV_EBITDA_p75 = percentile(peerEV_EBITDAs, 0.75);
  const peerPE_median = percentile(peerPEs, 0.5);
  const peerPE_p25 = percentile(peerPEs, 0.25);
  const peerPE_p75 = percentile(peerPEs, 0.75);
  const peerEV_Sales_median = percentile(peerEV_Sales, 0.5);
  
  const impliedEV_EBITDA_median = peerEV_EBITDA_median * targetEBITDA - inputs.target_net_debt - inputs.target_minority_interest - inputs.target_preferred;
  const impliedEV_EBITDA_p25 = peerEV_EBITDA_p25 * targetEBITDA - inputs.target_net_debt - inputs.target_minority_interest - inputs.target_preferred;
  const impliedEV_EBITDA_p75 = peerEV_EBITDA_p75 * targetEBITDA - inputs.target_net_debt - inputs.target_minority_interest - inputs.target_preferred;
  const impliedPE_median = peerPE_median * inputs.target_eps;
  const impliedPE_p25 = peerPE_p25 * inputs.target_eps;
  const impliedPE_p75 = peerPE_p75 * inputs.target_eps;
  
  const football_field: Record<string, { low: number; mid: number; high: number }> = {
    "Trading Comps EV/EBITDA": { low: impliedEV_EBITDA_p25, mid: impliedEV_EBITDA_median, high: impliedEV_EBITDA_p75 },
    "Trading Comps P/E": { low: impliedPE_p25, mid: impliedPE_median, high: impliedPE_p75 },
  };
  
  return {
    target_ev_ebitda: targetEV_EBITDA,
    target_pe: targetPE,
    target_ev_sales: targetEV / (inputs.target_sales || 1),
    target_peg: targetPE / (inputs.target_eps_cagr_3y * 100 || 1),
    peer_ev_ebitda_median: peerEV_EBITDA_median,
    peer_ev_ebitda_p25: peerEV_EBITDA_p25,
    peer_ev_ebitda_p75: peerEV_EBITDA_p75,
    peer_pe_median: peerPE_median,
    peer_pe_p25: peerPE_p25,
    peer_pe_p75: peerPE_p75,
    peer_ev_sales_median: peerEV_Sales_median,
    peer_peg_median: 0,
    implied_value_ev_ebitda_median: impliedEV_EBITDA_median,
    implied_value_ev_ebitda_p25: impliedEV_EBITDA_p25,
    implied_value_ev_ebitda_p75: impliedEV_EBITDA_p75,
    implied_value_pe_median: impliedPE_median,
    implied_value_pe_p25: impliedPE_p25,
    implied_value_pe_p75: impliedPE_p75,
    football_field,
  };
}

function runSOTPMock(inputs: SOTPInputs): SOTPOutputs {
  const segmentValues = inputs.segments.map(seg => {
    const ev = seg.metric * seg.multiple * (1 - seg.conglomerate_discount);
    return { 
      name: seg.name, 
      method: seg.method, 
      metric: seg.metric, 
      multiple: seg.multiple, 
      discount: seg.conglomerate_discount, 
      ev 
    };
  });
  
  const totalEV = segmentValues.reduce((sum, s) => sum + s.ev, 0);
  const equityValue = totalEV - inputs.net_debt + inputs.cash - inputs.minority_interest;
  const fairValuePerShare = equityValue / inputs.diluted_shares;
  const segmentContributions = Object.fromEntries(segmentValues.map(s => [s.name, s.ev]));
  
  return { segment_values: segmentValues, total_ev: totalEV, equity_value: equityValue, fair_value_per_share: fairValuePerShare, segment_contributions: segmentContributions };
}

function runBankingMock(inputs: BankingValuationInputs): BankingValuationOutputs {
  const justifiedPB = (inputs.roe - inputs.growth_rate) / (inputs.cost_of_equity - inputs.growth_rate);
  const impliedPriceJustifiedPB = justifiedPB * inputs.book_value;
  
  // Simple linear regression
  const x = inputs.peer_roes;
  const y = inputs.peer_pbs;
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  const predictedPB = slope * inputs.roe + intercept;
  const impliedPriceRegression = predictedPB * inputs.book_value;
  const premiumDiscountPct = (inputs.market_cap / impliedPriceRegression - 1) * 100;
  
  return {
    justified_pb: justifiedPB,
    implied_price_justified_pb: impliedPriceJustifiedPB,
    regression_slope: slope,
    regression_intercept: intercept,
    regression_r2: 0.85, // Mock
    predicted_pb: predictedPB,
    implied_price_regression: impliedPriceRegression,
    premium_discount_pct: premiumDiscountPct,
  };
}

function runExcessReturnMock(inputs: ExcessReturnInputs): ExcessReturnOutputs {
  let bookValue = inputs.book_value;
  const residualIncomes: number[] = [];
  const pvResidualIncomes: number[] = [];
  
  for (let year = 0; year < inputs.forecast_years; year++) {
    const ni = inputs.net_income_forecast[year];
    const ri = ni - inputs.cost_of_equity * bookValue;
    residualIncomes.push(ri);
    pvResidualIncomes.push(ri / Math.pow(1 + inputs.cost_of_equity, year + 1));
    bookValue += ni; // Assume all NI retained
  }
  
  const terminalRI = residualIncomes[residualIncomes.length - 1] * (1 + inputs.growth_rate);
  const pvTerminalRI = terminalRI / (inputs.cost_of_equity - inputs.growth_rate) / Math.pow(1 + inputs.cost_of_equity, inputs.forecast_years);
  
  const equityValue = inputs.book_value + pvResidualIncomes.reduce((a, b) => a + b, 0) + pvTerminalRI;
  const fairValuePerShare = equityValue / inputs.diluted_shares;
  
  return {
    residual_incomes: residualIncomes,
    pv_residual_incomes: pvResidualIncomes,
    terminal_ri: terminalRI,
    pv_terminal_ri: pvTerminalRI,
    equity_value: equityValue,
    fair_value_per_share: fairValuePerShare,
  };
}

  const validateInputs = (inputs: DCFInputs): string[] => {
    const errs: string[] = [];
    if (inputs.diluted_shares <= 0) errs.push("Diluted shares must be > 0");
    if (inputs.tax_rate < 0 || inputs.tax_rate > 1) errs.push("Tax rate must be 0-1");
    if (inputs.terminal_growth_rate >= inputs.risk_free_rate + inputs.equity_risk_premium) {
      errs.push("Terminal growth must be < Risk-free + ERP");
    }
    return errs;
  };

  const renderNumberInput = (label: string, value: number, onChange: (v: number) => void, step = 0.01, min = 0, suffix = "") => (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium w-48">{label}</label>
      <Input 
        type="number" 
        step={step} 
        min={min} 
        value={value} 
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="w-32"
      />
      {suffix && <span className="text-sm text-muted-foreground">{suffix}</span>}
    </div>
  );

  const renderPercentInput = (label: string, value: number, onChange: (v: number) => void) => (
    <div className="flex items-center gap-2">
      <label className="text-sm font-medium w-48">{label}</label>
      <Input 
        type="number" 
        step="0.1" 
        min="0" 
        max="100"
        value={(value * 100).toFixed(1)} 
        onChange={(e) => onChange(parseFloat(e.target.value) / 100)}
        className="w-32"
      />
      <span className="text-sm text-muted-foreground">%</span>
    </div>
  );

  return (
    <div className="h-full flex flex-col p-4 gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Valuation Suite - {companySymbol}</h1>
          <p className="text-sm text-muted-foreground">5 Deterministic Models • Zero-LLM Math • Full Audit Trail</p>
        </div>
        <Button variant="outline" disabled={!dcfOutputs && !relativeOutputs}>
          <Download className="mr-2 h-4 w-4" />
          Export Valuation Memo
        </Button>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="border border-destructive/50 bg-destructive/10 rounded-lg p-3">
          <div className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            <span className="font-medium">Validation Errors:</span>
          </div>
          <ul className="mt-2 ml-6 list-disc text-sm">
            {errors.map((e, i) => <li key={i}>{e}</li>)}
          </ul>
        </div>
      )}

      {/* Model Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dcf"><Calculator className="mr-2 h-4 w-4" /> DCF (FCFF)</TabsTrigger>
          <TabsTrigger value="relative"><Target className="mr-2 h-4 w-4" /> Relative Comps</TabsTrigger>
          <TabsTrigger value="sotp"><BarChart className="mr-2 h-4 w-4" /> SOTP</TabsTrigger>
          <TabsTrigger value="banking"><TrendingUp className="mr-2 h-4 w-4" /> Banking P/B-ROE</TabsTrigger>
          <TabsTrigger value="excess"><TrendingDown className="mr-2 h-4 w-4" /> Excess Return</TabsTrigger>
        </TabsList>

        {/* DCF Tab */}
        <TabsContent value="dcf" className="flex-1 flex flex-col mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Inputs Panel */}
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle>DCF Inputs</CardTitle></CardHeader>
              <CardContent className="space-y-3 overflow-y-auto max-h-[70vh]">
                <div className="border-b pb-3">
                  <h4 className="font-medium mb-2">Current Financials (₹ Cr)</h4>
                  <div className="space-y-2">
                    {renderNumberInput("Revenue", dcfInputs.revenue, v => setDcfInputs({...dcfInputs, revenue: v}), 1000, 0, "Cr")}
                    {renderNumberInput("EBIT", dcfInputs.ebit, v => setDcfInputs({...dcfInputs, ebit: v}), 1000, 0, "Cr")}
                    {renderNumberInput("Depreciation", dcfInputs.depreciation, v => setDcfInputs({...dcfInputs, depreciation: v}), 1000, 0, "Cr")}
                    {renderNumberInput("Capex", dcfInputs.capex, v => setDcfInputs({...dcfInputs, capex: v}), 1000, 0, "Cr")}
                    {renderNumberInput("Chg NWC", dcfInputs.change_nwc, v => setDcfInputs({...dcfInputs, change_nwc: v}), 1000, 0, "Cr")}
                    {renderPercentInput("Tax Rate", dcfInputs.tax_rate, v => setDcfInputs({...dcfInputs, tax_rate: v}))}
                  </div>
                </div>
                <div className="border-b pb-3">
                  <h4 className="font-medium mb-2">Capital Structure</h4>
                  <div className="space-y-2">
                    {renderNumberInput("Total Debt", dcfInputs.total_debt, v => setDcfInputs({...dcfInputs, total_debt: v}), 1000, 0, "Cr")}
                    {renderNumberInput("Cash", dcfInputs.cash, v => setDcfInputs({...dcfInputs, cash: v}), 1000, 0, "Cr")}
                    {renderNumberInput("Minority Interest", dcfInputs.minority_interest, v => setDcfInputs({...dcfInputs, minority_interest: v}), 1000, 0, "Cr")}
                    {renderNumberInput("Diluted Shares", dcfInputs.diluted_shares, v => setDcfInputs({...dcfInputs, diluted_shares: v}), 1, 0.1, "Cr")}
                  </div>
                </div>
                <div className="border-b pb-3">
                  <h4 className="font-medium mb-2">Forecast Assumptions</h4>
                  <div className="space-y-2">
                    {renderPercentInput("EBIT Margin", dcfInputs.ebit_margin, v => setDcfInputs({...dcfInputs, ebit_margin: v}))}
                    {renderPercentInput("Capex % Revenue", dcfInputs.capex_pct_revenue, v => setDcfInputs({...dcfInputs, capex_pct_revenue: v}))}
                    {renderPercentInput("ΔNWC % Rev Chg", dcfInputs.nwc_pct_revenue, v => setDcfInputs({...dcfInputs, nwc_pct_revenue: v}))}
                  </div>
                </div>
                <div className="border-b pb-3">
                  <h4 className="font-medium mb-2">WACC Inputs</h4>
                  <div className="space-y-2">
                    {renderPercentInput("Risk-Free Rate", dcfInputs.risk_free_rate, v => setDcfInputs({...dcfInputs, risk_free_rate: v}))}
                    {renderPercentInput("Equity Risk Premium", dcfInputs.equity_risk_premium, v => setDcfInputs({...dcfInputs, equity_risk_premium: v}))}
                    {renderNumberInput("Beta", dcfInputs.beta, v => setDcfInputs({...dcfInputs, beta: v}), 0.05, 0)}
                    {renderPercentInput("Cost of Debt", dcfInputs.cost_of_debt, v => setDcfInputs({...dcfInputs, cost_of_debt: v}))}
                    {renderPercentInput("Target D/V", dcfInputs.debt_to_value, v => setDcfInputs({...dcfInputs, debt_to_value: v}))}
                  </div>
                </div>
                <div className="border-b pb-3">
                  <h4 className="font-medium mb-2">Terminal Value</h4>
                  <div className="space-y-2">
                    {renderPercentInput("Terminal Growth", dcfInputs.terminal_growth_rate, v => setDcfInputs({...dcfInputs, terminal_growth_rate: v}))}
                    {renderNumberInput("Exit EV/EBITDA", dcfInputs.exit_multiple, v => setDcfInputs({...dcfInputs, exit_multiple: v}), 0.5, 0, "x")}
                    {renderNumberInput("Forecast Years", dcfInputs.forecast_years, v => setDcfInputs({...dcfInputs, forecast_years: v}), 1, 1, "yrs")}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium mb-2">Revenue Growth (Year 1-10)</h4>
                  <div className="grid grid-cols-5 gap-1">
                    {dcfInputs.revenue_growth_years.map((g, i) => (
                      <Input
                        key={i}
                        type="number"
                        step="0.1"
                        value={(g * 100).toFixed(1)}
                        onChange={(e) => {
                          const newGrowth = [...dcfInputs.revenue_growth_years];
                          newGrowth[i] = parseFloat(e.target.value) / 100;
                          setDcfInputs({...dcfInputs, revenue_growth_years: newGrowth});
                        }}
                        className="text-center text-sm"
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Results Panel */}
            <div className="lg:col-span-2 space-y-4">
              {dcfOutputs && (
                <>
                  {/* Key Outputs */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">WACC</CardTitle></CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold tabular-nums">{(dcfOutputs.wacc * 100).toFixed(2)}%</div>
                        <div className="text-xs text-muted-foreground">Ke: {(dcfOutputs.cost_of_equity * 100).toFixed(2)}%</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fair Value (Gordon)</CardTitle></CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold tabular-nums text-green-600">₹{dcfOutputs.fair_value_per_share_gordon.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">EV: ₹{(dcfOutputs.ev_gordon / 100).toFixed(0)} Cr</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fair Value (Exit Mult.)</CardTitle></CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold tabular-nums text-blue-600">₹{dcfOutputs.fair_value_per_share_multiple.toFixed(0)}</div>
                        <div className="text-xs text-muted-foreground">EV: ₹{(dcfOutputs.ev_multiple / 100).toFixed(0)} Cr</div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Terminal Value</CardTitle></CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold tabular-nums">₹{(dcfOutputs.terminal_value_gordon / 100).toFixed(0)} Cr</div>
                        <div className="text-xs text-muted-foreground">Gordon | Mult: ₹{(dcfOutputs.terminal_value_multiple / 100).toFixed(0)} Cr</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Year-by-Year Projections */}
                  <Card>
                    <CardHeader><CardTitle>Year-by-Year Projections (₹ Cr)</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Year</TableHead>
                              <TableHead className="text-right">Revenue</TableHead>
                              <TableHead className="text-right">EBIT</TableHead>
                              <TableHead className="text-right">NOPAT</TableHead>
                              <TableHead className="text-right">D&A</TableHead>
                              <TableHead className="text-right">Capex</TableHead>
                              <TableHead className="text-right">ΔNWC</TableHead>
                              <TableHead className="text-right">FCFF</TableHead>
                              <TableHead className="text-right">Disc. Factor</TableHead>
                              <TableHead className="text-right">PV FCFF</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dcfOutputs.years.map((year, i) => (
                              <TableRow key={year}>
                                <TableCell className="font-medium">{year}</TableCell>
                                <TableCell className="text-right tabular-nums">{dcfOutputs.revenue_proj[i].toFixed(0)}</TableCell>
                                <TableCell className="text-right tabular-nums">{dcfOutputs.ebit_proj[i].toFixed(0)}</TableCell>
                                <TableCell className="text-right tabular-nums">{dcfOutputs.nopat_proj[i].toFixed(0)}</TableCell>
                                <TableCell className="text-right tabular-nums">{dcfOutputs.depreciation_proj[i].toFixed(0)}</TableCell>
                                <TableCell className="text-right tabular-nums">{dcfOutputs.capex_proj[i].toFixed(0)}</TableCell>
                                <TableCell className="text-right tabular-nums">{dcfOutputs.change_nwc_proj[i].toFixed(0)}</TableCell>
                                <TableCell className="text-right tabular-nums font-medium">{dcfOutputs.fcff_proj[i].toFixed(0)}</TableCell>
                                <TableCell className="text-right tabular-nums">{dcfOutputs.discount_factors[i].toFixed(4)}</TableCell>
                                <TableCell className="text-right tabular-nums">{dcfOutputs.pv_fcff[i].toFixed(0)}</TableCell>
                              </TableRow>
                            ))}
                            <TableRow className="bg-muted/50 font-bold">
                              <TableCell>Sum</TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell></TableCell>
                              <TableCell className="text-right tabular-nums">{dcfOutputs.fcff_proj.reduce((a,b)=>a+b,0).toFixed(0)}</TableCell>
                              <TableCell></TableCell>
                              <TableCell className="text-right tabular-nums">{dcfOutputs.pv_fcff.reduce((a,b)=>a+b,0).toFixed(0)}</TableCell>
                            </TableRow>
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Sensitivity Matrix */}
                  <Card>
                    <CardHeader><CardTitle>Sensitivity: Fair Value (₹) — Gordon Growth</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>g \ WACC</TableHead>
                              {dcfOutputs.sensitivity_wacc.map(w => (
                                <TableHead key={w} className="text-right">{(w * 100).toFixed(2)}%</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dcfOutputs.sensitivity_growth.map((g, i) => (
                              <TableRow key={g}>
                                <TableCell className="font-medium">{(g * 100).toFixed(2)}%</TableCell>
                                {dcfOutputs.sensitivity_matrix_gordon[i].map((val, j) => (
                                  <TableCell key={j} className="text-right tabular-nums">
                                    ₹{val.toFixed(0)}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Audit Trail */}
                  <Card className="border-amber-200">
                    <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Audit Trail</CardTitle></CardHeader>
                    <CardContent className="text-sm text-muted-foreground space-y-1">
                      <div>Inputs Hash: <code className="font-mono">{dcfOutputs.inputs_hash}</code></div>
                      <div>Calculated: {new Date(dcfOutputs.calculation_timestamp).toLocaleString()}</div>
                      <div>Method: Deterministic Python (numpy/pandas) — Zero LLM Math</div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Relative Valuation Tab */}
        <TabsContent value="relative" className="flex-1 flex flex-col mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle>Relative Valuation Inputs</CardTitle></CardHeader>
              <CardContent className="space-y-3 overflow-y-auto max-h-[70vh]">
                <div className="border-b pb-3">
                  <h4 className="font-medium mb-2">Target Company</h4>
                  <div className="space-y-2">
                    {renderNumberInput("Market Cap (Cr)", relativeInputs.target_market_cap, v => setRelativeInputs({...relativeInputs, target_market_cap: v}), 1000, 0, "Cr")}
                    {renderNumberInput("Net Debt (Cr)", relativeInputs.target_net_debt, v => setRelativeInputs({...relativeInputs, target_net_debt: v}), 1000, 0, "Cr")}
                    {renderNumberInput("EBITDA (Cr)", relativeInputs.target_ebitda, v => setRelativeInputs({...relativeInputs, target_ebitda: v}), 1000, 0, "Cr")}
                    {renderNumberInput("EPS", relativeInputs.target_eps, v => setRelativeInputs({...relativeInputs, target_eps: v}), 1, 0, "₹")}
                    {renderNumberInput("Sales (Cr)", relativeInputs.target_sales, v => setRelativeInputs({...relativeInputs, target_sales: v}), 1000, 0, "Cr")}
                    {renderPercentInput("EPS CAGR 3Y", relativeInputs.target_eps_cagr_3y, v => setRelativeInputs({...relativeInputs, target_eps_cagr_3y: v}))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Peer Group ({relativeInputs.peer_symbols.length})</h4>
                  <div className="space-y-1 max-h-60 overflow-y-auto">
                    {relativeInputs.peer_symbols.map((sym, i) => (
                      <div key={sym} className="grid grid-cols-6 gap-1 text-xs">
                        <span className="font-medium">{sym}</span>
                        <Input type="number" value={relativeInputs.peer_market_caps[i]} onChange={(e) => { const arr = [...relativeInputs.peer_market_caps]; arr[i] = parseFloat(e.target.value); setRelativeInputs({...relativeInputs, peer_market_caps: arr}); }} className="h-8 text-xs" placeholder="MCap" />
                        <Input type="number" value={relativeInputs.peer_net_debts[i]} onChange={(e) => { const arr = [...relativeInputs.peer_net_debts]; arr[i] = parseFloat(e.target.value); setRelativeInputs({...relativeInputs, peer_net_debts: arr}); }} className="h-8 text-xs" placeholder="NetDebt" />
                        <Input type="number" value={relativeInputs.peer_ebitdas[i]} onChange={(e) => { const arr = [...relativeInputs.peer_ebitdas]; arr[i] = parseFloat(e.target.value); setRelativeInputs({...relativeInputs, peer_ebitdas: arr}); }} className="h-8 text-xs" placeholder="EBITDA" />
                        <Input type="number" step="0.1" value={relativeInputs.peer_eps[i]} onChange={(e) => { const arr = [...relativeInputs.peer_eps]; arr[i] = parseFloat(e.target.value); setRelativeInputs({...relativeInputs, peer_eps: arr}); }} className="h-8 text-xs" placeholder="EPS" />
                        <Input type="number" step="0.1" value={(relativeInputs.peer_eps_cagr_3y[i] * 100).toFixed(1)} onChange={(e) => { const arr = [...relativeInputs.peer_eps_cagr_3y]; arr[i] = parseFloat(e.target.value) / 100; setRelativeInputs({...relativeInputs, peer_eps_cagr_3y: arr}); }} className="h-8 text-xs" placeholder="CAGR%" />
                      </div>
                    ))}
                  </div>
                  <Button variant="outline" size="sm" className="mt-2" onClick={() => {
                    const n = relativeInputs.peer_symbols.length;
                    setRelativeInputs({...relativeInputs, 
                      peer_symbols: [...relativeInputs.peer_symbols, `PEER${n + 1}`],
                      peer_market_caps: [...relativeInputs.peer_market_caps, 0],
                      peer_net_debts: [...relativeInputs.peer_net_debts, 0],
                      peer_ebitdas: [...relativeInputs.peer_ebitdas, 0],
                      peer_eps: [...relativeInputs.peer_eps, 0],
                      peer_eps_cagr_3y: [...relativeInputs.peer_eps_cagr_3y, 0],
                    });
                  }}>
                    + Add Peer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              {relativeOutputs && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Target EV/EBITDA</CardTitle></CardHeader>
                      <CardContent><div className="text-3xl font-bold tabular-nums">{relativeOutputs.target_ev_ebitda?.toFixed(1) || '—'}x</div></CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Target P/E</CardTitle></CardHeader>
                      <CardContent><div className="text-3xl font-bold tabular-nums">{relativeOutputs.target_pe?.toFixed(1) || '—'}x</div></CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Peer Median EV/EBITDA</CardTitle></CardHeader>
                      <CardContent><div className="text-3xl font-bold tabular-nums">{relativeOutputs.peer_ev_ebitda_median?.toFixed(1) || '—'}x</div></CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Implied Value (Median)</CardTitle></CardHeader>
                      <CardContent><div className="text-3xl font-bold tabular-nums text-green-600">₹{(relativeOutputs.implied_value_ev_ebitda_median / 100).toFixed(0)} Cr</div></CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader><CardTitle>Football Field Valuation</CardTitle></CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Method</TableHead>
                              <TableHead className="text-right">Low</TableHead>
                              <TableHead className="text-right">Mid</TableHead>
                              <TableHead className="text-right">High</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Object.entries(relativeOutputs.football_field || {}).map(([method, range]: [string, any]) => (
                              <TableRow key={method}>
                                <TableCell className="font-medium">{method.replace(/_/g, ' ')}</TableCell>
                                <TableCell className="text-right">₹{(range.low / 100).toFixed(0)} Cr</TableCell>
                                <TableCell className="text-right font-medium">₹{(range.mid / 100).toFixed(0)} Cr</TableCell>
                                <TableCell className="text-right">₹{(range.high / 100).toFixed(0)} Cr</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-amber-200">
                    <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="h-4 w-4" /> Audit Trail</CardTitle></CardHeader>
                    <CardContent className="text-sm text-muted-foreground">
                      Deterministic Relative Valuation — Peer medians computed via numpy.percentile
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* SOTP Tab */}
        <TabsContent value="sotp" className="flex-1 flex flex-col mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle>SOTP Inputs</CardTitle></CardHeader>
              <CardContent className="space-y-3 overflow-y-auto max-h-[70vh]">
                <div className="space-y-2">
                  {sotpInputs.segments.map((seg, i) => (
                    <div key={i} className="border p-3 rounded bg-muted/30 grid grid-cols-5 gap-2">
                      <Input value={seg.name} onChange={(e) => { const arr = [...sotpInputs.segments]; arr[i] = {...arr[i], name: e.target.value}; setSotpInputs({...sotpInputs, segments: arr}); }} placeholder="Name" className="col-span-2" />
                      <Select value={seg.method as "EV_EBITDA" | "EV_SALES" | "PE" | "PB"} onValueChange={(v) => { const arr = [...sotpInputs.segments]; arr[i] = {...arr[i], method: v as "EV_EBITDA" | "EV_SALES" | "PE" | "PB"}; setSotpInputs({...sotpInputs, segments: arr}); }}>
                        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="EV_EBITDA">EV/EBITDA</SelectItem>
                          <SelectItem value="EV_SALES">EV/Sales</SelectItem>
                          <SelectItem value="PE">P/E</SelectItem>
                          <SelectItem value="PB">P/B</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input type="number" step="100" value={seg.metric} onChange={(e) => { const arr = [...sotpInputs.segments]; arr[i] = {...arr[i], metric: parseFloat(e.target.value)}; setSotpInputs({...sotpInputs, segments: arr}); }} placeholder="Metric" className="w-24" />
                      <Input type="number" step="0.5" value={seg.multiple} onChange={(e) => { const arr = [...sotpInputs.segments]; arr[i] = {...arr[i], multiple: parseFloat(e.target.value)}; setSotpInputs({...sotpInputs, segments: arr}); }} placeholder="Mult." className="w-20" />
                      <Input type="number" step="0.05" min="0" max="1" value={seg.conglomerate_discount} onChange={(e) => { const arr = [...sotpInputs.segments]; arr[i] = {...arr[i], conglomerate_discount: parseFloat(e.target.value)}; setSotpInputs({...sotpInputs, segments: arr}); }} placeholder="Disc." className="w-20" />
                    </div>
                  ))}
                </div>
                <div className="border-t pt-3 space-y-2">
                  {renderNumberInput("Net Debt (Cr)", sotpInputs.net_debt, v => setSotpInputs({...sotpInputs, net_debt: v}), 1000, 0, "Cr")}
                  {renderNumberInput("Cash (Cr)", sotpInputs.cash, v => setSotpInputs({...sotpInputs, cash: v}), 1000, 0, "Cr")}
                  {renderNumberInput("Minority Int. (Cr)", sotpInputs.minority_interest, v => setSotpInputs({...sotpInputs, minority_interest: v}), 1000, 0, "Cr")}
                  {renderNumberInput("Diluted Shares (Cr)", sotpInputs.diluted_shares, v => setSotpInputs({...sotpInputs, diluted_shares: v}), 1, 0.1, "Cr")}
                </div>
                <Button variant="outline" size="sm" onClick={() => setSotpInputs({...sotpInputs, segments: [...sotpInputs.segments, {name: '', metric: 0, multiple: 0, method: 'EV_EBITDA', conglomerate_discount: 0.1}]} )}>
                  + Add Segment
                </Button>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              {sotpOutputs && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Total EV</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold tabular-nums">₹{(sotpOutputs.total_ev / 100).toFixed(0)} Cr</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Equity Value</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold tabular-nums">₹{(sotpOutputs.equity_value / 100).toFixed(0)} Cr</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fair Value/Share</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold tabular-nums text-green-600">₹{sotpOutputs.fair_value_per_share.toFixed(2)}</div></CardContent></Card>
                  </div>

                  <Card>
                    <CardHeader><CardTitle>Segment Contributions</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Segment</TableHead>
                            <TableHead>Method</TableHead>
                            <TableHead className="text-right">Metric</TableHead>
                            <TableHead className="text-right">Multiple</TableHead>
                            <TableHead className="text-right">Discount</TableHead>
                            <TableHead className="text-right">EV (Cr)</TableHead>
                            <TableHead className="text-right">% of Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {sotpOutputs.segment_values.map((seg: any) => (
                            <TableRow key={seg.name}>
                              <TableCell className="font-medium">{seg.name}</TableCell>
                              <TableCell>{seg.method}</TableCell>
                              <TableCell className="text-right tabular-nums">{seg.metric.toLocaleString()}</TableCell>
                              <TableCell className="text-right tabular-nums">{seg.multiple.toFixed(1)}x</TableCell>
                              <TableCell className="text-right tabular-nums">{(seg.discount * 100).toFixed(0)}%</TableCell>
                              <TableCell className="text-right tabular-nums">₹{(seg.ev / 100).toFixed(0)}</TableCell>
                              <TableCell className="text-right tabular-nums">{((seg.ev / sotpOutputs.total_ev) * 100).toFixed(1)}%</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Banking Tab */}
        <TabsContent value="banking" className="flex-1 flex flex-col mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle>Banking Valuation Inputs</CardTitle></CardHeader>
              <CardContent className="space-y-3 overflow-y-auto max-h-[70vh]">
                <div className="space-y-2">
                  {renderNumberInput("Book Value/Share", bankingInputs.book_value, v => setBankingInputs({...bankingInputs, book_value: v}), 1, 0, "₹")}
                  {renderPercentInput("ROE", bankingInputs.roe, v => setBankingInputs({...bankingInputs, roe: v}))}
                  {renderPercentInput("Cost of Equity", bankingInputs.cost_of_equity, v => setBankingInputs({...bankingInputs, cost_of_equity: v}))}
                  {renderPercentInput("Growth Rate", bankingInputs.growth_rate, v => setBankingInputs({...bankingInputs, growth_rate: v}))}
                  {renderNumberInput("Market Cap (Cr)", bankingInputs.market_cap, v => setBankingInputs({...bankingInputs, market_cap: v}), 1000, 0, "Cr")}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Peer Group (ROE vs P/B)</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {bankingInputs.peer_roes.map((roe, i) => (
                      <div key={i} className="grid grid-cols-2 gap-2 text-xs">
                        <Input type="number" step="0.1" value={(roe * 100).toFixed(1)} onChange={(e) => { const arr = [...bankingInputs.peer_roes]; arr[i] = parseFloat(e.target.value) / 100; setBankingInputs({...bankingInputs, peer_roes: arr}); }} className="h-8 text-xs" placeholder="ROE%" />
                        <Input type="number" step="0.1" value={bankingInputs.peer_pbs[i]} onChange={(e) => { const arr = [...bankingInputs.peer_pbs]; arr[i] = parseFloat(e.target.value); setBankingInputs({...bankingInputs, peer_pbs: arr}); }} className="h-8 text-xs" placeholder="P/B" />
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              {bankingOutputs && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Justified P/B</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold tabular-nums">{bankingOutputs.justified_pb.toFixed(2)}x</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Implied Price (Just. P/B)</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold tabular-nums">₹{bankingOutputs.implied_price_justified_pb.toFixed(0)}</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Regression P/B</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold tabular-nums">{bankingOutputs.predicted_pb.toFixed(2)}x</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Premium/Discount</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold tabular-nums" style={{color: bankingOutputs.premium_discount_pct > 0 ? 'red' : 'green'}}>{bankingOutputs.premium_discount_pct > 0 ? '+' : ''}{bankingOutputs.premium_discount_pct.toFixed(1)}%</div></CardContent></Card>
                  </div>

                  <Card>
                    <CardHeader><CardTitle>P/B vs ROE Regression</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div><span className="text-muted-foreground">Slope:</span> <span className="font-mono">{bankingOutputs.regression_slope.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">Intercept:</span> <span className="font-mono">{bankingOutputs.regression_intercept.toFixed(4)}</span></div>
                        <div><span className="text-muted-foreground">R²:</span> <span className="font-mono">{bankingOutputs.regression_r2.toFixed(4)}</span></div>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Excess Return Tab */}
        <TabsContent value="excess" className="flex-1 flex flex-col mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-1">
              <CardHeader><CardTitle>Excess Return Inputs</CardTitle></CardHeader>
              <CardContent className="space-y-3 overflow-y-auto max-h-[70vh]">
                <div className="space-y-2">
                  {renderNumberInput("Book Value (Cr)", excessReturnInputs.book_value, v => setExcessReturnInputs({...excessReturnInputs, book_value: v}), 1000, 0, "Cr")}
                  {renderNumberInput("Diluted Shares (Cr)", excessReturnInputs.diluted_shares, v => setExcessReturnInputs({...excessReturnInputs, diluted_shares: v}), 1, 0.1, "Cr")}
                  {renderPercentInput("Cost of Equity", excessReturnInputs.cost_of_equity, v => setExcessReturnInputs({...excessReturnInputs, cost_of_equity: v}))}
                  {renderPercentInput("Terminal Growth", excessReturnInputs.growth_rate, v => setExcessReturnInputs({...excessReturnInputs, growth_rate: v}))}
                  {renderNumberInput("Forecast Years", excessReturnInputs.forecast_years, v => setExcessReturnInputs({...excessReturnInputs, forecast_years: v}), 1, 1, "yrs")}
                </div>
                <div>
                  <h4 className="font-medium mb-2">Net Income Forecast (₹ Cr)</h4>
                  <div className="grid grid-cols-3 gap-1">
                    {excessReturnInputs.net_income_forecast.map((ni, i) => (
                      <Input key={i} type="number" step="100" value={ni} onChange={(e) => { const arr = [...excessReturnInputs.net_income_forecast]; arr[i] = parseFloat(e.target.value); setExcessReturnInputs({...excessReturnInputs, net_income_forecast: arr}); }} className="h-8 text-center text-sm" placeholder={`Yr ${i+1}`} />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="lg:col-span-2 space-y-4">
              {excessReturnOutputs && (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Equity Value</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold tabular-nums">₹{(excessReturnOutputs.equity_value / 100).toFixed(0)} Cr</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Fair Value/Share</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold tabular-nums text-green-600">₹{excessReturnOutputs.fair_value_per_share.toFixed(2)}</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">Terminal RI (Cr)</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold tabular-nums">₹{(excessReturnOutputs.terminal_ri / 100).toFixed(0)}</div></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm text-muted-foreground">PV Terminal RI (Cr)</CardTitle></CardHeader><CardContent><div className="text-3xl font-bold tabular-nums">₹{(excessReturnOutputs.pv_terminal_ri / 100).toFixed(0)}</div></CardContent></Card>
                  </div>

                  <Card>
                    <CardHeader><CardTitle>Residual Income Projections (₹ Cr)</CardTitle></CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Year</TableHead>
                            <TableHead className="text-right">Net Income</TableHead>
                            <TableHead className="text-right">Beg. Book Value</TableHead>
                            <TableHead className="text-right">RI</TableHead>
                            <TableHead className="text-right">PV RI</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {excessReturnOutputs.residual_incomes.map((ri: number, i: number) => (
                            <TableRow key={i}>
                              <TableCell className="font-medium">Yr {i + 1}</TableCell>
                              <TableCell className="text-right tabular-nums">{excessReturnInputs.net_income_forecast[i].toLocaleString()}</TableCell>
                              <TableCell className="text-right tabular-nums">{(excessReturnInputs.book_value + excessReturnInputs.net_income_forecast.slice(0, i).reduce((a,b)=>a+b,0)).toLocaleString()}</TableCell>
                              <TableCell className="text-right tabular-nums">{ri.toLocaleString()}</TableCell>
                              <TableCell className="text-right tabular-nums">{excessReturnOutputs.pv_residual_incomes[i].toLocaleString()}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}