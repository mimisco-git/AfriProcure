import React, { useState } from 'react';
import { ContractProject, PriceComponent, CurrencyCode } from '../types';
import { calculateCpaMultiplier, calculateDualTrancheCpa, formatCurrency, formatFullCurrency, formatPercent, validateWeightSum } from '../utils/cpaMath';
import { exportCpaFormulaToCsv } from '../utils/csvExporter';
import { Plus, Trash2, AlertTriangle, CheckCircle2, RotateCcw, Info, Sparkles, Download, Globe } from 'lucide-react';

interface CpaCalculatorProps {
  project: ContractProject;
  setProject: React.Dispatch<React.SetStateAction<ContractProject>> | ((update: ContractProject | ((prev: ContractProject) => ContractProject)) => void);
  currency: CurrencyCode;
}

export const CpaCalculator: React.FC<CpaCalculatorProps> = ({
  project,
  setProject,
  currency,
}) => {
  const [selectedPreset, setSelectedPreset] = useState<string>('highway');
  const [showFormulaDetails, setShowFormulaDetails] = useState<boolean>(true);

  // Dual Currency Tranche (FIDIC 13.8)
  const [dualTrancheEnabled, setDualTrancheEnabled] = useState<boolean>(project.dualCurrency?.enabled ?? false);
  const [localShare, setLocalShare] = useState<number>(project.dualCurrency?.localSharePct ?? 0.65);
  const [foreignCurrency, setForeignCurrency] = useState<'USD' | 'EUR' | 'GBP'>(project.dualCurrency?.foreignCurrency ?? 'USD');
  const [baseFx, setBaseFx] = useState<number>(project.dualCurrency?.baseExchangeRate ?? 1250);
  const [currentFx, setCurrentFx] = useState<number>(project.dualCurrency?.currentExchangeRate ?? 1610);
  const [foreignPpi, setForeignPpi] = useState<number>(project.dualCurrency?.foreignInflationFactor ?? 1.045);

  const foreignShare = 1.0 - localShare;

  const weightValidation = validateWeightSum(project.nonAdjustableFactor, project.components);
  const localPn = calculateCpaMultiplier(project.nonAdjustableFactor, project.components);

  const dualResult = calculateDualTrancheCpa(
    localPn,
    localShare,
    foreignShare,
    baseFx,
    currentFx,
    foreignPpi
  );

  const Pn = dualTrancheEnabled ? dualResult.compositePn : localPn;
  const adjustedContractSum = project.contractSumInitial * Pn;
  const escalationDelta = adjustedContractSum - project.contractSumInitial;
  const escalationPct = (Pn - 1) * 100;

  // Handle component updates
  const updateComponent = (id: string, field: keyof PriceComponent, value: string | number) => {
    setProject((prev) => ({
      ...prev,
      components: prev.components.map((c) => {
        if (c.id === id) {
          return { ...c, [field]: value };
        }
        return c;
      }),
    }));
  };

  const removeComponent = (id: string) => {
    setProject((prev) => ({
      ...prev,
      components: prev.components.filter((c) => c.id !== id),
    }));
  };

  const addComponent = () => {
    const newId = `comp-${Date.now()}`;
    const newComp: PriceComponent = {
      id: newId,
      name: 'Imported Electromechanical / FX Factor',
      symbol: 'F_x',
      category: 'fx',
      weight: 0.10,
      sourceIndex: 'CBN NAFEM Official Exchange Rate',
      unit: '₦ / USD',
      baseValue: 750,
      currentValue: 1540,
      sourceAgency: 'Central Bank of Nigeria (CBN)',
    };

    setProject((prev) => ({
      ...prev,
      components: [...prev.components, newComp],
    }));
  };

  // Normalize component weights so a0 + sum(weights) = 1.000
  const normalizeWeights = () => {
    const targetCompSum = 1.0 - project.nonAdjustableFactor;
    const currentCompSum = project.components.reduce((acc, c) => acc + c.weight, 0);
    if (currentCompSum <= 0) return;

    const ratio = targetCompSum / currentCompSum;
    setProject((prev) => ({
      ...prev,
      components: prev.components.map((c) => ({
        ...c,
        weight: Number((c.weight * ratio).toFixed(4)),
      })),
    }));
  };

  // Presets based on African procurement empirical contracts
  const applyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    if (presetKey === 'highway') {
      setProject((prev) => ({
        ...prev,
        title: 'Dualization & Rehabilitation of 48km Federal Highway Corridor',
        contractSumInitial: 14500000000,
        nonAdjustableFactor: 0.15,
        components: [
          {
            id: 'comp-cement',
            name: 'Ordinary Portland Cement (42.5R)',
            symbol: 'M_c',
            category: 'material',
            weight: 0.25,
            sourceIndex: 'NBS Building Materials Bulletin',
            unit: '₦ / 50kg bag',
            baseValue: 4200,
            currentValue: 8200,
            sourceAgency: 'NBS',
          },
          {
            id: 'comp-steel',
            name: 'High-Yield Reinforcing Steel Rebar',
            symbol: 'M_s',
            category: 'material',
            weight: 0.20,
            sourceIndex: 'SON / Metal Rolling Mills Index',
            unit: '₦ / Tonne',
            baseValue: 650000,
            currentValue: 1280000,
            sourceAgency: 'SON Benchmark',
          },
          {
            id: 'comp-diesel',
            name: 'Automotive Gas Oil (Diesel / Equipment)',
            symbol: 'E_d',
            category: 'fuel',
            weight: 0.15,
            sourceIndex: 'NMDPRA National Diesel Survey',
            unit: '₦ / Litre',
            baseValue: 720,
            currentValue: 1380,
            sourceAgency: 'NMDPRA',
          },
          {
            id: 'comp-bitumen',
            name: 'Bitumen Penetration Grade 60/70',
            symbol: 'M_b',
            category: 'material',
            weight: 0.15,
            sourceIndex: 'FMW Materials Testing Laboratory',
            unit: '₦ / Tonne',
            baseValue: 750000,
            currentValue: 1420000,
            sourceAgency: 'FMW Materials Dept',
          },
          {
            id: 'comp-labor',
            name: 'Artisan & Civil Works Construction Labor',
            symbol: 'L_w',
            category: 'labor',
            weight: 0.10,
            sourceIndex: 'NBS Wage Bulletin',
            unit: 'Index Points',
            baseValue: 155.0,
            currentValue: 245.8,
            sourceAgency: 'NBS',
          },
        ],
      }));
    } else if (presetKey === 'hospital') {
      setProject((prev) => ({
        ...prev,
        title: 'Procurement & Turnkey Installation of Tertiary Hospital Radiology Wing',
        contractSumInitial: 6800000000,
        nonAdjustableFactor: 0.10,
        components: [
          {
            id: 'comp-fx-mri',
            name: 'Offshore Electromechanical & Imaging Hardware (EUR/USD)',
            symbol: 'F_mri',
            category: 'fx',
            weight: 0.65,
            sourceIndex: 'Central Bank of Nigeria (CBN NAFEM Closing Rate)',
            unit: '₦ / USD',
            baseValue: 460,
            currentValue: 1545,
            sourceAgency: 'CBN NAFEM',
          },
          {
            id: 'comp-local-eng',
            name: 'Bio-Medical Specialized Installation Labor',
            symbol: 'L_bio',
            category: 'labor',
            weight: 0.15,
            sourceIndex: 'COREN Professional Engineering Wage Benchmark',
            unit: 'Index',
            baseValue: 100,
            currentValue: 175,
            sourceAgency: 'COREN',
          },
          {
            id: 'comp-power-ups',
            name: 'Industrial Power Backup & Heavy Copper Cabling',
            symbol: 'M_pwr',
            category: 'material',
            weight: 0.10,
            sourceIndex: 'LME Copper / Local Electrical Index',
            unit: '₦ / Metre',
            baseValue: 18500,
            currentValue: 39000,
            sourceAgency: 'SON',
          },
        ],
      }));
    } else if (presetKey === 'building') {
      setProject((prev) => ({
        ...prev,
        title: 'Construction of 500-Unit Affordable Civil Servants Housing Estate',
        contractSumInitial: 9200000000,
        nonAdjustableFactor: 0.15,
        components: [
          {
            id: 'comp-cement-bldg',
            name: 'Cement & Sandcrete Block Production',
            symbol: 'M_c',
            category: 'material',
            weight: 0.35,
            sourceIndex: 'NBS Cement Retail Survey',
            unit: '₦ / 50kg bag',
            baseValue: 4200,
            currentValue: 8200,
            sourceAgency: 'NBS',
          },
          {
            id: 'comp-steel-bldg',
            name: 'Structural Steel & Roofing Trusses',
            symbol: 'M_s',
            category: 'material',
            weight: 0.20,
            sourceIndex: 'Standard Metal Markets Index',
            unit: '₦ / Tonne',
            baseValue: 680000,
            currentValue: 1250000,
            sourceAgency: 'SON',
          },
          {
            id: 'comp-masonry-labor',
            name: 'Carpenters, Masons & General Site Labor',
            symbol: 'L_site',
            category: 'labor',
            weight: 0.20,
            sourceIndex: 'NBS Labor Statistics',
            unit: 'Index Points',
            baseValue: 140,
            currentValue: 220,
            sourceAgency: 'NBS',
          },
          {
            id: 'comp-finishing-fx',
            name: 'Imported Sanitary Wares, Tiles & Fixtures',
            symbol: 'M_fin',
            category: 'fx',
            weight: 0.10,
            sourceIndex: 'CBN Trade Import FX Benchmark',
            unit: '₦ / USD',
            baseValue: 700,
            currentValue: 1545,
            sourceAgency: 'CBN',
          },
        ],
      }));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Academic Context */}
      <div className="bg-stone-900 text-white rounded-2xl p-5 sm:p-6 border border-stone-800 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-3xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-stone-950 font-bold text-xs uppercase tracking-wider">
                Flagship Research Module
              </span>
              <span className="text-xs text-stone-400">
                Statutory Grounding: PPA 2007 Clause 39 & FIDIC Pink Book 13.8
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-stone-100 tracking-tight">
              Algorithmic Contract Price Adjustment (CPA) Engine
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              In African capital procurement, hyperinflation and abrupt currency floats render fixed-price contracts unviable, causing over <strong>70% of public infrastructure abandonment</strong> in Nigeria. The CPA engine dynamically indexes contracts against verified third-party benchmarks (NBS, CBN, NMDPRA), eliminating arbitrary renegotiations.
            </p>
          </div>

          {/* Key Metric Card */}
          <div className="bg-stone-800/90 border border-stone-700/80 rounded-xl p-4 min-w-[260px] space-y-3">
            <div className="text-xs text-stone-400 font-medium uppercase tracking-wider">
              Calculated Adjustment Multiplier (P<sub>n</sub>)
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-amber-400 font-mono">
                {Pn.toFixed(4)}x
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded-sm ${
                escalationPct >= 0 ? 'bg-amber-500/20 text-amber-300' : 'bg-emerald-500/20 text-emerald-300'
              }`}>
                {escalationPct >= 0 ? `+${escalationPct.toFixed(1)}%` : `${escalationPct.toFixed(1)}%`}
              </span>
            </div>
            <div className="pt-2 border-t border-stone-700/60 text-[11px] text-stone-300 space-y-1 font-mono">
              <div className="flex justify-between">
                <span className="text-stone-400">Initial Contract:</span>
                <span>{formatCurrency(project.contractSumInitial, currency)}</span>
              </div>
              <div className="flex justify-between text-amber-300 font-semibold">
                <span>Revised Contract:</span>
                <span>{formatCurrency(adjustedContractSum, currency)}</span>
              </div>
              <div className="flex justify-between text-stone-400">
                <span>Net Variation Claim:</span>
                <span>{formatCurrency(escalationDelta, currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Preset Selector */}
        <div className="mt-5 pt-4 border-t border-stone-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-stone-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold text-stone-300">African Real-World Sector Presets:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyPreset('highway')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedPreset === 'highway'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              Federal Highway & Bridge (Civil)
            </button>
            <button
              onClick={() => applyPreset('hospital')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedPreset === 'hospital'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              Hospital Radiology / FX Import (Health)
            </button>
            <button
              onClick={() => applyPreset('building')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedPreset === 'building'
                  ? 'bg-amber-500 text-stone-950 font-bold'
                  : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
              }`}
            >
              Urban Mass Housing Estate (Building)
            </button>
          </div>
        </div>
      </div>

      {/* Interactive Mathematical Formula Box */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-amber-600" />
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Mathematical Formula Representation (FIDIC Pink Book 13.8 & World Bank Standard)
            </h3>
          </div>
          <button
            onClick={() => setShowFormulaDetails(!showFormulaDetails)}
            className="text-xs text-amber-700 font-semibold hover:underline"
          >
            {showFormulaDetails ? 'Compact View' : 'Expanded Symbolic View'}
          </button>
        </div>

        {/* Formula Display in LaTeX / Mathematical Style */}
        <div className="bg-stone-950 text-stone-100 rounded-xl p-4 font-mono text-xs sm:text-sm overflow-x-auto border border-stone-800 leading-relaxed">
          <div className="text-amber-400 font-semibold mb-2">
            P<sub>n</sub> = a<sub>0</sub> + ∑ [ b<sub>i</sub> × (M<sub>in</sub> / M<sub>io</sub>) ]
          </div>
          <div className="text-stone-300">
            P<sub>n</sub> = <span className="text-emerald-400">{project.nonAdjustableFactor.toFixed(2)}</span>
            {project.components.map((c) => {
              const ratio = c.baseValue > 0 ? (c.currentValue / c.baseValue).toFixed(3) : '1.000';
              return (
                <span key={c.id}>
                  {' '} + [<span className="text-amber-300">{c.weight.toFixed(2)}</span> × (
                  <span className="text-sky-300">{c.currentValue.toLocaleString()}</span> /{' '}
                  <span className="text-stone-400">{c.baseValue.toLocaleString()}</span> ={' '}
                  <span className="text-cyan-300">{ratio}</span>)]
                </span>
              );
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-stone-800 text-stone-400 text-xs flex flex-wrap items-center justify-between gap-2">
            <div>
              Result: <strong className="text-amber-400 font-bold">P<sub>n</sub> = {Pn.toFixed(4)}</strong>
              {' '}(Contract variation adjustment of <strong>+{escalationPct.toFixed(2)}%</strong>)
            </div>
            <div>
              Condition: a<sub>0</sub> + ∑ b<sub>i</sub> = {weightValidation.sum.toFixed(3)}
              {weightValidation.isValid ? (
                <span className="text-emerald-400 ml-1.5 font-bold">✓ Perfectly Balanced (1.000)</span>
              ) : (
                <span className="text-red-400 ml-1.5 font-bold">⚠ Imbalanced (Diff: {weightValidation.diff.toFixed(3)})</span>
              )}
            </div>
          </div>
        </div>

        {/* Warning if weight does not equal 1.0 */}
        {!weightValidation.isValid && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
              <span>
                <strong>Weighting Error:</strong> The sum of the non-adjustable factor ({project.nonAdjustableFactor}) and components is {weightValidation.sum.toFixed(3)}. Standard FIDIC procurement rules require coefficients to sum to exactly <strong>1.000</strong>.
              </span>
            </div>
            <button
              onClick={normalizeWeights}
              className="px-2.5 py-1 rounded-md bg-red-600 text-white font-semibold hover:bg-red-700 shrink-0 transition-colors"
            >
              Auto-Normalize to 1.0
            </button>
          </div>
        )}
      </div>

      {/* Feature 5: Dual-Currency Tranche Pricing (FIDIC Clause 13.8) */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl transition-colors ${dualTrancheEnabled ? 'bg-sky-100 text-sky-800' : 'bg-stone-100 text-stone-500'}`}>
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
                  Dual-Currency Tranche Pricing Engine
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 uppercase">
                  FIDIC Clause 13.8
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Split major infrastructure contracts into local currency civil works and foreign currency offshore equipment tranches.
              </p>
            </div>
          </div>

          <button
            onClick={() => setDualTrancheEnabled(!dualTrancheEnabled)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              dualTrancheEnabled
                ? 'bg-sky-600 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            <span>{dualTrancheEnabled ? '✓ Dual-Currency Active' : 'Enable Dual-Currency Split'}</span>
          </button>
        </div>

        {dualTrancheEnabled ? (
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-600 font-semibold">Local Currency Share</label>
                  <span className="font-mono font-bold text-stone-900">{(localShare * 100).toFixed(0)}% ({project.currency})</span>
                </div>
                <input
                  type="range"
                  min="0.30"
                  max="0.90"
                  step="0.05"
                  value={localShare}
                  onChange={(e) => setLocalShare(parseFloat(e.target.value))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <span className="text-[10px] text-stone-500">Civil construction & local materials</span>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-stone-600 font-semibold">Foreign Currency Share</label>
                  <span className="font-mono font-bold text-sky-700">{(foreignShare * 100).toFixed(0)}% ({foreignCurrency})</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  {(['USD', 'EUR', 'GBP'] as const).map((curr) => (
                    <button
                      key={curr}
                      onClick={() => setForeignCurrency(curr)}
                      className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono transition-colors ${
                        foreignCurrency === curr
                          ? 'bg-sky-700 text-white'
                          : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                      }`}
                    >
                      {curr}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-stone-500 mt-1 block">Offshore heavy plant & specialized systems</span>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Base FX Rate at Award ({project.currency} / {foreignCurrency})</label>
                <input
                  type="number"
                  value={baseFx}
                  onChange={(e) => setBaseFx(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono font-semibold text-stone-900 focus:outline-hidden focus:border-sky-500"
                />
                <span className="text-[10px] text-stone-500">Contract base date exchange rate</span>
              </div>

              <div>
                <label className="block text-stone-600 font-semibold mb-1">Current FX Rate at Valuation ({project.currency} / {foreignCurrency})</label>
                <input
                  type="number"
                  value={currentFx}
                  onChange={(e) => setCurrentFx(Number(e.target.value) || 1)}
                  className="w-full px-3 py-2 rounded-lg border border-stone-300 font-mono font-semibold text-sky-700 focus:outline-hidden focus:border-sky-500"
                />
                <span className="text-[10px] text-stone-500">Official CBN NAFEM rate</span>
              </div>
            </div>

            {/* Dual Tranche Mathematical Result Banner */}
            <div className="bg-sky-50/70 border border-sky-200/80 rounded-xl p-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 font-mono">
                <div>
                  <span className="text-sky-800 text-[11px] block">Local Multiplier (P<sub>n,L</sub>):</span>
                  <strong className="text-stone-900 text-base">{localPn.toFixed(4)}x</strong>
                  <span className="text-[10px] text-stone-500 block">Weight: {(localShare * 100).toFixed(0)}%</span>
                </div>
                <div>
                  <span className="text-sky-800 text-[11px] block">Offshore Multiplier:</span>
                  <strong className="text-sky-900 text-base">{dualResult.foreignMultiplier.toFixed(4)}x</strong>
                  <span className="text-[10px] text-sky-600 block">FX Devaluation: +{dualResult.fxDevaluationPct.toFixed(1)}%</span>
                </div>
                <div>
                  <span className="text-sky-800 text-[11px] block">Composite Multiplier (P<sub>n</sub>):</span>
                  <strong className="text-amber-900 text-base">{dualResult.compositePn.toFixed(4)}x</strong>
                  <span className="text-[10px] text-amber-700 font-bold block">Blend of Local + Foreign</span>
                </div>
                <div>
                  <span className="text-sky-800 text-[11px] block">Adjusted Contract Value:</span>
                  <strong className="text-emerald-800 text-base">{formatCurrency(adjustedContractSum, currency)}</strong>
                  <span className="text-[10px] text-emerald-700 block">Variation: +{escalationPct.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-stone-500 bg-stone-50 rounded-xl p-3 flex items-center justify-between">
            <span>Currently evaluating in 100% single local currency ({project.currency}). Enable dual-currency to model offshore imported components.</span>
            <button
              onClick={() => setDualTrancheEnabled(true)}
              className="text-sky-700 font-bold hover:underline"
            >
              Configure Dual Currency →
            </button>
          </div>
        )}
      </div>

      {/* Contract Metadata & Fixed Factor Config */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
          Contract Specifics & Public Entity Parameters
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-stone-600 font-semibold mb-1">Contract Title / Description</label>
            <input
              type="text"
              value={project.title}
              onChange={(e) => setProject({ ...project, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 font-medium focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">Procuring MDA (Entity)</label>
            <input
              type="text"
              value={project.procuringEntity}
              onChange={(e) => setProject({ ...project, procuringEntity: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 font-medium focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">Contractor Consortium</label>
            <input
              type="text"
              value={project.contractorName}
              onChange={(e) => setProject({ ...project, contractorName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 font-medium focus:outline-hidden focus:border-amber-500"
            />
          </div>

          <div>
            <label className="block text-stone-600 font-semibold mb-1">Initial Award Sum ({currency})</label>
            <input
              type="number"
              value={project.contractSumInitial}
              onChange={(e) => setProject({ ...project, contractSumInitial: Number(e.target.value) || 0 })}
              className="w-full px-3 py-2 rounded-lg border border-stone-300 text-stone-900 font-mono font-semibold focus:outline-hidden focus:border-amber-500"
            />
          </div>
        </div>

        {/* Contract Secondary Factors */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs pt-2 border-t border-stone-100">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-stone-600 font-semibold">Non-Adjustable (a<sub>0</sub>)</label>
              <span className="font-mono font-bold text-amber-700">{(project.nonAdjustableFactor * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.05"
              max="0.30"
              step="0.01"
              value={project.nonAdjustableFactor}
              onChange={(e) => setProject({ ...project, nonAdjustableFactor: parseFloat(e.target.value) })}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <span className="text-[10px] text-stone-500">Contractor Fixed Profit/Overhead</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-stone-600 font-semibold">Advance Payment</label>
              <span className="font-mono font-bold text-stone-900">{(project.advancePaymentRate * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="0.30"
              step="0.05"
              value={project.advancePaymentRate}
              onChange={(e) => setProject({ ...project, advancePaymentRate: parseFloat(e.target.value) })}
              className="w-full accent-stone-700 cursor-pointer"
            />
            <span className="text-[10px] text-stone-500">PPA standard maximum is 15%</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-stone-600 font-semibold">Contract Duration</label>
              <span className="font-mono font-bold text-stone-900">{project.durationMonths} Mos</span>
            </div>
            <input
              type="range"
              min="6"
              max="36"
              step="1"
              value={project.durationMonths}
              onChange={(e) => setProject({ ...project, durationMonths: parseInt(e.target.value) })}
              className="w-full accent-stone-700 cursor-pointer"
            />
            <span className="text-[10px] text-stone-500">Milestone execution period</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-stone-600 font-semibold">Commercial Bank Lending</label>
              <span className="font-mono font-bold text-red-600">{(project.contractorFinancingCostAnnual * 100).toFixed(0)}%</span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.36"
              step="0.01"
              value={project.contractorFinancingCostAnnual}
              onChange={(e) => setProject({ ...project, contractorFinancingCostAnnual: parseFloat(e.target.value) })}
              className="w-full accent-red-600 cursor-pointer"
            />
            <span className="text-[10px] text-stone-500">Contractor working capital rate</span>
          </div>
        </div>
      </div>

      {/* Component Index Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="px-5 py-4 border-b border-stone-200 flex flex-wrap items-center justify-between gap-3 bg-stone-50/70">
          <div>
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider">
              Formula Component Schedule & Benchmark Price Indices
            </h3>
            <p className="text-xs text-stone-500">
              Each component represents a vital cost driver tied to official government or verified market indices.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCpaFormulaToCsv(project, currency)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold shadow-xs transition-colors"
              title="Download CPA Mathematical Breakdown and Coefficients as CSV"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              Export CPA CSV
            </button>
            <button
              onClick={addComponent}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Cost Driver Component
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-100 text-stone-700 font-bold border-b border-stone-200 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Symbol & Name</th>
                <th className="px-3 py-3">Category</th>
                <th className="px-3 py-3">Source Index Agency</th>
                <th className="px-3 py-3 text-center">Weight (b<sub>i</sub>)</th>
                <th className="px-3 py-3">Base Price (I<sub>o</sub>)</th>
                <th className="px-3 py-3">Current Price (I<sub>n</sub>)</th>
                <th className="px-3 py-3 text-right">Escalation Ratio</th>
                <th className="px-3 py-3 text-right">Weighted Impact</th>
                <th className="px-3 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200">
              {project.components.map((comp) => {
                const ratio = comp.baseValue > 0 ? comp.currentValue / comp.baseValue : 1;
                const weightedImpact = comp.weight * ratio;
                const changePct = (ratio - 1) * 100;

                return (
                  <tr key={comp.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 text-xs">
                          {comp.symbol}
                        </span>
                        <input
                          type="text"
                          value={comp.name}
                          onChange={(e) => updateComponent(comp.id, 'name', e.target.value)}
                          className="font-semibold text-stone-900 border-b border-transparent hover:border-stone-300 focus:border-amber-500 focus:outline-hidden text-xs py-0.5 w-48 sm:w-56"
                        />
                      </div>
                      <span className="text-[10px] text-stone-500 block mt-0.5">Unit: {comp.unit}</span>
                    </td>

                    <td className="px-3 py-3">
                      <select
                        value={comp.category}
                        onChange={(e) => updateComponent(comp.id, 'category', e.target.value as PriceComponent['category'])}
                        className="bg-stone-50 border border-stone-200 text-stone-700 rounded px-2 py-1 text-xs focus:outline-hidden capitalize"
                      >
                        <option value="material">Material</option>
                        <option value="fuel">Fuel/Energy</option>
                        <option value="labor">Labor</option>
                        <option value="fx">FX / Foreign</option>
                        <option value="equipment">Equipment</option>
                        <option value="other">Other</option>
                      </select>
                    </td>

                    <td className="px-3 py-3">
                      <input
                        type="text"
                        value={comp.sourceIndex}
                        onChange={(e) => updateComponent(comp.id, 'sourceIndex', e.target.value)}
                        className="text-stone-700 border-b border-transparent hover:border-stone-300 focus:border-amber-500 focus:outline-hidden text-xs py-0.5 w-36"
                      />
                    </td>

                    <td className="px-3 py-3 text-center">
                      <div className="inline-flex items-center gap-1 font-mono">
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="0.80"
                          value={comp.weight}
                          onChange={(e) => updateComponent(comp.id, 'weight', parseFloat(e.target.value) || 0)}
                          className="w-16 px-1.5 py-1 text-center font-bold text-amber-800 bg-amber-50/70 border border-amber-200 rounded focus:outline-hidden"
                        />
                      </div>
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <input
                        type="number"
                        value={comp.baseValue}
                        onChange={(e) => updateComponent(comp.id, 'baseValue', parseFloat(e.target.value) || 1)}
                        className="w-24 px-2 py-1 border border-stone-200 rounded text-stone-800 bg-white focus:outline-hidden text-xs"
                      />
                    </td>

                    <td className="px-3 py-3 font-mono">
                      <input
                        type="number"
                        value={comp.currentValue}
                        onChange={(e) => updateComponent(comp.id, 'currentValue', parseFloat(e.target.value) || 1)}
                        className="w-24 px-2 py-1 border border-stone-200 rounded text-stone-900 bg-stone-50 font-bold focus:outline-hidden text-xs"
                      />
                    </td>

                    <td className="px-3 py-3 text-right font-mono">
                      <span className="font-bold text-stone-900">{ratio.toFixed(3)}x</span>
                      <span className={`block text-[10px] ${changePct >= 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {changePct >= 0 ? `+${changePct.toFixed(1)}%` : `${changePct.toFixed(1)}%`}
                      </span>
                    </td>

                    <td className="px-3 py-3 text-right font-mono font-bold text-stone-900">
                      +{weightedImpact.toFixed(4)}
                    </td>

                    <td className="px-3 py-3 text-center">
                      <button
                        onClick={() => removeComponent(comp.id)}
                        disabled={project.components.length <= 1}
                        className="p-1 rounded text-stone-400 hover:text-red-600 hover:bg-red-50 disabled:opacity-30 transition-colors"
                        title="Delete component"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-stone-50 text-stone-900 font-bold border-t border-stone-200">
              <tr>
                <td colSpan={3} className="px-4 py-3 text-stone-600 uppercase text-[10px]">
                  Total Weighted Sum (Fixed Factor a<sub>0</sub> + Components)
                </td>
                <td className="px-3 py-3 text-center font-mono text-amber-900">
                  {weightValidation.sum.toFixed(3)}
                </td>
                <td colSpan={3} className="px-3 py-3 text-right text-stone-600">
                  Final Adjusted Multiplier (P<sub>n</sub>):
                </td>
                <td className="px-3 py-3 text-right font-mono text-amber-600 text-sm">
                  {Pn.toFixed(4)}x
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};
