/**
 * Console channel: log notification and reject after a short wait (no interactive approval).
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import type { ApprovalRequest } from '../approval-types.js';
import { logApproval } from '../approval-logging.js';

export async function runConsoleChannel(
  request: ApprovalRequest,
  requestId: string,
  timeoutMs: number,
  notifyVia: 'telegram' | 'email' | 'discord',
): Promise<{ approved: boolean; reason?: string }> {
  const msg = `[wdk-agent-guard] Approval required (${requestId}): ${request.amount} ${request.currency} to ${request.to ?? 'N/A'} (${request.fromWallet}). Reason: ${request.reason ?? 'over limit'}. Channel: console / ${notifyVia}.`;
  logApproval('warn', msg);
  const wait = Math.min(timeoutMs, 100);
  await new Promise((r) => setTimeout(r, wait));
  return {
    approved: false,
    reason: 'Approval denied or unavailable (console channel: no interactive handler).',
  };
}
