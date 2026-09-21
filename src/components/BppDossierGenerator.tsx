import React, { useState } from 'react';
import { ContractProject, CurrencyCode } from '../types';
import { calculateCpaMultiplier, formatCurrency, formatFullCurrency } from '../utils/cpaMath';
import { ORGANIZATIONAL_PROCUREMENT_BLUEPRINT } from '../data/caseStudies';
import { AfriProcureLogo } from './AfriProcureLogo';
import { Landmark, FileCheck2, ShieldCheck, Printer, CheckCircle2, AlertTriangle, Building2, Download, Briefcase, FileSpreadsheet, Eye, ChevronRight } from 'lucide-react';

interface BppDossierGeneratorProps {
  project: ContractProject;
  currency: CurrencyCode;
}

interface DueDiligenceItem {
  id: string;
  category: 'statutory' | 'procurement' | 'technical' | 'financial';
  label: string;
  ppaCitation: string;
  requirement: string;
  verified: boolean;
  documentRef: string;
}

export const BppDossierGenerator: React.FC<BppDossierGeneratorProps> = ({ project, currency }) => {
  const [checklist, setChecklist] = useState<DueDiligenceItem[]>([
    {
      id: 'chk-1',
      category: 'statutory',
      label: 'Prior Budgetary Appropriation Verification',
      ppaCitation: 'PPA 2007 Section 16(1)(b)',
      requirement: 'Proof of budgetary allocation under Federal/State Appropriation Act before procurement initiation.',
      verified: true,
      documentRef: 'APPROP/FED-WORKS/LINE-882104',
    },
    {
      id: 'chk-2',
      category: 'statutory',
      label: 'Procurement Planning Committee (PPC) Approval',
      ppaCitation: 'PPA 2007 Section 18 & 21',
      requirement: 'Procurement Plan submitted to BPP and gazetted in statutory annual procurement portal.',
      verified: true,
      documentRef: 'PPC/MIN-WORKS/2025/PLAN-004',
    },
    {
      id: 'chk-3',
      category: 'procurement',
      label: 'Mandatory 6-Week Advertisement in Tenders Journal & 2 Dailies',
      ppaCitation: 'PPA 2007 Section 24 & 25',
      requirement: 'Proof of public notice published in Federal Tenders Journal and 2 national newspapers.',
      verified: true,
      documentRef: 'FTJ-VOL.19/NO.42 & The Nation / Daily Trust',
    },
    {
      id: 'chk-4',
      category: 'technical',
      label: 'Public Bid Opening Minutes with Civil Society Observers',
      ppaCitation: 'PPA 2007 Section 30(2)',
      requirement: 'Attendance sheet signed by Nigerian Institute of Quantity Surveyors (NIQS) & Civil Society Observers.',
      verified: true,
      documentRef: 'MIN/PBO/2025/CSO-NIQS-441',
    },
    {
      id: 'chk-5',
      category: 'financial',
      label: 'Arithmetical Error Check & Parity Audit',
      ppaCitation: 'PPA 2007 Section 31(4) & 31(7)',
      requirement: 'Re-computation of unit rate extensions; confirmation that contractor agreed in writing to arithmetical corrections.',
      verified: true,
      documentRef: 'EVAL-REP/ARITH-CORR/VOL.2',
    },
    {
      id: 'chk-6',
      category: 'procurement',
      label: '7.5% Domestic Margin of Preference Application',
      ppaCitation: 'PPA 2007 Section 34(1)',
      requirement: 'Mathematical adjustment applied exclusively to domestic contractors with Nigerian engineering majority.',
      verified: true,
      documentRef: 'DOM-PREF/WORKS/2025-EVAL-34',
    },
    {
      id: 'chk-7',
      category: 'statutory',
      label: 'FIRS Tax Clearance Certificate (TCC) Online Verification',
      ppaCitation: 'PPA 2007 Section 16(6)(d)',
      requirement: 'Valid electronic Tax Clearance Certificate for preceding 3 consecutive years with matching turnover.',
      verified: true,
      documentRef: 'FIRS/TCC/VERIF/2025/9941038',
    },
    {
      id: 'chk-8',
      category: 'statutory',
      label: 'National Pension Commission (PENCOM) Compliance',
      ppaCitation: 'PRA 2014 & PPA Section 16(6)(d)',
      requirement: 'Valid PENCOM Compliance Certificate confirming employee pension remittances.',
      verified: true,
      documentRef: 'PENCOM/CERT/2025/CC-88210',
    },
    {
      id: 'chk-9',
      category: 'statutory',
      label: 'Industrial Training Fund (ITF) Compliance Certificate',
      ppaCitation: 'ITF Act 2011 Section 6(1)',
      requirement: 'Proof of 1% statutory annual payroll contribution to ITF.',
      verified: true,
      documentRef: 'ITF/CERT/HQ/2025/004921',
    },
    {
      id: 'chk-10',
      category: 'statutory',
      label: 'BPP Interim Registration Report (IRR) on National Database',
      ppaCitation: 'PPA 2007 Section 5(h)',
      requirement: 'Evidence of valid classification on BPP National Database of Federal Contractors, Consultants & Service Providers.',
      verified: true,
      documentRef: 'BPP/IRR/CAT-A/CONSTR/77401',
    },
    {
      id: 'chk-11',
      category: 'financial',
      label: '100% Unconditional Bank Guarantee for Mobilization',
      ppaCitation: 'PPA 2007 Section 35(2)',
      requirement: 'Irrevocable, unconditional bank guarantee issued by a licensed commercial bank for 15% advance payment.',
      verified: true,
      documentRef: project.advancePaymentBankGuaranteeNo || 'BG/FBN/2025/APP-994201',
    },
    {
      id: 'chk-12',
      category: 'statutory',
      label: 'Sworn Anti-Bribery, Collusion & Corruption Affidavit',
      ppaCitation: 'PPA 2007 Section 58(4)',
      requirement: 'Court sworn affidavit verifying that no officer of procuring entity is a director or has financial interest in bidder.',
      verified: true,
      documentRef: 'FHC/ABJ/AFFIDAVIT/ANTI-CORR/2025',
    },
  ]);

  const [activeView, setActiveView] = useState<'memo' | 'voucher' | 'checklist' | 'sops'>('memo');

  const cpaMultiplier = calculateCpaMultiplier(project.nonAdjustableFactor, project.components);
  const currentCostEscalation = (cpaMultiplier - 1.0) * project.contractSumInitial;
  const verifiedCount = checklist.filter((c) => c.verified).length;
  const isFullyCompliant = verifiedCount === checklist.length;

  const toggleCheck = (id: string) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, verified: !item.verified } : item))
    );
  };

  const exportDossierDoc = () => {
    const content = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>BPP Due Diligence Dossier - ${project.contractCode}</title>
<style>
  body { font-family: 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; margin: 40px; color: #1c1917; }
  h1, h2, h3 { text-align: center; text-transform: uppercase; margin: 6px 0; }
  .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 15px; margin-bottom: 25px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th, td { border: 1px solid #333; padding: 8px 10px; font-size: 10pt; }
  th { background-color: #f5f5f4; text-transform: uppercase; font-weight: bold; }
  .meta-box { border: 1px solid #78716c; padding: 14px; margin-bottom: 20px; font-family: Arial, sans-serif; font-size: 10pt; background-color: #fafaf9; }
  .meta-box p { margin: 4px 0; }
  .signature-grid { display: flex; justify-content: space-between; margin-top: 50px; }
</style>
</head>
<body>
<div class="header">
  <h3>FEDERAL REPUBLIC OF NIGERIA</h3>
  <h2>${project.procuringEntity}</h2>
  <p>Directorate of Public Procurement & Due Diligence • Shehu Shagari Way, Central Business District, Abuja, FCT</p>
</div>

<div class="meta-box">
  <p><strong>TO:</strong> The Director-General, Bureau of Public Procurement (BPP), Presidential Villa, Abuja</p>
  <p><strong>DATE:</strong> ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
  <p><strong>THROUGH:</strong> The Honourable Minister / Permanent Secretary, ${project.procuringEntity}</p>
  <p><strong>BPP FILE REF:</strong> BPP/S.1/FED-WORKS/2026/VOL.XI/948</p>
  <p><strong>CONTRACT CODE:</strong> ${project.contractCode}</p>
  <p><strong>PROJECT:</strong> ${project.title}</p>
  <p><strong>RECOMMENDED CONTRACTOR:</strong> ${project.contractorName}</p>
  <p><strong>CERTIFIED CONTRACT SUM:</strong> ${formatFullCurrency(project.contractSumInitial, currency)}</p>
  <p><strong>CURRENT REVISED VALUATION (CPA):</strong> ${formatFullCurrency(project.contractSumInitial * cpaMultiplier, currency)}</p>
</div>

<h2>STATUTORY 12-POINT PRIOR-REVIEW DUE DILIGENCE CHECKLIST (PPA 2007)</h2>
<table>
  <thead>
    <tr>
      <th>No</th>
      <th>Checklist Item</th>
      <th>PPA 2007 Citation</th>
      <th>Status</th>
      <th>Document Reference</th>
    </tr>
  </thead>
  <tbody>
    ${checklist.map((item, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td><strong>${item.label}</strong><br><small>${item.requirement}</small></td>
      <td>${item.ppaCitation}</td>
      <td><strong>${item.verified ? 'VERIFIED (COMPLIANT)' : 'PENDING'}</strong></td>
      <td><code>${item.documentRef}</code></td>
    </tr>
    `).join('')}
  </tbody>
</table>

<div class="signature-grid">
  <div>
    <p>____________________________________</p>
    <p><strong>Director of Procurement</strong><br>${project.procuringEntity}</p>
  </div>
  <div>
    <p>____________________________________</p>
    <p><strong>Permanent Secretary</strong><br>Accounting Officer</p>
  </div>
</div>
</body>
</html>
    `;

    const blob = new Blob([content], { type: 'application/msword;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `BPP_Dossier_Submission_${project.contractCode.replace(/[\/\s]/g, '_')}.doc`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider">
                Enterprise BPP Dossier Generator
              </span>
              <span className="text-xs text-stone-400">
                Official Due Diligence & Ministerial Submission Pack
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 tracking-tight">
              BPP "Certificate of No Objection" Dossier & Prior-Review Pack
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Generate the complete, legally defensible 12-point submission memorandum required by the <strong>Bureau of Public Procurement (BPP)</strong> and Federal Executive Council (FEC) for capital contract awards and statutory Price Adjustment (CPA) approvals.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
            <button
              onClick={exportDossierDoc}
              className="px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all border border-stone-700"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Download Dossier (.doc)
            </button>
            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs flex items-center gap-2 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4" />
              Print Official BPP Memo
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex flex-wrap items-center gap-2 mt-5 pt-4 border-t border-stone-800">
          <button
            onClick={() => setActiveView('memo')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'memo' ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            1. Official Ministerial Submission Memo
          </button>
          <button
            onClick={() => setActiveView('voucher')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'voucher' ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            2. Treasury Form 15 (Capital Payment Voucher)
          </button>
          <button
            onClick={() => setActiveView('checklist')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'checklist' ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            3. Statutory 12-Point Due Diligence Checklist ({verifiedCount}/12)
          </button>
          <button
            onClick={() => setActiveView('sops')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeView === 'sops' ? 'bg-amber-500 text-stone-950' : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            4. Organization Standard Operating Procedures (SOPs)
          </button>
        </div>
      </div>

      {/* VIEW 1: Formal Ministerial Request Memo */}
      {activeView === 'memo' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-300 shadow-sm print:shadow-none print:border-none space-y-6 text-stone-900 font-serif">
          {/* Official Letterhead */}
          <div className="text-center border-b-2 border-stone-900 pb-5 space-y-1">
            <div className="text-xs tracking-widest font-sans font-bold uppercase text-stone-600">
              FEDERAL REPUBLIC OF NIGERIA
            </div>
            <h1 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-stone-950">
              {project.procuringEntity}
            </h1>
            <div className="text-xs text-stone-600 font-sans">
              Directorate of Public Procurement & Due Diligence • Shehu Shagari Way, Central Business District, Abuja, FCT
            </div>
          </div>

          {/* Memorandum Header Info */}
          <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 font-sans text-xs space-y-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div>
                <span className="font-bold text-stone-500 block">TO:</span>
                <span className="font-bold text-stone-900">
                  The Director-General, Bureau of Public Procurement (BPP), Presidential Villa, Abuja
                </span>
              </div>
              <div>
                <span className="font-bold text-stone-500 block">DATE:</span>
                <span className="font-mono font-semibold text-stone-900">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-stone-200">
              <div>
                <span className="font-bold text-stone-500 block">THROUGH:</span>
                <span className="font-semibold text-stone-800">
                  The Honourable Minister / Permanent Secretary, {project.procuringEntity}
                </span>
              </div>
              <div>
                <span className="font-bold text-stone-500 block">BPP FILE REFERENCE:</span>
                <span className="font-mono font-bold text-amber-900">{project.bppCertificateNo || 'BPP/S.1/FED-WORKS/2025/VOL.IX/481'}</span>
              </div>
            </div>
            <div className="pt-2 border-t border-stone-200">
              <span className="font-bold text-stone-500 block">SUBJECT:</span>
              <span className="font-bold text-stone-950 uppercase text-xs sm:text-sm">
                REQUEST FOR ISSUANCE OF STATUTORY "CERTIFICATE OF NO OBJECTION" FOR CONTRACT EXECUTION & ALGORITHMIC CONTRACT PRICE ADJUSTMENT (PPA 2007 SECTIONS 16, 35 & 39)
              </span>
            </div>
          </div>

          {/* Body of Memo */}
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-stone-800 font-serif">
            <p>
              1. <strong>Purpose:</strong> The purpose of this memorandum is to formally convey the procurement evaluation records, technical due diligence, and statutory price indexation model to the Bureau of Public Procurement (BPP) for the issuance of a <strong>Certificate of "No Objection"</strong> in favor of <strong>{project.contractorName}</strong> for the contract: <em>"{project.title}"</em> (Contract Code: <code>{project.contractCode}</code>).
            </p>

            <p>
              2. <strong>Budgetary Provision & Appropriation:</strong> In strict compliance with <strong>Section 16(1)(b) of the Public Procurement Act 2007</strong>, this procurement is captured under the current Federal Capital Budget with dedicated Treasury appropriation code <code>FGN/CAP/2025/LINE-882104</code>. No contract splitting occurred (Section 16(2)).
            </p>

            {/* Contract Summary Table */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 font-sans text-xs space-y-2 my-3">
              <div className="font-bold uppercase text-stone-700 tracking-wider text-[11px] pb-1 border-b border-stone-200">
                Audited Contract Metadata & Approval Parameters
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <span className="text-stone-500 block text-[10px]">Initial Contract Sum:</span>
                  <span className="font-mono font-bold text-stone-900">{formatFullCurrency(project.contractSumInitial, currency)}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Contract Duration:</span>
                  <span className="font-mono font-bold text-stone-900">{project.durationMonths} Months</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Advance Payment (15%):</span>
                  <span className="font-mono font-bold text-stone-900">{formatCurrency(project.contractSumInitial * project.advancePaymentRate, currency)}</span>
                </div>
                <div>
                  <span className="text-stone-500 block text-[10px]">Bank Guarantee Ref:</span>
                  <span className="font-mono font-bold text-stone-900">{project.advancePaymentBankGuaranteeNo}</span>
                </div>
              </div>
            </div>

            <p>
              3. <strong>Statutory Price Adjustment (CPA) Formula (PPA Section 39):</strong> To shield the Federal Government from arbitrary, open-ended variation claims and eliminate contractor abandonment, the Special Conditions of Contract (SCC) mandate the standard FIDIC / BPP dynamic mathematical formula:
            </p>

            {/* Formula box */}
            <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200 font-mono text-xs text-amber-950 space-y-1">
              <div className="font-bold">Pn = {project.nonAdjustableFactor.toFixed(2)} + {project.components.map(c => `${c.weight.toFixed(2)}(${c.symbol}n/${c.symbol}o)`).join(' + ')}</div>
              <div className="text-[11px] text-amber-800 font-sans">
                • Current Audited Multiplier Pn: <strong>{cpaMultiplier.toFixed(4)}</strong> (Indicating an audited market escalation factor of <strong>{((cpaMultiplier - 1) * 100).toFixed(2)}%</strong> verified against published NBS / NMDPRA price indices).
              </div>
            </div>

            <p>
              4. <strong>Statutory Due Diligence Clearance:</strong> The Ministerial Tenders Board confirms that the recommended contractor has been screened and certified for:
              <br />• Valid Federal Inland Revenue Service (FIRS) Tax Clearance Certificate (TCC)
              <br />• National Pension Commission (PENCOM) Compliance Certificate
              <br />• Industrial Training Fund (ITF) Contribution Certificate
              <br />• BPP Interim Registration Report (IRR) Classification Grade A
              <br />• Sworn Anti-Collusion Affidavit under Section 58 of the Public Procurement Act.
            </p>

            <p>
              5. <strong>Recommendation:</strong> In view of the total compliance with the provisions of the Public Procurement Act 2007, the Bureau is hereby formally requested to issue its statutory <strong>Certificate of "No Objection"</strong> to enable presentation to the Federal Executive Council (FEC) for final award ratification.
            </p>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-stone-300 grid grid-cols-2 sm:grid-cols-3 gap-6 font-sans text-xs">
            <div className="space-y-6">
              <div className="border-b border-stone-400 w-40 h-8"></div>
              <div>
                <div className="font-bold text-stone-900">Engr. Kabir Al-Hassan, FNSE</div>
                <div className="text-stone-500 text-[11px]">Director of Procurement</div>
                <div className="text-stone-400 text-[10px]">Ministry Procurement Directorate</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-b border-stone-400 w-40 h-8"></div>
              <div>
                <div className="font-bold text-stone-900">Dr. Ngozi Okonjo-Bello, FNIQS</div>
                <div className="text-stone-500 text-[11px]">Chief Resident Quantity Surveyor</div>
                <div className="text-stone-400 text-[10px]">NIQS Registered Reg. #04419</div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="border-b border-stone-400 w-40 h-8"></div>
              <div>
                <div className="font-bold text-stone-900">Dr. Raymond Adebayo, mni</div>
                <div className="text-stone-500 text-[11px]">Permanent Secretary / Accounting Officer</div>
                <div className="text-stone-400 text-[10px]">PPA Section 20 Accounting Officer</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: Treasury Form 15 Capital Payment Voucher */}
      {activeView === 'voucher' && (
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-300 shadow-sm print:shadow-none print:border-none space-y-6 text-stone-900 font-serif">
          {/* Official Treasury Voucher Header */}
          <div className="border-b-2 border-stone-900 pb-4 space-y-3">
            <div className="flex items-center justify-between font-sans">
              <AfriProcureLogo size="sm" variant="badge" />
              <div className="text-right">
                <span className="text-[10px] font-mono uppercase bg-amber-100 text-amber-950 px-2 py-0.5 rounded font-bold border border-amber-300">
                  TREASURY VOUCHER FORM 15
                </span>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5">OAGF Mandatory Standard</p>
              </div>
            </div>

            <div className="text-center space-y-1 pt-1">
              <div className="text-[10px] tracking-widest font-sans font-bold uppercase text-stone-500">
                FEDERAL REPUBLIC OF NIGERIA • OFFICE OF THE ACCOUNTANT-GENERAL OF THE FEDERATION
              </div>
              <h2 className="text-xl font-black font-sans tracking-wide text-stone-900">
                TREASURY FORM 15 (CAPITAL EXPENDITURE PAYMENT VOUCHER)
              </h2>
              <div className="text-xs font-mono text-stone-600">
                Sub-Treasury Capital Warrant Discharge • PPA 2007 Section 37 Compliance
              </div>
            </div>
          </div>

          {/* Mandate Accounting Metadata Table */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono border border-stone-300 p-3 rounded-lg bg-stone-50">
            <div>
              <span className="text-stone-500 text-[10px] block">WARRANT MANDATE NO:</span>
              <strong className="text-stone-900">WRT/FED/2026/CAP-0914</strong>
            </div>
            <div>
              <span className="text-stone-500 text-[10px] block">MDA APPROPRIATION CODE:</span>
              <strong className="text-stone-900">0234001001-CAP-HWY</strong>
            </div>
            <div>
              <span className="text-stone-500 text-[10px] block">STATION & STATE:</span>
              <strong className="text-stone-900">HQ ABUJA, FCT</strong>
            </div>
            <div>
              <span className="text-stone-500 text-[10px] block">FINANCIAL YEAR:</span>
              <strong className="text-stone-900">2026 CAPITAL VOTE</strong>
            </div>
          </div>

          {/* Beneficiary Payee Info */}
          <div className="p-3 border border-stone-300 rounded-lg text-xs space-y-1 font-sans">
            <div className="flex flex-wrap items-center justify-between">
              <span className="text-stone-500 font-semibold">PAYEE / CONTRACTOR:</span>
              <strong className="text-stone-900 font-mono text-sm">{project.contractorName}</strong>
            </div>
            <div className="flex flex-wrap items-center justify-between text-[11px] text-stone-600 font-mono">
              <span>RC NUMBER: RC-149204 | TIN: 10492819-0001</span>
              <span>BANK: FIRST BANK OF NIGERIA PLC | A/C: 2049182049</span>
            </div>
            <div className="text-[11px] text-stone-500 pt-1 border-t border-stone-200">
              PURPOSE: Interim Payment Certificate (IPC-04) Valuation including statutory Clause 13.8 Price Adjustment (CPA) for {project.title}.
            </div>
          </div>

          {/* Statutory Financial Computation Grid */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-stone-300 border-collapse font-mono">
              <thead className="bg-stone-100 border-b border-stone-300 text-[11px] font-sans font-bold uppercase">
                <tr>
                  <th className="p-2.5 border-r border-stone-300">Accounting Description</th>
                  <th className="p-2.5 border-r border-stone-300">Reference / Statutory Basis</th>
                  <th className="p-2.5 text-right">Amount ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200">
                <tr>
                  <td className="p-2.5 border-r border-stone-300 font-sans font-semibold">
                    1. Certified Value of Measured Permanent Civil Works Executed
                  </td>
                  <td className="p-2.5 border-r border-stone-300 text-stone-500 text-[11px]">
                    IPC-04 Bill of Quantities Milestone
                  </td>
                  <td className="p-2.5 text-right font-bold">
                    {formatFullCurrency(385000000, currency)}
                  </td>
                </tr>
                <tr className="bg-amber-50/50">
                  <td className="p-2.5 border-r border-stone-300 font-sans font-semibold text-amber-900">
                    2. Statutory Contract Price Adjustment (CPA Escalation)
                  </td>
                  <td className="p-2.5 border-r border-stone-300 text-amber-800 text-[11px]">
                    FIDIC 13.8 & NBS Building Indices (Pn: {cpaMultiplier.toFixed(4)}x)
                  </td>
                  <td className="p-2.5 text-right font-bold text-amber-900">
                    +{formatFullCurrency(385000000 * (cpaMultiplier - 1.0), currency)}
                  </td>
                </tr>
                <tr className="font-bold bg-stone-100">
                  <td colSpan={2} className="p-2.5 border-r border-stone-300 uppercase font-sans text-stone-800">
                    GROSS CERTIFIED VALUATION (A + B)
                  </td>
                  <td className="p-2.5 text-right text-stone-900">
                    {formatFullCurrency(385000000 * cpaMultiplier, currency)}
                  </td>
                </tr>

                {/* Deductions Header */}
                <tr className="bg-stone-50 text-[11px] font-sans uppercase font-bold text-stone-600">
                  <td colSpan={3} className="p-2 border-b border-stone-300">
                    Statutory Deductions & Amortizations At Source:
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-stone-300 pl-6 text-stone-700 font-sans">
                    a. Advance Mobilization Recovery (Amortization @ 15%)
                  </td>
                  <td className="p-2 border-r border-stone-300 text-stone-500 text-[11px]">
                    PPA 2007 Section 35(3)
                  </td>
                  <td className="p-2 text-right text-red-700">
                    -{formatFullCurrency(385000000 * 0.15, currency)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-stone-300 pl-6 text-stone-700 font-sans">
                    b. Defects Liability Retention Fund (5%)
                  </td>
                  <td className="p-2 border-r border-stone-300 text-stone-500 text-[11px]">
                    FIDIC Sub-Clause 14.3
                  </td>
                  <td className="p-2 text-right text-red-700">
                    -{formatFullCurrency((385000000 * cpaMultiplier) * 0.05, currency)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-stone-300 pl-6 text-stone-700 font-sans">
                    c. Withholding Tax (WHT 5% - Federal Inland Revenue Service)
                  </td>
                  <td className="p-2 border-r border-stone-300 text-stone-500 text-[11px]">
                    CITA 2007 Section 81
                  </td>
                  <td className="p-2 text-right text-red-700">
                    -{formatFullCurrency((385000000 * cpaMultiplier) * 0.05, currency)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-stone-300 pl-6 text-stone-700 font-sans">
                    d. Value Added Tax (VAT 7.5% Remittance to FIRS)
                  </td>
                  <td className="p-2 border-r border-stone-300 text-stone-500 text-[11px]">
                    VAT Act 2004 (as amended)
                  </td>
                  <td className="p-2 text-right text-red-700">
                    -{formatFullCurrency((385000000 * cpaMultiplier) * 0.075, currency)}
                  </td>
                </tr>
                <tr>
                  <td className="p-2 border-r border-stone-300 pl-6 text-stone-700 font-sans">
                    e. Federal Stamp Duties Charge (0.5%)
                  </td>
                  <td className="p-2 border-r border-stone-300 text-stone-500 text-[11px]">
                    Stamp Duties Act Cap S8
                  </td>
                  <td className="p-2 text-right text-red-700">
                    -{formatFullCurrency((385000000 * cpaMultiplier) * 0.005, currency)}
                  </td>
                </tr>

                {/* Net Warrant Total */}
                {(() => {
                  const grossVal = 385000000 * cpaMultiplier;
                  const advRec = 385000000 * 0.15;
                  const retention = grossVal * 0.05;
                  const wht = grossVal * 0.05;
                  const vat = grossVal * 0.075;
                  const stamp = grossVal * 0.005;
                  const totalDeductions = advRec + retention + wht + vat + stamp;
                  const netPayable = grossVal - totalDeductions;

                  return (
                    <tr className="bg-emerald-100 text-emerald-950 font-black text-sm border-t-2 border-stone-900">
                      <td colSpan={2} className="p-3 border-r border-stone-400 font-sans uppercase">
                        NET WARRANT AMOUNT DISCHARGED FOR DIRECT SETTLEMENT (E-PAYMENT)
                      </td>
                      <td className="p-3 text-right">
                        {formatFullCurrency(netPayable, currency)}
                      </td>
                    </tr>
                  );
                })()}
              </tbody>
            </table>
          </div>

          {/* Statutory Sign-Off & Attestation Ledger */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t-2 border-stone-900 text-xs font-sans">
            <div className="space-y-3">
              <div className="border-b border-stone-400 h-8"></div>
              <div>
                <div className="font-bold text-stone-900">Engr. T. K. Balogun</div>
                <div className="text-stone-500 text-[10px]">Project Resident Engineer</div>
                <div className="text-stone-400 text-[9px]">COREN Reg. #R.19420</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="border-b border-stone-400 h-8"></div>
              <div>
                <div className="font-bold text-stone-900">QS. Amina Bello, FNIQS</div>
                <div className="text-stone-500 text-[10px]">Chief Resident QS</div>
                <div className="text-stone-400 text-[9px]">NIQS Reg. #04419</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="border-b border-stone-400 h-8"></div>
              <div>
                <div className="font-bold text-stone-900">Mal. Ibrahim Gana</div>
                <div className="text-stone-500 text-[10px]">Director, Procurement</div>
                <div className="text-stone-400 text-[9px]">BPP Certified Officer</div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="border-b border-stone-400 h-8"></div>
              <div>
                <div className="font-bold text-stone-900">Alh. Sani Mohammed</div>
                <div className="text-stone-500 text-[10px]">Director, Finance & Accounts (F&A)</div>
                <div className="text-stone-400 text-[9px]">ICAN / ANAN Certified</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: 12-Point Due Diligence Checklist */}
      {activeView === 'checklist' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
            <div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Mandatory BPP Prior-Review Statutory Audit Checklist (12 Checkpoints)
                </h3>
              </div>
              <p className="text-xs text-stone-600 mt-0.5">
                Every federal or state infrastructure contract must satisfy all 12 checkpoints before the BPP issues a Certificate of No Objection.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  isFullyCompliant
                    ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                    : 'bg-amber-100 text-amber-900 border-amber-300'
                }`}
              >
                {verifiedCount} of 12 Points Cleared
              </span>
            </div>
          </div>

          {/* Checklist Items */}
          <div className="space-y-2.5">
            {checklist.map((item) => (
              <div
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className={`p-3.5 sm:p-4 rounded-xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
                  item.verified
                    ? 'bg-stone-50/80 border-stone-200 hover:border-stone-300'
                    : 'bg-amber-50/40 border-amber-300/80'
                }`}
              >
                <div className="flex items-start gap-3">
                  <button
                    type="button"
                    className={`mt-0.5 w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                      item.verified
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-white border-stone-300 text-transparent hover:border-emerald-500'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </button>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-xs sm:text-sm text-stone-900">
                        {item.label}
                      </span>
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                        {item.ppaCitation}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      {item.requirement}
                    </p>
                    <div className="text-[11px] font-mono text-stone-500">
                      Audit Reference: <span className="font-bold text-stone-700">{item.documentRef}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 self-center">
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                      item.verified ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {item.verified ? 'Verified' : 'Pending'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: Organizational Standard Operating Procedures (SOPs) */}
      {activeView === 'sops' && (
        <div className="space-y-5">
          {/* Operational Pillars */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                Enterprise Procurement Policy Pillars for Nigerian Organizations
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {ORGANIZATIONAL_PROCUREMENT_BLUEPRINT.operationalPillars.map((pillar, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      Pillar #{idx + 1}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">{pillar.targetAudience}</span>
                  </div>
                  <h4 className="font-extrabold text-stone-900 text-sm">
                    {pillar.title}
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {pillar.description}
                  </p>
                  <div className="pt-2 border-t border-stone-200 space-y-1">
                    {pillar.actionItems.map((action, aIdx) => (
                      <div key={aIdx} className="text-[11px] text-stone-700 flex items-center gap-1.5">
                        <ChevronRight className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional SOP Matrix */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 border border-stone-800 shadow-md space-y-4">
            <div className="flex items-center gap-2 text-amber-400">
              <Building2 className="w-5 h-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                Institutional Standard Operating Procedures (SOPs)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {ORGANIZATIONAL_PROCUREMENT_BLUEPRINT.institutionalSops.map((sopItem, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-stone-800/80 border border-stone-700/70 space-y-1.5">
                  <span className="text-amber-400 font-bold block text-xs uppercase tracking-wider">
                    {sopItem.entity}
                  </span>
                  <p className="text-stone-300 leading-relaxed">
                    {sopItem.sop}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
