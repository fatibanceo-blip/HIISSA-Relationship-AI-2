-- HIISSA R219 original Customer Communication Centre Staging follow-up.
-- A customer may answer the FIRST verified Founder-approved delivered in-app
-- response within their ORIGINAL signed-in My Support Requests case.
-- This does not modify original intake text, original case lifecycle, original
-- Founder approval or delivery records. No email/SMS/Production/employee grants.
BEGIN;
CREATE TABLE IF NOT EXISTS public.hiissa_customer_support_followups_staging(
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 case_id uuid NOT NULL REFERENCES public.hiissa_customer_support_inbox_staging(id) ON DELETE CASCADE,
 customer_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
 client_nonce uuid NOT NULL,
 environment text NOT NULL DEFAULT 'staging' CHECK(environment='staging'),
 message_body text NOT NULL CHECK(length(btrim(message_body)) BETWEEN 8 AND 2000),
 state text NOT NULL DEFAULT 'RECEIVED_PENDING_REVIEW' CHECK(state='RECEIVED_PENDING_REVIEW'),
 created_at timestamptz NOT NULL DEFAULT now(),
 external_effect_enabled boolean NOT NULL DEFAULT false CHECK(external_effect_enabled=false),
 UNIQUE(case_id,customer_user_id,client_nonce)
);
COMMENT ON TABLE public.hiissa_customer_support_followups_staging IS
 'Original HIISSA customer-support case follow-up after verified approved in-app reply; original signed-in owner only via service, Staging, no external send, awaiting review.';
ALTER TABLE public.hiissa_customer_support_followups_staging ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.hiissa_customer_support_followups_staging FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT ON TABLE public.hiissa_customer_support_followups_staging TO service_role;
CREATE INDEX IF NOT EXISTS hiissa_customer_followups_owner_staging_idx
 ON public.hiissa_customer_support_followups_staging(customer_user_id,created_at DESC);
CREATE INDEX IF NOT EXISTS hiissa_customer_followups_case_staging_idx
 ON public.hiissa_customer_support_followups_staging(case_id,created_at DESC);

CREATE OR REPLACE FUNCTION public.hiissa_customer_support_staging_receive_customer_followup(
 p_user_id uuid,p_case_id uuid,p_client_nonce uuid,p_message text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE
 v_case public.hiissa_customer_support_inbox_staging%rowtype;
 v_saved public.hiissa_customer_support_followups_staging%rowtype;
 v_followup_id uuid;
 v_created timestamptz:=now();
 v_count integer;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN
   RAISE EXCEPTION 'STAGING_CUSTOMER_FOLLOWUP_SERVICE_ROLE_ONLY' USING ERRCODE='42501';
 END IF;
 IF p_user_id IS NULL OR p_case_id IS NULL OR p_client_nonce IS NULL
   OR p_message IS NULL OR length(btrim(p_message)) NOT BETWEEN 8 AND 2000 THEN
   RAISE EXCEPTION 'STAGING_CUSTOMER_FOLLOWUP_INVALID';
 END IF;
 -- One original owner, one immutable source, serialises rate-limit and
 -- duplicate attempts. Do not change original case/approval/draft/delivery.
 SELECT * INTO v_case FROM public.hiissa_customer_support_inbox_staging
  WHERE id=p_case_id AND environment='staging' AND customer_user_id=p_user_id FOR UPDATE;
 IF NOT FOUND THEN
   RAISE EXCEPTION 'STAGING_CUSTOMER_FOLLOWUP_NOT_OWNED';
 END IF;
 IF v_case.lifecycle_state IS DISTINCT FROM 'RESPONDED' OR
   v_case.external_effect_enabled IS DISTINCT FROM false OR
   NOT EXISTS(
    SELECT 1 FROM public.hiissa_customer_support_in_app_replies_staging
    WHERE case_id=p_case_id AND environment='staging'
     AND customer_user_id=p_user_id AND
     delivery_channel='IN_APP_STAGING' AND external_effect_enabled=false
   ) THEN
    RAISE EXCEPTION 'STAGING_CUSTOMER_FOLLOWUP_REPLY_NOT_DELIVERED';
 END IF;
 SELECT * INTO v_saved FROM public.hiissa_customer_support_followups_staging
  WHERE case_id=p_case_id AND customer_user_id=p_user_id AND
   client_nonce=p_client_nonce AND environment='staging' FOR UPDATE;
 IF FOUND THEN
   IF v_saved.message_body IS DISTINCT FROM btrim(p_message) THEN
      RAISE EXCEPTION 'STAGING_CUSTOMER_FOLLOWUP_DUPLICATE_DIFFERENT_CONTENT';
   END IF;
   RETURN jsonb_build_object('status','ALREADY_RECORDED_NO_DUPLICATE',
    'caseId',p_case_id,'followupId',v_saved.id,'createdAt',v_saved.created_at,
    'state',v_saved.state,'customerResponseDelivered',false,
    'externalMessageSent',false,'productionEffectEnabled',false);
 END IF;
 SELECT count(*) INTO v_count FROM public.hiissa_customer_support_followups_staging
  WHERE environment='staging' AND customer_user_id=p_user_id AND
    created_at > v_created-interval '1 hour';
 IF v_count>=3 THEN RAISE EXCEPTION 'STAGING_CUSTOMER_FOLLOWUP_HOURLY_LIMIT'; END IF;
 INSERT INTO public.hiissa_customer_support_followups_staging
   (case_id,customer_user_id,client_nonce,message_body,created_at)
 VALUES(p_case_id,p_user_id,p_client_nonce,btrim(p_message),v_created)
 RETURNING id INTO v_followup_id;
 -- Same original canonical metadata-only Admin audit in same transaction.
 INSERT INTO public.admin_audit_events
  (event_type,actor_user_id,module_id,resource_id,action_id,outcome,
   oversight_level,environment,details)
 VALUES ('hiissa_customer_support_followup_received_staging',
  p_user_id,'customer_support',p_case_id::text,
  'receive_customer_in_app_followup','recorded',2,'staging',
  jsonb_build_object('registryId','customer-communication-service-level-centre',
   'followupId',v_followup_id,'originalCaseVersion',v_case.version,
   'followupState','RECEIVED_PENDING_REVIEW',
   'customerContentIncluded',false,'humanResponseSent',false,
   'externalDeliveryPerformed',false,'productionEffectEnabled',false));
 RETURN jsonb_build_object(
  'status','ORIGINAL_CASE_FOLLOWUP_RECORDED_AND_AUDITED',
  'caseId',p_case_id,'followupId',v_followup_id,'createdAt',v_created,
  'state','RECEIVED_PENDING_REVIEW','customerResponseDelivered',false,
  'externalMessageSent',false,'productionEffectEnabled',false
 );
END
$$;
REVOKE ALL ON FUNCTION public.hiissa_customer_support_staging_receive_customer_followup(uuid,uuid,uuid,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hiissa_customer_support_staging_receive_customer_followup(uuid,uuid,uuid,text) TO service_role;
COMMIT;
