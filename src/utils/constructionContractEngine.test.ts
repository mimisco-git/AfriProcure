import { describe, expect, it } from 'vitest';
import {
  calculateEotAndLiquidatedDamages,
  simulateApgAndRetentionSchedule,
  EotDelayEvent,
} from './constructionContractEngine';

const event = (overrides: Partial<EotDelayEvent>): EotDelayEvent => ({
  id: 'e',
  eventType: 'employer_delay',
  description: 'Late site possession',
  fidicClause: '2.1',
  daysClaimed: 30,
  daysApproved: 20,
  criticalPathImpact: true,
  contractorNotifiedWithin28Days: true,
  engineerDeterminationDate: '2026-01-01',
  ...overrides,
});

describe('EoT and liquidated damages', () => {
  it('grants only excusable, critical-path, properly notified days', () => {
    const r = calculateEotAndLiquidatedDamages({
      contractSum: 1_000_000,
      originalDurationDays: 365,
      actualCompletionDays: 365,
      delayEvents: [
        event({ id: '1', daysApproved: 20 }),
        event({ id: '2', daysApproved: 10, contractorNotifiedWithin28Days: false }), // time-barred
        event({ id: '3', daysApproved: 15, criticalPathImpact: false }),
        event({ id: '4', daysApproved: 40, eventType: 'contractor_delay' }),
        event({ id: '5', daysApproved: 5, eventType: 'force_majeure' }),
      ],
    });
    expect(r.authorizedEotDays).toBe(25);
    expect(r.extendedCompletionDays).toBe(390);
    expect(r.totalDaysClaimed).toBe(150);
    expect(r.totalLiquidatedDamages).toBe(0);
  });

  it('charges LDs per culpable day at the configured rate', () => {
    const r = calculateEotAndLiquidatedDamages({
      contractSum: 1_000_000,
      originalDurationDays: 100,
      actualCompletionDays: 130,
      delayEvents: [],
      dailyLdRatePct: 0.2,
      maxLdCapPct: 10,
    });
    expect(r.contractorCulpableDelayDays).toBe(30);
    expect(r.totalLiquidatedDamages).toBeCloseTo(60_000);
    expect(r.isLdCapReached).toBe(false);
    expect(r.statutorySummary).toContain('0.2%/day');
  });

  it('caps LDs at the maximum percentage of contract sum', () => {
    const r = calculateEotAndLiquidatedDamages({
      contractSum: 1_000_000,
      originalDurationDays: 100,
      actualCompletionDays: 400,
      delayEvents: [],
      currency: 'USD',
    });
    expect(r.totalLiquidatedDamages).toBe(100_000);
    expect(r.isLdCapReached).toBe(true);
    expect(r.statutorySummary).toContain('$');
    expect(r.statutorySummary).not.toContain('₦');
  });
});

describe('advance payment and retention', () => {
  it('fully recovers the advance and retains the configured share', () => {
    const r = simulateApgAndRetentionSchedule({ contractSum: 10_000_000 });
    expect(r.advancePaymentAmount).toBe(1_500_000);
    expect(r.isAdvanceFullyRecovered).toBe(true);
    expect(r.totalAdvanceRecovered).toBeCloseTo(1_500_000);
    const retention = r.schedule.reduce((a, s) => a + s.retentionDeductionThisIpc, 0);
    expect(retention).toBeCloseTo(500_000);
    expect(r.firstPhaseRetentionRelease + r.secondPhaseRetentionRelease).toBeCloseTo(retention);
  });

  it('does not deduct before the recovery threshold is reached', () => {
    const r = simulateApgAndRetentionSchedule({ contractSum: 10_000_000, recoveryStartPct: 20 });
    // first IPC is 8% of contract, below the 20% threshold
    expect(r.schedule[0].advanceDeductionThisIpc).toBe(0);
    expect(r.schedule[1].advanceDeductionThisIpc).toBeGreaterThan(0);
  });

  it('reconciles each IPC: net = gross − advance − retention', () => {
    const r = simulateApgAndRetentionSchedule({ contractSum: 5_000_000 });
    for (const s of r.schedule) {
      expect(s.netPaymentToContractor).toBeCloseTo(s.workDoneGross - s.advanceDeductionThisIpc - s.retentionDeductionThisIpc);
    }
  });

  it('handles a zero contract sum without NaN', () => {
    const r = simulateApgAndRetentionSchedule({ contractSum: 0 });
    for (const s of r.schedule) expect(Number.isFinite(s.cumulativePctOfContract)).toBe(true);
  });
});
