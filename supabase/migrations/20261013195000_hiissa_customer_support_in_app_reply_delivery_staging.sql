-- HIISSA R208: ORIGINAL Customer Centre -> My Support Requests approved in-app reply.
-- New response storage is a subordinate one-per-original-case delivery receipt,
-- NOT a second customer case, AI, Registry, external email/SMS or approvals inbox.
-- Deployment does NOT send anything. Endpoint requires explicit activation flag.
BEGIN;
CREATE TABLE IF NOT EXISTS public.hiissa_customer_support_in_app_replies_staging(
  case_id uuid PRIMARY KEY REFERENCES public.hiissa_customer_support_inbox_staging(id) ON DELETE CASCADE,
  customer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  approval_id uuid NOT NULL UNIQUE REFERENCES public.admin_approval_requests(id) ON DELETE RESTRICT,
  environment text NOT NULL DEFAULT 'staging' CHECK(environment='staging'),
  delivery_channel text NOT NULL DEFAULT 'IN_APP_STAGING' CHECK(delivery_channel='IN_APP_STAGING'),
  draft_version integer NOT NULL CHECK(draft_version>0),
  message_body text NOT NULL CHECK(length(btrim(message_body)) BETWEEN 8 AND 2000),
  delivered_by_founder uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  delivered_at timestamptz NOT NULL DEFAULT now(),
  external_effect_enabled boolean NOT NULL DEFAULT false CHECK(external_effect_enabled=false)
);
COMMENT ON TABLE public.hiissa_customer_support_in_app_replies_staging IS
  'HIISSA original Staging support reply to its own authenticated customer, Founder reviewed, in-app only. NOT email/SMS or Production.';
ALTER TABLE public.hiissa_customer_support_in_app_replies_staging ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.hiissa_customer_support_in_app_replies_staging FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON TABLE public.hiissa_customer_support_in_app_replies_staging TO service_role;
CREATE INDEX IF NOT EXISTS hiissa_customer_reply_owner_staging_idx
 ON public.hiissa_customer_support_in_app_replies_staging(customer_user_id,delivered_at DESC);

CREATE OR REPLACE FUNCTION public.hiissa_customer_support_staging_deliver_approved_in_app_reply(
 p_founder uuid,p_request_id uuid,p_expected_case_version integer,
 p_draft_version integer,p_approval_id uuid
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE
 v_case public.hiissa_customer_support_inbox_staging%rowtype;
 v_draft public.hiissa_customer_support_reply_drafts_staging%rowtype;
 v_approval public.admin_approval_requests%rowtype;
 v_existing public.hiissa_customer_support_in_app_replies_staging%rowtype;
 v_now timestamptz:=now();
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN
   RAISE EXCEPTION 'STAGING_IN_APP_REPLY_SERVICE_ONLY' USING ERRCODE='42501';
 END IF;
 IF p_founder IS NULL OR NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id=p_founder) THEN
   RAISE EXCEPTION 'STAGING_IN_APP_REPLY_FOUNDER_REQUIRED' USING ERRCODE='42501';
 END IF;
 IF p_request_id IS NULL OR p_approval_id IS NULL OR p_expected_case_version IS NULL
   OR p_expected_case_version<1 OR p_draft_version IS NULL OR p_draft_version<1 THEN
   RAISE EXCEPTION 'STAGING_IN_APP_REPLY_INVALID_REQUEST';
 END IF;
 SELECT * INTO v_case FROM public.hiissa_customer_support_inbox_staging
   WHERE id=p_request_id AND environment='staging' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'STAGING_IN_APP_REPLY_CASE_NOT_FOUND'; END IF;
 -- Idempotent double confirmation must not create a second reply/audit.
 SELECT * INTO v_existing FROM public.hiissa_customer_support_in_app_replies_staging
   WHERE case_id=p_request_id AND environment='staging' FOR UPDATE;
 IF FOUND THEN
   IF v_existing.approval_id=p_approval_id AND
     v_existing.draft_version=p_draft_version AND
     v_existing.customer_user_id=v_case.customer_user_id AND
     v_case.lifecycle_state='RESPONDED' THEN
     RETURN jsonb_build_object('status','ALREADY_DELIVERED_IN_APP',
       'caseId',p_request_id,'version',v_case.version,
       'draftVersion',v_existing.draft_version,'deliveredAt',v_existing.delivered_at,
       'channel','IN_APP_STAGING','customerReplyVisible',true,
       'emailSent',false,'smsSent',false,'productionEffectEnabled',false);
   END IF;
   RAISE EXCEPTION 'STAGING_IN_APP_REPLY_ALREADY_EXISTS';
 END IF;
 IF v_case.version IS DISTINCT FROM p_expected_case_version OR
   v_case.assigned_department IS DISTINCT FROM 'customer_support' OR
   v_case.lifecycle_state IS DISTINCT FROM 'RECEIVED' OR
   v_case.acknowledgement_state IS DISTINCT FROM 'NOT_SENT' OR
   v_case.external_effect_enabled IS DISTINCT FROM false THEN
   RAISE EXCEPTION 'STAGING_IN_APP_REPLY_CASE_CHANGED';
 END IF;
 SELECT * INTO v_draft FROM public.hiissa_customer_support_reply_drafts_staging
   WHERE case_id=p_request_id AND environment='staging' FOR UPDATE;
 IF NOT FOUND OR v_draft.draft_version IS DISTINCT FROM p_draft_version OR
   v_draft.status IS DISTINCT FROM 'PRIVATE_DRAFT' OR
   v_draft.external_effect_enabled IS DISTINCT FROM false THEN
   RAISE EXCEPTION 'STAGING_IN_APP_REPLY_DRAFT_CHANGED';
 END IF;
 SELECT * INTO v_approval FROM public.admin_approval_requests
   WHERE id=p_approval_id AND environment='staging' AND
    module_id='customer_support' AND
    action_id='founder_approve_customer_reply_draft' AND
    resource_id=p_request_id::text AND
    status='approved_pending_execution' AND
    oversight_level=3 AND
    request_context->>'registryId'='customer-communication-service-level-centre' AND
    request_context->>'caseVersion'=p_expected_case_version::text AND
    request_context->>'draftVersion'=p_draft_version::text FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'STAGING_IN_APP_REPLY_NOT_APPROVED'; END IF;
 INSERT INTO public.hiissa_customer_support_in_app_replies_staging
   (case_id,customer_user_id,approval_id,draft_version,message_body,delivered_by_founder,delivered_at)
 VALUES (p_request_id,v_case.customer_user_id,p_approval_id,p_draft_version,
   v_draft.draft_body,p_founder,v_now);
 -- Original source remains the one canonical CASE source; one verified
 -- human in-app response marks case RESPONDED, not email acknowledgement.
 UPDATE public.hiissa_customer_support_inbox_staging
   SET lifecycle_state='RESPONDED',updated_at=v_now,version=version+1
   WHERE id=p_request_id AND environment='staging';
 UPDATE public.admin_approval_requests SET status='verified_complete',
   resolved_at=v_now WHERE id=p_approval_id AND status='approved_pending_execution';
 INSERT INTO public.admin_audit_events
   (event_type,actor_user_id,module_id,resource_id,action_id,outcome,
    oversight_level,approval_request_id,environment,details)
 VALUES ('hiissa_customer_support_in_app_reply_delivered_staging',
   p_founder,'customer_support',p_request_id::text,
   'deliver_approved_in_app_reply','recorded',3,p_approval_id,'staging',
   jsonb_build_object('registryId','customer-communication-service-level-centre',
     'caseVersion',v_case.version+1,'draftVersion',p_draft_version,
     'deliveryChannel','IN_APP_STAGING','emailSent',false,'smsSent',false,
     'customerContentIncluded',false,'outwardEmailSmsDelivered',false,
     'productionEffectEnabled',false));
 RETURN jsonb_build_object('status','DELIVERED_IN_APP_AND_AUDITED',
    'caseId',p_request_id,'version',v_case.version+1,'draftVersion',p_draft_version,
    'deliveredAt',v_now,'channel','IN_APP_STAGING','customerReplyVisible',true,
    'emailSent',false,'smsSent',false,'productionEffectEnabled',false);
END
$$;
REVOKE ALL ON FUNCTION public.hiissa_customer_support_staging_deliver_approved_in_app_reply(uuid,uuid,integer,integer,uuid) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hiissa_customer_support_staging_deliver_approved_in_app_reply(uuid,uuid,integer,integer,uuid) TO service_role;
COMMIT;
