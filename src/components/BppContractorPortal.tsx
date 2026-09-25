import React, { useState } from 'react';
import { CurrencyCode } from '../types';
import { formatCurrency, formatFullCurrency } from '../utils/cpaMath';
import { 
  BppContractorRecord, 
  BPP_FEDERAL_CONTRACTORS_DATABASE, 
  BPP_CATEGORY_THRESHOLDS, 
  validateContractorBppLimit, 
  calculateEligibleBppCategory 
} from '../data/bppContractorRegistry';
import { AfriProcureLogo } from './AfriProcureLogo';
import { 
  Building2, 
  ShieldCheck, 
  ShieldAlert, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Award, 
  FileText, 
  Download, 
  Printer, 
  ExternalLink, 
  Briefcase, 
  Users, 
  Landmark, 
  ChevronRight, 
  Calculator,
  HardHat,
  BadgeCheck,
  FileSpreadsheet
} from 'lucide-react';

interface BppContractorPortalProps {
  currency: CurrencyCode;
  tenderSumAudit?: number;
}

export const BppContractorPortal: React.FC<BppContractorPortalProps> = ({ 
  currency, 
  tenderSumAudit = 1_450_000_000 // default ₦1.45 Billion
}) => {
  const [activeView, setActiveView] = useState<'database' | 'calculator' | 'thresholds' | 'certificate'>('database');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [selectedContractor, setSelectedContractor] = useState<BppContractorRecord>(BPP_FEDERAL_CONTRACTORS_DATABASE[0]);
  const [testTenderAmount, setTestTenderAmount] = useState<number>(tenderSumAudit);

  // Self-assessment calculator state
  const [calcTurnover, setCalcTurnover] = useState<number>(1_800_000_000);
  const [calcNetWorth, setCalcNetWorth] = useState<number>(650_000_000);
  const [calcCoren, setCalcCoren] = useState<number>(9);
  const [calcPlantScore, setCalcPlantScore] = useState<number>(85);
  const [calcAuditedYears, setCalcAuditedYears] = useState<number>(3);

  const calculatedTier = calculateEligibleBppCategory({
    annualTurnover: calcTurnover,
    netWorth: calcNetWorth,
    corenEngineers: calcCoren,
    plantScorePct: calcPlantScore,
    auditedYears: calcAuditedYears,
  });

  // Filtered contractors
  const filteredContractors = BPP_FEDERAL_CONTRACTORS_DATABASE.filter((c) => {
    const matchesSearch =
      c.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.irrNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.rcNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.sector.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = selectedCategoryFilter === 'ALL' || c.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const auditValidation = validateContractorBppLimit(selectedContractor, testTenderAmount);

  return (
    <div className="space-y-6">
      {/* Executive Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-6 border border-stone-800 shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-sm bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider">
                BPP Statutory Portal
              </span>
              <span className="text-xs text-stone-400 font-mono">
                PPA 2007 Section 5(h) • NDCCSP National Database
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-stone-100 tracking-tight">
              BPP Contractor Registration, Classification & IRR Verification Desk
            </h1>
            <p className="text-xs sm:text-sm text-stone-300 max-w-3xl leading-relaxed">
              Mandatory federal contractor due diligence portal under the <strong>Bureau of Public Procurement (BPP)</strong>. Cross-examine Interim Registration Reports (IRR), audit single contract value ceilings, inspect engineering council accreditations (COREN/QSRBN), and issue formal Certificates of BPP Prior-Review Clearance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveView('certificate')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition-colors shadow-xs"
            >
              <Award className="w-4 h-4" />
              Generate BPP Due Diligence Dossier
            </button>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-1.5 mt-5 pt-3 border-t border-stone-800 text-xs font-semibold overflow-x-auto">
          <button
            onClick={() => setActiveView('database')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all ${
              activeView === 'database'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            1. Federal Contractor Database (NDCCSP)
          </button>
          <button
            onClick={() => setActiveView('thresholds')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all ${
              activeView === 'thresholds'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Landmark className="w-4 h-4" />
            2. BPP Categorization Thresholds (Cat A - F)
          </button>
          <button
            onClick={() => setActiveView('calculator')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all ${
              activeView === 'calculator'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Calculator className="w-4 h-4" />
            3. Contractor Category Assessment Simulator
          </button>
          <button
            onClick={() => setActiveView('certificate')}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md transition-all ${
              activeView === 'certificate'
                ? 'bg-amber-500 text-stone-950 font-bold'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <Award className="w-4 h-4" />
            4. Official BPP Due Diligence Dossier
          </button>
        </div>
      </div>

      {/* VIEW 1: DATABASE & LIVE CONTRACT LIMIT AUDIT */}
      {activeView === 'database' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Search & Contractor List (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-amber-600" />
                  NDCCSP Registered Contractors
                </h3>
                <span className="text-[11px] font-mono text-stone-500 font-semibold">
                  {filteredContractors.length} Records
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search by company name, IRR No., or RC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 font-medium"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1 text-[11px]">
                {['ALL', 'A', 'B', 'C', 'D', 'E', 'F'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategoryFilter(cat)}
                    className={`px-2 py-1 rounded-sm border font-mono font-bold transition-colors ${
                      selectedCategoryFilter === cat
                        ? 'bg-stone-900 text-amber-300 border-stone-900'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {cat === 'ALL' ? 'ALL CATS' : `CAT ${cat}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Contractor Cards List */}
            <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
              {filteredContractors.map((c) => {
                const isSelected = selectedContractor.id === c.id;
                const isLimitOk = testTenderAmount <= c.singleContractLimit;
                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedContractor(c)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/70 border-amber-400 shadow-xs'
                        : 'bg-white border-stone-200 hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-stone-900 text-xs leading-snug">
                            {c.companyName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-500 font-mono">
                          <span>{c.irrNumber}</span>
                          <span>•</span>
                          <span>{c.rcNumber}</span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold border ${
                          c.category === 'A'
                            ? 'bg-purple-50 text-purple-800 border-purple-200'
                            : c.category === 'B'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : c.category === 'C'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : 'bg-stone-100 text-stone-700 border-stone-300'
                        }`}>
                          CAT {c.category}
                        </span>
                        <div className="text-[10px] text-stone-500 mt-1 font-mono">
                          Limit: ₦{(c.singleContractLimit / 1_000_000).toLocaleString()}M
                        </div>
                      </div>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-stone-100 flex items-center justify-between text-[10px]">
                      <span className="text-stone-500 truncate max-w-[200px]">{c.sector}</span>
                      <div className="flex items-center gap-1">
                        {c.status === 'Approved' ? (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Approved
                          </span>
                        ) : (
                          <span className="text-rose-700 font-semibold flex items-center gap-1">
                            <XCircle className="w-3 h-3 text-rose-600" />
                            {c.status}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Detailed Forensic Dossier & Tender Sum Validator (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Live Statutory Audit Bar */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
                <div>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider font-mono">
                    Statutory Rule Check: PPA 2007 Sec 5(h)
                  </span>
                  <h3 className="text-sm font-bold text-stone-900 mt-0.5">
                    Proposed Contract Sum vs. BPP Authorized Single Contract Ceiling
                  </h3>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-stone-600 shrink-0">Tender Sum:</label>
                  <div className="relative">
                    <span className="absolute left-2.5 top-2 text-stone-400 font-mono text-xs font-bold">₦</span>
                    <input
                      type="number"
                      step={50000000}
                      value={testTenderAmount}
                      onChange={(e) => setTestTenderAmount(Math.max(1000000, Number(e.target.value)))}
                      className="pl-6 pr-2 py-1.5 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs font-bold text-stone-900 w-44 focus:outline-hidden focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Audit Result Alert Banner */}
              <div className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                auditValidation.isEligible
                  ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50/80 border-rose-300 text-rose-950'
              }`}>
                {auditValidation.isEligible ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider">
                      {auditValidation.isEligible ? 'STATUTORY COMPLIANCE CONFIRMED' : 'STATUTORY DISQUALIFICATION FLAG'}
                    </span>
                    <span className="text-[11px] font-mono">
                      (Limit: ₦{(auditValidation.categoryLimit / 1_000_000).toLocaleString()}M)
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed font-medium">
                    {auditValidation.reason}
                  </p>
                </div>
              </div>
            </div>

            {/* Selected Contractor Detailed Credentials Card */}
            <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-stone-900 tracking-tight">
                      {selectedContractor.companyName}
                    </h2>
                    <span className="px-2 py-0.5 rounded-sm bg-stone-900 text-amber-300 font-mono text-[10px] font-bold">
                      CAT {selectedContractor.category}
                    </span>
                  </div>
                  <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2 font-mono">
                    <span>IRR: <strong className="text-stone-800">{selectedContractor.irrNumber}</strong></span>
                    <span>•</span>
                    <span>RC: <strong className="text-stone-800">{selectedContractor.rcNumber}</strong></span>
                    <span>•</span>
                    <span>TIN: <strong className="text-stone-800">{selectedContractor.tin}</strong></span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-stone-500">Validity Expiry</div>
                  <div className="font-mono text-xs font-bold text-stone-900">{selectedContractor.validUntil}</div>
                </div>
              </div>

              {/* 4-Box Key Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="text-[10px] font-bold text-stone-500 uppercase">Single Contract Cap</div>
                  <div className="font-mono font-bold text-xs text-stone-900">
                    ₦{(selectedContractor.singleContractLimit / 1_000_000).toLocaleString()}M
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="text-[10px] font-bold text-stone-500 uppercase">Avg Annual Turnover</div>
                  <div className="font-mono font-bold text-xs text-stone-900">
                    ₦{(selectedContractor.averageAnnualTurnover / 1_000_000).toLocaleString()}M
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="text-[10px] font-bold text-stone-500 uppercase">COREN Registered</div>
                  <div className="font-mono font-bold text-xs text-stone-900">
                    {selectedContractor.registeredProfessionals.corenEngineers} Engineers
                  </div>
                </div>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-1">
                  <div className="text-[10px] font-bold text-stone-500 uppercase">Equipment Audit Score</div>
                  <div className="font-mono font-bold text-xs text-stone-900">
                    {selectedContractor.plantAndEquipmentScorePct}% (Verified)
                  </div>
                </div>
              </div>

              {/* Statutory Clearances Matrix */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <BadgeCheck className="w-4 h-4 text-emerald-600" />
                  Mandatory Statutory Clearances (Preliminary Gatekeeper Check)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg border border-stone-200 flex items-center justify-between">
                    <span className="font-medium text-stone-600">FIRS Tax (3 Yrs):</span>
                    <span className={`font-mono font-bold text-[11px] ${
                      selectedContractor.firsTccStatus === 'Valid' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {selectedContractor.firsTccStatus}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-stone-200 flex items-center justify-between">
                    <span className="font-medium text-stone-600">PENCOM Clearance:</span>
                    <span className={`font-mono font-bold text-[11px] ${
                      selectedContractor.pencomStatus === 'Compliant' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {selectedContractor.pencomStatus}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-stone-200 flex items-center justify-between">
                    <span className="font-medium text-stone-600">ITF Training Fund:</span>
                    <span className={`font-mono font-bold text-[11px] ${
                      selectedContractor.itfStatus === 'Compliant' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {selectedContractor.itfStatus}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-stone-200 flex items-center justify-between">
                    <span className="font-medium text-stone-600">NSITF Social Security:</span>
                    <span className={`font-mono font-bold text-[11px] ${
                      selectedContractor.nsitfStatus === 'Compliant' ? 'text-emerald-700' : 'text-rose-700'
                    }`}>
                      {selectedContractor.nsitfStatus}
                    </span>
                  </div>
                </div>
              </div>

              {/* Technical Professionals Register */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <HardHat className="w-4 h-4 text-amber-600" />
                  Key Personnel & Professional Regulatory Councils
                </h4>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-stone-50 rounded-lg border border-stone-200">
                    <div className="font-bold text-stone-900 font-mono text-sm">
                      {selectedContractor.registeredProfessionals.corenEngineers}
                    </div>
                    <div className="text-[10px] text-stone-500 font-semibold">COREN Engineers</div>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-lg border border-stone-200">
                    <div className="font-bold text-stone-900 font-mono text-sm">
                      {selectedContractor.registeredProfessionals.qsRbnSurveyors}
                    </div>
                    <div className="text-[10px] text-stone-500 font-semibold">QSRBN Surveyors</div>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-lg border border-stone-200">
                    <div className="font-bold text-stone-900 font-mono text-sm">
                      {selectedContractor.registeredProfessionals.corbonBuilders}
                    </div>
                    <div className="text-[10px] text-stone-500 font-semibold">CORBON Builders</div>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-lg border border-stone-200">
                    <div className="font-bold text-stone-900 font-mono text-sm">
                      {selectedContractor.registeredProfessionals.arconArchitects}
                    </div>
                    <div className="text-[10px] text-stone-500 font-semibold">ARCON Architects</div>
                  </div>
                </div>
              </div>

              {/* Verified Federal Project Track Record */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1.5">
                  <FileSpreadsheet className="w-4 h-4 text-stone-600" />
                  Verified Federal MDA Contract Performance Track Record
                </h4>
                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-600 border-b border-stone-200 font-semibold text-[10px] uppercase">
                      <tr>
                        <th className="px-3 py-2">Federal Project Title</th>
                        <th className="px-3 py-2">Procuring Entity (MDA)</th>
                        <th className="px-3 py-2 text-right">Value (₦)</th>
                        <th className="px-3 py-2 text-center">Year</th>
                        <th className="px-3 py-2 text-center">Rating</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100 bg-white">
                      {selectedContractor.federalTrackRecord.map((p, idx) => (
                        <tr key={idx} className="hover:bg-stone-50/50">
                          <td className="px-3 py-2 font-medium text-stone-900">{p.projectTitle}</td>
                          <td className="px-3 py-2 text-stone-600">{p.procuringEntity}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-stone-900">
                            ₦{(p.contractValue / 1_000_000).toLocaleString()}M
                          </td>
                          <td className="px-3 py-2 text-center font-mono text-stone-500">{p.completionYear}</td>
                          <td className="px-3 py-2 text-center">
                            <span className={`px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold border ${
                              p.performanceRating === 'Exemplary'
                                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                : 'bg-blue-50 text-blue-800 border-blue-200'
                            }`}>
                              {p.performanceRating}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Head Office & Leadership */}
              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-stone-600">
                <div>
                  <span className="font-semibold text-stone-800">Head Office:</span> {selectedContractor.headOfficeAddress}
                </div>
                <div>
                  <span className="font-semibold text-stone-800">Chief Executive:</span> {selectedContractor.managingDirector}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: BPP CATEGORIZATION THRESHOLDS */}
      {activeView === 'thresholds' && (
        <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
            <div>
              <h2 className="text-base font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
                <Landmark className="w-5 h-5 text-amber-600" />
                Official BPP Contractor Categorization & Financial Limits (PPA 2007)
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Statutory grading matrix established by the Bureau of Public Procurement to ensure contractors only execute works within their audited financial & technical capacity.
              </p>
            </div>
            <div className="text-xs font-mono font-bold text-stone-700 bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200">
              National Database Guidelines (2025/2026 Edition)
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BPP_CATEGORY_THRESHOLDS.map((tier) => (
              <div
                key={tier.category}
                className="p-5 rounded-2xl border border-stone-200 bg-white hover:border-stone-300 hover:shadow-xs transition-all space-y-3"
              >
                <div className="flex items-center justify-between border-b pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-lg bg-stone-900 text-amber-300 font-mono font-bold flex items-center justify-center text-sm">
                      {tier.category}
                    </span>
                    <div>
                      <h3 className="font-bold text-stone-900 text-xs">
                        Category {tier.category}
                      </h3>
                      <div className="text-[10px] text-stone-500 font-mono">
                        Max Ceiling: ₦{(tier.worksMaxContractValue / 1_000_000).toLocaleString()}M
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-sm bg-stone-100 text-stone-700 font-mono text-[10px] font-bold border border-stone-200">
                    {tier.category === 'A' ? 'UNLIMITED' : `≤ ₦${(tier.worksMaxContractValue / 1_000_000_000).toFixed(1)}B`}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Min. 3-Year Avg Turnover:</span>
                    <strong className="text-stone-900 font-mono">≥ ₦{(tier.minAverageTurnover / 1_000_000).toLocaleString()}M</strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span>COREN Registered Engineers:</span>
                    <strong className="text-stone-900 font-mono">≥ {tier.minKeyEngineers}</strong>
                  </div>
                  <div className="flex items-center justify-between text-stone-600">
                    <span>Audited Accounts Required:</span>
                    <strong className="text-stone-900 font-mono">{tier.minAuditedYears} Years</strong>
                  </div>
                </div>

                <p className="text-[11px] text-stone-600 bg-stone-50 p-2.5 rounded-lg border border-stone-100 leading-relaxed">
                  {tier.description}
                </p>

                <div className="text-[10px] text-amber-800 font-medium font-mono pt-1">
                  Scope: {tier.typicalScope}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 3: CONTRACTOR SELF-ASSESSMENT SIMULATOR */}
      {activeView === 'calculator' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <Calculator className="w-5 h-5 text-amber-600" />
                Contractor Capacity & BPP Classification Self-Assessment Simulator
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Input your firm's financial turnover, key engineering registrations, and equipment audits to calculate your official eligible BPP Category.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-stone-700">Average 3-Year Audited Annual Turnover:</label>
                  <span className="font-mono font-bold text-stone-900">
                    ₦{(calcTurnover / 1_000_000).toLocaleString()} Million
                  </span>
                </div>
                <input
                  type="range"
                  min={10000000}
                  max={10000000000}
                  step={50000000}
                  value={calcTurnover}
                  onChange={(e) => setCalcTurnover(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-bold text-stone-700">Net Assets / Tangible Net Worth:</label>
                  <span className="font-mono font-bold text-stone-900">
                    ₦{(calcNetWorth / 1_000_000).toLocaleString()} Million
                  </span>
                </div>
                <input
                  type="range"
                  min={5000000}
                  max={3000000000}
                  step={20000000}
                  value={calcNetWorth}
                  onChange={(e) => setCalcNetWorth(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">COREN Registered Engineers:</label>
                  <input
                    type="number"
                    min={0}
                    max={50}
                    value={calcCoren}
                    onChange={(e) => setCalcCoren(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs font-bold text-stone-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Plant & Equipment Score (%):</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={calcPlantScore}
                    onChange={(e) => setCalcPlantScore(Math.min(100, Math.max(0, Number(e.target.value))))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg font-mono text-xs font-bold text-stone-900"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-stone-700">Years of Audited Accounts:</label>
                  <select
                    value={calcAuditedYears}
                    onChange={(e) => setCalcAuditedYears(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-xs font-bold text-stone-900"
                  >
                    <option value={1}>1 Year (New / SME)</option>
                    <option value={2}>2 Years</option>
                    <option value={3}>3 Years (Full Statutory)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-5">
            <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider">
              Statutory Evaluation Result
            </h3>

            <div className="p-5 bg-stone-900 text-white rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                  Assigned Classification Tier
                </span>
                <span className="text-xs text-stone-400 font-mono">BPP NDCCSP</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-amber-300 font-mono">
                  CAT {calculatedTier.assignedCategory}
                </span>
                <span className="text-xs text-stone-300">
                  Authorized Single Contract Limit:
                </span>
              </div>

              <div className="text-2xl font-black text-stone-100 font-mono">
                {calculatedTier.assignedCategory === 'A'
                  ? '₦100+ BILLION (UNLIMITED)'
                  : `₦${(calculatedTier.maxAuthorizedValue / 1_000_000).toLocaleString()} MILLION`}
              </div>

              <div className="pt-3 border-t border-stone-800 text-xs text-stone-300">
                <strong className="text-amber-300">Statutory Assessment:</strong> {calculatedTier.bottleneck}
              </div>
            </div>

            <div className="space-y-2 text-xs text-stone-600">
              <div className="font-bold text-stone-900">BPP Classification Principles:</div>
              <ul className="list-disc pl-4 space-y-1 text-[11px]">
                <li>Section 5(h) of PPA 2007 empowers BPP to maintain and update the contractor register.</li>
                <li>Firms bidding above their authorized category face immediate disqualification by the Tenders Board.</li>
                <li>Annual renewal requires fresh Tax Clearance Certificates (TCC) and PENCOM compliance receipts.</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: OFFICIAL BPP DUE DILIGENCE CLEARANCE DOSSIER */}
      {activeView === 'certificate' && (
        <div className="bg-white rounded-2xl max-w-4xl mx-auto p-8 border border-stone-300 shadow-xl space-y-6">
          <div className="no-print flex items-center justify-between pb-4 border-b border-stone-200">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-sm bg-amber-50 text-amber-900 font-mono font-bold text-xs uppercase border border-amber-200">
                Statutory Form BPP/PROC/001
              </span>
              <span className="text-xs text-stone-500 font-mono">Due Diligence Clearance Certificate</span>
            </div>

            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              Print Official Certificate
            </button>
          </div>

          {/* Letterhead */}
          <div className="border-b-2 border-stone-900 pb-5 text-center space-y-1">
            <div className="flex justify-center mb-2">
              <AfriProcureLogo size="lg" variant="badge" />
            </div>
            <div className="text-[11px] font-bold tracking-widest text-stone-600 uppercase font-mono">
              Federal Republic of Nigeria • Presidency
            </div>
            <h1 className="text-xl font-black text-stone-900 tracking-tight uppercase">
              Bureau of Public Procurement (BPP)
            </h1>
            <div className="text-xs text-stone-600 font-medium">
              National Database of Contractors, Consultants & Service Providers (NDCCSP)
            </div>
            <div className="text-[11px] text-stone-500 font-mono">
              11 Suleiman Barau Crescent, Presidential Villa, Abuja FCT • www.bpp.gov.ng
            </div>
          </div>

          {/* Certificate Title */}
          <div className="text-center py-2 bg-stone-50 rounded-xl border border-stone-200">
            <h2 className="text-sm font-extrabold text-stone-900 uppercase tracking-wider">
              Statutory Due Diligence & Contractor Classification Clearance Certificate
            </h2>
            <div className="text-xs font-mono text-stone-600 mt-0.5">
              Certificate No: <strong className="text-stone-900 font-mono">{selectedContractor.bppCertificateRef}</strong>
            </div>
          </div>

          {/* Formal Body */}
          <div className="text-xs text-stone-800 space-y-3 leading-relaxed">
            <p>
              This is to formally certify that <strong>{selectedContractor.companyName}</strong> (CAC Registration: <strong>{selectedContractor.rcNumber}</strong>, Tax ID: <strong>{selectedContractor.tin}</strong>) has been fully audited, vetted, and registered under <strong>Section 5(h) of the Public Procurement Act 2007</strong> on the Federal Republic of Nigeria National Database.
            </p>

            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
              <div>
                <span className="text-[10px] text-stone-500 block uppercase">IRR Number:</span>
                <strong className="text-stone-900">{selectedContractor.irrNumber}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block uppercase">Authorized Category:</span>
                <strong className="text-stone-900">Category {selectedContractor.category}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block uppercase">Single Contract Ceiling:</span>
                <strong className="text-stone-900">₦{(selectedContractor.singleContractLimit / 1_000_000).toLocaleString()}M</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block uppercase">FIRS Tax Clearance:</span>
                <strong className="text-emerald-700">{selectedContractor.firsTccStatus}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block uppercase">PENCOM Compliance:</span>
                <strong className="text-emerald-700">{selectedContractor.pencomStatus}</strong>
              </div>
              <div>
                <span className="text-[10px] text-stone-500 block uppercase">Validity Expiry Date:</span>
                <strong className="text-stone-900">{selectedContractor.validUntil}</strong>
              </div>
            </div>

            <p>
              The procuring entity (Ministry, Department, or Agency) is hereby authorized to evaluate tenders submitted by the subject firm up to the authorized single contract limit of <strong>₦{(selectedContractor.singleContractLimit / 1_000_000).toLocaleString()} Million</strong>. Awards in excess of this ceiling are strictly invalid and void ab initio pursuant to BPP Categorization Directives.
            </p>
          </div>

          {/* Official Signatures */}
          <div className="pt-8 border-t border-stone-300 grid grid-cols-2 gap-8 text-xs">
            <div className="space-y-1">
              <div className="h-10 border-b border-dashed border-stone-400 flex items-end">
                <span className="font-serif italic text-stone-600 text-sm">Engr. Babatunde K. Lawal, FNSE</span>
              </div>
              <div className="font-bold text-stone-900">Director, Database & Documentation</div>
              <div className="text-[10px] text-stone-500 font-mono">Bureau of Public Procurement (BPP)</div>
            </div>

            <div className="space-y-1 text-right">
              <div className="h-10 border-b border-dashed border-stone-400 flex items-end justify-end">
                <span className="font-serif italic text-stone-600 text-sm">Official BPP Security Hologram Seal</span>
              </div>
              <div className="font-bold text-stone-900">Director General & Chief Executive</div>
              <div className="text-[10px] text-stone-500 font-mono">BPP Presidency, Abuja FCT</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
