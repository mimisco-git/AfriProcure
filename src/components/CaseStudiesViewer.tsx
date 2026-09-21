import React, { useState } from 'react';
import { REAL_WORLD_CASE_STUDIES, ProcurementCaseStudy } from '../data/caseStudies';
import { Building2, Activity, Zap, CheckCircle2, XCircle, ArrowRight, BookOpen, Layers } from 'lucide-react';

export const CaseStudiesViewer: React.FC = () => {
  const [selectedCaseId, setSelectedCaseId] = useState<string>(REAL_WORLD_CASE_STUDIES[0].id);
  const activeCase = REAL_WORLD_CASE_STUDIES.find((c) => c.id === selectedCaseId) || REAL_WORLD_CASE_STUDIES[0];

  const getSectorIcon = (sector: ProcurementCaseStudy['sector']) => {
    switch (sector) {
      case 'transport':
        return <Building2 className="w-5 h-5 text-amber-600" />;
      case 'health':
        return <Activity className="w-5 h-5 text-rose-600" />;
      case 'energy':
        return <Zap className="w-5 h-5 text-amber-500" />;
      default:
        return <Layers className="w-5 h-5 text-stone-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-md">
        <div className="max-w-3xl space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500 text-stone-950 font-bold text-xs uppercase tracking-wider">
              Empirical Field Evidence
            </span>
            <span className="text-xs text-stone-400">
              Comparative Analysis: Rigid Fixed-Price vs. Algorithmic Indexation
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 tracking-tight">
            Real African Capital Procurement Case Studies
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Examine how identical macroeconomic shocks (Naira currency floating, diesel subsidy elimination, global supply chain dislocations) produce catastrophic abandonment under traditional fixed contracts, versus uninterrupted delivery under algorithmic CPA.
          </p>
        </div>
      </div>

      {/* Case Selector Tabs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {REAL_WORLD_CASE_STUDIES.map((c) => {
          const isSelected = c.id === selectedCaseId;

          return (
            <button
              key={c.id}
              onClick={() => setSelectedCaseId(c.id)}
              className={`p-4 rounded-2xl text-left border transition-all ${
                isSelected
                  ? 'bg-amber-50/90 border-amber-300 shadow-sm ring-1 ring-amber-400/40'
                  : 'bg-white border-stone-200 hover:border-stone-300'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {getSectorIcon(c.sector)}
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                  {c.country} • {c.sector.toUpperCase()}
                </span>
              </div>
              <h3 className="text-sm font-bold text-stone-900 line-clamp-2">
                {c.title}
              </h3>
              <p className="text-xs text-stone-500 mt-1 line-clamp-1">
                {c.subtitle}
              </p>
            </button>
          );
        })}
      </div>

      {/* Detailed Active Case Card */}
      <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-100 text-amber-900">
              Sector: {activeCase.sector.toUpperCase()} • Jurisdiction: {activeCase.country}
            </span>
            <span className="text-xs font-mono text-stone-500">
              Statutory Basis: {activeCase.procurementMechanism}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
            {activeCase.title}
          </h2>
          <p className="text-sm text-stone-600 font-medium mt-1">
            {activeCase.subtitle}
          </p>
        </div>

        {/* Shock & Baseline Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-xl bg-stone-50 border border-stone-200 text-xs">
          <div>
            <span className="text-stone-500 block uppercase font-semibold text-[10px]">Original Award Sum</span>
            <span className="text-base font-bold text-stone-900 font-mono">{activeCase.originalContractSum}</span>
          </div>
          <div>
            <span className="text-stone-500 block uppercase font-semibold text-[10px]">Macroeconomic Trigger</span>
            <span className="text-xs text-stone-700 font-medium">{activeCase.macroTrigger}</span>
          </div>
          <div>
            <span className="text-stone-500 block uppercase font-semibold text-[10px]">Actual Escalation Required</span>
            <span className="text-base font-bold text-amber-800 font-mono">{activeCase.actualEscalationReq}</span>
          </div>
        </div>

        {/* Key Metrics Comparison Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {activeCase.keyMetrics.map((m, idx) => (
            <div key={idx} className="p-3 rounded-xl bg-stone-100/70 border border-stone-200/60 text-center">
              <span className="text-[10px] text-stone-500 uppercase tracking-wider font-semibold block">
                {m.label}
              </span>
              <span className="text-base sm:text-lg font-black text-stone-900 font-mono mt-0.5 block">
                {m.value}
              </span>
            </div>
          ))}
        </div>

        {/* Side-by-Side Comparison: Without CPA vs With CPA */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Without CPA */}
          <div className="p-5 rounded-2xl bg-red-50/60 border border-red-200 space-y-2">
            <div className="flex items-center gap-2 text-red-900 font-bold text-sm">
              <XCircle className="w-5 h-5 text-red-600" />
              Traditional Fixed-Price Failure (Zero CPA)
            </div>
            <p className="text-xs sm:text-sm text-red-800 leading-relaxed">
              {activeCase.unadjustedOutcome}
            </p>
          </div>

          {/* With CPA */}
          <div className="p-5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              With Algorithmic CPA Indexation
            </div>
            <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">
              {activeCase.cpaAlgorithmicOutcome}
            </p>
          </div>
        </div>

        {/* Institutional Governance & Audit Lesson Box */}
        <div className="p-4 rounded-xl bg-stone-900 text-stone-100 text-xs sm:text-sm space-y-1.5 border border-stone-800">
          <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-wider text-xs">
            <BookOpen className="w-4 h-4" />
            Institutional Governance & Public Audit Lesson
          </div>
          <p className="text-stone-300 leading-relaxed font-sans text-xs">
            {activeCase.institutionalAuditLesson}
          </p>
        </div>
      </div>
    </div>
  );
};
