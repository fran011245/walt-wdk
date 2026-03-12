/**
 * Motor de guardas: blacklist, whitelist, límites por tx y diarios.
 * Copyright 2026 WaltWDK Contributors. Licensed under Apache-2.0.
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';
import { loadConfig, getConfigDir } from '@walt-wdk/core';

export type GuardOperation = 'send' | 'cron' | 'swap';

export interface GuardCheck {
  operation: GuardOperation;
  amount: string;
  currency: string;
  to?: string;
  fromWallet: string;
}

export interface GuardDecision {
  allowed: boolean;
  reason?: string;
  requiresApproval?: boolean;
  approvalMethod?: string;
  currentDailySpent?: string;
  remainingDaily?: string;
}

const LEDGER_FILE = 'guard-ledger.json';

interface DayLedger {
  date: string; // YYYY-MM-DD
  spent: Record<string, string>; // currency -> amount
}

function getLedgerPath(): string {
  return path.join(getConfigDir(), LEDGER_FILE);
}

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseAmount(s: string): number {
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}

async function loadLedger(): Promise<DayLedger> {
  const p = getLedgerPath();
  if (!existsSync(p)) return { date: today(), spent: {} };
  const raw = await readFile(p, 'utf-8');
  const data = JSON.parse(raw) as DayLedger;
  if (data.date !== today()) return { date: today(), spent: {} };
  return data;
}

async function saveLedger(ledger: DayLedger): Promise<void> {
  const dir = getConfigDir();
  if (!existsSync(dir)) await mkdir(dir, { recursive: true });
  await writeFile(getLedgerPath(), JSON.stringify(ledger, null, 2), 'utf-8');
}

/** Obtiene el total gastado hoy en la moneda dada. */
export async function getDailySpent(currency: string): Promise<string> {
  const ledger = await loadLedger();
  return ledger.spent[currency] ?? '0';
}

/** Registra un gasto en el ledger del día (llamar después de un envío aprobado). */
export async function recordSpend(amount: string, currency: string): Promise<void> {
  const ledger = await loadLedger();
  const current = parseAmount(ledger.spent[currency] ?? '0');
  const add = parseAmount(amount);
  ledger.spent[currency] = String(current + add);
  await saveLedger(ledger);
}

/**
 * Evalúa si la operación está permitida según config.
 * 1) Blacklist 2) Whitelist 3) Límite por tx 4) Límite diario 5) Require approval over X
 */
export async function check(config: GuardCheck): Promise<GuardDecision> {
  const cfg = await loadConfig();
  const guard = cfg.guard;

  if (guard?.blacklist?.length && config.to) {
    const toLower = config.to.trim().toLowerCase();
    if (guard.blacklist.some((a) => a.trim().toLowerCase() === toLower)) {
      return { allowed: false, reason: 'Destination address is blacklisted.' };
    }
  }

  if (guard?.whitelist?.length && config.to) {
    const toLower = config.to.trim().toLowerCase();
    const entry = guard.whitelist.find((w) => w.address.trim().toLowerCase() === toLower);
    if (entry?.skipApproval) {
      return { allowed: true };
    }
  }

  const amountNum = parseAmount(config.amount);
  if (guard?.perTransactionLimit?.amount) {
    const limit = parseAmount(guard.perTransactionLimit.amount);
    if (guard.perTransactionLimit.currency === config.currency && amountNum > limit) {
      return {
        allowed: false,
        reason: `Amount ${config.amount} ${config.currency} exceeds per-transaction limit ${guard.perTransactionLimit.amount}.`,
      };
    }
  }

  if (guard?.dailyLimit?.amount && guard.dailyLimit.currency === config.currency) {
    const spent = await getDailySpent(config.currency);
    const spentNum = parseAmount(spent);
    const limitNum = parseAmount(guard.dailyLimit.amount);
    const remaining = Math.max(0, limitNum - spentNum);
    if (amountNum > remaining) {
      return {
        allowed: false,
        reason: `Would exceed daily limit. Spent today: ${spent} ${config.currency}; limit: ${guard.dailyLimit.amount}; remaining: ${remaining}.`,
        currentDailySpent: spent,
        remainingDaily: String(remaining),
      };
    }
    if (amountNum > 0) {
      const afterSpend = spentNum + amountNum;
      if (afterSpend > limitNum) {
        return {
          allowed: false,
          reason: `Would exceed daily limit.`,
          currentDailySpent: spent,
          remainingDaily: String(remaining),
        };
      }
    }
  }

  if (guard?.requireApproval?.overAmount) {
    const over = parseAmount(guard.requireApproval.overAmount);
    if (amountNum >= over) {
      return {
        allowed: true,
        requiresApproval: true,
        approvalMethod: guard.requireApproval.notifyVia ?? 'telegram',
        reason: `Amount ${config.amount} >= ${guard.requireApproval.overAmount} requires approval.`,
      };
    }
  }

  if (guard?.dailyLimit?.amount && guard.dailyLimit.currency === config.currency) {
    const spent = await getDailySpent(config.currency);
    const limitNum = parseAmount(guard.dailyLimit.amount);
    const spentNum = parseAmount(spent);
    const remaining = Math.max(0, limitNum - spentNum);
    return { allowed: true, currentDailySpent: spent, remainingDaily: String(remaining) };
  }

  return { allowed: true };
}
