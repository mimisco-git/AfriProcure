import React, { useState } from 'react';
import { TenderBidder, CurrencyCode, BeneficialOwnershipRecord } from '../types';
import { DEFAULT_TENDER_BIDDERS, BENEFICIAL_OWNERSHIP_RECORDS } from '../data/defaultData';
import { evaluateTenderBids, formatCurrency, formatFullCurrency } from '../utils/cpaMath';
import { exportTenderAuditToCsv } from '../utils/csvExporter';
import { ShieldAlert, AlertTriangle, CheckCircle2, UserX, Users, Plus, Trash2, Scale, Info, Download, Network, Building2, Search, ExternalLink, ShieldCheck, Flag } from 'lucide-react';

interface TenderShieldProps {
  currency: CurrencyCode;
}

export const TenderShield: React.FC<TenderShieldProps> = ({ currency }) => {
  const [activeTab, setActiveTab] = useState<'bids' | 'ownership'>('bids');
  const [engineersEstimate, setEngineersEstimate] = useState<number>(4200000000); // ₦4.20 Billion
  const [bidders, setBidders] = useState<TenderBidder[]>(DEFAULT_TENDER_BIDDERS);
  const [ownershipFilter, setOwnershipFilter] = useState<string>('');
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);

  const auditResult = evaluateTenderBids(engineersEstimate, bidders);

  const updateBidder = (id: string, field: keyof TenderBidder, value: any) => {
    setBidders((prev) =>
      prev.map((b) => {
        if (b.id === id) {
          return { ...b, [field]: value };
        }
        return b;
      })
    );
  };

  const removeBidder = (id: string) => {
    setBidders((prev) => prev.filter((b) => b.id !== id));
  };

  const addBidder = () => {
    const newBidder: TenderBidder = {
      id: `bidder-${Date.now()}`,
      companyName: 'New Bidder Consortium Ltd',
      rcNumber: `RC-${Math.floor(100000 + Math.random() * 900000)}`,
      bidAmount: engineersEstimate * 0.98,
      technicalScore: 80,
      isDomesticContractor: true,
      completionTimeWeeks: 52,
      bidSecurityVerified: true,
      taxClearanceVerified: true,
      pencomComplianceVerified: true,
      itfComplianceVerified: true,
    };
    setBidders((prev) => [...prev, newBidder]);
  };

  const filteredOwnershipRecords = BENEFICIAL_OWNERSHIP_RECORDS.filter((rec) => {
    if (!ownershipFilter) return true;
    const q = ownershipFilter.toLowerCase();
    return (
      rec.companyName.toLowerCase().includes(q) ||
      rec.rcNumber.toLowerCase().includes(q) ||
      rec.directors.some((d) => d.toLowerCase().includes(q)) ||
      rec.ultimateBeneficialOwner.toLowerCase().includes(q) ||
      rec.officeAddress.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Banner / Forensic Context */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-red-500 text-white font-bold text-xs uppercase tracking-wider">
                Forensic Tender & Cartel Screener
              </span>
              <span className="text-xs text-stone-400">
                Statutory Base: Nigerian PPA 2007 (Sections 34 & 58) & CAMA 2020 (PSC/UBO)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 tracking-tight">
              Tender Shield: Abnormally Low Tender (ALT) & Collusion Screener
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              In public procurement, corrupt or desperate contractors submit <strong>suicide bids</strong> (bidding 30% below cost to win, then abandoning) or engage in <strong>cover bidding</strong> (submitting cosmetic companion bids to fix the award price). This engine algorithmically audits tender bids and cross-examines beneficial ownership prior to contract award.
            </p>
          </div>

          {/* Engineer's Estimate Card */}
          <div className="bg-stone-800/90 border border-stone-700/80 rounded-xl p-4 min-w-[280px] space-y-2">
            <div className="text-xs text-stone-400 font-semibold uppercase tracking-wider">
              Independent Engineer's Baseline Estimate (BE)
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={engineersEstimate}
                onChange={(e) => setEngineersEstimate(Number(e.target.value) || 0)}
                className="w-full px-3 py-1.5 bg-stone-900 border border-stone-700 rounded-lg text-amber-400 font-mono font-bold text-lg focus:outline-hidden focus:border-amber-400"
              />
            </div>
            <div className="text-[11px] text-stone-400">
              Formatted: <strong className="text-stone-200 font-mono">{formatFullCurrency(engineersEstimate, currency)}</strong>
            </div>
          </div>
        </div>

        {/* Collusion / Beneficial Ownership Warnings Alert Bar */}
        {auditResult.clusterWarnings.length > 0 && (
          <div className="mt-5 pt-4 border-t border-stone-800 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-red-400 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span>Critical Cartel & Collusion Patterns Detected:</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              {auditResult.clusterWarnings.map((w, idx) => (
                <div key={idx} className="bg-red-950/60 border border-red-800/80 text-red-200 rounded-lg p-2.5 flex items-start gap-2">
                  <span className="font-bold text-red-400 text-sm leading-none">•</span>
                  <span>{w}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sub-Tabs: Bid Evaluation vs Beneficial Ownership Cross-Audit */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-2">
        <button
          onClick={() => setActiveTab('bids')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'bids'
              ? 'bg-stone-900 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Bid Evaluation & Forensic Matrix ({bidders.length} Bidders)</span>
        </button>

        <button
          onClick={() => setActiveTab('ownership')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
            activeTab === 'ownership'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Beneficial Ownership & Corporate Registry Network (CAC / BPP)</span>
          <span className="px-1.5 py-0.5 rounded-full bg-red-100 text-red-900 text-[10px] font-bold">
            Conflict Alert
          </span>
        </button>
      </div>

      {activeTab === 'bids' ? (
        <>
          {/* Summary Metric Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
              <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Median Bid Value</div>
              <div className="text-xl font-bold font-mono text-stone-900 mt-1">
                {formatCurrency(auditResult.medianBid, currency)}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Benchmark for outlier cluster deviation
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
              <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">ALT Threshold (&lt; 80% BE)</div>
              <div className="text-xl font-bold font-mono text-amber-600 mt-1">
                {formatCurrency(engineersEstimate * 0.8, currency)}
              </div>
              <div className="text-[11px] text-amber-700 mt-1">
                Statutory trigger for rate breakdown demand
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
              <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Responsive & Qualified</div>
              <div className="text-xl font-bold font-mono text-emerald-600 mt-1">
                {auditResult.bidders.filter(b => !b.isHighRisk).length} / {bidders.length}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Passed preliminary & statutory checks
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
              <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">Collusion Risk Level</div>
              <div className={`text-xl font-bold font-mono mt-1 ${
                auditResult.clusterWarnings.length > 0 ? 'text-red-600' : 'text-emerald-600'
              }`}>
                {auditResult.clusterWarnings.length > 0 ? 'HIGH RISK' : 'CLEAN BID'}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Cross-bid variance: {auditResult.spreadPct.toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Interactive Bidders Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Submitted Tenders Audit Ledger
                </h3>
                <p className="text-xs text-stone-500">
                  Click on compliance badges to simulate statutory verification statuses.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => exportTenderAuditToCsv(auditResult, currency)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors"
                >
                  <Download className="w-3.5 h-3.5 text-stone-500" />
                  <span>Export Audit (CSV)</span>
                </button>
                <button
                  onClick={addBidder}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-xs transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Tenderer</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="px-4 py-3">Bidder / RC No.</th>
                    <th className="px-3 py-3">Bid Amount</th>
                    <th className="px-3 py-3">% of Eng. Est</th>
                    <th className="px-3 py-3">Tech Score</th>
                    <th className="px-3 py-3 text-center">TCC (FIRS)</th>
                    <th className="px-3 py-3 text-center">PENCOM</th>
                    <th className="px-3 py-3">Evaluation Verdict</th>
                    <th className="px-3 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {bidders.map((bidder) => {
                    const ratioToEstimate = bidder.bidAmount / engineersEstimate;
                    const isALT = ratioToEstimate < 0.80;
                    const evaluatedBidder = auditResult.bidders.find((b) => b.bidder.id === bidder.id);
                    const isWinner = auditResult.recommendedWinner === bidder.companyName;
                    const suspicionFlags = evaluatedBidder?.suspicionFlags || [];

                    return (
                      <tr
                        key={bidder.id}
                        className={`hover:bg-stone-50/80 transition-colors ${
                          isWinner ? 'bg-emerald-50/50' : suspicionFlags.length > 0 ? 'bg-red-50/30' : ''
                        }`}
                      >
                        <td className="px-4 py-3 font-sans">
                          <div className="font-bold text-stone-900">{bidder.companyName}</div>
                          <div className="text-[11px] text-stone-500 font-mono flex items-center gap-2">
                            <span>{bidder.rcNumber}</span>
                            {bidder.isDomesticContractor && (
                              <span className="text-[10px] bg-stone-100 text-stone-600 px-1.5 py-0.2 rounded">
                                Domestic Preference (7.5%)
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-3 py-3">
                          <input
                            type="number"
                            value={bidder.bidAmount}
                            onChange={(e) => updateBidder(bidder.id, 'bidAmount', Number(e.target.value) || 0)}
                            className="w-32 px-2 py-1 rounded border border-stone-200 font-mono font-bold text-stone-900 focus:outline-hidden focus:border-amber-500"
                          />
                        </td>

                        <td className="px-3 py-3">
                          <span
                            className={`font-bold px-2 py-0.5 rounded text-[11px] ${
                              isALT
                                ? 'bg-red-100 text-red-800'
                                : ratioToEstimate > 1.15
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-700'
                            }`}
                          >
                            {(ratioToEstimate * 100).toFixed(1)}%
                          </span>
                        </td>

                        <td className="px-3 py-3">
                          <div className="flex items-center gap-1.5">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={bidder.technicalScore}
                              onChange={(e) => updateBidder(bidder.id, 'technicalScore', Number(e.target.value) || 0)}
                              className="w-14 px-1.5 py-1 rounded border border-stone-200 font-mono text-center focus:outline-hidden focus:border-amber-500"
                            />
                            <span className="text-[10px] text-stone-400">/100</span>
                          </div>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => updateBidder(bidder.id, 'taxClearanceVerified', !bidder.taxClearanceVerified)}
                            className={`p-1 rounded font-sans text-xs font-semibold ${
                              bidder.taxClearanceVerified ? 'text-emerald-600' : 'text-red-500'
                            }`}
                            title="Toggle Tax Clearance"
                          >
                            {bidder.taxClearanceVerified ? '✓ Valid' : '✗ Expired'}
                          </button>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => updateBidder(bidder.id, 'pencomComplianceVerified', !bidder.pencomComplianceVerified)}
                            className={`p-1 rounded font-sans text-xs font-semibold ${
                              bidder.pencomComplianceVerified ? 'text-emerald-600' : 'text-red-500'
                            }`}
                            title="Toggle PENCOM Compliance"
                          >
                            {bidder.pencomComplianceVerified ? '✓ Valid' : '✗ Missing'}
                          </button>
                        </td>

                        <td className="px-3 py-3 font-sans">
                          {isWinner ? (
                            <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Lowest Responsive Qualified Bid</span>
                            </div>
                          ) : suspicionFlags.length > 0 ? (
                            <div className="space-y-1">
                              {suspicionFlags.map((flag, fIdx) => (
                                <div key={fIdx} className="text-[10px] text-red-700 flex items-start gap-1">
                                  <span className="text-red-500 font-bold">•</span>
                                  <span>{flag}</span>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-stone-500 text-[11px]">Qualified (Higher Evaluated Price)</span>
                          )}
                        </td>

                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={() => removeBidder(bidder.id)}
                            disabled={bidders.length <= 2}
                            className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 transition-colors"
                            title="Remove tenderer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Tab 2: Feature 4 Beneficial Ownership & Collusion Graph */
        <div className="space-y-6">
          {/* Corporate Linkage & Collusion Network Graph (Visual SVG) */}
          <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <Network className="w-4 h-4" />
                  Forensic Collusion & Common Ownership Topology
                </h3>
                <p className="text-xs text-stone-400">
                  Visual mapping of shared directors, common beneficial owners, and overlapping corporate registrations.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-red-950/80 text-red-400 border border-red-800">
                1 Cross-Ownership Cartel Ring Detected
              </span>
            </div>

            {/* SVG Visual Relationship Graph */}
            <div className="bg-stone-950 rounded-xl p-4 border border-stone-800 overflow-x-auto">
              <div className="min-w-[640px] text-xs font-mono relative py-4">
                {/* Visual Cartel Ring Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                  {/* Entity 1 */}
                  <div className="bg-stone-900 border-2 border-red-500 rounded-xl p-3.5 space-y-1.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-900 text-red-200">BIDDER A</span>
                      <span className="text-[10px] text-stone-400 font-mono">RC-149204</span>
                    </div>
                    <div className="font-bold text-stone-100 text-sm">Apex Infrastructure Ltd</div>
                    <div className="text-[11px] text-stone-400">Bid: ₦3,980,000,000</div>
                    <div className="text-[10px] text-red-400 pt-1 border-t border-stone-800">
                      UBO: Alhaji Garba Danfulani (72% Equity)
                    </div>
                  </div>

                  {/* Red Intersecting Hub */}
                  <div className="flex flex-col items-center justify-center p-3 bg-red-950/80 border border-red-600 rounded-xl text-center space-y-2">
                    <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                    <div className="text-xs font-bold text-red-200 uppercase">
                      CRITICAL COLLUSION LINK
                    </div>
                    <div className="text-[10px] text-red-300 leading-tight">
                      Common Director & UBO:<br />
                      <strong className="text-white text-xs">Alhaji Garba Danfulani</strong><br />
                      Shared Address: Plot 402 Constitution Ave, Abuja<br />
                      BVN Cluster: <strong>BVN-2219488102</strong>
                    </div>
                    <div className="text-[9px] bg-red-900/90 text-red-200 px-2 py-0.5 rounded uppercase font-bold">
                      PPA 2007 SEC 58(4) VIOLATION
                    </div>
                  </div>

                  {/* Entity 2 */}
                  <div className="bg-stone-900 border-2 border-red-500 rounded-xl p-3.5 space-y-1.5 shadow-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-900 text-red-200">BIDDER C (COMPANION)</span>
                      <span className="text-[10px] text-stone-400 font-mono">RC-883192</span>
                    </div>
                    <div className="font-bold text-stone-100 text-sm">Sahel Earthworks Nigeria</div>
                    <div className="text-[11px] text-stone-400">Bid: ₦4,050,000,000</div>
                    <div className="text-[10px] text-red-400 pt-1 border-t border-stone-800">
                      UBO: Alhaji Garba Danfulani (45% Equity)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by Company, Director, UBO, or RC number..."
                value={ownershipFilter}
                onChange={(e) => setOwnershipFilter(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-stone-300 text-xs text-stone-900 focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div className="text-xs text-stone-500">
              Showing <strong>{filteredOwnershipRecords.length}</strong> corporate entities with verified CAC ownership filings
            </div>
          </div>

          {/* Beneficial Ownership Records Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredOwnershipRecords.map((rec) => {
              const hasSharedLink = !!rec.sharedClusterId || !!rec.bankVerificationNumberCluster;

              return (
                <div
                  key={rec.id}
                  className={`bg-white rounded-2xl p-5 border transition-all shadow-xs flex flex-col justify-between ${
                    rec.isDebarredByBpp
                      ? 'border-red-400 bg-red-50/10'
                      : hasSharedLink
                      ? 'border-amber-400 bg-amber-50/10'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div>
                    {/* Header line */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                          {rec.rcNumber}
                        </span>
                        <h4 className="text-sm font-bold text-stone-900 mt-1">
                          {rec.companyName}
                        </h4>
                      </div>

                      {rec.isDebarredByBpp ? (
                        <span className="px-2 py-0.5 rounded bg-red-100 text-red-900 font-bold text-[10px] uppercase flex items-center gap-1">
                          <Flag className="w-3 h-3 text-red-600" />
                          Debarred by BPP
                        </span>
                      ) : hasSharedLink ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-bold text-[10px] uppercase flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          Collusion Flag
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 font-bold text-[10px] uppercase flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          Clean Filing
                        </span>
                      )}
                    </div>

                    <div className="text-[11px] text-stone-500 mb-3 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span>{rec.officeAddress}</span>
                    </div>

                    {/* UBO and Directors details */}
                    <div className="bg-stone-50 rounded-xl p-3 space-y-2 text-xs border border-stone-100 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">Ultimate Beneficial Owner:</span>
                        <strong className="text-stone-900 font-bold">{rec.ultimateBeneficialOwner}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-stone-500">TIN Number:</span>
                        <span className="font-bold text-stone-800">{rec.tinNumber}</span>
                      </div>
                      {rec.bankVerificationNumberCluster && (
                        <div className="flex items-center justify-between">
                          <span className="text-stone-500">BVN Cluster:</span>
                          <span className="text-[11px] text-amber-800 font-bold">{rec.bankVerificationNumberCluster}</span>
                        </div>
                      )}
                      <div className="pt-1.5 border-t border-stone-200">
                        <span className="text-stone-500 block text-[10px] mb-1">Board of Directors:</span>
                        <div className="flex flex-wrap gap-1">
                          {rec.directors.map((dir, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-white text-stone-700 border border-stone-200 text-[10px]">
                              {dir}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Debarment or Collusion Note */}
                    {rec.isDebarredByBpp && rec.debarmentDetails && (
                      <div className="mt-3 p-2.5 rounded-lg bg-red-100/70 border border-red-200 text-red-900 text-xs space-y-1">
                        <div className="font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-600" />
                          <span>Sanctions / Debarment Record:</span>
                        </div>
                        <p className="text-[11px] leading-relaxed">
                          {rec.debarmentDetails}
                        </p>
                      </div>
                    )}

                    {hasSharedLink && !rec.isDebarredByBpp && (
                      <div className="mt-3 p-2.5 rounded-lg bg-amber-100/70 border border-amber-200 text-amber-900 text-xs">
                        <strong>Forensic Finding:</strong> Shared registered corporate address or banking cluster ({rec.sharedClusterId || rec.bankVerificationNumberCluster}). PPA 2007 Section 58 cartel violation.
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                    <span>CAMA 2020 Persons of Significant Control (PSC)</span>
                    <span className="text-stone-700 font-bold">Filing Verified</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
