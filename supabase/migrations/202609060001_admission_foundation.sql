begin;

-- No member content exists in this first migration. Release stays closed.
create schema private;
revoke all on schema private from public, anon, authenticated;
alter default privileges in schema private revoke all on tables from public, anon, authenticated;
alter default privileges in schema private revoke execute on functions from public, anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

create role eve_member_api nologin noinherit nobypassrls;
grant usage on schema private, public, auth to eve_member_api;
grant execute on function auth.uid() to eve_member_api;
grant select (id, email_confirmed_at) on auth.users to eve_member_api;

create table private.release_config (
  singleton boolean primary key default true check (singleton),
  member_access_enabled boolean not null default false
);
insert into private.release_config default values;

create table private.accounts (
  id uuid primary key references auth.users(id),
  handle text unique not null check (handle = lower(handle) and handle ~ '^[a-z0-9_][a-z0-9_.]{2,23}$' and handle <> 'anonymous'),
  display_name text not null check (length(trim(display_name)) between 1 and 50),
  date_of_birth date not null,
  eligibility_attested boolean not null,
  privacy text not null check (privacy in ('private', 'public')),
  tier smallint not null default 1 check (tier between 1 and 3),
  status text not null default 'active' check (status in ('active', 'suspended', 'banned', 'deleting')),
  admitted_at timestamptz,
  created_at timestamptz not null default now(),
  check (tier < 2 or admitted_at is not null)
);

create table private.admission_requests (
  applicant_id uuid primary key references private.accounts(id),
  status text not null default 'pending' check (status in ('pending', 'approved', 'declined')),
  requested_at timestamptz not null default now(),
  reviewer_id uuid,
  review_notes text,
  decided_at timestamptz
);

alter table private.accounts enable row level security;
alter table private.accounts force row level security;
alter table private.admission_requests enable row level security;
alter table private.admission_requests force row level security;
alter table private.release_config enable row level security;
alter table private.release_config force row level security;

create policy own_account_read on private.accounts for select to eve_member_api using (id = auth.uid());
create policy own_account_create on private.accounts for insert to eve_member_api with check (id = auth.uid() and tier = 1 and status = 'active' and admitted_at is null and eligibility_attested);
create policy own_review_read on private.admission_requests for select to eve_member_api using (applicant_id = auth.uid());
create policy own_review_request on private.admission_requests for insert to eve_member_api with check (applicant_id = auth.uid() and status = 'pending' and reviewer_id is null and review_notes is null and decided_at is null);
create policy read_release_flag on private.release_config for select to eve_member_api using (true);

grant select on private.accounts, private.release_config to eve_member_api;
grant insert (id, handle, display_name, date_of_birth, eligibility_attested, privacy) on private.accounts to eve_member_api;
grant select (applicant_id, status, requested_at) on private.admission_requests to eve_member_api;
grant insert (applicant_id) on private.admission_requests to eve_member_api;

create function public.eve_complete_onboarding(p_handle text, p_display_name text, p_date_of_birth date, p_eligible boolean, p_privacy text)
returns void language plpgsql security definer set search_path = '' as $$
declare actor uuid := auth.uid();
begin
  if actor is null or not exists (select 1 from auth.users where id = actor and email_confirmed_at is not null) then
    raise exception 'Verified email required' using errcode = '42501';
  end if;
  if p_date_of_birth is null or p_date_of_birth > (current_date - interval '18 years')::date or p_eligible is distinct from true then
    raise exception 'Adult eligibility declaration required' using errcode = '22023';
  end if;
  if p_privacy is null or p_privacy not in ('private', 'public') then
    raise exception 'Choose account privacy' using errcode = '22023';
  end if;
  insert into private.accounts (id, handle, display_name, date_of_birth, eligibility_attested, privacy)
  values (actor, lower(trim(p_handle)), trim(p_display_name), p_date_of_birth, p_eligible, p_privacy);
end;
$$;

create function public.eve_my_application()
returns table (handle text, display_name text, privacy text, account_status text, review_status text, member_access boolean)
language sql stable security definer set search_path = '' as $$
  select a.handle, a.display_name, a.privacy, a.status, r.status,
    (c.member_access_enabled and a.tier >= 2 and a.admitted_at is not null and a.status = 'active' and a.eligibility_attested)
  from private.accounts a cross join private.release_config c
  left join private.admission_requests r on r.applicant_id = a.id
  where a.id = auth.uid();
$$;

create function public.eve_request_team_review()
returns void language plpgsql security definer set search_path = '' as $$
begin
  if not exists (select 1 from private.accounts where id = auth.uid() and status = 'active' and tier = 1 and eligibility_attested) then
    raise exception 'Completed, unrestricted applicant account required' using errcode = '42501';
  end if;
  insert into private.admission_requests (applicant_id) values (auth.uid()) on conflict do nothing;
end;
$$;

alter function public.eve_complete_onboarding(text, text, date, boolean, text) owner to eve_member_api;
alter function public.eve_my_application() owner to eve_member_api;
alter function public.eve_request_team_review() owner to eve_member_api;
revoke all on function public.eve_complete_onboarding(text, text, date, boolean, text), public.eve_my_application(), public.eve_request_team_review() from public, anon;
grant execute on function public.eve_complete_onboarding(text, text, date, boolean, text), public.eve_my_application(), public.eve_request_team_review() to authenticated;

revoke all on all tables in schema private from public, anon, authenticated;
commit;
