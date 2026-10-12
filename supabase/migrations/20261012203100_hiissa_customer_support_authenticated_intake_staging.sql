-- HIISSA R153 · existing isolated Staging Supabase ONLY
-- Real signed-in customer help request receipt, WITHOUT real email, external delivery or inferred SLA.
-- Additive source-of-truth; original Founder records, audit, approvals, incident system and RLS intact.
create table if not exists public.hiissa_customer_support_inbox_staging (
 id uuid primary key default gen_random_uuid(),
 environment text not null default 'staging' check(environment='staging'),
 customer_user_id uuid not null references auth.users(id) on delete cascade,
 client_nonce uuid not null,
 subject text not null check(length(trim(subject)) between 5 and 120),
 message_body text not null check(length(trim(message_body)) between 5 and 2000),
 lifecycle_state text not null default 'RECEIVED'
   check(lifecycle_state in ('RECEIVED','AUTOMATIC_ACKNOWLEDGEMENT_SENT','ASSIGNED',
   'HUMAN_RESPONSE_DUE','RESPONDED','WAITING_FOR_CUSTOMER','RESOLVED')),
 acknowledgement_state text not null default 'NOT_SENT' check(acknowledgement_state='NOT_SENT'),
 assigned_department text,
 response_due_at timestamptz,
 external_effect_enabled boolean not null default false check(external_effect_enabled=false),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 version integer not null default 1 check(version>=1),
 unique(customer_user_id,client_nonce)
);
comment on table public.hiissa_customer_support_inbox_staging is
'HIISSA authenticated customer support intake in isolated Staging only. External acknowledgements and Production effects are forbidden. NOT a claim that full customer response is active.';
alter table public.hiissa_customer_support_inbox_staging enable row level security;
revoke all on table public.hiissa_customer_support_inbox_staging from public, anon, authenticated;
grant select,insert,update on table public.hiissa_customer_support_inbox_staging to service_role;
create index if not exists hiissa_customer_support_inbox_customer_recent_idx
 on public.hiissa_customer_support_inbox_staging(customer_user_id,created_at desc);
create index if not exists hiissa_customer_support_inbox_stage_idx
 on public.hiissa_customer_support_inbox_staging(lifecycle_state,created_at desc);

-- The service-role-only function is atomic: the request and original Admin audit
-- either both commit or both roll back. No body/subject/email/private content in audit.
create or replace function public.hiissa_customer_support_staging_receive(
 p_user_id uuid,p_client_nonce uuid,p_subject text,p_message text
) returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare v_row public.hiissa_customer_support_inbox_staging%rowtype;
        v_inserted boolean := false;
begin
 if auth.role() is distinct from 'service_role' then
   raise exception 'STAGING_SUPPORT_FORBIDDEN' using errcode='42501';
 end if;
 if p_user_id is null or p_client_nonce is null
    or length(trim(coalesce(p_subject,''))) not between 5 and 120
    or length(trim(coalesce(p_message,''))) not between 5 and 2000 then
   raise exception 'INVALID_CUSTOMER_SUPPORT_REQUEST';
 end if;
 insert into public.hiissa_customer_support_inbox_staging
   (customer_user_id,client_nonce,subject,message_body)
 values(p_user_id,p_client_nonce,trim(p_subject),trim(p_message))
 on conflict(customer_user_id,client_nonce) do nothing
 returning * into v_row;
 if v_row.id is null then
  select * into v_row from public.hiissa_customer_support_inbox_staging
   where customer_user_id=p_user_id and client_nonce=p_client_nonce;
  if v_row.id is null then raise exception 'STAGING_REQUEST_NOT_SAVED'; end if;
 else
  v_inserted:=true;
  insert into public.admin_audit_events
    (event_type,actor_user_id,module_id,resource_id,action_id,outcome,oversight_level,environment,details)
  values('hiissa_customer_support_received_staging',p_user_id,'feedback-recommendations',
    v_row.id::text,'receive','recorded',1,'staging',
    jsonb_build_object('origin','authenticated_staging_customer',
      'customerContentIncluded',false,'acknowledgementSent',false,
      'externalEffectPerformed',false));
 end if;
 return jsonb_build_object('id',v_row.id,'createdAt',v_row.created_at,
   'state',v_row.lifecycle_state,'acknowledgementSent',false,
   'alreadyReceived',not v_inserted);
end
$$;
revoke all on function public.hiissa_customer_support_staging_receive(uuid,uuid,text,text) from public,anon,authenticated;
grant execute on function public.hiissa_customer_support_staging_receive(uuid,uuid,text,text) to service_role;
