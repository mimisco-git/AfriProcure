/**
 * Applies the real migration to an in-process PostgreSQL (PGlite) with a minimal stand-in
 * for Supabase's auth schema, then exercises row-level security as different users.
 */
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { PGlite } from '@electric-sql/pglite';
import { beforeAll, describe, expect, it } from 'vitest';

const MIGRATIONS_DIR = join(import.meta.dirname, '..', 'migrations');

const users = {
  alice: { id: '00000000-0000-0000-0000-00000000000a', email: 'alice@ministry.gov.ng' },
  bob: { id: '00000000-0000-0000-0000-00000000000b', email: 'bob@ministry.gov.ng' },
  carol: { id: '00000000-0000-0000-0000-00000000000c', email: 'carol@oaugf.gov.ng' },
  dave: { id: '00000000-0000-0000-0000-00000000000d', email: 'dave@otherstate.gov.ng' },
  erin: { id: '00000000-0000-0000-0000-00000000000e', email: 'erin@ministry.gov.ng' },
} as const;
type UserKey = keyof typeof users;

const SUPABASE_AUTH_STUB = `
  create role anon nologin;
  create role authenticated nologin;
  create schema auth;
  create table auth.users (id uuid primary key, email varchar(255));
  create function auth.uid() returns uuid language sql stable as $$
    select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid
  $$;
  grant usage on schema auth to anon, authenticated;
  grant usage on schema public to anon, authenticated;
`;

let db: PGlite;

/** Run a statement as the given signed-in user (or anonymously when user is null). */
async function as<T = Record<string, unknown>>(user: UserKey | null, sql: string, params: unknown[] = []) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${user ? users[user].id : ''}', false);`);
  await db.exec(`set role ${user ? 'authenticated' : 'anon'};`);
  try {
    return (await db.query<T>(sql, params)).rows;
  } finally {
    await db.exec('reset role;');
  }
}

const contractDoc = (id: string, title = 'Highway 48') =>
  JSON.stringify({ id, title, contractCode: 'HW-048', contractSumInitial: 1000, components: [] });
const evaluationDoc = (id: string) => JSON.stringify({ id, procurementTitle: 'PPE', quotations: [] });

let orgA: string;
let orgD: string;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(SUPABASE_AUTH_STUB);
  for (const u of Object.values(users)) {
    await db.query('insert into auth.users (id, email) values ($1, $2)', [u.id, u.email]);
  }
  for (const file of readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith('.sql')).sort()) {
    await db.exec(readFileSync(join(MIGRATIONS_DIR, file), 'utf8'));
  }

  orgA = (await as<{ id: string }>('alice', `select public.create_organization('Federal Ministry of Works') as id`))[0].id;
  orgD = (await as<{ id: string }>('dave', `select public.create_organization('Other State MDA') as id`))[0].id;
  await as('alice', `select public.add_member_by_email($1, 'BOB@ministry.gov.ng', 'evaluator')`, [orgA]);
  await as('alice', `select public.add_member_by_email($1, 'carol@oaugf.gov.ng', 'auditor')`, [orgA]);
  await as('alice', `select public.add_member_by_email($1, 'erin@ministry.gov.ng', 'viewer')`, [orgA]);
  await as('alice', `insert into public.contracts (org_id, id, data) values ($1, 'c1', $2)`, [orgA, contractDoc('c1')]);
  await as('dave', `insert into public.contracts (org_id, id, data) values ($1, 'd1', $2)`, [orgD, contractDoc('d1', 'Secret')]);
});

describe('organizations and membership', () => {
  it('makes the creator an admin', async () => {
    const rows = await as<{ role: string }>('alice', 'select role from public.memberships where org_id = $1 and user_id = $2', [orgA, users.alice.id]);
    expect(rows[0].role).toBe('admin');
  });

  it('lists colleagues with emails to members only', async () => {
    expect(await as('bob', 'select * from public.list_org_members($1)', [orgA])).toHaveLength(4);
    expect(await as('dave', 'select * from public.list_org_members($1)', [orgA])).toHaveLength(0);
  });

  it('only admins can add members', async () => {
    await expect(as('bob', `select public.add_member_by_email($1, 'dave@otherstate.gov.ng', 'admin')`, [orgA])).rejects.toThrow(/Only organization admins/);
    await expect(as('bob', `insert into public.memberships (org_id, user_id, role) values ($1, $2, 'admin')`, [orgA, users.bob.id])).rejects.toThrow(/row-level security/);
  });

  it('rejects adding an email with no account', async () => {
    await expect(as('alice', `select public.add_member_by_email($1, 'nobody@x.ng', 'viewer')`, [orgA])).rejects.toThrow(/No AfriProcure account/);
  });

  it('non-admins cannot promote themselves', async () => {
    await as('bob', `update public.memberships set role = 'admin' where org_id = $1 and user_id = $2`, [orgA, users.bob.id]);
    const rows = await as<{ role: string }>('alice', 'select role from public.memberships where org_id = $1 and user_id = $2', [orgA, users.bob.id]);
    expect(rows[0].role).toBe('evaluator');
  });

  it('keeps at least one admin', async () => {
    await expect(as('alice', `update public.memberships set role = 'viewer' where org_id = $1 and user_id = $2`, [orgA, users.alice.id])).rejects.toThrow(/at least one admin/);
    await expect(as('alice', `delete from public.memberships where org_id = $1 and user_id = $2`, [orgA, users.alice.id])).rejects.toThrow(/at least one admin/);
  });
});

describe('tenant isolation', () => {
  it('members see only their own organization data', async () => {
    const titles = (await as<{ title: string }>('alice', 'select title from public.contracts')).map((r) => r.title);
    expect(titles).toEqual(['Highway 48']);
    expect(await as('alice', 'select * from public.organizations where id = $1', [orgD])).toHaveLength(0);
  });

  it('cannot write into another organization', async () => {
    await expect(as('alice', `insert into public.contracts (org_id, id, data) values ($1, 'x', $2)`, [orgD, contractDoc('x')])).rejects.toThrow(/row-level security/);
    await as('alice', `update public.contracts set data = $2 where org_id = $1`, [orgD, contractDoc('d1', 'Hacked')]);
    expect((await as<{ title: string }>('dave', 'select title from public.contracts'))[0].title).toBe('Secret');
  });

  it('cannot move a row to another organization', async () => {
    await expect(as('alice', `update public.contracts set org_id = $2 where org_id = $1 and id = 'c1'`, [orgA, orgD])).rejects.toThrow();
  });

  it('anonymous users get nothing', async () => {
    await expect(as(null, 'select * from public.contracts')).rejects.toThrow(/permission denied/);
    await expect(as(null, `select public.create_organization('x')`)).rejects.toThrow(/permission denied/);
  });
});

describe('role permissions', () => {
  it('evaluators read contracts but cannot change them', async () => {
    expect(await as('bob', 'select id from public.contracts')).toHaveLength(1);
    const updated = await as('bob', `update public.contracts set data = $2 where org_id = $1 and id = 'c1' returning id`, [orgA, contractDoc('c1', 'Edited by evaluator')]);
    expect(updated).toHaveLength(0);
  });

  it('evaluators can record bid evaluations; viewers cannot', async () => {
    await as('bob', `insert into public.bid_evaluations (org_id, id, data) values ($1, 'e1', $2)`, [orgA, evaluationDoc('e1')]);
    await expect(as('erin', `insert into public.bid_evaluations (org_id, id, data) values ($1, 'e2', $2)`, [orgA, evaluationDoc('e2')])).rejects.toThrow(/row-level security/);
    expect(await as('erin', 'select id from public.bid_evaluations')).toHaveLength(1);
  });

  it('only admins delete contracts', async () => {
    await as('alice', `insert into public.contracts (org_id, id, data) values ($1, 'tmp', $2)`, [orgA, contractDoc('tmp')]);
    expect(await as('bob', `delete from public.contracts where id = 'tmp' returning id`)).toHaveLength(0);
    expect(await as('alice', `delete from public.contracts where id = 'tmp' returning id`)).toHaveLength(1);
  });
});

describe('versioning and data integrity', () => {
  it('bumps the version on every update and supports compare-and-swap', async () => {
    await as('alice', `insert into public.contracts (org_id, id, data) values ($1, 'v1', $2)`, [orgA, contractDoc('v1')]);
    const first = await as<{ version: number }>('alice', `update public.contracts set data = $2 where org_id = $1 and id = 'v1' and version = 1 returning version`, [orgA, contractDoc('v1', 'Rev A')]);
    expect(first[0].version).toBe(2);
    // A second editor still holding version 1 must not overwrite Rev A
    const stale = await as('alice', `update public.contracts set data = $2 where org_id = $1 and id = 'v1' and version = 1 returning version`, [orgA, contractDoc('v1', 'Rev B')]);
    expect(stale).toHaveLength(0);
  });

  it('ignores client-supplied version and authorship', async () => {
    const rows = await as<{ version: number; created_by: string }>(
      'alice',
      `insert into public.contracts (org_id, id, data, version, created_by) values ($1, 'forged', $2, 99, $3) returning version, created_by`,
      [orgA, contractDoc('forged'), users.dave.id]
    );
    expect(rows[0]).toEqual({ version: 1, created_by: users.alice.id });
  });

  it('rejects documents whose id does not match the row', async () => {
    await expect(as('alice', `insert into public.contracts (org_id, id, data) values ($1, 'a', $2)`, [orgA, contractDoc('b')])).rejects.toThrow(/contracts_data_id_matches/);
  });

  it('exposes queryable projections of the document', async () => {
    const rows = await as<{ contract_code: string; contract_sum: string }>('alice', `select contract_code, contract_sum from public.contracts where id = 'c1'`);
    expect(rows[0]).toEqual({ contract_code: 'HW-048', contract_sum: '1000' });
  });
});

describe('audit log', () => {
  it('records who changed what', async () => {
    const rows = await as<{ action: string; actor_email: string; table_name: string }>(
      'alice',
      `select action, actor_email, table_name from public.audit_log where record_id = 'v1' order by id`
    );
    expect(rows.map((r) => r.action)).toEqual(['INSERT', 'UPDATE']);
    expect(rows[0].actor_email).toBe(users.alice.email);
  });

  it('records membership changes', async () => {
    const rows = await as<{ record_id: string }>('alice', `select record_id from public.audit_log where table_name = 'memberships' and action = 'INSERT'`);
    expect(rows.map((r) => r.record_id)).toContain(users.bob.id);
  });

  it('is readable by admins and auditors only', async () => {
    expect((await as('carol', 'select id from public.audit_log')).length).toBeGreaterThan(0);
    expect(await as('bob', 'select id from public.audit_log')).toHaveLength(0);
    expect(await as('erin', 'select id from public.audit_log')).toHaveLength(0);
    expect(await as('dave', 'select id from public.audit_log where org_id = $1', [orgA])).toHaveLength(0);
  });

  it('cannot be forged, edited or deleted, even by an admin', async () => {
    await expect(as('alice', `insert into public.audit_log (org_id, table_name, record_id, action) values ($1, 'x', 'x', 'INSERT')`, [orgA])).rejects.toThrow(/permission denied/);
    await expect(as('alice', `update public.audit_log set actor_email = 'someone@else'`)).rejects.toThrow(/permission denied/);
    await expect(as('alice', 'delete from public.audit_log')).rejects.toThrow(/permission denied/);
  });
});

describe('organization deletion', () => {
  it('cascades cleanly (service operation)', async () => {
    await db.exec('reset role;');
    await db.query('delete from public.organizations where id = $1', [orgD]);
    expect((await db.query('select 1 from public.contracts where org_id = $1', [orgD])).rows).toHaveLength(0);
    expect((await db.query('select 1 from public.memberships where org_id = $1', [orgD])).rows).toHaveLength(0);
  });
});
