-- HIISSA Relationship AI
-- Staging migration: working Customer Support + Universal Founder Submission Gate.
-- Supabase migration version: 20261005054230
-- Production is not targeted by this migration.
--
-- This preserves the existing admin approval source of truth and adds one
-- canonical Staging-only staff work record. All current work items are forced
-- fictional and external effects are forced off.

alter table public.admin_approval_requests
  drop constraint if exists admin_approval_requests_status_check;

alter table public.admin_approval_requests
  add constraint admin_approval_requests_status_check
  check (
    status = any (
      array[
        'pending'::text,
        'approved'::text,
        'denied'::text,
        'cancelled'::text,
        'expired'::text,
        'returned_for_changes'::text,
        'approved_pending_execution'::text,
        'executing'::text,
        'verified_complete'::text,
        'failed_needs_attention'::text,
        'rejected'::text
      ]
    )
  );

alter table public.admin_approval_decisions
  drop constraint if exists admin_approval_decisions_decision_check;

alter table public.admin_approval_decisions
  add constraint admin_approval_decisions_decision_check
  check (
    decision = any (
      array[
        'approve'::text,
        'deny'::text,
        'return_for_changes'::text,
        'reject'::text
      ]
    )
  );

grant select, insert, update on table public.admin_approval_requests to service_role;
grant select, insert on table public.admin_approval_decisions to service_role;
grant select, insert on table public.admin_audit_events to service_role;
grant select on table public.admin_role_assignments to service_role;
grant select on table public.admin_permission_rules to service_role;

create table if not exists public.staff_work_items (
  id uuid primary key default gen_random_uuid(),
  case_code text not null unique,
  workspace_id text not null default 'customer_support',
  work_type text not null default 'customer_support_case',
  title text not null,
  category text not null default 'Account & Access',
  priority text not null default 'normal',
  summary text not null,
  source_kind text not null default 'fictional_staging',
  assigned_to_user_id uuid references auth.users(id) on delete restrict,
  preview_owner_user_id uuid references auth.users(id) on delete restrict,
  status text not null default 'assigned',
  draft_response text,
  internal_note text,
  founder_note text,
  approval_request_id uuid unique references public.admin_approval_requests(id) on delete restrict,
  environment text not null default 'staging',
  is_fictional boolean not null default true,
  external_effect_enabled boolean not null default false,
  received_at timestamptz not null default now(),
  response_due_at timestamptz,
  submitted_at timestamptz,
  returned_at timestamptz,
  approved_at timestamptz,
  verified_completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1,
  constraint staff_work_items_environment_check check (environment = 'staging'),
  constraint staff_work_items_fictional_check check (is_fictional = true),
  constraint staff_work_items_external_effect_check check (external_effect_enabled = false),
  constraint staff_work_items_workspace_check check (
    workspace_id = any (
      array[
        'technical_operations'::text,
        'customer_support'::text,
        'finance_subscriptions'::text,
        'safety_safeguarding'::text,
        'privacy_data_protection'::text,
        'content_moderation'::text,
        'product_quality'::text
      ]
    )
  ),
  constraint staff_work_items_priority_check check (
    priority = any (array['low'::text, 'normal'::text, 'high'::text, 'urgent'::text])
  ),
  constraint staff_work_items_status_check check (
    status = any (
      array[
        'assigned'::text,
        'in_progress'::text,
        'saved_draft'::text,
        'submitted_for_processing'::text,
        'returned_for_changes'::text,
        'approved_pending_execution'::text,
        'executing'::text,
        'verified_complete'::text,
        'failed_needs_attention'::text,
        'rejected'::text,
        'cancelled'::text
      ]
    )
  ),
  constraint staff_work_items_case_code_nonempty check (length(trim(case_code)) > 0),
  constraint staff_work_items_title_nonempty check (length(trim(title)) > 0),
  constraint staff_work_items_summary_nonempty check (length(trim(summary)) > 0),
  constraint staff_work_items_version_positive check (version >= 1)
);

comment on table public.staff_work_items is
  'Canonical Staging-only staff work record. Current rows are fictional and cannot create external customer effects.';

comment on column public.staff_work_items.approval_request_id is
  'Links the staff work item to the one canonical Founder approval record; no duplicate approval truth is created.';

alter table public.staff_work_items enable row level security;

revoke all on table public.staff_work_items from anon, authenticated;
grant select, insert, update, delete on table public.staff_work_items to service_role;

create index if not exists staff_work_items_assigned_to_idx
  on public.staff_work_items (assigned_to_user_id)
  where assigned_to_user_id is not null;

create index if not exists staff_work_items_preview_owner_idx
  on public.staff_work_items (preview_owner_user_id)
  where preview_owner_user_id is not null;

create index if not exists staff_work_items_status_idx
  on public.staff_work_items (status, updated_at desc);

create index if not exists staff_work_items_approval_request_idx
  on public.staff_work_items (approval_request_id)
  where approval_request_id is not null;

create unique index if not exists admin_permission_rules_unique_active_scope
  on public.admin_permission_rules (
    role_id, module_id, resource_id, action_id, environment
  );

insert into public.admin_permission_rules (
  role_id,
  module_id,
  resource_id,
  action_id,
  effect,
  oversight_level,
  environment,
  is_active,
  created_by
)
values
  ('customer_support', 'customer_support', 'staff_work_items', 'view_assigned_work', 'allow', 1, 'staging', true, null),
  ('customer_support', 'customer_support', 'staff_work_items', 'start_work', 'allow', 1, 'staging', true, null),
  ('customer_support', 'customer_support', 'staff_work_items', 'save_draft', 'allow', 1, 'staging', true, null),
  ('customer_support', 'customer_support', 'staff_work_items', 'submit_for_processing', 'allow', 3, 'staging', true, null)
on conflict (role_id, module_id, resource_id, action_id, environment)
do update set
  effect = excluded.effect,
  oversight_level = excluded.oversight_level,
  is_active = excluded.is_active;

create or replace function public.hiissa_staff_save_work_item(
  p_work_item_id uuid,
  p_actor_user_id uuid,
  p_action text,
  p_draft_response text default null,
  p_internal_note text default null
)
returns public.staff_work_items
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item public.staff_work_items;
  v_next_status text;
begin
  if p_action not in ('start', 'save') then
    raise exception 'INVALID_STAFF_ACTION';
  end if;

  select *
  into v_item
  from public.staff_work_items
  where id = p_work_item_id
    and environment = 'staging'
    and is_fictional = true
    and external_effect_enabled = false
  for update;

  if not found then
    raise exception 'STAFF_WORK_ITEM_NOT_FOUND';
  end if;

  if not (
    v_item.assigned_to_user_id = p_actor_user_id
    or v_item.preview_owner_user_id = p_actor_user_id
  ) then
    raise exception 'STAFF_WORK_ITEM_FORBIDDEN';
  end if;

  if v_item.status in (
    'submitted_for_processing',
    'approved_pending_execution',
    'executing',
    'verified_complete',
    'rejected',
    'cancelled'
  ) then
    raise exception 'STAFF_WORK_ITEM_LOCKED';
  end if;

  v_next_status := case
    when p_action = 'start' then 'in_progress'
    else 'saved_draft'
  end;

  update public.staff_work_items
  set
    status = v_next_status,
    draft_response = case
      when p_action = 'save' then nullif(btrim(coalesce(p_draft_response, '')), '')
      else draft_response
    end,
    internal_note = case
      when p_action = 'save' then nullif(btrim(coalesce(p_internal_note, '')), '')
      else internal_note
    end,
    updated_at = now(),
    version = version + 1
  where id = p_work_item_id
  returning * into v_item;

  insert into public.admin_audit_events (
    event_type,
    actor_user_id,
    module_id,
    resource_id,
    action_id,
    outcome,
    oversight_level,
    approval_request_id,
    environment,
    details
  )
  values (
    case when p_action = 'start' then 'staff_work_started' else 'staff_draft_saved' end,
    p_actor_user_id,
    'customer_support',
    'staff_work_item:' || p_work_item_id::text,
    case when p_action = 'start' then 'start_work' else 'save_draft' end,
    'recorded',
    1,
    v_item.approval_request_id,
    'staging',
    jsonb_build_object(
      'workspace_id', v_item.workspace_id,
      'case_code', v_item.case_code,
      'is_fictional', true,
      'external_effect_enabled', false,
      'status', v_item.status
    )
  );

  return v_item;
end;
$$;

create or replace function public.hiissa_staff_submit_for_processing(
  p_work_item_id uuid,
  p_actor_user_id uuid
)
returns public.staff_work_items
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_item public.staff_work_items;
  v_request_id uuid;
begin
  select *
  into v_item
  from public.staff_work_items
  where id = p_work_item_id
    and environment = 'staging'
    and is_fictional = true
    and external_effect_enabled = false
  for update;

  if not found then
    raise exception 'STAFF_WORK_ITEM_NOT_FOUND';
  end if;

  if not (
    v_item.assigned_to_user_id = p_actor_user_id
    or v_item.preview_owner_user_id = p_actor_user_id
  ) then
    raise exception 'STAFF_WORK_ITEM_FORBIDDEN';
  end if;

  if nullif(btrim(coalesce(v_item.draft_response, '')), '') is null then
    raise exception 'STAFF_DRAFT_REQUIRED';
  end if;

  if v_item.status in (
    'approved_pending_execution',
    'executing',
    'verified_complete',
    'rejected',
    'cancelled'
  ) then
    raise exception 'STAFF_WORK_ITEM_LOCKED';
  end if;

  if v_item.approval_request_id is null then
    insert into public.admin_approval_requests (
      requested_by,
      action_id,
      module_id,
      resource_id,
      environment,
      oversight_level,
      status,
      request_context
    )
    values (
      p_actor_user_id,
      'staff_submit_for_processing',
      'customer_support',
      'staff_work_item:' || v_item.id::text,
      'staging',
      3,
      'pending',
      jsonb_build_object(
        'work_item_id', v_item.id,
        'case_code', v_item.case_code,
        'workspace_id', v_item.workspace_id,
        'title', v_item.title,
        'is_fictional', true,
        'external_effect_enabled', false,
        'submission_rule', 'UNIVERSAL_FOUNDER_SUBMISSION_GATE'
      )
    )
    returning id into v_request_id;
  else
    v_request_id := v_item.approval_request_id;

    update public.admin_approval_requests
    set
      status = 'pending',
      resolved_at = null,
      request_context = request_context || jsonb_build_object(
        'resubmitted_at', now(),
        'work_item_id', v_item.id,
        'case_code', v_item.case_code,
        'workspace_id', v_item.workspace_id,
        'title', v_item.title,
        'is_fictional', true,
        'external_effect_enabled', false
      )
    where id = v_request_id
      and environment = 'staging';
  end if;

  update public.staff_work_items
  set
    status = 'submitted_for_processing',
    approval_request_id = v_request_id,
    submitted_at = now(),
    updated_at = now(),
    version = version + 1
  where id = v_item.id
  returning * into v_item;

  insert into public.admin_audit_events (
    event_type,
    actor_user_id,
    module_id,
    resource_id,
    action_id,
    outcome,
    oversight_level,
    approval_request_id,
    environment,
    details
  )
  values (
    'staff_submitted_for_processing',
    p_actor_user_id,
    'customer_support',
    'staff_work_item:' || v_item.id::text,
    'submit_for_processing',
    'pending',
    3,
    v_request_id,
    'staging',
    jsonb_build_object(
      'case_code', v_item.case_code,
      'status', v_item.status,
      'is_fictional', true,
      'external_effect_enabled', false,
      'founder_route', 'Founder Command / Approval Inbox'
    )
  );

  return v_item;
end;
$$;

create or replace function public.hiissa_founder_resolve_staff_work(
  p_request_id uuid,
  p_founder_user_id uuid,
  p_decision text,
  p_rationale text default null
)
returns public.staff_work_items
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_request public.admin_approval_requests;
  v_item public.staff_work_items;
  v_request_status text;
  v_item_status text;
  v_decision_value text;
  v_audit_outcome text;
begin
  if not exists (
    select 1
    from public.admin_users
    where user_id = p_founder_user_id
  ) then
    raise exception 'FOUNDER_GATE_REQUIRED';
  end if;

  if p_decision not in ('approve', 'return_for_changes', 'reject') then
    raise exception 'INVALID_FOUNDER_DECISION';
  end if;

  select *
  into v_request
  from public.admin_approval_requests
  where id = p_request_id
    and environment = 'staging'
    and action_id = 'staff_submit_for_processing'
    and module_id = 'customer_support'
  for update;

  if not found then
    raise exception 'APPROVAL_REQUEST_NOT_FOUND';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'APPROVAL_REQUEST_NOT_PENDING';
  end if;

  select *
  into v_item
  from public.staff_work_items
  where approval_request_id = p_request_id
    and environment = 'staging'
    and is_fictional = true
    and external_effect_enabled = false
  for update;

  if not found then
    raise exception 'STAFF_WORK_ITEM_NOT_FOUND';
  end if;

  if p_decision = 'approve' then
    v_request_status := 'approved_pending_execution';
    v_item_status := 'approved_pending_execution';
    v_decision_value := 'approve';
    v_audit_outcome := 'allowed';
  elsif p_decision = 'return_for_changes' then
    v_request_status := 'returned_for_changes';
    v_item_status := 'returned_for_changes';
    v_decision_value := 'return_for_changes';
    v_audit_outcome := 'recorded';
  else
    v_request_status := 'rejected';
    v_item_status := 'rejected';
    v_decision_value := 'reject';
    v_audit_outcome := 'denied';
  end if;

  insert into public.admin_approval_decisions (
    request_id,
    decided_by,
    decision,
    rationale,
    environment
  )
  values (
    p_request_id,
    p_founder_user_id,
    v_decision_value,
    nullif(btrim(coalesce(p_rationale, '')), ''),
    'staging'
  );

  update public.admin_approval_requests
  set
    status = v_request_status,
    resolved_at = now()
  where id = p_request_id;

  update public.staff_work_items
  set
    status = v_item_status,
    founder_note = nullif(btrim(coalesce(p_rationale, '')), ''),
    returned_at = case when p_decision = 'return_for_changes' then now() else returned_at end,
    approved_at = case when p_decision = 'approve' then now() else approved_at end,
    updated_at = now(),
    version = version + 1
  where id = v_item.id
  returning * into v_item;

  insert into public.admin_audit_events (
    event_type,
    actor_user_id,
    module_id,
    resource_id,
    action_id,
    outcome,
    oversight_level,
    approval_request_id,
    environment,
    details
  )
  values (
    'founder_staff_submission_decision',
    p_founder_user_id,
    'customer_support',
    'staff_work_item:' || v_item.id::text,
    p_decision,
    v_audit_outcome,
    3,
    p_request_id,
    'staging',
    jsonb_build_object(
      'decision', p_decision,
      'request_status', v_request_status,
      'work_item_status', v_item_status,
      'is_fictional', true,
      'external_effect_enabled', false,
      'approval_is_not_verified_completion', true
    )
  );

  return v_item;
end;
$$;

revoke all on function public.hiissa_staff_save_work_item(uuid, uuid, text, text, text)
  from public, anon, authenticated;
revoke all on function public.hiissa_staff_submit_for_processing(uuid, uuid)
  from public, anon, authenticated;
revoke all on function public.hiissa_founder_resolve_staff_work(uuid, uuid, text, text)
  from public, anon, authenticated;

grant execute on function public.hiissa_staff_save_work_item(uuid, uuid, text, text, text)
  to service_role;
grant execute on function public.hiissa_staff_submit_for_processing(uuid, uuid)
  to service_role;
grant execute on function public.hiissa_founder_resolve_staff_work(uuid, uuid, text, text)
  to service_role;
