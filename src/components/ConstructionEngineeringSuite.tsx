import React, { useState } from 'react';
import { ContractProject, CurrencyCode } from '../types';
import { formatCurrency, formatFullCurrency } from '../utils/cpaMath';
import { 
  EotDelayEvent, 
  DEFAULT_EOT_DELAY_EVENTS, 
  calculateEotAndLiquidatedDamages, 
  simulateApgAndRetentionSchedule 
} from '../utils/constructionContractEngine';
import { AfriProcureLogo } from './AfriProcureLogo';
import { 
  Scale, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  ShieldAlert, 
  Percent, 
  Calendar, 
  FileSpreadsheet, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Printer, 
  Download, 
  Info,
  DollarSign,
  BadgeAlert
} from 'lucide-react';

interface ConstructionEngineeringSuiteProps {
  project: ContractProject;
  currency: CurrencyCode;
}

export const ConstructionEngineeringSuite: React.FC<ConstructionEngineeringSuiteProps> = ({ 
  project, 
  currency 
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'eot_ld' | 'apg_retention' | 'cashflow_stress'>('eot_ld');

  // EOT / LD State
  const [delayEvents, setDelayEvents] = useState<EotDelayEvent[]>(DEFAULT_EOT_DELAY_EVENTS);
  const [originalDurationDays, setOriginalDurationDays] = useState<number>(730); // 24 months = 730 days
  const [actualCompletionDays, setActualCompletionDays] = useState<number>(820); // 90 days overrun
  const [dailyLdRatePct, setDailyLdRatePct] = useState<number>(0.1); // 0.1% per calendar day
  const [maxLdCapPct, setMaxLdCapPct] = useState<number>(10); // 10% statutory cap

  // New Event Form State
  const [newEventDesc, setNewEventDesc] = useState('');
  const [newEventClause, setNewEventClause] = useState('Clause 2.1 (Right of Access)');
  const [newEventDays, setNewEventDays] = useState<number>(21);
  const [newEventDaysApproved, setNewEventDaysApproved] = useState<number>(18);
  const [newEventType, setNewEventType] = useState<'employer_delay' | 'force_majeure' | 'contractor_delay' | 'exceptionally_adverse_climatic'>('employer_delay');
  const [newEventNotified28Days, setNewEventNotified28Days] = useState<boolean>(true);

  // APG & Retention State
  const [advancePaymentPct, setAdvancePaymentPct] = useState<number>(15); // PPA 2007 max 15%
  const [retentionPct, setRetentionPct] = useState<number>(5); // Standard 5%
  const [recoveryStartPct, setRecoveryStartPct] = useState<number>(20); // starts after 20% progress
  const [recoveryRatePct, setRecoveryRatePct] = useState<number>(25); // 25% of interim billings

  // EOT Calculations
  const eotResult = calculateEotAndLiquidatedDamages({
    contractSum: project.contractSumInitial,
    originalDurationDays,
    delayEvents,
    actualCompletionDays,
    dailyLdRatePct,
    maxLdCapPct,
  });

  // APG & Retention Calculations
  const apgRetentionResult = simulateApgAndRetentionSchedule({
    contractSum: project.contractSumInitial,
    advancePaymentRatePct: advancePaymentPct,
    retentionRatePct: retentionPct,
    recoveryStartPct,
    recoveryRatePct,
  });

  const handleAddDelayEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventDesc || newEventDays <= 0) return;

    const newEvent: EotDelayEvent = {
      id: `evt-${Date.now()}`,
      eventType: newEventType,
      description: newEventDesc,
      fidicClause: newEventClause,
      daysClaimed: newEventDays,
      daysApproved: newEventType === 'contractor_delay' ? 0 : newEventDaysApproved,
      criticalPathImpact: true,
      contractorNotifiedWithin28Days: newEventNotified28Days,
      engineerDeterminationDate: new Date().toISOString().split('T')[0],
    };

    setDelayEvents([...delayEvents, newEvent]);
    setNewEventDesc('');
  };

  const handleDeleteDelayEvent = (id: string) => {
    setDelayEvents(delayEvents.filter((e) => e.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Executive Header Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 border border-stone-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-sm bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider">
                Forensic Contract Engineering
              </span>
              <span className="text-xs text-stone-400 font-mono">
                FIDIC Red Book (Clauses 8.4, 8.7, 14.2 & 14.9) • PPA 2007
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
              Construction Contract & Forensic Engineering Suite
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
              Statutory forensic engineering desk for administering <strong>Extension of Time (EOT)</strong>, quantifying <strong>Delay & Liquidated Damages (LD)</strong>, and amortizing <strong>Advance Payment Guarantees (APG)</strong> and <strong>Retention Money</strong> across interim payment certificates (IPCs).
            </p>
          </div>

          <div className="text-right shrink-0 bg-stone-800/80 p-3.5 rounded-xl border border-stone-700">
            <div className="text-[10px] text-stone-400 font-mono uppercase">Audited Contract Sum</div>
            <div className="text-base font-bold text-amber-400 font-mono">
              {formatCurrency(project.contractSumInitial, currency)}
            </div>
            <div className="text-[10px] text-stone-400 font-mono mt-0.5">
              {project.contractorName}
            </div>
          </div>
        </div>

        {/* Sub-Tab Navigation */}
        <div className="flex items-center gap-1.5 mt-5 pt-3 border-t border-stone-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('eot_ld')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-all ${
              activeSubTab === 'eot_ld'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Scale className="w-4 h-4" />
            1. FIDIC 8.4 EOT & Clause 8.7 Liquidated Damages Calculator
          </button>
          <button
            onClick={() => setActiveSubTab('apg_retention')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-all ${
              activeSubTab === 'apg_retention'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Percent className="w-4 h-4" />
            2. Advance Payment (15%) & Retention Amortization Schedule
          </button>
          <button
            onClick={() => setActiveSubTab('cashflow_stress')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-md transition-all ${
              activeSubTab === 'cashflow_stress'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            3. Contractor Working Capital & Cashflow Stress Test
          </button>
        </div>
      </div>

      {/* SUBTAB 1: FIDIC 8.4 EOT & LIQUIDATED DAMAGES */}
      {activeSubTab === 'eot_ld' && (
        <div className="space-y-6">
          {/* Top Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Original vs Extended Time
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-black text-stone-900 font-mono">
                  {eotResult.extendedCompletionDays}
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  (Orig: {eotResult.originalCompletionDays} d)
                </span>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold block">
                Approved EOT: +{eotResult.authorizedEotDays} calendar days
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Culpable Contractor Delay
              </span>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-black font-mono ${
                  eotResult.contractorCulpableDelayDays > 0 ? 'text-rose-700' : 'text-emerald-700'
                }`}>
                  {eotResult.contractorCulpableDelayDays} Days
                </span>
                <span className="text-xs text-stone-500 font-mono">
                  (Actual: {actualCompletionDays} d)
                </span>
              </div>
              <span className="text-[11px] text-stone-600 block">
                Rate: {dailyLdRatePct}% per calendar day
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Liquidated Damages Payable
              </span>
              <div className="text-xl font-black text-rose-700 font-mono">
                {formatCurrency(eotResult.totalLiquidatedDamages, currency)}
              </div>
              <span className={`text-[11px] font-semibold block ${
                eotResult.isLdCapReached ? 'text-rose-600' : 'text-stone-500'
              }`}>
                {eotResult.isLdCapReached ? '⚠ Capped at 10% statutory limit' : `Daily: ${formatCurrency(eotResult.dailyLdAmount, currency)}/day`}
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Statutory Default Warning
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                {eotResult.isLdCapReached ? (
                  <span className="px-2 py-0.5 rounded-sm bg-rose-50 text-rose-800 font-bold text-xs border border-rose-200 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                    Clause 15.2 Default
                  </span>
                ) : eotResult.contractorCulpableDelayDays > 0 ? (
                  <span className="px-2 py-0.5 rounded-sm bg-amber-50 text-amber-800 font-bold text-xs border border-amber-200 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Delay Notice Issued
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 font-bold text-xs border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Schedule Compliant
                  </span>
                )}
              </div>
              <span className="text-[10px] text-stone-500 block">
                Employer offset rights against IPC
              </span>
            </div>
          </div>

          {/* Statutory Assessment Alert */}
          <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
            eotResult.isLdCapReached
              ? 'bg-rose-50 border-rose-300 text-rose-950'
              : eotResult.contractorCulpableDelayDays > 0
              ? 'bg-amber-50 border-amber-300 text-amber-950'
              : 'bg-emerald-50 border-emerald-300 text-emerald-950'
          }`}>
            <Scale className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs">
              <div className="font-bold uppercase tracking-wider">
                FIDIC Engineer Formal Determination Summary (Clause 3.5 & 8.4)
              </div>
              <p className="leading-relaxed font-medium">
                {eotResult.statutorySummary}
              </p>
            </div>
          </div>

          {/* Interactive Parameters & Schedule Controls */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              Contract Duration & Statutory Liquidated Damages Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Original Time for Completion (Days):</label>
                <input
                  type="number"
                  min={30}
                  value={originalDurationDays}
                  onChange={(e) => setOriginalDurationDays(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs font-bold text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Actual Elapsed Time to Handover (Days):</label>
                <input
                  type="number"
                  min={30}
                  value={actualCompletionDays}
                  onChange={(e) => setActualCompletionDays(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs font-bold text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Daily Delay Damages Rate (%):</label>
                <input
                  type="number"
                  step={0.01}
                  min={0.01}
                  max={1.0}
                  value={dailyLdRatePct}
                  onChange={(e) => setDailyLdRatePct(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs font-bold text-stone-900"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Statutory LD Cap (% of Contract):</label>
                <input
                  type="number"
                  min={5}
                  max={25}
                  value={maxLdCapPct}
                  onChange={(e) => setMaxLdCapPct(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs font-bold text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Delay Events Register Table */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-stone-600" />
                  FIDIC 8.4 Extension of Time (EOT) Claims Register
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Audits whether claims complied with the strict 28-day notice time-bar under FIDIC Clause 20.1 and impacted the Critical Path.
                </p>
              </div>

              <span className="font-mono text-xs text-stone-600 font-bold">
                Total Claimed: {eotResult.totalDaysClaimed} Days | Approved: {eotResult.authorizedEotDays} Days
              </span>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 border-b border-stone-200 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Event Description & Ground</th>
                    <th className="px-3 py-2.5">FIDIC Clause</th>
                    <th className="px-3 py-2.5 text-center">28-Day Notice</th>
                    <th className="px-3 py-2.5 text-center">Critical Path</th>
                    <th className="px-3 py-2.5 text-right">Claimed</th>
                    <th className="px-3 py-2.5 text-right">Approved</th>
                    <th className="px-3 py-2.5 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white">
                  {delayEvents.map((evt) => (
                    <tr key={evt.id} className="hover:bg-stone-50/50">
                      <td className="px-3 py-2.5 max-w-sm">
                        <div className="font-bold text-stone-900">{evt.description}</div>
                        <div className="text-[10px] text-stone-500 font-mono mt-0.5">
                          Type: {evt.eventType.replace('_', ' ').toUpperCase()} • Det: {evt.engineerDeterminationDate}
                        </div>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-stone-700 whitespace-nowrap">
                        {evt.fidicClause}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {evt.contractorNotifiedWithin28Days ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Compliant
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-rose-50 text-rose-800 font-bold text-[10px] border border-rose-200" title="Time-barred under FIDIC Clause 20.1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            Time-Barred
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <span className="font-mono text-stone-800 font-semibold">
                          {evt.criticalPathImpact ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-stone-800">
                        {evt.daysClaimed} d
                      </td>
                      <td className="px-3 py-2.5 text-right font-mono font-bold text-emerald-700">
                        {evt.daysApproved} d
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteDelayEvent(evt.id)}
                          className="p-1 hover:bg-stone-100 rounded text-stone-400 hover:text-rose-600 transition-colors"
                          title="Delete delay event"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Add New Delay Event Form */}
            <form onSubmit={handleAddDelayEvent} className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <div className="font-bold text-xs text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5 text-amber-600" />
                Log Forensic Delay Claim / Engineer Determination
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-[11px] font-semibold text-stone-700">Event Description:</label>
                  <input
                    type="text"
                    placeholder="e.g. Unforeseen subsoil geological fault halting tunnel excavation..."
                    value={newEventDesc}
                    onChange={(e) => setNewEventDesc(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-700">Ground / Cause:</label>
                  <select
                    value={newEventType}
                    onChange={(e) => setNewEventType(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-semibold"
                  >
                    <option value="employer_delay">Employer / Engineer Delay</option>
                    <option value="exceptionally_adverse_climatic">Climatic Weather Event</option>
                    <option value="force_majeure">Force Majeure / Civil Strife</option>
                    <option value="contractor_delay">Contractor Culpable Delay</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-semibold text-stone-700">Applicable FIDIC Clause:</label>
                  <input
                    type="text"
                    value={newEventClause}
                    onChange={(e) => setNewEventClause(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-stone-700">Days Claimed:</label>
                    <input
                      type="number"
                      min={1}
                      value={newEventDays}
                      onChange={(e) => setNewEventDays(Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <label className="font-semibold text-stone-700">Days Approved:</label>
                    <input
                      type="number"
                      min={0}
                      value={newEventDaysApproved}
                      onChange={(e) => setNewEventDaysApproved(Number(e.target.value))}
                      className="w-20 px-2 py-1 bg-white border border-stone-300 rounded-lg font-mono font-bold"
                    />
                  </div>

                  <label className="flex items-center gap-1.5 text-stone-700 cursor-pointer font-medium">
                    <input
                      type="checkbox"
                      checked={newEventNotified28Days}
                      onChange={(e) => setNewEventNotified28Days(e.target.checked)}
                      className="rounded accent-amber-500"
                    />
                    Notified Within 28 Days (FIDIC 20.1)
                  </label>
                </div>

                <button
                  type="submit"
                  className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-lg transition-colors shadow-xs"
                >
                  Log Claim into EOT Registry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SUBTAB 2: APG (15%) & RETENTION AMORTIZATION */}
      {activeSubTab === 'apg_retention' && (
        <div className="space-y-6">
          {/* Statutory Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Mobilization Advance (Max 15%)
              </span>
              <div className="text-xl font-black text-stone-900 font-mono">
                {formatCurrency(apgRetentionResult.advancePaymentAmount, currency)}
              </div>
              <span className="text-[11px] text-stone-500 font-mono block">
                PPA 2007 Sec 35 • Unconditional APG
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Total Retention Fund ({retentionPct}%)
              </span>
              <div className="text-xl font-black text-amber-600 font-mono">
                {formatCurrency(apgRetentionResult.totalRetentionExpected, currency)}
              </div>
              <span className="text-[11px] text-stone-500 font-mono block">
                Held in Statutory Escrow
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Phase 1 Release (Taking-Over)
              </span>
              <div className="text-xl font-black text-emerald-700 font-mono">
                {formatCurrency(apgRetentionResult.firstPhaseRetentionRelease, currency)}
              </div>
              <span className="text-[11px] text-stone-500 font-mono block">
                50% at Substantial Completion
              </span>
            </div>

            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs space-y-1">
              <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                Phase 2 Release (DLP End)
              </span>
              <div className="text-xl font-black text-blue-700 font-mono">
                {formatCurrency(apgRetentionResult.secondPhaseRetentionRelease, currency)}
              </div>
              <span className="text-[11px] text-stone-500 font-mono block">
                50% after 12-Month Defects Period
              </span>
            </div>
          </div>

          {/* Interactive Parameters */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
              <Percent className="w-4 h-4 text-amber-600" />
              Statutory Mobilization & Retention Deduction Parameters
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Advance Payment Rate (%):</label>
                <input
                  type="number"
                  min={5}
                  max={15}
                  value={advancePaymentPct}
                  onChange={(e) => setAdvancePaymentPct(Math.min(15, Math.max(0, Number(e.target.value))))}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs font-bold text-stone-900"
                />
                <span className="text-[10px] text-stone-400">PPA 2007 limits to 15%</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Retention Money Deduction Rate (%):</label>
                <input
                  type="number"
                  min={5}
                  max={10}
                  value={retentionPct}
                  onChange={(e) => setRetentionPct(Math.min(10, Math.max(1, Number(e.target.value))))}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs font-bold text-stone-900"
                />
                <span className="text-[10px] text-stone-400">Standard 5% or 10%</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Recovery Start Threshold (% Progress):</label>
                <input
                  type="number"
                  min={10}
                  max={40}
                  value={recoveryStartPct}
                  onChange={(e) => setRecoveryStartPct(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs font-bold text-stone-900"
                />
                <span className="text-[10px] text-stone-400">Begins after 20% certified</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-stone-700">Interim Recovery Rate (% of IPC):</label>
                <input
                  type="number"
                  min={15}
                  max={40}
                  value={recoveryRatePct}
                  onChange={(e) => setRecoveryRatePct(Number(e.target.value))}
                  className="w-full px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs font-bold text-stone-900"
                />
                <span className="text-[10px] text-stone-400">Deducted from each certificate</span>
              </div>
            </div>
          </div>

          {/* Month-by-Month Amortization Schedule Table */}
          <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
              <div>
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-stone-600" />
                  Interim Payment Certificate (IPC) Recovery Amortization Matrix
                </h3>
                <p className="text-[11px] text-stone-500 mt-0.5">
                  Shows progressive reduction of the Advance Payment Guarantee (APG) liability and accumulation of the statutory Retention Fund.
                </p>
              </div>

              <span className={`px-2.5 py-1 rounded-sm text-xs font-mono font-bold border ${
                apgRetentionResult.isAdvanceFullyRecovered
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-amber-50 text-amber-800 border-amber-200'
              }`}>
                {apgRetentionResult.isAdvanceFullyRecovered ? '✓ 100% Advance Recovered' : 'Ongoing Advance Amortization'}
              </span>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 text-stone-700 border-b border-stone-200 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">IPC No.</th>
                    <th className="px-3 py-2.5 text-right">Gross Valuation</th>
                    <th className="px-3 py-2.5 text-center">Progress %</th>
                    <th className="px-3 py-2.5 text-right text-rose-700">Advance Recovery</th>
                    <th className="px-3 py-2.5 text-right">Unrecovered APG</th>
                    <th className="px-3 py-2.5 text-right text-amber-700">Retention (5%)</th>
                    <th className="px-3 py-2.5 text-right">Cumulative Retention</th>
                    <th className="px-3 py-2.5 text-right font-bold text-emerald-800">Net IPC Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 bg-white font-mono">
                  {apgRetentionResult.schedule.map((row) => (
                    <tr key={row.ipcMonth} className="hover:bg-stone-50/50">
                      <td className="px-3 py-2 font-bold text-stone-900 font-sans">
                        IPC #{row.ipcMonth.toString().padStart(2, '0')}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold text-stone-800">
                        {formatCurrency(row.workDoneGross, currency)}
                      </td>
                      <td className="px-3 py-2 text-center text-stone-600">
                        {row.cumulativePctOfContract.toFixed(1)}%
                      </td>
                      <td className="px-3 py-2 text-right text-rose-700 font-bold">
                        {row.advanceDeductionThisIpc > 0 ? `-${formatCurrency(row.advanceDeductionThisIpc, currency)}` : '—'}
                      </td>
                      <td className="px-3 py-2 text-right text-stone-600">
                        {formatCurrency(row.unrecoveredAdvanceBalance, currency)}
                      </td>
                      <td className="px-3 py-2 text-right text-amber-700 font-semibold">
                        -{formatCurrency(row.retentionDeductionThisIpc, currency)}
                      </td>
                      <td className="px-3 py-2 text-right text-stone-700">
                        {formatCurrency(row.cumulativeRetentionHeld, currency)}
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-emerald-800 bg-emerald-50/20">
                        {formatCurrency(row.netPaymentToContractor, currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUBTAB 3: CONTRACTOR CASHFLOW STRESS TEST */}
      {activeSubTab === 'cashflow_stress' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div className="border-b border-stone-200 pb-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-amber-600" />
              Contractor Solvency, Working Capital & Delayed IPC Honor Stress-Test
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Audits whether the contractor possesses sufficient liquid working capital and credit lines to sustain site operations if the Employer delays IPC honoring by 60 to 90 days pursuant to FIDIC Clause 14.7 & 14.8.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Monthly Burn Rate on Site
              </h3>
              <div className="text-2xl font-black text-stone-900 font-mono">
                {formatCurrency(project.contractSumInitial * 0.05, currency)}
              </div>
              <p className="text-xs text-stone-600">
                Estimated monthly expenditure covering diesel, plant hire, local labor, and cement supply.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                60-Day Treasury Lag Exposure
              </h3>
              <div className="text-2xl font-black text-amber-700 font-mono">
                {formatCurrency(project.contractSumInitial * 0.10, currency)}
              </div>
              <p className="text-xs text-stone-600">
                Minimum unencumbered bank overdraft or credit facility required to prevent site shutdown.
              </p>
            </div>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
              <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                Statutory Financing Charge (FIDIC 14.8)
              </h3>
              <div className="text-2xl font-black text-rose-700 font-mono">
                3% + CBN MPR
              </div>
              <p className="text-xs text-stone-600">
                Contractor entitled to compound monthly interest at 3% above Central Bank of Nigeria Monetary Policy Rate for delayed disbursements.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
