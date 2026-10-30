import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'http://localhost:54321'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our research OS
export interface Company {
  id: string
  symbol: string
  name: string
  isin?: string
  sector?: string
  industry?: string
  market_cap_category?: 'LARGE' | 'MID' | 'SMALL' | 'MICRO'
  exchange?: string
  status?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  company_id?: string
  title: string
  doc_type: 'ANNUAL_REPORT' | 'CONCALL_TRANSCRIPT' | 'INVESTOR_PRESENTATION' | 'QUARTERLY_RESULT' | 'CREDIT_RATING' | 'NEWS' | 'OTHER'
  source?: string
  source_url?: string
  file_path?: string
  file_hash?: string
  mime_type?: string
  file_size_bytes?: number
  pages?: number
  language?: string
  fiscal_year?: number
  fiscal_quarter?: string
  period_end_date?: string
  parsed_status?: 'PENDING' | 'PARSING' | 'PARSED' | 'FAILED'
  parsed_at?: string
  parsing_error?: string
  meta?: Record<string, any>
  created_at: string
  updated_at: string
}

export type DocumentType = Document['doc_type']

export interface DocumentMetadata {
  id: string
  company_symbol: string
  title: string
  doc_type: DocumentType
  source: string
  date: string
  pages: number
  status: Document['parsed_status']
  file_size: string
}

export interface ResearchIdea {
  id: string
  company_id?: string
  title: string
  source?: string
  source_detail?: string
  tags?: string[]
  stage: 'GENERATE' | 'RESEARCH' | 'WEIGH' | 'TRACK' | 'HARVEST'
  conviction_score?: number
  priority?: number
  assigned_to?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface GRWTHStage {
  id: string
  code: string
  name: string
  description?: string
  position: number
  wip_limit?: number
  entry_criteria?: Record<string, any>
  exit_criteria?: Record<string, any>
  color?: string
  is_active?: boolean
}

export interface CompanyOverview {
  id: string
  company_id: string
  about_company?: string
  entry_rationale?: string
  exit_rationale?: string
  thesis_snapshot?: string
  decision_terminal?: Record<string, any>
  tracking_table?: Record<string, any>
  latest_changes?: any[]
  updated_at: string
}

export interface CompanyManagement {
  id: string
  company_id: string
  background?: any[]
  shareholding_pattern?: any[]
  track_record?: any[]
  concall_consistency?: any[]
  capital_allocation?: any[]
  red_flags?: any[]
  updated_at: string
}

export interface CompanyStory {
  id: string
  company_id: string
  business_model?: string
  economic_moat?: string
  current_growth_drivers?: any[]
  future_growth_drivers?: any[]
  updated_at: string
}

export interface CompanyIndustry {
  id: string
  company_id: string
  market_sizing?: any[]
  competitors?: any[]
  value_chain?: Record<string, any>
  updated_at: string
}

export interface CompanyRisk {
  id: string
  company_id: string
  business_risk?: any[]
  financial_risk?: any[]
  valuation_risk?: any[]
  governance_risk?: any[]
  macro_risk?: any[]
  industry_red_flags?: any[]
  risk_scores?: Record<string, number>
  key_fragility_points?: any[]
  legal_checks?: any[]
  updated_at: string
}

export interface CompanyAnalysis {
  id: string
  company_id: string
  concall_tracker?: any[]
  ratio_analysis?: Record<string, any>
  recent_events?: any[]
  turnaround_indicators?: any[]
  exit_checklist?: any[]
  valuation_philosophy?: string
  dcf_model?: Record<string, any>
  relative_model?: Record<string, any>
  sotp_model?: Record<string, any>
  banking_model?: Record<string, any>
  excess_return_model?: Record<string, any>
  updated_at: string
}

export interface CompanyFinancials {
  id: string
  company_id: string
  financial_statements?: Record<string, any>
  segment_breakup?: any[]
  revenue_projections?: any[]
  common_size?: Record<string, any>
  cost_breakup?: any[]
  wc_breakup?: any[]
  updated_at: string
}

export interface CompanySME {
  id: string
  company_id: string
  company_info?: Record<string, any>
  promoter_forensics?: Record<string, any>
  fs_health?: Record<string, any>
  other_forensics?: Record<string, any>
  on_ground_research?: any[]
  corporate_governance?: Record<string, any>
  customer_concentration?: any[]
  screening_checklist?: any[]
  updated_at: string
}

export interface CompanyDownsides {
  id: string
  company_id: string
  key_events?: any[]
  hedging_mechanism?: Record<string, any>
  forensic_analysis?: Record<string, any>
  updated_at: string
}

export interface WeighDecision {
  id: string
  idea_id: string
  portfolio_fit?: Record<string, any>
  risk_correlation?: Record<string, any>
  valuation_allocation?: Record<string, any>
  behavioural_audit?: any[]
  final_summary?: Record<string, any>
  decision?: 'INVEST' | 'PASS' | 'MONITOR' | 'EXIT'
  decided_at?: string
  decided_by?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Portfolio {
  id: string
  name: string
  description?: string
  benchmark_symbol?: string
  base_currency?: string
  is_active?: boolean
  created_at: string
  updated_at: string
}

export interface Holding {
  id: string
  portfolio_id: string
  company_id: string
  quantity: number
  avg_cost: number
  current_price?: number
  current_value?: number
  unrealized_pnl?: number
  unrealized_pnl_pct?: number
  asset_class?: string
  sector?: string
  market_cap_category?: string
  entry_date?: string
  entry_rationale?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  portfolio_id: string
  company_id: string
  txn_type: 'BUY' | 'SELL' | 'DIVIDEND' | 'SPLIT' | 'BONUS' | 'MERGER' | 'DEMERGER' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'MTF' | 'INTRADAY_ADJ'
  txn_date: string
  quantity: number
  price: number
  value: number
  charges?: number
  net_value: number
  realized_pnl?: number
  entry_rationale?: string
  exit_rationale?: string
  source?: string
  source_doc_id?: string
  metadata?: Record<string, any>
  created_at: string
}

export interface Industry {
  id: string
  code: string
  name: string
  description?: string
  demand_drivers?: any[]
  supply_dynamics?: any[]
  risk_factors?: any[]
  regulations?: any[]
  demand_drivers_detail?: any[]
  cost_drivers?: any[]
  cost_comparison?: Record<string, any>
  supply_chain_map?: Record<string, any>
  market_sizing?: any[]
  company_symbols?: string[]
  aggregate_financials?: Record<string, any>
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
}

export interface Watchlist {
  id: string
  name: string
  description?: string
  columns?: any[]
  company_symbols?: string[]
  is_default?: boolean
  created_at: string
  updated_at: string
}

export interface Task {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE' | 'BLOCKED'
  priority?: number
  assignee?: string
  due_date?: string
  estimated_hours?: number
  actual_hours?: number
  tags?: string[]
  related_idea_id?: string
  related_company_id?: string
  parent_task_id?: string
  metadata?: Record<string, any>
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface TimeEntry {
  id: string
  task_id: string
  user_id: string
  start_time: string
  end_time?: string
  duration_minutes?: number
  category?: string
  notes?: string
  created_at: string
}

// Screening & Valuation Types
export interface CompanySnapshot {
  symbol: string
  name: string
  current_price: number
  market_cap: number
  pe?: number
  pb?: number
  ev_ebitda?: number
  roe?: number
  roce?: number
  debt_equity?: number
  fcf_yield?: number
  sales_growth_3y?: number
  profit_growth_3y?: number
  promoter_holding?: number
  pledged_holding?: number
  sector?: string
  industry?: string
  market_cap_category?: 'LARGE' | 'MID' | 'SMALL' | 'MICRO'
  last_updated: string
  // Additional fields for watchlist
  change?: number
  dist_from_52w_high?: number
}

export interface ScreeningCriteria {
  pe_max?: number
  ev_ebitda_max?: number
  fcf_yield_min?: number
  roe_min?: number
  roce_min?: number
  debt_ebitda_max?: number
  dist_from_52w_high_max?: number
  beneish_max?: number
  piotroski_min?: number
  market_cap_min?: number
  market_cap_max?: number
  market_cap_category?: string[]
}

export interface ScreeningResult {
  symbol: string
  name: string
  score: number
  passed_filters: Record<string, boolean>
  metrics: Record<string, number>
  rank: number
}

// Math Engine Types (TypeScript equivalents)
export interface DCFInputs {
  revenue: number
  ebit: number
  depreciation: number
  capex: number
  change_nwc: number
  tax_rate: number
  total_debt: number
  cash: number
  minority_interest: number
  diluted_shares: number
  revenue_growth_years: number[]
  ebit_margin: number
  capex_pct_revenue: number
  nwc_pct_revenue: number
  risk_free_rate: number
  equity_risk_premium: number
  beta: number
  cost_of_debt: number
  debt_to_value: number
  terminal_growth_rate: number
  exit_multiple: number
  forecast_years: number
}

export interface DCFOutputs {
  years: number[]
  revenue_proj: number[]
  ebit_proj: number[]
  nopat_proj: number[]
  depreciation_proj: number[]
  capex_proj: number[]
  change_nwc_proj: number[]
  fcff_proj: number[]
  wacc: number
  cost_of_equity: number
  discount_factors: number[]
  pv_fcff: number[]
  terminal_value_gordon: number
  terminal_value_multiple: number
  pv_terminal_gordon: number
  pv_terminal_multiple: number
  ev_gordon: number
  ev_multiple: number
  equity_value_gordon: number
  equity_value_multiple: number
  fair_value_per_share_gordon: number
  fair_value_per_share_multiple: number
  sensitivity_wacc: number[]
  sensitivity_growth: number[]
  sensitivity_matrix_gordon: number[][]
  sensitivity_matrix_multiple: number[][]
  inputs_hash: string
  calculation_timestamp: string
}

export interface RelativeValuationInputs {
  target_market_cap: number
  target_net_debt: number
  target_minority_interest: number
  target_preferred: number
  target_ebitda: number
  target_eps: number
  target_sales: number
  target_eps_cagr_3y: number
  peer_symbols: string[]
  peer_market_caps: number[]
  peer_net_debts: number[]
  peer_ebitdas: number[]
  peer_eps: number[]
  peer_sales: number[]
  peer_eps_cagr_3y: number[]
  txn_peer_symbols?: string[]
  txn_ev_ebitda?: number[]
  txn_ev_sales?: number[]
}

export interface RelativeValuationOutputs {
  target_ev_ebitda: number
  target_pe: number
  target_ev_sales: number
  target_peg: number
  peer_ev_ebitda_median: number
  peer_ev_ebitda_p25: number
  peer_ev_ebitda_p75: number
  peer_pe_median: number
  peer_pe_p25: number
  peer_pe_p75: number
  peer_ev_sales_median: number
  peer_peg_median: number
  implied_value_ev_ebitda_median: number
  implied_value_ev_ebitda_p25: number
  implied_value_ev_ebitda_p75: number
  implied_value_pe_median: number
  implied_value_pe_p25: number
  implied_value_pe_p75: number
  txn_ev_ebitda_median?: number
  txn_ev_sales_median?: number
  implied_value_txn_ev_ebitda?: number
  implied_value_txn_ev_sales?: number
  football_field: Record<string, { low: number; mid: number; high: number }>
}

export interface SOTPInputs {
  segments: Array<{
    name: string
    metric: number
    multiple: number
    method: 'EV_EBITDA' | 'EV_SALES' | 'PE' | 'PB'
    conglomerate_discount: number
  }>
  net_debt: number
  cash: number
  minority_interest: number
  diluted_shares: number
}

export interface SOTPOutputs {
  segment_values: Array<{
    name: string
    method: string
    metric: number
    multiple: number
    discount: number
    ev: number
  }>
  total_ev: number
  equity_value: number
  fair_value_per_share: number
  segment_contributions: Record<string, number>
}

export interface BankingValuationInputs {
  book_value: number
  roe: number
  cost_of_equity: number
  growth_rate: number
  peer_roes: number[]
  peer_pbs: number[]
  market_cap: number
}

export interface BankingValuationOutputs {
  justified_pb: number
  implied_price_justified_pb: number
  regression_slope: number
  regression_intercept: number
  regression_r2: number
  predicted_pb: number
  implied_price_regression: number
  premium_discount_pct: number
}

export interface ExcessReturnInputs {
  book_value: number
  net_income_forecast: number[]
  cost_of_equity: number
  growth_rate: number
  forecast_years: number
  diluted_shares: number
}

export interface ExcessReturnOutputs {
  residual_incomes: number[]
  pv_residual_incomes: number[]
  terminal_ri: number
  pv_terminal_ri: number
  equity_value: number
  fair_value_per_share: number
}