import { ContractProject, MilestonePayment, TenderAuditResult, CurrencyCode, RequisitionItem, BidEvaluationResult } from '../types';
import { formatCurrency, formatFullCurrency } from './cpaMath';

function triggerCsvDownload(csvContent: string, fileName: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportIpcScheduleToCsv(project: ContractProject, schedule: MilestonePayment[], currency: CurrencyCode = 'NGN') {
  const headers = [
    'IPC No',
    'Month Name',
    'Progress (%)',
    'Gross Work Value (Base)',
    'CPA Multiplier (Pn)',
    'Escalation Adjustment Amount',
    'Adjusted Gross Valuation',
    'Advance Payment Recovery',
    'Retention Deduction (5%)',
    'Withholding Tax (5% FIRS)',
    'Net Payable to Contractor',
    'Contractor Margin (Fixed)',
    'Contractor Margin (CPA)',
    'Abandonment Risk Score'
  ];

  const rows = schedule.map((ipc) => [
    `IPC #${ipc.ipcNumber.toString().padStart(2, '0')}`,
    `"${ipc.monthName}"`,
    `${(ipc.scheduledProgressPct * 100).toFixed(1)}%`,
    Math.round(ipc.grossBillOfQuantities),
    ipc.priceAdjustmentMultiplier.toFixed(4),
    Math.round(ipc.escalationAmount),
    Math.round(ipc.adjustedGrossValue),
    Math.round(ipc.advancePaymentDeduction),
    Math.round(ipc.retentionDeduction),
    Math.round(ipc.whtDeduction),
    Math.round(ipc.netPayableToContractor),
    `${(ipc.contractorMarginFixedContract * 100).toFixed(1)}%`,
    `${(ipc.contractorMarginWithCPA * 100).toFixed(1)}%`,
    `${ipc.abandonmentRiskScore}%`
  ]);

  const csvContent = [
    `# AFRI-PROCURE ENTERPRISE - INTERIM PAYMENT CERTIFICATE SCHEDULE`,
    `# Project: "${project.title.replace(/"/g, '""')}"`,
    `# Contract Ref: ${project.contractCode}`,
    `# Procuring Entity: "${project.procuringEntity.replace(/"/g, '""')}"`,
    `# Contractor: "${project.contractorName.replace(/"/g, '""')}"`,
    `# Initial Contract Sum: ${formatFullCurrency(project.contractSumInitial, currency)}`,
    `# Statutory PPA 2007 Reference: Sections 35 & 39`,
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  triggerCsvDownload(csvContent, `IPC_Schedule_${project.contractCode.replace(/[\/\s]/g, '_')}.csv`);
}

export function exportCpaFormulaToCsv(project: ContractProject, currency: CurrencyCode = 'NGN') {
  const headers = [
    'Component Symbol',
    'Component Name',
    'Category',
    'Weight Coefficient',
    'Source Benchmark Index',
    'Reporting Agency',
    'Unit',
    'Base Value (Po)',
    'Current Value (Pn)',
    'Index Escalation Ratio (Pn/Po)',
    'Weighted Contribution to Multiplier'
  ];

  const rows = project.components.map((c) => {
    const ratio = c.baseValue > 0 ? c.currentValue / c.baseValue : 1.0;
    const contribution = c.weight * ratio;
    return [
      c.symbol,
      `"${c.name.replace(/"/g, '""')}"`,
      c.category,
      c.weight.toFixed(3),
      `"${c.sourceIndex.replace(/"/g, '""')}"`,
      `"${c.sourceAgency.replace(/"/g, '""')}"`,
      `"${c.unit}"`,
      c.baseValue,
      c.currentValue,
      ratio.toFixed(4),
      contribution.toFixed(4)
    ];
  });

  // Non-adjustable row
  const nonAdjRow = [
    'a0',
    'Non-Adjustable Fixed Contractor Margin & Overhead',
    'overhead',
    project.nonAdjustableFactor.toFixed(3),
    'Fixed Contractual Parameter',
    'Procuring Entity / PPA SCC',
    'Ratio',
    '1.0',
    '1.0',
    '1.0000',
    project.nonAdjustableFactor.toFixed(4)
  ];

  const csvContent = [
    `# AFRI-PROCURE ENTERPRISE - CPA MATHEMATICAL DERIVATION BREAKDOWN`,
    `# Contract: "${project.title.replace(/"/g, '""')}" (${project.contractCode})`,
    `# Formula: Pn = a + b(Ln/Lo) + c(Mn/Mo) + d(En/Eo) + ...`,
    `# Statutory Reference: Nigerian Public Procurement Act 2007 (Section 39) / FIDIC 13.8`,
    headers.join(','),
    nonAdjRow.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  triggerCsvDownload(csvContent, `CPA_Derivation_${project.contractCode.replace(/[\/\s]/g, '_')}.csv`);
}

export function exportTenderAuditToCsv(audit: TenderAuditResult, currency: CurrencyCode = 'NGN') {
  const headers = [
    'Rank',
    'Company Name',
    'RC Number',
    'Submitted Tender (NGN)',
    'Variance from Engineer Estimate (%)',
    'Technical Score (/100)',
    'Domestic Contractor?',
    'Evaluated Bid with Domestic Preference',
    'Abnormally Low Tender (ALT)?',
    'Statutory Tax Cleared?',
    'PENCOM Verified?',
    'ITF Cleared?',
    'Audit Flags / Suspicion Warnings'
  ];

  const rows = audit.bidders.map((b) => [
    b.rank === 99 ? 'Disqualified' : `#${b.rank}`,
    `"${b.bidder.companyName.replace(/"/g, '""')}"`,
    b.bidder.rcNumber,
    Math.round(b.bidder.bidAmount),
    `${b.varianceFromEstimatePct.toFixed(1)}%`,
    b.bidder.technicalScore,
    b.bidder.isDomesticContractor ? 'YES' : 'NO',
    Math.round(b.adjustedBidForPreference),
    b.isAbnormallyLow ? 'YES (ALT FLAG)' : 'NO',
    b.bidder.taxClearanceVerified ? 'YES' : 'FAILED',
    b.bidder.pencomComplianceVerified ? 'YES' : 'FAILED',
    b.bidder.itfComplianceVerified ? 'YES' : 'FAILED',
    `"${b.suspicionFlags.join('; ').replace(/"/g, '""')}"`
  ]);

  const csvContent = [
    `# AFRI-PROCURE TENDER EVALUATION BOARD REPORT`,
    `# Engineer's Baseline Estimate: ${formatFullCurrency(audit.engineersEstimate, currency)}`,
    `# Statutory Mandate: Public Procurement Act 2007 (Sections 31, 34, 58)`,
    `# Recommendation: "${audit.auditRemarks.replace(/"/g, '""')}"`,
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  triggerCsvDownload(csvContent, `Tender_Evaluation_Report_PPA_Sec34.csv`);
}

export function exportBidEvaluationToCsv(
  meta: {
    orgName: string;
    procurementTitle: string;
    requisitionRef: string;
    reportRef: string;
    evaluationDate: string;
    currency: CurrencyCode;
  },
  reqItems: RequisitionItem[],
  evalResult: BidEvaluationResult
) {
  const bidders = evalResult.suppliers;

  // Header rows
  const bidderHeaders = bidders.map(b => `"${b.quotation.supplierName.replace(/"/g, '""')} (Unit)"`);
  const bidderTotalHeaders = bidders.map(b => `"${b.quotation.supplierName.replace(/"/g, '""')} (Total)"`);

  const headers = [
    'Item #',
    'Requisition Item Description',
    'Technical Specification',
    'Unit',
    'Required Qty',
    'Budget Benchmark Unit Price',
    'Budget Benchmark Total Amount',
    ...bidderHeaders,
    ...bidderTotalHeaders
  ];

  const rows = reqItems.map((item, idx) => {
    const benchUnitPrice = item.budgetBenchmarkPrice || 0;
    const benchTotal = benchUnitPrice * item.quantity;

    const unitPrices = bidders.map(b => {
      const line = b.quotation.items.find(it => it.matchReqItemId === item.id);
      return line ? line.unitPrice : 'N/Q';
    });

    const totalPrices = bidders.map(b => {
      const line = b.quotation.items.find(it => it.matchReqItemId === item.id);
      return line ? line.amount : 'N/Q';
    });

    return [
      idx + 1,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.specification.replace(/"/g, '""')}"`,
      item.unit,
      item.quantity,
      benchUnitPrice,
      benchTotal,
      ...unitPrices,
      ...totalPrices
    ];
  });

  // Summary rows
  const subtotalRow = [
    '',
    'QUOTED SUBTOTAL',
    '',
    '',
    '',
    '',
    evalResult.budgetBenchmarkTotal,
    ...bidders.map(b => ''),
    ...bidders.map(b => b.baseCost)
  ];

  const vatRow = [
    '',
    'VAT TREATMENT',
    '',
    '',
    '',
    '',
    'Statutory 7.5%',
    ...bidders.map(b => ''),
    ...bidders.map(b => b.quotation.vat.isInclusive ? '7.5% Included' : `+ ${b.vatAdded}`)
  ];

  const landedCostRow = [
    '',
    'EVALUATED LANDED COST (COMMON CURRENCY)',
    '',
    '',
    '',
    '',
    '',
    ...bidders.map(b => ''),
    ...bidders.map(b => b.evaluatedCost)
  ];

  const rankRow = [
    '',
    'EVALUATION RANK / STATUTORY STATUS',
    '',
    '',
    '',
    '',
    '',
    ...bidders.map(b => ''),
    ...bidders.map(b => b.isResponsive ? `Rank ${b.rank} (RESPONSIVE)` : `DISQUALIFIED (#${b.rank})`)
  ];

  const csvContent = [
    `# AFRI-PROCURE STATUTORY BID EVALUATION MATRIX (PPA 2007 SECTIONS 32 & 33)`,
    `# Procuring Entity: "${meta.orgName.replace(/"/g, '""')}"`,
    `# Procurement Title: "${meta.procurementTitle.replace(/"/g, '""')}"`,
    `# Requisition Ref: ${meta.requisitionRef}`,
    `# Report Ref: ${meta.reportRef}`,
    `# Evaluation Date: ${meta.evaluationDate}`,
    `# Evaluation Currency: ${meta.currency}`,
    `# Recommended Lowest Evaluated Responsive Bidder: "${evalResult.winner?.quotation.supplierName || 'None'}"`,
    `# Evaluated Contract Award Sum: ${evalResult.winner ? evalResult.winner.evaluatedCost : 0}`,
    headers.join(','),
    ...rows.map(r => r.join(',')),
    subtotalRow.join(','),
    vatRow.join(','),
    landedCostRow.join(','),
    rankRow.join(',')
  ].join('\n');

  triggerCsvDownload(csvContent, `Bid_Evaluation_Matrix_${meta.reportRef}.csv`);
}

