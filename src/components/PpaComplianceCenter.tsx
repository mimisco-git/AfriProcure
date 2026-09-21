import React, { useState } from 'react';
import { PPA_2007_SECTIONS_REGISTRY, BPP_THRESHOLD_MATRIX_2025, determinePpaApprovalTier, PpaSection } from '../data/ppaRegistry';
import { CurrencyCode } from '../types';
import { formatCurrency, formatFullCurrency } from '../utils/cpaMath';
import { Landmark, Scale, ShieldAlert, CheckCircle, AlertTriangle, FileText, ChevronDown, ChevronUp, Search, Info, Award, Briefcase } from 'lucide-react';

interface PpaComplianceCenterProps {
  currency: CurrencyCode;
}

export const PpaComplianceCenter: React.FC<PpaComplianceCenterProps> = ({ currency }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSection, setSelectedSection] = useState<string>('Section 39');
  const [testContractSum, setTestContractSum] = useState<number>(14500000000); // ₦14.5 Billion
  const [isWorksType, setIsWorksType] = useState<boolean>(true);
  const [showOnlyOffences, setShowOnlyOffences] = useState<boolean>(false);

  const activeApprovalTier = determinePpaApprovalTier(testContractSum, isWorksType);

  const filteredSections = PPA_2007_SECTIONS_REGISTRY.filter((sec) => {
    const matchesSearch =
      sec.sectionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.legalTextSummary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sec.practicalApplication.toLowerCase().includes(searchQuery.toLowerCase());

    if (showOnlyOffences) {
      return matchesSearch && (sec.sectionNumber.includes('58') || sec.sectionNumber.includes('35') || sec.sectionNumber.includes('31'));
    }
    return matchesSearch;
  });

  const currentSection = PPA_2007_SECTIONS_REGISTRY.find((s) => s.sectionNumber === selectedSection) || PPA_2007_SECTIONS_REGISTRY[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-md">
        <div className="max-w-4xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider">
              Statutory Law & Regulatory Engine
            </span>
            <span className="text-xs text-stone-400">
              Federal Republic of Nigeria • Public Procurement Act (PPA 2007) & BPP Gazetted Thresholds
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 tracking-tight">
            Public Procurement Act 2007 & BPP Statutory Compliance Center
          </h2>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
            Every price adjustment, milestone valuation, tender evaluation, and contract award must legally conform to the <strong>Public Procurement Act 2007</strong> and official Bureau of Public Procurement (BPP) gazetted directives. Use this interactive module to audit contract threshold compliance, verify statutory clauses, and enforce anti-corruption safeguards.
          </p>
        </div>
      </div>

      {/* Threshold Calculator & Approval Matrix */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
          <div>
            <div className="flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                BPP Statutory Prior-Review & Approval Authority Matrix
              </h3>
            </div>
            <p className="text-xs text-stone-600 mt-0.5">
              Determines whether your contract requires Federal Executive Council (FEC), Ministerial Board (MTB), or BPP "Certificate of No Objection".
            </p>
          </div>

          <div className="flex items-center gap-2 bg-stone-100 p-1 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setIsWorksType(true)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                isWorksType ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Civil Works / Infrastructure
            </button>
            <button
              onClick={() => setIsWorksType(false)}
              className={`px-3 py-1.5 rounded-md transition-all ${
                !isWorksType ? 'bg-white text-stone-900 shadow-xs font-bold' : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              Goods & Consultancy Services
            </button>
          </div>
        </div>

        {/* Input & Assessment Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Input Box */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <label className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
              Contract Sum for Approval Audit:
            </label>
            <div className="space-y-1.5">
              <div className="relative">
                <input
                  type="number"
                  value={testContractSum}
                  onChange={(e) => setTestContractSum(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-lg text-stone-900 font-mono font-bold text-base focus:outline-hidden focus:border-amber-500"
                />
              </div>
              <div className="text-[11px] text-stone-500">
                Evaluating: <strong className="font-mono text-stone-800">{formatFullCurrency(testContractSum, currency)}</strong>
              </div>
            </div>

            <div className="pt-2 text-[11px] text-stone-500 border-t border-stone-200 space-y-1">
              <div>• Section 16(1)(b): Prior budgetary appropriation required</div>
              <div>• Section 16(2): Anti-splitting prohibition enforced</div>
            </div>
          </div>

          {/* Statutory Result Card */}
          <div className="lg:col-span-2 p-4 sm:p-5 rounded-xl border bg-amber-50/50 border-amber-200 space-y-3 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">
                  Statutory Approval Tier (PPA 2007 Sec 17 & BPP Regulations)
                </span>
                {activeApprovalTier.requiresBppCertificateOfNoObjection ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
                    <ShieldAlert className="w-3 h-3" />
                    BPP Certificate of "No Objection" MANDATORY
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle className="w-3 h-3" />
                    Within Internal MDA Delegated Threshold
                  </span>
                )}
              </div>

              <div className="text-lg sm:text-xl font-black text-stone-900">
                Approving Body: <span className="text-amber-950 underline decoration-amber-400">{activeApprovalTier.approvingAuthority}</span>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed">
                {activeApprovalTier.description}
              </p>
            </div>

            <div className="pt-3 border-t border-amber-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Mandatory Tender Method:</span>
                <span className="font-semibold text-stone-900">{activeApprovalTier.tenderMethodMandatory}</span>
              </div>
              <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200">
                <span className="text-[10px] uppercase font-bold text-stone-500 block">Legal Validation Status:</span>
                <span className="font-semibold text-stone-900">
                  {activeApprovalTier.requiresBppCertificateOfNoObjection
                    ? 'Award without BPP Certificate is NULL & VOID'
                    : 'Governed by Internal Tenders Board Minutes'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* All Threshold Levels Table */}
        <div className="pt-4 overflow-x-auto">
          <table className="w-full text-left text-xs border border-stone-200 rounded-lg">
            <thead className="bg-stone-100 font-bold text-stone-700">
              <tr>
                <th className="p-2.5">Authority Tier</th>
                <th className="p-2.5 font-mono">Works Threshold</th>
                <th className="p-2.5 font-mono">Goods / Services</th>
                <th className="p-2.5">BPP Prior Review</th>
                <th className="p-2.5">Tender Method</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {BPP_THRESHOLD_MATRIX_2025.map((row) => {
                const isSelected = row.approvingAuthority === activeApprovalTier.approvingAuthority;

                return (
                  <tr
                    key={row.approvingAuthority}
                    className={`transition-colors ${
                      isSelected ? 'bg-amber-100/60 font-semibold text-amber-950' : 'hover:bg-stone-50'
                    }`}
                  >
                    <td className="p-2.5 font-medium flex items-center gap-1.5">
                      {isSelected && <span className="w-2 h-2 rounded-full bg-amber-600"></span>}
                      {row.approvingAuthority}
                    </td>
                    <td className="p-2.5 font-mono">
                      {row.worksMax
                        ? `${formatCurrency(row.worksMin, currency)} - ${formatCurrency(row.worksMax, currency)}`
                        : `${formatCurrency(row.worksMin, currency)} & above`}
                    </td>
                    <td className="p-2.5 font-mono">
                      {row.goodsAndServicesMax
                        ? `${formatCurrency(row.goodsAndServicesMin, currency)} - ${formatCurrency(row.goodsAndServicesMax, currency)}`
                        : `${formatCurrency(row.goodsAndServicesMin, currency)} & above`}
                    </td>
                    <td className="p-2.5">
                      {row.requiresBppCertificateOfNoObjection ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-800">
                          YES (Certificate of No Objection)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-stone-200 text-stone-700">
                          Internal MDA Review
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-stone-600">{row.tenderMethodMandatory}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Interactive PPA 2007 Statutory Section Navigator */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-200">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-600" />
              <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                PPA 2007 Statutory Clause Navigator & Forensic Audit Checklists
              </h3>
            </div>
            <p className="text-xs text-stone-600">
              Click any section to inspect the statutory legal text, operational practice, mandatory compliance checks, and legal sanctions.
            </p>
          </div>

          {/* Search & Filter Controls */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-stone-400" />
              <input
                type="text"
                placeholder="Search Act sections..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-stone-50 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-hidden focus:border-amber-500 w-48"
              />
            </div>
            <button
              onClick={() => setShowOnlyOffences(!showOnlyOffences)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                showOnlyOffences
                  ? 'bg-red-50 text-red-800 border-red-300'
                  : 'bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200'
              }`}
            >
              {showOnlyOffences ? 'Showing Offences Only' : 'Filter Offences'}
            </button>
          </div>
        </div>

        {/* Two-Column Section Explorer */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Section Selection List */}
          <div className="lg:col-span-5 space-y-2 max-h-[500px] overflow-y-auto pr-1">
            {filteredSections.map((sec) => {
              const isSelected = sec.sectionNumber === currentSection.sectionNumber;
              const isOffence = sec.sectionNumber.includes('58');

              return (
                <button
                  key={sec.sectionNumber}
                  onClick={() => setSelectedSection(sec.sectionNumber)}
                  className={`w-full p-3 rounded-xl text-left border transition-all flex flex-col gap-1 ${
                    isSelected
                      ? 'bg-amber-50 border-amber-400 shadow-xs ring-1 ring-amber-400/50'
                      : 'bg-white border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                        isOffence ? 'bg-red-100 text-red-900' : 'bg-stone-100 text-stone-800'
                      }`}
                    >
                      {sec.sectionNumber}
                    </span>
                    <span className="text-[10px] text-stone-500 font-medium">{sec.part}</span>
                  </div>
                  <div className="text-xs font-bold text-stone-900 mt-1">{sec.title}</div>
                  <div className="text-[11px] text-stone-600 line-clamp-1">
                    {sec.legalTextSummary}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Detailed Section Inspector */}
          <div className="lg:col-span-7 bg-stone-50 rounded-2xl p-5 border border-stone-200 space-y-4">
            <div className="space-y-1 pb-3 border-b border-stone-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono px-2.5 py-1 rounded bg-amber-500 text-stone-950">
                  {currentSection.sectionNumber} • {currentSection.part}
                </span>
                <span className="text-xs text-stone-500 font-semibold">{currentSection.partTitle}</span>
              </div>
              <h4 className="text-base font-extrabold text-stone-900 pt-1">
                {currentSection.title}
              </h4>
            </div>

            {/* Legal Summary */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                Statutory Legal Provision:
              </span>
              <p className="text-xs text-stone-800 bg-white p-3.5 rounded-xl border border-stone-200 leading-relaxed font-serif">
                "{currentSection.legalTextSummary}"
              </p>
            </div>

            {/* Practical Application in Construction & CPA */}
            <div className="space-y-1.5">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                Practical Execution & AfriProcure Implementation:
              </span>
              <p className="text-xs text-stone-700 bg-white p-3.5 rounded-xl border border-stone-200 leading-relaxed">
                {currentSection.practicalApplication}
              </p>
            </div>

            {/* Mandatory Compliance Checkpoints */}
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold text-stone-500 tracking-wider block">
                Mandatory Auditor-General & BPP Compliance Checks:
              </span>
              <div className="space-y-1.5">
                {currentSection.complianceChecks.map((chk, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs text-stone-800 bg-white p-2.5 rounded-lg border border-stone-200"
                  >
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{chk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Legal Penalties / Sanctions */}
            <div className="p-3.5 rounded-xl bg-red-950 text-red-100 border border-red-900 space-y-1 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-red-300 uppercase tracking-wider text-[10px]">
                <ShieldAlert className="w-4 h-4 text-red-400" />
                Statutory Penalties & Legal Consequences (Section 58)
              </div>
              <p className="text-[11px] text-red-200 leading-relaxed">
                {currentSection.penaltiesOrConsequences}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
