import { describe, expect, it } from 'vitest';
import {
  calculateCpaMultiplier,
  calculateDelayedPaymentInterest,
  calculateDualTrancheCpa,
  calculateProlongationClaim,
  evaluateTenderBids,
  formatCurrency,
  formatFullCurrency,
  generateIpcSchedule,
  validateWeightSum,
} from './cpaMath';
import { DEFAULT_CONTRACT } from '../data/defaultData';
import { ContractProject, TenderBidder } from '../types';

describe('currency formatting', () => {
  it('abbreviates millions and billions', () => {
    expect(formatCurrency(1_500_000, 'NGN')).toBe('₦1.50M');
    expect(formatCurrency(2_250_000_000, 'USD')).toBe('$2.25B');
    expect(formatCurrency(999.5, 'GHS')).toBe('GH₵999.50');
  });

  it('puts the sign before the symbol for negative amounts', () => {
    expect(formatCurrency(-1_000_000, 'NGN')).toBe('-₦1.00M');
    expect(formatFullCurrency(-1234.6, 'NGN')).toBe('-₦1,235');
  });

  it('never prints NaN or Infinity', () => {
    expect(formatCurrency(NaN)).toBe('₦—');
    expect(formatFullCurrency(Infinity, 'USD')).toBe('$—');
  });
});

describe('CPA multiplier (FIDIC 13.8)', () => {
  it('returns exactly 1.0 when no index has moved', () => {
    const comps = [
      { weight: 0.4, baseValue: 100, currentValue: 100 },
      { weight: 0.45, baseValue: 50, currentValue: 50 },
    ];
    expect(calculateCpaMultiplier(0.15, comps)).toBeCloseTo(1.0, 10);
  });

  it('applies Pn = a + Σ w·(In/Io)', () => {
    const comps = [
      { weight: 0.5, baseValue: 100, currentValue: 120 }, // 0.6
      { weight: 0.35, baseValue: 200, currentValue: 300 }, // 0.525
    ];
    expect(calculateCpaMultiplier(0.15, comps)).toBeCloseTo(0.15 + 0.6 + 0.525, 10);
  });

  it('ignores components with a zero base index instead of dividing by zero', () => {
    expect(calculateCpaMultiplier(0.15, [{ weight: 0.85, baseValue: 0, currentValue: 10 }])).toBe(0.15);
  });

  it('validates that weights sum to 1', () => {
    const comps = DEFAULT_CONTRACT.components;
    expect(validateWeightSum(DEFAULT_CONTRACT.nonAdjustableFactor, comps).isValid).toBe(true);
    expect(validateWeightSum(0.5, comps).isValid).toBe(false);
  });
});

describe('IPC schedule', () => {
  const schedule = generateIpcSchedule(DEFAULT_CONTRACT);

  it('produces one certificate per contract month', () => {
    expect(schedule).toHaveLength(Math.floor(DEFAULT_CONTRACT.durationMonths));
  });

  it('recovers exactly the advance payment, never more', () => {
    const recovered = schedule.reduce((acc, m) => acc + m.advancePaymentDeduction, 0);
    const expected = DEFAULT_CONTRACT.contractSumInitial * DEFAULT_CONTRACT.advancePaymentRate;
    expect(recovered).toBeLessThanOrEqual(expected + 1e-6);
    if (DEFAULT_CONTRACT.advancePaymentRecoveryStartMonth + DEFAULT_CONTRACT.advancePaymentRecoveryMonths - 1 <= DEFAULT_CONTRACT.durationMonths) {
      expect(recovered).toBeCloseTo(expected, 2);
    }
  });

  it('reconciles net payable = adjusted gross − deductions on every row', () => {
    for (const row of schedule) {
      const net = row.adjustedGrossValue - row.advancePaymentDeduction - row.retentionDeduction - row.whtDeduction;
      expect(row.netPayableToContractor).toBeCloseTo(net, 4);
      expect(row.escalationAmount).toBeCloseTo(row.adjustedGrossValue - row.grossBillOfQuantities, 4);
    }
  });

  it('month 1 has no escalation because indices start at base', () => {
    expect(schedule[0].priceAdjustmentMultiplier).toBeCloseTo(
      DEFAULT_CONTRACT.nonAdjustableFactor + DEFAULT_CONTRACT.components.reduce((a, c) => a + c.weight, 0),
      10
    );
  });

  it('returns an empty schedule for a zero-duration or zero-value contract', () => {
    expect(generateIpcSchedule({ ...DEFAULT_CONTRACT, durationMonths: 0 })).toEqual([]);
    expect(generateIpcSchedule({ ...DEFAULT_CONTRACT, contractSumInitial: 0 })).toEqual([]);
  });

  it('does not produce NaN when the whole price is non-adjustable', () => {
    const fixed: ContractProject = { ...DEFAULT_CONTRACT, nonAdjustableFactor: 1, components: [] };
    for (const row of generateIpcSchedule(fixed)) {
      expect(Number.isFinite(row.contractorMarginWithCPA)).toBe(true);
    }
  });
});

describe('tender audit', () => {
  const bidder = (id: string, bidAmount: number, extra: Partial<TenderBidder> = {}): TenderBidder => ({
    id,
    companyName: `Co ${id}`,
    rcNumber: `RC${id}`,
    bidAmount,
    technicalScore: 85,
    isDomesticContractor: false,
    completionTimeWeeks: 52,
    bidSecurityVerified: true,
    taxClearanceVerified: true,
    pencomComplianceVerified: true,
    itfComplianceVerified: true,
    ...extra,
  });

  it('computes the median for even and odd bidder counts', () => {
    expect(evaluateTenderBids(100, [bidder('a', 90), bidder('b', 100), bidder('c', 130)]).medianBid).toBe(100);
    expect(evaluateTenderBids(100, [bidder('a', 90), bidder('b', 110)]).medianBid).toBe(100);
  });

  it('flags abnormally low tenders and excludes them from the award', () => {
    const r = evaluateTenderBids(1000, [bidder('low', 700), bidder('mid', 980), bidder('hi', 1020)]);
    const low = r.bidders.find((b) => b.bidder.id === 'low')!;
    expect(low.isAbnormallyLow).toBe(true);
    expect(low.rank).toBe(99);
    expect(r.recommendedWinner).toBe('Co mid');
  });

  it('applies the 7.5% domestic preference when ranking', () => {
    const r = evaluateTenderBids(1000, [
      bidder('foreign', 960),
      bidder('domestic', 1000, { isDomesticContractor: true }), // evaluated at 925
    ]);
    expect(r.recommendedWinner).toBe('Co domestic');
  });

  it('detects near-identical bids and shared beneficial owners', () => {
    const r = evaluateTenderBids(1000, [
      bidder('a', 1000, { beneficialOwnerCluster: 'X' }),
      bidder('b', 1003, { beneficialOwnerCluster: 'X' }),
    ]);
    expect(r.clusterWarnings.some((w) => w.startsWith('Collusion Alert'))).toBe(true);
    expect(r.clusterWarnings.some((w) => w.startsWith('Beneficial Ownership Alert'))).toBe(true);
  });

  it('uses the requested currency in the award remark', () => {
    const r = evaluateTenderBids(1_000_000, [bidder('a', 1_000_000)], 'KES');
    expect(r.auditRemarks).toContain('KSh 1.00M');
  });

  it('survives a zero engineer estimate without NaN', () => {
    const r = evaluateTenderBids(0, [bidder('a', 100), bidder('b', 120)]);
    for (const b of r.bidders) expect(Number.isFinite(b.varianceFromEstimatePct)).toBe(true);
  });
});

describe('claims', () => {
  it('compounds late-payment interest monthly at MPR + spread', () => {
    const r = calculateDelayedPaymentInterest(1_000_000, 60, 0.24, 0.0);
    expect(r.totalPayableWithInterest).toBeCloseTo(1_000_000 * 1.02 ** 2, 4);
    expect(calculateDelayedPaymentInterest(1_000_000, 0).interestAmount).toBe(0);
  });

  it('sums prolongation heads of claim', () => {
    expect(calculateProlongationClaim(10, 100, 50, 25).totalClaim).toBe(1750);
  });

  it('blends local and foreign tranches', () => {
    const r = calculateDualTrancheCpa(1.2, 0.6, 0.4, 1000, 1500, 1.0);
    expect(r.foreignMultiplier).toBeCloseTo(1.5);
    expect(r.compositePn).toBeCloseTo(0.6 * 1.2 + 0.4 * 1.5);
    expect(r.fxDevaluationPct).toBeCloseTo(50);
  });
});
