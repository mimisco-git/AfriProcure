import React, { useState } from 'react';
import { ContractProject, CurrencyCode, StatutoryClaim } from '../types';
import { DEFAULT_CLAIMS } from '../data/defaultData';
import { calculateDelayedPaymentInterest, calculateProlongationClaim, formatCurrency, formatFullCurrency, formatPercent } from '../utils/cpaMath';
import { Scale, Clock, AlertTriangle, FileText, CheckCircle2, ChevronRight, Calculator, Plus, Printer, ShieldAlert, DollarSign, Building2 } from 'lucide-react';

interface ClaimsDisputeCenterProps {
  project: ContractProject;
  currency: CurrencyCode;
}

export const ClaimsDisputeCenter: React.FC<ClaimsDisputeCenterProps> = ({ project, currency }) => {
  const [claims, setClaims] = useState<StatutoryClaim[]>(DEFAULT_CLAIMS);
  const [selectedClaimId, setSelectedClaimId] = useState<string>(DEFAULT_CLAIMS[0]?.id || 'claim-001');

  // Interactive Interest Calculator state
  const [calcAmount, setCalcAmount] = useState<number>(750000000); // ₦750 Million
  const [calcDelayedDays, setCalcDelayedDays] = useState<number>(120);
  const [calcMprRate, setCalcMprRate] = useState<number>(0.2725); // 27.25% CBN MPR
  const [calcSpread, setCalcSpread] = useState<number>(0.02); // 2.0% Commercial spread

  // Interactive Prolongation Calculator state
  const [eotDays, setEotDays] = useState<number>(60);
  const [eotDailyOverhead, setEotDailyOverhead] = useState<number>(1200000); // ₦1.2M/day
  const [eotDailyPlant, setEotDailyPlant] = useState<number>(2500000); // ₦2.5M/day
  const [eotDailyStaff, setEotDailyStaff] = useState<number>(450000); // ₦450k/day

  const selectedClaim = claims.find((c) => c.id === selectedClaimId) || claims[0];

  const interestResult = calculateDelayedPaymentInterest(
    calcAmount,
    calcDelayedDays,
    calcMprRate,
    calcSpread
  );

  const prolongationResult = calculateProlongationClaim(
    eotDays,
    eotDailyOverhead,
    eotDailyPlant,
    eotDailyStaff
  );

  const totalClaimsValue = claims.reduce((sum, c) => {
    return sum + (c.claimType === 'delay_interest' ? c.compoundedInterest : (c.eotTotalClaim || 0));
  }, 0);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold text-xs uppercase tracking-wider">
                FIDIC 20.1 & PPA 2007 SEC 37/54
              </span>
              <span className="text-xs text-stone-500">
                Statutory Claims & Delayed Payment Resolution
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
              Contractor Claims, Delayed Payment Interest & EOT Arbitrator
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              When MDAs fail to honor Interim Payment Certificates (IPCs) within the statutory 60-day window, Nigerian law mandates compounding financing interest (CBN MPR + 2%). Prolongation claims due to employer delays (Right-of-Way, design variations) are quantified under international FIDIC standards.
            </p>
          </div>

          <div className="bg-stone-900 text-white rounded-xl p-4 min-w-[260px] border border-stone-800 space-y-2">
            <div className="text-[11px] uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5" />
              Active Project Contingent Liability
            </div>
            <div className="text-2xl font-black font-mono text-amber-300">
              {formatCurrency(totalClaimsValue, currency)}
            </div>
            <div className="text-xs text-stone-400 flex items-center justify-between pt-2 border-t border-stone-800">
              <span>Claims Filed: <strong>{claims.length} Cases</strong></span>
              <span className="text-emerald-400 font-mono text-[11px]">CBN MPR: {(calcMprRate * 100).toFixed(2)}%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Two-Column Workstation: Left is Interactive Simulators, Right is Registered Claims Dossier */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Interactive Calculators */}
        <div className="lg:col-span-7 space-y-6">
          {/* 1. Delayed Payment Interest Calculator */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-amber-50 text-amber-700">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Statutory Delayed IPC Payment Interest Engine
                  </h3>
                  <p className="text-xs text-stone-500">
                    PPA 2007 Section 37(1) & FIDIC Pink Book Sub-Clause 14.8
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-sm bg-stone-100 text-stone-700">
                Compound Frequency: Monthly
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Certified IPC Valuation ({currency})
                </label>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono font-bold text-stone-900 focus:outline-hidden focus:border-amber-500"
                />
                <span className="text-[10px] text-stone-500">Unpaid net certified amount</span>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Days Delayed Past Statutory 60 Days
                </label>
                <input
                  type="number"
                  value={calcDelayedDays}
                  onChange={(e) => setCalcDelayedDays(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono font-bold text-stone-900 focus:outline-hidden focus:border-amber-500"
                />
                <span className="text-[10px] text-amber-700 font-medium">
                  {Math.round(calcDelayedDays / 30)} Months default period
                </span>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  CBN Monetary Policy Rate (MPR)
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.15"
                    max="0.35"
                    step="0.0025"
                    value={calcMprRate}
                    onChange={(e) => setCalcMprRate(parseFloat(e.target.value))}
                    className="flex-1 accent-amber-600 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-stone-900 w-14 text-right">
                    {(calcMprRate * 100).toFixed(2)}%
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">Current official CBN benchmark</span>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Statutory Commercial Spread
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0.01"
                    max="0.05"
                    step="0.005"
                    value={calcSpread}
                    onChange={(e) => setCalcSpread(parseFloat(e.target.value))}
                    className="flex-1 accent-stone-700 cursor-pointer"
                  />
                  <span className="font-mono font-bold text-stone-900 w-14 text-right">
                    {(calcSpread * 100).toFixed(1)}%
                  </span>
                </div>
                <span className="text-[10px] text-stone-500">Statutory margin (+2.0% standard)</span>
              </div>
            </div>

            {/* Interest Result Card */}
            <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-4 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-amber-200/60 pb-2">
                <span className="text-amber-900 font-bold uppercase tracking-wider text-[11px]">
                  Accrued Compounding Financing Interest:
                </span>
                <span className="text-lg font-black text-amber-900 font-mono">
                  {formatCurrency(interestResult.interestAmount, currency)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-amber-800">
                <div>
                  <span className="text-amber-600/80 block">Effective Rate:</span>
                  <strong>{(interestResult.effectiveAnnualRate * 100).toFixed(2)}% p.a.</strong>
                </div>
                <div>
                  <span className="text-amber-600/80 block">Delay Period:</span>
                  <strong>{interestResult.delayMonths.toFixed(1)} Months</strong>
                </div>
                <div>
                  <span className="text-amber-600/80 block">Total Due:</span>
                  <strong>{formatCurrency(interestResult.totalPayableWithInterest, currency)}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Extension of Time (EOT) Prolongation Cost Evaluator */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-stone-900">
                    Extension of Time (EOT) & Prolongation Overhead Evaluator
                  </h3>
                  <p className="text-xs text-stone-500">
                    FIDIC Red/Pink Sub-Clause 8.4, 8.5 & 20.1
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-800">
                Site Overhead Engine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Employer Delay Period (Days)
                </label>
                <input
                  type="number"
                  value={eotDays}
                  onChange={(e) => setEotDays(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono font-bold text-stone-900 focus:outline-hidden focus:border-indigo-500"
                />
                <span className="text-[10px] text-stone-500">e.g. Undelivered Right-of-Way, redesign delays</span>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Daily General Site Overhead ({currency}/day)
                </label>
                <input
                  type="number"
                  value={eotDailyOverhead}
                  onChange={(e) => setEotDailyOverhead(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono font-bold text-stone-900 focus:outline-hidden focus:border-indigo-500"
                />
                <span className="text-[10px] text-stone-500">Scaffolding, insurance, utilities, site security</span>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Daily Idle Heavy Plant & Equipment ({currency}/day)
                </label>
                <input
                  type="number"
                  value={eotDailyPlant}
                  onChange={(e) => setEotDailyPlant(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono font-bold text-stone-900 focus:outline-hidden focus:border-indigo-500"
                />
                <span className="text-[10px] text-stone-500">Idle excavators, asphalt pavers, batching plant holding</span>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">
                  Daily Resident Key Staff Salaries ({currency}/day)
                </label>
                <input
                  type="number"
                  value={eotDailyStaff}
                  onChange={(e) => setEotDailyStaff(Number(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono font-bold text-stone-900 focus:outline-hidden focus:border-indigo-500"
                />
                <span className="text-[10px] text-stone-500">Project Manager, Resident Engineers, QS</span>
              </div>
            </div>

            {/* Prolongation Result Card */}
            <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 text-xs space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-200/60 pb-2">
                <span className="text-indigo-950 font-bold uppercase tracking-wider text-[11px]">
                  Total Certified Prolongation Cost Claim:
                </span>
                <span className="text-lg font-black text-indigo-950 font-mono">
                  {formatCurrency(prolongationResult.totalClaim, currency)}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] font-mono text-indigo-900">
                <div>
                  <span className="text-indigo-700/80 block">Overhead Subtotal:</span>
                  <strong>{formatCurrency(prolongationResult.overheadSubtotal, currency)}</strong>
                </div>
                <div>
                  <span className="text-indigo-700/80 block">Idle Equipment:</span>
                  <strong>{formatCurrency(prolongationResult.plantIdleSubtotal, currency)}</strong>
                </div>
                <div>
                  <span className="text-indigo-700/80 block">Staff Retention:</span>
                  <strong>{formatCurrency(prolongationResult.staffSubtotal, currency)}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Registered Claims Dossier & Notice Generator */}
        <div className="lg:col-span-5 space-y-6">
          {/* Claim Case Selector */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center justify-between">
              <span>Active Claims Log</span>
              <span className="text-xs font-mono font-normal text-stone-500">{claims.length} registered</span>
            </h3>

            <div className="space-y-2.5">
              {claims.map((claim) => (
                <button
                  key={claim.id}
                  onClick={() => setSelectedClaimId(claim.id)}
                  className={`w-full text-left p-3 rounded-xl border transition-all ${
                    selectedClaimId === claim.id
                      ? 'bg-amber-50/80 border-amber-400 shadow-xs'
                      : 'bg-stone-50 border-stone-200 hover:bg-stone-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-stone-900 font-mono">{claim.id}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      claim.status === 'disputed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {claim.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-semibold text-stone-800 line-clamp-1 mb-1">
                    {claim.title}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-stone-500 font-mono">
                    <span>Delay: {claim.delayedDays} Days</span>
                    <strong className="text-stone-900 font-bold">
                      {formatCurrency(claim.claimType === 'delay_interest' ? claim.compoundedInterest : (claim.eotTotalClaim || 0), currency)}
                    </strong>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Formal Dispute Notice Preview */}
          {selectedClaim && (
            <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 border border-stone-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-400" />
                  <h4 className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Official Notice of Dispute & Statutory Demand
                  </h4>
                </div>
                <button
                  onClick={() => window.print()}
                  className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 transition-colors"
                  title="Print formal legal claim notice"
                >
                  <Printer className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 font-mono text-[11px] leading-relaxed space-y-3 text-stone-300">
                <div className="text-stone-400 border-b border-stone-800 pb-2">
                  TO: Permanent Secretary & Accounting Officer<br />
                  RE: {project.procuringEntity}<br />
                  PROJECT: {project.title} ({project.contractCode})
                </div>

                <div className="text-amber-400 font-bold">
                  SUBJECT: STATUTORY NOTICE OF CONTRACTUAL DISPUTE PURSUANT TO SECTION 37(1) & 54 OF THE PUBLIC PROCUREMENT ACT (PPA 2007)
                </div>

                <p>
                  Take Notice that in accordance with Section 37(1) of the Public Procurement Act 2007 and FIDIC Sub-Clause 14.8, Interim Payment Certificate <strong>#{selectedClaim.ipcNumber}</strong> valued at <strong>{formatFullCurrency(selectedClaim.certifiedIpcAmount, currency)}</strong> submitted on <strong>{selectedClaim.submissionDate}</strong> has remained unpaid past the 60-day statutory threshold.
                </p>

                <p>
                  As of today, payment has been in default for <strong>{selectedClaim.delayedDays} days</strong>. In pursuant of the Central Bank of Nigeria Monetary Policy Rate ({ (selectedClaim.cbnMprRate * 100).toFixed(2) }%) plus statutory margin, compounding interest has accrued to the amount of:
                </p>

                <div className="text-sm font-black text-amber-300 bg-stone-900 p-2.5 rounded-lg border border-amber-500/30 text-center">
                  {formatFullCurrency(selectedClaim.compoundedInterest || selectedClaim.eotTotalClaim || 0, currency)}
                </div>

                <p className="text-[10px] text-stone-400">
                  {selectedClaim.statutoryGrounds}
                </p>

                <div className="pt-2 border-t border-stone-800 text-[10px] text-stone-400 flex justify-between">
                  <span>Authorized Signatory</span>
                  <span>Legal & Commercial Directorate</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
