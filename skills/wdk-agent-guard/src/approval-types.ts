/**
 * Shared approval request/result types for wdk-agent-guard.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

export interface ApprovalRequest {
  operation: string;
  amount: string;
  currency: string;
  to?: string;
  fromWallet: string;
  reason?: string;
}

export interface ApprovalResult {
  approved: boolean;
  requestId?: string;
  reason?: string;
}
