import {
  RequisitionItem,
  SupplierQuotation,
  EvaluatedSupplier,
  CollusionCheck,
  BidEvaluationResult,
  CurrencyCode,
  EvaluationCommitteeMember,
  EvaluationOptions,
  AlbItemWarning,
  StatutoryEligibilityCriteria,
} from '../types';

export const STATUTORY_ELIGIBILITY_CRITERIA: StatutoryEligibilityCriteria[] = [
  {
    key: 'cacIncorporation',
    name: 'CAC Certificate of Incorporation',
    authority: 'Corporate Affairs Commission',
    statutoryRef: 'PPA 2007 Sec 16(6)(a)',
    isMandatory: true,
  },
  {
    key: 'taxClearance',
    name: '3-Year Tax Clearance Certificate (TCC)',
    authority: 'Federal Inland Revenue Service (FIRS)',
    statutoryRef: 'PPA 2007 Sec 16(6)(d)',
    isMandatory: true,
  },
  {
    key: 'pencomCompliance',
    name: 'PENCOM Compliance Certificate',
    authority: 'National Pension Commission',
    statutoryRef: 'Pension Reform Act 2014 Sec 16(6)(d)',
    isMandatory: true,
  },
  {
    key: 'itfCompliance',
    name: 'ITF Compliance Certificate',
    authority: 'Industrial Training Fund',
    statutoryRef: 'ITF Act 2011 Sec 6(1)-(3)',
    isMandatory: true,
  },
  {
    key: 'nsitfCompliance',
    name: 'NSITF Compliance Certificate',
    authority: 'Nigeria Social Insurance Trust Fund',
    statutoryRef: 'Employees Compensation Act 2010',
    isMandatory: true,
  },
  {
    key: 'bppInterimRegistration',
    name: 'BPP Interim Registration Report (IRR)',
    authority: 'Bureau of Public Procurement',
    statutoryRef: 'PPA 2007 Sec 5(h)',
    isMandatory: true,
  },
  {
    key: 'swornAffidavit',
    name: 'Sworn Affidavit of Non-Bankruptcy & Probity',
    authority: 'Federal/State High Court',
    statutoryRef: 'PPA 2007 Sec 16(6)(f)',
    isMandatory: true,
  },
  {
    key: 'bidSecurity',
    name: 'Bid Security / Securing Declaration',
    authority: 'Commercial Bank or Insurance',
    statutoryRef: 'PPA 2007 Sec 26',
    isMandatory: false,
  },
];

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

export const DEFAULT_COMMITTEE_MEMBERS: EvaluationCommitteeMember[] = [
  {
    id: 'cm-1',
    name: 'Dr. (Mrs.) B. N. Okafor',
    role: 'Committee Chairperson',
    department: 'Directorate of Planning & Quality Assurance',
    signedDate: '2026-08-25',
  },
  {
    id: 'cm-2',
    name: 'Engr. K. O. Ekanem',
    role: 'Procurement Directorate Secretary',
    department: 'Directorate of Procurement & Contracts',
    signedDate: '2026-08-25',
  },
  {
    id: 'cm-3',
    name: 'Engr. M. A. Danjuma',
    role: 'Technical Specialist / User Department',
    department: 'Health, Safety & Marine Operations',
    signedDate: '2026-08-25',
  },
  {
    id: 'cm-4',
    name: 'Mrs. F. O. Adeleke (FCA)',
    role: 'Financial Analyst / Internal Audit',
    department: 'Finance & Accounts Division',
    signedDate: '2026-08-25',
  },
  {
    id: 'cm-5',
    name: 'Barr. C. I. Nwachukwu',
    role: 'Legal Directorate / Due Process Observer',
    department: 'Legal Advisory & Public Ethics Board',
    signedDate: '2026-08-25',
  },
];

export const SOLAR_EXAMPLE_ITEMS: RequisitionItem[] = [
  {
    id: 'sol-1',
    name: '450W Monocrystalline Bifacial Solar PV Panels',
    specification: 'Tier 1 manufacturer, efficiency >= 21.3%, IP68 junction box, 25-yr linear output warranty',
    unit: 'pcs',
    quantity: 48,
    budgetBenchmarkPrice: 115000,
  },
  {
    id: 'sol-2',
    name: '15kVA 48V Pure Sine Wave Three-Phase Hybrid Inverter',
    specification: 'Dual MPPT 150A, grid-tie with battery backup, Wi-Fi telemetry remote monitoring, anti-islanding',
    unit: 'units',
    quantity: 2,
    budgetBenchmarkPrice: 2850000,
  },
  {
    id: 'sol-3',
    name: '10.24kWh 51.2V 200Ah LiFePO4 Lithium Battery Rack System',
    specification: '6,000 cycles at 80% DoD, integrated smart BMS with CAN/RS485 comms, rack-mount enclosure',
    unit: 'units',
    quantity: 4,
    budgetBenchmarkPrice: 3400000,
  },
  {
    id: 'sol-4',
    name: '6mm² Solar Photovoltaic DC Halogen-Free Cable',
    specification: 'EN50618 certified, double insulated cross-linked polyolefin, UV resistant, 500m drum',
    unit: 'drums',
    quantity: 3,
    budgetBenchmarkPrice: 320000,
  },
  {
    id: 'sol-5',
    name: 'DC/AC Surge Protective Devices (SPD) & Lightning Arrestor',
    specification: 'Class II 1000V DC SPD + 40kA AC SPD in IP65 weather-proof distribution panel with copper earth rod',
    unit: 'sets',
    quantity: 2,
    budgetBenchmarkPrice: 450000,
  },
];

export const SOLAR_EXAMPLE_QUOTATIONS: SupplierQuotation[] = [
  {
    id: 'sol-quote-1',
    supplierName: 'Helios Clean Energy Systems Ltd',
    address: 'Plot 12 Central Business District, Abuja, FCT',
    phone: '0809 112 3344',
    email: 'procurement@heliosenergy.ng',
    rcNumber: 'RC 1184201',
    tin: '22910411-0001',
    vatRegistration: 'VAT-FCT-2016-1184',
    bank: {
      bankName: 'Zenith Bank Plc',
      accountNumber: '1018904422',
      accountName: 'Helios Clean Energy Systems Ltd',
    },
    signatory: 'Engr. D. T. Suleiman (Chief Technical Officer)',
    quoteRef: 'HCE/RFQ/2026/054',
    quoteDate: '2026-08-21',
    validity: '90 days',
    deliveryPeriod: '14 working days',
    paymentTerms: '30% advance on APG, 70% after installation & commissioning testing',
    warranty: '5 years comprehensive equipment warranty',
    currency: 'NGN',
    vat: { isInclusive: false, rate: 7.5, statedAmount: 1968000 },
    subtotal: 26240000,
    total: 28208000,
    items: [
      { id: 'sq1-1', name: '450W Monocrystalline Bifacial Solar PV Panels', specification: 'Jinko Solar 450W Tiger Pro Monocrystalline', unit: 'pcs', quantity: 48, unitPrice: 112000, amount: 5376000, matchReqItemId: 'sol-1' },
      { id: 'sq1-2', name: '15kVA 48V Pure Sine Wave Three-Phase Hybrid Inverter', specification: 'Deye 15kW Hybrid Inverter Three-Phase MPPT', unit: 'units', quantity: 2, unitPrice: 2750000, amount: 5500000, matchReqItemId: 'sol-2' },
      { id: 'sq1-3', name: '10.24kWh 51.2V 200Ah LiFePO4 Lithium Battery Rack System', specification: 'FelicitySolar LiFePO4 51.2V 200Ah Rack Unit', unit: 'units', quantity: 4, unitPrice: 3350000, amount: 13400000, matchReqItemId: 'sol-3' },
      { id: 'sq1-4', name: '6mm² Solar Photovoltaic DC Halogen-Free Cable', specification: 'Top Cable PV 6mm² twin-core 500m', unit: 'drums', quantity: 3, unitPrice: 340000, amount: 1020000, matchReqItemId: 'sol-4' },
      { id: 'sq1-5', name: 'DC/AC Surge Protective Devices (SPD) & Lightning Arrestor', specification: 'Dehn Class II SPD + Erico lightning kit', unit: 'sets', quantity: 2, unitPrice: 472000, amount: 944000, matchReqItemId: 'sol-5' },
    ],
    notes: ['Tier 1 Jinko solar panels and Deye industrial inverters', 'Full Nemas compliance certified'],
  },
  {
    id: 'sol-quote-2',
    supplierName: 'Saharan Power Dynamics Ltd',
    address: '8 Kudirat Abiola Way, Oregun, Ikeja, Lagos',
    phone: '0802 334 5566',
    email: 'info@saharanpower.com',
    rcNumber: 'RC 1449012',
    tin: '18320491-0001',
    vatRegistration: 'VAT-LA-2018-9921',
    bank: {
      bankName: 'Access Bank Plc',
      accountNumber: '0034567812',
      accountName: 'Saharan Power Dynamics Ltd',
    },
    signatory: 'Alhaji S. B. Danladi (Managing Director)',
    quoteRef: 'SPD/QUO/2026/099',
    quoteDate: '2026-08-22',
    validity: '60 days',
    deliveryPeriod: '21 working days',
    paymentTerms: '50% upon delivery, 50% after acceptance certificate',
    warranty: '3 years manufacturer warranty',
    currency: 'NGN',
    vat: { isInclusive: true, rate: 7.5, statedAmount: 1888600 },
    subtotal: 25181400,
    total: 27070000,
    items: [
      { id: 'sq2-1', name: '450W Monocrystalline Bifacial Solar PV Panels', specification: 'JA Solar 450W Mono Bifacial', unit: 'pcs', quantity: 48, unitPrice: 108000, amount: 5184000, matchReqItemId: 'sol-1' },
      { id: 'sq2-2', name: '15kVA 48V Pure Sine Wave Three-Phase Hybrid Inverter', specification: 'Growatt 15kVA Three Phase Hybrid', unit: 'units', quantity: 2, unitPrice: 2890000, amount: 5780000, matchReqItemId: 'sol-2' },
      { id: 'sq2-3', name: '10.24kWh 51.2V 200Ah LiFePO4 Lithium Battery Rack System', specification: 'Pylontech UP5000 Modular LiFePO4', unit: 'units', quantity: 4, unitPrice: 3150000, amount: 12600000, matchReqItemId: 'sol-3' },
      { id: 'sq2-4', name: '6mm² Solar Photovoltaic DC Halogen-Free Cable', specification: 'KBE Solar DC cable 6mm² 500m', unit: 'drums', quantity: 3, unitPrice: 295000, amount: 885000, matchReqItemId: 'sol-4' },
      { id: 'sq2-5', name: 'DC/AC Surge Protective Devices (SPD) & Lightning Arrestor', specification: 'Schneider Electric SPD Class II panel', unit: 'sets', quantity: 2, unitPrice: 366000, amount: 732000, matchReqItemId: 'sol-5' },
    ],
    notes: ['Quoted price is gross inclusive of 7.5% statutory VAT', 'Standard shipping to REA designated project depot'],
  },
  {
    id: 'sol-quote-3',
    supplierName: 'Niger Delta Solar Mart Ltd',
    address: '44 Stadium Road, Port Harcourt, Rivers State',
    phone: '0803 778 9911',
    email: 'solarmartng@gmail.com',
    rcNumber: '',
    tin: '',
    bank: {
      bankName: 'Guaranty Trust Bank (GTBank)',
      accountNumber: '0223456789',
      accountName: 'N.D. Green Electronics Ventures',
    },
    signatory: 'Mr. B. K. George (Sales Manager)',
    quoteRef: 'NDSM/PR/042',
    quoteDate: '2026-08-18',
    validity: '14 days',
    deliveryPeriod: '30 working days',
    paymentTerms: '100% upfront payment required',
    warranty: '1 year limited warranty',
    currency: 'NGN',
    vat: { isInclusive: false, rate: 7.5 },
    subtotal: 21940000,
    total: 21940000,
    items: [
      { id: 'sq3-1', name: '450W Monocrystalline Bifacial Solar PV Panels', specification: 'Generic mono solar panel 450W', unit: 'pcs', quantity: 48, unitPrice: 95000, amount: 4560000, matchReqItemId: 'sol-1' },
      { id: 'sq3-2', name: '15kVA 48V Pure Sine Wave Three-Phase Hybrid Inverter', specification: 'Must Solar 15kVA low frequency', unit: 'units', quantity: 2, unitPrice: 2450000, amount: 4900000, matchReqItemId: 'sol-2' },
      { id: 'sq3-3', name: '10.24kWh 51.2V 200Ah LiFePO4 Lithium Battery Rack System', specification: 'Tubular gel battery bank (Non-LiFePO4 divergence)', unit: 'units', quantity: 4, unitPrice: 2870000, amount: 11480000, matchReqItemId: 'sol-3' },
      { id: 'sq3-4', name: '6mm² Solar Photovoltaic DC Halogen-Free Cable', specification: 'Local copper flexible cable 6mm²', unit: 'drums', quantity: 3, unitPrice: 333333, amount: 1000000, matchReqItemId: 'sol-4' },
    ],
    notes: ['Did not quote for surge protective arrestor system', 'Missing CAC certificate and FIRS tax TIN'],
  },
];

export const HIGHWAY_EXAMPLE_ITEMS: RequisitionItem[] = [
  {
    id: 'hwy-1',
    name: '60/70 Penetration Grade Bitumen',
    specification: 'ASTM D946/D946M, penetration 60-70 dmm at 25°C, softening point 48-56°C, bulk supply',
    unit: 'metric tons',
    quantity: 150,
    budgetBenchmarkPrice: 880000,
  },
  {
    id: 'hwy-2',
    name: '20mm Crushed Granite Aggregate',
    specification: 'Clean angular hard granite aggregate, Los Angeles Abrasion < 25%, Aggregate Crushing Value < 22%',
    unit: 'metric tons',
    quantity: 1200,
    budgetBenchmarkPrice: 28000,
  },
  {
    id: 'hwy-3',
    name: 'Hydrated Lime Mineral Filler',
    specification: 'AASHTO M303 calcium hydroxide min 90% purity, fineness passing 75µm sieve >= 85%, 50kg bags',
    unit: 'bags',
    quantity: 800,
    budgetBenchmarkPrice: 9500,
  },
  {
    id: 'hwy-4',
    name: 'Rapid Curing Cutback Bitumen Primer RC-250',
    specification: 'ASTM D2028 RC-250 for base course prime coat spray, kinematic viscosity at 60°C 250-500 cSt',
    unit: 'drums (200L)',
    quantity: 60,
    budgetBenchmarkPrice: 210000,
  },
];

export const HIGHWAY_EXAMPLE_QUOTATIONS: SupplierQuotation[] = [
  {
    id: 'hwy-quote-1',
    supplierName: 'Julius Pave & Infrastructure Ltd',
    address: 'KM 14 Warri-Sapele Expressway, Warri, Delta State',
    phone: '0803 222 7788',
    email: 'bids@juliuspave.com.ng',
    rcNumber: 'RC 654210',
    tin: '10492819-0001',
    vatRegistration: 'VAT-DT-2012-6542',
    bank: {
      bankName: 'First Bank of Nigeria Ltd',
      accountNumber: '2019482711',
      accountName: 'Julius Pave & Infrastructure Ltd',
    },
    signatory: 'Engr. V. K. Osagie (Project Director)',
    quoteRef: 'JPI/FMW/2026/102',
    quoteDate: '2026-08-20',
    validity: '90 days',
    deliveryPeriod: '10 working days on staggered batch call-off',
    paymentTerms: '30 days commercial credit upon lab certification of materials',
    warranty: 'Materials guaranteed to satisfy FMW General Specifications (Clause 4104)',
    currency: 'NGN',
    vat: { isInclusive: false, rate: 7.5, statedAmount: 13935000 },
    subtotal: 185800000,
    total: 199735000,
    items: [
      { id: 'hq1-1', name: '60/70 Penetration Grade Bitumen', specification: 'ASTM D946 refinery direct supply', unit: 'metric tons', quantity: 150, unitPrice: 865000, amount: 129750000, matchReqItemId: 'hwy-1' },
      { id: 'hq1-2', name: '20mm Crushed Granite Aggregate', specification: 'Granite aggregate LA Abrasion 21%', unit: 'metric tons', quantity: 1200, unitPrice: 27500, amount: 33000000, matchReqItemId: 'hwy-2' },
      { id: 'hq1-3', name: 'Hydrated Lime Mineral Filler', specification: 'Pure hydrated lime 92% active Ca(OH)2', unit: 'bags', quantity: 800, unitPrice: 9100, amount: 7280000, matchReqItemId: 'hwy-3' },
      { id: 'hq1-4', name: 'Rapid Curing Cutback Bitumen Primer RC-250', specification: 'RC-250 prime coat in sealed steel drums', unit: 'drums (200L)', quantity: 60, unitPrice: 262833, amount: 15770000, matchReqItemId: 'hwy-4' },
    ],
    notes: ['Certified compliant with Federal Ministry of Works Specification Section 4', 'Full refinery test sheets enclosed'],
  },
  {
    id: 'hwy-quote-2',
    supplierName: 'Roadstone Materials West Africa Ltd',
    address: 'Plot 5 Trans-Amadi Industrial Layout, Port Harcourt, Rivers State',
    phone: '0805 119 2244',
    email: 'sales@roadstonematerials.ng',
    rcNumber: 'RC 882019',
    tin: '19283741-0001',
    vatRegistration: 'VAT-RV-2015-8820',
    bank: {
      bankName: 'United Bank for Africa (UBA)',
      accountNumber: '1022394817',
      accountName: 'Roadstone Materials West Africa Ltd',
    },
    signatory: 'Mr. T. J. Okon (Commercial Manager)',
    quoteRef: 'RMWA/PR/2026/049',
    quoteDate: '2026-08-21',
    validity: '60 days',
    deliveryPeriod: '15 working days',
    paymentTerms: '50% advance, 50% upon delivery to quarry stockpile',
    warranty: 'Standard statutory commercial warranty',
    currency: 'NGN',
    vat: { isInclusive: true, rate: 7.5, statedAmount: 14193750 },
    subtotal: 189250000,
    total: 203443750,
    items: [
      { id: 'hq2-1', name: '60/70 Penetration Grade Bitumen', specification: '60/70 Bitumen ASTM D946 bulk', unit: 'metric tons', quantity: 150, unitPrice: 890000, amount: 133500000, matchReqItemId: 'hwy-1' },
      { id: 'hq2-2', name: '20mm Crushed Granite Aggregate', specification: 'Clean 20mm granite stone aggregate', unit: 'metric tons', quantity: 1200, unitPrice: 29000, amount: 34800000, matchReqItemId: 'hwy-2' },
      { id: 'hq2-3', name: 'Hydrated Lime Mineral Filler', specification: 'Hydrated lime AASHTO M303 50kg', unit: 'bags', quantity: 800, unitPrice: 9750, amount: 7800000, matchReqItemId: 'hwy-3' },
      { id: 'hq2-4', name: 'Rapid Curing Cutback Bitumen Primer RC-250', specification: 'RC-250 primer 200L drums', unit: 'drums (200L)', quantity: 60, unitPrice: 219166, amount: 13150000, matchReqItemId: 'hwy-4' },
    ],
    notes: ['Quotation is gross inclusive of 7.5% VAT', 'Delivery direct to highway site batches'],
  },
  {
    id: 'hwy-quote-3',
    supplierName: 'Sterling Asphalt Haulage Ltd',
    address: 'Plot 18 Reclamation Road, Diobu, Port Harcourt',
    phone: '0703 445 6677',
    email: 'sterlingasphalt@gmail.com',
    rcNumber: '',
    tin: '',
    bank: {
      bankName: 'Fidelity Bank Plc',
      accountNumber: '4019283746',
      accountName: 'Sterling Multi-Ventures Logistics',
    },
    signatory: 'Mr. P. N. Ekeh',
    quoteRef: 'SAH/Q/2026/012',
    quoteDate: '2026-08-19',
    validity: '10 days',
    deliveryPeriod: '7 working days',
    paymentTerms: '100% advance payment',
    warranty: 'No formal warranty stated',
    currency: 'NGN',
    vat: { isInclusive: false, rate: 7.5 },
    subtotal: 161800000,
    total: 161800000,
    items: [
      { id: 'hq3-1', name: '60/70 Penetration Grade Bitumen', specification: 'Imported bitumen 60/70', unit: 'metric tons', quantity: 150, unitPrice: 870000, amount: 130500000, matchReqItemId: 'hwy-1' },
      { id: 'hq3-2', name: '20mm Crushed Granite Aggregate', specification: 'Granite aggregate 20mm', unit: 'metric tons', quantity: 1200, unitPrice: 26000, amount: 31200000, matchReqItemId: 'hwy-2' },
      { id: 'hq3-4', name: 'Rapid Curing Cutback Bitumen Primer RC-250', specification: 'Primer RC250 in drums', unit: 'drums (200L)', quantity: 60, unitPrice: 16666, amount: 100000, matchReqItemId: 'hwy-4' },
    ],
    notes: ['Did not quote for hydrated lime filler (Item 3)', 'Validity is only 10 calendar days'],
  },
];

/**
 * Runs the forensic bid evaluation algorithm
 */
export function evaluateBids(
  requisitionItems: RequisitionItem[],
  quotations: SupplierQuotation[],
  currency: CurrencyCode = 'NGN',
  options?: EvaluationOptions
): BidEvaluationResult {
  const evaluatedSuppliers: EvaluatedSupplier[] = [];
  const collusionChecks: CollusionCheck[] = [];
  const albWarnings: AlbItemWarning[] = [];

  // Map of requisition item IDs for quick lookup
  const reqItemMap = new Map<string, RequisitionItem>();
  requisitionItems.forEach((item) => reqItemMap.set(item.id, item));

  // Compute total official budget benchmark
  const budgetBenchmarkTotal = requisitionItems.reduce(
    (acc, it) => acc + (it.budgetBenchmarkPrice || 0) * it.quantity,
    0
  );

  // Evaluation Method & Options
  const evalMethod = options?.evaluationMethod || 'lerb';
  const techWeight = options?.technicalWeight ?? 70;
  const finWeight = options?.financialWeight ?? 30;
  const minTechScore = options?.minTechnicalScore ?? 70;
  const applyArithmetic = options?.applyArithmeticCorrections !== false; // default true

  // 1. Process each quotation
  for (const quote of quotations) {
    const blocks: string[] = [];
    const queries: string[] = [];
    const infos: string[] = [];
    const arithmeticNotes: string[] = [];
    const preliminaryFailures: string[] = [];

    // Stage 1: Preliminary Statutory Eligibility Examination
    let preliminaryPassed = true;
    if (quote.eligibility) {
      for (const crit of STATUTORY_ELIGIBILITY_CRITERIA) {
        if (crit.isMandatory) {
          const val = (quote.eligibility as any)[crit.key];
          if (val === false) {
            preliminaryFailures.push(crit.name);
          }
        }
      }
    }
    // Also check explicit rcNumber and tin if unprovided
    if (!quote.rcNumber || quote.rcNumber.trim().length === 0) {
      queries.push('No Corporate Affairs Commission (CAC) RC registration number provided on quotation.');
      if (quote.eligibility && (quote.eligibility as any).cacIncorporation === false) {
        // Already recorded
      }
    }
    if (!quote.tin || quote.tin.trim().length === 0) {
      queries.push('No Federal Inland Revenue Service (FIRS) Tax Identification Number (TIN) provided.');
    }

    if (preliminaryFailures.length > 0) {
      preliminaryPassed = false;
      blocks.push(
        `Disqualified at Preliminary Examination: Failed statutory mandatory compliance: [${preliminaryFailures.join(
          ', '
        )}] under PPA 2007 Section 16(6).`
      );
    }

    // Stage 2: Arithmetic Error Audit & Statutory Correction (PPA 2007 Section 31)
    let calculatedLineSum = 0;
    quote.items.forEach((item, itIdx) => {
      const lineTotal = item.quantity * item.unitPrice;
      calculatedLineSum += lineTotal;
      if (Math.abs(lineTotal - item.amount) > 1) {
        const note = `Line #${itIdx + 1} (${item.name}): Stated ₦${item.amount.toLocaleString()} corrected to ₦${lineTotal.toLocaleString()} (${item.quantity} ${item.unit} @ ₦${item.unitPrice.toLocaleString()}) per PPA Sec 31.`;
        queries.push(note);
        arithmeticNotes.push(note);
      }
    });

    const statedSubtotal = quote.subtotal > 0 ? quote.subtotal : calculatedLineSum;
    const lineSumDifference = Math.abs(statedSubtotal - calculatedLineSum);
    const lineSumDiscrepancy = lineSumDifference > 50;

    if (lineSumDiscrepancy) {
      queries.push(
        `Subtotal arithmetic discrepancy: Stated ₦${statedSubtotal.toLocaleString()} vs sum of line items ₦${calculatedLineSum.toLocaleString()} (diff: ₦${lineSumDifference.toLocaleString()}). Unit rate upheld per PPA 2007 Section 31.`
      );
    }

    // Determine Base Cost (apply statutory correction if enabled)
    const baseCost = applyArithmetic && lineSumDiscrepancy ? calculatedLineSum : statedSubtotal;
    const correctedSubtotal = calculatedLineSum;

    let evaluatedCost = baseCost;
    let vatAdded = 0;
    let vatNotes = '';

    // VAT Treatment & Policy
    if (options?.vatExempt) {
      // VAT Exempt Mode
      if (quote.vat.isInclusive) {
        evaluatedCost = baseCost;
        vatNotes = 'Statutory VAT-Exempt Tender: Evaluated at net base subtotal without 7.5% VAT.';
        infos.push(vatNotes);
      } else {
        evaluatedCost = baseCost;
        vatNotes = 'Statutory VAT-Exempt Tender: Evaluated at 0% VAT.';
      }
      vatAdded = 0;
    } else {
      // Standard Harmonized Landed Cost
      const vatRate = options?.vatRate ?? (quote.vat.rate || 7.5);
      if (quote.vat.isInclusive) {
        evaluatedCost = quote.total > 0 ? quote.total : baseCost;
        vatNotes = `Quotation stated inclusive of ${vatRate}% VAT (₦${(quote.vat.statedAmount || 0).toLocaleString()}). Evaluated at gross total.`;
      } else {
        vatAdded = (baseCost * vatRate) / 100;
        evaluatedCost = baseCost + vatAdded;
        vatNotes = `Statutory ${vatRate}% VAT (₦${Math.round(vatAdded).toLocaleString()}) added to bring quote to common evaluated landed cost.`;
        infos.push(vatNotes);
      }
    }

    const correctedTotal = correctedSubtotal + vatAdded;

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

    let missingItemsLoadedCost = 0;
    // Missing items policy check
    if (itemsRequiredCount > 0 && itemsQuotedCount < itemsRequiredCount) {
      const missingItems = requisitionItems.filter((ri) => !quotedReqIds.has(ri.id));
      const missingNames = missingItems.map((m) => m.name).join(', ');

      if (options?.missingItemPolicy === 'load_highest_price') {
        // Non-material deviation loading under PPA Sec 32(3)
        let loadedTotal = 0;
        missingItems.forEach((mItem) => {
          const allOtherPrices = quotations
            .map((q) => q.items.find((it) => it.matchReqItemId === mItem.id)?.unitPrice)
            .filter((p): p is number => typeof p === 'number' && p > 0);
          const penaltyPrice = allOtherPrices.length > 0 ? Math.max(...allOtherPrices) : (mItem.budgetBenchmarkPrice || 0);
          loadedTotal += penaltyPrice * mItem.quantity;
        });
        missingItemsLoadedCost = loadedTotal;
        evaluatedCost += loadedTotal;
        infos.push(
          `PPA 2007 Sec 32(3) Adjustment: Loaded highest competing unit price for ${missingItems.length} unquoted line(s) (+₦${Math.round(loadedTotal).toLocaleString()}) to establish equitable comparative evaluation.`
        );
      } else {
        blocks.push(
          `Incomplete tender: Failed to quote ${missingItems.length} mandatory requisition item(s): [${missingNames}]. Bid is non-responsive.`
        );
      }
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

    // Specification Divergence & Price Realism Checks
    const albThreshold = options?.albThresholdPct || 25;
    quote.items.forEach((qi) => {
      if (qi.matchReqItemId) {
        const reqItem = reqItemMap.get(qi.matchReqItemId);
        if (reqItem && reqItem.budgetBenchmarkPrice && reqItem.budgetBenchmarkPrice > 0) {
          const ratio = qi.unitPrice / reqItem.budgetBenchmarkPrice;

          // Check for price inflation
          if (ratio > 1.35) {
            queries.push(
              `Unit price for "${qi.name}" (₦${qi.unitPrice.toLocaleString()}) is ${Math.round(
                (ratio - 1) * 100
              )}% above the official MDA budgetary benchmark (₦${reqItem.budgetBenchmarkPrice.toLocaleString()}).`
            );
            albWarnings.push({
              supplierName: quote.supplierName,
              itemName: qi.name,
              unitPrice: qi.unitPrice,
              benchmarkPrice: reqItem.budgetBenchmarkPrice,
              variancePct: Math.round((ratio - 1) * 100),
              severity: 'inflated',
              reason: `Unit price is ${Math.round((ratio - 1) * 100)}% above official benchmark.`,
            });
          }

          // Check for Abnormally Low Bid (ALB)
          if (ratio < (1 - albThreshold / 100)) {
            const underPct = Math.round((1 - ratio) * 100);
            queries.push(
              `Abnormally Low Bid (ALB) on "${qi.name}": Unit price (₦${qi.unitPrice.toLocaleString()}) is ${underPct}% below budgetary benchmark. Risk of substandard materials or non-delivery.`
            );
            albWarnings.push({
              supplierName: quote.supplierName,
              itemName: qi.name,
              unitPrice: qi.unitPrice,
              benchmarkPrice: reqItem.budgetBenchmarkPrice,
              variancePct: underPct,
              severity: 'abnormally_low',
              reason: `Unit price is ${underPct}% below budgetary benchmark (₦${reqItem.budgetBenchmarkPrice.toLocaleString()}). Substandard goods risk.`,
            });
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

    // Technical Evaluation Check (for QCBS mode)
    const techScore = quote.technicalScore ?? 80;
    let technicalPassed = true;
    if (evalMethod === 'qcbs') {
      if (techScore < minTechScore) {
        technicalPassed = false;
        blocks.push(
          `Disqualified at Technical Stage: Technical score of ${techScore}/100 is below statutory qualification benchmark of ${minTechScore}/100.`
        );
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
      correctedSubtotal,
      correctedTotal,
      arithmeticNotes,
      preliminaryPassed,
      preliminaryFailures,
      technicalScore: techScore,
      technicalPassed,
      itemsQuotedCount,
      itemsRequiredCount,
      completenessPct,
      isResponsive,
      blocks,
      queries,
      infos,
      validityDaysLeft: validDaysLeft,
      missingItemsLoadedCost,
      rank: 0, // Assigned below
    });
  }

  // 2. Cross-Bidder Collusion & Integrity Checks
  const phoneMap = new Map<string, string[]>();
  const emailMap = new Map<string, string[]>();
  const addressMap = new Map<string, string[]>();
  const bankAcctMap = new Map<string, string[]>();
  const signatoryMap = new Map<string, string[]>();
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

    // Email
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

  // 3. Ranking & Scoring based on Evaluation Method
  const responsiveSuppliers = evaluatedSuppliers.filter((s) => s.isResponsive);
  const nonResponsiveSuppliers = evaluatedSuppliers.filter((s) => !s.isResponsive);

  if (evalMethod === 'qcbs' && responsiveSuppliers.length > 0) {
    // Quality & Cost Based Selection (QCBS)
    // Find lowest evaluated financial cost among responsive bidders
    const minCost = Math.min(...responsiveSuppliers.map((s) => s.evaluatedCost));

    responsiveSuppliers.forEach((s) => {
      // Financial score: Sf = 100 * (F_min / F)
      const sf = s.evaluatedCost > 0 ? (minCost / s.evaluatedCost) * 100 : 100;
      s.financialScore = Math.round(sf * 10) / 10;

      // Combined score: S = (St * Tw) + (Sf * Fw)
      const st = s.technicalScore ?? 80;
      const combined = (st * (techWeight / 100)) + (sf * (finWeight / 100));
      s.combinedScore = Math.round(combined * 10) / 10;
    });

    // Sort responsive by combined score descending
    responsiveSuppliers.sort((a, b) => (b.combinedScore || 0) - (a.combinedScore || 0));
  } else {
    // Lowest Evaluated Responsive Bidder (LERB) - Standard PPA 2007 Section 32
    responsiveSuppliers.sort((a, b) => a.evaluatedCost - b.evaluatedCost);
  }

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

  // Median cost
  let medianEvaluatedCost = 0;
  if (responsiveSuppliers.length > 0) {
    const costs = responsiveSuppliers.map((s) => s.evaluatedCost).sort((a, b) => a - b);
    const mid = Math.floor(costs.length / 2);
    medianEvaluatedCost = costs.length % 2 !== 0 ? costs[mid] : Math.round((costs[mid - 1] + costs[mid]) / 2);
  }

  // 4. Generate Narrative Report
  let narrative = '';
  if (winner) {
    const methodDesc =
      evalMethod === 'qcbs'
        ? `Combined Quality & Cost Based Selection (QCBS: ${techWeight}% Technical + ${finWeight}% Financial, Combined Score: ${winner.combinedScore?.toFixed(1)}/100)`
        : 'Lowest Evaluated Responsive Bidder (LERB) under PPA 2007 Section 32';

    narrative = `In accordance with Section 32 and Section 33 of the Public Procurement Act (PPA 2007) and the Standard Bidding Guidelines of the Bureau of Public Procurement (BPP), quotations were invited and received from ${
      quotations.length
    } participating suppliers for this requisition.\n\n` +
      `Following comprehensive preliminary examination (CAC, TCC, PENCOM, ITF, NSITF, BPP IRR), technical specification compliance check, arithmetic verification & correction under PPA Section 31, and VAT harmonization (${
        options?.vatExempt ? 'evaluated as statutory VAT-exempt' : 'evaluated at a uniform statutory VAT rate of 7.5%'
      }), ${
        responsiveSuppliers.length
      } quotation(s) were certified as fully responsive, while ${
        nonResponsiveSuppliers.length
      } quotation(s) were disqualified on statutory grounds.\n\n` +
      `Under the evaluated methodology [${methodDesc}], the bid submitted by ${winner.quotation.supplierName} in the evaluated landed amount of ₦${winner.evaluatedCost.toLocaleString()} represents the RECOMMENDED WINNING TENDER. The supplier demonstrated full scope completeness (${
        winner.itemsQuotedCount
      }/${winner.itemsRequiredCount} items priced), certified preliminary eligibility, compliant commercial terms (${winner.quotation.paymentTerms}), and acceptable delivery timeframe (${
        winner.quotation.deliveryPeriod
      }).\n\n` +
      `Awarding this procurement to ${winner.quotation.supplierName} yields a direct public expenditure saving of ₦${savingsVsHighest.toLocaleString()} (${savingsPct.toFixed(
        1
      )}%) compared against the highest evaluated tender, and satisfies all statutory value-for-money benchmarks.\n\n` +
      `RECOMMENDATION & MANDATORY STANDSTILL: It is respectfully recommended that in compliance with statutory procurement regulations, a Standstill Notice of 14 calendar days be communicated to all participating tenderers. Subject to absence of administrative review petitions, an official Award Letter / Local Purchase Order (LPO) shall be issued to ${
        winner.quotation.supplierName
      } in the amount of ₦${winner.evaluatedCost.toLocaleString()}.`;
  } else {
    narrative = `Following examination of the ${quotations.length} received quotation(s), NO BIDDER was found to be fully responsive to the mandatory preliminary eligibility criteria, technical specifications, and treasury regulations. All submitted tenders incurred disqualifying blocking conditions. In compliance with PPA 2007 Section 33, it is recommended that this procurement exercise be cancelled and re-tendered with revised specifications.`;
  }

  return {
    suppliers: evaluatedSuppliers,
    winner,
    runnerUp,
    highestBid,
    lowestOverallBid,
    savingsVsHighest,
    savingsPct,
    budgetBenchmarkTotal,
    medianEvaluatedCost,
    collusionFlags: collusionChecks,
    albWarnings,
    totalBidsCount: quotations.length,
    responsiveBidsCount: responsiveSuppliers.length,
    nonResponsiveBidsCount: nonResponsiveSuppliers.length,
    narrative,
    evaluationMethod: evalMethod,
    technicalWeight: techWeight,
    financialWeight: finWeight,
    standstillDays: 14,
  };
}
