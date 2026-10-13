-- HIISSA R205 Founder-approved customer reply: use the ORIGINAL canonical
-- admin_approval_requests and admin_audit_events, not a duplicate approval inbox.
-- This is approval FOR CONTROLLED FUTURE EXECUTION ONLY, never customer delivery.
BEGIN;
CREATE OR REPLACE FUNCTION public.hiissa_customer_support_staging_approve_founder_reply_draft(
 p_founder uuid, p_request_id uuid, p_case_version integer, p_draft_version integer
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE
 v_case public.hiissa_customer_support_inbox_staging%rowtype;
 v_draft public.hiissa_customer_support_reply_drafts_staging%rowtype;
 v_prior public.admin_approval_requests%rowtype;
 v_id uuid;
 v_now timestamptz:=now();
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN
   RAISE EXCEPTION 'STAGING_REPLY_APPROVAL_SERVICE_ROLE_REQUIRED' USING ERRCODE='42501';
 END IF;
 IF p_founder IS NULL OR NOT EXISTS(
   SELECT 1 FROM public.admin_users WHERE user_id=p_founder
 ) THEN
   RAISE EXCEPTION 'STAGING_REPLY_APPROVAL_FOUNDER_REQUIRED' USING ERRCODE='42501';
 END IF;
 IF p_request_id IS NULL OR p_case_version IS NULL OR p_case_version<1
  OR p_draft_version IS NULL OR p_draft_version<1 THEN
   RAISE EXCEPTION 'STAGING_REPLY_APPROVAL_INVALID';
 END IF;
 -- Lock original case to serialize with existing R203 draft saves and R185 route.
 SELECT * INTO v_case FROM public.hiissa_customer_support_inbox_staging
   WHERE id=p_request_id AND environment='staging' FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'STAGING_REPLY_APPROVAL_CASE_NOT_FOUND'; END IF;
 IF v_case.version IS DISTINCT FROM p_case_version
  OR v_case.assigned_department IS DISTINCT FROM 'customer_support'
  OR v_case.lifecycle_state IS DISTINCT FROM 'RECEIVED'
  OR v_case.acknowledgement_state IS DISTINCT FROM 'NOT_SENT'
  OR v_case.external_effect_enabled IS DISTINCT FROM false THEN
  RAISE EXCEPTION 'STAGING_REPLY_APPROVAL_CASE_CHANGED';
 END IF;
 SELECT * INTO v_draft FROM public.hiissa_customer_support_reply_drafts_staging
   WHERE case_id=p_request_id AND environment='staging' FOR UPDATE;
 IF NOT FOUND OR v_draft.draft_version IS DISTINCT FROM p_draft_version
   OR v_draft.status IS DISTINCT FROM 'PRIVATE_DRAFT'
   OR v_draft.external_effect_enabled IS DISTINCT FROM false
   OR length(btrim(v_draft.draft_body)) NOT BETWEEN 8 AND 2000 THEN
   RAISE EXCEPTION 'STAGING_REPLY_APPROVAL_DRAFT_CHANGED';
 END IF;
 -- Existing approval record is the ONLY canonical approval state.
 SELECT * INTO v_prior FROM public.admin_approval_requests
  WHERE environment='staging' AND module_id='customer_support'
   AND action_id='founder_approve_customer_reply_draft'
   AND resource_id=p_request_id::text
   AND request_context->>'draftVersion'=p_draft_version::text
  ORDER BY created_at DESC LIMIT 1 FOR UPDATE;
 IF FOUND THEN
   IF v_prior.status='approved_pending_execution' THEN
     RETURN jsonb_build_object('status','ALREADY_APPROVED_NOT_SENT',
       'approvalId',v_prior.id,'draftVersion',p_draft_version,
       'caseVersion',p_case_version,'approvedAt',v_prior.created_at,
       'humanReplySent',false,'externalDeliveryPerformed',false,
       'productionEffectEnabled',false);
   END IF;
   RAISE EXCEPTION 'STAGING_REPLY_APPROVAL_REVIEW_EXISTS';
 END IF;
 INSERT INTO public.admin_approval_requests(
   requested_by,action_id,module_id,resource_id,environment,
   oversight_level,status,request_context,created_at
 ) VALUES (p_founder,'founder_approve_customer_reply_draft',
     'customer_support',p_request_id::text,'staging',3,
     'approved_pending_execution',
     jsonb_build_object('registryId','customer-communication-service-level-centre',
       'draftVersion',p_draft_version,'caseVersion',p_case_version,
       'founderReviewed',true,'customerContentIncluded',false,
       'externalExecutionPerformed',false),v_now)
 RETURNING id INTO v_id;
 INSERT INTO public.admin_audit_events(
   event_type,actor_user_id,module_id,resource_id,action_id,
   outcome,oversight_level,approval_request_id,environment,details
 ) VALUES (
   'hiissa_customer_support_founder_reply_approved_staging',p_founder,
   'customer_support',p_request_id::text,'founder_approve_customer_reply_draft',
   'recorded',3,v_id,'staging',
   jsonb_build_object('registryId','customer-communication-service-level-centre',
     'draftVersion',p_draft_version,'caseVersion',p_case_version,
     'customerContentIncluded',false,'humanReplySent',false,
     'outwardDelivered',false,'productionEffectEnabled',false)
 );
 RETURN jsonb_build_object('status','FOUNDER_APPROVED_PENDING_EXECUTION_NOT_SENT',
   'registryId','customer-communication-service-level-centre',
   'approvalId',v_id,'caseVersion',p_case_version,
   'draftVersion',p_draft_version,'approvedAt',v_now,
   'humanReplySent',false,'externalDeliveryPerformed',false,
   'productionEffectEnabled',false);
END
$$;
REVOKE ALL ON FUNCTION public.hiissa_customer_support_staging_approve_founder_reply_draft(uuid,uuid,integer,integer) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hiissa_customer_support_staging_approve_founder_reply_draft(uuid,uuid,integer,integer) TO service_role;
COMMIT;
