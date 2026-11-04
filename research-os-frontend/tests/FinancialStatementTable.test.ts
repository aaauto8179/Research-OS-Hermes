import { describe, it, expect, vi } from 'vitest';
import {
  RELIANCE_DATA,
  TCS_DATA,
  HDFCBANK_DATA,
  getSampleStatementData,
  getAllSampleSymbols,
  FISCAL_YEARS,
  CompanyStatementData,
  StatementLineItem,
} from '../src/data/sample-statements';
import { formatINRCrores } from '../src/lib/formatters';

describe('Financial Statements Sample Data Store Integrity', () => {
  const sampleCompanies = [
    { data: RELIANCE_DATA, expectedSymbol: 'RELIANCE', expectedSegments: 4 },
    { data: TCS_DATA, expectedSymbol: 'TCS', expectedSegments: 4 },
    { data: HDFCBANK_DATA, expectedSymbol: 'HDFCBANK', expectedSegments: 3 },
  ];

  sampleCompanies.forEach(({ data, expectedSymbol, expectedSegments }) => {
    describe(`${expectedSymbol} Dataset`, () => {
      it('has valid company metadata and 10 fiscal years', () => {
        expect(data.symbol).toBe(expectedSymbol);
        expect(data.fiscalYears).toEqual(FISCAL_YEARS);
        expect(data.fiscalYears).toHaveLength(10);
        expect(data.fiscalYears[0]).toBe('FY15');
        expect(data.fiscalYears[9]).toBe('FY24');
      });

      it('has populated P&L, Balance Sheet, and Cash Flow statements', () => {
        expect(data.statements.PL.length).toBeGreaterThan(5);
        expect(data.statements.BS.length).toBeGreaterThan(3);
        expect(data.statements.CF.length).toBeGreaterThan(2);
      });

      it(`has ${expectedSegments} business segments configured`, () => {
        expect(data.segments).toBeDefined();
        expect(data.segments?.length).toBe(expectedSegments);
        data.segments?.forEach((seg) => {
          expect(seg.name).toBeTruthy();
          expect(seg.revenueFY24).toBeGreaterThan(0);
          expect(seg.marginPct).toBeGreaterThan(0);
        });
      });
    });
  });

  it('provides getSampleStatementData lookup with fallback', () => {
    expect(getSampleStatementData('RELIANCE').symbol).toBe('RELIANCE');
    expect(getSampleStatementData('reliance').symbol).toBe('RELIANCE');
    expect(getSampleStatementData('tcs').symbol).toBe('TCS');
    expect(getSampleStatementData('hdfcbank').symbol).toBe('HDFCBANK');
    // Unknown fallback to RELIANCE
    expect(getSampleStatementData('UNKNOWN_XYZ').symbol).toBe('RELIANCE');
  });

  it('lists all available sample symbols', () => {
    const symbols = getAllSampleSymbols();
    expect(symbols).toContain('RELIANCE');
    expect(symbols).toContain('TCS');
    expect(symbols).toContain('HDFCBANK');
  });
});

describe('Line Item Calculations and Financial Logic', () => {
  it('Reliance FY24 Free Cash Flow matches Operating Cash Flow minus Capex', () => {
    const cf = RELIANCE_DATA.statements.CF;
    const cfo = cf.find((i) => i.metricKey === 'OPERATING_CASH_FLOW')?.periods['FY24']?.value;
    const capex = cf.find((i) => i.metricKey === 'CAPEX')?.periods['FY24']?.value;
    const fcf = cf.find((i) => i.metricKey === 'FREE_CASH_FLOW')?.periods['FY24']?.value;

    expect(cfo).toBe(141970);
    expect(capex).toBe(-131770);
    expect(fcf).toBe(10200);
    expect(cfo! + capex!).toBe(fcf);
  });

  it('TCS FY24 EBIT equals Operating Profit minus Depreciation', () => {
    const pl = TCS_DATA.statements.PL;
    const ebitda = pl.find((i) => i.metricKey === 'EBITDA')?.periods['FY24']?.value;
    const depr = pl.find((i) => i.metricKey === 'DEPRECIATION')?.periods['FY24']?.value;
    const ebit = pl.find((i) => i.metricKey === 'EBIT')?.periods['FY24']?.value;

    expect(ebitda).toBe(64250);
    expect(depr).toBe(4980);
    expect(ebit).toBe(59270);
    expect(ebitda! - depr!).toBe(ebit);
  });

  it('HDFC Bank FY24 Net Interest Income equals Interest Earned minus Expended', () => {
    const pl = HDFCBANK_DATA.statements.PL;
    const intEarned = pl.find((i) => i.metricKey === 'REV_OPERATIONS')?.periods['FY24']?.value;
    const intExpended = pl.find((i) => i.metricKey === 'INTEREST_EXPENDED')?.periods['FY24']?.value;
    const nii = pl.find((i) => i.metricKey === 'EBITDA')?.periods['FY24']?.value;

    expect(intEarned).toBe(248740);
    expect(intExpended).toBe(134820);
    expect(nii).toBe(113920);
    expect(intEarned! - intExpended!).toBe(nii);
  });
});

describe('Source of Truth Citation Metadata and Cell Click Triggers', () => {
  it('Reliance FY24 Revenue from Operations has complete statutory citation metadata', () => {
    const pl = RELIANCE_DATA.statements.PL;
    const revItem = pl.find((i) => i.metricKey === 'REV_OPERATIONS');
    expect(revItem).toBeDefined();

    const fy24Cell = revItem?.periods['FY24'];
    expect(fy24Cell).toBeDefined();
    expect(fy24Cell?.value).toBe(892450);

    const citation = fy24Cell?.citation;
    expect(citation).toBeDefined();
    expect(citation?.documentTitle).toContain('Reliance Industries');
    expect(citation?.docType).toBe('ANNUAL_REPORT');
    expect(citation?.source).toBe('BSE');
    expect(citation?.fiscalPeriod).toBe('FY2024');
    expect(citation?.pageNumber).toBe(214);
    expect(citation?.noteReference).toBe('Note 28: Revenue from Operations');
    expect(citation?.confidence).toBeGreaterThan(0.99);
    expect(citation?.verifiedStatus).toBe('VERIFIED');
    expect(citation?.extractedSnippet.textPassage).toBeTruthy();
    expect(citation?.extractedSnippet.tableSlice?.headers).toContain('Particulars');
  });

  it('simulates cell selection event and formats citation drawer payload', () => {
    const pl = TCS_DATA.statements.PL;
    const patItem = pl.find((i) => i.metricKey === 'PAT');
    const fy24Cell = patItem!.periods['FY24'];

    const mockCellSelectionHandler = vi.fn();

    // Trigger cell click event payload
    const selectedEvent = {
      metricKey: patItem!.metricKey,
      displayName: patItem!.displayName,
      category: patItem!.category,
      period: 'FY24',
      cellData: fy24Cell,
    };

    mockCellSelectionHandler(selectedEvent);

    expect(mockCellSelectionHandler).toHaveBeenCalledOnce();
    expect(mockCellSelectionHandler).toHaveBeenCalledWith(
      expect.objectContaining({
        metricKey: 'PAT',
        displayName: 'Net Profit (PAT)',
        period: 'FY24',
      })
    );

    // Verify formatted value matches drawer display expectations
    const formattedStr = formatINRCrores(selectedEvent.cellData.value);
    expect(formattedStr).toBe('₹45,908 Cr');
  });

  it('HDFC Bank Schedule 13 Interest Earned contains valid statutory filing coordinates', () => {
    const pl = HDFCBANK_DATA.statements.PL;
    const item = pl.find((i) => i.metricKey === 'REV_OPERATIONS');
    const citation = item?.periods['FY24']?.citation;

    expect(citation?.noteReference).toBe('Schedule 13: Interest Earned');
    expect(citation?.pageNumber).toBe(188);
    expect(citation?.verifiedStatus).toBe('VERIFIED');
  });
});

describe('Statement Tab Switching and Filtering Logic', () => {
  it('correctly filters line items by search query', () => {
    const pl = RELIANCE_DATA.statements.PL;

    const query = 'profit';
    const matches = pl.filter(
      (item) =>
        item.displayName.toLowerCase().includes(query) ||
        item.metricKey.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
    );

    expect(matches.length).toBeGreaterThan(0);
    matches.forEach((m) => {
      const matchFound =
        m.displayName.toLowerCase().includes(query) ||
        m.metricKey.toLowerCase().includes(query) ||
        m.category.toLowerCase().includes(query);
      expect(matchFound).toBe(true);
    });
  });

  it('separates Balance Sheet liabilities from assets correctly', () => {
    const bs = RELIANCE_DATA.statements.BS;
    const liabilities = bs.filter((i) => i.category === 'LIABILITY');
    const assets = bs.filter((i) => i.category === 'ASSET');

    expect(liabilities.length).toBeGreaterThan(0);
    expect(assets.length).toBeGreaterThan(0);

    const netWorth = liabilities.find((i) => i.metricKey === 'NET_WORTH');
    expect(netWorth).toBeDefined();
    expect(netWorth?.isSummary).toBe(true);
  });
});
