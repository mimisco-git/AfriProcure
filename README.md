# AfriProcure

**Contract price adjustment and tender risk engine for African public infrastructure procurement.**

AfriProcure takes a public works contract from tender evaluation to award, inflation-indexed payment certification, claims and audit. It is built around the Nigerian Public Procurement Act 2007 (PPA), Bureau of Public Procurement (BPP) prior-review rules and FIDIC Red Book Clause 13.8, and supports NGN, GHS, KES, ZAR and USD.

## Modules

| # | Module | What it does |
|---|--------|--------------|
| 0 | Bid Evaluation Desk | RFQ/tender evaluation: statutory eligibility, PPA §31 arithmetic correction, VAT harmonisation, FX conversion, LERB or QCBS ranking, abnormally-low/inflated price detection, collusion checks (shared phone/email/bank/TIN/signatory), evaluation report and award transfer |
| 1 | CPA Indexation Engine | FIDIC 13.8 adjustment multiplier `Pn = a + Σ wᵢ·(Iₙ/I₀)`, weight validation, dual-currency tranches |
| 2 | IPC Cashflow & Default Risk | Monthly interim payment certificates with advance recovery, retention, WHT and contractor abandonment risk |
| 3 | Tender Shield | Bid-vs-estimate audit, cover-bid clustering, beneficial-ownership links, domestic preference |
| 4 | Claims & Delayed Payment | PPA §37 late-payment interest (compounded at CBN MPR + spread), prolongation claims |
| 5 | PPA 2007 & BPP Thresholds | Searchable statute register and approval-tier matrix |
| 6 | Material Price Benchmarks | Macro and commodity indices that feed contract price components |
| 7 | Case Studies | Real-world infrastructure procurement failures and lessons |
| 8 | BPP Dossier | Prior-review dossier and treasury voucher generator |
| 9 | Securities, VOs & FEC Memo | Bank guarantees with expiry alerts, variation orders, Auditor-General query responses |
| 10 | EoT, LDs & APG Engineering | FIDIC 8.4 extension of time, 8.7 liquidated damages, 14.2 advance-payment amortisation and retention |
| 11 | BPP Contractor Registry | Contractor categorisation, single-contract limits and due-diligence certificate |
| 12 | Team, Roles & Audit Trail | *(cloud workspaces)* Members and roles, and a tamper-proof log of every change |

## Getting started

Requires Node.js 20+ (or Bun).

```bash
npm install
npm run dev        # http://localhost:3000
```

| Script | Purpose |
|--------|---------|
| `npm run dev` | Development server |
| `npm run build` | Type-check, then production build to `dist/` |
| `npm run preview` | Serve the production build |
| `npm test` | Run all tests: calculation engines, workspace sync, and database security (on an in-process PostgreSQL) |
| `npm run lint` | Strict TypeScript check |

## Single-user and cloud modes

Without configuration, AfriProcure runs as a **single-user app** that stores everything in the browser.

With Supabase configured it becomes a **multi-user, multi-organization system**: users sign in, belong to one or more organizations (a ministry, agency or firm), and share that organization's contracts and bid evaluations according to their role.

| Role | Contracts | Bid evaluations | Team | Audit trail |
|------|-----------|-----------------|------|-------------|
| Admin | Edit | Save | Manage | Read |
| Procurement Officer | Edit | Save | View | — |
| Evaluation Committee | Read | Save | View | — |
| Auditor | Read | Read | View | Read |
| Viewer | Read | Read | View | — |

These rules are enforced by **PostgreSQL row-level security**, so they hold even against someone calling the API directly. Every create, change and delete of a contract, evaluation or membership is written to an **append-only audit log** (who, when, before and after) that no user, admin included, can edit or delete. Concurrent edits are detected with **version checks**: if a colleague saved the same contract first, you are told and offered their version instead of silently overwriting it.

### Setting up a cloud workspace

1. Create a project at [supabase.com](https://supabase.com). For data residency requirements under the Nigeria Data Protection Act, Supabase can also be [self-hosted](https://supabase.com/docs/guides/self-hosting) on in-country infrastructure.
2. Apply the schema with the [Supabase CLI](https://supabase.com/docs/guides/cli):
   ```bash
   npx supabase link --project-ref <your-project-ref>
   npx supabase db push
   ```
   or paste `supabase/migrations/*.sql` into the dashboard's SQL editor.
3. In **Authentication → URL Configuration**, set the Site URL to where the app is hosted (used in confirmation and password-reset emails).
4. Copy `.env.example` to `.env.local` and fill in `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from **Project Settings → API**. Set the same variables in your hosting provider.
5. Start the app, create an account, and create your organization. You become its Admin, and the demonstration portfolio is loaded so every module has data. Colleagues sign up, then you add them from **Team, Roles & Audit Trail**.

If you self-host Supabase on your own domain, add it to `connect-src` in the Content-Security-Policy in `vercel.json`.

## Architecture

```
src/
  App.tsx                 Shell: tab routing, contract portfolio, persistence
  components/             One file per module (lazy-loaded) + Header, ErrorBoundary, modals
  utils/                  Pure calculation engines — no React, fully unit-tested
    cpaMath.ts              CPA multiplier, IPC schedule, tender audit, claims, formatting
    bidEvaluationEngine.ts  RFQ/tender evaluation and collusion detection
    constructionContractEngine.ts  EoT, liquidated damages, APG and retention
    csvExporter.ts          CSV exports
  data/                   Demonstration datasets and statutory registers
  hooks/                  usePersistentState (versioned localStorage)
  workspace/              Auth/organization gate, role permissions, storage (local or Supabase), auto-save
  lib/supabase.ts         Supabase client (null in single-user mode)
supabase/
  migrations/             Schema, row-level security, audit triggers, RPCs
  tests/                  Security tests run against the real migration
```

- **Engines are pure functions.** All money logic lives in `src/utils` and is covered by tests in `*.test.ts` next to each engine. Change a formula → add or update a test.
- **Each module is code-split** and wrapped in an error boundary, so a fault in one tab never takes down the app.
- **One storage interface, two backends.** `WorkspaceStore` is implemented for the browser and for Supabase; the app does not know which it is using. Edits are auto-saved (debounced, strictly sequential) with a status indicator in the header and a warning before closing the tab with unsaved changes.
- **Preferences** (active contract, currency, tab) are kept per browser under `afriprocure:v1:*`. In single-user mode, *Reset workspace* in the footer restores the demonstration data.

## Known limitations

- **No live collaboration yet.** Colleagues' changes appear when the page is reloaded (or via *Load latest* after a conflict), not in real time.
- **Members must sign up before an admin can add them**; there are no email invitations yet.
- **The currency selector relabels amounts; it does not convert them.** Demonstration data is denominated in naira. Statutory BPP thresholds and Nigerian market benchmarks are always shown in ₦.
- **IPC projections use a modelled inflation path** (1.8%/month, scaled by component category), not published index series per period.

## Deployment

Static site; `vercel.json` rewrites all routes to `index.html` and sets security headers (CSP, HSTS, frame denial). `npm run build` and deploy `dist/`.
