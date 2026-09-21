import React from 'react';
import { ContractProject, CurrencyCode } from '../types';
import { calculateCpaMultiplier, formatCurrency, formatFullCurrency, generateIpcSchedule } from '../utils/cpaMath';
import { X, Printer, ShieldCheck, Award } from 'lucide-react';
import { AfriProcureLogo } from './AfriProcureLogo';

interface AuditCertificateModalProps {
  project: ContractProject;
  currency: CurrencyCode;
  month: number;
  onClose: () => void;
}

export const AuditCertificateModal: React.FC<AuditCertificateModalProps> = ({
  project,
  currency,
  month,
  onClose,
}) => {
  const schedule = generateIpcSchedule(project, 0.022);
  const ipc = schedule.find((s) => s.month === month) || schedule[0];
  const Pn = calculateCpaMultiplier(project.nonAdjustableFactor, project.components);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-stone-300">
        {/* Modal Top Bar (Hidden in Print) */}
        <div className="no-print px-6 py-4 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <span className="font-bold text-sm">
              Official Price Adjustment & Interim Payment Certificate (IPC-{ipc.ipcNumber.toString().padStart(2, '0')})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded text-stone-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Body */}
        <div className="p-6 sm:p-10 overflow-y-auto font-sans text-stone-900 bg-white leading-relaxed text-xs sm:text-sm">
          {/* Official Letterhead */}
          <div className="pb-6 border-b-2 border-stone-900 space-y-3">
            <div className="flex items-center justify-between gap-4">
              <AfriProcureLogo size="md" variant="badge" />
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 rounded bg-stone-100 text-stone-800 font-mono text-[10px] font-bold border border-stone-300">
                  STATUTORY AUDIT FORM CPA-01
                </span>
                <p className="text-[10px] text-stone-500 font-mono mt-0.5">Cert Ref: BPP/RR/CPA/{ipc.ipcNumber.toString().padStart(4, '0')}</p>
              </div>
            </div>

            <div className="text-center space-y-1 pt-1">
              <div className="text-[11px] uppercase tracking-widest font-extrabold text-stone-600">
                Federal Republic of Nigeria • Bureau of Public Procurement (BPP) Compliant
              </div>
              <h1 className="text-lg sm:text-xl font-black text-stone-900 tracking-tight uppercase">
                INTERIM PAYMENT CERTIFICATE & STATUTORY PRICE ADJUSTMENT VALUATION
              </h1>
              <div className="text-xs font-serif italic text-stone-600">
                Issued pursuant to Section 39 of the Public Procurement Act (PPA 2007) & FIDIC Conditions of Contract (Pink Book Clause 13.8)
              </div>
            </div>
          </div>

          {/* Certificate Metadata Grid */}
          <div className="grid grid-cols-2 gap-4 py-4 border-b border-stone-200 text-xs">
            <div>
              <span className="text-stone-500 block uppercase font-bold text-[10px]">Procuring Entity (Client):</span>
              <span className="font-bold text-stone-900">{project.procuringEntity}</span>
            </div>
            <div>
              <span className="text-stone-500 block uppercase font-bold text-[10px]">Contract Code / Ref:</span>
              <span className="font-mono font-bold text-stone-900">{project.contractCode}</span>
            </div>
            <div>
              <span className="text-stone-500 block uppercase font-bold text-[10px]">Contractor:</span>
              <span className="font-bold text-stone-900">{project.contractorName}</span>
            </div>
            <div>
              <span className="text-stone-500 block uppercase font-bold text-[10px]">BPP Certificate of "No Objection":</span>
              <span className="font-mono font-bold text-amber-900">{project.bppCertificateNo || 'BPP/S.1/FED-WORKS/2025/VOL.IX/481'}</span>
            </div>
            <div>
              <span className="text-stone-500 block uppercase font-bold text-[10px]">Advance Payment Bank Guarantee (PPA Sec 35):</span>
              <span className="font-mono font-medium text-stone-900">{project.advancePaymentBankGuaranteeNo || 'BG/FBN/2025/APP-994201'}</span>
            </div>
            <div>
              <span className="text-stone-500 block uppercase font-bold text-[10px]">Contract Title:</span>
              <span className="font-semibold text-stone-900">{project.title}</span>
            </div>
            <div>
              <span className="text-stone-500 block uppercase font-bold text-[10px]">Valuation Period:</span>
              <span className="font-semibold text-stone-900">{ipc.monthName} (Milestone {ipc.scheduledProgressPct.toFixed(0)}% Progress)</span>
            </div>
            <div>
              <span className="text-stone-500 block uppercase font-bold text-[10px]">Base Date:</span>
              <span className="font-mono text-stone-900">{project.baseDate} (28 days prior to tender opening)</span>
            </div>
          </div>

          {/* Mathematical CPA Formula Proof */}
          <div className="py-4 border-b border-stone-200 space-y-3">
            <h3 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
              1. Statutory Mathematical Formula Derivation (FIDIC 13.8)
            </h3>
            <div className="p-3.5 bg-stone-50 rounded-lg border border-stone-300 font-mono text-xs text-stone-800">
              <div className="font-bold text-stone-900 mb-1">
                P<sub>n</sub> = a<sub>0</sub> + ∑ [ b<sub>i</sub> × (M<sub>in</sub> / M<sub>io</sub>) ]
              </div>
              <div className="text-stone-700 leading-relaxed text-[11px]">
                P<sub>n</sub> = {project.nonAdjustableFactor.toFixed(2)} [Fixed Overhead]
                {project.components.map((c) => {
                  const r = (c.currentValue / c.baseValue).toFixed(3);
                  return ` + [${c.weight.toFixed(2)} × (${c.currentValue.toLocaleString()} / ${c.baseValue.toLocaleString()} = ${r})]`;
                })}
              </div>
              <div className="mt-2 pt-2 border-t border-stone-200 font-bold text-amber-900 flex justify-between">
                <span>Certified Multiplier P<sub>n</sub>:</span>
                <span>{ipc.priceAdjustmentMultiplier.toFixed(4)}x (+{((ipc.priceAdjustmentMultiplier - 1) * 100).toFixed(2)}% Escalation)</span>
              </div>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="py-4 border-b border-stone-200 space-y-3">
            <h3 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
              2. Milestone Valuation & Deductions Summary
            </h3>
            <table className="w-full text-left text-xs border border-stone-300">
              <thead className="bg-stone-100 font-bold text-stone-700 border-b border-stone-300">
                <tr>
                  <th className="p-2">Item Description</th>
                  <th className="p-2 text-right">Calculation Basis</th>
                  <th className="p-2 text-right font-mono">Amount ({currency})</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-200 font-mono text-xs">
                <tr>
                  <td className="p-2 font-sans font-medium">Gross Unadjusted Work Executed in Period</td>
                  <td className="p-2 text-right text-stone-500 font-sans">Bill of Quantities</td>
                  <td className="p-2 text-right">{formatCurrency(ipc.grossBillOfQuantities, currency)}</td>
                </tr>
                <tr className="bg-amber-50/50">
                  <td className="p-2 font-sans font-bold text-amber-900">
                    Statutory Price Adjustment Escalation (ΔP)
                  </td>
                  <td className="p-2 text-right text-amber-900 font-sans">
                    Gross × (P<sub>n</sub> - 1)
                  </td>
                  <td className="p-2 text-right font-bold text-amber-900">
                    +{formatCurrency(ipc.escalationAmount, currency)}
                  </td>
                </tr>
                <tr className="font-bold bg-stone-50">
                  <td className="p-2 font-sans">Total Adjusted Gross Valuation</td>
                  <td className="p-2 text-right text-stone-500 font-sans">Gross × P<sub>n</sub></td>
                  <td className="p-2 text-right">{formatCurrency(ipc.adjustedGrossValue, currency)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans text-stone-600">Less: Advance Payment Amortization (PPA Sec 35)</td>
                  <td className="p-2 text-right text-stone-500 font-sans">Monthly Recovery (Bank Guarantee Sec. 35(2))</td>
                  <td className="p-2 text-right text-red-700">-{formatCurrency(ipc.advancePaymentDeduction, currency)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans text-stone-600">Less: Statutory Retention (5.0% Defects Liability)</td>
                  <td className="p-2 text-right text-stone-500 font-sans">FIDIC 14.3 / BPP Standard Bidding Doc</td>
                  <td className="p-2 text-right text-red-700">-{formatCurrency(ipc.retentionDeduction, currency)}</td>
                </tr>
                <tr>
                  <td className="p-2 font-sans text-stone-600">Less: Withholding Tax (WHT 5.0%)</td>
                  <td className="p-2 text-right text-stone-500 font-sans">FIRS Statutory Remittance</td>
                  <td className="p-2 text-right text-red-700">-{formatCurrency(ipc.whtDeduction, currency)}</td>
                </tr>
                <tr className="bg-emerald-50 text-emerald-950 font-bold text-sm">
                  <td className="p-2.5 font-sans">NET CERTIFIED AMOUNT PAYABLE TO CONTRACTOR</td>
                  <td className="p-2.5 text-right font-sans text-xs">For Immediate Payment</td>
                  <td className="p-2.5 text-right font-black text-emerald-800">
                    {formatCurrency(ipc.netPayableToContractor, currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Statutory Signatories & Endorsements */}
          <div className="pt-6 space-y-4">
            <h3 className="font-bold text-stone-900 uppercase text-xs tracking-wider">
              3. Verification Signatures & Professional Endorsements
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-[11px] pt-4">
              <div className="border-t border-stone-400 pt-2 space-y-1">
                <span className="font-bold text-stone-900 block">Registered Quantity Surveyor</span>
                <span className="text-stone-500 block">NIQS / QSRBN Seal</span>
                <span className="font-serif italic text-stone-400 block pt-3">Signed: ______________</span>
              </div>

              <div className="border-t border-stone-400 pt-2 space-y-1">
                <span className="font-bold text-stone-900 block">Resident Supervising Engineer</span>
                <span className="text-stone-500 block">COREN Registered</span>
                <span className="font-serif italic text-stone-400 block pt-3">Signed: ______________</span>
              </div>

              <div className="border-t border-stone-400 pt-2 space-y-1">
                <span className="font-bold text-stone-900 block">Director, Public Procurement</span>
                <span className="text-stone-500 block">MDA Tenders Board</span>
                <span className="font-serif italic text-stone-400 block pt-3">Signed: ______________</span>
              </div>

              <div className="border-t border-stone-400 pt-2 space-y-1">
                <span className="font-bold text-stone-900 block">Contractor Representative</span>
                <span className="text-stone-500 block">Managing Director / CEO</span>
                <span className="font-serif italic text-stone-400 block pt-3">Signed: ______________</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
