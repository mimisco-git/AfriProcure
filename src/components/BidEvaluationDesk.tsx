import React, { useState, useEffect, useMemo } from 'react';
import {
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Award,
  ShieldAlert,
  Printer,
  Download,
  Plus,
  Trash2,
  RefreshCw,
  Building,
  DollarSign,
  FileText,
  Search,
  ArrowRight,
  TrendingDown,
  Info,
  Scale,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Landmark,
  ShieldCheck,
  History,
  FileCheck,
} from 'lucide-react';
import {
  RequisitionItem,
  SupplierQuotation,
  QuotationLineItem,
  BidEvaluationResult,
  CurrencyCode,
  ContractProject,
  SavedBidEvaluation,
} from '../types';
import { formatCurrency } from '../utils/cpaMath';
import {
  WORKED_EXAMPLE_ITEMS,
  WORKED_EXAMPLE_QUOTATIONS,
  evaluateBids,
} from '../utils/bidEvaluationEngine';
import { AfriProcureLogo } from './AfriProcureLogo';

interface BidEvaluationDeskProps {
  currency: CurrencyCode;
  onTransferToContract?: (newProject: Partial<ContractProject>) => void;
}

const LOCAL_STORAGE_KEY = 'afriprocure_bid_evaluations_v1';

export const BidEvaluationDesk: React.FC<BidEvaluationDeskProps> = ({
  currency,
  onTransferToContract,
}) => {
  // Navigation within Desk: 'setup' | 'quotations' | 'report'
  const [activeStep, setActiveStep] = useState<'setup' | 'quotations' | 'report'>('report');

  // Setup state
  const [orgName, setOrgName] = useState('Delta Marine Services Ltd');
  const [procurementTitle, setProcurementTitle] = useState('Supply of personal protective equipment (PPE)');
  const [requisitionRef, setRequisitionRef] = useState('DMS/RFQ/2026/0118');
  const [reportRef, setReportRef] = useState('BER-2026-08-0118');
  const [preparedBy, setPreparedBy] = useState('Engr. K. O. Ekanem, Procurement Lead');
  const [reviewedBy, setReviewedBy] = useState('Dr. (Mrs.) B. N. Okafor, Director of Procurement');
  const [evaluationDate, setEvaluationDate] = useState('2026-08-25');

  // Requisition items state
  const [reqItems, setReqItems] = useState<RequisitionItem[]>(WORKED_EXAMPLE_ITEMS);

  // Supplier quotations state
  const [quotations, setQuotations] = useState<SupplierQuotation[]>(WORKED_EXAMPLE_QUOTATIONS);

  // Saved evaluations in local storage
  const [savedEvaluations, setSavedEvaluations] = useState<SavedBidEvaluation[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Editing modals / accordion states
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>('quote-1');
  const [selectedBidderForModal, setSelectedBidderForModal] = useState<SupplierQuotation | null>(null);

  // Editable narrative report
  const [customNarrative, setCustomNarrative] = useState<string>('');
  const [copiedNotification, setCopiedNotification] = useState(false);

  // Load saved evaluations from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setSavedEvaluations(parsed);
        }
      }
    } catch {
      // Fallback
    }
  }, []);

  // Compute evaluation results
  const evaluationResult: BidEvaluationResult = useMemo(() => {
    return evaluateBids(reqItems, quotations, currency);
  }, [reqItems, quotations, currency]);

  // Sync narrative if custom is empty
  useEffect(() => {
    if (!customNarrative) {
      setCustomNarrative(evaluationResult.narrative);
    }
  }, [evaluationResult.narrative]);

  // Handle Load Worked Example
  const handleLoadWorkedExample = () => {
    setOrgName('Delta Marine Services Ltd');
    setProcurementTitle('Supply of personal protective equipment (PPE)');
    setRequisitionRef('DMS/RFQ/2026/0118');
    setReportRef('BER-2026-08-0118');
    setPreparedBy('Engr. K. O. Ekanem, Procurement Lead');
    setReviewedBy('Dr. (Mrs.) B. N. Okafor, Director of Procurement');
    setEvaluationDate('2026-08-25');
    setReqItems(WORKED_EXAMPLE_ITEMS);
    setQuotations(WORKED_EXAMPLE_QUOTATIONS);
    setCustomNarrative('');
    setActiveStep('report');
  };

  // Handle Saving to Local Storage
  const handleSaveEvaluation = () => {
    const newSave: SavedBidEvaluation = {
      id: 'eval-' + Date.now(),
      savedAt: Date.now(),
      organization: orgName,
      procurementTitle,
      requisitionRef,
      reportRef,
      preparedBy,
      reviewedBy,
      items: reqItems,
      quotations,
      winnerName: evaluationResult.winner?.quotation.supplierName,
      evaluatedCost: evaluationResult.winner?.evaluatedCost,
      currency,
    };

    const updated = [newSave, ...savedEvaluations.slice(0, 15)];
    setSavedEvaluations(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
      alert('Evaluation dossier saved to browser storage successfully.');
    } catch {
      // ignore
    }
  };

  const handleRestoreSaved = (saved: SavedBidEvaluation) => {
    setOrgName(saved.organization);
    setProcurementTitle(saved.procurementTitle);
    setRequisitionRef(saved.requisitionRef);
    setReportRef(saved.reportRef);
    setPreparedBy(saved.preparedBy || '');
    setReviewedBy(saved.reviewedBy || '');
    setReqItems(saved.items);
    setQuotations(saved.quotations);
    setCustomNarrative('');
    setShowSavedModal(false);
    setActiveStep('report');
  };

  // Add new requisition item
  const handleAddReqItem = () => {
    const newItem: RequisitionItem = {
      id: 'req-' + Date.now(),
      name: 'New Requisition Item',
      specification: 'Standard specification',
      unit: 'pcs',
      quantity: 100,
      budgetBenchmarkPrice: 10000,
    };
    setReqItems([...reqItems, newItem]);
  };

  const handleUpdateReqItem = (index: number, field: keyof RequisitionItem, value: any) => {
    const updated = [...reqItems];
    updated[index] = { ...updated[index], [field]: value };
    setReqItems(updated);
  };

  const handleRemoveReqItem = (id: string) => {
    setReqItems(reqItems.filter((i) => i.id !== id));
  };

  // Add new supplier quotation
  const handleAddQuotation = () => {
    const newQuote: SupplierQuotation = {
      id: 'quote-' + Date.now(),
      supplierName: 'New Bidder Ltd',
      address: 'Plot 10 Commercial Area, Lagos / Abuja',
      phone: '0802 000 0000',
      email: 'info@newbidder.com',
      rcNumber: 'RC ' + Math.floor(100000 + Math.random() * 900000),
      tin: '10' + Math.floor(100000 + Math.random() * 900000) + '-0001',
      bank: {
        bankName: 'First Bank of Nigeria',
        accountNumber: '30' + Math.floor(10000000 + Math.random() * 90000000),
        accountName: 'New Bidder Ltd',
      },
      signatory: 'Managing Director',
      quoteRef: 'NBL/Q/' + new Date().getFullYear() + '/01',
      quoteDate: new Date().toISOString().split('T')[0],
      validity: '60 days',
      deliveryPeriod: '14 working days',
      paymentTerms: '100% upon delivery and inspection',
      warranty: '6 months',
      currency: 'NGN',
      vat: {
        isInclusive: false,
        rate: 7.5,
      },
      subtotal: 0,
      total: 0,
      items: reqItems.map((r, i) => ({
        id: `nq-${Date.now()}-${i}`,
        name: r.name,
        specification: r.specification,
        unit: r.unit,
        quantity: r.quantity,
        unitPrice: r.budgetBenchmarkPrice || 10000,
        amount: (r.budgetBenchmarkPrice || 10000) * r.quantity,
        matchReqItemId: r.id,
      })),
      notes: [],
    };

    // Calculate subtotal
    newQuote.subtotal = newQuote.items.reduce((s, it) => s + it.amount, 0);
    newQuote.total = newQuote.subtotal;

    setQuotations([...quotations, newQuote]);
    setExpandedQuoteId(newQuote.id);
    setActiveStep('quotations');
  };

  const handleRemoveQuotation = (quoteId: string) => {
    if (quotations.length <= 2) {
      alert('At least two quotations are required for statutory competitive tender comparison.');
      return;
    }
    setQuotations(quotations.filter((q) => q.id !== quoteId));
  };

  // Update line item in a quotation
  const handleUpdateQuoteLineItem = (
    quoteId: string,
    itemIndex: number,
    field: keyof QuotationLineItem,
    val: any
  ) => {
    setQuotations(
      quotations.map((q) => {
        if (q.id !== quoteId) return q;
        const newItems = [...q.items];
        const currentItem = { ...newItems[itemIndex], [field]: val };

        if (field === 'quantity' || field === 'unitPrice') {
          const qty = field === 'quantity' ? Number(val) : currentItem.quantity;
          const up = field === 'unitPrice' ? Number(val) : currentItem.unitPrice;
          currentItem.amount = qty * up;
        }

        newItems[itemIndex] = currentItem;
        const newSubtotal = newItems.reduce((acc, it) => acc + (it.amount || 0), 0);
        const vatRate = q.vat.rate || 7.5;
        const newTotal = q.vat.isInclusive ? newSubtotal : newSubtotal + (newSubtotal * vatRate) / 100;

        return {
          ...q,
          items: newItems,
          subtotal: newSubtotal,
          total: newTotal,
        };
      })
    );
  };

  // Print Report Handler
  const handlePrintReport = () => {
    window.print();
  };

  // Export to MS Word
  const handleExportWord = () => {
    const winner = evaluationResult.winner;
    const content = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><title>Statutory Bid Evaluation Report</title>
      <style>
        body { font-family: 'Calibri', Arial, sans-serif; font-size: 11pt; line-height: 1.4; color: #111; }
        h1 { font-size: 16pt; color: #1e293b; text-align: center; margin-bottom: 4px; }
        h2 { font-size: 13pt; color: #334155; border-bottom: 2px solid #cbd5e1; padding-bottom: 4px; margin-top: 18px; }
        table { border-collapse: collapse; width: 100%; margin: 12px 0; font-size: 10pt; }
        th, td { border: 1px solid #94a3b8; padding: 6px 8px; text-align: left; }
        th { background-color: #f1f5f9; font-weight: bold; }
        .num { text-align: right; }
        .winner { background-color: #ecfdf5; font-weight: bold; }
        .footer { margin-top: 30px; font-size: 9pt; color: #64748b; }
      </style>
      </head>
      <body>
        <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="margin: 0; text-transform: uppercase;">${orgName}</h2>
          <p style="margin: 2px 0; font-weight: bold;">TENDERS EVALUATION COMMITTEE • INTERNAL PROCUREMENT REPORT</p>
          <p style="margin: 2px 0;">Requisition Ref: <strong>${requisitionRef}</strong> | Report Ref: <strong>${reportRef}</strong> | Date: <strong>${evaluationDate}</strong></p>
        </div>

        <h1>BID EVALUATION & AWARD RECOMMENDATION DOSSIER</h1>
        <p><strong>PROCUREMENT TITLE:</strong> ${procurementTitle}</p>
        <p><strong>GOVERNING LAW:</strong> Public Procurement Act 2007 (Nigeria) Sections 32 & 33 | Lowest Evaluated Responsive Bid Standard</p>

        <h2>1. EXECUTIVE TENDER EVALUATION SUMMARY</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Participating Bidder</th>
              <th>CAC RC #</th>
              <th>Stated Subtotal (${currency})</th>
              <th>VAT Treatment</th>
              <th>Evaluated Landed Cost (${currency})</th>
              <th>Responsiveness Status</th>
            </tr>
          </thead>
          <tbody>
            ${evaluationResult.suppliers
              .map(
                (s) => `
              <tr class="${s.rank === 1 ? 'winner' : ''}">
                <td>${s.rank === 1 ? '★ 1 (RECOMMENDED)' : s.rank}</td>
                <td>${s.quotation.supplierName}</td>
                <td>${s.quotation.rcNumber || 'NOT STATED'}</td>
                <td class="num">${s.baseCost.toLocaleString()}</td>
                <td>${s.quotation.vat.isInclusive ? '7.5% Included' : '7.5% Added'}</td>
                <td class="num">${s.evaluatedCost.toLocaleString()}</td>
                <td>${s.isResponsive ? 'RESPONSIVE' : 'DISQUALIFIED: ' + s.blocks.join('; ')}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <h2>2. STATUTORY EVALUATION NARRATIVE & AWARD JUSTIFICATION</h2>
        <div style="white-space: pre-line; background-color: #f8fafc; padding: 12px; border-left: 4px solid #0284c7;">
          ${customNarrative || evaluationResult.narrative}
        </div>

        <h2>3. ANTI-COLLUSION & BENEFICIAL OWNERSHIP AUDIT</h2>
        ${
          evaluationResult.collusionFlags.length === 0
            ? '<p>✓ No shared telephone numbers, email addresses, bank accounts, or common signatories were detected across the bidders.</p>'
            : evaluationResult.collusionFlags
                .map(
                  (f) => `
              <p><strong>[${f.severity.toUpperCase()}] ${f.title}:</strong> ${f.description}</p>
            `
                )
                .join('')
        }

        <h2>4. STATUTORY CERTIFICATION & SIGN-OFF</h2>
        <table style="border: none; margin-top: 30px;">
          <tr style="border: none;">
            <td style="border: none; width: 50%;">
              <p>Prepared by:</p>
              <br/><br/>
              <p>___________________________________<br/><strong>${preparedBy}</strong><br/>Procurement Directorate</p>
            </td>
            <td style="border: none; width: 50%;">
              <p>Reviewed & Approved by:</p>
              <br/><br/>
              <p>___________________________________<br/><strong>${reviewedBy}</strong><br/>Chairperson, Ministerial / Tenders Board</p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;

    const blob = new Blob(['\ufeff', content], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Statutory_Bid_Evaluation_Report_${reportRef}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Push Winner to Contract CPA Engine
  const handlePushWinnerToContract = () => {
    if (!evaluationResult.winner) {
      alert('No responsive winner to transfer.');
      return;
    }
    const win = evaluationResult.winner;
    if (onTransferToContract) {
      onTransferToContract({
        title: procurementTitle,
        contractCode: requisitionRef,
        procuringEntity: orgName,
        contractorName: win.quotation.supplierName,
        contractSumInitial: win.evaluatedCost,
        currency,
        awardDate: evaluationDate,
        baseDate: evaluationDate,
      });
      alert(`Contract parameters for "${win.quotation.supplierName}" (₦${win.evaluatedCost.toLocaleString()}) have been loaded into the Contract & CPA Indexation Engine.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="no-print bg-stone-900 text-stone-100 rounded-2xl p-5 shadow-lg border border-stone-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              RFQ & Tender Processing Hub
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              Bid Evaluation Desk
              <span className="text-xs px-2 py-0.5 font-mono font-medium rounded-md bg-stone-800 text-stone-300">
                PPA 2007 Sec 32/33
              </span>
            </h1>
            <p className="text-xs md:text-sm text-stone-400">
              Turn multi-supplier quotations into statutory comparative audit reports, detect collusion, harmonize VAT, and recommend lowest evaluated responsive bids.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleLoadWorkedExample}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-md transition-colors"
              title="Load full worked example with 3 real-world bidders, VAT harmonization, and compliance flags"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Load Worked Example
            </button>

            <button
              onClick={() => setShowSavedModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs border border-stone-700 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-stone-400" />
              Past Evaluations ({savedEvaluations.length})
            </button>

            <button
              onClick={handleSaveEvaluation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs border border-stone-700 transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              Save Dossier
            </button>
          </div>
        </div>

        {/* Step Navigation Tabs */}
        <div className="mt-5 pt-4 border-t border-stone-800 flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveStep('setup')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeStep === 'setup'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-stone-900/30 flex items-center justify-center text-[10px] font-mono">1</span>
            Requisition & Scope Setup ({reqItems.length} items)
          </button>

          <button
            onClick={() => setActiveStep('quotations')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeStep === 'quotations'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-stone-900/30 flex items-center justify-center text-[10px] font-mono">2</span>
            Supplier Quotations Audit ({quotations.length} bidders)
          </button>

          <button
            onClick={() => setActiveStep('report')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-lg transition-all ${
              activeStep === 'report'
                ? 'bg-amber-400 text-stone-950 font-bold shadow-xs'
                : 'text-stone-300 hover:text-white hover:bg-stone-800'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-stone-900/30 flex items-center justify-center text-[10px] font-mono">3</span>
            Evaluation Report & Matrix (PPA 2007)
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: REQUISITION & SETUP                                               */}
      {/* ========================================================================= */}
      {activeStep === 'setup' && (
        <div className="space-y-6">
          {/* Institutional Setup Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
              <Building className="w-4 h-4 text-amber-600" />
              Procuring Entity & Statutory Requisition Details
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block font-bold text-stone-700 mb-1">Procuring Entity / Buyer Organization:</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Procurement / RFQ Title:</label>
                <input
                  type="text"
                  value={procurementTitle}
                  onChange={(e) => setProcurementTitle(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-500 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Requisition Reference No:</label>
                <input
                  type="text"
                  value={requisitionRef}
                  onChange={(e) => setRequisitionRef(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Evaluation Report Ref:</label>
                <input
                  type="text"
                  value={reportRef}
                  onChange={(e) => setReportRef(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Prepared By (Procurement Officer):</label>
                <input
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">Reviewed By (Tenders Board):</label>
                <input
                  type="text"
                  value={reviewedBy}
                  onChange={(e) => setReviewedBy(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-300 rounded-lg px-3 py-2 text-stone-900 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Requisition Items Builder */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  Mandatory Requisition Items & Technical Specifications
                </h2>
                <p className="text-xs text-stone-500">
                  Every bidder must price all items listed here to be considered responsive under PPA 2007 Section 32.
                </p>
              </div>

              <button
                onClick={handleAddReqItem}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">#</th>
                    <th className="px-3 py-2.5">Item Description</th>
                    <th className="px-3 py-2.5">Detailed Specification</th>
                    <th className="px-3 py-2.5 w-24">Unit</th>
                    <th className="px-3 py-2.5 w-24">Required Qty</th>
                    <th className="px-3 py-2.5 w-32 text-right">Budget Benchmark</th>
                    <th className="px-3 py-2.5 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {reqItems.map((item, idx) => (
                    <tr key={item.id} className="hover:bg-stone-50/50">
                      <td className="px-3 py-2 font-mono text-stone-400">{idx + 1}</td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleUpdateReqItem(idx, 'name', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-xs font-semibold text-stone-900"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.specification}
                          onChange={(e) => handleUpdateReqItem(idx, 'specification', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-xs text-stone-600"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.unit}
                          onChange={(e) => handleUpdateReqItem(idx, 'unit', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-xs text-stone-700"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => handleUpdateReqItem(idx, 'quantity', Number(e.target.value))}
                          className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-xs font-mono font-bold text-stone-900 text-right"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          value={item.budgetBenchmarkPrice || 0}
                          onChange={(e) => handleUpdateReqItem(idx, 'budgetBenchmarkPrice', Number(e.target.value))}
                          className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-xs font-mono text-stone-700 text-right"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          onClick={() => handleRemoveReqItem(item.id)}
                          className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setActiveStep('quotations')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-colors"
              >
                Proceed to Supplier Quotations Audit
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: SUPPLIER QUOTATIONS REVIEW & AUDIT                                */}
      {/* ========================================================================= */}
      {activeStep === 'quotations' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div>
              <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                Submitted Supplier Quotations ({quotations.length} Active Bidders)
              </h2>
              <p className="text-xs text-stone-500">
                Review corporate credentials (CAC, TIN, settlement bank), line-by-line pricing, arithmetic fidelity, and VAT treatment.
              </p>
            </div>

            <button
              onClick={handleAddQuotation}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs transition-colors shrink-0"
            >
              <Plus className="w-4 h-4" />
              Add Another Bidder
            </button>
          </div>

          {/* Quotations List */}
          <div className="space-y-4">
            {quotations.map((q, qIndex) => {
              const isExpanded = expandedQuoteId === q.id;
              const evalSupplier = evaluationResult.suppliers.find((s) => s.quotation.id === q.id);

              return (
                <div
                  key={q.id}
                  className={`bg-white rounded-2xl border transition-all ${
                    evalSupplier?.isResponsive
                      ? 'border-stone-200 shadow-xs'
                      : 'border-red-200 bg-red-50/20'
                  }`}
                >
                  {/* Quotation Header Summary */}
                  <div
                    onClick={() => setExpandedQuoteId(isExpanded ? null : q.id)}
                    className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer hover:bg-stone-50/60 rounded-t-2xl"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-stone-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
                        #{qIndex + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-stone-900 text-sm">{q.supplierName}</h3>
                          {evalSupplier?.isResponsive ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Responsive
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]">
                              <XCircle className="w-3 h-3 text-red-600" />
                              Non-Responsive / Disqualified
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-stone-500 mt-0.5">
                          <span>CAC: <strong>{q.rcNumber || 'Not Stated'}</strong></span>
                          <span>•</span>
                          <span>TIN: <strong>{q.tin || 'Not Stated'}</strong></span>
                          <span>•</span>
                          <span>Delivery: <strong>{q.deliveryPeriod}</strong></span>
                          <span>•</span>
                          <span>Quote Ref: <strong>{q.quoteRef}</strong></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <div className="text-xs text-stone-400 font-medium">Evaluated Landed Cost:</div>
                        <div className="text-base font-black font-mono text-stone-900">
                          {formatCurrency(evalSupplier?.evaluatedCost || q.total, currency)}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {q.vat.isInclusive ? 'VAT 7.5% Included' : '+ 7.5% VAT harmonized'}
                        </div>
                      </div>

                      <div className="text-stone-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Edit Form */}
                  {isExpanded && (
                    <div className="p-5 border-t border-stone-200 bg-stone-50/50 space-y-5 rounded-b-2xl">
                      {/* Blocking Disqualifications if any */}
                      {evalSupplier && evalSupplier.blocks.length > 0 && (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-1">
                          <div className="font-bold text-red-900 text-xs flex items-center gap-1.5">
                            <ShieldAlert className="w-4 h-4 text-red-600" />
                            Disqualification Flags (PPA 2007 Non-Responsive Conditions):
                          </div>
                          <ul className="text-xs text-red-700 list-disc list-inside space-y-0.5">
                            {evalSupplier.blocks.map((b, bIdx) => (
                              <li key={bIdx}>{b}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Queries / Anomalies */}
                      {evalSupplier && evalSupplier.queries.length > 0 && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 space-y-1">
                          <div className="font-bold text-amber-900 text-xs flex items-center gap-1.5">
                            <AlertTriangle className="w-4 h-4 text-amber-600" />
                            Audit Queries & Price Discrepancies:
                          </div>
                          <ul className="text-xs text-amber-700 list-disc list-inside space-y-0.5">
                            {evalSupplier.queries.map((qr, qrIdx) => (
                              <li key={qrIdx}>{qr}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Supplier Meta Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                        <div>
                          <label className="block font-bold text-stone-600 mb-1">Legal Company Name:</label>
                          <input
                            type="text"
                            value={q.supplierName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuotations(quotations.map((item) => (item.id === q.id ? { ...item, supplierName: val } : item)));
                            }}
                            className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 font-bold text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-600 mb-1">CAC Registration No:</label>
                          <input
                            type="text"
                            value={q.rcNumber}
                            placeholder="e.g. RC 123456"
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuotations(quotations.map((item) => (item.id === q.id ? { ...item, rcNumber: val } : item)));
                            }}
                            className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 font-mono text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-600 mb-1">Tax ID Number (TIN):</label>
                          <input
                            type="text"
                            value={q.tin}
                            placeholder="e.g. 10234567-0001"
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuotations(quotations.map((item) => (item.id === q.id ? { ...item, tin: val } : item)));
                            }}
                            className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 font-mono text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-600 mb-1">Telephone:</label>
                          <input
                            type="text"
                            value={q.phone}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuotations(quotations.map((item) => (item.id === q.id ? { ...item, phone: val } : item)));
                            }}
                            className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-900 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-600 mb-1">Settlement Bank Name:</label>
                          <input
                            type="text"
                            value={q.bank.bankName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuotations(quotations.map((item) => (item.id === q.id ? { ...item, bank: { ...item.bank, bankName: val } } : item)));
                            }}
                            className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-600 mb-1">Bank Account Number:</label>
                          <input
                            type="text"
                            value={q.bank.accountNumber}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuotations(quotations.map((item) => (item.id === q.id ? { ...item, bank: { ...item.bank, accountNumber: val } } : item)));
                            }}
                            className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 font-mono text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-600 mb-1">Bank Account Name (Payee):</label>
                          <input
                            type="text"
                            value={q.bank.accountName}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuotations(quotations.map((item) => (item.id === q.id ? { ...item, bank: { ...item.bank, accountName: val } } : item)));
                            }}
                            className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-600 mb-1">Official Signatory:</label>
                          <input
                            type="text"
                            value={q.signatory}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuotations(quotations.map((item) => (item.id === q.id ? { ...item, signatory: val } : item)));
                            }}
                            className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-600 mb-1">Quote Reference:</label>
                          <input
                            type="text"
                            value={q.quoteRef}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuotations(quotations.map((item) => (item.id === q.id ? { ...item, quoteRef: val } : item)));
                            }}
                            className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 font-mono text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-600 mb-1">Delivery Period:</label>
                          <input
                            type="text"
                            value={q.deliveryPeriod}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuotations(quotations.map((item) => (item.id === q.id ? { ...item, deliveryPeriod: val } : item)));
                            }}
                            className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-600 mb-1">Payment Terms:</label>
                          <input
                            type="text"
                            value={q.paymentTerms}
                            onChange={(e) => {
                              const val = e.target.value;
                              setQuotations(quotations.map((item) => (item.id === q.id ? { ...item, paymentTerms: val } : item)));
                            }}
                            className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 text-stone-900"
                          />
                        </div>

                        <div>
                          <label className="block font-bold text-stone-600 mb-1">VAT Treatment:</label>
                          <select
                            value={q.vat.isInclusive ? 'inclusive' : 'exclusive'}
                            onChange={(e) => {
                              const isInc = e.target.value === 'inclusive';
                              setQuotations(
                                quotations.map((item) => {
                                  if (item.id !== q.id) return item;
                                  return {
                                    ...item,
                                    vat: { ...item.vat, isInclusive: isInc },
                                  };
                                })
                              );
                            }}
                            className="w-full bg-white border border-stone-300 rounded px-2.5 py-1.5 font-bold text-stone-900"
                          >
                            <option value="exclusive">VAT 7.5% Exclusive (+ 7.5% harmonized)</option>
                            <option value="inclusive">VAT 7.5% Inclusive (included in figures)</option>
                          </select>
                        </div>
                      </div>

                      {/* Line Items Table */}
                      <div className="space-y-2">
                        <div className="font-bold text-xs text-stone-800">
                          Quotation Line Items Priced by {q.supplierName}:
                        </div>

                        <div className="overflow-x-auto border border-stone-200 rounded-xl bg-white">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="px-3 py-2">Item Description</th>
                                <th className="px-3 py-2">Specification Stated</th>
                                <th className="px-3 py-2 w-20">Unit</th>
                                <th className="px-3 py-2 w-20 text-right">Qty</th>
                                <th className="px-3 py-2 w-28 text-right">Unit Price ({currency})</th>
                                <th className="px-3 py-2 w-32 text-right">Line Total ({currency})</th>
                                <th className="px-3 py-2 w-12 text-center">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-stone-100">
                              {q.items.map((it, itIdx) => (
                                <tr key={it.id} className="hover:bg-stone-50/50">
                                  <td className="px-3 py-1.5 font-medium text-stone-900">{it.name}</td>
                                  <td className="px-3 py-1.5 text-stone-500 text-[11px]">{it.specification}</td>
                                  <td className="px-3 py-1.5 text-stone-600">{it.unit}</td>
                                  <td className="px-3 py-1.5 text-right font-mono">{it.quantity}</td>
                                  <td className="px-3 py-1.5 text-right">
                                    <input
                                      type="number"
                                      value={it.unitPrice}
                                      onChange={(e) => handleUpdateQuoteLineItem(q.id, itIdx, 'unitPrice', e.target.value)}
                                      className="w-24 bg-stone-50 border border-stone-200 rounded px-1.5 py-0.5 text-right font-mono font-bold text-stone-900"
                                    />
                                  </td>
                                  <td className="px-3 py-1.5 text-right font-mono font-bold text-stone-900">
                                    {formatCurrency(it.amount, currency)}
                                  </td>
                                  <td className="px-3 py-1.5 text-center">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot className="bg-stone-50/80 font-bold border-t border-stone-200 text-stone-900">
                              <tr>
                                <td colSpan={5} className="px-3 py-2 text-right text-xs">
                                  Quoted Subtotal:
                                </td>
                                <td className="px-3 py-2 text-right font-mono text-sm">
                                  {formatCurrency(q.subtotal, currency)}
                                </td>
                                <td></td>
                              </tr>
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex justify-between items-center pt-2">
                        <button
                          onClick={() => handleRemoveQuotation(q.id)}
                          className="inline-flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-medium"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete Quotation
                        </button>

                        <button
                          onClick={() => setExpandedQuoteId(null)}
                          className="px-3 py-1.5 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs"
                        >
                          Close Card
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between pt-2">
            <button
              onClick={() => setActiveStep('setup')}
              className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs"
            >
              Back to Requisition Setup
            </button>

            <button
              onClick={() => setActiveStep('report')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-colors"
            >
              Generate Comparative Evaluation Report
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STEP 3: COMPARATIVE EVALUATION REPORT & AWARD MATRIX                      */}
      {/* ========================================================================= */}
      {activeStep === 'report' && (
        <div className="space-y-6">
          {/* Printable Letterhead & Official Dossier Header */}
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
            {/* Letterhead Bar */}
            <div className="border-b-2 border-stone-900 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AfriProcureLogo size="lg" variant="badge" />
                <div>
                  <h2 className="text-lg font-black text-stone-950 uppercase tracking-tight">{orgName}</h2>
                  <p className="text-xs text-stone-600 font-semibold uppercase">
                    DIRECTORATE OF PROCUREMENT • TENDERS EVALUATION COMMITTEE
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Statutory Evaluation Matrix under PPA 2007 Sections 32 & 33 | Anti-Collusion Audit Certified
                  </p>
                </div>
              </div>

              <div className="text-right text-xs space-y-0.5 shrink-0">
                <div>Requisition Ref: <span className="font-mono font-bold text-stone-900">{requisitionRef}</span></div>
                <div>Evaluation Ref: <span className="font-mono font-bold text-stone-900">{reportRef}</span></div>
                <div>Evaluation Date: <span className="font-bold text-stone-900">{evaluationDate}</span></div>
                <div>Statutory Currency: <span className="font-mono font-bold text-amber-700">{currency}</span></div>
              </div>
            </div>

            {/* Document Title */}
            <div className="text-center space-y-1">
              <span className="inline-block px-3 py-0.5 rounded-full bg-amber-100 text-amber-900 font-black text-[11px] tracking-wide uppercase">
                Official Recommendation for Contract Award
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900">
                BID EVALUATION REPORT & FORENSIC QUOTATION AUDIT
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-2xl mx-auto">
                {procurementTitle}
              </p>
            </div>

            {/* Statutory Award Winner Banner */}
            {evaluationResult.winner ? (
              <div className="bg-linear-to-r from-emerald-900 via-stone-900 to-stone-950 text-white rounded-2xl p-5 sm:p-6 shadow-md border border-emerald-500/30">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/40">
                      <Award className="w-4 h-4 text-emerald-400" />
                      Statutory Lowest Evaluated Responsive Bidder (PPA 2007)
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {evaluationResult.winner.quotation.supplierName}
                    </h3>
                    <p className="text-xs text-stone-300">
                      CAC Registration: <strong>{evaluationResult.winner.quotation.rcNumber}</strong> | TIN: <strong>{evaluationResult.winner.quotation.tin}</strong> | Delivery: <strong>{evaluationResult.winner.quotation.deliveryPeriod}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-stone-800/80 rounded-xl p-3 border border-stone-700/60 text-right">
                      <div className="text-[10px] uppercase font-bold text-stone-400">Evaluated Landed Cost</div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                        {formatCurrency(evaluationResult.winner.evaluatedCost, currency)}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {evaluationResult.winner.quotation.vat.isInclusive ? 'Inclusive of 7.5% VAT' : 'Harmonized landed cost'}
                      </div>
                    </div>

                    {evaluationResult.savingsVsHighest > 0 && (
                      <div className="bg-emerald-950/60 rounded-xl p-3 border border-emerald-700/40 text-right">
                        <div className="text-[10px] uppercase font-bold text-emerald-300 flex items-center justify-end gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Public Savings vs High
                        </div>
                        <div className="text-lg sm:text-xl font-black font-mono text-emerald-300">
                          {formatCurrency(evaluationResult.savingsVsHighest, currency)}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-medium">
                          {evaluationResult.savingsPct.toFixed(1)}% expenditure saved
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Verified: Scope Completeness ({evaluationResult.winner.itemsQuotedCount}/{evaluationResult.winner.itemsRequiredCount} items)</span>
                    <span>•</span>
                    <span>Direct Settlement to {evaluationResult.winner.quotation.bank.bankName}</span>
                  </div>

                  {onTransferToContract && (
                    <button
                      onClick={handlePushWinnerToContract}
                      className="no-print inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-sm transition-colors"
                    >
                      <Building className="w-3.5 h-3.5" />
                      Load Winner into Contract & CPA Engine
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-red-50 border border-red-300 rounded-2xl p-5 text-red-900 space-y-2">
                <div className="font-bold text-base flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  No Responsive Bidder Qualified for Award
                </div>
                <p className="text-xs text-red-800">
                  All submitted quotations failed statutory responsiveness checks under PPA 2007 Section 32 due to missing requisition lines, entity name discrepancies, or expired validity.
                </p>
              </div>
            )}

            {/* Executive Comparison Table */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Scale className="w-4 h-4 text-amber-600" />
                1. Quotation Evaluation & Landed Cost Comparison Matrix
              </h3>

              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2.5">Rank</th>
                      <th className="px-3 py-2.5">Supplier Name</th>
                      <th className="px-3 py-2.5">CAC / TIN Compliance</th>
                      <th className="px-3 py-2.5 text-right">Quoted Subtotal ({currency})</th>
                      <th className="px-3 py-2.5 text-center">VAT Treatment</th>
                      <th className="px-3 py-2.5 text-right">Evaluated Landed Cost ({currency})</th>
                      <th className="px-3 py-2.5 text-center">Scope Quoted</th>
                      <th className="px-3 py-2.5 text-center">Responsiveness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {evaluationResult.suppliers.map((s) => {
                      const isWinner = evaluationResult.winner?.quotation.id === s.quotation.id;

                      return (
                        <tr
                          key={s.quotation.id}
                          className={`hover:bg-stone-50/60 transition-colors ${
                            isWinner ? 'bg-emerald-50/50 font-semibold' : ''
                          }`}
                        >
                          <td className="px-3 py-2.5">
                            {isWinner ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px]">
                                ★ Rank 1
                              </span>
                            ) : (
                              <span className="font-mono text-stone-600">Rank {s.rank}</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-bold text-stone-900">{s.quotation.supplierName}</div>
                            <div className="text-[10px] text-stone-500">{s.quotation.address}</div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-mono text-[11px] text-stone-800">
                              {s.quotation.rcNumber || <span className="text-red-600 font-bold">Missing RC#</span>}
                            </div>
                            <div className="font-mono text-[10px] text-stone-500">
                              {s.quotation.tin || <span className="text-red-600">Missing TIN</span>}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-medium text-stone-800">
                            {formatCurrency(s.baseCost, currency)}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {s.quotation.vat.isInclusive ? (
                              <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[10px] font-medium">
                                7.5% Included
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-[10px] font-medium">
                                + ₦{s.vatAdded.toLocaleString()} added
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-stone-950 text-sm">
                            {formatCurrency(s.evaluatedCost, currency)}
                          </td>
                          <td className="px-3 py-2.5 text-center font-mono">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                s.itemsQuotedCount === s.itemsRequiredCount
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {s.itemsQuotedCount} / {s.itemsRequiredCount} ({Math.round(s.completenessPct)}%)
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {s.isResponsive ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                Responsive
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 text-red-800 font-bold text-[10px]"
                                title={s.blocks.join(' | ')}
                              >
                                <XCircle className="w-3 h-3 text-red-600" />
                                Disqualified
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Granular Item-by-Item Comparative Matrix */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                2. Item-by-Item Unit Price Breakdown & Benchmark Comparison
              </h3>

              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2.5">#</th>
                      <th className="px-3 py-2.5">Requisition Scope & Unit</th>
                      <th className="px-3 py-2.5 text-right">Required Qty</th>
                      {quotations.map((q) => (
                        <th key={q.id} className="px-3 py-2.5 text-right">
                          <div className="truncate max-w-[150px]">{q.supplierName}</div>
                          <div className="text-[9px] text-stone-400 font-mono">Unit / Line ({currency})</div>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100">
                    {reqItems.map((ri, rIdx) => {
                      // Find lowest unit price among bidders
                      const prices = quotations
                        .map((q) => {
                          const item = q.items.find((it) => it.matchReqItemId === ri.id);
                          return item ? item.unitPrice : null;
                        })
                        .filter((p): p is number => p !== null && p > 0);
                      const minPrice = prices.length > 0 ? Math.min(...prices) : null;

                      return (
                        <tr key={ri.id} className="hover:bg-stone-50/50">
                          <td className="px-3 py-2 font-mono text-stone-400">{rIdx + 1}</td>
                          <td className="px-3 py-2">
                            <div className="font-bold text-stone-900">{ri.name}</div>
                            <div className="text-[10px] text-stone-500">{ri.specification}</div>
                          </td>
                          <td className="px-3 py-2 text-right font-mono font-semibold text-stone-800">
                            {ri.quantity} {ri.unit}
                          </td>

                          {quotations.map((q) => {
                            const quotedItem = q.items.find((it) => it.matchReqItemId === ri.id);
                            if (!quotedItem) {
                              return (
                                <td key={q.id} className="px-3 py-2 text-right bg-red-50/40">
                                  <span className="text-[10px] font-bold text-red-600">NOT QUOTED</span>
                                </td>
                              );
                            }

                            const isMin = minPrice !== null && quotedItem.unitPrice === minPrice;

                            return (
                              <td
                                key={q.id}
                                className={`px-3 py-2 text-right font-mono ${
                                  isMin ? 'bg-emerald-50/50 font-bold' : ''
                                }`}
                              >
                                <div className="text-stone-900 font-semibold">
                                  ₦{quotedItem.unitPrice.toLocaleString()}
                                  {isMin && (
                                    <span className="ml-1 text-[9px] text-emerald-700 bg-emerald-100 px-1 py-0.2 rounded font-sans">
                                      Lowest
                                    </span>
                                  )}
                                </div>
                                <div className="text-[10px] text-stone-500">
                                  ₦{quotedItem.amount.toLocaleString()}
                                </div>
                              </td>
                            );
                          })}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Anti-Collusion & Integrity Shield Audit */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-red-600" />
                3. Anti-Collusion & Beneficial Ownership Integrity Audit
              </h3>

              {evaluationResult.collusionFlags.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs text-emerald-800">
                    <strong>Statutory Integrity Clearance:</strong> Cross-examination of corporate records found no shared telephone numbers, physical addresses, bank accounts, or common directors between bidders. Bids appear independently formulated in compliance with PPA 2007 Section 57.
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {evaluationResult.collusionFlags.map((flag, fIdx) => (
                    <div
                      key={fIdx}
                      className={`rounded-xl p-3.5 border flex items-start gap-3 ${
                        flag.severity === 'critical'
                          ? 'bg-red-50 border-red-200 text-red-900'
                          : 'bg-amber-50 border-amber-200 text-amber-900'
                      }`}
                    >
                      <AlertTriangle
                        className={`w-4 h-4 shrink-0 mt-0.5 ${
                          flag.severity === 'critical' ? 'text-red-600' : 'text-amber-600'
                        }`}
                      />
                      <div className="text-xs space-y-0.5">
                        <div className="font-bold flex items-center gap-2">
                          <span>{flag.title}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-mono font-bold ${
                              flag.severity === 'critical'
                                ? 'bg-red-200 text-red-900'
                                : 'bg-amber-200 text-amber-900'
                            }`}
                          >
                            {flag.severity}
                          </span>
                        </div>
                        <p>{flag.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Statutory Evaluation Narrative */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-amber-600" />
                  4. Statutory Evaluation Narrative & Recommendation Dossier
                </h3>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText(customNarrative || evaluationResult.narrative);
                    setCopiedNotification(true);
                    setTimeout(() => setCopiedNotification(false), 2000);
                  }}
                  className="no-print text-xs text-stone-600 hover:text-stone-900 font-medium"
                >
                  {copiedNotification ? '✓ Copied to clipboard' : 'Copy Narrative'}
                </button>
              </div>

              <textarea
                rows={8}
                value={customNarrative || evaluationResult.narrative}
                onChange={(e) => setCustomNarrative(e.target.value)}
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 font-mono text-xs text-stone-800 leading-relaxed focus:outline-hidden focus:border-amber-500"
              />
            </div>

            {/* Statutory Sign-off Block */}
            <div className="border-t border-stone-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
              <div className="space-y-4">
                <div className="font-bold text-stone-700 uppercase tracking-wide text-[10px]">
                  Evaluation Prepared By:
                </div>
                <div className="pt-8 border-b border-stone-300 w-4/5"></div>
                <div>
                  <div className="font-bold text-stone-900">{preparedBy}</div>
                  <div className="text-stone-500 text-[11px]">Procurement Lead / Forensic Cost Engineer</div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="font-bold text-stone-700 uppercase tracking-wide text-[10px]">
                  Evaluation Reviewed & Approved By:
                </div>
                <div className="pt-8 border-b border-stone-300 w-4/5"></div>
                <div>
                  <div className="font-bold text-stone-900">{reviewedBy}</div>
                  <div className="text-stone-500 text-[11px]">Chairperson, Tenders Evaluation Board</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar (Print, Word, Back) */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveStep('quotations')}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors"
              >
                Back to Quotations Edit
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportWord}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition-colors"
              >
                <Download className="w-4 h-4 text-blue-600" />
                Export Word Document (.doc)
              </button>

              <button
                onClick={handlePrintReport}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs shadow-md transition-colors"
              >
                <Printer className="w-4 h-4 text-amber-400" />
                Print / Save PDF Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saved Evaluations History Modal */}
      {showSavedModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <History className="w-4 h-4 text-amber-600" />
                Browser Saved Bid Evaluations
              </h3>
              <button
                onClick={() => setShowSavedModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-3 pr-1 text-xs">
              {savedEvaluations.length === 0 ? (
                <div className="text-center py-8 text-stone-500">
                  No saved evaluations found. Click &quot;Save Dossier&quot; on any evaluation to save it here.
                </div>
              ) : (
                savedEvaluations.map((ev) => (
                  <div
                    key={ev.id}
                    className="p-3.5 border border-stone-200 rounded-xl hover:border-amber-400 bg-stone-50 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="font-bold text-stone-900 text-sm">{ev.procurementTitle}</div>
                      <div className="text-stone-500 text-[11px]">
                        {ev.organization} • Ref: {ev.requisitionRef} • {new Date(ev.savedAt).toLocaleDateString()}
                      </div>
                      <div className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                        Winner: {ev.winnerName || 'No award'} (₦{(ev.evaluatedCost || 0).toLocaleString()})
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRestoreSaved(ev)}
                        className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
                      >
                        Open
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="border-t pt-3 flex justify-end">
              <button
                onClick={() => setShowSavedModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
