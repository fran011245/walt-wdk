/**
 * wdk-agent-guard skill — Límites y flujo de aprobación para operaciones autónomas.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

export const name = 'wdk-agent-guard';

export { check, getDailySpent, recordSpend } from './guard-engine.js';
export type { GuardCheck, GuardDecision, GuardOperation } from './guard-engine.js';

export { notify, waitForApproval, parseTimeout } from './approval-flow.js';
export type { ApprovalRequest, ApprovalResult } from './approval-flow.js';

export { checkLimit } from './commands/check-limit.js';
export type { CheckLimitInput } from './commands/check-limit.js';

export { requestApproval } from './commands/request-approval.js';
export type { RequestApprovalInput } from './commands/request-approval.js';

export { logDecision, getAuditLog } from './commands/log-decision.js';
export type { DecisionEntry } from './commands/log-decision.js';
