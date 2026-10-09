-- HIISSA Founder Staff Access: additive audited RPCs for existing Staging project ONLY.
-- This migration does not change existing role assignments, Auth users, existing RPCs, or Production.
-- Every function is service-role-only; the Next.js route must authenticate the Founder first.

CREATE OR REPLACE FUNCTION public.founder_change_staff_access_audited_staging(
  target_user_id uuid,
  requested_action text,
  action_reason text,
  founder_user_id uuid
)
RETURNS TABLE (new_state text, revoked_sessions bigint, audit_event_id uuid)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth
AS $function$
DECLARE
  next_state text;
  removed_sessions bigint;
  event_id uuid;
BEGIN
  -- The one existing legacy Admin record is the approved Founder gate in this Staging system.
  -- Do not require a new founder role assignment: none currently exists, and that could lock out Founder.
  IF founder_user_id IS NULL OR target_user_id IS NULL
     OR founder_user_id = target_user_id
     OR (SELECT count(*) FROM public.admin_users) <> 1
     OR NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = founder_user_id)
  THEN
    RAISE EXCEPTION 'FOUNDER_ACCESS_REQUIRED';
  END IF;
  IF char_length(trim(coalesce(action_reason, ''))) < 10 THEN
    RAISE EXCEPTION 'ACCESS_REASON_REQUIRED';
  END IF;
  IF requested_action NOT IN ('suspend', 'restore', 'permanently_revoke') THEN
    RAISE EXCEPTION 'INVALID_ACCESS_ACTION';
  END IF;

  -- Existing protected lifecycle function validates eligible non-Founder Staging staff.
  SELECT change.new_state, change.revoked_sessions
    INTO next_state, removed_sessions
    FROM public.founder_change_staff_access(
      target_user_id, requested_action, action_reason, founder_user_id
    ) AS change;

  IF next_state IS NULL THEN
    RAISE EXCEPTION 'STAFF_ACCESS_CHANGE_RESULT_MISSING';
  END IF;

  -- Both the access change and its history form ONE PostgreSQL transaction.
  INSERT INTO public.admin_audit_events (
    event_type, actor_user_id, target_user_id, module_id, resource_id,
    action_id, outcome, oversight_level, environment, details
  ) VALUES (
    CASE requested_action
      WHEN 'suspend' THEN 'founder_staff_access_suspended'
      WHEN 'restore' THEN 'founder_staff_access_restored'
      ELSE 'founder_staff_access_permanently_revoked'
    END,
    founder_user_id, target_user_id, 'admin-security-audit', 'staff-access',
    requested_action, 'recorded', 3, 'staging',
    jsonb_build_object(
      'reason', trim(action_reason), 'new_state', next_state,
      'revoked_session_count', coalesce(removed_sessions,0),
      'founder_lockout_protection', true,
      'historical_evidence_preserved', true, 'production_effect', false,
      'atomic_access_and_audit', true
    )
  ) RETURNING id INTO event_id;

  RETURN QUERY SELECT next_state, coalesce(removed_sessions,0), event_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.founder_revoke_staff_session_audited_staging(
  target_user_id uuid,
  target_session_id uuid,
  action_reason text,
  founder_user_id uuid
)
RETURNS TABLE (revoked_count bigint, audit_event_id uuid)
LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public, auth
AS $function$
DECLARE
  removed_sessions bigint;
  event_id uuid;
BEGIN
  IF founder_user_id IS NULL OR target_user_id IS NULL
     OR founder_user_id = target_user_id
     OR (SELECT count(*) FROM public.admin_users) <> 1
     OR NOT EXISTS (SELECT 1 FROM public.admin_users WHERE user_id = founder_user_id)
  THEN
    RAISE EXCEPTION 'FOUNDER_ACCESS_REQUIRED';
  END IF;
  IF char_length(trim(coalesce(action_reason, ''))) < 10 THEN
    RAISE EXCEPTION 'ACCESS_REASON_REQUIRED';
  END IF;

  -- Existing protected function permits ONLY active non-Founder Staging staff sessions.
  SELECT revoke.revoked_count INTO removed_sessions
    FROM public.founder_revoke_staff_session(target_user_id, target_session_id) AS revoke;

  IF removed_sessions IS NULL THEN
    RAISE EXCEPTION 'STAFF_SESSION_REVOCATION_RESULT_MISSING';
  END IF;

  INSERT INTO public.admin_audit_events (
    event_type, actor_user_id, target_user_id, module_id, resource_id,
    action_id, outcome, oversight_level, environment, details
  ) VALUES (
    'founder_staff_session_revoked', founder_user_id, target_user_id,
    'admin-security-audit', 'staff-session',
    CASE WHEN target_session_id IS NULL THEN 'force_sign_out_all_sessions' ELSE 'revoke_one_session' END,
    'recorded', 3, 'staging',
    jsonb_build_object(
      'reason', trim(action_reason), 'revoked_session_count', removed_sessions,
      'physical_device_identity_claimed', false, 'production_effect', false,
      'atomic_access_and_audit', true
    )
  ) RETURNING id INTO event_id;

  RETURN QUERY SELECT removed_sessions, event_id;
END;
$function$;

-- Security-definer functions must not be publicly callable. These are used only
-- by the verified Founder-only Staging server route through the service-role client.
REVOKE ALL ON FUNCTION public.founder_change_staff_access_audited_staging(uuid,text,text,uuid)
  FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.founder_revoke_staff_session_audited_staging(uuid,uuid,text,uuid)
  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.founder_change_staff_access_audited_staging(uuid,text,text,uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.founder_revoke_staff_session_audited_staging(uuid,uuid,text,uuid) TO service_role;