-- R93 - New ACTIVE Staging-only workflows behind canonical Founder access.
-- Additive: does not alter or truncate any existing HIISSA table.
-- Security: RLS enabled, no public/anon/authenticated grants. Operations are service-role-only after existing Founder gate.
create table if not exists public.hiissa_support_request_staging (
  id uuid primary key default gen_random_uuid(),
  environment text not null default 'staging' check (environment='staging'),
  origin text not null default 'founder_staging_practice' check (origin='founder_staging_practice'),
  title text not null check (char_length(trim(title)) between 3 and 160),
  request_summary text not null check (char_length(trim(request_summary)) between 8 and 2000),
  lifecycle_state text not null default 'RECEIVED' check (lifecycle_state='RECEIVED'),
  acknowledgement_state text not null default 'APPROVED_COPY_NOT_RECOVERED' check (acknowledgement_state='APPROVED_COPY_NOT_RECOVERED'),
  assigned_department text check (assigned_department is null or assigned_department='customer_support'),
  internal_note text check (internal_note is null or char_length(internal_note)<=1500),
  created_by uuid not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version int not null default 1 check (version>=1)
);
alter table public.hiissa_support_request_staging enable row level security;
revoke all on public.hiissa_support_request_staging from public, anon, authenticated;
grant select,insert,update on public.hiissa_support_request_staging to service_role;

create table if not exists public.hiissa_staff_review_staging (
  id uuid primary key default gen_random_uuid(),
  environment text not null default 'staging' check (environment='staging'),
  staff_reference text not null check (char_length(trim(staff_reference)) between 3 and 100),
  staff_kind text not null default 'FICTIONAL_PRACTICE' check (staff_kind='FICTIONAL_PRACTICE'),
  review_area text not null check (review_area in (
    'POLICY_ACCEPTANCE','TRAINING_EVIDENCE','ACCESS_REVIEW',
    'TEMPORARY_PERMISSION','SECURITY_CONCERN','ROLE_CHANGE')),
  evidence_reference text not null check (char_length(trim(evidence_reference)) between 8 and 240),
  evidence_note text not null check (char_length(trim(evidence_note)) between 10 and 1500),
  due_on date,
  state text not null default 'RECORDED' check (state in ('RECORDED','VERIFIED_PRACTICE','NEEDS_CORRECTION')),
  founder_review_note text check (founder_review_note is null or char_length(founder_review_note)<=1000),
  created_by uuid not null,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version int not null default 1 check (version>=1),
  constraint staff_review_no_unverified_real_claim check (staff_kind='FICTIONAL_PRACTICE')
);
alter table public.hiissa_staff_review_staging enable row level security;
revoke all on public.hiissa_staff_review_staging from public, anon, authenticated;
grant select,insert,update on public.hiissa_staff_review_staging to service_role;

-- All changes and their canonical audit event commit in one DB transaction.
-- Note: service_role can only reach these via Founder-gated Staging server routes.
create or replace function public.hiissa_support_staging_founder_command(
  p_actor uuid, p_action text, p_id uuid default null,
  p_title text default null, p_summary text default null,
  p_note text default null, p_version integer default null)
returns jsonb language plpgsql security invoker set search_path=public
as $body$
declare v_row public.hiissa_support_request_staging%rowtype;
begin
  if p_actor is null or p_action not in ('create','assign','save_internal_note') then
    raise exception 'INVALID_SUPPORT_COMMAND';
  end if;
  if p_action='create' then
    insert into public.hiissa_support_request_staging
      (title,request_summary,created_by)
    values (trim(p_title),trim(p_summary),p_actor) returning * into v_row;
  else
    select * into v_row from public.hiissa_support_request_staging where id=p_id and environment='staging' for update;
    if not found then raise exception 'SUPPORT_CASE_NOT_FOUND'; end if;
    if p_version is distinct from v_row.version then raise exception 'SUPPORT_STALE_VERSION'; end if;
    if p_action='assign' then
      update public.hiissa_support_request_staging set assigned_department='customer_support',
         updated_at=now(),version=version+1 where id=p_id returning * into v_row;
    elsif p_action='save_internal_note' then
      if length(trim(coalesce(p_note,'')))<8 then raise exception 'NOTE_REQUIRED';end if;
      update public.hiissa_support_request_staging set internal_note=trim(p_note),
         updated_at=now(),version=version+1 where id=p_id returning * into v_row;
    end if;
  end if;
  insert into public.admin_audit_events
    (event_type,actor_user_id,module_id,resource_id,action_id,outcome,oversight_level,environment,details)
  values ('hiissa_customer_communication_staging',p_actor,'feedback-recommendations',v_row.id::text,
    p_action,'recorded',2,'staging',jsonb_build_object(
      'feature_id','customer-communication-service-level-centre','is_fictional',true,
      'outbound_sent',false,'version',v_row.version,'state',v_row.lifecycle_state));
  return jsonb_build_object('id',v_row.id,'version',v_row.version,'action',p_action,
      'acknowledgement_sent',false,'external_delivery',false);
end $body$;

create or replace function public.hiissa_staff_review_staging_founder_command(
  p_actor uuid,p_action text,p_id uuid default null,p_staff_reference text default null,
  p_review_area text default null,p_evidence_reference text default null,p_evidence_note text default null,
  p_due_on date default null,p_founder_note text default null,p_version integer default null)
returns jsonb language plpgsql security invoker set search_path=public
as $body$
declare v_row public.hiissa_staff_review_staging%rowtype;
begin
  if p_actor is null or p_action not in ('record','verify_practice','request_correction') then
    raise exception 'INVALID_REVIEW_COMMAND';
  end if;
  if p_action='record' then
    insert into public.hiissa_staff_review_staging
      (staff_reference,review_area,evidence_reference,evidence_note,due_on,created_by)
    values (trim(p_staff_reference),p_review_area,trim(p_evidence_reference),
      trim(p_evidence_note),p_due_on,p_actor) returning * into v_row;
  else
    select * into v_row from public.hiissa_staff_review_staging where id=p_id and environment='staging' for update;
    if not found then raise exception 'STAFF_REVIEW_NOT_FOUND'; end if;
    if p_version is distinct from v_row.version then raise exception 'REVIEW_STALE_VERSION'; end if;
    if length(trim(coalesce(p_founder_note,'')))<8 then raise exception 'REVIEW_REASON_REQUIRED'; end if;
    if p_action='verify_practice' then
      update public.hiissa_staff_review_staging
        set state='VERIFIED_PRACTICE',founder_review_note=trim(p_founder_note),
        reviewed_by=p_actor,reviewed_at=now(),updated_at=now(),version=version+1
        where id=p_id returning * into v_row;
    else
      update public.hiissa_staff_review_staging
        set state='NEEDS_CORRECTION',founder_review_note=trim(p_founder_note),
        reviewed_by=p_actor,reviewed_at=now(),updated_at=now(),version=version+1
        where id=p_id returning * into v_row;
    end if;
  end if;
  insert into public.admin_audit_events
    (event_type,actor_user_id,module_id,resource_id,action_id,outcome,oversight_level,environment,details)
  values ('hiissa_staff_review_staging',p_actor,'admin-security-audit',v_row.id::text,
    p_action,'recorded',2,'staging',jsonb_build_object(
      'feature_id','staff-trust-training-access-review','fictional_practice',true,
      'real_training_certified',false,'permissions_changed',false,
      'version',v_row.version,'state',v_row.state));
  return jsonb_build_object('id',v_row.id,'version',v_row.version,'action',p_action,
    'practice_only',true,'permissions_changed',false);
end $body$;

revoke all on function public.hiissa_support_staging_founder_command(
  uuid,text,uuid,text,text,text,integer) from public,anon,authenticated;
grant execute on function public.hiissa_support_staging_founder_command(
  uuid,text,uuid,text,text,text,integer) to service_role;
revoke all on function public.hiissa_staff_review_staging_founder_command(
  uuid,text,uuid,text,text,text,text,date,text,integer) from public,anon,authenticated;
grant execute on function public.hiissa_staff_review_staging_founder_command(
  uuid,text,uuid,text,text,text,text,date,text,integer) to service_role;
