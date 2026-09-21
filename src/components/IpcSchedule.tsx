import React, { useState } from 'react';
import { ContractProject, CurrencyCode, EarnedValuePoint } from '../types';
import { generateIpcSchedule, formatCurrency, formatPercent } from '../utils/cpaMath';
import { exportIpcScheduleToCsv } from '../utils/csvExporter';
import { AlertCircle, TrendingDown, TrendingUp, CheckCircle, FileText, ArrowRight, ShieldAlert, Download, Activity, BarChart2, Layers } from 'lucide-react';

interface IpcScheduleProps {
  project: ContractProject;
  currency: CurrencyCode;
  onGenerateCertForMonth: (month: number) => void;
}

export const IpcSchedule: React.FC<IpcScheduleProps> = ({
  project,
  currency,
  onGenerateCertForMonth,
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'eva'>('schedule');
  const [inflationRateMonthly, setInflationRateMonthly] = useState<number>(0.022); // 2.2% per month (~30% annual headline inflation)
  const [selectedIpcDetail, setSelectedIpcDetail] = useState<number>(1);

  const schedule = generateIpcSchedule(project, inflationRateMonthly);

  // Compute total aggregates
  const totalBaseGross = schedule.reduce((sum, s) => sum + s.grossBillOfQuantities, 0);
  const totalAdjustedGross = schedule.reduce((sum, s) => sum + s.adjustedGrossValue, 0);
  const totalEscalationPaid = schedule.reduce((sum, s) => sum + s.escalationAmount, 0);
  const totalNetPaidToContractor = schedule.reduce((sum, s) => sum + s.netPayableToContractor, 0);
  const totalActualCost = schedule.reduce((sum, s) => sum + s.contractorActualCostEst, 0);

  // Default Horizon: Find the first month where fixed contract contractor margin drops below -15%
  const defaultHorizonMonth = schedule.find((s) => s.contractorMarginFixedContract < -0.15)?.month;

  // Generate Earned Value Analysis Timeseries
  const totalContract = project.contractSumInitial;
  const evaPoints: EarnedValuePoint[] = schedule.map((item, idx) => {
    const fraction = (idx + 1) / schedule.length;
    // S-curve cumulative progression
    const sCurveFactor = Math.pow(fraction, 1.25);
    const pv = totalContract * sCurveFactor;
    // Assume physical progress is slightly behind due to early site mobilization
    const evFactor = fraction < 0.4 ? 0.91 : fraction < 0.7 ? 0.94 : 0.97;
    const ev = pv * evFactor;
    // Actual cost is driven up by cumulative material escalation
    const ac = ev * item.priceAdjustmentMultiplier;

    const cpi = ev / (ac || 1);
    const spi = ev / (pv || 1);

    return {
      month: item.month,
      monthName: item.monthName || `Month ${item.month}`,
      plannedValue: pv,
      earnedValue: ev,
      actualCost: ac,
      cpi,
      spi,
      costVariance: ev - ac,
      scheduleVariance: ev - pv,
      estimateAtCompletion: cpi > 0 ? totalContract / cpi : totalContract,
    };
  });

  const latestEva = evaPoints[Math.min(5, evaPoints.length - 1)] || evaPoints[0];
  const maxVal = Math.max(...evaPoints.map((p) => Math.max(p.plannedValue, p.actualCost)));

  return (
    <div className="space-y-6">
      {/* Overview & Simulation Controls */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-stone-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs uppercase tracking-wider">
                IPC Cashflow & Project Performance
              </span>
              <span className="text-xs text-stone-500">
                Interim Payment Certificates (IPC 01 to IPC {project.durationMonths.toString().padStart(2, '0')})
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              Contractor Solvency & Earned Value (EVA) Curve
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Compare cashflow trajectory under traditional rigid fixed-price terms versus dynamic algorithmic CPA indexation. Track Planned Value (PV), Earned Value (EV), and Actual Cost (AC) to preemptively arrest project abandonment.
            </p>
          </div>

          {/* Monthly Inflation Stress Slider */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 min-w-[280px] space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-stone-600 font-semibold">Simulated Monthly Inflation:</span>
              <span className="font-mono font-bold text-amber-800 text-sm">
                {(inflationRateMonthly * 100).toFixed(1)}% / mo
              </span>
            </div>
            <input
              type="range"
              min="0.005"
              max="0.05"
              step="0.001"
              value={inflationRateMonthly}
              onChange={(e) => setInflationRateMonthly(parseFloat(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-stone-500 font-mono">
              <span>0.5% (Mild ~6% yr)</span>
              <span>2.5% (NBS 33% yr)</span>
              <span>5.0% (Crisis ~80% yr)</span>
            </div>
          </div>
        </div>

        {/* View Mode Sub-Tabs */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-stone-100">
          <button
            onClick={() => setActiveTab('schedule')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'schedule'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>IPC Valuation Ledger & Cashflow Deficit</span>
          </button>

          <button
            onClick={() => setActiveTab('eva')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'eva'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Earned Value Analysis (EVA) S-Curve</span>
            <span className="px-1.5 py-0.5 rounded-full bg-stone-900 text-amber-300 text-[10px] font-bold font-mono">
              CPI: {latestEva.cpi.toFixed(2)}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'eva' ? (
        /* Feature 6: Earned Value Analysis S-Curve */
        <div className="space-y-6">
          {/* EVA Diagnostic KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
              <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
                Cost Performance Index (CPI)
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-black font-mono ${latestEva.cpi >= 1.0 ? 'text-emerald-700' : 'text-red-600'}`}>
                  {latestEva.cpi.toFixed(3)}
                </span>
                <span className="text-[11px] font-bold text-stone-500">EV / AC</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                {latestEva.cpi >= 1.0 ? 'Within approved cost envelope' : 'Cost overrun: contractor spending > certified work'}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
              <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
                Schedule Performance Index (SPI)
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl font-black font-mono ${latestEva.spi >= 0.95 ? 'text-emerald-700' : 'text-amber-700'}`}>
                  {latestEva.spi.toFixed(3)}
                </span>
                <span className="text-[11px] font-bold text-stone-500">EV / PV</span>
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                {latestEva.spi >= 1.0 ? 'Ahead of baseline program' : 'Slight programmatic slippage detected'}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
              <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
                Earned Value at Month {latestEva.month}
              </div>
              <div className="text-xl font-bold font-mono text-emerald-800 mt-1">
                {formatCurrency(latestEva.earnedValue, currency)}
              </div>
              <div className="text-[11px] text-stone-500 mt-1">
                Certified physical progress on site
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-stone-200 shadow-xs">
              <div className="text-xs text-stone-500 font-semibold uppercase tracking-wider">
                Actual Cost Incurred (AC)
              </div>
              <div className="text-xl font-bold font-mono text-rose-700 mt-1">
                {formatCurrency(latestEva.actualCost, currency)}
              </div>
              <div className="text-[11px] text-rose-600 mt-1">
                Variance: {formatCurrency(latestEva.earnedValue - latestEva.actualCost, currency)}
              </div>
            </div>
          </div>

          {/* S-Curve Chart (Visual SVG) */}
          <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                  <BarChart2 className="w-4 h-4" />
                  Earned Value S-Curve Trajectory (PV vs EV vs AC)
                </h3>
                <p className="text-xs text-stone-400">
                  Visualizes physical milestone accomplishment against financial outlay and original baseline schedule.
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-sky-400 rounded-sm"></span>
                  <span className="text-sky-300">Planned Value (PV)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-emerald-400 rounded-sm"></span>
                  <span className="text-emerald-300">Earned Value (EV)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-1 bg-rose-400 rounded-sm"></span>
                  <span className="text-rose-300">Actual Cost (AC)</span>
                </div>
              </div>
            </div>

            {/* SVG S-Curve Chart Container */}
            <div className="w-full overflow-x-auto py-2">
              <div className="min-w-[640px] h-64 relative">
                <svg className="w-full h-full overflow-visible" viewBox="0 0 640 220">
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1.0].map((level, i) => {
                    const y = 200 - level * 180;
                    return (
                      <g key={i}>
                        <line x1="40" y1={y} x2="620" y2={y} stroke="#292524" strokeDasharray="3 3" />
                        <text x="35" y={y + 3} textAnchor="end" fill="#78716c" fontSize="9" fontFamily="monospace">
                          {((level * maxVal) / 1000000000).toFixed(1)}B
                        </text>
                      </g>
                    );
                  })}

                  {/* Planned Value Polyline (Sky) */}
                  <polyline
                    fill="none"
                    stroke="#38bdf8"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={evaPoints
                      .map((p, i) => {
                        const x = 50 + (i / (evaPoints.length - 1)) * 560;
                        const y = 200 - (p.plannedValue / maxVal) * 180;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Earned Value Polyline (Emerald) */}
                  <polyline
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={evaPoints
                      .map((p, i) => {
                        const x = 50 + (i / (evaPoints.length - 1)) * 560;
                        const y = 200 - (p.earnedValue / maxVal) * 180;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Actual Cost Polyline (Rose) */}
                  <polyline
                    fill="none"
                    stroke="#fb7185"
                    strokeWidth="3"
                    strokeDasharray="4 2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={evaPoints
                      .map((p, i) => {
                        const x = 50 + (i / (evaPoints.length - 1)) * 560;
                        const y = 200 - (p.actualCost / maxVal) * 180;
                        return `${x},${y}`;
                      })
                      .join(' ')}
                  />

                  {/* Milestone Nodes */}
                  {evaPoints.map((p, i) => {
                    const x = 50 + (i / (evaPoints.length - 1)) * 560;
                    const yPv = 200 - (p.plannedValue / maxVal) * 180;
                    const yEv = 200 - (p.earnedValue / maxVal) * 180;
                    const yAc = 200 - (p.actualCost / maxVal) * 180;

                    return (
                      <g key={i}>
                        <circle cx={x} cy={yPv} r="3" fill="#0284c7" />
                        <circle cx={x} cy={yEv} r="3.5" fill="#10b981" />
                        <circle cx={x} cy={yAc} r="3" fill="#f43f5e" />
                        <text x={x} y="215" textAnchor="middle" fill="#a8a29e" fontSize="10" fontFamily="monospace">
                          M{p.month}
                        </text>
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <span className="font-bold text-amber-300">Auditor's Project Control Interpretation:</span>
                <p className="text-stone-400 text-[11px] leading-relaxed">
                  The diverging gap between <strong>Actual Cost (AC)</strong> and <strong>Earned Value (EV)</strong> demonstrates that without contract price adjustment, the contractor is absorbing negative cashflow, leading to schedule drag (EV lag behind PV).
                </p>
              </div>
              <span className="shrink-0 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-mono font-bold">
                CPA Rectification Active
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 1: Standard IPC Schedule */
        <>
          {/* Comparative Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-red-50/70 border border-red-200/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-red-800 text-xs font-bold uppercase tracking-wider mb-1">
                <TrendingDown className="w-4 h-4" />
                Fixed Contract (Zero CPA)
              </div>
              <div className="text-2xl font-black text-red-900 font-mono">
                {defaultHorizonMonth ? `Month ${defaultHorizonMonth}` : 'Stressed'}
              </div>
              <p className="text-xs text-red-700 mt-1">
                {defaultHorizonMonth ? (
                  <>
                    Contractor working capital exhausts in <strong>Month {defaultHorizonMonth}</strong>, triggering site abandonment & litigation.
                  </>
                ) : (
                  'Contractor margin remains heavily suppressed.'
                )}
              </p>
            </div>

            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
                <CheckCircle className="w-4 h-4" />
                Algorithmic CPA (FIDIC 13.8)
              </div>
              <div className="text-2xl font-black text-emerald-900 font-mono">
                100% Completion
              </div>
              <p className="text-xs text-emerald-700 mt-1">
                Total statutory escalation of <strong>{formatCurrency(totalEscalationPaid, currency)}</strong> paid, preserving contractor liquidity.
              </p>
            </div>

            <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-bold uppercase tracking-wider mb-1">
                <ShieldAlert className="w-4 h-4" />
                Treasury Contingency Impact
              </div>
              <div className="text-2xl font-black text-amber-900 font-mono">
                +{((totalAdjustedGross / totalBaseGross - 1) * 100).toFixed(1)}%
              </div>
              <p className="text-xs text-amber-700 mt-1">
                Procuring entity requires supplementary procurement warrant of <strong>{formatCurrency(totalEscalationPaid, currency)}</strong>.
              </p>
            </div>
          </div>

          {/* Monthly Schedule Table */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Valuation Milestone Schedule (IPC 01 to {schedule.length})
                </h3>
                <p className="text-xs text-stone-500">
                  Calculated under FIDIC 14.3 interim certificate certification guidelines.
                </p>
              </div>

              <button
                onClick={() => exportIpcScheduleToCsv(project, schedule, currency)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 transition-colors"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>Export Schedule (CSV)</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                    <th className="px-3 py-3">IPC #</th>
                    <th className="px-3 py-3">Period</th>
                    <th className="px-3 py-3">Base BOQ Work</th>
                    <th className="px-3 py-3 text-center">Pn Index</th>
                    <th className="px-3 py-3">Escalated Gross</th>
                    <th className="px-3 py-3">Price Adj (CPA)</th>
                    <th className="px-3 py-3">Net Warrant Payable</th>
                    <th className="px-3 py-3 text-center">Fixed Margin</th>
                    <th className="px-3 py-3 text-center">CPA Margin</th>
                    <th className="px-3 py-3 text-center">Abandonment Risk</th>
                    <th className="px-3 py-3 text-center">Formal Cert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 font-mono">
                  {schedule.map((item) => {
                    const isCritical = item.contractorMarginFixedContract < -0.15;
                    const isSelected = selectedIpcDetail === item.month;

                    return (
                      <tr
                        key={item.month}
                        onClick={() => setSelectedIpcDetail(item.month)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-50/80 font-semibold'
                            : isCritical
                            ? 'bg-red-50/30 hover:bg-red-50/60'
                            : 'hover:bg-stone-50'
                        }`}
                      >
                        <td className="px-3 py-3 font-bold text-stone-900">
                          IPC-{item.month.toString().padStart(2, '0')}
                        </td>

                        <td className="px-3 py-3 text-stone-600 font-sans">
                          Month {item.month}
                        </td>

                        <td className="px-3 py-3">
                          {formatCurrency(item.grossBillOfQuantities, currency)}
                        </td>

                        <td className="px-3 py-3 text-center font-bold text-amber-700">
                          {item.priceAdjustmentMultiplier.toFixed(4)}
                        </td>

                        <td className="px-3 py-3 font-bold text-stone-900">
                          {formatCurrency(item.adjustedGrossValue, currency)}
                        </td>

                        <td className="px-3 py-3 text-amber-700 font-bold">
                          +{formatCurrency(item.escalationAmount, currency)}
                        </td>

                        <td className="px-3 py-3 font-bold text-emerald-800">
                          {formatCurrency(item.netPayableToContractor, currency)}
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                              isCritical
                                ? 'bg-red-100 text-red-800'
                                : item.contractorMarginFixedContract < 0
                                ? 'bg-orange-100 text-orange-800'
                                : 'bg-stone-100 text-stone-800'
                            }`}
                          >
                            {formatPercent(item.contractorMarginFixedContract)}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[11px] font-bold bg-emerald-100 text-emerald-800">
                            {formatPercent(item.contractorMarginWithCPA)}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider font-sans ${
                              item.abandonmentRiskScore > 70
                                ? 'bg-red-600 text-white'
                                : item.abandonmentRiskScore > 30
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {item.abandonmentRiskScore > 70 ? 'Extreme' : item.abandonmentRiskScore > 30 ? 'Moderate' : 'Low'}
                          </span>
                        </td>

                        <td className="px-3 py-3 text-center">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onGenerateCertForMonth(item.month);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-stone-900 hover:bg-stone-800 text-white text-[11px] font-sans font-semibold transition-colors shadow-xs"
                          >
                            <FileText className="w-3 h-3 text-amber-400" />
                            Cert
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-stone-100 text-stone-900 font-bold border-t border-stone-300 font-mono">
                  <tr>
                    <td colSpan={2} className="px-3 py-3 uppercase text-[10px] text-stone-600 font-sans">
                      Aggregate Totals
                    </td>
                    <td className="px-3 py-3">{formatCurrency(totalBaseGross, currency)}</td>
                    <td className="px-3 py-3 text-center">-</td>
                    <td className="px-3 py-3">{formatCurrency(totalAdjustedGross, currency)}</td>
                    <td className="px-3 py-3 text-amber-700">+{formatCurrency(totalEscalationPaid, currency)}</td>
                    <td className="px-3 py-3 text-emerald-900">{formatCurrency(totalNetPaidToContractor, currency)}</td>
                    <td colSpan={4}></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
