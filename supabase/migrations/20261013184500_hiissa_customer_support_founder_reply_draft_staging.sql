-- HIISSA R203 • original Customer Communication Centre, STRICT STAGING ONLY.
-- New private reply DRAFT capability is NOT customer delivery, human response,
-- staff permission, receipt acknowledgement, or a new Founder approval inbox.
-- A draft never modifies original authenticated intake, customer message, original
-- Founder aggregate-only dashboard, original staff host or any Production object.
BEGIN;
CREATE TABLE IF NOT EXISTS public.hiissa_customer_support_reply_drafts_staging (
  case_id uuid PRIMARY KEY REFERENCES public.hiissa_customer_support_inbox_staging(id) ON DELETE CASCADE,
  environment text NOT NULL DEFAULT 'staging' CHECK (environment='staging'),
  draft_body text NOT NULL CHECK(length(btrim(draft_body)) BETWEEN 8 AND 2000),
  draft_version integer NOT NULL DEFAULT 1 CHECK(draft_version>=1),
  saved_by_founder uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  saved_at timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'PRIVATE_DRAFT' CHECK(status='PRIVATE_DRAFT'),
  external_effect_enabled boolean NOT NULL DEFAULT false CHECK(external_effect_enabled=false)
);
COMMENT ON TABLE public.hiissa_customer_support_reply_drafts_staging IS
'Original Customer Centre R203: Founder-only private Staging reply DRAFT linked to original case. Not a customer message, reply, acknowledgement, employee grant or outbound effect.';
ALTER TABLE public.hiissa_customer_support_reply_drafts_staging ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON TABLE public.hiissa_customer_support_reply_drafts_staging FROM PUBLIC,anon,authenticated;
GRANT SELECT,INSERT,UPDATE ON TABLE public.hiissa_customer_support_reply_drafts_staging TO service_role;

CREATE OR REPLACE FUNCTION public.hiissa_customer_support_staging_save_founder_reply_draft(
 p_founder uuid,p_request_id uuid,p_case_version integer,p_draft_version integer,p_draft_body text
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path=''
AS $$
DECLARE v_item public.hiissa_customer_support_inbox_staging%rowtype;
 v_draft public.hiissa_customer_support_reply_drafts_staging%rowtype;
 v_now timestamptz:=now();
 v_next_version integer;
BEGIN
 IF auth.role() IS DISTINCT FROM 'service_role' THEN
   RAISE EXCEPTION 'STAGING_SUPPORT_FORBIDDEN' USING ERRCODE='42501';
 END IF;
 IF p_founder IS NULL OR NOT EXISTS(
   SELECT 1 FROM public.admin_users WHERE user_id=p_founder
 ) THEN
   RAISE EXCEPTION 'STAGING_SUPPORT_FOUNDER_REQUIRED' USING ERRCODE='42501';
 END IF;
 IF p_request_id IS NULL OR p_case_version IS NULL OR p_case_version<1
   OR p_draft_version IS NULL OR p_draft_version<0
   OR length(btrim(coalesce(p_draft_body,''))) NOT BETWEEN 8 AND 2000
   OR position(chr(0) IN coalesce(p_draft_body,''))>0 THEN
   RAISE EXCEPTION 'STAGING_SUPPORT_INVALID_DRAFT';
 END IF;
 SELECT * INTO v_item
 FROM public.hiissa_customer_support_inbox_staging
 WHERE id=p_request_id AND environment='staging'
 FOR UPDATE;
 IF NOT FOUND THEN RAISE EXCEPTION 'STAGING_SUPPORT_CASE_NOT_FOUND'; END IF;
 IF v_item.version IS DISTINCT FROM p_case_version THEN
   RAISE EXCEPTION 'STAGING_SUPPORT_STALE_VERSION';
 END IF;
 IF v_item.lifecycle_state IS DISTINCT FROM 'RECEIVED'
   OR v_item.acknowledgement_state IS DISTINCT FROM 'NOT_SENT'
   OR v_item.assigned_department IS DISTINCT FROM 'customer_support'
   OR v_item.external_effect_enabled IS DISTINCT FROM false THEN
   RAISE EXCEPTION 'STAGING_SUPPORT_DRAFT_NOT_ELIGIBLE';
 END IF;
 SELECT * INTO v_draft FROM public.hiissa_customer_support_reply_drafts_staging
 WHERE case_id=p_request_id AND environment='staging' FOR UPDATE;
 IF FOUND THEN
   IF v_draft.draft_version IS DISTINCT FROM p_draft_version THEN
     RAISE EXCEPTION 'STAGING_SUPPORT_DRAFT_STALE_VERSION';
   END IF;
   v_next_version:=v_draft.draft_version+1;
   UPDATE public.hiissa_customer_support_reply_drafts_staging
   SET draft_body=btrim(p_draft_body),draft_version=v_next_version,
       saved_at=v_now,saved_by_founder=p_founder
   WHERE case_id=p_request_id;
 ELSE
   IF p_draft_version<>0 THEN RAISE EXCEPTION 'STAGING_SUPPORT_DRAFT_STALE_VERSION'; END IF;
   v_next_version:=1;
   INSERT INTO public.hiissa_customer_support_reply_drafts_staging
     (case_id,draft_body,draft_version,saved_at,saved_by_founder)
   VALUES (p_request_id,btrim(p_draft_body),1,v_now,p_founder);
 END IF;
 -- Audit participates in the SAME transaction; a failed audit rolls back draft.
 -- NEVER place draft contents, customer identity, or private conversation in audit.
 INSERT INTO public.admin_audit_events
   (event_type,actor_user_id,module_id,resource_id,action_id,
    outcome,oversight_level,environment,details)
 VALUES ('hiissa_customer_support_founder_reply_draft_saved_staging',
    p_founder,'feedback-recommendations',p_request_id::text,
    'save_founder_private_reply_draft','recorded',1,'staging',
    jsonb_build_object('registryId','customer-communication-service-level-centre',
      'caseVersion',v_item.version,'draftVersion',v_next_version,
      'customerContentIncluded',false,'messageDelivered',false,
      'humanResponseSent',false,'outwardDelivered',false));
 RETURN jsonb_build_object(
   'status','PRIVATE_DRAFT_SAVED_AND_AUDITED',
   'registryId','customer-communication-service-level-centre',
   'caseId',p_request_id,'caseVersion',v_item.version,
   'draftVersion',v_next_version,'savedAt',v_now,
   'messageDelivered',false,'humanResponseSent',false,
   'outwardDelivered',false,'productionEffectEnabled',false
 );
END
$$;
REVOKE ALL ON FUNCTION public.hiissa_customer_support_staging_save_founder_reply_draft(uuid,uuid,integer,integer,text) FROM PUBLIC,anon,authenticated;
GRANT EXECUTE ON FUNCTION public.hiissa_customer_support_staging_save_founder_reply_draft(uuid,uuid,integer,integer,text) TO service_role;
COMMIT;
