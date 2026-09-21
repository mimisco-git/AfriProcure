export interface PpaSection {
  sectionNumber: string;
  part: string;
  partTitle: string;
  title: string;
  legalTextSummary: string;
  practicalApplication: string;
  complianceChecks: string[];
  penaltiesOrConsequences: string;
}

export interface BppThresholdRule {
  approvingAuthority: string;
  authorityLevel: 'FEC' | 'MTB' | 'PTB' | 'AccountingOfficer';
  goodsAndServicesMin: number;
  goodsAndServicesMax: number | null; // null means and above
  worksMin: number;
  worksMax: number | null;
  requiresBppCertificateOfNoObjection: boolean;
  tenderMethodMandatory: string;
  description: string;
}

export const PPA_2007_SECTIONS_REGISTRY: PpaSection[] = [
  {
    sectionNumber: 'Section 16',
    part: 'Part IV',
    partTitle: 'Fundamental Principles for Procurements',
    title: 'Fundamental Principles for Public Procurement',
    legalTextSummary: 'All public procurement must be conducted based on procurement plans supported by prior budgetary appropriations, executed with open competitive bidding, transparent, timely, equitable, and ensuring best value for money without bid splitting.',
    practicalApplication: 'Procuring Entities must establish annual procurement plans approved by their Tenders Board and confirmed against the statutory national budget (Appropriation Act). Contracts must not be fragmented into smaller lots to evade approval thresholds.',
    complianceChecks: [
      'Procurement plan approved prior to tender release',
      'Certificate of Budgetary Appropriation issued',
      'No intentional tender splitting (Section 58(4)(d))',
      'Environmental and local content impact considered'
    ],
    penaltiesOrConsequences: 'Contracts awarded without budgetary appropriation or through tender splitting are void ab initio. Public officers are liable under Section 58 to 5 years imprisonment.'
  },
  {
    sectionNumber: 'Section 17',
    part: 'Part IV',
    partTitle: 'Fundamental Principles for Procurements',
    title: 'Approving Authorities & Ministerial/Parastatal Tenders Boards',
    legalTextSummary: 'Establishes the Accounting Officer (Permanent Secretary/Director-General), the Parastatal Tenders Board (PTB), Ministerial Tenders Board (MTB), and Federal Executive Council (FEC) as approving authorities within gazetted financial thresholds.',
    practicalApplication: 'Determines the exact legal approval tier required for tender award and variations based on the current financial thresholds issued by the National Council on Public Procurement / BPP.',
    complianceChecks: [
      'Evaluation report submitted to appropriate Tenders Board',
      'Quorum formed by certified procurement officers',
      'No officer acting beyond delegated financial threshold',
      'Minutes and evaluation matrix signed and archived'
    ],
    penaltiesOrConsequences: 'Awarding above legal threshold without BPP Certificate of No Objection invalidates the contract.'
  },
  {
    sectionNumber: 'Section 24',
    part: 'Part V',
    partTitle: 'Procurement Methods (Goods and Works)',
    title: 'National Competitive Bidding as Default Procurement Method',
    legalTextSummary: 'Except as otherwise provided by the Act, all public procurements of goods and works shall be conducted by Open Competitive Bidding to ensure widest participation and market contestability.',
    practicalApplication: 'Restricts selective tendering, emergency procurement, or direct single-source procurement to exceptional statutory criteria (Sections 40-43) requiring explicit BPP clearance.',
    complianceChecks: [
      'Published in at least 2 national daily newspapers and Federal Tenders Journal',
      'Minimum advertising period of 6 weeks observed',
      'Public bid opening conducted immediately following bid submission deadline',
      'Civil society and professional bodies (NIQS/NSE) invited as independent observers'
    ],
    penaltiesOrConsequences: 'Procurements conducted via unapproved selective methods are null and void.'
  },
  {
    sectionNumber: 'Section 26',
    part: 'Part V',
    partTitle: 'Procurement Methods (Goods and Works)',
    title: 'Bid Security & Tender Guarantee Requirements',
    legalTextSummary: 'Procuring entities may require a bid security not exceeding 2% of the tender sum in the form of a bank guarantee or insurance bond from a reputable financial institution to ensure bidder commitment.',
    practicalApplication: 'Protects the government against frivolous bids or bidders withdrawing tenders before expiration of bid validity period.',
    complianceChecks: [
      'Bid security value equals 1% - 2% of total tender sum',
      'Issued by licensed commercial bank or BPP-approved insurer',
      'Validity period extends minimum 28 days beyond tender validity',
      'Promptly returned to unsuccessful bidders upon contract award'
    ],
    penaltiesOrConsequences: 'Bid without compliant bid security must be rejected as non-responsive.'
  },
  {
    sectionNumber: 'Section 31',
    part: 'Part V',
    partTitle: 'Procurement Methods (Goods and Works)',
    title: 'Examination, Arithmetical Corrections & Unacceptable Price Adjustments',
    legalTextSummary: 'Bids shall be evaluated strictly on criteria stipulated in bidding documents. Only purely arithmetical errors may be corrected with written notice to the bidder. Substantial price adjustments or unilateral alterations after tender opening constitute major deviations resulting in rejection.',
    practicalApplication: 'Prevents post-tender price tampering while enabling formal arithmetical verification. Mandates that contract price adjustment must follow explicit contractual formula stipulated in the bidding documents rather than arbitrary post-award claims.',
    complianceChecks: [
      'Unit rates multiplied by bill of quantities verified arithmetically',
      'Discrepancies between words and figures resolved in favor of words',
      'Notice of arithmetical correction communicated and formally accepted',
      'No post-opening price negotiation permitted during evaluation'
    ],
    penaltiesOrConsequences: 'Tenders containing unacceptable price adjustments are disqualified (Sec 31(7)).'
  },
  {
    sectionNumber: 'Section 34',
    part: 'Part V',
    partTitle: 'Procurement Methods (Goods and Works)',
    title: 'Domestic Margin of Preference (7.5% Works / 15% Goods)',
    legalTextSummary: 'A Procuring Entity may grant a margin of preference to domestic contractors or locally manufactured goods. In works contracts, a 7.5% preference margin is applied against foreign tenders during financial comparison.',
    practicalApplication: 'In tender evaluation, foreign bids are multiplied by 1.075 (or domestic bids discounted) to protect Nigerian engineering capacity and local employment without sacrificing value for money.',
    complianceChecks: [
      'Domestic equity participation verified at Corporate Affairs Commission (CAC)',
      'Local manufacturing/assembly certification confirmed',
      '7.5% margin applied strictly at financial evaluation stage',
      'Calculation documented in Tender Evaluation Report'
    ],
    penaltiesOrConsequences: 'Failure to apply statutory margin of preference can be challenged by local contractors via administrative review (Section 54).'
  },
  {
    sectionNumber: 'Section 35',
    part: 'Part V',
    partTitle: 'Procurement Methods (Goods and Works)',
    title: 'Mobilization Fee / Advance Payment & Mandatory Bank Guarantee',
    legalTextSummary: 'Advance payments for mobilization shall not exceed 15% of the contract price (amended up to 30% for local firms in specialized bills) and must be backed 100% by an unconditional, irrevocable bank guarantee. Accessing mobilization fees and absconding or failing to execute commensurate works carries criminal imprisonment.',
    practicalApplication: 'Regulates working capital deployment to contractors while safeguarding treasury funds through first-demand bank guarantees.',
    complianceChecks: [
      'Advance payment capped within statutory threshold (15% - 30%)',
      'Unconditional, irrevocable Bank Guarantee or Insurance Bond obtained',
      'Advance recovery schedule structured across interim certificates',
      'Physical site mobilization confirmed by Supervising Engineer prior to release'
    ],
    penaltiesOrConsequences: 'Section 35(3): 2-year imprisonment or fine equivalent to the fee accessed for abandonment or non-performance.'
  },
  {
    sectionNumber: 'Section 39',
    part: 'Part V',
    partTitle: 'Procurement Methods (Goods and Works)',
    title: 'Contract Price Adjustment & Fluctuation Provisions',
    legalTextSummary: 'While public contracts are tendered on fixed baseline prices, contracts exceeding 18 months or exposed to severe macroeconomic volatility may provide for price adjustment using an objective mathematical formula linked to published official price indices.',
    practicalApplication: 'The statutory anchor for AfriProcure: replaces subjective contractor variation claims with FIDIC 13.8 mathematical indexation based on NBS and CBN official indicators.',
    complianceChecks: [
      'Price adjustment clause expressly included in Special Conditions of Contract',
      'Fixed non-adjustable coefficient (a0 >= 0.10) protects public treasury',
      'Independent statistical indices (NBS, NMDPRA, CBN) specified in bidding documents',
      'Interim payment certificates mathematically derived without manual discretion'
    ],
    penaltiesOrConsequences: 'Arbitrary variation claims without BPP Certificate of No Objection are illegal and recoverable by the Auditor-General.'
  },
  {
    sectionNumber: 'Section 54',
    part: 'Part VIII',
    partTitle: 'Administrative Review and Dispute Settlement',
    title: 'Administrative Review & Contractor Right of Protest',
    legalTextSummary: 'Any bidder who claims to have suffered loss or injury due to a breach of duty by a procuring entity may submit a written complaint to the Accounting Officer within 15 working days, and thereafter appeal to the Director-General of the BPP.',
    practicalApplication: 'Guarantees due process and rapid administrative remediation before court litigation or project standstill.',
    complianceChecks: [
      'Complaint filed within 15 working days of publication of notice of award',
      'Procuring entity suspends procurement proceedings upon receipt',
      'Accounting officer delivers written decision within 15 working days',
      'Right of escalation to Bureau of Public Procurement preserved'
    ],
    penaltiesOrConsequences: 'BPP may nullify illegal awards or order fresh evaluation.'
  },
  {
    sectionNumber: 'Section 58',
    part: 'Part XII',
    partTitle: 'Offences Relating to Public Procurement',
    title: 'Procurement Offences, Criminal Penalties & Sanctions',
    legalTextSummary: 'Criminalizes bid-rigging, collusion, tender splitting, false document submission (TCC/PENCOM), conflict of interest, and illicit influence. Prescribes severe mandatory jail terms without option of fine.',
    practicalApplication: 'Enforces accountability across both public officers and private contracting executives.',
    complianceChecks: [
      'Anti-collusion affidavit submitted with tender',
      'CAC beneficial ownership verified for common directorships',
      'FIRS Tax Clearance Certificate authenticated via online portal',
      'PENCOM and ITF contribution receipts verified directly with agencies'
    ],
    penaltiesOrConsequences: 'Public Officers: 5 years imprisonment without option of fine + summary dismissal. Contractors: 5 to 10 years imprisonment + 25% procurement value fine + 5 years corporate debarment. Directors: 3 to 5 years imprisonment.'
  }
];

export const BPP_THRESHOLD_MATRIX_2025: BppThresholdRule[] = [
  {
    approvingAuthority: 'Federal Executive Council (FEC)',
    authorityLevel: 'FEC',
    goodsAndServicesMin: 5_000_000_000,
    goodsAndServicesMax: null,
    worksMin: 10_000_000_000,
    worksMax: null,
    requiresBppCertificateOfNoObjection: true,
    tenderMethodMandatory: 'International / National Open Competitive Bidding',
    description: 'Mega infrastructure and federal capital works (₦10B+) requiring Presidential Cabinet approval and mandatory BPP Due Diligence Certification.'
  },
  {
    approvingAuthority: 'Ministerial Tenders Board (MTB)',
    authorityLevel: 'MTB',
    goodsAndServicesMin: 1_000_000_000,
    goodsAndServicesMax: 4_999_999_999,
    worksMin: 5_000_000_000,
    worksMax: 9_999_999_999,
    requiresBppCertificateOfNoObjection: true,
    tenderMethodMandatory: 'National Open Competitive Bidding',
    description: 'Major ministry capital projects approved by Permanent Secretary & Board with mandatory BPP Certificate of No Objection.'
  },
  {
    approvingAuthority: 'Parastatal Tenders Board (PTB)',
    authorityLevel: 'PTB',
    goodsAndServicesMin: 100_000_000,
    goodsAndServicesMax: 999_999_999,
    worksMin: 250_000_000,
    worksMax: 4_999_999_999,
    requiresBppCertificateOfNoObjection: false,
    tenderMethodMandatory: 'National Open Competitive Bidding',
    description: 'Agency / parastatal contracts approved by Director-General & Governing Board within delegated authority.'
  },
  {
    approvingAuthority: 'Accounting Officer (Director-General / Permanent Secretary)',
    authorityLevel: 'AccountingOfficer',
    goodsAndServicesMin: 0,
    goodsAndServicesMax: 99_999_999,
    worksMin: 0,
    worksMax: 249_999_999,
    requiresBppCertificateOfNoObjection: false,
    tenderMethodMandatory: 'Open Competitive / Selective Quotation (under statutory rules)',
    description: 'Direct administrative threshold for minor capital works (< ₦250M) and goods (< ₦100M).'
  }
];

export function determinePpaApprovalTier(amount: number, isWorks: boolean = true) {
  for (const rule of BPP_THRESHOLD_MATRIX_2025) {
    if (isWorks) {
      if (amount >= rule.worksMin && (rule.worksMax === null || amount <= rule.worksMax)) {
        return rule;
      }
    } else {
      if (amount >= rule.goodsAndServicesMin && (rule.goodsAndServicesMax === null || amount <= rule.goodsAndServicesMax)) {
        return rule;
      }
    }
  }
  return BPP_THRESHOLD_MATRIX_2025[BPP_THRESHOLD_MATRIX_2025.length - 1];
}
