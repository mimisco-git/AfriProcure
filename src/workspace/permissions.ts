// Mirrors the row-level security policies in supabase/migrations. The database is the
// authority; these flags only decide what the UI offers.

export type OrgRole = 'admin' | 'procurement_officer' | 'evaluator' | 'auditor' | 'viewer';

export const ORG_ROLES: OrgRole[] = ['admin', 'procurement_officer', 'evaluator', 'auditor', 'viewer'];

export const ROLE_LABELS: Record<OrgRole, string> = {
  admin: 'Admin',
  procurement_officer: 'Procurement Officer',
  evaluator: 'Evaluation Committee',
  auditor: 'Auditor',
  viewer: 'Viewer',
};

export const ROLE_DESCRIPTIONS: Record<OrgRole, string> = {
  admin: 'Full access, including team management and the audit trail',
  procurement_officer: 'Creates and edits contracts and bid evaluations',
  evaluator: 'Records bid evaluations; reads contracts',
  auditor: 'Read-only access to everything, including the audit trail',
  viewer: 'Read-only access to contracts and evaluations',
};

export interface Permissions {
  editContracts: boolean;
  saveEvaluations: boolean;
  manageMembers: boolean;
  viewAuditLog: boolean;
}

/** `null` means local single-user mode, which has full access. */
export function permissionsFor(role: OrgRole | null): Permissions {
  if (role === null) {
    return { editContracts: true, saveEvaluations: true, manageMembers: false, viewAuditLog: false };
  }
  return {
    editContracts: role === 'admin' || role === 'procurement_officer',
    saveEvaluations: role === 'admin' || role === 'procurement_officer' || role === 'evaluator',
    manageMembers: role === 'admin',
    viewAuditLog: role === 'admin' || role === 'auditor',
  };
}

export const isOrgRole = (v: unknown): v is OrgRole => ORG_ROLES.includes(v as OrgRole);
