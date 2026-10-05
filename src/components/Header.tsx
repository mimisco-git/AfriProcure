import React, { useEffect } from 'react';
import { ShieldAlert, Calculator, FileCheck2, TrendingUp, Layers, Printer, Landmark, Building2, Settings, Scale, ShieldCheck, FileSpreadsheet, HardHat, BadgeCheck, UsersRound, LucideIcon } from 'lucide-react';
import { ContractProject, CurrencyCode } from '../types';
import { formatCurrency } from '../utils/cpaMath';
import { AfriProcureLogo } from './AfriProcureLogo';

export type AppTabType = 'bed' | 'cpa' | 'ipc' | 'tender' | 'claims' | 'ppa' | 'macro' | 'cases' | 'dossier' | 'securities' | 'engineering' | 'contractors' | 'governance';

/** Navigation order; the list index is shown as the tab number. */
export const APP_TABS: { id: AppTabType; label: string; icon: LucideIcon; iconColor: string }[] = [
  { id: 'bed', label: 'Bid Evaluation Desk (RFQ & Tender)', icon: FileSpreadsheet, iconColor: 'text-amber-600' },
  { id: 'cpa', label: 'CPA Indexation Engine', icon: Calculator, iconColor: 'text-amber-600' },
  { id: 'ipc', label: 'IPC Cashflow & Default Risk', icon: TrendingUp, iconColor: 'text-emerald-600' },
  { id: 'tender', label: 'Tender Shield (ALT & Collusion)', icon: ShieldAlert, iconColor: 'text-red-600' },
  { id: 'claims', label: 'Claims & Delayed Payment Arbitration', icon: Scale, iconColor: 'text-amber-700' },
  { id: 'ppa', label: 'PPA 2007 & BPP Thresholds', icon: Landmark, iconColor: 'text-amber-600' },
  { id: 'macro', label: 'Material Price Benchmarks', icon: Layers, iconColor: 'text-indigo-600' },
  { id: 'cases', label: 'Infrastructure Case Studies', icon: FileCheck2, iconColor: 'text-cyan-700' },
  { id: 'dossier', label: 'BPP Dossier & Treasury Voucher', icon: Building2, iconColor: 'text-violet-700' },
  { id: 'securities', label: 'Securities, VOs & FEC Memo', icon: ShieldCheck, iconColor: 'text-emerald-600' },
  { id: 'engineering', label: 'EoT, LDs & APG Engineering', icon: HardHat, iconColor: 'text-orange-600' },
  { id: 'contractors', label: 'BPP Contractor Registry', icon: BadgeCheck, iconColor: 'text-sky-700' },
  { id: 'governance', label: 'Team, Roles & Audit Trail', icon: UsersRound, iconColor: 'text-stone-700' },
];

/** Tabs that only exist in a cloud workspace */
export const CLOUD_ONLY_TABS: AppTabType[] = ['governance'];

interface HeaderProps {
  activeTab: AppTabType;
  setActiveTab: (tab: AppTabType) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  onOpenAuditCertificate: () => void;
  activeProject: ContractProject;
  portfolioProjects: ContractProject[];
  onSelectProject: (p: ContractProject) => void;
  onOpenProjectModal: () => void;
  /** Tabs to show, in order (defaults to all) */
  tabs?: typeof APP_TABS;
  /** Workspace status shown in the top bar (save state, organization, account) */
  statusSlot?: React.ReactNode;
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
  tabs = APP_TABS,
  statusSlot,
}) => {
  // Keep the active tab visible in the horizontally scrolling nav (e.g. after a reload restores it)
  useEffect(() => {
    document.getElementById(`tab-${activeTab}`)?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [activeTab]);

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

        <div className="flex flex-wrap items-center gap-4 text-[11px]">
          {statusSlot}
          <span className="text-stone-400 hidden xl:flex items-center gap-1">
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
        <nav aria-label="Modules" className="flex items-center gap-1 sm:gap-1.5 mt-3 pt-2.5 border-t border-stone-100 overflow-x-auto scrollbar-none text-xs font-semibold">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-stone-900 text-amber-300 font-bold shadow-xs'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : tab.iconColor}`} />
                {index}. {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
};
