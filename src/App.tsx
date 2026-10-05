/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useCallback, useEffect, useRef, useState } from 'react';
import { PORTFOLIO_PROJECTS } from './data/defaultData';
import { ContractProject, CurrencyCode } from './types';
import { Header, AppTabType, APP_TABS, CLOUD_ONLY_TABS } from './components/Header';
import { AfriProcureLogo } from './components/AfriProcureLogo';
import { ErrorBoundary } from './components/ErrorBoundary';
import { usePersistentState, clearPersistentState } from './hooks/usePersistentState';
import { useWorkspace } from './workspace/WorkspaceContext';
import { LocalWorkspaceStore } from './workspace/store';
import { useContractSync } from './workspace/useContractSync';
import { WorkspaceStatus } from './workspace/WorkspaceStatus';
import { AlertTriangle, Eye, Loader2, RotateCcw } from 'lucide-react';

// Each module is its own chunk so the first paint only downloads the active tab
const BidEvaluationDesk = lazy(() => import('./components/BidEvaluationDesk').then((m) => ({ default: m.BidEvaluationDesk })));
const CpaCalculator = lazy(() => import('./components/CpaCalculator').then((m) => ({ default: m.CpaCalculator })));
const IpcSchedule = lazy(() => import('./components/IpcSchedule').then((m) => ({ default: m.IpcSchedule })));
const TenderShield = lazy(() => import('./components/TenderShield').then((m) => ({ default: m.TenderShield })));
const ClaimsDisputeCenter = lazy(() => import('./components/ClaimsDisputeCenter').then((m) => ({ default: m.ClaimsDisputeCenter })));
const PpaComplianceCenter = lazy(() => import('./components/PpaComplianceCenter').then((m) => ({ default: m.PpaComplianceCenter })));
const MacroIndicesTracker = lazy(() => import('./components/MacroIndicesTracker').then((m) => ({ default: m.MacroIndicesTracker })));
const CaseStudiesViewer = lazy(() => import('./components/CaseStudiesViewer').then((m) => ({ default: m.CaseStudiesViewer })));
const BppDossierGenerator = lazy(() => import('./components/BppDossierGenerator').then((m) => ({ default: m.BppDossierGenerator })));
const SecuritiesAndVariations = lazy(() => import('./components/SecuritiesAndVariations').then((m) => ({ default: m.SecuritiesAndVariations })));
const ConstructionEngineeringSuite = lazy(() => import('./components/ConstructionEngineeringSuite').then((m) => ({ default: m.ConstructionEngineeringSuite })));
const BppContractorPortal = lazy(() => import('./components/BppContractorPortal').then((m) => ({ default: m.BppContractorPortal })));
const AuditCertificateModal = lazy(() => import('./components/AuditCertificateModal').then((m) => ({ default: m.AuditCertificateModal })));
const ProjectModal = lazy(() => import('./components/ProjectModal').then((m) => ({ default: m.ProjectModal })));
const GovernanceCenter = lazy(() => import('./components/GovernanceCenter').then((m) => ({ default: m.GovernanceCenter })));

const CURRENCIES: CurrencyCode[] = ['NGN', 'GHS', 'KES', 'ZAR', 'USD'];
const PERSISTED_PREFERENCE_KEYS = ['activeProjectId', 'currency', 'activeTab'];

const isString = (v: unknown): v is string => typeof v === 'string';
const isCurrency = (v: unknown): v is CurrencyCode => CURRENCIES.includes(v as CurrencyCode);
const isTab = (v: unknown): v is AppTabType => APP_TABS.some((t) => t.id === v);

const Spinner: React.FC<{ label: string; fullScreen?: boolean }> = ({ label, fullScreen }) => (
  <div className={`flex items-center justify-center gap-2 text-sm text-stone-500 ${fullScreen ? 'min-h-screen' : 'py-24'}`} role="status">
    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
    {label}
  </div>
);

const ModuleLoading = () => <Spinner label="Loading module…" />;

const CenteredCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="min-h-screen bg-stone-100/60 flex items-center justify-center px-4">
    <div className="w-full max-w-md bg-white border border-stone-200 rounded-2xl shadow-xs p-6 sm:p-8 space-y-4">
      <AfriProcureLogo size="md" variant="full" />
      <h1 className="text-lg font-black text-stone-900">{title}</h1>
      {children}
    </div>
  </div>
);

const errorText = (err: unknown) =>
  err instanceof Error ? err.message : typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : 'Unknown error';

/** Loads the workspace's contracts, then hands over to the workbench. */
export default function App() {
  const ws = useWorkspace();
  const [contracts, setContracts] = useState<ContractProject[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    try {
      setContracts(await ws.store.listContracts());
    } catch (err) {
      setError(errorText(err));
    }
  }, [ws.store]);

  useEffect(() => {
    void load();
  }, [load]);

  const loadDemonstrationContracts = async () => {
    setSeeding(true);
    try {
      for (const c of PORTFOLIO_PROJECTS) await ws.store.saveContract(c);
      await load();
    } catch (err) {
      setError(errorText(err));
    } finally {
      setSeeding(false);
    }
  };

  if (error) {
    return (
      <CenteredCard title="The workspace could not be loaded">
        <p role="alert" className="text-sm rounded-xl px-3 py-2 border bg-red-50 border-red-200 text-red-800">{error}</p>
        <button onClick={() => void load()} className="w-full rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-sm font-bold py-2.5">Try again</button>
        {ws.signOut && <button onClick={ws.signOut} className="w-full text-xs font-semibold text-stone-500 hover:text-stone-900">Sign out</button>}
      </CenteredCard>
    );
  }
  if (!contracts) return <Spinner label="Loading workspace…" fullScreen />;
  if (contracts.length === 0) {
    return (
      <CenteredCard title={`${ws.organization?.name ?? 'This workspace'} has no contracts yet`}>
        {ws.permissions.editContracts ? (
          <>
            <p className="text-sm text-stone-600">Start with the demonstration portfolio, then edit or replace the contracts with your own.</p>
            <button disabled={seeding} onClick={() => void loadDemonstrationContracts()} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-sm font-bold py-2.5">
              {seeding && <Loader2 className="w-4 h-4 animate-spin" />}
              Load demonstration contracts
            </button>
          </>
        ) : (
          <p className="text-sm text-stone-600">Ask a Procurement Officer or Admin in your organization to add the first contract.</p>
        )}
        {ws.switchOrganization && <button onClick={ws.switchOrganization} className="w-full text-xs font-semibold text-stone-500 hover:text-stone-900">Switch organization</button>}
      </CenteredCard>
    );
  }

  return <Workbench initialContracts={contracts} />;
}

function Workbench({ initialContracts }: { initialContracts: ContractProject[] }) {
  const ws = useWorkspace();
  const visibleTabs = ws.store.mode === 'cloud' ? APP_TABS : APP_TABS.filter((t) => !CLOUD_ONLY_TABS.includes(t.id));
  const [storedTab, setActiveTab] = usePersistentState<AppTabType>('activeTab', 'bed', isTab);
  const activeTab: AppTabType = visibleTabs.some((t) => t.id === storedTab) ? storedTab : 'bed';
  const [portfolioProjects, setPortfolioProjects] = useState<ContractProject[]>(initialContracts);
  const [activeProjectId, setActiveProjectId] = usePersistentState<string>('activeProjectId', initialContracts[0].id, isString);
  const [currency, setCurrency] = usePersistentState<CurrencyCode>('currency', 'NGN', isCurrency);
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [selectedCertMonth, setSelectedCertMonth] = useState<number>(3);
  const [confirmReset, setConfirmReset] = useState(false);

  const project = portfolioProjects.find((p) => p.id === activeProjectId) ?? portfolioProjects[0];
  const activeTabLabel = APP_TABS.find((t) => t.id === activeTab)?.label ?? 'Module';

  // Persistence: edited contract ids are collected, then queued once state has settled
  const sync = useContractSync(ws.store, ws.permissions.editContracts, ws.store.mode === 'cloud' ? 800 : 300);
  const dirtyIds = useRef(new Set<string>());
  useEffect(() => {
    if (dirtyIds.current.size === 0) return;
    for (const id of dirtyIds.current) {
      const contract = portfolioProjects.find((p) => p.id === id);
      if (contract) sync.queue(contract);
    }
    dirtyIds.current.clear();
  }, [portfolioProjects, sync.queue]);

  const reloadLatest = async () => {
    sync.discardPending();
    try {
      const latest = await ws.store.listContracts();
      if (latest.length > 0) setPortfolioProjects(latest);
    } catch {
      // The status indicator keeps offering a reload
    }
  };

  const handleOpenCertificate = (month: number = 3) => {
    setSelectedCertMonth(month);
    setShowAuditModal(true);
  };

  const handleSelectProject = (newProject: ContractProject) => {
    setActiveProjectId(newProject.id);
  };

  const handleSaveProject = (updatedOrFn: ContractProject | ((prev: ContractProject) => ContractProject)) => {
    dirtyIds.current.add(project.id);
    setPortfolioProjects((prev) =>
      prev.map((p) => {
        if (p.id !== project.id) return p;
        return typeof updatedOrFn === 'function' ? updatedOrFn(p) : updatedOrFn;
      })
    );
  };

  const handleTransferAwardToContract = (newProjectData: Partial<ContractProject>) => {
    const today = new Date().toISOString().split('T')[0];
    const newContract: ContractProject = {
      ...project,
      id: 'proj-' + Date.now(),
      title: newProjectData.title || project.title,
      contractCode: newProjectData.contractCode || project.contractCode,
      procuringEntity: newProjectData.procuringEntity || project.procuringEntity,
      contractorName: newProjectData.contractorName || project.contractorName,
      contractSumInitial: newProjectData.contractSumInitial || project.contractSumInitial,
      currency: newProjectData.currency || currency,
      awardDate: newProjectData.awardDate || today,
      baseDate: newProjectData.baseDate || today,
    };

    dirtyIds.current.add(newContract.id);
    setPortfolioProjects((prev) => [newContract, ...prev]);
    setActiveProjectId(newContract.id);
    setActiveTab('cpa');
  };

  const handleResetWorkspace = () => {
    if (ws.store instanceof LocalWorkspaceStore) ws.store.reset();
    clearPersistentState(PERSISTED_PREFERENCE_KEYS);
    sync.discardPending();
    setPortfolioProjects(PORTFOLIO_PROJECTS);
    setActiveProjectId(PORTFOLIO_PROJECTS[0].id);
    setCurrency('NGN');
    setActiveTab('bed');
    setConfirmReset(false);
  };

  const renderActiveModule = () => {
    switch (activeTab) {
      case 'bed':
        return (
          <BidEvaluationDesk
            currency={currency}
            onTransferToContract={handleTransferAwardToContract}
            evaluationStore={ws.store}
            canSaveEvaluations={ws.permissions.saveEvaluations}
          />
        );
      case 'cpa':
        return <CpaCalculator project={project} setProject={handleSaveProject} currency={currency} />;
      case 'ipc':
        return <IpcSchedule project={project} currency={currency} onGenerateCertForMonth={handleOpenCertificate} />;
      case 'tender':
        return <TenderShield currency={currency} />;
      case 'claims':
        return <ClaimsDisputeCenter project={project} currency={currency} />;
      case 'ppa':
        return <PpaComplianceCenter currency={currency} />;
      case 'macro':
        return (
          <MacroIndicesTracker
            currency={currency}
            project={project}
            onUpdateProjectComponents={(updatedComponents) => {
              handleSaveProject((prev) => ({ ...prev, components: updatedComponents }));
            }}
          />
        );
      case 'cases':
        return <CaseStudiesViewer />;
      case 'dossier':
        return <BppDossierGenerator project={project} currency={currency} />;
      case 'securities':
        return <SecuritiesAndVariations project={project} currency={currency} />;
      case 'engineering':
        return <ConstructionEngineeringSuite key={project.id} project={project} currency={currency} />;
      case 'contractors':
        return <BppContractorPortal key={project.id} currency={currency} tenderSumAudit={project.contractSumInitial} />;
      case 'governance':
        return <GovernanceCenter />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans">
      {/* App Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currency={currency}
        setCurrency={setCurrency}
        onOpenAuditCertificate={() => handleOpenCertificate(3)}
        activeProject={project}
        portfolioProjects={portfolioProjects}
        onSelectProject={handleSelectProject}
        onOpenProjectModal={() => setShowProjectModal(true)}
        tabs={visibleTabs}
        statusSlot={<WorkspaceStatus status={sync.status} onRetry={sync.retry} onReload={() => void reloadLatest()} />}
      />

      {!ws.permissions.editContracts && (
        <div className="no-print bg-amber-50 border-b border-amber-200 text-amber-900 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center gap-2">
            <Eye className="w-4 h-4 shrink-0" />
            You have read-only access to contracts. You can explore scenarios, but changes are not saved.
          </div>
        </div>
      )}
      {sync.status.state === 'conflict' && (
        <div role="alert" className="no-print bg-red-50 border-b border-red-200 text-red-900 text-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex flex-wrap items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {sync.status.message} Your latest edit to it was not saved.
            <button onClick={() => void reloadLatest()} className="font-bold underline">Load the latest version</button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {/* Keyed by tab so a crashed module recovers when the user navigates away */}
        <ErrorBoundary key={activeTab} moduleName={activeTabLabel}>
          <Suspense fallback={<ModuleLoading />}>{renderActiveModule()}</Suspense>
        </ErrorBoundary>
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-stone-200 py-6 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <AfriProcureLogo size="sm" variant="badge" />
            <span className="hidden sm:inline text-stone-400">|</span>
            <span className="text-stone-600 font-medium">
              National Infrastructure Procurement & Forensic Cost Engineering Operating System
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-stone-500 font-mono text-[11px]">
            <span>FIDIC Red 13.8</span>
            <span>•</span>
            <span>PPA 2007 (Nigeria)</span>
            <span>•</span>
            <span>BPP Prior-Review</span>
            <span>•</span>
            <span>OCDS Compliant</span>
            {ws.store.mode === 'local' && <span className="text-stone-300">|</span>}
            {ws.store.mode !== 'local' ? null : confirmReset ? (
              <span className="inline-flex items-center gap-2 font-sans">
                <span className="text-red-700 font-semibold">Discard all saved contracts and settings?</span>
                <button onClick={handleResetWorkspace} className="px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold">
                  Reset
                </button>
                <button onClick={() => setConfirmReset(false)} className="px-2 py-1 rounded-md border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold">
                  Cancel
                </button>
              </span>
            ) : (
              <button
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1 font-sans text-stone-500 hover:text-stone-900"
                title="Restore the demonstration portfolio and default settings"
              >
                <RotateCcw className="w-3 h-3" />
                Reset workspace
              </button>
            )}
          </div>
        </div>
      </footer>

      <Suspense fallback={null}>
        {/* Printable Audit Certificate Modal */}
        {showAuditModal && (
          <ErrorBoundary moduleName="Audit Certificate">
            <AuditCertificateModal
              project={project}
              currency={currency}
              month={selectedCertMonth}
              onClose={() => setShowAuditModal(false)}
            />
          </ErrorBoundary>
        )}

        {/* Project Customizer Modal */}
        {showProjectModal && (
          <ErrorBoundary moduleName="Contract Settings">
            <ProjectModal
              project={project}
              currency={currency}
              onSave={handleSaveProject}
              onClose={() => setShowProjectModal(false)}
            />
          </ErrorBoundary>
        )}
      </Suspense>
    </div>
  );
}
