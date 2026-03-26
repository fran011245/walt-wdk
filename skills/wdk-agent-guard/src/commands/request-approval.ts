/**
 * Comando: solicitar aprobación humana (notificar + esperar timeout).
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { loadConfig } from '@walt-wdk/core';
import {
  waitForApproval,
  parseTimeout,
  logDecision,
  type ApprovalRequest,
  type ApprovalResult,
} from '../approval-flow.js';

export interface RequestApprovalInput {
  operation: string;
  amount: string;
  currency: string;
  to?: string;
  fromWallet: string;
  reason?: string;
}

export async function requestApproval(input: RequestApprovalInput): Promise<ApprovalResult> {
  const cfg = await loadConfig();
  const timeoutStr = cfg.guard?.requireApproval?.timeout ?? '5m';
  const timeoutMs = parseTimeout(timeoutStr);
  const notifyVia = cfg.guard?.requireApproval?.notifyVia;

  const req: ApprovalRequest = {
    operation: input.operation,
    amount: input.amount,
    currency: input.currency,
    to: input.to,
    fromWallet: input.fromWallet,
    reason: input.reason,
  };

  const result = await waitForApproval(req, timeoutMs, notifyVia);

  await logDecision({
    timestamp: new Date().toISOString(),
    operation: input.operation,
    amount: input.amount,
    currency: input.currency,
    to: input.to,
    fromWallet: input.fromWallet,
    approved: result.approved,
    reason: result.reason,
  });

  return result;
}
