import React, { useCallback, useEffect, useState } from 'react';
import { ChevronDown, ChevronRight, History, Loader2, RefreshCw, Trash2, UserPlus, Users } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useWorkspace } from '../workspace/WorkspaceContext';
import { ORG_ROLES, OrgRole, ROLE_DESCRIPTIONS, ROLE_LABELS, isOrgRole } from '../workspace/permissions';

interface Member {
  user_id: string;
  email: string;
  role: OrgRole;
  joined_at: string;
}

interface AuditEntry {
  id: number;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  actor_email: string | null;
  occurred_at: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
}

const TABLE_LABELS: Record<string, string> = {
  contracts: 'Contract',
  bid_evaluations: 'Bid evaluation',
  memberships: 'Team member',
};

const ACTION_STYLES: Record<AuditEntry['action'], string> = {
  INSERT: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  UPDATE: 'bg-amber-50 text-amber-800 border-amber-200',
  DELETE: 'bg-red-50 text-red-800 border-red-200',
};

const ACTION_LABELS: Record<AuditEntry['action'], string> = { INSERT: 'Created', UPDATE: 'Changed', DELETE: 'Deleted' };

const errorMessage = (err: unknown) => (err instanceof Error ? err.message : typeof err === 'object' && err && 'message' in err ? String((err as { message: unknown }).message) : 'Unknown error');

/** Top-level document fields that differ between two audit snapshots. */
export function changedFields(oldRow: Record<string, unknown> | null, newRow: Record<string, unknown> | null): string[] {
  const oldDoc = (oldRow?.data ?? oldRow) as Record<string, unknown> | null;
  const newDoc = (newRow?.data ?? newRow) as Record<string, unknown> | null;
  if (!oldDoc || !newDoc) return [];
  const ignored = new Set(['version', 'updated_at', 'updated_by']);
  const keys = new Set([...Object.keys(oldDoc), ...Object.keys(newDoc)]);
  return [...keys].filter((k) => !ignored.has(k) && JSON.stringify(oldDoc[k]) !== JSON.stringify(newDoc[k])).sort();
}

function describeRecord(entry: AuditEntry, members: Member[]): string {
  const doc = (entry.new_data ?? entry.old_data) as Record<string, unknown> | null;
  const data = doc?.data as Record<string, unknown> | undefined;
  if (entry.table_name === 'contracts') return String(data?.title ?? entry.record_id);
  if (entry.table_name === 'bid_evaluations') return String(data?.procurementTitle ?? entry.record_id);
  if (entry.table_name === 'memberships') {
    const email = members.find((m) => m.user_id === entry.record_id)?.email ?? entry.record_id;
    const role = doc?.role;
    return isOrgRole(role) ? `${email} (${ROLE_LABELS[role]})` : email;
  }
  return entry.record_id;
}

const Panel: React.FC<{ icon: React.ReactNode; title: string; action?: React.ReactNode; children: React.ReactNode }> = ({ icon, title, action, children }) => (
  <section className="bg-white border border-stone-200 rounded-2xl shadow-xs">
    <header className="flex items-center justify-between gap-3 px-5 py-4 border-b border-stone-100">
      <h2 className="flex items-center gap-2 text-sm font-bold text-stone-900 uppercase tracking-wider">
        {icon}
        {title}
      </h2>
      {action}
    </header>
    <div className="p-5">{children}</div>
  </section>
);

const ErrorText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <p role="alert" className="text-sm rounded-xl px-3 py-2 border bg-red-50 border-red-200 text-red-800">
    {children}
  </p>
);

export const GovernanceCenter: React.FC = () => {
  const ws = useWorkspace();
  const orgId = ws.organization?.id;
  const [members, setMembers] = useState<Member[]>([]);
  const [membersError, setMembersError] = useState<string | null>(null);
  const [audit, setAudit] = useState<AuditEntry[] | null>(null);
  const [auditError, setAuditError] = useState<string | null>(null);
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [expanded, setExpanded] = useState<number | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<OrgRole>('evaluator');
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [pendingRemoval, setPendingRemoval] = useState<string | null>(null);

  const loadMembers = useCallback(async () => {
    if (!supabase || !orgId) return;
    const { data, error } = await supabase.rpc('list_org_members', { target_org: orgId });
    if (error) setMembersError(error.message);
    else {
      setMembersError(null);
      setMembers((data ?? []) as Member[]);
    }
  }, [orgId]);

  const loadAudit = useCallback(async () => {
    if (!supabase || !orgId || !ws.permissions.viewAuditLog) return;
    let query = supabase
      .from('audit_log')
      .select('id, table_name, record_id, action, actor_email, occurred_at, old_data, new_data')
      .eq('org_id', orgId)
      .order('occurred_at', { ascending: false })
      .limit(200);
    if (auditFilter !== 'all') query = query.eq('table_name', auditFilter);
    const { data, error } = await query;
    if (error) setAuditError(error.message);
    else {
      setAuditError(null);
      setAudit((data ?? []) as AuditEntry[]);
    }
  }, [orgId, auditFilter, ws.permissions.viewAuditLog]);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);
  useEffect(() => {
    void loadAudit();
  }, [loadAudit]);

  const runAction = async (fn: () => Promise<{ error: unknown }>) => {
    setBusy(true);
    setActionError(null);
    try {
      const { error } = await fn();
      if (error) throw error;
      await Promise.all([loadMembers(), loadAudit()]);
      return true;
    } catch (err) {
      setActionError(errorMessage(err));
      return false;
    } finally {
      setBusy(false);
    }
  };

  if (!supabase || !orgId) {
    return <ErrorText>Team management is available when AfriProcure is connected to a cloud workspace.</ErrorText>;
  }
  const client = supabase;

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    const ok = await runAction(async () =>
      client.rpc('add_member_by_email', { target_org: orgId, member_email: inviteEmail, member_role: inviteRole })
    );
    if (ok) setInviteEmail('');
  };

  const changeRole = (userId: string, role: OrgRole) =>
    runAction(async () => client.from('memberships').update({ role }).eq('org_id', orgId).eq('user_id', userId));

  const removeMember = async (userId: string) => {
    await runAction(async () => client.from('memberships').delete().eq('org_id', orgId).eq('user_id', userId));
    setPendingRemoval(null);
  };

  return (
    <div className="space-y-6">
      <div className="bg-stone-900 text-stone-100 rounded-2xl p-6 sm:p-8">
        <span className="inline-block px-2 py-0.5 rounded bg-amber-500 text-stone-900 text-[11px] font-black uppercase tracking-wider">Governance</span>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight mt-3">{ws.organization?.name}</h1>
        <p className="text-sm text-stone-300 mt-2 max-w-3xl">
          Who can see and change this workspace, and a tamper-proof record of every change. Access rules are enforced by the database, not just this screen.
        </p>
      </div>

      <Panel icon={<Users className="w-4 h-4 text-amber-600" />} title={`Team (${members.length})`}>
        {membersError && <ErrorText>{membersError}</ErrorText>}
        {actionError && <div className="mb-4"><ErrorText>{actionError}</ErrorText></div>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-stone-500 border-b border-stone-100">
                <th className="py-2 pr-4 font-bold">Member</th>
                <th className="py-2 pr-4 font-bold">Role</th>
                <th className="py-2 pr-4 font-bold">Joined</th>
                {ws.permissions.manageMembers && <th className="py-2 font-bold sr-only">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {members.map((m) => (
                <tr key={m.user_id} className="border-b border-stone-50 last:border-0">
                  <td className="py-2.5 pr-4 font-semibold text-stone-900">
                    {m.email}
                    {m.user_id === ws.user?.id && <span className="ml-2 text-[11px] font-normal text-stone-500">(you)</span>}
                  </td>
                  <td className="py-2.5 pr-4">
                    {ws.permissions.manageMembers ? (
                      <select
                        aria-label={`Role for ${m.email}`}
                        value={m.role}
                        disabled={busy}
                        onChange={(e) => void changeRole(m.user_id, e.target.value as OrgRole)}
                        className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs"
                      >
                        {ORG_ROLES.map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                    ) : (
                      <span className="text-xs text-stone-700">{ROLE_LABELS[m.role]}</span>
                    )}
                  </td>
                  <td className="py-2.5 pr-4 text-xs text-stone-500 font-mono">{new Date(m.joined_at).toLocaleDateString()}</td>
                  {ws.permissions.manageMembers && (
                    <td className="py-2.5 text-right whitespace-nowrap">
                      {pendingRemoval === m.user_id ? (
                        <span className="inline-flex items-center gap-2 text-xs">
                          <span className="text-red-700 font-semibold">Remove access?</span>
                          <button disabled={busy} onClick={() => void removeMember(m.user_id)} className="px-2 py-1 rounded-md bg-red-600 hover:bg-red-700 text-white font-bold">Remove</button>
                          <button onClick={() => setPendingRemoval(null)} className="px-2 py-1 rounded-md border border-stone-300 hover:bg-stone-100 font-semibold">Cancel</button>
                        </span>
                      ) : (
                        <button
                          onClick={() => setPendingRemoval(m.user_id)}
                          title={`Remove ${m.email}`}
                          className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {ws.permissions.manageMembers && (
          <form onSubmit={addMember} className="mt-5 pt-5 border-t border-stone-100 grid gap-3 sm:grid-cols-[1fr_auto_auto] items-end">
            <label className="block">
              <span className="text-xs font-bold text-stone-700">Add a colleague by email</span>
              <input
                type="email"
                required
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@ministry.gov.ng"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3 py-2 text-sm focus:outline-hidden focus:border-amber-500"
              />
            </label>
            <label className="block">
              <span className="text-xs font-bold text-stone-700">Role</span>
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value as OrgRole)}
                className="mt-1 w-full rounded-xl border border-stone-300 bg-white px-3 py-2 text-sm"
              >
                {ORG_ROLES.map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
              </select>
            </label>
            <button type="submit" disabled={busy} className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-sm font-bold">
              {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4 text-amber-400" />}
              Add
            </button>
            <p className="sm:col-span-3 text-xs text-stone-500">
              They must have created an AfriProcure account first. {ROLE_LABELS[inviteRole]}: {ROLE_DESCRIPTIONS[inviteRole]}.
            </p>
          </form>
        )}
      </Panel>

      {ws.permissions.viewAuditLog ? (
        <Panel
          icon={<History className="w-4 h-4 text-amber-600" />}
          title="Audit trail"
          action={
            <div className="flex items-center gap-2">
              <select
                aria-label="Filter audit trail"
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
                className="rounded-lg border border-stone-300 bg-white px-2 py-1 text-xs"
              >
                <option value="all">All records</option>
                <option value="contracts">Contracts</option>
                <option value="bid_evaluations">Bid evaluations</option>
                <option value="memberships">Team changes</option>
              </select>
              <button onClick={() => void loadAudit()} title="Refresh" className="p-1.5 rounded-lg border border-stone-200 hover:bg-stone-100">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          }
        >
          {auditError && <ErrorText>{auditError}</ErrorText>}
          {!audit && !auditError && (
            <p className="flex items-center gap-2 text-sm text-stone-500"><Loader2 className="w-4 h-4 animate-spin" /> Loading audit trail…</p>
          )}
          {audit && audit.length === 0 && <p className="text-sm text-stone-500">No changes recorded yet.</p>}
          {audit && audit.length > 0 && (
            <ol className="divide-y divide-stone-100">
              {audit.map((entry) => {
                const fields = entry.action === 'UPDATE' ? changedFields(entry.old_data, entry.new_data) : [];
                const isOpen = expanded === entry.id;
                return (
                  <li key={entry.id} className="py-3">
                    <button onClick={() => setExpanded(isOpen ? null : entry.id)} className="w-full flex items-start gap-3 text-left">
                      {isOpen ? <ChevronDown className="w-4 h-4 mt-0.5 text-stone-400 shrink-0" /> : <ChevronRight className="w-4 h-4 mt-0.5 text-stone-400 shrink-0" />}
                      <span className={`shrink-0 px-2 py-0.5 rounded-md border text-[11px] font-bold ${ACTION_STYLES[entry.action]}`}>
                        {ACTION_LABELS[entry.action]}
                      </span>
                      <span className="flex-1 min-w-0 text-sm">
                        <span className="text-stone-500">{TABLE_LABELS[entry.table_name] ?? entry.table_name}: </span>
                        <span className="font-semibold text-stone-900 break-words">{describeRecord(entry, members)}</span>
                        {fields.length > 0 && (
                          <span className="block text-xs text-stone-500 mt-0.5 break-words">Fields changed: {fields.join(', ')}</span>
                        )}
                      </span>
                      <span className="shrink-0 text-right text-xs text-stone-500">
                        <span className="block font-semibold text-stone-700">{entry.actor_email ?? 'System'}</span>
                        <time dateTime={entry.occurred_at} className="font-mono">{new Date(entry.occurred_at).toLocaleString()}</time>
                      </span>
                    </button>
                    {isOpen && (
                      <div className="mt-3 ml-7 grid gap-3 md:grid-cols-2">
                        {(['old_data', 'new_data'] as const).map((k) =>
                          entry[k] ? (
                            <div key={k} className="min-w-0">
                              <p className="text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-1">{k === 'old_data' ? 'Before' : 'After'}</p>
                              <pre className="text-[11px] font-mono bg-stone-50 border border-stone-200 rounded-lg p-3 max-h-72 overflow-auto">
                                {JSON.stringify(entry[k], null, 2)}
                              </pre>
                            </div>
                          ) : null
                        )}
                      </div>
                    )}
                  </li>
                );
              })}
            </ol>
          )}
        </Panel>
      ) : (
        <p className="text-sm text-stone-500">The audit trail is visible to Admins and Auditors.</p>
      )}
    </div>
  );
};
