/**
 * Comando: registrar decisión en el audit log (y opcionalmente consultar).
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { readFile } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getConfigDir } from '@walt-wdk/core';
import { logDecision as appendDecision } from '../approval-flow.js';

const AUDIT_FILE = 'guard-audit.jsonl';

export interface DecisionEntry {
  timestamp: string;
  operation: string;
  amount: string;
  currency: string;
  to?: string;
  fromWallet: string;
  approved: boolean;
  reason?: string;
}

export async function logDecision(entry: DecisionEntry): Promise<void> {
  await appendDecision(entry);
}

export async function getAuditLog(limit = 100): Promise<DecisionEntry[]> {
  const p = path.join(getConfigDir(), AUDIT_FILE);
  if (!existsSync(p)) return [];
  const content = await readFile(p, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);
  const entries: DecisionEntry[] = [];
  for (const line of lines) {
    try {
      const entry = JSON.parse(line) as DecisionEntry;
      if (entry && typeof entry.timestamp === 'string' && typeof entry.approved === 'boolean') {
        entries.push(entry);
      }
    } catch {
      // Skip malformed or malicious lines; do not fail the whole read
    }
  }
  return entries.reverse().slice(0, limit);
}
