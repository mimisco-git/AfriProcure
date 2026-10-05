import type { SupabaseClient } from '@supabase/supabase-js';
import { ContractProject, SavedBidEvaluation } from '../types';
import { PORTFOLIO_PROJECTS } from '../data/defaultData';
import { storageKey } from '../hooks/usePersistentState';

/** Raised when a save would overwrite a newer version written by someone else. */
export class ConflictError extends Error {
  constructor(public readonly recordTitle: string) {
    super(`"${recordTitle}" was changed by another user since you opened it.`);
    this.name = 'ConflictError';
  }
}

/** Persistence for one workspace: the browser (local mode) or one Supabase organization. */
export interface WorkspaceStore {
  readonly mode: 'local' | 'cloud';
  listContracts(): Promise<ContractProject[]>;
  /** Insert or update. Throws ConflictError on a concurrent edit. */
  saveContract(contract: ContractProject): Promise<void>;
  listEvaluations(): Promise<SavedBidEvaluation[]>;
  saveEvaluation(evaluation: SavedBidEvaluation): Promise<void>;
}

const isContractList = (v: unknown): v is ContractProject[] =>
  Array.isArray(v) &&
  v.every(
    (p) =>
      p !== null &&
      typeof p === 'object' &&
      typeof (p as ContractProject).id === 'string' &&
      typeof (p as ContractProject).contractSumInitial === 'number' &&
      Array.isArray((p as ContractProject).components)
  );

function readJson(key: string): unknown {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? undefined : JSON.parse(raw);
  } catch {
    return undefined;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or privacy mode: the session keeps working in memory
  }
}

const LOCAL_PORTFOLIO_KEY = storageKey('portfolio');
// Pre-existing key used by the Bid Evaluation Desk; kept so saved dossiers survive the upgrade
const LOCAL_EVALUATIONS_KEY = 'afriprocure_bid_evaluations_v1';
const LOCAL_EVALUATION_LIMIT = 16;

export class LocalWorkspaceStore implements WorkspaceStore {
  readonly mode = 'local' as const;

  async listContracts(): Promise<ContractProject[]> {
    const stored = readJson(LOCAL_PORTFOLIO_KEY);
    return isContractList(stored) && stored.length > 0 ? stored : PORTFOLIO_PROJECTS;
  }

  async saveContract(contract: ContractProject): Promise<void> {
    const current = await this.listContracts();
    const exists = current.some((c) => c.id === contract.id);
    writeJson(LOCAL_PORTFOLIO_KEY, exists ? current.map((c) => (c.id === contract.id ? contract : c)) : [contract, ...current]);
  }

  async listEvaluations(): Promise<SavedBidEvaluation[]> {
    const stored = readJson(LOCAL_EVALUATIONS_KEY);
    return Array.isArray(stored) ? (stored as SavedBidEvaluation[]) : [];
  }

  async saveEvaluation(evaluation: SavedBidEvaluation): Promise<void> {
    const current = await this.listEvaluations();
    writeJson(LOCAL_EVALUATIONS_KEY, [evaluation, ...current.filter((e) => e.id !== evaluation.id)].slice(0, LOCAL_EVALUATION_LIMIT));
  }

  reset() {
    try {
      window.localStorage.removeItem(LOCAL_PORTFOLIO_KEY);
    } catch {
      // Ignore
    }
  }
}

const UNIQUE_VIOLATION = '23505';

export class SupabaseWorkspaceStore implements WorkspaceStore {
  readonly mode = 'cloud' as const;
  // Last version seen per contract id, for compare-and-swap updates
  private readonly versions = new Map<string, number>();

  constructor(private readonly client: SupabaseClient, readonly orgId: string) {}

  async listContracts(): Promise<ContractProject[]> {
    const { data, error } = await this.client
      .from('contracts')
      .select('id, data, version')
      .eq('org_id', this.orgId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    this.versions.clear();
    return (data ?? []).map((row) => {
      this.versions.set(row.id as string, row.version as number);
      return row.data as ContractProject;
    });
  }

  async saveContract(contract: ContractProject): Promise<void> {
    const known = this.versions.get(contract.id);

    if (known === undefined) {
      const { data, error } = await this.client
        .from('contracts')
        .insert({ org_id: this.orgId, id: contract.id, data: contract })
        .select('version')
        .single();
      if (error) {
        if (error.code === UNIQUE_VIOLATION) throw new ConflictError(contract.title);
        throw error;
      }
      this.versions.set(contract.id, data.version as number);
      return;
    }

    const { data, error } = await this.client
      .from('contracts')
      .update({ data: contract })
      .eq('org_id', this.orgId)
      .eq('id', contract.id)
      .eq('version', known)
      .select('version');
    if (error) throw error;
    if (!data || data.length === 0) throw new ConflictError(contract.title);
    this.versions.set(contract.id, data[0].version as number);
  }

  /** Bulk insert used to seed a brand-new organization. */
  async insertContracts(contracts: ContractProject[]): Promise<void> {
    const { error } = await this.client
      .from('contracts')
      .insert(contracts.map((c) => ({ org_id: this.orgId, id: c.id, data: c })));
    if (error) throw error;
  }

  async listEvaluations(): Promise<SavedBidEvaluation[]> {
    const { data, error } = await this.client
      .from('bid_evaluations')
      .select('data')
      .eq('org_id', this.orgId)
      .order('created_at', { ascending: false })
      .limit(100);
    if (error) throw error;
    return (data ?? []).map((row) => row.data as SavedBidEvaluation);
  }

  async saveEvaluation(evaluation: SavedBidEvaluation): Promise<void> {
    const { error } = await this.client
      .from('bid_evaluations')
      .insert({ org_id: this.orgId, id: evaluation.id, data: evaluation });
    if (error) throw error;
  }
}
