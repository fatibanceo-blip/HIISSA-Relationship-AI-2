// Package A: offline permission evaluation foundation only.
// Not wired to API routes or Production. Database-backed roles, grants, and
// Founder decisions must be verified freshly before any live action.
const ACTIONS = new Set(["SEE","OPEN","REVIEW","AUTHORISED_REVIEW","CREATE","EDIT","ASSIGN","EXECUTE","APPROVE","ESCALATE","CONFIGURE","EXPORT","ERASURE","VIEW_AUDIT","MANAGE_ADMIN_ACCESS","EXCEPTIONAL_ACCESS"]);
const ROLES = new Set(["founder","technical_operations","customer_support","finance_subscriptions","safety_safeguarding","privacy_data_protection","content_moderation","product_quality"]);
const ENVIRONMENTS = new Set(["staging","production"]);
const OVERSIGHT = new Set(["L1","L2","L3"]);
const deny = (reason) => ({ allowed:false, reason, requiresFounderApproval:false, notifyFounder:false, auditRequired:true });

export function evaluateAdminPermission({ actor, request, rules = [], approval = null } = {}) {
  if (!actor || !request || !Array.isArray(rules)) return deny("INVALID_REQUEST");
  const { id, role, active, environment: actorEnvironment } = actor;
  const { module, resource, action, environment, scope, subjectId } = request;
  if (!id || !ROLES.has(role) || active !== true || !ENVIRONMENTS.has(actorEnvironment)) return deny("INVALID_ACTOR");
  if (!Number.isInteger(module) || module < 1 || module > 10 || !resource || !ACTIONS.has(action) || !ENVIRONMENTS.has(environment) || !scope) return deny("INVALID_RESOURCE");
  if (actorEnvironment !== environment) return deny("CROSS_ENVIRONMENT");
  if (action === "MANAGE_ADMIN_ACCESS" && subjectId === id) return deny("NO_SELF_GRANT");
  if (request.breakGlass === true || request.rawSecrets === true || request.unrestrictedPrivateContent === true) return deny("RESERVED_OR_PROTECTED");
  const matches = rules.filter(r => r && r.role === role && r.module === module && r.resource === resource && r.action === action && r.environment === environment && r.scope === scope && r.active === true);
  if (matches.some(r => r.effect === "deny")) return deny("EXPLICIT_DENY");
  const permits = matches.filter(r => r.effect === "allow" && OVERSIGHT.has(r.oversight));
  if (!permits.length) return deny("NO_MATCHING_PERMISSION");
  // Most restrictive matching oversight wins, never a permissive fallback.
  const level = permits.some(r => r.oversight === "L3") ? "L3" : permits.some(r => r.oversight === "L2") ? "L2" : "L1";
  if (level === "L3" && !(approval && approval.approved === true && approval.actorId === id && approval.environment === environment && approval.module === module && approval.resource === resource && approval.action === action && approval.scope === scope && approval.founderId && approval.founderId !== id)) {
    return { ...deny("FOUNDER_APPROVAL_REQUIRED"), requiresFounderApproval:true };
  }
  return { allowed:true, reason:"PERMITTED", oversight:level, requiresFounderApproval:false, notifyFounder:level === "L2" || level === "L3", auditRequired:true };
}
