import React, { useState } from 'react';
import { ContractProject, CurrencyCode, PriceComponent } from '../types';
import { formatCurrency, formatFullCurrency, validateWeightSum } from '../utils/cpaMath';
import { X, Plus, Trash2, Building, DollarSign, Calendar, Check, AlertCircle } from 'lucide-react';

interface ProjectModalProps {
  project: ContractProject;
  currency: CurrencyCode;
  onSave: (updated: ContractProject) => void;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, currency, onSave, onClose }) => {
  const [formData, setFormData] = useState<ContractProject>({ ...project });
  const [activeTab, setActiveTab] = useState<'details' | 'components'>('details');

  const weightValidation = validateWeightSum(formData.nonAdjustableFactor, formData.components);

  const handleUpdateComponent = (index: number, field: keyof PriceComponent, value: any) => {
    const updated = [...formData.components];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, components: updated });
  };

  const handleAddComponent = () => {
    const newComp: PriceComponent = {
      id: `comp-${Date.now()}`,
      name: 'New Material / Component',
      symbol: `M_${formData.components.length + 1}`,
      category: 'material',
      weight: 0.10,
      sourceIndex: 'National Bureau of Statistics (NBS) Price Index',
      unit: 'Index / Unit',
      baseValue: 1000,
      currentValue: 1250,
      sourceAgency: 'NBS',
    };
    setFormData({ ...formData, components: [...formData.components, newComp] });
  };

  const handleRemoveComponent = (index: number) => {
    if (formData.components.length <= 1) return;
    const updated = formData.components.filter((_, i) => i !== index);
    setFormData({ ...formData, components: updated });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-3xl border border-stone-200 shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-stone-900 text-white p-5 flex items-center justify-between border-b border-stone-800">
          <div>
            <div className="text-xs uppercase font-bold text-amber-400 tracking-wider">
              Project Specification & Contract Configuration
            </div>
            <h3 className="text-lg font-extrabold text-stone-100">
              Configure Infrastructure Contract
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Switch */}
        <div className="bg-stone-100 p-2 flex items-center gap-2 border-b border-stone-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'details' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            1. Contract Metadata & Statutory Terms
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('components')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              activeTab === 'components' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            2. CPA Formula Coefficients ({formData.components.length} Components)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {activeTab === 'details' ? (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Contract Title:</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Contract Code / Tender Ref:</label>
                  <input
                    type="text"
                    required
                    value={formData.contractCode}
                    onChange={(e) => setFormData({ ...formData, contractCode: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-500 font-mono font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Procuring Entity (MDA / State):</label>
                  <input
                    type="text"
                    required
                    value={formData.procuringEntity}
                    onChange={(e) => setFormData({ ...formData, procuringEntity: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-500 font-medium"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Awarded Contractor Name:</label>
                  <input
                    type="text"
                    required
                    value={formData.contractorName}
                    onChange={(e) => setFormData({ ...formData, contractorName: e.target.value })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:bg-white focus:outline-hidden focus:border-amber-500 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-stone-200">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Initial Contract Sum ({currency}):</label>
                  <input
                    type="number"
                    min="1000000"
                    required
                    value={formData.contractSumInitial}
                    onChange={(e) => setFormData({ ...formData, contractSumInitial: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono font-bold focus:bg-white focus:outline-hidden focus:border-amber-500"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block font-mono">
                    {formatCurrency(formData.contractSumInitial, currency)}
                  </span>
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Duration (Months):</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={formData.durationMonths}
                    onChange={(e) => setFormData({ ...formData, durationMonths: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono font-bold focus:bg-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Advance Payment Rate (%):</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="0.30"
                    required
                    value={formData.advancePaymentRate}
                    onChange={(e) => setFormData({ ...formData, advancePaymentRate: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono font-bold focus:bg-white focus:outline-hidden focus:border-amber-500"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">Max 15% (PPA Section 35)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-stone-200">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">BPP Certificate of "No Objection" Ref:</label>
                  <input
                    type="text"
                    value={formData.bppCertificateNo || ''}
                    onChange={(e) => setFormData({ ...formData, bppCertificateNo: e.target.value })}
                    placeholder="e.g. BPP/S.1/FED-WORKS/2025/VOL.IX/481"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono text-xs focus:bg-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Advance Payment Bank Guarantee Ref:</label>
                  <input
                    type="text"
                    value={formData.advancePaymentBankGuaranteeNo || ''}
                    onChange={(e) => setFormData({ ...formData, advancePaymentBankGuaranteeNo: e.target.value })}
                    placeholder="e.g. BG/FBN/2025/APP-994201"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-lg text-stone-900 font-mono text-xs focus:bg-white focus:outline-hidden focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-stone-50 border border-stone-200">
                <div>
                  <span className="font-bold text-stone-800 block">Non-Adjustable Factor (a0):</span>
                  <span className="text-[11px] text-stone-500">Contractor fixed overhead & profit margin</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    step="0.01"
                    min="0.05"
                    max="0.40"
                    value={formData.nonAdjustableFactor}
                    onChange={(e) => setFormData({ ...formData, nonAdjustableFactor: Number(e.target.value) })}
                    className="w-20 px-2 py-1 bg-white border border-stone-300 rounded text-center font-mono font-bold"
                  />
                  <span className="font-mono text-stone-600">({(formData.nonAdjustableFactor * 100).toFixed(0)}%)</span>
                </div>
              </div>

              {/* Weight balance status */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between ${
                  weightValidation.isValid
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-amber-50 border-amber-300 text-amber-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  {weightValidation.isValid ? <Check className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-amber-600" />}
                  <span className="font-bold">
                    Total Weight Sum: <span className="font-mono">{weightValidation.sum.toFixed(3)}</span>
                  </span>
                </div>
                <span className="text-[11px]">
                  {weightValidation.isValid ? 'Weights sum perfectly to 1.000' : `Must adjust by ${weightValidation.diff > 0 ? '+' : ''}${weightValidation.diff.toFixed(3)}`}
                </span>
              </div>

              {/* Component Rows */}
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {formData.components.map((comp, idx) => (
                  <div key={comp.id || idx} className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <input
                        type="text"
                        value={comp.name}
                        onChange={(e) => handleUpdateComponent(idx, 'name', e.target.value)}
                        className="font-bold text-stone-900 bg-white px-2 py-1 border border-stone-200 rounded flex-1 text-xs"
                      />
                      <input
                        type="text"
                        value={comp.symbol}
                        onChange={(e) => handleUpdateComponent(idx, 'symbol', e.target.value)}
                        placeholder="Symbol"
                        className="w-16 font-mono text-center text-xs bg-white px-1 py-1 border border-stone-200 rounded"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveComponent(idx)}
                        disabled={formData.components.length <= 1}
                        className="text-stone-400 hover:text-red-600 p-1 disabled:opacity-30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="text-[10px] text-stone-500 block">Weight Coeff:</label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max="0.80"
                          value={comp.weight}
                          onChange={(e) => handleUpdateComponent(idx, 'weight', Number(e.target.value))}
                          className="w-full bg-white px-2 py-1 border border-stone-200 rounded font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 block">Base Price (Po):</label>
                        <input
                          type="number"
                          value={comp.baseValue}
                          onChange={(e) => handleUpdateComponent(idx, 'baseValue', Number(e.target.value))}
                          className="w-full bg-white px-2 py-1 border border-stone-200 rounded font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-stone-500 block">Current Price (Pn):</label>
                        <input
                          type="number"
                          value={comp.currentValue}
                          onChange={(e) => handleUpdateComponent(idx, 'currentValue', Number(e.target.value))}
                          className="w-full bg-white px-2 py-1 border border-stone-200 rounded font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={handleAddComponent}
                className="w-full py-2 border-2 border-dashed border-stone-300 rounded-xl text-stone-600 hover:text-stone-900 hover:border-amber-500 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" /> Add Price Component
              </button>
            </div>
          )}

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-xs transition-colors"
            >
              Apply Contract Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
