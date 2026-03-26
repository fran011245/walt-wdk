/**
 * File channel: write a pending approval JSON file; poll until approved/rejected or timeout.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { mkdir, readFile, writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getConfigDir } from '@walt-wdk/core';
import type { ApprovalRequest } from '../approval-types.js';
import { logApproval } from '../approval-logging.js';

const PENDING_DIR = 'pending-approvals';

function getPendingDir(): string {
  return path.join(getConfigDir(), PENDING_DIR);
}

export interface PendingFilePayload {
  requestId: string;
  status: 'pending' | 'approved' | 'rejected';
  request: ApprovalRequest;
  notifyVia?: string;
  createdAt: string;
  /** ISO deadline; approve/reject by setting status before this time. */
  deadlineIso: string;
}

function pendingPath(requestId: string): string {
  return path.join(getPendingDir(), `${requestId}.json`);
}

const POLL_MS = 400;

export async function runFileChannel(
  request: ApprovalRequest,
  requestId: string,
  timeoutMs: number,
  notifyVia: 'telegram' | 'email' | 'discord',
): Promise<{ approved: boolean; reason?: string }> {
  const dir = getPendingDir();
  if (!existsSync(dir)) await mkdir(dir, { recursive: true, mode: 0o700 });

  const deadline = Date.now() + timeoutMs;
  const payload: PendingFilePayload = {
    requestId,
    status: 'pending',
    request,
    notifyVia,
    createdAt: new Date().toISOString(),
    deadlineIso: new Date(deadline).toISOString(),
  };
  const file = pendingPath(requestId);
  await writeFile(file, JSON.stringify(payload, null, 2), { encoding: 'utf-8', mode: 0o600 });

  logApproval(
    'warn',
    `[wdk-agent-guard] Approval file (${requestId}): ${file}\n` +
      `Set "status" to "approved" or "rejected" in that JSON, then save. Deadline: ${payload.deadlineIso}`,
  );

  while (Date.now() < deadline) {
    await new Promise((r) => setTimeout(r, POLL_MS));
    const raw = await readFile(file, 'utf-8');
    let data: PendingFilePayload;
    try {
      data = JSON.parse(raw) as PendingFilePayload;
    } catch {
      continue;
    }
    if (data.status === 'approved') return { approved: true };
    if (data.status === 'rejected') {
      return { approved: false, reason: 'Approval rejected via pending file.' };
    }
  }

  return { approved: false, reason: 'Approval timeout (file channel).' };
}
