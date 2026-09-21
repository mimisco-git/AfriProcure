/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DEFAULT_CONTRACT, PORTFOLIO_PROJECTS } from './data/defaultData';
import { ContractProject, CurrencyCode } from './types';
import { Header } from './components/Header';
import { CpaCalculator } from './components/CpaCalculator';
import { IpcSchedule } from './components/IpcSchedule';
import { TenderShield } from './components/TenderShield';
import { MacroIndicesTracker } from './components/MacroIndicesTracker';
import { CaseStudiesViewer } from './components/CaseStudiesViewer';
import { BppDossierGenerator } from './components/BppDossierGenerator';
import { AuditCertificateModal } from './components/AuditCertificateModal';
import { PpaComplianceCenter } from './components/PpaComplianceCenter';
import { ClaimsDisputeCenter } from './components/ClaimsDisputeCenter';
import { ProjectModal } from './components/ProjectModal';
import { SecuritiesAndVariations } from './components/SecuritiesAndVariations';
import { Building2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'cpa' | 'ipc' | 'tender' | 'claims' | 'ppa' | 'macro' | 'cases' | 'dossier' | 'securities'>('cpa');
  const [portfolioProjects, setPortfolioProjects] = useState<ContractProject[]>(PORTFOLIO_PROJECTS);
  const [project, setProject] = useState<ContractProject>(DEFAULT_CONTRACT);
  const [currency, setCurrency] = useState<CurrencyCode>('NGN');
  const [showAuditModal, setShowAuditModal] = useState<boolean>(false);
  const [showProjectModal, setShowProjectModal] = useState<boolean>(false);
  const [selectedCertMonth, setSelectedCertMonth] = useState<number>(3);

  const handleOpenCertificate = (month: number = 3) => {
    setSelectedCertMonth(month);
    setShowAuditModal(true);
  };

  const handleSelectProject = (newProject: ContractProject) => {
    setProject(newProject);
  };

  const handleSaveProject = (updatedOrFn: ContractProject | ((prev: ContractProject) => ContractProject)) => {
    setProject((prev) => {
      const updated = typeof updatedOrFn === 'function' ? (updatedOrFn as (p: ContractProject) => ContractProject)(prev) : updatedOrFn;
      setPortfolioProjects((portfolioPrev) =>
        portfolioPrev.map((p) => (p.id === updated.id ? updated : p))
      );
      return updated;
    });
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
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'cpa' && (
          <CpaCalculator
            project={project}
            setProject={handleSaveProject}
            currency={currency}
          />
        )}

        {activeTab === 'ipc' && (
          <IpcSchedule
            project={project}
            currency={currency}
            onGenerateCertForMonth={handleOpenCertificate}
          />
        )}

        {activeTab === 'tender' && (
          <TenderShield
            currency={currency}
          />
        )}

        {activeTab === 'claims' && (
          <ClaimsDisputeCenter
            project={project}
            currency={currency}
          />
        )}

        {activeTab === 'ppa' && (
          <PpaComplianceCenter
            currency={currency}
          />
        )}

        {activeTab === 'macro' && (
          <MacroIndicesTracker
            currency={currency}
            project={project}
            onUpdateProjectComponents={(updatedComponents) => {
              handleSaveProject((prev) => ({
                ...prev,
                components: updatedComponents,
              }));
            }}
          />
        )}

        {activeTab === 'cases' && (
          <CaseStudiesViewer />
        )}

        {activeTab === 'dossier' && (
          <BppDossierGenerator
            project={project}
            currency={currency}
          />
        )}

        {activeTab === 'securities' && (
          <SecuritiesAndVariations
            project={project}
            currency={currency}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="no-print bg-white border-t border-stone-200 py-6 text-xs text-stone-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-amber-600" />
            <span>
              <strong>AfriProcure Enterprise</strong> • Public Infrastructure Procurement & Forensic Cost Engineering System
            </span>
          </div>

          <div className="flex items-center gap-4 text-stone-500">
            <span>FIDIC Sub-Clause 13.8</span>
            <span>•</span>
            <span>Nigerian PPA 2007 Clause 39</span>
            <span>•</span>
            <span>Open Contracting Partnership (OCDS)</span>
          </div>
        </div>
      </footer>

      {/* Printable Audit Certificate Modal */}
      {showAuditModal && (
        <AuditCertificateModal
          project={project}
          currency={currency}
          month={selectedCertMonth}
          onClose={() => setShowAuditModal(false)}
        />
      )}

      {/* Project Customizer Modal */}
      {showProjectModal && (
        <ProjectModal
          project={project}
          currency={currency}
          onSave={handleSaveProject}
          onClose={() => setShowProjectModal(false)}
        />
      )}
    </div>
  );
}
