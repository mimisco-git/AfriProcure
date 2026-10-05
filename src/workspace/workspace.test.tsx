// @vitest-environment happy-dom
import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CONTRACT, PORTFOLIO_PROJECTS } from '../data/defaultData';
import { ContractProject, SavedBidEvaluation } from '../types';
import { changedFields } from '../components/GovernanceCenter';
import { permissionsFor, ORG_ROLES } from './permissions';
import { ConflictError, LocalWorkspaceStore, SupabaseWorkspaceStore, WorkspaceStore } from './store';
import { useContractSync } from './useContractSync';

const contract = (id: string, title = id): ContractProject => ({ ...DEFAULT_CONTRACT, id, title });

describe('permissions mirror the database policies', () => {
  it.each([
    ['admin', true, true, true, true],
    ['procurement_officer', true, true, false, false],
    ['evaluator', false, true, false, false],
    ['auditor', false, false, false, true],
    ['viewer', false, false, false, false],
  ] as const)('%s', (role, editContracts, saveEvaluations, manageMembers, viewAuditLog) => {
    expect(permissionsFor(role)).toEqual({ editContracts, saveEvaluations, manageMembers, viewAuditLog });
  });

  it('covers every role', () => {
    expect(ORG_ROLES).toHaveLength(5);
  });

  it('gives local single-user mode full editing but no team features', () => {
    expect(permissionsFor(null)).toEqual({ editContracts: true, saveEvaluations: true, manageMembers: false, viewAuditLog: false });
  });
});

describe('LocalWorkspaceStore', () => {
  beforeEach(() => localStorage.clear());

  it('starts with the demonstration portfolio', async () => {
    expect(await new LocalWorkspaceStore().listContracts()).toEqual(PORTFOLIO_PROJECTS);
  });

  it('updates in place and prepends new contracts', async () => {
    const store = new LocalWorkspaceStore();
    await store.saveContract({ ...PORTFOLIO_PROJECTS[1], title: 'Renamed' });
    await store.saveContract(contract('brand-new'));
    const list = await store.listContracts();
    expect(list[0].id).toBe('brand-new');
    expect(list.find((c) => c.id === PORTFOLIO_PROJECTS[1].id)?.title).toBe('Renamed');
    expect(list).toHaveLength(PORTFOLIO_PROJECTS.length + 1);
  });

  it('falls back to the demo portfolio when storage is corrupt', async () => {
    localStorage.setItem('afriprocure:v1:portfolio', '{not json');
    expect(await new LocalWorkspaceStore().listContracts()).toEqual(PORTFOLIO_PROJECTS);
  });

  it('keeps evaluations saved by earlier versions and caps the list', async () => {
    const old = { id: 'eval-old', procurementTitle: 'Legacy' } as SavedBidEvaluation;
    localStorage.setItem('afriprocure_bid_evaluations_v1', JSON.stringify([old]));
    const store = new LocalWorkspaceStore();
    expect((await store.listEvaluations())[0].id).toBe('eval-old');
    for (let i = 0; i < 20; i++) await store.saveEvaluation({ ...old, id: `e${i}` });
    const list = await store.listEvaluations();
    expect(list).toHaveLength(16);
    expect(list[0].id).toBe('e19');
  });
});

/** Minimal stand-in for the supabase-js query builder, recording the calls made. */
function fakeSupabase(responses: Array<{ data: unknown; error: unknown }>) {
  const calls: Array<{ op: string; args: unknown[] }> = [];
  const builder: Record<string, unknown> = {};
  for (const op of ['select', 'insert', 'update', 'eq', 'order', 'limit', 'single']) {
    builder[op] = (...args: unknown[]) => {
      calls.push({ op, args });
      return builder;
    };
  }
  builder.then = (resolve: (v: unknown) => void) => resolve(responses.shift());
  const client = { from: (table: string) => (calls.push({ op: 'from', args: [table] }), builder) };
  return { client: client as never, calls };
}

describe('SupabaseWorkspaceStore', () => {
  it('inserts unseen contracts, then updates with a version check', async () => {
    const { client, calls } = fakeSupabase([
      { data: { version: 1 }, error: null },
      { data: [{ version: 2 }], error: null },
    ]);
    const store = new SupabaseWorkspaceStore(client, 'org-1');
    await store.saveContract(contract('c1'));
    await store.saveContract(contract('c1', 'Edited'));
    expect(calls.some((c) => c.op === 'insert')).toBe(true);
    const versionFilter = calls.filter((c) => c.op === 'eq' && c.args[0] === 'version');
    expect(versionFilter).toEqual([{ op: 'eq', args: ['version', 1] }]);
  });

  it('reports a conflict when the version moved on the server', async () => {
    const { client } = fakeSupabase([
      { data: [{ id: 'c1', data: contract('c1'), version: 4 }], error: null },
      { data: [], error: null },
    ]);
    const store = new SupabaseWorkspaceStore(client, 'org-1');
    await store.listContracts();
    await expect(store.saveContract(contract('c1', 'Mine'))).rejects.toBeInstanceOf(ConflictError);
  });

  it('reports a conflict when someone else created the same id first', async () => {
    const { client } = fakeSupabase([{ data: null, error: { code: '23505', message: 'duplicate key' } }]);
    await expect(new SupabaseWorkspaceStore(client, 'org-1').saveContract(contract('c1'))).rejects.toBeInstanceOf(ConflictError);
  });
});

describe('useContractSync', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  const fakeStore = (impl: (c: ContractProject) => Promise<void>) => {
    const saved: ContractProject[] = [];
    const store: WorkspaceStore = {
      mode: 'cloud',
      listContracts: async () => [],
      listEvaluations: async () => [],
      saveEvaluation: async () => {},
      saveContract: async (c) => {
        await impl(c);
        saved.push(c);
      },
    };
    return { store, saved };
  };

  it('debounces bursts of edits into one save of the latest value', async () => {
    const { store, saved } = fakeStore(async () => {});
    const { result } = renderHook(() => useContractSync(store, true, 500));
    act(() => {
      result.current.queue(contract('c1', 'a'));
      result.current.queue(contract('c1', 'ab'));
      result.current.queue(contract('c1', 'abc'));
    });
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(saved.map((c) => c.title)).toEqual(['abc']);
    expect(result.current.status.state).toBe('saved');
  });

  it('never runs two saves at once; edits made during a save follow it', async () => {
    let active = 0;
    let maxActive = 0;
    const { store, saved } = fakeStore(async () => {
      active++;
      maxActive = Math.max(maxActive, active);
      await new Promise((r) => setTimeout(r, 1000));
      active--;
    });
    const { result } = renderHook(() => useContractSync(store, true, 100));
    act(() => result.current.queue(contract('c1', 'first')));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150); // first save in flight
    });
    act(() => result.current.queue(contract('c1', 'second')));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    expect(maxActive).toBe(1);
    expect(saved.map((c) => c.title)).toEqual(['first', 'second']);
    expect(result.current.status.state).toBe('saved');
  });

  it('keeps failed edits queued and saves them on retry', async () => {
    let fail = true;
    const { store, saved } = fakeStore(async () => {
      if (fail) throw new Error('network down');
    });
    const { result } = renderHook(() => useContractSync(store, true, 100));
    act(() => result.current.queue(contract('c1')));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    expect(result.current.status).toEqual({ state: 'error', message: 'network down' });
    fail = false;
    await act(async () => {
      result.current.retry();
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(saved).toHaveLength(1);
    expect(result.current.status.state).toBe('saved');
  });

  it('surfaces conflicts and does not retry the conflicting edit', async () => {
    const { store, saved } = fakeStore(async (c) => {
      throw new ConflictError(c.title);
    });
    const { result } = renderHook(() => useContractSync(store, true, 100));
    act(() => result.current.queue(contract('c1', 'Highway')));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(150);
    });
    expect(result.current.status.state).toBe('conflict');
    await act(async () => {
      result.current.retry();
      await vi.advanceTimersByTimeAsync(10);
    });
    expect(saved).toHaveLength(0);
  });

  it('does nothing for read-only roles', async () => {
    const { store, saved } = fakeStore(async () => {});
    const { result } = renderHook(() => useContractSync(store, false, 100));
    act(() => result.current.queue(contract('c1')));
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(saved).toHaveLength(0);
    expect(result.current.status.state).toBe('readonly');
  });
});

describe('audit trail diff', () => {
  it('lists changed document fields and ignores bookkeeping columns', () => {
    const before = { version: 1, data: { title: 'A', contractSumInitial: 1, components: [] } };
    const after = { version: 2, data: { title: 'B', contractSumInitial: 1, components: [{ id: 'x' }] } };
    expect(changedFields(before, after)).toEqual(['components', 'title']);
  });

  it('works for rows without a data document (memberships)', () => {
    expect(changedFields({ role: 'viewer', version: 1 }, { role: 'admin', version: 1 })).toEqual(['role']);
  });
});
