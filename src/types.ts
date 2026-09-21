export type CurrencyCode = 'NGN' | 'GHS' | 'KES' | 'ZAR' | 'USD';

export interface PriceComponent {
  id: string;
  name: string;
  symbol: string;
  category: 'labor' | 'material' | 'fuel' | 'equipment' | 'fx' | 'other';
  weight: number; // e.g. 0.25 (25%)
  sourceIndex: string; // e.g. "NBS CPI Construction Labour Index"
  unit: string;
  baseValue: number; // Io (at base date)
  currentValue: number; // In (at valuation date)
  sourceAgency: string; // e.g. "National Bureau of Statistics (NBS)"
}

export interface ContractProject {
  id: string;
  title: string;
  contractCode: string;
  procuringEntity: string; // e.g. "Federal Ministry of Works & Housing, Nigeria"
  contractorName: string;
  contractSumInitial: number;
  currency: CurrencyCode;
  awardDate: string;
  baseDate: string; // 28 days prior to bid opening
  durationMonths: number;
  nonAdjustableFactor: number; // a0 (fixed contractor overhead & profit, typically 0.10 - 0.20)
  components: PriceComponent[];
  advancePaymentRate: number; // e.g. 0.15 (15% per PPA 2007 Section 35)
  advancePaymentBankGuaranteeNo?: string; // Statutory Bank Guarantee Ref
  advancePaymentRecoveryStartMonth: number; // e.g. Month 3
  advancePaymentRecoveryMonths: number; // e.g. 6 months
  retentionRate: number; // e.g. 0.05 (5%)
  withholdingTaxRate: number; // e.g. 0.05 (5% WHT - FIRS)
  contractorFinancingCostAnnual: number; // e.g. 28% (CBN MPR + commercial spread)
  bppCertificateNo?: string; // BPP Certificate of No Objection Ref
  notes?: string;
  // Dual-Currency Tranche (FIDIC 13.8)
  dualCurrency?: DualTrancheConfig;
}

export interface DualTrancheConfig {
  enabled: boolean;
  localCurrency: CurrencyCode;
  localSharePct: number; // e.g. 0.65 (65%)
  foreignCurrency: 'USD' | 'EUR' | 'GBP';
  foreignSharePct: number; // e.g. 0.35 (35%)
  baseExchangeRate: number; // e.g. ₦1,250 / USD at base date
  currentExchangeRate: number; // e.g. ₦1,620 / USD at certification date
  foreignInflationFactor: number; // Offshore equipment CPI multiplier, e.g. 1.045
}

export interface StatutoryClaim {
  id: string;
  contractCode: string;
  claimType: 'delay_interest' | 'eot_prolongation' | 'suspension_demob';
  title: string;
  certifiedIpcAmount: number;
  ipcNumber: number;
  submissionDate: string;
  dueDate: string; // 60 days after submission under PPA Sec 37(1)
  paymentDate?: string;
  delayedDays: number;
  cbnMprRate: number; // Central Bank of Nigeria Monetary Policy Rate, e.g. 27.25%
  statutorySpread: number; // e.g. 2.0%
  compoundedInterest: number;
  eotDaysRequested?: number;
  eotDailySiteOverhead?: number;
  eotDailyPlantIdleCost?: number;
  eotTotalClaim?: number;
  statutoryGrounds: string;
  status: 'pending_mda' | 'disputed' | 'settled' | 'submitted_to_arbitration';
}

export interface BenchmarkMaterialPrice {
  id: string;
  name: string;
  category: 'cement' | 'steel' | 'fuel' | 'aggregates' | 'asphalt' | 'fx';
  unit: string;
  currentPrice: number;
  previousMonthPrice: number;
  baseYearPrice: number;
  oneYearChangePct: number;
  sourceAgency: string;
  volatilityRank: 'extreme' | 'high' | 'moderate';
  history: { date: string; price: number }[];
  targetComponentSymbol: string;
}

export interface BeneficialOwnershipRecord {
  id: string;
  companyName: string;
  rcNumber: string;
  directors: string[];
  ultimateBeneficialOwner: string;
  officeAddress: string;
  tinNumber: string;
  bankVerificationNumberCluster?: string;
  isDebarredByBpp: boolean;
  debarmentDetails?: string;
  sharedClusterId?: string;
}

export interface EarnedValuePoint {
  month: number;
  monthName: string;
  plannedValue: number; // PV (Cumulative budgeted work)
  earnedValue: number; // EV (Cumulative actual physical progress value)
  actualCost: number; // AC (Cumulative cost incurred)
  cpi: number; // Cost Performance Index (EV / AC)
  spi: number; // Schedule Performance Index (EV / PV)
  costVariance: number; // EV - AC
  scheduleVariance: number; // EV - PV
  estimateAtCompletion: number; // EAC = BAC / CPI
}

export interface MilestonePayment {
  ipcNumber: number;
  month: number;
  monthName: string;
  scheduledProgressPct: number;
  grossBillOfQuantities: number; // Unadjusted work done in this period
  componentIndices: Record<string, number>; // component id -> current value
  priceAdjustmentMultiplier: number; // Pn
  escalationAmount: number; // Additional or deducted amount
  adjustedGrossValue: number; // grossBillOfQuantities * Pn
  advancePaymentDeduction: number;
  retentionDeduction: number;
  whtDeduction: number;
  netPayableToContractor: number;
  contractorActualCostEst: number; // Real execution cost with market inflation
  contractorMarginFixedContract: number; // Profit/Loss % if paid strictly fixed
  contractorMarginWithCPA: number; // Profit/Loss % with CPA applied
  abandonmentRiskScore: number; // 0 to 100
}

export interface TenderBidder {
  id: string;
  companyName: string;
  rcNumber: string; // Corporate Affairs Commission (CAC) RC Number
  bidAmount: number;
  technicalScore: number; // 0 to 100
  isDomesticContractor: boolean;
  completionTimeWeeks: number;
  bidSecurityVerified: boolean;
  taxClearanceVerified: boolean;
  pencomComplianceVerified: boolean;
  itfComplianceVerified: boolean;
  beneficialOwnerCluster?: string; // Grouping for detecting front companies
}

export interface TenderAuditResult {
  engineersEstimate: number;
  bidders: {
    bidder: TenderBidder;
    varianceFromEstimatePct: number;
    varianceFromMedianPct: number;
    adjustedBidForPreference: number;
    isAbnormallyLow: boolean;
    isHighRisk: boolean;
    suspicionFlags: string[];
    rank: number;
  }[];
  medianBid: number;
  spreadPct: number;
  clusterWarnings: string[];
  recommendedWinner?: string;
  auditRemarks: string;
}

export interface MacroIndicator {
  id: string;
  name: string;
  country: string;
  currentRate: number;
  previousRate: number;
  unit: string;
  change12MonthsPct: number;
  lastUpdated: string;
  agency: string;
  category: 'fx' | 'inflation' | 'commodity' | 'labor' | 'energy';
}

export interface ContractSecurity {
  id: string;
  securityType: 'advance_payment' | 'performance_bond' | 'retention_bond';
  title: string;
  issuingBank: string;
  guaranteeReference: string;
  originalAmount: number;
  recoveredAmount: number;
  issuanceDate: string;
  expiryDate: string;
  daysToExpiry: number;
  status: 'compliant' | 'warning' | 'critical' | 'discharged';
  statutoryClause: string;
  notes: string;
}

export interface VariationOrder {
  id: string;
  voNumber: string;
  title: string;
  description: string;
  approvedAmount: number;
  approvalDate: string;
  approvingAuthority: string;
  bppNoObjectionRef: string;
  category: 'subgrade_realignment' | 'bridge_hydraulics' | 'pavement_strengthening' | 'traffic_management';
  timeExtensionDays: number;
  status: 'approved' | 'in_review_bpp' | 'draft';
}

export interface OAuGfAuditQuery {
  id: string;
  queryRef: string;
  title: string;
  auditFinding: string;
  allegedLossOrIrregularity: number;
  statutoryDefense: string;
  ppaCitations: string[];
  fidicCitations: string[];
  exhibits: string[];
  status: 'cleared' | 'rebuttal_submitted' | 'pac_scheduled';
}

export interface TraditionalCostItem {
  id: string;
  item: string;
  quantity: number;
  unit: string;
  baseRate: number;
  currentInvoiceRate: number;
  baseAmount: number;
  currentAmount: number;
  actualFluctuation: number;
  invoiceRef: string;
}
