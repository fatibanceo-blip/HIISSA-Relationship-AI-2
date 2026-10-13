-- HIISSA R185. Original isolated Staging database ONLY.
-- Department routing for an existing authenticated support request is INTERNAL ONLY.
-- It does NOT represent acknowledgement sent, approved human-response deadline,
-- final ASSIGNED lifecycle state, staff login creation, or external communication.
-- Existing Founder Control Room remains aggregate-only; no original schema rewrite.
create or replace function public.hiissa_customer_support_staging_route_department(
  p_founder uuid, p_request_id uuid, p_expected_version integer
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item public.hiissa_customer_support_inbox_staging%rowtype;
begin
  if auth.role() is distinct from 'service_role' then
    raise exception 'STAGING_SUPPORT_FORBIDDEN' using errcode='42501';
  end if;
  if p_founder is null or p_request_id is null or p_expected_version is null
    or p_expected_version < 1 then
    raise exception 'INVALID_ROUTE_REQUEST';
  end if;
  select * into v_item
  from public.hiissa_customer_support_inbox_staging
  where id=p_request_id and environment='staging'
  for update;
  if not found then
    raise exception 'STAGING_SUPPORT_NOT_FOUND';
  end if;
  if v_item.version is distinct from p_expected_version then
    raise exception 'STAGING_SUPPORT_STALE_VERSION';
  end if;
  if v_item.assigned_department is not null then
    raise exception 'STAGING_SUPPORT_ALREADY_ROUTED';
  end if;
  if v_item.lifecycle_state is distinct from 'RECEIVED'
    or v_item.acknowledgement_state is distinct from 'NOT_SENT'
    or v_item.external_effect_enabled is distinct from false then
    raise exception 'STAGING_SUPPORT_STATE_NOT_ELIGIBLE';
  end if;

  -- Route to approved department only; do NOT claim the seven-stage
  -- ASSIGNED state before acknowledgement copy / workflow are reconciled.
  update public.hiissa_customer_support_inbox_staging
    set assigned_department='customer_support',
        version=version+1,
        updated_at=now()
  where id=p_request_id and environment='staging'
  returning * into v_item;

  -- Same transaction: failed audit automatically rolls back route update.
  -- NEVER put customer message, subject, email, UUIDs of actors, or tokens
  -- into audit.details. Attribution is in original authorised audit columns.
  insert into public.admin_audit_events
    (event_type,actor_user_id,module_id,resource_id,action_id,
     outcome,oversight_level,environment,details)
  values (
    'hiissa_customer_support_routed_staging',
    p_founder,
    'feedback-recommendations',
    v_item.id::text,
    'route_to_customer_support',
    'recorded',
    2,
    'staging',
    jsonb_build_object(
      'featureId','customer-communication-service-level-centre',
      'department','customer_support',
      'lifecycleState','RECEIVED',
      'customerContentIncluded',false,
      'acknowledgementSent',false,
      'humanResponseDeadlineEnforced',false,
      'outwardDelivered',false,
      'productionEffectPerformed',false
    )
  );

  return jsonb_build_object(
    'status','RECORDED_AND_AUDITED',
    'department','customer_support',
    'lifecycleState','RECEIVED',
    'acknowledgementState','NOT_SENT',
    'version',v_item.version,
    'externalDeliveryPerformed',false
  );
end
$$;

revoke all on function public.hiissa_customer_support_staging_route_department(uuid,uuid,integer)
  from public, anon, authenticated;
grant execute on function public.hiissa_customer_support_staging_route_department(uuid,uuid,integer)
  to service_role;
comment on function public.hiissa_customer_support_staging_route_department(uuid,uuid,integer)
is 'HIISSA existing isolated Staging only: Founder-gated server may internally route authenticated customer help to Customer Support. External delivery forbidden; original audit transaction atomic. No real staff assignment or seven-stage transition implied.';
