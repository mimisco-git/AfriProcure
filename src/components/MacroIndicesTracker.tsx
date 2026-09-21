import React, { useState } from 'react';
import { AFRICAN_MACRO_INDICATORS, BENCHMARK_PRICES } from '../data/defaultData';
import { MacroIndicator, CurrencyCode, BenchmarkMaterialPrice, ContractProject, PriceComponent } from '../types';
import { TrendingUp, TrendingDown, ExternalLink, ShieldCheck, Database, RefreshCw, Layers, CheckCircle2, ArrowUpRight } from 'lucide-react';

interface MacroIndicesTrackerProps {
  currency: CurrencyCode;
  project?: ContractProject;
  onUpdateProjectComponents?: (updatedComponents: PriceComponent[]) => void;
  onApplyIndexToProject?: (indicator: MacroIndicator) => void;
}

export const MacroIndicesTracker: React.FC<MacroIndicesTrackerProps> = ({
  currency,
  project,
  onUpdateProjectComponents,
  onApplyIndexToProject,
}) => {
  const [syncedFeedback, setSyncedFeedback] = useState<string | null>(null);

  const handleSyncAllBenchmarks = () => {
    if (!project || !onUpdateProjectComponents) return;

    const updated = project.components.map((comp) => {
      // Find matching benchmark price by symbol or category
      const matched = BENCHMARK_PRICES.find(
        (b) => b.targetComponentSymbol === comp.symbol || comp.name.toLowerCase().includes(b.category)
      );

      if (matched) {
        return {
          ...comp,
          currentValue: matched.currentPrice,
          sourceAgency: matched.sourceAgency,
        };
      }
      return comp;
    });

    onUpdateProjectComponents(updated);
    setSyncedFeedback('Successfully synchronized 6 National Building Material indices into active contract!');
    setTimeout(() => setSyncedFeedback(null), 4000);
  };

  const handleSyncSingleBenchmark = (benchmark: BenchmarkMaterialPrice) => {
    if (!project || !onUpdateProjectComponents) return;

    const updated = project.components.map((comp) => {
      if (comp.symbol === benchmark.targetComponentSymbol || comp.name.toLowerCase().includes(benchmark.category)) {
        return {
          ...comp,
          currentValue: benchmark.currentPrice,
          sourceAgency: benchmark.sourceAgency,
        };
      }
      return comp;
    });

    onUpdateProjectComponents(updated);
    setSyncedFeedback(`Synced latest ${benchmark.name} price (${benchmark.currentPrice.toLocaleString()}) to project!`);
    setTimeout(() => setSyncedFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider">
                Official Price Indices & Construction Feeds
              </span>
              <span className="text-xs text-stone-400">
                Provenance: NBS, NMDPRA, CBN, SON & Quorum
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 tracking-tight">
              Verified Construction Materials & Macroeconomic Feeds
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              In FIDIC Pink Book and PPA 2007 procurement, CPA calculations must never rely on subjective contractor invoices. They must legally anchor on recognized national statistical benchmarks to satisfy the Auditor-General and World Bank oversight.
            </p>
          </div>

          {project && onUpdateProjectComponents && (
            <div className="space-y-2 shrink-0">
              <button
                onClick={handleSyncAllBenchmarks}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-all active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                Sync Verified Benchmarks to Active Contract
              </button>
              {syncedFeedback && (
                <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-800/80 px-3 py-1.5 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{syncedFeedback}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feature 2: National Construction Materials Price Index Feed */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              Nigerian Building Materials Benchmark Timeseries (2024 - 2026)
            </h3>
            <p className="text-xs text-stone-500">
              Audited market price points for statutory contract escalation computation (NBS Monthly Construction Series).
            </p>
          </div>
          <span className="text-xs font-mono font-semibold text-stone-500 bg-stone-100 px-2.5 py-1 rounded-md">
            6 Core Categories
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {BENCHMARK_PRICES.map((bm) => {
            const minPrice = Math.min(...bm.history.map((h) => h.price));
            const maxPrice = Math.max(...bm.history.map((h) => h.price));
            const range = maxPrice - minPrice || 1;

            // Generate SVG Polyline points
            const points = bm.history
              .map((h, i) => {
                const x = (i / (bm.history.length - 1)) * 140;
                const y = 40 - ((h.price - minPrice) / range) * 30;
                return `${x},${y}`;
              })
              .join(' ');

            return (
              <div
                key={bm.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:border-amber-400/60 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600 font-mono">
                      Symbol: {bm.targetComponentSymbol}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        bm.volatilityRank === 'extreme'
                          ? 'bg-red-100 text-red-800'
                          : bm.volatilityRank === 'high'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {bm.volatilityRank} Volatility
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-stone-900 leading-tight mb-1">
                    {bm.name}
                  </h4>
                  <div className="text-[11px] text-stone-500 line-clamp-1 mb-3">
                    {bm.sourceAgency}
                  </div>

                  {/* Price & Sparkline */}
                  <div className="flex items-end justify-between gap-2 py-2 border-y border-stone-100">
                    <div>
                      <div className="text-xs text-stone-500">Current Verified Price</div>
                      <div className="text-xl font-black text-stone-900 font-mono">
                        ₦{bm.currentPrice.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-stone-500 font-medium">Unit: {bm.unit}</div>
                    </div>

                    {/* SVG Sparkline */}
                    <div className="text-right">
                      <div className="text-[10px] text-stone-400 font-mono mb-1">2-Yr Trend</div>
                      <svg width="140" height="42" className="overflow-visible">
                        <polyline
                          fill="none"
                          stroke="#d97706"
                          strokeWidth="2.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={points}
                        />
                        {bm.history.map((h, i) => {
                          const cx = (i / (bm.history.length - 1)) * 140;
                          const cy = 40 - ((h.price - minPrice) / range) * 30;
                          return (
                            <circle
                              key={i}
                              cx={cx}
                              cy={cy}
                              r="2.5"
                              className="fill-amber-600"
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] font-mono">
                    <div>
                      <span className="text-stone-400 block">Base Year:</span>
                      <strong className="text-stone-700">₦{bm.baseYearPrice.toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-stone-400 block">12-Mo Surge:</span>
                      <strong className="text-red-600">+{bm.oneYearChangePct.toFixed(1)}%</strong>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    BPP Standard
                  </span>
                  {project && onUpdateProjectComponents && (
                    <button
                      onClick={() => handleSyncSingleBenchmark(bm)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 hover:underline inline-flex items-center gap-1"
                    >
                      <span>Sync to {bm.targetComponentSymbol}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* African Macroeconomic Headwinds */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
            National Monetary & Macroeconomic Rates
          </h3>
          <span className="text-xs text-stone-500 font-mono">Quarterly Updates</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {AFRICAN_MACRO_INDICATORS.map((ind) => {
            const isUp = ind.change12MonthsPct > 0;

            return (
              <div
                key={ind.id}
                className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs hover:border-stone-300 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-600">
                      {ind.country} • {ind.category.toUpperCase()}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded-full ${
                        isUp ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-900'
                      }`}
                    >
                      {isUp ? <TrendingUp className="w-3 h-3 text-amber-700" /> : <TrendingDown className="w-3 h-3 text-emerald-700" />}
                      {isUp ? `+${ind.change12MonthsPct.toFixed(1)}%` : `${ind.change12MonthsPct.toFixed(1)}%`} YoY
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-stone-900 leading-snug mb-1">
                    {ind.name}
                  </h4>
                  <div className="text-[11px] text-stone-500 mb-3">
                    {ind.agency}
                  </div>

                  <div className="flex items-baseline justify-between py-2 border-t border-stone-100">
                    <div>
                      <div className="text-2xl font-black text-stone-900 font-mono">
                        {ind.currentRate.toLocaleString('en-US')}
                      </div>
                      <div className="text-xs text-stone-500">{ind.unit}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-stone-400 block uppercase">Base Date</span>
                      <span className="text-xs text-stone-500 font-semibold font-mono">
                        {ind.previousRate.toLocaleString('en-US')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Statutory Audit Verified
                  </span>
                  <span className="font-mono text-[10px]">{ind.lastUpdated}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Methodology & Data Integrity Card */}
      <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200 text-xs text-stone-700 space-y-2 leading-relaxed">
        <div className="flex items-center gap-2 font-bold text-stone-900 uppercase tracking-wider text-xs">
          <Database className="w-4 h-4 text-amber-600" />
          Statutory Verification Standards for Price Adjustment in African Public Works
        </div>
        <p>
          Under the <strong>Nigerian Public Procurement Act (PPA 2007 Clause 39)</strong> and <strong>FIDIC Red Book Sub-Clause 13.8</strong>, price adjustment indices must meet four strict criteria:
        </p>
        <ul className="list-disc list-inside space-y-1 pl-1 text-stone-600">
          <li><strong>Independence:</strong> Published by a recognized government statistical agency (NBS) or regulatory commission (NMDPRA, SON, CBN) without private stakeholder alteration.</li>
          <li><strong>Continuity:</strong> Available throughout the full execution horizon of the contract without unexpected methodology shifts.</li>
          <li><strong>Proportionality:</strong> The weightings (<span className="font-mono font-bold">a, b, c, d...</span>) assigned in Appendix to Tender must reflect actual Bill of Quantities (BOQ) cost compositions certified by a registered Quantity Surveyor (NIQS).</li>
          <li><strong>28-Day Rule:</strong> Base indices (I<sub>o</sub>) are strictly fixed at the date 28 days prior to the deadline for bid submission.</li>
        </ul>
      </div>
    </div>
  );
};
