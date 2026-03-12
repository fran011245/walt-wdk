/**
 * Ledger local de transacciones enviadas/recibidas para history (MVP).
 * En producción podría reemplazarse por indexer/explorer API.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { appendFile, readFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { getConfigDir } from '@walt-wdk/core';

const LEDGER_FILE = 'pay-ledger.jsonl';

function getLedgerPath(): string {
  return path.join(getConfigDir(), LEDGER_FILE);
}

export interface LedgerEntry {
  txHash: string;
  type: 'send' | 'receive';
  amount: string;
  token: string;
  counterparty: string;
  timestamp: string;
  status: 'confirmed' | 'pending';
  network?: string;
  walletName?: string;
}

export async function appendToLedger(entry: LedgerEntry): Promise<void> {
  const dir = getConfigDir();
  if (!existsSync(dir)) await mkdir(dir, { recursive: true, mode: 0o700 });
  await appendFile(getLedgerPath(), JSON.stringify(entry) + '\n', {
    encoding: 'utf-8',
    mode: 0o600,
  });
}

export async function readLedger(walletName?: string, limit = 50): Promise<LedgerEntry[]> {
  const p = getLedgerPath();
  if (!existsSync(p)) return [];
  const content = await readFile(p, 'utf-8');
  const lines = content.trim().split('\n').filter(Boolean);
  let entries = lines
    .map((line) => {
      const parsed = JSON.parse(line) as Partial<LedgerEntry>;
      if (
        !parsed ||
        typeof parsed !== 'object' ||
        typeof parsed.txHash !== 'string' ||
        typeof parsed.amount !== 'string' ||
        typeof parsed.token !== 'string'
      ) {
        throw new Error('Corrupted ledger entry in pay-ledger.jsonl.');
      }
      return parsed as LedgerEntry;
    })
    .reverse();
  if (walletName) entries = entries.filter((e) => e.walletName === walletName);
  return entries.slice(0, limit);
}
