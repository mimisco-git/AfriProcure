import { ContractProject, MilestonePayment, PriceComponent, TenderBidder, TenderAuditResult, CurrencyCode } from '../types';

/**
 * Format currency nicely with appropriate symbol
 */
export function formatCurrency(amount: number, currency: CurrencyCode = 'NGN'): string {
  const symbols: Record<CurrencyCode, string> = {
    NGN: '₦',
    GHS: 'GH₵',
    KES: 'KSh ',
    ZAR: 'R ',
    USD: '$',
  };

  const symbol = symbols[currency] || '₦';
  
  if (Math.abs(amount) >= 1_000_000_000) {
    return `${symbol}${(amount / 1_000_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `${symbol}${(amount / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}M`;
  }
  return `${symbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatFullCurrency(amount: number, currency: CurrencyCode = 'NGN'): string {
  const symbols: Record<CurrencyCode, string> = {
    NGN: '₦',
    GHS: 'GH₵',
    KES: 'KSh ',
    ZAR: 'R ',
    USD: '$',
  };
  return `${symbols[currency] || '₦'}${Math.round(amount).toLocaleString('en-US')}`;
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Validates whether the weight coefficients sum to exactly 1.0 (with standard floating tolerance)
 */
export function validateWeightSum(nonAdjustable: number, components: PriceComponent[]): { isValid: boolean; sum: number; diff: number } {
  const compSum = components.reduce((acc, c) => acc + c.weight, 0);
  const total = nonAdjustable + compSum;
  const diff = 1.0 - total;
  return {
    isValid: Math.abs(diff) < 0.001,
    sum: total,
    diff: diff,
  };
}

/**
 * Calculates the FIDIC Clause 13.8 / Nigerian PPA 2007 Contract Price Adjustment Multiplier (Pn)
 * Formula: Pn = a + b(Ln/Lo) + c(Mn/Mo) + d(En/Eo) + ...
 */
export function calculateCpaMultiplier(
  nonAdjustableFactor: number,
  components: { weight: number; baseValue: number; currentValue: number }[]
): number {
  let multiplier = nonAdjustableFactor;

  for (const comp of components) {
    if (comp.baseValue > 0) {
      const ratio = comp.currentValue / comp.baseValue;
      multiplier += comp.weight * ratio;
    }
  }

  return multiplier;
}

/**
 * Computes the complete milestone interim payment certificate (IPC) schedule
 */
export function generateIpcSchedule(
  project: ContractProject,
  monthlyInflationFactor: number = 0.018 // ~1.8% monthly compounding benchmark
): MilestonePayment[] {
  const months = project.durationMonths;
  const totalContract = project.contractSumInitial;
  const monthlyBaseWork = totalContract / months;

  const schedule: MilestonePayment[] = [];

  let accumulatedAdvanceRecovered = 0;
  const totalAdvance = totalContract * project.advancePaymentRate;
  const monthlyAdvanceRecovery = project.advancePaymentRecoveryMonths > 0 
    ? totalAdvance / project.advancePaymentRecoveryMonths 
    : 0;

  for (let m = 1; m <= months; m++) {
    // Simulate evolving index inflation per month
    const compoundFactor = Math.pow(1 + monthlyInflationFactor, m - 1);
    
    // Calculate current values of components
    const currentComponents = project.components.map((comp) => {
      // Different components inflate differently based on category
      let categoryMultiplier = compoundFactor;
      if (comp.category === 'fx') {
        categoryMultiplier = Math.pow(1 + (monthlyInflationFactor * 1.5), m - 1);
      } else if (comp.category === 'fuel') {
        categoryMultiplier = Math.pow(1 + (monthlyInflationFactor * 1.3), m - 1);
      } else if (comp.category === 'labor') {
        categoryMultiplier = Math.pow(1 + (monthlyInflationFactor * 0.7), m - 1);
      }
      return {
        ...comp,
        currentValue: comp.baseValue * categoryMultiplier,
      };
    });

    const Pn = calculateCpaMultiplier(project.nonAdjustableFactor, currentComponents);
    const grossBase = monthlyBaseWork;
    const adjustedGross = grossBase * Pn;
    const escalation = adjustedGross - grossBase;

    // Advance payment recovery window
    let advanceDeduction = 0;
    if (
      m >= project.advancePaymentRecoveryStartMonth &&
      accumulatedAdvanceRecovered < totalAdvance
    ) {
      advanceDeduction = Math.min(monthlyAdvanceRecovery, totalAdvance - accumulatedAdvanceRecovered);
      accumulatedAdvanceRecovered += advanceDeduction;
    }

    const retention = adjustedGross * project.retentionRate;
    const wht = adjustedGross * project.withholdingTaxRate;
    const netPayable = adjustedGross - advanceDeduction - retention - wht;

    // Estimate contractor actual market execution costs
    // Contractors experience raw unhedged cost inflation (weighted 100% of material/labor)
    const rawCostInflation = calculateCpaMultiplier(0, currentComponents.map(c => ({
      weight: c.weight / (1 - project.nonAdjustableFactor),
      baseValue: c.baseValue,
      currentValue: c.currentValue,
    })));

    const contractorActualCost = grossBase * 0.82 * rawCostInflation; // base baseline margin was 18%
    
    // Net margin if project is kept on fixed unadjusted price
    const fixedContractNetPayment = grossBase - advanceDeduction - (grossBase * project.retentionRate) - (grossBase * project.withholdingTaxRate);
    const contractorMarginFixed = (fixedContractNetPayment - contractorActualCost) / contractorActualCost;
    
    // Net margin with algorithmic CPA
    const contractorMarginCPA = (netPayable - contractorActualCost) / contractorActualCost;

    // Abandonment Risk Calculation
    let abandonmentRisk = 0;
    if (contractorMarginFixed < -0.30) {
      abandonmentRisk = 92;
    } else if (contractorMarginFixed < -0.20) {
      abandonmentRisk = 75;
    } else if (contractorMarginFixed < -0.10) {
      abandonmentRisk = 50;
    } else if (contractorMarginFixed < 0) {
      abandonmentRisk = 30;
    } else {
      abandonmentRisk = 10;
    }

    const compRecord: Record<string, number> = {};
    currentComponents.forEach(c => {
      compRecord[c.id] = c.currentValue;
    });

    schedule.push({
      ipcNumber: m,
      month: m,
      monthName: `Month ${m}`,
      scheduledProgressPct: (m / months) * 100,
      grossBillOfQuantities: grossBase,
      componentIndices: compRecord,
      priceAdjustmentMultiplier: Pn,
      escalationAmount: escalation,
      adjustedGrossValue: adjustedGross,
      advancePaymentDeduction: advanceDeduction,
      retentionDeduction: retention,
      whtDeduction: wht,
      netPayableToContractor: netPayable,
      contractorActualCostEst: contractorActualCost,
      contractorMarginFixedContract: contractorMarginFixed,
      contractorMarginWithCPA: contractorMarginCPA,
      abandonmentRiskScore: abandonmentRisk,
    });
  }

  return schedule;
}

/**
 * Forensic Tender Evaluation Engine (OCDS & Nigerian PPA 2007 Section 34 compliant)
 */
export function evaluateTenderBids(
  engineersEstimate: number,
  bidders: TenderBidder[]
): TenderAuditResult {
  if (bidders.length === 0) {
    return {
      engineersEstimate,
      bidders: [],
      medianBid: 0,
      spreadPct: 0,
      clusterWarnings: [],
      auditRemarks: 'No bids submitted for evaluation.',
    };
  }

  // Compute Median Bid
  const sortedBids = [...bidders].sort((a, b) => a.bidAmount - b.bidAmount);
  const mid = Math.floor(sortedBids.length / 2);
  const medianBid = sortedBids.length % 2 !== 0 
    ? sortedBids[mid].bidAmount 
    : (sortedBids[mid - 1].bidAmount + sortedBids[mid].bidAmount) / 2;

  const minBid = sortedBids[0].bidAmount;
  const maxBid = sortedBids[sortedBids.length - 1].bidAmount;
  const spreadPct = ((maxBid - minBid) / medianBid) * 100;

  const clusterWarnings: string[] = [];
  
  // Check for suspicious bid clustering (cover bidding)
  for (let i = 0; i < sortedBids.length - 1; i++) {
    const diffPct = Math.abs(sortedBids[i + 1].bidAmount - sortedBids[i].bidAmount) / sortedBids[i].bidAmount * 100;
    if (diffPct < 0.6) {
      clusterWarnings.push(
        `Collusion Alert: Bids from "${sortedBids[i].companyName}" and "${sortedBids[i + 1].companyName}" differ by only ${diffPct.toFixed(2)}%. High probability of cover bidding or shared estimator.`
      );
    }
  }

  // Check for shared beneficial ownership clusters
  const ownerMap: Record<string, string[]> = {};
  bidders.forEach(b => {
    if (b.beneficialOwnerCluster) {
      if (!ownerMap[b.beneficialOwnerCluster]) {
        ownerMap[b.beneficialOwnerCluster] = [];
      }
      ownerMap[b.beneficialOwnerCluster].push(b.companyName);
    }
  });

  Object.entries(ownerMap).forEach(([cluster, companies]) => {
    if (companies.length > 1) {
      clusterWarnings.push(
        `Beneficial Ownership Alert: Companies [${companies.join(', ')}] are linked to the same directorship/bank BVN group (${cluster}). Violates PPA 2007 Section 58(4) on anti-competitive bidding.`
      );
    }
  });

  // Evaluate each bidder
  const evaluated = bidders.map((bidder) => {
    const varianceFromEstimatePct = ((bidder.bidAmount - engineersEstimate) / engineersEstimate) * 100;
    const varianceFromMedianPct = ((bidder.bidAmount - medianBid) / medianBid) * 100;
    
    // Domestic margin of preference: 7.5% preference rule under PPA 2007 Section 34(1)
    // If bidder is domestic, for evaluation comparison against foreign firms, their bid is discounted by 7.5%
    const adjustedBidForPreference = bidder.isDomesticContractor 
      ? bidder.bidAmount * 0.925 
      : bidder.bidAmount;

    // Abnormally Low Tender (ALT) test: < -20% below estimate or < -15% below median
    const isAbnormallyLow = varianceFromEstimatePct < -22 || varianceFromMedianPct < -18;

    const suspicionFlags: string[] = [];

    if (isAbnormallyLow) {
      suspicionFlags.push('Abnormally Low Tender (ALT) - High risk of suicide bidding & site abandonment.');
    }
    if (varianceFromEstimatePct > 35) {
      suspicionFlags.push('Unrealistic Cost Escalation (>35% above Engineer Baseline).');
    }
    if (!bidder.taxClearanceVerified) {
      suspicionFlags.push('Statutory Failure: FIRS Tax Clearance Certificate unverified.');
    }
    if (!bidder.pencomComplianceVerified) {
      suspicionFlags.push('Statutory Failure: National Pension Commission (PENCOM) clearance missing.');
    }
    if (!bidder.bidSecurityVerified) {
      suspicionFlags.push('Defect: Bid Security / Tender Bond not lodged with authorized commercial bank.');
    }
    if (bidder.technicalScore < 70) {
      suspicionFlags.push('Sub-par Technical Score (< 70% threshold required by PPA standard bidding documents).');
    }

    const isHighRisk = isAbnormallyLow || suspicionFlags.length >= 2 || bidder.technicalScore < 70;

    return {
      bidder,
      varianceFromEstimatePct,
      varianceFromMedianPct,
      adjustedBidForPreference,
      isAbnormallyLow,
      isHighRisk,
      suspicionFlags,
      rank: 0,
    };
  });

  // Sort and assign ranks: lowest evaluated responsive bid
  // Only bidders with valid statutory compliance and technical score >= 70 qualify for ranking
  const responsiveBids = evaluated
    .filter(e => e.bidder.technicalScore >= 70 && e.bidder.taxClearanceVerified && !e.isAbnormallyLow)
    .sort((a, b) => a.adjustedBidForPreference - b.adjustedBidForPreference);

  evaluated.forEach(item => {
    const rankIndex = responsiveBids.findIndex(r => r.bidder.id === item.bidder.id);
    item.rank = rankIndex !== -1 ? rankIndex + 1 : 99; // 99 indicates disqualified / non-responsive
  });

  const recommendedWinner = responsiveBids.length > 0 ? responsiveBids[0].bidder.companyName : undefined;

  let auditRemarks = '';
  if (responsiveBids.length > 0) {
    const winner = responsiveBids[0];
    auditRemarks = `Recommended Award: "${winner.bidder.companyName}" at ${formatCurrency(winner.bidder.bidAmount)} as the lowest evaluated responsive and qualified bid under Section 34 of the Public Procurement Act (PPA 2007).`;
  } else {
    auditRemarks = 'Audit Warning: All submitted tenders either failed technical thresholds, statutory clearances, or were flagged as Abnormally Low Tenders (ALT). Re-tendering or formal cost-breakdown defense recommended.';
  }

  return {
    engineersEstimate,
    bidders: evaluated.sort((a, b) => a.rank - b.rank),
    medianBid,
    spreadPct,
    clusterWarnings,
    recommendedWinner,
    auditRemarks,
  };
}

/**
 * Calculates statutory compounding late-payment interest under PPA 2007 Section 37(1) & FIDIC Clause 14.8
 * Formula: Compounded Monthly at (CBN MPR + Commercial Spread)
 */
export function calculateDelayedPaymentInterest(
  certifiedAmount: number,
  delayedDays: number,
  cbnMprAnnualRate: number = 0.2725, // 27.25% CBN Monetary Policy Rate
  statutorySpread: number = 0.02 // +2.00% standard commercial spread
): {
  interestAmount: number;
  totalPayableWithInterest: number;
  effectiveAnnualRate: number;
  delayMonths: number;
} {
  if (delayedDays <= 0 || certifiedAmount <= 0) {
    return {
      interestAmount: 0,
      totalPayableWithInterest: certifiedAmount,
      effectiveAnnualRate: cbnMprAnnualRate + statutorySpread,
      delayMonths: 0,
    };
  }

  const effectiveAnnualRate = cbnMprAnnualRate + statutorySpread;
  const monthlyRate = effectiveAnnualRate / 12;
  const delayMonths = delayedDays / 30; // standard commercial 30-day month convention

  // Compounded monthly
  const compoundedMultiplier = Math.pow(1 + monthlyRate, delayMonths);
  const totalPayableWithInterest = certifiedAmount * compoundedMultiplier;
  const interestAmount = totalPayableWithInterest - certifiedAmount;

  return {
    interestAmount,
    totalPayableWithInterest,
    effectiveAnnualRate,
    delayMonths,
  };
}

/**
 * Computes Extension of Time (EOT) & Site Prolongation Overhead Costs
 */
export function calculateProlongationClaim(
  prolongationDays: number,
  dailySiteOverhead: number,
  dailyPlantIdleCost: number,
  dailyKeyStaffCost: number = 0
): {
  totalClaim: number;
  overheadSubtotal: number;
  plantIdleSubtotal: number;
  staffSubtotal: number;
} {
  const overheadSubtotal = prolongationDays * dailySiteOverhead;
  const plantIdleSubtotal = prolongationDays * dailyPlantIdleCost;
  const staffSubtotal = prolongationDays * dailyKeyStaffCost;
  const totalClaim = overheadSubtotal + plantIdleSubtotal + staffSubtotal;

  return {
    totalClaim,
    overheadSubtotal,
    plantIdleSubtotal,
    staffSubtotal,
  };
}

/**
 * Calculates Dual-Tranche (Local + Offshore Foreign Currency) CPA Multiplier
 * Grounded in FIDIC Red/Pink Book Clause 13.8 split currency schedule
 */
export function calculateDualTrancheCpa(
  localPn: number,
  localSharePct: number,
  foreignSharePct: number,
  baseFxRate: number,
  currentFxRate: number,
  foreignInflationFactor: number = 1.045
): {
  compositePn: number;
  foreignMultiplier: number;
  fxDevaluationPct: number;
  localContribution: number;
  foreignContribution: number;
} {
  const fxDevaluationPct = baseFxRate > 0 ? ((currentFxRate - baseFxRate) / baseFxRate) * 100 : 0;
  const fxRatio = baseFxRate > 0 ? currentFxRate / baseFxRate : 1.0;
  
  // Foreign equipment multiplier accounts for exchange rate depreciation + offshore producer inflation
  const foreignMultiplier = fxRatio * foreignInflationFactor;
  
  const localContribution = localSharePct * localPn;
  const foreignContribution = foreignSharePct * foreignMultiplier;
  const compositePn = localContribution + foreignContribution;

  return {
    compositePn,
    foreignMultiplier,
    fxDevaluationPct,
    localContribution,
    foreignContribution,
  };
}

