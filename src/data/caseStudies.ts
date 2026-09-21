export interface ProcurementCaseStudy {
  id: string;
  title: string;
  subtitle: string;
  country: string;
  sector: 'transport' | 'health' | 'energy' | 'urban';
  originalContractSum: string;
  actualEscalationReq: string;
  macroTrigger: string;
  procurementMechanism: string;
  unadjustedOutcome: string;
  cpaAlgorithmicOutcome: string;
  institutionalAuditLesson: string;
  keyMetrics: { label: string; value: string; trend: 'up' | 'down' | 'neutral' }[];
}

export const REAL_WORLD_CASE_STUDIES: ProcurementCaseStudy[] = [
  {
    id: 'case-highway-nigeria',
    title: 'Trans-Sahara Highway Corridor Rehabilitation (48km)',
    subtitle: 'Triple Shock: Naira Devaluation, Diesel Subsidy Removal & Cement Cartel Pricing',
    country: 'Nigeria',
    sector: 'transport',
    originalContractSum: '₦14.50 Billion (USD ~31.5M at ₦460/$)',
    actualEscalationReq: '+82.4% (Revised to ₦26.45 Billion)',
    macroTrigger: 'Naira floated from ₦460 to ₦1,540/$, industrial diesel surged from ₦720 to ₦1,380/L, cement jumped from ₦4,200 to ₦8,200/bag within 14 months.',
    procurementMechanism: 'PPA 2007 Section 39 / FIDIC Conditions of Contract (Pink Book)',
    unadjustedOutcome: 'Contractor suffered -44% negative operational cashflow on asphalt and earthworks, laid off 420 site workers, and demobilized equipment. The project became stalled for 22 months awaiting Federal Executive Council (FEC) manual variation approval.',
    cpaAlgorithmicOutcome: 'Under automated CPA indexation, Interim Payment Certificates (IPCs) automatically adjust month-by-month using published NBS and NMDPRA price indices. The contractor maintains an operational gross margin of +8.2%, works continue uninterrupted, and public funds are verified mathematically without opaque variation negotiations.',
    institutionalAuditLesson: 'Without an automated contractual adjustment mechanism, macroeconomic shocks trigger bilateral contract collapse. Public authorities lose months in renegotiation while inflation continues to compound project cost. Algorithmic indexation provides transparent, non-discretionary continuity.',
    keyMetrics: [
      { label: 'Contractor Margin Without CPA', value: '-44.2%', trend: 'down' },
      { label: 'Contractor Margin With CPA', value: '+8.2%', trend: 'up' },
      { label: 'Site Delay Without CPA', value: '22 Months', trend: 'down' },
      { label: 'Audit Trail Transparency', value: '100% Algorithmic', trend: 'up' },
    ],
  },
  {
    id: 'case-health-medical-import',
    title: 'University Teaching Hospital MRI & Diagnostic Center',
    subtitle: 'Severe Foreign Exchange Shock in Offshore Capital Procurement',
    country: 'Nigeria',
    sector: 'health',
    originalContractSum: '₦4.80 Billion (Fixed NGN tender, 85% offshore equipment content)',
    actualEscalationReq: '+192% (Revised to ₦14.02 Billion)',
    macroTrigger: 'Offshore supplier invoice in Euros (€8.2M). Central Bank of Nigeria unified FX windows, driving official import exchange rate from ₦460 to ₦1,550 per USD/EUR equivalent.',
    procurementMechanism: 'Turnkey Electromechanical & Medical Technology Procurement',
    unadjustedOutcome: 'The prime contractor’s commercial bank refused to open Letters of Credit (LC) at the original Naira commitment without a 200% cash collateral. The diagnostic building stood completed but empty for 3 years while cancer and trauma patients were turned away.',
    cpaAlgorithmicOutcome: 'Dual-currency indexation (PPA Clause 45 FX split): 85% component linked directly to official CBN NAFEM closing rate at bill of lading presentation. The procuring ministry hedged with CBN forward allocation, equipment was delivered within 9 months, and price variance was audited automatically.',
    institutionalAuditLesson: 'Imposing 100% currency exchange volatility onto domestic vendors in import-heavy projects does not save public funds—it guarantees vendor bankruptcy, non-delivery, and abandoned hospitals. Smart contracts must partition foreign currency components.',
    keyMetrics: [
      { label: 'Offshore Exposure', value: '85.0%', trend: 'neutral' },
      { label: 'FX Devaluation Shock', value: '+237%', trend: 'up' },
      { label: 'Hospital Stoppage Time', value: '36 Months', trend: 'down' },
      { label: 'Algorithmic Resolution', value: 'Automated LC Hedge', trend: 'up' },
    ],
  },
  {
    id: 'case-energy-minigrid',
    title: 'Rural Electrification Agency (REA) Solar Mini-Grid Corridors',
    subtitle: 'Global Commodity Indexation & Tariff Volatility in Distributed Energy',
    country: 'West Africa Corridor',
    sector: 'energy',
    originalContractSum: '₦6.20 Billion ($7.8M equivalent)',
    actualEscalationReq: '+38.5% Escalation',
    macroTrigger: 'Lithium carbonate and PV semiconductor global cost surges compounded by domestic road haulage fuel spikes across Northern Nigeria and Niger border.',
    procurementMechanism: 'World Bank / AfDB Financed Performance-Based Public Procurement',
    unadjustedOutcome: 'Vendor requested 60% discretionary variation without itemized index verification. Ministry procurement board suspected price gouging, triggering anti-corruption petitory probes that frozen donor fund disbursements.',
    cpaAlgorithmicOutcome: 'Application of standard mathematical weighting: 40% PV/Inverter (Shanghai Metals Market / BloombergNEF index), 25% battery storage (London Metal Exchange Lithium benchmark), 15% local logistics (NMDPRA diesel), 20% non-adjustable factor. Verified escalation calculated at exactly 38.5%, accepted by AfDB task team in 14 days.',
    institutionalAuditLesson: 'Subjective contractor variation claims breed mutual suspicion and corruption inquiries between MDAs and contractors. Tying contracts to published statistical indices eliminates discretion, protects public treasury, and accelerates multilateral donor approvals.',
    keyMetrics: [
      { label: 'Discretionary Claim', value: '+60.0%', trend: 'up' },
      { label: 'Audited Formula Claim', value: '+38.5%', trend: 'neutral' },
      { label: 'Public Savings Achieved', value: '₦1.33 Billion', trend: 'up' },
      { label: 'Donor Clearance Time', value: '14 Days (vs 18 Mos)', trend: 'up' },
    ],
  },
];

export const ORGANIZATIONAL_PROCUREMENT_BLUEPRINT = {
  operationalPillars: [
    {
      title: 'Mandatory Algorithmic Price Adjustment (CPA) Adoption',
      targetAudience: 'Federal & State Ministries of Works, Housing, Water Resources',
      description: 'Replace discretionary political variation memos with standard FIDIC 13.8 / PPA 2007 Section 39 mathematical indexation in all capital contracts exceeding 12 months or ₦500 Million.',
      actionItems: [
        'Include Standard Price Adjustment Appendix in Special Conditions of Contract (SCC)',
        'Fix minimum non-adjustable overhead factor (a0 >= 0.15) to safeguard public funds',
        'Mandate objective third-party source indices (NBS, CBN NAFEM, NMDPRA)',
      ],
    },
    {
      title: 'National Construction Cost Index (NCCI) Publishing Protocol',
      targetAudience: 'Bureau of Public Procurement (BPP) & National Bureau of Statistics (NBS)',
      description: 'Establish a bi-weekly verified national price index for standard construction commodities to serve as the unified legal basis for all public contract valuations.',
      actionItems: [
        'Institutionalize regional price monitoring across 6 geopolitical zones for Cement, Rebar, Bitumen, and Diesel',
        'Publish digital API feeds for automated ERP and e-procurement certificate calculations',
        'Enforce standardization across Federal, State, and Local Government tenders',
      ],
    },
    {
      title: 'Forensic Screening for Abnormally Low Tenders (ALT) & Bid Rigging',
      targetAudience: 'Ministerial & Parastatal Tenders Boards (MTB/PTB)',
      description: 'Prevent the "Winner’s Curse" and deliberate under-bidding by suicidal contractors who bid below real direct costs intending to demand variations later.',
      actionItems: [
        'Automatically flag any tender priced < 80% of independent Engineer’s Estimate',
        'Require detailed unit-rate rate breakdown analysis before considering low bids responsive',
        'Screen corporate registries (CAC) and beneficial ownership clusters for cartel cover bidding (PPA Section 58)',
      ],
    },
    {
      title: 'Statutory 7.5% Domestic Preference Enforcement',
      targetAudience: 'Public Procurement Officers & Evaluation Committees',
      description: 'Operationalize Section 34(1) of the PPA 2007 to empower Nigerian engineering talent and domestic manufacturing without compromising value for money.',
      actionItems: [
        'Apply 7.5% margin of preference to domestic contractors in civil works evaluation',
        'Verify Nigerian engineering equity and COREN/NIQS certified personnel on site',
        'Protect local employment while auditing compliance against tax, PENCOM, and ITF mandates',
      ],
    },
  ],
  institutionalSops: [
    {
      entity: 'Federal & State MDAs',
      sop: 'Ensure all contract awards exceeding statutory thresholds carry verified BPP Certificates of No Objection, 100% bank-guaranteed advance payments, and strict formula-based IPC valuation sheets.',
    },
    {
      entity: 'Construction Contractors & JVs',
      sop: 'Incorporate realistic material component weights (Cement, Steel, Fuel, Labor) at tender stage; maintain audit trails of verified index variations to substantiate milestone valuation claims without litigation.',
    },
    {
      entity: 'Registered Quantity Surveyors (NIQS)',
      sop: 'Audit mathematical derivation sheets (Pn multipliers) on every interim certificate; independently verify source indices against NBS and NMDPRA bulletins prior to signing off valuation certificates.',
    },
    {
      entity: 'Auditor-General & Anti-Corruption Bodies (ICPC/EFCC)',
      sop: 'Cross-examine variations against mathematical CPA formulas and BPP threshold matrices to instantly identify fraudulent contract splitting or arbitrary inflation.',
    },
  ],
};
