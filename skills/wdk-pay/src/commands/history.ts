/**
 * Comando: historial de transacciones (desde ledger local; extensible a indexer).
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { readLedger } from '../utils/history-ledger.js';

export interface HistoryTransaction {
  txHash: string;
  type: 'send' | 'receive';
  amount: string;
  token: string;
  counterparty: string;
  timestamp: string;
  status: 'confirmed' | 'pending';
}

export interface HistoryOutput {
  transactions: HistoryTransaction[];
}

export async function history(walletName?: string, limit = 50): Promise<HistoryOutput> {
  const entries = await readLedger(walletName, limit);
  const transactions: HistoryTransaction[] = entries.map((e) => ({
    txHash: e.txHash,
    type: e.type,
    amount: e.amount,
    token: e.token,
    counterparty: e.counterparty,
    timestamp: e.timestamp,
    status: e.status,
  }));
  return { transactions };
}
