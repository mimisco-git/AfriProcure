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
  Eye,
  SlidersHorizontal,
  BarChart3,
  Users,
  Upload,
  Layers,
  FileDown,
  HelpCircle,
  Mail,
  FileSignature,
  CheckSquare,
  FileBadge,
  Shield,
  Sun,
} from 'lucide-react';
import {
  RequisitionItem,
  SupplierQuotation,
  QuotationLineItem,
  BidEvaluationResult,
  CurrencyCode,
  ContractProject,
  SavedBidEvaluation,
  EvaluationCommitteeMember,
  EvaluatedSupplier,
} from '../types';
import { formatCurrency, formatFullCurrency } from '../utils/cpaMath';
import {
  WORKED_EXAMPLE_ITEMS,
  WORKED_EXAMPLE_QUOTATIONS,
  SOLAR_EXAMPLE_ITEMS,
  SOLAR_EXAMPLE_QUOTATIONS,
  HIGHWAY_EXAMPLE_ITEMS,
  HIGHWAY_EXAMPLE_QUOTATIONS,
  DEFAULT_COMMITTEE_MEMBERS,
  STATUTORY_ELIGIBILITY_CRITERIA,
  evaluateBids,
} from '../utils/bidEvaluationEngine';
import { exportBidEvaluationToCsv } from '../utils/csvExporter';
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

  // Tenders Evaluation Committee
  const [committeeMembers, setCommitteeMembers] = useState<EvaluationCommitteeMember[]>(DEFAULT_COMMITTEE_MEMBERS);

  // Policy & Sensitivity Options state
  const [vatExempt, setVatExempt] = useState<boolean>(false);
  const [missingItemPolicy, setMissingItemPolicy] = useState<'disqualify' | 'load_highest_price'>('disqualify');
  const [albThresholdPct, setAlbThresholdPct] = useState<number>(25);
  const [evaluationMethod, setEvaluationMethod] = useState<'lerb' | 'qcbs'>('lerb');
  const [technicalWeight, setTechnicalWeight] = useState<number>(70);
  const [financialWeight, setFinancialWeight] = useState<number>(30);
  const [applyArithmeticCorrections, setApplyArithmeticCorrections] = useState<boolean>(true);

  // Requisition items state
  const [reqItems, setReqItems] = useState<RequisitionItem[]>(WORKED_EXAMPLE_ITEMS);

  // Supplier quotations state
  const [quotations, setQuotations] = useState<SupplierQuotation[]>(WORKED_EXAMPLE_QUOTATIONS);

  // Active Preset tag
  const [activePreset, setActivePreset] = useState<'marine_ppe' | 'solar_minigrid' | 'highway_pavement'>('marine_ppe');

  // Saved evaluations in local storage
  const [savedEvaluations, setSavedEvaluations] = useState<SavedBidEvaluation[]>([]);
  const [showSavedModal, setShowSavedModal] = useState(false);

  // Document Inspection Modal State
  const [inspectingQuote, setInspectingQuote] = useState<SupplierQuotation | null>(null);

  // Official Letter Suite Modals
  const [showAwardLetterModal, setShowAwardLetterModal] = useState<boolean>(false);
  const [showDebriefModal, setShowDebriefModal] = useState<boolean>(false);
  const [selectedDebriefId, setSelectedDebriefId] = useState<string>('');

  // Batch Import Modal State
  const [showBatchImportModal, setShowBatchImportModal] = useState<boolean>(false);
  const [batchImportText, setBatchImportText] = useState<string>('');

  // Editing modals / accordion states
  const [expandedQuoteId, setExpandedQuoteId] = useState<string | null>('quote-1');

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
    return evaluateBids(reqItems, quotations, currency, {
      vatExempt,
      missingItemPolicy,
      albThresholdPct,
      evaluationMethod,
      technicalWeight,
      financialWeight,
      applyArithmeticCorrections,
    });
  }, [
    reqItems,
    quotations,
    currency,
    vatExempt,
    missingItemPolicy,
    albThresholdPct,
    evaluationMethod,
    technicalWeight,
    financialWeight,
    applyArithmeticCorrections,
  ]);

  // Sync narrative if custom is empty
  useEffect(() => {
    if (!customNarrative) {
      setCustomNarrative(evaluationResult.narrative);
    }
  }, [evaluationResult.narrative]);

  // Handle Load Worked Example
  const handleLoadWorkedExample = () => {
    setActivePreset('marine_ppe');
    setOrgName('Delta Marine Services Ltd');
    setProcurementTitle('Supply of personal protective equipment (PPE)');
    setRequisitionRef('DMS/RFQ/2026/0118');
    setReportRef('BER-2026-08-0118');
    setPreparedBy('Engr. K. O. Ekanem, Procurement Lead');
    setReviewedBy('Dr. (Mrs.) B. N. Okafor, Director of Procurement');
    setEvaluationDate('2026-08-25');
    setCommitteeMembers(DEFAULT_COMMITTEE_MEMBERS);
    setReqItems(WORKED_EXAMPLE_ITEMS);
    setQuotations(WORKED_EXAMPLE_QUOTATIONS);
    setCustomNarrative('');
    setActiveStep('report');
  };

  // Preset Selector Handler
  const handleSelectPreset = (presetKey: 'marine_ppe' | 'solar_minigrid' | 'highway_pavement') => {
    setActivePreset(presetKey);
    if (presetKey === 'marine_ppe') {
      handleLoadWorkedExample();
    } else if (presetKey === 'solar_minigrid') {
      setOrgName('Federal Rural Electrification Agency (REA)');
      setProcurementTitle('Turnkey Supply of 20kW Hybrid Solar Inverter, Panels & LiFePO4 Energy Storage');
      setRequisitionRef('REA/HQ/SOL/2026/041');
      setReportRef('BER-REA-2026-084');
      setPreparedBy('Engr. T. S. Alabi, Head of Solar Engineering');
      setReviewedBy('Dr. (Engr.) H. M. Bello, Director of Renewable Energy');
      setEvaluationDate('2026-08-25');
      setCommitteeMembers([
        { id: 'cm-s1', name: 'Dr. (Engr.) H. M. Bello', role: 'Committee Chairperson', department: 'Renewable & Off-Grid Electrification', signedDate: '2026-08-25' },
        { id: 'cm-s2', name: 'Engr. T. S. Alabi', role: 'Procurement Secretary', department: 'Procurement & Logistics Directorate', signedDate: '2026-08-25' },
        { id: 'cm-s3', name: 'Engr. Y. K. Mohammed', role: 'Power Systems Specialist', department: 'Engineering Technical Review', signedDate: '2026-08-25' },
        { id: 'cm-s4', name: 'Mr. C. E. Obi (FCA)', role: 'Treasury Analyst', department: 'Finance & Accounts', signedDate: '2026-08-25' },
        { id: 'cm-s5', name: 'Barr. Halima S. Garba', role: 'Legal Directorate / Due Process Observer', department: 'Legal Services Unit', signedDate: '2026-08-25' },
      ]);
      setReqItems(SOLAR_EXAMPLE_ITEMS);
      setQuotations(SOLAR_EXAMPLE_QUOTATIONS);
      setCustomNarrative('');
      setActiveStep('report');
    } else if (presetKey === 'highway_pavement') {
      setOrgName('Federal Ministry of Works & Infrastructure');
      setProcurementTitle('Procurement of 60/70 Penetration Grade Bitumen & Asphalt Materials for Trunk A Pavement');
      setRequisitionRef('FMW/FED/ASPH/2026/089');
      setReportRef('BER-FMW-2026-019');
      setPreparedBy('Engr. V. K. Osagie, Chief Resident Engineer');
      setReviewedBy('Engr. (Mrs.) O. A. Babalola, Director of Highways & Materials');
      setEvaluationDate('2026-08-25');
      setCommitteeMembers([
        { id: 'cm-h1', name: 'Engr. (Mrs.) O. A. Babalola', role: 'Committee Chairperson', department: 'Federal Highways Directorate', signedDate: '2026-08-25' },
        { id: 'cm-h2', name: 'Engr. V. K. Osagie', role: 'Procurement Secretary', department: 'Procurement & Materials Directorate', signedDate: '2026-08-25' },
        { id: 'cm-h3', name: 'Engr. B. N. Audu', role: 'Materials Quality Engineer', department: 'Materials Testing & Quality Control Laboratory', signedDate: '2026-08-25' },
        { id: 'cm-h4', name: 'Alhaji I. K. Zaria', role: 'Internal Audit Representative', department: 'Finance & Accounts Directorate', signedDate: '2026-08-25' },
        { id: 'cm-h5', name: 'Barr. M. C. Eze', role: 'Civil Society / Due Process Monitor', department: 'Legal Directorate', signedDate: '2026-08-25' },
      ]);
      setReqItems(HIGHWAY_EXAMPLE_ITEMS);
      setQuotations(HIGHWAY_EXAMPLE_QUOTATIONS);
      setCustomNarrative('');
      setActiveStep('report');
    }
  };

  // Process Batch Import of Requisition Items
  const handleProcessBatchImport = () => {
    if (!batchImportText.trim()) return;
    const lines = batchImportText.trim().split('\n');
    const newItems: RequisitionItem[] = [];

    lines.forEach((line, index) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      let parts: string[] = [];
      if (trimmed.includes('\t')) {
        parts = trimmed.split('\t');
      } else if (trimmed.includes('|')) {
        parts = trimmed.split('|');
      } else if (trimmed.includes(',')) {
        parts = trimmed.split(',');
      } else {
        parts = [trimmed];
      }

      const cleanParts = parts.map((p) => p.trim());
      const name = cleanParts[0] || `Requisition Item #${index + 1}`;
      const specification = cleanParts[1] || 'Standard industrial specification';
      const unit = cleanParts[2] || 'pcs';
      const quantity = cleanParts[3] ? parseInt(cleanParts[3].replace(/[^0-9]/g, ''), 10) || 100 : 100;
      const budgetBenchmarkPrice = cleanParts[4] ? parseFloat(cleanParts[4].replace(/[^0-9.]/g, '')) || 10000 : 10000;

      newItems.push({
        id: `batch-${Date.now()}-${index}`,
        name,
        specification,
        unit,
        quantity,
        budgetBenchmarkPrice,
      });
    });

    if (newItems.length > 0) {
      setReqItems(newItems);
      // Synchronize quotations to include the new items
      setQuotations((prevQuotes) =>
        prevQuotes.map((q) => {
          const matchedItems = newItems.map((r, i) => {
            const existing = q.items.find((it) => it.name.toLowerCase() === r.name.toLowerCase());
            return (
              existing || {
                id: `qline-${q.id}-${Date.now()}-${i}`,
                name: r.name,
                specification: r.specification,
                unit: r.unit,
                quantity: r.quantity,
                unitPrice: r.budgetBenchmarkPrice || 10000,
                amount: (r.budgetBenchmarkPrice || 10000) * r.quantity,
                matchReqItemId: r.id,
                sourcePageNote: `Batch imported item ${i + 1}`,
              }
            );
          });
          const newSubtotal = matchedItems.reduce((acc, it) => acc + (it.amount || 0), 0);
          const vatRate = q.vat.rate || 7.5;
          const newTotal = q.vat.isInclusive ? newSubtotal : newSubtotal + (newSubtotal * vatRate) / 100;
          return {
            ...q,
            items: matchedItems,
            subtotal: newSubtotal,
            total: newTotal,
          };
        })
      );
      setShowBatchImportModal(false);
      setBatchImportText('');
    }
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
      committeeMembers,
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
    if (saved.committeeMembers && saved.committeeMembers.length > 0) {
      setCommitteeMembers(saved.committeeMembers);
    }
    setReqItems(saved.items);
    setQuotations(saved.quotations);
    setCustomNarrative('');
    setShowSavedModal(false);
    setActiveStep('report');
  };

  // CSV Export Handler
  const handleExportCsv = () => {
    exportBidEvaluationToCsv(
      {
        orgName,
        procurementTitle,
        requisitionRef,
        reportRef,
        evaluationDate,
        currency,
      },
      reqItems,
      evaluationResult
    );
  };

  // Download Blank RFQ Quotation Schedule for Suppliers
  const handleDownloadBlankRfqCsv = () => {
    const headers = [
      'Item No.',
      'Item Description',
      'Technical Specification',
      'Unit of Measurement',
      'Quantity Required',
      `Bidder Unit Price (${currency})`,
      `Bidder Line Total (${currency})`,
      'Specification Compliance (Yes/No)',
      'Brand / Model Quoted',
    ];

    const rows = reqItems.map((item, idx) => [
      `"${idx + 1}"`,
      `"${item.name.replace(/"/g, '""')}"`,
      `"${item.specification.replace(/"/g, '""')}"`,
      `"${item.unit}"`,
      `"${item.quantity}"`,
      '""',
      '""',
      '"Yes"',
      '""',
    ]);

    const csvContent = [
      `# ${orgName.toUpperCase()} - REQUEST FOR QUOTATIONS (RFQ)`,
      `# Procurement Title: ${procurementTitle}`,
      `# RFQ Reference: ${requisitionRef}`,
      `# Statutory Submission Currency: ${currency}`,
      `# Instructions: Enter your firm unit rate in column F and compute line total in column G.`,
      headers.join(','),
      ...rows.map((r) => r.join(',')),
    ].join('\n');

    const blob = new Blob(['\ufeff', csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Blank_RFQ_Schedule_${requisitionRef.replace(/[^a-zA-Z0-9_-]/g, '_')}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Committee Member helpers
  const handleAddCommitteeMember = () => {
    const newMember: EvaluationCommitteeMember = {
      id: 'cm-' + Date.now(),
      name: 'New Committee Member',
      role: 'Technical Evaluator',
      department: 'Procurement Board',
      signedDate: evaluationDate,
    };
    setCommitteeMembers([...committeeMembers, newMember]);
  };

  const handleUpdateCommitteeMember = (id: string, field: keyof EvaluationCommitteeMember, val: string) => {
    setCommitteeMembers(committeeMembers.map((m) => (m.id === id ? { ...m, [field]: val } : m)));
  };

  const handleRemoveCommitteeMember = (id: string) => {
    if (committeeMembers.length <= 1) {
      alert('At least one committee member is required for evaluation sign-off.');
      return;
    }
    setCommitteeMembers(committeeMembers.filter((m) => m.id !== id));
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

        <h2>3B. ABNORMALLY LOW BID (ALB) & PRICE REALISM AUDIT (PPA 2007 SECTION 34)</h2>
        ${
          evaluationResult.albWarnings.length === 0
            ? '<p>✓ All quoted unit prices fall within standard commercial price variance thresholds. No abnormally low tenders detected.</p>'
            : `<table>
                <thead>
                  <tr style="background-color: #fef2f2;">
                    <th>Supplier</th>
                    <th>Line Item</th>
                    <th>Quoted Unit Price (${currency})</th>
                    <th>Budget Benchmark (${currency})</th>
                    <th>Variance (%)</th>
                    <th>Audit Finding</th>
                  </tr>
                </thead>
                <tbody>
                  ${evaluationResult.albWarnings
                    .map(
                      (w) => `
                    <tr>
                      <td>${w.supplierName}</td>
                      <td>${w.itemName}</td>
                      <td class="num">${w.unitPrice.toLocaleString()}</td>
                      <td class="num">${w.benchmarkPrice.toLocaleString()}</td>
                      <td class="num">${w.variancePct}%</td>
                      <td>${w.reason}</td>
                    </tr>
                  `
                    )
                    .join('')}
                </tbody>
              </table>`
        }

        <h2>4. TENDERS EVALUATION COMMITTEE STATUTORY SIGN-OFF</h2>
        <p>In accordance with Section 21 and Section 22 of the Public Procurement Act (PPA 2007), the undersigned evaluation committee members have verified the mathematical accuracy, legal credentials, technical responsiveness, and anti-collusion clearance of all bids evaluated herein:</p>
        <table>
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th>Committee Role</th>
              <th>Member Name</th>
              <th>Directorate / Entity</th>
              <th>Official Signature & Date</th>
            </tr>
          </thead>
          <tbody>
            ${committeeMembers
              .map(
                (m) => `
              <tr>
                <td><strong>${m.role}</strong></td>
                <td>${m.name}</td>
                <td>${m.department}</td>
                <td style="height: 35px; vertical-align: bottom;">____________________ (${m.signedDate || evaluationDate})</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
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
      <div className="no-print bg-stone-900 text-stone-100 rounded-2xl p-6 shadow-md border border-stone-800 space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider">
              <FileSpreadsheet className="w-4 h-4 text-amber-400" />
              <span>RFQ & Tender Evaluation Desk</span>
              <span className="text-stone-500 font-normal">·</span>
              <span className="text-stone-400 font-mono text-[11px] normal-case">PPA 2007 Sections 31, 32 & 34</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">
              Forensic Bid Audit & Award Evaluation Engine
            </h1>
            <p className="text-xs md:text-sm text-stone-400 max-w-3xl leading-relaxed">
              Harmonize multi-supplier tender schedules, verify preliminary statutory certifications, execute automatic arithmetic error corrections under PPA Section 31, and determine the Lowest Evaluated Responsive Bidder.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={handleLoadWorkedExample}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs transition-colors"
              title="Load full worked example with 3 real-world bidders, VAT harmonization, and compliance flags"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Worked Example
            </button>

            <button
              onClick={() => setShowSavedModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs border border-stone-700/80 transition-colors"
            >
              <History className="w-3.5 h-3.5 text-stone-400" />
              Saved Dossiers ({savedEvaluations.length})
            </button>

            <button
              onClick={handleSaveEvaluation}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-medium text-xs border border-stone-700/80 transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5 text-emerald-400" />
              Save Evaluation
            </button>
          </div>
        </div>

        {/* Executive Step Progress Controller */}
        <div className="pt-4 border-t border-stone-800 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <button
            onClick={() => setActiveStep('setup')}
            className={`p-3 rounded-xl text-left border transition-all ${
              activeStep === 'setup'
                ? 'bg-amber-500/10 border-amber-500 text-white shadow-xs'
                : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold tracking-wide uppercase ${activeStep === 'setup' ? 'text-amber-400' : 'text-stone-500'}`}>
                Stage 01
              </span>
              <span className="text-[10px] font-mono text-stone-400">{reqItems.length} line items</span>
            </div>
            <div className="font-bold text-xs text-stone-100 mt-1">Requisition & Benchmark Scope</div>
          </button>

          <button
            onClick={() => setActiveStep('quotations')}
            className={`p-3 rounded-xl text-left border transition-all ${
              activeStep === 'quotations'
                ? 'bg-amber-500/10 border-amber-500 text-white shadow-xs'
                : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold tracking-wide uppercase ${activeStep === 'quotations' ? 'text-amber-400' : 'text-stone-500'}`}>
                Stage 02
              </span>
              <span className="text-[10px] font-mono text-stone-400">{quotations.length} participating bidders</span>
            </div>
            <div className="font-bold text-xs text-stone-100 mt-1">Quotations & Statutory Eligibility</div>
          </button>

          <button
            onClick={() => setActiveStep('report')}
            className={`p-3 rounded-xl text-left border transition-all ${
              activeStep === 'report'
                ? 'bg-amber-500/10 border-amber-500 text-white shadow-xs'
                : 'bg-stone-950/60 border-stone-800 text-stone-400 hover:border-stone-700 hover:text-stone-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-mono font-bold tracking-wide uppercase ${activeStep === 'report' ? 'text-amber-400' : 'text-stone-500'}`}>
                Stage 03
              </span>
              <span className="text-[10px] font-mono text-emerald-400">
                {evaluationResult.winner ? '✓ Award Recommended' : 'Pending Audit'}
              </span>
            </div>
            <div className="font-bold text-xs text-stone-100 mt-1">Comparative Matrix & Award Report</div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 1: REQUISITION & SETUP                                               */}
      {/* ========================================================================= */}
      {activeStep === 'setup' && (
        <div className="space-y-6">
          {/* Preset Selector Card */}
          <div className="bg-stone-900 text-stone-100 rounded-2xl p-5 border border-stone-800 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  <span>Standard Institutional Tender Presets</span>
                </div>
                <h3 className="text-sm font-bold text-white mt-1">
                  Load Realistic Public Procurement Scenarios
                </h3>
                <p className="text-xs text-stone-400">
                  Switch between standard infrastructure domains with authenticated specifications, competitive vendor submissions, and statutory credentials.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
              <button
                type="button"
                onClick={() => handleSelectPreset('marine_ppe')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  activePreset === 'marine_ppe'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-xs'
                    : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:border-stone-500 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    Marine Safety & PPE
                  </span>
                  {activePreset === 'marine_ppe' && (
                    <span className="text-[9px] bg-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded font-mono">
                      LOADED
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">Delta Marine Services Ltd</div>
                <div className="text-[10px] text-amber-400 font-mono mt-2">5 Requisition Items • 3 Bidders</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('solar_minigrid')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  activePreset === 'solar_minigrid'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-xs'
                    : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:border-stone-500 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    Solar Mini-Grid & Storage
                  </span>
                  {activePreset === 'solar_minigrid' && (
                    <span className="text-[9px] bg-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded font-mono">
                      LOADED
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">Rural Electrification Agency (REA)</div>
                <div className="text-[10px] text-amber-400 font-mono mt-2">5 Requisition Items • 3 Bidders</div>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPreset('highway_pavement')}
                className={`p-3.5 rounded-xl border text-left transition-all ${
                  activePreset === 'highway_pavement'
                    ? 'bg-amber-500/10 border-amber-500 text-white shadow-xs'
                    : 'bg-stone-800/80 border-stone-700/80 text-stone-300 hover:border-stone-500 hover:text-white'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-amber-400" />
                    Highway Bitumen & Asphalt
                  </span>
                  {activePreset === 'highway_pavement' && (
                    <span className="text-[9px] bg-amber-500 text-stone-950 font-black px-1.5 py-0.2 rounded font-mono">
                      LOADED
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-stone-400 mt-1">Federal Ministry of Works</div>
                <div className="text-[10px] text-amber-400 font-mono mt-2">4 Requisition Items • 3 Bidders</div>
              </button>
            </div>
          </div>

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

          {/* Tenders Evaluation Committee Card */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-600" />
                  Statutory Tenders Evaluation Committee (PPA 2007 Sections 21 & 22)
                </h2>
                <p className="text-xs text-stone-500">
                  Registered committee officers responsible for scoring, evaluation narrative approval, and integrity verification.
                </p>
              </div>

              <button
                type="button"
                onClick={handleAddCommitteeMember}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Member
              </button>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">Official Role / Designation</th>
                    <th className="px-3 py-2.5">Officer Name</th>
                    <th className="px-3 py-2.5">Department / Directorate</th>
                    <th className="px-3 py-2.5 text-center w-28">Sign-off Date</th>
                    <th className="px-3 py-2.5 w-12 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {committeeMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-stone-50/50">
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={member.role}
                          onChange={(e) => handleUpdateCommitteeMember(member.id, 'role', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-xs font-bold text-stone-900"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleUpdateCommitteeMember(member.id, 'name', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-xs font-medium text-stone-800"
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={member.department}
                          onChange={(e) => handleUpdateCommitteeMember(member.id, 'department', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-xs text-stone-600"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <input
                          type="date"
                          value={member.signedDate || evaluationDate}
                          onChange={(e) => handleUpdateCommitteeMember(member.id, 'signedDate', e.target.value)}
                          className="w-full bg-white border border-stone-200 rounded px-2 py-1 text-xs text-stone-700 font-mono text-center"
                        />
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveCommitteeMember(member.id)}
                          className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                          title="Remove Member"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Requisition Items Builder */}
          <div className="bg-white rounded-2xl p-6 border border-stone-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    Mandatory Requisition Items & Technical Specifications
                  </h2>
                  <span className="px-2 py-0.5 rounded-sm bg-stone-100 text-stone-700 font-mono text-xs font-semibold border border-stone-200">
                    {reqItems.length} items
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">
                  Official Budget Benchmark Total: <strong className="text-stone-900 font-mono">{formatCurrency(evaluationResult.budgetBenchmarkTotal, currency)}</strong>. Every bidder must price all items listed here to be considered responsive under PPA 2007 Section 32.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleDownloadBlankRfqCsv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs border border-emerald-300 transition-colors"
                  title="Download formatted blank Quotation Schedule to issue to vendors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  Blank RFQ Form (.CSV)
                </button>

                <button
                  type="button"
                  onClick={() => setShowBatchImportModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition-colors"
                  title="Batch paste multiple items from Excel or text"
                >
                  <Upload className="w-3.5 h-3.5 text-stone-600" />
                  Batch Import Items
                </button>

                <button
                  type="button"
                  onClick={handleAddReqItem}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs transition-colors shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Item
                </button>
              </div>
            </div>

            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">#</th>
                    <th className="px-3 py-2.5">Item Description</th>
                    <th className="px-3 py-2.5">Detailed Specification</th>
                    <th className="px-3 py-2.5 w-24">Unit</th>
                    <th className="px-3 py-2.5 w-24 text-right">Required Qty</th>
                    <th className="px-3 py-2.5 w-32 text-right">Budget Benchmark</th>
                    <th className="px-3 py-2.5 w-32 text-right">Line Benchmark</th>
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
                      <td className="px-3 py-2 text-right font-mono font-semibold text-stone-800">
                        {formatCurrency((item.budgetBenchmarkPrice || 0) * item.quantity, currency)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
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

            <div className="flex justify-between items-center pt-2">
              <div className="text-xs text-stone-500 font-mono">
                Total Estimated Expenditure: <span className="font-bold text-stone-900">{formatCurrency(evaluationResult.budgetBenchmarkTotal, currency)}</span>
              </div>

              <button
                type="button"
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
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              Responsive
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-rose-50 text-rose-800 font-bold text-[10px] border border-rose-200">
                              <XCircle className="w-3 h-3 text-rose-600" />
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

                    <div className="flex items-center gap-3 shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectingQuote(q);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold border border-stone-300 transition-colors shadow-2xs"
                        title="Inspect original quotation slip / proforma invoice"
                      >
                        <Eye className="w-3.5 h-3.5 text-stone-600" />
                        <span className="hidden sm:inline">Inspect Slip</span>
                      </button>

                      <div className="text-right">
                        <div className="text-xs text-stone-400 font-medium">Evaluated Landed Cost:</div>
                        <div className="text-base font-black font-mono text-stone-900">
                          {formatCurrency(evalSupplier?.evaluatedCost || q.total, currency)}
                        </div>
                        <div className="text-[10px] text-stone-500">
                          {vatExempt ? 'VAT-Exempt evaluated' : q.vat.isInclusive ? 'VAT 7.5% Included' : '+ 7.5% VAT harmonized'}
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

                      {/* Statutory Preliminary Eligibility Checklist (Pass / Fail) */}
                      <div className="bg-stone-50 border border-stone-200 rounded-xl p-3.5 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200 pb-2">
                          <div>
                            <span className="font-bold text-xs text-stone-900 flex items-center gap-1.5">
                              <FileBadge className="w-3.5 h-3.5 text-amber-600" />
                              Stage 1: Statutory Preliminary Eligibility Examination (PPA 2007 Sec 16(6))
                            </span>
                            <span className="text-[11px] text-stone-500">
                              Mandatory statutory criteria. Any uncertified mandatory certificate results in preliminary disqualification.
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const allPassed: Record<string, boolean> = {};
                                STATUTORY_ELIGIBILITY_CRITERIA.forEach((crit) => {
                                  allPassed[crit.key] = true;
                                });
                                setQuotations(
                                  quotations.map((item) => (item.id === q.id ? { ...item, eligibility: allPassed } : item))
                                );
                              }}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300 transition-colors"
                            >
                              ✓ Mark All Compliant
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
                          {STATUTORY_ELIGIBILITY_CRITERIA.map((crit) => {
                            const isChecked = q.eligibility ? (q.eligibility as any)[crit.key] !== false : true;
                            return (
                              <label
                                key={crit.key}
                                className={`flex items-start gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                                  isChecked
                                    ? 'bg-white border-stone-200 hover:border-emerald-300'
                                    : 'bg-red-50 border-red-300 text-red-900'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    const currentElig = q.eligibility || {};
                                    const updatedElig = { ...currentElig, [crit.key]: e.target.checked };
                                    setQuotations(
                                      quotations.map((item) => (item.id === q.id ? { ...item, eligibility: updatedElig } : item))
                                    );
                                  }}
                                  className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                                />
                                <div className="space-y-0.5 text-[11px]">
                                  <div className="font-bold flex items-center gap-1">
                                    <span>{crit.name}</span>
                                    {crit.isMandatory && <span className="text-red-500 font-bold">*</span>}
                                  </div>
                                  <div className="text-[10px] text-stone-500">{crit.authority}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>

                        {/* Technical Score Input (for QCBS evaluation) */}
                        <div className="pt-2 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-700">Technical Responsiveness Score (QCBS):</span>
                            <input
                              type="number"
                              min={0}
                              max={100}
                              value={q.technicalScore ?? 85}
                              onChange={(e) => {
                                const val = Number(e.target.value);
                                setQuotations(
                                  quotations.map((item) => (item.id === q.id ? { ...item, technicalScore: val } : item))
                                );
                              }}
                              className="w-16 bg-white border border-stone-300 rounded px-2 py-0.5 font-mono font-bold text-stone-900 text-center"
                            />
                            <span className="text-stone-500 font-mono text-[11px]">/ 100 points (Pass threshold: 70)</span>
                          </div>

                          <div className="text-[11px] text-stone-500">
                            Evaluated under BPP Standard Evaluation Manual & PPA 2007
                          </div>
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
              <div className="text-[11px] font-bold text-amber-800 tracking-wider uppercase">
                Official Statutory Recommendation for Contract Award
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-stone-900">
                BID EVALUATION REPORT & FORENSIC QUOTATION AUDIT
              </h1>
              <p className="text-xs sm:text-sm text-stone-600 font-medium max-w-2xl mx-auto">
                {procurementTitle}
              </p>
            </div>

            {/* Statutory Award Winner Banner */}
            {evaluationResult.winner ? (
              <div className="bg-linear-to-r from-emerald-950 via-stone-900 to-stone-950 text-white rounded-2xl p-6 shadow-md border border-emerald-500/40">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
                      <Award className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Statutory Lowest Evaluated Responsive Bidder (PPA 2007)</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">
                      {evaluationResult.winner.quotation.supplierName}
                    </h3>
                    <p className="text-xs text-stone-300">
                      CAC Registration: <strong className="font-mono text-white">{evaluationResult.winner.quotation.rcNumber}</strong> · FIRS TIN: <strong className="font-mono text-white">{evaluationResult.winner.quotation.tin}</strong> · Delivery: <strong className="text-white">{evaluationResult.winner.quotation.deliveryPeriod}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-4">
                    <div className="bg-stone-800/90 rounded-xl p-3.5 border border-stone-700/70 text-right">
                      <div className="text-[10px] uppercase font-bold text-stone-400">Evaluated Landed Cost</div>
                      <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400">
                        {formatCurrency(evaluationResult.winner.evaluatedCost, currency)}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        {evaluationResult.winner.quotation.vat.isInclusive ? 'Inclusive of 7.5% VAT' : 'Harmonized landed cost'}
                      </div>
                    </div>

                    {evaluationResult.savingsVsHighest > 0 && (
                      <div className="bg-emerald-950/70 rounded-xl p-3.5 border border-emerald-700/50 text-right">
                        <div className="text-[10px] uppercase font-bold text-emerald-300 flex items-center justify-end gap-1">
                          <TrendingDown className="w-3.5 h-3.5" />
                          Public Savings vs High
                        </div>
                        <div className="text-lg sm:text-xl font-black font-mono text-emerald-300">
                          {formatCurrency(evaluationResult.savingsVsHighest, currency)}
                        </div>
                        <div className="text-[10px] text-emerald-400 font-medium">
                          {evaluationResult.savingsPct.toFixed(1)}% public expenditure saved
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3.5 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-stone-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Scope Completeness: <strong className="text-white font-mono">{evaluationResult.winner.itemsQuotedCount}/{evaluationResult.winner.itemsRequiredCount}</strong> items</span>
                    <span className="text-stone-500">·</span>
                    <span>Direct Settlement: <strong className="text-white">{evaluationResult.winner.quotation.bank.bankName}</strong></span>
                  </div>

                  {onTransferToContract && (
                    <button
                      onClick={handlePushWinnerToContract}
                      className="no-print inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold text-xs shadow-xs transition-colors"
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

            {/* Policy & Statutory Sensitivity Simulator (Interactive Controls) */}
            <div className="no-print bg-stone-50 border border-stone-200 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-amber-600" />
                  <span className="font-bold text-xs text-stone-900 uppercase tracking-wide">
                    Statutory Evaluation Policy & Sensitivity Simulator
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 hidden sm:inline">PPA 2007 Statutory Parameters</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                {/* Evaluation Methodology */}
                <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1.5 shadow-2xs">
                  <div className="font-bold text-stone-700 flex items-center justify-between">
                    <span>Evaluation Method:</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${evaluationMethod === 'qcbs' ? 'bg-purple-100 text-purple-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {evaluationMethod === 'qcbs' ? 'QCBS (70/30)' : 'LERB (PPA 32)'}
                    </span>
                  </div>
                  <select
                    value={evaluationMethod}
                    onChange={(e) => setEvaluationMethod(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-xs text-stone-900 font-semibold"
                  >
                    <option value="lerb">Lowest Evaluated Responsive Bidder (PPA Goods/Works)</option>
                    <option value="qcbs">QCBS: Quality & Cost Scoring (70% Tech / 30% Fin)</option>
                  </select>
                </div>

                {/* VAT Exemption */}
                <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1.5 shadow-2xs">
                  <div className="font-bold text-stone-700 flex items-center justify-between">
                    <span>VAT Treatment Policy:</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${vatExempt ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'}`}>
                      {vatExempt ? 'VAT-Exempt' : 'Harmonized 7.5%'}
                    </span>
                  </div>
                  <select
                    value={vatExempt ? 'exempt' : 'harmonized'}
                    onChange={(e) => setVatExempt(e.target.value === 'exempt')}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-xs text-stone-900 font-semibold"
                  >
                    <option value="harmonized">Harmonize 7.5% Landed Cost (Statutory PPA)</option>
                    <option value="exempt">0% VAT-Exempt (Donor/Multilateral Projects)</option>
                  </select>
                </div>

                {/* Missing Item Treatment */}
                <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1.5 shadow-2xs">
                  <div className="font-bold text-stone-700 flex items-center justify-between">
                    <span>Missing Items Policy:</span>
                    <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold ${missingItemPolicy === 'disqualify' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {missingItemPolicy === 'disqualify' ? 'Strict Disqualification' : 'PPA 32(3) Load Price'}
                    </span>
                  </div>
                  <select
                    value={missingItemPolicy}
                    onChange={(e) => setMissingItemPolicy(e.target.value as any)}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-xs text-stone-900 font-semibold"
                  >
                    <option value="disqualify">Strict Disqualification (Non-Responsive)</option>
                    <option value="load_highest_price">Load Competing Highest Unit Price (Sec 32(3))</option>
                  </select>
                </div>

                {/* Abnormally Low Bid Sensitivity & Arithmetic Corrections */}
                <div className="bg-white p-3 rounded-xl border border-stone-200 space-y-1.5 shadow-2xs">
                  <div className="font-bold text-stone-700 flex items-center justify-between">
                    <span>ALB Threshold & Arithmetic:</span>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applyArithmeticCorrections}
                        onChange={(e) => setApplyArithmeticCorrections(e.target.checked)}
                        className="rounded text-amber-600 focus:ring-amber-500 w-3 h-3"
                      />
                      <span className="text-[10px] font-bold text-stone-600">PPA 31 Correct</span>
                    </label>
                  </div>
                  <select
                    value={albThresholdPct}
                    onChange={(e) => setAlbThresholdPct(Number(e.target.value))}
                    className="w-full bg-stone-50 border border-stone-300 rounded px-2.5 py-1.5 text-xs text-stone-900 font-semibold"
                  >
                    <option value={15}>ALB: -15% below Budget Benchmark (Strict)</option>
                    <option value={20}>ALB: -20% below Budget Benchmark</option>
                    <option value={25}>ALB: -25% below Budget Benchmark (Standard)</option>
                    <option value={30}>ALB: -30% below Budget Benchmark (Permissive)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Visual Cost Comparison Chart */}
            <div className="space-y-3 bg-white border border-stone-200 rounded-2xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-amber-600" />
                  <h3 className="text-sm font-bold text-stone-900">
                    Visual Tender Landed Cost Comparison vs Budget Benchmark
                  </h3>
                </div>
                <div className="text-xs text-stone-500 font-mono">
                  Official Budget Benchmark: <strong className="text-stone-900 font-bold">{formatCurrency(evaluationResult.budgetBenchmarkTotal, currency)}</strong>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                {evaluationResult.suppliers.map((s) => {
                  const isWinner = evaluationResult.winner?.quotation.id === s.quotation.id;
                  const maxCost = Math.max(
                    evaluationResult.budgetBenchmarkTotal,
                    ...evaluationResult.suppliers.map((sup) => sup.evaluatedCost)
                  );
                  const widthPct = maxCost > 0 ? Math.min(100, Math.max(15, (s.evaluatedCost / maxCost) * 100)) : 50;

                  return (
                    <div key={s.quotation.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center font-mono text-[10px] font-bold ${
                              isWinner
                                ? 'bg-emerald-600 text-white'
                                : s.isResponsive
                                ? 'bg-stone-800 text-stone-100'
                                : 'bg-rose-100 text-rose-700'
                            }`}
                          >
                            {s.rank}
                          </span>
                          <span className="font-bold text-stone-900">{s.quotation.supplierName}</span>
                          {isWinner && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              ★ RECOMMENDED WINNER
                            </span>
                          )}
                          {!s.isResponsive && (
                            <span className="px-1.5 py-0.5 rounded-sm bg-rose-50 text-rose-700 text-[10px] font-bold border border-rose-200">
                              Disqualified
                            </span>
                          )}
                        </div>
                        <div className="font-mono font-bold text-stone-900">
                          {formatCurrency(s.evaluatedCost, currency)}
                        </div>
                      </div>

                      <div className="w-full bg-stone-100 h-2.5 rounded-md overflow-hidden flex items-center">
                        <div
                          className={`h-full transition-all duration-500 rounded-xs ${
                            isWinner
                              ? 'bg-emerald-600'
                              : s.isResponsive
                              ? 'bg-amber-600'
                              : 'bg-rose-400'
                          }`}
                          style={{ width: `${widthPct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}

                {/* Benchmark Indicator Footnote */}
                <div className="pt-2 border-t border-dashed border-stone-200 flex flex-wrap items-center justify-between gap-2 text-[11px] text-stone-500 font-mono">
                  <span>Planned Budget: {formatCurrency(evaluationResult.budgetBenchmarkTotal, currency)}</span>
                  <span>Median Tender: {formatCurrency(evaluationResult.medianEvaluatedCost, currency)}</span>
                  {evaluationResult.winner && (
                    <span className="text-emerald-700 font-bold">
                      Winner Margin: {evaluationResult.savingsPct.toFixed(1)}% savings vs highest tender
                    </span>
                  )}
                </div>
              </div>
            </div>

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
                      {evaluationMethod === 'qcbs' && (
                        <th className="px-3 py-2.5 text-center">QCBS Combined Score</th>
                      )}
                      <th className="px-3 py-2.5 text-center">Scope Quoted</th>
                      <th className="px-3 py-2.5 text-center">Responsiveness</th>
                      <th className="px-3 py-2.5 text-center">Document</th>
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
                              <span className="font-bold text-emerald-800 flex items-center gap-1 font-mono text-xs">
                                ★ Rank 1
                              </span>
                            ) : (
                              <span className="font-mono text-stone-600 text-xs">Rank {s.rank}</span>
                            )}
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-bold text-stone-900">{s.quotation.supplierName}</div>
                            <div className="text-[10px] text-stone-500">{s.quotation.address}</div>
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="font-mono text-[11px] text-stone-800">
                              {s.quotation.rcNumber || <span className="text-rose-600 font-bold">Missing RC#</span>}
                            </div>
                            <div className="font-mono text-[10px] text-stone-500">
                              {s.quotation.tin || <span className="text-rose-600">Missing TIN</span>}
                            </div>
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-medium text-stone-800">
                            <div>{formatCurrency(s.baseCost, currency)}</div>
                            {s.lineSumDifference > 0 && applyArithmeticCorrections && (
                              <div
                                className="text-[9px] text-amber-700 font-bold"
                                title={s.arithmeticNotes.join('; ')}
                              >
                                PPA 31: ₦{s.lineSumDifference.toLocaleString()} corrected
                              </div>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {vatExempt ? (
                              <span className="text-stone-600 text-[11px] font-medium">
                                0% Exempt
                              </span>
                            ) : s.quotation.vat.isInclusive ? (
                              <span className="text-stone-700 text-[11px] font-medium">
                                7.5% Included
                              </span>
                            ) : (
                              <span className="text-amber-800 text-[11px] font-medium font-mono">
                                +₦{s.vatAdded.toLocaleString()}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-right font-mono font-bold text-stone-950 text-sm">
                            {formatCurrency(s.evaluatedCost, currency)}
                          </td>
                          {evaluationMethod === 'qcbs' && (
                            <td className="px-3 py-2.5 text-center font-mono">
                              {s.combinedScore !== undefined ? (
                                <div>
                                  <span className="font-black text-purple-900 text-xs">
                                    {s.combinedScore.toFixed(1)}
                                  </span>
                                  <span className="block text-[9px] text-purple-700">
                                    T:{s.technicalScore} · F:{s.financialScore?.toFixed(1)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-stone-400">-</span>
                              )}
                            </td>
                          )}
                          <td className="px-3 py-2.5 text-center font-mono text-xs">
                            <span
                              className={`font-semibold ${
                                s.itemsQuotedCount === s.itemsRequiredCount
                                  ? 'text-emerald-700'
                                  : 'text-rose-700 font-bold'
                              }`}
                            >
                              {s.itemsQuotedCount}/{s.itemsRequiredCount} ({Math.round(s.completenessPct)}%)
                            </span>
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            {s.isResponsive ? (
                              <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                Responsive
                              </span>
                            ) : (
                              <span
                                className="inline-flex items-center gap-1 text-rose-700 font-bold text-[11px]"
                                title={s.blocks.join(' | ')}
                              >
                                <XCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                                Disqualified
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2.5 text-center">
                            <button
                              type="button"
                              onClick={() => setInspectingQuote(s.quotation)}
                              className="no-print inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 hover:text-stone-950 text-[11px] font-semibold transition-colors"
                              title="Inspect original quotation slip"
                            >
                              <Eye className="w-3 h-3 text-stone-600" />
                              Slip
                            </button>
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

            {/* 3b. Abnormally Low Bid (ALB) & Price Realism Alert Matrix */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  3b. Price Realism & Abnormally Low Bid (ALB) Detection Matrix
                </h3>
                <span className="text-[11px] text-stone-500 font-mono">
                  PPA 2007 Section 34 & FIDIC Clause 13.8 Standard
                </span>
              </div>

              {evaluationResult.albWarnings.length === 0 ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <div className="text-xs text-emerald-800">
                    <strong>Price Realism Clearance:</strong> All submitted unit rates fall within standard commercial market variance tolerances (-{albThresholdPct}% to +35% of official MDA benchmark). No predatory pricing or substandard risk detected.
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto border border-amber-200 rounded-xl bg-amber-50/30">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-amber-100/70 border-b border-amber-200 text-amber-900 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-3 py-2.5">Bidder</th>
                        <th className="px-3 py-2.5">Quoted Line Item</th>
                        <th className="px-3 py-2.5 text-right">Quoted Rate ({currency})</th>
                        <th className="px-3 py-2.5 text-right">Budget Benchmark ({currency})</th>
                        <th className="px-3 py-2.5 text-center">Variance</th>
                        <th className="px-3 py-2.5">Statutory Audit Assessment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-amber-100 bg-white">
                      {evaluationResult.albWarnings.map((w, wIdx) => (
                        <tr key={wIdx} className="hover:bg-amber-50/40">
                          <td className="px-3 py-2 font-bold text-stone-900">{w.supplierName}</td>
                          <td className="px-3 py-2 font-medium text-stone-800">{w.itemName}</td>
                          <td className="px-3 py-2 text-right font-mono font-bold text-stone-900">
                            {formatCurrency(w.unitPrice, currency)}
                          </td>
                          <td className="px-3 py-2 text-right font-mono text-stone-600">
                            {formatCurrency(w.benchmarkPrice, currency)}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <span
                              className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border ${
                                w.severity === 'abnormally_low'
                                  ? 'bg-rose-50 text-rose-800 border-rose-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {w.severity === 'abnormally_low' ? `-${w.variancePct}% Low` : `+${w.variancePct}% High`}
                            </span>
                          </td>
                          <td className="px-3 py-2 text-stone-700 text-[11px]">{w.reason}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
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
                  type="button"
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

            {/* Statutory Sign-off Attendance Register */}
            <div className="space-y-4 border-t border-stone-200 pt-6">
              <h3 className="text-sm font-bold text-stone-900 flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-600" />
                5. Tenders Evaluation Committee Sign-Off & Attendance Register (PPA 2007)
              </h3>

              <div className="overflow-x-auto border border-stone-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-50 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-3 py-2.5">Committee Designation</th>
                      <th className="px-3 py-2.5">Official Name</th>
                      <th className="px-3 py-2.5">Directorate / Authority</th>
                      <th className="px-3 py-2.5 text-center">Status</th>
                      <th className="px-3 py-2.5 text-right">Signature & Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 bg-white">
                    {committeeMembers.map((m) => (
                      <tr key={m.id} className="hover:bg-stone-50/50">
                        <td className="px-3 py-2.5 font-bold text-stone-900">{m.role}</td>
                        <td className="px-3 py-2.5 font-medium text-stone-800">{m.name}</td>
                        <td className="px-3 py-2.5 text-stone-600">{m.department}</td>
                        <td className="px-3 py-2.5 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Confirmed
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono text-[11px] text-stone-600">
                          <span className="italic font-serif">Verified Digital Seal</span> • {m.signedDate || evaluationDate}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Executive Dual Endorsement */}
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
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
          </div>

          {/* Action Bar (Print, Word, CSV, Back) */}
          <div className="no-print flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveStep('quotations')}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs transition-colors"
              >
                Back to Quotations Edit
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {evaluationResult.winner && (
                <button
                  type="button"
                  onClick={() => setShowAwardLetterModal(true)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs shadow-xs transition-colors"
                  title="Generate official Notification of Provisional Award Letter for winning contractor"
                >
                  <Award className="w-4 h-4 text-stone-950" />
                  Award Letter (LPO)
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  const nonWinners = evaluationResult.suppliers.filter(
                    (s) => s.quotation.id !== evaluationResult.winner?.quotation.id
                  );
                  if (nonWinners.length > 0 && !selectedDebriefId) {
                    setSelectedDebriefId(nonWinners[0].quotation.id);
                  }
                  setShowDebriefModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 font-bold text-xs border border-stone-300 transition-colors"
                title="Generate formal debriefing and regret letters for unsuccessful bidders"
              >
                <Mail className="w-4 h-4 text-stone-700" />
                Debriefing Notice
              </button>

              <button
                type="button"
                onClick={handleExportCsv}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold text-xs border border-emerald-300 transition-colors"
                title="Export item-by-item comparative matrix as spreadsheet CSV"
              >
                <FileDown className="w-4 h-4 text-emerald-700" />
                Export Matrix (.CSV)
              </button>

              <button
                type="button"
                onClick={handleExportWord}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs border border-blue-200 transition-colors"
              >
                <Download className="w-4 h-4 text-blue-600" />
                Export Word Document (.doc)
              </button>

              <button
                type="button"
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

      {/* Quotation Document Slip Inspector Modal */}
      {inspectingQuote && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto border border-stone-200">
            {/* Modal Controls */}
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-sm bg-amber-50 text-amber-900 font-mono font-bold text-[10px] uppercase border border-amber-200">
                  Audited Tender Submission Document
                </span>
                <span className="text-xs text-stone-500 font-mono">Ref: {inspectingQuote.quoteRef}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Slip
                </button>
                <button
                  type="button"
                  onClick={() => setInspectingQuote(null)}
                  className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-sm transition-colors"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Official Supplier Letterhead */}
            <div className="border-b-2 border-stone-800 pb-5 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <h2 className="text-xl font-black text-stone-900 tracking-tight uppercase">
                    {inspectingQuote.supplierName}
                  </h2>
                  <p className="text-xs text-stone-600 max-w-md">{inspectingQuote.address}</p>
                  <div className="text-[11px] text-stone-500 font-mono mt-1 space-x-3">
                    <span>Tel: {inspectingQuote.phone}</span>
                    <span>Email: {inspectingQuote.email}</span>
                  </div>
                </div>

                <div className="text-right text-xs space-y-1 bg-stone-50 p-3 rounded-xl border border-stone-200 shrink-0">
                  <div>CAC Reg: <strong className="font-mono text-stone-900">{inspectingQuote.rcNumber || 'NOT STATED'}</strong></div>
                  <div>FIRS TIN: <strong className="font-mono text-stone-900">{inspectingQuote.tin || 'NOT STATED'}</strong></div>
                  <div>Settlement Bank: <strong className="text-stone-900">{inspectingQuote.bank.bankName}</strong></div>
                  <div>Account No: <strong className="font-mono text-stone-900">{inspectingQuote.bank.accountNumber}</strong></div>
                </div>
              </div>
            </div>

            {/* Document Header Details */}
            <div className="text-center py-2 bg-stone-50 rounded-xl border border-stone-200 space-y-0.5">
              <div className="text-[10px] font-bold uppercase tracking-widest text-amber-800">
                Official Commercial Quotation & Proforma Invoice
              </div>
              <h3 className="text-base font-black text-stone-900">
                {procurementTitle}
              </h3>
              <div className="text-xs text-stone-600 font-medium">
                Buyer / Procuring Entity: <strong>{orgName}</strong> | Date: <strong>{inspectingQuote.quoteDate}</strong> | Validity: <strong>{inspectingQuote.validity}</strong>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="overflow-x-auto border border-stone-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-100 border-b border-stone-200 text-stone-700 font-bold uppercase text-[10px]">
                  <tr>
                    <th className="px-3 py-2.5">#</th>
                    <th className="px-3 py-2.5">Item Description</th>
                    <th className="px-3 py-2.5">Quoted Technical Specification</th>
                    <th className="px-3 py-2.5 text-center">Unit</th>
                    <th className="px-3 py-2.5 text-right">Qty</th>
                    <th className="px-3 py-2.5 text-right">Unit Price ({inspectingQuote.currency})</th>
                    <th className="px-3 py-2.5 text-right">Line Total ({inspectingQuote.currency})</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {inspectingQuote.items.map((it, idx) => (
                    <tr key={it.id} className="hover:bg-stone-50/50">
                      <td className="px-3 py-2 font-mono text-stone-400">{idx + 1}</td>
                      <td className="px-3 py-2 font-bold text-stone-900">{it.name}</td>
                      <td className="px-3 py-2 text-stone-600 text-[11px]">
                        {it.specification}
                        {it.sourcePageNote && (
                          <span className="block text-[10px] text-stone-400 italic">[{it.sourcePageNote}]</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center text-stone-700">{it.unit}</td>
                      <td className="px-3 py-2 text-right font-mono font-semibold">{it.quantity}</td>
                      <td className="px-3 py-2 text-right font-mono text-stone-800">
                        {formatCurrency(it.unitPrice, inspectingQuote.currency)}
                      </td>
                      <td className="px-3 py-2 text-right font-mono font-bold text-stone-950">
                        {formatCurrency(it.amount, inspectingQuote.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-stone-50 font-semibold border-t-2 border-stone-300 text-stone-900">
                  <tr>
                    <td colSpan={6} className="px-3 py-2 text-right">
                      Quoted Subtotal:
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold">
                      {formatCurrency(inspectingQuote.subtotal, inspectingQuote.currency)}
                    </td>
                  </tr>
                  <tr>
                    <td colSpan={6} className="px-3 py-1.5 text-right text-stone-600 text-xs font-normal">
                      Value Added Tax (7.5% VAT):
                    </td>
                    <td className="px-3 py-1.5 text-right font-mono text-stone-600">
                      {inspectingQuote.vat.isInclusive
                        ? 'Included in Quoted Price'
                        : `+ ${formatCurrency((inspectingQuote.subtotal * (inspectingQuote.vat.rate || 7.5)) / 100, inspectingQuote.currency)}`}
                    </td>
                  </tr>
                  <tr className="bg-stone-100 font-bold text-stone-950 text-sm">
                    <td colSpan={6} className="px-3 py-2.5 text-right">
                      Total Commercial Quotation:
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono text-base font-black text-stone-950">
                      {formatCurrency(inspectingQuote.total, inspectingQuote.currency)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Commercial Terms & Digital Seal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
              <div className="bg-stone-50 p-4 rounded-xl border border-stone-200 space-y-1">
                <div className="font-bold text-stone-800 uppercase text-[10px]">Commercial & Warranty Terms:</div>
                <div>• Delivery Period: <strong>{inspectingQuote.deliveryPeriod}</strong></div>
                <div>• Payment Terms: <strong>{inspectingQuote.paymentTerms}</strong></div>
                <div>• Warranty Coverage: <strong>{inspectingQuote.warranty}</strong></div>
                {inspectingQuote.notes.length > 0 && (
                  <div className="pt-1 text-[11px] text-stone-500">
                    Notes: {inspectingQuote.notes.join('; ')}
                  </div>
                )}
              </div>

              <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-200/80 flex flex-col justify-between">
                <div>
                  <div className="font-bold text-emerald-950 uppercase text-[10px]">Authorized Executive Signatory:</div>
                  <div className="text-sm font-bold text-stone-900 mt-1">{inspectingQuote.signatory}</div>
                  <div className="text-[11px] text-emerald-800 font-mono">Company Seal & Digital Verification Cleared</div>
                </div>
                <div className="mt-4 pt-2 border-t border-emerald-200 text-[10px] text-stone-500 font-mono flex items-center justify-between">
                  <span>Audit Hash: SHA-256 Verified</span>
                  <span>PPA 2007 Compliant Tender</span>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setInspectingQuote(null)}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Import Requisition Items Modal */}
      {showBatchImportModal && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-base text-stone-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-amber-600" />
                Batch Import Requisition Items
              </h3>
              <button
                type="button"
                onClick={() => setShowBatchImportModal(false)}
                className="text-stone-400 hover:text-stone-700 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 flex-1 overflow-y-auto text-xs">
              <p className="text-stone-600">
                Paste rows from Excel, Word, or text files. Separate columns with <strong>Tab</strong>, <strong>Pipe (|)</strong>, or <strong>Comma (,)</strong>.
              </p>

              <div className="bg-stone-50 p-2.5 rounded-lg border border-stone-200 font-mono text-[11px] text-stone-700">
                <strong>Format:</strong> Description | Technical Specification | Unit | Quantity | Budget Benchmark
              </div>

              <textarea
                rows={8}
                value={batchImportText}
                onChange={(e) => setBatchImportText(e.target.value)}
                placeholder={`Safety Helmet | EN397 standard white with chin strap | pcs | 120 | 7000\nHeavy Duty Work Gloves | Level 5 cut resistant nitrile palm | pairs | 200 | 6500\nSafety Spectacles | Polycarbonate anti-scratch UV400 | pcs | 120 | 4000`}
                className="w-full bg-stone-50 border border-stone-300 rounded-xl p-3 font-mono text-xs text-stone-900 focus:outline-hidden focus:border-amber-500"
              />

              <div className="flex justify-between items-center">
                <button
                  type="button"
                  onClick={() =>
                    setBatchImportText(
                      `Solar PV Panels 450W | Monocrystalline Tier 1 | pcs | 48 | 115000\nHybrid Inverter 15kVA | Pure sine wave three phase MPPT | units | 2 | 2850000\nLiFePO4 Battery 10kWh | 51.2V 200Ah Rack mount | units | 4 | 3400000\nPV DC Cable 6mm² | 500m drum double insulated | drums | 3 | 320000`
                    )
                  }
                  className="text-xs text-amber-700 hover:text-amber-800 font-semibold"
                >
                  Paste Sample Data
                </button>
              </div>
            </div>

            <div className="border-t pt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowBatchImportModal(false)}
                className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleProcessBatchImport}
                className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
              >
                Parse & Populate Items
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

      {/* Official Provisional Letter of Award Modal */}
      {showAwardLetterModal && evaluationResult.winner && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto border border-stone-200">
            {/* Modal Top Bar */}
            <div className="no-print flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-sm bg-emerald-50 text-emerald-900 font-mono font-bold text-[11px] uppercase flex items-center gap-1.5 border border-emerald-200">
                  <Award className="w-3.5 h-3.5 text-emerald-700" />
                  Statutory Contract Award Dossier
                </span>
                <span className="text-xs text-stone-500 font-mono">PPA 2007 Sec 33</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  Print Letter
                </button>
                <button
                  type="button"
                  onClick={() => setShowAwardLetterModal(false)}
                  className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-sm transition-colors"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Letterhead */}
            <div className="border-b-2 border-stone-900 pb-5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <AfriProcureLogo size="lg" variant="badge" />
                <div>
                  <h2 className="text-lg font-black text-stone-950 uppercase tracking-tight">{orgName}</h2>
                  <p className="text-xs text-stone-600 font-semibold uppercase">
                    DIRECTORATE OF PROCUREMENT • TENDERS BOARD SECRETARIAT
                  </p>
                  <p className="text-[11px] text-stone-500">
                    Federal Republic of Nigeria • Statutory Public Procurement Act 2007
                  </p>
                </div>
              </div>

              <div className="text-right text-xs space-y-0.5 shrink-0 font-mono">
                <div>Ref: <strong className="text-stone-900">AWD/{reportRef}</strong></div>
                <div>Date: <strong className="text-stone-900">{evaluationDate}</strong></div>
                <div>Standstill Period: <strong className="text-amber-800">14 Calendar Days</strong></div>
              </div>
            </div>

            {/* Recipient Address */}
            <div className="space-y-1 text-xs text-stone-800">
              <div className="font-bold text-stone-900 text-sm">{evaluationResult.winner.quotation.supplierName}</div>
              <div>{evaluationResult.winner.quotation.address}</div>
              <div className="font-mono text-stone-600">
                CAC RC: {evaluationResult.winner.quotation.rcNumber} | FIRS TIN: {evaluationResult.winner.quotation.tin}
              </div>
              <div className="font-medium pt-1">
                <strong>Attention:</strong> {evaluationResult.winner.quotation.signatory} (Authorized Representative)
              </div>
            </div>

            {/* Subject */}
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
              <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-amber-800">
                OFFICIAL NOTIFICATION OF INTENTION TO AWARD / PROVISIONAL ACCEPTANCE
              </div>
              <h3 className="text-sm font-black text-stone-950 uppercase">
                CONTRACT AWARD FOR: {procurementTitle}
              </h3>
              <div className="text-xs text-stone-600 font-mono">
                Tender Ref: {requisitionRef} | Evaluation Report Ref: {reportRef}
              </div>
            </div>

            {/* Body Text */}
            <div className="space-y-3 text-xs text-stone-800 leading-relaxed">
              <p>
                Dear Sir/Madam,
              </p>
              <p>
                We are pleased to inform you that following the formal Bid Evaluation exercise concluded on <strong>{evaluationDate}</strong> by the Tenders Evaluation Committee in accordance with Section 32 and Section 33 of the Public Procurement Act (PPA 2007), your company has emerged as the <strong>Lowest Evaluated Responsive Bidder</strong> for the execution of the above-referenced contract.
              </p>
              <p>
                The contract has been provisionally awarded to your firm in the total evaluated landed amount of:
              </p>
              <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center space-y-1">
                <div className="text-xs font-bold uppercase text-emerald-900 tracking-wide">
                  Total Awarded Contract Sum ({currency})
                </div>
                <div className="text-2xl font-black font-mono text-emerald-950">
                  {formatFullCurrency(evaluationResult.winner.evaluatedCost, currency)}
                </div>
                <div className="text-[11px] text-emerald-800 font-medium">
                  {evaluationResult.winner.quotation.vat.isInclusive
                    ? '(Inclusive of Statutory 7.5% Value Added Tax and all Landed Logistics)'
                    : '(Harmonized Landed Valuation under PPA 2007)'}
                </div>
              </div>

              {/* Award Terms & Conditions */}
              <div className="space-y-2 pt-2">
                <div className="font-bold text-stone-900 text-xs uppercase tracking-wide">
                  Commercial Terms & Execution Schedule:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 font-mono text-[11px]">
                  <div>• Scope of Delivery: <strong>{evaluationResult.winner.itemsQuotedCount} line items complete</strong></div>
                  <div>• Delivery Period: <strong>{evaluationResult.winner.quotation.deliveryPeriod}</strong></div>
                  <div>• Payment Terms: <strong>{evaluationResult.winner.quotation.paymentTerms}</strong></div>
                  <div>• Warranty Period: <strong>{evaluationResult.winner.quotation.warranty}</strong></div>
                  <div>• Settlement Bank: <strong>{evaluationResult.winner.quotation.bank.bankName}</strong></div>
                  <div>• Bank Account No: <strong>{evaluationResult.winner.quotation.bank.accountNumber}</strong></div>
                </div>
              </div>

              {/* Statutory Standstill Notice */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3.5 space-y-1 text-amber-950">
                <div className="font-bold flex items-center gap-1.5 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Mandatory Statutory Standstill Period (14 Calendar Days)
                </div>
                <p className="text-[11px] leading-relaxed">
                  Pursuant to national procurement transparency standards, this notification does not constitute a final binding contract until the expiration of the mandatory <strong>14-day Standstill Period</strong> ending on <strong>{new Date(Date.now() + 14 * 86400000).toLocaleDateString()}</strong>. This period allows participating bidders to request statutory debriefing or file administrative petitions under PPA 2007 Section 54.
                </p>
              </div>

              {/* Conditions Precedent */}
              <div className="space-y-1 pt-1 text-[11px]">
                <div className="font-bold text-stone-900">Conditions Precedent to Formal Contract Signing:</div>
                <ol className="list-decimal pl-5 space-y-0.5 text-stone-700">
                  <li>Written Acceptance of this Provisional Award within seven (7) working days of receipt.</li>
                  <li>Submission of a 10% Performance Security from a reputable commercial bank or insurance firm.</li>
                  <li>Verification of current Tax Clearance Certificate (TCC) and execution of the statutory Integrity Pact.</li>
                </ol>
              </div>
            </div>

            {/* Signature Blocks */}
            <div className="pt-6 border-t border-stone-200 grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
              <div className="space-y-3">
                <div className="font-bold text-stone-700 uppercase text-[10px]">Issued By:</div>
                <div className="pt-8 border-b border-stone-300 w-4/5"></div>
                <div>
                  <div className="font-bold text-stone-900">{preparedBy}</div>
                  <div className="text-stone-500 text-[11px]">Procurement Lead / Head of Tenders Board</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="font-bold text-stone-700 uppercase text-[10px]">Approved By (Accounting Officer):</div>
                <div className="pt-8 border-b border-stone-300 w-4/5"></div>
                <div>
                  <div className="font-bold text-stone-900">{reviewedBy}</div>
                  <div className="text-stone-500 text-[11px]">Director-General / Permanent Secretary</div>
                </div>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAwardLetterModal(false)}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
              >
                Close Award Letter
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Official Debriefing & Regret Notice Modal */}
      {showDebriefModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[92vh] overflow-y-auto border border-stone-200">
            {/* Modal Controls */}
            <div className="no-print flex items-center justify-between border-b pb-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-sm bg-stone-100 text-stone-900 font-mono font-bold text-[11px] uppercase flex items-center gap-1.5 border border-stone-300">
                  <Mail className="w-3.5 h-3.5 text-amber-600" />
                  Statutory Debriefing & Regret Notice
                </span>
                <span className="text-xs text-stone-500 font-mono">PPA 2007 Sec 54</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-amber-400" />
                  Print Notice
                </button>
                <button
                  type="button"
                  onClick={() => setShowDebriefModal(false)}
                  className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-sm transition-colors"
                  aria-label="Close modal"
                >
                  ×
                </button>
              </div>
            </div>

            {/* Select Unsuccessful Bidder */}
            <div className="no-print bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1.5">
              <label className="block text-xs font-bold text-stone-700">
                Select Addressee (Unsuccessful Participating Tenderer):
              </label>
              <select
                value={selectedDebriefId}
                onChange={(e) => setSelectedDebriefId(e.target.value)}
                className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-xs font-bold text-stone-900"
              >
                {evaluationResult.suppliers
                  .filter((s) => s.quotation.id !== evaluationResult.winner?.quotation.id)
                  .map((s) => (
                    <option key={s.quotation.id} value={s.quotation.id}>
                      {s.quotation.supplierName} — Rank {s.rank} ({s.isResponsive ? 'Responsive' : 'Disqualified'}) — Landed: ₦{s.evaluatedCost.toLocaleString()}
                    </option>
                  ))}
              </select>
            </div>

            {/* Letterhead */}
            {(() => {
              const targetSup =
                evaluationResult.suppliers.find((s) => s.quotation.id === selectedDebriefId) ||
                evaluationResult.suppliers.find((s) => s.quotation.id !== evaluationResult.winner?.quotation.id);

              if (!targetSup) {
                return <div className="text-center py-6 text-stone-500">No unsuccessful bidders to debrief.</div>;
              }

              const winner = evaluationResult.winner;
              const priceDiff = winner ? targetSup.evaluatedCost - winner.evaluatedCost : 0;

              return (
                <div className="space-y-5">
                  <div className="border-b-2 border-stone-900 pb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-black text-stone-950 uppercase">{orgName}</h2>
                      <p className="text-[11px] text-stone-600 font-semibold uppercase">
                        TENDERS BOARD SECRETARIAT • DEBRIEFING OFFICE
                      </p>
                    </div>
                    <div className="text-right text-xs font-mono">
                      <div>Ref: <strong>DBR/{reportRef}/{targetSup.quotation.rcNumber || 'TND'}</strong></div>
                      <div>Date: <strong>{evaluationDate}</strong></div>
                    </div>
                  </div>

                  {/* Addressee */}
                  <div className="text-xs text-stone-800 space-y-0.5">
                    <div className="font-bold text-stone-900">{targetSup.quotation.supplierName}</div>
                    <div>{targetSup.quotation.address}</div>
                    <div className="font-mono text-stone-600">CAC RC: {targetSup.quotation.rcNumber}</div>
                    <div className="pt-1">
                      <strong>Attention:</strong> {targetSup.quotation.signatory}
                    </div>
                  </div>

                  {/* Title */}
                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
                    <div className="text-[10px] font-bold uppercase text-stone-500 font-mono">
                      STATUTORY NOTIFICATION OF OUTCOME OF BID EVALUATION
                    </div>
                    <div className="font-bold text-xs text-stone-900">
                      TENDER FOR: {procurementTitle} (Ref: {requisitionRef})
                    </div>
                  </div>

                  {/* Body */}
                  <div className="space-y-3 text-xs text-stone-800 leading-relaxed">
                    <p>
                      Dear Sir/Madam,
                    </p>
                    <p>
                      Thank you for participating in the tender exercise for the above-referenced procurement. We wish to inform you that the evaluation of all submitted bids has been concluded in accordance with the provisions of the Public Procurement Act (PPA 2007).
                    </p>
                    <p>
                      We regret to inform you that on this occasion, your quotation was not recommended for contract award. In compliance with statutory procurement transparency guidelines, please find below the debriefing assessment of your submission:
                    </p>

                    {/* Comparative Finding Box */}
                    <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2 font-mono text-[11px]">
                      <div className="flex justify-between border-b pb-1.5">
                        <span className="text-stone-600">Your Evaluated Tender Rank:</span>
                        <strong className="text-stone-900">Rank {targetSup.rank} of {evaluationResult.totalBidsCount} bidders</strong>
                      </div>
                      <div className="flex justify-between border-b pb-1.5">
                        <span className="text-stone-600">Your Evaluated Landed Cost:</span>
                        <strong className="text-stone-900">{formatCurrency(targetSup.evaluatedCost, currency)}</strong>
                      </div>
                      {winner && (
                        <>
                          <div className="flex justify-between border-b pb-1.5">
                            <span className="text-stone-600">Recommended Winning Contractor:</span>
                            <strong className="text-emerald-800">{winner.quotation.supplierName}</strong>
                          </div>
                          <div className="flex justify-between border-b pb-1.5">
                            <span className="text-stone-600">Winning Evaluated Landed Cost:</span>
                            <strong className="text-emerald-800">{formatCurrency(winner.evaluatedCost, currency)}</strong>
                          </div>
                          {priceDiff > 0 && (
                            <div className="flex justify-between border-b pb-1.5">
                              <span className="text-stone-600">Variance vs Winning Tender:</span>
                              <strong className="text-amber-800">+{formatCurrency(priceDiff, currency)} higher</strong>
                            </div>
                          )}
                        </>
                      )}
                      <div className="flex justify-between pt-1">
                        <span className="text-stone-600">Responsiveness Verdict:</span>
                        <strong className={targetSup.isResponsive ? 'text-emerald-700' : 'text-red-700'}>
                          {targetSup.isResponsive ? 'Fully Responsive (Higher Landed Cost)' : 'Statutory Disqualification'}
                        </strong>
                      </div>
                    </div>

                    {/* Detailed Reason Notes */}
                    <div className="space-y-1">
                      <div className="font-bold text-stone-900 text-xs">Specific Statutory Audit Findings:</div>
                      {targetSup.blocks.length > 0 ? (
                        <div className="bg-red-50 p-3 rounded-lg border border-red-200 text-red-900 space-y-1 text-[11px]">
                          {targetSup.blocks.map((b, bIdx) => (
                            <div key={bIdx}>• {b}</div>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 text-emerald-900 text-[11px]">
                          • Your tender met all preliminary eligibility and technical specifications. However, the contract was recommended to the lowest evaluated responsive bidder in strict accordance with Section 32 of PPA 2007.
                        </div>
                      )}
                    </div>

                    {/* Standstill Notice & Rights */}
                    <p className="text-[11px] text-stone-600 pt-2 border-t">
                      Please be advised that in accordance with statutory regulations, a mandatory <strong>14-day Standstill Period</strong> is currently observed. Participating tenderers who have grounds to believe procurement rules were violated may file an administrative review request with the Accounting Officer within this window.
                    </p>
                    <p>
                      We thank you for the time and effort invested in submitting your quotation and look forward to your participation in future tenders.
                    </p>
                  </div>

                  {/* Sign-off */}
                  <div className="pt-6 border-t grid grid-cols-2 gap-4 text-xs">
                    <div>
                      <div className="pt-6 border-b border-stone-300 w-3/4"></div>
                      <div className="font-bold text-stone-900 mt-1">{preparedBy}</div>
                      <div className="text-stone-500 text-[11px]">Head of Procurement</div>
                    </div>
                  </div>
                </div>
              );
            })()}

            <div className="border-t pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowDebriefModal(false)}
                className="px-5 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs"
              >
                Close Debriefing Notice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
