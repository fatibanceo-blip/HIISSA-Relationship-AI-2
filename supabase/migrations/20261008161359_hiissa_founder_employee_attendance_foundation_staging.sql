/* Exact applied Staging migration 20261008161359.
   Additive, no alterations to previously approved onboarding UI, Admin tables or Production. */
create table if not exists public.hiissa_staff_onboarding_applications (
  application_id uuid primary key default gen_random_uuid(),
  environment text not null default 'staging' check (environment = 'staging'),
  onboarding_source text not null default 'existing_hiissa_staff_onboarding' check (onboarding_source = 'existing_hiissa_staff_onboarding'),
  invitation_reference uuid unique,
  founder_approval_request_id uuid unique references public.admin_approval_requests(id) on delete restrict,
  submission_state text not null default 'invited' check (submission_state in ('invited','in_progress','submitted','under_review','returned','rejected','approved_pending_engagement','approved_engagement','withdrawn','expired')),
  work_email text,
  legal_name text,
  preferred_name text,
  proposed_department text,
  proposed_role text,
  working_jurisdiction text,
  policy_evidence jsonb not null default '{}'::jsonb check (jsonb_typeof(policy_evidence) = 'object'),
  created_at timestamptz not null default now(),
  submitted_at timestamptz,
  updated_at timestamptz not null default now(),
  check (work_email is null or char_length(work_email) <= 320),
  check (legal_name is null or char_length(legal_name) <= 160),
  check (preferred_name is null or char_length(preferred_name) <= 160)
);
create table if not exists public.hiissa_employee_register (
  employee_id uuid primary key default gen_random_uuid(),
  environment text not null default 'staging' check (environment = 'staging'),
  application_id uuid not null unique references public.hiissa_staff_onboarding_applications(application_id) on delete restrict,
  founder_approval_request_id uuid not null references public.admin_approval_requests(id) on delete restrict,
  engagement_confirmed_by uuid not null references public.admin_users(user_id) on delete restrict,
  engagement_confirmed_at timestamptz not null,
  display_name text not null check (char_length(trim(display_name)) between 1 and 160),
  department text not null check (char_length(trim(department)) between 1 and 160),
  role_label text not null check (char_length(trim(role_label)) between 1 and 160),
  employment_state text not null default 'confirmed' check (employment_state in ('confirmed','on_leave','ended','archived')),
  engagement_type text not null check (engagement_type in ('employee','contractor')),
  start_date date,
  end_date date,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  check (end_date is null or start_date is null or end_date >= start_date),
  check (employment_state <> 'archived' or archived_at is not null)
);
create table if not exists public.hiissa_attendance_events (
  attendance_event_id uuid primary key default gen_random_uuid(),
  environment text not null default 'staging' check (environment = 'staging'),
  employee_id uuid not null references public.hiissa_employee_register(employee_id) on delete restrict,
  attendance_kind text not null check (attendance_kind in ('check_in','check_out','absence_reported')),
  occurred_at timestamptz not null,
  recorded_at timestamptz not null default now(),
  recorded_by uuid not null references public.admin_users(user_id) on delete restrict,
  evidence_source text not null check (evidence_source in ('founder_confirmed','authorised_staff_event')),
  idempotency_key text unique,
  check (idempotency_key is null or char_length(idempotency_key) between 8 and 120)
);
create index if not exists hiissa_staff_application_state_idx on public.hiissa_staff_onboarding_applications(submission_state,created_at desc);
create index if not exists hiissa_employee_department_idx on public.hiissa_employee_register(department,employment_state);
create index if not exists hiissa_attendance_employee_time_idx on public.hiissa_attendance_events(employee_id,occurred_at desc);
alter table public.hiissa_staff_onboarding_applications enable row level security;
alter table public.hiissa_employee_register enable row level security;
alter table public.hiissa_attendance_events enable row level security;
revoke all on table public.hiissa_staff_onboarding_applications, public.hiissa_employee_register, public.hiissa_attendance_events from public, anon, authenticated;
grant select, insert, update on table public.hiissa_staff_onboarding_applications to service_role;
grant select, insert, update on table public.hiissa_employee_register to service_role;
grant select, insert on table public.hiissa_attendance_events to service_role;
comment on table public.hiissa_staff_onboarding_applications is 'STAGING ONLY. Future durable counterpart for already-approved onboarding journey. Existing UI unchanged. No automatic employment or access grant.';
comment on table public.hiissa_employee_register is 'STAGING ONLY. One engagement identity per approved application; not an Admin account; never infer attendance. No real records yet.';
comment on table public.hiissa_attendance_events is 'STAGING ONLY. Independent immutable attendance evidence, not login/session status. No demo metrics.';
