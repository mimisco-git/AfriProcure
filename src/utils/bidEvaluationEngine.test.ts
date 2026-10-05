import { describe, expect, it } from 'vitest';
import {
  evaluateBids,
  WORKED_EXAMPLE_ITEMS,
  WORKED_EXAMPLE_QUOTATIONS,
  SOLAR_EXAMPLE_ITEMS,
  SOLAR_EXAMPLE_QUOTATIONS,
  HIGHWAY_EXAMPLE_ITEMS,
  HIGHWAY_EXAMPLE_QUOTATIONS,
} from './bidEvaluationEngine';
import { RequisitionItem, SupplierQuotation } from '../types';

const items: RequisitionItem[] = [
  { id: 'r1', name: 'Cement', specification: '42.5R', unit: 'bags', quantity: 100, budgetBenchmarkPrice: 10_000 },
  { id: 'r2', name: 'Rebar', specification: 'Y16', unit: 'tons', quantity: 10, budgetBenchmarkPrice: 1_000_000 },
];

let seq = 0;
const quote = (overrides: Partial<SupplierQuotation> = {}): SupplierQuotation => {
  seq += 1;
  const lines = [
    { id: `l${seq}a`, name: 'Cement', specification: '42.5R', unit: 'bags', quantity: 100, unitPrice: 10_000, amount: 1_000_000, matchReqItemId: 'r1' },
    { id: `l${seq}b`, name: 'Rebar', specification: 'Y16', unit: 'tons', quantity: 10, unitPrice: 1_000_000, amount: 10_000_000, matchReqItemId: 'r2' },
  ];
  return {
    id: `q${seq}`,
    supplierName: `Supplier ${seq} Ltd`,
    address: `${seq} Unique Street, District ${seq}, Abuja FCT`,
    phone: `0800000000${seq}`,
    email: `bids${seq}@supplier${seq}.ng`,
    rcNumber: `RC${seq}`,
    tin: `TIN-0000${seq}`,
    bank: { bankName: 'Bank', accountNumber: `10000000${seq}`, accountName: `Supplier ${seq} Ltd` },
    signatory: `Director Number${'abcdefghij'[seq % 10]}${seq}`,
    quoteRef: `Q${seq}`,
    quoteDate: '2026-09-01',
    validity: '90 days',
    deliveryPeriod: '14 days',
    paymentTerms: '100% on delivery',
    warranty: '12 months',
    currency: 'NGN',
    vat: { isInclusive: false, rate: 7.5 },
    subtotal: 11_000_000,
    total: 11_000_000,
    items: lines,
    notes: [],
    ...overrides,
  };
};

describe('evaluateBids: sample datasets', () => {
  it.each([
    ['worked example', WORKED_EXAMPLE_ITEMS, WORKED_EXAMPLE_QUOTATIONS],
    ['solar', SOLAR_EXAMPLE_ITEMS, SOLAR_EXAMPLE_QUOTATIONS],
    ['highway', HIGHWAY_EXAMPLE_ITEMS, HIGHWAY_EXAMPLE_QUOTATIONS],
  ])('%s: ranks are a permutation and the winner is the cheapest responsive bid', (_n, reqItems, quotes) => {
    const r = evaluateBids(reqItems, quotes, 'NGN');
    const ranks = r.suppliers.map((s) => s.rank).sort((a, b) => a - b);
    expect(ranks).toEqual(quotes.map((_, i) => i + 1));
    const responsive = r.suppliers.filter((s) => s.isResponsive);
    expect(r.responsiveBidsCount + r.nonResponsiveBidsCount).toBe(quotes.length);
    if (responsive.length > 0) {
      expect(r.winner?.evaluatedCost).toBe(Math.min(...responsive.map((s) => s.evaluatedCost)));
    }
    for (const s of r.suppliers) expect(Number.isFinite(s.evaluatedCost)).toBe(true);
  });
});

describe('evaluateBids: VAT and arithmetic', () => {
  it('adds VAT to exclusive quotes to reach a common landed cost', () => {
    const r = evaluateBids(items, [quote()], 'NGN');
    expect(r.suppliers[0].evaluatedCost).toBe(11_825_000);
  });

  it('honours an arithmetic correction even when VAT is shown inclusive', () => {
    // Stated subtotal is overstated by ₦500k; stated gross total built on the wrong subtotal
    const q = quote({ subtotal: 11_500_000, total: 12_362_500, vat: { isInclusive: true, rate: 7.5, statedAmount: 862_500 } });
    const r = evaluateBids(items, [q], 'NGN', { applyArithmeticCorrections: true });
    expect(r.suppliers[0].lineSumDiscrepancy).toBe(true);
    expect(r.suppliers[0].evaluatedCost).toBe(11_825_000);
  });

  it('uses the stated inclusive total when the arithmetic is correct', () => {
    const q = quote({ total: 11_825_000, vat: { isInclusive: true, rate: 7.5, statedAmount: 825_000 } });
    expect(evaluateBids(items, [q], 'NGN').suppliers[0].evaluatedCost).toBe(11_825_000);
  });

  it('evaluates at net cost when the tender is VAT exempt', () => {
    expect(evaluateBids(items, [quote()], 'NGN', { vatExempt: true }).suppliers[0].evaluatedCost).toBe(11_000_000);
  });
});

describe('evaluateBids: responsiveness', () => {
  it('disqualifies on a failed mandatory eligibility criterion', () => {
    const r = evaluateBids(items, [quote({ eligibility: { taxClearance: false } })], 'NGN');
    expect(r.suppliers[0].isResponsive).toBe(false);
    expect(r.winner).toBeUndefined();
  });

  it('disqualifies incomplete bids by default, or loads the highest competing price', () => {
    const partial = quote();
    partial.items = partial.items.slice(0, 1);
    partial.subtotal = 1_000_000;
    const full = quote({ items: quote().items.map((it) => (it.matchReqItemId === 'r2' ? { ...it, unitPrice: 1_200_000, amount: 12_000_000 } : it)), subtotal: 13_000_000 });

    expect(evaluateBids(items, [partial, full], 'NGN').suppliers.find((s) => s.quotation.id === partial.id)!.isResponsive).toBe(false);

    const loaded = evaluateBids(items, [partial, full], 'NGN', { missingItemPolicy: 'load_highest_price', vatExempt: true });
    const p = loaded.suppliers.find((s) => s.quotation.id === partial.id)!;
    expect(p.isResponsive).toBe(true);
    expect(p.missingItemsLoadedCost).toBe(12_000_000);
  });

  it('converts foreign-currency competitor prices before loading missing items', () => {
    const partial = quote();
    partial.items = partial.items.slice(0, 1);
    partial.subtotal = 1_000_000;
    const usd = quote({
      currency: 'USD',
      exchangeRateToNgn: 1500,
      items: [
        { id: 'u1', name: 'Cement', specification: '', unit: 'bags', quantity: 100, unitPrice: 7, amount: 700, matchReqItemId: 'r1' },
        { id: 'u2', name: 'Rebar', specification: '', unit: 'tons', quantity: 10, unitPrice: 700, amount: 7000, matchReqItemId: 'r2' },
      ],
      subtotal: 7700,
      total: 7700,
    });
    const r = evaluateBids(items, [partial, usd], 'NGN', { missingItemPolicy: 'load_highest_price', vatExempt: true });
    const p = r.suppliers.find((s) => s.quotation.id === partial.id)!;
    // USD 700/ton × 1500 = ₦1,050,000/ton × 10 tons
    expect(p.missingItemsLoadedCost).toBe(10_500_000);
    expect(r.suppliers.find((s) => s.quotation.id === usd.id)!.evaluatedCost).toBe(7700 * 1500);
  });

  it('does not raise the RC/TIN query twice', () => {
    const r = evaluateBids(items, [quote({ rcNumber: '', tin: '' })], 'NGN');
    const q = r.suppliers[0].queries;
    expect(q.filter((x) => x.includes('RC registration')).length).toBe(1);
    expect(q.filter((x) => x.includes('TIN')).length).toBe(1);
  });

  it('blocks an expired calendar-date validity', () => {
    const r = evaluateBids(items, [quote({ validity: '2020-01-01' })], 'NGN');
    expect(r.suppliers[0].isResponsive).toBe(false);
  });

  it('ranks by combined score under QCBS', () => {
    const cheapWeak = quote({ technicalScore: 72 });
    const dearStrong = quote({
      technicalScore: 98,
      items: quote().items.map((it) => ({ ...it, unitPrice: it.unitPrice * 1.05, amount: it.amount * 1.05 })),
      subtotal: 11_550_000,
    });
    const r = evaluateBids(items, [cheapWeak, dearStrong], 'NGN', { evaluationMethod: 'qcbs', technicalWeight: 70, financialWeight: 30 });
    expect(r.winner?.quotation.id).toBe(dearStrong.id);
  });
});

describe('evaluateBids: collusion', () => {
  it('flags shared phone, bank account and TIN', () => {
    const a = quote();
    const b = quote({ phone: a.phone, tin: a.tin, bank: { ...a.bank, accountName: 'Supplier X Ltd', accountNumber: a.bank.accountNumber } });
    const types = evaluateBids(items, [a, b], 'NGN').collusionFlags.map((f) => f.type);
    expect(types).toEqual(expect.arrayContaining(['phone', 'tin', 'bank_account']));
  });

  it('formats narrative amounts in the evaluation currency', () => {
    const r = evaluateBids(items, [quote({ currency: 'USD' })], 'USD');
    expect(r.narrative).toContain('$');
    expect(r.narrative).not.toContain('₦');
  });
});
