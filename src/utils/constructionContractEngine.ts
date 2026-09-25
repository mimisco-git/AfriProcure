/**
 * Construction Contract & Forensic Cost Engineering Suite
 * 
 * Statutory & Standard Form References:
 * - FIDIC Red Book 1999 / 2017:
 *   * Clause 8.4: Extension of Time for Completion (EOT)
 *   * Clause 8.7: Delay Damages / Liquidated Damages (LD)
 *   * Clause 14.2: Advance Payment & Recovery Amortization
 *   * Clause 14.3 & 14.9: Retention Money Deductions & Two-Stage Release
 * - Nigerian Public Procurement Act 2007:
 *   * Section 35: Advance Payment max 15% conditional upon Unconditional Bank Guarantee
 *   * Section 36: Performance Guarantee 10%
 *   * Section 37: Retention Money statutory protection
 */

export interface EotDelayEvent {
  id: string;
  eventType: 'employer_delay' | 'force_majeure' | 'contractor_delay' | 'exceptionally_adverse_climatic';
  description: string;
  fidicClause: string;
  daysClaimed: number;
  daysApproved: number;
  criticalPathImpact: boolean;
  contractorNotifiedWithin28Days: boolean;
  engineerDeterminationDate: string;
}

export interface EotCalculationResult {
  originalCompletionDays: number;
  extendedCompletionDays: number;
  totalDaysClaimed: number;
  authorizedEotDays: number;
  contractorCulpableDelayDays: number;
  dailyLdRate: number;
  dailyLdAmount: number;
  maxLdCapPct: number;
  maxLdCapAmount: number;
  totalLiquidatedDamages: number;
  isLdCapReached: boolean;
  statutorySummary: string;
}

export interface ApgAmortizationStep {
  ipcMonth: number;
  workDoneGross: number;
  cumulativeWorkDone: number;
  cumulativePctOfContract: number;
  advanceDeductionThisIpc: number;
  cumulativeAdvanceRecovered: number;
  unrecoveredAdvanceBalance: number;
  retentionDeductionThisIpc: number;
  cumulativeRetentionHeld: number;
  netPaymentToContractor: number;
}

export interface ApgRetentionSimulationResult {
  contractSum: number;
  advancePaymentRatePct: number;
  advancePaymentAmount: number;
  retentionRatePct: number;
  totalRetentionExpected: number;
  recoveryStartPct: number;
  recoveryRatePct: number;
  firstPhaseRetentionRelease: number;
  secondPhaseRetentionRelease: number;
  schedule: ApgAmortizationStep[];
  totalAdvanceRecovered: number;
  isAdvanceFullyRecovered: boolean;
}

/**
 * Calculate FIDIC 8.4 Extension of Time (EOT) and Clause 8.7 Liquidated Damages
 */
export function calculateEotAndLiquidatedDamages(params: {
  contractSum: number;
  originalDurationDays: number;
  delayEvents: EotDelayEvent[];
  actualCompletionDays: number;
  dailyLdRatePct?: number; // default 0.1% per calendar day
  maxLdCapPct?: number;    // default 10% or 15% statutory cap
}): EotCalculationResult {
  const {
    contractSum,
    originalDurationDays,
    delayEvents,
    actualCompletionDays,
    dailyLdRatePct = 0.1,
    maxLdCapPct = 10,
  } = params;

  // Filter approved compensable or excusable days that impact critical path
  // and complied with the strict 28-day notice rule under FIDIC 20.1
  const authorizedEotDays = delayEvents
    .filter((e) => (e.eventType === 'employer_delay' || e.eventType === 'force_majeure' || e.eventType === 'exceptionally_adverse_climatic') && e.criticalPathImpact && e.contractorNotifiedWithin28Days)
    .reduce((sum, e) => sum + e.daysApproved, 0);

  const totalDaysClaimed = delayEvents.reduce((sum, e) => sum + e.daysClaimed, 0);
  const extendedCompletionDays = originalDurationDays + authorizedEotDays;

  // Culpable delay is actual days minus extended completion days
  const contractorCulpableDelayDays = Math.max(0, actualCompletionDays - extendedCompletionDays);

  const dailyLdRate = dailyLdRatePct / 100;
  const dailyLdAmount = contractSum * dailyLdRate;
  const rawLdTotal = contractorCulpableDelayDays * dailyLdAmount;

  const maxLdCapAmount = contractSum * (maxLdCapPct / 100);
  const isLdCapReached = rawLdTotal >= maxLdCapAmount;
  const totalLiquidatedDamages = Math.min(rawLdTotal, maxLdCapAmount);

  let statutorySummary = '';
  if (contractorCulpableDelayDays === 0) {
    statutorySummary = `Project completed within authorized period (Original: ${originalDurationDays} days + Approved EOT: ${authorizedEotDays} days). Zero Liquidated Damages apply.`;
  } else if (isLdCapReached) {
    statutorySummary = `Contractor exceeded completion date by ${contractorCulpableDelayDays} unexcused days. Liquidated Damages capped at statutory maximum ceiling of ${maxLdCapPct}% of Contract Sum (₦${(maxLdCapAmount / 1_000_000).toFixed(2)}M). Under FIDIC Clause 15.2, Employer may now initiate contract termination for fundamental default.`;
  } else {
    statutorySummary = `Contractor culpable delay of ${contractorCulpableDelayDays} calendar days assessed at 0.1%/day. Total recoverable Delay Damages: ₦${(totalLiquidatedDamages / 1_000_000).toFixed(2)}M to be deducted from subsequent IPC or Performance Security under FIDIC Clause 8.7.`;
  }

  return {
    originalCompletionDays: originalDurationDays,
    extendedCompletionDays,
    totalDaysClaimed,
    authorizedEotDays,
    contractorCulpableDelayDays,
    dailyLdRate,
    dailyLdAmount,
    maxLdCapPct,
    maxLdCapAmount,
    totalLiquidatedDamages,
    isLdCapReached,
    statutorySummary,
  };
}

/**
 * Simulate Advance Payment Guarantee (APG) recovery amortization and Retention Money deductions
 * across Interim Payment Certificates (IPCs)
 */
export function simulateApgAndRetentionSchedule(params: {
  contractSum: number;
  advancePaymentRatePct?: number; // default 15% (PPA 2007 max)
  retentionRatePct?: number;      // default 5%
  monthlyGrossValuations?: number[];
  recoveryStartPct?: number;      // default 20% work certified
  recoveryRatePct?: number;       // default 25% of gross IPC valuation
}): ApgRetentionSimulationResult {
  const {
    contractSum,
    advancePaymentRatePct = 15,
    retentionRatePct = 5,
    recoveryStartPct = 20,
    recoveryRatePct = 25,
    monthlyGrossValuations = [
      contractSum * 0.08,
      contractSum * 0.12,
      contractSum * 0.15,
      contractSum * 0.18,
      contractSum * 0.17,
      contractSum * 0.15,
      contractSum * 0.10,
      contractSum * 0.05,
    ],
  } = params;

  const advancePaymentAmount = contractSum * (advancePaymentRatePct / 100);
  const totalRetentionExpected = contractSum * (retentionRatePct / 100);
  const recoveryStartThreshold = contractSum * (recoveryStartPct / 100);

  let cumulativeWorkDone = 0;
  let unrecoveredAdvanceBalance = advancePaymentAmount;
  let cumulativeAdvanceRecovered = 0;
  let cumulativeRetentionHeld = 0;

  const schedule: ApgAmortizationStep[] = [];

  monthlyGrossValuations.forEach((workDoneGross, index) => {
    cumulativeWorkDone += workDoneGross;
    const cumulativePctOfContract = (cumulativeWorkDone / contractSum) * 100;

    // Check if recovery has commenced (cumulative work > recoveryStartThreshold)
    let advanceDeductionThisIpc = 0;
    if (cumulativeWorkDone >= recoveryStartThreshold && unrecoveredAdvanceBalance > 0) {
      const theoreticalDeduction = workDoneGross * (recoveryRatePct / 100);
      advanceDeductionThisIpc = Math.min(theoreticalDeduction, unrecoveredAdvanceBalance);
    }

    cumulativeAdvanceRecovered += advanceDeductionThisIpc;
    unrecoveredAdvanceBalance = Math.max(0, unrecoveredAdvanceBalance - advanceDeductionThisIpc);

    // Retention money deduction (usually 5% or 10% of gross valuation)
    const retentionDeductionThisIpc = workDoneGross * (retentionRatePct / 100);
    cumulativeRetentionHeld += retentionDeductionThisIpc;

    const netPaymentToContractor = workDoneGross - advanceDeductionThisIpc - retentionDeductionThisIpc;

    schedule.push({
      ipcMonth: index + 1,
      workDoneGross,
      cumulativeWorkDone,
      cumulativePctOfContract,
      advanceDeductionThisIpc,
      cumulativeAdvanceRecovered,
      unrecoveredAdvanceBalance,
      retentionDeductionThisIpc,
      cumulativeRetentionHeld,
      netPaymentToContractor,
    });
  });

  return {
    contractSum,
    advancePaymentRatePct,
    advancePaymentAmount,
    retentionRatePct,
    totalRetentionExpected,
    recoveryStartPct,
    recoveryRatePct,
    firstPhaseRetentionRelease: cumulativeRetentionHeld * 0.5,
    secondPhaseRetentionRelease: cumulativeRetentionHeld * 0.5,
    schedule,
    totalAdvanceRecovered: cumulativeAdvanceRecovered,
    isAdvanceFullyRecovered: unrecoveredAdvanceBalance === 0,
  };
}

/**
 * Standard delay event presets for FIDIC 8.4 EOT claims
 */
export const DEFAULT_EOT_DELAY_EVENTS: EotDelayEvent[] = [
  {
    id: 'evt-01',
    eventType: 'employer_delay',
    description: 'Delayed Handover of Site Right-of-Way (ROW) at Ch 18+000 to 24+500 due to uncompensated land acquisition disputes.',
    fidicClause: 'Clause 2.1 (Right of Access to the Site)',
    daysClaimed: 45,
    daysApproved: 38,
    criticalPathImpact: true,
    contractorNotifiedWithin28Days: true,
    engineerDeterminationDate: '2025-04-18',
  },
  {
    id: 'evt-02',
    eventType: 'exceptionally_adverse_climatic',
    description: 'Catastrophic river surge flooding exceeding 50-year return period halting bridge abutment piling at River Oyi crossing.',
    fidicClause: 'Clause 8.4(c) (Exceptionally Adverse Climatic Conditions)',
    daysClaimed: 30,
    daysApproved: 22,
    criticalPathImpact: true,
    contractorNotifiedWithin28Days: true,
    engineerDeterminationDate: '2025-08-12',
  },
  {
    id: 'evt-03',
    eventType: 'employer_delay',
    description: 'Late issuance of Revised Bridge Pier Reinforcement Structural Drawings following geotechnical subsidence.',
    fidicClause: 'Clause 1.9 (Delayed Drawings or Instructions)',
    daysClaimed: 25,
    daysApproved: 20,
    criticalPathImpact: true,
    contractorNotifiedWithin28Days: true,
    engineerDeterminationDate: '2025-11-05',
  },
  {
    id: 'evt-04',
    eventType: 'contractor_delay',
    description: 'Breakdown of Asphalt Concrete Batching Plant and delayed procurement of imported bitutainer bitumen consignments.',
    fidicClause: 'Clause 8.6 (Rate of Progress - Contractor Default)',
    daysClaimed: 40,
    daysApproved: 0,
    criticalPathImpact: true,
    contractorNotifiedWithin28Days: false,
    engineerDeterminationDate: '2026-01-20',
  },
];
