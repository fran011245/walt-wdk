/**
 * Approval flow: notify, wait for confirmation (file or console channel), audit log.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { randomUUID } from 'crypto';
import { appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getConfigDir, loadConfig } from '@walt-wdk/core';
import type { ApprovalRequest, ApprovalResult } from './approval-types.js';
export type { ApprovalRequest, ApprovalResult } from './approval-types.js';
import { runConsoleChannel } from './channels/console-channel.js';
import { runFileChannel } from './channels/file-channel.js';
import { assertValidGuardConfig } from './validate-guard-config.js';

const AUDIT_FILE = 'guard-audit.jsonl';

function getAuditPath(): string {
  return path.join(getConfigDir(), AUDIT_FILE);
}

/**
 * Parse timeout strings like "5m", "60s", "2h" to milliseconds.
 */
export function parseTimeout(timeoutStr: string): number {
  const m = timeoutStr.trim().match(/^(\d+)(s|m|h)$/i);
  if (!m) return 5 * 60 * 1000;
  const n = parseInt(m[1]!, 10);
  const unit = m[2]!.toLowerCase();
  if (unit === 's') return n * 1000;
  if (unit === 'm') return n * 60 * 1000;
  if (unit === 'h') return n * 60 * 60 * 1000;
  return 5 * 60 * 1000;
}

function coerceNotify(raw: string | undefined): 'telegram' | 'email' | 'discord' {
  if (raw === 'email' || raw === 'discord' || raw === 'telegram') return raw;
  return 'telegram';
}

/**
 * Wait for human approval using `guard.requireApproval.approvalChannel`
 * (`console` = fast reject after log; `file` = poll JSON under pending-approvals/).
 */
export async function waitForApproval(
  request: ApprovalRequest,
  timeoutMs: number,
  notifyViaRaw?: string,
): Promise<ApprovalResult> {
  const cfg = await loadConfig();
  if (cfg.guard != null) assertValidGuardConfig(cfg.guard);

  const notifyVia = coerceNotify(notifyViaRaw ?? cfg.guard?.requireApproval?.notifyVia);
  const channel = cfg.guard?.requireApproval?.approvalChannel ?? 'console';
  const requestId = randomUUID();

  let inner: { approved: boolean; reason?: string };
  if (channel === 'file') {
    inner = await runFileChannel(request, requestId, timeoutMs, notifyVia);
  } else {
    inner = await runConsoleChannel(request, requestId, timeoutMs, notifyVia);
  }

  return { ...inner, requestId };
}

/**
 * Append a decision to the audit log.
 */
export async function logDecision(decision: {
  timestamp: string;
  operation: string;
  amount: string;
  currency: string;
  to?: string;
  fromWallet: string;
  approved: boolean;
  reason?: string;
}): Promise<void> {
  const dir = getConfigDir();
  if (!existsSync(dir)) await mkdir(dir, { recursive: true, mode: 0o700 });
  await appendFile(getAuditPath(), JSON.stringify(decision) + '\n', {
    encoding: 'utf-8',
    mode: 0o600,
  });
}
