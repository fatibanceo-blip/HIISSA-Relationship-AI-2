-- HIISSA additive shared incident state, STAGING ONLY.
-- EXISTING audit trail and Founder approval inbox are preserved and reused.
-- No customer data, personal conversation, or Production changes.
create table if not exists public.hiissa_operational_incidents (
  incident_id uuid primary key default gen_random_uuid(),
  environment text not null default 'staging' check (environment = 'staging'),
  incident_key text not null unique
    check (char_length(incident_key) between 8 and 160),
  feature_id text not null check (char_length(trim(feature_id)) between 3 and 160),
  owner_module_id text not null check (owner_module_id in (
    'overview-control-room','users-identity','subscriptions-access',
    'feedback-recommendations','safety-privacy-moderation',
    'failures-reliability','authentication-synchronisation-health',
    'hiissa-ai-product-intelligence','system-operations','admin-security-audit'
  )),
  title text not null check (char_length(trim(title)) between 3 and 160),
  summary text not null check (char_length(trim(summary)) between 3 and 800),
  state text not null default 'needs_attention' check (state in (
    'needs_attention','investigating','recovery_attempted',
    'verification_pending','verified_resolved','escalated'
  )),
  severity text not null default 'degraded' check (severity in (
    'monitoring','needs_attention','degraded','unavailable','critical'
  )),
  oversight_level smallint not null default 2 check (oversight_level between 1 and 3),
  recovery_classification text not null default 'HUMAN_REQUIRED' check (
    recovery_classification in (
      'SAFE_TO_AUTO_RECOVER','SAFE_WITH_LIMIT','HUMAN_REQUIRED',
      'FOUNDER_REQUIRED','NEVER_AUTOMATE'
    )
  ),
  retry_attempts smallint not null default 0 check (retry_attempts between 0 and 3),
  max_safe_retries smallint not null default 0 check (max_safe_retries between 0 and 3),
  verification_state text not null default 'not_tested' check (
    verification_state in ('not_tested','pending','failed','verified')
  ),
  verification_reference text check (
    verification_reference is null or char_length(verification_reference) between 8 and 240
  ),
  verified_at timestamptz,
  first_observed_at timestamptz not null default now(),
  last_observed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  version integer not null default 1 check (version >= 1),
  check (retry_attempts <= max_safe_retries or recovery_classification in ('HUMAN_REQUIRED','FOUNDER_REQUIRED','NEVER_AUTOMATE')),
  check (last_observed_at >= first_observed_at),
  check (
    state <> 'verified_resolved' or
    (verification_state = 'verified' and verified_at is not null and verification_reference is not null)
  )
);
comment on table public.hiissa_operational_incidents is
  'One canonical STAGING-only current state per detected operational problem. Existing admin_audit_events remains historical truth; existing Founder approval queue remains the only approval truth. No private content.';
create index if not exists hiissa_operational_incidents_attention_idx
  on public.hiissa_operational_incidents (state, severity, last_observed_at desc);
create index if not exists hiissa_operational_incidents_feature_idx
  on public.hiissa_operational_incidents (feature_id, last_observed_at desc);
alter table public.hiissa_operational_incidents enable row level security;
revoke all on table public.hiissa_operational_incidents from public, anon, authenticated;
grant select, insert, update on table public.hiissa_operational_incidents to service_role;

-- Reuse the existing append-only audit table. Trigger participates in the SAME
-- database transaction as the incident write: no misleading audit without state.
create or replace function public.hiissa_operational_incident_audit_staging()
returns trigger language plpgsql security invoker set search_path = ''
as $body$
begin
  if new.environment <> 'staging' then
    raise exception 'STAGING_ONLY';
  end if;
  if tg_op = 'UPDATE' then
    if new.incident_id is distinct from old.incident_id
       or new.incident_key is distinct from old.incident_key
       or new.feature_id is distinct from old.feature_id
       or new.owner_module_id is distinct from old.owner_module_id
       or new.environment is distinct from old.environment
       or new.first_observed_at is distinct from old.first_observed_at then
      raise exception 'IMMUTABLE_OPERATIONAL_INCIDENT_IDENTITY';
    end if;
    if new.version <> old.version + 1 then
      raise exception 'VERSION_INCREMENT_REQUIRED';
    end if;
    if new.state = 'verified_resolved' and old.state <> 'verification_pending' then
      raise exception 'VERIFIED_ONLY_AFTER_RECHECK';
    end if;
  end if;
  insert into public.admin_audit_events (
    event_type, module_id, resource_id, action_id, outcome,
    oversight_level, environment, details
  ) values (
    'hiissa_operational_incident_state_change',
    new.owner_module_id,
    new.incident_id::text,
    new.state,
    'recorded',
    new.oversight_level,
    'staging',
    jsonb_build_object(
      'incident_id', new.incident_id::text,
      'incident_key', new.incident_key,
      'feature_id', new.feature_id,
      'state', new.state,
      'severity', new.severity,
      'verification_state', new.verification_state,
      'version', new.version,
      'classification', new.recovery_classification,
      'privacy_boundary', 'operational_metadata_only'
    )
  );
  return new;
end
$body$;
revoke all on function public.hiissa_operational_incident_audit_staging() from public, anon, authenticated;
grant execute on function public.hiissa_operational_incident_audit_staging() to service_role;
drop trigger if exists hiissa_operational_incident_audit_trigger on public.hiissa_operational_incidents;
create trigger hiissa_operational_incident_audit_trigger
after insert or update on public.hiissa_operational_incidents
for each row execute function public.hiissa_operational_incident_audit_staging();
