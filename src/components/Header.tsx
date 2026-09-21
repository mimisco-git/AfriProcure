import React from 'react';
import { ShieldAlert, Calculator, FileCheck2, TrendingUp, Layers, Printer, Landmark, Building2, ChevronDown, Plus, Settings, Scale, ShieldCheck } from 'lucide-react';
import { ContractProject, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/cpaMath';
import { AfriProcureLogo } from './AfriProcureLogo';

interface HeaderProps {
  activeTab: 'cpa' | 'ipc' | 'tender' | 'claims' | 'ppa' | 'macro' | 'cases' | 'dossier' | 'securities';
  setActiveTab: (tab: 'cpa' | 'ipc' | 'tender' | 'claims' | 'ppa' | 'macro' | 'cases' | 'dossier' | 'securities') => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  onOpenAuditCertificate: () => void;
  activeProject: ContractProject;
  portfolioProjects: ContractProject[];
  onSelectProject: (p: ContractProject) => void;
  onOpenProjectModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  currency,
  setCurrency,
  onOpenAuditCertificate,
  activeProject,
  portfolioProjects,
  onSelectProject,
  onOpenProjectModal,
}) => {
  return (
    <header className="no-print bg-white border-b border-stone-200 sticky top-0 z-30 shadow-xs">
      {/* Top Institutional & Regulatory Bar */}
      <div className="bg-stone-900 text-stone-300 text-xs px-4 sm:px-6 py-2 border-b border-stone-800 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/30">
            <Building2 className="w-3.5 h-3.5" />
            National Public Infrastructure Procurement & Cost Engineering Platform
          </span>
          <span className="hidden sm:inline text-stone-400">|</span>
          <span className="hidden sm:inline text-stone-300 font-medium">
            Federal & State MDAs • Infrastructure Contractors • BPP Due Diligence
          </span>
        </div>

        <div className="flex items-center gap-4 text-[11px]">
          <span className="text-stone-400 hidden lg:flex items-center gap-1">
            Statutory Standards: <strong className="text-stone-200">PPA 2007 (Nigeria)</strong> & <strong className="text-stone-200">FIDIC Red/Pink 13.8</strong>
          </span>

          <div className="flex items-center gap-1.5 pl-2 border-l border-stone-700">
            <label htmlFor="currency-select" className="text-stone-400">Currency:</label>
            <select
              id="currency-select"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              className="bg-stone-800 text-stone-100 rounded px-2 py-0.5 border border-stone-700 font-mono text-xs focus:outline-hidden focus:border-amber-400"
            >
              <option value="NGN">NGN (₦ Nigeria)</option>
              <option value="GHS">GHS (GH₵ Ghana)</option>
              <option value="KES">KES (KSh Kenya)</option>
              <option value="ZAR">ZAR (R S.Africa)</option>
              <option value="USD">USD ($ International)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <AfriProcureLogo size="md" variant="full" />

          {/* Project Portfolio Switcher & Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Active Project Dropdown */}
            <div className="flex items-center gap-1.5 bg-stone-50 border border-stone-300 rounded-xl p-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-stone-500 pl-2">Contract:</span>
              <select
                value={activeProject.id}
                onChange={(e) => {
                  const selected = portfolioProjects.find((p) => p.id === e.target.value);
                  if (selected) onSelectProject(selected);
                }}
                className="bg-transparent font-bold text-stone-900 pr-3 py-1 border-none focus:outline-hidden text-xs max-w-[200px] sm:max-w-[280px] truncate"
              >
                {portfolioProjects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    {proj.title} ({formatCurrency(proj.contractSumInitial, currency)})
                  </option>
                ))}
              </select>

              <button
                onClick={onOpenProjectModal}
                title="Configure or Edit Contract Parameters"
                className="p-1.5 rounded-lg bg-white border border-stone-200 hover:bg-stone-100 text-stone-700 transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Print Audit Certificate */}
            <button
              id="btn-open-audit-cert"
              onClick={onOpenAuditCertificate}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-stone-900 hover:bg-stone-800 text-white shadow-xs transition-colors shrink-0"
              title="Generate printable IPC Price Adjustment & Audit Certificate"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              Audit Certificate
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 sm:gap-1.5 mt-3 pt-2.5 border-t border-stone-100 overflow-x-auto scrollbar-none text-xs font-semibold">
          <button
            id="tab-cpa"
            onClick={() => setActiveTab('cpa')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'cpa'
                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-600" />
            1. CPA Indexation Engine
          </button>

          <button
            id="tab-ipc"
            onClick={() => setActiveTab('ipc')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'ipc'
                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            2. IPC Cashflow & Default Risk
          </button>

          <button
            id="tab-tender"
            onClick={() => setActiveTab('tender')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'tender'
                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-red-600" />
            3. Tender Shield (ALT & Collusion)
          </button>

          <button
            id="tab-claims"
            onClick={() => setActiveTab('claims')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'claims'
                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Scale className="w-4 h-4 text-amber-700" />
            4. Claims & Delayed Payment Arbitration
          </button>

          <button
            id="tab-ppa"
            onClick={() => setActiveTab('ppa')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'ppa'
                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Landmark className="w-4 h-4 text-amber-600" />
            5. PPA 2007 & BPP Thresholds
          </button>

          <button
            id="tab-macro"
            onClick={() => setActiveTab('macro')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'macro'
                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            6. Material Price Benchmarks
          </button>

          <button
            id="tab-cases"
            onClick={() => setActiveTab('cases')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'cases'
                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <FileCheck2 className="w-4 h-4 text-cyan-700" />
            7. Infrastructure Case Studies
          </button>

          <button
            id="tab-dossier"
            onClick={() => setActiveTab('dossier')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'dossier'
                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <Building2 className="w-4 h-4 text-violet-700" />
            8. BPP Dossier & Treasury Voucher
          </button>

          <button
            id="tab-securities"
            onClick={() => setActiveTab('securities')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
              activeTab === 'securities'
                ? 'bg-amber-50 text-amber-900 font-bold border border-amber-200 shadow-xs'
                : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            9. Securities, VOs & FEC Memo
          </button>
        </nav>
      </div>
    </header>
  );
};
