import { NextRequest, NextResponse } from 'next/server';
import { ScreeningCriteria, ScreeningResult, CompanySnapshot } from '@/lib/types';

// Mock company data
const MOCK_COMPANIES: CompanySnapshot[] = [
  {
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd',
    current_price: 2500,
    market_cap: 1690000,
    pe: 24.5,
    pb: 2.1,
    ev_ebitda: 14.2,
    roe: 0.12,
    roce: 0.10,
    debt_equity: 0.45,
    fcf_yield: 0.035,
    sales_growth_3y: 0.15,
    profit_growth_3y: 0.18,
    promoter_holding: 0.50,
    pledged_holding: 0.02,
    sector: 'Oil & Gas',
    industry: 'Refining & Marketing',
    market_cap_category: 'LARGE',
    last_updated: new Date().toISOString(),
  },
  {
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd',
    current_price: 3800,
    market_cap: 1380000,
    pe: 28.5,
    pb: 12.5,
    ev_ebitda: 19.8,
    roe: 0.45,
    roce: 0.52,
    debt_equity: 0.01,
    fcf_yield: 0.045,
    sales_growth_3y: 0.12,
    profit_growth_3y: 0.10,
    promoter_holding: 0.72,
    pledged_holding: 0.0,
    sector: 'IT Services',
    industry: 'Software Services',
    market_cap_category: 'LARGE',
    last_updated: new Date().toISOString(),
  },
  {
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd',
    current_price: 1650,
    market_cap: 920000,
    pe: 18.5,
    pb: 2.8,
    ev_ebitda: 0,
    roe: 0.17,
    roce: 0,
    debt_equity: 0,
    fcf_yield: 0,
    sales_growth_3y: 0.18,
    profit_growth_3y: 0.20,
    promoter_holding: 0.26,
    pledged_holding: 0.0,
    sector: 'Banking',
    industry: 'Private Sector Bank',
    market_cap_category: 'LARGE',
    last_updated: new Date().toISOString(),
  },
  {
    symbol: 'INFY',
    name: 'Infosys Ltd',
    current_price: 1450,
    market_cap: 600000,
    pe: 22.0,
    pb: 8.5,
    ev_ebitda: 16.5,
    roe: 0.32,
    roce: 0.38,
    debt_equity: 0.05,
    fcf_yield: 0.04,
    sales_growth_3y: 0.10,
    profit_growth_3y: 0.09,
    promoter_holding: 0.13,
    pledged_holding: 0.0,
    sector: 'IT Services',
    industry: 'Software Services',
    market_cap_category: 'LARGE',
    last_updated: new Date().toISOString(),
  },
  {
    symbol: 'ICICIBANK',
    name: 'ICICI Bank Ltd',
    current_price: 950,
    market_cap: 660000,
    pe: 16.2,
    pb: 2.5,
    ev_ebitda: 0,
    roe: 0.16,
    roce: 0,
    debt_equity: 0,
    fcf_yield: 0,
    sales_growth_3y: 0.17,
    profit_growth_3y: 0.19,
    promoter_holding: 0.14,
    pledged_holding: 0.0,
    sector: 'Banking',
    industry: 'Private Sector Bank',
    market_cap_category: 'LARGE',
    last_updated: new Date().toISOString(),
  },
  {
    symbol: 'BAJFINANCE',
    name: 'Bajaj Finance Ltd',
    current_price: 7200,
    market_cap: 440000,
    pe: 32.0,
    pb: 5.8,
    ev_ebitda: 0,
    roe: 0.22,
    roce: 0,
    debt_equity: 0,
    fcf_yield: 0,
    sales_growth_3y: 0.25,
    profit_growth_3y: 0.28,
    promoter_holding: 0.52,
    pledged_holding: 0.0,
    sector: 'Financial Services',
    industry: 'NBFC',
    market_cap_category: 'LARGE',
    last_updated: new Date().toISOString(),
  },
  {
    symbol: 'DMART',
    name: 'Avenue Supermarts Ltd',
    current_price: 3800,
    market_cap: 245000,
    pe: 85.0,
    pb: 12.0,
    ev_ebitda: 45.0,
    roe: 0.14,
    roce: 0.16,
    debt_equity: 0.02,
    fcf_yield: 0.01,
    sales_growth_3y: 0.20,
    profit_growth_3y: 0.18,
    promoter_holding: 0.75,
    pledged_holding: 0.0,
    sector: 'Consumer',
    industry: 'Retail',
    market_cap_category: 'MID',
    last_updated: new Date().toISOString(),
  },
  {
    symbol: 'TRENT',
    name: 'Trent Ltd',
    current_price: 4200,
    market_cap: 150000,
    pe: 95.0,
    pb: 18.0,
    ev_ebitda: 55.0,
    roe: 0.18,
    roce: 0.22,
    debt_equity: 0.05,
    fcf_yield: 0.005,
    sales_growth_3y: 0.30,
    profit_growth_3y: 0.35,
    promoter_holding: 0.37,
    pledged_holding: 0.0,
    sector: 'Consumer',
    industry: 'Retail',
    market_cap_category: 'MID',
    last_updated: new Date().toISOString(),
  },
  {
    symbol: 'PERSISTENT',
    name: 'Persistent Systems Ltd',
    current_price: 5800,
    market_cap: 88000,
    pe: 45.0,
    pb: 9.5,
    ev_ebitda: 28.0,
    roe: 0.22,
    roce: 0.25,
    debt_equity: 0.0,
    fcf_yield: 0.025,
    sales_growth_3y: 0.22,
    profit_growth_3y: 0.20,
    promoter_holding: 0.32,
    pledged_holding: 0.0,
    sector: 'IT Services',
    industry: 'Software Services',
    market_cap_category: 'MID',
    last_updated: new Date().toISOString(),
  },
  {
    symbol: 'COFORGE',
    name: 'Coforge Ltd',
    current_price: 4500,
    market_cap: 65000,
    pe: 38.0,
    pb: 7.5,
    ev_ebitda: 24.0,
    roe: 0.20,
    roce: 0.23,
    debt_equity: 0.02,
    fcf_yield: 0.03,
    sales_growth_3y: 0.18,
    profit_growth_3y: 0.16,
    promoter_holding: 0.35,
    pledged_holding: 0.0,
    sector: 'IT Services',
    industry: 'Software Services',
    market_cap_category: 'MID',
    last_updated: new Date().toISOString(),
  },
];

function calculateScore(company: CompanySnapshot, criteria: ScreeningCriteria): number {
  let score = 0;
  let maxScore = 0;
  
  const checks = [
    { key: 'pe', passed: criteria.pe_max === undefined || (company.pe ?? Infinity) <= criteria.pe_max, weight: 10 },
    { key: 'ev_ebitda', passed: criteria.ev_ebitda_max === undefined || (company.ev_ebitda ?? Infinity) <= criteria.ev_ebitda_max, weight: 10 },
    { key: 'fcf_yield', passed: criteria.fcf_yield_min === undefined || (company.fcf_yield ?? -Infinity) >= criteria.fcf_yield_min, weight: 10 },
    { key: 'roe', passed: criteria.roe_min === undefined || (company.roe ?? -Infinity) >= criteria.roe_min, weight: 10 },
    { key: 'roce', passed: criteria.roce_min === undefined || (company.roce ?? -Infinity) >= criteria.roce_min, weight: 10 },
    { key: 'debt_ebitda', passed: criteria.debt_ebitda_max === undefined || (company.debt_equity ?? Infinity) <= criteria.debt_ebitda_max, weight: 10 },
    { key: 'dist_52w', passed: true, weight: 5 }, // Mock
    { key: 'beneish', passed: true, weight: 15 }, // Mock
    { key: 'piotroski', passed: true, weight: 15 }, // Mock
  ];
  
  checks.forEach(c => {
    maxScore += c.weight;
    if (c.passed) score += c.weight;
  });
  
  return Math.min(100, Math.round((score / maxScore) * 100));
}

function checkFilters(company: CompanySnapshot, criteria: ScreeningCriteria): Record<string, boolean> {
  return {
    pe: criteria.pe_max === undefined || (company.pe ?? Infinity) <= criteria.pe_max,
    ev_ebitda: criteria.ev_ebitda_max === undefined || (company.ev_ebitda ?? Infinity) <= criteria.ev_ebitda_max,
    fcf_yield: criteria.fcf_yield_min === undefined || (company.fcf_yield ?? -Infinity) >= criteria.fcf_yield_min,
    roe: criteria.roe_min === undefined || (company.roe ?? -Infinity) >= criteria.roe_min,
    roce: criteria.roce_min === undefined || (company.roce ?? -Infinity) >= criteria.roce_min,
    debt_ebitda: criteria.debt_ebitda_max === undefined || (company.debt_equity ?? Infinity) <= criteria.debt_ebitda_max,
    market_cap: criteria.market_cap_min === undefined || company.market_cap >= criteria.market_cap_min,
    category: criteria.market_cap_category === undefined || 
              (company.market_cap_category !== undefined && criteria.market_cap_category.includes(company.market_cap_category)),
  };
}

export async function POST(request: NextRequest) {
  try {
    const criteria: ScreeningCriteria = await request.json();
    
    const results: ScreeningResult[] = MOCK_COMPANIES.map(company => {
      const passedFilters = checkFilters(company, criteria);
      const score = calculateScore(company, criteria);
      
      return {
        symbol: company.symbol,
        name: company.name,
        score,
        passed_filters: passedFilters,
        metrics: {
          pe: company.pe || 0,
          ev_ebitda: company.ev_ebitda || 0,
          fcf_yield: company.fcf_yield || 0,
          roe: company.roe || 0,
          roce: company.roce || 0,
          debt_ebitda: company.debt_equity || 0,
        },
        rank: 0,
      };
    });
    
    // Sort by score descending
    results.sort((a, b) => b.score - a.score);
    results.forEach((r, i) => r.rank = i + 1);
    
    return NextResponse.json(results);
  } catch (error) {
    console.error('Screening error:', error);
    return NextResponse.json({ error: 'Screening failed' }, { status: 500 });
  }
}