/**
 * Flujo de aprobación: notificar, esperar confirmación (timeout), log.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { appendFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getConfigDir } from '@walt-wdk/core';

const AUDIT_FILE = 'guard-audit.jsonl';

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

function getAuditPath(): string {
  return path.join(getConfigDir(), AUDIT_FILE);
}

/**
 * Envía notificación (stub: escribe a consola; en producción conectar Telegram/Discord/Email).
 */
export async function notify(request: ApprovalRequest, method: 'telegram' | 'email' | 'discord'): Promise<void> {
  const msg = `[wdk-agent-guard] Approval required: ${request.amount} ${request.currency} to ${request.to ?? 'N/A'} (${request.fromWallet}). Reason: ${request.reason ?? 'over limit'}. Method: ${method}.`;
  if (process.env.NODE_ENV !== 'test') {
    console.warn(msg);
  }
  // TODO: integración real con Telegram/Discord/Email según method
}

/**
 * Parsea timeout tipo "5m", "60s" a ms.
 */
export function parseTimeout(timeoutStr: string): number {
  const m = timeoutStr.trim().match(/^(\d+)(s|m|h)$/i);
  if (!m) return 5 * 60 * 1000; // default 5 min
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  if (unit === 's') return n * 1000;
  if (unit === 'm') return n * 60 * 1000;
  if (unit === 'h') return n * 60 * 60 * 1000;
  return 5 * 60 * 1000;
}

/**
 * Espera aprobación: por ahora resuelve con approval=false tras timeout (MVP).
 * En producción se conectaría a un canal (webhook, polling) para recibir el sí/no.
 */
export async function waitForApproval(
  request: ApprovalRequest,
  timeoutMs: number,
  _notifyVia?: string
): Promise<ApprovalResult> {
  await notify(request, (_notifyVia as 'telegram' | 'email' | 'discord') ?? 'telegram');
  await new Promise((r) => setTimeout(r, Math.min(timeoutMs, 100))); // MVP: no bloqueamos mucho en test
  return { approved: false, reason: 'Approval timeout (MVP: no interactive approval).' };
}

/**
 * Registra decisión en el audit log.
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
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await appendFile(getAuditPath(), JSON.stringify(decision) + '\n', 'utf-8');
}
