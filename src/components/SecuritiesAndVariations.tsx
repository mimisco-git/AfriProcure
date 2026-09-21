import React, { useState } from 'react';
import { ContractProject, CurrencyCode, ContractSecurity, VariationOrder, OAuGfAuditQuery, TraditionalCostItem } from '../types';
import { DEFAULT_CONTRACT_SECURITIES, DEFAULT_VARIATION_ORDERS, DEFAULT_OAUGF_AUDIT_QUERIES, DEFAULT_TRADITIONAL_COST_ITEMS } from '../data/procurementOfficerData';
import { formatCurrency, formatFullCurrency, calculateCpaMultiplier } from '../utils/cpaMath';
import { AfriProcureLogo } from './AfriProcureLogo';
import { 
  ShieldCheck, 
  ShieldAlert, 
  AlertTriangle, 
  Clock, 
  Landmark, 
  FileText, 
  Download, 
  Printer, 
  CheckCircle2, 
  Calendar, 
  Plus, 
  Building2, 
  FileCheck, 
  Scale, 
  Percent, 
  FileSpreadsheet, 
  ExternalLink,
  ChevronRight,
  HelpCircle,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface SecuritiesAndVariationsProps {
  project: ContractProject;
  currency: CurrencyCode;
}

export const SecuritiesAndVariations: React.FC<SecuritiesAndVariationsProps> = ({ project, currency }) => {
  const [activeSubTab, setActiveSubTab] = useState<'securities' | 'variations' | 'fec_memo' | 'audit_defense' | 'method_compare'>('securities');
  
  // Data state
  const [securities, setSecurities] = useState<ContractSecurity[]>(DEFAULT_CONTRACT_SECURITIES);
  const [variations, setVariations] = useState<VariationOrder[]>(DEFAULT_VARIATION_ORDERS);
  const [auditQueries, setAuditQueries] = useState<OAuGfAuditQuery[]>(DEFAULT_OAUGF_AUDIT_QUERIES);
  const [traditionalItems, setTraditionalItems] = useState<TraditionalCostItem[]>(DEFAULT_TRADITIONAL_COST_ITEMS);

  // Selected query for audit inspection
  const [selectedQueryId, setSelectedQueryId] = useState<string>(DEFAULT_OAUGF_AUDIT_QUERIES[0].id);
  
  // Modal for generating formal Bank Demand Letter
  const [selectedSecurityForDemand, setSelectedSecurityForDemand] = useState<ContractSecurity | null>(null);

  // Form state for simulating a new Variation Order
  const [showNewVoModal, setShowNewVoModal] = useState<boolean>(false);
  const [newVoTitle, setNewVoTitle] = useState('');
  const [newVoDescription, setNewVoDescription] = useState('');
  const [newVoAmount, setNewVoAmount] = useState<number>(350000000);
  const [newVoTimeDays, setNewVoTimeDays] = useState<number>(30);

  // Calculations for Scope Variations vs Statutory 15% Cap
  const totalApprovedVariations = variations.reduce((sum, vo) => sum + vo.approvedAmount, 0);
  const statutory15PctCap = project.contractSumInitial * 0.15;
  const variationPercentage = (totalApprovedVariations / project.contractSumInitial) * 100;
  const remainingVariationHeadroom = Math.max(0, statutory15PctCap - totalApprovedVariations);
  const isVariationOverCap = totalApprovedVariations > statutory15PctCap;

  // Calculations for Fluctuation (CPA)
  const cpaMultiplier = calculateCpaMultiplier(project.nonAdjustableFactor, project.components);
  const cpaEscalationTotal = project.contractSumInitial * (cpaMultiplier - 1);
  const revisedContractSumTotal = project.contractSumInitial + totalApprovedVariations + cpaEscalationTotal;

  // Calculations for Advance Payment Guarantee (APG)
  const apgSecurity = securities.find((s) => s.securityType === 'advance_payment') || securities[0];
  const apgUnrecoveredBalance = Math.max(0, apgSecurity.originalAmount - apgSecurity.recoveredAmount);
  const apgRecoveryPct = (apgSecurity.recoveredAmount / (apgSecurity.originalAmount || 1)) * 100;

  // Calculations for Traditional Fluctuation
  const traditionalTotalBase = traditionalItems.reduce((acc, item) => acc + item.baseAmount, 0);
  const traditionalTotalCurrent = traditionalItems.reduce((acc, item) => acc + item.currentAmount, 0);
  const traditionalTotalFluctuation = traditionalTotalCurrent - traditionalTotalBase;

  // Handler for adding a new Variation Order
  const handleAddVariation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVoTitle || newVoAmount <= 0) return;

    const newVo: VariationOrder = {
      id: `vo-${Date.now()}`,
      voNumber: `VO No. 0${variations.length + 1}`,
      title: newVoTitle,
      description: newVoDescription || 'Scope adjustment based on resident engineer site instruction.',
      approvedAmount: newVoAmount,
      approvalDate: new Date().toISOString().split('T')[0],
      approvingAuthority: newVoAmount > 1500000000 || (totalApprovedVariations + newVoAmount) > statutory15PctCap
        ? 'Federal Executive Council (FEC)'
        : 'Ministerial Tenders Board (MTB)',
      bppNoObjectionRef: `BPP/S.1/FED-WORKS/VO/2026/0${variations.length + 1}`,
      category: 'subgrade_realignment',
      timeExtensionDays: newVoTimeDays,
      status: 'approved',
    };

    setVariations([...variations, newVo]);
    setShowNewVoModal(false);
    setNewVoTitle('');
    setNewVoDescription('');
  };

  // Export Bank Demand Letter as Word document
  const exportBankDemandDoc = (sec: ContractSecurity) => {
    const content = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Statutory Bank Guarantee Demand Letter</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 40px; color: #1c1917; }
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
  h2, h3 { margin: 4px 0; text-transform: uppercase; }
  .ref-box { margin-bottom: 20px; font-weight: bold; }
  .body-text { margin-bottom: 15px; text-align: justify; }
  .signature-block { margin-top: 50px; }
</style>
</head>
<body>
<div class="header">
  <h3>FEDERAL REPUBLIC OF NIGERIA</h3>
  <h2>${project.procuringEntity.toUpperCase()}</h2>
  <p>Directorate of Public Procurement • Mabushi Headquarters, Shehu Shagari Way, Abuja, FCT</p>
</div>

<div class="ref-box">
  <p>REF NO: FMW/PROC/SEC/2026/VOL.IV/912</p>
  <p>DATE: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  <br>
  <p>The Managing Director / Chief Executive Officer,</p>
  <p>${sec.issuingBank}</p>
</div>

<h3>URGENT DEMAND NOTICE: STATUTORY EXTENSION OF BANK GUARANTEE OR IMMEDIATE REMITTANCE OF UNRECOVERED FUNDS UNDER PPA 2007 SECTION 35</h3>

<p class="body-text">
  <strong>PROJECT:</strong> ${project.title}<br>
  <strong>CONTRACT CODE:</strong> ${project.contractCode}<br>
  <strong>CONTRACTOR:</strong> ${project.contractorName}<br>
  <strong>GUARANTEE REFERENCE:</strong> ${sec.guaranteeReference}<br>
  <strong>ORIGINAL GUARANTEE VALUE:</strong> ${formatFullCurrency(sec.originalAmount, currency)}<br>
  <strong>UNRECOVERED PUBLIC BALANCE:</strong> ${formatFullCurrency(sec.originalAmount - sec.recoveredAmount, currency)}<br>
  <strong>SCHEDULED EXPIRY DATE:</strong> ${sec.expiryDate} (Expires in ${sec.daysToExpiry} days)
</p>

<p class="body-text">
  Dear Sir/Madam,
</p>

<p class="body-text">
  1. We write on behalf of the Federal Government of Nigeria in respect of the above-referenced Unconditional Advance Payment Guarantee issued by your esteemed institution to secure mobilization funds disbursed to Messrs <strong>${project.contractorName}</strong>.
</p>

<p class="body-text">
  2. Our statutory audit review indicates that as of the date hereof, the unamortized mobilization advance standing against the contractor is <strong>${formatFullCurrency(sec.originalAmount - sec.recoveredAmount, currency)}</strong>. However, the captioned Guarantee is due to expire on <strong>${sec.expiryDate}</strong>, leaving public funds vulnerable to imminent financial exposure.
</p>

<p class="body-text">
  3. Pursuant to <strong>Section 35(1) & (3) of the Public Procurement Act (PPA) 2007</strong> and <strong>Sub-Clause 4.2 of the Conditions of Contract</strong>, the Contractor is bound to maintain the guarantee valid and effective until the advance payment has been fully repaid.
</p>

<p class="body-text">
  4. <strong>TAKE NOTICE</strong> that you are hereby formally required, within <strong>fourteen (14) calendar days</strong> of receipt of this notice, to furnish this Ministry with an official <strong>Addendum/Rider extending the validity of Guarantee ${sec.guaranteeReference} for a further period of six (6) months</strong> (new expiry date: 31st December 2026).
</p>

<p class="body-text">
  5. <strong>FAILURE TO COMPLY:</strong> In the default of your providing the requisite extension rider within the stipulated 14-day window, this communication constitutes our <strong>UNCONDITIONAL DEMAND FOR IMMEDIATE FORFEITURE AND CALL-UPON</strong>. You shall immediately remit the full outstanding sum of <strong>${formatFullCurrency(sec.originalAmount - sec.recoveredAmount, currency)}</strong> into the Federal Government Treasury Single Account (TSA) under CBN Account Code 002019488102, failing which sanctions under the Central Bank of Nigeria Banking Regulations and PPA Section 58 shall be invoked.
</p>

<div class="signature-block">
  <p>Yours faithfully,</p>
  <br><br>
  <p>____________________________________________</p>
  <p><strong>Permanent Secretary / Accounting Officer</strong><br>${project.procuringEntity}</p>
</div>
</body>
</html>
    `;

    const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bank_Guarantee_Demand_${sec.guaranteeReference.replace(/[\/\s]/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Export FEC Memo as Word document
  const exportFecMemoDoc = () => {
    const content = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>FEC Council Memorandum - ${project.contractCode}</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 40px; color: #1c1917; }
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 12px; margin-bottom: 20px; }
  h1, h2, h3 { margin: 4px 0; text-transform: uppercase; }
  .secret { text-align: center; color: red; font-weight: bold; letter-spacing: 2px; }
  table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  th, td { border: 1px solid #333; padding: 7px 10px; font-size: 10.5pt; }
  th { background-color: #f5f5f4; text-transform: uppercase; font-weight: bold; }
  .section-title { font-weight: bold; text-decoration: underline; margin-top: 15px; margin-bottom: 6px; }
</style>
</head>
<body>
<div class="header">
  <p class="secret">CONFIDENTIAL • COUNCIL MEMORANDUM</p>
  <h3>FEDERAL REPUBLIC OF NIGERIA</h3>
  <h2>MEMORANDUM FOR THE FEDERAL EXECUTIVE COUNCIL</h2>
  <p>COUNCIL MEMORANDUM REF: <strong>EC(2026) 94th MEETING</strong></p>
</div>

<p><strong>SPONSOR:</strong> The Honourable Minister of Works</p>
<p><strong>SUBJECT:</strong> MEMORANDUM FOR APPROVAL OF REVISION OF CONTRACT SUM, AUGMENTATION OF WORKS, AND FLUTUATION (CPA) FOR ${project.title.toUpperCase()}</p>
<p><strong>DATE:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

<div class="section-title">1.0 PURPOSE</div>
<p>1.1 The purpose of this Memorandum is to seek the distinguished consideration and approval of the Federal Executive Council (FEC) for:</p>
<p>(a) Scope augmentation and variation orders totaling <strong>${formatFullCurrency(totalApprovedVariations, currency)}</strong>;</p>
<p>(b) Contract Price Adjustment (CPA) fluctuation under FIDIC Sub-Clause 13.8 and PPA 2007 Section 39 in the sum of <strong>${formatFullCurrency(cpaEscalationTotal, currency)}</strong>;</p>
<p>(c) The resulting Revised Total Estimated Cost (RTEC) of <strong>${formatFullCurrency(revisedContractSumTotal, currency)}</strong> in favour of Messrs <strong>${project.contractorName}</strong>.</p>

<div class="section-title">2.0 BACKGROUND</div>
<p>2.1 The contract for the ${project.title} was originally awarded following FEC Approval Ref: EC(2024)88 in the sum of <strong>${formatFullCurrency(project.contractSumInitial, currency)}</strong> with an initial completion period of ${project.durationMonths} months.</p>
<p>2.2 Works have progressed satisfactorily, achieving certified physical completion of over 58%. However, severe macroeconomic headwinds including currency floatation and hyperinflation in key construction materials (cement, rebar, diesel, bitumen), alongside unforeseen ground conditions, necessitate this augmentation.</p>

<div class="section-title">3.0 FINANCIAL BREAKDOWN & COST RECONCILIATION</div>
<table>
  <thead>
    <tr>
      <th>No</th>
      <th>Cost Element</th>
      <th>Amount (${currency})</th>
      <th>% Variance to Initial</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>1</td>
      <td>Original Approved Contract Sum</td>
      <td>${formatFullCurrency(project.contractSumInitial, currency)}</td>
      <td>Baseline (100%)</td>
    </tr>
    <tr>
      <td>2</td>
      <td>Cumulative Scope Variations (VO Nos 01 - 0${variations.length})</td>
      <td>${formatFullCurrency(totalApprovedVariations, currency)}</td>
      <td>+${variationPercentage.toFixed(2)}%</td>
    </tr>
    <tr>
      <td>3</td>
      <td>Certified Fluctuation & CPA (FIDIC 13.8 / NBS Index)</td>
      <td>${formatFullCurrency(cpaEscalationTotal, currency)}</td>
      <td>+${((cpaMultiplier - 1) * 100).toFixed(2)}%</td>
    </tr>
    <tr>
      <td><strong>4</strong></td>
      <td><strong>Revised Contract Sum (RTEC) Requested</strong></td>
      <td><strong>${formatFullCurrency(revisedContractSumTotal, currency)}</strong></td>
      <td><strong>+${(((revisedContractSumTotal - project.contractSumInitial) / project.contractSumInitial) * 100).toFixed(2)}%</strong></td>
    </tr>
  </tbody>
</table>

<div class="section-title">4.0 BUREAU OF PUBLIC PROCUREMENT (BPP) DUE DILIGENCE</div>
<p>4.1 The Bureau of Public Procurement (BPP) reviewed the detailed engineering claims, market rate surveys, and statutory index applications submitted by the Ministry.</p>
<p>4.2 Following rigorous value-for-money audit, the Director-General, BPP issued a formal <strong>Certificate of "No Objection"</strong> (Ref: <strong>BPP/S.1/FED-WORKS/2026/VOL.XI/948</strong>) confirming that the proposed revision represents fair, transparent, and defensible public procurement.</p>

<div class="section-title">5.0 PRAYERS (RECOMMENDATIONS TO COUNCIL)</div>
<p>5.1 In the light of the foregoing, Council is respectfully invited to:</p>
<p>(a) <strong>NOTE</strong> that the project is strategic to national transportation and corridor commerce;</p>
<p>(b) <strong>NOTE</strong> the BPP Certificate of "No Objection" issued on ${new Date().toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })};</p>
<p>(c) <strong>APPROVE</strong> the augmentation of the contract sum from ${formatFullCurrency(project.contractSumInitial, currency)} to ${formatFullCurrency(revisedContractSumTotal, currency)}, representing an augmentation of ${formatFullCurrency(revisedContractSumTotal - project.contractSumInitial, currency)} inclusive of all statutory taxes;</p>
<p>(d) <strong>DIRECT</strong> the Federal Ministry of Finance, Budget and National Planning to release funds from the 2026 Capital Budget Appropriation Vote under Head 0234001001.</p>

<div style="margin-top: 60px; display: flex; justify-content: space-between;">
  <div>
    <p>______________________________________</p>
    <p><strong>Permanent Secretary</strong><br>Accounting Officer</p>
  </div>
  <div>
    <p>______________________________________</p>
    <p><strong>Honourable Minister</strong><br>Federal Ministry of Works</p>
  </div>
</div>
</body>
</html>
    `;

    const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FEC_Council_Memorandum_${project.contractCode.replace(/[\/\s]/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const selectedQuery = auditQueries.find((q) => q.id === selectedQueryId) || auditQueries[0];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-md">
        <div className="max-w-4xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-stone-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              Procurement Officer Command Console
            </span>
            <span className="text-xs text-stone-400">
              Contract Securities • Scope Variations • Cabinet FEC Memo • Auditor-General Defense
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 tracking-tight">
            Bank Securities, Variation Headroom & Council Approvals
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Manage the critical operational duties of a senior Procurement Officer: prevent personal audit surcharge by tracking <strong>Advance Payment Guarantee (APG) amortization & expiry dates</strong>, enforce the <strong>statutory 15% Scope Variation Cap (PPA 2007 Sec 38)</strong>, auto-generate official <strong>Federal Executive Council (FEC) Memoranda</strong>, and rebut <strong>Auditor-General (OAuGF) audit queries</strong>.
          </p>
        </div>
      </div>

      {/* KPI Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* APG Exposure Card */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
            <span>Unrecovered APG Balance</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              apgSecurity.daysToExpiry < 30 ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
            }`}>
              Expires in {apgSecurity.daysToExpiry}d
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-stone-900">
            {formatCurrency(apgUnrecoveredBalance, currency)}
          </div>
          <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1">
            <span>Amortized via IPCs:</span>
            <span className="font-bold text-emerald-700">{apgRecoveryPct.toFixed(1)}%</span>
          </div>
        </div>

        {/* Scope Variation Card */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
            <span>Cumulative Scope Variations</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isVariationOverCap ? 'bg-red-100 text-red-800' : 'bg-emerald-100 text-emerald-800'
            }`}>
              {variationPercentage.toFixed(2)}% of 15% Cap
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-stone-900">
            {formatCurrency(totalApprovedVariations, currency)}
          </div>
          <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1">
            <span>Statutory 15% Headroom:</span>
            <span className="font-bold text-stone-700">{formatCurrency(remainingVariationHeadroom, currency)}</span>
          </div>
        </div>

        {/* Certified Fluctuation (CPA) Card */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
            <span>Certified Fluctuation (CPA)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800">
              Pn = {cpaMultiplier.toFixed(4)}
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-indigo-900">
            +{formatCurrency(cpaEscalationTotal, currency)}
          </div>
          <div className="text-[11px] text-stone-500 pt-1">
            Statutory inflation adjustment (PPA Sec 39)
          </div>
        </div>

        {/* Revised Total Estimated Cost (RTEC) */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-xs text-stone-500 font-semibold">
            <span>Revised Total Cost (RTEC)</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900">
              FEC Threshold
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-900">
            {formatCurrency(revisedContractSumTotal, currency)}
          </div>
          <div className="text-[11px] text-stone-500 pt-1">
            Original + VOs + Fluctuation
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-stone-200 pb-2 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('securities')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'securities'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          1. Bank Securities & APG Lifeline
        </button>

        <button
          onClick={() => setActiveSubTab('variations')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'variations'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Percent className="w-4 h-4 text-emerald-400" />
          2. Scope Variations (15% Cap Limiter)
        </button>

        <button
          onClick={() => setActiveSubTab('fec_memo')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'fec_memo'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Landmark className="w-4 h-4 text-amber-400" />
          3. FEC Cabinet Memorandum
        </button>

        <button
          onClick={() => setActiveSubTab('audit_defense')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'audit_defense'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <Scale className="w-4 h-4 text-red-400" />
          4. Auditor-General (OAuGF) Defense
        </button>

        <button
          onClick={() => setActiveSubTab('method_compare')}
          className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all ${
            activeSubTab === 'method_compare'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
          5. Fluctuation Method 1 vs Method 2 Audit
        </button>
      </div>

      {/* ======================================================== */}
      {/* TAB 1: BANK SECURITIES & APG LIFELINE MONITOR           */}
      {/* ======================================================== */}
      {activeSubTab === 'securities' && (
        <div className="space-y-6">
          <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">Accounting Officer Surcharge Shield (PPA 2007 Section 35):</div>
              <p className="leading-relaxed">
                Procurement Officers and Permanent Secretaries are personally surcharged by the Auditor-General for unrecovered mobilization advances if bank guarantees expire before full amortization. When a guarantee has <strong>fewer than 45 days remaining</strong> and amortization is incomplete, issue a statutory 14-day demand notice to the issuing commercial bank immediately.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {securities.map((sec) => {
              const unrecovered = Math.max(0, sec.originalAmount - sec.recoveredAmount);
              const recoveredPct = (sec.recoveredAmount / sec.originalAmount) * 100;
              const isCritical = sec.daysToExpiry <= 30;

              return (
                <div 
                  key={sec.id}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between shadow-xs ${
                    isCritical ? 'border-red-300 ring-2 ring-red-100' : 'border-stone-200'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        sec.securityType === 'advance_payment' 
                          ? 'bg-amber-100 text-amber-900' 
                          : sec.securityType === 'performance_bond' 
                          ? 'bg-emerald-100 text-emerald-900' 
                          : 'bg-indigo-100 text-indigo-900'
                      }`}>
                        {sec.securityType.replace(/_/g, ' ')}
                      </span>

                      <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        isCritical ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-stone-100 text-stone-700'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {sec.daysToExpiry} Days Remaining
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-stone-900">{sec.title}</h3>
                      <div className="text-[11px] text-stone-500 font-mono mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-stone-400" />
                        {sec.issuingBank}
                      </div>
                    </div>

                    <div className="p-3 bg-stone-50 rounded-xl space-y-1.5 border border-stone-200 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Ref Code:</span>
                        <span className="font-mono font-bold text-stone-800">{sec.guaranteeReference}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Face Value:</span>
                        <span className="font-mono font-bold text-stone-900">{formatCurrency(sec.originalAmount, currency)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Expiry Date:</span>
                        <span className={`font-mono font-bold ${isCritical ? 'text-red-700' : 'text-stone-800'}`}>
                          {sec.expiryDate}
                        </span>
                      </div>
                    </div>

                    {sec.securityType === 'advance_payment' && (
                      <div className="space-y-1.5 pt-1">
                        <div className="flex justify-between text-[11px] text-stone-600 font-semibold">
                          <span>Recovery via IPCs</span>
                          <span>{recoveredPct.toFixed(1)}% ({formatCurrency(sec.recoveredAmount, currency)})</span>
                        </div>
                        <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${recoveredPct}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-red-700 font-bold pt-0.5">
                          <span>Unrecovered Exposure:</span>
                          <span>{formatCurrency(unrecovered, currency)}</span>
                        </div>
                      </div>
                    )}

                    <p className="text-[11px] text-stone-600 leading-relaxed italic border-t border-stone-100 pt-2">
                      "{sec.notes}"
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-stone-200 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedSecurityForDemand(sec)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isCritical
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-sm'
                          : 'bg-stone-900 hover:bg-stone-800 text-white'
                      }`}
                    >
                      <FileText className="w-3.5 h-3.5" />
                      Statutory Demand Notice
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: SCOPE VARIATION ORDERS & 15% CAP LIMITER          */}
      {/* ======================================================== */}
      {activeSubTab === 'variations' && (
        <div className="space-y-6">
          {/* Statutory Threshold Progress Bar */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                  <Percent className="w-4 h-4 text-emerald-600" />
                  Statutory 15% Scope Variation Cap (PPA 2007 Section 38)
                </h3>
                <p className="text-xs text-stone-600">
                  Cumulative scope variations may not exceed 15% of initial contract sum without BPP Prior Review & FEC Approval.
                </p>
              </div>

              <button
                onClick={() => setShowNewVoModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs self-start sm:self-center"
              >
                <Plus className="w-3.5 h-3.5" />
                Simulate / Add Variation
              </button>
            </div>

            {/* Gauge */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-stone-700">Cumulative Scope Variations: {formatFullCurrency(totalApprovedVariations, currency)}</span>
                <span className={isVariationOverCap ? 'text-red-700' : 'text-emerald-800'}>
                  {variationPercentage.toFixed(2)}% of 15.00% Limit
                </span>
              </div>

              <div className="w-full bg-stone-100 rounded-full h-3.5 overflow-hidden p-0.5 border border-stone-200">
                <div 
                  className={`h-full rounded-full transition-all ${
                    isVariationOverCap 
                      ? 'bg-red-600' 
                      : variationPercentage > 12 
                      ? 'bg-amber-500' 
                      : 'bg-emerald-600'
                  }`}
                  style={{ width: `${Math.min(100, (variationPercentage / 15) * 100)}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500">
                <span>0% (Award Baseline)</span>
                <span>Remaining Headroom: <strong className="text-stone-900">{formatCurrency(remainingVariationHeadroom, currency)}</strong></span>
                <span>15% Ceiling: {formatCurrency(statutory15PctCap, currency)}</span>
              </div>
            </div>

            {isVariationOverCap ? (
              <div className="p-3 bg-red-100 text-red-950 rounded-xl border border-red-200 text-xs flex items-center gap-2 font-semibold">
                <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                <span>MANDATORY FEC RESUBMISSION: Total scope variations exceed the statutory 15% threshold. Direct approval of the Federal Executive Council and full BPP Prior Review are legally required.</span>
              </div>
            ) : (
              <div className="p-3 bg-emerald-50 text-emerald-950 rounded-xl border border-emerald-200 text-xs flex items-center gap-2 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Statutorily Compliant: Within Ministerial Tenders Board (MTB) delegated threshold. All variations backed by BPP concurrence.</span>
              </div>
            )}
          </div>

          {/* Variations Table */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-stone-900">
                Approved Scope Variation Orders & Addenda
              </h4>
              <span className="text-xs text-stone-500 font-mono">
                {variations.length} Approved Variation Orders
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-stone-50 font-bold text-stone-700 border-b border-stone-200">
                  <tr>
                    <th className="p-3">VO Number</th>
                    <th className="p-3">Scope Description</th>
                    <th className="p-3">Approved Amount</th>
                    <th className="p-3">% of Initial Sum</th>
                    <th className="p-3">EOT (Days)</th>
                    <th className="p-3">Approving Authority</th>
                    <th className="p-3">BPP Concurrence</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200">
                  {variations.map((vo) => {
                    const pctOfInitial = (vo.approvedAmount / project.contractSumInitial) * 100;
                    return (
                      <tr key={vo.id} className="hover:bg-stone-50/80 transition-colors">
                        <td className="p-3 font-bold font-mono text-stone-900">{vo.voNumber}</td>
                        <td className="p-3 max-w-sm">
                          <div className="font-bold text-stone-900">{vo.title}</div>
                          <div className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">{vo.description}</div>
                        </td>
                        <td className="p-3 font-bold font-mono text-stone-900">
                          {formatCurrency(vo.approvedAmount, currency)}
                        </td>
                        <td className="p-3 font-bold text-amber-800">
                          +{pctOfInitial.toFixed(2)}%
                        </td>
                        <td className="p-3 font-mono text-stone-700">+{vo.timeExtensionDays} days</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-800 font-semibold text-[11px]">
                            {vo.approvingAuthority}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-stone-600 text-[11px]">
                          {vo.bppNoObjectionRef}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: FEDERAL EXECUTIVE COUNCIL (FEC) CABINET MEMO      */}
      {/* ======================================================== */}
      {activeSubTab === 'fec_memo' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Official Federal Executive Council (FEC) Memorandum Generator
                </h3>
              </div>
              <p className="text-xs text-stone-600 mt-1">
                Standard Cabinet Office format for seeking President-in-Council approval for contract augmentations exceeding Ministerial Tenders Board thresholds.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportFecMemoDoc}
                className="px-3.5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-all"
              >
                <Download className="w-4 h-4 text-amber-400" />
                Download Council Memo (.doc)
              </button>
              <button
                onClick={() => window.print()}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs flex items-center gap-2 transition-all border border-stone-300"
              >
                <Printer className="w-4 h-4 text-stone-600" />
                Print
              </button>
            </div>
          </div>

          {/* Memo Document Preview */}
          <div className="bg-stone-50 rounded-2xl p-6 sm:p-8 border border-stone-300 font-serif text-stone-900 space-y-6 shadow-sm max-w-4xl mx-auto">
            <div className="flex items-center justify-between border-b border-stone-300 pb-3 font-sans">
              <AfriProcureLogo size="sm" variant="badge" />
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase bg-red-100 text-red-900 px-2 py-0.5 rounded font-bold border border-red-300">
                  TOP SECRET • COUNCIL COPY
                </span>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5">Vote: 0234001001 • BPP Cert No. 948</p>
              </div>
            </div>

            <div className="text-center border-b-2 border-stone-900 pb-4 space-y-1">
              <div className="text-xs font-sans font-bold text-red-700 uppercase tracking-widest">
                CONFIDENTIAL • FOR THE EXCLUSIVE USE OF COUNCIL MEMBERS
              </div>
              <h2 className="text-lg font-bold uppercase">FEDERAL REPUBLIC OF NIGERIA</h2>
              <h1 className="text-xl font-black uppercase tracking-tight">MEMORANDUM FOR THE FEDERAL EXECUTIVE COUNCIL</h1>
              <p className="text-xs font-sans text-stone-600">
                Council Memo Ref: <strong className="text-stone-900 font-mono">EC(2026) 94th MEETING</strong> • Shehu Shagari Complex, Abuja
              </p>
            </div>

            <div className="text-xs font-sans bg-white p-4 rounded-xl border border-stone-200 space-y-1.5">
              <div><strong>SPONSOR:</strong> The Honourable Minister of Works</div>
              <div><strong>PROJECT:</strong> {project.title} ({project.contractCode})</div>
              <div><strong>CONTRACTOR:</strong> {project.contractorName}</div>
              <div><strong>SUBJECT:</strong> APPROVAL FOR AUGMENTATION OF CONTRACT SUM AND APPLICATION OF PRICE ADJUSTMENT FORMULA UNDER FIDIC 13.8 / PPA 2007</div>
            </div>

            <div className="text-xs leading-relaxed space-y-4">
              <div>
                <h4 className="font-bold text-sm uppercase underline font-sans mb-1">1.0 PURPOSE OF MEMORANDUM</h4>
                <p>
                  1.1 The purpose of this Memorandum is to seek the distinguished approval of the Federal Executive Council for the augmentation of the contract sum for the <strong>{project.title}</strong>, comprising scope variations of <strong>{formatFullCurrency(totalApprovedVariations, currency)}</strong> and certified Contract Price Adjustment (CPA) escalation of <strong>{formatFullCurrency(cpaEscalationTotal, currency)}</strong>, resulting in a Revised Total Estimated Cost (RTEC) of <strong>{formatFullCurrency(revisedContractSumTotal, currency)}</strong> in favour of Messrs <strong>{project.contractorName}</strong>.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm uppercase underline font-sans mb-1">2.0 BACKGROUND & ORIGINAL AWARD</h4>
                <p>
                  2.1 The contract was originally awarded pursuant to Federal Executive Council approval Ref: EC(2024)88 in the sum of <strong>{formatFullCurrency(project.contractSumInitial, currency)}</strong> with a completion period of {project.durationMonths} months. Works have currently progressed to 58% certified physical completion.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm uppercase underline font-sans mb-1">3.0 FINANCIAL BREAKDOWN & COST RECONCILIATION</h4>
                <div className="overflow-x-auto my-2">
                  <table className="w-full text-left font-sans text-xs border border-stone-300">
                    <thead className="bg-stone-200">
                      <tr>
                        <th className="p-2 border border-stone-300">Item</th>
                        <th className="p-2 border border-stone-300">Description</th>
                        <th className="p-2 border border-stone-300 font-mono">Amount ({currency})</th>
                        <th className="p-2 border border-stone-300">% Variance</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white">
                      <tr>
                        <td className="p-2 border border-stone-300 font-bold">1</td>
                        <td className="p-2 border border-stone-300">Original Approved Contract Sum</td>
                        <td className="p-2 border border-stone-300 font-mono">{formatFullCurrency(project.contractSumInitial, currency)}</td>
                        <td className="p-2 border border-stone-300">Baseline (100%)</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-stone-300 font-bold">2</td>
                        <td className="p-2 border border-stone-300">Cumulative Scope Variations (VO Nos 01 - 0{variations.length})</td>
                        <td className="p-2 border border-stone-300 font-mono">{formatFullCurrency(totalApprovedVariations, currency)}</td>
                        <td className="p-2 border border-stone-300 text-amber-800 font-bold">+{variationPercentage.toFixed(2)}%</td>
                      </tr>
                      <tr>
                        <td className="p-2 border border-stone-300 font-bold">3</td>
                        <td className="p-2 border border-stone-300">Statutory Fluctuation & CPA (FIDIC 13.8 / NBS Index)</td>
                        <td className="p-2 border border-stone-300 font-mono">{formatFullCurrency(cpaEscalationTotal, currency)}</td>
                        <td className="p-2 border border-stone-300 text-indigo-800 font-bold">+{((cpaMultiplier - 1) * 100).toFixed(2)}%</td>
                      </tr>
                      <tr className="bg-amber-100 font-bold">
                        <td className="p-2 border border-stone-300">4</td>
                        <td className="p-2 border border-stone-300">Requested Revised Total Estimated Cost (RTEC)</td>
                        <td className="p-2 border border-stone-300 font-mono">{formatFullCurrency(revisedContractSumTotal, currency)}</td>
                        <td className="p-2 border border-stone-300 text-amber-950 font-bold">
                          +{(((revisedContractSumTotal - project.contractSumInitial) / project.contractSumInitial) * 100).toFixed(2)}%
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-sm uppercase underline font-sans mb-1">4.0 BUREAU OF PUBLIC PROCUREMENT (BPP) DUE DILIGENCE</h4>
                <p>
                  4.1 The Bureau of Public Procurement (BPP) carried out rigorous prior-review due diligence on the quantities, material price indices, and statutory justifications submitted by the Ministry.
                </p>
                <p>
                  4.2 The Director-General, BPP has granted the mandatory <strong>Certificate of "No Objection"</strong> (Ref: <strong>BPP/S.1/FED-WORKS/2026/VOL.XI/948</strong>) confirming that the requested contract sum revision is fair, transparent, and legally sound under Section 39 of the Public Procurement Act 2007.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-sm uppercase underline font-sans mb-1">5.0 PRAYERS (RECOMMENDATIONS TO COUNCIL)</h4>
                <p>5.1 In the light of the above justifications, Council is respectfully invited to:</p>
                <p className="pl-4">(a) <strong>APPROVE</strong> the augmentation of the contract sum from {formatFullCurrency(project.contractSumInitial, currency)} to <strong>{formatFullCurrency(revisedContractSumTotal, currency)}</strong> (an augmentation of {formatFullCurrency(revisedContractSumTotal - project.contractSumInitial, currency)});</p>
                <p className="pl-4">(b) <strong>APPROVE</strong> an extension of the contract completion period by {variations.reduce((s, v) => s + v.timeExtensionDays, 0)} days to accommodate the additional technical scope;</p>
                <p className="pl-4">(c) <strong>DIRECT</strong> the Federal Ministry of Finance to charge the expenditure to the 2026 Capital Budget Appropriation Vote under Head 0234001001.</p>
              </div>
            </div>

            <div className="pt-8 border-t border-stone-400 flex flex-col sm:flex-row items-center justify-between text-xs font-sans gap-4">
              <div>
                <p>_____________________________________</p>
                <p className="font-bold mt-1">Permanent Secretary</p>
                <p className="text-stone-500">Accounting Officer</p>
              </div>
              <div>
                <p>_____________________________________</p>
                <p className="font-bold mt-1">Honourable Minister</p>
                <p className="text-stone-500">{project.procuringEntity}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: AUDITOR-GENERAL (OAuGF) DEFENSE DOSSIER            */}
      {/* ======================================================== */}
      {activeSubTab === 'audit_defense' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-red-600" />
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Auditor-General for the Federation (OAuGF) Query & PAC Defense Center
              </h3>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Every major public infrastructure project faces annual audit queries from the Auditor-General and National Assembly Public Accounts Committee (PAC). Select a standard query to view the cited statutory defense and evidence bundle.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Query List */}
            <div className="lg:col-span-5 space-y-2">
              {auditQueries.map((q) => {
                const isSelected = q.id === selectedQueryId;
                return (
                  <button
                    key={q.id}
                    onClick={() => setSelectedQueryId(q.id)}
                    className={`w-full p-3.5 rounded-xl text-left border transition-all space-y-1.5 ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-100 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {q.queryRef}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        q.status === 'cleared' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {q.status === 'cleared' ? 'Auditor Cleared' : 'Rebuttal Submitted'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-stone-900">{q.title}</div>
                    <div className="text-[11px] text-stone-600 line-clamp-2 leading-relaxed">
                      {q.auditFinding}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Detailed Defense Memorandum */}
            <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                <div>
                  <span className="text-xs font-mono font-bold text-stone-500">{selectedQuery.queryRef}</span>
                  <h4 className="text-sm font-black text-stone-900 mt-0.5">{selectedQuery.title}</h4>
                </div>
                <span className="text-xs font-mono font-bold px-2.5 py-1 rounded bg-stone-100 text-stone-800">
                  Value: {formatCurrency(selectedQuery.allegedLossOrIrregularity, currency)}
                </span>
              </div>

              {/* Auditor Observation */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-red-700 tracking-wider flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-red-600" />
                  Auditor-General's Query & Observation:
                </span>
                <p className="text-xs text-stone-800 bg-red-50/70 p-3.5 rounded-xl border border-red-200 leading-relaxed font-serif">
                  "{selectedQuery.auditFinding}"
                </p>
              </div>

              {/* Management Statutory Defense */}
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-emerald-800 tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  Management Statutory Rebuttal & Legal Grounds:
                </span>
                <p className="text-xs text-stone-800 bg-emerald-50/50 p-3.5 rounded-xl border border-emerald-200 leading-relaxed">
                  {selectedQuery.statutoryDefense}
                </p>
              </div>

              {/* Legal Citations */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">PPA 2007 & Financial Regulations:</span>
                  <ul className="list-disc list-inside text-[11px] text-stone-700 space-y-0.5">
                    {selectedQuery.ppaCitations.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-stone-500 block">FIDIC Conditions of Contract:</span>
                  <ul className="list-disc list-inside text-[11px] text-stone-700 space-y-0.5">
                    {selectedQuery.fidicCitations.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Evidential Exhibits Bundle */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1.5">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">
                  Mandatory Audit Defense Exhibit Bundle:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {selectedQuery.exhibits.map((ex, i) => (
                    <div key={i} className="flex items-center gap-1.5 text-[11px] text-stone-800 font-semibold bg-white p-2 rounded border border-stone-200">
                      <FileCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="truncate">{ex}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: FLUCTUATION METHOD 1 VS METHOD 2 COMPARISON       */}
      {/* ======================================================== */}
      {activeSubTab === 'method_compare' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-cyan-700" />
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Reconciliation Audit: Method 1 (Direct Invoices) vs Method 2 (FIDIC 13.8 Formula)
              </h3>
            </div>
            <p className="text-xs text-stone-600 mt-1">
              Public auditors often demand proof that the algorithmic CPA formula ($P_n$) does not overcompensate the contractor compared to traditional proven-cost invoices (receipts for cement, steel, fuel, and bitumen).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Method 1 Card */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-cyan-100 text-cyan-900">
                    Method 1: Traditional Proven Cost
                  </span>
                  <h4 className="text-base font-bold text-stone-900 mt-1">Direct Invoicing Fluctuation</h4>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold font-mono text-cyan-950">
                    +{formatCurrency(traditionalTotalFluctuation, currency)}
                  </div>
                  <div className="text-[10px] text-stone-500">Actual Market Fluctuation</div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-stone-200 rounded-lg">
                  <thead className="bg-stone-50 text-stone-700 font-bold border-b border-stone-200">
                    <tr>
                      <th className="p-2">Material</th>
                      <th className="p-2">Quantity</th>
                      <th className="p-2 font-mono">Base Rate</th>
                      <th className="p-2 font-mono">Invoice Rate</th>
                      <th className="p-2 font-mono">Fluctuation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-200">
                    {traditionalItems.map((item) => (
                      <tr key={item.id} className="hover:bg-stone-50">
                        <td className="p-2 font-medium text-stone-900">{item.item}</td>
                        <td className="p-2 font-mono text-stone-600">{item.quantity.toLocaleString()} {item.unit}</td>
                        <td className="p-2 font-mono text-stone-700">{formatCurrency(item.baseRate, currency)}</td>
                        <td className="p-2 font-mono text-stone-900 font-bold">{formatCurrency(item.currentInvoiceRate, currency)}</td>
                        <td className="p-2 font-mono text-cyan-800 font-bold">+{formatCurrency(item.actualFluctuation, currency)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="text-[11px] text-stone-500 italic bg-stone-50 p-2.5 rounded-lg">
                Subject to physical delivery note verification, haulage weighbridge receipts, and tax invoice authentication with FIRS.
              </div>
            </div>

            {/* Method 2 Card & Variance */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-100 text-indigo-900">
                      Method 2: FIDIC 13.8 Algorithmic
                    </span>
                    <h4 className="text-base font-bold text-stone-900 mt-1">Official NBS Indexation</h4>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold font-mono text-indigo-950">
                      +{formatCurrency(cpaEscalationTotal, currency)}
                    </div>
                    <div className="text-[10px] text-stone-500">Certified by Formula</div>
                  </div>
                </div>

                <div className="mt-4 p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                  <div className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                    Statistical Divergence & Audit Reconciliation:
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-600">Method 1 (Invoices):</span>
                    <span className="font-mono font-bold text-stone-900">{formatFullCurrency(traditionalTotalFluctuation, currency)}</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-600">Method 2 (Formula):</span>
                    <span className="font-mono font-bold text-indigo-900">{formatFullCurrency(cpaEscalationTotal, currency)}</span>
                  </div>

                  <div className="pt-2 border-t border-stone-200 flex items-center justify-between text-xs font-bold">
                    <span className="text-stone-800">Variance (Delta):</span>
                    <span className="font-mono text-emerald-800">
                      {formatCurrency(Math.abs(cpaEscalationTotal - traditionalTotalFluctuation), currency)} ({
                        (Math.abs(cpaEscalationTotal - traditionalTotalFluctuation) / (traditionalTotalFluctuation || 1) * 100).toFixed(1)
                      }%)
                    </span>
                  </div>
                </div>

                <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <div className="font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Forensic Audit Conclusion:
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    The FIDIC 13.8 mathematical formula closely reflects verified market delivery prices with less than 6% variance, while eliminating contractor markup inflations and administrative delays of checking thousands of individual receipts.
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-stone-200">
                <button
                  onClick={() => window.print()}
                  className="w-full py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  Print Method 1 vs Method 2 Reconciliation Report
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: FORMAL BANK GUARANTEE DEMAND LETTER               */}
      {/* ======================================================== */}
      {selectedSecurityForDemand && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-stone-200 my-8">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-red-600" />
                <h3 className="text-base font-bold text-stone-900">
                  Statutory Bank Demand Notice (PPA 2007 Section 35)
                </h3>
              </div>
              <button
                onClick={() => setSelectedSecurityForDemand(null)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-xs font-serif leading-relaxed text-stone-800 space-y-2">
              <p><strong>TO:</strong> The Managing Director, {selectedSecurityForDemand.issuingBank}</p>
              <p><strong>SUBJECT:</strong> FORMAL DEMAND FOR GUARANTEE EXTENSION OR IMMEDIATE FORFEITURE CALL-UPON</p>
              <p><strong>REF:</strong> {selectedSecurityForDemand.guaranteeReference}</p>
              <p><strong>UNRECOVERED PUBLIC BALANCE:</strong> {formatFullCurrency(selectedSecurityForDemand.originalAmount - selectedSecurityForDemand.recoveredAmount, currency)}</p>
              <p className="pt-2 border-t border-stone-200 text-stone-700">
                You are hereby notified under Section 35 of the Public Procurement Act 2007 to provide an official 6-month extension rider within 14 calendar days, failing which this notice serves as our unconditional call upon the guarantee for immediate remittance into the Federal Treasury Single Account (TSA).
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setSelectedSecurityForDemand(null)}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={() => exportBankDemandDoc(selectedSecurityForDemand)}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center gap-2 shadow-sm"
              >
                <Download className="w-4 h-4 text-amber-400" />
                Download Formal Letter (.doc)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ADD / SIMULATE NEW VARIATION ORDER               */}
      {/* ======================================================== */}
      {showNewVoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between border-b border-stone-200 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                Simulate Scope Variation Order (VO)
              </h3>
              <button
                onClick={() => setShowNewVoModal(false)}
                className="text-stone-400 hover:text-stone-700 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVariation} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Variation Title / Scope Item:</label>
                <input
                  type="text"
                  placeholder="e.g. Additional Pre-stressed Concrete Bridge Span at Ch 34+200"
                  value={newVoTitle}
                  onChange={(e) => setNewVoTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-medium focus:outline-hidden focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Scope Justification / Engineering Reason:</label>
                <textarea
                  rows={2}
                  placeholder="Detailed justification citing site condition or hydraulic changes..."
                  value={newVoDescription}
                  onChange={(e) => setNewVoDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-stone-700 mb-1">Proposed Amount ({currency}):</label>
                  <input
                    type="number"
                    value={newVoAmount}
                    onChange={(e) => setNewVoAmount(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono font-bold text-stone-900 focus:outline-hidden focus:border-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-stone-700 mb-1">Time Extension (Days):</label>
                  <input
                    type="number"
                    value={newVoTimeDays}
                    onChange={(e) => setNewVoTimeDays(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono font-bold text-stone-900 focus:outline-hidden focus:border-amber-500"
                    required
                  />
                </div>
              </div>

              {/* Threshold Impact Forecast */}
              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 space-y-1">
                <div className="font-bold text-stone-700">Projected Statutory Impact:</div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">New Cumulative Variations:</span>
                  <span className="font-mono font-bold text-stone-900">{formatCurrency(totalApprovedVariations + newVoAmount, currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-stone-500">New Percentage of Initial Sum:</span>
                  <span className={`font-bold ${
                    (totalApprovedVariations + newVoAmount) > statutory15PctCap ? 'text-red-700 font-black' : 'text-emerald-800'
                  }`}>
                    {(((totalApprovedVariations + newVoAmount) / project.contractSumInitial) * 100).toFixed(2)}% (Max 15%)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewVoModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 font-bold text-stone-700 hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Approve & Record VO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
