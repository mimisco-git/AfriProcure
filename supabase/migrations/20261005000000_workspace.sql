-- AfriProcure multi-tenant workspace
--
-- Every row belongs to an organization (a procuring entity, MDA or firm). Access is
-- enforced here with row-level security, never only in the browser:
--
--   role                 contracts      bid evaluations   members   audit log
--   admin                read/write     read/write        manage    read
--   procurement_officer  read/write     read/write        read      -
--   evaluator            read           read/write        read      -
--   auditor              read           read              read      read
--   viewer               read           read              read      -
--
-- The audit log is append-only: it is written exclusively by triggers and nobody,
-- including admins, can update or delete it through the API.

-- ---------------------------------------------------------------------------
-- Types and tables
-- ---------------------------------------------------------------------------

create type public.org_role as enum ('admin', 'procurement_officer', 'evaluator', 'auditor', 'viewer');

create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(btrim(name)) between 2 and 200),
  created_at timestamptz not null default now(),
  created_by uuid references auth.users (id) on delete set null default auth.uid()
);

create table public.memberships (
  org_id uuid not null references public.organizations (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  role public.org_role not null,
  created_at timestamptz not null default now(),
  primary key (org_id, user_id)
);
create index memberships_user_idx on public.memberships (user_id);

create table public.contracts (
  org_id uuid not null references public.organizations (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 100),
  data jsonb not null,
  -- Queryable projections of the document
  title text generated always as (data ->> 'title') stored,
  contract_code text generated always as (data ->> 'contractCode') stored,
  contract_sum numeric generated always as ((data ->> 'contractSumInitial')::numeric) stored,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (org_id, id),
  constraint contracts_data_id_matches check (data ->> 'id' = id),
  constraint contracts_data_shape check (
    jsonb_typeof(data -> 'components') = 'array'
    and jsonb_typeof(data -> 'contractSumInitial') = 'number'
  )
);

create table public.bid_evaluations (
  org_id uuid not null references public.organizations (id) on delete cascade,
  id text not null check (char_length(id) between 1 and 100),
  data jsonb not null,
  procurement_title text generated always as (data ->> 'procurementTitle') stored,
  winner_name text generated always as (data ->> 'winnerName') stored,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  updated_at timestamptz not null default now(),
  updated_by uuid default auth.uid(),
  primary key (org_id, id),
  constraint bid_evaluations_data_id_matches check (data ->> 'id' = id),
  constraint bid_evaluations_data_shape check (jsonb_typeof(data -> 'quotations') = 'array')
);
create index bid_evaluations_recent_idx on public.bid_evaluations (org_id, created_at desc);

create table public.audit_log (
  id bigint generated always as identity primary key,
  org_id uuid not null references public.organizations (id) on delete cascade,
  table_name text not null,
  record_id text not null,
  action text not null check (action in ('INSERT', 'UPDATE', 'DELETE')),
  actor_id uuid,
  actor_email text,
  occurred_at timestamptz not null default now(),
  old_data jsonb,
  new_data jsonb
);
create index audit_log_org_time_idx on public.audit_log (org_id, occurred_at desc);

-- ---------------------------------------------------------------------------
-- Authorization helpers
-- ---------------------------------------------------------------------------

-- SECURITY DEFINER so policies on memberships can call it without recursing into RLS.
create function public.has_org_role(target_org uuid, allowed public.org_role[])
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships m
    where m.org_id = target_org
      and m.user_id = auth.uid()
      and m.role = any (allowed)
  );
$$;

create function public.is_org_member(target_org uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.memberships m
    where m.org_id = target_org and m.user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Triggers: versioning, immutability of identity columns, audit trail
-- ---------------------------------------------------------------------------

create function public.touch_versioned_row()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.org_id is distinct from old.org_id or new.id is distinct from old.id then
    raise exception 'org_id and id are immutable' using errcode = '42501';
  end if;
  new.created_at := old.created_at;
  new.created_by := old.created_by;
  new.version := old.version + 1;
  new.updated_at := now();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger contracts_touch before update on public.contracts
  for each row execute function public.touch_versioned_row();
create trigger bid_evaluations_touch before update on public.bid_evaluations
  for each row execute function public.touch_versioned_row();

create function public.stamp_new_row()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.version := 1;
  new.created_at := now();
  new.updated_at := now();
  new.created_by := auth.uid();
  new.updated_by := auth.uid();
  return new;
end;
$$;

create trigger contracts_stamp before insert on public.contracts
  for each row execute function public.stamp_new_row();
create trigger bid_evaluations_stamp before insert on public.bid_evaluations
  for each row execute function public.stamp_new_row();

create function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  row_doc jsonb := to_jsonb(case when tg_op = 'DELETE' then old else new end);
  row_org uuid := (row_doc ->> 'org_id')::uuid;
begin
  -- Rows removed by an organization-wide cascade have nothing left to audit against
  if not exists (select 1 from public.organizations o where o.id = row_org) then
    return null;
  end if;

  insert into public.audit_log (org_id, table_name, record_id, action, actor_id, actor_email, old_data, new_data)
  values (
    row_org,
    tg_table_name,
    coalesce(row_doc ->> 'id', row_doc ->> 'user_id'),
    tg_op,
    auth.uid(),
    (select u.email from auth.users u where u.id = auth.uid()),
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) end
  );
  return null;
end;
$$;

create trigger contracts_audit after insert or update or delete on public.contracts
  for each row execute function public.write_audit_log();
create trigger bid_evaluations_audit after insert or update or delete on public.bid_evaluations
  for each row execute function public.write_audit_log();
create trigger memberships_audit after insert or update or delete on public.memberships
  for each row execute function public.write_audit_log();

-- An organization must always keep at least one admin.
create function public.protect_last_admin()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if old.role = 'admin'
     and (tg_op = 'DELETE' or new.role <> 'admin')
     and not exists (
       select 1 from public.memberships m
       where m.org_id = old.org_id and m.role = 'admin' and m.user_id <> old.user_id
     )
     -- Allow the cascade when the whole organization is being deleted
     and exists (select 1 from public.organizations o where o.id = old.org_id)
  then
    raise exception 'An organization must keep at least one admin' using errcode = '42501';
  end if;
  return coalesce(new, old);
end;
$$;

create trigger memberships_protect_last_admin before update or delete on public.memberships
  for each row execute function public.protect_last_admin();

-- ---------------------------------------------------------------------------
-- Row-level security
-- ---------------------------------------------------------------------------

alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.contracts enable row level security;
alter table public.bid_evaluations enable row level security;
alter table public.audit_log enable row level security;

create policy "members read their organizations" on public.organizations
  for select to authenticated using (public.is_org_member(id));
create policy "admins rename their organizations" on public.organizations
  for update to authenticated
  using (public.has_org_role(id, array['admin']::public.org_role[]))
  with check (public.has_org_role(id, array['admin']::public.org_role[]));
-- Organizations are created through create_organization() so the creator becomes admin atomically.

create policy "members read memberships of their organizations" on public.memberships
  for select to authenticated using (public.is_org_member(org_id));
create policy "admins add members" on public.memberships
  for insert to authenticated with check (public.has_org_role(org_id, array['admin']::public.org_role[]));
create policy "admins change roles" on public.memberships
  for update to authenticated
  using (public.has_org_role(org_id, array['admin']::public.org_role[]))
  with check (public.has_org_role(org_id, array['admin']::public.org_role[]));
create policy "admins remove members, anyone may leave" on public.memberships
  for delete to authenticated
  using (public.has_org_role(org_id, array['admin']::public.org_role[]) or user_id = auth.uid());

create policy "members read contracts" on public.contracts
  for select to authenticated using (public.is_org_member(org_id));
create policy "officers create contracts" on public.contracts
  for insert to authenticated
  with check (public.has_org_role(org_id, array['admin', 'procurement_officer']::public.org_role[]));
create policy "officers edit contracts" on public.contracts
  for update to authenticated
  using (public.has_org_role(org_id, array['admin', 'procurement_officer']::public.org_role[]))
  with check (public.has_org_role(org_id, array['admin', 'procurement_officer']::public.org_role[]));
create policy "admins delete contracts" on public.contracts
  for delete to authenticated using (public.has_org_role(org_id, array['admin']::public.org_role[]));

create policy "members read evaluations" on public.bid_evaluations
  for select to authenticated using (public.is_org_member(org_id));
create policy "evaluators create evaluations" on public.bid_evaluations
  for insert to authenticated
  with check (public.has_org_role(org_id, array['admin', 'procurement_officer', 'evaluator']::public.org_role[]));
create policy "evaluators edit evaluations" on public.bid_evaluations
  for update to authenticated
  using (public.has_org_role(org_id, array['admin', 'procurement_officer', 'evaluator']::public.org_role[]))
  with check (public.has_org_role(org_id, array['admin', 'procurement_officer', 'evaluator']::public.org_role[]));
create policy "admins delete evaluations" on public.bid_evaluations
  for delete to authenticated using (public.has_org_role(org_id, array['admin']::public.org_role[]));

create policy "admins and auditors read the audit log" on public.audit_log
  for select to authenticated using (public.has_org_role(org_id, array['admin', 'auditor']::public.org_role[]));

-- Table privileges: RLS narrows these further. The audit log is read-only for everyone.
revoke all on public.organizations, public.memberships, public.contracts, public.bid_evaluations, public.audit_log from anon;
revoke all on public.organizations, public.memberships, public.contracts, public.bid_evaluations, public.audit_log from authenticated;
grant select, update on public.organizations to authenticated;
grant select, insert, update, delete on public.memberships, public.contracts, public.bid_evaluations to authenticated;
grant select on public.audit_log to authenticated;

-- ---------------------------------------------------------------------------
-- RPCs
-- ---------------------------------------------------------------------------

create function public.create_organization(org_name text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  new_org uuid;
begin
  if auth.uid() is null then
    raise exception 'Not authenticated' using errcode = '28000';
  end if;
  insert into public.organizations (name, created_by) values (btrim(org_name), auth.uid()) returning id into new_org;
  insert into public.memberships (org_id, user_id, role) values (new_org, auth.uid(), 'admin');
  return new_org;
end;
$$;

-- Admins add an existing user (who has signed up) by email, or change their role.
create function public.add_member_by_email(target_org uuid, member_email text, member_role public.org_role)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_user uuid;
begin
  if not public.has_org_role(target_org, array['admin']::public.org_role[]) then
    raise exception 'Only organization admins can add members' using errcode = '42501';
  end if;
  select u.id into target_user from auth.users u where lower(u.email) = lower(btrim(member_email));
  if target_user is null then
    raise exception 'No AfriProcure account exists for %. Ask them to sign up first.', member_email using errcode = 'P0002';
  end if;
  insert into public.memberships (org_id, user_id, role)
  values (target_org, target_user, member_role)
  on conflict (org_id, user_id) do update set role = excluded.role;
end;
$$;

-- auth.users is not exposed to clients; members see colleagues' emails through this.
create function public.list_org_members(target_org uuid)
returns table (user_id uuid, email text, role public.org_role, joined_at timestamptz)
language sql
stable
security definer
set search_path = ''
as $$
  select m.user_id, u.email::text, m.role, m.created_at
  from public.memberships m
  join auth.users u on u.id = m.user_id
  where m.org_id = target_org and public.is_org_member(target_org)
  order by m.created_at;
$$;

revoke execute on function public.create_organization(text) from public, anon;
revoke execute on function public.add_member_by_email(uuid, text, public.org_role) from public, anon;
revoke execute on function public.list_org_members(uuid) from public, anon;
grant execute on function public.create_organization(text) to authenticated;
grant execute on function public.add_member_by_email(uuid, text, public.org_role) to authenticated;
grant execute on function public.list_org_members(uuid) to authenticated;
