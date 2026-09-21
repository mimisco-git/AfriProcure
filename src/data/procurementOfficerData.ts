import { ContractSecurity, VariationOrder, OAuGfAuditQuery, TraditionalCostItem } from '../types';

export const DEFAULT_CONTRACT_SECURITIES: ContractSecurity[] = [
  {
    id: 'sec-apg-01',
    securityType: 'advance_payment',
    title: 'Advance Payment Guarantee (APG) - 15% Mobilization Advance',
    issuingBank: 'Zenith Bank Plc, Central Business District Branch, Abuja',
    guaranteeReference: 'ZBL/ABJ/APG/2024/0982-FED',
    originalAmount: 2175000000, // 15% of ₦14.5 Billion = ₦2.175B
    recoveredAmount: 1141875000, // 52.5% recovered through IPC #01 to #04
    issuanceDate: '2024-03-15',
    expiryDate: '2025-06-30', // Approaching expiry window
    daysToExpiry: 28, // Critical threshold (< 30 days)
    status: 'critical',
    statutoryClause: 'PPA 2007 Section 35(1) & (3) - Unconditional bank guarantee from approved commercial bank; mandatory pro-rata amortization prior to contract completion.',
    notes: 'Urgent notice required: Amortization lags behind original schedule due to rainy season delays. Contractor must obtain 6-month extension from Zenith Bank or face formal invocation.',
  },
  {
    id: 'sec-perf-01',
    securityType: 'performance_bond',
    title: 'Performance Security / Bond (10% of Contract Sum)',
    issuingBank: 'First Bank of Nigeria Limited, Corporate Banking Directorate, Lagos',
    guaranteeReference: 'FBN/CBD/PB/2024/7741',
    originalAmount: 1450000000, // 10% of ₦14.5 Billion = ₦1.450B
    recoveredAmount: 0,
    issuanceDate: '2024-02-28',
    expiryDate: '2026-04-30', // Valid through substantial completion + 28 days
    daysToExpiry: 340,
    status: 'compliant',
    statutoryClause: 'PPA 2007 Section 36(1) & FIDIC Sub-Clause 4.2 - Unconditional on-demand bond maintained until issuance of Taking-Over Certificate (TOC).',
    notes: 'Performance security is verified valid with First Bank Head Office. Confirmed irrevocable and payable on first written demand.',
  },
  {
    id: 'sec-ret-01',
    securityType: 'retention_bond',
    title: 'Retention Guarantee / Defects Liability Security (5%)',
    issuingBank: 'Access Bank Plc, Garki Area 3, Abuja',
    guaranteeReference: 'ACC/GAR/RB/2024/0038',
    originalAmount: 725000000, // 5% of ₦14.5 Billion = ₦725M
    recoveredAmount: 0,
    issuanceDate: '2024-03-20',
    expiryDate: '2027-05-30', // Covers construction period + 12 months Defects Liability Period (DLP)
    daysToExpiry: 620,
    status: 'compliant',
    statutoryClause: 'FIDIC Sub-Clause 14.9 & Standard Conditions of Contract - Retention released in two equal moieties (50% at Taking Over, 50% at Performance Certificate).',
    notes: 'Active and verified against Central Bank of Nigeria approved list of deposit money banks.',
  },
];

export const DEFAULT_VARIATION_ORDERS: VariationOrder[] = [
  {
    id: 'vo-001',
    voNumber: 'VO No. 01',
    title: 'Subgrade Stabilization & Replacement of Expansive Black Cotton Soil (Km 14+200 to 18+800)',
    description: 'Encountered unexpected plastic expansive clay subgrade requiring deep excavation, geotextile membrane placement, and imported crushed rock capping layer to achieve CBR > 30%.',
    approvedAmount: 540000000, // ₦540M (3.72% of contract sum)
    approvalDate: '2024-08-14',
    approvingAuthority: 'Ministerial Tenders Board (MTB)',
    bppNoObjectionRef: 'BPP/S.1/FED-WORKS/VO/2024/082',
    category: 'subgrade_realignment',
    timeExtensionDays: 45,
    status: 'approved',
  },
  {
    id: 'vo-002',
    voNumber: 'VO No. 02',
    title: 'Hydraulic Capacity Augmentation & Triple 3.0m x 3.0m Reinforced Concrete Box Culvert (Ch 22+450)',
    description: 'Post-award hydrological storm-event modeling revealed unprecedented 50-year flood discharge volume, necessitating replacement of original twin 1.2m pipe culverts with triple 3.0m box culvert and training dykes.',
    approvedAmount: 410000000, // ₦410M (2.83% of contract sum)
    approvalDate: '2024-11-20',
    approvingAuthority: 'Ministerial Tenders Board (MTB)',
    bppNoObjectionRef: 'BPP/S.1/FED-WORKS/VO/2024/114',
    category: 'bridge_hydraulics',
    timeExtensionDays: 30,
    status: 'approved',
  },
  {
    id: 'vo-003',
    voNumber: 'VO No. 03',
    title: 'Asphalt Binder Course Strengthening from 60mm to 80mm Dense Bituminous Macadam (Heavy Axle Haulage)',
    description: 'Re-classification of roadway freight volume following opening of adjacent Inland Dry Port; increased expected Equivalent Standard Axles (ESAs) requiring revised structural pavement thickness.',
    approvedAmount: 330000000, // ₦330M (2.28% of contract sum)
    approvalDate: '2025-02-18',
    approvingAuthority: 'Ministerial Tenders Board (MTB)',
    bppNoObjectionRef: 'BPP/S.1/FED-WORKS/VO/2025/022',
    category: 'pavement_strengthening',
    timeExtensionDays: 20,
    status: 'approved',
  },
];

export const DEFAULT_OAUGF_AUDIT_QUERIES: OAuGfAuditQuery[] = [
  {
    id: 'query-cpa-01',
    queryRef: 'OAuGF/PPA/2026/FMW-04/AUD',
    title: 'Payment of Fluctuation on Contract (CPA) Without Annual Re-Tendering',
    auditFinding: 'Audit inspection of payment vouchers revealed total disbursement of price adjustment/fluctuation exceeding ₦1.85 Billion on Contract FED/FMW/2024/HWAY-08. Auditor observed that this payment is not in the original Bills of Quantities and queries why fresh competitive tenders were not invited.',
    allegedLossOrIrregularity: 1852000000,
    statutoryDefense: 'The payments were executed strictly pursuant to Public Procurement Act 2007 Section 39 and FIDIC Sub-Clause 13.8 (Adjustment for Changes in Cost). The CPA formula, non-adjustable coefficient (a0 = 0.15), and component weightings were legally incorporated into the tender documents and approved by the Federal Executive Council at award. Escalation indices are independently published by the National Bureau of Statistics (NBS) and Central Bank of Nigeria (CBN). Fluctuation under an indexed formula is a contractual reimbursement of hyperinflation, not a scope variation under Section 38.',
    ppaCitations: ['PPA 2007 Section 39 (Contract Price Adjustment)', 'PPA 2007 Section 16(1)(b) (Budgetary Allocation)', 'Financial Regulation 3106'],
    fidicCitations: ['FIDIC Sub-Clause 13.8 (Adjustments for Changes in Cost)', 'FIDIC Sub-Clause 14.3 (Application for Interim Payment Certificates)'],
    exhibits: [
      'Original Tender Document (Vol. 1, Particular Conditions of Contract Clause 13.8)',
      'Federal Executive Council Approval Extract EC(2024)88',
      'Bureau of Public Procurement (BPP) Certificate of "No Objection" Ref BPP/S.1/2024/741',
      'National Bureau of Statistics (NBS) Monthly CPI Gazette Vol. 31',
    ],
    status: 'rebuttal_submitted',
  },
  {
    id: 'query-apg-02',
    queryRef: 'OAuGF/PPA/2026/FMW-05/AUD',
    title: 'Risk of Public Funds Exposure Due to Near-Expiration of Mobilization Guarantee',
    auditFinding: 'Audit team observed that Advance Payment Guarantee ZBL/ABJ/APG/2024/0982 in the sum of ₦2,175,000,000 issued by Zenith Bank Plc has an unrecovered balance of ₦1,033,125,000 while the guarantee expires in under 30 days without evidential renewal on file.',
    allegedLossOrIrregularity: 1033125000,
    statutoryDefense: 'Management has actively enforced monthly pro-rata deductions of 15% from all Interim Payment Certificates #01 to #04, recovering ₦1,141,875,000 to date. In accordance with PPA 2007 Section 35(3), a formal statutory invocation letter (Ref: FMW/HQ/PROC/APG/2025/11) was served upon Zenith Bank Plc on 15th September 2026 instructing the bank to either furnish a 180-day guarantee extension rider or credit the Federal Government TSA Account within 14 business days. Treasury Single Account funds remain fully protected.',
    ppaCitations: ['PPA 2007 Section 35 (Advance Payment & Guarantees)', 'Financial Regulation 3118 (Release and Recovery of Mobilization Advances)'],
    fidicCitations: ['FIDIC Sub-Clause 14.2 (Advance Payment Amortization and Guarantee Validity)'],
    exhibits: [
      'Treasury Single Account (TSA) Schedule of Recoveries against IPC #01 to #04',
      'Formal Letter of Demand to Zenith Bank Plc Managing Director',
      'Contractor Commitment Affidavit of Immediate Guarantee Extension',
    ],
    status: 'rebuttal_submitted',
  },
  {
    id: 'query-vo-03',
    queryRef: 'OAuGF/PPA/2026/FMW-06/AUD',
    title: 'Execution of Scope Variations (VO Nos 01-03) Without Presidential / FEC Direct Approval',
    auditFinding: 'Audit review of variation orders VO-01 (₦540M), VO-02 (₦410M), and VO-03 (₦330M) totaling ₦1.28 Billion indicated that approvals were granted by the Ministerial Tenders Board (MTB) rather than the Federal Executive Council (FEC).',
    allegedLossOrIrregularity: 1280000000,
    statutoryDefense: 'Under Bureau of Public Procurement (BPP) gazetted circular S.1/2025 on Procurement Thresholds, the Ministerial Tenders Board (MTB) has statutory approval authority for civil works variations up to ₦1.50 Billion, provided cumulative variations do not exceed 15% of the original contract sum. The cumulative value of VO Nos 01 to 03 is ₦1,280,000,000, which constitutes 8.83% of the contract sum of ₦14,500,000,000. All three variations received individual BPP Prior Review Concurrence Certificates. The approval strictly conformed to statutory threshold limits.',
    ppaCitations: ['PPA 2007 Section 17 (Approving Authorities)', 'PPA 2007 Section 38 (Variations and Threshold Restrictions)'],
    fidicCitations: ['FIDIC Sub-Clause 13.1 (Right to Vary) and Sub-Clause 13.3 (Variation Procedure)'],
    exhibits: [
      'Ministerial Tenders Board (MTB) Meeting Minutes Extract (64th & 67th Sessions)',
      'BPP Concurrence Letters BPP/S.1/FED-WORKS/VO/2024/082, 114, 022',
      'Engineer Comprehensive Geotechnical and Hydrological Site Investigation Reports',
    ],
    status: 'cleared',
  },
];

export const DEFAULT_TRADITIONAL_COST_ITEMS: TraditionalCostItem[] = [
  {
    id: 'trad-01',
    item: 'Dangote 42.5R Portland Cement (50kg bag)',
    quantity: 48000,
    unit: 'Bags',
    baseRate: 4200, // at award date
    currentInvoiceRate: 9800, // verified supplier delivery invoices
    baseAmount: 201600000,
    currentAmount: 470400000,
    actualFluctuation: 268800000,
    invoiceRef: 'INV-DANGOTE-2024-8841',
  },
  {
    id: 'trad-02',
    item: 'High-Tensile Deformed Rebars 16mm/20mm Fe 500',
    quantity: 650,
    unit: 'Metric Tonnes',
    baseRate: 750000,
    currentInvoiceRate: 1450000,
    baseAmount: 487500000,
    currentAmount: 942500000,
    actualFluctuation: 455000000,
    invoiceRef: 'INV-AFRICASTEEL-OCT-102',
  },
  {
    id: 'trad-03',
    item: 'Automotive Gas Oil (AGO Diesel for Plant & Equipment)',
    quantity: 280000,
    unit: 'Litres',
    baseRate: 780,
    currentInvoiceRate: 1350,
    baseAmount: 218400000,
    currentAmount: 378000000,
    actualFluctuation: 159600000,
    invoiceRef: 'INV-TOTALENERGIES-TSA-449',
  },
  {
    id: 'trad-04',
    item: 'Straight-Run Bitumen Penetration Grade 60/70',
    quantity: 420,
    unit: 'Metric Tonnes',
    baseRate: 850000,
    currentInvoiceRate: 1680000,
    baseAmount: 357000000,
    currentAmount: 705600000,
    actualFluctuation: 348600000,
    invoiceRef: 'INV-NNPCL-KADUNA-BT-09',
  },
];
