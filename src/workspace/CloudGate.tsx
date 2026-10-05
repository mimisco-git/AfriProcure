import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session, SupabaseClient } from '@supabase/supabase-js';
import { Building2, Loader2, LogOut, Plus, ShieldCheck } from 'lucide-react';
import { AfriProcureLogo } from '../components/AfriProcureLogo';
import { PORTFOLIO_PROJECTS } from '../data/defaultData';
import { OrgRole, ROLE_LABELS, isOrgRole, permissionsFor } from './permissions';
import { SupabaseWorkspaceStore } from './store';
import { Workspace, WorkspaceProvider } from './WorkspaceContext';

const LAST_ORG_KEY = 'afriprocure:v1:lastOrgId';

interface Membership {
  role: OrgRole;
  organization: { id: string; name: string };
}

const inputClass =
  'w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-stone-900 focus:outline-hidden focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20';
const primaryButtonClass =
  'w-full inline-flex items-center justify-center gap-2 rounded-xl bg-stone-900 hover:bg-stone-800 disabled:opacity-60 text-white text-sm font-bold py-2.5 transition-colors';

const GateShell: React.FC<{ title: string; subtitle?: string; children: React.ReactNode }> = ({ title, subtitle, children }) => (
  <div className="min-h-screen bg-stone-100/60 flex items-center justify-center px-4 py-10">
    <div className="w-full max-w-md">
      <div className="flex justify-center mb-6">
        <AfriProcureLogo size="md" variant="full" />
      </div>
      <div className="bg-white border border-stone-200 rounded-2xl shadow-xs p-6 sm:p-8">
        <h1 className="text-lg font-black text-stone-900 tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-stone-600 mt-1">{subtitle}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  </div>
);

const Notice: React.FC<{ tone: 'error' | 'info'; children: React.ReactNode }> = ({ tone, children }) => (
  <p
    role={tone === 'error' ? 'alert' : 'status'}
    className={`text-sm rounded-xl px-3 py-2 border ${
      tone === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-emerald-50 border-emerald-200 text-emerald-800'
    }`}
  >
    {children}
  </p>
);

const FullScreenLoader: React.FC<{ label: string }> = ({ label }) => (
  <div className="min-h-screen flex items-center justify-center gap-2 text-sm text-stone-500" role="status">
    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
    {label}
  </div>
);

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

type AuthMode = 'sign_in' | 'sign_up' | 'reset' | 'new_password';

const AuthScreen: React.FC<{ client: SupabaseClient; initialMode?: AuthMode; onPasswordUpdated?: () => void }> = ({
  client,
  initialMode = 'sign_in',
  onPasswordUpdated,
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  const switchMode = (next: AuthMode) => {
    setMode(next);
    setError(null);
    setInfo(null);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      const redirectTo = window.location.origin;
      if (mode === 'sign_in') {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else if (mode === 'sign_up') {
        const { data, error } = await client.auth.signUp({ email, password, options: { emailRedirectTo: redirectTo } });
        if (error) throw error;
        if (!data.session) setInfo('Check your inbox to confirm your email address, then sign in.');
      } else if (mode === 'reset') {
        const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo });
        if (error) throw error;
        setInfo('If an account exists for that address, a password reset link is on its way.');
      } else {
        const { error } = await client.auth.updateUser({ password });
        if (error) throw error;
        onPasswordUpdated?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setBusy(false);
    }
  };

  const titles: Record<AuthMode, [string, string]> = {
    sign_in: ['Sign in', 'Access your organization’s procurement workspace.'],
    sign_up: ['Create your account', 'An admin can then add you to their organization.'],
    reset: ['Reset your password', 'We will email you a secure reset link.'],
    new_password: ['Choose a new password', 'Enter a new password for your account.'],
  };

  return (
    <GateShell title={titles[mode][0]} subtitle={titles[mode][1]}>
      <form onSubmit={submit} className="space-y-4">
        {mode !== 'new_password' && (
          <label className="block">
            <span className="text-xs font-bold text-stone-700">Work email</span>
            <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputClass} mt-1`} />
          </label>
        )}
        {mode !== 'reset' && (
          <label className="block">
            <span className="text-xs font-bold text-stone-700">Password</span>
            <input
              type="password"
              required
              minLength={mode === 'sign_in' ? undefined : 10}
              autoComplete={mode === 'sign_in' ? 'current-password' : 'new-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} mt-1`}
            />
            {mode !== 'sign_in' && <span className="text-[11px] text-stone-500">At least 10 characters.</span>}
          </label>
        )}

        {error && <Notice tone="error">{error}</Notice>}
        {info && <Notice tone="info">{info}</Notice>}

        <button type="submit" disabled={busy} className={primaryButtonClass}>
          {busy && <Loader2 className="w-4 h-4 animate-spin" />}
          {{ sign_in: 'Sign in', sign_up: 'Create account', reset: 'Send reset link', new_password: 'Update password' }[mode]}
        </button>
      </form>

      {mode !== 'new_password' && (
        <div className="mt-5 flex flex-wrap justify-between gap-2 text-xs font-semibold">
          {mode === 'sign_in' ? (
            <>
              <button onClick={() => switchMode('sign_up')} className="text-amber-700 hover:text-amber-900">Create an account</button>
              <button onClick={() => switchMode('reset')} className="text-stone-500 hover:text-stone-900">Forgot password?</button>
            </>
          ) : (
            <button onClick={() => switchMode('sign_in')} className="text-amber-700 hover:text-amber-900">Back to sign in</button>
          )}
        </div>
      )}
    </GateShell>
  );
};

// ---------------------------------------------------------------------------
// Organization selection
// ---------------------------------------------------------------------------

const OrganizationPicker: React.FC<{
  client: SupabaseClient;
  session: Session;
  onSelect: (m: Membership) => void;
}> = ({ client, session, onSelect }) => {
  const [memberships, setMemberships] = useState<Membership[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [newOrgName, setNewOrgName] = useState('');
  const [busy, setBusy] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    const { data, error } = await client
      .from('memberships')
      .select('role, organizations(id, name)')
      .eq('user_id', session.user.id);
    if (error) {
      setLoadError(error.message);
      return;
    }
    const rows: Membership[] = (data ?? []).flatMap((row) => {
      const org = Array.isArray(row.organizations) ? row.organizations[0] : row.organizations;
      return org && isOrgRole(row.role) ? [{ role: row.role, organization: { id: org.id as string, name: org.name as string } }] : [];
    });
    rows.sort((a, b) => a.organization.name.localeCompare(b.organization.name));
    setMemberships(rows);

    let lastOrg: string | null = null;
    try {
      lastOrg = window.localStorage.getItem(LAST_ORG_KEY);
    } catch {
      // Ignore
    }
    const remembered = rows.find((m) => m.organization.id === lastOrg);
    if (remembered) onSelect(remembered);
    else if (rows.length === 1) onSelect(rows[0]);
  }, [client, session.user.id, onSelect]);

  useEffect(() => {
    void load();
  }, [load]);

  const createOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setCreateError(null);
    try {
      const { data: orgId, error } = await client.rpc('create_organization', { org_name: newOrgName });
      if (error) throw error;
      // Start new organizations with the demonstration portfolio so every module has data
      await new SupabaseWorkspaceStore(client, orgId as string).insertContracts(PORTFOLIO_PROJECTS);
      onSelect({ role: 'admin', organization: { id: orgId as string, name: newOrgName.trim() } });
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Could not create the organization.');
    } finally {
      setBusy(false);
    }
  };

  if (loadError) {
    return (
      <GateShell title="Could not load your organizations">
        <Notice tone="error">{loadError}</Notice>
        <button onClick={() => void load()} className={`${primaryButtonClass} mt-4`}>Try again</button>
      </GateShell>
    );
  }
  if (!memberships) return <FullScreenLoader label="Loading your organizations…" />;

  return (
    <GateShell title="Choose a workspace" subtitle={`Signed in as ${session.user.email}`}>
      {memberships.length > 0 && (
        <ul className="space-y-2 mb-6">
          {memberships.map((m) => (
            <li key={m.organization.id}>
              <button
                onClick={() => onSelect(m)}
                className="w-full flex items-center justify-between gap-3 rounded-xl border border-stone-200 hover:border-amber-400 hover:bg-amber-50/40 px-4 py-3 text-left transition-colors"
              >
                <span className="flex items-center gap-2 font-bold text-sm text-stone-900">
                  <Building2 className="w-4 h-4 text-amber-600" />
                  {m.organization.name}
                </span>
                <span className="text-[11px] font-semibold text-stone-500">{ROLE_LABELS[m.role]}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {memberships.length === 0 && (
        <p className="text-sm text-stone-600 mb-5">
          You are not a member of any organization yet. Ask your admin to add <strong>{session.user.email}</strong>, or create a new organization below.
        </p>
      )}

      <form onSubmit={createOrganization} className="space-y-3 border-t border-stone-100 pt-5">
        <label className="block">
          <span className="text-xs font-bold text-stone-700">New organization</span>
          <input
            required
            minLength={2}
            maxLength={200}
            placeholder="e.g. Federal Ministry of Works & Housing"
            value={newOrgName}
            onChange={(e) => setNewOrgName(e.target.value)}
            className={`${inputClass} mt-1`}
          />
        </label>
        {createError && <Notice tone="error">{createError}</Notice>}
        <button type="submit" disabled={busy} className={primaryButtonClass}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4 text-amber-400" />}
          Create organization
        </button>
      </form>

      <button
        onClick={() => void client.auth.signOut()}
        className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-stone-500 hover:text-stone-900"
      >
        <LogOut className="w-3.5 h-3.5" />
        Sign out
      </button>
    </GateShell>
  );
};

// ---------------------------------------------------------------------------
// Gate
// ---------------------------------------------------------------------------

/** Requires a signed-in user and a selected organization before rendering the app. */
export const CloudGate: React.FC<{ client: SupabaseClient; children: React.ReactNode }> = ({ client, children }) => {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  const [recovering, setRecovering] = useState(false);
  const [membership, setMembership] = useState<Membership | null>(null);

  useEffect(() => {
    void client.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = client.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') setRecovering(true);
      setSession(next);
      if (!next) setMembership(null);
    });
    return () => data.subscription.unsubscribe();
  }, [client]);

  const selectMembership = useCallback((m: Membership) => {
    try {
      window.localStorage.setItem(LAST_ORG_KEY, m.organization.id);
    } catch {
      // Ignore
    }
    setMembership(m);
  }, []);

  const workspace = useMemo<Workspace | null>(() => {
    if (!session || !membership) return null;
    return {
      store: new SupabaseWorkspaceStore(client, membership.organization.id),
      role: membership.role,
      permissions: permissionsFor(membership.role),
      organization: membership.organization,
      user: { id: session.user.id, email: session.user.email ?? '' },
      signOut: () => void client.auth.signOut(),
      switchOrganization: () => {
        try {
          window.localStorage.removeItem(LAST_ORG_KEY);
        } catch {
          // Ignore
        }
        setMembership(null);
      },
    };
    // Rebuild only when the user or organization changes, not on token refresh
  }, [client, session?.user.id, membership]);

  if (session === undefined) return <FullScreenLoader label="Checking your session…" />;
  if (recovering && session) {
    return <AuthScreen client={client} initialMode="new_password" onPasswordUpdated={() => setRecovering(false)} />;
  }
  if (!session) return <AuthScreen client={client} />;
  if (!workspace) return <OrganizationPicker client={client} session={session} onSelect={selectMembership} />;

  return (
    <WorkspaceProvider key={workspace.organization?.id} value={workspace}>
      {children}
    </WorkspaceProvider>
  );
};

export const RoleBadge: React.FC<{ role: OrgRole }> = ({ role }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10px] font-bold uppercase tracking-wide">
    <ShieldCheck className="w-3 h-3" />
    {ROLE_LABELS[role]}
  </span>
);
