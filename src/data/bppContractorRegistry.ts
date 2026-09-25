/**
 * Bureau of Public Procurement (BPP) National Database of Federal Contractors,
 * Consultants and Service Providers (NDCCSP)
 * 
 * Statutory Reference:
 * - Public Procurement Act (PPA) 2007 Section 5(h) & Section 6(1)(f)
 * - BPP Categorization & Classification Guidelines for Federal Contractors
 * - Mandatory requirement for issuance of Interim Registration Report (IRR)
 */

export interface BppContractorRecord {
  id: string;
  irrNumber: string;
  companyName: string;
  rcNumber: string;
  tin: string;
  category: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  sector: 'Civil Works & Infrastructure' | 'Electrical & Power Engineering' | 'Consultancy & Technical Services' | 'ICT & Telecommunications' | 'Specialized Marine & PPE Supplies' | 'Healthcare & Laboratory Equipment';
  singleContractLimit: number;
  averageAnnualTurnover: number;
  netWorth: number;
  status: 'Approved' | 'Suspended' | 'Expired' | 'Under Review';
  validUntil: string;
  firsTccStatus: 'Valid' | 'Expired' | 'Flagged';
  pencomStatus: 'Compliant' | 'Defaulting';
  itfStatus: 'Compliant' | 'Defaulting';
  nsitfStatus: 'Compliant' | 'Defaulting';
  swornAffidavitFiled: boolean;
  bppCertificateRef: string;
  registeredProfessionals: {
    corenEngineers: number;
    qsRbnSurveyors: number;
    corbonBuilders: number;
    arconArchitects: number;
  };
  plantAndEquipmentScorePct: number;
  auditedYearsCount: number;
  headOfficeAddress: string;
  managingDirector: string;
  federalTrackRecord: Array<{
    projectTitle: string;
    procuringEntity: string;
    contractValue: number;
    completionYear: number;
    performanceRating: 'Satisfactory' | 'Exemplary' | 'Delinquent';
  }>;
}

export interface BppCategoryThreshold {
  category: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  title: string;
  worksMaxContractValue: number;
  minAverageTurnover: number;
  minKeyEngineers: number;
  minAuditedYears: number;
  description: string;
  typicalScope: string;
}

export const BPP_CATEGORY_THRESHOLDS: BppCategoryThreshold[] = [
  {
    category: 'A',
    title: 'Category A (Mega Infrastructure & National Priority)',
    worksMaxContractValue: 100_000_000_000, // Unlimited / up to N100B+
    minAverageTurnover: 5_000_000_000,
    minKeyEngineers: 12,
    minAuditedYears: 3,
    description: 'Federal highways, international airports, dual-carriage expressways, ports, dams, hydro-electric stations.',
    typicalScope: 'Unrestricted single contract ceiling exceeding ₦10 Billion.'
  },
  {
    category: 'B',
    title: 'Category B (Major Civil & Structural Works)',
    worksMaxContractValue: 5_000_000_000, // Up to N5 Billion
    minAverageTurnover: 1_500_000_000,
    minKeyEngineers: 8,
    minAuditedYears: 3,
    description: 'Inter-state arterial roads, multi-storey federal secretariats, university teaching hospitals, large water schemes.',
    typicalScope: 'Single contract limit up to ₦5.0 Billion.'
  },
  {
    category: 'C',
    title: 'Category C (Medium Construction & Engineering)',
    worksMaxContractValue: 1_500_000_000, // Up to N1.5 Billion
    minAverageTurnover: 500_000_000,
    minKeyEngineers: 5,
    minAuditedYears: 3,
    description: 'State feeder roads, institutional buildings, secondary power substations, regional water storage.',
    typicalScope: 'Single contract limit up to ₦1.5 Billion.'
  },
  {
    category: 'D',
    title: 'Category D (Intermediate Works & Specialized Supplies)',
    worksMaxContractValue: 500_000_000, // Up to N500 Million
    minAverageTurnover: 150_000_000,
    minKeyEngineers: 3,
    minAuditedYears: 3,
    description: 'Culverts and drainage channels, rural electrification, classroom blocks, specialized equipment supplies.',
    typicalScope: 'Single contract limit up to ₦500 Million.'
  },
  {
    category: 'E',
    title: 'Category E (Small Works & General Supplies)',
    worksMaxContractValue: 100_000_000, // Up to N100 Million
    minAverageTurnover: 30_000_000,
    minKeyEngineers: 1,
    minAuditedYears: 3,
    description: 'Building renovations, borehole drilling, solar street lighting, standard goods distribution.',
    typicalScope: 'Single contract limit up to ₦100 Million.'
  },
  {
    category: 'F',
    title: 'Category F (Micro / SME & Minor Repairs)',
    worksMaxContractValue: 25_000_000, // Up to N25 Million
    minAverageTurnover: 5_000_000,
    minKeyEngineers: 0,
    minAuditedYears: 1,
    description: 'Minor maintenance, printing, office stationery, minor artisanal repairs.',
    typicalScope: 'Single contract limit up to ₦25 Million.'
  }
];

export const BPP_FEDERAL_CONTRACTORS_DATABASE: BppContractorRecord[] = [
  {
    id: 'bpp-rec-001',
    irrNumber: 'BPP/IRR/2026/884102',
    companyName: 'Julius Berger Nigeria Plc',
    rcNumber: 'RC-6852',
    tin: '00124890-0001',
    category: 'A',
    sector: 'Civil Works & Infrastructure',
    singleContractLimit: 150_000_000_000,
    averageAnnualTurnover: 185_000_000_000,
    netWorth: 62_000_000_000,
    status: 'Approved',
    validUntil: '2026-12-31',
    firsTccStatus: 'Valid',
    pencomStatus: 'Compliant',
    itfStatus: 'Compliant',
    nsitfStatus: 'Compliant',
    swornAffidavitFiled: true,
    bppCertificateRef: 'BPP/NDCCSP/CERT/2026/A-0014',
    registeredProfessionals: {
      corenEngineers: 45,
      qsRbnSurveyors: 18,
      corbonBuilders: 12,
      arconArchitects: 8
    },
    plantAndEquipmentScorePct: 98,
    auditedYearsCount: 3,
    headOfficeAddress: '10 Shettima A. Munguno Crescent, Utako, Abuja FCT',
    managingDirector: 'Dr. Lars Richter',
    federalTrackRecord: [
      {
        projectTitle: 'Second Niger Bridge Construction & Access Roads Phase 2A',
        procuringEntity: 'Federal Ministry of Works',
        contractValue: 206_000_000_000,
        completionYear: 2023,
        performanceRating: 'Exemplary'
      },
      {
        projectTitle: 'Abuja-Kaduna-Zaria-Kano Dual Carriageway Reconstruction',
        procuringEntity: 'Federal Ministry of Works',
        contractValue: 155_000_000_000,
        completionYear: 2024,
        performanceRating: 'Satisfactory'
      }
    ]
  },
  {
    id: 'bpp-rec-002',
    irrNumber: 'BPP/IRR/2026/441290',
    companyName: 'Reynolds Construction Company (RCC) Nigeria Ltd',
    rcNumber: 'RC-14920',
    tin: '00984321-0001',
    category: 'A',
    sector: 'Civil Works & Infrastructure',
    singleContractLimit: 85_000_000_000,
    averageAnnualTurnover: 72_000_000_000,
    netWorth: 28_000_000_000,
    status: 'Approved',
    validUntil: '2026-12-31',
    firsTccStatus: 'Valid',
    pencomStatus: 'Compliant',
    itfStatus: 'Compliant',
    nsitfStatus: 'Compliant',
    swornAffidavitFiled: true,
    bppCertificateRef: 'BPP/NDCCSP/CERT/2026/A-0089',
    registeredProfessionals: {
      corenEngineers: 32,
      qsRbnSurveyors: 14,
      corbonBuilders: 9,
      arconArchitects: 4
    },
    plantAndEquipmentScorePct: 94,
    auditedYearsCount: 3,
    headOfficeAddress: 'Plot 318, Central Business District, Abuja FCT',
    managingDirector: 'Engr. N. Goldenberg',
    federalTrackRecord: [
      {
        projectTitle: 'Reconstruction of Benin-Ofosu-Ore-Sagamu Expressway Section IV',
        procuringEntity: 'Federal Ministry of Works',
        contractValue: 48_500_000_000,
        completionYear: 2023,
        performanceRating: 'Satisfactory'
      }
    ]
  },
  {
    id: 'bpp-rec-003',
    irrNumber: 'BPP/IRR/2026/773194',
    companyName: 'Apex Precision Engineering & Logistics Ltd',
    rcNumber: 'RC-1294821',
    tin: '22849102-0001',
    category: 'C',
    sector: 'Specialized Marine & PPE Supplies',
    singleContractLimit: 1_500_000_000,
    averageAnnualTurnover: 840_000_000,
    netWorth: 310_000_000,
    status: 'Approved',
    validUntil: '2026-10-15',
    firsTccStatus: 'Valid',
    pencomStatus: 'Compliant',
    itfStatus: 'Compliant',
    nsitfStatus: 'Compliant',
    swornAffidavitFiled: true,
    bppCertificateRef: 'BPP/NDCCSP/CERT/2026/C-1142',
    registeredProfessionals: {
      corenEngineers: 6,
      qsRbnSurveyors: 3,
      corbonBuilders: 2,
      arconArchitects: 1
    },
    plantAndEquipmentScorePct: 88,
    auditedYearsCount: 3,
    headOfficeAddress: 'Plot 14, Trans-Amadi Industrial Layout, Port Harcourt, Rivers State',
    managingDirector: 'Engr. Tariere Briggs',
    federalTrackRecord: [
      {
        projectTitle: 'Supply of Specialized Marine Survival & Oil Spill PPE Kits',
        procuringEntity: 'Nigerian Maritime Administration and Safety Agency (NIMASA)',
        contractValue: 340_000_000,
        completionYear: 2024,
        performanceRating: 'Exemplary'
      }
    ]
  },
  {
    id: 'bpp-rec-004',
    irrNumber: 'BPP/IRR/2026/193842',
    companyName: 'Sahara Offshore Marine Services Ltd',
    rcNumber: 'RC-998341',
    tin: '19482019-0001',
    category: 'C',
    sector: 'Specialized Marine & PPE Supplies',
    singleContractLimit: 1_200_000_000,
    averageAnnualTurnover: 710_000_000,
    netWorth: 260_000_000,
    status: 'Approved',
    validUntil: '2026-11-20',
    firsTccStatus: 'Valid',
    pencomStatus: 'Compliant',
    itfStatus: 'Compliant',
    nsitfStatus: 'Compliant',
    swornAffidavitFiled: true,
    bppCertificateRef: 'BPP/NDCCSP/CERT/2026/C-0982',
    registeredProfessionals: {
      corenEngineers: 4,
      qsRbnSurveyors: 2,
      corbonBuilders: 1,
      arconArchitects: 1
    },
    plantAndEquipmentScorePct: 84,
    auditedYearsCount: 3,
    headOfficeAddress: '22 Marine Road, Apapa, Lagos State',
    managingDirector: 'Capt. Babatunde Sanusi',
    federalTrackRecord: [
      {
        projectTitle: 'Procurement of Rapid Response Inflatable Rescue Craft',
        procuringEntity: 'Federal Ministry of Marine & Blue Economy',
        contractValue: 410_000_000,
        completionYear: 2024,
        performanceRating: 'Satisfactory'
      }
    ]
  },
  {
    id: 'bpp-rec-005',
    irrNumber: 'BPP/IRR/2025/002914',
    companyName: 'Delta Maritime Safety & Equipment Ltd',
    rcNumber: 'RC-1048291',
    tin: '10482910-0001',
    category: 'D',
    sector: 'Specialized Marine & PPE Supplies',
    singleContractLimit: 450_000_000,
    averageAnnualTurnover: 280_000_000,
    netWorth: 95_000_000,
    status: 'Expired',
    validUntil: '2025-12-31',
    firsTccStatus: 'Expired',
    pencomStatus: 'Defaulting',
    itfStatus: 'Compliant',
    nsitfStatus: 'Defaulting',
    swornAffidavitFiled: false,
    bppCertificateRef: 'BPP/NDCCSP/CERT/2025/D-4418',
    registeredProfessionals: {
      corenEngineers: 1,
      qsRbnSurveyors: 1,
      corbonBuilders: 0,
      arconArchitects: 0
    },
    plantAndEquipmentScorePct: 52,
    auditedYearsCount: 2,
    headOfficeAddress: 'Warri-Sapele Road, Effurun, Delta State',
    managingDirector: 'Chief Ovie Mukoro',
    federalTrackRecord: [
      {
        projectTitle: 'Supply of Fire Fighting Foam & Extinguishers',
        procuringEntity: 'Nigerian Ports Authority (NPA)',
        contractValue: 120_000_000,
        completionYear: 2022,
        performanceRating: 'Satisfactory'
      }
    ]
  },
  {
    id: 'bpp-rec-006',
    irrNumber: 'BPP/IRR/2026/558291',
    companyName: 'Helios Renewable Power Systems Ltd',
    rcNumber: 'RC-1449210',
    tin: '30291840-0001',
    category: 'B',
    sector: 'Electrical & Power Engineering',
    singleContractLimit: 4_500_000_000,
    averageAnnualTurnover: 2_100_000_000,
    netWorth: 850_000_000,
    status: 'Approved',
    validUntil: '2026-12-31',
    firsTccStatus: 'Valid',
    pencomStatus: 'Compliant',
    itfStatus: 'Compliant',
    nsitfStatus: 'Compliant',
    swornAffidavitFiled: true,
    bppCertificateRef: 'BPP/NDCCSP/CERT/2026/B-0512',
    registeredProfessionals: {
      corenEngineers: 11,
      qsRbnSurveyors: 4,
      corbonBuilders: 2,
      arconArchitects: 2
    },
    plantAndEquipmentScorePct: 91,
    auditedYearsCount: 3,
    headOfficeAddress: 'Victoria Island Tech Park, Lagos State',
    managingDirector: 'Dr. (Mrs.) Folashade Adeleke',
    federalTrackRecord: [
      {
        projectTitle: 'Design & Installation of 2.5MW Hybrid Solar Mini-Grid System',
        procuringEntity: 'Rural Electrification Agency (REA)',
        contractValue: 1_450_000_000,
        completionYear: 2024,
        performanceRating: 'Exemplary'
      }
    ]
  },
  {
    id: 'bpp-rec-007',
    irrNumber: 'BPP/IRR/2026/339182',
    companyName: 'Savannah Bitumen & Asphalt Infrastructure Ltd',
    rcNumber: 'RC-841920',
    tin: '18491029-0001',
    category: 'B',
    sector: 'Civil Works & Infrastructure',
    singleContractLimit: 4_000_000_000,
    averageAnnualTurnover: 1_950_000_000,
    netWorth: 680_000_000,
    status: 'Approved',
    validUntil: '2026-12-31',
    firsTccStatus: 'Valid',
    pencomStatus: 'Compliant',
    itfStatus: 'Compliant',
    nsitfStatus: 'Compliant',
    swornAffidavitFiled: true,
    bppCertificateRef: 'BPP/NDCCSP/CERT/2026/B-0784',
    registeredProfessionals: {
      corenEngineers: 9,
      qsRbnSurveyors: 4,
      corbonBuilders: 3,
      arconArchitects: 1
    },
    plantAndEquipmentScorePct: 89,
    auditedYearsCount: 3,
    headOfficeAddress: 'Kilometer 12, Kaduna-Zaria Expressway, Kaduna',
    managingDirector: 'Alhaji Mansur Danbatta',
    federalTrackRecord: [
      {
        projectTitle: 'Overlay of 42km Federal Trunk A Highway Section',
        procuringEntity: 'Federal Ministry of Works',
        contractValue: 2_800_000_000,
        completionYear: 2024,
        performanceRating: 'Satisfactory'
      }
    ]
  }
];

/**
 * Validate whether a contractor's BPP category allows them to bid for a contract
 * of the given amount under BPP Classification Rules
 */
export function validateContractorBppLimit(
  contractor: BppContractorRecord,
  proposedContractSum: number
): {
  isEligible: boolean;
  categoryLimit: number;
  excessAmount: number;
  reason: string;
} {
  const threshold = BPP_CATEGORY_THRESHOLDS.find((t) => t.category === contractor.category);
  const categoryLimit = contractor.singleContractLimit || (threshold?.worksMaxContractValue ?? 0);
  
  if (proposedContractSum > categoryLimit) {
    const excessAmount = proposedContractSum - categoryLimit;
    return {
      isEligible: false,
      categoryLimit,
      excessAmount,
      reason: `Proposed Contract Sum exceeds BPP Category ${contractor.category} authorized single contract limit of ₦${(categoryLimit / 1_000_000).toLocaleString()}M by ₦${(excessAmount / 1_000_000).toLocaleString()}M.`
    };
  }

  if (contractor.status !== 'Approved') {
    return {
      isEligible: false,
      categoryLimit,
      excessAmount: 0,
      reason: `Contractor BPP status is currently '${contractor.status}' (Valid Until: ${contractor.validUntil}). A valid approved IRR is mandatory under PPA 2007 Section 5(h).`
    };
  }

  if (contractor.firsTccStatus !== 'Valid' || contractor.pencomStatus !== 'Compliant' || contractor.itfStatus !== 'Compliant' || contractor.nsitfStatus !== 'Compliant') {
    return {
      isEligible: false,
      categoryLimit,
      excessAmount: 0,
      reason: `Contractor failed statutory clearance check (TCC: ${contractor.firsTccStatus}, PENCOM: ${contractor.pencomStatus}, ITF: ${contractor.itfStatus}, NSITF: ${contractor.nsitfStatus}).`
    };
  }

  return {
    isEligible: true,
    categoryLimit,
    excessAmount: 0,
    reason: `Compliant with BPP Category ${contractor.category} thresholds. Authorized limit: ₦${(categoryLimit / 1_000_000).toLocaleString()}M.`
  };
}

/**
 * Helper to calculate what BPP Category a contractor qualifies for based on self-assessment
 */
export function calculateEligibleBppCategory(data: {
  annualTurnover: number;
  netWorth: number;
  corenEngineers: number;
  plantScorePct: number;
  auditedYears: number;
}): {
  assignedCategory: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  maxAuthorizedValue: number;
  bottleneck: string;
} {
  const { annualTurnover, corenEngineers, auditedYears } = data;

  if (auditedYears < 1) {
    return {
      assignedCategory: 'F',
      maxAuthorizedValue: 25_000_000,
      bottleneck: 'Firms with less than 1 year audited accounts are restricted to Micro Category F.'
    };
  }

  if (annualTurnover >= 5_000_000_000 && corenEngineers >= 12 && auditedYears >= 3) {
    return {
      assignedCategory: 'A',
      maxAuthorizedValue: 100_000_000_000,
      bottleneck: 'Fully qualified for Category A (Unlimited Mega Infrastructure).'
    };
  }

  if (annualTurnover >= 1_500_000_000 && corenEngineers >= 8 && auditedYears >= 3) {
    return {
      assignedCategory: 'B',
      maxAuthorizedValue: 5_000_000_000,
      bottleneck: corenEngineers < 12 ? 'Needs minimum 12 COREN engineers to advance to Category A.' : 'Turnover below ₦5B threshold for Category A.'
    };
  }

  if (annualTurnover >= 500_000_000 && corenEngineers >= 5 && auditedYears >= 3) {
    return {
      assignedCategory: 'C',
      maxAuthorizedValue: 1_500_000_000,
      bottleneck: annualTurnover < 1_500_000_000 ? 'Turnover below ₦1.5B for Category B.' : 'Key engineering personnel below Category B requirement.'
    };
  }

  if (annualTurnover >= 150_000_000 && corenEngineers >= 3) {
    return {
      assignedCategory: 'D',
      maxAuthorizedValue: 500_000_000,
      bottleneck: 'Annual turnover qualifies for Category D (₦500M Single Contract Cap).'
    };
  }

  if (annualTurnover >= 30_000_000 && corenEngineers >= 1) {
    return {
      assignedCategory: 'E',
      maxAuthorizedValue: 100_000_000,
      bottleneck: 'Turnover and personnel qualify for Category E (Small Works up to ₦100M).'
    };
  }

  return {
    assignedCategory: 'F',
    maxAuthorizedValue: 25_000_000,
    bottleneck: 'Classified under Category F (Micro / SME & Minor Repairs).'
  };
}
