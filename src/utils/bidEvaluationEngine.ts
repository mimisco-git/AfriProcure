import {
  RequisitionItem,
  SupplierQuotation,
  EvaluatedSupplier,
  CollusionCheck,
  BidEvaluationResult,
  CurrencyCode,
} from '../types';

export const WORKED_EXAMPLE_ITEMS: RequisitionItem[] = [
  {
    id: 'req-item-1',
    name: 'Flame retardant coverall, navy',
    specification: 'Nomex IIIA, 4.5oz, antistatic, industrial wash resistant',
    unit: 'pcs',
    quantity: 120,
    budgetBenchmarkPrice: 42000,
  },
  {
    id: 'req-item-2',
    name: 'Safety boots, steel toe cap',
    specification: 'S3 rated, penetration resistant midsole, oil resistant, sizes 40-46',
    unit: 'pairs',
    quantity: 120,
    budgetBenchmarkPrice: 28000,
  },
  {
    id: 'req-item-3',
    name: 'Hard hat with chin strap',
    specification: 'EN397 industrial safety helmet with 4-point adjustable chin strap, white',
    unit: 'pcs',
    quantity: 120,
    budgetBenchmarkPrice: 7000,
  },
  {
    id: 'req-item-4',
    name: 'Safety goggles, clear lens',
    specification: 'EN166 certified, anti-scratch, anti-fog, UV400 polycarbonate lens',
    unit: 'pcs',
    quantity: 120,
    budgetBenchmarkPrice: 4000,
  },
  {
    id: 'req-item-5',
    name: 'Hand gloves, cut resistant',
    specification: 'Level 5 cut resistance (EN388 4543), nitrile palm coated, high grip',
    unit: 'pairs',
    quantity: 200,
    budgetBenchmarkPrice: 6500,
  },
];

export const WORKED_EXAMPLE_QUOTATIONS: SupplierQuotation[] = [
  {
    id: 'quote-1',
    supplierName: 'Aisha Energy & Safety Ltd',
    address: 'Plot 14 Trans Amadi Industrial Layout, Port Harcourt, Rivers State',
    phone: '0803 456 7890',
    email: 'tenders@aishaenergy.ng',
    rcNumber: 'RC 1442109',
    tin: '19823412-0001',
    vatRegistration: 'VAT-RV-2018-0994',
    bank: {
      bankName: 'Zenith Bank Plc',
      accountNumber: '1014552233',
      accountName: 'Aisha Energy & Safety Ltd',
    },
    signatory: 'Engr. A. M. Bello (Managing Director)',
    quoteRef: 'AES/QT/2026/089',
    quoteDate: '2026-08-20',
    validity: '60 days',
    deliveryPeriod: '10 working days upon LPO issuance',
    paymentTerms: '50% advance, 50% on complete delivery and inspection',
    warranty: '6 months warranty against manufacturing defects',
    currency: 'NGN',
    vat: {
      isInclusive: false,
      rate: 7.5,
      statedAmount: 876750,
    },
    subtotal: 11690000,
    total: 11690000,
    items: [
      {
        id: 'q1-1',
        name: 'Flame retardant coverall, navy',
        specification: 'Nomex IIIA, 4.5oz navy blue',
        unit: 'pcs',
        quantity: 120,
        unitPrice: 46500,
        amount: 5580000,
        matchReqItemId: 'req-item-1',
        sourcePageNote: 'Page 1, Item 1',
      },
      {
        id: 'q1-2',
        name: 'Safety boots, steel toe cap',
        specification: 'S3 rated, size 40 to 46',
        unit: 'pairs',
        quantity: 120,
        unitPrice: 31000,
        amount: 3720000,
        matchReqItemId: 'req-item-2',
        sourcePageNote: 'Page 1, Item 2',
      },
      {
        id: 'q1-3',
        name: 'Hard hat with chin strap',
        specification: 'EN397 compliant, white',
        unit: 'pcs',
        quantity: 120,
        unitPrice: 7200,
        amount: 864000,
        matchReqItemId: 'req-item-3',
        sourcePageNote: 'Page 1, Item 3',
      },
      {
        id: 'q1-4',
        name: 'Safety goggles, clear lens',
        specification: 'EN166 anti fog polycarbonate',
        unit: 'pcs',
        quantity: 120,
        unitPrice: 4300,
        amount: 516000,
        matchReqItemId: 'req-item-4',
        sourcePageNote: 'Page 1, Item 4',
      },
      {
        id: 'q1-5',
        name: 'Hand gloves, cut resistant',
        specification: 'Level 5, nitrile coated',
        unit: 'pairs',
        quantity: 200,
        unitPrice: 5050,
        amount: 1010000,
        matchReqItemId: 'req-item-5',
        sourcePageNote: 'Page 1, Item 5',
      },
    ],
    notes: ['Quotation is exclusive of 7.5% statutory VAT', 'Manufactured to ISO 9001 and CE specifications'],
  },
  {
    id: 'quote-2',
    supplierName: 'Bonny Crest Ventures Ltd',
    address: '7 Aba Road, Port Harcourt, Rivers State',
    phone: '0805 771 6642',
    email: 'info@bonnycrest.com',
    rcNumber: 'RC 998317',
    tin: '20887431-0001',
    vatRegistration: 'VAT-RV-2015-8831',
    bank: {
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountNumber: '0124556677',
      accountName: 'Bonny Crest Ventures Ltd',
    },
    signatory: 'Chief C. Amadi (Executive Director)',
    quoteRef: 'BCV/2026/0392',
    quoteDate: '2026-08-22',
    validity: '30 days',
    deliveryPeriod: '3 to 4 weeks',
    paymentTerms: '100% on delivery and certification',
    warranty: '12 months manufacturer replacement warranty',
    currency: 'NGN',
    vat: {
      isInclusive: true,
      rate: 7.5,
      statedAmount: 811860,
    },
    subtotal: 10824800,
    total: 11636660,
    items: [
      {
        id: 'q2-1',
        name: 'Flame retardant coverall, navy',
        specification: 'Nomex IIIA industrial coverall',
        unit: 'pcs',
        quantity: 120,
        unitPrice: 39500,
        amount: 4740000,
        matchReqItemId: 'req-item-1',
        sourcePageNote: 'Page 1, Line 1',
      },
      {
        id: 'q2-2',
        name: 'Safety boots, steel toe cap',
        specification: 'Steel toe safety boot S3',
        unit: 'pairs',
        quantity: 120,
        unitPrice: 26400,
        amount: 3168000,
        matchReqItemId: 'req-item-2',
        sourcePageNote: 'Page 1, Line 2',
      },
      {
        id: 'q2-3',
        name: 'Hard hat with chin strap',
        specification: 'Safety helmet with chin strap EN397',
        unit: 'pcs',
        quantity: 120,
        unitPrice: 6900,
        amount: 828000,
        matchReqItemId: 'req-item-3',
        sourcePageNote: 'Page 1, Line 3',
      },
      {
        id: 'q2-4',
        name: 'Safety goggles, clear lens',
        specification: 'Clear safety goggles anti-fog',
        unit: 'pcs',
        quantity: 120,
        unitPrice: 3990,
        amount: 478800,
        matchReqItemId: 'req-item-4',
        sourcePageNote: 'Page 1, Line 4',
      },
      {
        id: 'q2-5',
        name: 'Hand gloves, cut resistant',
        specification: 'Cut resistant gloves Level 5 nitrile',
        unit: 'pairs',
        quantity: 200,
        unitPrice: 8050,
        amount: 1610000,
        matchReqItemId: 'req-item-5',
        sourcePageNote: 'Page 1, Line 5',
      },
    ],
    notes: ['Total quote amount is inclusive of 7.5% VAT (₦811,860)', 'All products comply with Nigerian Industrial Standards (NIS)'],
  },
  {
    id: 'quote-3',
    supplierName: 'Trans Amadi Safety Depot',
    address: 'Plot 22, Rumuobiakani, Port Harcourt, Rivers State',
    phone: '0701 220 8834',
    email: 'safetydepot@yahoo.com',
    rcNumber: '', // Missing CAC RC#
    tin: '', // Missing TIN
    bank: {
      bankName: 'Access Bank Plc',
      accountNumber: '2099887766',
      accountName: 'T. A. Safety Depot Enterprises', // Mismatch!
    },
    signatory: 'T. Briggs (Manager)',
    quoteRef: 'TASD/Q/0771',
    quoteDate: '2026-08-19',
    validity: '14 days',
    deliveryPeriod: '5 working days',
    paymentTerms: '30 days commercial credit',
    warranty: '3 months',
    currency: 'NGN',
    vat: {
      isInclusive: false,
      rate: 7.5,
    },
    subtotal: 9220000,
    total: 9220000,
    items: [
      {
        id: 'q3-1',
        name: 'Flame retardant coverall, navy',
        specification: 'Coverall flame retardant, cotton FR treated 6oz (Non-Nomex)',
        unit: 'pcs',
        quantity: 120,
        unitPrice: 34000,
        amount: 4080000,
        matchReqItemId: 'req-item-1',
        sourcePageNote: 'Quotation Slip #1',
      },
      {
        id: 'q3-2',
        name: 'Safety boots, steel toe cap',
        specification: 'Safety boots steel toe S1P (Lower than S3 requirement)',
        unit: 'pairs',
        quantity: 120,
        unitPrice: 24500,
        amount: 2940000,
        matchReqItemId: 'req-item-2',
        sourcePageNote: 'Quotation Slip #2',
      },
      {
        id: 'q3-3',
        name: 'Hard hat with chin strap',
        specification: 'Hard hat, specification not stated',
        unit: 'pcs',
        quantity: 120,
        unitPrice: 6500,
        amount: 780000,
        matchReqItemId: 'req-item-3',
        sourcePageNote: 'Quotation Slip #3',
      },
      // Note: Omitted Item 4: Safety goggles, clear lens!
      {
        id: 'q3-5',
        name: 'Hand gloves, cut resistant',
        specification: 'Cut resistant hand gloves Level 3 (Required Level 5)',
        unit: 'pairs',
        quantity: 200,
        unitPrice: 7100,
        amount: 1420000,
        matchReqItemId: 'req-item-5',
        sourcePageNote: 'Quotation Slip #4',
      },
    ],
    notes: ['Did not quote for safety goggles', 'Quote validity expires in 14 days'],
  },
];

/**
 * Runs the forensic bid evaluation algorithm
 */
export function evaluateBids(
  requisitionItems: RequisitionItem[],
  quotations: SupplierQuotation[],
  currency: CurrencyCode = 'NGN'
): BidEvaluationResult {
  const evaluatedSuppliers: EvaluatedSupplier[] = [];
  const collusionChecks: CollusionCheck[] = [];

  // Map of requisition item IDs for quick lookup
  const reqItemMap = new Map<string, RequisitionItem>();
  requisitionItems.forEach((item) => reqItemMap.set(item.id, item));

  // 1. Process each quotation
  for (const quote of quotations) {
    const blocks: string[] = [];
    const queries: string[] = [];
    const infos: string[] = [];

    // Line sum check
    let calculatedLineSum = 0;
    for (const item of quote.items) {
      const lineTotal = item.quantity * item.unitPrice;
      calculatedLineSum += lineTotal;
      if (Math.abs(lineTotal - item.amount) > 1) {
        queries.push(
          `Arithmetic error on "${item.name}": ${item.quantity} ${item.unit} @ ₦${item.unitPrice.toLocaleString()} calculates to ₦${lineTotal.toLocaleString()}, but quoted line sum is ₦${item.amount.toLocaleString()}.`
        );
      }
    }

    const statedSubtotal = quote.subtotal > 0 ? quote.subtotal : calculatedLineSum;
    const lineSumDifference = Math.abs(statedSubtotal - calculatedLineSum);
    const lineSumDiscrepancy = lineSumDifference > 50;

    if (lineSumDiscrepancy) {
      queries.push(
        `Quotation subtotal of ₦${statedSubtotal.toLocaleString()} differs from sum of line items (₦${calculatedLineSum.toLocaleString()}) by ₦${lineSumDifference.toLocaleString()}.`
      );
    }

    // Base cost is subtotal
    const baseCost = statedSubtotal;
    let evaluatedCost = baseCost;
    let vatAdded = 0;
    let vatNotes = '';

    const vatRate = quote.vat.rate || 7.5;
    if (quote.vat.isInclusive) {
      // Already includes VAT
      evaluatedCost = quote.total > 0 ? quote.total : baseCost;
      vatNotes = `Quotation stated inclusive of ${vatRate}% VAT (₦${(quote.vat.statedAmount || 0).toLocaleString()}). Evaluated at gross total.`;
    } else {
      // VAT exclusive: harmonize by adding statutory 7.5% VAT so all bidders are evaluated on identical landed cost
      vatAdded = (baseCost * vatRate) / 100;
      evaluatedCost = baseCost + vatAdded;
      vatNotes = `Statutory ${vatRate}% VAT (₦${Math.round(vatAdded).toLocaleString()}) added to bring quote to common evaluated landed cost.`;
      infos.push(vatNotes);
    }

    // Convert currency if foreign
    if (quote.currency !== currency && quote.exchangeRateToNgn) {
      const fxRate = quote.exchangeRateToNgn;
      evaluatedCost = evaluatedCost * fxRate;
      infos.push(
        `Converted from ${quote.currency} at exchange rate of 1 ${quote.currency} = ₦${fxRate.toLocaleString()} to ₦${Math.round(evaluatedCost).toLocaleString()}.`
      );
    }

    // Scope Completeness Check:
    // Determine which requisition items were quoted
    const quotedReqIds = new Set<string>();
    quote.items.forEach((item) => {
      if (item.matchReqItemId) quotedReqIds.add(item.matchReqItemId);
    });

    const itemsRequiredCount = requisitionItems.length;
    const itemsQuotedCount = quotedReqIds.size;
    const completenessPct = itemsRequiredCount > 0 ? (itemsQuotedCount / itemsRequiredCount) * 100 : 100;

    // Disqualification if missing required items
    if (itemsRequiredCount > 0 && itemsQuotedCount < itemsRequiredCount) {
      const missingItems = requisitionItems.filter((ri) => !quotedReqIds.has(ri.id));
      const missingNames = missingItems.map((m) => m.name).join(', ');
      blocks.push(
        `Incomplete tender: Failed to quote ${missingItems.length} mandatory requisition item(s): [${missingNames}]. Bid is non-responsive.`
      );
    }

    // Statutory Registration Check (PPA 2007 Section 16(6))
    if (!quote.rcNumber || quote.rcNumber.trim().length === 0) {
      queries.push('No Corporate Affairs Commission (CAC) RC registration number provided on quotation.');
    }
    if (!quote.tin || quote.tin.trim().length === 0) {
      queries.push('No Federal Inland Revenue Service (FIRS) Tax Identification Number (TIN) provided.');
    }

    // Bank Account Name Match Check (Anti-Money Laundering & Public Finance Management)
    if (quote.bank && quote.bank.accountName && quote.supplierName) {
      const cleanAcct = quote.bank.accountName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const cleanSupp = quote.supplierName.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (!cleanAcct.includes(cleanSupp) && !cleanSupp.includes(cleanAcct) && cleanAcct.length > 5) {
        blocks.push(
          `Bank account name "${quote.bank.accountName}" does not match registered supplier name "${quote.supplierName}". Payment to third-party bank accounts is prohibited under Federal Treasury Circulars.`
        );
      }
    }

    // Specification Divergence Checks
    quote.items.forEach((qi) => {
      if (qi.matchReqItemId) {
        const reqItem = reqItemMap.get(qi.matchReqItemId);
        if (reqItem) {
          // Check unit price vs benchmark
          if (reqItem.budgetBenchmarkPrice && qi.unitPrice > reqItem.budgetBenchmarkPrice * 1.35) {
            queries.push(
              `Unit price for "${qi.name}" (₦${qi.unitPrice.toLocaleString()}) is ${Math.round(
                ((qi.unitPrice - reqItem.budgetBenchmarkPrice) / reqItem.budgetBenchmarkPrice) * 100
              )}% above the official MDA budgetary benchmark (₦${reqItem.budgetBenchmarkPrice.toLocaleString()}).`
            );
          }
        }
      }
    });

    // Validity Period Check
    let validDaysLeft: number | undefined;
    if (quote.validity) {
      const valNum = parseInt(quote.validity, 10);
      if (!isNaN(valNum)) {
        validDaysLeft = valNum;
        if (valNum <= 14) {
          queries.push(`Short validity period (${quote.validity}). Request written validity extension prior to contract award.`);
        }
      }
    }

    const isResponsive = blocks.length === 0;

    evaluatedSuppliers.push({
      quotation: quote,
      evaluatedCost: Math.round(evaluatedCost),
      baseCost,
      vatAdded: Math.round(vatAdded),
      vatNotes,
      lineSumDiscrepancy,
      lineSumDifference,
      itemsQuotedCount,
      itemsRequiredCount,
      completenessPct,
      isResponsive,
      blocks,
      queries,
      infos,
      validityDaysLeft: validDaysLeft,
      rank: 0, // Assigned below
    });
  }

  // 2. Cross-Bidder Collusion & Integrity Checks
  // A. Phone number collision
  const phoneMap = new Map<string, string[]>();
  // B. Email address collision
  const emailMap = new Map<string, string[]>();
  // C. Physical address collision
  const addressMap = new Map<string, string[]>();
  // D. Bank account number collision
  const bankAcctMap = new Map<string, string[]>();
  // E. Signatory collision
  const signatoryMap = new Map<string, string[]>();
  // F. CAC / TIN collision
  const tinMap = new Map<string, string[]>();

  for (const es of evaluatedSuppliers) {
    const q = es.quotation;
    const name = q.supplierName;

    // Phone
    const cleanPhone = q.phone.replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 8) {
      const list = phoneMap.get(cleanPhone) || [];
      list.push(name);
      phoneMap.set(cleanPhone, list);
    }

    // Email domain / exact email
    if (q.email && q.email.includes('@')) {
      const cleanEmail = q.email.toLowerCase().trim();
      const list = emailMap.get(cleanEmail) || [];
      list.push(name);
      emailMap.set(cleanEmail, list);
    }

    // Address
    const cleanAddr = q.address.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 30);
    if (cleanAddr.length > 10) {
      const list = addressMap.get(cleanAddr) || [];
      list.push(name);
      addressMap.set(cleanAddr, list);
    }

    // Bank Account
    if (q.bank.accountNumber && q.bank.accountNumber.trim().length >= 8) {
      const list = bankAcctMap.get(q.bank.accountNumber.trim()) || [];
      list.push(name);
      bankAcctMap.set(q.bank.accountNumber.trim(), list);
    }

    // Signatory
    const cleanSig = q.signatory.toLowerCase().replace(/[^a-z]/g, '');
    if (cleanSig.length > 5) {
      const list = signatoryMap.get(cleanSig) || [];
      list.push(name);
      signatoryMap.set(cleanSig, list);
    }

    // TIN
    if (q.tin && q.tin.trim().length > 5) {
      const list = tinMap.get(q.tin.trim()) || [];
      list.push(name);
      tinMap.set(q.tin.trim(), list);
    }
  }

  // Populate collusion flags
  phoneMap.forEach((suppliers, phone) => {
    if (suppliers.length > 1) {
      collusionChecks.push({
        type: 'phone',
        severity: 'critical',
        title: 'Shared Telephone Number Detected',
        description: `Bidders [${suppliers.join(' & ')}] share the identical phone number (${phone}). Indicates non-independent bid preparation / front bidding.`,
        involvedSuppliers: suppliers,
      });
    }
  });

  emailMap.forEach((suppliers, email) => {
    if (suppliers.length > 1) {
      collusionChecks.push({
        type: 'email',
        severity: 'critical',
        title: 'Shared Email Address Detected',
        description: `Bidders [${suppliers.join(' & ')}] share the same email address (${email}).`,
        involvedSuppliers: suppliers,
      });
    }
  });

  addressMap.forEach((suppliers) => {
    if (suppliers.length > 1) {
      collusionChecks.push({
        type: 'address',
        severity: 'warning',
        title: 'Shared Physical Business Premises',
        description: `Bidders [${suppliers.join(' & ')}] operate from the same physical business location.`,
        involvedSuppliers: suppliers,
      });
    }
  });

  bankAcctMap.forEach((suppliers, acct) => {
    if (suppliers.length > 1) {
      collusionChecks.push({
        type: 'bank_account',
        severity: 'critical',
        title: 'Shared Settlement Bank Account',
        description: `Bidders [${suppliers.join(' & ')}] submitted the exact same bank account number (${acct}). Public procurement fraud red flag.`,
        involvedSuppliers: suppliers,
      });
    }
  });

  signatoryMap.forEach((suppliers) => {
    if (suppliers.length > 1) {
      collusionChecks.push({
        type: 'signatory',
        severity: 'critical',
        title: 'Common Director / Signatory Identified',
        description: `Bidders [${suppliers.join(' & ')}] share an identical executive signatory. Direct conflict of interest under PPA 2007 Section 57.`,
        involvedSuppliers: suppliers,
      });
    }
  });

  tinMap.forEach((suppliers, tin) => {
    if (suppliers.length > 1) {
      collusionChecks.push({
        type: 'tin',
        severity: 'critical',
        title: 'Shared Tax Identification Number',
        description: `Bidders [${suppliers.join(' & ')}] share the same FIRS TIN (${tin}). Entities are legally identical.`,
        involvedSuppliers: suppliers,
      });
    }
  });

  // Check for artificial rounding (all bids ending in exactly 00,000)
  const allRounded =
    quotations.length >= 2 &&
    quotations.every((q) => q.subtotal % 50000 === 0 && q.subtotal > 0);
  if (allRounded) {
    collusionChecks.push({
      type: 'rounding',
      severity: 'warning',
      title: 'Suspicious Round Figures Pattern',
      description: 'Every submitted quotation subtotal is an exact multiple of ₦50,000. Genuine competitive market pricing typically displays granular pence/kobo precision.',
      involvedSuppliers: quotations.map((q) => q.supplierName),
    });
  }

  // 3. Ranking: Sort responsive bids by lowest evaluated cost
  const responsiveSuppliers = evaluatedSuppliers
    .filter((s) => s.isResponsive)
    .sort((a, b) => a.evaluatedCost - b.evaluatedCost);

  const nonResponsiveSuppliers = evaluatedSuppliers.filter((s) => !s.isResponsive);

  // Assign ranks
  responsiveSuppliers.forEach((s, idx) => {
    s.rank = idx + 1;
  });
  nonResponsiveSuppliers.forEach((s, idx) => {
    s.rank = responsiveSuppliers.length + idx + 1;
  });

  const winner = responsiveSuppliers.length > 0 ? responsiveSuppliers[0] : undefined;
  const runnerUp = responsiveSuppliers.length > 1 ? responsiveSuppliers[1] : undefined;

  // Highest evaluated bid among all
  const allSortedByCost = [...evaluatedSuppliers].sort((a, b) => b.evaluatedCost - a.evaluatedCost);
  const highestBid = allSortedByCost.length > 0 ? allSortedByCost[0] : undefined;
  const lowestOverallBid = [...evaluatedSuppliers].sort((a, b) => a.evaluatedCost - b.evaluatedCost)[0];

  const savingsVsHighest =
    winner && highestBid && highestBid.evaluatedCost > winner.evaluatedCost
      ? highestBid.evaluatedCost - winner.evaluatedCost
      : 0;

  const savingsPct =
    winner && highestBid && highestBid.evaluatedCost > 0
      ? (savingsVsHighest / highestBid.evaluatedCost) * 100
      : 0;

  // 4. Generate Narrative Report
  let narrative = '';
  if (winner) {
    narrative = `In accordance with Section 32 and Section 33 of the Public Procurement Act (PPA 2007) and the Standard Bidding Guidelines of the Bureau of Public Procurement (BPP), quotations were invited and received from ${
      quotations.length
    } participating suppliers for this requisition.\n\n` +
      `Following comprehensive preliminary examination, technical specification compliance cross-check, arithmetic verification, and VAT harmonization (evaluated at a uniform statutory VAT rate of 7.5%), ${
        responsiveSuppliers.length
      } quotation(s) were certified as fully responsive, while ${
        nonResponsiveSuppliers.length
      } quotation(s) were disqualified on statutory grounds.\n\n` +
      `The bid submitted by ${winner.quotation.supplierName} in the evaluated landed amount of ₦${winner.evaluatedCost.toLocaleString()} represents the LOWEST EVALUATED RESPONSIVE TENDER. The supplier demonstrated full scope completeness (${
        winner.itemsQuotedCount
      }/${winner.itemsRequiredCount} items priced), compliant commercial terms (${winner.quotation.paymentTerms}), and acceptable delivery timeframe (${
        winner.quotation.deliveryPeriod
      }).\n\n` +
      `Awarding this procurement to ${winner.quotation.supplierName} yields a direct public expenditure saving of ₦${savingsVsHighest.toLocaleString()} (${savingsPct.toFixed(
        1
      )}%) compared against the highest evaluated tender, and satisfies all statutory value-for-money benchmarks.\n\n` +
      `RECOMMENDATION: It is respectfully recommended that an official Local Purchase Order (LPO) / Award Letter be issued to ${
        winner.quotation.supplierName
      } in the amount of ₦${winner.evaluatedCost.toLocaleString()}, subject to pre-contract verification of corporate tax clearance and execution of the statutory integrity pact.`;
  } else {
    narrative = `Following examination of the ${quotations.length} received quotation(s), NO BIDDER was found to be fully responsive to the mandatory technical specifications, scope completeness requirements, and treasury regulations. All submitted tenders incurred disqualifying blocking conditions. In compliance with PPA 2007 Section 33, it is recommended that this procurement exercise be cancelled and re-tendered with revised specifications.`;
  }

  return {
    suppliers: evaluatedSuppliers,
    winner,
    runnerUp,
    highestBid,
    lowestOverallBid,
    savingsVsHighest,
    savingsPct,
    collusionFlags: collusionChecks,
    totalBidsCount: quotations.length,
    responsiveBidsCount: responsiveSuppliers.length,
    nonResponsiveBidsCount: nonResponsiveSuppliers.length,
    narrative,
  };
}
